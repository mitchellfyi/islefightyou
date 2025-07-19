'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { Mesh, Vector3, Group } from 'three'
import * as THREE from 'three'
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
      characterRef.current.position.y = player.position.y + idleMovement
      
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
          position={[0, 1, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshLambertMaterial color="#4a90e2" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.7, 0]} castShadow>
          <sphereGeometry args={[0.35, 12, 8]} />
          <meshLambertMaterial color="#fdbcb4" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 1.8, 0.3]} castShadow>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        <mesh position={[0.1, 1.8, 0.3]} castShadow>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshLambertMaterial color="#000000" />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.5, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 3, 6]} />
          <meshLambertMaterial color="#fdbcb4" />
        </mesh>
        <mesh position={[0.5, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 3, 6]} />
          <meshLambertMaterial color="#fdbcb4" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.15, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6, 3, 6]} />
          <meshLambertMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[0.15, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6, 3, 6]} />
          <meshLambertMaterial color="#2c3e50" />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.15, -0.1, 0.1]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshLambertMaterial color="#8d4e85" />
        </mesh>
        <mesh position={[0.15, -0.1, 0.1]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshLambertMaterial color="#8d4e85" />
        </mesh>
      </group>

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