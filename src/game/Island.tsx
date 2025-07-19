'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Island as IslandType, Building, BiomeType, ResourceType } from '@/types/game'

interface IslandProps {
  island: IslandType
  buildings: Building[]
}

// Natural terrain system
const TERRAIN_SIZE = 32
const TERRAIN_RESOLUTION = 64 // Higher resolution for smoother terrain
const MAX_HEIGHT = 8

export function Island({ island, buildings }: IslandProps) {
  const waterRef = useRef<THREE.Mesh>(null)

  // Generate smooth natural terrain using heightmap
  const terrainMesh = useMemo(() => {
    // Create geometry
    const geometry = new THREE.PlaneGeometry(
      TERRAIN_SIZE, 
      TERRAIN_SIZE, 
      TERRAIN_RESOLUTION - 1, 
      TERRAIN_RESOLUTION - 1
    )
    
    // Create heightmap
    const vertices = geometry.attributes.position.array as Float32Array
    const uvs = geometry.attributes.uv.array as Float32Array
    const colors = new Float32Array(vertices.length)
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const z = vertices[i + 2]
      
      // Calculate distance from center for circular island
      const distanceFromCenter = Math.sqrt(x * x + z * z)
      const maxRadius = TERRAIN_SIZE / 2.2
      
      // Height based on distance (higher in center, lower at edges)
      let height = 0
      if (distanceFromCenter < maxRadius) {
        const normalizedDistance = distanceFromCenter / maxRadius
        const baseHeight = (1 - normalizedDistance) * MAX_HEIGHT
        
        // Add noise for natural variation
        const noise1 = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2
        const noise2 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8
        const noise3 = Math.sin(x * 0.7) * Math.cos(z * 0.7) * 0.3
        
        height = Math.max(0, baseHeight + noise1 + noise2 + noise3)
        
        // Smooth falloff at edges
        const falloff = Math.max(0, 1 - Math.pow(normalizedDistance, 3))
        height *= falloff
      }
      
      vertices[i + 1] = height // Y position
      
      // Add vertex colors based on height and position
      const heightRatio = height / MAX_HEIGHT
      const biome = getBiomeAtPosition(x, z, height, distanceFromCenter)
      const color = getBiomeColor(biome, heightRatio)
      
      colors[i] = color.r     // Red
      colors[i + 1] = color.g // Green
      colors[i + 2] = color.b // Blue
    }
    
    // Add colors to geometry
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    
    return geometry
  }, [])

  // Animate water
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      waterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.01
    }
  })

  return (
    <group>
      {/* Large Ocean Base */}
      <mesh position={[0, -3, 0]} receiveShadow>
        <cylinderGeometry args={[TERRAIN_SIZE * 1.5, TERRAIN_SIZE * 1.5, 3, 32]} />
        <meshLambertMaterial color="#0d47a1" />
      </mesh>

      {/* Animated Water */}
      <mesh
        ref={waterRef}
        position={[0, -1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[TERRAIN_SIZE * 1.8, TERRAIN_SIZE * 1.8, 16, 16]} />
        <meshLambertMaterial 
          color="#1976d2" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Natural Terrain */}
      <mesh
        geometry={terrainMesh}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>

      {/* Resource Nodes - Natural looking */}
      {island.resourceNodes.map((node) => (
        <NaturalResourceNode key={node.id} node={node} />
      ))}

      {/* Buildings */}
      {buildings.map((building) => (
        <NaturalBuilding key={building.id} building={building} />
      ))}
    </group>
  )
}

// Determine biome based on position and height
function getBiomeAtPosition(x: number, z: number, height: number, distanceFromCenter: number): string {
  if (height < 0.5) return 'water'
  if (distanceFromCenter > 12) return 'beach'
  if (height > 6) return 'mountain'
  if (distanceFromCenter < 4) return 'meadow'
  if (Math.random() > 0.7) return 'forest'
  return 'grassland'
}

// Get natural colors for different biomes
function getBiomeColor(biome: string, heightRatio: number): THREE.Color {
  switch (biome) {
    case 'water':
      return new THREE.Color(0x1976d2)
    case 'beach':
      return new THREE.Color(0xf4e4bc)
    case 'grassland':
      return new THREE.Color(0x4a7c59).lerp(new THREE.Color(0x8bc34a), heightRatio * 0.5)
    case 'meadow':
      return new THREE.Color(0x66bb6a)
    case 'forest':
      return new THREE.Color(0x2e7d32).lerp(new THREE.Color(0x4caf50), heightRatio * 0.3)
    case 'mountain':
      return new THREE.Color(0x78909c).lerp(new THREE.Color(0x90a4ae), heightRatio)
    default:
      return new THREE.Color(0x4caf50)
  }
}

// Natural resource node component
function NaturalResourceNode({ node }: { node: IslandType['resourceNodes'][0] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + node.position.x) * 0.05
    }
  })

  const getResourceModel = () => {
    switch (node.type) {
      case 'wood':
        return (
          <group>
            {/* Tree trunk */}
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
              <meshLambertMaterial color="#8d4e85" />
            </mesh>
            {/* Tree crown */}
            <mesh position={[0, 2.5, 0]}>
              <sphereGeometry args={[1.2, 8, 6]} />
              <meshLambertMaterial color="#2e7d32" />
            </mesh>
          </group>
        )
      case 'stone':
        return (
          <mesh>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshLambertMaterial color="#78909c" />
          </mesh>
        )
      case 'metal':
        return (
          <mesh>
            <octahedronGeometry args={[0.6, 1]} />
            <meshLambertMaterial color="#607d8b" />
          </mesh>
        )
      case 'coral':
        return (
          <group>
            <mesh position={[0, 0.3, 0]}>
              <coneGeometry args={[0.4, 0.8, 6]} />
              <meshLambertMaterial color="#ff7043" />
            </mesh>
            <mesh position={[0.2, 0.4, 0.2]}>
              <coneGeometry args={[0.3, 0.6, 5]} />
              <meshLambertMaterial color="#ff8a65" />
            </mesh>
          </group>
        )
      case 'berries':
        return (
          <group>
            {/* Bush */}
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.8, 6, 4]} />
              <meshLambertMaterial color="#4caf50" />
            </mesh>
            {/* Berries */}
            <mesh position={[0.3, 0.6, 0.3]}>
              <sphereGeometry args={[0.1, 4, 3]} />
              <meshLambertMaterial color="#9c27b0" />
            </mesh>
          </group>
        )
      case 'coconut':
        return (
          <group>
            {/* Palm trunk */}
            <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0.1]}>
              <cylinderGeometry args={[0.2, 0.3, 3, 6]} />
              <meshLambertMaterial color="#8d6e63" />
            </mesh>
            {/* Palm leaves */}
            <mesh position={[0, 3, 0]}>
              <coneGeometry args={[1, 0.5, 8]} />
              <meshLambertMaterial color="#2e7d32" />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh>
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshLambertMaterial color="#795548" />
          </mesh>
        )
    }
  }

  return (
    <group 
      ref={meshRef}
      position={[node.position.x, node.position.y, node.position.z]}
      castShadow
    >
      {getResourceModel()}
    </group>
  )
}

// Natural building component
function NaturalBuilding({ building }: { building: Building }) {
  const getBuildingModel = () => {
    const height = getBuildingHeight(building.type)
    
    switch (building.type) {
      case 'house':
        return (
          <group>
            {/* House base */}
            <mesh position={[0, height/2, 0]}>
              <boxGeometry args={[2, height, 2]} />
              <meshLambertMaterial color="#8d6e63" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, height + 0.3, 0]}>
              <coneGeometry args={[1.5, 0.8, 4]} />
              <meshLambertMaterial color="#5d4037" />
            </mesh>
          </group>
        )
      case 'island_core':
        return (
          <group>
            {/* Core crystal */}
            <mesh position={[0, height/2, 0]}>
              <octahedronGeometry args={[1.5, 1]} />
              <meshLambertMaterial color="#ffd700" emissive="#ffeb3b" emissiveIntensity={0.2} />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh position={[0, height/2, 0]}>
            <boxGeometry args={[1.5, height, 1.5]} />
            <meshLambertMaterial color={getBuildingColor(building.type)} />
          </mesh>
        )
    }
  }

  return (
    <group position={[building.position.x, building.position.y, building.position.z]} castShadow>
      {getBuildingModel()}
    </group>
  )
}

function getBuildingHeight(type: string): number {
  switch (type) {
    case 'island_core': return 4
    case 'house': return 2.5
    case 'workshop': return 2.5
    case 'farm': return 1.5
    case 'fishing_hut': return 2
    case 'turret': return 4
    case 'wall': return 3
    case 'storage': return 2
    default: return 2
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

// Export height calculation function for terrain following
export function getTerrainHeightAt(x: number, z: number): number {
  const distanceFromCenter = Math.sqrt(x * x + z * z)
  const maxRadius = TERRAIN_SIZE / 2.2
  
  if (distanceFromCenter >= maxRadius) return -1.5 // Water level
  
  const normalizedDistance = distanceFromCenter / maxRadius
  const baseHeight = (1 - normalizedDistance) * MAX_HEIGHT
  
  // Same noise calculation as terrain generation
  const noise1 = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2
  const noise2 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8
  const noise3 = Math.sin(x * 0.7) * Math.cos(z * 0.7) * 0.3
  
  let height = Math.max(0, baseHeight + noise1 + noise2 + noise3)
  
  // Smooth falloff at edges
  const falloff = Math.max(0, 1 - Math.pow(normalizedDistance, 3))
  height *= falloff
  
  return height
} 