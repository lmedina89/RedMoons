# Architecture Summary

## Boundaries

Ashfall is a static Phaser application with four deliberate layers:

1. **Content data** defines stable item, enemy, NPC, quest, spawn and zone IDs.
2. **Systems** interpret that data for combat, stats, inventory, dialogue, quests and abstract input.
3. **Entities** hold runtime state and rendering handles for the player, enemies and NPCs.
4. **Presentation** consists of one Phaser world scene plus a responsive DOM HUD and panels.

Content is not scattered through update loops. Adding another enemy variant, spawn region, item or dialogue branch normally requires a data entry and compatible art rather than another custom scene path.

## Player rendering

`LayeredCharacter` keeps body, feet, legs, chest, hands, head/hair, background weapon/offhand and foreground weapon/offhand layers synchronized to one action, facing and frame clock. Classic 64×64 per-animation sheets, expanded 64×64 sheets and DCSS oversized swords have separate geometry metadata. The DCSS long sword retains its original 128×128 runtime cells; its three source directions use rows 6–8 for idle/walk and 9–11 for slash, with the side row mirrored for the fourth facing direction. No source sheet is cropped, resized or overwritten.

## Combat and simulation

The basic swing evaluates a forward area against every active enemy, so attacks are not coupled to a permanent target. This leaves a direct path to cone, radius and chained AoE attacks. Enemy definitions configure ranges, speed, timings, defense, leash and loot. Runtime states cover idle, patrol, detect, chase, attack, recover, reposition and return.

Enemy reasoning is throttled and distance-activated. Distant actors stop movement and avoid repeated decision work. The tile world and data-defined zones are compatible with later chunk activation, even though v0.1.1 is small enough to keep its complete base tile layer resident.

Enemy actors are allocated once per spawn slot and reused after respawn. Damage numbers, hit sparks and physical loot drops use fixed pools. No projectiles ship in v0.1.1; the same fixed-pool pattern is intended when projectile skills are introduced.

## Persistent state

All persistent content uses stable IDs. Save schema 1 stores progression, position, primary stats, unspent points, item instances, equipment slot references, quests, NPC/world flags and settings. Item rarity and enhancement are separate fields; enhancement remains fixed at +0 because enhancement gameplay is outside this release.

The validator reconstructs a safe state, clamps numeric values, filters unknown item IDs, repairs missing equipment references and normalizes known quest objectives. JSON parse failure is isolated rather than allowed to stop boot.

## Input and UI

`ActionInput` exposes movement, run, attack and interact actions independently from their source. Keyboard and the touch joystick feed the same commands. Controller bindings can be added without changing player or combat logic. Menus pause player control but do not own simulation data; they issue commands through the shared event bus. Character Overview reads a stat breakdown produced by the stats system, while Character Growth previews the same formulas before committing points. Inventory and Character both read the same explicit equipment-slot map, so UI presentation cannot create a second competing equipment state.


## Character and equipment presentation

Persistent equipment remains normalized as one instance ID per named slot. Inventory owns items; equipment only references those instances. The Character UI reads the same state and `StatsSystem` breakdown used by combat, so base primary stats, direct gear bonuses, derived totals and total gear impact cannot drift into a separate display-only ruleset. v0.1.1 keeps one main weapon slot and one offhand slot while preserving armor and accessory slots for future content.
