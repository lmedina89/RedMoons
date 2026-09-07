# Known limitations — v0.1.2.4.2

## v0.1.2.4.2 validation note

The disappearing-player defect was observed on physical iPhone Safari and cannot be considered closed until repeated no-refresh Cinder ↔ Hollow travel passes on that device. Automated/static validation can prove the asset and recovery paths exist but cannot substitute for the WebKit release gate. The staged `Transformation.png` and Demon/Heavenly character sheets are source-only concepts; transformation mechanics and expanded action harvesting are deliberately deferred.

## Current gameplay/system limits

- Set definitions/names exist, but **set bonuses are not active yet**. They remain reserved for the later loot/progression milestone.
- Guild IDs and recruitable/adventurer NPC metadata are scaffolding only. Guild creation/joining, ranks, contribution, alliances, guild wars and sieges are not active yet.
- NPC adventurers do not yet fight, level independently or leave town; the shared skill/status framework planned for v0.1.3 is needed before that becomes meaningful.
- Skeletons can visually use legacy equipment whose animation coverage is sufficient for their current walk/single-slash behavior. This does not make every legacy item player-compatible.
- Carrion/Rotwing, Goblin, Spider and Golem families still use the shared basic melee AI. Distinct projectiles, charges, caster logic and status effects wait for the v0.1.3 shared skill/status framework.
- Building interiors are not enterable yet. v0.1.2.4 proves the separate-map architecture with Ashfall Hollow; later interiors can reuse the same system.
- Ashfall Hollow is intentionally a **small architecture/content proof**, not a finished dungeon. It has a cave presentation, walls, a return transition and a small Spider population but no dungeon quest/boss/unique loot loop yet.
- The first transition system is intentionally explicit **Use-to-enter** rather than automatic edge streaming.

## Animation/art limits

- Ashstone Golem uses its supplied seven-frame death sheet, currently mapped to the sheet's single verified collapse row for every facing.
- Starter Wayfarer/Ashcloth/Hide/Road clothing now uses revised full-combo-compatible presentation layers for walk, slash, one-handed slash, backslash and halfslash. The Level-1 item IDs/stats are unchanged; the physical iPhone release gate must still confirm the visual stack stays aligned in live play.
- The supplied Wolf source PSD remains inactive; its animation atlas needs a verified export/crop pass.
- Several user-supplied enemy/humanoid/building assets still require complete final attribution collection before store/commercial distribution. Development authorization does not replace upstream license obligations.

## Asset-loading limits

- v0.1.2.4 introduces map-scoped asset packages but the Cinder Region remains relatively heavy because it can display many layered NPC/Skeleton equipment combinations.
- Lazy equipment loading occurs when an unresident player item is equipped. A future loading-indicator polish pass may be useful if much larger files are introduced.
- Source art is preserved under `source-assets/` and intentionally excluded from the served `dist/`. It should not be deleted merely to reduce production package size.

## Collision note

The v0.1.2.2 visible-source collision rule remains authoritative. Do not reintroduce invisible decorative blockers. Actor collision proxies also must not use `setDisplaySize()` on the tiny `solid` helper before body sizing, because Arcade bodies inherit GameObject scale.