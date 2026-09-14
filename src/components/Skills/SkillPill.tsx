import { useRef, useState, type PointerEvent } from 'react'
import type { Skill } from '@/data/skills'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SkillPillProps {
  skill: Skill
}

export function SkillPill({ skill }: SkillPillProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    ref.current.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`)
    ref.current.style.setProperty('--ry', `${(px * 14).toFixed(2)}deg`)
  }

  const handleLeave = () => {
    setHovered(false)
    if (!ref.current) return
    ref.current.style.setProperty('--rx', '0deg')
    ref.current.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handleLeave}
      data-cursor="link"
      tabIndex={0}
      className="group relative flex min-h-[92px] cursor-default flex-col justify-center rounded-xl border border-white/10 bg-white/[0.015] px-5 py-4 outline-none transition-[border-color,transform] duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:border-white/30 focus-visible:border-white/50"
      style={{
        transform: 'perspective(700px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)',
        transformStyle: 'preserve-3d',
      }}
    >
      <span className="font-display text-sm font-medium tracking-tight text-white">{skill.name}</span>
      <p
        className={`mt-1.5 text-xs leading-snug text-white/45 transition-all duration-300 ${
          hovered ? 'max-h-16 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
        }`}
      >
        {skill.description}
      </p>
    </div>
  )
}
