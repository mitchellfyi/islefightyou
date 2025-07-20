/**
 * Advanced Hexagonal Terrain System
 * Generates dynamically sized islands with proper tessellation
 */

export interface HexTile {
  q: number  // Axial coordinate q
  r: number  // Axial coordinate r
  x: number  // World X position
  z: number  // World Z position
  y: number  // Height
  biome: string
  color: [number, number, number]
}

export class HexTerrainGenerator {
  private hexRadius: number
  private hexHeight: number
  private hexWidth: number

  constructor(hexRadius: number = 1.0) {
    this.hexRadius = hexRadius
    this.hexHeight = hexRadius * Math.sqrt(3)
    this.hexWidth = hexRadius * 2
  }

  /**
   * Generate a dynamically sized island
   * @param islandRadius - Desired island radius in world units
   * @param heightVariation - Amount of height variation (0-1)
   * @returns Array of hex tiles
   */
  generateIsland(islandRadius: number, heightVariation: number = 0.3): HexTile[] {
    const tiles: HexTile[] = []
    
    // Calculate how many hex rings we need to cover the island radius
    const hexRings = Math.ceil(islandRadius / this.hexRadius) + 1
    
    console.log(`🏝️ Generating island: radius=${islandRadius}, hexRings=${hexRings}`)

    // Generate hexagonal grid using axial coordinates
    for (let q = -hexRings; q <= hexRings; q++) {
      const r1 = Math.max(-hexRings, -q - hexRings)
      const r2 = Math.min(hexRings, -q + hexRings)
      
      for (let r = r1; r <= r2; r++) {
        const worldPos = this.axialToWorld(q, r)
        const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.z * worldPos.z)
        
        // Only include hexes within island radius
        if (distanceFromCenter <= islandRadius) {
          const height = this.calculateHeight(worldPos.x, worldPos.z, islandRadius, heightVariation)
          const biome = this.determineBiome(height, distanceFromCenter, islandRadius)
          const color = this.getBiomeColor(biome, height)
          
          tiles.push({
            q,
            r,
            x: worldPos.x,
            z: worldPos.z,
            y: height,
            biome,
            color
          })
        }
      }
    }
    
    console.log(`✅ Generated ${tiles.length} hex tiles`)
    return tiles
  }

  /**
   * Convert axial coordinates to world position
   */
  private axialToWorld(q: number, r: number): { x: number, z: number } {
    const x = this.hexRadius * (3/2 * q)
    const z = this.hexRadius * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
    return { x, z }
  }

  /**
   * Calculate height for a world position
   */
  private calculateHeight(x: number, z: number, islandRadius: number, heightVariation: number): number {
    const distanceFromCenter = Math.sqrt(x * x + z * z)
    const normalizedDistance = distanceFromCenter / islandRadius
    
    // Base island shape (higher in center, lower at edges)
    let baseHeight: number
    if (normalizedDistance < 0.3) {
      // Center plateau
      baseHeight = 2.0
    } else if (normalizedDistance < 0.7) {
      // Gentle slope
      const t = (normalizedDistance - 0.3) / 0.4
      baseHeight = 2.0 - (t * 1.5)
    } else {
      // Edge transition to water
      const t = (normalizedDistance - 0.7) / 0.3
      baseHeight = 0.5 * (1 - t)
    }
    
    // Add some noise for variation
    if (heightVariation > 0) {
      const noiseValue = this.simpleNoise(x * 0.1, z * 0.1) * heightVariation
      baseHeight += noiseValue
    }
    
    return Math.max(0, baseHeight)
  }

  /**
   * Simple noise function for height variation
   */
  private simpleNoise(x: number, z: number): number {
    // Simple pseudo-random noise
    const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1 // Range -1 to 1
  }

  /**
   * Determine biome based on height and position
   */
  private determineBiome(height: number, distanceFromCenter: number, islandRadius: number): string {
    if (height <= 0.2) return 'water'
    if (height < 0.8) return 'beach'
    if (height > 1.8) return 'mountain'
    
    const normalizedDistance = distanceFromCenter / islandRadius
    if (normalizedDistance < 0.3) return 'meadow'  // Center
    if (height > 1.2 && Math.random() > 0.6) return 'forest'
    
    return 'grassland'
  }

  /**
   * Get color for biome
   */
  private getBiomeColor(biome: string, height: number): [number, number, number] {
    const heightVariation = (height / 3) * 0.2
    
    switch (biome) {
      case 'water': return [0.1, 0.3, 0.8]
      case 'beach': return [0.9, 0.8, 0.6]
      case 'grassland': return [0.4 + heightVariation, 0.7 + heightVariation, 0.3]
      case 'meadow': return [0.5 + heightVariation, 0.8 + heightVariation, 0.4]
      case 'forest': return [0.2 + heightVariation, 0.5 + heightVariation, 0.2]
      case 'mountain': return [0.6 + heightVariation, 0.6 + heightVariation, 0.6 + heightVariation]
      default: return [0.5, 0.7, 0.3]
    }
  }

  /**
   * Get height at any world position (for character controller)
   */
  getHeightAt(x: number, z: number, tiles: HexTile[]): number {
    // Find the closest hex tile
    let closestTile = tiles[0]
    let minDistance = Infinity
    
    for (const tile of tiles) {
      const distance = Math.sqrt((x - tile.x) ** 2 + (z - tile.z) ** 2)
      if (distance < minDistance) {
        minDistance = distance
        closestTile = tile
      }
    }
    
    return closestTile ? closestTile.y : 0
  }
}

/**
 * Island size presets for dynamic generation
 */
export const ISLAND_PRESETS = {
  TINY: { radius: 8, hexRadius: 0.8, heightVariation: 0.2 },
  SMALL: { radius: 12, hexRadius: 1.0, heightVariation: 0.3 },
  MEDIUM: { radius: 16, hexRadius: 1.2, heightVariation: 0.4 },
  LARGE: { radius: 20, hexRadius: 1.4, heightVariation: 0.5 },
  HUGE: { radius: 25, hexRadius: 1.6, heightVariation: 0.6 }
} as const

export type IslandSize = keyof typeof ISLAND_PRESETS

/**
 * Generate a random island size
 */
export function getRandomIslandSize(): IslandSize {
  const sizes: IslandSize[] = ['TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE']
  const weights = [0.1, 0.3, 0.4, 0.15, 0.05] // Favor medium sizes
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < sizes.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return sizes[i]
    }
  }
  
  return 'MEDIUM' // Fallback
}