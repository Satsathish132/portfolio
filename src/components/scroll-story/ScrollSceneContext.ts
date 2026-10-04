import { createContext, useContext, type RefObject } from 'react'

export interface ScrollSceneApi {
  /**
   * 0..1 progress through this scene's pinned scroll distance, updated in
   * place every frame by the scene's driver. Read it inside a driver
   * callback — never during render, since it does not trigger re-renders.
   */
  progressRef: RefObject<number>
}

export const ScrollSceneContext = createContext<ScrollSceneApi | null>(null)

/**
 * Progress of the nearest enclosing `ScrollScene`.
 * Returns null outside a scene, so layers can fall back to viewport-relative
 * behaviour rather than throwing.
 */
export function useScrollSceneOptional(): ScrollSceneApi | null {
  return useContext(ScrollSceneContext)
}
