import { useContext } from 'react'
import { SectionScrollerContext } from './SectionScrollerContext'
import { sectionIndex } from '@/data/sections'

/**
 * Returns a function that navigates to a section by id — via the cinematic
 * scroller when it's active (sections are `position: fixed` there, so a
 * native `scrollIntoView` would do nothing), or a normal smooth scroll
 * otherwise. Any component with an in-page link/button should use this
 * rather than calling `scrollIntoView` directly.
 */
export function useGoToSection() {
  const scroller = useContext(SectionScrollerContext)

  return (id: string) => {
    if (scroller) {
      const index = sectionIndex(id)
      if (index >= 0) scroller.goTo(index)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
