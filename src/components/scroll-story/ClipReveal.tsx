import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type ClipDirection = 'up' | 'down' | 'left' | 'right'

interface ClipRevealProps {
  children: ReactNode
  className?: string
  /** Edge the content is uncovered from. */
  direction?: ClipDirection
  delay?: number
  /** Inner counter-scale, for the "settling into frame" push. 1 disables it. */
  scaleFrom?: number
}

const HIDDEN_INSET: Record<ClipDirection, string> = {
  up: 'inset(100% 0 0 0)',
  down: 'inset(0 0 100% 0)',
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
}

/**
 * Uncovers its content with an animated `clip-path` wipe while the content
 * itself eases down from a slight over-scale — the Scout "image settles into
 * frame" move, and a notably richer entrance than a plain fade.
 *
 * The wipe and the counter-scale live on two different elements: animating
 * clip-path and transform on one element would make the clip rectangle
 * scale along with the content and lose the wipe entirely.
 *
 * And the observed element is a third, unclipped one: IntersectionObserver
 * applies the target's own clip-path, so an element observed while clipped
 * to nothing reports 0% visible and would never reveal.
 */
export function ClipReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  scaleFrom = 1.12,
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div ref={ref} className={className}>
      <div
        className="h-full"
        style={{
          clipPath: revealed ? 'inset(0 0 0 0)' : HIDDEN_INSET[direction],
          transition: reducedMotion
            ? 'none'
            : `clip-path 1.15s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          willChange: 'clip-path',
        }}
      >
        <div
          style={{
            transform: revealed ? 'scale(1)' : `scale(${scaleFrom})`,
            transition: reducedMotion
              ? 'none'
              : `transform 1.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
            willChange: 'transform',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
