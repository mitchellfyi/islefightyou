'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Vector3 } from 'three'
import { motion } from 'framer-motion'

interface TouchControlsProps {
  onMove: (direction: Vector3) => void
  onAction: (action: string) => void
}

export function TouchControls({ onMove, onAction }: TouchControlsProps) {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [isJoystickActive, setIsJoystickActive] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const moveIntervalRef = useRef<NodeJS.Timeout>()

  const joystickRadius = 50
  const moveSpeed = 0.1

  const handleJoystickStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsJoystickActive(true)
    
    const rect = joystickRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    updateJoystickPosition(clientX - centerX, clientY - centerY)
  }, [])

  const handleJoystickMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isJoystickActive) return
    
    const rect = joystickRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    updateJoystickPosition(clientX - centerX, clientY - centerY)
  }, [isJoystickActive])

  const handleJoystickEnd = useCallback(() => {
    setIsJoystickActive(false)
    setJoystickPos({ x: 0, y: 0 })
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current)
    }
  }, [])

  const updateJoystickPosition = useCallback((deltaX: number, deltaY: number) => {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const clampedDistance = Math.min(distance, joystickRadius)
    
    const angle = Math.atan2(deltaY, deltaX)
    const x = Math.cos(angle) * clampedDistance
    const y = Math.sin(angle) * clampedDistance
    
    setJoystickPos({ x, y })
    
    // Convert joystick position to movement vector
    const normalizedX = x / joystickRadius
    const normalizedY = y / joystickRadius
    
    if (Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1) {
      onMove(new Vector3(normalizedX * moveSpeed, 0, normalizedY * moveSpeed))
    }
  }, [onMove, moveSpeed, joystickRadius])

  useEffect(() => {
    if (isJoystickActive) {
      const handleGlobalMove = (e: TouchEvent | MouseEvent) => handleJoystickMove(e)
      const handleGlobalEnd = () => handleJoystickEnd()
      
      document.addEventListener('touchmove', handleGlobalMove, { passive: false })
      document.addEventListener('touchend', handleGlobalEnd)
      document.addEventListener('mousemove', handleGlobalMove)
      document.addEventListener('mouseup', handleGlobalEnd)
      
      return () => {
        document.removeEventListener('touchmove', handleGlobalMove)
        document.removeEventListener('touchend', handleGlobalEnd)
        document.removeEventListener('mousemove', handleGlobalMove)
        document.removeEventListener('mouseup', handleGlobalEnd)
      }
    }
  }, [isJoystickActive, handleJoystickMove, handleJoystickEnd])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Virtual Joystick */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-24 h-24 bg-black/20 rounded-full border-2 border-white/30"
          onTouchStart={handleJoystickStart}
          onMouseDown={handleJoystickStart}
        >
          <motion.div
            className="absolute w-8 h-8 bg-white rounded-full shadow-lg"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: joystickPos.x - 16,
              y: joystickPos.y - 16,
            }}
            transition={{ type: 'tween', duration: 0.1 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <div className="flex flex-col gap-3">
          {/* Attack Button */}
          <motion.button
            className="w-16 h-16 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold"
            whileTap={{ scale: 0.9 }}
            onTouchStart={() => onAction('attack')}
            onClick={() => onAction('attack')}
          >
            ⚔️
          </motion.button>
          
          {/* Build Button */}
          <motion.button
            className="w-16 h-16 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold"
            whileTap={{ scale: 0.9 }}
            onTouchStart={() => onAction('build')}
            onClick={() => onAction('build')}
          >
            🏗️
          </motion.button>
          
          {/* Quick Heal Button */}
          <motion.button
            className="w-16 h-16 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold"
            whileTap={{ scale: 0.9 }}
            onTouchStart={() => onAction('heal')}
            onClick={() => onAction('heal')}
          >
            🏥
          </motion.button>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="absolute top-8 right-8 pointer-events-auto">
        <div className="flex gap-3">
          {/* Inventory Button */}
          <motion.button
            className="w-12 h-12 bg-gray-600 rounded-lg shadow-lg flex items-center justify-center text-white"
            whileTap={{ scale: 0.9 }}
            onTouchStart={() => onAction('inventory')}
            onClick={() => onAction('inventory')}
          >
            🎒
          </motion.button>
          
          {/* Settings Button */}
          <motion.button
            className="w-12 h-12 bg-gray-600 rounded-lg shadow-lg flex items-center justify-center text-white"
            whileTap={{ scale: 0.9 }}
            onTouchStart={() => onAction('settings')}
            onClick={() => onAction('settings')}
          >
            ⚙️
          </motion.button>
        </div>
      </div>
    </div>
  )
} 