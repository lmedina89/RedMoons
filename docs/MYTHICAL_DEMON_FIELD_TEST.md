# v0.1.4.4.5 — Mythical Demon Field Test + Power Hierarchy Foundation

## Purpose

This pass activates the staged `DemonMythical.png` character as the first infernal named mythic while establishing a reusable hierarchy for future named angel/demon duels. It does not activate `AncientDemonLord.png`; that source remains reserved for the later Level-98 apex pass.

## Canonical hierarchy

| Actor | Internal level | Threat tier | Visible level |
| --- | ---: | --- | --- |
| Mythical Demon — Bloodwing Scourge | 94 | mythic | `???` |
| Lailani — Transcendent Seraph | 96 | mythic | `???` |
| Ancient Demon Lord (reserved/source-only) | 98 | apex | TBD |
| ArchAngel Azrael | 99 | apex | `???` |
| El’exis — Mother of the Host | 99 | apex | `???` |
| Future player cap | 100 | progression cap, not a threat tier | normal |

Threat tier and RPG level intentionally answer different questions. Level expresses progression/stat scale. Threat tier tells AI whether one opponent is important enough to justify a crowd/signature ability.

## Worthy-single-target rule

Major abilities retain their old cluster requirements against ordinary enemies. A configured ability may also become eligible when its one target meets `worthyTargetTier`. Current mythic-vs-mythic overrides require at least `mythic`. Cooldowns, ranges, and major pacing locks still apply, so the rule enables escalation without creating immediate ultimate spam.

This pass also updates shared hit resolution where necessary so a chosen named target can actually receive the attack. In particular, Azrael's shared cone/radial damage helpers and player attack/skill targeting now use faction-aware hostile target lists and `damageTarget`, allowing hostile special actors to participate in real combat.

## Mythical Demon kit

1. **Abyssal Ascendance** — long-lived infernal empowerment with bounded mitigation, damage amplification and small self-heal pulses.
2. **Rending Talon** — frequent close-range infernal claw strike.
3. **Bloodwing Rush** — fast linear winged rush with segment damage.
4. **Hellspine Volley** — staggered five-projectile infernal fan.
5. **Maw of the Void** — multi-pulse shadow/blood field; major skill, cluster-or-worthy.
6. **Crimson Eclipse** — larger infernal execution field; major skill, cluster-or-worthy.
7. **Cataclysm of the First Pit** — rare signature rupture/execution; major skill, cluster-or-worthy.

The controller is independent of Azrael, Lailani and El’exis. Its presentation uses a separate red/crimson/purple infernal language and the actor remains vulnerable to normal resolved damage/status rules with high mythic resistances rather than invulnerability.

## Runtime art policy

The full Expanded-LPC source sheet stays under `source-assets/character-concepts/2026-09-07/demon-castle/DemonMythical.png`. Runtime streams only seven verified complete upper action blocks: spellcast, thrust, walk, slash, shoot, hurt and idle. Incomplete later authoring blocks are not guessed or shipped as runtime actions.

## Debug tests

With `?debug=1`:

- **Mythical Demon Field Test** — moves near the live named demon on the infernal approach.
- **Mythical Demon Solo Test** — restarts into an isolated southwest observation pocket, suspends the normal 32 production soldiers for that scene instance, and recycles 3–5 Celestial waves against the Mythical Demon only.
- **Mythical Demon AI Overlay** — exposes state/action/target/HP/Ascendance/internal level for diagnostics.

Solo deaths bypass production reward handling. Reloading/leaving the Warfront restores the standard Living Warfront population.

## Physical-device gate

1. Run the solo test for multiple waves and confirm all seven actions are visually distinct.
2. Confirm Ascendance lasts without leaving orphan aura graphics or causing sustained frame degradation.
3. Confirm Cataclysm/Eclipse/Maw remain readable on iPhone landscape and do not overlap into permanent screen clutter.
4. In a mythic-vs-mythic 1v1, confirm major abilities actually escalate despite only one opponent.
5. In a 1v1 against one ordinary soldier, confirm the same signature skills remain crowd-gated.
6. Confirm the player can damage the Mythical Demon with basic attacks and current skills.
7. Confirm Celestial named actors can damage it with both projectiles and shared cone/radial abilities.
8. Confirm normal Warfront actors remain 32 and distant mythic simulation sleeps outside the 1200px player gate.
