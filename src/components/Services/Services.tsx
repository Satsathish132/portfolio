import { services } from '@/data/services'
import { Reveal } from '@/components/UI/Reveal'
import { ServiceCard } from './ServiceCard'

export function Services() {
  return (
    <section id="build" aria-labelledby="build-heading" className="relative py-32 md:py-44">
      <div className="container-portfolio">
        <Reveal>
          <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            02 — What I Build
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="build-heading" className="mt-6 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
            What I Build
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.index} delay={i * 70}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
