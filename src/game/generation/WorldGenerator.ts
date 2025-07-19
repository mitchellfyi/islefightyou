import { createNoise2D } from 'simplex-noise'
import { v4 as uuidv4 } from 'uuid'
import { 
  Island, 
  BiomeType, 
  ResourceType, 
  ResourceNode, 
  Position 
} from '@/types/game'

interface GenerationOptions {
  seed: number
  size: number
  playerId: string
  name: string
}

export class WorldGenerator {
  private noise2D: (x: number, y: number) => number
  private biomeNoise: (x: number, y: number) => number
  private resourceNoise: (x: number, y: number) => number

  constructor(seed: number) {
    // Create multiple noise functions for different purposes
    this.noise2D = createNoise2D(() => seed)
    this.biomeNoise = createNoise2D(() => seed * 2 + 1)
    this.resourceNoise = createNoise2D(() => seed * 3 + 2)
  }

  generateIsland(options: GenerationOptions): Island {
    const { seed, size, playerId, name } = options
    
    // Generate height map
    const heightMap = this.generateHeightMap(size)
    
    // Generate biome map based on height and noise
    const biomeMap = this.generateBiomeMap(size, heightMap)
    
    // Generate resource nodes
    const resourceNodes = this.generateResourceNodes(size, heightMap, biomeMap)

    return {
      id: uuidv4(),
      playerId,
      name,
      seed,
      size,
      heightMap,
      biomeMap,
      resourceNodes,
      buildings: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private generateHeightMap(size: number): number[][] {
    const heightMap: number[][] = []
    const scale = 0.05 // Controls terrain frequency
    const amplitude = 1.0 // Controls terrain height
    
    for (let x = 0; x < size; x++) {
      heightMap[x] = []
      for (let z = 0; z < size; z++) {
        // Use multiple octaves for more realistic terrain
        let height = 0
        let currentAmplitude = amplitude
        let currentScale = scale
        
        // Add multiple noise layers (octaves)
        for (let octave = 0; octave < 4; octave++) {
          height += this.noise2D(x * currentScale, z * currentScale) * currentAmplitude
          currentAmplitude *= 0.5 // Each octave has half the amplitude
          currentScale *= 2 // Each octave has double the frequency
        }
        
        // Normalize height to 0-1 range and apply island mask
        height = (height + 1) / 2 // Convert from -1,1 to 0,1
        
        // Apply circular island mask
        const centerX = size / 2
        const centerZ = size / 2
        const maxDistance = size / 2.5
        const distance = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2)
        const islandMask = Math.max(0, 1 - (distance / maxDistance))
        
        height *= islandMask
        heightMap[x][z] = Math.max(0, height)
      }
    }
    
    return heightMap
  }

  private generateBiomeMap(size: number, heightMap: number[][]): BiomeType[][] {
    const biomeMap: BiomeType[][] = []
    
    for (let x = 0; x < size; x++) {
      biomeMap[x] = []
      for (let z = 0; z < size; z++) {
        const height = heightMap[x][z]
        const temperature = (this.biomeNoise(x * 0.02, z * 0.02) + 1) / 2
        const moisture = (this.biomeNoise(x * 0.03 + 1000, z * 0.03 + 1000) + 1) / 2
        
        biomeMap[x][z] = this.determineBiome(height, temperature, moisture)
      }
    }
    
    return biomeMap
  }

  private determineBiome(height: number, temperature: number, moisture: number): BiomeType {
    // Water level
    if (height < 0.1) {
      return BiomeType.BEACH
    }
    
    // Beach/shore areas
    if (height < 0.2) {
      return BiomeType.BEACH
    }
    
    // Mountain biomes
    if (height > 0.7) {
      return BiomeType.MOUNTAIN
    }
    
    // Determine biome based on temperature and moisture
    if (temperature < 0.3) {
      return BiomeType.MOUNTAIN
    } else if (temperature > 0.7) {
      if (moisture < 0.3) {
        return BiomeType.DESERT
      } else {
        return moisture > 0.7 ? BiomeType.SWAMP : BiomeType.GRASSLAND
      }
    } else {
      if (moisture > 0.6) {
        return BiomeType.FOREST
      } else if (moisture < 0.3) {
        return BiomeType.DESERT
      } else {
        return BiomeType.GRASSLAND
      }
    }
  }

  private generateResourceNodes(
    size: number, 
    heightMap: number[][], 
    biomeMap: BiomeType[][]
  ): ResourceNode[] {
    const resourceNodes: ResourceNode[] = []
    const resourceDensity = 0.05 // 5% chance per tile
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const height = heightMap[x][z]
        const biome = biomeMap[x][z]
        
        // Skip water areas
        if (height < 0.1) continue
        
        // Use resource noise to determine if there should be a resource here
        const resourceChance = (this.resourceNoise(x * 0.1, z * 0.1) + 1) / 2
        
        if (resourceChance > (1 - resourceDensity)) {
          const resourceType = this.determineResourceType(biome, height, resourceChance)
          
          if (resourceType) {
            resourceNodes.push({
              id: uuidv4(),
              type: resourceType,
              position: {
                x: x - size / 2,
                y: height * 10, // Scale height for 3D positioning
                z: z - size / 2
              },
              quantity: this.getResourceQuantity(resourceType),
              maxQuantity: this.getResourceQuantity(resourceType),
              respawnRate: this.getResourceRespawnRate(resourceType)
            })
          }
        }
      }
    }
    
    return resourceNodes
  }

  private determineResourceType(
    biome: BiomeType, 
    height: number, 
    resourceNoise: number
  ): ResourceType | null {
    // Different biomes have different resource distributions
    switch (biome) {
      case BiomeType.FOREST:
        return resourceNoise > 0.8 ? ResourceType.WOOD : 
               resourceNoise > 0.6 ? ResourceType.FOOD : null
               
      case BiomeType.MOUNTAIN:
        return resourceNoise > 0.7 ? ResourceType.STONE :
               resourceNoise > 0.9 ? ResourceType.METAL :
               resourceNoise > 0.95 ? ResourceType.CRYSTAL : null
               
      case BiomeType.DESERT:
        return resourceNoise > 0.8 ? ResourceType.STONE :
               resourceNoise > 0.95 ? ResourceType.CRYSTAL : null
               
      case BiomeType.GRASSLAND:
        return resourceNoise > 0.7 ? ResourceType.FOOD :
               resourceNoise > 0.9 ? ResourceType.WOOD : null
               
      case BiomeType.SWAMP:
        return resourceNoise > 0.8 ? ResourceType.WATER :
               resourceNoise > 0.9 ? ResourceType.COAL : null
               
      case BiomeType.BEACH:
        return resourceNoise > 0.9 ? ResourceType.STONE : null
        
      default:
        return null
    }
  }

  private getResourceQuantity(type: ResourceType): number {
    switch (type) {
      case ResourceType.WOOD:
        return Math.floor(Math.random() * 10) + 5 // 5-15
      case ResourceType.STONE:
        return Math.floor(Math.random() * 8) + 3 // 3-11
      case ResourceType.METAL:
        return Math.floor(Math.random() * 5) + 2 // 2-7
      case ResourceType.FOOD:
        return Math.floor(Math.random() * 6) + 3 // 3-9
      case ResourceType.WATER:
        return Math.floor(Math.random() * 12) + 8 // 8-20
      case ResourceType.COAL:
        return Math.floor(Math.random() * 6) + 2 // 2-8
      case ResourceType.CRYSTAL:
        return Math.floor(Math.random() * 3) + 1 // 1-4
      default:
        return 5
    }
  }

  private getResourceRespawnRate(type: ResourceType): number {
    // Respawn rate in minutes
    switch (type) {
      case ResourceType.WOOD:
        return 10
      case ResourceType.STONE:
        return 15
      case ResourceType.METAL:
        return 30
      case ResourceType.FOOD:
        return 5
      case ResourceType.WATER:
        return 3
      case ResourceType.COAL:
        return 20
      case ResourceType.CRYSTAL:
        return 60
      default:
        return 10
    }
  }
}

// Utility function to create a new world generator
export const createWorldGenerator = (seed?: number) => {
  return new WorldGenerator(seed || Math.floor(Math.random() * 1000000))
}

// Helper function to generate a random seed
export const generateSeed = (): number => {
  return Math.floor(Math.random() * 1000000)
} 