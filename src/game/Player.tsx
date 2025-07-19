'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { Mesh, Vector3 } from 'three'
import * as THREE from 'three'
import { Player as PlayerType } from '@/types/game'

interface PlayerProps {
  player: PlayerType
  onMove: (direction: Vector3) => void
}

export function Player({ player, onMove }: PlayerProps) {
  const meshRef = useRef<Mesh>(null)

  // Simple bobbing animation
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing animation when idle
      const idleMovement = Math.sin(state.clock.elapsedTime * 4) * 0.05
      meshRef.current.position.y = player.position.y + 1 + idleMovement
    }
  })

  return (
    <group position={[player.position.x, player.position.y, player.position.z]}>
      {/* Player Character */}
      <mesh
        ref={meshRef}
        position={[0, 1, 0]}
        castShadow
      >
        {/* Body */}
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshLambertMaterial color="#ff9800" />
      </mesh>

      {/* Head */}
      <mesh
        position={[0, 2, 0]}
        castShadow
      >
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshLambertMaterial color="#ffb74d" />
      </mesh>

      {/* Health Bar */}
      <HealthBar 
        health={player.survival.health} 
        maxHealth={player.survival.maxHealth} 
        position={[0, 3, 0]}
      />

      {/* Name Tag */}
      <NameTag 
        name={player.username} 
        position={[0, 3.5, 0]}
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
    <Billboard position={position}>
      <group>
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
    </Billboard>
  )
}

// Name Tag Component
function NameTag({ name, position }: { 
  name: string
  position: [number, number, number]
}) {
  return (
    <Billboard position={position}>
      <group>
        {/* Background */}
        <mesh>
          <planeGeometry args={[name.length * 0.15, 0.3]} />
          <meshBasicMaterial color="#000000" opacity={0.7} transparent />
        </mesh>
        
        {/* Actual Text */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    </Billboard>
  )
} 