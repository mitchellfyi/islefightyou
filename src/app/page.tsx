'use client'

import { useEffect, useState } from 'react'
import { GameCanvas } from '@/game/GameCanvas'
import { useGameStore } from '@/stores/gameStore'
import { createWorldGenerator, generateSeed } from '@/game/generation/WorldGenerator'
import { ResourceType } from '@/types/game'
import { SurvivalManager } from '@/game/systems/SurvivalManager'
import { motion } from 'framer-motion'

export default function GamePage() {
  const { 
    gameState, 
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
        position: { x: 0, y: 5, z: 0 },
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
      setPlayer(demoPlayer)
      setCurrentIsland(island)
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize game:', error)
      setError('Failed to initialize game. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isInitialized || gameState.isLoading) {
    return <LoadingScreen />
  }

  if (gameState.error) {
    return <ErrorScreen error={gameState.error} onRetry={initializeGame} />
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
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-8"
        />
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 text-shadow"
        >
          🏝️ Isle Fight You
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-blue-200 mb-8"
        >
          Paradise punches back.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white"
        >
          <div className="animate-pulse text-lg">{loadingText}</div>
        </motion.div>
      </div>
    </div>
  )
}

// Error Screen Component
function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
        <p className="text-red-200 mb-8">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-8 py-3 bg-white text-red-900 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          Try Again
        </motion.button>
      </div>
    </div>
  )
} 