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
   * Generate enhanced fractal noise for natural terrain with better distribution
   * Uses multiple noise layers with carefully tuned parameters for realistic terrain
   */
  public naturalTerrainNoise(x: number, y: number): number {
    // Large scale features (broad hills and valleys)
    const largeFeatures = this.fractalNoise2D(x, y, 2, 0.6, 0.02) * 2.0
    
    // Medium scale features (rolling hills)
    const mediumFeatures = this.fractalNoise2D(x, y, 3, 0.4, 0.04) * 1.5
    
    // Fine scale features (surface detail)
    const fineFeatures = this.fractalNoise2D(x, y, 4, 0.5, 0.08) * 1.0
    
    // Micro details (small bumps and variation)
    const microDetails = this.fractalNoise2D(x, y, 5, 0.3, 0.16) * 0.5
    
    // Combine all layers with decreasing influence
    return (largeFeatures + mediumFeatures + fineFeatures + microDetails) * 0.25
  }

  /**
   * Generate island-shaped terrain height with enhanced natural variation
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
    // FLAT TERRAIN TEST: Return fixed height for testing alignment
    const distanceFromCenter = Math.sqrt(x * x + y * y)
    
    if (distanceFromCenter >= islandRadius) {
      return -5 // Water outside island
    }
    
    // Return flat terrain at height 2 for testing
    return 2
    
    // TODO: Restore original terrain generation after testing
    /*
    // Enhanced base island shape - mostly flat with gentle hills
    const normalizedDistance = distanceFromCenter / islandRadius
    
    // Create a flatter center with gentle slopes toward edges
    let islandShape: number
    if (normalizedDistance < 0.3) {
      // Center plateau - relatively flat
      islandShape = 0.95 - (normalizedDistance * 0.1)
    } else if (normalizedDistance < 0.7) {
      // Gentle rolling hills zone
      islandShape = 0.85 - ((normalizedDistance - 0.3) * 0.5)
    } else {
      // Steep transition to water at edges
      const edgeT = (normalizedDistance - 0.7) / 0.3
      islandShape = 0.7 * Math.pow(1 - edgeT, 3)
    }
    
    const baseHeight = islandShape * centerHeight

    // Use enhanced natural terrain noise for realistic variation
    const terrainVariation = this.naturalTerrainNoise(x, y) * 1.5
    
    // Add some mountain peaks occasionally
    const mountainNoise = this.fractalNoise2D(x, y, 3, 0.7, 0.03)
    const mountainPeaks = mountainNoise > 0.6 ? Math.pow(mountainNoise - 0.6, 2) * 6 : 0
    
    // Combine base terrain with natural variation and occasional peaks
    let finalHeight = baseHeight + terrainVariation + mountainPeaks

    // Smooth water transition at edges
    if (distanceFromCenter > islandRadius * 0.75) {
      // Gradual transition to water at edges
      const edgeFactor = (islandRadius - distanceFromCenter) / (islandRadius * 0.25)
      finalHeight = finalHeight * Math.max(0, edgeFactor)
    }

    // Ensure water level outside land areas
    if (finalHeight < 0.5) {
      finalHeight = -5 // Deep water
    }

    return finalHeight
    */
  }

  /**
   * Get deterministic biome at position based on height, location, and environmental factors
   * @param x X coordinate
   * @param y Y coordinate  
   * @param height Terrain height
   * @param distanceFromCenter Distance from island center
   * @returns Biome type string
   */
  public getBiome(x: number, y: number, height: number, distanceFromCenter: number): string {
    // Water areas
    if (height <= 0) return 'water'
    
    // Beach areas (just above water level)
    if (height < 1) return 'beach'
    
    // Mountain peaks (high elevation)
    if (height > 7) return 'mountain'
    
    // Generate environmental factors using noise
    const moistureNoise = this.noise2D(x * 0.03, y * 0.03 + 1000)
    const temperatureNoise = this.noise2D(x * 0.04 + 500, y * 0.04)
    const biomeNoise = this.noise2D(x * 0.05, y * 0.05)
    
    // Normalize to 0-1 range
    const moisture = (moistureNoise + 1) / 2
    const temperature = (temperatureNoise + 1) / 2
    const variation = (biomeNoise + 1) / 2
    
    // Center plateau - open meadow/grassland for building
    if (distanceFromCenter < 3 && height > 2) {
      return 'meadow'
    }
    
    // Rocky mountain areas (high elevation or very steep)
    if (height > 5 || (height > 3 && variation < 0.2)) {
      return 'mountain'
    }
    
    // Desert areas (hot and dry - rare on tropical island)
    if (temperature > 0.8 && moisture < 0.2 && height > 2) {
      return 'desert'
    }
    
    // Swamp areas (wet lowlands)
    if (moisture > 0.8 && height < 2.5 && temperature > 0.4) {
      return 'swamp'
    }
    
    // Forest distribution based on moisture and elevation
    if (moisture > 0.5 && height > 1.5 && height < 6) {
      // Dense forest in moist mid-elevation areas
      if (variation > 0.3) {
        return 'forest'
      }
    }
    
    // Coastal areas become beach if close to edge
    if (distanceFromCenter > 10 && height < 2) {
      return 'beach'
    }
    
    // Default to grassland for remaining areas
    return 'grassland'
  }

  /**
   * Get biome color for rendering
   * @param biome Biome type string
   * @param height Terrain height for variation
   * @returns RGB color array [r, g, b] (0-1 range)
   */
  public getBiomeColor(biome: string, height: number): [number, number, number] {
    const heightVariation = Math.min(1, height / 8) * 0.3
    
    switch (biome) {
      case 'water':
        return [0.1, 0.4, 0.8] // Blue
      case 'beach':
        return [0.9 + heightVariation * 0.1, 0.8 + heightVariation * 0.1, 0.6] // Sandy
      case 'grassland':
        return [0.4 + heightVariation * 0.2, 0.7 + heightVariation * 0.1, 0.3] // Green
      case 'meadow':
        return [0.5 + heightVariation * 0.2, 0.8 + heightVariation * 0.1, 0.4] // Bright green
      case 'forest':
        return [0.2 + heightVariation * 0.1, 0.5 + heightVariation * 0.1, 0.2] // Dark green
      case 'mountain':
        return [0.5 + heightVariation * 0.3, 0.5 + heightVariation * 0.3, 0.5 + heightVariation * 0.2] // Gray
      case 'desert':
        return [0.8 + heightVariation * 0.2, 0.7 + heightVariation * 0.2, 0.4] // Sandy brown
      case 'swamp':
        return [0.3 + heightVariation * 0.1, 0.4 + heightVariation * 0.1, 0.2] // Murky green
      default:
        return [0.5, 0.7, 0.3] // Default green
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