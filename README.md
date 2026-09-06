# Hell RPG v0.1.0 — Ashfall Foundation

Ashfall Foundation is the first production-minded vertical slice for a mobile-first, single-player pixel action RPG. It is an original dark-fantasy game built with Phaser 3, plain JavaScript and HTML/CSS. It does not use copyrighted Dekaron/2Moons content.

## Playable loop

Start in Cinder Refuge, speak with Warden Vesra, travel east into the Scorched Outskirts, fight Cinder Imps and Ash Skeletons, collect physical loot, gain XP, allocate earned stats, equip visible gear, and push to Captain Ossivar at the edge of Bone Road. Return trips demonstrate dialogue that reacts to quest items, player level, world flags, previous conversations and equipped rarity.

Touch controls are designed first for iPhone landscape. Keyboard controls are also available: WASD/arrows to move, Shift to run, Space to attack, E to interact, I for inventory, C for stats and Q for quests.

## Run locally

The game uses browser modules, so serve it rather than opening `index.html` directly:

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080/`.

No package installation or build step is required. Phaser 3.90.0 is vendored under `dist/vendor/` so the game does not depend on a runtime CDN.

## Checks

```bash
npm run check
```

For JavaScript syntax checks:

```bash
find dist/js -name '*.js' -print0 | xargs -0 -n1 node --check
```

Append `?debug=1` to the local URL to enable Arcade Physics diagnostics. Diagnostics are off by default.

## GitHub Pages

The included `.github/workflows/pages.yml` publishes the static `dist/` directory. Create a repository, push this project to the `main` branch, then choose **GitHub Actions** as the Pages source in repository settings. The game uses relative asset paths, so project-site subpaths work without changes.

## Save behavior

Progress is stored in the browser under save schema `saveVersion: 1`. Saves occur periodically, after material progression, on manual Save, and when the page is hidden. Loaded data is bounded and normalized. A malformed JSON save is isolated to a timestamped backup key and replaced with a safe new game instead of crashing.

## Project map

- `dist/index.html` — static entry point and accessible interface shell
- `dist/css/` — safe-area-aware, responsive game UI
- `dist/js/data/` — stable-ID items, enemies, NPCs, quests, zones, spawns and asset geometry
- `dist/js/core/` — event bus, default state and save validation
- `dist/js/entities/` — player, layered LPC renderer, enemies and NPCs
- `dist/js/systems/` — action input, combat pools, stats, inventory, quests and dialogue conditions
- `dist/js/scenes/` — Phaser world scene and continuous map assembly
- `dist/assets/` — unchanged selected source spritesheets and preserved attribution files
- `docs/` — architecture, credits, performance notes, changelog and limitations
- `tests/` — deterministic structural/save validation

See [Architecture](docs/ARCHITECTURE.md), [Asset Usage and Credits](docs/ASSET_USAGE_AND_CREDITS.md), [Performance](docs/MOBILE_PERFORMANCE.md), [Known Limitations](docs/KNOWN_LIMITATIONS.md), [QA Report](docs/QA_REPORT.md) and [Changelog](CHANGELOG.md).
