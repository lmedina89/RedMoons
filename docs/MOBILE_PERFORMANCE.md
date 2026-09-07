## v0.1.2.4.1 transition memory policy

For reliability, destination textures may briefly coexist with the source-map package during travel. This temporary overlap is intentional: destination assets are verified first, the destination Scene is created, and only then are stale source-map textures released. The short-lived overlap trades a small transition-time memory peak for a much safer Safari lifecycle.

# Mobile Performance Considerations — v0.1.2.4.1

Hell RPG remains designed first around iPhone-landscape constraints rather than treating mobile optimization as a final cleanup pass.

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

When transitioning, the scene releases registered textures not needed by the destination package before restarting into the new map. This creates a foundation for much larger total world content without requiring every region to remain resident simultaneously.

## Next performance steps when needed

The current Cinder package is still the heaviest because multiple layered NPC/Skeleton loadout possibilities and player equipment share that map. Before very large content growth, useful next optimizations include:

- smaller/precomposed actor equipment atlases for fixed NPC/enemy loadouts;
- ref-counted shared texture ownership if multiple concurrent scenes are introduced;
- spatial buckets/chunk-owned actor activation for substantially larger exterior maps;
- capped projectile/particle pools for v0.1.3 skills and FX;
- audio decode/voice caps when the audio system arrives;
- physical-device Safari memory profiling after major asset milestones.
