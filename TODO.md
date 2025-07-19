# Isle Fight You - Development TODO

**Paradise punches back.** 🏝️🔫

A browser‑based island builder with guns, coconuts, and enough PvP to ruin even the sunniest holiday.

📋 **[📅 View Development Roadmap](docs/ROADMAP.md)** – Full 5-phase development plan with timelines

**Current Phase:** Phase 1 Foundation (Core Slice) – Focus on essential gameplay loop

---

## ✅ **COMPLETED FEATURES**

### 🎯 **Core Foundation**
- [x] **Project Setup** - Next.js 15, React 19, TypeScript, Tailwind CSS *(Updated Dec 2024)*
- [x] **Rebranding** - From "Island Conquest" to "Isle Fight You"
- [x] **Mobile-First Design** - Touch controls, responsive UI, PWA-ready
- [x] **Supabase Integration** - Database schema and client setup
- [x] **3D Engine** - Three.js with React Three Fiber
- [x] **Enhanced Character Model** - Anthropomorphic design with natural animations *(Dec 2024)*
- [x] **Natural Terrain System** - Smooth heightmap-based terrain replacing blocks *(Dec 2024)*
- [x] **Terrain Following** - Physics-based character movement with jumping *(Dec 2024)*

### 🌍 **World & Persistence**
- [x] **Procedural Generation** - Noise-based 64×64 island generation
- [x] **Biome System** - 6 biomes (grassland, forest, desert, mountain, beach, swamp)
- [x] **Resource Distribution** - Biome-specific resource node placement
- [x] **3D Terrain Rendering** - Height maps with vertex coloring

### 💀 **Survival System**
- [x] **Health/Hunger/Thirst/Bleed** - Full stat system with real-time ticking
- [x] **Consumable Items** - Click-to-use food, drinks, medical supplies
- [x] **Stat Penalties** - Hunger blocks regen, thirst reduces sprint speed
- [x] **Bleed Stacking** - Up to 5 stacks, 2 HP per 10 seconds
- [x] **Auto-Respawn** - 3-second delay with stat penalties
- [x] **Offline Protection** - Can't die from hunger when logged out

### 🎮 **Game Interface**
- [x] **Survival HUD** - Real-time health, hunger, thirst, bleed indicators
- [x] **Resource Counter** - Top-right inventory display
- [x] **Economy Display** - Gold and Pearl counters
- [x] **Warning System** - Yellow alerts for critical stats
- [x] **Interactive Inventory** - Click consumables to use them

### 📱 **Mobile Controls**
- [x] **Virtual Joystick** - Smooth movement with dead zones
- [x] **Touch Action Buttons** - Attack, heal, inventory access
- [x] **Responsive Layout** - Adapts to mobile/desktop
- [x] **Touch Optimizations** - No zoom, proper tap handling

### 🏗️ **Basic Systems**
- [x] **Game State Management** - Zustand store with survival integration
- [x] **Resource System** - 14 resource types (food, materials, ammo, medical)
- [x] **Player Movement** - 3D character with smooth animations
- [x] **Loading System** - Animated loading screen with progress messages

---

## 🚧 **IN PROGRESS**

### 🔫 **Combat System** *(Current Priority)*
- [ ] **Weapon Framework** - Base weapon class with stats
- [ ] **Hitscan Bullets** - Client prediction, server validation (100ms window)
- [ ] **Weapon Tiers** - Rusty Revolver → Reef Rifle → Coral Cannon → Tesla Harpoon
- [ ] **Projectile Harpoons** - Deterministic physics simulation
- [ ] **Ammo System** - Different ammo types per weapon tier

## 🐛 **RECENT FIXES**
- [x] **Store Access Bug** - Fixed undefined gameState errors in components
- [x] **Resource Type Updates** - Updated world generation for new resource system
- [x] **Building Type Support** - Added Island Core and new building geometries

---

## 📋 **TODO - HIGH PRIORITY**

### ⚔️ **Combat & Weapons**
- [ ] **Weapon Crafting** - Blueprint system for weapon upgrades
- [ ] **Durability System** - Weapons degrade with use, need repairs
- [ ] **Mobile Combat UI** - Tap-to-shoot, weapon selection wheel
- [ ] **Damage Numbers** - Visual feedback for hits
- [ ] **Recoil & Accuracy** - Weapon handling mechanics

### 🏴‍☠️ **PvP Raiding System**
- [ ] **Opt-in PvP Flag** - Toggle raidable status
- [ ] **Island Core** - Central objective that can be stolen
- [ ] **Raid Matchmaking** - Sail to online players' islands
- [ ] **Loot Theft** - Steal 20% of unsecured resources
- [ ] **Raid Protection** - Can't raid offline players
- [ ] **Escape Mechanics** - Get away with stolen goods

### 🤖 **AI Threat System**
- [ ] **Seagull Dive-Bombs** - Aerial attacks from above
- [ ] **Pirate Skiffs** - Naval enemies arriving by sea
- [ ] **Burrowing Crabs** - Underground enemies emerging from sand
- [ ] **Threat Scaling** - Enemy difficulty based on player Threat Score
- [ ] **Nightly Swarms** - Regular AI raids during specific times

### 🏚️ **Decay & Maintenance**
- [ ] **Block Decay** - 0.5% HP loss per real-world day
- [ ] **Repair System** - Gold + materials to fix structures
- [ ] **Decay Visualization** - Visual indicators of building health
- [ ] **Maintenance Costs** - Ongoing resource sink

---

## 📋 **TODO - MEDIUM PRIORITY**

### 🏗️ **Building System**
- [ ] **Building Placement** - 3D structure placement with collision
- [ ] **Building Types** - Houses, workshops, turrets, walls, storage
- [ ] **Island Core** - Raidable central structure
- [ ] **Defense Structures** - Automated turrets, barricades
- [ ] **Building Upgrades** - Multi-level progression system

### 💰 **Economy System**
- [ ] **Two-Tier Currency** - Gold (gameplay) + Pearls (cosmetics)
- [ ] **Dockmaster Quick-Sell** - One-tap resource → Gold conversion
- [ ] **Dynamic Pricing** - Hourly price fluctuations
- [ ] **Gold Sinks** - Repairs, expansions, fast travel
- [ ] **Island Expansion** - Purchase larger build radius

### 🏪 **Marketplace**
- [ ] **Order Book System** - Global buy/sell orders
- [ ] **5% Transaction Fee** - Gold burned on each trade
- [ ] **Order Limits** - Max 20 live orders per player
- [ ] **Market UI** - Clean trading interface
- [ ] **Price History** - Charts and trends

### 🗺️ **World Persistence**
- [ ] **Chunk System** - Save only diffs, not full maps
- [ ] **Modification Tracking** - Delta compression for efficiency
- [ ] **Chunk Loading** - Stream world data as needed
- [ ] **Memory Optimization** - Unload distant chunks

---

## 📋 **TODO - LOW PRIORITY**

### 🍳 **Crafting System**
- [ ] **Recipe Framework** - Blueprint-based crafting
- [ ] **Crafting Stations** - Workshop, campfire, repair bench
- [ ] **Progressive Unlocks** - Level-gated recipes
- [ ] **Batch Crafting** - Queue multiple items
- [ ] **Auto-Crafting** - Set-and-forget production

### 🌊 **Advanced World Features**
- [ ] **Ocean System** - Swimmable water with depth
- [ ] **Weather Effects** - Rain affects visibility, storms damage structures
- [ ] **Day/Night Cycle** - Different AI behavior at night
- [ ] **Tides** - Water level changes affect gameplay

### 🎨 **Polish & Quality of Life**
- [ ] **Audio System** - Music, sound effects, spatial audio
- [ ] **Particle Effects** - Weapon muzzle flash, hit effects
- [ ] **Animation System** - Better character animations
- [ ] **Settings Panel** - Graphics, audio, control options
- [ ] **Tutorial** - New player onboarding

### 📊 **Analytics & Admin**
- [ ] **Player Stats** - XP, kill/death ratios, playtime
- [ ] **Leaderboards** - Top players by various metrics
- [ ] **Admin Tools** - Moderation, player management
- [ ] **Telemetry** - Performance monitoring, crash reporting

---

## ⚡ **TECHNICAL DEBT**

### 🔧 **Backend Infrastructure**
- [ ] **Supabase Edge Functions** - Crop aging, resource respawn, decay
- [ ] **Real-time Multiplayer** - Socket.io for live PvP
- [ ] **Session Management** - Proper online/offline state tracking
- [ ] **Anti-cheat** - Server-side validation for critical actions

### 🚀 **Performance**
- [ ] **3D Optimization** - LOD system, frustum culling
- [ ] **Mobile Performance** - 60fps on mid-range Android
- [ ] **Memory Management** - Garbage collection optimization
- [ ] **Asset Compression** - Smaller textures, model optimization

### 🛡️ **Security & Reliability**
- [ ] **Input Validation** - Sanitize all user inputs
- [ ] **Rate Limiting** - Prevent API abuse
- [ ] **Error Boundaries** - Graceful error handling
- [ ] **Backup System** - Player data protection

---

## 🎯 **MILESTONE TARGETS**

### 🎮 **MVP (Minimum Viable Product)**
*Target: Core 6-8 minute gameplay loop*
- Survival stats ✅
- Basic combat system 🚧
- Simple building placement
- AI enemy spawns
- Resource gathering
- Death/respawn cycle

### 🏴‍☠️ **PvP Alpha**
*Target: "Paradise punches back" experience*
- All weapon tiers
- Opt-in PvP raiding
- Island Core theft
- Basic marketplace
- Threat scaling AI

### 🏆 **Full Release**
*Target: Complete Isle Fight You experience*
- All systems complete
- Polished UI/UX
- Mobile optimization
- Anti-cheat systems
- Community features

---

## 📝 **DEVELOPMENT NOTES**

### 🔄 **Current Focus**
Working on the **Combat System** - implementing the four weapon tiers with hitscan bullets and projectile harpoons. This is the core of the "paradise punches back" promise.

### 🎯 **Next Sprint**
After combat is complete, priority shifts to **PvP Raiding** - the unique selling point that differentiates us from peaceful island builders.

### 🧪 **Testing Strategy**
- **Survival System**: Fully testable in current build
- **Combat System**: Will add debug weapons for testing
- **PvP System**: Requires multiplayer infrastructure

### 📱 **Mobile Priority**
Every feature must work on mobile first. The game is designed for **6-8 minute mobile sessions** with light idle progression.

---

*Last updated: [Current Date]*
*Build version: 0.1.0-alpha* 