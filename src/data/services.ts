export interface Service {
  index: string
  title: string
  description: string
}

export const services: Service[] = [
  {
    index: '01',
    title: 'Web Applications',
    description: 'Building responsive, performant web applications with modern frontend architectures.',
  },
  {
    index: '02',
    title: 'Mobile Applications',
    description: 'Cross-platform mobile experiences built with React Native.',
  },
  {
    index: '03',
    title: 'AI-Powered Applications',
    description: 'Integrating LLMs and machine learning models into practical, real-world tools.',
  },
  {
    index: '04',
    title: 'Backend Systems',
    description: 'Designing reliable server-side systems and data models that scale.',
  },
  {
    index: '05',
    title: 'APIs & Integrations',
    description: 'Building and consuming REST APIs that connect services cleanly.',
  },
  {
    index: '06',
    title: 'Developer Tools',
    description: 'Creating internal tools and automation that streamline development workflows.',
  },
]
