import { useEffect, useRef, useState } from 'react'
import type { JourneyPoint } from '@/data/journey'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface TimelineItemProps {
  point: JourneyPoint
  index: number
  isLast: boolean
}

export function TimelineItem({ point, index, isLast }: TimelineItemProps) {
  const ref = useRef<HTMLLIElement>(null)
  const [active, setActive] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setActive(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4, rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <li ref={ref} className="relative flex gap-6 pb-16 last:pb-0 md:gap-10">
      {/* connector line + node */}
      <div className="relative flex w-6 flex-col items-center">
        <span
          className={`relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-all duration-700 ${
            active ? 'border-white bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.08),0_0_24px_rgba(255,255,255,0.35)]' : 'border-white/25 bg-black'
          }`}
          aria-hidden="true"
        />
        {!isLast && (
          <span className="relative mt-1 w-px flex-1 overflow-hidden bg-white/10">
            <span
              className="block w-full bg-gradient-to-b from-white/70 to-white/10 transition-all duration-[1200ms] ease-out"
              style={{ height: active ? '100%' : '0%' }}
            />
          </span>
        )}
      </div>

      <div
        className="max-w-xl transition-all duration-700"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? 'translateX(0px)' : 'translateX(-16px)',
          transitionDelay: `${index * 40}ms`,
        }}
      >
        {point.period && (
          <span className="font-display text-xs font-medium uppercase tracking-[0.2em] text-white/40">
            {point.period}
          </span>
        )}
        <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-white md:text-2xl">
          {point.title}
          {point.organization && <span className="text-white/40"> · {point.organization}</span>}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/50 md:text-base">{point.description}</p>
      </div>
    </li>
  )
}
