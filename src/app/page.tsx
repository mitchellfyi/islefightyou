'use client'

import { useEffect, useState } from 'react'
import { GameCanvas } from '@/game/GameCanvas'
import { useGameStore } from '@/stores/gameStore'
import { createWorldGenerator, generateSeed } from '@/game/generation/WorldGenerator'
import { ResourceType } from '@/types/game'
import { SurvivalManager } from '@/game/systems/SurvivalManager'
import { terrainNoise } from '@/game/utils/noise'
import { hexagonalTerrain } from '@/game/utils/hexagonalTerrain'
import { motion } from 'framer-motion'

export default function GamePage() {
  const { 
    player,
    currentIsland,
    inventory,
    isLoading,
    error,
    setPlayer, 
    setCurrentIsland, 
    addResource, 
    setLoading, 
    setError 
  } = useGameStore()
  
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate loading time for realistic feel
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create a demo player
      const demoPlayer = {
        id: 'demo-player-' + Date.now(),
        username: 'Player',
        email: 'demo@game.com',
        level: 1,
        experience: 0,
        survival: SurvivalManager.createDefaultStats(),
        position: { x: 0, y: 0, z: 0 }, // Will be set to terrain height later
        rotation: { x: 0, y: 0, z: 0 },
        inventory: [],
        weapons: [],
        economy: {
          gold: 100,
          pearls: 0,
          threatScore: 1,
          islandRadius: 32
        },
        isOnline: true,
        isRaidable: false, // Start with PvP disabled
        lastActive: new Date()
      }

      // Generate a new island
      const worldGenerator = createWorldGenerator(generateSeed())
      const island = worldGenerator.generateIsland({
        seed: generateSeed(),
        size: 64, // 64x64 island
        playerId: demoPlayer.id,
        name: `${demoPlayer.username}'s Island`
      })

      // Add some starter resources
      addResource({ type: ResourceType.WOOD, quantity: 10 })
      addResource({ type: ResourceType.STONE, quantity: 5 })
      addResource({ type: ResourceType.FISH, quantity: 3 })
      addResource({ type: ResourceType.COCONUT, quantity: 2 })
      addResource({ type: ResourceType.BANDAGE, quantity: 1 })

      // Set the game state
      setCurrentIsland(island)
      
      // Position player on terrain at center of island
      const terrainHeight = hexagonalTerrain.getHeight(0, 0)
      const playerWithPosition = {
        ...demoPlayer,
        position: { x: 0, y: terrainHeight + 0.8, z: 0 } // 0.8 units above terrain
      }
      setPlayer(playerWithPosition)
      
      // Debug log to verify island generation
      console.log('🏝️ Island generated successfully!', {
        size: island.size,
        resourceNodes: island.resourceNodes.length,
        heightMapSize: `${island.heightMap.length}x${island.heightMap[0]?.length}`,
        sampleHeight: island.heightMap[32]?.[32],
        sampleResource: island.resourceNodes[0],
        playerStartHeight: terrainHeight
      })
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize game:', error)
      setError('Failed to initialize game. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isInitialized || isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={initializeGame} />
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      <GameCanvas className="w-full h-full" />
    </div>
  )
}

// Loading Screen Component
function LoadingScreen() {
  const [loadingText, setLoadingText] = useState('Initializing...')

  useEffect(() => {
    const messages = [
      'Generating your island...',
      'Placing resources...',
      'Setting up the world...',
      'Almost ready...'
    ]
    
    let messageIndex = 0
    const interval = setInterval(() => {
      setLoadingText(messages[messageIndex])
      messageIndex = (messageIndex + 1) % messages.length
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Splash Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/splash-background.png)' }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/assets/logo_transparent.png" 
            alt="Isle Fight You Logo" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl"
          />
        </div>
        
        {/* Loading Spinner */}
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mb-8 animate-spin" />
        
        {/* Loading Text */}
        <div className="text-white text-center">
          <div className="animate-pulse text-xl font-semibold mb-2">{loadingText}</div>
          <div className="text-sm text-blue-200">Paradise punches back...</div>
        </div>
      </div>
    </div>
  )
}

// Error Screen Component
function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        {/* Game Logo */}
        <div className="mb-6">
          <img 
            src="/assets/logo_transparent.png" 
            alt="Isle Fight You" 
            className="w-32 h-auto mx-auto drop-shadow-lg"
          />
        </div>
        
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
        <p className="text-red-200 mb-8">{error}</p>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-white text-red-900 rounded-lg font-semibold hover:bg-red-50 transition-colors hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  )
} 