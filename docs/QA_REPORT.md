# v0.1.1.2 QA report

## Automated checks completed

- `npm run check` validates all referenced runtime assets, stable content relationships, combat profiles, equipment stacking, wing gating, Character-sheet stat math, save normalization and animation geometry.
- Animation geometry now validates explicit frame `sequence` values rather than assuming a simple frame count.
- RGBA source validation confirms the revised body has populated artwork throughout walk, standard slash, one-handed slash, backslash and halfslash sequences.
- Iron War Helm, Legion Cuirass, Legion Gloves and Crimson Bat Wings are checked for near-complete/full populated revised-combat coverage; isolated transparent modular-layer poses are allowed while missing whole actions/directions fail.
- The Arming Sword is checked across all four facings for walk plus all four combo actions, including its 128×128 oversized combat crops.
- The staged Katana is checked across all four facings for every populated walk/slash frame in its 128×128 NPC runtime crops.
- Legion Pauldrons and Legion Boots are verified to advertise only their available basic geometry and to declare the standard-slash fallback explicitly.
- The legacy DCSS sword still validates against walk rows 6–8 and slash rows 9–11, with the side row mirrored for right-facing rendering.
- The four-hit sword profile is verified as 6 / 7 / 12 / 6 visual frames with slash → one-handed slash → backslash → halfslash ordering.
- The save/equipment model is verified to contain all 12 slots and to keep Wings locked by default.
- Wing equip is rejected before its progression flag, accepted after the flag, and its Defense / Max HP / Movement Speed contributions are verified in final stat math.
- Rustblade and staged Katana are rejected as newly player-equippable limited/NPC weapons without disturbing the player's current weapon.
- A schema-1 old-style save with the legacy starter Rustblade equipped is verified to normalize/load successfully and migrate that equipped instance to the Ashen Arming Sword while leaving spare Rustblades untouched.
- The supplied Katana is verified as a staged NPC-only visual with populated 128×128 walk/slash runtime crops and is rejected as newly player-equippable gear.
- Every JavaScript source file under `dist/js` passes `node --check`.

## Source-level behavior checks

- A new character starts with the player-ready Ashen Arming Sword; old schema-1 saves migrate only the equipped legacy Rustblade so returning players immediately receive the four-hit combat profile.
- Player facing is sampled before an attack starts. Combo state resets when the equipped combat profile changes or when the continuation window expires.
- Each combo action controls its own animation duration, visual frame count, hit timing, damage multiplier and range multiplier.
- The layered renderer includes Wings and Shoulders and keeps all visible equipment anchored to the same character position/depth ordering.
- Missing revised armor actions resolve through explicit fallback metadata rather than probing arbitrary source rows.
- Inventory and Character both expose the same 12-slot state, including a visibly locked Wings slot before progression unlock.
- Save normalization merges current world-flag defaults so older schema-1 saves gain `wingsUnlocked: false` safely.

## Visual source-composite check

The runtime crops were also composited offline using the same 64×64 / 128×128 anchor relationship as `LayeredCharacter`. Walk poses and representative start/middle/end frames from all four sword attacks were inspected in all four directions with the revised body + Iron War Helm + Legion Cuirass + Legion Gloves + Crimson Bat Wings + Ashen Arming Sword. The sampled composites stayed aligned and showed distinct attack silhouettes. This is a source/geometry check, not a substitute for the iPhone runtime pass below.

## Licensing / source audit note

The revised body/Katana source credit file and Arming Sword source credit file are preserved with their complete supplied PNGs. Matching generator credits were not supplied for Boots, Gloves, Legion chest, Red Bat Wings, Iron helmet and Shoulders, so those files are explicitly documented as an attribution hold rather than silently marked production-cleared.

## Interactive browser scope

This pass does **not** claim a full interactive browser playthrough. Structural tests, source-level checks and offline composite inspection were completed, but the local headless Chromium attempt did not complete reliably in this environment. Final interaction/touch feel remains an iPhone/GitHub Pages regression item.

## Device verification still required

Automated/source checks cannot establish final iPhone feel or pixel-layer alignment. Before this becomes the new baseline, test on the deployed iPhone build:

1. Start a **new game** and confirm the Ashen Arming Sword appears while idle/walking without swinging.
2. Tap Attack repeatedly and verify four visibly different consecutive motions, then wait and confirm the next tap returns to swing one.
3. Attack up/left/down/right and check the sword stays correctly aligned with the hands/body.
4. Use the development gear helper, equip Iron Helm + Legion shoulders/chest/gloves/boots together, and repeat all four attacks looking for disappearing or badly offset layers.
5. Unlock/equip Crimson Bat Wings in the development helper and confirm they render through movement/attacks and Character shows their buffs.
6. Save, reload and verify all equipped slots/stat totals persist.
7. Load an existing v0.1.1 browser save if available and verify it opens normally, keeps the rest of its previous equipment intact, and upgrades the equipped Rustblade to the Ashen Arming Sword.

Any visual alignment or touch/combo timing defects found in that pass should be repaired as v0.1.1.1.x before beginning the v0.1.2 town/enemy-loadout milestone.


## v0.1.1.2 targeted regression checks

- Run all four attacks in all four directions and watch the planted position for sideways visual drift.
- Confirm NPC/legacy gear cannot be equipped by the player and remains in inventory after loading an older save.
- Confirm full-combo helmet/chest/gloves/wings stay registered through revised attacks.
- Kill several enemies quickly; XP/coin feedback should aggregate instead of producing one popup per kill.
- Confirm no more than three toast messages are visible simultaneously.
