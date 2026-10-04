import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MaskedTextProps {
  /** Plain text — split on whitespace, so it must not contain markup. */
  text: string
  className?: string
  as?: ElementType
  /** Per-word stagger in ms. */
  stagger?: number
  delay?: number
  id?: string
  style?: CSSProperties
}

/**
 * Scout-style masked reveal: each word rises out of its own overflow mask
 * instead of fading in. Words are staggered, so a headline unrolls left to
 * right and wrapped lines read as separate rising lines.
 *
 * The mask spans are given symmetric padding/negative-margin so descenders
 * (g, y, p) are not clipped by `overflow: hidden` — without that the trick
 * shaves the bottom off the typeface.
 *
 * Accessibility: the split words are hidden from assistive tech and the
 * original string is exposed once via an `sr-only` copy, so a screen reader
 * announces a sentence rather than a list of disconnected words.
 */
export function MaskedText({
  text,
  className = '',
  as = 'div',
  stagger = 45,
  delay = 0,
  id,
  style,
}: MaskedTextProps) {
  const ref = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)
  const reducedMotion = useReducedMotion()
  const Tag = as as ElementType
  const words = text.split(/\s+/).filter(Boolean)

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
      { threshold: 0.1, rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return createElement(
    Tag,
    { ref, className, id, style },
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-flex overflow-hidden align-bottom"
            // Room for descenders inside the mask, cancelled by the negative
            // margin so the element's layout box is unchanged.
            style={{ paddingBottom: '0.18em', marginBottom: '-0.18em' }}
          >
            <span
              className="inline-block"
              style={{
                transform: revealed ? 'translateY(0)' : 'translateY(110%)',
                opacity: revealed ? 1 : 0,
                transition: reducedMotion
                  ? 'none'
                  : `transform 1s cubic-bezier(0.16,1,0.3,1) ${delay + i * stagger}ms, opacity 0.7s ease ${delay + i * stagger}ms`,
                willChange: 'transform',
              }}
            >
              {word}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </>,
  )
}
