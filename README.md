# Hell RPG v0.1.2.4.2 — Player Transition & Starter Visual Recovery

This hotfix is built directly from v0.1.2.4.1 and keeps **save schema 1**. Its release gate is the user's physical iPhone Safari because both repaired problems were found there.

## What changed

### Player survives map transitions visually
The destination map is still prepared before transition state is committed. v0.1.2.4.2 changes only the post-load cache policy: textures already loaded in this browser session are retained rather than eagerly removed during Scene restarts. The player layer stack is explicitly reconstructed on Scene creation and checked again after the first frame. If required visual textures are unexpectedly missing, the current package is re-prepared and the player visual is rebuilt.

This intentionally trades a modest amount of session memory for transition reliability. Unvisited maps still are **not** loaded at startup.

### Level-1 clothes no longer use slash-only legacy visuals
Fresh characters keep the familiar starter item names and stats:

- Wayfarer Shirt
- Ashcloth Trousers
- Hide Handwraps
- Road Boots
- Ashen Arming Sword

The four clothing items now use player-only full-combo-compatible revised visuals; NPC/enemy loadouts that share those item IDs keep their original classic presentation. `Ashcloth Trousers` includes a compact revised-combat overlay generated from the exact player poses, and `Hide Handwraps` use a brown low-level recolor of the verified revised glove poses. Both remain aligned through slash → one-handed slash → backslash → halfslash. Existing saves keep their equipment choices; the visual fix follows the same item IDs, so a returning character wearing the old starter items benefits automatically.

### Future Demon / Heavenly / transformation art is preserved
The newly supplied 832×3456 LPC-style sheets are source-only under:

`source-assets/character-concepts/2026-09-07/`

`Transformation.png` is the only sheet currently designated as the future **player transformation**. The other uploaded sheets are preserved for future Demon Castle mobs/elites/bosses or Heavenly Castle/unique NPCs. No transformation feature is activated in this release.

## Existing systems preserved

- Cinder Region + Ashfall Hollow separate-map architecture
- Continue / New Game / Load Save single-slot flow
- map-loading overlay and prepare-before-commit transition safety
- horizontally swipeable diagnostics tray
- corrected Ash Goblin facing
- Ashstone Golem death animation
- save schema 1 compatibility
- data-driven items/enemies/NPCs/quests/maps
- compact runtime crops with full source art kept outside `dist/`

## Physical iPhone release gate

1. Start/Continue in Cinder and confirm the full Level-1 outfit is visible.
2. Perform the complete four-hit sword chain facing all four directions; clothes must not shift independently from the body.
3. Cinder → Hollow → Cinder → Hollow → Cinder without Safari refresh; player must remain visible every time.
4. Save in Hollow, reload the page, Continue, and confirm both map and player appear immediately.
5. Save in Cinder, reload, Continue, and repeat.
6. Remove/equip starter gear and verify returning saves are not force-dressed.
7. Switch apps/background Safari during a 10–15 minute session and verify input, player visibility and map rendering remain stable.

## Debug
Append `?debug=1` to the GitHub Pages URL. The diagnostics tray is horizontally swipeable and includes direct `Map: Refuge` / `Map: Hollow` travel buttons.

## Source-art policy
Development/source artwork is preserved under `source-assets/`. Runtime art under `dist/assets/` should remain curated and action-specific. Never delete useful source sheets merely to reduce the shipping build; move them out of `dist/` instead.
