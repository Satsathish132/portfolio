import { createContext, useContext } from 'react'
import type { useSectionScroller } from './useSectionScroller'

export type SectionScrollerApi = ReturnType<typeof useSectionScroller>

export const SectionScrollerContext = createContext<SectionScrollerApi | null>(null)

export function useSectionScrollerContext(): SectionScrollerApi {
  const ctx = useContext(SectionScrollerContext)
  if (!ctx) {
    throw new Error('useSectionScrollerContext must be used within SectionScrollerContext.Provider')
  }
  return ctx
}
