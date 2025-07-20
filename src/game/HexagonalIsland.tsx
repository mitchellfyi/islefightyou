'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Island as IslandType, Building, BiomeType, ResourceType } from '@/types/game'
import { hexagonalTerrain } from './utils/hexagonalTerrain'

interface HexagonalIslandProps {
  island: IslandType
  buildings: Building[]
}

export function HexagonalIsland({ island, buildings }: HexagonalIslandProps) {
  const groupRef = useRef<THREE.Group>(null)
  const waterRef = useRef<THREE.Mesh>(null)

  // Generate hexagonal terrain data
  const hexData = useMemo(() => {
    const terrain = new (hexagonalTerrain.constructor as any)(island.seed, 1.5, 10)
    return terrain.generateHexGrid()
  }, [island.seed])

  // Animate water
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 3
    }
  })

  // Get biome color with height variation
  const getBiomeColor = (biome: string, height: number): THREE.Color => {
    let baseColor: string
    
    switch (biome) {
      case 'water':
        baseColor = '#006994'
        break
      case 'beach':
        baseColor = '#f4d03f'
        break
      case 'grassland':
        baseColor = '#27ae60'
        break
      case 'forest':
        baseColor = '#229954'
        break
      case 'mountain':
        baseColor = '#7f8c8d'
        break
      case 'meadow':
        baseColor = '#58d68d'
        break
      default:
        baseColor = '#95a5a6'
    }
    
    // Add height-based color variation
    const color = new THREE.Color(baseColor)
    const heightFactor = Math.max(0.7, Math.min(1.3, 1 + (height - 2) * 0.1))
    color.multiplyScalar(heightFactor)
    
    return color
  }

  return (
    <group ref={groupRef}>
      {/* Deep Ocean Base */}
      <mesh position={[0, -5, 0]} receiveShadow>
        <cylinderGeometry args={[50, 50, 10, 32]} />
        <meshLambertMaterial color="#003366" />
      </mesh>

      {/* Animated Surface Water */}
      <mesh ref={waterRef} position={[0, -3, 0]} receiveShadow>
        <cylinderGeometry args={[50, 50, 0.5, 32]} />
        <meshLambertMaterial 
          color="#006994" 
          transparent 
          opacity={0.7}
        />
      </mesh>

      {/* Hexagonal Terrain Tiles */}
      {hexData.map((hex: any, index: number) => (
        <HexTile 
          key={index}
          center={hex.center}
          height={hex.height}
          biome={hex.biome}
          vertices={hex.vertices}
          getBiomeColor={getBiomeColor}
        />
      ))}
      
      {/* Hex grid overlay for better visibility */}
      {hexData.map((hex: any, index: number) => (
        <HexGridOverlay 
          key={`overlay-${index}`}
          center={hex.center}
          vertices={hex.vertices}
          height={hex.height}
        />
      ))}

      {/* Resource Nodes */}
      {island.resourceNodes?.map((node) => (
        <NaturalResourceNode key={node.id} node={node} />
      )) || []}

      {/* Buildings */}
      {buildings.map((building) => (
        <NaturalBuilding key={building.id} building={building} />
      ))}
    </group>
  )
}

// Individual Hexagonal Tile Component
function HexTile({ 
  center, 
  height, 
  biome, 
  vertices, 
  getBiomeColor 
}: {
  center: { x: number, z: number }
  height: number
  biome: string
  vertices: Array<{ x: number, z: number }>
  getBiomeColor: (biome: string, height: number) => THREE.Color
}) {
  const meshRef = useRef<THREE.Group>(null)

  // Create hexagonal geometry
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Start at first vertex
    shape.moveTo(vertices[0].x - center.x, vertices[0].z - center.z)
    
    // Add remaining vertices
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo(vertices[i].x - center.x, vertices[i].z - center.z)
    }
    
    // Close the shape
    shape.closePath()
    
    // Extrude the shape to create 3D hex
    const extrudeSettings = {
      depth: Math.max(0.1, height + 2), // Minimum height for water
      bevelEnabled: false
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [vertices, center, height])

  return (
    <group ref={meshRef} position={[center.x, (height + 2) / 2, center.z]}>
      {/* Main hex tile */}
      <mesh castShadow receiveShadow>
        <primitive object={geometry} />
        <meshLambertMaterial 
          color={getBiomeColor(biome, height)}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Natural Resource Node Component
function NaturalResourceNode({ node }: { node: IslandType['resourceNodes'][0] }) {
  const meshRef = useRef<THREE.Group>(null)

  const getResourceModel = () => {
    switch (node.type) {
      case 'wood':
        return (
          <group>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
              <meshLambertMaterial color="#8d6e63" />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <sphereGeometry args={[1.2, 8, 6]} />
              <meshLambertMaterial color="#2e7d32" />
            </mesh>
          </group>
        )
      case 'stone':
        return (
          <group>
            {/* Rock formation */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <dodecahedronGeometry args={[0.8, 0]} />
              <meshLambertMaterial color="#7f8c8d" />
            </mesh>
            <mesh position={[0.3, 0.8, 0.2]} castShadow>
              <dodecahedronGeometry args={[0.4, 0]} />
              <meshLambertMaterial color="#95a5a6" />
            </mesh>
          </group>
        )
      case 'berries':
        return (
          <group>
            {/* Berry bush */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.8, 6, 4]} />
              <meshLambertMaterial color="#27ae60" />
            </mesh>
            {/* Berry clusters */}
            <mesh position={[0.4, 0.7, 0.2]} castShadow>
              <sphereGeometry args={[0.12, 4, 3]} />
              <meshLambertMaterial color="#9c27b0" />
            </mesh>
            <mesh position={[-0.3, 0.6, 0.4]} castShadow>
              <sphereGeometry args={[0.1, 4, 3]} />
              <meshLambertMaterial color="#ab47bc" />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh castShadow>
            <sphereGeometry args={[0.6, 8, 6]} />
            <meshLambertMaterial color="#795548" />
          </mesh>
        )
    }
  }

  return (
    <group 
      ref={meshRef}
      position={[node.position.x, Math.max(0, node.position.y), node.position.z]}
      castShadow
    >
      {getResourceModel()}
    </group>
  )
}

// Building Component
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

  return (
    <group 
      position={[building.position.x, building.position.y, building.position.z]}
      castShadow
    >
      {getBuildingModel()}
    </group>
  )
}

// Hex Grid Overlay Component for better visibility
function HexGridOverlay({ 
  center, 
  vertices, 
  height 
}: {
  center: { x: number, z: number }
  vertices: Array<{ x: number, z: number }>
  height: number
}) {
  const lineRef = useRef<THREE.LineSegments>(null)

  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    
    // Create hex outline at the top of each tile
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i]
      points.push(new THREE.Vector3(
        vertex.x - center.x,
        height + 2.1, // Slightly above the tile
        vertex.z - center.z
      ))
    }
    
    // Close the hexagon
    points.push(new THREE.Vector3(
      vertices[0].x - center.x,
      height + 2.1,
      vertices[0].z - center.z
    ))
    
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [vertices, center, height])

  return (
    <lineSegments ref={lineRef} position={[center.x, 0, center.z]}>
      <primitive object={lineGeometry} />
      <lineBasicMaterial 
        color="#333333" 
        linewidth={1}
        transparent
        opacity={0.6}
      />
    </lineSegments>
  )
}

// Utility functions
function getBuildingHeight(type: string): number {
  switch (type) {
    case 'house': return 2.5
    case 'workshop': return 3
    case 'island_core': return 4
    default: return 2
  }
}

function getBuildingColor(type: string): string {
  switch (type) {
    case 'house': return '#8d6e63'
    case 'workshop': return '#607d8b'
    case 'island_core': return '#ffd700'
    default: return '#95a5a6'
  }
} 