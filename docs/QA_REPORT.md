# v0.1.2.3 QA report — Asset & World Variety Expansion

Release focus: expand visual/content variety while preserving the proven v0.1.2.2 collision model, save schema 1, player-safe loot rules and mobile-conscious actor budget.

## Automated checks completed

- All runtime asset paths resolve and all JS/MJS files pass `node --check`.
- Project validator covers 16 enemy definitions, weighted Imp visual pools, Goblin/Spider/Golem frame population, six NPCs, player-safe loot, named-set scaffolding, save schema 1 normalization and the full four-hit protagonist/equipment animation geometry.
- All eight live full-combo Arming Sword presentation families (Ashen/Silver source plus Brass, Iron, Copper, Bronze, Steel, Ceramic and Gilded) are checked for real pixels in every required direction/action frame.
- New environment scenery is precomposed/cropped for runtime and creates no physics bodies.
- Static collision remains exactly five visible refuge wall segments + six visible building footprints; no additional collision was introduced by this variety pass.
- Cave/workshop source sheets remain staged and are excluded from mobile preloads.
- PSD authoring sources are excluded from `dist/assets`.

## Physical iPhone regression checklist

1. Load an existing v0.1.2.2 save and verify level, inventory, equipment, quests, ash and position.
2. Re-test Cinder Refuge center and east exit first. No new scenery should create a force field or hidden blocker.
3. Use `?debug=1` and confirm the cyan player footprint remains compact; static green boxes should still correspond only to visible walls/buildings.
4. Use **Add Gear Test Set** and equip every Arming Sword material. Run the full four-hit combo facing up/left/down/right and watch for missing weapon frames.
5. Visit Cinder, Blight and Blueflame Imps repeatedly and verify color/loadout combinations remain stable for one life and reroll on respawn.
6. Visit Ash Goblin Raider and verify walk + attack facings in all four directions.
7. Visit Cave/Ember/Paleweb/Mire Spider variants and verify all four-direction movement/attacks; Mire is debug-only until a matching biome exists.
8. Visit Ashstone Golem and verify its larger 64×96 attack frames do not jump, crop or reverse vertical facing.
9. Pull mixed enemy groups and watch for frame drops, stuck AI, excessive overlap or any return of physical player shoving.
10. Kill/respawn Skeleton families repeatedly; verify the expanded material sword pool and older NPC equipment produce noticeably varied soldiers.
11. Walk the whole current map and confirm new bushes, mushrooms, Adobe-2 details and pine scenery render cleanly without blocking movement.
12. Save/reload after obtaining one of the new sword materials and verify it remains equipable/rendered correctly.
13. Fill inventory and repeat Drop/Destroy/quest-item protection regression.
14. Run a 10–15 minute Safari session with movement + combat + app switching to catch lifecycle/performance regressions.

## Known manual-only areas

Exact visual taste, iPhone touch feel, Safari lifecycle behavior, sprite layering and sustained GPU/memory behavior remain physical-device checks. The Wolf PSD is intentionally not live until its irregular source atlas receives a verified normalization pass.
