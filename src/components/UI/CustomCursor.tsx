import { useEffect, useRef, useState } from 'react'
import { subscribePointer } from '@/hooks/useMousePosition'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useDeviceTier } from '@/hooks/useDeviceTier'

type CursorMode = 'default' | 'button' | 'project' | 'link'

/**
 * Minimal custom cursor with three states (default / expanded button / "VIEW"
 * project). Position is driven imperatively via transform on a ref — never
 * through React state — so it can track the pointer every frame without
 * triggering renders. Disabled entirely on touch/coarse-pointer devices.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<CursorMode>('default')
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  const { isCoarsePointer, isTouch } = useDeviceTier()

  const smoothed = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const raf = useRef<number>(0)

  const disabled = isCoarsePointer || isTouch

  useEffect(() => {
    if (disabled) return
    document.documentElement.classList.add('custom-cursor-active')
    return () => document.documentElement.classList.remove('custom-cursor-active')
  }, [disabled])

  useEffect(() => {
    if (disabled) return

    const unsubscribe = subscribePointer((pointer) => {
      target.current.x = pointer.x
      target.current.y = pointer.y
      if (!visible) setVisible(true)
    })

    const onOver = (event: Event) => {
      const el = (event.target as HTMLElement)?.closest('[data-cursor]') as HTMLElement | null
      setMode((el?.dataset.cursor as CursorMode) ?? 'default')
    }
    const onOut = (event: Event) => {
      const related = (event as MouseEvent).relatedTarget as HTMLElement | null
      if (!related?.closest('[data-cursor]')) setMode('default')
    }
    const onLeave = () => setVisible(false)

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('mouseleave', onLeave)

    const tick = () => {
      const ease = reducedMotion ? 1 : 0.18
      smoothed.current.x += (target.current.x - smoothed.current.x) * ease
      smoothed.current.y += (target.current.y - smoothed.current.y) * ease

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${smoothed.current.x}px, ${smoothed.current.y}px, 0) translate(-50%, -50%)`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      unsubscribe()
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [disabled, reducedMotion, visible])

  if (disabled) return null

  const ringSize = mode === 'project' ? 88 : mode === 'button' ? 56 : mode === 'link' ? 40 : 28

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]" style={{ opacity: visible ? 1 : 0 }}>
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-white transition-opacity duration-200"
        style={{ opacity: mode === 'project' ? 0 : 1 }}
      />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-white/70 transition-[width,height,background-color] duration-300 ease-out"
        style={{
          width: ringSize,
          height: ringSize,
          backgroundColor: mode === 'project' ? 'rgba(255,255,255,0.08)' : 'transparent',
          backdropFilter: mode === 'project' ? 'blur(2px)' : undefined,
        }}
      >
        {mode === 'project' && (
          <span className="font-display text-[10px] font-medium tracking-[0.2em] text-white">VIEW</span>
        )}
      </div>
    </div>
  )
}
