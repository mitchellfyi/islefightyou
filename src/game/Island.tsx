'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Island as IslandType, Building, BiomeType, ResourceType } from '@/types/game'

interface IslandProps {
  island: IslandType
  buildings: Building[]
}

// Minecraft-style block system
const BLOCK_SIZE = 1
const ISLAND_SIZE = 32 // 32x32 blocks
const MAX_HEIGHT = 8

export function Island({ island, buildings }: IslandProps) {
  const waterRef = useRef<THREE.Mesh>(null)

  // Generate simple block-based terrain
  const terrainBlocks = useMemo(() => {
    const blocks: JSX.Element[] = []
    const centerX = ISLAND_SIZE / 2
    const centerZ = ISLAND_SIZE / 2
    
    for (let x = 0; x < ISLAND_SIZE; x++) {
      for (let z = 0; z < ISLAND_SIZE; z++) {
        // Calculate distance from center for circular island shape
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(z - centerZ, 2)
        )
        
        // Skip blocks too far from center (creates circular island)
        if (distanceFromCenter > ISLAND_SIZE / 2.5) continue
        
        // Calculate height based on distance from center (higher in middle)
        const normalizedDistance = distanceFromCenter / (ISLAND_SIZE / 2.5)
        const baseHeight = Math.max(1, Math.floor((1 - normalizedDistance) * MAX_HEIGHT))
        
        // Add some noise for variation
        const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2
        const height = Math.max(1, Math.floor(baseHeight + noise))
        
        // Create blocks up to the height
        for (let y = 0; y < height; y++) {
          const blockType = getBlockType(x, z, y, height, distanceFromCenter)
          const color = getBlockColor(blockType)
          
          const positionX = (x - centerX) * BLOCK_SIZE
          const positionZ = (z - centerZ) * BLOCK_SIZE
          const positionY = y * BLOCK_SIZE
          
          blocks.push(
            <TerrainBlock
              key={`${x}-${y}-${z}`}
              position={[positionX, positionY, positionZ]}
              color={color}
              blockType={blockType}
            />
          )
        }
      }
    }
    
    return blocks
  }, [])

  // Animate water
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group>
      {/* Large Sea Base */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <boxGeometry args={[ISLAND_SIZE * 2, 2, ISLAND_SIZE * 2]} />
        <meshLambertMaterial color="#1976d2" />
      </mesh>

      {/* Animated Water Layer */}
      <mesh
        ref={waterRef}
        position={[0, -1, 0]}
        receiveShadow
      >
        <boxGeometry args={[ISLAND_SIZE * 1.5, 0.5, ISLAND_SIZE * 1.5]} />
        <meshLambertMaterial color="#42a5f5" transparent opacity={0.7} />
      </mesh>

      {/* Terrain Blocks */}
      {terrainBlocks}

      {/* Resource Nodes */}
      {island.resourceNodes.map((node) => (
        <ResourceBlock key={node.id} node={node} />
      ))}

      {/* Buildings */}
      {buildings.map((building) => (
        <BuildingBlock key={building.id} building={building} />
      ))}
    </group>
  )
}

// Determine block type based on position and height
function getBlockType(x: number, z: number, y: number, totalHeight: number, distanceFromCenter: number): string {
  // Top block determines biome
  if (y === totalHeight - 1) {
    if (distanceFromCenter < 3) return 'grass' // Center is grassy
    if (distanceFromCenter < 8) return 'forest' // Ring of forest
    if (distanceFromCenter < 12) return 'grass' // More grass
    return 'sand' // Edges are sandy/beach
  }
  
  // Underground blocks
  if (y === 0) return 'bedrock' // Bottom layer
  if (y < totalHeight * 0.3) return 'stone' // Lower layers are stone
  if (y < totalHeight * 0.7) return 'dirt' // Middle layers are dirt
  return 'dirt' // Just below surface
}

// Get color for each block type
function getBlockColor(blockType: string): string {
  switch (blockType) {
    case 'grass': return '#4caf50'
    case 'forest': return '#2e7d32'
    case 'sand': return '#ffc107'
    case 'dirt': return '#8d6e63'
    case 'stone': return '#78909c'
    case 'bedrock': return '#424242'
    default: return '#4caf50'
  }
}

// Individual terrain block component
function TerrainBlock({ position, color, blockType }: {
  position: [number, number, number]
  color: string
  blockType: string
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

// Resource block component
function ResourceBlock({ node }: { node: IslandType['resourceNodes'][0] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing animation
      meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  const getResourceColor = () => {
    switch (node.type) {
      case 'wood': return '#8d6e63'
      case 'stone': return '#78909c'
      case 'metal': return '#607d8b'
      case 'coral': return '#ff7043'
      case 'berries': return '#9c27b0'
      case 'coconut': return '#795548'
      case 'crystal': return '#e1bee7'
      default: return '#795548'
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={[node.position.x, node.position.y + BLOCK_SIZE, node.position.z]}
      castShadow
    >
      <boxGeometry args={[BLOCK_SIZE * 0.8, BLOCK_SIZE * 1.5, BLOCK_SIZE * 0.8]} />
      <meshLambertMaterial color={getResourceColor()} />
    </mesh>
  )
}

// Building block component
function BuildingBlock({ building }: { building: Building }) {
  const getBuildingGeometry = () => {
    const height = getBuildingHeight(building.type)
    const color = getBuildingColor(building.type)
    
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BLOCK_SIZE * 2, height, BLOCK_SIZE * 2]} />
        <meshLambertMaterial color={color} />
      </mesh>
    )
  }

  return (
    <group position={[building.position.x, building.position.y, building.position.z]}>
      {getBuildingGeometry()}
    </group>
  )
}

function getBuildingHeight(type: string): number {
  switch (type) {
    case 'island_core': return BLOCK_SIZE * 4
    case 'house': return BLOCK_SIZE * 3
    case 'workshop': return BLOCK_SIZE * 3
    case 'farm': return BLOCK_SIZE * 1.5
    case 'fishing_hut': return BLOCK_SIZE * 2.5
    case 'turret': return BLOCK_SIZE * 5
    case 'wall': return BLOCK_SIZE * 4
    case 'storage': return BLOCK_SIZE * 2.5
    default: return BLOCK_SIZE * 2
  }
}

function getBuildingColor(type: string): string {
  switch (type) {
    case 'island_core': return '#ffd700'
    case 'house': return '#8d6e63'
    case 'workshop': return '#607d8b'
    case 'farm': return '#8bc34a'
    case 'fishing_hut': return '#42a5f5'
    case 'turret': return '#424242'
    case 'wall': return '#757575'
    case 'storage': return '#5d4037'
    default: return '#795548'
  }
} 