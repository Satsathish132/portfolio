import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
  y?: number
}

/**
 * Scroll-triggered fade/rise reveal using IntersectionObserver (one observer
 * per instance, cheap for the number of sections here). Fires once, then
 * disconnects. Respects prefers-reduced-motion by rendering content visible
 * immediately with no transform.
 */
export function Reveal({ children, className = '', delay = 0, as = 'div', y = 28 }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  const Tag = as as ElementType

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

  return createElement(
    Tag,
    {
      ref,
      className,
      style: {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : `translateY(${y}px)`,
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
      },
    },
    children,
  )
}
