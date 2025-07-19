'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Mesh, PlaneGeometry, MeshLambertMaterial, Color } from 'three'
import { Island as IslandType, Building, BiomeType } from '@/types/game'

interface IslandProps {
  island: IslandType
  buildings: Building[]
}

export function Island({ island, buildings }: IslandProps) {
  const meshRef = useRef<Mesh>(null)

  // Helper function to get biome colors - defined before usage
  const getBiomeColor = (biome: BiomeType): Color => {
    switch (biome) {
      case BiomeType.GRASSLAND:
        return new Color(0x7cb342)
      case BiomeType.FOREST:
        return new Color(0x4caf50)
      case BiomeType.DESERT:
        return new Color(0xffb74d)
      case BiomeType.MOUNTAIN:
        return new Color(0x78909c)
      case BiomeType.BEACH:
        return new Color(0xffc107)
      case BiomeType.SWAMP:
        return new Color(0x689f38)
      default:
        return new Color(0x7cb342)
    }
  }

  // Generate terrain geometry from height map
  const terrainGeometry = useMemo(() => {
    const geometry = new PlaneGeometry(
      island.size,
      island.size,
      island.heightMap.length - 1,
      island.heightMap[0].length - 1
    )

    const vertices = geometry.attributes.position.array as Float32Array
    const colors = new Float32Array(vertices.length)

    // Apply height map and biome colors
    for (let i = 0; i < vertices.length; i += 3) {
      const x = Math.floor((vertices[i] + island.size / 2) / island.size * island.heightMap.length)
      const z = Math.floor((vertices[i + 2] + island.size / 2) / island.size * island.heightMap[0].length)
      
      const clampedX = Math.max(0, Math.min(island.heightMap.length - 1, x))
      const clampedZ = Math.max(0, Math.min(island.heightMap[0].length - 1, z))
      
      // Set height
      vertices[i + 1] = island.heightMap[clampedX][clampedZ] * 10
      
      // Set biome color
      const biome = island.biomeMap[clampedX][clampedZ]
      const color = getBiomeColor(biome)
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    
    return geometry
  }, [island, getBiomeColor])

  return (
    <group>
      {/* Terrain Mesh */}
      <mesh
        ref={meshRef}
        geometry={terrainGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshLambertMaterial vertexColors={true} />
      </mesh>

      {/* Water around the island */}
      <mesh
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[island.size * 2, island.size * 2]} />
        <meshLambertMaterial color="#42a5f5" transparent opacity={0.8} />
      </mesh>

      {/* Resource Nodes */}
      {island.resourceNodes.map((node) => (
        <ResourceNode key={node.id} node={node} />
      ))}

      {/* Buildings */}
      {buildings.map((building) => (
        <BuildingMesh key={building.id} building={building} />
      ))}
    </group>
  )
}

// Resource Node Component
function ResourceNode({ node }: { node: IslandType['resourceNodes'][0] }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing animation
      meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  const getResourceColor = () => {
    switch (node.type) {
      case 'wood':
        return '#8d6e63'
      case 'stone':
        return '#78909c'
      case 'metal':
        return '#607d8b'
      case 'coral':
        return '#ff7043'
      case 'berries':
        return '#9c27b0'
      case 'coconut':
        return '#795548'
      case 'crystal':
        return '#e1bee7'
      default:
        return '#795548'
    }
  }

  const getResourceGeometry = () => {
    switch (node.type) {
      case 'wood':
        return <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
      case 'stone':
        return <dodecahedronGeometry args={[0.8]} />
      case 'metal':
        return <octahedronGeometry args={[0.6]} />
      case 'coral':
        return <icosahedronGeometry args={[0.7]} />
      case 'berries':
        return <sphereGeometry args={[0.4, 8, 6]} />
      case 'coconut':
        return <sphereGeometry args={[0.5, 8, 6]} />
      case 'crystal':
        return <coneGeometry args={[0.4, 1.5, 6]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={[node.position.x, node.position.y, node.position.z]}
      castShadow
    >
      {getResourceGeometry()}
      <meshLambertMaterial color={getResourceColor()} />
    </mesh>
  )
}

// Building Component
function BuildingMesh({ building }: { building: Building }) {
  const getBuildingGeometry = () => {
    switch (building.type) {
      case 'island_core':
        return (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[2, 2, 3, 8]} />
              <meshLambertMaterial color="#ffd700" />
            </mesh>
            <mesh position={[0, 2, 0]} castShadow>
              <octahedronGeometry args={[1]} />
              <meshLambertMaterial color="#ffff00" />
            </mesh>
          </group>
        )
      case 'house':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[2, 2, 2]} />
              <meshLambertMaterial color="#8d6e63" />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow>
              <coneGeometry args={[1.5, 1, 4]} />
              <meshLambertMaterial color="#d32f2f" />
            </mesh>
          </group>
        )
      case 'workshop':
        return (
          <mesh castShadow>
            <boxGeometry args={[3, 2.5, 3]} />
            <meshLambertMaterial color="#607d8b" />
          </mesh>
        )
      case 'farm':
        return (
          <mesh castShadow>
            <boxGeometry args={[4, 1, 4]} />
            <meshLambertMaterial color="#8bc34a" />
          </mesh>
        )
      case 'fishing_hut':
        return (
          <mesh castShadow>
            <boxGeometry args={[2, 2, 3]} />
            <meshLambertMaterial color="#42a5f5" />
          </mesh>
        )
      case 'turret':
        return (
          <mesh castShadow>
            <cylinderGeometry args={[1, 1.5, 4, 8]} />
            <meshLambertMaterial color="#424242" />
          </mesh>
        )
      case 'wall':
        return (
          <mesh castShadow>
            <boxGeometry args={[1, 3, 0.5]} />
            <meshLambertMaterial color="#757575" />
          </mesh>
        )
      case 'storage':
        return (
          <mesh castShadow>
            <boxGeometry args={[3, 2, 3]} />
            <meshLambertMaterial color="#5d4037" />
          </mesh>
        )
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshLambertMaterial color="#795548" />
          </mesh>
        )
    }
  }

  return (
    <group
      position={[building.position.x, building.position.y, building.position.z]}
      rotation={[building.rotation.x, building.rotation.y, building.rotation.z]}
    >
      {getBuildingGeometry()}
    </group>
  )
} 