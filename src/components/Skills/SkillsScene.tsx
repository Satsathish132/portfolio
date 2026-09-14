import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { InteractiveObject } from '@/components/3d/InteractiveObject/InteractiveObject'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { usePageVisible } from '@/hooks/usePageVisible'

function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * A single reflective wireframe accent floating behind the skills grid —
 * reinforces the "3D environment" framing from the spec without adding a
 * simulation per skill card. Rendered in its own small Canvas so it stays
 * scoped to this section and unmounts (stops costing frames) when scrolled
 * far away, unlike a global fixed layer.
 */
export function SkillsScene() {
  const reducedMotion = useReducedMotion()
  const { tier } = useDeviceTier()
  const visible = usePageVisible()
  const webglOk = useMemo(() => supportsWebGL(), [])

  if (!webglOk || reducedMotion || tier === 'mobile') return null

  return (
    <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas
          dpr={Math.min(1.5, window.devicePixelRatio)}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          camera={{ position: [0, 0, 5], fov: 45 }}
          frameloop={visible ? 'always' : 'never'}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 2, 4]} intensity={40} color="#ffffff" />
          <InteractiveObject position={[3.2, 1, -2]} scale={1.4} paused={!visible} />
        </Canvas>
      </Suspense>
    </div>
  )
}
