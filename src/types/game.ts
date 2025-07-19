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
  WOOD = 'wood',
  STONE = 'stone',
  METAL = 'metal',
  FOOD = 'food',
  WATER = 'water',
  COAL = 'coal',
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
  HOUSE = 'house',
  WORKSHOP = 'workshop',
  FARM = 'farm',
  MINE = 'mine',
  DEFENSE_TOWER = 'defense_tower',
  STORAGE = 'storage',
  DOCK = 'dock'
}

export interface Building {
  id: string
  type: BuildingType
  position: Position
  rotation: Rotation
  level: number
  health: number
  maxHealth: number
  resources?: Resource[]
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

// Player and game state
export interface Player {
  id: string
  username: string
  email: string
  level: number
  experience: number
  health: number
  maxHealth: number
  position: Position
  rotation: Rotation
  inventory: Resource[]
  isOnline: boolean
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

// Combat and enemies
export enum EnemyType {
  GROUND_CRAWLER = 'ground_crawler',
  FLYING_DRONE = 'flying_drone',
  SEA_MONSTER = 'sea_monster',
  TUNNEL_WORM = 'tunnel_worm'
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
  targetPlayerId?: string
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
  PLAYER_MOVE = 'player_move',
  PLAYER_ATTACK = 'player_attack',
  RESOURCE_HARVEST = 'resource_harvest',
  BUILDING_PLACE = 'building_place',
  BUILDING_DESTROY = 'building_destroy',
  ENEMY_SPAWN = 'enemy_spawn',
  ENEMY_ATTACK = 'enemy_attack',
  PLAYER_DAMAGE = 'player_damage',
  ITEM_CRAFT = 'item_craft'
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

// Game state management
export interface GameState {
  player: Player | null
  currentIsland: Island | null
  inventory: Resource[]
  buildings: Building[]
  enemies: Enemy[]
  multiplayerState: MultiplayerState
  gameSettings: GameSettings
  isLoading: boolean
  error: string | null
} 