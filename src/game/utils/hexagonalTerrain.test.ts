import { HexagonalTerrain } from './hexagonalTerrain'

describe('HexagonalTerrain', () => {
  let terrain: HexagonalTerrain

  beforeEach(() => {
    terrain = new HexagonalTerrain(42, 1.5, 10)
  })

  test('should generate valid terrain heights', () => {
    const centerHeight = terrain.getHeight(0, 0)
    expect(centerHeight).toBeGreaterThan(2) // Center should be high
    
    const edgeHeight = terrain.getHeight(25, 0)
    expect(edgeHeight).toBeLessThan(0) // Edge should be water or very low
  })

  test('should generate proper biomes', () => {
    const centerBiome = terrain.getBiome(0, 0)
    expect(['meadow', 'grassland', 'forest', 'mountain']).toContain(centerBiome)
    
    const waterBiome = terrain.getBiome(25, 0)
    expect(waterBiome).toBe('water')
  })

  test('should generate hexagonal grid', () => {
    const hexGrid = terrain.generateHexGrid()
    expect(hexGrid.length).toBeGreaterThan(0)
    
    // Check that hexes have proper structure
    const firstHex = hexGrid[0]
    expect(firstHex).toHaveProperty('center')
    expect(firstHex).toHaveProperty('height')
    expect(firstHex).toHaveProperty('biome')
    expect(firstHex).toHaveProperty('vertices')
    expect(firstHex.vertices).toHaveLength(6) // Hexagons have 6 vertices
  })

  test('should generate dynamic island sizes', () => {
    const size1 = terrain.getDynamicIslandSize(42)
    const size2 = terrain.getDynamicIslandSize(123)
    
    expect(size1).toBeGreaterThanOrEqual(8)
    expect(size1).toBeLessThanOrEqual(16)
    expect(size2).toBeGreaterThanOrEqual(8)
    expect(size2).toBeLessThanOrEqual(16)
  })

  test('should validate terrain generation', () => {
    expect(terrain.validate()).toBe(true)
  })

  test('should handle coordinate conversion', () => {
    // Test that hex coordinates round properly
    const hex = (terrain as any).worldToHex(1.5, 2.3)
    expect(hex).toHaveProperty('q')
    expect(hex).toHaveProperty('r')
    expect(Number.isInteger(hex.q)).toBe(true)
    expect(Number.isInteger(hex.r)).toBe(true)
  })
}) 