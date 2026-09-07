# Architecture — v0.1.3.2.1

> v0.1.3.2.1 keeps save schema 2 and adds no new persistent runtime subsystem. HUD geometry remains DOM/CSS; interaction hints reuse WorldScene gameplay priority; combat-range diagnostics live in CombatSystem and are gated by `DEBUG`. ArchAngel Azrael/Assassin remain source-only until the next runtime-harvesting pass.

## Recovery and stackable consumables

`RecoverySystem` owns transient recovery cooldowns, recent-combat timing, food-over-time state and passive safe-zone HP regeneration. Consumable content is immutable data in `data/consumables.js`; persistent ownership remains ordinary inventory state. Inventory stacks store `quantity`, while equipment continues to reference unique non-stackable instance IDs. Save schema stays at 2: missing quantities normalize to 1, so pre-stack saves remain valid.

Quick-use HP/Essence controls and Inventory Use both dispatch into the same recovery path. Flask effects share a named cooldown group. Food checks recent combat plus nearby active hostiles and is interrupted through the same combat callback used when the player takes or deals damage. Sanctuary rest is a map-defined `RECOVERY_POINTS` interaction rather than a Cinder-specific hard-coded heal, allowing later camps, shrines and dungeon recovery points to reuse it. Merchant stock and generic recovery drops are also data-driven.

Stack additions are capacity-checked before mutation: compatible stacks are filled first, a completely full pack may still accept an item if an existing stack has capacity, and additions that need a new slot fail atomically.

## Map-transition lifecycle invariant (v0.1.2.4.3)

A transition prepares/verifies the destination package while the source map is still active, commits map/entry coordinates only after success, saves, fades, then restarts WorldScene. During the source fade, `this.transitioning` gates `update()` so the old player body cannot overwrite committed destination coordinates. Phaser `Scene.restart()` reuses the Scene instance, so `WorldScene.create()` must reset that transient flag before destination gameplay begins. Loaded textures are retained for the browser session. On destination create the player layered stack is explicitly rebuilt and a delayed integrity pass can re-prepare the current map assets if required textures are missing. This intentionally separates **map package loading**, **transient Scene lifecycle state**, and future **texture cache eviction**.

## Player visual compatibility

Player gear may be marked `full_combo` only when its visual layer supplies real populated frames for walk, standard slash, one-handed/backslash source and halfslash across all four directions. v0.1.2.4.2 moves the Level-1 starter outfit onto that invariant while preserving the old item IDs. Shared starter item IDs can now expose a `playerVisual` override: player rendering/asset resolution uses the revised-combo presentation while NPC/enemy loadouts keep their existing classic `visual` mapping.

# Architecture Summary

## Boundaries

Ashfall is a static Phaser application with four deliberate layers:

1. **Content data** defines stable item, enemy, NPC, quest, spawn and zone IDs.
2. **Systems** interpret that data for combat, stats, inventory, dialogue, quests and abstract input.
3. **Entities** hold runtime state and rendering handles for the player, enemies and NPCs.
4. **Presentation** consists of a reusable Phaser world scene that renders the active data-defined map plus a responsive DOM HUD and panels.

Content is not scattered through update loops. Adding another enemy variant, spawn region, item, combat profile or dialogue branch normally requires data plus compatible art rather than another custom scene path.

## Player rendering and animation compatibility

`LayeredCharacter` synchronizes Wings, background weapon/offhand, body, feet, legs, chest, shoulders, hands, head/hair and foreground weapon/offhand layers to one action, facing and frame clock. Direction order is up/left/down/right.

Animation geometry is data-driven. It describes a source texture role, four directional rows, source stride and the **actual frame sequence**. That last field is important: revised one-handed animations are not assumed to consume every source frame from left to right.

v0.1.1.1 supports four geometry families:

- classic 64×64 LPC walk/slash layers;
- revised 64×64 LPC layers with slash, one-handed slash, backslash and halfslash;
- expanded 64×64 offhand sheets;
- special oversized sword geometry, including the legacy DCSS sword and the new 128×128 Arming Sword combat crops.

Individual layer definitions explicitly declare their animation coverage. Legacy/basic armor can declare `attackFallback: 'slash'` so a revised body attack uses a known valid fallback instead of sampling empty/nonexistent rows. Player-ready weapon definitions separately declare their combat profile and compatibility class.

## Combat profiles

`dist/js/data/combat.js` owns weapon attack chains. The player asks the equipped weapon for its combat profile; `Player` handles combo state/timing and passes the current attack descriptor to `CombatSystem`. `CombatSystem` applies the attack's damage/range multipliers to the same untargeted forward melee evaluation used by the original foundation.

The current `sword_four_hit` profile has four actions (slash, one-handed slash, backslash, halfslash) and a continuation window. Waiting beyond that window returns the next attack to hit one. This is intentionally weapon-data-driven so later axes, spears, daggers or two-handed weapons can use different chains without branching the main player update loop.

The older `single_slash` profile remains for future humanoid/NPC loadouts and other limited-animation weapons. Schema-1 saves that still have the legacy starter Rustblade *equipped* are migrated in place to the new player-ready Arming Sword; spare Rustblades remain untouched.

## Combat and simulation

A melee hit evaluates a forward area against every active enemy, so attacks are not coupled to a permanent target. Enemy definitions configure ranges, speed, timings, defense, leash and loot. Runtime states cover idle, patrol, detect, chase, attack, recover, reposition and return.

Enemy reasoning is throttled and distance-activated. Distant actors stop movement and avoid repeated decision work. Enemy actors are allocated once per spawn slot and reused after respawn. Damage numbers, hit sparks and physical loot drops use fixed pools.

Randomized visible enemy weapon loadouts are **not** part of v0.1.1.1. Limited weapons are merely classified/staged so v0.1.2 can assign them to appropriate humanoid families without changing the player-equipment rule.

## Persistent state

All persistent content uses stable IDs. Save schema 2 stores progression, map/entry identity and position, primary stats, unspent points, item instances, equipment slot references, quests, NPC/world flags, settings, unlocked skills, the three equipped skill-slot IDs, and per-skill rank values. Schema-1 saves migrate in place based on the character's existing level.

Equipment has 12 named references: Head, Shoulders, Chest, Legs, Hands, Feet, Weapon, Offhand, Necklace, Ring 1, Ring 2 and Wings. Inventory owns item instances; equipment only references them. The Wings slot exists even while its progression gate is locked.

The validator reconstructs a safe state, clamps numeric values, filters unknown item IDs, rejects wrong-slot/duplicate equipment references and normalizes known quest objectives. Defaults are merged into world flags so old saves automatically gain `wingsUnlocked: false`; schema-1 saves also gain the v0.1.3 skills earned by their existing level. A narrow content migration upgrades only an equipped legacy Rustblade to the current player-ready Arming Sword. JSON parse failure is isolated rather than allowed to stop boot.

## Input and UI

`ActionInput` exposes movement, run, attack and interact actions independently from their source. Keyboard and touch controls feed the same commands. Attack input can remain queued through the current swing, allowing the next combo action to begin after recovery rather than requiring frame-perfect taps.

Menus pause player control but do not own simulation data; they issue commands through the shared event bus. Character Overview reads the same stat breakdown used by gameplay. Inventory and Character read the same explicit 12-slot equipment map, including the locked Wing presentation.

## v0.1.2 actor/loadout foundation

`LayeredCharacter` is now actor-agnostic. It accepts a selectable base visual and an equipment policy. The player uses the full-combat red-haired base and strict player-compatible equipment policy; town NPCs and Skeleton-family enemies use the same renderer with NPC policy so legacy walk/slash-compatible gear can be reused safely.

Skeleton loadouts are defined in `data/enemies.js` as weighted per-slot pools. A loadout is rolled once in `Enemy.respawn()` and remains stable until death/despawn. Named enemies may specify a fixed signature loadout. This is intentionally definition-driven so later humanoid enemies, adventurers and guild members can share the same concept.

NPC definitions now include stable future-facing identity/activity/guild fields without implementing guild logic. Zone records likewise expose level ranges, safety/hostility, biome, event tags and dungeon hooks.

Equipment set definitions live beside items as data-only metadata. `setId`/`gearFamily` can be authored before the bonus evaluator exists, avoiding a later item-schema rewrite.
## v0.1.3 combat architecture

`CombatSystem` is now the scene-level coordinator rather than the place where every ability is hard-coded. It composes focused systems: `SkillController` for unlocks/slots/cooldowns/Essence, `CombatResolver` for shared typed damage math, `StatusController` for timed effects and DOT/control, `ProjectileManager` for a fixed pool of physical world projectiles, `FxManager` for reusable procedural telegraphs/impacts/trails, `AudioManager` for mobile-unlocked/throttled SFX, and `AnimationResolver` for safe action selection across uneven LPC layer coverage.

Player skill content lives in `data/skills.js`; statuses, projectiles and enemy abilities live in their own immutable registries. The initial proof set is Ember Cleave, Ashen Guard and Ruin Pulse plus Toxic Spit, Blueflame Bolt, Bone Arrow, Grave Hex and Earthshatter. v0.1.3.1 adds Bone Lunge as the first reusable `melee_reach` enemy ability and lets layered enemy definitions select a basic melee animation such as thrust instead of assuming every humanoid slashes. Damage carries extensible tags (`physical`, `fire`, `poison`, `holy`, `shadow`) so later transformations, bosses and resistances do not need a parallel damage path.

Projectile actors are pooled and have speed, lifetime, radius, collision, trail/impact and payload definitions. Enemy abilities capture their target position at windup so arrows/spells remain dodgeable instead of homing. Earthshatter uses a visible ground telegraph before its radial hit. Statuses are target-owned timed records; Burn/Poison tick through the same resolver, Slow modifies movement, Guard modifies incoming damage/stagger chance and Stagger temporarily locks actions with an immunity window.

The player and base Skeleton families have compact `spellcast`, `thrust`, `shoot` and `hurt` runtime crops harvested from preserved full LPC sources. v0.1.3.1 additionally harvests a true 8-frame player/starter run cycle and a preserved oversized long-spear thrust overlay for the Bone Spearman. `AnimationResolver` only uses an expanded action when the visual layer really supplies it. During unsupported special actions, old armor holds a safe idle pose and unsupported weapons/shields hide temporarily rather than sampling nonexistent frames or falling back to an unrelated slash. This is the same selective-migration model planned for future legacy gear.

Three compact mobile skill buttons share the same commands as keyboard keys 1/2/3. Normal Attack remains independent and keeps the existing four-hit weapon profile. Save schema 2 persists unlocked skill IDs, slot assignments and per-skill ranks; cooldowns and temporary statuses are deliberately runtime-only.

## v0.1.2.4 map and asset architecture

`data/world.js` now separates **maps** from **zones**. A map owns world dimensions, renderer identity, entry points, zone membership and world-art asset keys. A zone remains gameplay metadata such as name, level band, hostility and biome. This allows several gameplay zones to share one exterior map while caves/interiors/distant regions use separate maps.

`MAP_TRANSITIONS` links a source map/position to a destination `mapId` + stable `entryPointId`. `WorldScene` freezes source-map input, prepares and verifies the destination texture package, then commits the destination identity/entry coordinates, saves, fades out and restarts. Scene initialization resolves the active map from persisted state and explicitly reconstructs the layered player. v0.1.2.4.2 keeps already-loaded textures cached for the current browser session instead of evicting them during the restart; this is a deliberate WebKit reliability hotfix, not a return to global startup preloading. The first implementation connects `map_cinder_region` and `map_ashfall_hollow` in both directions.

Save schema is 2 in v0.1.3. `SaveManager` still accepts schema 1, treats missing/invalid map metadata as the Cinder Region, clamps positions against selected-map bounds, and normalizes skill unlocks/slots from the saved character level. Existing equipment and map state are preserved rather than force-populated.

`systems/AssetResolver.js` converts the active map plus current actor/item definitions into a concrete texture package. It includes map world art, player base/current equipment, local enemy textures and possible layered loadout art, and local NPC visuals. Equipping an item can request its visual dependencies lazily. This keeps the central immutable asset registry while removing the assumption that every registered texture must be resident on every map.

Development/source artwork is no longer stored under served `dist/assets/source-exports`. It is preserved under top-level `source-assets/`; only curated runtime assets and distribution license records belong under `dist/assets`.

The enemy renderer also now accepts definition-specific directional row maps for non-LPC sheets. This fixes assets such as the supplied Goblin without contaminating AI direction logic. Optional non-layered death metadata (`deathTexture`, frame geometry/timing and row mapping) allows an enemy to enter a short `dying` presentation state before becoming inactive; Ashstone Golem is the first live use.

## v0.1.3.1 Skill-rank extension

Schema 2 now normalizes `skills.ranks` alongside unlocks/slots. Missing rank values become Rank 1; values are clamped to each skill definition's `maxRank`. `resolvedSkillDef()` applies data-driven per-rank growth without requiring a new save schema. The spending/augmentation UI is intentionally separate future work.

True run uses `LayeredCharacter.supportsAction('run')` as an all-visible-body-layer compatibility gate. Weapons/shields can use a safe held/walk fallback; incompatible body/armor prevents true run and keeps accelerated walk.