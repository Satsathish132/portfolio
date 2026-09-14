export interface Skill {
  name: string
  description: string
}

export interface SkillCategory {
  id: string
  title: string
  skills: Skill[]
}

/**
 * Familiarity is communicated through grouping, not fake percentage levels.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: 'programming',
    title: 'Programming',
    skills: [
      { name: 'JavaScript', description: 'Core language for building interactive, dynamic applications.' },
      { name: 'TypeScript', description: 'Typed superset used for safer, more maintainable codebases.' },
      { name: 'Python', description: 'General-purpose language used for backend logic, scripting and AI/ML.' },
      { name: 'Java', description: 'Object-oriented language used for structured application development.' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      { name: 'React', description: 'Component-based library for building modern user interfaces.' },
      { name: 'React Native', description: 'Cross-platform framework for building mobile applications.' },
      { name: 'HTML', description: 'Semantic markup foundation for accessible, structured web pages.' },
      { name: 'CSS', description: 'Styling and layout, including modern responsive techniques.' },
      { name: 'Tailwind CSS', description: 'Utility-first framework for building consistent design systems fast.' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    skills: [
      { name: 'Node.js', description: 'JavaScript runtime for building scalable server-side applications.' },
      { name: 'FastAPI', description: 'Modern Python framework for building high-performance APIs.' },
      { name: 'REST APIs', description: 'Designing and consuming clean, predictable API contracts.' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    skills: [
      { name: 'PostgreSQL', description: 'Relational database used for structured, reliable data storage.' },
      { name: 'MySQL', description: 'Widely-used relational database for transactional applications.' },
      { name: 'SQL', description: 'Query language for relational data modeling and analysis.' },
    ],
  },
  {
    id: 'ai-data',
    title: 'AI / Data',
    skills: [
      { name: 'Machine Learning', description: 'Applying ML concepts to build predictive, data-driven features.' },
      { name: 'AI Integration', description: 'Integrating LLM APIs into practical, user-facing applications.' },
      { name: 'Data Analysis', description: 'Extracting insight from structured and unstructured data.' },
    ],
  },
  {
    id: 'cloud-tools',
    title: 'Cloud / Tools',
    skills: [
      { name: 'Azure', description: 'Cloud platform used for deploying and hosting application services.' },
      { name: 'Git', description: 'Version control for tracking and managing code changes.' },
      { name: 'GitHub', description: 'Collaboration and CI workflows around Git repositories.' },
      { name: 'Docker', description: 'Containerization for consistent, portable application environments.' },
      { name: 'Jenkins', description: 'Automation server for building CI/CD pipelines.' },
    ],
  },
]
