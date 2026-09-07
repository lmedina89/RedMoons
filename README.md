# Hell RPG v0.1.3 — Combat Systems Foundation

Built directly from the physical-iPhone-validated **v0.1.2.4.3 Transition Lifecycle Recovery** baseline. v0.1.3 moves the project from one shared melee loop into a reusable, data-driven combat architecture while preserving the separate-map system, combo-safe starter gear, single-slot start/load flow, and staged Demon/Heavenly/transformation source art.

## Combat foundation

- Data-driven player skills, statuses, enemy abilities and projectiles.
- Shared combat resolver for physical, fire, poison, holy and shadow damage tags.
- Pooled projectiles for mobile-conscious arrows, poison spit, blueflame bolts and grave hexes.
- Reusable FX and audio-manager foundations rather than bespoke one-off skill code.
- Expanded action resolution for spellcast, shoot/bow, thrust and hurt reactions, with safe animation fallback.
- Initial status framework: Burn, Poison, Slow, Guard and Stagger.

## Player skills

Three initial skill slots sit above the main Attack control and unlock by level for this foundation build:

- **Ember Cleave** — Level 1 fire-infused cone melee attack with Burn chance.
- **Ashen Guard** — Level 3 temporary damage-reduction / stagger-resistance buff.
- **Ruin Pulse** — Level 5 radial shadow AOE with knockback and Stagger.

Keyboard testing uses **1 / 2 / 3** for the three skill slots. The ordinary Attack button and four-hit sword chain remain intact.

## Enemy ability proofs

The shared framework is exercised by existing enemies instead of adding a giant new roster:

- Blight Imp — Toxic Spit / Poison.
- Blueflame Imp — Blueflame Bolt / Burn.
- Skeleton Archer — Bone Arrow using real shoot/bow action support plus a verified compact bow+arrow overlay.
- Skeleton Mage — Grave Hex using spellcast support and Slow.
- Ashstone Golem — telegraphed Earthshatter radial slam with knockback/Stagger.

## Save migration

Save schema advances from **1 → 2** only to persist skill unlocks and the three equipped skill slots. Existing schema-1 saves migrate in place, retaining character, inventory, equipment, quests, map/location and prior build metadata. Skills appropriate to the saved character level are unlocked during normalization. The browser storage key is intentionally unchanged so existing players are migrated rather than stranded.

## Existing foundations preserved

- Cinder Region ↔ Ashfall Hollow no-refresh map travel.
- Transition lifecycle recovery from v0.1.2.4.3.
- Continue / New Game / Load Save single-slot flow.
- Combo-safe Level-1 starter clothing and four-hit Arming Sword support.
- Corrected Goblin facing and Ashstone Golem death animation.
- Source/runtime art separation and map-scoped/lazy asset preparation.
- `Transformation.png` remains staged source-only for a later transformation milestone; Demon Castle / Heavenly sheets remain staged for future NPCs/mobs.

## Debug

Append `?debug=1`. The diagnostics tray includes **Combat Test Kit**, which raises the test character to at least Level 5, unlocks the three v0.1.3 skills, refills HP/Essence and resets cooldowns. Direct teleports are available for the Archer, Mage, Blight Imp, Blueflame Imp and Golem.

## Physical iPhone release gate

1. Verify normal Attack still executes the four-hit sword chain and starter clothing remains aligned.
2. Test all three player skill buttons repeatedly, including cooldown and insufficient-Essence states.
3. Verify Blight/Blueflame projectiles, Archer arrows, Mage Grave Hex and Golem Earthshatter can be avoided by movement and apply expected statuses when they hit.
4. Confirm Hurt/Stagger do not permanently lock input and status effects expire.
5. Cinder → Hollow → Cinder several times after using skills; immediately move/attack/use skills after every transition.
6. Save a Level 3+ or Level 5 character, reload/Continue, and verify unlocked/equipped skill slots survive.
7. Test Safari background/foreground and a 10–15 minute combat session for duplicate input, audio spam, projectiles that never despawn, or performance degradation.

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
