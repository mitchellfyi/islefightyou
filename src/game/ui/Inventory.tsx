'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { ResourceType } from '@/types/game'
import { X } from 'lucide-react'

interface InventoryProps {
  onClose: () => void
}

export function Inventory({ onClose }: InventoryProps) {
  const { gameState, consumeItem } = useGameStore()

  const getResourceIcon = (type: ResourceType): string => {
    switch (type) {
      case ResourceType.WOOD: return '🪵'
      case ResourceType.STONE: return '🪨'
      case ResourceType.METAL: return '⚙️'
      case ResourceType.FOOD: return '🍎'
      case ResourceType.WATER: return '💧'
      case ResourceType.COAL: return '🪨'
      case ResourceType.CRYSTAL: return '💎'
      default: return '📦'
    }
  }

  const getResourceDescription = (type: ResourceType): string => {
    switch (type) {
      case ResourceType.WOOD: return 'Used for basic construction and fuel'
      case ResourceType.STONE: return 'Essential for durable buildings'
      case ResourceType.METAL: return 'Advanced crafting material'
      case ResourceType.CORAL: return 'Underwater building material'
      case ResourceType.FISH: return 'Raw food (+15 hunger)'
      case ResourceType.COOKED_FISH: return 'Nutritious meal (+30 hunger, +10 health)'
      case ResourceType.COCONUT: return 'Refreshing drink (+25 thirst)'
      case ResourceType.BERRIES: return 'Light snack (+10 hunger)'
      case ResourceType.BANDAGE: return 'Stops bleeding (-1 bleed stack)'
      case ResourceType.FIRST_AID_KIT: return 'Full healing (+50 health, stops all bleeding)'
      case ResourceType.BASIC_AMMO: return 'Ammunition for basic weapons'
      case ResourceType.ADVANCED_AMMO: return 'High-damage ammunition'
      case ResourceType.HARPOON: return 'Projectile weapon ammunition'
      case ResourceType.ENERGY_CELL: return 'Power for advanced weapons'
      case ResourceType.PEARL_FRAGMENT: return 'Valuable crafting component'
      case ResourceType.CRYSTAL: return 'Rare magical material'
      default: return 'Unknown resource'
    }
  }

  const isConsumable = (type: ResourceType): boolean => {
    return [
      ResourceType.FISH,
      ResourceType.COOKED_FISH,
      ResourceType.COCONUT,
      ResourceType.BERRIES,
      ResourceType.BANDAGE,
      ResourceType.FIRST_AID_KIT
    ].includes(type)
  }

  const handleItemClick = (type: ResourceType) => {
    if (isConsumable(type)) {
      consumeItem(type)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {gameState.inventory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🎒</div>
              <p className="text-lg">Your inventory is empty</p>
              <p className="text-sm">Gather resources to fill your inventory!</p>
            </div>
          ) : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {gameState.inventory.map((resource, index) => (
                 <motion.div
                   key={`${resource.type}-${index}`}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleItemClick(resource.type)}
                   className={`
                     bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-all
                     ${isConsumable(resource.type) ? 'cursor-pointer hover:bg-green-50 hover:border-green-300' : 'cursor-default'}
                   `}
                 >
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {getResourceIcon(resource.type)}
                    </div>
                    <h3 className="font-semibold text-gray-800 capitalize mb-1">
                      {resource.type}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {resource.quantity}
                    </div>
                                         <p className="text-xs text-gray-600 mb-2">
                       {getResourceDescription(resource.type)}
                     </p>
                     {isConsumable(resource.type) && (
                       <p className="text-xs text-green-600 font-semibold">
                         Click to use
                       </p>
                     )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Items: {gameState.inventory.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span>Inventory Slots: {gameState.inventory.length}/50</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 