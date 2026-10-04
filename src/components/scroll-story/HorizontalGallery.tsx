import { useEffect, useRef, type ReactNode } from 'react'
import { addScrollDriver, clamp01 } from './scrollDriver'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface GalleryItem {
  id: string
  /** Small label above the title, e.g. a category or year. */
  eyebrow?: string
  title: string
  description?: string
  /** Optional footer content — tech tags, links. */
  footer?: ReactNode
}

interface HorizontalGalleryProps {
  items: GalleryItem[]
  id?: string
  heading?: string
  'aria-label'?: string
}

/**
 * Scout's "viewfinder" gallery: the page pins and vertical scroll is remapped
 * onto horizontal travel through a numbered strip of panels, with a live
 * `01 / 12` counter.
 *
 * Travel distance is measured from the real rendered row width rather than
 * assumed from the item count, so panels can be any width and the last one
 * always lands flush against the right edge.
 *
 * Under `prefers-reduced-motion` the whole mechanism is dropped for an
 * ordinary vertical list — remapped scroll axes are exactly the kind of
 * motion that preference is asking us not to do.
 */
export function HorizontalGallery({ items, id, heading, ...aria }: HorizontalGalleryProps) {
  const trackRef = useRef<HTMLElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  // Pin length scales with the number of panels so each gets a comparable
  // share of scroll regardless of how many there are.
  const pages = 1 + items.length * 0.75

  useEffect(() => {
    if (reducedMotion) return
    const track = trackRef.current
    const row = rowRef.current
    if (!track || !row) return

    let lastIndex = -1

    return addScrollDriver(() => {
      const rect = track.getBoundingClientRect()
      const pinDistance = rect.height - window.innerHeight
      const progress = pinDistance <= 0 ? 0 : clamp01(-rect.top / pinDistance)

      const travel = Math.max(0, row.scrollWidth - window.innerWidth)
      row.style.transform = `translate3d(${(-progress * travel).toFixed(2)}px, 0, 0)`

      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`

      // Which panel is actually centred in the viewport, measured from the
      // rendered panels rather than inferred from progress — dividing
      // progress evenly by item count drifts out of sync, because the first
      // and last panels each occupy only half a screen of travel.
      const viewportCentre = window.innerWidth / 2
      let index = 0
      let bestDistance = Infinity
      for (let i = 0; i < row.children.length; i += 1) {
        const panel = row.children[i] as HTMLElement
        const distance = Math.abs(panel.offsetLeft + panel.offsetWidth / 2 - progress * travel - viewportCentre)
        if (distance < bestDistance) {
          bestDistance = distance
          index = i
        }
      }

      // Counter text is written directly, not held in React state — this
      // runs every frame and a setState here would re-render the gallery
      // ~60 times a second.
      if (index !== lastIndex && counterRef.current) {
        lastIndex = index
        counterRef.current.textContent = String(index + 1).padStart(2, '0')
      }
    })
  }, [items.length, reducedMotion])

  if (reducedMotion) {
    return (
      <section id={id} className="relative py-32 md:py-44" {...aria}>
        <div className="container-portfolio">
          {heading && (
            <h2 className="font-display text-4xl font-medium tracking-tight text-white md:text-5xl">
              {heading}
            </h2>
          )}
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {items.map((item, i) => (
              <GalleryPanel key={item.id} item={item} index={i} total={items.length} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id={id}
      ref={trackRef}
      className="relative"
      style={{ height: `${pages * 100}svh` }}
      {...aria}
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col justify-center overflow-hidden">
        <div className="container-portfolio mb-10 flex items-end justify-between gap-6">
          {heading && (
            <h2 className="font-display text-3xl font-medium tracking-tight text-white md:text-5xl">
              {heading}
            </h2>
          )}
          <p className="shrink-0 font-display text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            <span ref={counterRef}>01</span>
            <span className="text-white/25"> / {String(items.length).padStart(2, '0')}</span>
          </p>
        </div>

        <div
          ref={rowRef}
          className="flex w-max items-stretch gap-6 px-[clamp(1.25rem,5vw,5rem)]"
          style={{ willChange: 'transform' }}
        >
          {items.map((item, i) => (
            <GalleryPanel key={item.id} item={item} index={i} total={items.length} />
          ))}
        </div>

        <div className="container-portfolio mt-10">
          <span className="block h-px w-full bg-white/10">
            <span
              ref={barRef}
              className="block h-full origin-left bg-white/70"
              style={{ transform: 'scaleX(0)', willChange: 'transform' }}
            />
          </span>
        </div>
      </div>
    </section>
  )
}

function GalleryPanel({ item, index, total }: { item: GalleryItem; index: number; total: number }) {
  return (
    <article className="flex w-[min(78vw,30rem)] shrink-0 flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.03] p-8 backdrop-blur-sm transition-colors duration-500 hover:border-white/30 md:p-10">
      <div>
        <p className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/35">
          {String(index + 1).padStart(2, '0')}
          <span className="text-white/20"> / {String(total).padStart(2, '0')}</span>
          {item.eyebrow && <span className="ml-3 text-white/45">{item.eyebrow}</span>}
        </p>
        <h3 className="mt-8 font-display text-2xl font-medium leading-tight tracking-tight text-white md:text-3xl">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-4 text-sm leading-relaxed text-white/55 md:text-base">{item.description}</p>
        )}
      </div>
      {item.footer && <div className="mt-10">{item.footer}</div>}
    </article>
  )
}
