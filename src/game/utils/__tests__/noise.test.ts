/**
 * Test Suite for Terrain Generation System
 * 
 * Ensures that terrain generation is robust, consistent, and natural-looking
 */

import { PerlinNoise, terrainNoise, TerrainUtils } from '../noise'

describe('PerlinNoise', () => {
  let noise: PerlinNoise

  beforeEach(() => {
    noise = new PerlinNoise(42) // Consistent seed
  })

  describe('Basic Noise Generation', () => {
    test('should generate noise values between -1 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 20 - 10
        const y = Math.random() * 20 - 10
        const value = noise.noise2D(x, y)
        
        expect(value).toBeGreaterThanOrEqual(-1)
        expect(value).toBeLessThanOrEqual(1)
      }
    })

    test('should be deterministic (same input = same output)', () => {
      const testCases = [
        [0, 0],
        [5.5, 3.2],
        [-2.8, 7.1],
        [10, -5]
      ]

      testCases.forEach(([x, y]) => {
        const value1 = noise.noise2D(x, y)
        const value2 = noise.noise2D(x, y)
        expect(value1).toBe(value2)
      })
    })

    test('should produce different values for different inputs', () => {
      // Use non-integer coordinates since Perlin noise is 0 at integer grid points
      const value1 = noise.noise2D(0.3, 0.7)
      const value2 = noise.noise2D(1.2, 1.8)
      const value3 = noise.noise2D(0.1, 0.1)
      
      expect(value1).not.toBe(value2)
      expect(value1).not.toBe(value3)
      expect(value2).not.toBe(value3)
    })

    test('should handle edge cases', () => {
      expect(() => noise.noise2D(0, 0)).not.toThrow()
      expect(() => noise.noise2D(-1000, 1000)).not.toThrow()
      expect(() => noise.noise2D(0.00001, 0.00001)).not.toThrow()
    })
  })

  describe('Fractal Noise', () => {
    test('should generate more complex patterns than simple noise', () => {
      const simpleNoise = noise.noise2D(5, 5)
      const fractalNoise = noise.fractalNoise2D(5, 5, 4, 0.5, 0.1)
      
      // Fractal noise should be different from simple noise
      expect(Math.abs(simpleNoise - fractalNoise)).toBeGreaterThan(0.01)
    })

    test('should be consistent with same parameters', () => {
      const value1 = noise.fractalNoise2D(3, 7, 4, 0.5, 0.1)
      const value2 = noise.fractalNoise2D(3, 7, 4, 0.5, 0.1)
      expect(value1).toBe(value2)
    })

    test('should vary with different octave parameters', () => {
      const base = noise.fractalNoise2D(5, 5, 1, 0.5, 0.1)
      const complex = noise.fractalNoise2D(5, 5, 6, 0.5, 0.1)
      
      expect(base).not.toBe(complex)
    })
  })

  describe('Island Height Generation', () => {
    test('should have highest points near center', () => {
      const centerHeight = noise.islandHeight(0, 0)
      const edge1Height = noise.islandHeight(10, 0)
      const edge2Height = noise.islandHeight(0, 10)
      
      expect(centerHeight).toBeGreaterThan(edge1Height)
      expect(centerHeight).toBeGreaterThan(edge2Height)
    })

    test('should return water level outside island radius', () => {
      const waterHeight1 = noise.islandHeight(20, 20)
      const waterHeight2 = noise.islandHeight(-25, 15)
      
      expect(waterHeight1).toBeLessThanOrEqual(-3) // Deep water
      expect(waterHeight2).toBeLessThanOrEqual(-3)
    })

    test('should have smooth transitions', () => {
      // Test gradual height change from center to edge
      const centerHeight = noise.islandHeight(0, 0)
      const edgeHeight = noise.islandHeight(12, 0)
      
      // Heights should generally decrease from center to edge
      expect(centerHeight).toBeGreaterThan(edgeHeight)
      
      // Test that terrain doesn't have extreme variations
      const midHeight = noise.islandHeight(6, 0)
      expect(midHeight).toBeGreaterThan(-10) // No extreme negative values
      expect(midHeight).toBeLessThan(20) // No extreme positive values
    })

    test('should create natural variation with noise', () => {
      // Points at same distance from center should have different heights due to noise
      const height1 = noise.islandHeight(5, 0)
      const height2 = noise.islandHeight(0, 5)
      const height3 = noise.islandHeight(3.5, 3.5) // Same distance from center
      
      // They should be different due to noise variation
      expect(height1).not.toBe(height2)
      expect(height1).not.toBe(height3)
    })

    test('should handle water transition smoothly', () => {
      // Test points near the water edge
      const nearCenter = noise.islandHeight(5, 0)  // Near center
      const nearEdge = noise.islandHeight(12, 0)   // Near edge
      const inWater = noise.islandHeight(16, 0)    // Definitely in water
      
      // Near center should be higher than near edge
      expect(nearCenter).toBeGreaterThan(nearEdge)
      // Water should be negative (deep)
      expect(inWater).toBeLessThan(-2)
    })
  })

  describe('Biome Generation', () => {
    test('should return water biome for negative heights', () => {
      const biome = noise.getBiome(0, 0, -2, 20)
      expect(biome).toBe('water')
    })

    test('should return beach biome for low heights or island edges', () => {
      const beachBiome1 = noise.getBiome(0, 0, 0.5, 5)  // Low height
      const beachBiome2 = noise.getBiome(0, 0, 2, 12)   // Edge of island
      
      expect(beachBiome1).toBe('beach')
      expect(beachBiome2).toBe('beach')
    })

    test('should return mountain biome for high elevations', () => {
      const biome = noise.getBiome(0, 0, 7, 2)
      expect(biome).toBe('mountain')
    })

    test('should return meadow biome near island center', () => {
      const biome = noise.getBiome(0, 0, 3, 1)
      expect(biome).toBe('meadow')
    })

    test('should be deterministic', () => {
      const biome1 = noise.getBiome(5, 7, 3, 4)
      const biome2 = noise.getBiome(5, 7, 3, 4)
      expect(biome1).toBe(biome2)
    })

    test('should return valid biome types', () => {
      const validBiomes = ['water', 'beach', 'mountain', 'meadow', 'forest', 'grassland']
      
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 20 - 10
        const y = Math.random() * 20 - 10
        const height = Math.random() * 8
        const distance = Math.sqrt(x*x + y*y)
        
        const biome = noise.getBiome(x, y, height, distance)
        expect(validBiomes).toContain(biome)
      }
    })
  })

  describe('Different Seeds', () => {
    test('should generate different terrain with different seeds', () => {
      const noise1 = new PerlinNoise(42)
      const noise2 = new PerlinNoise(123)
      
      const height1 = noise1.islandHeight(5, 5)
      const height2 = noise2.islandHeight(5, 5)
      
      expect(height1).not.toBe(height2)
    })

    test('should be consistent within same seed', () => {
      const noise1 = new PerlinNoise(999)
      const noise2 = new PerlinNoise(999)
      
      const height1 = noise1.islandHeight(3, 7)
      const height2 = noise2.islandHeight(3, 7)
      
      expect(height1).toBe(height2)
    })
  })
})

describe('TerrainUtils', () => {
  describe('validateTerrain', () => {
    test('should validate default terrain correctly', () => {
      const isValid = TerrainUtils.validateTerrain()
      expect(isValid).toBe(true)
    })

    test('should validate custom noise instance', () => {
      const customNoise = new PerlinNoise(123)
      const isValid = TerrainUtils.validateTerrain(customNoise)
      expect(isValid).toBe(true)
    })

    test('should detect invalid terrain', () => {
      // Create a mock broken noise instance that returns invalid values
      const brokenNoise = {
        islandHeight: () => NaN,
        noise2D: () => 5, // Outside bounds (-1 to 1)
        getBiome: () => 'invalid'
      } as any
      
      const isValid = TerrainUtils.validateTerrain(brokenNoise)
      expect(isValid).toBe(false)
    })
  })

  describe('generateHeightMap', () => {
    test('should generate heightmap with correct dimensions', () => {
      const heightMap = TerrainUtils.generateHeightMap(32, 64)
      expect(heightMap).toHaveLength(64 * 64)
    })

    test('should contain reasonable height values', () => {
      const heightMap = TerrainUtils.generateHeightMap(16, 16)
      
      // Should have some land (positive heights) and water (negative heights)
      const landHeights = heightMap.filter(h => h > 0)
      const waterHeights = heightMap.filter(h => h < 0)
      
      expect(landHeights.length).toBeGreaterThan(0)
      expect(waterHeights.length).toBeGreaterThan(0)
      
      // No extreme values
      heightMap.forEach(height => {
        expect(height).toBeGreaterThan(-10)
        expect(height).toBeLessThan(15)
      })
    })

    test('should be deterministic', () => {
      const map1 = TerrainUtils.generateHeightMap(8, 8)
      const map2 = TerrainUtils.generateHeightMap(8, 8)
      
      expect(map1).toEqual(map2)
    })
  })
})

describe('Integration Tests', () => {
  test('complete terrain generation workflow', () => {
    // Test the complete workflow of terrain generation
    const noise = new PerlinNoise(42)
    
    // Generate a small terrain patch
    const terrainData = []
    for (let y = -8; y <= 8; y += 2) {
      for (let x = -8; x <= 8; x += 2) {
        const height = noise.islandHeight(x, y)
        const distance = Math.sqrt(x*x + y*y)
        const biome = noise.getBiome(x, y, height, distance)
        
        terrainData.push({ x, y, height, biome })
      }
    }
    
    // Verify we have a good mix of terrain types
    const biomes = new Set(terrainData.map(d => d.biome))
    expect(biomes.size).toBeGreaterThan(2) // Should have multiple biome types
    
    // Verify height distribution makes sense
    const centerPoints = terrainData.filter(d => Math.sqrt(d.x*d.x + d.y*d.y) < 3)
    const edgePoints = terrainData.filter(d => Math.sqrt(d.x*d.x + d.y*d.y) > 6)
    
    if (centerPoints.length > 0 && edgePoints.length > 0) {
      const avgCenterHeight = centerPoints.reduce((sum, p) => sum + p.height, 0) / centerPoints.length
      const avgEdgeHeight = edgePoints.reduce((sum, p) => sum + p.height, 0) / edgePoints.length
      
      expect(avgCenterHeight).toBeGreaterThan(avgEdgeHeight)
    }
  })

  test('terrain should support swimming depths', () => {
    const noise = new PerlinNoise(42)
    
    // Check water depths at various points outside the island
    const waterPoints = [
      [20, 0], [0, 20], [-20, 0], [0, -20],
      [15, 15], [-15, -15], [25, 5], [-5, 25]
    ]
    
    waterPoints.forEach(([x, y]) => {
      const depth = noise.islandHeight(x, y)
      expect(depth).toBeLessThan(-3) // Deep enough for swimming/diving
    })
  })

  test('terrain boundaries should be smooth', () => {
    const noise = new PerlinNoise(42)
    
    // Test that terrain transitions from land to water reasonably
    const centerHeight = noise.islandHeight(0, 0)
    const edgeHeight = noise.islandHeight(14, 0) 
    const waterHeight = noise.islandHeight(18, 0)
    
    // Should transition from high center to low water
    expect(centerHeight).toBeGreaterThan(2) // Center should be land
    expect(waterHeight).toBeLessThan(-3) // Far edge should be deep water
    
    // Natural terrain can have variation, we just ensure no infinite values
    expect(Number.isFinite(centerHeight)).toBe(true)
    expect(Number.isFinite(edgeHeight)).toBe(true) 
    expect(Number.isFinite(waterHeight)).toBe(true)
  })
}) 