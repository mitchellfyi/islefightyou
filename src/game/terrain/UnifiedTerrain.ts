/**
 * Unified Terrain System - Single Source of Truth
 * 
 * This system generates and manages terrain data to ensure the visual terrain mesh
 * and character positioning use identical height calculations.
 */

import { PerlinNoise } from '../utils/noise'

// Terrain configuration constants
export const TERRAIN_CONFIG = {
  // World dimensions
  WORLD_SIZE: 32,          // 32x32 world units
  HEIGHTMAP_RESOLUTION: 65, // 65x65 heightmap (64 segments + 1)
  
  // Height scaling
  MAX_HEIGHT: 8,           // Maximum terrain height in world units
  WATER_LEVEL: -2,         // Water level in world units
  
  // Island shape
  ISLAND_RADIUS: 14,       // Island radius in world units
  ISLAND_CENTER_X: 0,      // Island center X coordinate
  ISLAND_CENTER_Z: 0,      // Island center Z coordinate
} as const

export interface TerrainPoint {
  height: number
  biome: string
  color: [number, number, number]
}

export class UnifiedTerrainSystem {
  private heightmap: number[][] = []
  private biomeMap: string[][] = []
  private colorMap: [number, number, number][][] = []
  private noise: PerlinNoise
  
  constructor(seed: number = 42) {
    this.noise = new PerlinNoise(seed)
    this.generateTerrain()
  }

  /**
   * Step 1: Generate heightmap using fractal noise with island shaping
   */
  private generateTerrain(): void {
    const { HEIGHTMAP_RESOLUTION, WORLD_SIZE, MAX_HEIGHT, ISLAND_RADIUS, WATER_LEVEL } = TERRAIN_CONFIG
    
    // Initialize arrays
    this.heightmap = Array(HEIGHTMAP_RESOLUTION).fill(null).map(() => Array(HEIGHTMAP_RESOLUTION).fill(0))
    this.biomeMap = Array(HEIGHTMAP_RESOLUTION).fill(null).map(() => Array(HEIGHTMAP_RESOLUTION).fill('water'))
    this.colorMap = Array(HEIGHTMAP_RESOLUTION).fill(null).map(() => Array(HEIGHTMAP_RESOLUTION).fill([0.5, 0.7, 0.3]))

    console.log('🗺️ Generating unified terrain heightmap...')

    for (let i = 0; i < HEIGHTMAP_RESOLUTION; i++) {
      for (let j = 0; j < HEIGHTMAP_RESOLUTION; j++) {
        // Convert heightmap indices to world coordinates
        const worldX = (i / (HEIGHTMAP_RESOLUTION - 1)) * WORLD_SIZE - WORLD_SIZE / 2
        const worldZ = (j / (HEIGHTMAP_RESOLUTION - 1)) * WORLD_SIZE - WORLD_SIZE / 2
        
        // Generate height using fractal noise
        const rawHeight = this.generateHeightAtPoint(worldX, worldZ)
        
        // Apply island shaping
        const distanceFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ)
        const shapedHeight = this.applyIslandShape(rawHeight, distanceFromCenter)
        
        // Determine final height
        let finalHeight: number
        if (distanceFromCenter >= ISLAND_RADIUS) {
          finalHeight = WATER_LEVEL // Deep water outside island
        } else if (shapedHeight < 0.5) {
          finalHeight = WATER_LEVEL // Shallow areas become water
        } else {
          finalHeight = shapedHeight
        }
        
        // Store height
        this.heightmap[i][j] = finalHeight
        
        // Generate biome and color
        const biome = this.determineBiome(worldX, worldZ, finalHeight, distanceFromCenter)
        const color = this.getBiomeColor(biome, finalHeight)
        
        this.biomeMap[i][j] = biome
        this.colorMap[i][j] = color
      }
    }
    
    console.log('✅ Unified terrain generated successfully')
  }

  /**
   * Generate height at a specific world coordinate using fractal noise
   */
  private generateHeightAtPoint(worldX: number, worldZ: number): number {
    // Large scale features (broad island shape)
    const large = this.noise.fractalNoise2D(worldX, worldZ, 2, 0.6, 0.02) * 2.0
    
    // Medium scale features (rolling hills)
    const medium = this.noise.fractalNoise2D(worldX, worldZ, 3, 0.4, 0.04) * 1.5
    
    // Fine scale features (surface detail)
    const fine = this.noise.fractalNoise2D(worldX, worldZ, 4, 0.5, 0.08) * 1.0
    
    // Combine all layers
    const combinedNoise = (large + medium + fine) * 0.3
    
    // Base height (higher in center, lower at edges)
    const baseHeight = TERRAIN_CONFIG.MAX_HEIGHT * 0.6
    
    return baseHeight + combinedNoise
  }

  /**
   * Apply island shaping to create natural coastlines
   */
  private applyIslandShape(height: number, distanceFromCenter: number): number {
    const { ISLAND_RADIUS } = TERRAIN_CONFIG
    
    if (distanceFromCenter >= ISLAND_RADIUS) {
      return TERRAIN_CONFIG.WATER_LEVEL
    }
    
    // Create smooth transition to water at edges
    const normalizedDistance = distanceFromCenter / ISLAND_RADIUS
    
    if (normalizedDistance < 0.3) {
      // Center plateau - mostly flat
      return height * 0.95
    } else if (normalizedDistance < 0.7) {
      // Rolling hills zone
      const t = (normalizedDistance - 0.3) / 0.4
      return height * (0.95 - t * 0.3)
    } else {
      // Transition to water
      const t = (normalizedDistance - 0.7) / 0.3
      const falloff = Math.pow(1 - t, 2)
      return height * 0.65 * falloff
    }
  }

  /**
   * Determine biome based on height and environmental factors
   */
  private determineBiome(worldX: number, worldZ: number, height: number, distanceFromCenter: number): string {
    if (height <= TERRAIN_CONFIG.WATER_LEVEL + 0.1) return 'water'
    if (height < 1) return 'beach'
    if (height > 6) return 'mountain'
    
    // Environmental noise
    const moistureNoise = this.noise.noise2D(worldX * 0.03, worldZ * 0.03 + 1000)
    const biomeNoise = this.noise.noise2D(worldX * 0.05, worldZ * 0.05)
    
    const moisture = (moistureNoise + 1) / 2
    const variation = (biomeNoise + 1) / 2
    
    // Center meadow
    if (distanceFromCenter < 3 && height > 2) return 'meadow'
    
    // Mountain areas
    if (height > 4 || (height > 3 && variation < 0.2)) return 'mountain'
    
    // Forest areas
    if (moisture > 0.5 && height > 1.5 && height < 5 && variation > 0.3) return 'forest'
    
    // Default grassland
    return 'grassland'
  }

  /**
   * Get biome color for rendering
   */
  private getBiomeColor(biome: string, height: number): [number, number, number] {
    const heightVariation = Math.min(1, height / 8) * 0.2
    
    switch (biome) {
      case 'water': return [0.1, 0.4, 0.8]
      case 'beach': return [0.9, 0.8, 0.6]
      case 'grassland': return [0.4 + heightVariation, 0.7 + heightVariation * 0.5, 0.3]
      case 'meadow': return [0.5 + heightVariation, 0.8 + heightVariation * 0.5, 0.4]
      case 'forest': return [0.2 + heightVariation * 0.5, 0.5 + heightVariation * 0.5, 0.2]
      case 'mountain': return [0.5 + heightVariation, 0.5 + heightVariation, 0.5 + heightVariation]
      default: return [0.5, 0.7, 0.3]
    }
  }

  /**
   * PUBLIC API: Get terrain height at any world coordinate
   * This is the authoritative function used by both visual terrain and character controller
   */
  public getHeightAt(worldX: number, worldZ: number): number {
    const { HEIGHTMAP_RESOLUTION, WORLD_SIZE } = TERRAIN_CONFIG
    
    // Convert world coordinates to heightmap indices
    const i = ((worldX + WORLD_SIZE / 2) / WORLD_SIZE) * (HEIGHTMAP_RESOLUTION - 1)
    const j = ((worldZ + WORLD_SIZE / 2) / WORLD_SIZE) * (HEIGHTMAP_RESOLUTION - 1)
    
    // Clamp to valid range
    const clampedI = Math.max(0, Math.min(HEIGHTMAP_RESOLUTION - 1, Math.floor(i)))
    const clampedJ = Math.max(0, Math.min(HEIGHTMAP_RESOLUTION - 1, Math.floor(j)))
    
    // For now, use nearest neighbor (can be upgraded to bilinear interpolation later)
    return this.heightmap[clampedI][clampedJ]
  }

  /**
   * Get terrain data for mesh generation
   */
  public getTerrainData(): {
    heights: number[][]
    biomes: string[][]
    colors: [number, number, number][][]
  } {
    return {
      heights: this.heightmap,
      biomes: this.biomeMap,
      colors: this.colorMap
    }
  }

  /**
   * Get terrain configuration
   */
  public getConfig() {
    return TERRAIN_CONFIG
  }
}

// Global terrain instance
export const unifiedTerrain = new UnifiedTerrainSystem(42)