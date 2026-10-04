import { useEffect, useRef, type ReactNode } from 'react'
import { ScrollSceneContext } from './ScrollSceneContext'
import { addScrollDriver, clamp01 } from './scrollDriver'

interface ScrollSceneProps {
  children: ReactNode
  /**
   * Scroll distance of the pin, in viewport heights. `1` pins for exactly
   * one screen of scroll (i.e. effectively no pin); `2.5` holds the scene
   * on screen while the reader scrolls 1.5 extra screens through it.
   */
  pages?: number
  id?: string
  className?: string
  /** Applied to the sticky viewport-sized stage, not the tall outer track. */
  stageClassName?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

/**
 * A Scout-style pinned scene: a tall outer "track" whose inner stage sticks
 * to the viewport, so the stage stays put while the page scrolls past it.
 * Scene progress (0 at the moment the stage locks, 1 as it releases) is
 * published to descendants through context for `SceneLayer` to animate on.
 *
 * Uses native CSS `position: sticky` for the pin rather than transform math,
 * so the browser compositor owns the pin and it stays correct even if a
 * frame is dropped.
 */
export function ScrollScene({
  children,
  pages = 2,
  id,
  className = '',
  stageClassName = '',
  ...aria
}: ScrollSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    return addScrollDriver(() => {
      const rect = track.getBoundingClientRect()
      // The stage is pinned for (track height - one viewport) of scrolling;
      // -rect.top is how far into that distance we are.
      const pinDistance = rect.height - window.innerHeight
      progressRef.current = pinDistance <= 0 ? 0 : clamp01(-rect.top / pinDistance)
    })
  }, [])

  return (
    <ScrollSceneContext.Provider value={{ progressRef }}>
      <section
        id={id}
        ref={trackRef}
        className={`relative ${className}`}
        style={{ height: `${pages * 100}svh` }}
        {...aria}
      >
        <div
          className={`sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden ${stageClassName}`}
        >
          {children}
        </div>
      </section>
    </ScrollSceneContext.Provider>
  )
}
