# Mobile Performance Considerations

- The internal render surface is 960×540 and scales responsively with pixel-art sampling.
- Phaser 3.90.0 is vendored, removing a runtime CDN request and version drift.
- The game requests high-performance rendering, disables antialiasing and rounds camera pixels.
- The v0.1.1.1 LPC generator exports can be very large (for example 832×3456 plus oversized weapon sheets). Gameplay does **not** preload those complete source exports. Only the required animation bands are cropped into `dist/assets/player/revised/`; full exports remain preserved under `dist/assets/source-exports/` for provenance.
- The renderer switches among small action-specific textures rather than decoding/retaining every unused LPC animation row in GPU memory.
- Player animation is frame-indexed from immutable geometry/sequence data without creating temporary animation objects in the update loop.
- AI decisions run at roughly 9 Hz per nearby enemy rather than every rendered frame.
- Enemies beyond a 720-pixel activation radius stop expensive behavior; NPC routing also has a distance gate and lower update rate.
- Enemy spawn slots, damage numbers, hit sparks and loot are pooled and reused.
- The world uses one 32×32 tile layer. Decorative objects are camera-culled by Phaser.
- Save writes are event-driven plus a ten-second checkpoint, not performed every frame.
- Touch targets account for iPhone safe areas and shrink modestly on short landscape viewports.
- The page prevents document scrolling and limits `touch-action: none` to the game surface and direct controls; scrollable modal content retains vertical pan behavior.

Future larger zones should introduce spatial buckets and chunk-owned actor activation before increasing map dimensions substantially. Future projectile-heavy skills should use a capped projectile pool and per-skill collision masks. Enemy equipment in v0.1.2 should reuse shared weapon textures rather than loading duplicate textures per enemy instance.

## v0.1.2 variety budget

New full LPC source exports are never preloaded directly. Runtime uses only cropped walk/slash or required full-combo regions. Skeleton equipment reuses already-loaded layered textures instead of baking a unique sheet per loadout. Enemy AI retains the existing active-range early-out, and the initial world-variety population is intentionally kept to a few dozen actors rather than MMO-scale counts.

## v0.1.2.3 variety budget

The content-variety pass keeps the live baseline enemy population capped by validation rather than loading every available source variant. Large PSD/source archives are excluded from `dist/assets`; runtime enemies use cropped PNG sheets, and cave/workshop source sheets are not preloaded until needed. Decorative variety does not add physics bodies. Expanded sword materials reuse identical animation geometry, and pine art is precomposed into two small runtime images rather than assembling the source tilesheet every frame.
