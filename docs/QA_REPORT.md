# QA Report — v0.1.3.2.1 Combat UX & Feel Hotfix

## Automated/static validation

The validator now checks the compact radial HUD structure, fixed Use anchoring, flask-glyph/count/cooldown states, contextual interaction snapshot wiring, explicit basic-attack arcs, stronger Cleave geometry/knockback, live-range-derived Cleave FX, diagnostic range-toggle wiring and staged Azrael/Assassin source dimensions/runtime exclusion. All inherited recovery, save, asset, map-transition and combat checks remain active.

## Physical iPhone release gate

1. Fresh/continued save: confirm Attack, all available skill slots, Use and HP/ES flasks fit without overlap in landscape.
2. Unlock all three skills via Combat Test Kit and verify the skills form an arc around Attack rather than expanding leftward.
3. Recovery Test Kit: drink HP and ES; verify count decrement, shared cooldown, countdown sweep, disabled rapid-tap state and clear zero-count state.
4. Move near Vesra, Ashen Rest, a map transition and dropped loot; verify Use changes to Talk / Rest / Travel / Loot and returns to dimmed Use when leaving range.
5. Toggle Combat Ranges under `?debug=1`: cyan basic cone must be shorter/narrower than orange Cleave.
6. Fight with all four sword-combo stages and verify attacks no longer hit enemies far to the side/behind merely because they are inside the radius.
7. Cleave one, two and several enemies; verify 148px/148° targeting, fire arc alignment, knockback and restrained screen shake.
8. Repeat Cinder ↔ Hollow transitions and Safari background/return; no control displacement, frozen input, missing player layers or lost recovery controls.
9. Run a 10–15 minute mixed combat/recovery session and watch for accumulating graphics, stuck cooldown overlays or slowdown.

No automated interactive browser/iPhone playthrough is claimed. Physical iPhone Safari remains the release gate.

---

## Inherited QA history

# QA Report — v0.1.3.2 Recovery & Consumables

## Automated/static validation

The project validator covers consumable definitions, starting stacks, merchant/drop/recovery-point references, stack merging/consumption, full-pack partial-stack behavior, shared flask cooldowns, HP/Essence restoration, ration combat blocking/interruption, sanctuary full recovery, save quantity normalization and all inherited combat/map invariants. All JS/MJS files must also pass `node --check`.

## Physical iPhone release gate

1. New Game shows 3 HP flasks, 2 Essence flasks and 2 rations as three stacks.
2. Recovery Test Kit lowers resources; HP quick-use restores 35 HP and decrements exactly one flask.
3. Immediately pressing ES is blocked by the shared 4s flask cooldown; after cooldown it restores 28 Essence.
4. Rapid taps never double-consume.
5. A ration starts only while safe, shows meal recovery, heals over time, and is interrupted by taking/dealing damage.
6. Passive HP regeneration begins only after about 9s safe/out of combat; Essence does not passively regenerate.
7. Ashen Rest Hearth restores full HP/Essence and clears combat statuses.
8. Ilyan → Trade allows all three purchases, subtracts ash and merges stacks; full-pack behavior remains safe.
9. Enemy recovery drops can be picked up and merge into existing stacks.
10. Save/reload preserves quantities.
11. Cinder↔Hollow transitions remain stable and recovery controls work immediately after arrival.
12. Safari background/return plus a 10–15 minute mixed combat/recovery session shows no stuck cooldowns, duplicate consumption, frozen controls or material slowdown.

No automated browser playthrough is claimed; physical iPhone Safari is the release gate.

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