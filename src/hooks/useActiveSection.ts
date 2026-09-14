import { useEffect, useState } from 'react'

/**
 * Tracks which section id is currently most visible in the viewport,
 * using IntersectionObserver rather than scroll-position math.
 */
export function useActiveSection(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0] ?? '')
  const sectionKey = sectionIds.join(',')

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
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

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sectionKey])

  return active
}
