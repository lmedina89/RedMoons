# QA Report — v0.1.4.4.2 Living Warfront

## v0.1.4.4.2 automated/static scope

The Warfront regression suite now requires authored detail clusters for both strongholds, all four outposts and The Unhoused; an exact mobile-authored sprite ceiling; a six-object persistent landmark-FX cap; visible-source `landmark-prop` collision for major centerpieces; a bounded 32-actor Warfront production population with zero mythic actors; and preserved nested portal/geography/ambient invariants. The asset registry must include the curated smith/wood/tailor props used by the ruined neutral quarter.

The build environment blocks local Chromium navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`), so no interactive browser playthrough is claimed. Visual composition was sanity-checked against the real source sprites through static asset composites; physical iPhone Safari remains the release gate.


## v0.1.4.4.0.1 automated/static scope

Release gating adds `tests/warfront-foundation-smoke.mjs`, which validates the 6144×3072 map, exact eight-area partition, three route bands, both stronghold footprints, four outposts, central Axis, ruined settlement, Veil Gate, Warfront-specific runtime asset registry, visible-source collision, three bridge crossings, nested Threshold↔Warfront return behavior, bounded ambient sprite count and the authored Living Warfront population budget/regular-faction-only contract.

The normal project suite, all inherited Azrael/Sanctuary/Demon/Celestial/faction/exploration/navigation checks, all JS/MJS syntax checks, ZIP integrity and clean-package static hosting remain required. The container browser is administrator-blocked from local navigation, so no automated live Phaser playthrough is claimed. Physical iPhone Safari remains the release gate for atmosphere, map scale, bridge/water feel and GPU/frame pacing.

# QA Report — v0.1.4.3 Exploration, POIs & Portal Foundation

## v0.1.4.3 automated/static scope

Release gating adds dedicated exploration/portal coverage: four proof-map registrations, exact/bounded return anchors, schema-2 travel/POI persistence, transition/fallback validity, entry/transition/POI collision clearance, POI reward IDs, event→encounter references, a three-actor crypt budget, and unchanged 35-actor Wilds production budget. The root launcher regression remains mandatory after the v0.1.4.2.4 packaging incident.

No automated result is described as a physical iPhone/Safari playthrough. Required release testing remains: normal GitHub Pages root boot, natural and debug map entry/return, cache one-time behavior, shrine cooldown/recovery, crypt combat/collision, Veil return, and regression of First-Light faction combat/Azrael.


## v0.1.4.2.4.1 automated/static scope

`npm run check` now includes `tests/celestial-combat-smoke.mjs` in addition to all inherited structural, Azrael, Sanctuary, navigation, ecology, building-integrity and demon-combat suites. The celestial suite validates BaseAngel/HeavenlyKnight compact crop geometry, coherent Sentinel equipment presets, the four shared celestial abilities, wall-blocked Lumen Bolt, First-Light celestial population, the 35-slot Wilds ceiling, faction-safe player attacks, celestial projectile source attribution, Guardian friendly healing and debug field-test hooks.

Shared `CombatSystem`/`ProjectileManager` targeting is intentionally changed from team-name branches to source-actor faction relationships. Regression requirements therefore include: player attacks ignore common celestials; common celestials target monsters; monsters target common celestials; Azrael attacks ignore celestial allies; Sanctuary remains able to heal player/Azrael/common celestial actors; and Demon Combat tests continue to pass unchanged in behavior.

The four newly supplied named/mythical sheets are source-only and are not considered live gameplay in this QA pass. Physical iPhone Safari remains the visual/interaction release gate; no automated iPhone playthrough is claimed.

## v0.1.4.2.2 automated/static scope

`npm run check` covers structural validation plus Azrael, Sanctuary, world-navigation, encounter-ecology, building-integrity and new demon-combat smoke suites. The demon suite validates all four Demon Legion identities, all 13 new family abilities, four wall-blocked projectile definitions, complete Fleshborn armor presets, First-Light population composition and the unchanged **35-slot Wilds actor ceiling**.

Manual source/runtime visual inspection was performed on the black/red/tan/flesh demon crops and on all three Fleshborn armor presets in idle and four-direction slash poses. The composites remain aligned and preserve the Fleshborn's orange-wing silhouette.

Automated tests validate the dash-strike world line-of-sight hook and projectile wall-collision metadata, but they cannot prove live Phaser feel, effect readability, touch performance or every moving collision outcome. Physical iPhone Safari remains the release gate. No automated interactive browser playthrough is claimed for this release.

Regression checks should specifically protect the v0.1.4.2.1 Refuge geometry and v0.1.4.2 encounter ecology. Azrael's own controller, special-actor data, supplied runtime art and Azrael/Sanctuary test files are expected to remain byte-identical; shared `CombatSystem`, `FxManager`, `Enemy`, world/encounter data and asset registries intentionally change for Demon Combat Foundation.

## v0.1.4.2.1 automated/static scope

Automated validation covers render-derived building solids, completed Forge dimensions, existing world navigation, encounter ecology, Azrael/Sanctuary regression and static project integrity. Physical iPhone Safari remains the visual release gate.

## v0.1.4.2 automated/static scope

`npm run check` now runs structural validation plus Azrael, Sanctuary, world-navigation and encounter-ecology smoke suites. The ecology suite validates all family/archetype/encounter references, area ownership, activation ranges, ambush trigger radii, patrol waypoint containment/collider safety, layered hostile-human loadout depth, rare Assassin use, Demon Legion use, mixed Bone Road patrol roles, mixed Ashgrave ritual roles and the **35-slot Wilds population ceiling**.

All project JS/MJS files also pass `node --check`. Runtime crop dimensions are validated at 64×64 frame geometry: Assassin/Demon walk sheets are 9 frames × 4 directions and slash sheets are 6 frames × 4 directions. Manual pixel inspection confirmed the harvested direction rows and attack poses are coherent.

A Chromium/Playwright live-browser pass was attempted in the build environment, but local/file navigation is blocked by the environment administrator (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore no automated interactive browser playthrough is claimed for v0.1.4.2; physical iPhone Safari remains the release gate for animation alignment, group feel and frame pacing.

The regression gate compares the current worktree against v0.1.4.1: all pre-existing runtime/source art should remain byte-identical, with only four new compact character runtime crops permitted. Azrael controller/ability/special-actor/VFX/audio files and Azrael/Sanctuary smoke tests are expected to remain byte-identical; `CombatSystem` is intentionally changed only for encounter-alert routing.

## v0.1.4.1 automated/static scope

The structural validator now requires three active maps (Refuge, Wilds, Hollow), the 2048×1536 and 6400×2048 expansion dimensions, exact non-overlapping area partitions, map-scoped colliders/spawns/transitions, the nine Refuge buildings, curated workshop runtime assets and a schema-2 migration path from historical `map_cinder_region` saves. It also preserves every inherited collision/navigation/Azrael/Sanctuary invariant.

`tests/world-navigation-smoke.mjs` validates active-map solid filtering and verifies spawn regions do not intersect authored world solids after the layout expansion. During development this check caught two Fallen Watch spawn rectangles overlapping the enlarged ruin geometry; the spawn pockets were moved rather than weakening collision.

Artifact regression compares the v0.1.4.1 worktree against the exact v0.1.4.0 ZIP: all pre-existing runtime/source asset bytes remain unchanged, and only seven new curated workshop prop PNGs are added to runtime assets. Azrael controller, ability data, CombatSystem, FxManager, AudioManager and both Azrael/Sanctuary smoke tests remain byte-for-byte unchanged; `specialActors.js` differs only at Azrael's home map/coordinate line.

Current automated validation is static/logic/HTTP/package validation only. No automated interactive browser or physical iPhone playthrough is claimed.


### Historical v0.1.4.0 collision-suite note

v0.1.4.0 added `tests/world-navigation-smoke.mjs` to the inherited structural, Azrael and Sanctuary suites. The world test validates shared player/enemy solid metadata, future phase opt-out semantics, detour-vector behavior, exact local-area partitioning on both maps, Azrael's placement inside First-Light Scar, encounter family/group references, and every spawn's intended area/map relationship. Structural validation also verifies the real WorldScene enemy↔obstacle collider wiring and Enemy obstruction/disengage implementation.

Artifact regression separately compares Azrael controller/data/combat/VFX/audio files against the physically approved v0.1.3.2.4 baseline and hashes all runtime/source art. Physical iPhone Safari remains required to validate actual live Arcade collision and feel.

## Automated/static validation

`npm run check` runs the full structural validator plus `tests/azrael-logic-smoke.mjs`, `tests/sanctuary-healing-smoke.mjs` and `tests/world-navigation-smoke.mjs`. The suite verifies the v0.1.4.1 shell/version, three-map split, expanded map dimensions, shared player/enemy static-solid metadata, obstruction steering/disengage hooks, melee line-of-sight blocking, non-overlapping local-area resolution, spawn-area/family/group references, legacy monolith location migration, and every inherited save/map/combat/recovery/Azrael invariant. All JS/MJS files must also pass `node --check`.

The logic smoke separately proves: celestial/player friendliness, monster↔celestial hostility, clustered target preference, the two offensive expansion AoEs cooling down faster than Heavenfall, all major invocations including Sanctuary participating in pacing, Seraphic pulse scaling totaling one cast budget, pure-celestial kills failing player reward eligibility, recent material player contribution qualifying a shared kill, and real HP loss against Azrael's extreme defense. The Sanctuary smoke separately verifies position gating, player healing, celestial-ally healing, out-of-range exclusion, non-celestial exclusion and reduced Azrael self-healing.

## Physical iPhone world-foundation gate

1. Lure an ordinary Outskirts enemy against each solid east Refuge wall segment while the player stands safely inside. The enemy must not cross the wall.
2. Move to the broad Refuge gate and confirm the same enemy can use the real opening; there must be no invisible blocker across the exit.
3. Circle a Refuge building during pursuit. The enemy must respect the footprint, must not melee through the building, and must not physically shove/drag the player.
4. At The Fallen Watch, use the new broken wall segments as cover/chokepoints. Enemies should collide and try a side route through visible gaps.
5. Hold an unreachable position behind a long wall. Repeated wall contact should lead to steering/retry and eventually a short disengage rather than phasing or permanent vibration.
6. Enter Ashfall Hollow and repeat the wall test with cave spiders; the southern return opening must remain traversable.
7. Travel through the new local areas and confirm the HUD chip changes cleanly among Ashen Causeway, Emberfields, Cinderwood, First-Light Scar, Fallen Watch and Ashgrave Hollow.
8. Recheck Azrael in First-Light Scar. His seven-skill combat, Sanctuary healing, movement and performance must remain consistent with the physically approved v0.1.3.2.4 baseline.

The expanded route is in `docs/WORLD_FOUNDATION.md`. No automated interactive browser/iPhone playthrough is claimed.

## Inherited Azrael/iPhone regression gate

1. Continue the same schema-2 character and enter Scorched Outskirts; confirm **ARCHANGEL AZRAEL / Lv. ??? / CELESTIAL MYTHIC** appears with a distinct HP bar and no ordinary numeric level.
2. Stand near him without attacking. He must never target, damage, stagger or knock back the player.
3. Watch ordinary mobs acquire Azrael and attack him. His HP must decrease by small real amounts; he must not be invulnerable.
4. Observe normal travel: hover bob + run-derived wing-assisted glide + light celestial trail should read differently from a normal walking NPC. Check all four facings.
5. Observe **Celestial Strike** repeatedly. Across several casts it should exercise multiple supplied melee blocks (halfslash/slash/thrust/backslash), produce a radiant arc/impact and knock enemies away.
6. Observe **Wing Burst** from medium range: jump/wing-flare startup → fast glide/dash → radial celestial impact/knockback. Ensure he does not get permanently stuck after the dash.
7. Observe **Judgment Blast** at range: shoot animation, luminous projectile, trail, impact explosion and knockback. Test against moving enemies and scenery.
8. Crowd Azrael with 2+ mobs. **Sanctified Nova** should appear regularly: ancient rotating seal → wing/halo corona → 360° shockwave. Confirm radial knockback, readable but sub-Heavenfall shake, and no player damage.
9. Observe a 2+ mob cluster at short/mid range. **Seraphic Judgment** should mark the cluster, then deliver three clearly separated descending light-column pulses with the final pulse carrying the largest detonation/knockback.
10. Lower the player below roughly 82% HP and stay within Azrael's large sanctuary radius while combat is active. **Sanctuary of the First Light** should channel from beneath Azrael, bloom outward into a huge ancient gold/white/cyan seal and persist through four clearly readable healing waves.
11. During Sanctuary, step **out** before a pulse and confirm that pulse does not heal the player; step **back in** before a later pulse and confirm healing resumes. Azrael should receive smaller self-heals than the player receives proportionally, and the field must never heal monsters.
12. When Azrael and the player are both effectively full, confirm Sanctuary does not fire merely for spectacle. Damage Azrael or the player meaningfully and confirm it becomes eligible again after cooldown/pacing allows.
13. Pull/observe a cluster of 4+ mobs near him. **Heavenfall** should remain visibly rarer and strongest offensively: beam/flash, layered impact, largest radial knockback and strongest nearby screen shake.
14. Watch several minutes of combat and confirm Nova/Judgment/Sanctuary/Heavenfall do not chain immediately back-to-back; normal Strike/Burst/Blast/glide behavior should separate major casts.
15. Repeat major effects while standing farther away; camera shake must reduce/disappear with distance. Toggle Screen Shake off and confirm it stays off.
16. Let Azrael solo several mobs. Player XP, ash, loot and quest kill counts must not increase. Then damage a mob materially and let Azrael finish it; normal shared-kill reward should be allowed.
17. `?debug=1`: use **Near ArchAngel Azrael** and **Azrael AI Overlay**; verify state/action/target distance/HP/internal level update and the overlay can be disabled.
18. Let ranged/caster/AOE enemies attack him: projectiles, reach attacks and radial attacks must be able to hit Azrael rather than assuming the player is the only target.
19. Stay in the fight for 10–15 minutes. Watch especially for a Sanctuary field that fails to disappear after 5.6s, repeated pulse audio after the field ends, lingering sigils, projectile leaks, rising slowdown, stuck AI states, duplicate audio, or Azrael failing to respawn if somehow killed.
20. Re-test potion quick use, Cleave, Use placement, Ashen Rest and Cinder↔Hollow transitions to catch regressions from the new actor/faction combat wiring.
21. Background Safari and return during an active Azrael fight/Sanctuary; controls, audio, AI, projectiles, effects and health state must resume normally.

Also verify the widened banner keeps the complete `ARCHANGEL AZRAEL` title inside the mythic frame in every facing/zoom state. No automated interactive browser/iPhone playthrough is claimed. Physical iPhone Safari remains the release gate.

---


## v0.1.3.2.2 automated/static validation

The validator now checks the canonical **ArchAngel Azrael / Lv. ???** identity, real Level-99-equivalent stats, celestial↔monster faction hostility, player↔celestial friendliness, compact runtime action registration, custom run-as-glide/jump-as-wing-burst mappings, cluster-aware AI hooks, ally damage/projectile foundations, celestial FX methods, contribution-gated rewards, debug helpers and preserved save schema 2. All inherited HUD, Cleave, recovery, asset, save and map-transition checks remain active.

Additional smoke checks verify that damage attribution is recorded before synchronous lethal enemy callbacks and that Azrael's large defense still resolves to real non-zero incoming damage rather than immunity.

## v0.1.3.2.2 physical iPhone release gate

1. Use `?debug=1` → **Near ArchAngel Azrael**. Confirm the unique mythic nameplate reads `ARCHANGEL AZRAEL` and `Lv. ??? • CELESTIAL MYTHIC`.
2. Allow current mobs to hit Azrael. His HP must visibly decrease; no invulnerability behavior.
3. Stand inside/next to Azrael's Celestial Strike, Wing Burst, Judgment Blast impact and Heavenfall. The player must take **zero** damage/stagger/knockback from Azrael.
4. Confirm monsters can choose Azrael as a target and can use their ordinary melee/projectile/ability paths against him.
5. Observe idle → acquire → wing burst/glide → attack → reposition → retarget. He must not remain locked to a dead target or jitter in place around melee range.
6. Gather 3+ enemies near one target. Heavenfall should become eligible, remain cooldown-limited, show the celestial sigil/channel, blast enemies radially and create proximity-dependent shake.
7. Move beyond the shake radius and observe another major impact: camera shake must stop while the world effect may remain visible.
8. Let Azrael solo-kill several enemies: no XP, ash, loot, recovery drops or quest kills. Then materially damage an enemy and let Azrael finish it; normal reward handling should be eligible.
9. Toggle **Azrael AI Overlay** and verify state/action/target/HP/internal Level 99/cooldown telemetry updates rather than freezing.
10. Travel Cinder → Hollow → Cinder. Confirm Azrael's Cinder-only action package/actor restores correctly, the player remains visible, and no duplicate Azrael appears.
11. Safari background/return during an active Azrael fight. No stuck sigil, projectile, continuous shake, duplicate audio or permanently frozen actor.
12. Run 10–15 minutes around the field test and watch for rising slowdown, accumulating transient graphics, projectile-pool starvation or repeated collision/input regressions.

No automated interactive browser/iPhone playthrough is claimed. Physical iPhone Safari remains the release gate.

---

## Inherited v0.1.3.2.1 HUD/Cleave gate

## Automated/static validation

The validator now checks the compact radial HUD structure, fixed Use anchoring, flask-glyph/count/cooldown states, contextual interaction snapshot wiring, explicit basic-attack arcs, stronger Cleave geometry/knockback, live-range-derived Cleave FX, diagnostic range-toggle wiring and staged Azrael/Assassin source dimensions/runtime exclusion. All inherited recovery, save, asset, map-transition and combat checks remain active.

## Physical iPhone release gate

1. Fresh/continued save: confirm Attack, all available skill slots, Use and HP/ES flasks fit without overlap in landscape.
2. Unlock all three skills via Combat Test Kit and verify the skills form an arc around Attack rather than expanding leftward.
3. Recovery Test Kit: drink HP and ES; verify count decrement, shared cooldown, countdown sweep, disabled rapid-tap state and clear zero-count state.
4. Move near Vesra, Ashen Rest, a map transition and dropped loot; verify Use changes to Talk / Rest / Travel / Loot and returns to dimmed Use when leaving range.
5. Toggle Combat Ranges under `?debug=1`: cyan basic cone must be shorter/narrower than orange Cleave.
6. Fight with all four sword-combo stages and verify attacks no longer hit enemies far to the side/behind merely because they are inside the radius.
7. Cleave one, two and several enemies; verify 148px/148° targeting, fire arc alignment, knockback and restrained screen shake.
8. Repeat Cinder ↔ Hollow transitions and Safari background/return; no control displacement, frozen input, missing player layers or lost recovery controls.
9. Run a 10–15 minute mixed combat/recovery session and watch for accumulating graphics, stuck cooldown overlays or slowdown.

No automated interactive browser/iPhone playthrough is claimed. Physical iPhone Safari remains the release gate.

---

## Inherited QA history

# QA Report — v0.1.3.2 Recovery & Consumables

## Automated/static validation

The project validator covers consumable definitions, starting stacks, merchant/drop/recovery-point references, stack merging/consumption, full-pack partial-stack behavior, shared flask cooldowns, HP/Essence restoration, ration combat blocking/interruption, sanctuary full recovery, save quantity normalization and all inherited combat/map invariants. All JS/MJS files must also pass `node --check`.

## Physical iPhone release gate

1. New Game shows 3 HP flasks, 2 Essence flasks and 2 rations as three stacks.
2. Recovery Test Kit lowers resources; HP quick-use restores 35 HP and decrements exactly one flask.
3. Immediately pressing ES is blocked by the shared 4s flask cooldown; after cooldown it restores 28 Essence.
4. Rapid taps never double-consume.
5. A ration starts only while safe, shows meal recovery, heals over time, and is interrupted by taking/dealing damage.
6. Passive HP regeneration begins only after about 9s safe/out of combat; Essence does not passively regenerate.
7. Ashen Rest Hearth restores full HP/Essence and clears combat statuses.
8. Ilyan → Trade allows all three purchases, subtracts ash and merges stacks; full-pack behavior remains safe.
9. Enemy recovery drops can be picked up and merge into existing stacks.
10. Save/reload preserves quantities.
11. Cinder↔Hollow transitions remain stable and recovery controls work immediately after arrival.
12. Safari background/return plus a 10–15 minute mixed combat/recovery session shows no stuck cooldowns, duplicate consumption, frozen controls or material slowdown.

No automated browser playthrough is claimed; physical iPhone Safari is the release gate.

## Scope

v0.1.3.1 is built directly from the physical-iPhone-validated **v0.1.3 Combat Systems Foundation** baseline. It preserves the two-map/transition lifecycle and the shared combat architecture while polishing skill feel, adding true run, the Bone Spearman thrust proof, status/cooldown readability, and future skill-rank storage/scaling hooks. Save schema remains **2**; existing v0.1.3 schema-2 saves without `skills.ranks` normalize to Rank 1.

## Automated validation completed before packaging

- All registered runtime asset paths exist and all JavaScript passes `node --check`.
- Expanded player/starter true-run plus spellcast/thrust/shoot/hurt crop dimensions and non-empty source frames are validated against the actual PNG alpha data; the 192px Bone Spearman thrust sheet is also geometry/alpha checked.
- The original four-hit sword geometry, starter gear compatibility, map transition ordering/lifecycle reset, collision model, loot eligibility and source/runtime separation remain regression checks.
- Skill definitions remain limited to the planned Level 1/3/5 foundation set; Cleave/Pulse tuning and Rank 1–5 normalization/scaling hooks are validated.
- Burn, Poison, Slow, Guard and Stagger definitions are present; all four projectile records and six enemy ability records resolve.
- Blight Imp, Blueflame Imp, Bone Archer, Gravecaller, Bone Spearman and Ashstone Golem reference the intended abilities and the Skeleton specialists have real world spawns.
- Schema-1 state is normalized to schema 2, retains old build metadata until next write, preserves existing map/equipment data, and gains skill unlocks appropriate to its saved level; schema-2 v0.1.3 saves gain safe Rank-1 defaults without another schema bump.
- Mobile skill buttons, keyboard 1/2/3 input and Combat Test Kit wiring are statically verified.

## Physical iPhone release gate

1. **Regression first:** Cinder → Hollow → Cinder several times; move, Attack and use skills immediately after every transition. No reset/refresh, invisible player or frozen simulation.
2. New Game: confirm starter clothes remain aligned through all four ordinary sword attacks.
3. Level 1: use **Ember Cleave** repeatedly; verify Essence cost, 4s cooldown, cone targeting, fire FX and occasional Burn.
4. Use Combat Test Kit or level naturally: confirm **Ashen Guard** and **Ruin Pulse** populate slots at Levels 3/5 and survive save/reload.
5. Ashen Guard: compare incoming damage while active and verify it expires; ensure Stagger resistance never creates permanent control immunity.
6. Ruin Pulse: test several enemies around the player; verify radial hit, knockback/Stagger and no permanent enemy lock.
7. Blight Imp: dodge Toxic Spit; on hit verify Poison ticks/stacking and expiration.
8. Blueflame Imp: dodge Blueflame Bolt; on hit verify Burn behavior.
9. Bone Archer: verify the visible bow+arrow shoot overlay stays aligned through all facings, then confirm straight non-homing arrow travel, wall collision/lifetime and damage on hit.
10. Gravecaller: verify spellcast action, Grave Hex travel and temporary Slow.
11. Ashstone Golem: verify visible Earthshatter ground telegraph appears before the slam and movement can escape it.
12. Hurt/Stagger: confirm the player regains movement/Attack/skills after effects expire.
13. Save a pre-v0.1.3/schema-1 character at Level 3+ or 5, deploy this build, Continue, and verify map/location/equipment/progression remain intact while correct skills appear.
14. Background Safari and return during/after combat; verify input, projectiles, status timers and SFX do not duplicate or permanently stop.
15. Run 10–15 minutes of combat and multiple transitions; look for projectile trails that never disappear, increasing slowdown, duplicated sounds/toasts or stuck telegraphs.

## Release decision

Automated checks can establish structural correctness but cannot substitute for the physical-device gate above. v0.1.3.1 should not become the next stable checkpoint until the tuned player skills, Bone Spearman/true-run additions, existing enemy ability proofs, rank normalization and map-transition regression all pass on iPhone Safari.

## v0.1.3.1 physical-device additions

- Confirm Ember Cleave feels wider/longer without hitting clearly rearward targets.
- Confirm Ruin Pulse has stronger feedback/knockback and does not destabilize movement.
- Sprint in all four directions in the starter outfit; equip an incompatible legacy/revised layer and verify safe accelerated-walk fallback instead of frame drift.
- Use `Near Spearman`; verify visible spear, line telegraph, thrust animation, sidestep avoidance and recovery in all facings.
- Verify status chips, cooldown sweep and rank badges remain readable without obstructing Attack/Use.
- Continue a v0.1.3 schema-2 save with no `skills.ranks`; all unlocked skills should appear at Rank 1.

## Faction warfare stress-specific checks

- Normal Cinder Wilds spawn budget remains 35.
- `?debug=1` adds exactly eight First-Light Demon Legion reinforcements (two each Abyss/Hellfire/Ashbone/Fleshborn).
- Debug reinforcement rectangles are validated inside First-Light Scar and outside static solids.
- Target replacement, pursuit-bound filtering, bounded faction assist and debug-only spawn instantiation are covered by `tests/faction-warfare-smoke.mjs`.
- Physical iPhone Safari remains the release gate for actual battle readability, frame pacing and Azrael-vs-warband feel.


## v0.1.4.4.3.1 — Lailani Field-Test Polish validation

- Added `tests/lailani-field-test-polish-smoke.mjs` covering the wider split-line nameplate, debug solo command, clean solo entry, four bounded 3–5 actor wave templates, Fleshborn heavy-wave coverage, collision-safe arena anchors/slots, separation from production spawn centers, Lailani-only test targeting, reward-bypass callback, and unchanged 32-actor production Warfront definition.
- Full legacy suite remains authoritative for Azrael, common combat, faction warfare, portals, Warfront geography/detail and Lailani's original seven-skill field-test contract.
- Physical iPhone Safari remains the release gate for readability of the wider plate and long-duration solo-loop VFX/performance.

## v0.1.4.4.3 — Lailani Field Test validation

- Added a dedicated Lailani smoke suite covering the seven-skill identity contract, exact 60-second Mantle duration, defensive multiplier, bounded self-heal pulse, speed hierarchy versus Azrael, cluster-aware target selection, source/action asset dimensions and Warfront-only streaming.
- Lailani's temporary home and debug entry are checked against the authored Warfront collider set with safety padding.
- Existing Living Warfront tests continue to require 32 regular army actors, 16 per faction, while distinguishing that regular-army budget from unique special actors.
- Protected regression checks should keep Azrael, shared combat, projectiles, faction data, shared FX/audio and travel/event systems byte-identical to v0.1.4.4.2.
- Automated validation does not replace the physical iPhone Safari visual/performance gate for Lailani's movement cadence, one-minute aura readability or battlefield spectacle.



## v0.1.4.4.3.2 — Azrael Judgment Blast Reliability Polish validation

- Added `tests/azrael-judgment-blast-smoke.mjs` to reproduce the original missing-`sourceActor` failure and prove a Celestial Judgment projectile crossing a hostile actor now calls the normal damage resolver exactly once.
- Static/runtime checks require the 0/90/180 ms three-shot stagger, 0.60/0.45/0.45 damage shares, center/±26 px coverage fan, 0.42s movement lead, 16 px projectile radius and distinct Judgment impact presentation.
- Full inherited suites remain authoritative for Azrael's six unchanged abilities, Sanctuary, Lailani, regular celestial/demon combat, faction warfare, Warfront population/geography, portals and save schema.
- Physical iPhone gate: observe both stationary and moving targets. Successful Judgment bolts must produce visible damage numbers + knockback + celestial impact; bolts should remain straight/wall-blocked and genuine evasive misses should still occur.
