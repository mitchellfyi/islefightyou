'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the Canvas to prevent SSR issues
const GameCanvasClient = dynamic(() => import('./GameCanvasClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-white text-lg">Loading 3D World...</div>
    </div>
  )
})

interface GameCanvasProps {
  className?: string
}

export function GameCanvas({ className }: GameCanvasProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading Game...</div>
      </div>
    }>
      <GameCanvasClient className={className} />
    </Suspense>
  )
} 