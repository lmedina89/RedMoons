// v0.1.4.4.5.4.1 Mythic Freeplay Eternal Warfront.
// This population is selected only for disposable Mythic Freeplay sessions on
// the Veil Warfront. The campaign WARFRONT_SPAWN_REGIONS / 32-actor budget are
// intentionally untouched.

const spawn = (id, areaId, enemyId, x, y, count, options = {}) => Object.freeze({
  id,
  encounterId: options.encounterId || `enc_${id}`,
  archetype: options.archetype || 'guard',
  mapId: 'map_veil_warfront', areaId, enemyId,
  x, y, width: options.width || 128, height: options.height || 112, count,
  respawnMs: options.respawnMs || 12000,
  activationRange: options.activationRange || 860,
  pursuitMargin: options.pursuitMargin || 135,
  ...(options.patrolPath ? { patrolPath: options.patrolPath } : {})
});

export const MYTHIC_FREEPLAY_WARFRONT_BUDGET = Object.freeze({
  regularActors: 54,
  infernalActors: 34,
  celestialActors: 20,
  activationRangeMin: 760,
  activationRangeMax: 980,
  maxApproxActiveRegularActors: 20
});

export const MYTHIC_FREEPLAY_WARFRONT_SPAWNS = Object.freeze([
  // INFERNAL STRONGHOLD — dense rear host with increasingly armored ranks.
  spawn('freeplay_infernal_keep_abyss', 'area_warfront_infernal_stronghold', 'enemy_demon_scout', 160, 1030, 2, { width: 180, height: 160, respawnMs: 9000, activationRange: 800 }),
  spawn('freeplay_infernal_keep_gravesworn', 'area_warfront_infernal_stronghold', 'enemy_freeplay_gravesworn_veteran', 430, 1110, 1, { respawnMs: 13000, activationRange: 820 }),
  spawn('freeplay_infernal_keep_ossuary', 'area_warfront_infernal_stronghold', 'enemy_freeplay_ossuary_knight', 610, 1510, 1, { respawnMs: 16000, activationRange: 840 }),
  spawn('freeplay_infernal_keep_praetorian', 'area_warfront_infernal_stronghold', 'enemy_freeplay_ashbone_praetorian', 455, 2110, 1, { respawnMs: 18500, activationRange: 850 }),
  spawn('freeplay_infernal_keep_executioner', 'area_warfront_infernal_stronghold', 'enemy_freeplay_fleshborn_executioner', 650, 2190, 1, { respawnMs: 22500, activationRange: 860 }),

  // CINDER BASTION / REAR LINE — patrols spread vertically through logistics lanes.
  spawn('freeplay_cinder_hellfire_pair', 'area_warfront_infernal_rear', 'enemy_hellfire_demon', 950, 510, 2, { width: 210, height: 150, respawnMs: 9500, activationRange: 800 }),
  spawn('freeplay_cinder_hellfire_veteran', 'area_warfront_infernal_rear', 'enemy_freeplay_hellfire_veteran', 1370, 520, 1, { respawnMs: 14500, activationRange: 840 }),
  spawn('freeplay_cinder_gravesworn', 'area_warfront_infernal_rear', 'enemy_freeplay_gravesworn_veteran', 1040, 1790, 1, { respawnMs: 13500, activationRange: 830 }),
  spawn('freeplay_cinder_dreadknight', 'area_warfront_infernal_rear', 'enemy_infernal_dreadknight', 1430, 2070, 1, { respawnMs: 17000, activationRange: 860 }),
  spawn('freeplay_cinder_ossuary', 'area_warfront_infernal_rear', 'enemy_freeplay_ossuary_knight', 1160, 2530, 1, { respawnMs: 17500, activationRange: 840 }),

  // RIVEN FRONT — heaviest regular infernal line before named commanders.
  spawn('freeplay_riven_warwing_pair', 'area_warfront_infernal_front', 'enemy_freeplay_abyss_warwing_veteran', 1840, 810, 2, { width: 190, height: 150, respawnMs: 12000, activationRange: 880 }),
  spawn('freeplay_riven_hellfire_veteran', 'area_warfront_infernal_front', 'enemy_freeplay_hellfire_veteran', 2240, 930, 1, { respawnMs: 15000, activationRange: 900 }),
  spawn('freeplay_riven_dreadknights', 'area_warfront_infernal_front', 'enemy_infernal_dreadknight', 1830, 1890, 2, { width: 170, height: 150, respawnMs: 17500, activationRange: 900 }),
  spawn('freeplay_riven_dread_ossuary', 'area_warfront_infernal_front', 'enemy_freeplay_dread_ossuary_champion', 2250, 2050, 1, { respawnMs: 20500, activationRange: 920 }),
  spawn('freeplay_riven_executioner', 'area_warfront_infernal_front', 'enemy_freeplay_fleshborn_executioner', 2050, 2510, 1, { respawnMs: 22500, activationRange: 900 }),

  // AXIS — continuous central pressure and faction collision.
  spawn('freeplay_axis_infernal_abyss', 'area_warfront_axis', 'enemy_demon_scout', 2700, 930, 1, { archetype: 'patrol', respawnMs: 9000, activationRange: 940, patrolPath: [[2760,980],[2910,1110],[2980,1320],[2910,1510],[2780,1650]] }),
  spawn('freeplay_axis_infernal_hellfire', 'area_warfront_axis', 'enemy_hellfire_demon', 2700, 1550, 1, { archetype: 'patrol', respawnMs: 9800, activationRange: 940, patrolPath: [[2780,1650],[2910,1510],[2990,1370],[2950,1180],[2820,1030]] }),
  spawn('freeplay_axis_hellfire_veteran', 'area_warfront_axis', 'enemy_freeplay_hellfire_veteran', 2820, 1180, 1, { respawnMs: 15000, activationRange: 960 }),
  spawn('freeplay_axis_praetorian', 'area_warfront_axis', 'enemy_freeplay_ashbone_praetorian', 2820, 1770, 1, { respawnMs: 18500, activationRange: 960 }),
  spawn('freeplay_axis_dreadknight', 'area_warfront_axis', 'enemy_infernal_dreadknight', 2980, 1910, 1, { respawnMs: 18000, activationRange: 980 }),

  // THE UNHOUSED — roaming killers and ruin patrols keep the southern quarter alive.
  spawn('freeplay_unhoused_abyss', 'area_warfront_unhoused', 'enemy_freeplay_abyss_warwing_veteran', 2690, 2400, 1, { archetype: 'patrol', respawnMs: 12000, activationRange: 880, patrolPath: [[2740,2380],[2910,2450],[3060,2600],[2870,2720]] }),
  spawn('freeplay_unhoused_hellfire', 'area_warfront_unhoused', 'enemy_hellfire_demon', 3050, 2250, 1, { respawnMs: 10000, activationRange: 860 }),
  spawn('freeplay_unhoused_gravesworn', 'area_warfront_unhoused', 'enemy_freeplay_gravesworn_veteran', 2720, 2740, 1, { respawnMs: 14000, activationRange: 860 }),
  spawn('freeplay_unhoused_ossuary', 'area_warfront_unhoused', 'enemy_freeplay_ossuary_knight', 3260, 2760, 1, { respawnMs: 17500, activationRange: 880 }),

  // DEEP INCURSIONS — Hell reaches beyond the Axis so Heaven's side never feels inert.
  spawn('freeplay_dawnward_incursion_hellfire', 'area_warfront_celestial_front', 'enemy_freeplay_hellfire_veteran', 3570, 800, 1, { respawnMs: 16000, activationRange: 880 }),
  spawn('freeplay_dawnward_incursion_praetorian', 'area_warfront_celestial_front', 'enemy_freeplay_ashbone_praetorian', 3710, 2080, 1, { respawnMs: 19000, activationRange: 900 }),
  spawn('freeplay_dawnward_incursion_dreadknight', 'area_warfront_celestial_front', 'enemy_infernal_dreadknight', 4160, 2350, 1, { respawnMs: 18000, activationRange: 900 }),
  spawn('freeplay_dawnward_incursion_abyss', 'area_warfront_celestial_front', 'enemy_demon_scout', 4000, 580, 1, { respawnMs: 10000, activationRange: 840 }),
  spawn('freeplay_halo_raid_warwing', 'area_warfront_celestial_rear', 'enemy_freeplay_abyss_warwing_veteran', 4420, 2220, 1, { respawnMs: 14000, activationRange: 820 }),
  spawn('freeplay_halo_raid_gravesworn', 'area_warfront_celestial_rear', 'enemy_freeplay_gravesworn_veteran', 4950, 2550, 1, { respawnMs: 15000, activationRange: 820 }),

  // CELESTIAL STRONGHOLD — safe-ish rear defense around the Freeplay entry.
  spawn('freeplay_celestial_keep_sentinels', 'area_warfront_celestial_stronghold', 'enemy_celestial_footsoldier', 5420, 920, 4, { width: 250, height: 180, respawnMs: 10500, activationRange: 800 }),
  spawn('freeplay_celestial_keep_guardian', 'area_warfront_celestial_stronghold', 'enemy_heavenly_guardian', 5790, 2050, 1, { respawnMs: 15500, activationRange: 820 }),

  // HALO BASTION — ordered rear patrols.
  spawn('freeplay_halo_sentinels', 'area_warfront_celestial_rear', 'enemy_celestial_footsoldier', 4670, 1090, 3, { width: 210, height: 150, respawnMs: 10500, activationRange: 800 }),
  spawn('freeplay_halo_guardian', 'area_warfront_celestial_rear', 'enemy_heavenly_guardian', 5000, 1840, 1, { respawnMs: 15500, activationRange: 820 }),

  // DAWNWARD FRONT — heavier celestial line to meet the infernal incursions.
  spawn('freeplay_dawnward_sentinels', 'area_warfront_celestial_front', 'enemy_celestial_footsoldier', 3870, 980, 3, { width: 230, height: 170, respawnMs: 9800, activationRange: 900 }),
  spawn('freeplay_dawnward_guardians', 'area_warfront_celestial_front', 'enemy_heavenly_guardian', 3970, 1900, 2, { width: 160, height: 140, respawnMs: 15000, activationRange: 900 }),

  // CELESTIAL AXIS PATROL — converges with Hell's central patrols.
  spawn('freeplay_axis_celestial_sentinels', 'area_warfront_axis', 'enemy_celestial_footsoldier', 3240, 930, 3, { width: 180, height: 150, archetype: 'patrol', respawnMs: 10000, activationRange: 960, patrolPath: [[3330,980],[3210,1110],[3140,1330],[3210,1530],[3350,1660]] }),
  spawn('freeplay_axis_celestial_guardian', 'area_warfront_axis', 'enemy_heavenly_guardian', 3290, 1770, 1, { respawnMs: 15500, activationRange: 960 }),

  // Southern relief pair occasionally meets the ruin patrols.
  spawn('freeplay_unhoused_celestial_relief', 'area_warfront_unhoused', 'enemy_celestial_footsoldier', 3390, 2370, 2, { width: 150, height: 130, archetype: 'patrol', respawnMs: 11000, activationRange: 860, patrolPath: [[3430,2400],[3310,2510],[3160,2640],[3360,2770]] })
]);
