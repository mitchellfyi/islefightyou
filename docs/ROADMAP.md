# Isle Fight You – Development Roadmap 🏝️

**Paradise punches back.**

*Dates are relative – "Week 0" is the day engineering kicks off. Shift left or right as bandwidth allows.*

---

## 🏝️ Phase 0 – Pre-production (Week 0-2)
**Goal:** Lock vision, derisk tech.

### Core Deliverables
- **Design spike** – Finalise Moment One flow, paper prototype the gather-craft-raid loop
- **Tech spike** – R3F render perf on iPhone SE + low-end Android; measure polygon & shader budgets
- **Procedural seed draft** – 64×64 chunk grid, noise tuning for beach/grass split
- **Art style-test** – Two tileable textures, one palm tree, one rusty barrel; verify palette pops at dusk/night

### Status: ✅ **COMPLETED**
- Natural terrain system implemented with heightmap generation
- Enhanced character model with improved aesthetics
- Performance optimized for mobile devices
- Smooth terrain following and jump mechanics

---

## 🪨 Phase 1 – Core Slice (Week 3-6) **HIGH PRIORITY**
**Goal:** Playable "vertical slice" you can show investors and friends.

### Gathering & Crafting
- [ ] **Chop palm, mine rock, collect coconut** – Resource harvesting mechanics
- [ ] **Craft campfire and rusty slingshot** – Basic crafting system
- [ ] **Terrain diffs saved** – Delta writes to `island_changes` table

### Player Experience
- [x] **Third-person controller** – Joystick, jump, basic movement ✅
- [ ] **Basic combat roll** – Evasive maneuvers
- [ ] **Survival HUD v0** – Health, Hunger, Thirst icons; ticking while online only
- [ ] **Dockmaster quick-sell** – Convert materials → Gold at static prices

### Combat Foundation
- [ ] **Gun prototype** – Rusty Revolver; hitscan with server validation
- [ ] **Basic AI raid** – Seagull swarm that strafes huts at night

### Infrastructure
- [ ] **Edge cron** – Resources respawn, crops grow, block decay (0.5%/day)

### Exit Criteria
- [ ] **15-minute loop feels punchy**
- [ ] **Slice runs 60 fps on Pixel 6**

---

## ⚔️ Phase 2 – "Friends Can Break It" Alpha (Week 7-10)
**Goal:** On-device playtest with real users.

### Multiplayer Core
- [ ] **1v1 PvP matchmaking** – Only if both players online ≤30ms ping range
- [ ] **Island Core raid objective** – Steal crystal, escape to boat

### Combat Evolution
- [ ] **Gun Tier II** – Scrap SMG, craftable ammo system
- [ ] **Threat Score + MMR** – Bracket matchmaking, scale AI raid size

### Analytics & Testing
- [ ] **Analytics hook** – PostHog funnel: Create → First build → First raid
- [ ] **Bug-smash sprint** – Memory, input buffering, edge-case exploits

### Exit Criteria
- [ ] **100 external testers complete ≥3 raids each**
- [ ] **Churn data captured and analyzed**

---

## 💰 Phase 3 – Economy & Retention (Week 11-15)
**Goal:** Keep players logging in and drain surplus Gold.

### Economic Systems
- [ ] **Dynamic Dockmaster pricing** – Scarcity modifier based on supply/demand
- [ ] **Global marketplace** – Order-book system, 5% fee burn
- [ ] **Repairs & decay costs** – Gold + materials curve balancing

### Monetization Framework
- [ ] **Fast-travel ferry** – Gold sink for convenience
- [ ] **Cosmetics framework** – Skin slots, Pearl store (Stripe sandbox)
- [ ] **Season Pass scaffolding** – 60 tiers, XP tracking system

### Engagement
- [ ] **Push notifications** – Crop ready, sale completed, raid alert

---

## 🌊 Phase 4 – Social & Live Ops (Week 16-22)
**Goal:** Make the island feel like an MMO in disguise.

### Social Features
- [ ] **Beach-bar social hub** – Emotes, jukebox, ad-hoc trades
- [ ] **Message-in-a-bottle notes** – Lightweight UGC, moderation tools

### Enhanced Mobility
- [ ] **Zip-vine traversal + grappling hook** – Island mobility overhaul

### Live Events
- [ ] **Fishing tournament event** – Recurring Gold sink, leaderboard competition
- [ ] **Kraken "full-moon" boss** – Server-wide alert, tentacle raid mechanics

### Content Pipeline
- [ ] **Internal tools** – Seasonal drops (asset swap, loot tables)

---

## 🚀 Phase 5 – Expansion & Polish (Week 23-30)
**Goal:** Grow breadth, tighten screws, prep marketing push.

### Advanced Combat
- [ ] **Tier III & IV firearms** – Speargun, Coral-tech Harpoon, energy effects
- [ ] **Environmental hazards** – Rising tide pools, volcanic ash weather

### Quality of Life
- [ ] **Island passports & pet chicken scout** – Exploration & companion loops
- [ ] **Accessibility** – Colour-blind toggle, one-handed mode
- [ ] **Cross-save & PWA install prompt** – Sticky on mobile home-screens

### Launch Preparation
- [ ] **Full QA pass + localisation** – EN-GB, EN-US, DE, JP
- [ ] **Performance optimization** – Final polish pass

---

## 📈 Ongoing Horizontal Tracks

### Security & Performance
- **Anti-cheat & telemetry** – Run every phase
- **Performance budget** – Profile each sprint; drop LODs >5% over target

### Community
- **Community feedback** – Discord surveys after each public update
- **Developer communication** – Regular roadmap updates

---

## 🎯 TL;DR Priority Ordering

1. **Core loop fun** (Phase 1) – Make the basic game enjoyable
2. **PvP + analytics** (Phase 2) – Enable multiplayer and measure engagement  
3. **Economy + sinks** (Phase 3) – Create sustainable progression systems
4. **Social glue & live events** (Phase 4) – Build community features
5. **Big-ticket content & polish** (Phase 5) – Expand and perfect the experience

### Critical Success Principle
**Kill anything that threatens Phase 1 delivery – momentum beats feature sprawl.**

---

## 📊 Current Status: Phase 1 Foundation

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

The foundation is solid – time to build the core gameplay loop! 🛠️ 