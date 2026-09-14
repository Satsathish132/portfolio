import { useRef, type PointerEvent } from 'react'
import type { Service } from '@/data/services'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ServiceCardProps {
  service: Service
}

/**
 * 3D tilt card driven by CSS transform, updated imperatively on pointer
 * move (no React state per move — avoids re-render thrash across 6 cards).
 */
export function ServiceCard({ service }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5

    cardRef.current.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`)
    cardRef.current.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`)
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
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-[transform,border-color] duration-300 ease-out hover:border-white/25 hover:-translate-y-1.5"
      style={{
        transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.10), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <span className="font-display text-sm font-medium text-white/30">{service.index}</span>
      <h3 className="mt-6 font-display text-xl font-medium tracking-tight text-white">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/50">{service.description}</p>
    </div>
  )
}
