# Hell RPG v0.1.1.5 — Player Gear Pool Expansion

Ashfall Foundation is a production-minded vertical slice for a mobile-first, single-player pixel action RPG. It is an original dark-fantasy game built with Phaser 3, plain JavaScript and HTML/CSS. It does not use copyrighted Dekaron/2Moons content.


v0.1.1.5 expands the real player-compatible loot pool without changing save schema 1. Seven newly verified full-combo gear variants are integrated as level-appropriate drops while incomplete/legacy sheets remain blocked from normal player loot. The v0.1.1.4 movement and inventory-recovery hardening remains intact.

## v0.1.1.5 gear expansion

- Added Brass Arming Sword and Iron Arming Sword as full four-hit player weapons.
- Added Bronze War Helm, Ashhide Shoulders, Ashrunner Leather Boots, Silver Legion Cuirass and Steel Bastion Plate as full-combo visible armor.
- Distributed the new gear across Cinder Imp, Ash Skeleton and Captain Ossivar loot tables with level-appropriate rarity weights.
- Preserved the strict runtime loot gate: NPC-only/legacy gear still cannot enter normal player drops, while quest items remain exempt.
- Added item-presentation metadata hooks for rarity borders/world glow and later enhancement glow/trail/aura effects; the expensive FX layer is intentionally deferred.
- Preserved full source exports and lossless runtime crops. Exact generator credits are still missing for several armor exports, so those pieces remain on attribution hold for store/commercial release until the matching credit exports are captured.
- Save schema remains version 1. Existing v0.1.1.x saves load unchanged.

## v0.1.1.4 hotfix

Physical iPhone testing showed that the earlier camera/touch fix greatly reduced reverse sliding but did not eliminate it in every situation. v0.1.1.4 removes dynamic player/enemy body separation so chasing enemies cannot physically push the player's Arcade body after movement input has stopped. Combat contact remains distance/range driven, which is also a better fit for future large Dekaron-style enemy pulls.

The joystick lifecycle is hardened again for iOS Safari: pointer release/cancel listeners now run in capture phase at document/window level, touch-end/touch-cancel provide an additional fallback, and a fresh joystick touch can take ownership from a stale pointer id instead of being ignored. The immediate camera follow and ActionInput deadzone/zeroing from v0.1.1.3 remain intact.

Inventory recovery is now built in. Every normal item detail view has **Drop** and **Destroy** controls with a two-tap confirmation. Dropping safely unequips the item if necessary and places the same item instance back into the world near the player; destroying removes it permanently. Quest-critical items display the controls in a protected disabled state so story progress cannot be lost.

The v0.1.1.3 singleton/rate-limited toast system and player-safe loot eligibility rules remain intact. Save schema remains version 1.

## What changed in v0.1.1.1

This release extends the v0.1.1 Character & Combat Foundation without changing save schema 1.

- Added a data-driven four-hit sword combo: standard slash → one-handed slash → backslash → halfslash.
- Added the combat-ready Ashen Arming Sword and made it the new starter player weapon.
- Existing schema-1 saves with the old equipped starter Rustblade migrate that equipped instance to the Ashen Arming Sword so returning players immediately receive the four-hit combat set. Unequipped Rustblades remain intact for future humanoid enemy loadouts.
- Added Shoulders and Wings as persistent equipment slots, bringing the Character sheet to 12 named slots.
- Added Iron War Helm, Legion Cuirass and Legion Gloves as full-combo player gear, while partial Legion Pauldrons/Boots exports were preserved for staged NPC/future use until complete player animation coverage became available.
- Added Crimson Bat Wings as a real layered equipment item with Defense, Max HP and Movement Speed buffs. The slot is progression-gated and locked during normal v0.1.1.1 play; the final advanced unlock milestone is intentionally not authored yet.
- Added explicit per-layer animation compatibility and safe slash fallback for equipment that does not contain the newer one-handed rows.
- Added the supplied Katana as processed limited-animation/NPC weapon content for the upcoming humanoid enemy-loadout system; it is not newly player-equippable.
- Added deterministic validation of the real alpha content used by the four-hit body/gear/weapon mappings.

## Playable loop

Start in Cinder Refuge, speak with Warden Vesra, travel east into the Scorched Outskirts, fight Cinder Imps and Ash Skeletons, collect physical loot, gain XP, allocate earned stats, equip multiple visible armor pieces plus a weapon/offhand, inspect the full Character sheet, and push to Captain Ossivar at the edge of Bone Road.

New revised-combat gear is integrated into skeleton/Captain loot tables. Wings are deliberately staged for later high-progression unlock rather than granted to a new character.

Touch controls are designed first for iPhone landscape. Keyboard controls are also available: WASD/arrows to move, Shift to run, Space to attack, E to interact, I for inventory, C for Character and Q for quests.

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

Append `?debug=1` to the local/deployed URL to enable development diagnostics. v0.1.1.5 exposes **Add 0.1.1.5 Gear** and **Unlock Wings** helpers so the complete verified equipment pool can be tested without grinding drops.

## GitHub Pages

This package intentionally contains no `.github/workflows/` file, so Git clients using an OAuth token without GitHub's `workflow` scope can push it normally.

Create a repository, push this project to the `main` branch, then open **Settings → Pages** and choose **Deploy from a branch**, branch **main**, folder **/(root)**. The root launcher forwards to the self-contained game under `dist/`. Relative asset paths keep project-site subpaths working without changes.

The ZIP is structured to extract directly into the repository root; there is no version-named wrapper directory.

## Save behavior

Progress remains under `saveVersion: 1` for backwards compatibility with v0.1.0/v0.1.1 browser saves. Saves occur periodically, after material progression, on manual Save and when the page is hidden. Loaded data is bounded and normalized. A malformed JSON save is isolated to a timestamped backup key and replaced with a safe new game instead of crashing.

v0.1.1.1 adds the Shoulders/Wings slots and `wingsUnlocked` flag through schema-compatible defaults. The legacy equipped Rustblade migration is intentionally narrow: only the equipped old starter weapon becomes the player-ready Arming Sword; spare Rustblades stay untouched.

## Equipment model

The Character/Inventory state now has these named slots:

- Head
- Shoulders
- Chest
- Hands
- Legs
- Feet
- Weapon
- Offhand
- Necklace
- Ring 1
- Ring 2
- Wings

One main-hand weapon and one offhand remain the current combat rule. Necklace and ring slots are structurally present but do not yet have accessory items. Wings are a real buff-bearing slot but remain locked until a later advanced-progression system enables them.

## Animation compatibility

Player weapons are classified by combat coverage. Full-combo player weapons must support the intended multi-hit animation profile. Limited single-slash weapons are retained as staged humanoid/NPC equipment rather than discarded.

Armor is more permissive: a layer with full revised coverage follows the exact four-hit body action, while an older/partial armor layer can explicitly fall back to a valid standard slash sequence. Fallback playback is spread across the full attack duration so limited gear does not race to its last frame and freeze.

## Asset/source note

The complete user-supplied generator PNGs and their supplied credit files are preserved under `dist/assets/source-exports/2026-09-06/`, while gameplay preloads only smaller runtime animation crops under `dist/assets/player/revised/`.

The supplied credit files cover the revised body/head/face + Katana export and the Arming Sword export. Matching generator credit text was not supplied for Boots, Gloves, Legion chest, Red Bat Wings, Iron helmet and Shoulders. Those assets are included for the current development build as requested, but remain on an attribution hold for any production/store release until their matching generator credits are captured. See `docs/ASSET_USAGE_AND_CREDITS.md`.

## Project map

- `dist/index.html` — static entry point and accessible interface shell
- `dist/css/` — safe-area-aware responsive game UI
- `dist/js/data/` — stable-ID items, enemies, NPCs, quests, zones, spawns, combat profiles and animation geometry
- `dist/js/core/` — event bus, default state and save validation/migration
- `dist/js/entities/` — player, layered LPC renderer, enemies and NPCs
- `dist/js/systems/` — action input, combat pools, stats, inventory, quests and dialogue conditions
- `dist/js/scenes/` — Phaser world scene and continuous map assembly
- `dist/assets/player/revised/` — runtime animation crops for revised-combat gear and weapons
- `dist/assets/source-exports/` — preserved full user-provided source exports/credits; not preloaded by gameplay
- `dist/assets/licenses/` — preserved attribution records from the original core archive
- `docs/` — architecture, credits, performance notes, limitations and QA
- `tests/` — deterministic structural/save/animation validation

See [Architecture](docs/ARCHITECTURE.md), [Asset Usage and Credits](docs/ASSET_USAGE_AND_CREDITS.md), [Performance](docs/MOBILE_PERFORMANCE.md), [Known Limitations](docs/KNOWN_LIMITATIONS.md), [QA Report](docs/QA_REPORT.md) and [Changelog](CHANGELOG.md).
