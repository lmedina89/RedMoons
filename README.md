# Hell RPG v0.1.2.3 — Asset & World Variety Expansion

Ashfall Foundation is an original, mobile-first single-player pixel action RPG built with Phaser 3, JavaScript and HTML/CSS. Its progression/combat philosophy is inspired by the feel of classic grind-heavy MMORPGs, while all Hell RPG names, world content and implementation remain original.

v0.1.2.3 is a controlled content-variety pass built directly on the v0.1.2.2 collision/reward hotfix. It keeps **save schema 1** and deliberately preserves the corrected collision model while expanding monsters, NPC adventurers and environmental dressing.

## What is new in v0.1.2.3

- **16 enemy definitions** now cover several early families and variants rather than relying mainly on Imp/Skeleton repetition.
- Cinder, Blight and Blueflame Imps each roll from weighted sword/pitchfork/shield visual combinations once per spawn.
- Added **Ash Goblin Raider**, **Cave Spider**, **Ember Spider**, **Paleweb Spider**, **Mire Spider** (staged for a later matching zone) and the larger **Ashstone Golem** elite.
- Four Spider palettes were harvested as compact runtime sheets from the supplied 11-variant pack.
- Added **Renn**, an Emberbound Bone Hunter, and **Doran**, a recruitable Road Seeker, as additional persistent-adventurer seeds.
- Added the data-only **Emberbound** NPC guild seed; there is still no active guild gameplay in this release.
- Added Adobe-2 props and selected evergreen/seasonal bushes and mushrooms from the existing Core library. These are visual scenery only and create **no collision**.
- Harvested five additional full-combo Arming Sword material palettes already present in the Organized library: **Copper, Bronze, Steel, Ceramic and Gilded**. They are real player/NPC-compatible variants and are distributed through level-appropriate loot/loadout pools.
- Added compact precomposed **pine tree / pine cluster** scenery harvested from the existing 4-season pack without adding physics bodies.
- The supplied Cave3 and revised Workshop tilesets are staged under `dist/assets/world/` but are not preloaded until an actual cave/interior map uses them.
- The supplied Wolf PSD is intentionally **not** shipped as runtime art yet. Its source layout needs a verified export/crop before gameplay integration.
- `?debug=1` includes direct teleports to the new live enemy families.

## Collision policy

v0.1.2.3 does **not** broaden static collision. The v0.1.2.2 rule remains authoritative: only visible Cinder Refuge wall segments and visible building footprints block the player. Decorative rocks, plants, mushrooms, Adobe-2 props, roads and other scenery remain non-blocking.

## Playable loop

Start in Cinder Refuge, locate Warden Vesra at Warden Hall, move east through the gate into the Scorched Outskirts, grind multiple enemy families, collect player-compatible physical loot, gain XP/stat points, and push into Bone Road toward stronger equipped skeleton variants and Captain Ossivar.

Touch controls are designed first for iPhone landscape. Keyboard controls are also available: WASD/arrows move, Shift runs, Space attacks, E interacts, I opens Inventory, C opens Character and Q opens Quests.

## Development diagnostics

Append `?debug=1` to the URL. The diagnostics panel includes teleports to the new enemy families, the player gear regression helper, Wings unlock and other regression helpers.

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

The validator checks runtime assets, item/enemy/NPC references, player-safe loot, actual PNG animation geometry/alpha coverage, red-haired protagonist coverage, layered enemy/NPC loadouts, refuge buildings, zone metadata, named-set scaffolding, inventory recovery and save normalization.

## Save compatibility

`saveVersion` remains **1**. Existing v0.1.1.x browser saves are normalized into the new build without a schema migration. New world/enemy/NPC presentation is definition-driven rather than persisted per-enemy.

## Asset status

User-supplied v0.1.2 protagonist, humanoid, enemy and building source files are preserved under `dist/assets/source-exports/2026-09-06/world-enemy-v012/`. The user explicitly authorized development use before final credit collection. Unknown/missing attribution is documented as a release-readiness task; it is not falsely marked as commercially cleared.

## GitHub Pages

The ZIP is repo-root ready. Extract its contents directly into the repository root. The root launcher forwards to `dist/`, and relative asset paths remain compatible with GitHub project Pages.

See `docs/ARCHITECTURE.md`, `docs/ASSET_USAGE_AND_CREDITS.md`, `docs/MOBILE_PERFORMANCE.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/QA_REPORT.md`, and `CHANGELOG.md`.
