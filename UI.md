Modular Immersive UI Design for IsleFightYou Game
Current UI/HUD Implementation Overview
The existing UI in IsleFightYou is built with React (Next.js + React Three Fiber) and Zustand for state management
GitHub
GitHub
. Key elements of the current HUD and UI include:
Survival HUD (Top-Left): Displays the player's Health, Hunger, Thirst, and Bleed status with minimal icons and bars. For example, UI.tsx shows a heart icon with a health bar and value, a meat icon for hunger, and a water drop for thirst
GitHub
GitHub
. Bleed stacks (if any) are shown as a blood drop with a count
GitHub
. The design is already minimal, using semi-transparent black background boxes for readability.
Player Level & XP: The top-left HUD also shows the player's level (⭐ Lv.X) and total experience (📈 XP) in text form
GitHub
. Currently, XP is not a progress bar, just a number.
Resource & Economy Display (Top-Right): A panel shows currency (gold 💰 and pearls 💎) and a quick view of the first few inventory resources
GitHub
GitHub
. This gives the player a snapshot of materials without opening the full inventory.
Multiplayer Status (Top-Right, below resources): If other players are online, a small list displays their usernames (with a green dot)
GitHub
. This is shown only when multiplayerState.connectedPlayers is non-empty.
Desktop Action Bar (Bottom-Center): On desktop (medium+ screens), there is a bottom-centered HUD with three action buttons: Inventory (🎒), Build (🏗️), and Settings (⚙️)
GitHub
GitHub
. These toggle the corresponding UI panels via local component state (activePanel) in UI.tsx. Each button highlights when active, using a small ActionButton sub-component with framer-motion effects
GitHub
GitHub
.
Mobile Touch Controls: On mobile/touch devices, the HUD differs:
A virtual joystick for movement appears at bottom-left
GitHub
.
Action buttons (jump, attack, build, heal) stack at bottom-right
GitHub
GitHub
. These allow core actions via touch (since there is no keyboard/mouse).
Secondary buttons for Inventory (🎒) and Settings (⚙️) are at the top-right
GitHub
GitHub
. These are touch equivalents of the desktop action bar, meant to toggle those panels.
UI Panels (Center Overlay): Toggling the action bar or touch buttons opens modal panels:
Inventory Panel: A fullscreen modal showing all inventory items in a grid
GitHub
GitHub
. Items have icons, quantity, description, and can be clicked to consume if applicable
GitHub
GitHub
. This panel closes on clicking outside or the “X” button
GitHub
.
Build Menu: A modal (currently placeholder) for building structures
GitHub
.
Settings Panel: A modal (placeholder) for game settings
GitHub
.
These panels are toggled by setting activePanel state in UI.tsx and using <AnimatePresence> to animate their mount/unmount
GitHub
GitHub
.
Survival Warnings: A warning overlay appears for critical survival states. The SurvivalManager.getWarnings() method generates messages when stats are low
GitHub
GitHub
. For example:
Health ≤ 20 → “Critical health!”
Hunger ≤ 10 → “Starving – no health regeneration”
Thirst ≤ 10 → “Dehydrated – reduced sprint speed”
Bleed > 0 → “Bleeding (X stacks) – losing health!”
In the UI, if any warnings exist, a yellow alert box with a ⚠️ icon and list of warning texts is shown mid-screen
GitHub
. Currently this is text-only (no distinct icons per warning) and no sound effects.
Loading and Error Overlays: A semi-transparent loading screen appears when isLoading is true
GitHub
, and error messages are shown in a red dialog when error is set in state
GitHub
.
Overall, the current implementation establishes a basic HUD and panel system: health/stats display, inventory/crafting placeholder, settings, warnings, and dual input support (keyboard vs. touch) with separate UI controls. This provides a solid foundation to build an improved, DayZ-inspired minimalistic UI.
Design Goals for the New UI System
Building on this foundation, we will design a modular, immersive UI with the following goals:
Minimal Always-On HUD: In the spirit of DayZ, keep on-screen HUD elements to a minimum. Display only essential survival information: Health, Stamina, Hunger, Thirst, and Equipped Item(s). Use compact icons/bars and hide or fade elements when values are normal to reduce clutter. The HUD should never distract from the game world.
Critical State Warnings with Multi-Modal Feedback: Provide clear on-screen alerts for critical conditions like starvation, dehydration, drowning, encumbrance, etc. Use a combination of UI text, icons, and audio cues to warn the player. For example, flashing icons or a heartbeat sound at critical health, a blinking water-drop icon and coughing sound for dehydration, etc.
Cross-Platform Input Parity: Ensure all gameplay actions and UI features are accessible on both keyboard/mouse and touch input. Desktop players may use keys or mouse clicks, while mobile players have touch buttons – but both should be able to do the same things (open inventory, check map, etc.) with equal ease.
Toggleable UI Modules: Implement distinct UI panels for Inventory, Crafting, Map, Settings, etc., which players can show or hide on demand. These act as in-game menus that do not clutter the screen when not needed. The player can toggle them via hotkeys or on-screen buttons, and they should pause or overlay the game as appropriate (maintaining pointer interactivity while open).
Future-Proof Modularity: Architect the HUD and UI components so that new features (e.g. skill bars, XP progression meter, temperature gauge, multiplayer party status, quest logs) can be plugged in easily. The system should be data-driven where possible (e.g. generate HUD elements from a config or state) to avoid hardcoding, and use reusable components/styles for consistency.
With these objectives in mind, below is a detailed architecture and implementation plan for the revamped UI system.
Proposed Modular UI Architecture
1. Minimal HUD Layout (Health, Stamina, Hunger, Thirst, Equipped Items)
Essential Status Bars: We will display the four core survival stats (health, stamina, hunger, thirst) as small horizontal bars with icons, similar to the current health/hunger/thirst UI. To maintain a minimal look:
Use small icon+bar elements, likely grouped in one corner (top-left as currently). Each stat gets a tiny icon and a colored bar:
Health ❤️ – Red bar.
Stamina ⚡ – Green bar (or another color, e.g. yellow). Stamina will be a new stat to implement since currently the game has no stamina system. We can introduce player.survival.stamina & maxStamina, or treat “hunger” as stamina in the interim. Ideally, add a stamina field to SurvivalStats and update it during sprint/jump actions.
Hunger 🍖 – Orange bar.
Thirst 💧 – Blue bar.
Show numeric values only when relevant (on hover or if the player toggles a “detailed HUD” option) to keep the interface clean. DayZ often represents status abstractly; we can mimic that by using color/fill level and maybe status icons (e.g., a hunger icon might change color when hungry). However, since we already have numbers in the HUD, we can keep small numbers for clarity.
Equipped Item Display: Indicate what item/weapon the player currently has equipped, in a minimal way:
If a weapon is equipped, show a small icon (or emoji/ASCII representation) of it and possibly ammo count or durability. For example, a pistol icon 🔫 with “6/6” ammo. This could appear at the bottom-center or bottom-right of the HUD for visibility.
If no item is equipped (fists), this could be hidden or show a hand icon ✊.
We can repurpose the existing player.weapons array and a new state for “active weapon”. For instance, track an activeWeaponIndex in the game store or player state. When the player switches weapons (via hotkey or wheel), update this index.
For multiple quick-access items (like DayZ’s hotbar), we can implement a hotbar: a row of small slots (e.g. 1–5) at the bottom of the screen. Each slot shows an icon for the item assigned to that number. The currently equipped slot could be highlighted. This hotbar remains fairly minimal (semi-transparent background, only icons for items you have). It can auto-hide when empty or when not in use to preserve immersion.
Layout & Fading: Keep the HUD anchored to screen edges with only small footprints for each element. Use Tailwind utility classes for a consistent style (semi-transparent dark backgrounds, rounded corners as already used). For immersion, implement auto-fade: e.g., if the player’s health, hunger, thirst are all above, say, 80%, the bars could fade out until something changes or the player presses a “show HUD” key. This behavior provides a cleaner screen during normal conditions, similar to how some games hide the HUD out of combat. This can be done by toggling CSS opacity on a timer or via a state that monitors stat changes.
Implementation Steps for HUD:
Create a new HUD component (e.g. HudStatus.tsx or similar) that renders the status bars and equipped item UI. This could be used inside the main UI component for clarity. Alternatively, refactor the existing JSX in UI.tsx for health/hunger into a separate <StatusBars /> child component for cleanliness.
Add a Stamina stat to the game:
Extend the SurvivalStats interface to include stamina and maxStamina.
Initialize stamina in SurvivalManager.createDefaultStats() (e.g. 100/100) and possibly manage regeneration/drain (stamina drains on sprint, regenerates when not sprinting).
Display the stamina bar in the HUD next to health/hunger. Initially, if sprint mechanics aren’t fully in, it can just remain full.
Add an EquippedItem display:
If using a hotbar, create a small component that maps the player.weapons (or quick-use items) to UI slots. If only one active item is to be shown, just display that item’s icon.
For now, use placeholder icons (emojis or font icons) for weapons (the code already has some emoji for weapons like a gun emoji for basic ammo, etc.). In future, this can be replaced with actual images.
Position this display bottom-center or bottom-right. For example, DayZ-style minimalism might place it bottom-left above the joystick on mobile, but since our mobile has joystick bottom-left and actions bottom-right, bottom-center might be free on both.
Ensure this component is also shown/hidden appropriately (e.g. only show if an item is equipped or if hotbar slots are filled).
By focusing on just these essential elements in the always-on HUD, we adhere to the DayZ philosophy of minimal UI while still giving the player key info at a glance.
2. Critical State Warnings & Alerts
We will enhance the existing warning system to be more immersive and informative:
Iconography: Each warning type gets an associated icon in the UI:
Starvation -> a flashing 🍖 meat icon or a hunger icon turning red.
Dehydration -> a 💧 water drop icon flashing or shaking.
Low Health -> a ❤️ heart icon or the health bar itself flashing.
Bleeding -> a 🩸 blood drop icon.
Drowning -> a 😰/🌊 icon (e.g., a lungs or water icon).
Encumbrance -> a 🏋️ or 📦 icon (weight symbol).
Warnings can be displayed as an array of icon+text entries instead of a single list of text. For example, a warning overlay could show a row or column: ⚠️ Starving (with the meat icon) under a warning header.
Audio Cues: Introduce subtle sound cues for critical conditions:
Low health: play a heartbeat or high-pitch tone when health < 20%. This could loop or play periodically while in that state.
Starving/Dehydrated: perhaps a stomach rumble sound or a cough/dry gasp sound.
Drowning: a muffled heartbeat or water gurgle sound as oxygen runs low.
Encumbered: a heavy breathing or strained grunt when trying to sprint.
These sounds should be short and not too annoying, just enough to alert the player. Implementation-wise, we can use the Web Audio API or simple <audio> elements triggered by state. The SurvivalManager.getWarnings() could return not just strings but codes that map to sounds. Alternatively, handle it in the UI: when warnings include “Starving”, play the starving sound if not already playing recently.
Visual Emphasis: Aside from the yellow warning box, we can add effects:
Use framer-motion animations (already in use) to make the warning icons/text fade in/out or pulse to draw attention.
Possibly tint the screen edges red at critical health (mimicking blood loss effect in many games). This could be a semi-transparent red border that appears conditionally.
For drowning, a special case: instead of a simple text warning, implement an oxygen meter that appears only when the player is underwater. For example, a blue bar or a set of bubbles icons that deplete over time underwater. If it runs low, flash it and play a choking sound, and if it empties trigger drowning damage.
Encumbrance Mechanics: Introduce an encumbrance check linked to the inventory:
Determine encumbrance either by weight (if each item type has a weight value) or by inventory slots filled. For now, we can assume if inventory.length or total item count exceeds a threshold (say 80% of capacity), the player is encumbered.
When encumbered, show a warning like “Encumbered – movement slowed” with a weight icon. We could also reduce movement speed via game logic.
This likely requires adding a field or function in game store to calculate current carry weight or usage. We can add a simple calculation in the UI or SurvivalManager.
Integration: The existing warning system in SurvivalManager already yields starvation, dehydration, etc.
GitHub
. We should extend it:
Add new warnings: e.g., if we add stamina, we might warn “Exhausted” if stamina is critically low; or “Drowning!” if underwater too long; “Encumbered!” if inventory overweight.
Possibly change getWarnings to include an identifier or type so the UI knows which icon to show. For instance, return objects like { type: 'hunger', message: 'Starving - no health regen' }.
Alternatively, the UI can pattern-match the strings to decide icon/sound (not as clean, but quicker).
Implementation Steps for Warnings:
Drowning detection: Determine how to know if player is drowning. If the game has an ocean or water level (e.g., y=0 as sea level), we can consider the player drowning if their head is underwater for a certain time. This might entail:
Tracking if player’s position.y < waterLevel for an extended duration.
Add a timer or counter in SurvivalManager or a new EnvironmentManager. For simplicity, we can treat it as: if underwater for > X seconds, start showing a “Drowning!” warning and dealing damage. This could be integrated into the survival tick or as a separate system triggered by environment.
In UI, show a special drowning alert (could reuse the warning overlay or a unique icon).
Encumbrance: Implement a utility to calculate encumbrance. Perhaps assign notional weights to ResourceTypes (or use quantity as weight). If carrying capacity is exceeded, push a warning.
UI Warning Component: Refactor the warnings UI in UI.tsx:
Instead of a static yellow box with just text lines
GitHub
, create a <WarningsOverlay> component. This can map over warnings and render an <li> with an icon + text for each.
Style it for visibility: e.g., a semi-transparent background as currently, or possibly no background but outlined text for a diegetic feel. Keep the ⚠️ header for general warning, or replace with icons per line.
Trigger CSS animations for emphasis (e.g., using Tailwind animate-pulse or custom framer-motion keyframes).
Audio triggers: Possibly create an AudioManager or simply use HTML audio:
For each warning type, have a corresponding sound file (in public assets).
Use the useEffect hook in the warnings component: when a warning appears (in the warnings state array), play the sound if not already playing. Throttle/restrict sounds to not spam the user.
Volume can be tied to the gameSettings audio config (which exists in Zustand store, e.g. gameSettings.audio.effects
GitHub
).
By delivering warnings through multiple channels (visual icon + text, and sound), players will be less likely to miss critical alerts, improving the survival experience.
3. Input Scheme Parity (Keyboard/Mouse & Touch)
To ensure feature parity between desktop and mobile inputs, we need to unify how UI interactions are triggered:
Unified Panel Toggles: Right now, desktop toggles panels via onClick handlers on the bottom bar
GitHub
, and mobile has onAction('inventory') or 'settings' in TouchControls which currently do nothing (placeholders)
GitHub
. We will implement a common mechanism so that whether the player presses a keyboard key, clicks a button, or taps a touch button, the same code path toggles the UI module:
Introduce a UI state in the game store (Zustand) for active panel, instead of useState inside UI.tsx. For example, add activePanel: string|null to the store and an action togglePanel(name: string). This way, external components can open/close panels by setting the state.
Modify UI.tsx to use useGameStore((state) => state.activePanel) rather than local state, and update togglePanel to call the store action. This allows any input to toggle panels consistently.
Update the TouchControls onAction handler to call the store’s togglePanel. For instance, in GameCanvasClient.tsx, where onAction('inventory') is handled
GitHub
, we can dispatch useGameStore.getState().togglePanel('inventory').
Also add keyboard shortcuts: e.g. press I to open Inventory, B or C for Build/Crafting, M for Map, Esc for Settings (or to close any open panel). We can extend the handleKeyDown in GameCanvasClient to listen for those keys when not in a text input. For example, if (key === 'i') togglePanel('inventory') etc.
Ensure that opening a panel via any method has the same effect: the panel animates in and the game (if needed) might pause or at least the controls are disabled while a modal is open (currently pointer events are disabled behind the modal due to the overlay).
Mobile Controls Additions: If we add new panels like Map or a distinct Crafting menu, include their toggles on mobile UI:
The current TouchControls has inventory and settings buttons
GitHub
GitHub
. We should add a Map button (🗺️) and a Crafting button (perhaps 🔨 or 📜 icon) in the same top-right cluster if space permits, or along the right side.
Alternatively, use a single “Menu” button that opens a radial or list menu for Inventory/Crafting/Map/Settings on mobile (to avoid too many small buttons). But that adds complexity; given parity, it might be simpler to just add more buttons or allow swiping gestures. For now, adding buttons for new panels is fine.
All these new mobile UI buttons will also call onAction('map') or onAction('crafting'), which we map to togglePanel('map') etc., similar to inventory.
Consistent UI Feedback: Whether using touch or mouse, the UI elements should behave similarly:
Use the same icons and labels for buttons (the project already uses emoji icons for consistency).
The Inventory, Map, Crafting panels themselves can be identical in layout on both platforms (responsive design will scale them). We just need to ensure the toggle triggers exist for both input schemes.
Test that mobile players can navigate new panels: for example, Inventory is already scrollable and clickable on mobile (touch events). Crafting and Map should likewise be touch-friendly (e.g., map might allow pinch zoom if implemented later).
Control Parity for Actions: While not directly UI, ensure that gameplay actions like attacking or using items are possible on both:
The mobile “Attack” and “Heal” buttons already exist
GitHub
GitHub
. On desktop, players presumably attack via clicking or a key (not explicitly shown in code yet). We should confirm or implement that (e.g., left-click triggers an attack action in future weapon system, number keys use items, etc.). This ensures no action is mobile-only or PC-only.
Similarly, implement any new actions introduced (e.g., maybe a “use equipped item” which on PC might be left-click, on mobile we have the heal button).
By centralizing panel toggling in the game state and mapping all inputs to it, we guarantee a player can open/close any UI module regardless of platform. This unification also simplifies adding new UI modules (we won’t need separate code for mobile vs desktop – one store state controls both).
4. Toggleable UI Modules (Inventory, Crafting, Map, Settings, etc.)
We will expand the set of UI panels (modals) available to the player, each as a separate module that can be toggled on/off. The architecture will treat these modules similarly for consistency:
Inventory Panel: (Already implemented as Inventory.tsx.) We will retain most of its functionality
GitHub
GitHub
, but possibly enhance it:
Ensure it updates if the player’s inventory changes (likely already via Zustand store subscription).
Maybe add tabs or sections if inventory grows (for equipment vs consumables, etc.) in future.
This panel is toggled via togglePanel('inventory'). Already in desktop UI the 🎒 button does this, and we will tie the mobile button and I key to it as well.
Crafting Panel: We need a new UI for crafting items (as distinct from building structures):
Design: Similar in style to Inventory – a centered modal with a title (“Crafting” or “Recipes”). It could list craftable recipes with their requirements and a “Craft” button for each. Since the actual crafting system is in progress (Phase 1 goal), we can stub it out: e.g., show a list of sample recipes (campfire, slingshot) and whether you have the resources.
Implementation: Create a component CraftingPanel.tsx that fetches available recipes (if stored in state or defined in code). Possibly use the Recipe types from types/game.ts if available, or a placeholder list. Each recipe entry can display an icon or image of the result, name, required ingredients, and a craft button (disabled if requirements not met).
When craft is clicked, call a future craftItem(recipeId) action from the store (or simply print a message for now if backend not ready).
Integrate this with toggling: add an action button (e.g. 🔨 icon labeled “Craft” or “Recipes”) to the desktop action bar (bottom-center) and a touch button for mobile. Or reuse the “Build” button for crafting if building is not yet separate. We might decide to separate Build (structures) and Craft (items):
Possibly repurpose the current “Build” (🏗️) button to open a combined Build/Craft menu. However, that could be confusing. Better to add a new button if possible: maybe in the desktop bar we could have 4 buttons (Inventory, Build, Craft, Settings) if space permits. Or replace Build with Craft for now if building is not implemented yet (but since BuildMenu exists, likely keep both).
For now, to satisfy the prompt, let’s assume Crafting panel is a distinct module. We’ll add a “Crafting” button (🛠️ or 🔨) where appropriate.
In the game store activePanel, use 'crafting' as the key for this panel.
Map Panel: A UI module to show the world map or mini-map:
This could simply be an image or canvas showing the island layout. Since the game generates an island (64x64 heightmap), we could render a top-down map. If implementing fully, one could draw the heightmap or use an overhead snapshot. For now, a placeholder “Map Coming Soon” with maybe an island icon 🗺️ is fine.
Create MapPanel.tsx similar to Settings/Build placeholders. In future, it can contain an interactive map (zoomable, maybe markers for player, resources, etc.).
Toggle via 'map' in activePanel. Add a desktop button (perhaps an icon like 🗺️ with label “Map”) and a mobile button as discussed.
Consider keyboard M to toggle map.
Settings Panel: (Already present as placeholder.) We will eventually fill this with actual settings controls (graphics, audio sliders, controls config). For now, ensure it toggles via 'settings' state. Possibly allow the Esc key or a gear icon press to open it. On Esc, if any panel is open, it should close that panel first rather than always opening settings (common behavior).
Build Panel (Building Menu): This exists as BuildMenu.tsx placeholder
GitHub
. We will treat it similarly:
Toggle key 'build'. Desktop action bar has 🏗️ button already, mobile has a build button in TouchControls
GitHub
.
In future, this panel will list buildable structures and allow placement selection. Keep it modular in design so it can be expanded separate from item crafting.
UI Module Management: All these panels share common behavior:
They are fullscreen overlays with a semi-transparent backdrop that closes on outside click (as Inventory does by setting onClick={onClose} on the backdrop
GitHub
).
They have a similar header with a title and a close (X) button
GitHub
. We should standardize this in a small reusable component or simply ensure each panel copies the pattern for consistency.
They mount into the DOM when active and unmount when closed. Using framer-motion’s <AnimatePresence> (already in use) for a fade/scale animation as done now keeps things smooth
GitHub
GitHub
.
Because we are using a global store for activePanel, only one panel opens at a time. We can enforce that logic in togglePanel (if a different panel is open, it closes it and opens the new one).
If needed, multiple panels (like Inventory and Map) could be open simultaneously, but that’s usually not desired for game UI – one at a time is cleaner, and the user can’t interact with multiple modals at once easily.
Implementation Steps for Modules:
Add new component files: src/game/ui/CraftingPanel.tsx and src/game/ui/MapPanel.tsx (mirroring the style of Inventory/Settings). Initially, these can have basic content (a title and “coming soon” message or a rudimentary implementation).
Register new panel toggles:
Extend the Zustand GameStore to include activePanel: string | null in state (initialized to null). Add actions openPanel(name) and closePanel() or a combined togglePanel(name) to set this state.
Use subscribeWithSelector or similar to possibly listen for changes (though not strictly necessary – we can just use the state in UI).
Modify UI.tsx:
Instead of const [activePanel, setActivePanel] = useState(null), pull activePanel and togglePanel from useGameStore()
GitHub
. Remove the internal togglePanel function or refactor it to call the store.
Render panels based on store state: e.g. {activePanel === 'inventory' && <Inventory onClose={...} />} etc., as it does now but using the global state. We can still pass an onClose prop that triggers togglePanel(null) or similar.
Include the new panels: {activePanel === 'crafting' && <CraftingPanel onClose={...} />}, {activePanel === 'map' && <MapPanel ... />} in the AnimatePresence block.
Add the new action buttons for Crafting and Map:
In the desktop bottom HUD (UI.tsx bottom-center bar), add another <ActionButton> for Craft (🛠️ or 🔨) and one for Map (🗺️). If spacing is a concern, these buttons can be a bit smaller or we make the bar scrollable, but likely 4-5 buttons can fit. (The bottom bar container currently has flex gap-2 – we can fit at least 4 icons easily).
Ensure their onClick calls togglePanel('crafting') and togglePanel('map') respectively, and active={activePanel === 'crafting'} etc to highlight when open.
On mobile, update TouchControls.tsx:
Add new buttons in the secondary actions (top-right) alongside inventory/settings. Possibly stack them or arrange a 2x2 grid if four icons (inventory, crafting, map, settings) are present. For simplicity, a second row below inventory/settings for map/craft could work, or slightly shrink the buttons to fit one row.
Set onAction('crafting') and onAction('map') when those buttons are pressed.
In GameCanvasClient.tsx onAction switch
GitHub
GitHub
, handle 'crafting' and 'map' by calling the store togglePanel as well.
Add keyboard hotkeys in GameCanvasClient key handler for new panels as mentioned (I, M, etc.). Make sure to prevent default so arrow keys or others don’t scroll the page when in game.
After these steps, the player will have a full suite of toggleable game menus:
Inventory (for items),
Crafting (for recipes),
Build (for structures),
Map (for navigation),
Settings (for configurations).
They can open/close any of these as needed, and the design is such that adding another (e.g. “Party” panel to manage group, or “Quest Log”) would just involve adding a new component and a button + store toggle.
5. Future-Proofing and Modularity
To ensure the HUD/UI can evolve with new features without major rework, we plan the following architectural practices:
Component-Based HUD Elements: Break the HUD into small, reusable components. For example, a generic StatBar component can render a labeled icon + bar given props (current value, max value, icon, color). We can use this for health, stamina, hunger, thirst, and any future stat (e.g. body temperature or oxygen). Instead of hardcoding each in JSX, loop through an array of stat definitions:
const statsToShow = [
  { key: 'health', value: player.survival.health, max: player.survival.maxHealth, icon: '❤️', colorClass: 'bg-red-500' },
  { key: 'stamina', value: player.survival.stamina, max: player.survival.maxStamina, icon: '⚡', colorClass: 'bg-green-500' },
  // ... hunger, thirst
];
Then in JSX:
{statsToShow.map(stat => (
  <StatBar key={stat.key} icon={stat.icon} value={stat.value} max={stat.max} colorClass={stat.colorClass} />
))}
This way, if we add a new stat (say Temperature or Energy), we just add to the array and ensure the player state has it, and the UI updates automatically with the new bar.
Pluggable HUD Modules: Design the HUD such that new elements like XP bar or Skill progression can be added without clutter:
For XP, perhaps convert the current text XP display
GitHub
 into a small XP bar under the health bar or at top of screen. This could be done by adding an XPBar component that shows current XP vs XP needed for next level (if that formula is available). If not, at least a progress bar to next level could be displayed. This can be slotted into the HUD container easily.
For skill progression, maybe the game will have skills (e.g. crafting skill, combat skill). Each could be represented as small progress bars or icons that only show when relevant. We can create a sidebar or extend the HUD to show these when the feature comes. Because our architecture is modular, adding a new <SkillHUD /> component and including it is straightforward.
Party Status: If multiplayer co-op is planned where you have a party, we might need a UI to show party members’ health or names. This could be a small panel (like the current “Players Online” list
GitHub
, which we could generalize). We could create a PartyStatus.tsx that lists your party members with their HP bars. This can be conditionally rendered if party.length > 0. Again, having a structured state (like an array of party members in store) and a small component to visualize it will make this easy to plug in.
Theming and Consistency: Continue using the existing Tailwind CSS utility classes and design language (blurred backdrop, semi-transparent dark panels, white text/icons) so that new UI pieces feel cohesive. Define common styles for panels (maybe a CSS class or Tailwind component for the modal container) to reuse across Inventory, Crafting, Map, etc. If we ever want to reskin the HUD (for example, a DayZ-style grayscale minimalist theme), having centralized styles or a theme object will help.
Performance and Update Optimization: The UI components should subscribe only to necessary parts of the state to avoid re-renders. With Zustand, we can select specific fields (e.g., useGameStore(state => state.player.survival) for stat bars, state.inventory for inventory panel, etc.). This modular approach ensures that e.g. opening the map doesn’t re-render the whole HUD unnecessarily. We should utilize Zustand’s selectors or even split the store if needed (though one store is fine for now, given app size).
Scalability of Input Handling: As we add more toggles and hotkeys, consider a cleaner way to manage input:
Perhaps maintain a mapping of key bindings to actions in the store (so users could rebind keys in Settings later). For now, implementing directly in code is fine, but leaving a note that keybinds could be made data-driven helps future-proof the controls system.
On mobile, if too many on-screen buttons clutter the view, we might implement a menu wheel or radial menu for certain actions (the TODO mentioned a “weapon selection wheel” for mobile
GitHub
). Our design keeps things modular such that adding a complex UI control like a radial menu (likely as its own component that appears on a long-press or another button) won’t break the rest of the HUD.
By following these practices, the UI system will be easier to maintain and extend. New HUD elements can be added as new components and integrated via the store and parent UI, rather than rewriting large portions. This addresses the need for future features like skill bars or party indicators to “plug in” with minimal fuss.
Implementation Plan Summary
Below is a step-by-step outline of the implementation tasks for the coding team/agent, summarizing the above architecture:
Refactor HUD into Components: In UI.tsx, refactor the top HUD stats into a dedicated <StatusBars> component (or similar) that renders health, hunger, thirst (and newly added stamina) using a small helper component for each bar. Ensure it uses player survival state from the store
GitHub
GitHub
. Add a new stamina bar UI (icon ⚡) once the stat is available.
Introduce Stamina Stat (Backend): Extend the SurvivalStats model and SurvivalManager to include stamina. This includes:
Adding stamina and maxStamina fields (initialize to 100).
Possibly reducing stamina on sprint and regenerating it slowly. (If detailed stamina mechanics are out of scope, simply include the stat for now for UI completeness.)
This will allow the HUD to display a stamina bar (even if static initially).
Equipped Items Display: Implement a basic equipped item HUD element:
Decide on a hotbar vs single item display. For now, implement a single slot showing the first weapon in player.weapons (or a designated active weapon).
Create an <EquippedItem> component to display the icon of the equipped weapon and maybe ammo. If no weapon, show nothing or a default.
Place this component on the HUD (e.g., bottom-center just above the action bar, or bottom-right above the mobile action buttons). Use absolute positioning with Tailwind.
(Optional: Implement number key hotkeys (1-5) to switch weapons and update the active display, if multiple weapons are present.)
Global UI State for Panels: Modify Zustand useGameStore:
Add activePanel: string | null to initial state.
Add actions openPanel(panel: string) and closePanel() or a combined togglePanel(panel: string) that sets activePanel (setting it to panel if currently null or different, or null if the same panel is already open).
Example: togglePanel('inventory') sets state.activePanel to 'inventory' if it was null or different, otherwise sets it to null (closing it).
(Ensure this doesn’t conflict with any existing state; it should be fine as new field.)
Connect UI.tsx to Global Panel State:
In UI.tsx, use const { activePanel, togglePanel } = useGameStore() instead of local useState for panel control
GitHub
.
Update the onClick handlers of desktop action bar buttons to use togglePanel('inventory') etc. and their active style to check activePanel.
Update the AnimatePresence blocks to render panels based on store’s activePanel
GitHub
GitHub
. Pass an onClose to panels that calls togglePanel(null) or closes appropriately.
Implement CraftingPanel Component:
Create CraftingPanel.tsx similar to Inventory.tsx structure. Give it a header “Crafting” and close button (copy from Settings/Inventory for consistency).
For content: you can create a placeholder list of craftable items. If recipe data is available (check for any Recipe type or planned recipes in code), use it. Otherwise, hardcode a couple of examples (e.g., “Campfire – requires 5 wood, 5 stone [Craft] button”).
No actual crafting logic needed yet; the “Craft” button can just print console log or decrement resources if desired. It will mainly demonstrate the UI.
Style the list similar to inventory (maybe a list of items with icons and requirements).
Ensure this panel is scrollable if content exceeds (use overflow-auto and a max-height as done in Inventory).
Integrate by adding to UI.tsx when activePanel === 'crafting'.
Implement MapPanel Component:
Create MapPanel.tsx with header “Map”. Inside, perhaps include a placeholder image or text. If possible, we could generate a simple map: for example, draw the island’s biome map or heightmap. But that may be complex; a simple “Map coming soon” text or a static mini-map image is fine for now.
Alternatively, if Three.js scene or data can be reused, maybe show an overhead orthographic projection. But likely out of scope – so a placeholder will do.
Possibly include a legend or coordinates display as a stub.
Add to UI toggle (when activePanel === 'map').
Enhance TouchControls for New Buttons:
In TouchControls.tsx, add additional motion.buttons for Crafting and Map in the secondary actions area (top-right). We might need to reorganize the layout:
Currently it’s two buttons (inventory, settings) in a flex row
GitHub
. Adding two more could be done by making it a 2x2 grid or two rows. For simplicity, stack them in two rows: first row inventory/settings, second row map/craft.
Give them distinct icons: perhaps 📜 or 🔨 for crafting, and 🗺️ for map.
Hook their onTouchStart/onClick to call onAction('crafting') and onAction('map').
In GameCanvasClient.tsx, update the onAction switch to handle 'crafting' and 'map' by calling the new togglePanel action:
case 'crafting':
  useGameStore.getState().togglePanel('crafting');
  break;
case 'map':
  useGameStore.getState().togglePanel('map');
  break;
(We assume we can import or access the store in this file as done elsewhere, similar to how applyDamage and consumeItem are used
GitHub
.)
Test that tapping those buttons opens the respective panels just like on desktop.
Keyboard Shortcuts for Panels:
In the handleKeyDown in GameCanvasClient
GitHub
, add cases for inventory/map/etc. For example:
if (key === 'i') {
  e.preventDefault();
  useGameStore.getState().togglePanel('inventory');
}
if (key === 'm') {
  e.preventDefault();
  useGameStore.getState().togglePanel('map');
}
if (key === 'c') {
  e.preventDefault();
  useGameStore.getState().togglePanel('crafting');
}
if (key === 'escape') {
  e.preventDefault();
  const { activePanel } = useGameStore.getState();
  if (activePanel) useGameStore.getState().togglePanel(activePanel); // close the open panel
  else useGameStore.getState().togglePanel('settings'); // open settings if no panel open (optional)
}
Ensure these do not conflict with existing controls (currently WASD, space, etc., are handled; these new keys are distinct).
Warning System Upgrade:
Update SurvivalManager.getWarnings() to cover new conditions:
If stamina exists and stats.stamina <= 10, add “Exhausted - cannot sprint!”.
(If implementing drowning) If the player is underwater (this might be detected outside SurvivalManager, perhaps in GameCanvasClient or a new system that sets a flag or triggers damage), add “Drowning!” when oxygen is low.
If implementing encumbrance threshold: perhaps check a new function isEncumbered (for example, if total inventory weight > X) and if true, push “Encumbered - movement slowed”.
Create an icon map for warnings in the UI layer or a small function to get icon by warning type. For instance:
const warningIcon = {
  "Critical health!": "❤️",
  "Starving": "🍖",
  "Dehydrated": "💧",
  "Bleeding": "🩸",
  "Drowning": "🌊",
  "Encumbered": "🏋️"
};
(If we change getWarnings to return structured warnings, we could use types instead of text matching.)
Update the UI warnings overlay component to display icons. For each warning message, prepend an appropriate icon (and maybe make the text shorter, e.g., just "Starving" instead of full sentence, since the icon conveys context too).
Add CSS animation: e.g., give the warning box or icons a animate-bounce or pulse when first shown. For per-item animation, could wrap the icon in a <motion.span> with a pulse transition.
Implement audio feedback: perhaps simplest is to use <audio> elements hidden in the HTML. We can add an <audio id="lowHealthSound" src="/sounds/heartbeat.wav" preload="auto"> in the page. In the warnings component’s useEffect, if it sees “Critical health!” present and a ref that tracks we haven’t played recently, call document.getElementById('lowHealthSound').play(). For a coding agent, specify which sounds to use (if none provided, we note that sound assets are needed).
Because audio and new icons might require asset files (images or sound), note to include or source those appropriately.
Test and Iterate: After implementation, test the UI on both desktop and mobile:
On desktop, verify that pressing I, C, M, Esc keys toggle the correct panels and that clicking the action bar buttons does the same. Ensure only one panel shows at a time and toggling works (open/close).
On mobile, simulate a small screen or use a device to ensure the joystick and new buttons appear and function. Inventory, Crafting, Map, Settings buttons should all open their panels. The joystick and action buttons (attack, jump, etc.) should still work while no modal is open. When a modal is open, ideally movement should pause (the pointer-events system currently allows clicking UI while game continues; we might consider pausing game updates when a panel is open to mimic a pause – could be done by a flag in game loop).
Check that warnings appear at the right times: use cheats or debug buttons to lower health, hunger, etc., and see that the new warning UI shows icons and possibly hear sounds. (The existing debug “Take Damage” button in bottom-left 
GitHub
 can help trigger low health/bleed warnings).
Ensure performance is good (the additional UI elements are not too heavy).
Documentation & Future Features: Document in code comments or a MD file how new UI modules can be added. For example, note that to add a new HUD stat or panel, developers should:
Add state to store if needed (e.g. a new Survival stat or a new panel name).
Create a UI component for it, following the established modal or HUD component patterns.
Add toggle controls (button + keybind + touch button if needed).
This will help maintain consistency as the project grows.
By following this plan, the result will be a modular, extensible HUD/UI system that enhances immersion (minimal on-screen info, context-sensitive warnings) and ensures players on all devices have full access to the game’s features. All HUD components will be designed for easy extension, so upcoming features like skill bars, temperature indicators, or party status can be integrated by adding new components rather than overhauling the UI again. This design balances the minimalist aesthetic (inspired by DayZ) with practical feedback for a survival game, providing a solid framework for current and future UI needs.