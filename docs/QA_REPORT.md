# v0.1.2.4.1 QA report — Map Streaming & Save Menu Hotfix

Release focus: repair the Safari live-map handoff found during physical iPhone testing and make new/continue/load behavior explicit without changing save schema 1 or widening gameplay scope.

## Physical-device issue that triggered this hotfix

On v0.1.2.4, the user could enter Ashfall Hollow and return to Cinder, but the world could appear blank until Safari was refreshed. The HUD remained alive, and a refresh then rendered the correct saved map. That strongly isolated the fault to the live Phaser texture/Scene handoff rather than map IDs, entry points or persisted map state.

## Repair

- The source map remains intact while the destination package is requested.
- `prepareMapAssets(...)` dynamically loads every texture required by the destination map and verifies that each key exists in Phaser's TextureManager.
- Only after successful preparation does WorldScene commit `mapId`, `entryPointId` and destination coordinates.
- WorldScene then fades/restarts.
- Registered textures no longer needed by the active map are released only after the destination Scene has created its own objects.
- If destination preparation fails, no destination state is committed and the player remains safely on the source map.
- A map-loading overlay makes the dynamic package handoff visible instead of presenting a silent frozen/blank interval.

## Start/save menu

- Page load now presents **Continue**, **New Game** and **Load Save** before Phaser boots.
- Continue resumes the validated single save.
- Load Save shows the saved Level, location, ash and timestamp, then loads that slot.
- New Game immediately starts fresh when no save exists.
- With an existing save, New Game requires an explicit **Overwrite & Start** confirmation.
- Fresh starts use the current v0.1.2.4 Level-1 starter outfit.
- Save schema remains 1; map-aware Hollow saves remain valid.

## Automated checks completed

- `npm run check`
- `node --check` across every JavaScript source file
- Save/new-game smoke test with mocked localStorage:
  - empty slot detection
  - save/load
  - Hollow map restoration
  - reset/new-character state
  - starter outfit preservation
  - stored timestamp/build metadata preservation
- Dynamic destination-package smoke test with a mocked Phaser loader/TextureManager.
- Static validator asserts destination preparation occurs before map-state commit/restart and stale texture release is deferred until destination creation.
- Direct static HTTP resource checks verify the hotfix shell and representative runtime assets are served successfully.

## Browser automation limitation

The available Chromium environment starts normally, but navigation to localhost is blocked by an administrative browser policy (`net::ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore this package does not claim an automated interactive browser playthrough. Physical iPhone Safari remains the release gate for the specific lifecycle issue.

## Physical iPhone release gate

1. Reload the deployed page and confirm the title menu appears.
2. Continue the existing v0.1.2.4 save and confirm level, inventory, quests, equipment and current map are preserved.
3. Reload, choose **Load Save**, verify the displayed slot details, and load it.
4. Reload, choose **New Game**, cancel once, then confirm overwrite only when ready; verify the fresh Level-1 Wayfarer outfit.
5. With `?debug=1`, repeatedly use **Map: Hollow → Map: Refuge → Map: Hollow** without refreshing Safari.
6. Repeat the same route naturally through the Scorched Outskirts cave mouth and Hollow southern exit.
7. Verify there is no blank world, missing ground, missing actors, stuck loading overlay or duplicated input/toasts.
8. Save inside Hollow, reload, Continue, and verify Hollow renders immediately.
9. Return to Cinder, save, reload, Continue, and verify Cinder renders immediately.
10. Run several repeated transitions plus app switching to catch Safari texture/lifecycle regressions.

## Release decision

v0.1.2.4.1 becomes the baseline only after the repeated no-refresh Cinder ↔ Hollow test passes on the user's physical iPhone.
