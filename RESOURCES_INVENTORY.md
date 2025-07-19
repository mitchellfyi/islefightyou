Resource Gathering and Inventory System: Current State vs. Full Design Plan
Current Implementation Overview
Harvestable Resources (Trees, Rocks, etc.): The game already generates static resource nodes (wood, stone, metal, coconut, berries, etc.) on the island. These appear as 3D models (tree trunks, rocks, bushes, etc.) placed according to biome during world generation
GitHub
GitHub
. Each ResourceNode has a type (e.g. wood, stone) and a quantity and respawnRate defined in the island data
GitHub
GitHub
. However, there is currently no interaction logic for harvesting these nodes. The Island component simply renders them (via <NaturalResourceNode>), but no click or animation triggers are implemented
GitHub
GitHub
. The roadmap confirms that resource harvesting mechanics are not yet done (“Chop palm, mine rock…” is unchecked)
GitHub
. In short, resource nodes exist visually but cannot be “mined” or chopped by the player yet – there are no animations or delays on gathering, since gathering itself isn’t implemented. Loose Pickup Items (Sticks, Berries, Loot): At present, all resources are static nodes. There is no separate concept of small loose items on the ground distinct from resource nodes. For example, berries and coconuts are generated as resource nodes (bushes or palm trees) that would presumably be harvested
GitHub
GitHub
. The system does not yet spawn individual pickup objects or dropped loot. So, instant pickups are effectively not implemented. The design likely intends that items like dropped loot or small resources could be picked up immediately, but currently any collectible item is just part of the island’s resourceNodes array with a quantity value
GitHub
. No code exists to press a key and instantly collect an item from the ground – this will need to be added. Inventory System (Slots & Weight): The current inventory is a simple list of resources (ResourceType and quantity) stored in the game state. The Player type has an inventory: Resource[], but the active state uses a separate top-level inventory array in the Zustand gameStore
GitHub
GitHub
. Each entry in this list represents a stack of one resource type with some quantity. There is a conceptual slot limit of 50 displayed in the UI, but no enforcement in logic. The inventory UI footer shows “Inventory Slots: {used}/{50}”
GitHub
, meaning the game intends a max of 50 item stacks. In code, though, addResource just merges quantities and appends new items freely with no cap
GitHub
. Weight is not tracked at all in the current implementation. The Resource model has only type and quantity
GitHub
, and no weight property exists. Consequently, encumbrance effects do not exist yet – the only movement penalty implemented is for thirst (dehydration slows sprint speed)
GitHub
. There’s no check on total weight carried, and no reduction of movement speed or stamina due to heavy inventory in the current code. Encumbrance Penalties: As noted, no encumbrance system is in place. The player’s movement/sprint is only affected by survival stats (e.g. if thirst ≤10%, sprint speed is 70%)
GitHub
. Carry weight does nothing currently. There is also no stamina mechanic implemented (stamina is not a stat in SurvivalStats
GitHub
), so “accelerated stamina drain” due to weight isn’t present. Introducing encumbrance will require adding new logic (and possibly a stamina stat) since currently the player can carry unlimited weight with no speed penalty. Item Stacking: Right now, stack sizes are unlimited per resource type. The gameStore.addResource function will find an existing stack by type and just increase its quantity with no upper bound
GitHub
. There is no max stack size (like 99) enforced. The UI will show very large quantities in one slot if added. If a new type is added beyond 50 types, presumably that would exceed the UI’s intended slot count, but that scenario is not handled in code yet. So, stacking logic needs improvement – currently it’s simplistic (one stack per item type, infinite size). Inventory UI (Drag-drop, Sorting, Quick Bar): The existing inventory UI is basic and does not support drag-and-drop or reordering. It displays items in a grid, each with an icon and quantity, and allows clicking consumables to use them
GitHub
GitHub
. There’s no ability to rearrange items; they appear in the order the inventory array provides (which is order of picking up new types). There’s also no sort feature. The quick-access bar is not implemented yet for items/weapons. Currently, the only “bar” is the top-right HUD snippet that shows up to 6 resource icons and counts for quick reference
GitHub
, but this is purely informational. The bottom center has an action bar for Inventory/Build/Settings buttons
GitHub
, but no hotkey slots for using items/weapons. So the quick-access concept (e.g. assigning items to number keys or a hotbar) is not present in the current UI. Containers and World Storage: There is no container/chest system implemented yet. The concept is anticipated – e.g. the BuildingType enum defines a STORAGE type
GitHub
 and the Building data model has an optional resources inventory field
GitHub
, which suggests that storage buildings (chests) can hold items. However, no code uses BuildingType.STORAGE yet (no placements or UI) and no game mechanics exist to place or open containers. The building system as a whole is incomplete (building placement and types like storage are listed as TODO)
GitHub
. In multiplayer context, there’s no handling of sharing container contents, since containers themselves aren’t in place. In summary, virtually all container functionality remains to be built, aside from the placeholder data structures.
Proposed Full System Design
To achieve a complete resource gathering and inventory system, we propose the following design additions and changes, building on what exists:
1. Harvestable Resource Nodes (Delayed Collection with Animation)
Design: Resource nodes like trees, rocks, ore veins, etc. should require a short harvesting action before yielding resources. When the player interacts (e.g. presses an “Use” key or clicks) on a harvestable node, it will trigger a harvest animation (e.g. chopping, mining) and a brief time delay (e.g. 2–3 seconds) before the resource is collected. During this time, the player could play an animation (swinging an axe or pickaxe), and the resource node might play an animation or effect (tree shaking, particle effects). After the delay, the node yields some items to the player’s inventory. Implementation Plan: We will use Three.js interaction events or raycasting to detect when a player targets a resource node. For example, attach an onPointerDown or onClick handler to the NaturalResourceNode meshes to initiate harvesting. On trigger, disable further interaction with that node and start a short timer (could be a setTimeout or a small state machine for progress). After the delay, call gameStore.addResource to add the corresponding item(s) to the inventory, and decrement the node’s quantity. If quantity reaches 0, the node is “depleted” – we should remove it from the world (e.g. remove from island.resourceNodes and perhaps replace it with a smaller “empty” stub or nothing). The node can regrow later after its respawn time. We’ll likely add a new game store action like harvestResource(nodeId) to encapsulate this: it would find the node, yield items, update inventory and node state, and perhaps log a GameEventType.RESOURCE_HARVEST event
GitHub
 for analytics or server synchronization. Animations: The character’s harvesting animation can be triggered at the start of harvest. If the character model supports animations, we’d call the appropriate clip (e.g. “chop” or a generic “use” animation). The resource node could also animate – e.g. using the existing useFrame sway for trees
GitHub
 plus maybe an extra shake when hit. If no detailed animations are available, a simple approach is to have a progress bar UI or an icon indicator over the node during harvesting to show the delay. Tools & Skills (Future): Initially, the player can harvest with bare hands or a default tool. We might later introduce tool items (axe, pickaxe) that reduce harvest time or are required for certain nodes (e.g. need a pickaxe for rocks). The system should be built flexibly to accommodate that – e.g. allow the harvest time or yield to depend on tool in hand. For now, a uniform short delay (say 2s for trees/rocks) will suffice.
2. Loose Pickup Items (Instant Collection on Interaction)
Design: Not all resources require effort to gather – small items like sticks, berries, fallen coconuts, or dropped loot should be picked up instantly when the player interacts with or walks over them. These will appear as loose item entities in the world that can be collected with no delay or special animation (beyond maybe a quick reach-down animation if available). Implementation Plan: We introduce a new type of world entity for loose items (could reuse ResourceNode with a flag, or a separate simple WorldItem type). These items might spawn from various causes: fruits falling from trees, loot dropped by defeated enemies, or player-dropped items. When the player’s character is near a loose item, we can highlight it and show a “Press [E] to pick up” prompt. On pressing the key (or tapping the item), immediately transfer the item to the player’s inventory via addResource. No timer or harvesting animation is needed – it should feel instantaneous. We can also support auto-pickup on contact: if the player collides with the item’s hitbox, just add it to inventory and remove it from the scene. Examples: A stick on the ground would disappear the moment the player picks it up, adding say 1x Wood to inventory. Berries might be both harvestable (as a bush node) and could drop as loose berry items – in either case, picking a loose berry item is instant. Dropped loot from a chest or another player would similarly be collectible by just running over it or clicking it. Integration with Current Nodes: We can decide that certain resource types in resourceNodes should behave as instant pickups. For example, a berry bush might yield berries with a quick action (practically instant), whereas a tree (wood) always uses the delay. We could mark resource types with a property like harvestTime: set 0 for instant pickups and >0 for harvestables. Initially, material nodes (wood, stone, metal, coral) would have a short harvest time (need chopping/mining), while food and small items (berries, coconuts on ground) can be instant. This provides a clear distinction as per design.
3. Inventory Capacity – Slot Limit and Weight System
Design: The inventory will enforce both a maximum number of slots and a maximum carry weight. The slot limit (e.g. 30 or 50) is the total distinct item stacks the player can carry. The weight limit is based on the sum of weights of all carried items. Each item type will be given a weight value (likely in kilograms or a simpler abstract “weight unit”). For example, wood might weigh 2kg per unit, stone 5kg, berries 0.1kg, etc. If the total weight exceeds certain thresholds, encumbrance penalties kick in (see next section). Implementation Plan: We will expand the ResourceType definitions to include item metadata like weight and max stack size. This could be done via a lookup table or a mapping in code. For instance:
const ItemStats: Record<ResourceType, { weight: number; maxStack: number }> = {
  [ResourceType.WOOD]:    { weight: 2.0, maxStack: 99 },
  [ResourceType.STONE]:   { weight: 3.0, maxStack: 99 },
  [ResourceType.METAL]:   { weight: 5.0, maxStack: 50 },
  [ResourceType.BERRIES]: { weight: 0.1, maxStack: 99 },
  // ... etc for all resource types
}
The game store’s addResource logic will use this to enforce slot limits and stacking (see Item Stacking below). We will track total carried weight by summing quantity * weight for each inventory entry whenever it changes. This sum can be stored in state (or derived on the fly) and compared against capacity thresholds. The slot limit enforcement means if the inventory array length (number of distinct stacks) is at max (say 30), we cannot pick up a new item type unless we free a slot. The UI already plans for 50 slots
GitHub
, but for a tighter survival experience we might choose 30 as active limit (this can be configured). In code, when adding a resource, if it’s a new type and inventory is full, we should reject it (or possibly drop the item on the ground instead). A feedback message like “Inventory is full” can alert the player. We should update the inventory UI to show weight as well – e.g. “Weight: 52/100 kg” in the footer. This gives the player insight into how close they are to being encumbered.
4. Encumbrance Mechanics (Speed & Stamina Penalties)
Design: When the player’s carry weight exceeds certain percentages of their capacity, they suffer penalties:
Above Light Threshold (e.g. > 50% capacity): The player moves a bit slower (for example, −10% speed) but can still sprint and act normally.
Above Heavy Threshold (e.g. > 100% capacity): The player becomes encumbered – sprinting is disabled, walk speed is significantly reduced, and stamina (if implemented) drains faster while moving.
Extreme Overburdened (optional, e.g. > 150%): Possibly the player cannot move at all or is capped to a very slow crawl. This level can be avoided in design or used for a hard limit (you simply can’t pick up beyond a certain max).
We will implement at least the first two stages: heavy carry prevents sprinting and reduces movement speed, and perhaps a milder slow at >50% weight. Implementation Plan: If we don’t have a stamina stat yet, we interpret “accelerate stamina drain” as draining the player’s hunger/thirst faster due to exertion, or plan to add a stamina meter later. For now, we can simulate fatigue by increasing hunger and thirst depletion rates when heavily encumbered (since SurvivalManager already drains those over time
GitHub
). This could be a simple multiplier on the drain rates when weight > 100% capacity. For movement speed, we will modify the player movement logic in GameCanvasClient. Currently movement per tick is fixed (or possibly scaled only by thirst for sprint)
GitHub
. We will incorporate weight effects:
Introduce a function like getMovementSpeedMultiplier(totalWeight) – returns 1.0 when under 50%, maybe 0.8 if over 50%, and 0.5 if over 100% (tunable values).
Check sprinting eligibility by both thirst and weight. The SurvivalManager.canSprint now only checks thirst
GitHub
; we can extend that or create a similar EncumbranceManager.canSprint(weight) that returns false if overweight. The game should require both conditions: e.g. canSprint = (thirst > 10) && (weight <= capacity).
When the player is encumbered, we also display a warning on the HUD (similar to the existing warnings for hunger/thirst
GitHub
GitHub
). For example: “Encumbered - too much weight!” when >100%, and “Heavy load - movement slowed” when >50%. This can be added to the warnings list logic. In summary, carry weight will directly influence movement: crossing the threshold will automatically adjust the player’s speed and disable sprint input (we can simply ignore sprint key or force the sprint multiplier to 0 in SurvivalManager if encumbered). Later, if a stamina bar is added, we’ll also make running while encumbered drain stamina much faster.
5. Item Stack Limits (Stack Size = 99)
Design: Each inventory slot can hold only up to a fixed number of a given item. We’ll use 99 units per stack as a general rule (common in many games), though some items might stack lower (for example, perhaps heavy items like metal ingots up to 50). When a player gathers beyond that amount, it occupies a new slot (another stack). Implementation Plan: The addResource function must be updated to respect maxStack. Instead of unconditionally merging all quantities of the same type into one entry, we do:
Find if any existing stack of that type is not full (quantity < maxStack). If found, add as much as possible to that stack up to the limit.
If there’s remainder (still some items left to add), and another stack of the same type exists that isn’t full, continue filling, else if none exists, create a new stack (a new Resource entry) for the remainder if slots are available.
If inventory is at full capacity and we still have items left, those items cannot be picked up – in this case, drop the overflow on the ground (spawn as loose item) or just refuse the pickup with a message.
For example, if the player has 95 wood in one stack and picks up 10 more, we’d top off that stack to 99, then put the remaining 6 wood into a new stack. This would use an extra slot. The UI will show two entries for wood (one with 99, one with 6). We should adjust the inventory UI to handle multiple stacks of the same resource type gracefully. Currently it keys by ${resource.type}-${index}
GitHub
, so it can show duplicates as separate entries. That should be fine as is. We just need to ensure the sorting doesn’t constantly shuffle them (we might keep the order of acquisition or allow manual sorting next). This change means the inventory data model remains a list of Resource stacks, but now can contain duplicates of the same ResourceType. (If desired, we could introduce unique IDs per stack for clarity, but using array index and type together is acceptable for now.) The game store’s logic should be carefully tested for removing resources too – removing a quantity should only drop a stack if all its quantity goes to 0, and possibly consolidate stacks if that makes sense (though usually we don’t auto-merge stacks on removal, we just decrement the specific stack).
6. Inventory UI Enhancements (Drag & Drop, Sorting, Quick-Access Bar)
Drag-and-Drop: We want players to rearrange their inventory slots and also drag items to other UIs (e.g. to drop, or move to a container). Implementing drag-and-drop in React Three/DOM can use a library like react-dnd or a simpler custom approach since our inventory is DOM (HTML in an overlay). Each item slot can be made draggable; we maintain state of the drag and on drop, we reorder the inventory array accordingly. This requires adding a moveItem(fromIndex, toIndex) action in the store or handling it in the component with useGameStore.setState. We must also handle dragging to external targets: e.g., dragging an item out of the inventory could drop it into the world (remove from inventory and spawn a loose item), or dragging to a container UI (see Containers below). Sorting: As a convenience, we can implement a sort button or auto-sort feature. For example, sort by item type or category, or by custom criteria (maybe grouping similar items). This could be a simple button in the UI that calls a function to sort the inventory array and thereby re-render the list. Sorting might group resources, but since stacking already does grouping by type, sorting would mostly just tidy the order (alphabetically or by type category). We can leave manual sorting to the player via drag-and-drop, and possibly add a “Sort” button later if needed. Quick-Access Bar: We should add a quick-use hotbar (e.g. 5–10 slots) for items and equipment. This bar typically appears at the bottom of the HUD. The player can assign an item to each slot (by dragging from inventory to the bar). These slots correspond to number keys (1–5, etc.) on desktop or a secondary touch UI on mobile. When the player presses the corresponding key, the item is used or equipped. For example, dragging a bandage to slot 1 means pressing 1 uses a bandage (calls consumeItem(ResourceType.BANDAGE) in store
GitHub
). Dragging a weapon to slot 2 would equip/switch to that weapon (for now weapons are separate, but we could handle them similarly). To implement this:
Create a new component for the hotbar, rendering, say, 5 slots. Each slot can show the item icon assigned or empty.
Allow dragging inventory items onto a hotbar slot to assign it. This will require state, perhaps in the store (e.g. store an array of length 5 for hotbar, containing references to inventory items or their types).
Handle input: in GameCanvasClient or a central input handler, listen for number keys 1–5 and trigger the corresponding action (if any item is in that slot). For consumables, just call consumeItem. For weapons or tools, switch the active equipped item (this might require expanding the Player state to know what’s in hand).
On mobile, these could be small touch buttons above the joystick or in a corner for quick use.
This quick-access system greatly improves usability, especially in tense situations (e.g. healing in combat or switching to a weapon). It complements the inventory which is more for management and not meant to be fiddled with mid-combat.
7. Player-Placed Containers (Chests) with Storage Limits and Multiplayer Sharing
Design: Players should be able to build or place storage containers (like chests) in the world to store excess items. A container has its own inventory, separate from the player’s, with its own slot and weight limits (typically higher capacity since it’s stationary – e.g. a chest might hold 20 slots or a large weight). In multiplayer, any player who can access that container (e.g. teammates or raiders, depending on permissions) can view and modify its contents. This enables item sharing and safekeeping of loot. Implementation Plan: This involves several pieces:
Placing Containers: We assume the building system will handle placement of structures like chests. For now, we can allow spawning a chest via a debug command or a simple trigger. Ultimately, crafting a chest and using the Build menu to place it would be the path. When placed, create a new Building entry of type STORAGE
GitHub
 via gameStore.addBuilding
GitHub
. Initialize its resources: [] field to an empty array. The building’s position is where it was placed.
Opening Containers: When the player approaches and interacts with a storage container (e.g. “Press E to open chest”), we open a Container UI panel. This UI is very much like the player Inventory panel but shows the container’s contents. We can create a new component (e.g. <ContainerInventory> or extend the existing <Inventory> component to have two modes). The container inventory will also display its own slot count and maybe weight usage. We can allow drag-and-drop between the player inventory and container inventory in this UI. For example, dragging an item from player inventory to the chest panel will invoke a transfer: remove from player (use removeResource) and add to the chest’s Building.resources list. And vice versa for withdrawing items.
Storage Limits: Each container can have defined limits. Perhaps a basic chest has 20 slot capacity and, say, 200kg weight capacity. These can be properties of the building or based on building level. We should enforce these in the transfer logic (don’t allow adding items if the chest is full). The UI can show “Chest: 5/20 slots, 50/200kg”.
Data Model: We already have Building.resources?: Resource[] in the model
GitHub
, which is perfect for storing the chest contents. We should also add perhaps maxSlots and maxWeight fields to the Building (or infer by type). Possibly extend the BuildingType.STORAGE definition to include capacity info in a config map.
Multiplayer Considerations: If the game is multiplayer/networked, container contents should be synchronized. Since the project uses Supabase/Socket.io for real-time, we would on any change to a container’s inventory broadcast that to other players on the same island. Additionally, to prevent race conditions, one might implement a simple locking mechanism: e.g. if one player is moving items in a chest, the updates should atomically apply or lock the chest for that player’s session. For now (early development phase), we can assume either single-player or cooperative sharing without conflict and address concurrency later.
Security: It should be defined who can access a container. Likely, any player on the same island (owner or raider) can open it if they find it. In PvP, “unsecured” containers might allow thieves to steal loot
GitHub
. The implementation might mark certain storage as isSecured (there’s a flag in Building for that
GitHub
). That could tie into requiring the raider to break it or something. This is beyond core implementation, but we should keep the possibility in mind. User Interface: The container UI will probably appear similar to the inventory panel, possibly side by side: e.g. Player Inventory on left, Container Inventory on right for easy transferring. Each can have its own grid and counts. The player should be able to drag or maybe shift-click items to move them quickly between inventories.
Implementation & Refactoring Recommendations
To integrate the above features smoothly, some refactoring and careful expansion of the codebase is advised:
Centralize Item Metadata: Right now, item properties (like what a coconut does when consumed) are scattered (consume effects in SurvivalManager.consumeItem
GitHub
GitHub
, icons in UI code
GitHub
). Adding weight, stack size, etc., is an opportunity to centralize these into a single source of truth (e.g. a constant object or JSON defining each item type’s properties). Consider creating an items.ts config file that exports an object mapping ResourceType to an ItemDefinition containing weight, maxStack, perhaps even the icon and description. This way, both game logic and UI can reference it (for weight calculations, for displaying item info, etc.) without duplicating switches in multiple places.
Extend Zustand Store: Add new actions in gameStore to handle inventory capacity logic. For example, modify addResource
GitHub
 to incorporate the checks described (slot count, stack limit). We might break it into helper functions for clarity (e.g. canAddItem(type, quantity) -> boolean to check capacity before actually adding). Also add a new derived state or action for computing total weight (though computing on the fly with reduce is fine given the small inventory sizes).
Player Movement & Stats: The movement system (GameCanvasClient) should query the current encumbrance state each frame or on relevant events. We can store a boolean or a weight percentage in the store that updates whenever inventory changes, so that the render loop isn’t constantly summing weights. For example, after every addResource or removeResource, compute currentWeight and maybe an encumbranceLevel. The movement loop can then just read encumbranceLevel to decide speed. This decouples weight calc from the hot path of movement. We will modify the movement vector calculation to multiply by the speed factor depending on encumbrance. Also, update SurvivalManager.getSprintMultiplier or canSprint to factor encumbrance: if encumbered, return false or a much lower multiplier.
UI Updates: Enhance the <Inventory> component to display weight and allow dragging. We will need to incorporate event handlers (onDragStart, onDrop, etc.) – which might require converting the item divs into draggable elements. Using libraries could simplify this. We should also create a <Hotbar> component for quick access and integrate it into the UI (probably in the bottom center where the action buttons are, or above them). The <BuildMenu> and other UI can remain separate.
Harvest Interaction System: We might introduce a dedicated system or component to handle world interactions (to keep GameCanvasClient cleaner). For example, a small HarvestingSystem module that, given the player’s position or view direction, can detect if a resource node is in reach and handle the harvest logic. This could use Three.js raycasting from the camera on click, or a simpler approach: each NaturalResourceNode mesh could listen for onClick and call a handler with its node.id. We could leverage the event system in React Three Fiber: since the <group> for resource node is a mesh with a geometry, it can have pointer events if raycaster is set up. The handler would call something like gameStore.getState().harvestResource(nodeId) to start the process. We need to implement harvestResource action: it should check if already harvesting that node (to prevent multi-trigger), possibly set a timeout for yield, and maybe play a sound or animation. This action will also update the island state (remove or decrement the node). If we remove the node, we might also want to visually remove it (maybe via filtering it out of island.resourceNodes so React stops rendering it).
Resource Respawn: In the future or backend, depleted nodes can respawn after a cooldown (ResourceNode.respawnRate in minutes
GitHub
). That could be handled by a server-side cron or in-game timer. For now, we might skip automatic respawn, but design the system such that respawn could be integrated (e.g. after harvesting, perhaps leave an invisible placeholder that counts down and then reappears).
Container System Architecture: Representing containers as a type of Building is wise (already foreseen in the data model). We should expand on that by perhaps creating a ContainerManager or extending the building placement logic. The container inventory management can mirror a lot of the player inventory code – consider refactoring common inventory logic (like add/remove item with stack limits) into a utility function that can operate on any Resource[] list, not just gameStore.inventory. This way, we can reuse it for both player and container. For example, a function transferItem(fromInventory, toInventory, type, quantity) would deduct from one and add to the other following all the rules.
Refactor Player vs Store Inventory: Right now the Player object has an inventory field (likely intended for persistence) but game state uses a separate inventory. We should be careful to keep these in sync. When adding/removing items in store, also update player.inventory if it’s being used. Alternatively, we might decide the single source of truth is the store’s inventory array and ignore player.inventory field (except when initially loading a player from DB). This is fine for now. Just ensure when saving or sending data to server, we consider the latest inventory.
Testing and Edge Cases: With new limits, test scenarios like trying to pick up an item with full inventory (should be prevented or dropped), splitting stacks, using items from hotbar, etc. We should also test that encumbrance triggers and clears correctly (e.g. drop enough items and you should regain normal speed/sprint).
Given the above design, the codebase will evolve significantly to support richer gameplay. The changes are aligned with the project’s Phase 1 goals (resource gathering is explicitly next on the roadmap)
GitHub
. By implementing these systems now, we lay the groundwork for crafting (since a robust inventory is prerequisite) and for more engaging survival mechanics.
Prompt for Coding Agent (Implementation Tasks)
Harvestable Resource Interaction: Implement an interaction for resource nodes. When the player clicks or presses a key near a NaturalResourceNode, initiate a harvest sequence:
Trigger a short delay (e.g. 2 seconds) – during which the player “harvests” (you can later play an animation).
After the delay, call a new gameStore.harvestResource(nodeId) action that:
Looks up the ResourceNode in currentIsland.resourceNodes by nodeId.
Determines the yield (e.g. yield the node’s entire quantity or a portion). For now, yield all of it and set quantity = 0.
Calls addResource({ type: node.type, quantity: yieldAmount }) to add items to player inventory.
Updates the node’s data: if depleted (quantity <= 0), remove it from resourceNodes. Otherwise, leave the reduced quantity (for partial yields).
Ensure the above is reflected in the UI: the resource node model should maybe be hidden or destroyed if depleted. (You might re-render Island component by updating currentIsland in the store).
(Optional) Temporarily disable input during the harvesting delay or implement a progress indicator.
Loose Item Pickup: Create a system for loose items that can be instantly picked up:
Define a new type or reuse ResourceNode with a flag for instant pickup. For simplicity, you can spawn some items (e.g. in initializeGame, drop a “stick” item near the player).
Implement an overlap or click handler: e.g. if player is within a small radius and presses E, or if the item is clicked, immediately remove the item from world and add to inventory.
This likely requires a way to render these items (maybe as small mesh or icon on ground) and detect proximity. You can use a simple distance check each frame or use Three.js raycast on click.
Ensure this calls addResource and respects capacity limits (so if inventory full, maybe do nothing or show “can’t pick up”).
Item Metadata & Stack Limits: Introduce an ItemStats configuration (as described above) mapping each ResourceType to weight and maxStack.
Refactor the inventory management: Update useGameStore.getState().addResource to enforce maxStack. If adding an item causes a stack to exceed max, split into a new stack (and check slot capacity).
If inventory slots are at max and a new stack is needed, prevent the addition (or drop the item).
Update removeResource to handle possibly multiple stacks of the same type (e.g. if we remove 50 wood and the player had it split into two stacks, remove from one then the other).
Thoroughly test stacking: e.g. picking up 120 of something should result in a 99 stack and a 21 stack.
Use the ItemStats in consumeItem as well if needed (though consumption mostly just uses type).
Weight Tracking and Encumbrance: Implement weight calculation and its effects:
Calculate currentWeight whenever inventory changes. This can be a derived value: sum(inventory.map(item => item.quantity * ItemStats[item.type].weight)).
Decide on a carry capacity (e.g. maxWeight = 100 as baseline). Possibly store this in player stats or a constant.
Determine thresholds, e.g. heavyThreshold = 1.0 * maxWeight for encumbered, and maybe mediumThreshold = 0.5 * maxWeight for slightly heavy.
In GameCanvasClient movement update (or wherever movement speed is set), adjust the movement vector. For example, if encumbered (weight > heavyThreshold) set movement speed multiplier to 0.5. If just above medium threshold, maybe 0.8.
Integrate with sprint logic: modify SurvivalManager.canSprint to also return false if state.currentWeight > heavyThreshold. Alternatively, handle in movement code by not allowing sprint input when encumbered.
If feasible, add a stamina mechanic placeholder: e.g. a stamina variable that decreases when sprinting; for now, simulate faster hunger/thirst drain when encumbered. For example, in SurvivalManager.updateStats, if player is encumbered and moving, drain a bit of health or hunger to simulate fatigue (or simply add a TODO for future stamina integration).
Add UI feedback: if currentWeight > maxWeight, add a warning via SurvivalManager.getWarnings like “Encumbered - can’t sprint”
GitHub
. If > 50% but <=100%, maybe “Carrying heavy load - movement slowed.” This will cause the yellow warning box to show those messages.
Inventory UI – Weight & Drag/Drop: Improve the inventory UI:
Display the total weight and capacity. In the <Inventory> component footer, add something like Weight: {currentWeight.toFixed(1)}/{maxWeight} kg alongside the slot count.
Implement drag-and-drop reordering: You can use HTML5 Drag events. Make each item <motion.div> draggable by adding attributes draggable={true} and handlers for onDragStart (store the dragged index/type) and onDrop on drop targets (swap indices).
Allow dragging to an “outside” area to drop items: e.g. onDrop on the inventory background means drop the item. For now, just remove it from inventory (or you could spawn it in world, but that requires world coordination – possibly beyond scope for now, so simply dropping could delete the item as a basic implementation).
Ensure the drag-and-drop interactions are tested on both desktop and mobile (mobile might not support drag events easily, so maybe include a long-press or separate UI for dropping on touch devices).
Hotbar Quick-Access: Implement a hotbar for quick item use:
Create a component <Hotbar> in the HUD (e.g. fixed at bottom-center). It should render a row of, say, 5 small slots. If a slot has an assigned item, show its icon and quantity (if stackable).
In state, maintain hotbar: Array<ResourceType | null> of length 5 (or store indices of inventory items).
Allow the player to assign items: e.g. in the Inventory UI, add a context menu or a drag target on each hotbar slot. E.g. drag a stack onto a hotbar slot sets that slot to that resource type.
Handle input: In useEffect in GameCanvasClient, listen for keydown '1','2','3','4','5'. On press, check the corresponding hotbar entry. If it’s a consumable item type and present in inventory (quantity > 0), call consumeItem(type)
GitHub
. If it’s a weapon or tool, switch the equipped item (this might involve setting a equippedItem in state – you can integrate with the existing weapons array in player).
Update the UI of the hotbar in real-time (e.g. if the quantity of an item in the hotbar changes because it was used or more picked up, reflect that).
Make sure that if a hotbar slot’s item stack is depleted (quantity goes to 0 and removed from inventory), the hotbar slot is cleared (no longer points to an item that’s gone).
Container Storage System: Build the foundation for containers:
Allow a storage building to be placed. For testing, you might directly spawn one: e.g., when pressing a debug key, call addBuilding({id: 'demo-chest', type: BuildingType.STORAGE, position: {...}, ... resources: [] }).
Create a UI component <ContainerInventory> similar to <Inventory>. It should accept a buildingId or reference to know which container’s inventory to display (i.e. it will use gameStore.currentIsland.buildings to find the building by ID and use its resources array).
This UI should show the container’s contents and capacity. Use the same grid display approach. Perhaps use a different color scheme or title (“Chest Inventory”).
Implement open/close logic: maybe in UI.tsx, when player is near a storage and presses the Open button, set an activePanel like activePanel = 'container:chestId'. The UI component can parse that to know which to show.
Transferring items: The container UI and player inventory UI should be shown simultaneously to allow drag between them. This can be done by rendering both grids side by side when a container is open. Alternatively, a simpler approach is to have one panel that shows both (with subheadings “Your Inventory” and “Chest”).
Implement drag-and-drop for transfers: Dragging from player inventory to chest inventory should call a new action, e.g. transferResourceToContainer(buildingId, resourceType, quantity). This will internally do: removeResource(type, quantity) from player and addResourceToBuilding(buildingId, {type, quantity}) for the container. Likewise for the reverse (container to player).
Enforce container limits: addResourceToBuilding should check the building’s resources length and total weight (if we decide to limit weight in containers; perhaps slot limit is enough, or we can give containers a large weight capacity so practically only slots matter). Use similar stack logic for container inventory.
Multiplayer sync: If the project has real-time sync, ensure that these changes (player inventory and building resources) would get persisted to the database or broadcast. This might involve calling Supabase or socket events (not fully fleshed out yet in the project). For now, focus on local state updates.
Closing the container: When done, the player can press an X button to close the container panel, or simply walk away (if we had distance checks). For now, manual close via UI is fine.
Testing & Debugging: After implementation, test each aspect thoroughly:
Harvest a tree/rock: does it yield items after delay, remove the node, and add to inventory correctly respecting stack limits?
Pick up a loose item: goes to inventory instantly and disappears from world.
Overfill inventory: try to pick up an item with full slots – it should refuse or drop. Also test picking up more than 99 of one item – should split into multiple stacks.
Encumbrance: pick up enough heavy items to exceed thresholds – check movement speed in-game (you should notice the character slower) and sprint ability (should be disabled appropriately). Also check that dropping items or using them (reducing weight) re-enables normal movement.
Drag-drop UI: reorder inventory items and ensure the inventory array actually updates accordingly. Drag to hotbar – ensure hotbar updates and keypress uses the item.
Container: put items in, out, ensure counts update on both sides and no weird duplication or loss occurs. Test hitting the container slot limit by trying to add more different items than allowed.
No errors in console, and run npm run type-check to ensure type safety after changes
GitHub
.
By completing these steps, we will significantly expand the game’s resource and inventory systems to meet the design goals. The result will be a more immersive survival gameplay loop where players can gather materials with the appropriate effort, manage their inventory strategically (dealing with space and weight), and utilize storage and quick access for their items. This sets the stage for upcoming features like crafting and base-building to plug into these systems.
GitHub
GitHub