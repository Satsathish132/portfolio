import { useRef, useState, type PointerEvent } from 'react'
import type { Project } from '@/data/projects'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MagneticButton } from '@/components/UI/MagneticButton'

interface FeaturedProjectCardProps {
  project: Project
}

export function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`)
    cardRef.current.style.setProperty('--ry', `${(px * 6).toFixed(2)}deg`)
    cardRef.current.style.setProperty('--mx', `${(px * 100 + 50).toFixed(1)}%`)
    cardRef.current.style.setProperty('--my', `${(py * 100 + 50).toFixed(1)}%`)
  }

  const handleLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.setProperty('--rx', '0deg')
    cardRef.current.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-14"
      style={{
        transform: 'perspective(1400px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.25s ease-out',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(480px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.08), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            {project.code} — Featured
          </span>
          <h3 className="mt-5 font-display text-3xl font-medium tracking-tight text-white md:text-4xl">
            {project.name}
          </h3>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.1em] text-white/40">
            {project.tagline}
          </p>
          <p className="mt-6 text-base leading-relaxed text-white/60">{project.description}</p>

          {project.problem && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 py-3 text-left text-sm font-medium text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
              aria-expanded={expanded}
            >
              {expanded ? 'Hide problem statement −' : 'What problem does this solve? +'}
            </button>
          )}
          {expanded && project.problem && (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">{project.problem}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/55"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            {project.liveUrl && (
              <MagneticButton
                as="a"
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                cursorMode="project"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black"
              >
                View Project
                <ArrowIcon />
              </MagneticButton>
            )}
            {project.githubUrl && (
              <MagneticButton
                as="a"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                cursorMode="project"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:border-white"
              >
                GitHub
                <ArrowIcon />
              </MagneticButton>
            )}
          </div>
        </div>

        <ul className="grid w-full max-w-sm grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:w-auto">
          {project.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-white/55">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
