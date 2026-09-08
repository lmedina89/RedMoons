# Known Limitations — v0.1.4.2.2

## v0.1.4.2.2 Demon Combat Foundation limits

- Demon skills are the first faction-family combat pass, not final faction balance. Cooldowns, damage, Burn/Stagger chances and Fleshborn pressure remain subject to physical iPhone tuning.
- Common demon effects intentionally use compact procedural VFX. They should remain visually subordinate to Azrael and future named mythical beings rather than becoming screen-filling boss effects.
- Fleshborn currently rolls among three curated complete armor presets. Additional high-tier sets should be admitted only after animation/wing-clipping verification; arbitrary per-slot randomization is intentionally avoided.
- The full RedDemon, TanDemon and DemonLordFlesh concept sheets are user-provided project source art whose exact upstream license/credit records are not present in the repository. Their compact runtime derivatives remain **development-authorized / attribution hold** until provenance is resolved before commercial/store release.
- Lesser angels still do not have their planned Celestial Ability Family in this release. That mirrored holy melee/ranged/AoE/support foundation is a subsequent faction-combat pass; Azrael remains the only live showcase-tier celestial combatant.
- Named mythical demons and the user's additional named mythical angels remain future bespoke content. Ordinary family abilities are not intended to approximate that power tier.
- Physical iPhone Safari remains the release gate for dash feel, wall interaction, Fleshborn composite animation, mixed First-Light readability and performance.

## v0.1.4.2.1 hotfix limits

- This hotfix corrects Refuge building geometry only; it does not add enterable interiors or redesign the v0.1.4.2 encounter ecology.
- Physical iPhone Safari remains the release gate for visual alignment and touch traversal around the repaired buildings.

## v0.1.4.2 Living Wilds limits

- Encounter ecology is a first systemic pass, not final population balance. The 35-slot Wilds budget is deliberately conservative and should be tuned only after physical iPhone traversal/combat testing.
- Group coordination currently means local aggro sharing plus authored patrol movement; there is no tactical formation solver, squad cover system, healer AI, flanking planner or shared threat table yet.
- Ambush enemies use proximity wake/dormancy rather than bespoke burrow/climb/invisibility animations. Their presentation should be judged on device before more ambush archetypes are added.
- Hostile-human equipment is faction-coherent but intentionally limited to currently verified NPC-compatible LPC layers. Hair/face variation and broader civilian clothing pools can expand later as compatible runtime layers are verified.
- `Assassin.png` and `DemonBase.png` now contribute compact development runtime crops. Exact source-license/attribution records for those user-provided concept sheets are not present in the project and remain on attribution hold before commercial/store release.
- First-Light Scar currently introduces hostile Demon Legion scouts but still does **not** add lesser friendly celestial soldiers. Azrael remains the only live celestial combatant in this milestone.
- Full browser automation could not be executed in the current build container because Chromium navigation is administrator-blocked; physical iPhone Safari remains the release gate.

## v0.1.4.1 expansion/rebuild limits

- This is the first large composition pass, **not** a claim that every Cinder location is final art. The purpose is to approve scale, separation, map transitions and a stronger Refuge before deeper POI/encounter population.
- The nine Refuge buildings are exterior structures only. Interior source art is being preserved/considered, but full enterable shop/home/interior maps are deliberately deferred until the exterior map split is physically stable.
- The 6400×2048 Wilds are larger, but not intended to be the project's eventual giant holy-vs-demonic warfront. That future map can be separate and substantially more faction-driven once world streaming and encounter families mature.
- Monster-family weights/group archetypes remain metadata. Current live populations are intentionally bounded; coordinated patrol/guard/ritual/ambush group AI is still future work.
- Sightline screens are authored with vegetation/ruins/rock shelves, but only explicit visible solids block actors. Some decorative tree/rock sprites can therefore be walked through by design.
- Navigation remains the lightweight v0.1.4.0 obstruction steering layer, not a navmesh/A*. The larger open map is designed around that constraint.
- The newly curated blacksmith/woodshop/tailor runtime crops come from preserved user-supplied workshop source sheets whose exact matching attribution records are not currently present in the project. They are acceptable for this user-authorized development build but remain on attribution hold for commercial/store release.
- Azrael's combat is frozen; only his home placement moved with First-Light Scar.
- Physical iPhone Safari remains the release gate for the subjective scale/readability goal and for real transition/memory/frame-pacing behavior.


## v0.1.4.0 world-foundation limits

- The new obstruction behavior is lightweight wall-follow/disengage steering, **not** full A* pathfinding. It is intended for the current open Cinder Region/Hollow geometry and must be physically tested around long walls, corners and the Fallen Watch gaps before more maze-like dungeons are authored.
- Only visible traversal-relevant geometry is solid. Decorative rocks, vegetation, graves and most scenery remain nonblocking on purpose; invisible decorative blockers are still prohibited.
- Fallen Watch and Ashgrave are first-pass spatial identities, not finished handcrafted zones. Their richer props, encounter compositions, secrets, rewards and story hooks belong in subsequent v0.1.4.x passes after collision behavior is approved.
- Monster-family weights and encounter-group archetypes are metadata foundations. Current live spawns remain the v0.1.3.x population and do not yet form coordinated patrol/guard/ritual/ambush AI groups.
- No current enemy is allowed to phase through static solids. A future ghost/ethereal actor must opt in explicitly and should receive clear presentation so wall traversal reads as an ability.
- Azrael remains mechanically frozen from the physically approved v0.1.3.2.4 build. First-Light Scar changes his surrounding ground identity only; his permanent narrative location is still TBD.
- Physical iPhone Safari testing remains the release gate for actual Arcade separation, steering feel, corner behavior, frame pacing and readability. Automated tests cannot prove a live touch/physics playthrough.


## v0.1.3.2.4 celestial-expansion limits

- Azrael's Scorched Outskirts placement is **temporary QA staging**, not final story canon. Dialogue, quest role and permanent location remain intentionally undefined.
- His current halo/wing seal is a procedural nameplate motif/reserved emblem slot, not the final bespoke SVG celestial crest.
- Azrael visually hovers/glides but does not use full aerial pathfinding. His compact proxy stays world-bounded and intentionally crosses low terrain props to avoid ground-walker snagging during this test.
- The current seven-skill kit is still field-test balance. Sanctified Nova and Seraphic Judgment are intentionally frequent, Heavenfall intentionally rare, and all timings remain subject to physical-device tuning. Selected concepts may later inspire player endgame holy-route skills, but Azrael's strongest signature presentation should remain uniquely mythic.
- Enemy threat/aggro is still deliberately lightweight; there is no formal taunt/threat table yet. Monsters select the nearest valid faction-hostile candidate within their existing detect/leash rules.
- Contribution-gated shared kills use a recent-damage window/threshold rather than a full multiplayer-style contribution ledger. It exists to prevent Azrael AFK farming, not to define final companion reward design.
- `Assassin.png` is still source-only. The hostile Assassin archetype/AI is not spawned in v0.1.3.2.4 so Azrael can be evaluated against already-understood enemy behavior.
- Physical iPhone Safari validation is still required for live animation timing, screen-shake feel, effect density, WebAudio resume and autonomous AI behavior.


## Inherited HUD/recovery limits

- The radial/fan HUD is validated structurally and remains subject to physical iPhone Safari feel/readability testing.
- `Combat Ranges` is diagnostics-only and is available only under `?debug=1`; normal builds keep combat/collision overlays off.

- Recovery balance is foundation tuning, not final economy balance. Flask prices, drop rates, cooldowns and passive regeneration should be adjusted after longer physical-device/dungeon playtests.
- Cinder Rations are intentionally interrupted by combat and are not a combat-healing substitute. There is no antidote/cleanse consumable, resurrection item or dedicated **player** healing skill yet.
- Ilyan has a fixed three-item foundation stock; buyback, quantity selectors, rotating stock and richer shop UX are future work.
- Quick recovery buttons currently target fixed HP/Essence item IDs rather than a configurable consumable hotbar.
- Active food/cooldown timers are runtime state and are not persisted through a page reload; persistent inventory quantities are saved.
- Map presentation remains intentionally simple until combat/recovery systems are validated, so Ashfall Hollow is still a systems test space rather than the final dungeon presentation.

## v0.1.3.1 validation note

v0.1.3.1 is built from the physical-iPhone-validated v0.1.3 combat baseline. Automated checks validate content references, expanded LPC crop geometry/alpha, schema-1→2 normalization, combat-system wiring, projectile/status registries and the existing world/collision invariants. The new combat behavior still requires physical iPhone Safari validation; a static validator cannot prove touch timing, live Phaser collisions, WebAudio resume behavior or combat readability.

## Current combat limits

- The first player skill set is intentionally only **Ember Cleave, Ashen Guard and Ruin Pulse**. Rank 1–5 storage/scaling hooks now exist, but there is still no player-facing upgrade/spending UI, respec, trainer or larger configurable skill library; level gates continue to prove unlock persistence and slot UI.
- Bone Archer uses a real compact LPC bow+arrow shoot overlay. Gravecaller uses the real Skeleton **spellcast body action** plus procedural shadow FX, but a verified staff spellcast overlay is still deferred rather than faked.
- Bone Spearman thrust AI is active in v0.1.3.1 with a visible preserved long-spear overlay, data-driven thrust melee, and telegraphed Bone Lunge. Player combat-stance art remains deferred until a complete compatible stance/equipment set is verified rather than guessing at source rows.
- Burn, Poison, Slow, Guard and Stagger are the only live statuses. Bleed/freeze/curse/holy vulnerability and richer stacking/resistance rules are future content.
- Combat SFX are a lightweight procedural WebAudio foundation. Curated recorded sword/impact/UI packs and music are not part of this milestone.
- Hurt reactions are short and do not make every hit a hard interrupt. Stagger is the explicit control effect, with an immunity window to prevent permanent stun-lock.
- Existing Carrion/Rotwing, Goblin and Spider families still mostly use shared melee behavior; v0.1.3.1 retains the five original proof enemies and adds the Bone Spearman needed to exercise projectile/caster/AOE systems.
- Set bonuses remain inactive. Guild systems remain scaffolding only. NPC adventurers do not yet fight/level independently.

## World/content limits

- Cinder Region and Ashfall Hollow deliberately keep their v0.1.2.4.3 layouts. Major map beautification/encounter redesign waits until the new combat has been device-tested so future arenas can be shaped around projectiles, telegraphs and AOE spacing.
- Building interiors are not enterable yet. Ashfall Hollow remains a small architecture/combat test map, not a finished dungeon quest/boss/unique-loot loop.
- The first transition system remains explicit **Use-to-enter** rather than automatic edge streaming.
- `Transformation.png` and the Demon/Heavenly character sheets remain preserved source-only. Transformation gameplay is intentionally deferred until the combat foundation is stable.

## Animation/art limits

- Player base and the Level-1 starter outfit have verified compact run/spellcast/thrust/shoot/hurt crops. Most older equipment does **not** yet have those expanded actions; safe fallback keeps unsupported armor static and hides unsupported weapon/shield layers during special actions. Selected legacy gear can be migrated later using the starter-gear pipeline.
- Ashstone Golem uses its supplied seven-frame death sheet mapped to the single verified collapse row for every facing.
- The supplied Wolf source PSD remains inactive until its irregular atlas receives a verified export/crop pass.
- Several user-supplied/source assets still require final attribution/license verification before store/commercial distribution. Development authorization does not replace upstream obligations.

## Asset-loading limits

- v0.1.2.4 introduces map-scoped asset packages but the Cinder Region remains relatively heavy because it can display many layered NPC/Skeleton equipment combinations.
- Lazy equipment loading occurs when an unresident player item is equipped. A future loading-indicator polish pass may be useful if much larger files are introduced.
- Source art is preserved under `source-assets/` and intentionally excluded from the served `dist/`. It should not be deleted merely to reduce production package size.

## Collision note

The v0.1.2.2 visible-source collision rule remains authoritative. Do not reintroduce invisible decorative blockers. Actor collision proxies also must not use `setDisplaySize()` on the tiny `solid` helper before body sizing, because Arcade bodies inherit GameObject scale.