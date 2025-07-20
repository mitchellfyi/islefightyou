'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3, Group } from 'three'
import { Player as PlayerType } from '@/types/game'

interface PlayerProps {
  player: PlayerType
  onMove: (direction: Vector3) => void
}

export function Player({ player, onMove }: PlayerProps) {
  const characterRef = useRef<Group>(null)
  const bodyRef = useRef<Mesh>(null)

  // Walking and idle animations
  useFrame((state) => {
    if (characterRef.current && bodyRef.current) {
      // Gentle bobbing animation when idle
      const idleMovement = Math.sin(state.clock.elapsedTime * 4) * 0.02
      characterRef.current.position.y = idleMovement
      
      // Body slight rotation for character appeal
      bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <group position={[player.position.x, player.position.y, player.position.z]}>
      {/* Character Model */}
      <group ref={characterRef}>
        {/* Body */}
        <mesh
          ref={bodyRef}
          position={[0, 0.8, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.25, 0.6, 4, 8]} />
          <meshLambertMaterial color="#4a90e2" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshLambertMaterial color="#fdbcb4" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.08, 1.45, 0.25]} castShadow>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        <mesh position={[0.08, 1.45, 0.25]} castShadow>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshLambertMaterial color="#000000" />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.4, 0.9, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 3, 6]} />
          <meshLambertMaterial color="#fdbcb4" />
        </mesh>
        <mesh position={[0.4, 0.9, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 3, 6]} />
          <meshLambertMaterial color="#fdbcb4" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.12, 0.2, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 3, 6]} />
          <meshLambertMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[0.12, 0.2, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 3, 6]} />
          <meshLambertMaterial color="#2c3e50" />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.12, -0.15, 0.08]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.25]} />
          <meshLambertMaterial color="#8d4e85" />
        </mesh>
        <mesh position={[0.12, -0.15, 0.08]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.25]} />
          <meshLambertMaterial color="#8d4e85" />
        </mesh>
      </group>

      {/* Invisible hitbox for collision detection */}
      <mesh position={[0, 0.8, 0]} visible={false}>
        <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
        <meshBasicMaterial color="#ff0000" wireframe />
      </mesh>
    </group>
  )
}

// Note: HealthBar and NameTag components removed as they're now handled by the UI overlay 