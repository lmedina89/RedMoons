# Changelog

## v0.1.2.1 — Collision & Toast Hotfix

- Rebuilt Cinder Refuge perimeter collision from the same `REFUGE_WALLS` data used to draw the visible walls, eliminating art/physics drift.
- Widened the east refuge opening substantially so touch players can leave town without lining up with a narrow hidden gate.
- Removed redundant invisible outer-map blockers and the unrepresented Bone Road blocker; Arcade world bounds now own the true world edge.
- Restricted static collision to visible refuge wall segments and visible building footprints only. Decorative props, roads, rocks and scenery do not create hidden collision.
- Added green collider outlines under `?debug=1` so every static blocker can be visually audited on-device.
- Moved routine/muted/combat notifications out of the center of the playfield to a compact upper-right surface with much lower opacity; quest/level/danger notices retain stronger centered presentation.
- Increased empty-swing feedback cooldown so repeated attack taps do not repeatedly call attention to the same low-value message.
- Preserved save schema 1 and all v0.1.2 content, enemy/NPC loadouts and world data.

## v0.1.2 — Cinder Refuge & World/Enemy Variety Foundation

- Replaced the player base with the supplied red-haired full-combat LPC export while preserving layered equipment and the four-hit sword profile.
- Rebuilt Cinder Refuge as a six-building data-driven settlement using the supplied adobe building art plus castle props, paths and a wider touch-friendly east gate.
- Added level/safety/hostility/biome/event/dungeon-hook metadata to zones for later progression, events and guild systems.
- Added Carrion Beast, Rotwing Ravager, Slate Revenant, Bloodbone Reaver and Gilded Ossuary Guard enemy definitions and spawn regions.
- Converted skeleton-family enemies to layered actors that roll weighted legacy/player-ready equipment once per spawn; Captain Ossivar uses a fixed signature loadout.
- Converted refuge NPC presentation to the same layered-equipment renderer. Sable now uses the supplied olive-skinned humanoid base and carries future recruitable-adventurer/guild-ready metadata.
- Added persistent NPC data hooks (`npcType`, `level`, `combatRole`, `guildId`, `recruitable`, `activityState`, `homeZone`) without activating guild simulation yet.
- Added data-only named equipment-set scaffolding for Gravesworn Legion, Ashrunner Leathers and Steel Bastion; set bonuses remain intentionally inactive until the later loot/progression milestone.
- Preserved strict player-loot eligibility, Drop/Destroy recovery, singleton/rate-limited toasts, immediate camera follow and hardened iOS joystick lifecycle handling.
- Preserved save schema 1.
- User-supplied v0.1.2 art is preserved with known credits where available; remaining attribution is explicitly pending for a future store/commercial release pass.

## v0.1.1.5 — Player Gear Pool Expansion

- Added seven newly verified, full-combo player gear definitions: Bronze War Helm, Ashhide Shoulders, Ashrunner Leather Boots, Silver Legion Cuirass, Steel Bastion Plate, Brass Arming Sword and Iron Arming Sword.
- Added lossless runtime crops for walk, standard slash, revised one-handed/backslash source and halfslash animations; both new arming swords use the same proven 64px walk / 128px combat geometry as the existing Ashen Arming Sword.
- Added the new gear to level-appropriate Cinder Imp, Ash Skeleton and Captain Ossivar loot tables while preserving the runtime block on NPC/legacy-only gear.
- Added future-facing item presentation metadata for rarity-colored borders/world glow and later enhancement glow/trail/aura effects without adding a new FX runtime yet.
- Expanded deterministic validation so every new armor layer and sword palette must contain real pixels across all four current combo actions and facings.
- Added a v0.1.1.5 diagnostic gear helper for rapid physical-device regression testing.
- Preserved save schema 1 and all v0.1.1.4 movement, toast and Drop/Destroy hardening.
- Preserved the newly supplied full PNG exports. Several armor exports remain on attribution hold until their exact generator credit text is supplied; the known Arming Sword family credit remains preserved.

## v0.1.1.4 — Inventory Recovery & Movement Hardening

- Removed dynamic player/enemy body separation so chasing enemies can no longer physically shove the player after movement input stops. Combat contact remains range-driven, which also better supports future large enemy pulls.
- Hardened the mobile joystick lifecycle with capture-phase pointer release handling, touch-end/touch-cancel fallbacks, and stale-pointer takeover on the next joystick touch.
- Added Drop and Destroy controls to every inventory item detail view. Equipped items may be discarded and are safely unequipped first.
- Drop places the same item instance back into the world near the player; Destroy permanently removes it. Both use a two-tap confirmation.
- Quest-critical items show the controls but are protected from drop/destroy so progression cannot be bricked.
- Save schema remains 1.

## v0.1.1.3 — Mobile Input & Loot UX Hotfix

- Removed delayed camera catch-up during gameplay follow so sustained right/left travel no longer makes the player appear to slide backward as the camera recenters.
- Hardened the iPhone virtual joystick around one active pointer with immediate zeroing on release, cancel, lost pointer capture, blur, page hide, visibility loss and orientation changes.
- Moved touch-vector ownership into `ActionInput`, with finite-value validation, normalization and a small deadzone so stale DOM/global values cannot keep the player moving.
- Replaced stacked combat toasts with a single prioritized notification surface.
- Rate-limited repeated low-value combat notices such as `Your blade cuts only ash.` and reduced toast size/placement so combat remains visible.
- Removed NPC/legacy-only gear from normal enemy loot tables.
- Added a runtime loot-eligibility guard: quest items may always drop, while equipment must be player-compatible to enter the player loot stream.
- Preserved legacy items in existing saves and preserved save schema 1.

## v0.1.1.2 — Combat Visual Stability Hotfix

- Enforced full-combo animation compatibility for player equipment; limited/fallback assets remain preserved as NPC/legacy content.
- Existing saves preserve incompatible gear in inventory but remove it from player slots.
- Temporarily disabled classic hair on the revised player until a full revised-combat hair export exists.
- Added measured horizontal root-motion compensation to reduce apparent sideways drift during the four-hit combo.
- Batched rapid-kill XP/coin notifications and capped simultaneous toast messages at three.
- Save schema remains version 1.

## v0.1.1.1 — Equipment & Combat Expansion

- Added a data-driven four-hit sword combo: standard slash → one-handed slash → backslash → halfslash, with per-hit duration, impact timing, damage and range multipliers.
- Added input buffering across the current swing and combo reset timing so repeated taps can continue the chain without frame-perfect input.
- Added the combat-ready Ashen Arming Sword as the new starter weapon using dedicated walk/slash/backslash/halfslash geometry.
- Added a narrow schema-1 migration that upgrades only an *equipped* legacy Rustblade to the Ashen Arming Sword; spare Rustblades remain limited-animation content for future humanoid enemies.
- Added Shoulders and Wings, expanding persistent equipment to 12 named slots.
- Added Iron War Helm, Legion Pauldrons, Legion Cuirass, Legion Gloves, Legion Boots and Crimson Bat Wings definitions plus visible layered rendering.
- Added real Wing stat buffs and a `wingsUnlocked` progression gate; Wings remain locked in normal gameplay until the later advanced-progression milestone is authored.
- Added per-layer animation compatibility metadata and proportional standard-slash fallback playback for armor without newer one-handed rows.
- Added revised-combat gear to Ash Skeleton/Captain Ossivar loot tables for normal acquisition/testing.
- Processed the supplied Katana into explicit 128×128 walk/slash runtime textures and classified it as staged humanoid/NPC-only weapon content for v0.1.2 enemy loadouts.
- Preserved full supplied generator exports and supplied credits alongside compact runtime crops so mobile gameplay does not preload giant source sheets.
- Expanded structural tests to validate four-hit frame sequences, real PNG alpha content, Wing gating/stat math, 12-slot save normalization, legacy weapon migration and NPC-weapon rejection.
- Preserved save schema 1.

## v0.1.1 — Character & Combat Foundation

- Corrected the DCSS long-sword geometry instead of treating its oversized source sheet as a standard Expanded LPC sheet.
- Added data-driven animation geometry with explicit idle, walk and slash mappings, including right-facing sword mirroring.
- Fixed the sword using attack-like source rows while walking and fixed slash rendering against the actual populated sword rows.
- Made idle a distinct player animation state and sample movement facing before an attack begins, so direction + attack uses the intended facing.
- Added automated alpha validation for layered walk/slash frames so empty animation-row mappings fail project checks.
- Hardened equipment state so one item instance cannot occupy multiple slots and save validation rejects items referenced from the wrong slot.
- Confirmed simultaneous equipment stacking across head, chest, hands, legs, feet, weapon, offhand, necklace and two ring slots; the starter loadout wears four armor pieces plus one weapon at once.
- Added a full Character menu with Overview and Growth tabs.
- Added an equipped-gear sheet, base + gear + total primary stats, total combat stats, gear-impact values, direct equipment buffs, XP/currency/stat-point summary and an Active Effects section.
- Added a visible equipped-slot strip to Inventory so multiple worn armor pieces are obvious while managing the pack.
- Improved item comparisons to report all changed listed bonuses rather than only attack and defense.
- Preserved save schema 1 for backwards compatibility with v0.1.0 browser saves.

## v0.1.0 — Ashfall Foundation

- Added a continuous Cinder Refuge, Scorched Outskirts and Bone Road-edge world on a 32×32 LPC terrain base.
- Added a synchronized modular LPC player with body, head/hair, chest, legs, hands, feet, oversized weapon and offhand rendering.
- Added responsive iPhone-landscape HUD, safe-area support, touch joystick, attack and interact controls, plus keyboard input.
- Added real-time multi-target melee combat, damage, defense, hit reaction, stagger/knockback, death and refuge respawn.
- Added pooled enemies, damage numbers, hit sparks and physical loot drops.
- Added Cinder Imp, Ash Skeleton and named Captain Ossivar definitions with reusable AI states, leash and respawn behavior.
- Added levels 1–10, XP thresholds, +5 stat points and +1 reserved skill point per level.
- Added STR/DEX/VIT/SPR formulas and two-step stat allocation confirmation.
- Added 14 item definitions, level/stat requirements, randomized rarity modifiers and separate enhancement state.
- Added 30-slot inventory, tooltips, rarity styling, equipment comparisons, equip/unequip and visible gear updates.
- Added four moving NPCs and deterministic condition-based dialogue using level, rarity, inventory tags, quest state, flags and prior conversations.
- Added three data-driven quests: imp cull, Living Ember Heart recovery and Captain Ossivar defeat.
- Added save schema 1 with validation, normalization, corrupt-save isolation and automatic/manual checkpoints.
- Added architecture notes, licensing records, performance notes, limitations and structural validation.
