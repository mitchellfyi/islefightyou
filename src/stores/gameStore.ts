import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { GameState, Player, Island, Position, Resource, Building, Enemy } from '@/types/game'

interface GameStore extends GameState {
  // Actions
  setPlayer: (player: Player | null) => void
  updatePlayerPosition: (position: Position) => void
  setCurrentIsland: (island: Island | null) => void
  addResource: (resource: Resource) => void
  removeResource: (resourceType: string, quantity: number) => void
  addBuilding: (building: Building) => void
  removeBuilding: (buildingId: string) => void
  addEnemy: (enemy: Enemy) => void
  removeEnemy: (enemyId: string) => void
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

    setPlayer: (player) => set({ player }),

    updatePlayerPosition: (position) => 
      set((state) => ({
        player: state.player ? { ...state.player, position } : null
      })),

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

// Selectors for optimized subscriptions
export const selectPlayer = (state: GameStore) => state.player
export const selectIsland = (state: GameStore) => state.currentIsland
export const selectInventory = (state: GameStore) => state.inventory
export const selectBuildings = (state: GameStore) => state.buildings
export const selectEnemies = (state: GameStore) => state.enemies
export const selectMultiplayerState = (state: GameStore) => state.multiplayerState
export const selectGameSettings = (state: GameStore) => state.gameSettings 