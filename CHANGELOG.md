# Changelog

## v0.1.3.2.1.1 — HUD Position & Hearth Visibility Hotfix

- Shifted the right-side combat HUD toward the iPhone safe-right edge while preserving the existing Attack anchor and touch-target sizes.
- Re-anchored `Use` closer to Attack, moved HP/ES recovery controls up/right, and tightened Skill II/III around Attack's upper arc to reclaim the center playfield.
- Increased Ashen Rest Hearth interaction radius slightly and replaced its subtle marker with a pulsing `HEAL` marker plus explicit `FULL HEAL • HP + ESSENCE` world label.
- The hearth remains directly south of the Ashen Rest inn in Cinder Refuge and still fully restores HP/Essence, clears statuses and resets recovery cooldowns.
- Save schema remains 2; no combat/recovery tuning from v0.1.3.2.1 was changed.

## v0.1.3.2.1 — Combat UX & Feel Hotfix

- Rebuilt the iPhone combat HUD around a fixed Attack anchor with three radial/fan skill positions; `Use` and recovery controls no longer participate in a horizontal flex row and therefore cannot be pushed out by unlocked skills.
- Added recognizable inline flask glyphs, persistent HP/ES counts, explicit empty state and disabled cooldown state to the recovery quick buttons while retaining the existing shared RecoverySystem and keyboard 4/5 inputs.
- Added contextual `Use` presentation driven by the exact interaction priority used by gameplay: Travel → Rest → Talk → Loot; the button dims when nothing is in range.
- Corrected basic sword attack geometry to use data-driven 96°–120° combo arcs rather than the previous almost-half-circle hit test.
- Retuned Rank-1 Ember Cleave to 148px / 148°, 1.50× attack damage and 145 knockback so it is decisively wider/longer/heavier than ordinary attacks.
- Cleave FX now derives from resolved skill range/arc, adds lightweight edge bursts and restrained hit-confirm screen shake.
- Added `Combat Ranges` diagnostics: cyan = current/basic melee cone; orange = resolved Ember Cleave cone.
- Staged `HoodedAzrael.png` and `Assassin.png` under source-only character concepts, verified as 832×3456 RGBA Expanded-LPC sheets, documented their canonical 54-row action map and reserved ArchAngel Azrael's unique mythic role for the next field-test build.
- Save schema remains 2; no save identities, map IDs, quests, inventories or existing recovery data are reset.

## v0.1.3.2 — Recovery & Consumables

- Added reusable `RecoverySystem` and data-driven consumable definitions without changing save schema 2.
- Added stackable Minor Ashblood Flasks (+35 HP), Minor Essence Flasks (+28 Essence) and Cinder Rations (+28 HP over 7s outside combat), all with persistent quantities and safe normalization for older saves.
- HP/Essence flasks share a 4-second recovery cooldown; mobile quick-use buttons and keyboard 4/5 provide combat access while Inventory retains a normal Use action.
- Added out-of-combat food interruption rules and slow passive HP recovery after 9 seconds of safety; passive recovery never restores Essence and does not run around nearby hostiles.
- Added the Ashen Rest Hearth recovery point in Cinder Refuge for full HP/Essence restoration, status cleansing and recovery-cooldown reset.
- Added Ilyan's Field Supplies merchant panel with deterministic basic recovery stock so unlucky drops cannot strand progression.
- Added low recovery-item drop chances to normal enemy defeats using the existing pooled world-loot path.
- New characters start with 3 health flasks, 2 Essence flasks and 2 rations in three stacks rather than seven inventory slots.
- Hardened stack operations so a full 30-slot pack can still fill an existing partial stack, while additions requiring a new slot fail atomically without partial mutation.
- Added recovery/status HUD feedback, procedural recovery FX/SFX and a `Recovery Test Kit` diagnostic helper.
- Preserved v0.1.3.1 combat tuning, true run, Bone Spearman, map transitions, all source art, skill-rank hooks and save schema 2.

## v0.1.3.1 — Combat Polish & Skill Feel

- Built directly on the physical-iPhone-validated v0.1.3 Combat Systems Foundation.
- Increased Ember Cleave range to 132 px and arc width to 126° for more reliable landscape-touch targeting; Rank-1 damage remains controlled.
- Increased Ruin Pulse Rank-1 damage/knockback and upgraded it with layered rings, impact bursts and stronger hit-confirming screen shake without turning it into a screen-wide AOE.
- Added persistent Rank 1–5 metadata/growth hooks for all three current player skills while keeping save schema 2; existing v0.1.3 saves without `skills.ranks` normalize to Rank 1.
- Added Rank badges, clearer cooldown visualization and compact active-status chips to the combat HUD; Character → Growth now displays stored skill ranks and reserved Skill Points without exposing the later spending UI.
- Added true 8-frame run crops for the red-haired player, starter chest/trousers/wraps/boots, plus a compatibility gate: true run is used only when visible body/armor layers support it; incompatible equipment safely keeps the old accelerated walk cycle.
- Added Bone Spearman to Bone Road with preserved LPC long-spear art and a telegraphed, direction-locked Bone Lunge reach/thrust ability. Replaced one generic Skeleton spawn so total Cinder actor population remains mobile-conscious.
- Added `Near Spearman` debug travel and validation for true-run cold loading, spear geometry/asset preservation, skill-rank normalization/scaling, status/cooldown HUD, and combat tuning.
- Combat-stance-specific player art remains deferred until a complete compatible stance/equipment set is verified; no unverified source rows are guessed.

## v0.1.3 — Combat Systems Foundation

- Built directly on physical-iPhone-validated v0.1.2.4.3; preserves the recovered map-transition lifecycle and visual/cache fixes.
- Added data-driven skill, status, projectile and enemy-ability registries plus shared SkillController, StatusController, ProjectileManager, CombatResolver, FxManager, AudioManager and AnimationResolver foundations.
- Added three first player skills: Ember Cleave, Ashen Guard and Ruin Pulse, exposed through three compact touch buttons and keyboard keys 1/2/3.
- Added Burn, Poison, Slow, Guard and Stagger status behavior with duration/tick handling, stagger immunity and movement/damage modifiers.
- Added pooled world projectiles and initial Toxic Spit, Blueflame Bolt, Bone Arrow and Grave Hex definitions.
- Added specialized ability hooks for Blight Imp, Blueflame Imp, Skeleton Archer, Skeleton Mage and Ashstone Golem Earthshatter.
- Harvested the preserved LPC Medieval Fantasy bow/arrow source into a verified compact Bone Archer shoot overlay; source pieces remain under `source-assets/combat-v013/classic-bow/`.
- Added compact spellcast/shoot/thrust/hurt LPC action crops and safe animation fallback support; ordinary four-hit sword combat remains intact.
- Added reusable procedural combat FX/telegraph and SFX-manager foundations with mobile-conscious throttling/concurrency behavior.
- Advanced save schema from 1 to 2 solely for persistent skill unlocks/loadout; schema-1 saves migrate in place and retain existing character/equipment/map/quest state.
- Added Combat Test Kit and direct Archer/Mage debug teleports for physical-device validation.
- Transformation gameplay, Demon Castle, guild systems, major map redesign and large skill trees remain intentionally out of scope.

## v0.1.2.4.3 — Transition Lifecycle Recovery

### Physical-iPhone transition repair
- Fixed the post-transition full-simulation freeze found on physical iPhone Safari after v0.1.2.4.2 successfully restored destination rendering and player visuals.
- Root cause: `transitionToMap()` sets `this.transitioning = true` to freeze the source map during fade, while Phaser `Scene.restart()` reuses the same `WorldScene` instance. The stale flag therefore survived into the destination Scene and caused `update()` to return forever.
- `WorldScene.create()` now explicitly resets the transient transition flag before normal destination simulation begins. The source-map fade guard remains unchanged, so committed destination coordinates are still protected.
- Preserved v0.1.2.4.2 session-retained texture caching, deterministic player-layer restoration, combo-safe starter visuals, save schema 1, map IDs/entry IDs and source-art staging.
- Added a validator invariant that requires the transition flag to be reset during `create()` and verifies that the reset occurs before ActionInput binds / destination gameplay begins.


## v0.1.2.4.2 — Player Transition & Starter Visual Recovery

### Physical-iPhone repairs
- Removed eager runtime-texture eviction during live map handoffs. Map packages are still loaded on demand, but once a texture has been loaded it remains cached for the current browser session. This avoids the WebKit/Phaser texture-lifecycle case that could leave only the cyan player physics proxy visible after Cinder ↔ Ashfall Hollow transitions.
- Added an explicit layered-player visual rebuild on every WorldScene create plus a delayed integrity check/recovery pass. If required player textures are unexpectedly missing, the current map package is re-prepared and the visual stack is rebuilt rather than silently leaving an invisible character.
- Kept the v0.1.2.4.1 prepare-before-commit transition invariant: destination assets must still finish loading before map state is changed.

### Combo-safe Level-1 starter presentation
- Kept the same save-compatible starter item IDs and low Level-1 stats, but redirected their visuals away from legacy slash-only layers.
- `Wayfarer Shirt` now uses a revised-combat synchronized dark beginner tunic presentation.
- `Ashcloth Trousers` now uses a new compact revised-combat trouser overlay derived from the exact player pose crops for walk/slash/backslash/halfslash.
- `Hide Handwraps` now uses a compact brown leather-wrap recolor of the verified full-combo glove poses, while `Road Boots` reuse the verified revised leather-boot layer.
- Existing saves that already own/equip these starter item IDs automatically benefit from the corrected visuals without force-equipping anything they had removed.
- Legacy classic clothing assets remain preserved for NPC/future use; they are no longer the default player starter presentation.
- Added a player-only `playerVisual` override path so shared starter item IDs can use revised-combo art on the player while NPC/enemy loadouts keep their original classic geometry.

### Future character-content staging
- Preserved the user's 2026-09-07 full 832×3456 LPC-style character sheets under `source-assets/character-concepts/2026-09-07/`; none are preloaded or shipped under `dist/`.
- `Transformation.png` is the authoritative future player transformation source. No transformation mechanics are enabled in this hotfix.
- Winged skeletal sheets are staged for future Demon Castle mobs/elites/bosses with modular armor/loadouts. Winged humanoid sheets are staged primarily for Heavenly Castle/unique NPC use.
- `TransupOrHolyKnight.png` and `Truetrans.png` are explicitly not treated as the player transformation.

## v0.1.2.4.1 — Map Streaming & Save Menu Hotfix

- Repaired the physical-iPhone Safari blank-world transition found in v0.1.2.4 by explicitly preparing and verifying the destination map's texture package before committing destination state or restarting the Phaser scene.
- Deferred stale source-map texture release until the destination scene has created its sprites, preventing live sprites from losing textures during the handoff.
- Added fail-safe transition behavior: if destination assets cannot be prepared, map state is not committed and the player remains on the current map with an error toast.
- Added a visible map-loading overlay and progress bar during dynamic destination-package preparation.
- Added a startup menu with **Continue**, **New Game**, and **Load Save** while retaining the existing single-slot/save-schema-1 model.
- Added explicit overwrite confirmation before New Game replaces an existing save. Fresh starts use the v0.1.2.4 Level-1 Wayfarer outfit and Ashen Arming Sword.
- Added non-destructive save-slot summary data (level, location, ash and last-save timestamp) and preserved existing schema-1 `savedAt`/`gameVersion` metadata during validation.
- Preserved all v0.1.2.4 map IDs, entry IDs, source artwork, runtime content, equipment choices and save compatibility.
- Added/expanded validation for transition ordering, dynamic destination loading, startup menu structure and save metadata preservation.

## v0.1.2.4 — World Streaming & Asset Hardening

- Added stable, data-driven map definitions, entry points and two-way transition records while keeping save schema 1.
- Preserved the original 2560×1280 Cinder Region as one coherent map and added the first separate map, 1024×768 **Ashfall Hollow**, reached from the Scorched Outskirts.
- Added visible-source cave wall collision and a small local Cave Spider/Mire Spider population for Ashfall Hollow.
- Added map-scoped asset resolution plus lazy item visual loading so future regions and equipment do not require every registered texture to be globally preloaded.
- Added transition-time release of assets that are not required by the destination map package.
- Moved preserved development/source exports and unused workshop source sheets out of shipping `dist/assets` into top-level `source-assets/`; no source artwork was deleted.
- Fixed the iPhone debug tray with safe-area bounds, horizontal touch scrolling and non-wrapping buttons; added direct Refuge/Hollow map helpers.
- Corrected Ash Goblin Raider directional row mapping so the supplied art faces the direction the AI is actually moving.
- Promoted Wayfarer Shirt, Ashcloth Trousers, Hide Handwraps and Road Boots to player-ready Level-1 gear and equipped them on new characters without overriding existing saves.
- Added optional shared enemy death animation support and wired Ashstone Golem to its supplied seven-frame death sheet.
- Hardened scene restarts by removing page lifecycle listeners on shutdown, preventing listener accumulation across repeated map transitions.
- Expanded validation for map packages/transitions, map-aware saves, starter outfit behavior, Goblin facing, Golem death art, source/runtime separation and existing collision/loot/combat invariants.

## v0.1.2.3 — Asset & World Variety Expansion

- Expanded the early enemy ecosystem to 16 definitions without increasing collision complexity or changing save schema 1.
- Harvested the existing LPC Imp archive into red, green and blue Imp families with weighted sword, pitchfork and shield visual/loadout combinations that roll once per spawn.
- Added Ash Goblin Raider, Cave Spider, Ember Spider, Paleweb Spider, Mire Spider and Ashstone Golem definitions using compact runtime PNG crops; Mire Spider remains staged/debug-ready for a later matching zone rather than overcrowding the current map.
- Added four curated Spider palettes from the supplied 11-variant pack and retained the larger source library outside runtime preloads.
- Added two more persistent adventurer NPC seeds (Renn of the Emberbound and recruitable Doran) using the existing layered humanoid/equipment framework.
- Added an `Emberbound` NPC-guild seed as data only; guild mechanics remain intentionally inactive.
- Added Adobe-2 settlement props plus selected evergreen bushes, seasonal bushes and mushroom scenery harvested from the existing 4-season/Core library. Decorative scenery remains non-colliding.
- Harvested Copper, Bronze, Steel, Ceramic and Gilded full-combo Arming Sword palettes from the existing Organized library and added them as player-ready material variants with level-appropriate drops and Skeleton loadout use.
- Added precomposed pine-tree and pine-cluster scenery from the existing 4-season pack; these remain purely decorative and do not expand collision.
- Staged the supplied LPC cave structural sheet and revised blacksmith/tailor/woodshop tiles under `dist/assets/world/` for later mapped interiors/caves, but deliberately excludes them from current preload lists.
- Preserved the v0.1.2.2 collision model unchanged: only visible refuge walls and building footprints create static blockers.
- Staged the supplied Wolf PSD for a later verified export rather than guessing at its irregular source animation layout; no PSD/source-authoring file ships in `dist/assets`.
- Expanded `?debug=1` teleports for the new live enemy families.
- Added validation for new enemy runtime crop dimensions, weighted Imp pools, actual spawn coverage, mobile-conscious population cap, staged-vs-preloaded assets, additional NPC/guild seeds, and accidental PSD shipping.


## v0.1.2.2 — Actor Collision & Reward Recovery Hotfix

- Corrected the player and layered-enemy invisible Arcade proxies: the 2×2 helper texture is no longer display-scaled before body sizing, eliminating the giant dynamic collision rectangles that behaved like invisible force fields around visible buildings.
- Replaced the noisy global Phaser body overlay in `?debug=1` with targeted collision audit rendering: green static blockers, cyan player footprint, faint-magenta enemy footprints.
- Changed the debug helmet grant from the NPC-only Warden Helm to a player-compatible Magic Bronze War Helm and supplies only its minimum test requirements.
- Replaced old NPC-only quest equipment rewards with player-ready rewards (Magic Ashrunner Leather Boots and Noble Iron War Helm).
- Added schema-1 save normalization that upgrades legacy Warden Helm/Cinderhide quest or diagnostic instances to compatible replacements without discarding rarity/modifiers.
- Preserved all v0.1.2.1 toast, visible-wall collision, world/enemy-variety, loadout, inventory recovery and movement hardening work.

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
