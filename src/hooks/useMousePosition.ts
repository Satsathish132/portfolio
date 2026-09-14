import { useEffect } from 'react'

export interface NormalizedPointer {
  /** Raw client coordinates in pixels */
  x: number
  y: number
  /** Normalized -1..1, origin center (like WebGL clip space), y flipped up-positive */
  nx: number
  ny: number
  /** Instantaneous velocity in px/ms, magnitude only */
  speed: number
}

type Listener = (pointer: NormalizedPointer) => void

/**
 * Module-level singleton pointer tracker. A single `pointermove` listener
 * is shared across the whole app (custom cursor, liquid background, tilt
 * cards) instead of each consumer attaching its own — this keeps mousemove
 * handling cheap and off the React render cycle entirely.
 */
const pointer: NormalizedPointer = { x: 0, y: 0, nx: 0, ny: 0, speed: 0 }
const listeners = new Set<Listener>()
let lastX = 0
let lastY = 0
let lastT = 0
let initialized = false

function handleMove(event: PointerEvent) {
  const now = performance.now()
  const dt = Math.max(1, now - lastT)
  const dx = event.clientX - lastX
  const dy = event.clientY - lastY
  const speed = Math.min(4, Math.hypot(dx, dy) / dt)

  pointer.x = event.clientX
  pointer.y = event.clientY
  pointer.nx = (event.clientX / window.innerWidth) * 2 - 1
  pointer.ny = -((event.clientY / window.innerHeight) * 2 - 1)
  pointer.speed = speed

  lastX = event.clientX
  lastY = event.clientY
  lastT = now

  listeners.forEach((fn) => fn(pointer))
}

function ensureInit() {
  if (initialized || typeof window === 'undefined') return
  window.addEventListener('pointermove', handleMove, { passive: true })
  initialized = true
}

/** Read the current pointer state without subscribing (safe inside rAF/useFrame loops). */
export function getPointer(): NormalizedPointer {
  ensureInit()
  return pointer
}

/** Subscribe to pointer updates; returns an unsubscribe function. */
export function subscribePointer(fn: Listener): () => void {
  ensureInit()
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * React hook wrapper for components that just need the live ref without
 * re-rendering on every move (e.g. to read inside a GSAP ticker or useFrame).
 */
export function useMousePosition() {
  useEffect(() => {
    ensureInit()
  }, [])

  return { getPointer, subscribe: subscribePointer }
}
