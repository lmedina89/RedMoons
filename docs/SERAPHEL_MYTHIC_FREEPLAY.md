# Seraphel, the Shattered Halo — Mythic Freeplay

## Scope

v0.1.4.4.5.4.4 introduces **Seraphel, the Shattered Halo** as a disposable Mythic Freeplay character only. He is intentionally not a campaign spawn, quest target, loot source, or optional boss yet. A future optional-boss controller may reuse this release's actor/ability implementations without duplicating them.

## Canonical identity

- Faction: **Fallen** (`fallen`), independent of Heaven and Hell.
- Celestial ↔ Fallen: hostile.
- Infernal/monster ↔ Fallen: hostile.
- Fallen ↔ Fallen: friendly.
- Existing Celestial ↔ Infernal hostility is preserved.
- Internal level: **220**.
- Threat tier: **apex**.
- Supernatural ceiling: 250.
- Primary-stat budget: **1,115** (`20 + 219×5`).
- STR 205 / DEX 285 / VIT 270 / SPR 355.
- Resource model: **Infinite Essence**; SPR remains finite.
- Initial hand-tuned Freeplay combat target: 28,500 HP / 570 attack / 320 defense, with high stagger/status resistance.

## Source/action contract

`FallenAngel.png` is a fully populated 832×3456 source sheet. All 15 action blocks are compacted for runtime and deliberately exercised: spellcast, thrust, walk, slash, shoot, hurt, climb, idle, jump, sit, emote, run, combat idle, backslash and halfslash. The climb block is reserved for Sevenfold Cataclysm's vertical-rift ascent rather than pretending it is normal flying movement.

## Six-hit basic combo

The Attack button advances through six distinct actions and progressively increases reach, damage and Fallen spectacle:

1. **Fractured Edge** — slash — 108px — 1.00×.
2. **Exile's Fang** — thrust — 128px — 1.08×.
3. **Halo Reversal** — backslash — 148px — 1.16×.
4. **Riven Crescent** — halfslash — 170px — 1.27×.
5. **Fallen Judgment** — shoot — 222px — 1.38×.
6. **Shattered Halo** — spellcast — 258px / 360° — 1.55×.

The common signature grows from black/crimson fractured light into the full prismatic Fallen spectrum, with increasingly large feather/broken-halo effects.

## Seven elemental abilities

1. **Pyre of the Fallen Sun** — fire / burn.
2. **Crown of the Frozen Abyss** — ice + water / slow-control.
3. **Tempest of Exile** — lightning + wind / rapid multi-target battlefield movement.
4. **Worldbreaker Testament** — earth / staged ground rupture.
5. **Eclipse of Grace** — light + dark/void collapse.
6. **Prismatic Dominion** — seven-element sequential convergence.
7. **Sevenfold Cataclysm** — dedicated ultimate: fire → ice/water → lightning → wind → earth → light → dark/void, followed by a prismatic Shattered Spectrum finale.

Every ability uses Seraphel's shared visual signature: corrupted celestial geometry, broken halos, dark feathers, black/violet core energy and highly saturated elemental color.

### Tempest of Exile living-target rule

Tempest never locks six hits onto the first opponent. Before every bounce it rebuilds the current living hostile pool. It prefers a different/unvisited living target, falls back to another living target, and may repeat the sole remaining opponent only while that opponent remains alive. A kill removes that actor before the next bounce; if no living hostile remains, Tempest ends cleanly and performs its final storm burst.

## Freeplay control and safety

The title screen exposes Seraphel beside Azrael under Mythic Freeplay. Freeplay uses a separate `SeraphelFreeplayController`; no existing named-character autonomous AI is modified. Seraphel starts in a collision-clear neutral/Fallen perch north of the Axis, ~695px from the nearest regular Eternal-Warfront formation. Both armies can later converge on him naturally.

The session remains disposable: no save writes, XP, ash, loot, quest progress, inventory/stat progression, or campaign boss state. Existing map travel remains available and Seraphel's compact assets follow him across maps.

Freeplay death uses a short ~2.6-second recovery and returns at the current map's Freeplay entry/respawn anchor with full HP, cleared statuses and reset cooldowns. The same pass shortens Azrael Freeplay's prior long down-state through his human Freeplay controller only; `Azrael.js` remains unchanged.

## Mobile/performance guardrails

Effects use bounded Graphics, short-lived beams/feathers, existing audio, capped staged bursts and the established local actor-sleep architecture. Sevenfold is visually large but avoids a persistent full-screen shader. Physical iPhone Safari remains the release gate.
