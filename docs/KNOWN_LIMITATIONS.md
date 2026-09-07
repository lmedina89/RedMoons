# Known limitations — v0.1.3

## v0.1.3 validation note

v0.1.3 is built from the physical-iPhone-validated v0.1.2.4.3 map/save baseline. Automated checks validate content references, expanded LPC crop geometry/alpha, schema-1→2 normalization, combat-system wiring, projectile/status registries and the existing world/collision invariants. The new combat behavior still requires physical iPhone Safari validation; a static validator cannot prove touch timing, live Phaser collisions, WebAudio resume behavior or combat readability.

## Current combat limits

- The first player skill set is intentionally only **Ember Cleave, Ashen Guard and Ruin Pulse**. There is no skill tree, respec, trainer, skill-level progression or configurable skill library yet; level gates simply prove persistence and slot UI.
- Bone Archer and Gravecaller use real LPC Skeleton **shoot/spellcast body actions** plus real world projectiles/FX, but dedicated bow/quiver/staff equipment layers are not yet harvested into the runtime. We intentionally did not fake an invisible weapon or load the full source library.
- Skeleton Spearman-specific thrust AI is deferred to v0.1.3.1 even though shared thrust animation support now exists.
- Burn, Poison, Slow, Guard and Stagger are the only live statuses. Bleed/freeze/curse/holy vulnerability and richer stacking/resistance rules are future content.
- Combat SFX are a lightweight procedural WebAudio foundation. Curated recorded sword/impact/UI packs and music are not part of this milestone.
- Hurt reactions are short and do not make every hit a hard interrupt. Stagger is the explicit control effect, with an immunity window to prevent permanent stun-lock.
- Existing Carrion/Rotwing, Goblin and Spider families still mostly use shared melee behavior; v0.1.3 specializes only the five proof enemies needed to exercise projectile/caster/AOE systems.
- Set bonuses remain inactive. Guild systems remain scaffolding only. NPC adventurers do not yet fight/level independently.

## World/content limits

- Cinder Region and Ashfall Hollow deliberately keep their v0.1.2.4.3 layouts. Major map beautification/encounter redesign waits until the new combat has been device-tested so future arenas can be shaped around projectiles, telegraphs and AOE spacing.
- Building interiors are not enterable yet. Ashfall Hollow remains a small architecture/combat test map, not a finished dungeon quest/boss/unique-loot loop.
- The first transition system remains explicit **Use-to-enter** rather than automatic edge streaming.
- `Transformation.png` and the Demon/Heavenly character sheets remain preserved source-only. Transformation gameplay is intentionally deferred until the combat foundation is stable.

## Animation/art limits

- Player base and the Level-1 starter outfit have verified compact spellcast/thrust/shoot/hurt crops. Most older equipment does **not** yet have those expanded actions; safe fallback keeps unsupported armor static and hides unsupported weapon/shield layers during special actions. Selected legacy gear can be migrated later using the starter-gear pipeline.
- Ashstone Golem uses its supplied seven-frame death sheet mapped to the single verified collapse row for every facing.
- The supplied Wolf source PSD remains inactive until its irregular atlas receives a verified export/crop pass.
- Several user-supplied/source assets still require final attribution/license verification before store/commercial distribution. Development authorization does not replace upstream obligations.

## Asset-loading limits

- v0.1.2.4 introduces map-scoped asset packages but the Cinder Region remains relatively heavy because it can display many layered NPC/Skeleton equipment combinations.
- Lazy equipment loading occurs when an unresident player item is equipped. A future loading-indicator polish pass may be useful if much larger files are introduced.
- Source art is preserved under `source-assets/` and intentionally excluded from the served `dist/`. It should not be deleted merely to reduce production package size.

## Collision note

The v0.1.2.2 visible-source collision rule remains authoritative. Do not reintroduce invisible decorative blockers. Actor collision proxies also must not use `setDisplaySize()` on the tiny `solid` helper before body sizing, because Arcade bodies inherit GameObject scale.