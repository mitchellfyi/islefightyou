# Isle Fight You 🏝️🔫

Paradise punches back.

A browser‑based island builder with guns, coconuts, and enough PvP to ruin even the sunniest holiday. Runs in WebGL, hosted on Vercel, backed by Supabase. Built for mobile first but plays fine on your 34‑inch ultrawide if you must.

## Why This Exists

Animal Crossing is lovely until you realise Tom Nook deserves a left hook. Minecraft is great but you can't board someone else's boat and steal their iron. Isle Fight You fixes these grave design flaws while still letting you potter about planting palm trees.

## Features

- 🏝️ **Procedural Islands** - Each player gets a deterministic 64×64‑chunk atoll
- 🔫 **PvP Raids (opt‑in)** - Sail to any online player, nick their Island Core, escape
- 🦅 **AI Threats** - Seagull dive‑bombs, pirate skiffs, burrowing crabs
- 🔫 **Firearms** - Four tiers from Rusty Revolver to Tesla Harpoon
- 💀 **Survival Stats** - Health, Hunger, Thirst, Bleed that tick while offline
- 🏚️ **Light Decay** - Blocks lose 0.5% HP per real‑world day
- 💰 **Two‑tier Economy** - Gold for necessities, Pearls for cosmetics
- 📱 **Mobile First** - Touch joystick, tap‑to‑shoot, swipe build wheel

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **3D Engine**: Three.js with React Three Fiber
- **Database**: Supabase
- **Real-time**: Socket.io
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Development Status

**Current Phase:** Phase 1 Foundation (Core Slice)

### ✅ Recently Completed
- Enhanced character model with natural proportions and animations
- Smooth natural terrain system replacing blocky voxels  
- Terrain following mechanics with physics-based jumping
- Mobile-optimized controls with touch support
- Performance improvements for low-end devices

### 🔄 Next Priorities
1. Resource gathering mechanics (trees, rocks, coconuts)
2. Basic crafting system (campfire, tools)
3. Survival stats implementation (health, hunger, thirst)
4. Combat foundation (first weapon prototype)

📋 **[View Complete Development Roadmap](docs/ROADMAP.md)**

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Game Configuration
   NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Game Architecture

- **Island Generation**: Procedural generation using simplex noise
- **Resource System**: Mining, farming, and crafting mechanics
- **Combat System**: Real-time PvP and AI enemy interactions
- **Building System**: Place and upgrade structures
- **Multiplayer**: Real-time synchronization of player actions

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript checks
- `npm run lint` - Run ESLint

## Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the gaming community 