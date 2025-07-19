'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { Player as PlayerType } from '@/types/game'

interface PlayerProps {
  player: PlayerType
  onMove: (direction: Vector3) => void
}

export function Player({ player, onMove }: PlayerProps) {
  const meshRef = useRef<Mesh>(null)
  const targetPosition = useRef(new Vector3(player.position.x, player.position.y, player.position.z))

  // Smooth movement animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth interpolation to target position
      meshRef.current.position.lerp(targetPosition.current, delta * 10)
      
      // Gentle bobbing animation when idle
      const idleMovement = Math.sin(state.clock.elapsedTime * 4) * 0.05
      meshRef.current.position.y = player.position.y + idleMovement
    }
  })

  useEffect(() => {
    targetPosition.current.set(player.position.x, player.position.y, player.position.z)
  }, [player.position])

  return (
    <group>
      {/* Player Character */}
      <mesh
        ref={meshRef}
        position={[player.position.x, player.position.y + 1, player.position.z]}
        castShadow
      >
        {/* Body */}
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshLambertMaterial color="#ff9800" />
      </mesh>

      {/* Head */}
      <mesh
        position={[player.position.x, player.position.y + 2, player.position.z]}
        castShadow
      >
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshLambertMaterial color="#ffb74d" />
      </mesh>

      {/* Health Bar */}
      <HealthBar 
        health={player.survival.health} 
        maxHealth={player.survival.maxHealth} 
        position={[player.position.x, player.position.y + 3, player.position.z]}
      />

      {/* Name Tag */}
      <NameTag 
        name={player.username} 
        position={[player.position.x, player.position.y + 3.5, player.position.z]}
      />
    </group>
  )
}

// Health Bar Component
function HealthBar({ health, maxHealth, position }: { 
  health: number
  maxHealth: number
  position: [number, number, number]
}) {
  const healthPercentage = health / maxHealth

  return (
    <group position={position}>
      {/* Background */}
      <mesh>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      {/* Health Fill */}
      <mesh position={[-(1 - healthPercentage) / 2, 0, 0.01]}>
        <planeGeometry args={[healthPercentage, 0.08]} />
        <meshBasicMaterial 
          color={healthPercentage > 0.5 ? "#4caf50" : healthPercentage > 0.25 ? "#ff9800" : "#f44336"} 
        />
      </mesh>
    </group>
  )
}

// Name Tag Component
function NameTag({ name, position }: { 
  name: string
  position: [number, number, number]
}) {
  return (
    <group position={position}>
      {/* Background */}
      <mesh>
        <planeGeometry args={[name.length * 0.15, 0.3]} />
        <meshBasicMaterial color="#000000" opacity={0.7} transparent />
      </mesh>
      
      {/* This would typically use Text from @react-three/drei for actual text rendering */}
      {/* For now, we'll use a simple colored plane as placeholder */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[name.length * 0.12, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
} 