import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

export interface SectionDef {
  id: string
}

export type ScrollerPhase = 'idle' | 'transitioning'

export interface ScrollerSnapshot {
  /** Index of the section currently active (or being transitioned away from). */
  index: number
  /** Index of the section being transitioned into; equals `index` when idle. */
  targetIndex: number
  /** 0..1 eased progress from `index` to `targetIndex`. 0 when idle. */
  progress: number
  phase: ScrollerPhase
}

const TRANSITION_DURATION_MS = 850

/** Spring-like ease: fast departure, gentle settle — no linear feel. */
function easeTransition(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 3)
}

/**
 * Drives the "move through a continuous 3D environment" navigation model.
 *
 * Two-level scroll: the outer gesture (wheel/touch/keyboard) is intercepted
 * and, when the currently-active section has no more internal scroll room in
 * the gesture's direction, triggers a snap transition to the next/previous
 * section. While a section still has internal scroll room, native scrolling
 * inside that section's own scrollable content area is left alone.
 *
 * State is exposed via useSyncExternalStore so the 3D scene (which reads it
 * every frame via a ref) and the DOM section layers (which read it to
 * compute opacity/scale) both stay in sync without prop drilling.
 */
export function useSectionScroller(sections: SectionDef[], enabled: boolean = true) {
  const stateRef = useRef<ScrollerSnapshot>({ index: 0, targetIndex: 0, progress: 0, phase: 'idle' })
  const listeners = useRef(new Set<() => void>())
  const rafRef = useRef<number | null>(null)
  const cooldownUntil = useRef(0)
  const sectionScrollRefs = useRef<Map<number, HTMLElement>>(new Map())
  // Wall-clock anchor for the current transition, so progress is a
  // deterministic function of elapsed time rather than an asymptotic
  // per-frame decay (which never actually reaches 1 in finite time).
  const transitionStart = useRef(0)
  const transitionFrom = useRef(0)

  const notify = useCallback(() => {
    listeners.current.forEach((fn) => fn())
  }, [])

  const registerSectionEl = useCallback((index: number, el: HTMLElement | null) => {
    if (el) sectionScrollRefs.current.set(index, el)
    else sectionScrollRefs.current.delete(index)
  }, [])

  const tick = useCallback(() => {
    const s = stateRef.current
    const elapsed = performance.now() - transitionStart.current
    const rawT = elapsed / TRANSITION_DURATION_MS

    if (rawT >= 1) {
      stateRef.current = { index: s.targetIndex, targetIndex: s.targetIndex, progress: 0, phase: 'idle' }
      notify()
      rafRef.current = null
      return
    }

    // `progress` interpolates from the fractional `transitionFrom` position
    // (which may itself be mid-way between two integer sections, if this
    // transition was re-anchored) to the integer `targetIndex`. Consumers
    // read `index + (targetIndex - index) * progress`, so we fold the
    // fractional start into `index` directly rather than widen the public
    // contract — `index` briefly holds a non-integer value only while a
    // re-anchored transition is in flight, snapping back to an integer the
    // instant it settles.
    stateRef.current = { ...s, index: transitionFrom.current, progress: easeTransition(rawT), phase: 'transitioning' }
    notify()
    rafRef.current = requestAnimationFrame(tick)
  }, [notify])

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(sections.length - 1, index))
      const s = stateRef.current
      if (clamped === s.index && s.phase === 'idle') return
      if (clamped === s.targetIndex && s.phase === 'transitioning') return

      // Re-anchor from wherever the (eased) transition currently sits, so
      // reversing direction mid-flight starts smoothly from the visual
      // in-between position rather than jumping back to a whole index.
      const currentVisualPos = s.index + (s.targetIndex - s.index) * s.progress
      transitionFrom.current = currentVisualPos
      transitionStart.current = performance.now()
      stateRef.current = { index: currentVisualPos, targetIndex: clamped, progress: 0, phase: 'transitioning' }
      notify()
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick)
    },
    [sections.length, notify, tick],
  )

  const next = useCallback(() => goTo(stateRef.current.targetIndex + 1), [goTo])
  const prev = useCallback(() => goTo(stateRef.current.targetIndex - 1), [goTo])

  useEffect(() => {
    if (!enabled) return

    // Lock the real document scroll while the cinematic scroller owns
    // input — sections are `position: fixed`, so any residual native
    // scroll on the page itself is invisible but still consumes wheel
    // gestures (and, on trackpads, can silently absorb an entire swipe).
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const GESTURE_COOLDOWN_MS = 900
    // Trigger threshold for *accumulated* delta within one burst — kept low
    // because a precision trackpad's individual wheel events can be only a
    // few units each; requiring any single event to clear a high bar would
    // silently drop the entire gesture.
    const WHEEL_TRIGGER = 40
    // A burst of small events with no new input for this long is treated as
    // finished; the accumulator resets so a later, unrelated gesture doesn't
    // inherit leftover delta from an old one.
    const BURST_RESET_MS = 160

    let accumulatedDelta = 0
    let lastWheelAt = 0

    const activeSectionCanScroll = (direction: 1 | -1): boolean => {
      const el = sectionScrollRefs.current.get(stateRef.current.index)
      if (!el) return false
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollHeight <= clientHeight + 1) return false
      if (direction > 0) return scrollTop + clientHeight < scrollHeight - 1
      return scrollTop > 1
    }

    const onWheel = (event: WheelEvent) => {
      if (stateRef.current.phase !== 'idle') {
        event.preventDefault()
        return
      }

      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1
      if (activeSectionCanScroll(direction)) {
        accumulatedDelta = 0 // engaging with internal content resets any pending burst
        return // let native scroll handle it
      }

      event.preventDefault()

      const now = performance.now()
      if (now - lastWheelAt > BURST_RESET_MS) accumulatedDelta = 0
      lastWheelAt = now

      // Only accumulate delta in a consistent direction, so a hand settling
      // after a scroll (which can produce a tiny reverse-direction wobble)
      // doesn't cancel out a burst that was otherwise about to trigger.
      if (accumulatedDelta !== 0 && Math.sign(accumulatedDelta) !== Math.sign(event.deltaY)) {
        accumulatedDelta = 0
      }
      accumulatedDelta += event.deltaY

      if (Math.abs(accumulatedDelta) < WHEEL_TRIGGER) return
      if (now < cooldownUntil.current) return

      cooldownUntil.current = now + GESTURE_COOLDOWN_MS
      accumulatedDelta = 0
      if (direction > 0) next()
      else prev()
    }

    let touchStartY = 0
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (event: TouchEvent) => {
      if (stateRef.current.phase !== 'idle') {
        event.preventDefault()
        return
      }
      const currentY = event.touches[0]?.clientY ?? touchStartY
      const delta = touchStartY - currentY
      if (Math.abs(delta) < 60) return
      const direction: 1 | -1 = delta > 0 ? 1 : -1
      if (activeSectionCanScroll(direction)) return

      event.preventDefault()
      const now = performance.now()
      if (now < cooldownUntil.current) return
      cooldownUntil.current = now + GESTURE_COOLDOWN_MS
      touchStartY = currentY
      if (direction > 0) next()
      else prev()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isFormField = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (isFormField) return

      if (event.key === 'PageDown' || (event.key === 'ArrowDown' && event.altKey)) {
        event.preventDefault()
        next()
      } else if (event.key === 'PageUp' || (event.key === 'ArrowUp' && event.altKey)) {
        event.preventDefault()
        prev()
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      document.documentElement.style.overflow = previousOverflow
    }
  }, [next, prev, enabled])

  const subscribe = useCallback((fn: () => void) => {
    listeners.current.add(fn)
    return () => listeners.current.delete(fn)
  }, [])

  const getSnapshot = useCallback(() => stateRef.current, [])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  return {
    ...snapshot,
    goTo,
    next,
    prev,
    registerSectionEl,
    /** Read-only ref for consumers (3D scene) that need per-frame access without re-rendering. */
    stateRef,
  }
}
