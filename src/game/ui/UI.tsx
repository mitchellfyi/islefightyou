'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { SurvivalManager } from '@/game/systems/SurvivalManager'
import { Inventory } from './Inventory'
import { Settings } from './Settings'
import { BuildMenu } from './BuildMenu'

export function UI() {
  const { 
    player,
    inventory,
    isLoading,
    error,
    multiplayerState,
    setError
  } = useGameStore()
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  // Update survival warnings
  useEffect(() => {
    if (player) {
      const newWarnings = SurvivalManager.getWarnings(player.survival)
      setWarnings(newWarnings)
    }
  }, [player?.survival])

  if (!player) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex items-center gap-4">
            {/* Health */}
            <div className="flex items-center gap-2">
              <span>❤️</span>
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(player.survival.health / player.survival.maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-xs">{Math.round(player.survival.health)}/{player.survival.maxHealth}</span>
            </div>

            {/* Hunger */}
            <div className="flex items-center gap-2">
              <span>🍖</span>
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${(player.survival.hunger / player.survival.maxHunger) * 100}%` }}
                />
              </div>
              <span className="text-xs">{Math.round(player.survival.hunger)}</span>
            </div>

            {/* Thirst */}
            <div className="flex items-center gap-2">
              <span>💧</span>
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(player.survival.thirst / player.survival.maxThirst) * 100}%` }}
                />
              </div>
              <span className="text-xs">{Math.round(player.survival.thirst)}</span>
            </div>

            {/* Bleed Status */}
            {player.survival.bleed > 0 && (
              <div className="flex items-center gap-2">
                <span>🩸</span>
                <span className="text-xs text-red-400">x{player.survival.bleed}</span>
              </div>
            )}

            {/* Level */}
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span className="text-sm">Lv.{player.level}</span>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-2">
              <span>📈</span>
              <span className="text-xs">{player.experience} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Counter & Economy */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white space-y-3">
          {/* Economy */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>{player.economy.gold}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💎</span>
              <span>{player.economy.pearls}</span>
            </div>
          </div>
          
          {/* Resources */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {inventory.slice(0, 6).map((resource) => (
              <div key={resource.type} className="flex items-center gap-1">
                <span>{getResourceIcon(resource.type)}</span>
                <span>{resource.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multiplayer Status */}
      {multiplayerState.connectedPlayers.length > 0 && (
        <div className="absolute top-20 right-4 pointer-events-auto">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="text-xs mb-2">Players Online</div>
            <div className="space-y-1">
              {multiplayerState.connectedPlayers.slice(0, 5).map((connectedPlayer) => (
                <div key={connectedPlayer.id} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{connectedPlayer.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar (Desktop) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto hidden md:block">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <div className="flex gap-2">
            <ActionButton
              icon="🎒"
              label="Inventory"
              onClick={() => togglePanel('inventory')}
              active={activePanel === 'inventory'}
            />
            <ActionButton
              icon="🏗️"
              label="Build"
              onClick={() => togglePanel('build')}
              active={activePanel === 'build'}
            />
            <ActionButton
              icon="⚙️"
              label="Settings"
              onClick={() => togglePanel('settings')}
              active={activePanel === 'settings'}
            />
          </div>
        </div>
      </div>

      {/* Debug Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => useGameStore.getState().applyDamage(10, true)}
              className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Take Damage
            </button>
          </div>
        </div>
      </div>

      {/* Panels */}
      <AnimatePresence>
        {activePanel === 'inventory' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <Inventory onClose={() => setActivePanel(null)} />
          </motion.div>
        )}

        {activePanel === 'build' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <BuildMenu onClose={() => setActivePanel(null)} />
          </motion.div>
        )}

        {activePanel === 'settings' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <Settings onClose={() => setActivePanel(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      {/* Survival Warnings */}
      {warnings.length > 0 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-yellow-500 text-black rounded-lg p-4 max-w-md">
            <h3 className="font-bold mb-2">⚠️ Warning</h3>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-red-500 text-white rounded-lg p-4 max-w-md">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Action Button Component
function ActionButton({ 
  icon, 
  label, 
  onClick, 
  active 
}: { 
  icon: string
  label: string
  onClick: () => void
  active: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-lg transition-colors
        ${active ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </motion.button>
  )
}

// Resource icon helper
function getResourceIcon(type: string): string {
  switch (type) {
    case 'wood': return '🪵'
    case 'stone': return '🪨'
    case 'metal': return '⚙️'
    case 'coral': return '🪸'
    case 'fish': return '🐟'
    case 'cooked_fish': return '🍖'
    case 'coconut': return '🥥'
    case 'berries': return '🫐'
    case 'bandage': return '🩹'
    case 'first_aid_kit': return '🏥'
    case 'basic_ammo': return '🔫'
    case 'advanced_ammo': return '💥'
    case 'harpoon': return '🔱'
    case 'energy_cell': return '🔋'
    case 'pearl_fragment': return '💎'
    case 'crystal': return '💎'
    default: return '📦'
  }
} 