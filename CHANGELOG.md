# Changelog

## v0.1.1.3 — Mobile Control & Loot UX Hotfix

- Removed camera catch-up lerp so travelling east no longer makes the player appear to slide back left as the camera recenters.
- Hardened the virtual joystick around a single active pointer, finite/clamped vectors, an 8% deadzone, and forced neutral resets on pointer cancel/loss, blur, page hide, visibility loss and orientation change.
- Movement resets immediately when a blocking menu, dialogue, death screen or equivalent UI transition takes control.
- Replaced the three-message toast stack with one compact priority-aware notification. Duplicate low-value feedback is deduplicated/rate-limited instead of covering the combat field.
- Rate-limited the repeated “Your blade cuts only ash.” attack-miss notice at the combat-system source.
- Added a reusable player-loot eligibility rule: quest items remain valid, but NPC-only/legacy equipment that cannot use the player moveset is blocked from normal enemy drops.
- Cleaned Cinder Imp, Ash Skeleton and Captain Ossivar loot tables so normal equipment drops are player-compatible.
- Replaced incompatible equipment quest rewards with current player-compatible revised gear.
- Preserved legacy gear definitions/assets and existing save inventory for future humanoid enemy loadouts; save schema remains version 1.

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
