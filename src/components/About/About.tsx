import { Reveal } from '@/components/UI/Reveal'

const FOCUS_AREAS = [
  'Software Development',
  'AI & Machine Learning',
  'Modern Web Development',
  'Backend Development',
  'Cloud Technologies',
]

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative py-32 md:py-44">
      <div className="container-portfolio">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Reveal>
              <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
                01 — About
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 id="about-heading" className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
                A developer who likes connecting the dots.
              </h2>
            </Reveal>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <Reveal delay={120}>
              <p className="text-balance font-display text-2xl font-normal leading-relaxed text-white/80 md:text-3xl">
                I enjoy turning ideas into functional software.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
                My interests span frontend development, backend systems, AI-powered applications
                and cloud technologies. I focus on understanding how different parts of a system
                connect and building solutions that are useful, scalable and easy to maintain.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <ul className="mt-12 flex flex-wrap gap-3">
                {FOCUS_AREAS.map((area) => (
                  <li
                    key={area}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:border-white/40 hover:text-white"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
