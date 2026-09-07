# Mobile Performance — v0.1.4.1

## v0.1.4.1 larger-map and asset-reuse budget

The Wilds canvas increases to 6400×2048 and Refuge becomes 2048×1536, but the renderer still uses inexpensive repeated/tinted sprites and bounded static geometry rather than allocating one giant bitmap. The update intentionally keeps live enemy population counts at their inherited level while map scale is field-tested. Local-area identity remains rectangle metadata.

The source workshop sheets are intentionally **not** added to runtime preload. Seven small transparent crops provide the forge/tool/woodworking/textile details needed by Refuge. Existing runtime terrain/castle/dungeon/cave/building/vegetation textures are reused across compositions instead of duplicating recolored sheets for every biome. Map-scoped asset packages ensure Refuge does not preload cave art merely because the project owns it, while the Wilds can reuse the broader world palette where useful.

World decorations are predominantly static Images/Sprites; only traversal-relevant geometry receives Arcade static bodies. Cinderwood screening uses bounded sprite clusters rather than dynamic emitters. First-Light environmental geometry is static; Azrael's existing bounded FX budget is unchanged.

Session-retained texture caching remains deliberate for Safari transition stability. Because visiting more maps can retain more textures in-session, physical testing after Refuge → Wilds → Hollow → Wilds → Refuge remains the memory/performance release gate. Future texture eviction should only be reconsidered with explicit WebKit transition tests.


## v0.1.4.0 navigation cost policy

The world-collision repair uses Phaser Arcade's existing broadphase/static-group collision plus tiny per-enemy steering state. It does not allocate a nav grid, run A* every think tick, or increase live monster counts. Area identity is rectangle metadata and the new visual landmarks use a handful of persistent Graphics commands. This keeps the pass appropriate for iPhone-first testing while leaving a clean upgrade path if future dungeon complexity requires pathfinding.


## Azrael field-test budget

The full 832×3456 Azrael authoring sheet is never preloaded by gameplay. The Cinder package loads compact 64×64 action crops only (spellcast, thrust, slash, shoot, hurt, idle, jump, emote, run, combat-idle, backslash and halfslash). The full source stays under `source-assets/`.

Azrael's frequent light/glide particles reuse the existing `FxManager` sprite pools. Sanctified Nova and Seraphic Judgment add only bounded, short-lived Graphics/tweens plus pooled spark bursts; Seraphic uses three scheduled pulses rather than persistent emitters. Sanctuary of the First Light adds one bounded 5.6-second Graphics field plus four scheduled pulses. All four major invocations share pacing and individual cooldowns. Judgment Blast uses the shared fixed projectile pool (44 entries in this build). Screen shake is distance-gated against the player's position, so distant autonomous fighting does not repeatedly shake the camera.

Enemy simulation remains player-distance-gated; Azrael's test home is intentionally inside the normal Scorched Outskirts activity area so the user can observe him without expanding the global AI budget. His visual glide crosses low terrain props instead of adding pathfinding or expensive obstacle avoidance. True aerial navigation is deferred.

The release gate remains physical iPhone Safari. Stress the build around repeated Sanctified Nova/Seraphic Judgment cycles, wounded-target Sanctuary casts, clustered Heavenfall casts, repeated Judgment projectiles, several simultaneous enemies, camera shake on/off, Safari background/return and a 10–15 minute continuous fight. Watch for Graphics/tween accumulation, WebAudio loss, frame pacing changes and projectile/particle leftovers.



The recovery release adds no new texture atlases or source art to the runtime preload. Recovery markers/FX are procedural Phaser graphics, audio uses the existing procedural WebAudio manager, and consumables are data/inventory entries. Stackable supplies reduce inventory DOM/card pressure compared with one instance per flask. Passive recovery performs only a small nearby-hostile scan using the already bounded active enemy set and does not introduce a separate high-frequency timer.

The existing map-scoped loading/session-cache policy remains unchanged. Physical iPhone Safari remains the performance gate; include repeated combat, potion spam, merchant open/close, Cinder↔Hollow transitions and background/return in the 10–15 minute stress pass.

## v0.1.2.4.3 transition memory/lifecycle policy

Map assets remain **lazy by first visit**, but textures already loaded during the current browser session are retained. Physical iPhone Safari testing showed that eager TextureManager eviction during Phaser Scene restarts could leave the newly constructed player layer stack without usable textures even though the map itself rendered. Current two-map memory remains manageable, so reliability takes precedence over aggressive eviction in this hotfix. A later cache-eviction policy must be device-tested behind a clean scene handoff before reintroduction.

Hell RPG remains designed first around iPhone-landscape constraints rather than treating mobile optimization as a final cleanup pass.

## v0.1.3.1 combat/runtime policy

Combat growth is bounded rather than allocation-heavy. `ProjectileManager` owns a fixed **40-sprite projectile pool**; `DamageNumberPool` reuses 28 text objects; `FxManager` preallocates small reusable impact/trail sprite pools and only uses short-lived Graphics objects for larger rings/telegraphs. Enemy decision work remains throttled and distance-gated. Temporary statuses and cooldowns are runtime-only and are not written into every save checkpoint.

The run/spellcast/thrust/shoot/hurt art is stored as compact action crops instead of preloading the original 832×3456 LPC authoring sheets; the Spearman's oversized 192px thrust sheet is loaded only with the Cinder package that can spawn him. Only the player/current gear and actors available on the active map enter its asset package. This keeps the new animation vocabulary compatible with the map-scoped loading rule.

`AudioManager` currently synthesizes short SFX with WebAudio rather than decoding a large sound library. It is gesture-unlocked and throttles repeated sound IDs. Physical iPhone testing still needs to confirm Safari background/resume behavior before this foundation is considered polished.

## Existing runtime discipline

- Internal render surface is 960×540 and scales responsively with pixel-art sampling.
- Phaser 3.90.0 is vendored, removing a runtime CDN request and version drift.
- Rendering requests high-performance mode, disables antialiasing and rounds camera pixels.
- AI decisions are throttled rather than evaluated at full render frequency for every actor.
- Distant actors use activation-range early-outs.
- Spawn actors, damage numbers, hit sparks and loot are pooled/reused where the existing systems support it.
- Save writes are event-driven plus a periodic checkpoint rather than occurring every frame.
- Touch controls account for iPhone safe areas.

## Why asset streaming was added now

The v0.1.2.3 audit found that the project ZIP was small, but compressed PNG size was a misleading measure of runtime texture cost. The global registry contained 180 preloaded textures: roughly 1.95 MB as PNG files but about 161 MiB of theoretical decoded RGBA pixel data before browser/Phaser overhead.

v0.1.2.4 therefore stops treating `ASSET_DEFS` as one mandatory preload batch.

`AssetResolver` builds the required package for the **current map** from:

- that map's world-art keys;
- the player base and currently equipped visuals;
- enemy definitions that can spawn on that map, including their possible layered loadouts;
- NPC definitions that belong to that map and their possible layered loadouts.

The default v0.1.2.4 state resolves approximately:

- **Cinder Region:** 138 textures, ~1.54 MB compressed PNG data, ~131.7 MiB theoretical decoded RGBA.
- **Ashfall Hollow:** 21 textures, ~0.23 MB compressed PNG data, ~15.4 MiB theoretical decoded RGBA.

Those decoded figures are conservative pixel-area estimates, not a measurement of final Safari process memory, but they make the scaling problem visible.

## Lazy equipment visuals

Player-ready equipment that is not already in the current map package can be loaded when the player chooses to equip it. This is important because equipment sheets—not world scenery—currently represent most of the potential texture footprint.

Future item growth should continue using compact action-specific runtime crops where possible rather than shipping full generator/source atlases as runtime textures.

## Source versus runtime assets

Original/export/source artwork is valuable development material and is **not deleted**. In v0.1.2.4 it is preserved outside the served game under `source-assets/` instead of `dist/assets/source-exports/`.

This distinction matters:

- `source-assets/` = development library/provenance/future harvesting;
- `dist/assets/` = curated assets intended to be served by the live game;
- `dist/assets/licenses/` = runtime/distribution credit and license records.

Moving a source file out of `dist/` does not mean losing it.

## Multi-map growth rule

Do not solve world expansion by continually increasing the Cinder Region dimensions. Caves, dungeons, interiors, distant regions, guild spaces and major future towns should normally be separate maps with map-owned actor and texture packages.

When transitioning, the destination package is loaded only when needed. In v0.1.2.4.3, the v0.1.2.4.2 policy remains: textures already visited during the current browser session remain cached instead of being evicted during the Phaser Scene restart, because physical iPhone testing exposed a WebKit-sensitive player-visual failure at that boundary. This still prevents *unvisited* regions from loading up front. A later bounded cache/eviction layer can be reintroduced only after it passes the same physical-device transition gate.

## Next performance steps when needed

The current Cinder package is still the heaviest because multiple layered NPC/Skeleton loadout possibilities and player equipment share that map. Before very large content growth, useful next optimizations include:

- smaller/precomposed actor equipment atlases for fixed NPC/enemy loadouts;
- ref-counted shared texture ownership if multiple concurrent scenes are introduced;
- spatial buckets/chunk-owned actor activation for substantially larger exterior maps;
- continue profiling the fixed projectile/FX pools as encounter density grows;
- add recorded-audio decode/voice caps when curated sound assets replace/augment procedural SFX;
- physical-device Safari memory profiling after major asset milestones.
## v0.1.3.1 polish notes

True-run sheets are compact action crops and load only with the active player/equipment package. The Bone Spearman replaces one generic Skeleton spawn, so the Cinder-region population cap does not increase. Procedural Pulse FX remain short-lived and are not persistent particle emitters.

## Sanctuary of the First Light budget

The sanctuary adds no runtime image asset. Its 5.6-second field is one short-lived `Graphics` object redrawn at a bounded 50ms cadence; four healing pulses reuse the existing FX sprite pools and short-lived Graphics rings/beams. Only eligible actors already returned by `friendlyCombatants()` are checked, so healing work scales with the tiny friendly actor set rather than total world population.
