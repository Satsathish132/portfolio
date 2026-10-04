import { MOTION_STYLE_LABELS, useMotionStyle, type MotionStyle } from '@/hooks/useMotionStyle'

const ORDER: MotionStyle[] = ['cinematic', 'scroll-story']

interface MotionStyleToggleProps {
  className?: string
}

/**
 * Lets the visitor choose how the site moves. The choice is persisted to
 * localStorage by the store, so it survives reloads and applies on their
 * next visit.
 *
 * Rendered as a radiogroup rather than a checkbox or a button that cycles:
 * there are two named, equally-valid options, and the control should say
 * what they are instead of making the visitor click to discover the other.
 */
export function MotionStyleToggle({ className = '' }: MotionStyleToggleProps) {
  const [style, setStyle] = useMotionStyle()

  return (
    <div
      role="radiogroup"
      aria-label="Motion style"
      className={`inline-flex items-center gap-0.5 rounded-full border border-white/15 p-0.5 ${className}`}
    >
      {ORDER.map((option) => {
        const selected = style === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setStyle(option)}
            data-cursor="link"
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
              selected ? 'bg-white text-black' : 'text-white/55 hover:text-white'
            }`}
          >
            {MOTION_STYLE_LABELS[option]}
          </button>
        )
      })}
    </div>
  )
}
