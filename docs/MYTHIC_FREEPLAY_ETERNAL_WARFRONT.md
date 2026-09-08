# Mythic Freeplay Eternal Warfront

v0.1.4.4.5.4.1 introduces a session-only Warfront population selected only when `sessionMode === 'azrael_freeplay'` and the active map is `map_veil_warfront`.

## Population contract

- Campaign Living Warfront: 32 regular actors, unchanged.
- Mythic Freeplay Eternal Warfront: 54 regular actors.
- Freeplay split: 34 Infernal / 20 Celestial.
- Regular activation ranges: 760–980 px.
- Approximate coarse-grid maximum awake regular population: 20.
- Named special actors remain outside the regular-actor budget.

## Freeplay Infernal rank ladder

- Lv22 Abyss Warwing Veteran
- Lv25 Gravesworn Veteran
- Lv30 Infernal Dreadknight
- Lv34 Ossuary Knight
- Lv36 Hellfire Veteran
- Lv42 Ashbone Praetorian
- Lv47 Dread Ossuary Champion
- Lv53 Fleshborn Executioner
- Lv60 Zerakoth, Warden of the Pit
- Lv94 Bloodwing Scourge
- Lv98 Ancient Demon Lord remains reserved

Gravesworn Veteran, Ossuary Knight and Dread Ossuary Champion use complete fixed armor/weapon loadouts. Existing campaign skeleton definitions and their randomized equipment remain unchanged.

## Isolation

The Freeplay spawn table is not merged into `SPAWN_REGIONS`. `WorldScene` and `AssetResolver` select it only for Azrael Mythic Freeplay on the Warfront. Freeplay kills still bypass campaign rewards and save writes.
