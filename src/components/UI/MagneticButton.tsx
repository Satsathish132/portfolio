import { createElement, useRef, type ElementType, type ReactNode, type MouseEvent } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MagneticButtonProps {
  as?: ElementType
  children: ReactNode
  strength?: number
  cursorMode?: 'button' | 'link' | 'project'
  className?: string
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

/**
 * Wraps any element with a subtle magnetic-pull hover effect: the element
 * translates a fraction of the distance toward the pointer while hovered,
 * and eases back to rest on leave. Pure CSS transform, no layout thrash.
 */
export function MagneticButton({
  as = 'button',
  children,
  strength = 0.35,
  cursorMode = 'button',
  className = '',
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const Component = as as ElementType

  const handleMove = (event: MouseEvent) => {
    if (reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = event.clientX - (rect.left + rect.width / 2)
    const relY = event.clientY - (rect.top + rect.height / 2)
    ref.current.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`
  }

  const handleLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0px, 0px)'
  }

  return createElement(
    Component,
    {
      ref,
      'data-cursor': cursorMode,
      onMouseMove: handleMove,
      onMouseLeave: handleLeave,
      className: `transition-transform duration-300 ease-out will-change-transform ${className}`,
      ...rest,
    },
    children,
  )
}
