import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  GameState, 
  Player, 
  Island, 
  Position, 
  Resource, 
  Building, 
  Enemy, 
  Weapon,
  SurvivalStats,
  ResourceType,
  Raid,
  MarketplaceOrder
} from '@/types/game'
import { SurvivalManager } from '@/game/systems/SurvivalManager'

interface GameStore extends GameState {
  // Actions
  setPlayer: (player: Player | null) => void
  updatePlayerPosition: (position: Position) => void
  updateSurvivalStats: (stats: SurvivalStats) => void
  consumeItem: (itemType: ResourceType) => void
  applyDamage: (damage: number, causesBleed?: boolean) => void
  respawnPlayer: () => void
  
  setCurrentIsland: (island: Island | null) => void
  addResource: (resource: Resource) => void
  removeResource: (resourceType: ResourceType, quantity: number) => void
  
  addBuilding: (building: Building) => void
  removeBuilding: (buildingId: string) => void
  
  addEnemy: (enemy: Enemy) => void
  removeEnemy: (enemyId: string) => void
  
  addWeapon: (weapon: Weapon) => void
  removeWeapon: (weaponId: string) => void
  
  addRaid: (raid: Raid) => void
  updateRaid: (raidId: string, updates: Partial<Raid>) => void
  
  addMarketplaceOrder: (order: MarketplaceOrder) => void
  removeMarketplaceOrder: (orderId: string) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateGameSettings: (settings: Partial<GameState['gameSettings']>) => void
  connectToMultiplayer: (players: Player[]) => void
  disconnectFromMultiplayer: () => void
  reset: () => void
}

const initialState: GameState = {
  player: null,
  currentIsland: null,
  inventory: [],
  buildings: [],
  enemies: [],
  weapons: [],
  activeRaids: [],
  marketplaceOrders: [],
  worldChunks: [],
  multiplayerState: {
    connectedPlayers: [],
    isHost: false,
    serverUrl: '',
    ping: 0
  },
  gameSettings: {
    graphics: {
      quality: 'medium',
      shadows: true,
      particles: true
    },
    controls: {
      sensitivity: 1.0,
      invertY: false,
      autoRun: false
    },
    audio: {
      master: 0.8,
      effects: 0.8,
      music: 0.6
    }
  },
  isLoading: false,
  error: null
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setPlayer: (player) => {
      set({ player })
      
      // Start survival stats timer when player is set
      if (player) {
        startSurvivalTimer(set, get)
      }
    },

    updatePlayerPosition: (position) => 
      set((state) => ({
        player: state.player ? { ...state.player, position } : null
      })),

    updateSurvivalStats: (stats) =>
      set((state) => ({
        player: state.player ? { ...state.player, survival: stats } : null
      })),

    consumeItem: (itemType) =>
      set((state) => {
        if (!state.player) return state
        
        // Check if player has the item
        const itemIndex = state.inventory.findIndex(item => item.type === itemType)
        if (itemIndex === -1) return state
        
        // Update survival stats
        const newStats = SurvivalManager.consumeItem(state.player.survival, itemType)
        
        // Remove one item from inventory
        const newInventory = [...state.inventory]
        if (newInventory[itemIndex].quantity > 1) {
          newInventory[itemIndex].quantity -= 1
        } else {
          newInventory.splice(itemIndex, 1)
        }
        
        return {
          player: { ...state.player, survival: newStats },
          inventory: newInventory
        }
      }),

    applyDamage: (damage, causesBleed = false) =>
      set((state) => {
        if (!state.player) return state
        
        const newStats = SurvivalManager.applyDamage(state.player.survival, damage, causesBleed)
        
        return {
          player: { ...state.player, survival: newStats }
        }
      }),

    respawnPlayer: () =>
      set((state) => {
        if (!state.player) return state
        
        const newStats = SurvivalManager.respawn(state.player.survival)
        
        return {
          player: { ...state.player, survival: newStats, position: { x: 0, y: 5, z: 0 } }
        }
      }),

    setCurrentIsland: (island) => set({ currentIsland: island }),

    addResource: (resource) =>
      set((state) => {
        const existingIndex = state.inventory.findIndex(
          (item) => item.type === resource.type
        )
        
        if (existingIndex >= 0) {
          const newInventory = [...state.inventory]
          newInventory[existingIndex].quantity += resource.quantity
          return { inventory: newInventory }
        } else {
          return { inventory: [...state.inventory, resource] }
        }
      }),

    removeResource: (resourceType, quantity) =>
      set((state) => {
        const newInventory = state.inventory
          .map((item) =>
            item.type === resourceType
              ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
              : item
          )
          .filter((item) => item.quantity > 0)
        
        return { inventory: newInventory }
      }),

    addBuilding: (building) =>
      set((state) => ({
        buildings: [...state.buildings, building]
      })),

    removeBuilding: (buildingId) =>
      set((state) => ({
        buildings: state.buildings.filter((b) => b.id !== buildingId)
      })),

    addEnemy: (enemy) =>
      set((state) => ({
        enemies: [...state.enemies, enemy]
      })),

    removeEnemy: (enemyId) =>
      set((state) => ({
        enemies: state.enemies.filter((e) => e.id !== enemyId)
      })),

    addWeapon: (weapon) =>
      set((state) => ({
        weapons: [...state.weapons, weapon]
      })),

    removeWeapon: (weaponId) =>
      set((state) => ({
        weapons: state.weapons.filter((w) => w.id !== weaponId)
      })),

    addRaid: (raid) =>
      set((state) => ({
        activeRaids: [...state.activeRaids, raid]
      })),

    updateRaid: (raidId, updates) =>
      set((state) => ({
        activeRaids: state.activeRaids.map((raid) =>
          raid.id === raidId ? { ...raid, ...updates } : raid
        )
      })),

    addMarketplaceOrder: (order) =>
      set((state) => ({
        marketplaceOrders: [...state.marketplaceOrders, order]
      })),

    removeMarketplaceOrder: (orderId) =>
      set((state) => ({
        marketplaceOrders: state.marketplaceOrders.filter((o) => o.id !== orderId)
      })),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    updateGameSettings: (settings) =>
      set((state) => ({
        gameSettings: {
          ...state.gameSettings,
          ...settings,
          graphics: { ...state.gameSettings.graphics, ...settings.graphics },
          controls: { ...state.gameSettings.controls, ...settings.controls },
          audio: { ...state.gameSettings.audio, ...settings.audio }
        }
      })),

    connectToMultiplayer: (players) =>
      set((state) => ({
        multiplayerState: {
          ...state.multiplayerState,
          connectedPlayers: players,
          isHost: players.length === 1
        }
      })),

    disconnectFromMultiplayer: () =>
      set((state) => ({
        multiplayerState: {
          ...state.multiplayerState,
          connectedPlayers: [],
          isHost: false
        }
      })),

    reset: () => set(initialState)
  }))
)

// Survival stats timer
let survivalTimerInterval: NodeJS.Timeout | null = null

const startSurvivalTimer = (
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore
) => {
  // Clear existing timer
  if (survivalTimerInterval) {
    clearInterval(survivalTimerInterval)
  }
  
  // Update stats every 10 seconds
  survivalTimerInterval = setInterval(() => {
    const state = get()
    if (!state.player) return
    
    const now = new Date()
    const lastUpdate = new Date(state.player.survival.lastStatUpdate)
    const deltaMs = now.getTime() - lastUpdate.getTime()
    
    // Only update if significant time has passed (more than 5 seconds)
    if (deltaMs > 5000) {
      const newStats = SurvivalManager.updateStats(
        state.player.survival,
        deltaMs,
        state.player.isOnline
      )
      
      set({
        player: { ...state.player, survival: newStats }
      })
      
      // Check for respawn
      if (SurvivalManager.shouldRespawn(newStats)) {
        // Auto-respawn after 3 seconds
        setTimeout(() => {
          const currentState = get()
          if (currentState.player && SurvivalManager.shouldRespawn(currentState.player.survival)) {
            const respawnStats = SurvivalManager.respawn(currentState.player.survival)
            set({
              player: { 
                ...currentState.player, 
                survival: respawnStats, 
                position: { x: 0, y: 5, z: 0 } 
              }
            })
          }
        }, 3000)
      }
    }
  }, 10000) // Check every 10 seconds
}

// Selectors for optimized subscriptions
export const selectPlayer = (state: GameStore) => state.player
export const selectIsland = (state: GameStore) => state.currentIsland
export const selectInventory = (state: GameStore) => state.inventory
export const selectBuildings = (state: GameStore) => state.buildings
export const selectEnemies = (state: GameStore) => state.enemies
export const selectWeapons = (state: GameStore) => state.weapons
export const selectActiveRaids = (state: GameStore) => state.activeRaids
export const selectMarketplaceOrders = (state: GameStore) => state.marketplaceOrders
export const selectMultiplayerState = (state: GameStore) => state.multiplayerState
export const selectGameSettings = (state: GameStore) => state.gameSettings 