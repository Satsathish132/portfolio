import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getPointer } from '@/hooks/useMousePosition'

interface FloatingParticlesProps {
  count?: number
  paused?: boolean
}

/**
 * Subtle floating droplets rendered as a single instanced Points cloud —
 * one draw call regardless of count. Drifts slowly with gentle parallax
 * toward the pointer; never dominates the composition.
 */
export function FloatingParticles({ count = 90, paused = false }: FloatingParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2
      seeds[i] = Math.random() * Math.PI * 2
    }
    return { positions, seeds }
  }, [count])

  useFrame(({ clock }) => {
    if (paused || !pointsRef.current) return
    const t = clock.getElapsedTime()
    const pointer = getPointer()
    const geo = pointsRef.current.geometry
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < count; i++) {
      const seed = seeds[i]
      const baseX = positions[i * 3 + 0]
      const baseY = positions[i * 3 + 1]
      const baseZ = positions[i * 3 + 2]

      const drift = Math.sin(t * 0.15 + seed) * 0.35
      const bob = Math.cos(t * 0.12 + seed * 1.3) * 0.25
      const parallax = 0.15

      posAttr.setXYZ(
        i,
        baseX + drift + pointer.nx * parallax,
        baseY + bob + pointer.ny * parallax,
        baseZ,
      )
    }
    posAttr.needsUpdate = true
    pointsRef.current.rotation.y = t * 0.01
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.045}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
