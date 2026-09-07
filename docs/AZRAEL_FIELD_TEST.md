# ArchAngel Azrael Field Test — v0.1.3.2.3

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

## Current six-skill celestial kit

| Ability | Job | Presentation |
| --- | --- | --- |
| Celestial Strike | fast close cone | radiant/white-gold arc, wing-energy accents, modest knockback |
| Wing Burst | engage / pass-through | wing flare, rapid glide, arrival shockwave, stronger radial knockback |
| Judgment Blast | ranged pressure | celestial charge/sigil, luminous projectile, sacred impact |
| Sanctified Nova | frequent surrounded AoE | ancient rotating rune seal, halo/wing corona, 360° sacred shockwave, strong radial knockback |
| Seraphic Judgment | frequent cluster AoE | ancient target seal, three descending light-column pulses, final holy detonation/knockback |
| Heavenfall | rare signature cluster AoE | long channel, halo/sigil field, vertical heavenly impact, layered explosion, heaviest radial knockback, nearby screen shake |

The exact balance remains editable later, but these six gameplay jobs are the current field-test contract. Sanctified Nova and Seraphic Judgment intentionally cycle more often than Heavenfall.

## AI contract

- Scan only faction-hostile living enemies inside sense/home limits.
- Slightly prefer useful enemy clusters rather than blindly selecting nearest range.
- Use Heavenfall only on a large qualifying cluster and only when its long cooldown and shared major-skill pacing lock are ready.
- Use Sanctified Nova when multiple hostiles crowd Azrael and Seraphic Judgment when a useful hostile cluster is marked at short/mid range.
- Never chain major celestial invocations back-to-back; ordinary Strike/Burst/Blast actions remain available while the shared major lock is active.
- Use Celestial Strike in close range, Judgment Blast at meaningful range, Wing Burst as an engage tool, otherwise glide/reposition.
- Retarget quickly after a kill and return toward the vigil when the fight ends.

## Progression safeguard

Azrael-only kills must return before player quest/XP/currency/loot/recovery-drop processing. A shared kill becomes reward-eligible only after recent player damage contribution.

## Performance contract

The full source sheet stays outside runtime. Compact action crops are map-scoped. Projectiles and spark particles use existing pools; procedural sigils/beams/rings are short-lived. Nova/Judgment use bounded graphics and burst counts, all major skills are cooldown/pacing limited, and screen shake has distance falloff.

## Deferred polish

- Bespoke SVG celestial crest/emblem.
- Final complete Azrael skill list and boss/story encounter scripting.
- Final story placement/alignment consequences.
- Assassin runtime mob/AI.
- Player endgame holy-route adaptations of selected celestial techniques.
