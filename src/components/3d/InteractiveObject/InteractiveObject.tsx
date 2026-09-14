import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getPointer } from '@/hooks/useMousePosition'

interface InteractiveObjectProps {
  position?: [number, number, number]
  scale?: number
  paused?: boolean
}

/**
 * A single reflective wireframe torus-knot-like accent used sparingly
 * (e.g. within the Skills scene) to reinforce depth without adding
 * simulation cost. Reacts to pointer with gentle rotation, not translation.
 */
export function InteractiveObject({ position = [0, 0, 0], scale = 1, paused = false }: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rotVel = useRef({ x: 0, y: 0 })

  useFrame((_, delta) => {
    if (paused || !meshRef.current) return
    const pointer = getPointer()

    const targetX = pointer.ny * 0.3
    const targetY = pointer.nx * 0.5

    rotVel.current.x += (targetX - rotVel.current.x) * Math.min(1, delta * 2)
    rotVel.current.y += (targetY - rotVel.current.y) * Math.min(1, delta * 2)

    meshRef.current.rotation.x += delta * 0.15 + rotVel.current.x * delta
    meshRef.current.rotation.y += delta * 0.2 + rotVel.current.y * delta
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusKnotGeometry args={[0.9, 0.28, 128, 24]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.15}
        metalness={0.85}
        wireframe
        transparent
        opacity={0.18}
      />
    </mesh>
  )
}
