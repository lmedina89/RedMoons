# Hell RPG v0.1.3.2.1.2 — Final Combat HUD Tightening

Built directly from **v0.1.3.2.1.1 HUD Position & Hearth Visibility Hotfix**. Save schema remains **2** and the localStorage key remains unchanged.


## v0.1.3.2.1.2 final phone-position pass

- Shifted the complete right-side combat wheel slightly farther **right and down** while retaining the same touch-target sizes and safe-area anchoring.
- Pulled `Use` another step toward Attack and moved the HP/ES quick-use pair right/down so more of the central playfield stays visible.
- Tightened Skill I/II slightly and pulled **Skill III substantially inward/downward** to complete the upper Attack arc instead of floating above the wheel.
- Preserved the v0.1.3.2.1.1 Ashen Rest Hearth visibility/recovery changes and all Cleave/recovery tuning.
- Save schema remains 2; no progression state is reset.

## v0.1.3.2.1.1 phone-layout correction

- Shifted the entire right-side combat cluster closer to the iPhone safe-right edge without shrinking touch targets.
- Moved `Use` roughly one control-width toward Attack and moved the HP/ES pair up and right so they no longer sit across the center combat lane.
- Tightened Skill II/III around the upper Attack arc while preserving separation from Attack and utility controls.
- Made **Ashen Rest Hearth** much easier to find: it is directly south/below the **Ashen Rest** inn in Cinder Refuge and now has a pulsing green/gold `HEAL` marker. Interacting there fully restores HP + Essence, clears statuses and resets recovery cooldowns.
- Save schema remains 2. No progression or item state is reset.


This focused hotfix fixes the physical-iPhone combat-UI problems found after v0.1.3.2 and retunes Ember Cleave so it has a clear skill identity before the ArchAngel Azrael field-test build.

## Mobile combat HUD

- Attack remains the fixed bottom-right anchor.
- Skill I / II / III now use a compact **radial/fan layout around Attack** instead of a horizontal row that could push `Use` toward the middle of the screen.
- `Use` has its own fixed utility position and now changes to **Talk / Rest / Travel / Loot** when an interaction is actually in range; it dims when nothing is nearby.
- HP and Essence recovery buttons are kept in a fixed utility cluster above `Use`, with recognizable flask glyphs, visible counts, empty state and cooldown sweep/countdown.
- Recovery buttons are disabled during their shared flask cooldown so rapid taps do not look actionable while the system is cooling down.
- The whole right-side control cluster is smaller and safe-area anchored for iPhone landscape.

## Ember Cleave feel correction

The previous Cleave had more numerical range than a normal swing but the normal melee hit test was extremely broad and Cleave's visual arc was shorter than its real hit area, which could make the basic attack *feel* larger.

v0.1.3.2.1 makes that distinction explicit:

- Basic sword attacks now use data-driven directional arcs (96°–120° across the combo) instead of an almost-half-circle forward test.
- Ember Cleave Rank 1 now uses **148 px range**, **148° arc**, **1.50× attack damage** and **145 knockback**.
- Cleave's fire arc is drawn from the resolved live skill range/arc rather than a hard-coded smaller radius.
- Successful Cleave hits add restrained screen-shake feedback, stronger with multi-target hits.
- `?debug=1` adds **Combat Ranges**: cyan shows the current/basic sword cone and orange shows Ember Cleave's real cone.

## Staged next-build source characters

The new full 832×3456 sheets are preserved under `source-assets/` only in this hotfix and are **not preloaded by the runtime yet**:

- `heavenly-and-unique/HoodedAzrael.png` — canonical **ArchAngel Azrael**, unique mythic/celestial NPC. Planned public presentation: `ArchAngel Azrael`, `Lv. ???`, custom mythic nameplate, hover/glide locomotion and spectacular high-level combat.
- `human-hostile/Assassin.png` — reusable hostile human assassin/skirmisher source.

Both sheets were verified as 64×64-cell Expanded-LPC layouts (832×3456). Their canonical row map and intended animation use are documented with the source art.

## Next checkpoint

After this build passes physical iPhone testing, **v0.1.3.2.2 — ArchAngel Azrael Field Test** is planned to add faction-aware NPC combat, Azrael's real high-level damage intake/stats, monster-only targeting, hover/glide AI, flashy celestial skills, radial knockback, proximity-scaled screen shake and performance-capped effects.

## Physical iPhone test gate

Append `?debug=1` when useful.

1. Confirm HP/ES flask buttons are obvious and remain visible with all three skills unlocked.
2. Use Recovery Test Kit, drink HP/ES flasks, test cooldown/empty states and rapid tapping.
3. Confirm `Use` stays fixed while skill slots populate and changes to Talk/Rest/Travel/Loot only when appropriate.
4. Toggle **Combat Ranges**. Cyan basic attacks must be visibly shorter/narrower than orange Cleave.
5. Test Cleave against 1, 2 and 3+ enemies; verify its real hit area, visible fire arc, knockback and feedback agree.
6. Repeat Cinder ↔ Hollow transitions and Safari background/return; controls must remain responsive and correctly positioned.

Automated validation cannot replace this physical-device gate.

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

The ZIP remains repo-root ready for GitHub Pages.

---

## Inherited v0.1.3.2 recovery foundation

Built directly from the physically tested **v0.1.3.1 Combat Polish & Skill Feel** baseline. This is a focused recovery-loop release: it adds reliable ways to restore HP/Essence and reusable consumable infrastructure without redesigning the maps or changing the working combat foundation.

## Recovery loop

- **Minor Ashblood Flask** — restores **35 HP**.
- **Minor Essence Flask** — restores **28 Essence**.
- HP and Essence flasks share a **4-second flask cooldown**, preventing potion spam while keeping both available from the mobile HUD.
- **Cinder Ration** — restores **28 HP over 7 seconds** outside combat. Nearby hostiles block starting a meal, and taking/dealing damage interrupts it.
- Slow passive HP recovery begins after **9 seconds** of safety/out-of-combat time at **0.6% max HP/sec**. It restores no Essence and shuts off around nearby hostiles.
- **Ashen Rest Hearth** in Cinder Refuge fully restores HP and Essence, clears combat statuses and resets recovery cooldowns.

## Inventory, quick-use and supplies

Recovery items are normal persistent inventory instances with **stack quantities up to 20**. Existing schema-2 saves and older inventory entries without a quantity field normalize safely to quantity 1. A full 30-slot pack can still merge a pickup/purchase into an existing partial stack; an operation that would require another slot fails atomically.

New characters start with:

- 3 × Minor Ashblood Flask
- 2 × Minor Essence Flask
- 2 × Cinder Ration

Two compact landscape buttons sit beside the combat controls: **HP** and **ES**. Keyboard equivalents are **4** and **5**. Consumables can also be used from Inventory.

**Ilyan** now opens a small Field Supplies shop after dialogue and sells all three foundation recovery supplies. Enemies can occasionally drop recovery supplies so combat replenishes some resources, while the merchant prevents bad RNG from stranding a character.

## Existing combat/world systems preserved

- v0.1.3.1 Cleave/Pulse tuning, true run and Bone Spearman/Bone Lunge.
- Skill Rank 1–5 data hooks and save schema 2.
- Ember Cleave, Ashen Guard, Ruin Pulse.
- Burn, Poison, Slow, Guard and Stagger.
- Blight Imp, Blueflame Imp, Bone Archer, Gravecaller and Golem specialist abilities.
- Cinder Region ↔ Ashfall Hollow no-refresh map travel.
- Continue / New Game / Load Save and schema migration.
- Combo-safe starter gear and preserved source art.

## Debug / physical iPhone gate

Append `?debug=1` and use **Recovery Test Kit** to add supplies and lower HP/Essence for fast testing.

Test HP/ES quick use and the shared cooldown, ration start/interruption, passive HP recovery, Ashen Rest Hearth, Ilyan purchases/stack merging, recovery loot pickups, save/reload quantities, Cinder↔Hollow transitions with recovery buttons immediately available, Safari background/return, and a 10–15 minute combat/recovery stress session.

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
