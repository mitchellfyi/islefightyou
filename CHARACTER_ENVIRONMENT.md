Character Control & Environment Interaction
Movement and Stamina
The game uses a third-person movement system with support for both keyboard and mobile inputs
GitHub
. Players can walk, run, jump, and traverse the island terrain smoothly
GitHub
. To add depth, a stamina mechanic should govern all strenuous actions:
Walking vs. Sprinting: Normal walking does not consume stamina, allowing infinite exploration at a slower pace. Sprinting (e.g. holding Shift on PC or a sprint button on mobile) rapidly drains a stamina meter
ark.fandom.com
. While sprinting, the player moves faster, but if stamina hits zero they become exhausted and cannot sprint or jump until it regenerates. Walking or standing still lets stamina recover over time (faster when idle)
ark.fandom.com
. Designing sprint to last only a short burst (e.g. ~5–10 seconds of full sprint) encourages strategic use of stamina. If stamina depletes entirely, the character should slow to a fatigued walk and regain stamina before running again
ark.fandom.com
. This prevents unlimited sprint and adds realism.
Jumping and Climbing: Jumping uses a chunk of stamina each time. The existing physics-based jump (Space bar / touch button) is already implemented
GitHub
 – tying it to stamina means the player can only jump if they have enough stamina. For example, subtract a fixed amount per jump (and prevent jumping when below that threshold). This makes vertical movement a tactical choice. If you plan to add climbing or vaulting over obstacles later, those actions should also cost stamina.
Stamina Regeneration & Effects: Stamina regenerates gradually when not being heavily used. For instance, Ark: Survival Evolved causes Food to drain faster while stamina is regenerating and Water (thirst) to drain faster while stamina is being consumed
ark.fandom.com
 – you could adopt a similar approach to tightly couple stamina use with survival needs. Additionally, certain conditions might alter stamina behavior: being encumbered (carrying too much) could slow regen, and low survival stats can limit stamina. (In your current design, if the player is dehydrated, they already suffer speed penalties
GitHub
. You could also have low hydration or extreme hunger reduce the max stamina or regen rate, as done in other survival games
steamcommunity.com
.) This means if the player neglects food and water, they can’t sprint as long or recover stamina quickly, adding consequences for survival management.
Exhaustion Penalties: When stamina fully drains, besides preventing sprint/jump, you might impose a brief fatigue period where the player moves slower or pants for a moment. This feedback teaches players not to redline their stamina. Some games even tie exhaustion to health – for example, in 7 Days to Die, running out of water stops stamina regen entirely and running out of food eventually causes health loss
steamcommunity.com
. We can keep it simpler: perhaps no health loss directly from exhaustion, but if a player runs out of stamina while swimming it could be dangerous (explained below). The key is that stamina should be a critical resource for all movement-related actions, requiring the player to balance exertion and rest.
Swimming and Underwater Mechanics
Swimming will open up exploration of the surrounding ocean, but it introduces an oxygen constraint and modified controls. As planned in your roadmap, an “Ocean System” with swimmable water and depth is a feature to implement
GitHub
. Key design considerations:
Surface Swimming: On the water surface, players can move in water at a slower pace than on land (with maybe a separate swim animation). Surface swimming still consumes stamina (simulating treading water and forward movement)
ark.fandom.com
, but the player can breathe normally. If the player stops moving, you might allow them to tread water without stamina drain (or minimal drain) to avoid drowning just from idling on the surface. Reaching land or shallow water should restore full movement control.
Diving Underwater: Once the player goes below the surface, an oxygen meter starts to decrease
ark.fandom.com
. This could be implemented as part of the survival stats (e.g. maxOxygen and current oxygen). A typical default might be ~30 seconds of breath-hold, but this can be adjusted for gameplay. Underwater, the player should have 3D movement: e.g. look upward and move forward to swim up, or a key (like Space) to ascend and Ctrl to dive down. Underwater movement is slower and more resistance-based. Stamina continues to drain from swimming effort, so the player juggles two depleting resources underwater (oxygen and stamina). If the player runs out of oxygen, they begin taking damage rapidly – effectively drowning. For example, once oxygen hits 0, lose a percentage of health per second until they surface (or die). This creates urgency to resurface or find air pockets.
Stamina & Drowning Interaction: It’s important that if a player is fully exhausted (stamina 0) while still underwater, they will struggle to swim. In Ark, if you run out of stamina while swimming, you move extremely slowly and risk drowning before reaching the surface
ark.fandom.com
. We should mirror that: an exhausted swimmer can’t sprint-swim and barely paddles, making oxygen depletion more dangerous. Essentially, stamina acts as your swimming endurance – if you run out of stamina during a long dive, surfacing in time becomes a challenge. This adds a nice risk/reward for diving deeper: you must manage both oxygen and stamina carefully.
Emerging and Recovery: Upon returning to the surface, the oxygen meter refills (players catch their breath) over several seconds, and stamina can start regenerating (faster if they stay still). You can show an oxygen bar alongside stamina when underwater so the player is aware of both. To enhance underwater gameplay, consider future upgrades: for instance, craftable scuba gear could extend underwater time (Ark’s SCUBA Tank provides oxygen to the player
ark.fandom.com
). But initially, the basic loop is: dive briefly, gather or explore, then resurface to avoid drowning. Also note that underwater environments might contain hazards (like hostile sharks or jellyfish per your enemy types
GitHub
), which will make diving riskier but potentially rewarding if rare resources (e.g. coral or pearls) are found in the depths.
Resource Gathering and Tool Use
A core of survival gameplay is gathering resources from the environment. Your world already spawns resource nodes by biome (trees, rocks, coconut palms, etc.)
GitHub
GitHub
. Now we define how the player interacts with those:
Basic Harvesting by Hand: The player should be able to collect some resources without any tools, albeit inefficiently. For example, they can punch a tree to get a small amount of wood or thatch. This mirrors Ark’s logic where you can punch trees to get wood, but it injures the player and yields very little
ark-survival-evolved-archive.fandom.com
. In our game, using bare hands might drain extra stamina and even cost a bit of health (simulating scrapes) for hard materials. Similarly, picking up loose resources from the ground (stones, sticks, berries) can be done with empty hands by pressing the interact key (e.g. “E” on keyboard). Hand gathering should be limited to early-game or emergency situations – just enough to craft your first basic tools.
Tool-Based Gathering: To gather efficiently, players craft and use tools. A stone axe can chop trees much faster and yield more wood, and a pickaxe can break rocks to get stone or metal ore. When using the proper tool on a resource node, the node’s resource quantity decreases and the corresponding items are added to the inventory. Tools greatly improve yield: e.g. one swing of an axe might give several wood, whereas punching with a fist gave one and hurt you. This follows the classic survival formula where “punch tree, get a couple wood, then craft axe to get tons of wood”
ark-survival-evolved-archive.fandom.com
. Tool use should still consume stamina per swing, and possibly durability on the tool. (Your design already considers weapon/tool durability
GitHub
 – each gathering action could reduce tool durability slightly, encouraging players to repair or craft new tools over time.) Some resources might be impossible to obtain without the right tool – for instance, mining metal ore might require at least a pickaxe; trying with bare hands does nothing. This gating gives value to tool progression.
Resource Node Mechanics: Each resource node (tree, rock, etc.) can have a finite amount of material that depletes as players harvest
GitHub
. For example, a palm tree might hold 100 wood units; each axe swing yields 10 wood until empty, at which point the tree is “felled”. You might show a visual change (tree falls or a rock crumbles). The node can respawn after some time (per your world design, possibly via an “edge cron” job for resource respawn
GitHub
 or simply a timer in-game). Ensure that respawn times aren’t too short, so players need to explore for resources rather than camping one spot. Different biomes yield different resources (your biome system ensures, for example, more wood in forests, more stone in mountains, etc.). Also consider random drops: e.g. chopping trees might sometimes drop a coconut or fruit; mining rocks could rarely drop metal ore in addition to stone – this encourages continued gathering and feels rewarding.
Using the Right Tool for the Job: If you implement multiple resource types per node (like Ark does: using a pick on a tree yields more thatch, using an axe yields more wood), players can choose tools based on what they want. This might be an advanced nuance; early on, it’s fine to simply have one tool per resource type (axe for trees, pick for rocks). The important part is the progression: basic actions with hands vs. advanced actions with tools. Over time, players can craft better versions of tools (e.g. a metal axe that outperforms the stone axe). With better tools, they harvest faster and with less stamina cost per resource. This creates a satisfying improvement in efficiency as they progress.
Crafting System and Progression
Crafting allows players to turn raw resources into useful items (tools, structures, weapons, etc.). The system can start simple and grow complex with player progression. Key aspects to implement:
Crafting Interface & Basics: Players should have an in-game crafting menu or inventory interface where recipes are listed. Initially, only basic recipes are available: for example, campfire, basic tools (stone axe/pick), a makeshift weapon like a slingshot
GitHub
. Crafting consumes the required resources from the player's inventory and takes a short time to complete. You might show a progress bar or simply complete instantly for simple items. The crafted item then appears in the inventory. Early crafting can be done “on the go” (by hand) for primitive items. This represents the player using their survival knowledge to craft anywhere.
Station-Based Crafting: For more complex items, require specialized stations. Your design already lists structures like Workshop, Campfire, Repair Bench
GitHub
, and the Recipe schema supports a buildingRequired field for this purpose
GitHub
. For example, to cook raw fish into cooked fish, the player needs to use a Campfire (food recipe tied to campfire). To craft advanced weapons or tools, they might need a Workshop or Forge. The player would have to build or access that station, place the required materials into it (or simply have them on hand depending on implementation), and then craft the item through the station’s interface. Station-based crafting adds a layer of progression: you can’t craft high-tech items in the field; you must establish a base with the proper facilities. This is similar to Ark’s approach where a Fabricator or Smithy is needed for advanced gear. It also promotes base-building, as players will want to construct these stations.
Recipe Unlocks and Progression: To prevent the player from crafting everything from the start, tie recipe availability to player progression (XP/levels). The project already tracks player level and experience
GitHub
, so we can implement level-gated recipes
GitHub
. For instance, at level 1 the player knows only the basics (campfire, cloth clothes, wooden spear); by level 5 they unlock more (bow and arrows, simple hut building pieces); by level 10, more complex items, etc. You could auto-unlock recipes at specific levels or use an engram/blueprint system: e.g. each level grants points that the player allocates to learn specific recipes of their choice (Ark’s method). Your TODO hints at a “Blueprint-based crafting” system
GitHub
, so you might have actual item blueprints that are required to craft certain things. This could mean a player must find or earn a blueprint item, or simply that the recipe list is conceptually a set of blueprints the character learns. In any case, experience points (XP) are earned by survival activities (harvesting, crafting, combat), allowing the player to level up. Leveling up could also improve player stats (e.g. +Max health or stamina) as an incentive, but the main focus here is unlocking new crafting options and abilities as the game progresses. This ensures a sense of progression – the longer you survive and the more you accomplish, the more you can create.
Crafting Costs and Time: Balance each recipe with appropriate resource costs and crafting time. Simple items might only take a few seconds and common resources, while advanced items require rarer resources and longer build times. For instance, a Rusty Revolver (as per your weapon tiers) might need metal, wood, and crafting at a Workshop with a 30-second craft timer. You can allow players to queue up crafts at a station (batch crafting) in the future
GitHub
, but early on, even one-at-a-time crafting is fine. The key is to make crafting feel rewarding – after gathering resources, the player gets tangible improvements like better tools or a campfire to cook food. Also consider item repair via crafting: e.g. at a Repair Bench, spend some resources to restore item durability (this is part of your durability system plans
GitHub
). This integrates with crafting and resource gathering, forming a cohesive loop (gather → craft/upgrade → survive better).
Survival Stats and Health Management
All these systems tie into the overarching survival mechanics of the game. The player has vital stats – health, hunger, thirst (and now stamina/oxygen) – that must be managed to stay alive
GitHub
. Here’s how they work together with environmental dangers and remedies:
Hunger & Thirst: The player needs to eat and drink periodically to keep these meters up. Over time, hunger and thirst values tick down (in your current code, hunger drops by 1 every 3 minutes, thirst by 1 every 2 minutes
GitHub
). If the player ignores these, consequences set in: when hunger is very low, the player’s health will not regenerate and they risk starvation. In fact, your design specifies that if hunger hits 0, you eventually start losing health (though not instantly fatal)
steamcommunity.com
. Thirst is similar – a dehydrated player suffers a reduced ability to sprint and may stop regenerating stamina entirely
steamcommunity.com
. In-game, you already enforce that hunger under 10 blocks health regen and thirst under 10 slows the player’s sprint speed by 30%
GitHub
. These penalties will encourage players to hunt for food and fresh water sources. The island provides solutions: fruit like coconuts or berries to eat, fish to catch and cook, or simply drinking water. Consuming food/drink items immediately restores hunger/thirst (e.g. a coconut might restore 25% thirst in your system
GitHub
). Make sure to surface these effects in the UI (e.g. icons or color changes when starving/dehydrated) – you already have a “Survival HUD” planned for real-time hunger/thirst indicators
GitHub
.
Health & Damage Sources: Health represents the player's life. It drops when the player is injured by something: this could be combat (enemy attacks, gunshots), environmental hazards, or starvation/dehydration effects. Some environmental damage examples to implement: fall damage (if the player falls from a height, subtract health based on fall distance or impact velocity), drowning (as mentioned, when oxygen is gone underwater, lose health rapidly), and possibly environmental hazards like standing in fire or extreme weather (though the latter can be added later with your weather system). You also have enemy types (e.g. seagulls, crabs, sharks) – their attacks will reduce health. If health falls to 0, the player dies. According to your features, you plan an auto-respawn after a short delay
GitHub
. Indeed, your current implementation respawns the player after 3 seconds, with some stat penalties (like reduced health and some hunger/thirst penalty to prevent immediately continuing without consequence)
GitHub
GitHub
. We should make sure the player is notified of death (a death screen or indicator) and then respawn them at a safe point (perhaps the starting location or a bed if you add that feature).
Treating Injuries (Healing): Players can recover health in a few ways. First, natural regeneration: if the player’s hunger is above a threshold (not starving) and they are not bleeding, they slowly regain health over time
GitHub
. This simulates the body healing when fed and rested. Second, consumable items can provide immediate healing or fix status effects. Your game already includes medical supplies: for example, a Bandage removes one bleed stack
GitHub
 and a First Aid Kit restores a large amount of health (+50) and stops bleeding entirely
GitHub
. Ensure the player can use these items easily from their inventory or hotbar – your interactive inventory (click to use consumables) is built for this
GitHub
. Third, eating food can heal a bit as well (cooked foods might give a small health boost on consumption
GitHub
). This gives players multiple paths to recover: immediate but limited healing from items, versus slower regen by staying nourished.
Bleeding and Other Ailments: In combat or accidents, the player might receive a bleed effect – your design already has a bleed stat that can stack up to 5, each causing health loss over time
GitHub
. Bleeding essentially puts the player on a timer to find healing. They can use a bandage to reduce bleed stacks or a first aid kit to eliminate it
GitHub
. You could expand on status effects later (broken bones from high falls, poisoning from certain creatures, etc.), but bleeding is a great start that you've implemented. It forces the player to prepare bandages when exploring dangerous areas. The survival system should alert the player to critical conditions: low health, starving, dehydrated, or bleeding (your warning system idea will flash messages like “Starving - no health regen” or “Bleeding - losing health!”
GitHub
GitHub
). This feedback is crucial so players know to take action.
Balancing Survival Mechanics: Finally, it’s important that these survival needs (stamina, oxygen, hunger, thirst, health) are balanced to be engaging but not overly punitive. From your roadmap, the goal is a 15-minute gameplay loop that feels punchy
GitHub
. That suggests these meters shouldn’t deplete so fast that the player spends all their time eating or resting. Your current drain rates (hunger ~33 minutes to go from full to zero, thirst ~20 minutes
GitHub
) seem reasonable. Stamina will likely drain and recover much faster (on the order of seconds) since it’s a moment-to-moment resource, whereas hunger/thirst are long-term. Playtesting will be important: ensure that managing food and drink adds tension but doesn’t frustrate the player. You’ve smartly decided that players cannot die from hunger while offline
GitHub
 – this prevents unfair death, and similarly you might allow some forgiveness like not instantly killing the player the second a meter hits zero. With proper tuning, the character controller and survival mechanics together create a challenging but fun loop: explore and fight (drains stamina/health) → gather food and water (restore hunger/thirst) → craft better gear → explore further. Each system (movement, resource, crafting, survival stats) reinforces the need to engage with the others, which is exactly what a survival game should achieve.
 