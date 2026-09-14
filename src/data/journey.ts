export interface JourneyPoint {
  id: string
  period?: string // omit rather than invent a date
  title: string
  organization?: string
  description: string
}

/**
 * Only verified milestones. Do not add dates or companies unless confirmed —
 * an entry without a period renders as an undated milestone.
 */
export const journeyPoints: JourneyPoint[] = [
  {
    id: 'cs-foundation',
    title: 'Started Computer Science studies',
    description:
      'Began formal study of Computer Science — building a foundation across programming, data structures, algorithms and systems thinking.',
  },
  {
    id: 'first-projects',
    title: 'Built first full-stack projects',
    description:
      'Started applying frontend and backend fundamentals together, learning how APIs, databases and UIs connect into working products.',
  },
  {
    id: 'pathlytics',
    title: 'Developed Pathlytics',
    description:
      'Designed and built an AI-powered career recommendation platform end-to-end — from data modeling to AI integration and deployment.',
  },
  {
    id: 'softknack',
    period: 'August 2026 — Present',
    title: 'Software Developer',
    organization: 'Softknack',
    description:
      'Working as a Software Developer, contributing to real-world software systems and continuing to grow across the full stack.',
  },
  {
    id: 'ai-focus',
    title: 'Exploring AI-powered applications',
    description:
      'Continuing to explore how AI and machine learning can be integrated into practical, everyday software products.',
  },
]
