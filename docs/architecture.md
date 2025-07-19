# Game Architecture Overview

The project uses Next.js 14 with React Three Fiber for rendering a 3D island scene.
Below are the main modules:

## src/app
- `page.tsx` initializes the demo player and island.
- `layout.tsx` contains application metadata and global styles.

## src/game
- `GameCanvas.tsx` sets up the Three.js canvas and renders the scene.
- `Island.tsx` renders terrain, resource nodes and buildings.
- `Player.tsx` shows the player model with health and name tags.
- `generation/WorldGenerator.ts` creates procedural islands with simplex noise.
- `controls/TouchControls.tsx` provides mobile controls.
- `systems/SurvivalManager.ts` handles hunger, thirst, bleed and health logic.
- `ui/` contains HUD components like `UI`, `Inventory`, `BuildMenu`, and `Settings`.

## src/stores
- `gameStore.ts` manages game state with Zustand. Use this store to update
  player position, inventory, buildings and other data.

## src/types
- `game.ts` defines shared TypeScript types for players, islands, resources,
  enemies and settings.

The database schema for Supabase lives in `supabase-schema.sql`.
