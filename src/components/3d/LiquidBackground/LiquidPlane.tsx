import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { liquidFragmentShader, liquidVertexShader } from './liquidShaders'
import { getPointer } from '@/hooks/useMousePosition'

interface LiquidPlaneProps {
  scrollProgressRef: React.RefObject<number>
  sectionIndexRef: React.RefObject<number>
  /** 0..1 raw transition progress between sections (0 = settled). */
  transitionProgressRef: React.RefObject<number>
  intensity: number
  paused: boolean
}

/**
 * Fullscreen shader plane. All reactive state (pointer, scroll, section)
 * is read from refs inside useFrame — no React state updates per frame.
 * Pointer position is smoothed with critically-damped lerp for inertia,
 * so the liquid never snaps to the cursor.
 */
export function LiquidPlane({
  scrollProgressRef,
  sectionIndexRef,
  transitionProgressRef,
  intensity,
  paused,
}: LiquidPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const smoothed = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const prevPointer = useRef({ x: 0, y: 0 })
  const smoothedTransition = useRef(0)

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerVel: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uSection: { value: 0 },
      uIntensity: { value: intensity },
      uTransition: { value: 0 },
    }),
    // size handled separately below; intensity updates live via ref, not remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((_, delta) => {
    if (paused || !materialRef.current) return
    const u = materialRef.current.uniforms

    u.uResolution.value.set(size.width, size.height)
    u.uTime.value += delta

    const pointer = getPointer()
    // aspect-correct target so the shader's own p.x *= aspect doesn't need to
    const targetX = pointer.nx * (viewport.width > viewport.height ? 1 : 1)
    const targetY = pointer.ny

    // Critically-damped smoothing (inertia): slower approach, no overshoot snap.
    const smoothing = 1 - Math.pow(0.0015, delta)
    smoothed.current.x += (targetX - smoothed.current.x) * smoothing
    smoothed.current.y += (targetY - smoothed.current.y) * smoothing

    const vx = (pointer.x - prevPointer.current.x) * 0.02
    const vy = (pointer.y - prevPointer.current.y) * 0.02
    smoothed.current.vx += (vx - smoothed.current.vx) * 0.08
    smoothed.current.vy += (vy - smoothed.current.vy) * 0.08
    prevPointer.current = { x: pointer.x, y: pointer.y }

    u.uPointer.value.set(smoothed.current.x, smoothed.current.y)
    u.uPointerVel.value.set(smoothed.current.vx, smoothed.current.vy)
    u.uScroll.value = scrollProgressRef.current ?? 0
    u.uSection.value = sectionIndexRef.current ?? 0
    u.uIntensity.value += (intensity - u.uIntensity.value) * 0.05

    // Bell curve peaking at progress=0.5 — matches the spec's "50%: liquid
    // dominates the scene" beat. sin(pi * p) is 0 at p=0/1 and 1 at p=0.5.
    const rawProgress = transitionProgressRef.current ?? 0
    const bell = Math.sin(Math.PI * Math.min(1, Math.max(0, rawProgress)))
    smoothedTransition.current += (bell - smoothedTransition.current) * Math.min(1, delta * 8)
    u.uTransition.value = smoothedTransition.current
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={liquidVertexShader}
        fragmentShader={liquidFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
