import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LiquidPlane } from './LiquidPlane'
import { FloatingParticles } from '@/components/3d/FloatingParticles/FloatingParticles'
import { getPointer } from '@/hooks/useMousePosition'

interface LiquidSceneProps {
  /** Continuous position across sections: index + in-progress fraction (0..sectionCount-1). */
  scrollProgressRef: React.RefObject<number>
  sectionIndexRef: React.RefObject<number>
  transitionProgressRef: React.RefObject<number>
  intensity: number
  paused: boolean
  particleCount: number
  reducedMotion: boolean
}

/**
 * Composes the fullscreen liquid shader (rendered first, ignoring depth) with
 * a sparse floating-droplet field and a subtle camera dolly. The particles
 * live in a real 3D perspective frustum layered over the orthographic-style
 * shader plane — both share one Canvas/WebGL context, so this costs one
 * extra draw call, not a second renderer.
 *
 * The camera itself moves along Z with section progress (the "traveling
 * deeper into the environment" cue) and tilts gently with pointer position
 * (parallax) — both are pure per-frame reads from refs, never React state.
 */
export function LiquidScene({
  scrollProgressRef,
  sectionIndexRef,
  transitionProgressRef,
  intensity,
  paused,
  particleCount,
  reducedMotion,
}: LiquidSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const cameraTilt = useRef({ x: 0, y: 0 })
  const cameraZ = useRef(5)

  useFrame(({ camera }, delta) => {
    // Particles are a hero-specific accent — fade out once we've moved a
    // meaningful distance into the section stack.
    if (groupRef.current) {
      const scrollPos = scrollProgressRef.current ?? 0
      const fade = 1 - Math.min(1, scrollPos * 1.6)
      groupRef.current.visible = fade > 0.02
      const material = (groupRef.current.children[0] as THREE.Points | undefined)?.material as
        | THREE.PointsMaterial
        | undefined
      if (material) material.opacity = 0.35 * fade
    }

    if (reducedMotion) return

    // Camera dolly: gentle forward push driven by transition progress, so
    // the environment itself feels like it's being travelled through rather
    // than the camera teleporting between fixed section marks.
    const transition = transitionProgressRef.current ?? 0
    const bell = Math.sin(Math.PI * Math.min(1, Math.max(0, transition)))
    const targetZ = 5 - bell * 0.6
    cameraZ.current += (targetZ - cameraZ.current) * Math.min(1, delta * 4)
    camera.position.z = cameraZ.current

    // Pointer parallax: subtle horizontal shift + tilt, never uncomfortable.
    const pointer = getPointer()
    const targetTiltX = pointer.ny * 0.06
    const targetTiltY = pointer.nx * 0.09
    cameraTilt.current.x += (targetTiltX - cameraTilt.current.x) * Math.min(1, delta * 2.2)
    cameraTilt.current.y += (targetTiltY - cameraTilt.current.y) * Math.min(1, delta * 2.2)
    camera.position.x = cameraTilt.current.y * 0.8
    camera.position.y = cameraTilt.current.x * 0.6
    camera.rotation.y = -cameraTilt.current.y * 0.25
    camera.rotation.x = cameraTilt.current.x * 0.2
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <LiquidPlane
        scrollProgressRef={scrollProgressRef}
        sectionIndexRef={sectionIndexRef}
        transitionProgressRef={transitionProgressRef}
        intensity={intensity}
        paused={paused}
      />
      {particleCount > 0 && (
        <group ref={groupRef}>
          <FloatingParticles count={particleCount} paused={paused} />
        </group>
      )}
    </>
  )
}
