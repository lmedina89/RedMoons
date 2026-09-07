# v0.1.2.4.3 QA report — Transition Lifecycle Recovery

## Scope

This is a narrow lifecycle hotfix built from v0.1.2.4.2. It does not add combat skills, transformation gameplay, content, maps or save-schema changes.

## Physical-device finding

v0.1.2.4.2 fixed the previous blank/invisible-player handoff: Ashfall Hollow and the player could render correctly after travel. Physical iPhone Safari testing then exposed a second lifecycle defect: the destination Scene was visually present but all simulation remained frozen until reset/reload.

## Root cause

`transitionToMap()` sets `this.transitioning = true` before destination asset preparation/fade. `WorldScene.update()` intentionally returns while that flag is true so the source-map player body cannot overwrite committed destination coordinates. Phaser `Scene.restart()` restarts the same Scene instance rather than constructing a new `WorldScene`, so the custom field remained true after restart. The destination rendered, but its update loop was permanently gated.

## Repair

`WorldScene.create()` now resets `this.transitioning = false` on every Scene creation/restart before ActionInput is rebound and before the destination gameplay loop begins. No input/physics pause API was involved; the stale transition guard itself was the freeze.

The following v0.1.2.4.2 safeguards remain unchanged:
- prepare destination assets before committing map identity/coordinates;
- retain already-loaded textures for the browser session;
- deterministic layered-player visual reconstruction and delayed integrity recovery;
- combo-safe Level-1 starter visuals;
- schema-1 map-aware save normalization.

## Automated validation

`npm run check` requires the Scene-create transition reset to exist and to occur before ActionInput is rebound. It also retains all existing map, save, asset, starter-gear, collision, loot and animation invariants. All JavaScript is checked with `node --check` before packaging.

## Physical iPhone release gate

1. Cinder → Hollow: immediately walk and attack; no reset/refresh.
2. Confirm local Spiders continue updating and can attack/chase.
3. Use the southern Hollow return transition.
4. On Cinder arrival, immediately walk and attack again.
5. Repeat at least five round trips.
6. Save in Hollow → reload → Continue; confirm movement/enemy simulation immediately.
7. Save in Cinder → reload → Continue; same expectation.
8. Background/foreground Safari and repeat a map transition.
9. Check for duplicate touches, duplicate toasts, stuck joystick state, frozen enemies or degraded performance.

v0.1.2.4.3 becomes the baseline only after this physical-device lifecycle gate passes.
