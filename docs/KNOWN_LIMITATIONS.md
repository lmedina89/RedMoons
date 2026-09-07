# Known limitations — v0.1.2.3

- Set definitions/names exist, but **set bonuses are not active yet**. They are reserved for the later loot/progression milestone.
- Guild IDs and recruitable/adventurer NPC metadata are scaffolding only. Guild creation/joining, ranks, contribution, alliances, guild wars and sieges are not active yet.
- NPC adventurers do not yet fight, level independently or leave town; the shared skill/status framework planned for v0.1.3 is needed before that becomes meaningful.
- Skeletons can visually use legacy equipment whose animation coverage is sufficient for their current walk/single-slash behavior. This does not make those pieces player-compatible.
- Carrion/Rotwing enemies currently share the existing melee AI state machine; unique family skills/status effects are deferred to v0.1.3.
- Building interiors are not enterable yet. The refuge buildings are exterior world structures with collision footprints.
- The supplied v0.1.2 enemy/humanoid/castle art does not yet have complete final attribution records in the project. It is authorized by the user for development/testing but remains a release-readiness item before store/commercial distribution.
- The player starter clothing pool still lacks a complete full-combo low-level clothing set, so visible equipment progression remains more convincing after the first compatible armor drops.


## v0.1.2.2 collision note

Actor collision proxies now use unscaled 2x2 helper sprites with compact foot-area Arcade bodies. Do not reintroduce `setDisplaySize()` on `solid` actor proxies before `body.setSize()`, because Arcade body dimensions inherit GameObject scale.

## v0.1.2.3

- The Wolf source PSD is intentionally not active yet; its animation atlas needs a verified export/crop pass.
- Mire Spider is defined and runtime-ready but not placed in the current three-zone map; it is reserved for a later wet/cave biome rather than overcrowding Bone Road.
- Cave and workshop sheets are staged assets, not enterable interiors/dungeons yet.
- Goblin, Spider and Golem currently use the existing simple melee AI. Distinct ranged/caster/charge/status behaviors wait for the shared v0.1.3 skill/status framework.
