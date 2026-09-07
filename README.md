# Hell RPG v0.1.4.2 — Living Wilds: Monster Families & Encounter Ecology

Built directly from the physically approved **v0.1.4.1 Cinder Region Expansion & Refuge Rebuild**. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`.

## v0.1.4.2 Living Wilds: Monster Families & Encounter Ecology

This release turns the v0.1.4.1 geography into a **data-driven encounter ecology** without increasing the established Cinder Wilds live-actor ceiling. The Wilds remain capped at **35 ordinary enemy actor slots**; richness comes from family composition, group behavior, authored patrols, proximity ambushes, hostile humanoid loadouts and offscreen sleeping rather than brute-force population growth.

- Every live spawn now references an `encounterId`, archetype and activation range. The active vocabulary covers **roam, pack, patrol, guard, ritual and ambush** encounters across ten family definitions.
- Related members can **alert as a local group** when one is engaged. Group alert is radius-bounded so fighting one pack does not chain-pull an entire biome.
- Patrol encounters can follow authored waypoint loops. Ambush encounters remain dormant and faint until the player crosses their local trigger radius, then wake and alert the appropriate nearby group.
- **Ash Scavengers** and **Ironbound Raiders** are new layered hostile-human families assembled from the existing LPC humanoid/equipment library. Scavengers use a rough, mismatched equipment pool; Ironbound Raiders use a deliberately narrower armored palette. Equipment is rolled once per spawn and persists until that actor respawns.
- A rare **Ashblade Stalker** uses compact walk/slash crops harvested from the preserved `Assassin.png` source concept. A small **Ashwing Legion Scout** patrol uses compact crops from the preserved `DemonBase.png` concept, giving First-Light Scar an active Demon Legion recon presence without changing Azrael's AI or seven-skill kit.
- Area populations now communicate habitat: Causeway toll gangs, Emberfields raiders/imp packs, Cinderwood web/stalker ambushes, Fallen Watch deadguard/salvage crews, Ashgrave ritual groups, Bone Road mixed military patrols and Hollow spider nests/ambushes.
- Distant ordinary enemies enter a lightweight **sleep state** outside their spawn-defined activation range. Layered actors do not keep re-rendering every animation step while sleeping, protecting the larger-map iPhone budget.
- Existing wall collision, melee line-of-sight blocking, player/enemy no-shove behavior, map dimensions/transitions, Refuge rebuild and save schema are preserved.
- Azrael remains mechanically frozen. His controller, ability data, VFX/audio and Sanctuary/Azrael smoke contracts are unchanged from v0.1.4.1. `CombatSystem` only gained encounter-alert routing so a monster struck by the player or a celestial can wake its own local group.

See `docs/WORLD_FOUNDATION.md` for the v0.1.4.2 physical iPhone encounter/ecology test route.


## v0.1.4.1 Cinder Region Expansion & Refuge Rebuild

This is the first deliberate **world-quality and scale pass** after the collision/navigation foundation held up in field testing. It does not increase live monster counts or rewrite Azrael. Instead it gives the Cinder Region room to breathe, turns Refuge into a dedicated settlement map, and uses a much broader cross-section of the existing asset library to create stronger landmarks, sightline breaks and environmental storytelling.

- **Cinder Refuge is now its own 2048×1536 map** rather than sharing one compressed canvas with the wilderness. It has a thicker old-stone perimeter, a broad east gate, gate towers, branching streets, a central gathering space, nine building footprints, service districts and considerably more lived-in clutter.
- The exterior is now **Cinder Wilds, 6400×2048**, with Ashen Causeway, Emberfields, Cinderwood, First-Light Scar, Fallen Watch, Ashgrave Hollow and Bone Road spread across substantially larger territories. Major locations are separated by travel/transition space instead of being visible almost on top of one another.
- Formal area names are no longer stamped repeatedly onto the ground. The HUD identifies the active area while terrain, ruins, roads, tree screens, rock shelves, abandoned homes and landmark composition carry the geography.
- The world pass deliberately considers the **entire available asset palette**. Existing adobe, castle, dungeon, cave, terrain, rock, tree, vegetation and prop art can be recombined when it improves a location rather than being artificially locked to one theme.
- Seven small runtime prop crops were curated from the already-preserved blacksmith, woodshop and tailor source sheets: forge, smith tools/racks, carpentry bench/toolboard, loom and textile display. The full authoring sheets remain source-only so mobile preload cost stays bounded.
- A small **Burnt Hamlet** between larger territories reuses damaged/darkened settlement art as environmental storytelling rather than another formal named zone. Cinderwood tree masses and authored ruin/rock geometry are used as visual screens so the player discovers spaces progressively.
- Refuge ↔ Wilds and Wilds ↔ Ashfall Hollow are now true map transitions. Existing v0.1.4.0 monolithic-map saves are translated to safe equivalent positions in the new map layout without changing save schema.
- The v0.1.4.0 collision contract remains authoritative: ordinary ground enemies respect visible solids, player/enemy physical shoving remains disabled, melee cannot pass through solid walls, and lightweight obstruction steering remains in place.
- Azrael moves only because his field-test territory moved: his home is now inside the expanded First-Light Scar. His controller, seven abilities, Sanctuary behavior, combat resolution, VFX, audio and smoke tests remain unchanged.
- Monster-family/group definitions remain staged metadata. The larger geography is being approved before a later pass turns those identities into richer family-specific populations and encounter compositions.

See `docs/WORLD_FOUNDATION.md` for the physical iPhone traversal/map-transition test route.


## v0.1.4.0 World Collision & Cinder Region Layout Foundation

This is the first controlled world-building pass after Azrael was physically approved. It intentionally does **not** add a new monster wave, replace Azrael, or attempt a giant town overhaul in one risky patch. The release fixes traversal integrity first and gives the existing Cinder Region a stable local-area model that future encounter and art passes can build on.

- Ordinary ground enemies now collide with the same visible refuge walls, building footprints, Hollow walls and new Fallen Watch ruin walls that stop the player. Enemy/player dynamic separation remains disabled, so the old monster-shove/reverse-slide problem is not reintroduced.
- Enemy AI receives lightweight obstruction steering: contact with a solid temporarily turns chase/return movement along the wall; repeated failed contacts alternate the wall-follow side; a target that remains unreachable eventually causes a short disengage instead of endless wall pushing. Basic melee also requires a clear world line so enemies cannot simply stop at a wall and hit through it. This deliberately avoids a full A* grid until maps become maze-like enough to justify it on mobile.
- Current collision records expose actor-blocking categories (`player`, `enemy`). A future phasing enemy can opt out explicitly with `traversal.worldCollision = 'phase'`; wall-phasing is no longer accidental default behavior.
- The Cinder Region is now partitioned into stable local identities: **Cinder Refuge, Ashen Causeway, Emberfields, Cinderwood, First-Light Scar, The Fallen Watch, Ashgrave Hollow, and Bone Road**. Ashfall Hollow has its own area identity on its separate map.
- The HUD reports the fine-grained local area while the original broad zones remain intact for NPC/map logic.
- First layout cues are visible without introducing new art dependencies: the Causeway extends east from the Refuge gate, First-Light Scar receives restrained celestial ground treatment around Azrael, Fallen Watch gains visible broken collision walls, and Ashgrave receives initial grave landmarks.
- Every spawn definition now records an intended `areaId`, and local area definitions seed weighted monster-family and encounter-group metadata. The runtime spawn counts/roster are deliberately preserved for this collision field test.
- New family vocabulary covers current `imp`, `goblin`, `spider`, `carrion`, `rotwing`, `skeleton`, `construct` families plus future `celestial`; group archetypes seed roaming, packs, patrols, guards, rituals and ambushes. These are planning/data foundations, not a claim that group AI is already live.
- Azrael's seven-skill behavior, Sanctuary healing, balance, VFX/audio and approved art are unchanged from v0.1.3.2.4.

See `docs/WORLD_FOUNDATION.md` for the physical iPhone collision/area test route.


## v0.1.3.2.4 Sanctuary of the First Light

This focused Azrael polish build preserves the physically approved v0.1.3.2.3 combat feel and adds one final support spectacle: **Sanctuary of the First Light**. Azrael channels an enormous ancient-holy seal under himself, the seal blooms outward into a persistent 218px sanctuary, and four healing waves sweep the field over 5.6 seconds.

The pulse is positional rather than a one-time snapshot. Azrael, the player, and any current/future friendly actor using the `celestial` faction are healed only while inside the circle when a pulse occurs. Azrael's self-heal is deliberately lower than ally/player healing so the spell supports the battlefield without repeatedly resetting his fight. The ability uses the existing major-skill pacing lock and only becomes AI-eligible when somebody inside the future field is at least 18% below max HP.

The effect is procedural and mobile-bounded: gold/white/cyan concentric law rings, invented rotating glyphs, counter-rotating celestial geometry, First-Light sun core, winged gate motifs, halo beams, pooled particles and target blessing halos. Save schema remains **2**.

## v0.1.3.2.3 celestial combat expansion

- Expanded Azrael from four to **six** live abilities with **Sanctified Nova** and **Seraphic Judgment**. Both are true AoE skills, deliberately available more often than Heavenfall.
- **Sanctified Nova** is a self-centered ancient-celestial detonation for nearby groups: rotating rune seal, halo layers, mirrored wing-corona strokes, sacred particles, radial damage/knockback and proximity screen shake.
- **Seraphic Judgment** marks a hostile cluster with an ancient celestial seal, then lands three rapid heavenly light-column strikes. The pulses share one configured cast damage budget and the final impact supplies the strongest knockback/shake.
- Major celestial skills now share a short **major-skill pacing lockout**, preventing Nova/Judgment/Heavenfall from chaining into unreadable visual spam while still allowing ordinary Strike/Burst/Blast actions between them.
- Heavenfall remains the signature/rarest field-test attack: its cooldown is longer and its cluster requirement is stricter than the two new AoEs.
- Widened and re-centered the unique mythic nameplate so **ARCHANGEL AZRAEL** remains inside its banner at phone scale while preserving `Lv. ??? • CELESTIAL MYTHIC`.
- Added distinct procedural SFX signatures for the two new celestial abilities.
- FX remain mobile-conscious: pooled spark sprites, bounded burst counts, short-lived Graphics/tweens, distance-gated shake, and no full authoring sheet in the runtime preload.

## ArchAngel Azrael field test

- Temporarily places **ArchAngel Azrael** in the Scorched Outskirts as a live autonomous celestial combatant. This placement is a validation harness, not a final story location.
- Normal presentation uses a unique mythic nameplate: **ARCHANGEL AZRAEL**, **Lv. ???**, **CELESTIAL MYTHIC**, a visible HP bar, and a reserved celestial-emblem treatment. His real internal field-test level/stats remain diagnostics-only.
- Azrael is **not invulnerable**. He uses the shared damage/status pipeline with real endgame-scale HP/attack/defense/resistances, so ordinary field mobs chip him for tiny amounts while future high-tier threats can still matter.
- Added reusable faction relationships: player ↔ celestial are friendly, celestial ↔ monster are hostile. Azrael never targets or damages the player; monsters can target and damage him.
- Enemy melee, telegraphed reach attacks, radial attacks and enemy projectiles can now resolve against faction-hostile friendly actors instead of assuming the player is the only legal target.
- Azrael's AI is cluster-aware and range-aware rather than simple chase AI. It chooses targets, glides, repositions, uses ranged pressure, enters with wing bursts, and prioritizes **Heavenfall** when several enemies are grouped.
- His ordinary locomotion uses the supplied **run** block as a wing-assisted glide with hover bob/light trail; **jump** drives Wing Burst startup. Celestial Strike rotates through halfslash, slash, thrust and backslash so most of the supplied combat moveset is actually exercised.
- Original v0.1.3.2.2 celestial kit: **Celestial Strike**, **Wing Burst**, **Judgment Blast**, and **Heavenfall**. Effects use a consistent celestial language: radiant sigils, halo/ring geometry, wing-shaped energy, luminous trails, heavenly beams, layered impact bursts, radial knockback and distance-gated screen shake.
- Judgment Blast uses a pooled celestial projectile with a distinct luminous projectile texture, trail, impact burst and knockback.
- Pure Azrael kills grant **no player XP, ash, loot or quest credit**. A player who materially contributed recent damage can still receive normal rewards on a shared kill.
- `?debug=1` adds **Near ArchAngel Azrael** and **Azrael AI Overlay** helpers. The overlay exposes AI state/action, target distance, HP and internal level only for development testing.
- The full 832×3456 HoodedAzrael source sheet remains outside runtime `dist/assets`; the live map loads only compact 64×64 action crops needed by his controller.
- `Assassin.png` remains source-staged for the next hostile-human AI pass and is intentionally not spawned in this field test.

## Physical-device focus

Watch Azrael from close and medium range while several mob families engage him. Confirm that his movement reads as wing-assisted rather than ordinary walking, all seven current abilities are visually distinct, Sanctuary clearly heals only valid targets inside its live circle, Heavenfall remains the strongest offensive signature, monsters can chip his HP, none of his attacks hurt or knock the player, his solo kills do not award progression, and extended combat remains smooth on iPhone Safari.

## v0.1.3.2.1.2 final phone-position pass

- Shifted the complete right-side combat wheel slightly farther **right and down** while retaining the same touch-target sizes and safe-area anchoring.
- Pulled `Use` another step toward Attack and moved the HP/ES quick-use pair right/down so more of the central playfield stays visible.
- Tightened Skill I/II slightly and pulled **Skill III substantially inward/downward** to complete the upper Attack arc instead of floating above the wheel.
- Preserved the v0.1.3.2.1.1 Ashen Rest Hearth visibility/recovery changes and all Cleave/recovery tuning.
- Save schema remains 2; no progression state is reset.

## v0.1.3.2.1.1 phone-layout correction

- Shifted the entire right-side combat cluster closer to the iPhone safe-right edge without shrinking touch targets.
- Moved `Use` roughly one control-width toward Attack and moved the HP/ES pair up and right so they no longer sit across the center combat lane.
- Tightened Skill II/III around the upper Attack arc while preserving separation from Attack and utility controls.
- Made **Ashen Rest Hearth** much easier to find: it is directly south/below the **Ashen Rest** inn in Cinder Refuge and now has a pulsing green/gold `HEAL` marker. Interacting there fully restores HP + Essence, clears statuses and resets recovery cooldowns.
- Save schema remains 2. No progression or item state is reset.


The inherited v0.1.3.2.1.x hotfix line below documents the physical-iPhone combat HUD/Cleave foundation that this Azrael field-test build preserves.

## Mobile combat HUD

- Attack remains the fixed bottom-right anchor.
- Skill I / II / III now use a compact **radial/fan layout around Attack** instead of a horizontal row that could push `Use` toward the middle of the screen.
- `Use` has its own fixed utility position and now changes to **Talk / Rest / Travel / Loot** when an interaction is actually in range; it dims when nothing is nearby.
- HP and Essence recovery buttons are kept in a fixed utility cluster above `Use`, with recognizable flask glyphs, visible counts, empty state and cooldown sweep/countdown.
- Recovery buttons are disabled during their shared flask cooldown so rapid taps do not look actionable while the system is cooling down.
- The whole right-side control cluster is smaller and safe-area anchored for iPhone landscape.

## Ember Cleave feel correction

The previous Cleave had more numerical range than a normal swing but the normal melee hit test was extremely broad and Cleave's visual arc was shorter than its real hit area, which could make the basic attack *feel* larger.

v0.1.3.2.1 makes that distinction explicit:

- Basic sword attacks now use data-driven directional arcs (96°–120° across the combo) instead of an almost-half-circle forward test.
- Ember Cleave Rank 1 now uses **148 px range**, **148° arc**, **1.50× attack damage** and **145 knockback**.
- Cleave's fire arc is drawn from the resolved live skill range/arc rather than a hard-coded smaller radius.
- Successful Cleave hits add restrained screen-shake feedback, stronger with multi-target hits.
- `?debug=1` adds **Combat Ranges**: cyan shows the current/basic sword cone and orange shows Ember Cleave's real cone.

## Source-character status

- `heavenly-and-unique/HoodedAzrael.png` now powers the live field-test actor through compact map-scoped runtime action crops; the full 832×3456 source remains preserved outside `dist/`.
- `human-hostile/Assassin.png` remains source-staged for the next enemy-variety pass and is intentionally not spawned in this build.

## Physical iPhone test gate

Append `?debug=1` when useful.

1. Confirm HP/ES flask buttons are obvious and remain visible with all three skills unlocked.
2. Use Recovery Test Kit, drink HP/ES flasks, test cooldown/empty states and rapid tapping.
3. Confirm `Use` stays fixed while skill slots populate and changes to Talk/Rest/Travel/Loot only when appropriate.
4. Toggle **Combat Ranges**. Cyan basic attacks must be visibly shorter/narrower than orange Cleave.
5. Test Cleave against 1, 2 and 3+ enemies; verify its real hit area, visible fire arc, knockback and feedback agree.
6. Repeat Cinder ↔ Hollow transitions and Safari background/return; controls must remain responsive and correctly positioned.

Automated validation cannot replace this physical-device gate.

## Run locally

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080/`. Phaser 3.90.0 remains vendored under `dist/vendor/`.

## Checks

```bash
npm run check
find dist/js tests -type f \( -name '*.js' -o -name '*.mjs' \) -print0 | xargs -0 -n1 node --check
```

The ZIP remains repo-root ready for GitHub Pages.

---

## Inherited v0.1.3.2 recovery foundation

Built directly from the physically tested **v0.1.3.1 Combat Polish & Skill Feel** baseline. This is a focused recovery-loop release: it adds reliable ways to restore HP/Essence and reusable consumable infrastructure without redesigning the maps or changing the working combat foundation.

## Recovery loop

- **Minor Ashblood Flask** — restores **35 HP**.
- **Minor Essence Flask** — restores **28 Essence**.
- HP and Essence flasks share a **4-second flask cooldown**, preventing potion spam while keeping both available from the mobile HUD.
- **Cinder Ration** — restores **28 HP over 7 seconds** outside combat. Nearby hostiles block starting a meal, and taking/dealing damage interrupts it.
- Slow passive HP recovery begins after **9 seconds** of safety/out-of-combat time at **0.6% max HP/sec**. It restores no Essence and shuts off around nearby hostiles.
- **Ashen Rest Hearth** in Cinder Refuge fully restores HP and Essence, clears combat statuses and resets recovery cooldowns.

## Inventory, quick-use and supplies

Recovery items are normal persistent inventory instances with **stack quantities up to 20**. Existing schema-2 saves and older inventory entries without a quantity field normalize safely to quantity 1. A full 30-slot pack can still merge a pickup/purchase into an existing partial stack; an operation that would require another slot fails atomically.

New characters start with:

- 3 × Minor Ashblood Flask
- 2 × Minor Essence Flask
- 2 × Cinder Ration

Two compact landscape buttons sit beside the combat controls: **HP** and **ES**. Keyboard equivalents are **4** and **5**. Consumables can also be used from Inventory.

**Ilyan** now opens a small Field Supplies shop after dialogue and sells all three foundation recovery supplies. Enemies can occasionally drop recovery supplies so combat replenishes some resources, while the merchant prevents bad RNG from stranding a character.

## Existing combat/world systems preserved

- v0.1.3.1 Cleave/Pulse tuning, true run and Bone Spearman/Bone Lunge.
- Skill Rank 1–5 data hooks and save schema 2.
- Ember Cleave, Ashen Guard, Ruin Pulse.
- Burn, Poison, Slow, Guard and Stagger.
- Blight Imp, Blueflame Imp, Bone Archer, Gravecaller and Golem specialist abilities.
- Cinder Region ↔ Ashfall Hollow no-refresh map travel.
- Continue / New Game / Load Save and schema migration.
- Combo-safe starter gear and preserved source art.

## Debug / physical iPhone gate

Append `?debug=1` and use **Recovery Test Kit** to add supplies and lower HP/Essence for fast testing.

Test HP/ES quick use and the shared cooldown, ration start/interruption, passive HP recovery, Ashen Rest Hearth, Ilyan purchases/stack merging, recovery loot pickups, save/reload quantities, Cinder↔Hollow transitions with recovery buttons immediately available, Safari background/return, and a 10–15 minute combat/recovery stress session.

## Run locally

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080/`. Phaser 3.90.0 remains vendored under `dist/vendor/`.

## Checks

```bash
npm run check
find dist/js tests -type f \( -name '*.js' -o -name '*.mjs' \) -print0 | xargs -0 -n1 node --check
```

The ZIP is intended to remain repo-root ready for GitHub Pages.
