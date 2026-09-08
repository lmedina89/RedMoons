# Lailani Field Test — v0.1.4.4.3.1

## Purpose

This is the first focused runtime validation of **Lailani, Transcendent Seraph**. It establishes her combat identity and performance envelope before final celestial-base placement or named-character deployment logic.

## Identity

- Display: **LAILANI** / **TRANSCENDENT SERAPH** on separate readable mythic-nameplate lines
- Tier: celestial mythic / unique special actor
- Internal field-test level: 96
- Takes real damage; she is not invulnerable.
- Friendly to the player and ordinary celestial forces; hostile to infernal actors.
- Deliberately faster and more mobile than Azrael, but with a different role and presentation rather than a direct power copy.

## Temporary field-test position

Lailani is stationed on the Dawnward side of the **Axis of First Light** around `(3660, 1510)`. `?debug=1` exposes **Lailani Field Test**, which approaches through the `lailani_test` entry. This is temporary placement chosen so existing infernal Axis patrols can exercise her AI. Her combat simulation sleeps beyond a 1200px player-distance gate, preventing unseen mythic fighting while the player explores distant Warfront sectors.


## Solo observation loop

`?debug=1` now exposes **Lailani Solo Test** in addition to the normal field test. The command restarts the Warfront into a clean southern observation pocket around `(4200, 2700)`, temporarily suspends the normal 32 production soldiers, and cycles four bounded 3–5 demon wave templates. Solo demons target Lailani only. Their dedicated death callback does not grant XP, ash, loot, quest credit, or production kill rewards. A heavier authored wave includes Fleshborn pressure. After each clear, the next wave starts after roughly two seconds. Reloading/leaving the Warfront restores ordinary Warfront deployment.

This harness is intentionally debug-only and does not change Lailani's production home, seven ability values, or the 32-actor Living Warfront population definition.

## Seven-skill contract

| Ability | Job | Presentation |
| --- | --- | --- |
| Mantle of the Empyrean | 60-second transcendent state | persistent luminous aura, five-second holy pulses, defense and small regeneration |
| Seraphic Passage | rapid engage/pass-through | high-speed luminous dash with trailing celestial ribbon |
| Lances of the Seventh Sky | frequent ranged pressure | five descending/launching celestial lances |
| Celestial Waltz | signature mobility chain | four graceful reposition-strikes around a target |
| Halo of Still Waters | space control | expanding geometric holy ring with damage and slow |
| Garden of Heaven | major area bloom | layered celestial blooms/petals/sigils over three pulses |
| Transcendent Dawn | rare signature | layered heavenly geometry and descending light culminating in a major holy impact |

## Mantle contract

Mantle lasts exactly **60 seconds**. While active, Lailani receives a resolved incoming-damage multiplier of `0.74` and a small self-heal pulse every five seconds (`1.2%` max HP when wounded). Its persistent aura is intentionally elegant and bounded; pulse blooms provide the stronger visual beats.

## Movement contract

Lailani should appear to dance through combat. Her ordinary pursuit includes curved lateral/orbit motion instead of simply walking straight at a victim. Seraphic Passage provides a genuine fast dash, and Celestial Waltz performs four short reposition-strikes. Complete source-sheet walk/spell/attack actions are used; incomplete expanded run actions are deliberately excluded.

## Architecture safeguard

Lailani has a dedicated `entities/Lailani.js` controller and `data/lailani.js` definition. She is not implemented by importing/subclassing Azrael or modifying his ability/controller files. Shared combat resolution, statuses, audio and pooled FX remain reusable services.

## Physical test checklist

Use an iPhone in landscape with `?debug=1`. Use **Lailani Field Test** for production-context behavior, then use **Lailani Solo Test** for uninterrupted ability observation without friendly army assistance. Confirm: movement looks graceful rather than jittery; Mantle remains readable for a full minute; the heal/defense state does not make her effectively immortal; Passage and Waltz visibly reposition her; Lances, Halo, Garden and Dawn are visually distinguishable; ordinary army effects remain below her spectacle; and overlapping Warfront combat remains smooth. Revisit Cinder afterward to verify Azrael still behaves exactly as before.

## Deferred

- Final Celestial Stronghold home/deployment schedule.
- Azrael relocation and Cinder residual-squad cleanup.
- Lexi field test.
- Mythical Demon and Ancient Demon Lord field tests.
- Azrael simple-projectile accuracy/readability investigation after further physical observation.
