import { useEffect } from 'react'

/**
 * Lerped "smooth scroll" of the kind that gives Scout-style sites their
 * weight — wheel input moves a target, and the real scroll position eases
 * toward it over several frames.
 *
 * It drives the *real* `window.scrollTo` rather than transforming the page
 * body. That matters: the body-transform approach (used by some smooth
 * scroll libraries) breaks `position: sticky` and `position: fixed`, and the
 * whole scroll-story layout is built on sticky pinning.
 *
 * Touch is left entirely to the platform — native momentum scrolling is
 * better than anything re-implemented here, and intercepting it on mobile
 * costs responsiveness for no visual gain.
 */

const EASE_PER_FRAME = 0.12 // at 60fps; normalised below for other refresh rates
const SETTLE_EPSILON = 0.3 // px — below this we snap and stop the loop

let target = 0
let position = 0
let rafId: number | null = null
let lastFrameAt = 0
/** Where we last told the browser to scroll, to tell our own scrolls from external ones. */
let selfScrollTo = -1
let active = false

function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
}

function clampTarget(value: number): number {
  return Math.min(maxScroll(), Math.max(0, value))
}

function step(now: number) {
  const deltaMs = lastFrameAt === 0 ? 16.67 : Math.min(64, now - lastFrameAt)
  lastFrameAt = now

  const diff = target - position
  if (Math.abs(diff) < SETTLE_EPSILON) {
    position = target
    applyScroll()
    rafId = null
    lastFrameAt = 0
    return
  }

  // Frame-rate independent easing: the same visual pace on a 60Hz and a
  // 144Hz display, where a fixed per-frame factor would be 2.4x faster.
  const factor = 1 - Math.pow(1 - EASE_PER_FRAME, deltaMs / 16.67)
  position += diff * factor
  applyScroll()
  rafId = requestAnimationFrame(step)
}

function applyScroll() {
  selfScrollTo = Math.round(position)
  window.scrollTo(0, position)
}

function start() {
  if (rafId === null) {
    lastFrameAt = 0
    rafId = requestAnimationFrame(step)
  }
}

function onWheel(event: WheelEvent) {
  // Let the browser handle zoom and any nested scroller that opts out.
  if (event.ctrlKey || event.defaultPrevented) return

  // Normalise the three delta modes — a mouse reporting DOM_DELTA_LINE
  // sends ~3, not ~100, and would otherwise crawl.
  let delta = event.deltaY
  if (event.deltaMode === 1) delta *= 16
  else if (event.deltaMode === 2) delta *= window.innerHeight

  event.preventDefault()
  target = clampTarget(target + delta)
  start()
}

function onScroll() {
  // A scroll we did not cause (keyboard, scrollbar drag, find-in-page,
  // focus jump) — adopt it as the new truth so the lerp does not yank the
  // reader back to where it thought they were.
  if (Math.abs(window.scrollY - selfScrollTo) > 2) {
    position = window.scrollY
    target = clampTarget(position)
  }
}

function onResize() {
  target = clampTarget(target)
}

/** Eases to an absolute document Y. Falls back to a native jump when inactive. */
export function smoothScrollToY(y: number) {
  if (!active) {
    window.scrollTo({ top: y, behavior: 'smooth' })
    return
  }
  target = clampTarget(y)
  start()
}

/** Eases to an element, honouring the fixed navbar's height. */
export function smoothScrollToElement(el: HTMLElement, offset = 0) {
  const y = window.scrollY + el.getBoundingClientRect().top - offset
  smoothScrollToY(y)
}

export function isSmoothScrollActive(): boolean {
  return active
}

/**
 * Enables lerped scrolling for as long as the calling component is mounted
 * and `enabled` is true.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    // Pointer-coarse devices keep native momentum scrolling.
    if (window.matchMedia('(pointer: coarse)').matches) return

    active = true
    position = window.scrollY
    target = position
    selfScrollTo = Math.round(position)

    // CSS `scroll-behavior: smooth` (set globally in index.css) fights the
    // lerp — every scrollTo would start its own competing animation.
    const previousBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto'

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      active = false
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      lastFrameAt = 0
      document.documentElement.style.scrollBehavior = previousBehavior
    }
  }, [enabled])
}
