'use client'

import { Canvas } from '@react-three/fiber'
import { Sky, Environment } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { Island, getTerrainHeightAt } from './Island'
import { HexagonalIsland } from './HexagonalIsland'
import { Player } from './Player'
import { TouchControls } from './controls/TouchControls'
import { UI } from './ui/UI'
import { useGameStore } from '../stores/gameStore'
import { ResourceType } from '@/types/game'
import { terrainNoise } from './utils/noise'
import { hexagonalTerrain } from './utils/hexagonalTerrain'

interface GameCanvasClientProps {
  className?: string
}

// Terrain following controller inside Canvas
function TerrainFollowController({ 
  player, 
  currentIsland, 
  isJumping, 
  jumpVelocity, 
  setJumpVelocity, 
  setIsJumping, 
  updatePlayerPosition 
}: {
  player: any
  currentIsland: any
  isJumping: boolean
  jumpVelocity: number
  setJumpVelocity: (v: number) => void
  setIsJumping: (j: boolean) => void
  updatePlayerPosition: (pos: any) => void
}) {
  useFrame((state) => {
    if (!player || !currentIsland) return
    
    // Get terrain height using hexagonal tessellation system
    const currentHeight = hexagonalTerrain.getHeight(player.position.x, player.position.z)
    let newY = player.position.y
    
    // Debug every 120 frames (every 2 seconds)
    if (Math.floor(state.clock.elapsedTime * 60) % 120 === 0) {
      console.log('=== TERRAIN TEST ===')
      console.log('Player XZ:', `${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}`)
      console.log('Terrain Height:', currentHeight.toFixed(2))
      console.log('Player Y:', player.position.y.toFixed(2))
      console.log('Height Difference:', (player.position.y - currentHeight).toFixed(2))
      console.log('Expected: 0.80')
      console.log('==================')
    }
    
    if (isJumping) {
      // Apply jump physics
      newY = player.position.y + jumpVelocity
      const newVelocity = jumpVelocity - 0.015 // Lighter gravity for better feel
      setJumpVelocity(newVelocity)
      
      // Check if landed on terrain
      if (newY <= currentHeight + 0.8) { // Character height offset
        newY = currentHeight + 0.8
        setIsJumping(false)
        setJumpVelocity(0)
      }
    } else {
      // Smooth terrain following with slight interpolation
      const targetY = currentHeight + 0.8 // Character stands 0.8 units above terrain
      const smoothingFactor = 0.15 // Smooth interpolation
      newY = player.position.y + (targetY - player.position.y) * smoothingFactor
      
      // Snap if very close to target
      if (Math.abs(newY - targetY) < 0.01) {
        newY = targetY
      }
    }
    
    // Always update Y position for terrain following
    if (Math.abs(newY - player.position.y) > 0.001) {
      updatePlayerPosition({
        x: player.position.x,
        y: newY,
        z: player.position.z
      })
    }
  })
  
  return null // This component doesn't render anything visual
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

export default function GameCanvasClient({ className = '' }: GameCanvasClientProps) {
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
  const [isJumping, setIsJumping] = useState(false)
  const [jumpVelocity, setJumpVelocity] = useState(0)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard controls with jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault()
        
        // Handle jump
        if (key === ' ' && !isJumping) {
          setIsJumping(true)
          setJumpVelocity(0.25) // More reasonable jump force
        } else {
          setKeysPressed(prev => new Set(prev).add(key))
        }
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
  }, [isJumping])

  const handlePlayerMove = useCallback((direction: Vector3) => {
    if (player && currentIsland) {
      const newX = player.position.x + direction.x
      const newZ = player.position.z + direction.z
      
      // Check if new position is within island boundaries and not blocked by obstacles
      if (isPositionValid(newX, newZ) && !isPositionBlocked(newX, newZ, currentIsland)) {
        // Only update X and Z, let terrain following handle Y
        updatePlayerPosition({
          x: newX,
          y: player.position.y, // Keep current Y, terrain following will update it
          z: newZ
        })
      }
    }
  }, [player, currentIsland, updatePlayerPosition])

  // Check if a position is within the island boundaries
  const isPositionValid = (x: number, z: number): boolean => {
    // Check if position is on solid terrain (above water level)
    const terrainHeight = terrainNoise.islandHeight(x, z)
    return terrainHeight > -2 // Allow movement on land and shallow water
  }

  // Check if a position is blocked by resource nodes (obstacles)
  const isPositionBlocked = (x: number, z: number, island: any): boolean => {
    if (!island?.resourceNodes) return false
    
    const COLLISION_RADIUS = 0.8 // Player collision radius
    const OBSTACLE_RADIUS = 0.6 // Resource node collision radius
    const MIN_DISTANCE = COLLISION_RADIUS + OBSTACLE_RADIUS
    
    for (const node of island.resourceNodes) {
      const dx = x - node.position.x
      const dz = z - node.position.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      
      // If too close to a resource node, block movement
      if (distance < MIN_DISTANCE) {
        return true
      }
    }
    
    return false
  }


  // Handle keyboard movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (keysPressed.size === 0) return
      
      let direction = new Vector3(0, 0, 0)
      const moveSpeed = 0.12 // Balanced speed for terrain following
      
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
          {currentIsland ? (
            <>
              {console.log('🎮 Rendering Hexagonal Island component', currentIsland.id)}
              <HexagonalIsland
                island={currentIsland}
                buildings={buildings}
              />
            </>
          ) : (
            <>
              {console.log('❌ No currentIsland found')}
            </>
          )}

          {player && (
            <Player
              player={player}
              onMove={handlePlayerMove}
            />
          )}

          {/* Terrain Following Controller */}
          <TerrainFollowController 
            player={player}
            currentIsland={currentIsland}
            isJumping={isJumping}
            jumpVelocity={jumpVelocity}
            setJumpVelocity={setJumpVelocity}
            setIsJumping={setIsJumping}
            updatePlayerPosition={updatePlayerPosition}
          />

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
          onJump={() => {
            if (!isJumping) {
              setIsJumping(true)
              setJumpVelocity(0.25)
            }
          }}
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