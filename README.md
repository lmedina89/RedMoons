# Hell RPG v0.1.4.4.5.3 — Debug Battle Arena & Spectator Controls


## v0.1.4.4.5.3 Debug Battle Arena & Spectator Controls

- Reorganized `?debug=1` diagnostics into categorized **Arena Controls**, **Celestial Summons**, **Infernal Summons**, existing named field tests, world tests, and legacy/player diagnostics.
- Added an isolated **Debug Battle Arena** in the southern Veil Warfront. Entering it preserves the legitimate pre-arena save/return position and arena activity is never written into the real save.
- Added individual named summons for **Azrael, Lailani, El’exis, Zerakoth, and Bloodwing Scourge**, plus repeatable Dreadknight/Sentinel/Guardian/Fleshborn unit summons.
- Added bounded faction presets: **Celestial Named Trio, Infernal Named Pair, Celestial Squad, Infernal Squad, All Named Clash, and Army Clash**. The arena hard-caps at 14 debug combatants for mobile safety.
- Added setup **Battle Hold**, Start/Hold toggle, Clear Arena, Reset Fight, and Exit Arena. Named actors retain their real canonical stats, levels, threat tiers, skills, faction rules and worthy-opponent behavior.
- Added debug-only **God Mode**. While enabled the player takes zero resolved damage and is removed from AI combat target pools, allowing low-level characters to spectate without pulling aggro away from the actual matchup.
- Arena-spawned ordinary units use rewardless death callbacks; no XP, ash, loot or quest credit can be generated. Production Living Warfront remains exactly 32 regular actors.
- Debug Warfront asset streaming now includes Azrael's existing compact runtime crops only when `?debug=1`, allowing arena summoning without moving his canonical Cinder home or preloading his full source sheet.
- Save schema remains **2** and `hellrpg.ashfall.save.v1` is unchanged. All v0.1.4.4.5.2 Zerakoth content and earlier approved mythic/faction behavior remain intact.

Physical iPhone Safari remains the release gate. Use **Enter / Center Arena**, turn **God Mode ON**, stage a matchup while HOLD is active, then tap **Start Battle**.

## v0.1.4.4.5.2 Zerakoth, Warden of the Pit Field Test

- Added **Zerakoth, Warden of the Pit** as the first named **Level 60 / commander-tier** Infernal, above the Lv30 Dreadknight and below Lv94 Bloodwing Scourge.
- Zerakoth uses a fixed black/crimson **Warden's Warplate** and permanent **Warden's Hellblade** over compact runtime derivatives from the preserved `Truetrans.png` source; no randomized loadout is used.
- Added six independent commander abilities: **Warden's Rend, Pitbound Rush, Ashen Decree, Hellbrand Volley, Ward of the Pit, and Pitfall Eruption**. Effects stay dark/crimson/hellfire and intentionally below mythic scale.
- Pitfall Eruption participates in the existing worthy-opponent hierarchy: normal crowd gates remain, while one mythic/apex foe can justify the major cast.
- All Zerakoth attacks remain faction-safe. Infernal allies cannot be damaged by his melee, dash, projectiles, control or AoE.
- Added `?debug=1` **Zerakoth Field Test**, **Zerakoth Solo Test**, and **Zerakoth AI Overlay**. Solo mode recycles rewardless 3–5 Celestial waves in a clear isolated Warfront pocket.
- Production Warfront remains 32 regular actors; save schema remains 2 and the existing localStorage identity is unchanged.

Physical iPhone Safari remains the release gate. Use the solo loop first to validate armor/Hellblade alignment, all six abilities, commander-tier feel, and sustained performance.

## v0.1.4.4.5.1 Demon Knight Elite Foundation

- Added **Infernal Dreadknight**, a reusable **Level 30 / elite-tier** humanoid demon designed to sit decisively above ordinary Ashwings/Fleshborn while remaining far below the Level-60 commander slot reserved for **Zerakoth, Warden of the Pit** and the Level-94 Bloodwing Scourge.
- Activated the preserved `TransupOrHolyKnight.png` source as the Dreadknight visual basis without altering the source sheet. Runtime uses only compact verified walk/slash/hurt blocks with a blackened-plate, ember-crimson treatment.
- Added a dedicated **Pitsteel Longsword** runtime layer derived from the existing Steel Arming Sword geometry; the original player weapon art is unchanged.
- Added four infernal abilities: **Blackguard Aegis, Ember Lunge, Cinder Burst, and Hellblade Cleave**. Their visual language is blood/crimson/hellfire rather than celestial gold/white.
- Added reusable `self_guard` enemy-ability support. Blackguard Aegis activates only when materially wounded, grants the existing Guard mitigation through the shared status system, and can request infernal VFX without changing other Guard users.
- All Dreadknight melee/dash/AoE targeting continues through the shared faction-safe combat path: demons remain friendly to demons and cannot damage each other.
- Added `?debug=1` **Demon Knight Elite Test** near Riven Hold. The Dreadknight is debug-only in this pass, so the production Living Warfront remains exactly **32 regular actors** while its physical balance/visual tier is evaluated.
- Extended the hierarchy with **Demon Knight 30 / elite** and reserved **Zerakoth 60 / commander**. The existing 94/96/98/99 mythic/apex ladder is unchanged.
- Save schema remains **2** and `hellrpg.ashfall.save.v1` is unchanged. Bloodwing Scourge, El’exis healing polish, Lailani, Azrael, portals, production Warfront population and existing source art remain intact.

Physical iPhone Safari remains the release gate. Use **Demon Knight Elite Test** and verify that the blackened armor + Pitsteel sword stay aligned through movement/attacks, Blackguard reads as an evil defensive cast, the four abilities remain clearly below mythic spectacle, and the Lv30 knight feels substantially stronger than fodder without resembling a Lv60+ commander.


## v0.1.4.4.5 Mythical Demon Field Test + Power Hierarchy Foundation

- Activated the staged **Mythical Demon — Bloodwing Scourge** as the first independent named infernal mythic on the Veil Warfront. Its visible level remains `Lv. ???`; its canonical internal level is **94**.
- Added seven independent infernal abilities: **Abyssal Ascendance, Rending Talon, Bloodwing Rush, Hellspine Volley, Maw of the Void, Crimson Eclipse, and Cataclysm of the First Pit**.
- Added a reusable threat hierarchy separate from ordinary RPG level: `ordinary → elite → commander → boss → mythic → apex`. The current mythic ladder is Mythical Demon **94 / mythic**, Lailani **96 / mythic**, reserved Ancient Demon Lord **98 / apex**, Azrael **99 / apex**, El’exis **99 / apex**, with a future player hard cap of **100**.
- Added **worthy-single-target** major-skill escalation. Existing crowd requirements are preserved for ordinary enemies, but Azrael, Lailani, El’exis, and the Mythical Demon may use configured major AoE/signature abilities against one `mythic`/`apex` opponent. Major cooldowns and pacing locks remain intact.
- Generalized the older shared Azrael cone/radial hit helpers and player attack/skill targeting so hostile special actors participate in real damage resolution rather than being invisible to paths that historically iterated only the ordinary-enemy array.
- Added compact Warfront-only runtime crops from the verified complete upper action blocks of `DemonMythical.png`; the full source sheet remains preserved unchanged under source assets.
- Added `?debug=1` **Mythical Demon Field Test**, **Mythical Demon Solo Test**, and **Mythical Demon AI Overlay**. The solo loop suspends production troops for that scene instance and cycles bounded 3–5 Celestial waves against the demon only with no production rewards.
- Production Living Warfront remains **32 regular actors**. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`. El’exis healing polish, Lailani, Azrael Judgment Blast, portals, progression, ordinary faction balance and Warfront geography are preserved.

Physical iPhone Safari remains the release gate. First use **Mythical Demon Solo Test** to watch all seven attacks, then use the normal field test near the infernal front and specifically observe mythic-vs-mythic engagements: major abilities should now escalate in a 1v1 against a worthy named opponent without being wasted on one ordinary soldier.

## v0.1.4.4.4.1 El’exis Healing Polish

- Physical iPhone testing showed El’exis player healing was visually impressive but numerically too weak (+4 initial / +2 sustained around Level 5).
- **Edict of Sanctuary** now restores the player for **12% max HP on the opening pulse** and **5% max HP on each of the three sustained pulses** (27% total only if the player remains inside the field for all four pulses).
- **Crown of Dominion** now restores the player for **3% max HP per 4.5-second aura pulse** while in range.
- El’exis self-healing, ordinary-Celestial healing, named-mythic cross-healing safeguards, Guard, control, damage, AI priorities, cooldowns, VFX, Warfront population, save schema and all Azrael/Lailani behavior are unchanged.

## v0.1.4.4.4 El’exis Field Test

This build introduces **El’exis — Mother of the Host** as a third independent named celestial field-test actor on the Veil Warfront. She is authored on Azrael’s mythic tier but expresses power through **Dominion, protection, restoration, formation control, and deliberate celestial execution** rather than copying Azrael or Lailani.

Her seven-skill field-test kit is **Crown of Dominion, Spear of the Firmament, Chains of the Seventh Throne, Astral Severance, Edict of Sanctuary, Heavenfall Constellation, and Throne Beyond Heaven**. Crown lasts 60 seconds and periodically heals/Guards nearby Celestials. Edict is support-priority AI: wounded angels can cause El’exis to move toward them and cast a substantial sanctuary heal/Guard field before returning to offense. Allied mythic healing is deliberately reduced so future named celestials cannot form an immortal healing triangle.

`?debug=1` adds **El’exis Field Test**, **El’exis Solo Test**, and **El’exis AI Overlay**. The solo loop suspends the normal 32 Warfront soldiers in that scene instance and recycles bounded 3–5 demon waves against El’exis only, without XP/ash/loot/quest rewards.

The user-supplied `LexiAngel.png` remains preserved in source assets; runtime streams only seven verified complete action crops whose clothing/wings remain intact. Azrael’s Judgment Blast reliability fix and Lailani’s approved combat build are intentionally unchanged.

## v0.1.4.4.3.2 Azrael Judgment Blast Reliability Polish

Built directly from the physically approved **v0.1.4.4.3.1 Lailani Field-Test Polish** release. Save schema remains **2** and Lailani's seven-skill field-test build is unchanged.

This narrow Azrael hotfix repairs a real Judgment Blast hit-registration bug: the old projectile launch omitted Azrael's `sourceActor`, so the faction-aware projectile manager could not obtain any hostile targets and the bolt could never resolve damage. The corrected blast now preserves Azrael as the firing actor and expands the attack into a restrained three-shot celestial volley for better mobile readability/reliability without adding aggressive homing.

- Judgment Blast fires at **0 / 90 / 180 ms** with a shallow center/left/right coverage fan.
- Each staggered bolt re-reads the live target position and current velocity, applies a modest **0.42s lead**, then travels as an ordinary straight wall-blocked projectile.
- Damage scales are **60% / 45% / 45% of the previous single-blast configured damage**, capping a perfect three-bolt connection at 150% of the old intended cast budget rather than tripling it.
- Judgment's collision radius increases from **13 to 16 px** and successful Judgment impacts use a slightly larger/brighter celestial burst.
- No other Azrael ability, Lailani behavior, common faction ability, Warfront population, portal, save, item, or progression behavior is intentionally changed.

Physical iPhone Safari remains the release gate. Watch several Judgment Blast casts against both moving and stationary demons and verify that successful hits now show damage numbers, knockback and a clearly readable celestial impact while genuine misses remain possible.


## v0.1.4.4.3.1 Lailani Field-Test Polish

Built directly from the approved **v0.1.4.4.3 Lailani Field Test**. Save schema remains **2** and Lailani's seven-skill balance is unchanged.

This narrow polish release improves mythic-nameplate readability and adds an isolated **Lailani Solo Test** observation loop. In `?debug=1`, the solo command restarts into a clean southern Warfront pocket, temporarily suspends the normal 32 production soldiers, relocates Lailani into the test arena, and cycles bounded 3–5 demon waves indefinitely. Solo demons target Lailani only and their deaths bypass XP, ash, loot and quest rewards. A heavier Fleshborn wave appears in the authored cycle. Leaving/reloading the Warfront restores normal production warfare.

Lailani's plate now separates **LAILANI**, **TRANSCENDENT SERAPH**, and the mythic level/faction line inside a wider frame instead of compressing the full title onto one line. Azrael, Lailani's seven abilities, the regular Warfront population, shared combat/projectile/FX/audio systems, portals and save schema are intentionally unchanged.


## v0.1.4.4.3 Lailani Field Test

Built directly from the approved **v0.1.4.4.2 Living Warfront** release. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`.

This focused field-test release activates **Lailani, Transcendent Seraph** as the first new named celestial after Azrael while deliberately leaving Azrael's placement, projectile behavior and combat kit unchanged. Lailani is temporarily stationed on the Dawnward side of the Axis so her AI can be observed against the existing regular infernal patrols without changing the wider Warfront population architecture.

- Lailani uses her own independent controller rather than inheriting from or modifying Azrael.
- Her seven-skill kit is **Mantle of the Empyrean**, **Seraphic Passage**, **Lances of the Seventh Sky**, **Celestial Waltz**, **Halo of Still Waters**, **Garden of Heaven**, and **Transcendent Dawn**.
- Mantle lasts **60 seconds**, reduces resolved incoming damage while active, provides a deliberately small self-heal on five-second pulses, and maintains a bounded celestial aura.
- Her movement is intentionally much faster and more lateral than ordinary units: curved orbit/reposition behavior, Seraphic Passage dashes and multi-step Celestial Waltz create the intended dancing-through-the-battlefield identity.
- Runtime animation crops use only source-sheet actions that preserve Lailani's complete blue/white outfit and wings. Incomplete expanded authoring actions remain source-only.
- Lailani is a unique celestial mythic special actor and is **not part of the 32-slot regular Warfront army budget**. Her expensive combat simulation is player-distance gated on the large Warfront so she cannot conduct an unseen mythic battle while the player is elsewhere. Lexi, DemonMythical and AncientDemonLord remain source-only.
- `?debug=1` adds **Lailani Field Test** and **Lailani AI Overlay** helpers.
- The existing Azrael projectile behavior is intentionally unchanged pending additional physical observation.

Physical iPhone Safari remains the visual/performance release gate. Use **Lailani Field Test** to watch her against the Axis patrol and evaluate whether the movement reads as graceful rather than jittery, whether Mantle remains beautiful/readable for its full minute, whether the seven attacks are visually distinguishable, and whether the Warfront remains smooth.


## v0.1.4.4.2 Living Warfront

Built directly from the approved **v0.1.4.4.1 Strongholds, Outposts & Environmental Detail** release. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`.

This pass populates the existing 6144×3072 Veil Warfront with **32 regular production actors total — 16 celestial and 16 infernal — without activating any named mythical character**. Strongholds and outposts gain bounded defenders, the Axis gains opposing patrols, and Pilgrim’s Ruin above The Unhoused gains a smaller opposing scout pair.

- Celestial population uses First-Light Sentinels and Heavenly Guardians only.
- Infernal population uses Abyss, Hellfire and Ashbone Ashwings, Fleshborn Ravagers, plus a small lesser-imp logistics guard where appropriate.
- Stronghold/rear/forward groups defend authored local territory; Axis and southern groups use authored patrol loops.
- Two data-driven `faction_clash` events wake opposing patrol sectors near the Axis and The Unhoused approach.
- Same-faction reinforcement assist remains capped at two nearby helpers and local radii; existing pursuit/leash and offscreen-sleep behavior remains intact.
- Warfront production population is deliberately **32**, below the proven 35-actor Cinder Wilds ceiling.
- **Lailani, Lexi, DemonMythical and AncientDemonLord remain source-only with zero runtime actors.**
- `?debug=1` adds a **Warfront Axis Clash** helper for direct physical-device testing.
- No common-unit ability definitions, Azrael logic, portals, save schema, Warfront geography, stronghold detail, or environmental FX budgets are retuned by this pass.

Physical iPhone Safari remains the release gate. In debug mode, use **Warfront Axis Clash** and then naturally walk the Axis, Riven Hold/Dawnward Hold, The Unhoused approach, and both strongholds. Verify that battles stay local, offscreen groups remain quiet, target switching works after deaths, and performance remains smooth.


## v0.1.4.4.1 Strongholds, Outposts & Environmental Detail

Built directly from the physically tested **v0.1.4.4.0.1 Warfront Visual Assembly Hotfix**. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`.

This pass keeps the approved 6144×3072 Warfront geography intact and gives each major location an authored environmental identity without introducing live Warfront armies or named mythical characters.

- **Infernal Stronghold** now reads as an occupied ancient fortress: captured heraldry, ritual altar, demonic war statue, bone remains, field fires and darkened vegetation reinforce its muster/ritual role.
- **Cinder Bastion** is a logistics/repair outpost with coherent supply stacks, smith equipment, racks, banners and repair fires instead of a miniature copy of the main fortress.
- **Riven Hold** is a damaged forward redoubt with a central war brazier, debris, bones, prison/fortification fragments and sparse field supplies.
- **Dawnward Hold** is a deliberately uncluttered sacred forward defense centered on a luminous relic and pale celestial banners.
- **Halo Bastion** is a rear sanctuary/supply node built around a complete ancient font, winter plants and celestial stores adjacent to the luminous channel.
- **Celestial Stronghold** now centers on a large ancient sanctuary font, ordered relic pedestals, pale banners, luminous orbs and frosted vegetation; it remains clearly ancient architecture occupied by Heaven rather than a newly built white castle.
- **The Unhoused** reuses curated blacksmith, woodshop and tailor props alongside crates, broken household pieces and dead timber so the ruined quarter reads as a lost civilian/workshop settlement rather than generic battlefield clutter.
- Six large visible centerpiece props receive explicit `landmark-prop` actor collision; small clutter remains visual-only so traversal is not over-blocked.
- Added six bounded world-space landmark pulse/fade effects. They use Graphics containers/tweens rather than a shader or unbounded particles, and scale around their local landmark origins.
- Authored environmental detail is guarded by an explicit **136-sprite ceiling** for the entire realm and **6 persistent detail-FX objects**. The existing 38 ambient world sprites remain unchanged.
- Warfront production army population remains **zero** in this release. v0.1.4.4.2 remains the planned Living Warfront population/faction-battle pass.

Physical iPhone testing should focus on whether each stronghold/outpost now reads as a distinct place, whether The Unhoused feels like a ruined civilian quarter, whether large centerpiece collision matches visible art, and whether the added detail/FX remain smooth while crossing the whole map.


## v0.1.4.4.0.1 visual assembly hotfix

This narrow hotfix restores the missing Axis crown pieces, uses a curated straight bridge instead of rendering the complete bridge authoring sheet, and replaces visibly disjoint cliff-source tiles with continuous ridge art. Warfront geometry, collision, portal behavior, actor population and combat systems remain unchanged.


Built directly from the physically tested **v0.1.4.3 Exploration, POIs & Portal Foundation**. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`.

## v0.1.4.4.0.1 Warfront Geography & Atmosphere Foundation

This release opens the first geography-only version of the dedicated **Veil Warfront** through the nested Veil Threshold portal. It intentionally builds the realm before populating it with armies or named mythical actors.

- Added a separate **6144×3072** Warfront map with eight non-overlapping local area identities, three broad east/west traversal bands, cross-routes, two main stronghold footprints, four forward/rear outpost footprints, the ruined neutral settlement **The Unhoused**, the southern **Veil Gate**, and the central **Axis of First Light**.
- The portal chain is genuinely nested: Cinder Wilds → Veil Threshold → Veil Warfront → exact Threshold origin → exact Cinder origin. Existing bounded return-stack/fallback rules remain unchanged.
- The Warfront uses newly curated runtime art from the already-preserved **LPC Revised 4-Season Terrain** source library: winter/non-winter dirt, winter/autumn mountain sheets, icy-water tile, water reflections and winter plants. Castle2, Dungeon Elements, Cave3, bridge and existing ruined-building assets provide ancient/occupied structure language.
- Celestial territory uses pale winter ground, luminous ice-water channels, reflective accents and cleaner ancient stone. Infernal territory uses darker non-winter earth, autumn cliff stone, dungeon/bone/fire occupation props and procedural fissures. The center deliberately mixes both palettes instead of using a hard biome border.
- The **Axis of First Light** uses a real six-piece Castle2 mystical tree/orb composition surrounded by layered procedural rings, eight collision-backed ancient pillars and a shallow luminous pool.
- Added three visible bridge crossings over a collision-backed celestial luminous channel. Stronghold walls, outpost walls, cliff shelves, deep water, ruined settlement structures and Axis pillars all use shared visible-source actor collision.
- Added a mobile-conscious **Warfront Ambient FX** layer: 38 bounded world-space mote/ember/rune-dust sprites, two rotating Axis Graphics rings, a pulsing Veil Gate field and four tiny distant-battle flashes. No permanent full-screen custom shader is used.
- No Warfront army spawns, mythic characters, territory capture or stronghold interiors are active yet. This pass is for physical scale, traversal, collision and atmosphere evaluation only. Existing Cinder/Refuge/First-Light combat population and balance remain unchanged.
- Debug mode adds **Map: Veil Warfront** for direct geometry testing while the natural Threshold portal remains the intended entry.

Physical iPhone testing should focus on travel distance, sightlines, bridge/water collision, stronghold/outpost scale, the Axis composition, ruined settlement spacing, portal round-trip behavior and whether the persistent ambience remains smooth/readable.

## v0.1.4.3 Exploration, POIs & Portal Foundation

This release adds the reusable exploration/travel layer needed before the dedicated celestial-vs-infernal warfront. It deliberately proves the architecture on the existing world rather than building the full warfront prematurely.

- Four small proof maps are now enterable: **Warden Hall**, **Torren’s Forge**, **Ashgrave Crypt**, and the mystical **Veil Threshold**.
- Warden Hall, Forge, Crypt, and Veil entries capture the player's exact source map/position. Their return exits use a bounded persisted return stack and fall back to safe authored entries when reached directly through debug tools.
- **10 POIs** seed exploration rewards and environmental storytelling across Cinder Wilds and the proof maps: caches, lore markers, a recovery waystone, a celestial reliquary, an ossuary cache, and the Veil Observatory. Cache state persists so rewards cannot be repeatedly harvested by saving/reloading.
- The first **dynamic world-event** definitions can wake authored encounter groups or initiate a local celestial/infernal clash without hard-coding those events into the map renderer.
- **Ashgrave Crypt** is the first intentionally small hostile interior, with three local actors and a guarded cache.
- **Veil Threshold** is only an antechamber/foreshadowing space. It does **not** implement the future Angel–Demon Warfront yet; the larger warfront remains a separate planned asset-audited map.
- Existing Wilds production population remains exactly **35 actors**. No Azrael, demon-family, celestial-family, faction-warfare, building, or artwork assets are modified by this release.
- The repository-root launcher remains a tiny `./dist/` redirect required by GitHub Pages and now preserves query/hash state, so root-level `?debug=1` survives the handoff; the startup regression test stays in the full check pipeline.

For physical verification, load the normal repository root first, then use `?debug=1` to test Warden Hall, Torren’s Forge, Ashgrave Crypt, Veil Threshold, and the Burnt-Hamlet Cache. Enter each location naturally when possible and verify its return exit places you back at the exact exterior entrance. Re-open caches to confirm they stay empty, test the Waystone cooldown, and re-check First-Light faction combat/Azrael after the exploration pass.

## v0.1.4.2.4.1 Faction Warfare Hardening

This release stress-hardens autonomous celestial/infernal combat before the future portal warfront. Normal Cinder Wilds remain capped at 35 spawned actors. When `?debug=1` is active, an additional eight Demon Legion reinforcements are instantiated in First-Light Scar so the existing four-role patrol becomes a 12-demon pressure force against the First-Light Sentinels, Heavenly Guardian and Azrael. The debug tray includes **Faction War Test** for direct placement.

Faction combat now has bounded nearby same-faction assist, local pursuit territory, stable committed basic-attack targeting, post-fight support healing, lost-target recovery and cancellation of melee/dash abilities whose required target disappears. These changes are intentionally reusable for later outposts and the dedicated angel-vs-demon portal battlefield.

Built directly from **v0.1.4.2.2 Demon Combat Foundation**. Save schema remains **2** and the localStorage key remains `hellrpg.ashfall.save.v1`.

## v0.1.4.2.3 Celestial Combat Foundation

This release activates the first ordinary celestial soldiers beneath Azrael while keeping the newly supplied named/mythical character sheets source-only for later handcrafted passes.

- **First-Light Sentinels** use `BaseAngel` as a reusable white-winged layered body and roll one of three coherent celestial soldier sets rather than random individual armor pieces.
- **Heavenly Guardian** uses the supplied fully armored `HeavenlyKnight` appearance as a fixed heavy common-angel archetype.
- The common family uses restrained holy abilities: **Radiant Strike**, **Lumen Bolt**, **Judgment Pulse**, and Guardian **Grace of Light** support healing. These effects are intentionally smaller/cleaner than Azrael's mythic kit.
- Faction-aware targeting is now shared across ordinary actors and pooled projectiles. Player/celestials are friendly; monsters/celestials are hostile. This allows autonomous angel↔demon combat without making common angels accidentally attack the player or receive player/Azrael friendly fire.
- First-Light Scar now fields **two Sentinels and one Guardian** around Azrael opposite the existing Demon Legion patrol. The total Wilds actor budget remains exactly **35**.
- Azrael remains a bespoke special actor. His controller and seven-skill definition are unchanged; his offensive targeting now safely excludes friendly common angels, while Sanctuary can heal them normally.
- `LailaniAngel`, `LexiAngel`, `DemonMythical`, and `AncientDemonLord` are preserved only as full source sheets. They are reserved for named/mythical bespoke combat passes and are not generic troop art.

For physical verification, use `?debug=1` and the **Near First-Light Sentinel / Near Heavenly Guardian** buttons. Confirm the player cannot hurt them, they do not attack the player, demons and angels engage each other when in range, Lumen Bolt stops on walls, the Guardian's heal supports friendly units, and ordinary celestial VFX remain visibly below Azrael's spectacle.

## v0.1.4.2.2 Demon Combat Foundation

This release gives the hand-only Demon Legion family a compact, data-driven combat identity without raising the established Cinder Wilds population budget or touching Azrael's seven-skill kit.

- **Abyss Ashwing (black)** now uses Demonic Rend, Abyss Bolt and Void Pulse: short claw pressure, a wall-blocked shadow projectile and a small readable radial burst.
- **Hellfire Ashwing (red)** uses Burning Rend, Hellfire Orb and Cinder Burst. Its fire abilities can apply a light Burn chance, giving the red variant a straightforward damage identity.
- **Ashbone Ashwing (tan)** uses Bone Rend, Soul Shard and Ashshock. Ashshock trades raw fire pressure for a wider bone/ash shockwave, knockback and a modest Stagger chance.
- **Fleshborn Ravager** is the first elite/heavy Demon Legion unit. It uses Flesh Rend, Blood Lance, Flesh Rupture and **Predator's Rush**, a short telegraphed wall-aware dash strike.
- Fleshborn visuals retain the supplied flesh body and orange wings, then roll one **complete curated armor preset** at spawn rather than mismatched individual parts. The first three coherent sets are Dread Warplate, Silver Legion and Steel Bastion; hands remain weapon-free for the claw-based kit and wings remain visible.
- Four demon projectile definitions are physical, dodgeable and `wallCollision: true`. Color/type identity is driven by shared ability/VFX data rather than four parallel combat systems.
- First-Light Scar's Demon Legion patrol now represents all four roles while the total Cinder Wilds budget remains exactly **35 ordinary enemy actor slots**. Existing spawns were rebalanced rather than increasing the mobile workload.
- `Enemy` supports weighted `loadoutPresets` for complete equipment sets and `dash_strike` line-of-sight gating. `AssetResolver` includes every possible preset dependency before the map is committed.
- Demon VFX are procedural and deliberately below Azrael-tier spectacle: compact claw arcs, bolts, bursts and rush trails use the existing pooled graphics system rather than additional heavy effect atlases.
- Refuge building geometry/integrity, Living Wilds encounter ecology, hostile-human factions, save schema and map dimensions/transitions remain intact.

For physical verification, use `?debug=1` and the **Near Abyss Demon / Near Hellfire Demon / Near Ashbone Demon / Near Fleshborn** buttons. Confirm projectiles stop on walls, the three color families read differently, Fleshborn armor sets remain coherent in motion, Predator's Rush never crosses a solid, and the mixed patrol can fight near Azrael without obscuring his mythic presentation.

## v0.1.4.2.1 Refuge Geometry & Building Integrity Hotfix

This is a narrow visual/collision repair prompted by physical iPhone testing. It preserves the v0.1.4.2 encounter ecology and fixes two Refuge presentation problems: building solids had drifted below their rendered sprites, and Torren’s Forge was still using a short facade-only workshop slice.

- All nine Refuge buildings now declare explicit rendered dimensions. Their actor-blocking rectangles are **derived from the same visible bounds** rather than separately hand-entered Y offsets, so collision stays on the structure instead of empty ground beneath it.
- Player and ordinary-enemy collision remain shared: a building blocks both actor classes in the same place, while player/enemy dynamic shoving stays disabled.
- Torren’s Forge now uses a **288×156 completed adobe workshop shell** assembled losslessly from the existing `adobe2-set` tiles plus the preserved 288×92 workshop facade. The original facade file remains untouched in the package.
- A dedicated `building-integrity-smoke.mjs` test checks every building solid stays inside and covers most of its rendered structure and verifies the completed Forge dimensions.
- Adjusted only the two town NPC route loops that crossed the newly corrected building footprints (Sable near East Lodge and Doran near Hunter House); the new smoke test also verifies NPC route segments do not pass through Refuge building solids.
- Living Wilds encounter groups, family tables, hostile-human loadouts, patrols, ambushes, 35-actor Wilds ceiling, Azrael controller/abilities/Sanctuary and save schema are unchanged.

For physical verification, enable `?debug=1`, walk around each Refuge building, and confirm the green solid overlays the visible building rather than the ground below it. Pay special attention to Torren’s Forge, Thread & Ash, Warden Hall and the houses along the south/east districts.


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