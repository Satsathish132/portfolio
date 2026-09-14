export interface SectionMeta {
  id: string
  /** World depth for the 3D camera dolly (negative = further from camera). */
  z: number
  /** Nav label; omit to include the section in the scroller without a nav link. */
  navLabel?: string
}

/**
 * Single source of truth for section order, id and (optional) nav label —
 * both the cinematic scroller (App.tsx) and the navbar/section-dots read
 * from this so their indices can never drift apart. "build" (What I Build)
 * intentionally has no navLabel: it's reachable by scrolling but not linked
 * directly from the primary nav, keeping the nav to 6 items as designed.
 */
export const SECTIONS: SectionMeta[] = [
  { id: 'home', z: 0, navLabel: 'Home' },
  { id: 'about', z: -20, navLabel: 'About' },
  { id: 'build', z: -35 },
  { id: 'skills', z: -50, navLabel: 'Skills' },
  { id: 'projects', z: -70, navLabel: 'Projects' },
  { id: 'journey', z: -85, navLabel: 'Experience' },
  { id: 'contact', z: -100, navLabel: 'Contact' },
]

export const NAV_SECTIONS = SECTIONS.filter((s) => s.navLabel)

export function sectionIndex(id: string): number {
  return SECTIONS.findIndex((s) => s.id === id)
}
