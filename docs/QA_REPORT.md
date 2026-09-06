# v0.1.0 QA report

## Automated checks

- `npm run check` validates the save schema version, content relationships, referenced asset paths, equipment slots, quest objectives, and required project files.
- Every JavaScript source file under `dist/js` passes `node --check`.
- `git diff --check` reports no whitespace errors.
- The production bundle is self-contained and does not rely on a runtime CDN.

## Browser checks performed

Tested in Chromium through an 844 × 390 landscape viewport matching an iPhone landscape-class layout:

- Loaded the game and verified the HUD, touch joystick, action buttons, canvas, and safe-area-aware layout.
- Opened inventory and inspected an equipped weapon tooltip.
- Granted XP through development diagnostics and verified multiple level-ups.
- Previewed stat changes, applied the preview, then confirmed the allocation.
- Verified a Noble helmet could not be equipped before meeting its STR requirement.
- Allocated enough STR, equipped the helmet, and visually confirmed the player's head layer changed.
- Accepted **Ash-Pest Cull** from Warden Vesra.
- Moved to a Cinder Imp, attacked it in real time, killed it, gained XP and currency, and advanced the quest counter from 0/5 to 1/5.
- Spawned and picked up a physical **Living Ember Heart** loot drop.
- Spoke to Merchant Ilyan and verified his dialogue changed because the quest item was in inventory.
- Saved, reloaded the page, and verified level, XP, currency, equipment, inventory, and quest progress persisted.
- Triggered player death and verified **Return to Cinder Refuge** restored HP and returned the player to the settlement.
- Inspected browser console output during the run; no game-origin JavaScript errors were observed.

## Not claimed

- This pass did not manually play every quest from acceptance through turn-in.
- This pass did not profile on physical iOS or Android hardware.
- This pass did not validate App Store or Play Store packaging; v0.1.0 is a static web build with architecture intended to support a later native wrapper.

