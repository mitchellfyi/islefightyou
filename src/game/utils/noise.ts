/**
 * Perlin Noise Implementation for Natural Terrain Generation
 * 
 * This module provides noise functions for creating natural-looking terrain
 * with organic lumps, bumps, and realistic variation.
 */

export class PerlinNoise {
  private permutation: number[]
  private gradients: number[][]

  constructor(seed: number = 12345) {
    // Initialize with deterministic seed for consistent terrain
    this.permutation = this.generatePermutation(seed)
    this.gradients = this.generateGradients()
  }

  /**
   * Generate a permutation table for consistent noise
   */
  private generatePermutation(seed: number): number[] {
    const perm = []
    
    // Seeded random number generator (LCG)
    let currentSeed = seed
    const random = () => {
      currentSeed = (currentSeed * 16807) % 2147483647
      return currentSeed / 2147483647
    }

    // Create base permutation
    for (let i = 0; i < 256; i++) {
      perm[i] = i
    }

    // Shuffle with seeded random
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }

    // Duplicate for easy indexing
    return [...perm, ...perm]
  }

  /**
   * Generate gradient vectors for noise
   */
  private generateGradients(): number[][] {
    // Normalize gradients to ensure proper bounds
    const sqrt2 = Math.sqrt(2)
    return [
      [1/sqrt2, 1/sqrt2], [-1/sqrt2, 1/sqrt2], [1/sqrt2, -1/sqrt2], [-1/sqrt2, -1/sqrt2],
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ]
  }

  /**
   * Fade function for smooth interpolation
   */
  private fade(t: number): number {
    // 6t^5 - 15t^4 + 10t^3 (smoother than cubic)
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  /**
   * Linear interpolation
   */
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  /**
   * Dot product of gradient and distance vectors
   */
  private dotGridGradient(ix: number, iy: number, x: number, y: number): number {
    // Ensure indices are within bounds and hash properly
    const hash = this.permutation[(ix & 255) + this.permutation[iy & 255]]
    const gradientIndex = hash % this.gradients.length
    const gradient = this.gradients[gradientIndex]
    
    const dx = x - ix
    const dy = y - iy
    
    return dx * gradient[0] + dy * gradient[1]
  }

  /**
   * Generate 2D Perlin noise value at given coordinates
   * @param x X coordinate
   * @param y Y coordinate  
   * @returns Noise value between -1 and 1
   */
  public noise2D(x: number, y: number): number {
    // Simplified implementation for reliability
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    
    const u = this.fade(xf)
    const v = this.fade(yf)
    
    const aa = this.permutation[this.permutation[xi] + yi]
    const ab = this.permutation[this.permutation[xi] + yi + 1]
    const ba = this.permutation[this.permutation[xi + 1] + yi]
    const bb = this.permutation[this.permutation[xi + 1] + yi + 1]
    
    const gradAA = this.gradients[aa % this.gradients.length]
    const gradAB = this.gradients[ab % this.gradients.length]
    const gradBA = this.gradients[ba % this.gradients.length]
    const gradBB = this.gradients[bb % this.gradients.length]
    
    const x1 = this.lerp(
      gradAA[0] * xf + gradAA[1] * yf,
      gradBA[0] * (xf - 1) + gradBA[1] * yf,
      u
    )
    
    const x2 = this.lerp(
      gradAB[0] * xf + gradAB[1] * (yf - 1),
      gradBB[0] * (xf - 1) + gradBB[1] * (yf - 1),
      u
    )
    
    const result = this.lerp(x1, x2, v)
    
    // Ensure bounds and add small scaling factor for more variation
    return Math.max(-1, Math.min(1, result * 0.8))
  }

  /**
   * Generate fractal noise with multiple octaves for natural terrain
   * @param x X coordinate
   * @param y Y coordinate
   * @param octaves Number of noise layers
   * @param persistence How much each octave contributes
   * @param scale Base scale of the noise
   * @returns Noise value between -1 and 1
   */
  public fractalNoise2D(
    x: number, 
    y: number, 
    octaves: number = 4, 
    persistence: number = 0.5, 
    scale: number = 0.1
  ): number {
    let value = 0
    let amplitude = 1
    let frequency = scale
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= 2
    }

    return value / maxValue
  }

  /**
   * Generate island-shaped terrain height
   * @param x X coordinate
   * @param y Y coordinate
   * @param islandRadius Maximum radius of the island
   * @param centerHeight Maximum height at island center
   * @returns Height value (0 or positive)
   */
  public islandHeight(
    x: number, 
    y: number, 
    islandRadius: number = 14, 
    centerHeight: number = 8
  ): number {
    const distanceFromCenter = Math.sqrt(x * x + y * y)
    
    // Return water level for points outside island
    if (distanceFromCenter >= islandRadius) {
      return -5 // Deep water for swimming/diving
    }

    // Base island shape (higher in center, lower at edges)
    const normalizedDistance = distanceFromCenter / islandRadius
    const islandShape = Math.pow(1 - normalizedDistance, 2) // Smoother falloff
    const baseHeight = islandShape * centerHeight

    // Multi-octave noise for natural variation (reduced intensity)
    const detailNoise = this.fractalNoise2D(x, y, 4, 0.5, 0.08) * 1 // Fine details
    const mediumNoise = this.fractalNoise2D(x, y, 3, 0.4, 0.04) * 1.5 // Medium features  
    const largeNoise = this.fractalNoise2D(x, y, 2, 0.6, 0.02) * 2 // Large formations

    // Combine all noise layers with reduced impact
    const totalNoise = (detailNoise + mediumNoise + largeNoise) * 0.5
    let finalHeight = baseHeight + totalNoise

    // Smooth water transition at edges
    if (distanceFromCenter > islandRadius * 0.7) {
      // Gradual transition to water at edges
      const edgeFactor = (islandRadius - distanceFromCenter) / (islandRadius * 0.3)
      finalHeight = finalHeight * Math.max(0, edgeFactor)
    }

    // Ensure water level outside land areas
    if (finalHeight < 0.5) {
      finalHeight = -5 // Deep water
    }

    return finalHeight
  }

  /**
   * Get deterministic biome at position based on height and location
   * @param x X coordinate
   * @param y Y coordinate  
   * @param height Terrain height
   * @param distanceFromCenter Distance from island center
   * @returns Biome type string
   */
  public getBiome(x: number, y: number, height: number, distanceFromCenter: number): string {
    // Water areas
    if (height <= 0) return 'water'
    
    // Beach areas (close to water or island edge)
    if (height < 1 || distanceFromCenter > 10) return 'beach'
    
    // Mountain peaks
    if (height > 6) return 'mountain'
    
    // Use noise to determine forest vs grassland
    const biomeNoise = this.noise2D(x * 0.05, y * 0.05)
    
    if (distanceFromCenter < 3) {
      // Center of island - meadows
      return 'meadow'
    } else if (biomeNoise > 0.2) {
      // Forest areas
      return 'forest'
    } else if (height > 3 && biomeNoise < -0.3) {
      // Rocky areas
      return 'mountain'
    } else {
      // Default grassland
      return 'grassland'
    }
  }
}

// Default instance with consistent seed
export const terrainNoise = new PerlinNoise(42)

/**
 * Terrain generation utilities
 */
export const TerrainUtils = {
  /**
   * Test if terrain generation is working correctly
   */
  validateTerrain: (noise: PerlinNoise = terrainNoise): boolean => {
    try {
      // Test center should be high
      const centerHeight = noise.islandHeight(0, 0)
      if (centerHeight < 2) return false
      
      // Test edge should be water
      const edgeHeight = noise.islandHeight(20, 20)
      if (edgeHeight > -3) return false
      
      // Test noise consistency (same input = same output)
      const noise1 = noise.noise2D(5, 5)
      const noise2 = noise.noise2D(5, 5)
      if (Math.abs(noise1 - noise2) > 0.001) return false
      
      // Test noise bounds
      const testNoise = noise.noise2D(3, 7)
      if (testNoise < -1.1 || testNoise > 1.1) return false // Allow small margin
      
      // Test biome consistency
      const biome1 = noise.getBiome(5, 5, 3, 7)
      const biome2 = noise.getBiome(5, 5, 3, 7)
      if (biome1 !== biome2) return false
      
      return true
    } catch (error) {
      console.error('Terrain validation failed:', error)
      return false
    }
  },

  /**
   * Generate height map for debugging
   */
  generateHeightMap: (
    size: number = 32, 
    resolution: number = 64, 
    noise: PerlinNoise = terrainNoise
  ): number[] => {
    const heights = []
    const step = size / resolution
    
    for (let y = -size/2; y < size/2; y += step) {
      for (let x = -size/2; x < size/2; x += step) {
        heights.push(noise.islandHeight(x, y))
      }
    }
    
    return heights
  }
} 