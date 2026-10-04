import { useCallback, useSyncExternalStore } from 'react'

/**
 * Which motion system drives the site.
 *
 * - `cinematic`    — the section-snap camera dolly (`useSectionScroller`):
 *                    scroll is intercepted, sections are `position: fixed`.
 * - `scroll-story` — a Scout-Motors-style continuous document: real scroll,
 *                    pinned scenes, parallax depth, masked text and
 *                    clip-path reveals driven by scroll progress.
 *
 * The two are mutually exclusive — one hijacks scroll, the other depends on
 * it — so exactly one is active at a time.
 */
export type MotionStyle = 'cinematic' | 'scroll-story'

export const MOTION_STYLE_LABELS: Record<MotionStyle, string> = {
  cinematic: 'Cinematic',
  'scroll-story': 'Scroll Story',
}

const STORAGE_KEY = 'portfolio:motion-style'
const DEFAULT_STYLE: MotionStyle = 'scroll-story'

/**
 * Cinematic is hidden for now. While this is false every visitor gets
 * `DEFAULT_STYLE`, the navbar toggle is not rendered, and a previously
 * stored 'cinematic' choice is ignored (not deleted — it applies again if
 * switching is re-enabled). The cinematic code path itself is untouched;
 * flip this to true to bring the switch back.
 */
export const MOTION_STYLE_SWITCHING_ENABLED = false

function isMotionStyle(value: unknown): value is MotionStyle {
  return value === 'cinematic' || value === 'scroll-story'
}

/**
 * localStorage throws (not just returns null) in Safari private mode and
 * when a site is blocked from storing data — every access is guarded so a
 * storage failure degrades to the default style rather than blanking the page.
 */
function readStored(): MotionStyle {
  if (typeof window === 'undefined') return DEFAULT_STYLE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return isMotionStyle(raw) ? raw : DEFAULT_STYLE
  } catch {
    return DEFAULT_STYLE
  }
}

// Module-level store (not per-hook state) so the navbar toggle, App and any
// other reader share one value — and so the localStorage read happens once
// per session rather than on every mount.
let current: MotionStyle | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return
  // Fired only for *other* tabs, so this keeps duplicate tabs of the
  // portfolio in sync rather than letting them drift apart.
  const next = isMotionStyle(event.newValue) ? event.newValue : DEFAULT_STYLE
  if (next === current) return
  current = next
  emit()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  if (listeners.size === 1) {
    window.addEventListener('storage', handleStorageEvent)
  }
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent)
    }
  }
}

function getSnapshot(): MotionStyle {
  if (!MOTION_STYLE_SWITCHING_ENABLED) return DEFAULT_STYLE
  if (current === null) current = readStored()
  return current
}

function getServerSnapshot(): MotionStyle {
  return DEFAULT_STYLE
}

export function setMotionStyle(style: MotionStyle) {
  if (current === style) return
  current = style
  try {
    window.localStorage.setItem(STORAGE_KEY, style)
  } catch {
    // Persisting failed (private mode / blocked storage) — the choice still
    // applies for this session, it just won't survive a reload.
  }
  emit()
}

/**
 * Reads the visitor's persisted motion-style preference.
 *
 * Returns a `[style, setStyle]` pair. The value is shared across every
 * caller and across browser tabs, and survives reloads via localStorage.
 */
export function useMotionStyle() {
  const style = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const set = useCallback((next: MotionStyle) => setMotionStyle(next), [])
  return [style, set] as const
}
