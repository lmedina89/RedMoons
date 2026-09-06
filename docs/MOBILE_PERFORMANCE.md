# Mobile Performance Considerations

- The internal render surface is 960×540 and scales responsively with pixel-art sampling.
- Phaser 3.90.0 is vendored, removing a runtime CDN request and version drift.
- The game requests high-performance rendering, disables antialiasing and rounds camera pixels.
- AI decisions run at roughly 9 Hz per nearby enemy rather than every rendered frame.
- Enemies beyond a 720-pixel activation radius stop expensive behavior; NPC routing also has a distance gate and lower update rate.
- Enemy spawn slots, damage numbers, hit sparks and loot are pooled and reused.
- The world uses one 32×32 tile layer. Decorative objects are camera-culled by Phaser.
- Player animation is frame-indexed without creating temporary animation objects in the loop.
- Save writes are event-driven plus a ten-second checkpoint, not performed every frame.
- Touch targets account for iPhone safe areas and shrink modestly on short landscape viewports.
- The page prevents document scrolling and limits `touch-action: none` to the game surface and direct controls; scrollable modal content retains vertical pan behavior.

Future larger zones should introduce spatial buckets and chunk-owned actor activation before increasing map dimensions substantially. Future projectile-heavy skills should use a capped projectile pool and per-skill collision masks.

