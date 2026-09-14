import { useEffect, useState } from 'react'

export type DeviceTier = 'mobile' | 'tablet' | 'desktop'

export interface DeviceCapabilities {
  tier: DeviceTier
  isCoarsePointer: boolean
  isTouch: boolean
  prefersReducedData: boolean
}

function computeCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return { tier: 'desktop', isCoarsePointer: false, isTouch: false, prefersReducedData: false }
  }

  const width = window.innerWidth
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection
  const prefersReducedData = Boolean(connection?.saveData) || connection?.effectiveType === '2g'

  let tier: DeviceTier = 'desktop'
  if (width < 640 || (isCoarsePointer && isTouch && width < 900)) tier = 'mobile'
  else if (width < 1100) tier = 'tablet'

  return { tier, isCoarsePointer, isTouch, prefersReducedData }
}

/**
 * Coarse device classification used to gate 3D scene complexity
 * (particle counts, DPR cap, shader quality) — not for hiding content.
 */
export function useDeviceTier(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>(() => computeCapabilities())

  useEffect(() => {
    const onResize = () => setCaps(computeCapabilities())
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return caps
}
