import { Vector3 } from 'three'

// Core game types
export interface Position {
  x: number
  y: number
  z: number
}

export interface Rotation {
  x: number
  y: number
  z: number
}

// Resource types
export enum ResourceType {
  // Basic materials
  WOOD = 'wood',
  STONE = 'stone',
  METAL = 'metal',
  CORAL = 'coral',
  
  // Food & drink
  FISH = 'fish',
  COCONUT = 'coconut',
  BERRIES = 'berries',
  COOKED_FISH = 'cooked_fish',
  
  // Medical
  BANDAGE = 'bandage',
  FIRST_AID_KIT = 'first_aid_kit',
  
  // Ammunition
  BASIC_AMMO = 'basic_ammo',
  ADVANCED_AMMO = 'advanced_ammo',
  HARPOON = 'harpoon',
  ENERGY_CELL = 'energy_cell',
  
  // Rare materials
  PEARL_FRAGMENT = 'pearl_fragment',
  CRYSTAL = 'crystal'
}

export interface Resource {
  type: ResourceType
  quantity: number
}

// Biome types
export enum BiomeType {
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  DESERT = 'desert',
  MOUNTAIN = 'mountain',
  BEACH = 'beach',
  SWAMP = 'swamp'
}

// Building types
export enum BuildingType {
  // Core structures
  ISLAND_CORE = 'island_core', // The raidable objective
  HOUSE = 'house',
  STORAGE = 'storage',
  
  // Production
  WORKSHOP = 'workshop',
  FARM = 'farm',
  MINE = 'mine',
  FISHING_HUT = 'fishing_hut',
  
  // Defense
  TURRET = 'turret',
  BARRICADE = 'barricade',
  WALL = 'wall',
  
  // Utility
  DOCK = 'dock',
  CAMPFIRE = 'campfire',
  REPAIR_BENCH = 'repair_bench'
}

export interface Building {
  id: string
  type: BuildingType
  position: Position
  rotation: Rotation
  level: number
  health: number
  maxHealth: number
  lastDecayUpdate: Date
  resources?: Resource[]
  isSecured?: boolean // For Island Core and valuable structures
}

// Island generation
export interface Island {
  id: string
  playerId: string
  name: string
  seed: number
  size: number
  heightMap: number[][]
  biomeMap: BiomeType[][]
  resourceNodes: ResourceNode[]
  buildings: Building[]
  createdAt: Date
  updatedAt: Date
}

export interface ResourceNode {
  id: string
  type: ResourceType
  position: Position
  quantity: number
  maxQuantity: number
  respawnRate: number
  lastHarvested?: Date
}

// Survival stats system
export interface SurvivalStats {
  health: number
  maxHealth: number
  hunger: number
  maxHunger: number
  thirst: number
  maxThirst: number
  bleed: number // 0-5 stacks
  lastStatUpdate: Date
}

// Weapon system
export enum WeaponType {
  RUSTY_REVOLVER = 'rusty_revolver',
  REEF_RIFLE = 'reef_rifle',
  CORAL_CANNON = 'coral_cannon',
  TESLA_HARPOON = 'tesla_harpoon'
}

export interface Weapon {
  id: string
  type: WeaponType
  damage: number
  range: number
  fireRate: number // shots per second
  ammoType: ResourceType
  durability: number
  maxDurability: number
}

// Economy system
export interface Economy {
  gold: number
  pearls: number
  threatScore: number
  islandRadius: number
}

// Player and game state
export interface Player {
  id: string
  username: string
  email: string
  level: number
  experience: number
  survival: SurvivalStats
  position: Position
  rotation: Rotation
  inventory: Resource[]
  weapons: Weapon[]
  economy: Economy
  isOnline: boolean
  isRaidable: boolean // opt-in PvP flag
  lastActive: Date
}

export interface GameSession {
  id: string
  playerId: string
  islandId: string
  position: Position
  rotation: Rotation
  health: number
  isOnline: boolean
  lastPing: Date
}

// Combat and enemies (AI threats)
export enum EnemyType {
  SEAGULL = 'seagull', // Dive-bombs from above
  PIRATE_SKIFF = 'pirate_skiff', // Arrives by sea
  BURROWING_CRAB = 'burrowing_crab', // Emerges from sand
  SHARK = 'shark' // Ocean threat
}

export interface Enemy {
  id: string
  type: EnemyType
  position: Position
  rotation: Rotation
  health: number
  maxHealth: number
  damage: number
  speed: number
  attackRange: number
  isAlive: boolean
  threatLevel: number // Scales with player's threat score
  targetPlayerId?: string
  spawnTime: Date
}

// Crafting system
export interface Recipe {
  id: string
  name: string
  resultItem: ResourceType
  resultQuantity: number
  requiredResources: Resource[]
  craftingTime: number
  buildingRequired?: BuildingType
}

// Events and actions
export enum GameEventType {
  // Movement & Basic Actions
  PLAYER_MOVE = 'player_move',
  RESOURCE_HARVEST = 'resource_harvest',
  BUILDING_PLACE = 'building_place',
  BUILDING_DESTROY = 'building_destroy',
  ITEM_CRAFT = 'item_craft',
  
  // Combat
  WEAPON_FIRE = 'weapon_fire',
  PLAYER_HIT = 'player_hit',
  PLAYER_HEAL = 'player_heal',
  BLEED_APPLIED = 'bleed_applied',
  
  // PvP & Raiding
  RAID_START = 'raid_start',
  RAID_END = 'raid_end',
  ISLAND_CORE_STOLEN = 'island_core_stolen',
  
  // AI Threats
  ENEMY_SPAWN = 'enemy_spawn',
  ENEMY_ATTACK = 'enemy_attack',
  THREAT_WAVE_START = 'threat_wave_start',
  
  // Economy
  MARKETPLACE_ORDER = 'marketplace_order',
  GOLD_EARNED = 'gold_earned',
  PEARL_PURCHASED = 'pearl_purchased',
  
  // Survival
  HUNGER_TICK = 'hunger_tick',
  THIRST_TICK = 'thirst_tick',
  STAT_REGENERATION = 'stat_regeneration'
}

export interface GameEvent {
  id: string
  type: GameEventType
  playerId: string
  timestamp: Date
  data: any
}

// UI and controls
export interface TouchControls {
  joystick: {
    position: Position
    active: boolean
  }
  actionButtons: {
    attack: boolean
    build: boolean
    harvest: boolean
    craft: boolean
  }
}

export interface GameSettings {
  graphics: {
    quality: 'low' | 'medium' | 'high'
    shadows: boolean
    particles: boolean
  }
  controls: {
    sensitivity: number
    invertY: boolean
    autoRun: boolean
  }
  audio: {
    master: number
    effects: number
    music: number
  }
}

// Multiplayer
export interface MultiplayerState {
  connectedPlayers: Player[]
  isHost: boolean
  serverUrl: string
  ping: number
}

// Chunk system for world persistence
export interface WorldChunk {
  x: number
  z: number
  heightData: number[]
  biomeData: BiomeType[]
  modifications: ChunkModification[]
  lastUpdate: Date
}

export interface ChunkModification {
  id: string
  type: 'block_place' | 'block_destroy' | 'resource_harvest'
  position: Position
  data: any
  timestamp: Date
}

// Marketplace system
export interface MarketplaceOrder {
  id: string
  playerId: string
  playerName: string
  itemType: ResourceType
  quantity: number
  pricePerUnit: number
  orderType: 'buy' | 'sell'
  createdAt: Date
  expiresAt: Date
}

// PvP Raiding
export interface Raid {
  id: string
  attackerId: string
  defenderId: string
  targetIslandId: string
  status: 'active' | 'completed' | 'failed'
  lootStolen: Resource[]
  startTime: Date
  endTime?: Date
}

// Game state management
export interface GameState {
  player: Player | null
  currentIsland: Island | null
  inventory: Resource[]
  buildings: Building[]
  enemies: Enemy[]
  weapons: Weapon[]
  activeRaids: Raid[]
  marketplaceOrders: MarketplaceOrder[]
  worldChunks: WorldChunk[]
  multiplayerState: MultiplayerState
  gameSettings: GameSettings
  isLoading: boolean
  error: string | null
} 