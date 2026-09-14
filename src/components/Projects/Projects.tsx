import { projects } from '@/data/projects'
import { Reveal } from '@/components/UI/Reveal'
import { FeaturedProjectCard } from './FeaturedProjectCard'
import { ProjectCard } from './ProjectCard'

export function Projects() {
  const featured = projects.find((p) => p.featured)
  const others = projects.filter((p) => !p.featured)

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative py-32 md:py-44">
      <div className="container-portfolio">
        <Reveal>
          <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            04 — Projects
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="projects-heading" className="mt-6 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
            Selected work.
          </h2>
        </Reveal>

        {featured && (
          <Reveal delay={160} className="mt-16 block">
            <FeaturedProjectCard project={featured} />
          </Reveal>
        )}

        {others.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {others.map((project, i) => (
              <Reveal key={project.id} delay={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
