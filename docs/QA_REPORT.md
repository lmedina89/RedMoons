# v0.1.3 QA report — Combat Systems Foundation

## Scope

v0.1.3 is built directly from the physical-iPhone-validated **v0.1.2.4.3** baseline. It intentionally preserves the two-map layout and transition lifecycle while adding the first reusable skill/status/projectile/FX/audio/expanded-animation architecture. Save schema advances from 1 to 2 only for persistent skill unlocks and three skill-slot IDs.

## Automated validation completed before packaging

- All registered runtime asset paths exist and all JavaScript passes `node --check`.
- Expanded player/starter/Skeleton spellcast, thrust, shoot and hurt crop dimensions and non-empty source frames are validated against the actual PNG alpha data.
- The original four-hit sword geometry, starter gear compatibility, map transition ordering/lifecycle reset, collision model, loot eligibility and source/runtime separation remain regression checks.
- Skill definitions are limited to the planned Level 1/3/5 foundation set.
- Burn, Poison, Slow, Guard and Stagger definitions are present; all four projectile records and five enemy ability records resolve.
- Blight Imp, Blueflame Imp, Bone Archer, Gravecaller and Ashstone Golem reference the intended abilities and the new Skeleton specialists have real world spawns.
- Schema-1 state is normalized to schema 2, retains old build metadata until next write, preserves existing map/equipment data, and gains skill unlocks appropriate to its saved level.
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

Automated checks can establish structural correctness but cannot substitute for the physical-device gate above. v0.1.3 should not become the next stable checkpoint until player skills, the five enemy ability proofs, schema migration and the existing map-transition regression all pass on iPhone Safari.
