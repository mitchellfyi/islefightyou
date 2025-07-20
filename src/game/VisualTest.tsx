'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Visual Testing Component with Clear Geometric Shapes
 * This replaces the complex terrain system with simple, measurable shapes
 */

const GRID_SIZE = 8 // 8x8 hexagonal grid
const HEX_RADIUS = 1.0 // Radius of each hexagon
const TEST_HEIGHT = 0 // Everything at ground level (y=0)

export function VisualTestTerrain() {
  // Create properly tessellating hexagonal grid
  const hexagons = useMemo(() => {
    const hexArray = []
    const hexWidth = HEX_RADIUS * 2
    const hexHeight = HEX_RADIUS * Math.sqrt(3)
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Proper hexagonal tessellation math
        const x = col * hexWidth * 0.75
        const z = row * hexHeight + (col % 2) * (hexHeight * 0.5)
        
        // Center the grid
        const centeredX = x - (GRID_SIZE * hexWidth * 0.75) / 2
        const centeredZ = z - (GRID_SIZE * hexHeight) / 2
        
        hexArray.push({
          position: [centeredX, TEST_HEIGHT, centeredZ] as [number, number, number],
          color: '#4a7c59' // Green terrain color
        })
      }
    }
    return hexArray
  }, [])

  return (
    <group>
      {/* Lighting for shadows and highlights */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <ambientLight intensity={0.4} />
      
      {/* Tessellating hexagonal terrain tiles */}
      {hexagons.map((hex, index) => (
        <mesh key={index} position={hex.position} receiveShadow>
          <cylinderGeometry args={[HEX_RADIUS, HEX_RADIUS, 0.2, 6]} />
          <meshLambertMaterial color={hex.color} />
        </mesh>
      ))}
      
      {/* Simple test objects - everything at same level */}
      {/* Red cube - The player character */}
      <mesh position={[0, TEST_HEIGHT + 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.8]} />
        <meshLambertMaterial color="red" />
      </mesh>
      
      {/* Yellow marker at exact terrain height */}
      <mesh position={[0, TEST_HEIGHT + 0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
        <meshLambertMaterial color="yellow" />
      </mesh>
      
      {/* Blue marker at expected player base */}
      <mesh position={[2, TEST_HEIGHT + 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshLambertMaterial color="blue" />
      </mesh>
    </group>
  )
}

/**
 * Simple height function for testing - everything at ground level
 */
export function getVisualTestHeight(x: number, z: number): number {
  return TEST_HEIGHT // Always returns 0
}

/**
 * Visual test configuration
 */
export const VISUAL_TEST_CONFIG = {
  TERRAIN_HEIGHT: TEST_HEIGHT, // 0
  PLAYER_OFFSET: 0.5,
  EXPECTED_PLAYER_HEIGHT: TEST_HEIGHT + 0.5 // 0.5
} as const