import { useRef, type PointerEvent } from 'react'
import type { Project } from '@/data/projects'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MagneticButton } from '@/components/UI/MagneticButton'

interface ProjectCardProps {
  project: Project
}

const isPlaceholder = (project: Project) => project.name.startsWith('[')

export function ProjectCard({ project }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const placeholder = isPlaceholder(project)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`)
    cardRef.current.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`)
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
      className={`relative flex h-full flex-col rounded-2xl border p-7 transition-[border-color,transform] duration-300 ${
        placeholder
          ? 'border-dashed border-white/10 bg-transparent'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:-translate-y-1'
      }`}
      style={{
        transform: placeholder ? undefined : 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
        transformStyle: 'preserve-3d',
      }}
    >
      <span className="font-display text-xs font-medium uppercase tracking-[0.25em] text-white/35">
        {project.code}
      </span>
      <h3 className={`mt-4 font-display text-xl font-medium tracking-tight ${placeholder ? 'text-white/40' : 'text-white'}`}>
        {project.name}
      </h3>
      <p className={`mt-2 text-sm leading-relaxed ${placeholder ? 'text-white/25' : 'text-white/55'}`}>
        {project.description}
      </p>

      {!placeholder && project.technologies.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span key={tech} className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
              {tech}
              <span className="ml-2 text-white/15 last:hidden">·</span>
            </span>
          ))}
        </div>
      )}

      {!placeholder && (project.liveUrl || project.githubUrl) && (
        <div className="mt-6 flex gap-4 pt-2">
          {project.liveUrl && (
            <MagneticButton
              as="a"
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              cursorMode="project"
              strength={0.2}
              className="text-xs font-semibold uppercase tracking-[0.1em] text-white underline decoration-white/30 underline-offset-4"
            >
              Live Demo
            </MagneticButton>
          )}
          {project.githubUrl && (
            <MagneticButton
              as="a"
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              cursorMode="project"
              strength={0.2}
              className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60 underline decoration-white/20 underline-offset-4"
            >
              GitHub
            </MagneticButton>
          )}
        </div>
      )}

      {placeholder && (
        <span className="mt-auto pt-6 text-[11px] font-medium uppercase tracking-[0.15em] text-white/20">
          Coming soon
        </span>
      )}
    </div>
  )
}
