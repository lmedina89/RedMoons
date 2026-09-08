# Architecture — v0.1.4.2



## v0.1.4.2 encounter-ecology boundary

`data/encounters.js` is now active runtime content rather than planning vocabulary. `MONSTER_FAMILY_DEFS` describes family identity/roles, `ENCOUNTER_GROUP_ARCHETYPES` defines reusable behavior categories, and `ENCOUNTER_DEFS` owns local group metadata such as area, alert radius, activation range and optional ambush semantics. `data/world.js` spawn rows reference those IDs and own physical spawn rectangles plus optional patrol paths.

`Enemy` remains the individual actor controller. Each instance receives encounter identity, archetype, activation/ambush ranges and patrol state from its spawn. It can sleep when distant, wake from an ambush, follow authored waypoints, or accept forced group aggro. It does not know global encounter membership; `WorldScene.alertEncounterGroup()` performs the radius-bounded lookup among live members that share an `encounterId`. This keeps group behavior reusable without a heavyweight encounter-director object or navmesh.

Layered hostile humans reuse the existing `LayeredCharacter` + `createActorEquipmentState()` pipeline with `equipmentPolicy: 'npc'`. Each enemy definition owns weighted item pools by slot; a loadout is rolled at spawn/respawn and then rendered through the same verified NPC-compatible layers used elsewhere. Faction identity is therefore expressed by data pools rather than bespoke actor classes.

Compact non-layered characters such as Ashblade Stalker and Ashwing Legion Scout use explicit runtime walk/slash crops harvested from preserved 832×3456 source concepts. Their source sheets remain outside `dist/`; map asset resolution only loads the compact crops for maps that actually spawn them.

`CombatSystem` continues to own damage resolution. Its only ecology responsibility is to tell an ordinary enemy to alert its local encounter when player/celestial damage establishes hostility. Azrael code is not coupled to encounter definitions.

## v0.1.4.1 map split, regional scale and asset-palette boundary

The former `map_cinder_region` monolith has been retired from live content. `map_cinder_refuge` is a dedicated 2048×1536 safe settlement; `map_cinder_wilds` is a 6400×2048 exterior containing the Causeway through Bone Road; `map_ashfall_hollow` remains a separate compact cavern. Map definitions own dimensions, renderer IDs, entries, zone IDs and asset packages. `WorldScene` dispatches renderers by map metadata rather than by hard-coded player coordinate bands.

Refuge ↔ Wilds and Wilds ↔ Hollow use the existing prepare-before-commit `MapTransitionSystem` lifecycle. `SaveManager` keeps schema 2 but contains an explicit one-time compatibility translation for historical `map_cinder_region` positions. The translation maps old town/wilderness coordinate bands to safe new map/entry locations before normal map validation, so an older save cannot be stranded on a deleted live map ID.

`AREA_DEFS` remain local rectangular identity records layered under broad `ZONES`. The Wilds deliberately allocate roughly 1200–1600 pixels of horizontal territory to major areas rather than placing several labels/landmarks within one camera view. Formal identity is shown by the HUD; terrain, prop composition and sightline screens communicate the geography in-world.

`WORLD_ASSET_PACKAGES` are intentionally map-scoped but theme-flexible. The Wilds package can draw from terrain, adobe, castle, dungeon, cave, rock and vegetation families when they improve composition. Refuge additionally loads seven compact workshop-derived prop crops rather than their multi-megapixel authoring sheets. This allows cross-theme reuse without turning “use every asset” into “preload every source sheet.”

Static collision remains authored from visible geometry and filtered by `mapId`. Refuge perimeter/buildings, Fallen Watch ruins and selected Wilds structures share the v0.1.4.0 actor-blocking contract. Decorative clutter is still nonblocking unless a visible footprint has an explicit collider. Enemy/player physical separation remains disabled.

Azrael's only required mechanical data change in this release is his home coordinate/map ID, because First-Light Scar moved onto `map_cinder_wilds`. His controller, seven abilities, CombatSystem hooks, FxManager/AudioManager behavior and Sanctuary smoke contract are unchanged.


## v0.1.4.0 world traversal and area boundary

`data/world.js` remains the source of truth for visible static geometry, but colliders now also declare which actor classes they block. All current visible walls and building footprints block both `player` and `enemy`. `WorldScene` installs separate filtered Arcade colliders for the player and enemy group; it still does **not** install enemy/player physical separation. This preserves the mobile movement hardening from v0.1.1.4 while making world solids authoritative for ordinary ground monsters.

`systems/WorldNavigation.js` is intentionally small and pure. It owns collision-kind checks, future phase-traversal opt-out, rectangle-area resolution, 90-degree detour vector generation and cheap segment-vs-solid line checks used to prevent basic melee through walls. `Enemy` owns only per-instance obstruction state. Repeated collision asks an enemy to wall-follow temporarily; a sufficiently long blocked chase enters an `obstructed` cooldown and disengages. This is a low-cost steering layer, not a navmesh. A* or a flow-field should only be introduced if later dungeon geometry proves this insufficient.

`AREA_DEFS` partitions each active map into non-overlapping local areas while `ZONES` remain the broader safety/biome/NPC boundaries. The HUD consumes the new `area` event; NPC loading and broad map logic continue to use zone IDs. Each area can stage encounter-family weights and group archetypes without forcing the current spawner to change in the same release.

`data/encounters.js` defines family and group vocabulary only. v0.1.4.0 deliberately keeps the proven `SPAWN_REGIONS` runtime; each spawn now has an `areaId` so a later encounter-director migration can be incremental instead of destructive.


## v0.1.3.2.4 celestial special-actor boundary

`data/factions.js` is now the shared relationship contract for actors. The player and celestial faction are friendly; monsters are hostile to both. `Enemy` receives a candidate target set and selects only faction-hostile live actors, while `CombatResolver.damageTarget()` routes resolved damage to player, ordinary enemy, or friendly/special actor paths. This keeps ArchAngel Azrael inside the real combat model instead of giving him a bespoke immunity exception.

`entities/Azrael.js` is intentionally a unique controller rather than a generic NPC subclass. His world physics proxy remains compact and world-bounded while the visible sprite hovers above it. The controller uses the supplied run action as glide locomotion, jump as wing-burst startup, combat-idle/idle for hovering, shoot for Judgment Blast, spellcast/emote for Sanctified Nova / Seraphic Judgment / Heavenfall, and rotates multiple melee blocks for Celestial Strike. His current Scorched Outskirts home point is a temporary field-test harness, not canonical story placement.

The expanded major-skill set uses a shared runtime `majorAbilityLockUntil` gate. Per-ability cooldowns still own individual availability, while the shared lock prevents consecutive large invocations from obscuring combat readability. `CombatSystem.allyRadial()` accepts bounded damage/knockback scaling so Seraphic Judgment can resolve three timed pulses without tripling the configured cast budget. `FxManager` builds Nova/Judgment seals and beams from short-lived procedural Graphics plus the existing pooled spark sprites.

`CombatSystem` owns reusable ally ability resolution, celestial AoE/cone damage, radial knockback and distance-gated camera shake. `ProjectileManager` remains pooled and now accepts a friendly-target provider so enemy projectiles can collide with either the player or Azrael. Celestial projectiles are still resolved against enemies only.

Enemy reward contribution is tracked separately from damage resolution. Player damage records recent material contribution; celestial damage does not. `WorldScene.onEnemyDied()` gates quest credit, XP, ash and loot behind that contribution check, so an autonomous high-level ally cannot become an AFK farming engine.

Azrael's visible `Lv. ???` is presentation only. His internal level and extreme stats are data values in `specialActors.js`; incoming attacks still pass through defense/resistance/status rules and reduce real HP.


> v0.1.3.2.4 keeps save schema 2 while adding non-persistent faction-aware friendly combat and the temporary ArchAngel Azrael field-test actor. Azrael is map-scoped runtime simulation state; he is intentionally not serialized. His compact action crops load only with the Cinder Region. `Assassin.png` remains source-only.

## v0.1.3.2.2 faction-aware mythic actor foundation

`data/factions.js` owns symmetric relationship rules instead of embedding actor-name checks in combat. `Enemy` chooses the nearest live hostile from the current friendly-combatant set, while Azrael queries only faction-hostile enemies. `CombatResolver.damageTarget()` routes shared damage to Player, friendly actors or enemies, and projectile/status source teams preserve attribution through delayed effects. This lets later guards, companions and faction encounters reuse the same contract.

`Azrael` deliberately separates a compact invisible Arcade body from the 64×64 visual sprite. The body remains 2D and world-bounded; the visible sprite receives a small hover offset and uses the Expanded-LPC run action as glide. This sells wing-assisted flight without introducing aerial pathfinding. The field-test actor is not saved and respawns at his temporary vigil if genuinely defeated.

Azrael's AI is throttled, home/leash constrained and cluster-aware. It selects between a short celestial cone, wing-burst engage, pooled ranged projectile and group-biased radial Heavenfall. `CombatSystem` exposes generic ally cone/radial/projectile hooks rather than putting damage calculations inside the actor. Camera shake uses player-distance falloff. FX are short-lived procedural graphics plus the existing pooled sprite bursts.

Reward attribution is recorded before synchronous enemy death callbacks. `Enemy.playerRewardEligible()` requires recent player contribution; therefore an Azrael solo kill exits before quest/XP/currency/loot handling. This prevents the temporary friendly NPC from becoming an AFK progression source while preserving shared-fight rewards.

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

## Sanctuary healing boundary

`AZRAEL_DEF` owns sanctuary tuning, `Azrael` owns cast eligibility through a missing-health score, `CombatSystem` owns positional/faction healing and max-HP clamping, and `FxManager` owns presentation. The player and any future `celestial` actors returned by `WorldScene.friendlyCombatants()` are supported without save changes or a special angel-only registry.
## v0.1.4.2.1 building-geometry contract

Refuge buildings now expose explicit display dimensions in `BUILDING_DEFS`. `buildingVisualBounds()` and `buildingCollider()` derive static actor solids from those same values, while `WorldScene` renders with `setDisplaySize()`. Future building art swaps should update the display dimensions rather than authoring an independent collider Y offset.

## v0.1.4.2.2 demon ability-family contract

Ordinary Demon Legion actors now share one data-driven combat path rather than bespoke controller classes. Enemy definitions select ability IDs; `ENEMY_ABILITIES` supplies common shapes (`melee_reach`, `projectile`, `radial`, `dash_strike`), damage/VFX kinds, timing and optional status/knockback payloads. `CombatSystem` resolves those shapes through the same enemy windup/trigger pipeline, while `FxManager` supplies pooled procedural family presentation. This keeps color variants cheap to extend and prevents common units from duplicating Azrael-style special-actor logic.

`dash_strike` is world-line-of-sight gated before selection and again before movement. Its travel distance is bounded so the attacker stops near the target rather than teleporting through it. Projectile-family attacks use `ProjectileManager` and retain explicit `wallCollision: true` definitions.

Elite humanoid/creature variation can now use `loadoutPresets`: weighted complete loadout records are rolled once per spawn before ordinary per-slot equipment pools. Fleshborn is the first use and deliberately chooses coherent full armor sets. `AssetResolver` expands every possible preset dependency into the active map texture package before scene commit, so a later random roll cannot request an unloaded layer.

This is intended to become the shared faction pattern: common demons inherit infernal family abilities, common angels later inherit a Celestial Ability Family, elites add a small number of stronger/unique actions, and named mythical beings remain bespoke special actors.


## v0.1.4.2.3 celestial ability-family and faction-targeting contract

Common celestials intentionally reuse the ordinary `Enemy` runtime so faction armies can scale without a bespoke controller class per soldier. `Enemy.faction` and the shared relation table determine legal targets; `WorldScene.combatants()` exposes nearby player/generic actors/Azrael to the combat layer. `CombatSystem.hostileTargetsFor(actor)` and `friendlyTargetsFor(actor)` then gate melee, AoE, support and projectile behavior.

`ProjectileManager` no longer assumes that `team === enemy` means "hit the player" and every other projectile means "hit all enemies." Projectiles carry their actual `sourceActor`, and the provided hostile-target function resolves legal victims from faction relations. This is required for autonomous angel↔demon battles and is the foundation for the future portal warfront.

`BaseAngel` is a baked body+white-wing source that accepts existing compatible LPC equipment. Common Sentinels roll from weighted **complete curated presets** so their armor reads coherently. `HeavenlyKnight` is a fixed baked heavy common-angel visual and is not passed through random equipment. Named mythical sheets remain fixed-gear source-only characters and should eventually use bespoke special-actor controllers/kits rather than common-family randomization.

Common celestial ability shapes remain deliberately generic/data-driven: `melee_reach` (Radiant Strike), `projectile` (Lumen Bolt), `radial_aoe` (Judgment Pulse), and `friendly_heal` (Grace of Light). Named mythical beings and Azrael remain outside this ordinary family ceiling.


## v0.1.4.2.4.1 faction-warfare hardening contract

- Production spawn data remains in `SPAWN_REGIONS`; stress-only reinforcements live in `DEBUG_SPAWN_REGIONS` and are instantiated only under `?debug=1`.
- Encounter-wide alerting remains the first layer. Selected First-Light encounters may also expose `assistRadius`/`assistCap` for bounded same-faction help across neighboring encounter groups.
- Generic actors only acquire hostile targets whose position remains inside the actor's home-centered pursuit territory (`leashRange + pursuitMargin`).
- A committed basic attack retains its chosen live target through the windup. Melee/dash abilities cancel if their required target disappears; projectile/radial casts may complete against their already-telegraphed location.
- Lost targets transition actors back toward their local home/formation instead of leaving stale chase states.

## v0.1.4.3 exploration / portal contract

`TravelSystem` owns a small persisted return stack independent of individual maps. Enterable transitions may set `captureReturn`; the source anchor is pushed only through `transitionToMap(...beforeCommit)` after the destination asset package has loaded successfully. `returnToOrigin` transitions pop only on a successful return commit and expose authored fallback destinations for debug/direct-entry safety. Save schema remains 2; validation clamps coordinates, discards unknown maps and bounds stack depth.

`data/exploration.js` owns POI and lightweight world-event records. `WorldScene` renders/interacts with map-local POIs while persistent cache/lore state lives under `worldFlags.poiStates`. `WorldEventSystem` polls at a bounded interval and delegates event effects back to `WorldScene`, so map art does not hard-code encounter logic. The first event kinds only alert an authored encounter toward the player or initiate a local hostile-faction clash.

The four proof maps deliberately reuse existing curated runtime art through `MAP_DEFS.worldAssetKeys`; no large source atlas is loaded directly. The future Angel–Demon Warfront remains a separate map milestone and should begin with the requested full core/expanded asset audit rather than growing Veil Threshold into the warfront in place.


## v0.1.4.4.0.1 Warfront geography / atmosphere contract

The dedicated `map_veil_warfront` is a streamed 6144×3072 map, not an extension of Cinder Wilds. `dist/js/data/warfront.js` owns realm-specific landmarks, route bands, cliff ribbons, waterways, bridge positions, ruined structures, visible-source colliders, ambient emitter metadata and the Warfront asset key package. `world.js` registers only the map/zone/area/travel integration; `WorldScene` consumes the Warfront data through a dedicated renderer.

The Threshold → Warfront transition uses the same bounded return-anchor stack as interiors. This proves nested travel without adding a second travel system. Warfront actor population is deliberately zero in 0.1.4.4.0.1; later army passes must reuse map-scoped spawning/activation rather than loading an always-live battlefield. Persistent ambience is capped and world-space; full-screen custom shaders remain out of the baseline mobile contract.
