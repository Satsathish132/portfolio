import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMotionStyle } from '@/hooks/useMotionStyle'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
  y?: number
}

/**
 * Scroll-triggered reveal using IntersectionObserver (one observer per
 * instance, cheap for the number of sections here). Fires once, then
 * disconnects. Respects prefers-reduced-motion by rendering content visible
 * immediately with no transform.
 *
 * The reveal *style* follows the active motion style, so every section that
 * already uses `Reveal` upgrades automatically when the visitor switches:
 *
 * - `cinematic`    — fade and rise. Sections cross-dissolve during a camera
 *                    transition, so a soft entrance is all that is wanted.
 * - `scroll-story` — a clip-path wipe with a slight counter-scale, matching
 *                    the Scout-style reveals used elsewhere in that mode.
 *                    Real scrolling gives each element its own moment, which
 *                    earns the heavier treatment.
 */
export function Reveal({ children, className = '', delay = 0, as = 'div', y = 28 }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  const [motionStyle] = useMotionStyle()
  const Tag = as as ElementType
  const story = motionStyle === 'scroll-story' && !reducedMotion

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  const easing = 'cubic-bezier(0.16,1,0.3,1)'

  const style = story
    ? {
        opacity: visible ? 1 : 0,
        clipPath: visible ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
        transform: visible ? 'translateY(0px)' : `translateY(${y * 0.6}px)`,
        transition: `clip-path 1.1s ${easing} ${delay}ms, transform 1.1s ${easing} ${delay}ms, opacity 0.6s ease ${delay}ms`,
        willChange: 'clip-path, transform, opacity',
      }
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : `translateY(${y}px)`,
        transition: `opacity 0.9s ${easing} ${delay}ms, transform 0.9s ${easing} ${delay}ms`,
        willChange: 'opacity, transform',
      }

  return createElement(Tag, { ref, className, style }, children)
}
