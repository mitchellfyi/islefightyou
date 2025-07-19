'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Environment } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import { Vector3 } from 'three'
import { Island } from './Island'
import { Player } from './Player'
import { TouchControls } from './controls/TouchControls'
import { UI } from './ui/UI'
import { useGameStore } from '../stores/gameStore'

interface GameCanvasProps {
  className?: string
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

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handlePlayerMove = (direction: Vector3) => {
    if (player) {
      const newPosition = {
        x: player.position.x + direction.x,
        y: player.position.y + direction.y,
        z: player.position.z + direction.z
      }
      updatePlayerPosition(newPosition)
    }
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        ref={canvasRef}
        camera={{
          position: [10, 10, 10],
          fov: 60,
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

          {/* Camera Controls */}
          {!isMobile && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
              dampingFactor={0.1}
              enableDamping
            />
          )}
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