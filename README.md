# Hell RPG v0.1.2.4 — World Streaming & Asset Hardening

Ashfall Foundation is an original, mobile-first single-player pixel action RPG built with Phaser 3, JavaScript and HTML/CSS. Its progression/combat philosophy is inspired by the feel of classic grind-heavy MMORPGs while Hell RPG's names, world content and implementation remain original.

v0.1.2.4 is a controlled architecture/hardening release built directly on v0.1.2.3. It keeps **save schema 1**, preserves the existing 2560×1280 Cinder Region, fixes the issues found in physical iPhone testing, and establishes separate data-driven maps with map-scoped asset loading before the project grows into larger combat/content milestones.

## What is new in v0.1.2.4

- Added a **data-driven map registry** with stable map IDs, entry-point IDs and two-way transition records.
- Preserved the original **2560×1280 Cinder Region** unchanged in physical size rather than extending it into a giant monolithic world.
- Added **Ashfall Hollow**, a separate 1024×768 cave map reached from the Scorched Outskirts with **Use** and returned through its southern exit.
- Ashfall Hollow has its own walls/collision, cave presentation and a small Cave Spider/Mire Spider population. Mire Spider is now naturally placed rather than debug-only.
- Added **map-scoped asset resolution**. World startup loads the current map's world art, local actors and required equipment visuals instead of blindly preloading every registered texture.
- Inventory equipment visuals can be **lazy-loaded when equipped**, allowing future equipment expansion without forcing every player-ready sheet into every map package.
- On map transition, runtime assets that are no longer required are eligible for release before the destination map reloads its package.
- Moved preserved source/export artwork out of shipping `dist/assets` into top-level `source-assets/`. **No source art was deleted.** Runtime `dist/` now contains only assets intended to be served by the game plus licenses/credits.
- Fixed the iPhone `?debug=1` diagnostics tray so it is safe-area bounded and horizontally swipeable instead of disappearing beyond the viewport.
- Corrected **Ash Goblin Raider facing** with a data-driven direction-row mapping; the AI movement itself was not reversed.
- New characters now begin wearing a complete low-level outfit: **Wayfarer Shirt, Ashcloth Trousers, Hide Handwraps and Road Boots**, plus the existing Ashen Arming Sword.
- Those four starter clothes are now player-ready Level-1 gear. Existing saves are **not** force-dressed or overwritten.
- Added shared optional enemy death-animation support and wired **Ashstone Golem** to its supplied seven-frame death sheet instead of disappearing immediately on defeat.
- Debug diagnostics now include direct **Map: Refuge** and **Map: Hollow** helpers.

## World structure rule

Hell RPG should not grow by continuously enlarging one map. Nearby exterior spaces may remain continuous, but caves, dungeons, building interiors, distant regions, guild areas and future towns can be separate maps connected by roads, gates, doors, cave mouths or portals. Each map owns its bounds, zones, population, transition points and world-art asset package.

This keeps the game world expandable without requiring an iPhone to hold every region and actor in memory simultaneously.

## Collision policy

The v0.1.2.2 visible-source rule remains authoritative in the Cinder Region: only visible refuge wall segments and visible building footprints create static blockers. Decorative rocks, plants, roads and scenery remain non-blocking.

Ashfall Hollow follows the same principle: its static colliders are generated from its visible rock-wall definitions, with a visible southern opening aligned to the return transition.

## Playable loop

Start in Cinder Refuge, locate Warden Vesra at Warden Hall, move east into the Scorched Outskirts, fight multiple enemy families, collect player-compatible loot, gain XP/stat points and push toward Bone Road. A cave entrance in the Scorched Outskirts now leads to Ashfall Hollow as the first proof of the multi-map architecture.

Touch controls are designed first for iPhone landscape. Keyboard controls are also available: WASD/arrows move, Shift runs, Space attacks, E interacts, I opens Inventory, C opens Character and Q opens Quests.

## Development diagnostics

Append `?debug=1` to the URL. The diagnostics tray is horizontally swipeable on narrow landscape screens and includes enemy teleports, map-transition helpers, gear regression helpers, Wings unlock and collision visualization.

## Run locally

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080/`.

No build step or runtime CDN is required; Phaser 3.90.0 is vendored under `dist/vendor/`.

## Checks

```bash
npm run check
find dist/js -name '*.js' -print0 | xargs -0 -n1 node --check
```

The validator covers runtime/source asset separation, per-map asset packages, map transitions, visible-source collision, save normalization, starter equipment, Goblin facing, Golem death geometry, enemy/NPC/item references, player-safe loot and existing four-hit equipment animation invariants.

## Save compatibility

`saveVersion` remains **1**. Older schema-1 saves without map metadata normalize to `map_cinder_region`; valid current-map positions are preserved and clamped to that map's bounds. Map-aware saves persist stable `mapId`/`entryPointId` values. Existing equipment choices remain untouched.

## Asset preservation

Development/source artwork is preserved under `source-assets/`, including the previous LPC source exports and staged workshop sheets. Runtime crops and assets used by the game remain under `dist/assets/`. License/credit records stay in `dist/assets/licenses/` and the project documentation.

The supplied Wolf PSD remains preserved/deferred until its irregular animation layout receives a verified runtime export rather than a guessed one.

## GitHub Pages

The ZIP is repo-root ready. Extract its contents directly into the repository root. The root launcher forwards to `dist/`, and relative asset paths remain compatible with GitHub project Pages.

See `docs/ARCHITECTURE.md`, `docs/ASSET_USAGE_AND_CREDITS.md`, `docs/MOBILE_PERFORMANCE.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/QA_REPORT.md`, and `CHANGELOG.md`.
