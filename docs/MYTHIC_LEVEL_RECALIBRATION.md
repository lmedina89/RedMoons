# Mythic Level Recalibration — v0.1.4.4.5.4.3

## Canonical supernatural levels

The supernatural ceiling remains Level 250. This release locks the current named-mythic levels to:

| Character | Level | Threat tier | Stat budget | Resource |
| --- | ---: | --- | ---: | --- |
| Bloodwing Scourge | 135 | mythic | 690 | Infinite Essence |
| Lailani | 150 | mythic | 765 | Infinite Essence |
| El’exis | 150 | apex | 765 | Infinite Essence |
| Ancient Demon Lord (reserved) | 160 | apex | 815 | Infinite Essence |
| Azrael | 175 | apex | 890 | Infinite Essence |

Zerakoth remains Level 60 / commander and Infernal Dreadknight remains Level 30 / elite. Threat tier is deliberately independent of numeric level.

## Primary-stat rule

All canonical sheets use the shared progression rule:

`statBudget(level) = 20 + ((level - 1) × 5)`

SPR remains a finite primary stat. **Infinite Essence** is a supernatural resource rule, not an infinite SPR value. This preserves legal character-sheet arithmetic while allowing mythic abilities to be used without a mana drain.

## Auto-assigned role weighting

The new allocations scale each character's already-established stat identity into the new legal budget rather than inventing a new archetype:

| Character | STR | DEX | VIT | SPR | Total | Identity |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Bloodwing | 235 | 171 | 206 | 78 | 690 | STR/VIT-heavy infernal ravager |
| Lailani | 124 | 278 | 162 | 201 | 765 | DEX/SPR-heavy transcendent skirmisher |
| El’exis | 143 | 128 | 217 | 277 | 765 | SPR/VIT-heavy Dominion support |
| Ancient Demon Lord | 274 | 145 | 283 | 113 | 815 | STR/VIT-heavy ancient apex |
| Azrael | 305 | 175 | 288 | 122 | 890 | STR/VIT-heavy apex warrior |

## Combat-preservation rule

This release does **not** derive HP, attack or defense from the expanded sheets yet. Existing physically tested combat values remain hand-tuned and definitions remain marked `combatStatsMode: hand_tuned_preserved`.

That separation is intentional: canonical level/stat identity can now grow beyond Level 100 without unexpectedly changing approved AI fights, Freeplay feel, or Warfront balance. A later combat-scaling pass can be designed and tested independently if desired.

## Freeplay resource behavior

Azrael Mythic Freeplay exposes the resource as `∞ Essence`. Current named mythic AI already casts from cooldown/AI pacing rather than consuming the player's normal Essence pool; the explicit `resourceModel: infinite_essence` metadata makes that contract reusable for future Lailani, El’exis, Bloodwing, Ancient Demon Lord and fallen-angel Freeplay controllers.
