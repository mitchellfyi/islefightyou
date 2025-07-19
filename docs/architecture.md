# Game Architecture Overview

The project uses Next.js 15 with React Three Fiber for rendering a 3D island scene.
Below are the main modules:

## src/app
- `page.tsx` initializes the demo player and island.
- `layout.tsx` contains application metadata and global styles.

## src/game
- `GameCanvas.tsx` wrapper component that dynamically imports GameCanvasClient with SSR disabled.
- `GameCanvasClient.tsx` main Three.js canvas setup with physics, terrain following, and controls.
- `Island.tsx` renders natural heightmap-based terrain with procedural biomes and resources.
- `Player.tsx` enhanced character model with anthropomorphic design and smooth animations.
- `generation/WorldGenerator.ts` creates procedural islands with simplex noise.
- `controls/TouchControls.tsx` provides mobile controls with joystick and jump button.
- `systems/SurvivalManager.ts` handles hunger, thirst, bleed and health logic.
- `ui/` contains HUD components like `UI`, `Inventory`, `BuildMenu`, and `Settings`.

## src/stores
- `gameStore.ts` manages game state with Zustand. Use this store to update
  player position, inventory, buildings and other data.

## src/types
- `game.ts` defines shared TypeScript types for players, islands, resources,
  enemies and settings.

The database schema for Supabase lives in `supabase-schema.sql`.

## Recent Architectural Improvements

### Natural Terrain System
- **Heightmap-based generation**: Smooth terrain using PlaneGeometry with vertex manipulation
- **Biome coloring**: Vertex colors for grassland, forest, beach, mountain, and meadow zones
- **Terrain following**: Real-time height detection using `getTerrainHeightAt()` function
- **Physics integration**: Character automatically sticks to terrain surface with smooth transitions

### Enhanced Character System
- **Anthropomorphic design**: Capsule-based body with realistic proportions
- **Component-based model**: Head, body, arms, legs, feet with individual materials
- **Animation system**: Idle bobbing and rotation for natural character movement
- **Physics integration**: Jump mechanics with gravity and velocity calculations

### Movement & Controls
- **Dual input system**: WASD keyboard controls + mobile touch joystick
- **Jump mechanics**: Space bar / touch button jumping with physics simulation
- **Boundary checking**: Circular island boundaries with smooth enforcement
- **Performance optimized**: 60fps movement and terrain following on mobile devices

### Mobile-First Architecture
- **SSR disabled for 3D**: Dynamic import of GameCanvasClient prevents Three.js SSR issues
- **Touch-optimized**: Virtual joystick with haptic-style button feedback
- **Responsive design**: Automatic mobile detection and appropriate control schemes
- **Performance scaling**: Dynamic DPR adjustment based on device capabilities
