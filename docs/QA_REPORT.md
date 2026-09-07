# v0.1.2.4 QA report — World Streaming & Asset Hardening

Release focus: fix the issues found during physical iPhone testing and prove a scalable multi-map/asset-loading architecture without changing save schema 1 or destabilizing the v0.1.2.3 combat/content foundation.

## Confirmed repairs/features

- **Debug overflow:** diagnostics tray is safe-area bounded, one-row, horizontally swipeable and uses fixed-width buttons so the entire tool set remains reachable in iPhone landscape.
- **Goblin backwards presentation:** Ash Goblin Raider now declares its supplied sheet's real direction-row order instead of relying on the common LPC row convention.
- **Starter clothing:** new characters equip Wayfarer Shirt, Ashcloth Trousers, Hide Handwraps and Road Boots at Level 1 alongside the Ashen Arming Sword. Existing saves do not have their equipment choices overwritten.
- **Golem death:** shared optional death-animation support keeps a defeated enemy visible during its death frames; Ashstone Golem uses the supplied seven-frame death crop before hiding for respawn.
- **Separate map:** Ashfall Hollow is a 1024×768 map reached from the existing Cinder Region and can return through a matching exit.
- **Asset hardening:** map startup resolves a current-map asset package and item visuals can load on demand. Preserved source exports have been moved outside served `dist/` rather than deleted.

## Automated checks completed

- `npm run check` validates v0.1.2.4 shell/version identity and save schema 1.
- All runtime asset references resolve.
- Map registry contains the unchanged 2560×1280 Cinder Region plus 1024×768 Ashfall Hollow.
- Both transition directions resolve to valid destination maps and stable entry points.
- Hollow static collision is derived from its visible wall data and preserves the southern return opening.
- Enemy spawn regions are map-scoped; Mire Spider now has live Hollow placement.
- Per-map population caps remain mobile-conscious.
- Cinder's default asset package excludes Cave3; Hollow loads Cave3 and does not require Cinder town-building art.
- Hollow's default package is substantially smaller than Cinder's.
- New-character starter clothing references valid player-ready items in the correct slots.
- Legacy/current schema-1 saves without map fields normalize into Cinder Region.
- Existing saves with intentionally empty clothing slots remain empty after normalization.
- Goblin direction-row metadata and Golem death-sheet geometry are validated.
- Development source exports/workshop sheets are preserved outside `dist/` and are not silently deleted.
- Previous player-safe loot, collision, inventory recovery, four-hit combat geometry and equipment reference checks continue to pass.
- All JavaScript source files are checked with `node --check` before packaging.

## Environment limitation during automated browser launch

A local static server responds normally, but the available headless-browser environment blocks navigation to both localhost and file URLs with an administrative browser policy. Because of that environment restriction, this build does **not** claim a synthetic interactive browser playthrough. Static/resource validation and source-level lifecycle checks are complete; the physical iPhone pass remains authoritative for touch/Safari behavior.

## Physical iPhone regression checklist

1. Open the normal build and verify a **new game** visibly starts in shirt, trousers, handwraps and boots; confirm the sword still renders through all four combo attacks.
2. Load an older v0.1.2.3 save and verify level, ash, inventory, quests, position and existing equipment choices are preserved.
3. Open `?debug=1`; swipe the diagnostics tray horizontally from the first control to the last and confirm it does not push unreachable buttons beyond the safe area.
4. Teleport near Ash Goblin Raider. Approach from all four directions and confirm the Goblin visually faces the player while walking/chasing and attacking.
5. Kill Ashstone Golem and verify the collapse animation plays before the actor disappears; verify rewards/respawn still occur once.
6. Use **Map: Hollow** or travel to the Scorched Outskirts cave entrance. Press **Use**, verify fade/transition, and confirm the player arrives safely inside Ashfall Hollow rather than directly on the return trigger.
7. Fight Cave/Mire Spiders in Hollow and verify local movement, attack, loot and performance.
8. Walk to the southern Hollow opening, press **Use**, and verify return to Scorched Outskirts at the matching entry point.
9. Save while inside Hollow, refresh/reload the save and verify the game restores the Hollow map and a valid in-map player position.
10. Save after returning to Cinder, reload, and verify the Cinder position/map restores correctly.
11. In Hollow and Cinder, open Pack and equip gear that was not already visible nearby; confirm any lazy-loaded item art appears correctly rather than producing a missing texture.
12. Repeat several Cinder↔Hollow transitions and watch for duplicated listeners, duplicated toasts, stuck input, black screen, missing player art or steadily degrading performance.
13. Re-test Cinder Refuge collision and the east gate; no new invisible blockers should appear.
14. Run a 10–15 minute Safari session with combat, menus, map transitions and app switching to catch lifecycle/memory regressions.

## Release gate

v0.1.2.4 is ready to become the next baseline only after the physical-device checklist confirms the new transition, Goblin orientation, starter outfit, Golem death sequence and repeated Safari map switching behave correctly.
