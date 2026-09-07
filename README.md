# Hell RPG v0.1.3.1 — Combat Polish & Skill Feel

Built directly from the physical-iPhone-validated **v0.1.3 Combat Systems Foundation** baseline. This is a focused feel/animation pass: it does not redesign the maps or add a large progression tree.

## Combat feel changes

- **Ember Cleave** is more touch-friendly: range increases to **132 px** and the cone to **126°**, while keeping the same Rank-1 damage multiplier.
- **Ruin Pulse** keeps a controlled radius but gains **1.18× damage**, **260 knockback**, stronger screen shake and layered procedural ring/impact FX.
- **Ashen Guard** stays at its validated Rank-1 balance.
- Skill buttons now expose clearer cooldown progress, Rank badges and active status chips near the combat controls.

## True run + safe animation policy

The active starter body/outfit now has a genuine **8-frame LPC run cycle** instead of only accelerating the walk cycle. True run is used only when every visible non-held body/armor layer explicitly supports it. Incompatible future/legacy equipment automatically falls back to the proven fast-walk presentation rather than drifting or exposing mismatched frames. Held weapons/shields may reuse a safe walk pose while sprinting.

Combat-stance-specific art is intentionally deferred until a complete compatible player/equipment stance set is verified; this build does not guess at unverified LPC rows.

## Bone Spearman

Bone Road now contains a **Bone Spearman** using the preserved LPC long-spear thrust artwork. Its **Bone Lunge** has a visible line telegraph, locked aim direction, extended melee reach and a real thrust animation, so sidestepping the warned line can avoid the hit. One generic Ash Skeleton spawn was replaced so the Cinder-region actor cap does not increase.

## Skill-rank foundation

Save schema remains **2**. Skill state now persists a `ranks` map and all three current skills expose **Rank 1–5** data-driven growth hooks. Existing v0.1.3 saves without rank data normalize safely to Rank 1. Rank scaling is already resolvable by the combat controller, but the actual Skill Point spending/upgrade-choice UI remains deliberately deferred to a later progression milestone.

## Existing v0.1.3 systems preserved

- Ember Cleave, Ashen Guard and Ruin Pulse.
- Burn, Poison, Slow, Guard and Stagger.
- Blight Imp Toxic Spit, Blueflame Bolt, Bone Archer, Gravecaller and Golem Earthshatter.
- Pooled projectiles, procedural combat FX and mobile-conscious WebAudio SFX foundation.
- Cinder Region ↔ Ashfall Hollow no-refresh map travel.
- Continue / New Game / Load Save and schema-1→2 migration.
- Combo-safe Level-1 starter gear and the existing four-hit sword chain.
- Staged `Transformation.png`, Demon Castle and Heavenly/unique source sheets remain source-only.

## Debug / physical iPhone gate

Append `?debug=1`. **Combat Test Kit** still unlocks/refills the v0.1.3 combat kit, and **Near Spearman** jumps to the new thrust test enemy.

Test Cleave reach/width, Pulse impact, Guard regression, true run in all four directions, true-run fallback after equipping incompatible gear, Spearman telegraph/thrust from all facings, status/cooldown readability, Cinder↔Hollow travel after combat, save/Continue rank normalization, Safari background/return, and a 10–15 minute stress session.

## Run locally

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080/`. Phaser 3.90.0 remains vendored under `dist/vendor/`.

## Checks

```bash
npm run check
find dist/js tests -type f \( -name '*.js' -o -name '*.mjs' \) -print0 | xargs -0 -n1 node --check
```

The ZIP is intended to remain repo-root ready for GitHub Pages.
