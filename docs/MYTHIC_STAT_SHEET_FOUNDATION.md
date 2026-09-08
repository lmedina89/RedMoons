# Mythic Stat Sheet Foundation — v0.1.4.4.5.4.2

## Purpose

This release establishes a canonical primary-stat progression contract for mortal and supernatural characters without retuning any physically tested named-character combat values.

## Shared progression arithmetic

Every character sheet begins with 5 STR / 5 DEX / 5 VIT / 5 SPR (20 total primary points) and gains 5 primary-stat points for every level after Level 1.

`statBudget(level) = 20 + ((level - 1) × 5)`

Examples:

- Level 30: 165 total primary points
- Level 60: 315
- Level 94: 485
- Level 96: 495
- Level 98: 505
- Level 99: 510
- Level 100: 515
- Level 250: 1,265

## Level ceilings

- Mortal/player canonical ceiling: Level 100
- Supernatural/celestial/infernal canonical ceiling: Level 250

The current playable campaign remains development-capped at Level 10. This release does not expand campaign leveling.

## Current canonical sheets

The existing current levels are retained in this foundation pass. Their sheets are:

| Character | Current level | STR | DEX | VIT | SPR | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Infernal Dreadknight | 30 | 60 | 30 | 60 | 15 | 165 |
| Zerakoth | 60 | 120 | 65 | 100 | 30 | 315 |
| Bloodwing Scourge | 94 | 165 | 120 | 145 | 55 | 485 |
| Lailani | 96 | 80 | 180 | 105 | 130 | 495 |
| Ancient Demon Lord (reserved) | 98 | 170 | 90 | 175 | 70 | 505 |
| Azrael | 99 | 175 | 100 | 165 | 70 | 510 |
| El’exis | 99 | 95 | 85 | 145 | 185 | 510 |

These allocations describe identity and progression. They do not currently derive the named actors' combat HP/attack/defense.

## Preserved combat tuning

Named supernatural actors continue to use their existing hand-authored combat values in v0.1.4.4.5.4.2. The new sheets are marked `combatStatsMode: hand_tuned_preserved` so later work cannot silently assume ordinary player formulas are already driving mythic combat.

This allows a later canonical-level rescale across the new 1–250 supernatural range without changing combat feel in the same release.

## Future fallen angel

A future fallen-angel Freeplay character may use any justified supernatural level up to 250. Its STR/DEX/VIT/SPR allocation must spend exactly the budget granted by that level. Its final level, identity, art and combat kit are intentionally not selected in this foundation release.


## Superseded level assignments

The initial 94/96/98/99 named-mythic levels in this foundation document were deliberately provisional. **v0.1.4.4.5.4.3 — Mythic Level Recalibration** supersedes those assignments with Bloodwing 135, Lailani 150, El’exis 150, Ancient Demon Lord 160 and Azrael 175 while preserving the same stat-budget formula and Level-250 supernatural ceiling. See `MYTHIC_LEVEL_RECALIBRATION.md`.
