import { Suspense, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { LiquidScene } from './LiquidScene'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { usePageVisible } from '@/hooks/usePageVisible'
import type { SectionScrollerApi } from '@/hooks/SectionScrollerContext'

interface LiquidBackgroundProps {
  /** When the cinematic section-scroller is active, pass its API so the
   * shader/camera react to section-transition progress instead of raw
   * document scroll. Omit to fall back to normal document scroll (used
   * under prefers-reduced-motion, where the scroller itself is disabled). */
  scroller?: SectionScrollerApi
}

/**
 * Static CSS gradient fallback used when WebGL is unavailable, and as the
 * very first paint before the Canvas mounts (also the reduced-motion base).
 */
function StaticFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-black"
      style={{
        backgroundImage:
          'radial-gradient(60% 50% at 30% 40%, rgba(255,255,255,0.10), transparent 60%), radial-gradient(50% 40% at 75% 65%, rgba(255,255,255,0.06), transparent 65%)',
      }}
    />
  )
}

function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

/**
 * Fixed, full-viewport, non-interactive 3D liquid backdrop. Sits behind all
 * page content (z-index handled by parent). Reacts to scroll and pointer via
 * refs so the surrounding React tree never re-renders on mouse movement.
 */
export function LiquidBackground({ scroller }: LiquidBackgroundProps) {
  const documentScroll = useScrollProgress()
  const reducedMotion = useReducedMotion()
  const { tier } = useDeviceTier()
  const visible = usePageVisible()

  // "Latest value" refs: mutated directly during render (a standard React
  // pattern for values read imperatively inside useFrame/rAF loops) so the
  // 3D scene always sees the current scroll state without re-rendering.
  const scrollProgressRef = useRef(0)
  const sectionIndexRef = useRef(0)
  const transitionProgressRef = useRef(0)

  if (scroller) {
    const s = scroller.stateRef.current
    scrollProgressRef.current = s.index + (s.targetIndex - s.index) * s.progress
    sectionIndexRef.current = scrollProgressRef.current
    transitionProgressRef.current = s.phase === 'transitioning' ? s.progress : 0
  } else {
    scrollProgressRef.current = documentScroll.progress
    sectionIndexRef.current = documentScroll.progress * 6
    transitionProgressRef.current = 0
  }

  const webglOk = useMemo(() => supportsWebGL(), [])
  const dpr = tier === 'mobile' ? Math.min(1.5, window.devicePixelRatio) : Math.min(2, window.devicePixelRatio)
  const intensity = reducedMotion ? 0.15 : tier === 'mobile' ? 0.55 : tier === 'tablet' ? 0.8 : 1
  const particleCount = reducedMotion ? 0 : tier === 'mobile' ? 24 : tier === 'tablet' ? 55 : 90

  if (!webglOk) {
    return <StaticFallback />
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Suspense fallback={<StaticFallback />}>
        <Canvas
          dpr={dpr}
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 20 }}
          frameloop={visible ? 'always' : 'never'}
        >
          <LiquidScene
            scrollProgressRef={scrollProgressRef}
            sectionIndexRef={sectionIndexRef}
            transitionProgressRef={transitionProgressRef}
            intensity={intensity}
            paused={!visible}
            particleCount={particleCount}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}
