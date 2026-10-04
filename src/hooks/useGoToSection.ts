import { useContext } from 'react'
import { SectionScrollerContext } from './SectionScrollerContext'
import { sectionIndex } from '@/data/sections'
import { isSmoothScrollActive, smoothScrollToElement } from './useSmoothScroll'

/** Approximate height of the fixed navbar, used as a scroll offset. */
const NAVBAR_OFFSET_PX = 72

/**
 * Returns a function that navigates to a section by id. It resolves through
 * whichever system currently owns scrolling:
 *
 *   - cinematic scroller — sections are `position: fixed` there, so a native
 *     `scrollIntoView` would do nothing;
 *   - lerped smooth scroll (scroll-story mode) — a native smooth scroll would
 *     fight the lerp, with both animating the same scroll position at once;
 *   - otherwise, a plain native smooth scroll.
 *
 * Any component with an in-page link/button should use this rather than
 * calling `scrollIntoView` directly.
 */
export function useGoToSection() {
  const scroller = useContext(SectionScrollerContext)

  return (id: string) => {
    if (scroller) {
      const index = sectionIndex(id)
      if (index >= 0) scroller.goTo(index)
      return
    }
    const el = document.getElementById(id)
    if (!el) return
    if (isSmoothScrollActive()) {
      // Clear the fixed navbar so a section heading isn't parked underneath it.
      smoothScrollToElement(el, NAVBAR_OFFSET_PX)
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
