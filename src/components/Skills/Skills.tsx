import { lazy, Suspense } from 'react'
import { skillCategories } from '@/data/skills'
import { Reveal } from '@/components/UI/Reveal'
import { SkillPill } from './SkillPill'

// Scoped to this section only — lazy-loaded so the R3F/Three bundle for this
// small decorative accent never delays the section's own first paint.
const SkillsScene = lazy(() => import('./SkillsScene').then((m) => ({ default: m.SkillsScene })))

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="relative overflow-hidden py-32 md:py-44">
      <Suspense fallback={null}>
        <SkillsScene />
      </Suspense>
      <div className="container-portfolio relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
                03 — Skills
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 id="skills-heading" className="mt-6 max-w-xl text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
                Tools I reach for.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <p className="max-w-sm text-sm leading-relaxed text-white/45">
              Grouped by how I use them, not ranked by score. Hover any technology for a short
              note on where it fits.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-3">
          {skillCategories.map((category, ci) => (
            <Reveal key={category.id} delay={ci * 60}>
              <h3 className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                {category.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {category.skills.map((skill) => (
                  <SkillPill key={skill.name} skill={skill} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
