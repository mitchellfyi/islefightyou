'use client'

import { Canvas } from '@react-three/fiber'
import { Sky, Environment } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { Island } from './Island'
import { Player } from './Player'
import { TouchControls } from './controls/TouchControls'
import { UI } from './ui/UI'
import { useGameStore } from '../stores/gameStore'
import { ResourceType } from '@/types/game'

interface GameCanvasProps {
  className?: string
}

// Camera controller component for smooth following
function CameraController({ target }: { target: Vector3 | null }) {
  const { camera } = useThree()
  const cameraPosition = useRef(new Vector3(10, 15, 10))
  const cameraTarget = useRef(new Vector3(0, 0, 0))
  const [zoomLevel, setZoomLevel] = useState(1)

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const zoomSpeed = 0.001
      const newZoom = Math.max(0.5, Math.min(2, zoomLevel + event.deltaY * zoomSpeed))
      setZoomLevel(newZoom)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [zoomLevel])

  useFrame((state, delta) => {
    if (target) {
      // Isometric camera offset with zoom
      const baseOffset = new Vector3(10, 15, 10)
      const offset = baseOffset.clone().multiplyScalar(zoomLevel)
      const targetCameraPos = new Vector3().copy(target).add(offset)
      
      // Smooth camera movement
      cameraPosition.current.lerp(targetCameraPos, delta * 3)
      cameraTarget.current.lerp(target, delta * 3)
      
      // Update camera
      camera.position.copy(cameraPosition.current)
      camera.lookAt(cameraTarget.current)
    }
  })

  return null
}

export function GameCanvas({ className = '' }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { 
    player,
    currentIsland,
    buildings,
    inventory,
    updatePlayerPosition, 
    consumeItem, 
    applyDamage 
  } = useGameStore()
  const [isMobile, setIsMobile] = useState(false)
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        setKeysPressed(prev => new Set(prev).add(key))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      setKeysPressed(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handlePlayerMove = useCallback((direction: Vector3) => {
    if (player) {
      const newPosition = {
        x: player.position.x + direction.x,
        y: player.position.y + direction.y,
        z: player.position.z + direction.z
      }
      
      // Check if new position is within island boundaries
      if (isPositionValid(newPosition.x, newPosition.z)) {
        updatePlayerPosition(newPosition)
      }
    }
  }, [player, updatePlayerPosition])

  // Check if a position is within the island boundaries
  const isPositionValid = (x: number, z: number): boolean => {
    const ISLAND_SIZE = 32
    const maxRadius = ISLAND_SIZE / 2.5 // Same as island generation
    const distanceFromCenter = Math.sqrt(x * x + z * z)
    return distanceFromCenter <= maxRadius - 1 // Leave 1 block buffer from edge
  }

  // Handle keyboard movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (keysPressed.size === 0) return
      
      let direction = new Vector3(0, 0, 0)
      const moveSpeed = 0.2
      
      // WASD and Arrow Keys
      if (keysPressed.has('w') || keysPressed.has('arrowup')) {
        direction.z -= moveSpeed
      }
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
        direction.z += moveSpeed
      }
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
        direction.x -= moveSpeed
      }
      if (keysPressed.has('d') || keysPressed.has('arrowright')) {
        direction.x += moveSpeed
      }
      
      if (direction.length() > 0) {
        // Normalize diagonal movement
        if (direction.length() > moveSpeed) {
          direction.normalize().multiplyScalar(moveSpeed)
        }
        handlePlayerMove(direction)
      }
    }, 1000 / 60) // 60fps movement

    return () => clearInterval(moveInterval)
  }, [keysPressed, handlePlayerMove])



  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        ref={canvasRef}
        camera={{
          position: [10, 15, 10],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ background: '#87CEEB' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        dpr={isMobile ? 1 : 2} // Lower DPR for mobile performance
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={100}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />

          {/* Environment */}
          <Sky 
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
            rayleigh={0.5}
            turbidity={10}
            mieCoefficient={0.005}
            mieDirectionalG={0.7}
          />

          {/* Game Objects */}
          {currentIsland && (
            <Island
              island={currentIsland}
              buildings={buildings}
            />
          )}

          {player && (
            <Player
              player={player}
              onMove={handlePlayerMove}
            />
          )}

          {/* Camera Controller */}
          <CameraController 
            target={player ? new Vector3(player.position.x, player.position.y + 1, player.position.z) : null} 
          />
        </Suspense>
      </Canvas>

      {/* Mobile Touch Controls */}
      {isMobile && (
        <TouchControls
          onMove={handlePlayerMove}
          onAction={(action) => {
            console.log('Action:', action)
            
            switch (action) {
              case 'attack':
                // Demo: damage self for testing
                applyDamage(10, true)
                break
              case 'heal':
                // Try to consume a healing item
                if (inventory.find(item => item.type === ResourceType.FIRST_AID_KIT)) {
                  consumeItem(ResourceType.FIRST_AID_KIT)
                } else if (inventory.find(item => item.type === ResourceType.BANDAGE)) {
                  consumeItem(ResourceType.BANDAGE)
                } else if (inventory.find(item => item.type === ResourceType.COOKED_FISH)) {
                  consumeItem(ResourceType.COOKED_FISH)
                }
                break
              case 'inventory':
                // This will be handled by the UI panel system
                break
              case 'settings':
                // This will be handled by the UI panel system
                break
            }
          }}
        />
      )}

      {/* Game UI Overlay */}
      <UI />
    </div>
  )
} 