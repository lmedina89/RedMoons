# Hell RPG v0.1.2.2 — Actor Collision & Reward Recovery Hotfix

Ashfall Foundation is an original, mobile-first single-player pixel action RPG built with Phaser 3, JavaScript and HTML/CSS. Its progression/combat philosophy is inspired by the feel of classic grind-heavy MMORPGs, while all Hell RPG names, world content and implementation remain original.

v0.1.2.2 is a narrow stabilization hotfix built directly on v0.1.2.1. It keeps save schema 1 and fixes oversized invisible actor collision proxies, cleans up collision diagnostics, and replaces old NPC-only player rewards/debug grants with full-combo player-compatible gear.

## What is new in v0.1.2.2

- Fixed the root cause of the remaining invisible “force fields”: the player and layered enemies used a 2×2 invisible physics texture that was visually scaled before `body.setSize()`, causing Arcade Physics to multiply the intended body dimensions into huge rectangles. Actor proxies now remain unscaled and use compact foot-area bodies.
- `?debug=1` now uses targeted collision diagnostics instead of Phaser's global body overlay: static blockers are green, the player's actual movement footprint is cyan, and enemy footprints are faint magenta.
- The debug helmet helper now grants a **Magic Bronze War Helm** and raises only the minimum test requirements needed to equip it. It no longer grants the NPC-only Warden Helm.
- Quest equipment rewards are now player-compatible: A Heart Still Burning awards Magic Ashrunner Leather Boots, and The Bone Road Warden awards a Noble Iron War Helm.
- Save loading converts legacy player-held Warden Helms and Cinderhide Jerkins from those older rewards into compatible replacements while preserving item instance, rarity, enhancement, and modifiers.
- Save schema remains 1.

## What is new in v0.1.2

- The supplied **red-haired full-combat LPC character** is now the player base. Walk, standard slash, one-handed slash, backslash and halfslash all use synchronized source coverage.
- Cinder Refuge is now a real data-driven settlement with **six buildings**, connected paths, a wide east gate, a forge, Warden Hall, inn, storehouse, homes and settlement props.
- Zone definitions now expose level ranges, safety/hostility, biome, event tags and future dungeon hooks instead of being only rectangles/names.
- Added new enemy visuals and definitions: **Carrion Beast, Rotwing Ravager, Slate Revenant, Bloodbone Reaver and Gilded Ossuary Guard**, alongside Cinder Imps, Ash Skeletons and Captain Ossivar.
- Skeleton-family enemies now use the shared layered actor renderer and roll **weighted weapon/armor/offhand loadouts once per spawn**. Named Captain Ossivar uses a fixed signature loadout.
- Old/limited player gear is now useful as NPC/skeleton equipment even when it remains blocked from normal player loot.
- Refuge NPCs now use layered equipment loadouts. Sable uses the supplied olive-skinned humanoid base and is marked as a future recruitable adventurer.
- NPC definitions already carry `npcType`, `level`, `combatRole`, `guildId`, `recruitable`, `activityState` and `homeZone` hooks for the later simulated-MMO/guild system.
- Added named equipment-set metadata scaffolding for **Gravesworn Legion**, **Ashrunner Leathers** and **Steel Bastion**. Bonuses are deliberately data-only/planned in this release and do not affect combat yet.
- Existing v0.1.1.5 rarity/glow metadata, Drop/Destroy inventory recovery, player-safe loot filtering and mobile movement hardening remain intact.

## Playable loop

Start in Cinder Refuge, locate Warden Vesra at Warden Hall, move east through the gate into the Scorched Outskirts, grind multiple enemy families, collect player-compatible physical loot, gain XP/stat points, and push into Bone Road toward stronger equipped skeleton variants and Captain Ossivar.

Touch controls are designed first for iPhone landscape. Keyboard controls are also available: WASD/arrows move, Shift runs, Space attacks, E interacts, I opens Inventory, C opens Character and Q opens Quests.

## Development diagnostics

Append `?debug=1` to the URL. The diagnostics panel includes teleports to the new enemy families, the v0.1.2 gear helper, Wings unlock and other regression helpers.

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
