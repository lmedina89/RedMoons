# v0.1.2.4.2 QA report — Player Transition & Starter Visual Recovery

## Scope

This is a narrow physical-device recovery release built from v0.1.2.4.1. It does not activate transformation gameplay or add a new region.

## Repairs under test

### A. Player visual survival across map handoffs
- Destination package still loads before map state is committed.
- Loaded textures are retained for the browser session rather than eagerly evicted during a Scene restart.
- Player layered presentation is rebuilt immediately after `Player` construction.
- A delayed visual-integrity pass checks for missing player texture keys and can re-prepare the current map package before rebuilding again.
- Physics proxy remains invisible in normal play; cyan proxy appears only under `?debug=1`.

### B. Starter outfit synchronization
- Starter item IDs/stats remain unchanged for save compatibility.
- Wayfarer Shirt, Ashcloth Trousers, Hide Handwraps and Road Boots now resolve to revised full-combo-compatible visual layers.
- New starter trousers use dedicated walk/slash/backslash/halfslash runtime crops aligned directly to the revised player poses.
- Hide Handwraps use the same verified revised glove geometry recolored to a worn brown leather palette; alpha/pose geometry is unchanged.
- An all-four-facing contact-sheet audit was generated during the release pass for walk, slash, one-handed slash, backslash and halfslash keyframes; the starter clothing stack remained anchored to the player poses.
- Legacy classic clothing layers remain in the asset library but are not the default starter presentation.

### C. Source concept preservation
- `Transformation.png` plus six other user-provided 832×3456 concept sheets are staged outside `dist/`.
- None are registered in `ASSET_DEFS` for this hotfix.
- `Transformation.png` is the only authoritative future player-transformation source.

## Automated validation

`npm run check` validates project/data invariants, runtime asset presence/dimensions/alpha coverage, full-combo starter visual coverage, save normalization, map definitions, content staging, and source/runtime separation.

All JS source is also checked with `node --check` before packaging.

## Physical iPhone release gate

1. New Game: confirm complete starter outfit appears at Level 1.
2. Perform slash → one-handed slash → backslash → halfslash in all directions; no clothing layer may shift independently.
3. Debug or natural travel Cinder → Hollow → Cinder at least five round trips with no refresh.
4. Confirm player remains visible on every arrival and after first movement/attack.
5. Save in Hollow → page reload → Continue; map and player should render immediately.
6. Save in Cinder → page reload → Continue; same expectation.
7. Unequip starter pieces, save/reload, and verify the game does not force-dress the player.
8. Background/foreground Safari and switch apps during a 10–15 minute session; check input, duplicate handlers, map rendering and player visibility.

v0.1.2.4.2 becomes the baseline only after the physical-device transition/player-visual test passes.
