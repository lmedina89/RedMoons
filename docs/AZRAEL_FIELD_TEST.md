# ArchAngel Azrael Field Test — v0.1.3.2.4

## Purpose

This is a temporary gameplay harness for validating a future mythic celestial character and the reusable systems his presence requires. It is **not** final story placement or final balance.

## Canonical identity

- Display: **ARCHANGEL AZRAEL**
- Visible level: **Lv. ???**
- Tier: **CELESTIAL MYTHIC**
- Original field-test level: 99; current canonical level after v0.1.4.4.5.4.3 recalibration: 175
- Takes real damage; no invulnerability flag.
- Friendly to the player; hostile to monsters.
- Never damages, staggers or knocks back the player in this friendly field test.

## Temporary location

Cinder Region → Scorched Outskirts, vigil around `(1190, 590)`, near the early hunting pockets. Debug builds can use **Near ArchAngel Azrael**.

## Locomotion contract

Azrael is 2D under the hood but should not read as an ordinary walker. His visual cadence is hover/vigil → wing-assisted lift/burst → glide → combat hover/reposition. The Expanded-LPC `run` action is his primary glide and `jump` sells lift/wing-burst startup.

## Current seven-skill celestial kit

| Ability | Job | Presentation |
| --- | --- | --- |
| Celestial Strike | fast close cone | radiant/white-gold arc, wing-energy accents, modest knockback |
| Wing Burst | engage / pass-through | wing flare, rapid glide, arrival shockwave, stronger radial knockback |
| Judgment Blast | ranged pressure | staggered three-bolt shallow fan, modest movement lead, luminous straight projectiles, sacred impact |
| Sanctified Nova | frequent surrounded AoE | ancient rotating rune seal, halo/wing corona, 360° sacred shockwave, strong radial knockback |
| Seraphic Judgment | frequent cluster AoE | ancient target seal, three descending light-column pulses, final holy detonation/knockback |
| Sanctuary of the First Light | conditional support field | huge ancient holy seal blooms from beneath Azrael, persists, then sends four healing waves through Azrael/player/celestial allies currently inside |
| Heavenfall | rare signature cluster AoE | long channel, halo/sigil field, vertical heavenly impact, layered explosion, heaviest radial knockback, nearby screen shake |

The exact balance remains editable later, but these seven gameplay jobs are the current field-test contract. Sanctified Nova and Seraphic Judgment intentionally cycle more often than Heavenfall.

## AI contract

- Scan only faction-hostile living enemies inside sense/home limits.
- Slightly prefer useful enemy clusters rather than blindly selecting nearest range.
- Use Sanctuary of the First Light only when an eligible target inside its radius is meaningfully wounded; re-check position on every healing pulse.
- Use Heavenfall only on a large qualifying cluster and only when its long cooldown and shared major-skill pacing lock are ready.
- Use Sanctified Nova when multiple hostiles crowd Azrael and Seraphic Judgment when a useful hostile cluster is marked at short/mid range.
- Never chain major celestial invocations back-to-back; ordinary Strike/Burst/Blast actions remain available while the shared major lock is active.
- Use Celestial Strike in close range, Judgment Blast at meaningful range, Wing Burst as an engage tool, otherwise glide/reposition.
- Retarget quickly after a kill and return toward the vigil when the fight ends.

## Progression safeguard

Azrael-only kills must return before player quest/XP/currency/loot/recovery-drop processing. A shared kill becomes reward-eligible only after recent player damage contribution.

## Performance contract

The full source sheet stays outside runtime. Compact action crops are map-scoped. Projectiles and spark particles use existing pools; procedural sigils/beams/rings are short-lived. Nova/Judgment/Sanctuary use bounded graphics and burst counts, Sanctuary owns only one persistent redraw surface plus four pulse events, all major skills are cooldown/pacing limited, and screen shake has distance falloff.

## Deferred polish

- Bespoke SVG celestial crest/emblem.
- Final complete Azrael skill list and boss/story encounter scripting.
- Final story placement/alignment consequences.
- Assassin runtime mob/AI.
- Player endgame holy-route adaptations of selected celestial techniques.


## v0.1.4.4.3.2 Judgment Blast reliability correction

Physical testing exposed that Judgment Blast appeared to miss nearly all targets. Audit found a concrete integration defect rather than a balance-only problem: its projectile launch supplied `sourceId` but omitted Azrael as `sourceActor`. The shared projectile manager derives valid hostile targets from the firing actor, so the old blast had no target list and could never enter the normal damage resolver.

The repaired cast now launches three straight, wall-blocked bolts at 0/90/180 ms. Each shot samples the target's live position/velocity, applies a modest movement lead and uses a shallow perpendicular fan offset. This is intentionally **not homing**. Damage shares are 0.60/0.45/0.45 of the old single-blast configured budget, the projectile collision radius is 16 px, and Judgment impacts use a slightly stronger celestial burst for hit readability. All other Azrael abilities remain unchanged.
