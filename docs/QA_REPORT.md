# v0.1.3.1 QA report — Combat Polish & Skill Feel

## Scope

v0.1.3.1 is built directly from the physical-iPhone-validated **v0.1.3 Combat Systems Foundation** baseline. It preserves the two-map/transition lifecycle and the shared combat architecture while polishing skill feel, adding true run, the Bone Spearman thrust proof, status/cooldown readability, and future skill-rank storage/scaling hooks. Save schema remains **2**; existing v0.1.3 schema-2 saves without `skills.ranks` normalize to Rank 1.

## Automated validation completed before packaging

- All registered runtime asset paths exist and all JavaScript passes `node --check`.
- Expanded player/starter true-run plus spellcast/thrust/shoot/hurt crop dimensions and non-empty source frames are validated against the actual PNG alpha data; the 192px Bone Spearman thrust sheet is also geometry/alpha checked.
- The original four-hit sword geometry, starter gear compatibility, map transition ordering/lifecycle reset, collision model, loot eligibility and source/runtime separation remain regression checks.
- Skill definitions remain limited to the planned Level 1/3/5 foundation set; Cleave/Pulse tuning and Rank 1–5 normalization/scaling hooks are validated.
- Burn, Poison, Slow, Guard and Stagger definitions are present; all four projectile records and six enemy ability records resolve.
- Blight Imp, Blueflame Imp, Bone Archer, Gravecaller, Bone Spearman and Ashstone Golem reference the intended abilities and the Skeleton specialists have real world spawns.
- Schema-1 state is normalized to schema 2, retains old build metadata until next write, preserves existing map/equipment data, and gains skill unlocks appropriate to its saved level; schema-2 v0.1.3 saves gain safe Rank-1 defaults without another schema bump.
- Mobile skill buttons, keyboard 1/2/3 input and Combat Test Kit wiring are statically verified.

## Physical iPhone release gate

1. **Regression first:** Cinder → Hollow → Cinder several times; move, Attack and use skills immediately after every transition. No reset/refresh, invisible player or frozen simulation.
2. New Game: confirm starter clothes remain aligned through all four ordinary sword attacks.
3. Level 1: use **Ember Cleave** repeatedly; verify Essence cost, 4s cooldown, cone targeting, fire FX and occasional Burn.
4. Use Combat Test Kit or level naturally: confirm **Ashen Guard** and **Ruin Pulse** populate slots at Levels 3/5 and survive save/reload.
5. Ashen Guard: compare incoming damage while active and verify it expires; ensure Stagger resistance never creates permanent control immunity.
6. Ruin Pulse: test several enemies around the player; verify radial hit, knockback/Stagger and no permanent enemy lock.
7. Blight Imp: dodge Toxic Spit; on hit verify Poison ticks/stacking and expiration.
8. Blueflame Imp: dodge Blueflame Bolt; on hit verify Burn behavior.
9. Bone Archer: verify the visible bow+arrow shoot overlay stays aligned through all facings, then confirm straight non-homing arrow travel, wall collision/lifetime and damage on hit.
10. Gravecaller: verify spellcast action, Grave Hex travel and temporary Slow.
11. Ashstone Golem: verify visible Earthshatter ground telegraph appears before the slam and movement can escape it.
12. Hurt/Stagger: confirm the player regains movement/Attack/skills after effects expire.
13. Save a pre-v0.1.3/schema-1 character at Level 3+ or 5, deploy this build, Continue, and verify map/location/equipment/progression remain intact while correct skills appear.
14. Background Safari and return during/after combat; verify input, projectiles, status timers and SFX do not duplicate or permanently stop.
15. Run 10–15 minutes of combat and multiple transitions; look for projectile trails that never disappear, increasing slowdown, duplicated sounds/toasts or stuck telegraphs.

## Release decision

Automated checks can establish structural correctness but cannot substitute for the physical-device gate above. v0.1.3.1 should not become the next stable checkpoint until the tuned player skills, Bone Spearman/true-run additions, existing enemy ability proofs, rank normalization and map-transition regression all pass on iPhone Safari.

## v0.1.3.1 physical-device additions

- Confirm Ember Cleave feels wider/longer without hitting clearly rearward targets.
- Confirm Ruin Pulse has stronger feedback/knockback and does not destabilize movement.
- Sprint in all four directions in the starter outfit; equip an incompatible legacy/revised layer and verify safe accelerated-walk fallback instead of frame drift.
- Use `Near Spearman`; verify visible spear, line telegraph, thrust animation, sidestep avoidance and recovery in all facings.
- Verify status chips, cooldown sweep and rank badges remain readable without obstructing Attack/Use.
- Continue a v0.1.3 schema-2 save with no `skills.ranks`; all unlocked skills should appear at Rank 1.
