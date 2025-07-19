Procedural Terrain Generation for a Natural Island World
Current Terrain Generation Implementation
In the current system, each island is generated procedurally using a noise-based heightmap. The game creates a 64×64 atoll (island) per player using a deterministic seed
GitHub
. Originally, terrain was represented by blocky voxels, but it has since been replaced with a smooth heightmap-based terrain for a more natural look
GitHub
. This heightmap is implemented as a Three.js PlaneGeometry where the y-position of each vertex is set according to a noise function
GitHub
. Key aspects of the existing implementation include:
Fractal Noise Heightmap: Multiple layers of Perlin/Simplex noise are combined to generate the island’s elevation. The code uses multi-octave noise (several noise frequencies added together) to create realistic terrain variation
GitHub
. The height values are normalized to a 0–1 range and scaled to appropriate world units (e.g. multiplied by a factor for 3D height).
Island Shape Masking: To ensure an island shape (land surrounded by water), a circular falloff mask is applied. Height values are gradually reduced toward the edges of the map, creating a natural shoreline and ocean beyond. In code, this is done by computing the distance of each point from the island center and reducing height by a factor (1 - distance/maxDistance)
GitHub
. Any terrain below a certain threshold is set to water level (deep ocean) outside the island radius
GitHub
GitHub
.
Smooth Mesh Rendering: The heightmap is rendered as a continuous mesh. Vertex normals are computed for smooth lighting, and vertex colors are applied based on biome (e.g. green for grass, gray for mountains)
GitHub
GitHub
. This replaces the old block-based look with a natural, rolling landscape
GitHub
.
The current terrain generation already integrates with the character controller. A getTerrainHeightAt(x,z) function samples the noise heightmap to keep the player’s Y position glued to the ground
GitHub
. The character “sticks” to the terrain surface when walking, thanks to real-time height detection, and uses physics-based jumping to go over obstacles
GitHub
. For example, each frame the game checks the ground height under the player and updates the player’s vertical position accordingly
GitHub
, except when a jump is in progress (then gravity is applied until the player lands)
GitHub
.
Desired Terrain Features
We want to enhance the terrain generation to produce an island that is natural-looking and supports rich gameplay. The goals for the terrain include:
Procedural 3D Island: Generated with noise functions to create realistic variation (gentle slopes, some hills, occasional mountains) while maintaining an island shape (land surrounded by water). The overall elevation should be mostly flat with some rolling hills, and perhaps one or two higher points acting as small mountains or peaks.
Biome Diversity: Different areas of the island should have distinct biomes (e.g. beach, grassland, forest, mountain, etc.), determined by factors like elevation and noise patterns. This creates visual variety and influences resource distribution. For instance, lower coastal areas become beaches, interior flat areas grass or forest, and the highest points become rocky or mountain biome
GitHub
GitHub
. Optionally, additional biome conditions can be added (e.g. a swamp in wetter low-lying areas or a desert if part of the island is particularly dry)
GitHub
, although on a small tropical island these might be minor or rare.
Natural Features and Paths: The terrain should look organic – no unnatural sharp edges or uniform grids. There should be open areas and denser areas of vegetation, possibly forming natural paths or clearings. For example, the center of the island might be a meadow or grassland clearing
GitHub
, and dense forests might cover other regions, but with the noise-based distribution creating some clear corridors. These serve as implicit paths that players can traverse, breaking up the forest so it's not uniformly covering everything.
Dynamic Obstacles & Resources: The world should include objects like trees, rocks, and bushes that serve both as obstacles and resource nodes. These are placed according to biome (e.g. more trees in forests, rocks on mountains) and can be harvested or destroyed by the player for resources. They should be generated procedurally along with the terrain so that their placement looks random yet plausible. Each resource node will have attributes like quantity and respawn rate
GitHub
GitHub
, and when harvested (destroyed) it can eventually respawn. These objects make the terrain interactive and also act as obstacles the player might need to navigate around or jump over during exploration.
Character Terrain Alignment: The player character should remain firmly grounded on the terrain, walking smoothly up and down slopes. The system should support jumping over small obstacles – for example, if a log or rock is in the way, the player can jump to get past it. This means the collision system or movement logic must recognize terrain vs. obstacles: the character follows the terrain height continuously
GitHub
, but when a jump input occurs, the character gains upward velocity to clear an obstacle, then gravity brings them back down to the terrain height
GitHub
. The terrain itself should not generate impassable cliffs or holes that break movement; any steep features should be scalable via jumping or gentle enough to walk up.
Proposed Terrain Generation Approach
To achieve the above, we will implement a procedural terrain generation system with noise-based algorithms and carefully tuned parameters. Below is a detailed approach covering height generation, biome assignment, obstacle placement, and integration with character movement.
1. Heightmap Generation with Fractal Noise
Use Perlin or Simplex noise to generate a 2D heightmap for the island. A fractal noise approach is recommended, layering multiple octaves of noise:
Start with a base frequency noise for broad elevation changes (large hills or one big mound on the island). Then add successively higher-frequency noise with smaller amplitudes for fine detail (small bumps, variation)
GitHub
. For example, combine 2-octave “large” noise (for general shape), 3-octave medium noise (midsize terrain features), and 4-octave fine noise (small variations)
GitHub
. Each octave’s contribution is scaled down (e.g. 50% amplitude of the previous) to ensure the terrain has gentle variation and not too jagged.
Ensure the overall height values are normalized or clamped to a reasonable range. Typically noise yields values in [-1,1]; this should be mapped to [0,1] and then scaled to the game’s vertical scale. In our case, we might decide that 0 corresponds to water level and 1 corresponds to the peak height (e.g. mountain top). Current implementation, for instance, converts noise outputs and multiplies final heights by ~10 for use in Three.js coordinates
GitHub
GitHub
.
Emphasize mostly flat terrain with some hills: To do this, we can weight the noise such that the base island has a gentle slope profile. One method is to generate a base radial shape – highest at the center, sloping down toward edges – and then add noise on top of that. In code, the islandHeight function already creates a smooth hill (using a quadratic falloff from center) as the base
GitHub
. We keep the noise amplitude modest relative to this base so that the central area remains relatively flat or gently rolling, and any hills introduced by noise are not too extreme. This yields an island that is mostly flat grassland in the interior with a bit of elevation change for realism, plus maybe one prominent hill or mountain.
Maintain smooth transitions: After generating heights, we should apply a smoothing step or rely on the high resolution of the mesh to avoid sudden cliffs. The use of continuous noise inherently gives smooth changes, and computing vertex normals will ensure lighting transitions look smooth on slopes
GitHub
.
2. Island Shaping and Water Areas
Implement a circular mask so that beyond a certain radius, the terrain is underwater:
Determine an island radius (half of the terrain size, minus some margin). For any point (x,z) in the heightmap, calculate its distance from the island center. If the distance is greater than the desired radius, set the height to a water level (e.g. a constant negative value representing deep water)
GitHub
GitHub
. This will create an island that tapers off into the ocean.
Apply a gradual falloff near the edges: Instead of an abrupt cutoff, fade the terrain heights to 0 as the distance approaches the island radius. For example, multiply the height by a factor like Max(0, 1 - (distance / maxDistance))
GitHub
. This produces a natural beach/ocean shelf where the land gets lower toward the edges. The code already uses such an approach (islandMask) to smoothly reduce height at the borders
GitHub
.
Define sea level and water depth: Any final height value below a small threshold (e.g. <0.5 in world units) can be treated as underwater. In the current game, heights below ~0 are considered water and even force-set to a deep water value (-5) to create a clear separation
GitHub
. We can keep a similar convention: land is >= 0 height, water is a fixed negative depth. In rendering, we will add a water plane at sea level and perhaps a surrounding ocean mesh (the current implementation uses a large cylinder and a plane for water surface)
GitHub
GitHub
.
By combining the radial falloff and noise, we get an island that is nicely isolated by water. The center is highest (but relatively flat), and edges smoothly descend into the ocean, forming beaches.
3. Biome Assignment and Variation
Once we have the heightmap, we determine the biome for each location on the island based on its height and possibly additional noise parameters:
Height-based Biomes: Start with simple rules: if a point’s height is at or below water level, it’s Water. Slightly above water (coastal low height) can be marked as Beach biome
GitHub
. Very high points (top X% of height range) become Mountain biome
GitHub
. These thresholds create basic biome regions: beaches framing the island, and rocky areas on peaks.
Noise-based Biomes: For mid-range elevations (the bulk of the island), use a noise function or pseudo-random factor to decide between forest, grassland, etc. This ensures a patchy, natural distribution rather than one uniform biome. For example, generate a separate biome noise value for each coordinate (e.g. Perlin noise at a different scale). The current world generation uses temperature and moisture noise to determine biome
GitHub
GitHub
. We can simplify that by thinking in terms of one “biome noise”: if the noise is above a certain threshold, call it Forest, otherwise Grassland. The result is that some areas become dense forest (grouped by noise), while others remain open grassy meadows
GitHub
. The game’s existing logic does exactly this: for non-extreme heights, if biomeNoise > 0.2 it labels the area as forest, else grassland, with a special case for the very center being a Meadow clearing
GitHub
.
Multiple Biome Factors: If we want to incorporate more biomes like Desert or Swamp, we can use two noise dimensions (often thought of as temperature and moisture). For instance, one noise could represent a moisture gradient and another a temperature or fertility gradient. Based on combinations of these, we can assign desert (low moisture, high temp), swamp (high moisture, high temp but low elevation), etc., in addition to forest and grassland
GitHub
. This is more relevant for larger worlds; on a small island, it may not naturally include a desert, but a small swamp area could form near inland water or marshy ground if we allow it. In summary, height gives us some biome info (water, beach, mountain), and noise adds horizontal variation (forest vs grassland patches, occasional special biomes).
Biome Smoothing: Ensure that biome transitions are not too abrupt. Because we derive them from smooth noise and height, neighboring points will often end up in the same or similar biomes, creating clusters (forests in clumps, etc.). If needed, we can post-process the biome map (e.g. a slight blur or majority filter) to eliminate tiny isolated biome pixels that would look out of place. However, the current noise approach likely suffices for natural grouping.
Each biome will be tied to distinct visuals and resources. When rendering the terrain, we apply a color to each vertex based on its biome, using a predefined palette (e.g. sandy color for beach, deep green for forest, light green for grassland, gray/white for mountains)
GitHub
GitHub
. The result is an isometric view where you can visually identify biomes across the island.
4. Placing Resource Nodes and Obstacles
With the terrain shape and biomes defined, we then populate the world with resource nodes (trees, rocks, etc.) that double as obstacles and interactive objects:
Noise-based Distribution: We use a random or noise-driven approach to scatter resource nodes so that they appear naturally clumped rather than evenly spaced. For example, iterate over each terrain tile (or each few meters of terrain) and roll a probability for a resource spawn. The current implementation uses a 5% base chance per tile, modulated by a noise function to avoid pure randomness
GitHub
GitHub
. Specifically, it checks a resourceNoise(x,z) value; if it exceeds a threshold (like 0.95 corresponding to 5% highest values), a resource node is placed
GitHub
. This yields randomness but ensures reproducibility (same seed gives same placements) and some clustering (areas where resourceNoise is high will have multiple nodes).
Biome-Specific Resources: Determine the type of resource based on the biome at that location
GitHub
GitHub
. For instance:
In Forest biome, spawn mostly trees (Wood) and occasionally berry bushes
GitHub
.
In Mountain biome, spawn rocks (Stone), with a smaller chance of metal ore or crystal nodes at the highest points
GitHub
.
Grassland might have fewer resources, maybe the occasional berry bush or small tree
GitHub
 (since it’s more open).
Beach could spawn coconut palms or driftwood (Wood/Coconut) and perhaps coral or shells near water
GitHub
.
Swamp (if present) could have things like mangrove trees or special resources (Coconut, Coral as in code)
GitHub
, whereas Desert (if any patch exists) might have only sparse stones or rare crystals
GitHub
.
Placement and Transform: For each chosen resource spawn, create a ResourceNode object with a unique ID and assign its world position. The position should align with the terrain height at that point. In our system, since the terrain is generated from the same noise, we can get the height value for the node’s coordinates and place the object at that Y. (The existing code does this by using the height map and scaling the Y by a factor when creating the node position
GitHub
.) We also give the node an initial quantity (how much resource it holds) and define a respawn rate so it can regenerate after being harvested
GitHub
GitHub
.
Obstacle Characteristics: These resource nodes will act as dynamic obstacles in the environment. “Dynamic” because they can be removed (harvested) by the player, unlike static terrain. When present, they should impede movement – for example, a tree or rock occupies space so the player cannot walk straight through it. We should consider adding basic collision for these objects (even if just a simple radius or bounding box) so that the player must go around or jump over them. In the current setup, there isn’t a full physics engine, but we can simulate collisions by not allowing the player to move into a space where a resource node sits (the game could check the distance to resource nodes when moving, or use Three.js collision detection if available). At the very least, visually these objects present obstacles (the player will intuitively navigate around them). With jumping enabled, a player might hop over a low obstacle like a fallen log or a rock – since our jump just adds vertical height, the player could clear an obstacle if the movement carries them forward over it.
Destructibility: Each resource node should be destructible – when the player interacts (e.g. swings an axe at a tree or uses a pickaxe on a rock), the node’s quantity/health goes down. If it hits zero, the node is “harvested” (e.g. the tree falls or the rock is depleted). We will implement this in gameplay logic (not part of terrain generation per se, but generation provides the initial nodes). The terrain generator can ensure there’s a sensible amount of resources (to meet gameplay needs). For example, ensure that at least a few trees spawn on every island so the player isn’t stranded without wood. This can be done by adjusting the spawn probability or forcing a minimum count of certain resource types in the generation algorithm.
5. Character Movement Integration
Finally, integrate the terrain with the player’s movement and physics so that traversal feels natural:
Terrain Following: Use the heightmap to keep the player’s Y coordinate on the ground. We have a utility function getTerrainHeightAt(x, z) that returns the height of the terrain at a given point
GitHub
. This can sample the noise function directly (as done currently) or sample the generated heightmap. Every game tick (or animation frame), update the player’s position.y to match the ground height underfoot, unless the player is in a jump state
GitHub
. This makes the character “fixed” to the terrain – they won’t float in air or sink into ground as they move. It also smoothly moves them up slopes. The existing implementation runs this check ~60 times per second, effectively gluing the player to even uneven terrain
GitHub
GitHub
.
Jumping Mechanics: Implement jumping so the player can leap over obstacles or up small ledges. The current approach uses a simple physics simulation: when jump is triggered, a vertical velocity is applied, and gravity decrementally reduces this velocity each frame
GitHub
. While in the air, the player’s Y is moved by this velocity, not clamped to the ground height (so they can go above terrain). Once the jump velocity brings them back down and their feet reach the terrain height, we detect a landing (player’s Y <= terrain height) and end the jump, reattaching the player to the ground
GitHub
. We will retain this logic. It allows hopping over things like a small rock – as long as the obstacle isn’t too tall, the jump arc will carry the player above it. For very tall obstacles (like a big boulder or tree), jumping might not clear them – those are intended to go around or remove.
Collision Considerations: To further integrate obstacles, we might extend the movement logic so that if the player runs into a tree or rock, they don’t just clip through it. In a simple scheme, we can stop movement input or slide the player along the obstacle. Another approach is to incorporate a physics library for more accurate collisions. However, given the scope, a simpler check (e.g., don’t allow the target position if it’s inside an obstacle’s radius) can be enough to prevent walking through trees. The character controller already avoids leaving the island by validating the distance from center before moving
GitHub
GitHub
; similarly, we can validate that the new position is not too close to a resource node’s position. This way, the player must navigate around the object or use jump to go over it.
Testing Slope Navigability: We should test that slopes generated by the noise are not so steep that the player motion breaks. Since we directly set Y to the ground, even a steep slope is technically walkable (the player will snap to the new height as long as it’s under their feet). To avoid visual oddities or traversal issues, we might limit how steep the noise can make the terrain. In practice, our multi-octave noise with smoothing should produce fairly rolling hills. Additionally, the meadow/grassland areas should be relatively flat, which is where the player will likely build or spend time, whereas steeper terrain appears at the edges or mountains, which the player can deliberately climb or avoid.
Implementation Steps for the Coding Agent
When writing the code (or prompting a coding AI to do so), we can break down the implementation into clear steps. Here’s a structured plan that can be given to the coding agent:
Noise Generator Setup: Initialize a noise generator (Perlin or Simplex) with a seed for determinism. Provide functions for noise2D(x,z) and a utility to combine multiple octaves (fractal noise). This ensures the same island can be regenerated from a given seed
GitHub
GitHub
.
Heightmap Calculation: Loop over a 2D grid of points (size N×N, e.g. 64×64 or higher resolution for smoothness). For each point (x,z), compute the height value: use a combination of noise octaves. For example, sum four octaves of noise with diminishing amplitudes
GitHub
. Normalize this sum to [0,1]. Then apply the island mask: determine distance from center and multiply the height by the falloff factor (0 at the extreme edge, 1 at center)
GitHub
. If the point lies outside the island radius or the resulting height is extremely low, treat it as water (you can clamp it to 0 or a negative water depth)
GitHub
. Store the height in a 2D array (heightmap).
Biome Map Generation: Using the heightmap, generate a parallel biome map. For each point, decide the biome:
If height <= 0 (or below a small threshold), biome = WATER or BEACH (use BEACH for just above water, WATER for fully submerged)
GitHub
GitHub
.
Else if height is very high (top of island), biome = MOUNTAIN
GitHub
.
Else determine biome by noise: compute a biome noise value (and possibly a second one for moisture). For example, t = noise2D(x*0.05, z*0.05) gives a pseudo-random value. If t > 0.2 we assign FOREST, otherwise **GRASSLAND】
GitHub
. If using moisture/temperature, apply the logic to possibly assign DESERT or SWAMP for certain noise ranges
GitHub
.
Include any special-case tweaks: e.g., if very close to the island center, you might label it MEADOW (open grass) irrespective of the noise
GitHub
, to ensure a nice flat starting area for the player. And if at the extreme edge but still land, use BEACH. Record the biome type for each point in a 2D array.
Terrain Mesh Construction: In the game engine (Three.js with React Three Fiber), create a PlaneGeometry for the terrain of the given size (covering the island area). Subdivide it sufficiently (e.g. 96×96 segments or more) so that it can represent smooth curves
GitHub
. Iterate over the geometry’s vertices and set each vertex’s y-coordinate to the corresponding height from the heightmap
GitHub
. This effectively “sculpts” the mesh to match our procedural heightmap. After modifying vertices, recompute normals for correct lighting
GitHub
. Also create a color attribute for the mesh: for each vertex, look up its biome from the biome map and assign an RGB color according to a predefined biome palette (for example, green for grassland, dark green for forest, beige for beach, gray for mountain, blue for water, etc.)
GitHub
GitHub
. Apply these vertex colors in the material so the terrain is colored in-game.
Resource Node Placement: Iterate through the heightmap positions and decide where to place resource nodes (trees, rocks, etc.). Use a probability and noise approach: e.g., for each land tile (biome not water), generate a random number or use a noise threshold to decide if a resource spawns there
GitHub
GitHub
. Aim for an overall density (e.g. ~5% of tiles have something) so the island is populated but not completely covered
GitHub
. For each spawn:
Determine the resource type based on the biome
GitHub
GitHub
. (Forest → Wood or Berries, Mountain → Stone or Metal, etc., as discussed.) If the biome has no associated resource (e.g. pure grassland might often be empty), you can skip placement.
Create a ResourceNode object with a unique id and set its type (resource type) and initial quantity (perhaps a random amount within a range, e.g. tree wood 5–15 units)
GitHub
GitHub
. Set its position to the world coordinates: (x_world, y_world, z_world) where x_world = x - size/2, z_world = z - size/2 (to center the island at origin), and y_world = height * scale (the height value converted to world units)
GitHub
. Also assign a respawnRate in minutes for the resource to regrow if harvested
GitHub
. Collect all these nodes in an array.
In the rendering/Three.js layer, instantiate 3D models or placeholders for these resource nodes. For example, for each tree node, you might render a tree model at that position, for a rock node a rock model, etc. These will be part of the scene as individual objects.
Integrate Obstacle Collisions: (If not using a physics engine, implement simple checks.) When updating player movement, ensure the player cannot pass through a resource node: check the distance from player to each node; if the player is about to move into a radius too close to a node, stop or adjust the movement vector. This will make the node act as a solid obstacle. You can simplify by using a single radius for all or per resource type (trees might have a ~0.5m radius trunk, rocks similar). This step can be refined, but it’s important to prevent walking inside a tree. If using a physics library later, you would add colliders for these objects instead.
Terrain Following Function: Implement a function (or use the existing one) to get the terrain height at any X,Z coordinate
GitHub
. This likely just reuses the noise function or heightmap data. In our case, since the terrain is generated from noise, we can call the same noise-based height function with the seed to get a height for arbitrary positions (this is how the current getTerrainHeightAt is implemented, using the terrainNoise.islandHeight() method
GitHub
). This function will be used by the player controller to stay on the ground.
Player Controller Updates: Use the terrain height function in the game loop to adjust the player’s vertical position. Pseudocode:
// Each frame or on a fixed interval (e.g. 60 Hz):
let groundY = getTerrainHeightAt(player.x, player.z);
if (player.isJumping) {
    // If jumping, update vertical velocity and position
    player.velocityY -= GRAVITY * deltaTime;
    player.y += player.velocityY;
    if (player.y <= groundY) {
        // Landed
        player.y = groundY;
        player.isJumping = false;
        player.velocityY = 0;
    }
} else {
    // Not jumping: clamp player to ground
    player.y = groundY;
}
This logic ensures the character is fixed to the terrain when not in the air, and handles landing from jumps
GitHub
GitHub
. The jump impulse (velocityY) should be tuned so that the player can clear small obstacles but not fly off the island. The current code uses a jump velocity of ~0.3 (and a gravity decrement of 0.02 per tick) which gives a modest hop
GitHub
GitHub
. We can use similar values.
Testing and Tuning: Finally, test the generation with various seeds. Verify that the island has the desired features: mostly flat areas with some hills, a logical distribution of biomes (e.g. green center, sandy edges, maybe a rocky top if any high point), and resources placed in sensible spots (trees in clusters, etc.). Ensure the player can navigate: walk from the center to the beach without getting stuck, jump over a rock if needed, and that gathering a resource (if that’s implemented) removes the obstacle. Tweak parameters as needed – e.g., increase the noise amplitude if the terrain is too flat, or adjust resourceDensity if the island feels too empty or too crowded. Also pay attention to performance (the mesh resolution and number of objects should be manageable for the target devices).
By following these steps, we will implement a terrain generator that produces a natural-looking 3D island with varied biomes, resources to interact with, and a player character that can smoothly traverse the environment (including jumping over obstacles when necessary). This prompt gives the coding agent a clear specification to create or modify the code accordingly, leveraging the existing noise functions and game framework to meet our design goals.
