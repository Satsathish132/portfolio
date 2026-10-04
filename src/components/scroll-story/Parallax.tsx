import { useEffect, useRef, type ReactNode } from 'react'
import { addScrollDriver } from './scrollDriver'

interface ParallaxProps {
  children: ReactNode
  /**
   * Drift rate. Positive values trail the scroll (the layer reads as further
   * away); negative values lead it (nearer). Roughly the fraction of the
   * element's travel distance it is displaced by — 0.2 is a subtle
   * background, 0.5 a pronounced one.
   */
  speed?: number
  className?: string
}

/**
 * Viewport-relative parallax — independent of `ScrollScene`, so it works
 * anywhere in the document. Displacement is zero when the element's centre
 * crosses the viewport's centre, so a parallax layer always lands in its
 * authored position at the moment it is most visible.
 */
export function Parallax({ children, speed = 0.2, className = '' }: ParallaxProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef(speed)
  speedRef.current = speed

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    return addScrollDriver(() => {
      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight
      const elementCentre = rect.top + rect.height / 2
      // -1 when the element's centre sits a full viewport below centre,
      // +1 when a full viewport above it.
      const fromCentre = (viewportH / 2 - elementCentre) / viewportH
      el.style.transform = `translate3d(0, ${(fromCentre * speedRef.current * 100).toFixed(2)}px, 0)`
    })
  }, [])

  return (
    <div ref={elRef} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
