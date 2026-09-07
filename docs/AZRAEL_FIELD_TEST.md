# ArchAngel Azrael Field Test — v0.1.3.2.2

## Purpose

This is a temporary gameplay harness for validating a future mythic celestial character and the reusable systems his presence requires. It is **not** final story placement or final balance.

## Canonical identity

- Display: **ARCHANGEL AZRAEL**
- Visible level: **Lv. ???**
- Tier: **CELESTIAL MYTHIC**
- Internal field-test level: 99
- Takes real damage; no invulnerability flag.
- Friendly to the player; hostile to monsters.
- Never damages, staggers or knocks back the player in this friendly field test.

## Temporary location

Cinder Region → Scorched Outskirts, vigil around `(1190, 590)`, near the early hunting pockets. Debug builds can use **Near ArchAngel Azrael**.

## Locomotion contract

Azrael is 2D under the hood but should not read as an ordinary walker. His visual cadence is hover/vigil → wing-assisted lift/burst → glide → combat hover/reposition. The Expanded-LPC `run` action is his primary glide and `jump` sells lift/wing-burst startup.

## First celestial kit

| Ability | Job | Presentation |
| --- | --- | --- |
| Celestial Strike | fast close cone | radiant/white-gold arc, wing-energy accents, modest knockback |
| Wing Burst | engage / pass-through | wing flare, rapid glide, arrival shockwave, stronger radial knockback |
| Judgment Blast | ranged pressure | celestial charge/sigil, luminous projectile, sacred impact |
| Heavenfall | signature cluster AoE | long channel, halo/sigil field, vertical heavenly impact, layered explosion, heavy radial knockback, nearby screen shake |

The exact names remain editable later, but these four gameplay jobs are the field-test contract.

## AI contract

- Scan only faction-hostile living enemies inside sense/home limits.
- Slightly prefer useful enemy clusters rather than blindly selecting nearest range.
- Use Heavenfall only on a qualifying cluster and only when its long cooldown is ready.
- Use Celestial Strike in close range, Judgment Blast at meaningful range, Wing Burst as an engage tool, otherwise glide/reposition.
- Retarget quickly after a kill and return toward the vigil when the fight ends.

## Progression safeguard

Azrael-only kills must return before player quest/XP/currency/loot/recovery-drop processing. A shared kill becomes reward-eligible only after recent player damage contribution.

## Performance contract

The full source sheet stays outside runtime. Compact action crops are map-scoped. Projectiles and spark particles use existing pools; procedural sigils/beam/rings are short-lived. Heavenfall is cluster/cooldown limited, and screen shake has distance falloff.

## Deferred polish

- Bespoke SVG celestial crest/emblem.
- Final complete Azrael skill list and boss/story encounter scripting.
- Final story placement/alignment consequences.
- Assassin runtime mob/AI.
- Player endgame holy-route adaptations of selected celestial techniques.
