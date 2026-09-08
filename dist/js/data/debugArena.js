// v0.1.4.4.5.3 debug-only battle laboratory. This data never enters save
// state or production spawn budgets; it only defines safe Warfront arena
// positions and bounded summon presets used under ?debug=1.
export const DEBUG_BATTLE_ARENA_DEF = Object.freeze({
  mapId: 'map_veil_warfront',
  entryId: 'battle_arena',
  spectator: Object.freeze({ x: 3072, y: 2820 }),
  center: Object.freeze({ x: 3072, y: 2460 }),
  maxActors: 14,
  celestialSlots: Object.freeze([
    Object.freeze({ x: 2840, y: 2200 }),
    Object.freeze({ x: 2800, y: 2520 }),
    Object.freeze({ x: 2860, y: 2720 }),
    Object.freeze({ x: 2700, y: 2360 }),
    Object.freeze({ x: 2700, y: 2640 }),
    Object.freeze({ x: 2920, y: 2100 }),
    Object.freeze({ x: 2940, y: 2780 })
  ]),
  infernalSlots: Object.freeze([
    Object.freeze({ x: 3300, y: 2200 }),
    Object.freeze({ x: 3300, y: 2460 }),
    Object.freeze({ x: 3300, y: 2760 }),
    Object.freeze({ x: 3450, y: 2460 }),
    Object.freeze({ x: 3450, y: 2680 }),
    Object.freeze({ x: 3200, y: 2100 }),
    Object.freeze({ x: 3180, y: 2790 })
  ])
});

export const DEBUG_ARENA_NAMED_SUMMONS = Object.freeze({
  azrael: Object.freeze({ faction: 'celestial', label: 'Azrael' }),
  lailani: Object.freeze({ faction: 'celestial', label: 'Lailani' }),
  elexis: Object.freeze({ faction: 'celestial', label: 'El’exis' }),
  zerakoth: Object.freeze({ faction: 'monster', label: 'Zerakoth' }),
  bloodwing: Object.freeze({ faction: 'monster', label: 'Bloodwing Scourge' })
});

export const DEBUG_ARENA_UNIT_SUMMONS = Object.freeze({
  sentinel: Object.freeze({ faction: 'celestial', enemyId: 'enemy_celestial_footsoldier', label: 'First-Light Sentinel' }),
  guardian: Object.freeze({ faction: 'celestial', enemyId: 'enemy_heavenly_guardian', label: 'Heavenly Guardian' }),
  dreadknight: Object.freeze({ faction: 'monster', enemyId: 'enemy_infernal_dreadknight', label: 'Infernal Dreadknight' }),
  hellfire: Object.freeze({ faction: 'monster', enemyId: 'enemy_hellfire_demon', label: 'Hellfire Ashwing' }),
  ashbone: Object.freeze({ faction: 'monster', enemyId: 'enemy_ashbone_demon', label: 'Ashbone Ashwing' }),
  fleshborn: Object.freeze({ faction: 'monster', enemyId: 'enemy_fleshborn_demon', label: 'Fleshborn Ravager' })
});

export const DEBUG_ARENA_GROUPS = Object.freeze({
  celestialNamed: Object.freeze({ named: Object.freeze(['azrael', 'lailani', 'elexis']), units: Object.freeze([]) }),
  infernalNamed: Object.freeze({ named: Object.freeze(['zerakoth', 'bloodwing']), units: Object.freeze([]) }),
  celestialSquad: Object.freeze({ named: Object.freeze([]), units: Object.freeze(['sentinel', 'sentinel', 'guardian']) }),
  infernalSquad: Object.freeze({ named: Object.freeze([]), units: Object.freeze(['dreadknight', 'hellfire', 'ashbone', 'fleshborn']) }),
  allNamed: Object.freeze({ named: Object.freeze(['azrael', 'lailani', 'elexis', 'zerakoth', 'bloodwing']), units: Object.freeze([]) }),
  armyClash: Object.freeze({
    named: Object.freeze(['azrael', 'lailani', 'elexis', 'zerakoth', 'bloodwing']),
    units: Object.freeze(['sentinel', 'guardian', 'dreadknight', 'hellfire', 'ashbone', 'fleshborn'])
  })
});
