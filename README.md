# Hell RPG v0.1.2.4.3 — Transition Lifecycle Recovery

This narrow hotfix is built directly from v0.1.2.4.2 and keeps **save schema 1**. Physical iPhone Safari testing proved that v0.1.2.4.2 could render both the destination map and player after Cinder ↔ Ashfall Hollow travel, but the restarted Scene remained permanently frozen until a browser reset.

## What changed

### Destination simulation resumes after map travel
`WorldScene.transitionToMap()` deliberately sets `this.transitioning = true` during the source-map fade so `update()` cannot overwrite the already-committed destination coordinates. Phaser `Scene.restart()` reuses the same Scene instance, so that field survived the restart in v0.1.2.4.2. The destination map rendered, but `update()` saw the stale flag and returned every frame.

v0.1.2.4.3 resets the transient transition flag during every `WorldScene.create()` before the destination simulation begins. The source-map freeze guard remains intact during the fade, while the restarted destination map can immediately process player input, enemy AI, interactions, HUD updates and autosaves.

### Existing v0.1.2.4.2 recovery work is preserved
- Destination assets are still prepared before map state is committed.
- Already-visited textures remain cached for the current browser session to avoid the earlier WebKit texture-lifecycle failure.
- The player layered visual stack is still rebuilt and integrity-checked after Scene creation.
- Combo-safe player-only Level-1 starter visuals remain unchanged.
- Continue / New Game / Load Save remains unchanged.
- `Transformation.png` and all Demon/Heavenly concept sheets remain source-only and preserved.

## Physical iPhone release gate

1. Start/Continue in Cinder and confirm movement + attack work.
2. Enter Ashfall Hollow naturally or with `?debug=1` → `Map: Hollow`.
3. **Immediately move and attack after arrival without reset or refresh.**
4. Confirm Spiders move/attack and `Use` works on the return exit.
5. Return to Cinder and immediately move/attack again.
6. Repeat Cinder → Hollow → Cinder at least five round trips with no reset/refresh.
7. Save in Hollow → page reload → Continue; verify map, player and simulation are immediately live.
8. Save in Cinder → page reload → Continue and repeat.
9. Background/foreground Safari during a 10–15 minute session and check for stuck input, duplicate actions or simulation freeze.

## Debug
Append `?debug=1` to the GitHub Pages URL. The diagnostics tray remains horizontally swipeable and includes direct `Map: Refuge` / `Map: Hollow` travel buttons.

## Source-art policy
Development/source artwork remains under `source-assets/`. Runtime art under `dist/assets/` stays curated and action-specific. No useful source sheet is deleted merely to reduce the shipping build.
