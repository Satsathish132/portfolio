import { useEffect, useRef, type ReactNode } from 'react'
import { useSectionScrollerContext } from '@/hooks/SectionScrollerContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SectionLayerProps {
  id: string
  index: number
  children: ReactNode
  /** Reduced-motion / non-hijacked fallback: render as a normal document section. */
  fallback?: boolean
}

/**
 * One "slide" in the cinematic scroller. Computes its own opacity/scale/
 * translate from shared scroller progress every frame via rAF (not React
 * state) so seven of these updating simultaneously never triggers seven
 * re-renders per tick — only the transform/opacity style is touched directly.
 *
 * Distance-from-active drives the look:
 *   distance 0   -> fully visible, resting scale/position
 *   distance ±1  -> the section currently being transitioned to/from
 *   |distance|>1 -> fully hidden, not rendered as interactive
 */
export function SectionLayer({ id, index, children, fallback = false }: SectionLayerProps) {
  const scroller = useSectionScrollerContext()
  const reducedMotion = useReducedMotion()
  const outerRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const scrollableRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const registerSectionEl = scroller.registerSectionEl
  const stateRef = scroller.stateRef

  useEffect(() => {
    if (fallback || reducedMotion) return
    const el = scrollableRef.current
    if (el) registerSectionEl(index, el)
    return () => registerSectionEl(index, null)
  }, [fallback, reducedMotion, index, registerSectionEl])

  useEffect(() => {
    if (fallback || reducedMotion) return

    const render = () => {
      const s = stateRef.current
      // signed distance: negative = section is "ahead" (about to arrive from below),
      // positive = section is "behind" (receding away from the camera)
      const distance = index - s.index - (s.targetIndex - s.index) * s.progress

      const outer = outerRef.current
      const inner = innerRef.current
      if (outer && inner) {
        const absDist = Math.abs(distance)
        const visible = absDist < 1.4

        if (!visible) {
          outer.style.opacity = '0'
          outer.style.pointerEvents = 'none'
          outer.style.visibility = 'hidden'
        } else {
          outer.style.visibility = 'visible'
          // ease-out curve so most of the fade happens near the edges, section
          // reads as "fully present" for the middle portion of its own turn
          const eased = 1 - Math.pow(Math.min(1, absDist), 2)
          const opacity = Math.max(0, eased)
          outer.style.opacity = opacity.toFixed(3)
          outer.style.pointerEvents = absDist < 0.15 ? 'auto' : 'none'

          // approaching sections (distance < 0, i.e. below/ahead) rise & scale
          // up into place; receding sections (distance > 0) sink & scale down
          // and drift back — the "moving deeper into the scene" read.
          const scale = 1 - Math.min(0.22, absDist * 0.16)
          const translateY = distance * 6 // vh, subtle vertical drift
          const translateZ = -absDist * 140 // px, perspective depth cue
          inner.style.transform = `translateY(${translateY}vh) translateZ(${translateZ}px) scale(${scale})`
        }
      }
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [fallback, reducedMotion, index, stateRef])

  if (fallback || reducedMotion) {
    return (
      <section id={id} className="relative">
        {children}
      </section>
    )
  }

  return (
    <section
      ref={outerRef}
      id={id}
      aria-hidden={undefined}
      className="fixed inset-0 will-change-[opacity]"
      style={{ transition: 'visibility 0s' }}
    >
      <div
        ref={innerRef}
        className="h-full w-full will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div ref={scrollableRef} className="h-full w-full overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </section>
  )
}
