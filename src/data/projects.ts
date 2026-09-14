export interface Project {
  id: string
  code: string // e.g. "PROJECT 01"
  name: string
  tagline: string
  description: string
  problem?: string
  features: string[]
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  featured?: boolean
}

/**
 * Real projects only. To add a future project, append an object here —
 * unset `liveUrl`/`githubUrl` render as hidden rather than broken links.
 */
export const projects: Project[] = [
  {
    id: 'pathlytics',
    code: 'PROJECT 01',
    name: 'Pathlytics — Career',
    tagline: 'AI-powered career recommendation platform',
    description:
      'An AI-powered career recommendation platform designed to help Computer Science students discover suitable career paths based on their skills, interests, personality and work style.',
    problem:
      'CS students often struggle to translate their skills and interests into a concrete, achievable career direction. Pathlytics turns that uncertainty into a structured, data-backed roadmap.',
    features: [
      'AI career recommendations',
      'Skill-gap analysis',
      'Career roadmaps',
      'Learning resources',
      'Career-focused chatbot',
      'Job information',
      'Career insights',
      'Progress tracking',
      'Interactive quizzes',
    ],
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Python', 'FastAPI', 'SQL', 'Groq API', 'Azure'],
    liveUrl: 'https://pathalytics.vercel.app',
    featured: true,
  },
  {
    id: 'project-02',
    code: 'PROJECT 02',
    name: '[Project Name]',
    tagline: '[Short one-line tagline]',
    description: '[Add a short description of this project once details are available.]',
    features: [],
    technologies: [],
    featured: false,
  },
  {
    id: 'project-03',
    code: 'PROJECT 03',
    name: '[Project Name]',
    tagline: '[Short one-line tagline]',
    description: '[Add a short description of this project once details are available.]',
    features: [],
    technologies: [],
    featured: false,
  },
]
