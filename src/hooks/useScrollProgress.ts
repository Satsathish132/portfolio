import { useEffect, useState } from 'react'

export interface ScrollState {
  /** 0..1 progress through the full document */
  progress: number
  /** raw scrollY in pixels */
  y: number
  /** signed velocity, px per frame-ish (rough, for reactive effects only) */
  velocity: number
  /** true once the user has scrolled past a small threshold */
  scrolled: boolean
  direction: 'up' | 'down' | null
}

/**
 * Throttled (rAF-batched) scroll tracker. Avoids firing a React state update
 * on every native scroll event — updates are coalesced to one per frame.
 */
export function useScrollProgress(): ScrollState {
  const [state, setState] = useState<ScrollState>({
    progress: 0,
    y: 0,
    velocity: 0,
    scrolled: false,
    direction: null,
  })

  useEffect(() => {
    let ticking = false
    let lastY = window.scrollY

    const update = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const y = window.scrollY
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
      const velocity = y - lastY
      const direction: ScrollState['direction'] = velocity > 0.5 ? 'down' : velocity < -0.5 ? 'up' : null

      setState((prev) => {
        if (Math.abs(prev.y - y) < 0.5 && prev.progress === progress) return prev
        return { progress, y, velocity, scrolled: y > 24, direction: direction ?? prev.direction }
      })

      lastY = y
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return state
}
