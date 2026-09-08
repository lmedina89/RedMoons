# Zerakoth, Warden of the Pit — Field Test

## v0.1.4.4.5.2 scope

Zerakoth is the first named **commander-tier** Infernal between the reusable Lv30 Dreadknight and the Lv94 Bloodwing Scourge. His visible level remains `Lv. ???`; his internal combat level is **60** and his threat tier is **commander**.

He is debug-only in this release. The production Living Warfront remains exactly 32 regular actors.

## Fixed presentation

Zerakoth uses the preserved `Truetrans.png` authoring sheet as his humanoid/wing identity. The source sheet is unchanged and never preloaded at runtime. Compact walk/slash/hurt derivatives are combined with a fixed black/crimson **Warden's Warplate** layer and a permanent **Warden's Hellblade**. His loadout never rolls randomly.

## Six-skill commander kit

- **Warden's Rend** — heavy close sword punish.
- **Pitbound Rush** — collision-aware fiery engage/reposition strike.
- **Ashen Decree** — wide short-range dark pressure/control wave.
- **Hellbrand Volley** — four staggered, wall-blocked infernal projectiles.
- **Ward of the Pit** — existing shared Guard/status mitigation with Zerakoth-specific infernal VFX.
- **Pitfall Eruption** — targeted commander AoE. It keeps its ordinary cluster gate, but may fire against a single mythic/apex worthy target through the shared threat hierarchy.

All damage uses the existing faction relationship resolver. Zerakoth cannot hurt ordinary demons, the Infernal Dreadknight, Bloodwing Scourge, or future same-faction Infernal actors.

## Debug controls

With `?debug=1`:

- **Zerakoth Field Test** — moves to his infernal-front observation position.
- **Zerakoth Solo Test** — restarts into a clear southern observation pocket, suspends normal production enemies for that scene instance, and cycles 3–5 ordinary Celestials against Zerakoth only.
- **Zerakoth AI Overlay** — displays HP, Lv60/commander identity, AI state/action, current target/tier, Ward state, and major-lock timing.

Solo deaths bypass normal XP, ash, loot, quest, and production-reward handling. Reloading/leaving the Warfront restores normal production actors.

## Physical iPhone test focus

1. Confirm Warden's Warplate and Hellblade stay aligned through all four facings, movement, attacks, hurt, Rush, and ability casts.
2. Confirm the character reads clearly above the Lv30 Dreadknight but below Bloodwing's mythic spectacle.
3. Watch for all six abilities over repeated solo waves, especially Ward when wounded and Pitfall Eruption against groups.
4. Verify Hellbrand shots collide with world solids and never hit demon allies in the normal field test.
5. Watch sustained solo waves for frame pacing, excess particles, stuck pursuit, or collision snagging.
