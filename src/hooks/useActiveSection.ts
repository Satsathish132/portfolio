import { useEffect, useState } from 'react'

/** Give up waiting for sections to mount after roughly five seconds. */
const MAX_WAIT_FRAMES = 300

/**
 * Tracks which section id is currently most visible in the viewport,
 * using IntersectionObserver rather than scroll-position math.
 *
 * Observation is deferred until the sections actually exist. The layout that
 * owns them can be lazy-loaded (scroll-story mode is a `React.lazy` chunk),
 * in which case a single `getElementById` sweep at mount finds nothing — and
 * without retrying, the nav highlight would stay pinned to the first section
 * forever.
 */
export function useActiveSection(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0] ?? '')
  const sectionKey = sectionIds.join(',')

  useEffect(() => {
    const ids = sectionKey ? sectionKey.split(',') : []
    if (ids.length === 0) return

    let observer: IntersectionObserver | null = null
    let rafId: number | null = null
    let framesWaited = 0

    const ratios = new Map<string, number>()

    const observe = (elements: HTMLElement[]) => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
          })
          let best = ''
          let bestRatio = 0
          ratios.forEach((ratio, id) => {
            if (ratio > bestRatio) {
              bestRatio = ratio
              best = id
            }
          })
          if (bestRatio > 0) setActive(best)
        },
        { threshold: [0.15, 0.3, 0.5, 0.7, 0.9], rootMargin: '-15% 0px -15% 0px' },
      )
      elements.forEach((el) => observer?.observe(el))
    }

    const attempt = () => {
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)

      // Wait for the full set, so we don't lock onto a partial layout — but
      // settle for whatever exists once the budget runs out, rather than
      // leaving the nav permanently unresponsive.
      if (elements.length < ids.length && framesWaited < MAX_WAIT_FRAMES) {
        framesWaited += 1
        rafId = requestAnimationFrame(attempt)
        return
      }
      if (elements.length > 0) observe(elements)
    }

    attempt()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      observer?.disconnect()
    }
  }, [sectionKey])

  return active
}
