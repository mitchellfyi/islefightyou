import { PerlinNoise } from './noise'

/**
 * Hexagonal Tessellation Terrain System
 * Creates dynamic islands with proper hexagonal grid patterns
 */
export class HexagonalTerrain {
  private noise: PerlinNoise
  private hexSize: number
  private islandRadius: number
  private centerHeight: number

  constructor(seed: number = 42, hexSize: number = 1.5, islandRadius: number = 10) {
    this.noise = new PerlinNoise(seed)
    this.hexSize = hexSize
    this.islandRadius = islandRadius
    this.centerHeight = 6
  }

  /**
   * Convert world coordinates to hexagonal grid coordinates
   */
  private worldToHex(x: number, z: number): { q: number, r: number } {
    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * z) / this.hexSize
    const r = (2 / 3 * z) / this.hexSize
    return this.roundHex(q, r)
  }

  /**
   * Convert hexagonal coordinates back to world coordinates
   */
  private hexToWorld(q: number, r: number): { x: number, z: number } {
    const x = this.hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r)
    const z = this.hexSize * (3 / 2 * r)
    return { x, z }
  }

  /**
   * Round fractional hex coordinates to nearest hex
   */
  private roundHex(q: number, r: number): { q: number, r: number } {
    let s = -q - r
    let rq = Math.round(q)
    let rr = Math.round(r)
    let rs = Math.round(s)

    const qDiff = Math.abs(rq - q)
    const rDiff = Math.abs(rr - r)
    const sDiff = Math.abs(rs - s)

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs
    } else if (rDiff > sDiff) {
      rr = -rq - rs
    }

    return { q: rq, r: rr }
  }

  /**
   * Get distance from center in hex coordinates
   */
  private getHexDistance(q: number, r: number): number {
    return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2
  }

  /**
   * Generate height at world coordinates using hexagonal tessellation
   */
  public getHeight(x: number, z: number): number {
    const hex = this.worldToHex(x, z)
    const distance = this.getHexDistance(hex.q, hex.r)
    
    // Island boundary with smooth falloff
    if (distance > this.islandRadius) {
      return -5 // Deep water outside island
    }

    // Base height from distance from center (more aggressive falloff)
    const distanceFactor = Math.max(0, 1 - (distance / this.islandRadius) ** 1.5)
    const baseHeight = this.centerHeight * distanceFactor

    // Add noise layers for natural variation
    const noise1 = this.noise.fractalNoise2D(x * 0.1, z * 0.1, 3, 0.5, 0.1) * 2
    const noise2 = this.noise.fractalNoise2D(x * 0.05, z * 0.05, 2, 0.7, 0.05) * 4
    
    // Hexagonal pattern influence (reduced)
    const hexPattern = Math.sin(hex.q * Math.PI / 3) * Math.cos(hex.r * Math.PI / 3) * 0.2
    
    // Combine all height factors
    const finalHeight = baseHeight + noise1 + noise2 + hexPattern
    
    // Ensure proper height range
    if (distance > this.islandRadius * 0.7) {
      // Near edge - ensure water
      return Math.min(-1, finalHeight)
    }
    
    return Math.max(-2, finalHeight)
  }

  /**
   * Get biome at world coordinates
   */
  public getBiome(x: number, z: number): string {
    const height = this.getHeight(x, z)
    const hex = this.worldToHex(x, z)
    const distance = this.getHexDistance(hex.q, hex.r)
    
    // Water areas
    if (height <= 0) return 'water'
    
    // Beach areas (close to water or island edge)
    if (height < 1 || distance > this.islandRadius - 2) return 'beach'
    
    // Mountain peaks
    if (height > 6) return 'mountain'
    
    // Use noise to determine forest vs grassland
    const biomeNoise = this.noise.noise2D(x * 0.05, z * 0.05)
    
    if (distance < this.islandRadius * 0.3) {
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

  /**
   * Generate hexagonal grid data for rendering
   */
  public generateHexGrid(): Array<{
    center: { x: number, z: number }
    height: number
    biome: string
    vertices: Array<{ x: number, z: number }>
  }> {
    const hexes: Array<{
      center: { x: number, z: number }
      height: number
      biome: string
      vertices: Array<{ x: number, z: number }>
    }> = []

    // Generate hexes within island radius
    for (let q = -this.islandRadius; q <= this.islandRadius; q++) {
      const r1 = Math.max(-this.islandRadius, -q - this.islandRadius)
      const r2 = Math.min(this.islandRadius, -q + this.islandRadius)
      
      for (let r = r1; r <= r2; r++) {
        const distance = this.getHexDistance(q, r)
        if (distance <= this.islandRadius) {
          const worldPos = this.hexToWorld(q, r)
          const height = this.getHeight(worldPos.x, worldPos.z)
          const biome = this.getBiome(worldPos.x, worldPos.z)
          
          // Generate hex vertices
          const vertices = this.generateHexVertices(worldPos.x, worldPos.z)
          
          hexes.push({
            center: worldPos,
            height,
            biome,
            vertices
          })
        }
      }
    }

    return hexes
  }

  /**
   * Generate vertices for a hexagon at given position
   */
  private generateHexVertices(centerX: number, centerZ: number): Array<{ x: number, z: number }> {
    const vertices: Array<{ x: number, z: number }> = []
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + this.hexSize * Math.cos(angle)
      const z = centerZ + this.hexSize * Math.sin(angle)
      vertices.push({ x, z })
    }
    
    return vertices
  }

  /**
   * Get dynamic island size based on seed
   */
  public getDynamicIslandSize(seed: number): number {
    // Use seed to generate consistent but varied island sizes
    const sizeNoise = this.noise.noise2D(seed * 0.1, 0)
    const baseSize = 10
    const variation = 6
    return Math.max(8, Math.min(16, baseSize + Math.floor(sizeNoise * variation)))
  }

  /**
   * Validate terrain generation
   */
  public validate(): boolean {
    try {
      // Test center should be high
      const centerHeight = this.getHeight(0, 0)
      if (centerHeight < 2) return false
      
      // Test edge should be water (use a point further out)
      const edgeX = this.hexSize * this.islandRadius * 1.5
      const edgeHeight = this.getHeight(edgeX, 0)
      if (edgeHeight > 0) return false
      
      // Test hex grid generation
      const hexes = this.generateHexGrid()
      if (hexes.length === 0) return false
      
      return true
    } catch (error) {
      console.error('Hexagonal terrain validation failed:', error)
      return false
    }
  }
}

// Default instance
export const hexagonalTerrain = new HexagonalTerrain(42, 1.5, 10) 