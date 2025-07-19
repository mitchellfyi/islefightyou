'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Island as IslandType, Building, BiomeType, ResourceType } from '@/types/game'
import { terrainNoise, TerrainUtils } from './utils/noise'

interface IslandProps {
  island: IslandType
  buildings: Building[]
}

// Natural terrain system constants
const TERRAIN_SIZE = 32
const TERRAIN_RESOLUTION = 96 // High resolution for smooth natural terrain
const WATER_DEPTH = -5 // Deep water for swimming/diving

export function Island({ island, buildings }: IslandProps) {
  const waterRef = useRef<THREE.Mesh>(null)
  const deepWaterRef = useRef<THREE.Mesh>(null)

  // Validate terrain on mount (development safety check)
  useMemo(() => {
    const isValid = TerrainUtils.validateTerrain()
    if (!isValid) {
      console.warn('Terrain validation failed! Check noise generation.')
    }
  }, [])

  // Generate robust natural terrain using noise system
  const terrainMesh = useMemo(() => {
    try {
      // Create high-resolution geometry for smooth terrain
      const geometry = new THREE.PlaneGeometry(
        TERRAIN_SIZE, 
        TERRAIN_SIZE, 
        TERRAIN_RESOLUTION - 1, 
        TERRAIN_RESOLUTION - 1
      )
      
      // Get vertex data
      const vertices = geometry.attributes.position.array as Float32Array
      const colors = new Float32Array(vertices.length)
      
      // Generate natural terrain heights and colors
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i]
        const z = vertices[i + 2]
        
        // Get natural height from noise system
        const height = terrainNoise.islandHeight(x, z)
        vertices[i + 1] = height // Set Y position
        
        // Get biome and color
        const distanceFromCenter = Math.sqrt(x * x + z * z)
        const biome = terrainNoise.getBiome(x, z, height, distanceFromCenter)
        const color = getBiomeColor(biome, height)
        
        colors[i] = color.r     // Red channel
        colors[i + 1] = color.g // Green channel  
        colors[i + 2] = color.b // Blue channel
      }
      
      // Apply colors and compute normals for lighting
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.computeVertexNormals()
      
      return geometry
    } catch (error) {
      console.error('Failed to generate terrain:', error)
      // Fallback to simple plane if terrain generation fails
      return new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 16, 16)
    }
  }, [])

  // Animate water with realistic wave motion
  useFrame((state) => {
    if (waterRef.current) {
      // Surface water animation
      const time = state.clock.elapsedTime
      waterRef.current.position.y = WATER_DEPTH + 3 + Math.sin(time * 0.5) * 0.3
      waterRef.current.rotation.z = Math.sin(time * 0.3) * 0.02
    }
    
    if (deepWaterRef.current) {
      // Deep water subtle animation
      const time = state.clock.elapsedTime
      deepWaterRef.current.position.y = WATER_DEPTH + Math.sin(time * 0.2) * 0.1
    }
  })

  return (
    <group>
      {/* Deep Ocean Foundation */}
      <mesh 
        ref={deepWaterRef}
        position={[0, WATER_DEPTH - 2, 0]} 
        receiveShadow
      >
        <cylinderGeometry args={[TERRAIN_SIZE * 2, TERRAIN_SIZE * 2, 4, 32]} />
        <meshLambertMaterial color="#003d6b" />
      </mesh>

      {/* Animated Surface Water */}
      <mesh
        ref={waterRef}
        position={[0, WATER_DEPTH + 3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[TERRAIN_SIZE * 2.5, TERRAIN_SIZE * 2.5, 32, 32]} />
        <meshLambertMaterial 
          color="#1976d2" 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Natural Terrain with Noise-Based Generation */}
      <mesh
        geometry={terrainMesh}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshLambertMaterial 
          vertexColors 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Enhanced Natural Resource Nodes */}
      {island.resourceNodes.map((node) => (
        <NaturalResourceNode key={node.id} node={node} />
      ))}

      {/* Natural Buildings */}
      {buildings.map((building) => (
        <NaturalBuilding key={building.id} building={building} />
      ))}
    </group>
  )
}

/**
 * Get natural biome colors that blend beautifully
 */
function getBiomeColor(biome: string, height: number): THREE.Color {
  const heightRatio = Math.max(0, Math.min(1, height / 8))
  
  switch (biome) {
    case 'water':
      return new THREE.Color(0x1976d2)
    case 'beach':
      // Sandy beaches with slight height variation
      return new THREE.Color(0xf4e4bc).lerp(new THREE.Color(0xe6d3a7), heightRatio * 0.3)
    case 'grassland':
      // Rich green grasslands
      return new THREE.Color(0x4a7c59).lerp(new THREE.Color(0x8bc34a), heightRatio * 0.4)
    case 'meadow':
      // Bright meadow greens
      return new THREE.Color(0x66bb6a).lerp(new THREE.Color(0x81c784), heightRatio * 0.3)
    case 'forest':
      // Deep forest greens  
      return new THREE.Color(0x2e7d32).lerp(new THREE.Color(0x4caf50), heightRatio * 0.2)
    case 'mountain':
      // Rocky grays and browns
      return new THREE.Color(0x78909c).lerp(new THREE.Color(0x90a4ae), heightRatio * 0.6)
    default:
      return new THREE.Color(0x4caf50)
  }
}

/**
 * Enhanced natural resource nodes with better positioning
 */
function NaturalResourceNode({ node }: { node: IslandType['resourceNodes'][0] }) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Natural swaying animation
      const time = state.clock.elapsedTime
      meshRef.current.rotation.z = Math.sin(time + node.position.x * 0.1) * 0.03
      
      // Slight breathing animation
      const scale = 1 + Math.sin(time * 2 + node.position.y * 0.1) * 0.02
      meshRef.current.scale.setScalar(scale)
    }
  })

  const getResourceModel = () => {
    switch (node.type) {
      case 'wood':
        return (
          <group>
            {/* Natural tree trunk with taper */}
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.25, 0.4, 2.4, 8]} />
              <meshLambertMaterial color="#6d4c41" />
            </mesh>
            {/* Organic tree crown */}
            <mesh position={[0, 2.8, 0]}>
              <sphereGeometry args={[1.4, 6, 4]} />
              <meshLambertMaterial color="#2e7d32" />
            </mesh>
            {/* Additional foliage */}
            <mesh position={[0.3, 2.4, 0.3]}>
              <sphereGeometry args={[0.7, 5, 3]} />
              <meshLambertMaterial color="#388e3c" />
            </mesh>
          </group>
        )
      case 'stone':
        return (
          <group>
            {/* Main rock */}
            <mesh>
              <dodecahedronGeometry args={[0.9, 0]} />
              <meshLambertMaterial color="#78909c" />
            </mesh>
            {/* Additional rock chunks */}
            <mesh position={[0.4, 0, 0.2]}>
              <dodecahedronGeometry args={[0.4, 0]} />
              <meshLambertMaterial color="#90a4ae" />
            </mesh>
          </group>
        )
      case 'metal':
        return (
          <group>
            {/* Metallic crystal formation */}
            <mesh>
              <octahedronGeometry args={[0.7, 1]} />
              <meshLambertMaterial color="#607d8b" />
            </mesh>
            <mesh position={[0.2, 0.5, -0.2]}>
              <octahedronGeometry args={[0.4, 1]} />
              <meshLambertMaterial color="#78909c" />
            </mesh>
          </group>
        )
      case 'coral':
        return (
          <group>
            {/* Main coral formation */}
            <mesh position={[0, 0.4, 0]}>
              <coneGeometry args={[0.5, 1, 6]} />
              <meshLambertMaterial color="#ff7043" />
            </mesh>
            {/* Secondary coral branch */}
            <mesh position={[0.3, 0.5, 0.2]}>
              <coneGeometry args={[0.3, 0.7, 5]} />
              <meshLambertMaterial color="#ff8a65" />
            </mesh>
            {/* Small coral polyps */}
            <mesh position={[-0.2, 0.3, 0.1]}>
              <sphereGeometry args={[0.15, 4, 3]} />
              <meshLambertMaterial color="#ffab91" />
            </mesh>
          </group>
        )
      case 'berries':
        return (
          <group>
            {/* Berry bush */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.9, 6, 4]} />
              <meshLambertMaterial color="#4caf50" />
            </mesh>
            {/* Berry clusters */}
            <mesh position={[0.4, 0.7, 0.2]}>
              <sphereGeometry args={[0.12, 4, 3]} />
              <meshLambertMaterial color="#9c27b0" />
            </mesh>
            <mesh position={[-0.3, 0.6, 0.4]}>
              <sphereGeometry args={[0.1, 4, 3]} />
              <meshLambertMaterial color="#ab47bc" />
            </mesh>
          </group>
        )
      case 'coconut':
        return (
          <group>
            {/* Palm trunk with natural curve */}
            <mesh position={[0, 2, 0]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.18, 0.25, 4, 8]} />
              <meshLambertMaterial color="#8d6e63" />
            </mesh>
            {/* Palm fronds */}
            <mesh position={[0.3, 4.2, 0]}>
              <coneGeometry args={[1.2, 0.6, 8]} />
              <meshLambertMaterial color="#2e7d32" />
            </mesh>
            {/* Coconuts */}
            <mesh position={[0.1, 3.5, 0.2]}>
              <sphereGeometry args={[0.2, 6, 4]} />
              <meshLambertMaterial color="#6d4c41" />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh>
            <sphereGeometry args={[0.6, 8, 6]} />
            <meshLambertMaterial color="#795548" />
          </mesh>
        )
    }
  }

  // Position resource on terrain surface
  const terrainHeight = terrainNoise.islandHeight(node.position.x, node.position.z)
  const finalPosition: [number, number, number] = [
    node.position.x,
    Math.max(0, terrainHeight),
    node.position.z
  ]

  return (
    <group 
      ref={meshRef}
      position={finalPosition}
      castShadow
    >
      {getResourceModel()}
    </group>
  )
}

/**
 * Enhanced natural buildings
 */
function NaturalBuilding({ building }: { building: Building }) {
  const getBuildingModel = () => {
    const height = getBuildingHeight(building.type)
    
    switch (building.type) {
      case 'house':
        return (
          <group>
            {/* House foundation */}
            <mesh position={[0, height/2, 0]}>
              <boxGeometry args={[2.2, height, 2.2]} />
              <meshLambertMaterial color="#8d6e63" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, height + 0.4, 0]}>
              <coneGeometry args={[1.7, 1, 4]} />
              <meshLambertMaterial color="#5d4037" />
            </mesh>
            {/* Door */}
            <mesh position={[0, height/3, 1.15]}>
              <boxGeometry args={[0.6, height/2, 0.1]} />
              <meshLambertMaterial color="#3e2723" />
            </mesh>
          </group>
        )
      case 'island_core':
        return (
          <group>
            {/* Glowing crystal core */}
            <mesh position={[0, height/2, 0]}>
              <octahedronGeometry args={[1.8, 1]} />
              <meshLambertMaterial 
                color="#ffd700" 
                emissive="#ffeb3b" 
                emissiveIntensity={0.3} 
              />
            </mesh>
            {/* Energy rings */}
            <mesh position={[0, height/2, 0]} rotation={[Math.PI/4, Math.PI/4, 0]}>
              <torusGeometry args={[2.5, 0.1, 8, 16]} />
              <meshLambertMaterial 
                color="#fff59d" 
                emissive="#ffeb3b" 
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        )
      case 'workshop':
        return (
          <group>
            {/* Main structure */}
            <mesh position={[0, height/2, 0]}>
              <boxGeometry args={[2.5, height, 2]} />
              <meshLambertMaterial color="#607d8b" />
            </mesh>
            {/* Chimney */}
            <mesh position={[0.8, height + 0.5, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
              <meshLambertMaterial color="#424242" />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh position={[0, height/2, 0]}>
            <boxGeometry args={[1.8, height, 1.8]} />
            <meshLambertMaterial color={getBuildingColor(building.type)} />
          </mesh>
        )
    }
  }

  // Position building on terrain surface  
  const terrainHeight = terrainNoise.islandHeight(building.position.x, building.position.z)
  const finalPosition: [number, number, number] = [
    building.position.x,
    Math.max(0, terrainHeight),
    building.position.z
  ]

  return (
    <group position={finalPosition} castShadow>
      {getBuildingModel()}
    </group>
  )
}

function getBuildingHeight(type: string): number {
  switch (type) {
    case 'island_core': return 4.5
    case 'house': return 2.8
    case 'workshop': return 3.2
    case 'farm': return 1.8
    case 'fishing_hut': return 2.2
    case 'turret': return 4.5
    case 'wall': return 3.5
    case 'storage': return 2.5
    default: return 2.2
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

/**
 * Updated terrain height function using new noise system
 * This is used by the character movement system for terrain following
 */
export function getTerrainHeightAt(x: number, z: number): number {
  try {
    return terrainNoise.islandHeight(x, z)
  } catch (error) {
    console.error('Failed to get terrain height:', error)
    // Fallback to safe water level
    return WATER_DEPTH
  }
} 