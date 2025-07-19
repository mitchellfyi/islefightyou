# Agent Guidelines

This project is a Next.js/Three.js prototype for a 3D survival game.

- Use **TypeScript** for all new source files.
- Components live under `src/app` or `src/game`.
- Game state is managed with Zustand in `src/stores/gameStore.ts`.
- Keep code formatted with `prettier` defaults (2 spaces, single quotes).
- After changes run:
  ```bash
  npm run type-check
  # `npm run lint` is optional because it prompts for config
  ```
- Document new features in `docs/to_do`.
- See `docs/architecture.md` for an overview of current modules.
- Check `docs/ROADMAP.md` for development phases and priorities.

## Current Development Focus
We're in **Phase 1: Core Slice** focusing on the essential gameplay loop:
1. Resource gathering mechanics
2. Basic crafting system  
3. Survival stats implementation
4. Combat foundation

Priority: **Kill anything that threatens Phase 1 delivery – momentum beats feature sprawl.**
