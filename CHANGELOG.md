# Changelog

## v0.1.4.4.5.4.1 — Mythic Freeplay Eternal Warfront

- Added a Freeplay-only 54-regular-actor Veil Warfront population (34 Infernal / 20 Celestial) spread across all eight battlefield areas; normal campaign Warfront remains exactly 32 actors.
- Added seven Freeplay-only Infernal ranks spanning Lv22–53: Abyss Warwing Veteran, Gravesworn Veteran, Ossuary Knight, Hellfire Veteran, Ashbone Praetorian, Dread Ossuary Champion and Fleshborn Executioner.
- Higher-rank skeleton variants use complete fixed armor sets and fixed weapons; campaign skeleton definitions/loadouts are unchanged.
- Added deeper Infernal incursions into Celestial territory, stronger Riven/Axis pressure, southern ruin patrols and additional Celestial defensive/relief formations for a more continuous eternal-war layout.
- Kept local simulation bounded with 760–980px activation ranges; the 54-slot profile validates to an approximate maximum of 20 simultaneously awake regular actors on a coarse Warfront grid.
- Zerakoth is enabled in Azrael Mythic Freeplay as the existing Lv60 commander; Bloodwing remains Lv94 mythic. Neither is added to the 32-actor campaign population.
- Freeplay kills remain rewardless and disposable; save schema remains 2 and normal Azrael autonomous AI remains byte-identical to the approved baseline.

## v0.1.4.4.5.4 — Azrael Mythic Freeplay Foundation

- Added a normal-title-screen **Mythic Freeplay** entry with **Azrael** as the first and only playable mythic in this pass.
- Freeplay creates a disposable fresh session directly on the Celestial side of the Veil Warfront; it never calls save reset/write and therefore never replaces the campaign slot. Save schema remains 2 and `hellrpg.ashfall.save.v1` is unchanged.
- Added a separate `AzraelFreeplayController` for human joystick/input control. Azrael's existing autonomous AI actor/controller remains the normal-game path and is not used while the player controls him.
- Reused Azrael's exact existing Level-99/apex stats, compact runtime art, CombatSystem ability implementations, cooldowns, major-skill pacing, VFX and audio. No duplicate freeplay ability definitions were created.
- Added a dedicated Mythic Combat HUD: **Strike** performs Celestial Strike, while two three-skill banks expose Wing Burst, Judgment Blast, Sanctified Nova, Seraphic Judgment, Sanctuary of the First Light and Heavenfall with real cooldown/major-lock feedback.
- Azrael's compact runtime assets follow the disposable session across existing maps so normal transitions/roaming remain possible without preloading his preserved full source sheet.
- Freeplay NPCs remain available for ambient conversation, but quest acceptance/turn-in, merchant progression, loot/POI/recovery interaction, inventory/stat mutation, kill rewards and all save writes are suppressed.
- Production Living Warfront remains exactly 32 regular actors. No artwork was added or modified.
- Lailani, El’exis, Bloodwing, Zerakoth, the Dreadknight, the Debug Battle Arena and normal campaign systems are otherwise preserved.

Physical iPhone Safari remains the release gate. Validate Azrael movement/aiming, both skill banks, all seven abilities, map transitions, death/respawn behavior and—most importantly—that returning to the normal campaign still leaves autonomous Azrael unchanged.

## v0.1.4.4.5.3.1 — Debug Panel Docking Hotfix

- Added an explicit **Minimize** control to the `?debug=1` panel after physical iPhone testing showed the full battle-arena selector obscured too much of the battlefield.
- Minimized mode collapses all debug sections and slides the panel almost entirely off the left edge, leaving only a touch-friendly **DEBUG ›** reopen tab.
- Collapsing/reopening is UI-only: staged arena actors, HOLD/LIVE state, God Mode, summons and combat continue unchanged.
- Preserved every v0.1.4.4.5.3 battle-arena summon/control, save-isolation rule, reward bypass, actor cap, combat balance and production Warfront population.
- Save schema remains 2; no artwork or gameplay assets changed.

## v0.1.4.4.5.3 — Debug Battle Arena & Spectator Controls

- Rebuilt the `?debug=1` menu into categorized arena, faction-summon, named-field-test, world-test and legacy diagnostic sections for iPhone-friendly testing.
- Added an isolated southern **Debug Battle Arena** on the Veil Warfront with collision-clear authored spectator/Celestial/Infernal slots and a 14-actor mobile-conscious summon cap.
- Added individual named summons for Azrael, Lailani, El’exis, Zerakoth and Bloodwing Scourge, plus repeatable Sentinel, Guardian, Dreadknight and Fleshborn summons.
- Added Celestial Named Trio, Infernal Named Pair, Celestial Squad, Infernal Squad, All Named Clash and Army Clash group staging.
- Added setup **Battle Hold**, Start/Hold, Reset Fight, Clear Arena and Exit Arena controls. Unique actors use their real canonical stats/AI/skills and do not respawn automatically after arena defeat.
- Added debug-only **God Mode / spectator targeting**: resolved player damage is suppressed and the player is removed from AI combat target pools while enabled.
- Arena-spawned ordinary combatants bypass production rewards; entering the arena saves the legitimate origin first, then arena position/state is blocked from save writes until exit.
- Debug Warfront streaming now includes Azrael's compact runtime action crops so he can be summoned in the arena without changing his canonical Cinder placement.
- Production Warfront remains 32 regular actors; save schema remains 2; no existing combat balance, source artwork, named-actor stats or ability definitions were intentionally changed.

## v0.1.4.4.5.2 — Zerakoth, Warden of the Pit Field Test

- Activated **Zerakoth — Warden of the Pit** as a debug-only named Infernal commander, internally **Level 60 / commander tier**, filling the hierarchy between the Lv30 Infernal Dreadknight and Lv94 Bloodwing Scourge.
- Reclassified the previously reserved Zerakoth hierarchy slot as live while leaving the future **Ancient Demon Lord Lv98 / apex** reserved.
- Preserved `Truetrans.png` unchanged/source-only and added compact walk/slash/hurt runtime derivatives with a fixed black/crimson **Warden's Warplate** plus permanent synchronized **Warden's Hellblade**. No random equipment is used.
- Added six bespoke dark/fiery commander abilities: **Warden's Rend, Pitbound Rush, Ashen Decree, Hellbrand Volley, Ward of the Pit, and Pitfall Eruption**.
- Added a reusable wall-blocked `warden_hellbrand` projectile, bounded four-shot volley support that leaves all inherited single-shot projectiles on their previous immediate path, and shared targeted-AoE handling for Pitfall Eruption.
- Pitfall Eruption preserves its two-target crowd gate against ordinary units but can escalate against one `mythic`/`apex` worthy opponent through the existing data-driven threat hierarchy.
- Zerakoth's melee, dash, control, projectile and AoE paths all use the shared faction resolver; normal demons, Dreadknights and Bloodwing remain protected from Infernal friendly fire.
- Added **Zerakoth Field Test**, **Zerakoth Solo Test**, and **Zerakoth AI Overlay**. Solo mode uses a collision-clear southern pocket, suspends production enemies for that scene instance, and recycles bounded 3–5 Celestial waves with no production rewards.
- Production Living Warfront remains **32 regular actors**. Save schema remains **2** and `hellrpg.ashfall.save.v1` is unchanged.
- Preserved the approved Dreadknight, Bloodwing, El’exis healing, Lailani, Azrael, common faction balance, portals, maps and existing source art.

## v0.1.4.4.5.1 — Demon Knight Elite Foundation

- Added **Infernal Dreadknight** as a debug-only Level-30 `elite` Demon Legion combatant on the Veil Warfront; the 32-slot production Warfront population is unchanged.
- Added the infernal hierarchy entries **Demon Knight 30 / elite** and reserved **Zerakoth, Warden of the Pit 60 / commander**, preserving Bloodwing 94, Lailani 96, Ancient Demon Lord 98, Azrael 99 and El’exis 99.
- Harvested verified walk/slash/hurt blocks from `TransupOrHolyKnight.png` into compact runtime crops with a blackened/crimson armor treatment while preserving the full source sheet unchanged.
- Added an NPC-only **Pitsteel Longsword** layer derived from the existing Steel Arming Sword geometry; existing player weapon assets remain unchanged.
- Added four evil/dark/fiery abilities: **Blackguard Aegis, Ember Lunge, Cinder Burst, and Hellblade Cleave**.
- Added reusable `self_guard` enemy ability support and optional status-effect VFX selection so Blackguard can use blood/infernal presentation without changing ordinary Guard behavior.
- Added `?debug=1` **Demon Knight Elite Test** with a collision-safe Riven Hold observation entry/spawn and debug-only asset streaming.
- Added regression coverage for level/tier placement, reserved Zerakoth slot, fixed weapon/loadout, infernal VFX language, wounded-Aegis AI, demon friendly-fire rejection, debug-only population isolation and runtime crop geometry.
- Save schema remains 2; Mythical Demon, El’exis, Lailani, Azrael, production Warfront population and all prior source assets remain intact.

## v0.1.4.4.5 — Mythical Demon Field Test + Power Hierarchy Foundation

- Added **Mythical Demon — Bloodwing Scourge** as the first independent named infernal mythic on the Veil Warfront, internally Level 94 with hidden `Lv. ???` presentation.
- Added seven bespoke infernal abilities: Abyssal Ascendance, Rending Talon, Bloodwing Rush, Hellspine Volley, Maw of the Void, Crimson Eclipse, and Cataclysm of the First Pit.
- Added the reusable combat-threat hierarchy `ordinary / elite / commander / boss / mythic / apex` while keeping RPG level as a separate progression value. Canonical named ladder: Mythical Demon 94, Lailani 96, reserved Ancient Demon Lord 98, Azrael 99, El’exis 99; future player hard cap 100.
- Added worthy-single-target escalation: configured major abilities preserve their normal crowd gates but may also fire against one mythic/apex target. Azrael Heavenfall/Sanctified Nova/Seraphic Judgment, Lailani Garden/Transcendent Dawn, El’exis Chains/Constellation/Throne, and the Mythical Demon’s three major AoEs participate.
- Generalized shared Celestial cone/radial and player attack/skill hit paths so hostile special actors receive real resolved damage instead of being skipped by ordinary-enemy-array-only loops.
- Added seven compact runtime crops from the verified complete upper LPC action blocks of `DemonMythical.png`; the full source sheet remains source-only and unchanged.
- Added `Mythical Demon Field Test`, `Mythical Demon Solo Test`, and `Mythical Demon AI Overlay` debug actions. Solo waves are bounded to 3–5 Celestials, target the demon only, bypass production rewards, and use a collision-safe southern-western arena separated from production spawn centers.
- Added power-hierarchy, infernal-field-test, and infernal-solo regression suites. Production Warfront remains 32 regular actors; save schema remains 2.
- Preserved v0.1.4.4.4.1 El’exis healing, Azrael Judgment Blast, Lailani, ordinary faction balance, portals, progression and Warfront geography.

## v0.1.4.4.4.1 — El’exis Healing Polish

- Raised **Edict of Sanctuary** player restoration to 12% max HP on the opening pulse plus 5% max HP on each of its three sustained pulses, for 27% total only when the player remains inside the full 5.6-second field.
- Raised **Crown of Dominion** player restoration to 3% max HP per 4.5-second aura pulse while the player remains inside its bounded aura.
- Made player-healing percentages explicit in El’exis ability data rather than relying on the previous generic 0.68 player-healing scale.
- Preserved El’exis self-healing, ordinary-Celestial healing, reduced named-mythic cross-healing, Guard/control effects, support-first AI, all damage/cooldown/VFX behavior, the 32-actor production Warfront, Azrael/Lailani behavior and save schema 2.
- Added focused regression coverage for exact player restoration while retaining the inherited El’exis field/solo suites.

## v0.1.4.4.4 — El’exis Field Test

- Added **El’exis — Mother of the Host** as an independent Azrael-tier named celestial on the Veil Warfront.
- Added seven bespoke abilities: Crown of Dominion, Spear of the Firmament, Chains of the Seventh Throne, Astral Severance, Edict of Sanctuary, Heavenfall Constellation, and Throne Beyond Heaven.
- Added support-first AI: El’exis evaluates wounded friendly Celestials before offensive major casts and can move toward a threatened squad to place Edict of Sanctuary. A materially wounded ally now takes priority over entering Crown of Dominion, so immediate rescue comes first.
- Crown of Dominion lasts 60 seconds, provides El’exis personal mitigation, periodically restores nearby Celestials, refreshes Guard, and emits a restrained retaliatory Dominion pulse.
- Edict of Sanctuary provides a meaningful initial ordinary-angel heal, sustained smaller pulses, Guard, and enemy slow/control. Allied mythic healing is scaled down to avoid future mythic healing loops.
- Added independent gold/white/pale-violet Dominion geometry, chain, constellation, sanctuary, spear, and throne effects without modifying shared Azrael/Lailani VFX contracts.
- Added seven compact runtime crops from the verified complete top LPC action blocks of `LexiAngel.png`; source sheet remains preserved unchanged.
- Added `El’exis Field Test`, `El’exis Solo Test`, and `El’exis AI Overlay` debug actions. Solo waves are debug-only, bounded to 3–5 demons, target El’exis only, and bypass production rewards.
- Added 1200px player-scoped simulation gating for the large Warfront.
- Production Living Warfront remains 32 regular actors. Save schema remains 2.
- Preserved Lailani’s approved field-test build and Azrael’s v0.1.4.4.3.2 Judgment Blast fix.

## v0.1.4.4.3.2 — Azrael Judgment Blast Reliability Polish

- Fixed a real Judgment Blast hit-registration defect: Azrael's projectile payload now includes `sourceActor`, allowing the faction-aware projectile manager to resolve hostile demon targets and actual damage.
- Reworked Judgment Blast from one straight bolt into a restrained three-shot volley at 0/90/180 ms with center/left/right shallow fan offsets and modest live target-movement lead.
- Set volley damage scaling to 0.60/0.45/0.45 of the prior single-blast configured damage, limiting a perfect three-bolt connection to 150% of the old intended cast budget.
- Increased the Celestial Judgment collision radius from 13 to 16 px and strengthened its successful impact burst for clearer physical-device hit confirmation.
- Added `tests/azrael-judgment-blast-smoke.mjs`, including a direct regression of the missing-sourceActor failure mode and the new stagger/fan/lead/damage contract.
- Preserved Lailani v0.1.4.4.3.1, all six other Azrael skills, common faction combat, Warfront population, portals, save schema and progression behavior.

## v0.1.4.4.3.1 — Lailani Field-Test Polish

- Widened and restructured Lailani's mythic nameplate into separate **LAILANI**, **TRANSCENDENT SERAPH**, and mythic-status lines for better iPhone readability.
- Added `?debug=1` **Lailani Solo Test**. It restarts the Warfront into a clean southern observation pocket, suspends the normal 32 production actors for that debug session, and relocates Lailani into a dedicated arena.
- Added four recyclable debug-only demon wave templates (3–5 actors), including a heavier Fleshborn wave. New waves begin after a short clear delay for continuous observation.
- Solo demons target Lailani only and use a dedicated death callback that bypasses production XP, currency, loot, quest credit and reward-save handling.
- Normal Lailani Field Test remains available; reloading/leaving the Warfront restores the standard Living Warfront population.
- No changes to Lailani's seven ability definitions, Azrael, common enemy/celestial balance, production Warfront spawn data, shared combat/projectile/FX/audio, portals, or save schema.

## v0.1.4.4.3 — Lailani Field Test

- Added Lailani as a unique celestial mythic special actor on the Veil Warfront using a dedicated controller independent of Azrael.
- Added seven bespoke abilities: Mantle of the Empyrean, Seraphic Passage, Lances of the Seventh Sky, Celestial Waltz, Halo of Still Waters, Garden of Heaven and Transcendent Dawn.
- Added a 60-second Mantle state with bounded aura rendering, 26% resolved-damage reduction, small five-second self-heal pulses and enhanced movement presentation.
- Added fast curved pursuit/reposition behavior, passage dashes and four-step Waltz movement so Lailani reads as a graceful, dancing battlefield presence rather than a stationary caster.
- Added seven compact runtime action crops from the user-provided Lailani source sheet; only complete dressed/winged action blocks are used at runtime.
- Added Warfront-only asset streaming, a temporary Dawnward/Axis field-test home plus `lailani_test` debug entry, and a 1200px player-scoped simulation gate so her mythic AI/FX sleep when the player is elsewhere on the large map.
- Added **Lailani Field Test** and **Lailani AI Overlay** debug helpers.
- Added `tests/lailani-field-test-smoke.mjs` covering identity, seven-skill contract, Mantle duration/mitigation/healing, speed hierarchy, asset dimensions/scoping, collision-safe placement and controller independence.
- Preserved the regular Living Warfront at 32 army slots; Lailani is a separate unique special actor and Lexi/Mythical Demon/Ancient Demon Lord remain source-only.
- Deliberately did **not** change Azrael placement, Azrael projectile behavior, save schema, common faction abilities, combat resolver, projectile manager, shared FX manager or audio manager.

## v0.1.4.4.2 — Living Warfront

- Populated the 6144×3072 Veil Warfront with **32 production actors total: 16 celestial and 16 infernal**, remaining below the established 35-actor Cinder Wilds ceiling.
- Added bounded defenders for both main strongholds, both rear outposts and both forward outposts.
- Added opposing three-actor Axis patrols plus two-actor scout patrols near Pilgrim’s Ruin/The Unhoused approach.
- Added two localized data-driven faction-clash event seeds so nearby opposing patrols can converge without waking the entire battlefield.
- Reused the existing faction-safe combat, target-loss recovery, bounded assist, pursuit leashes and player-scoped offscreen sleeping systems; no common ability tuning is changed.
- Added a `?debug=1` **Warfront Axis Clash** placement helper for physical stress testing.
- Kept Lailani, Lexi, DemonMythical and AncientDemonLord source-only with zero mythic runtime population.
- Save schema remains 2; Warfront geography/detail/ambient budgets and existing art remain unchanged.

## v0.1.4.4.1 — Strongholds, Outposts & Environmental Detail

- Preserved the approved 6144×3072 Veil Warfront geography, portals, routes, Axis, water crossings and ambient budget while deepening all seven major non-Axis landmarks.
- Added distinct authored compositions for Infernal Stronghold, Cinder Bastion, Riven Hold, Dawnward Hold, Halo Bastion, Celestial Stronghold and The Unhoused.
- Reused existing audited Castle2, Dungeon Elements, workshop, vegetation and terrain assets; no pre-existing image bytes were edited.
- Added six visible-source `landmark-prop` colliders for the largest centerpiece structures while leaving minor clutter non-blocking.
- Added six bounded local landmark pulse/fade Graphics effects and an explicit 136 authored-sprite ceiling; the existing 38 Warfront ambient sprites remain unchanged.
- Kept Warfront army population at zero. Common-unit faction population remains reserved for v0.1.4.4.2.
- Save schema remains 2; no Azrael, Demon Combat, Celestial Combat, faction-combat, travel or exploration logic is retuned.

## v0.1.4.4.0.1 — Warfront Visual Assembly Hotfix

- Restored the two omitted Castle2 crown frames above the Axis of First Light tree/orb so the ancient centerpiece renders as the complete source composition.
- Replaced Warfront bridge rendering of the full 224×160 bridge authoring sheet with one verified compact straight-bridge crop, preserving the same three crossing coordinates and water collision gaps.
- Replaced the cliff-ribbon renderer that cycled unrelated mountain source frames with a continuous bounded ancient-shelf composition; geography/colliders are unchanged.
- No combat, faction AI, portals, save schema, Warfront dimensions, spawn population, or ambient-FX budgets changed.

## v0.1.4.4.0.1 — Warfront Geography & Atmosphere Foundation

- Opened the dedicated 6144×3072 Veil Warfront through the existing nested portal/return system.
- Added eight exact local-area partitions covering Infernal Stronghold, rear/front infernal lines, Axis of First Light, ruined neutral quarter, front/rear celestial lines and Celestial Stronghold.
- Added three traversal bands with cross-connections, four outpost footprints, two stronghold shells, ruined settlement structures, central Axis geometry and southern Veil Gate arrival.
- Curated seven compact runtime environment assets from the preserved LPC Revised 4-Season Terrain library: winter/non-winter ground, winter/autumn mountains, icy-water tile, water reflections and winter plants. Original source sheets and credit records are preserved under `source-assets/world/warfront/4-season/`; existing distribution credit files remain in `dist/assets/licenses/original/`.
- Added visible-source Warfront collision for stronghold/outpost walls, cliff shelves, deep luminous water, ruined structures and eight Axis pillars; three authored bridge gaps remain traversable.
- Added bounded persistent Phaser ambience: 38 world-space motes/embers/rune dust, counter-rotating Axis rings, Veil pulse and low-cost distant battle flashes. No permanent full-screen shader.
- Added natural Veil Threshold → Warfront nested travel plus a direct debug Warfront map helper.
- Warfront population remains intentionally zero in this geography pass; no Lailani, Lexi, Mythical Demon or Ancient Demon Lord runtime activation.
- Save schema remains 2 and all existing v0.1.4.3 travel/POI/faction-combat behavior is preserved.


## v0.1.4.3 — Exploration, POIs & Portal Foundation

- Added a reusable persisted return-anchor travel system for interiors/realms. Entry transitions can capture the exact source map/coordinates; paired return transitions pop the anchor only after destination assets prepare successfully and provide safe fallbacks for direct/debug entry.
- Added four proof maps: Warden Hall, Torren’s Forge, Ashgrave Crypt, and Veil Threshold.
- Added 10 data-driven POIs spanning persistent one-time caches, lore discoveries, a cooldown recovery shrine, interior supplies, and the first mystical warfront foreshadowing space.
- Added a bounded dynamic world-event system with local encounter alerts and a reusable faction-clash event type.
- Added the first three-actor hostile interior encounter in Ashgrave Crypt without increasing the established 35-actor Cinder Wilds production ceiling.
- Added save-schema-2 normalization for `travel.returnStack` and `worldFlags.poiStates`; malformed/obsolete anchors are discarded or safely clamped instead of corrupting a save.
- Added dedicated exploration/portal smoke coverage for transition pairing, exact return coordinates, save normalization, POI reward validity, collider safety, event encounter references, hostile-interior population and unchanged Wilds population.
- Preserved the repo-root `./dist/` GitHub Pages launcher, taught it to preserve query/hash state (including root-level `?debug=1`), and kept its startup regression test.
- No existing image assets, Azrael combat, Demon Combat, Celestial Combat, or faction-warfare behavior are intentionally changed.

## v0.1.4.2.4.1 — Faction Warfare Startup Hotfix

- Restored the repo-root `index.html` launcher so GitHub Pages redirects into `./dist/` instead of trying to load `css/`, `js/`, and `vendor/` from the repository root.
- Added a root-entry regression test that verifies the repository launcher points to `./dist/` and does not directly reference runtime resources.
- Preserves all v0.1.4.2.4 faction-warfare behavior, debug-only 12-demon stress force, normal 35-actor Wilds ceiling, saves, art, and combat balance.

## v0.1.4.2.4 — Faction Warfare Hardening

- Preserves the v0.1.4.2.3 Celestial Combat Foundation and v0.1.4.2.2 Demon Combat Foundation while hardening shared faction battles.
- Adds **8 debug-only Demon Legion reinforcements** in First-Light Scar (`?debug=1`), yielding a 12-demon stress force when combined with the normal four-role patrol. Normal gameplay remains at the established 35-actor Cinder Wilds ceiling.
- Adds a **Faction War Test** diagnostic button that moves the player between the Demon Legion pressure line and First-Light defenders/Azrael.
- Adds bounded same-faction reinforcement assist for First-Light encounters; nearby allied groups may help, but assist radius and count are capped to prevent map-wide chain aggro.
- Lets celestial support actors use their friendly heal during short no-target lulls so a surviving formation can recover between waves.
- Hardens target lifecycle: committed basic attacks keep their intended target, dead/despawned targets are replaced cleanly, melee/dash abilities cancel when their required target disappears, and actors recover to formation rather than getting stuck in chase.
- Adds local pursuit-bound filtering so faction fights cannot drag combatants indefinitely across the expanded map.
- Save schema remains 2.

## v0.1.4.2.3 — Celestial Combat Foundation

- Added the first live common celestial troop family without activating the four reserved named/mythical source characters.
- Added **First-Light Sentinel** using the new `BaseAngel` source as a reusable white-winged layered body with three curated coherent celestial armor/weapon presets.
- Added **Heavenly Guardian** using the supplied `HeavenlyKnight` sheet as a fixed heavy common-angel archetype; its baked armor is preserved rather than randomized.
- Added four restrained shared celestial abilities: **Radiant Strike**, **Lumen Bolt**, **Judgment Pulse**, and the Guardian support cast **Grace of Light**.
- Added a compact wall-blocked Lumen Bolt projectile/VFX and modest common-angel holy effects intentionally below Azrael/mythical spectacle.
- Generalized shared combat and pooled projectile targeting around actual faction relationships/source actors. Player, common celestials and Azrael are mutually safe; celestial and monster actors can autonomously damage one another.
- Azrael's cone/radial/projectile targeting now explicitly ignores friendly common celestial actors while Sanctuary automatically recognizes/heals them.
- Added a live First-Light celestial guard group (two Sentinels + one Guardian) opposite the existing four-role Demon Legion patrol while keeping the exact **35-slot Cinder Wilds actor ceiling** by reallocating duplicate spawn slots.
- Added `?debug=1` teleports for **Near First-Light Sentinel** and **Near Heavenly Guardian**, plus `tests/celestial-combat-smoke.mjs` covering faction safety, healing, runtime crops, coherent loadouts, Lumen wall collision and population budget.
- Staged the user-provided `LailaniAngel`, `LexiAngel`, `DemonMythical`, and `AncientDemonLord` full source sheets for later bespoke mythic passes only; none are live or preloaded at runtime.
- Save schema remains **2**; Refuge geometry, Living Wilds ecology, Demon Combat Foundation, Azrael's seven-skill data/controller and current map dimensions/transitions are preserved.

## v0.1.4.2.2 — Demon Combat Foundation

- Added a shared Demon Legion combat-family foundation for the black **Abyss Ashwing**, red **Hellfire Ashwing**, tan **Ashbone Ashwing**, and elite **Fleshborn Ravager**.
- Added 13 data-driven demon abilities: three color-family kits plus Fleshborn's four-skill elite kit, including the wall-aware **Predator's Rush** dash strike.
- Added four physical, dodgeable, world-collision projectiles: Abyss Bolt, Hellfire Orb, Soul Shard and Blood Lance.
- Added lightweight procedural demon claw, burst, projectile and rush-trail presentation with abyss/hellfire/ashbone/blood palettes. Ordinary demon effects remain intentionally below Azrael-tier spectacle.
- Added compact RedDemon, TanDemon and DemonLordFlesh walk/slash runtime crops from the preserved full concept sheets; full 832×3456 authoring sheets remain source-only.
- Added weighted complete `loadoutPresets` support. Fleshborn rolls one curated full armor set per spawn (Dread Warplate, Silver Legion or Steel Bastion) while preserving its baked flesh body/wings and weapon-free hands.
- Reworked First-Light Scar's Demon Legion patrol to include Abyss, Hellfire, Ashbone and Fleshborn roles while preserving the exact **35-slot** Cinder Wilds ordinary-enemy ceiling.
- Added direct `?debug=1` teleports for all four demon identities plus `tests/demon-combat-smoke.mjs`.
- Preserved v0.1.4.2.1 Refuge render-derived building collision, NPC route fixes, Living Wilds ecology, map scale/transitions and save schema 2.
- Azrael's controller, special-actor definition, supplied runtime art and seven-skill data remain unchanged; inherited Azrael/Sanctuary smoke suites continue to pass.

## v0.1.4.2.1 — Refuge Geometry & Building Integrity Hotfix

- Repaired all nine Cinder Refuge building colliders after physical iPhone testing showed the solids vertically offset into empty ground below the rendered structures.
- Building collision is now derived from the same explicit display width/height and origin used by rendering, eliminating the separate hand-tuned collider offsets that caused the drift.
- Rebuilt Torren’s Forge from the old 288×92 facade-only slice into a 288×156 complete adobe workshop shell using existing `adobe2-set` tiles; the original source facade remains preserved.
- Added building-integrity smoke coverage for visual-bound/collider agreement and the completed Forge shell.
- Adjusted only the two town NPC route loops that crossed the newly corrected building footprints (Sable near East Lodge and Doran near Hunter House); the new smoke test also verifies NPC route segments do not pass through Refuge building solids.
- Preserved v0.1.4.2 encounter ecology, hostile-human factions, patrols/ambushes, actor ceiling, Azrael/Sanctuary behavior, map scale/transitions and save schema 2.

## v0.1.4.2 — Living Wilds: Monster Families & Encounter Ecology

- Activated the staged monster-family/encounter architecture with 21 local encounter definitions and six behavior archetypes: roam, pack, patrol, guard, ritual and ambush.
- Added radius-bounded encounter-group alerting, authored patrol waypoint loops and true proximity-triggered dormant ambushes.
- Added Ash Scavenger and Ironbound Raider hostile-human definitions using the existing layered LPC body/equipment pipeline with faction-coherent randomized loadouts.
- Added rare Ashblade Stalker and Ashwing Legion Scout runtime crops derived from preserved source-only Assassin/DemonBase concepts.
- Reauthored Wilds/Hollow spawn rows around area ecology while preserving the Wilds hard ceiling at 35 ordinary enemy actor slots.
- Added distance-based ordinary-enemy sleeping; offscreen layered actors stop per-frame visual animation work until reactivated.
- Kept map scale/transitions, save schema 2, collision/navigation and Azrael's seven-skill/Sanctuary behavior intact.
- Added `tests/encounter-ecology-smoke.mjs` and expanded structural validation for encounter references, patrol geometry, ambush triggers, human loadout pools, Demon Legion presence and population budget.


## v0.1.4.1 — Cinder Region Expansion & Refuge Rebuild

- Built directly from v0.1.4.0; save schema remains 2 and the existing localStorage identity is preserved.
- Split Cinder Refuge out of the former monolithic Cinder map into a dedicated 2048×1536 settlement map.
- Expanded the exterior into a 6400×2048 Cinder Wilds map so major locations have meaningful travel distance, transition space and sightline separation.
- Rebuilt Refuge with thicker castle-stone perimeter presentation, gate towers, branching streets, central plaza composition, nine building footprints and denser district-specific clutter.
- Reused the broad existing world palette across terrain, adobe, castle, dungeon, cave, rock, vegetation and structure families instead of restricting each location to one narrow asset subset.
- Added seven compact runtime prop crops from preserved blacksmith/woodshop/tailor authoring sheets while keeping the large source sheets out of runtime preload.
- Added an abandoned Burnt Hamlet, denser Cinderwood sightline screens, First-Light landmark geometry, larger Fallen Watch ruins, grave treatment and road/terrain breakup between formal areas.
- Removed the old tightly packed ground-stamped area-name presentation; the HUD now carries formal area identity while the environment does the spatial storytelling.
- Added Refuge↔Wilds map transitions while retaining Wilds↔Ashfall Hollow streaming and the prepare-before-commit transition lifecycle.
- Added schema-preserving location migration for older `map_cinder_region` saves so old Refuge/wilderness/Azrael/Fallen Watch/Ashgrave positions map to safe equivalents.
- Preserved v0.1.4.0 player/enemy world-solid collision, obstruction steering, melee line-of-sight blocking and no-shove enemy/player separation policy.
- Moved only Azrael's home placement into expanded First-Light Scar; his controller, ability definitions, combat/VFX/audio implementation and inherited smoke tests are unchanged.
- Kept live monster counts bounded and encounter-family/group logic staged for the next population pass after physical map-scale approval.

## v0.1.4.0 — World Collision & Cinder Region Layout Foundation

- Built directly from physically approved v0.1.3.2.4 Sanctuary of the First Light; save schema remains 2.
- Fixed the major traversal inconsistency where ordinary monsters could pass through static walls/buildings that blocked the player.
- Added filtered enemy↔static-world Arcade collision without restoring enemy↔player physical separation.
- Added lightweight collision steering and unreachable-target disengage behavior instead of expensive full-map A* pathfinding.
- Added explicit actor-blocking collider metadata and future opt-in `phase` traversal support.
- Added nine local area definitions across the two current maps, including eight deliberate Cinder Region sub-areas.
- Added first restrained layout/identity cues for Ashen Causeway, Emberfields, Cinderwood, First-Light Scar, Fallen Watch and Ashgrave Hollow.
- Added five visible Fallen Watch ruin-wall segments sourced from the same records used for collision.
- Added monster-family and encounter-group metadata foundations; current live spawn populations and Azrael's approved combat behavior remain unchanged.
- Added `tests/world-navigation-smoke.mjs` and expanded structural validation for area partitioning, family references, spawn-area mapping and shared player/enemy world solids.
- Verified all 310 existing runtime/source art files unchanged from v0.1.3.2.4.

## v0.1.3.2.4 — Sanctuary of the First Light

- Built directly from the physically approved v0.1.3.2.3 Azrael Celestial Expansion; Sanctified Nova, Seraphic Judgment, Heavenfall, movement, faction behavior and existing combat presentation are preserved.
- Added **Sanctuary of the First Light**, Azrael's seventh field-test ability and first dedicated support invocation: a very large ancient-holy circle blooms outward beneath him, persists for 5.6 seconds and delivers four timed healing pulses.
- Added a distinct procedural sanctuary VFX language: layered gold/white/cyan law rings, rotating invented celestial glyphs, counter-rotating sacred geometry, a First-Light sun core, winged gate motifs, halo beams, expanding pulse rings and individual holy blessing effects on healed targets.
- Sanctuary heals only valid living targets physically inside the field at each pulse: Azrael, the player, and celestial-faction allies. The pulse re-checks positions each time, so entering or leaving the field matters.
- Balanced healing by target role: Azrael receives a conservative 2.5% max-HP self-heal per successful pulse, other celestial allies 6%, and the player 10%; healing is capped at each target's real max HP.
- Azrael casts Sanctuary only when an eligible nearby target is meaningfully wounded (18%+ missing HP), and the ability participates in the existing major-celestial pacing lock so it cannot stack into unreadable major-skill spam.
- Added dedicated procedural Sanctuary audio, green-white `+HP` float text, a focused healing smoke test and expanded structural validation.
- Kept the field mobile-conscious: one bounded persistent Graphics field, four bounded pulse events, pooled burst particles, no new runtime texture downloads, and no save-schema change. Save schema remains 2.

## v0.1.3.2.3 — ArchAngel Azrael Celestial Expansion

- Preserved the physically validated v0.1.3.2.2 Azrael controller/faction foundation and expanded his autonomous kit from four to six abilities.
- Added **Sanctified Nova**, a frequent close-range 360° celestial AoE with an animated ancient rune seal, concentric halo shockwaves, wing-corona geometry, sacred particle bursts, strong radial knockback and proximity-scaled camera shake.
- Added **Seraphic Judgment**, a frequent cluster AoE with an ancient target seal and three rapid descending holy-light pulses; the final pulse delivers the strongest explosion/knockback while total pulse scaling remains bounded to one configured cast multiplier.
- Added shared **major-ability pacing** so Sanctified Nova, Seraphic Judgment and Heavenfall cannot chain immediately into unreadable effect spam. Minor attacks/movement remain available between major invocations.
- Increased Heavenfall cooldown to 11.6s and raised its qualifying cluster to 4 so the two new AoEs appear more often while Heavenfall remains the signature event.
- Added dedicated procedural audio signatures for Sanctified Nova and Seraphic Judgment.
- Widened Azrael's mythic nameplate from 134px to 176px, re-centered title/subtitle content and widened the HP rail so `ARCHANGEL AZRAEL` no longer hangs outside the frame.
- Preserved real damage intake, extreme Level-99-equivalent stats, monster-only hostility, contribution-gated rewards, iPhone-conscious FX caps, save schema 2 and the existing temporary Scorched Outskirts field-test placement.

## v0.1.3.2.2 — ArchAngel Azrael Field Test

- Temporarily placed **ARCHANGEL AZRAEL — Lv. ???** in Scorched Outskirts as a live field-test actor; canonical story placement remains intentionally undecided.
- Added a reusable faction/relationship layer. Player + celestial actors are friendly; monsters are hostile to both, allowing NPC-vs-monster combat without special-casing the player.
- Added real Azrael combat stats (internal Level 99, 18,000 HP, 420 attack, 240 defense, high resistances/stagger resistance). He is deliberately **not invulnerable** and takes resolved damage/statuses through the shared combat pipeline.
- Harvested compact 64×64 action strips from `HoodedAzrael.png` for runtime use while preserving the full 832×3456 source outside `dist/`. Run is used as glide; Jump as wing-burst/lift; spellcast/emote/shoot/backslash/halfslash drive the mythic combat presentation.
- Added custom cluster-aware Azrael AI with home vigil, hostile-only target acquisition, glide pursuit, wing-assisted engage, melee/ranged choice, orbit/reposition cadence and automatic retargeting.
- Added four celestial field-test abilities: **Celestial Strike**, **Wing Burst**, **Judgment Blast** and **Heavenfall**.
- Added reusable celestial FX language: radiant arcs, halo/sigil fields, mirrored wing glyphs, sacred burst particles, light-beam impacts, radial knockback and distance-gated screen shake.
- Added a unique celestial-mythic nameplate with hidden `Lv. ???`, live HP bar and a replaceable halo/wing emblem slot for the later bespoke SVG crest.
- Generalized enemy melee/abilities/projectiles so monsters may target either the player or a hostile friendly actor, including Azrael; friendly/celestial attacks never route damage to the player.
- Added contribution-gated rewards so Azrael-only kills cannot grant player XP, ash, loot, recovery drops or quest progress.
- Added debug helpers for teleporting near Azrael and exposing his AI state/action/target/HP/internal level.
- Kept `Assassin.png` source-staged only to isolate the Azrael test from a simultaneous new enemy-AI variable.
- Preserved the v0.1.3.2.1.2 mobile HUD/Cleave/recovery fixes, map identities and save schema 2.

## v0.1.3.2.1.2 — Final Combat HUD Tightening

- Shifted the complete combat-control wheel slightly farther right and down within the iPhone landscape safe area.
- Re-anchored `Use` and HP/ES recovery shortcuts closer to Attack to reclaim additional center playfield.
- Tightened Skill I/II slightly and moved Skill III notably right/down into a closer upper arc around Attack.
- Preserved button sizes, combat/recovery behavior, Cleave tuning and the Ashen Rest Hearth visibility/full-heal changes from v0.1.3.2.1.1.
- Save schema remains 2.

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
