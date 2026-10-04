type ScrollDriverFn = () => void

/**
 * One shared rAF loop for every scroll-driven effect on the page.
 *
 * Scroll-story animation is deliberately imperative: each subscriber reads
 * its own element rect and writes `transform`/`opacity` directly, exactly
 * like `SectionLayer` does for the cinematic scroller. That keeps dozens of
 * simultaneously-animating elements at one loop and zero React re-renders
 * per frame, instead of one rAF (and one state update) per element.
 *
 * The loop runs only while something is subscribed, and skips work entirely
 * while the tab is hidden — a backgrounded tab still fires rAF in some
 * browsers, and there is nothing to see.
 */
const drivers = new Set<ScrollDriverFn>()
let rafId: number | null = null

function frame() {
  if (!document.hidden) {
    drivers.forEach((fn) => fn())
  }
  rafId = drivers.size > 0 ? requestAnimationFrame(frame) : null
}

export function addScrollDriver(fn: ScrollDriverFn): () => void {
  drivers.add(fn)
  // Run once immediately so an element is painted in its correct scroll
  // position on mount rather than flashing its untransformed initial state.
  if (!document.hidden) fn()
  if (rafId === null) rafId = requestAnimationFrame(frame)
  return () => {
    drivers.delete(fn)
    if (drivers.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

/** Clamp to 0..1. */
export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

/** Linear interpolation. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

/**
 * Remaps `value` from the range [inMin, inMax] onto 0..1, clamped.
 * Returns 0 for a degenerate (zero-width) input range.
 */
export function mapRange(value: number, inMin: number, inMax: number): number {
  const span = inMax - inMin
  if (span === 0) return 0
  return clamp01((value - inMin) / span)
}

/** Gentle ease matching the site's existing cubic-bezier(0.16, 1, 0.3, 1) feel. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp01(t), 3)
}
