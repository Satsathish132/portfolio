import { journeyPoints } from '@/data/journey'
import { Reveal } from '@/components/UI/Reveal'
import { TimelineItem } from './TimelineItem'

export function Experience() {
  return (
    <section id="journey" aria-labelledby="journey-heading" className="relative py-32 md:py-44">
      <div className="container-portfolio">
        <Reveal>
          <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            05 — Journey
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="journey-heading" className="mt-6 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
            How I got here.
          </h2>
        </Reveal>

        <ol className="mt-20 max-w-2xl">
          {journeyPoints.map((point, i) => (
            <TimelineItem key={point.id} point={point} index={i} isLast={i === journeyPoints.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  )
}
