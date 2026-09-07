# Architecture Summary

## Boundaries

Ashfall is a static Phaser application with four deliberate layers:

1. **Content data** defines stable item, enemy, NPC, quest, spawn and zone IDs.
2. **Systems** interpret that data for combat, stats, inventory, dialogue, quests and abstract input.
3. **Entities** hold runtime state and rendering handles for the player, enemies and NPCs.
4. **Presentation** consists of one Phaser world scene plus a responsive DOM HUD and panels.

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

All persistent content uses stable IDs. Save schema 1 stores progression, position, primary stats, unspent points, item instances, equipment slot references, quests, NPC/world flags and settings.

Equipment has 12 named references: Head, Shoulders, Chest, Legs, Hands, Feet, Weapon, Offhand, Necklace, Ring 1, Ring 2 and Wings. Inventory owns item instances; equipment only references them. The Wings slot exists even while its progression gate is locked.

The validator reconstructs a safe state, clamps numeric values, filters unknown item IDs, rejects wrong-slot/duplicate equipment references and normalizes known quest objectives. Defaults are merged into world flags so old schema-1 saves automatically gain `wingsUnlocked: false`. A narrow content migration upgrades only an equipped legacy Rustblade to the current player-ready Arming Sword. JSON parse failure is isolated rather than allowed to stop boot.

## Input and UI

`ActionInput` exposes movement, run, attack and interact actions independently from their source. Keyboard and touch controls feed the same commands. Attack input can remain queued through the current swing, allowing the next combo action to begin after recovery rather than requiring frame-perfect taps.

Menus pause player control but do not own simulation data; they issue commands through the shared event bus. Character Overview reads the same stat breakdown used by gameplay. Inventory and Character read the same explicit 12-slot equipment map, including the locked Wing presentation.

## v0.1.2 actor/loadout foundation

`LayeredCharacter` is now actor-agnostic. It accepts a selectable base visual and an equipment policy. The player uses the full-combat red-haired base and strict player-compatible equipment policy; town NPCs and Skeleton-family enemies use the same renderer with NPC policy so legacy walk/slash-compatible gear can be reused safely.

Skeleton loadouts are defined in `data/enemies.js` as weighted per-slot pools. A loadout is rolled once in `Enemy.respawn()` and remains stable until death/despawn. Named enemies may specify a fixed signature loadout. This is intentionally definition-driven so later humanoid enemies, adventurers and guild members can share the same concept.

NPC definitions now include stable future-facing identity/activity/guild fields without implementing guild logic. Zone records likewise expose level ranges, safety/hostility, biome, event tags and dungeon hooks.

Equipment set definitions live beside items as data-only metadata. `setId`/`gearFamily` can be authored before the bonus evaluator exists, avoiding a later item-schema rewrite.
