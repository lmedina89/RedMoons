// v0.1.4.4.2 Warfront geography/atmosphere/detail/population data. This file deliberately owns
// the special realm's composition metadata so later stronghold/population
// passes can add content without hard-coding a second monolithic WorldScene.

const actorBlocks = Object.freeze(['player', 'enemy']);
const solid = (id, x, y, width, height, source) => Object.freeze({
  id, mapId: 'map_veil_warfront', x, y, width, height, source,
  blocksActors: actorBlocks
});

export const WARFRONT_DIMENSIONS = Object.freeze({ width: 6144, height: 3072 });

export const WARFRONT_ROUTE_BANDS = Object.freeze([
  Object.freeze({ id: 'north', name: 'Shattered Crown Road', y: 650, width: 150 }),
  Object.freeze({ id: 'center', name: 'War Road', y: 1510, width: 190 }),
  Object.freeze({ id: 'south', name: 'Pilgrim’s Ruin', y: 2360, width: 155 })
]);

export const WARFRONT_LANDMARKS = Object.freeze([
  Object.freeze({ id: 'infernal_stronghold', name: 'Infernal Stronghold', x: 470, y: 1535, faction: 'infernal', radius: 420 }),
  Object.freeze({ id: 'infernal_rear', name: 'Cinder Bastion', x: 1280, y: 900, faction: 'infernal', radius: 230 }),
  Object.freeze({ id: 'infernal_forward', name: 'Riven Hold', x: 2130, y: 1560, faction: 'infernal', radius: 230 }),
  Object.freeze({ id: 'axis', name: 'Axis of First Light', x: 3072, y: 1510, faction: 'ancient', radius: 520 }),
  Object.freeze({ id: 'ruined_settlement', name: 'The Unhoused', x: 3160, y: 2390, faction: 'neutral', radius: 440 }),
  Object.freeze({ id: 'celestial_forward', name: 'Dawnward Hold', x: 4010, y: 1560, faction: 'celestial', radius: 230 }),
  Object.freeze({ id: 'celestial_rear', name: 'Halo Bastion', x: 4860, y: 900, faction: 'celestial', radius: 230 }),
  Object.freeze({ id: 'celestial_stronghold', name: 'Celestial Stronghold', x: 5665, y: 1535, faction: 'celestial', radius: 420 }),
  Object.freeze({ id: 'veil_arrival', name: 'Veil Gate', x: 3072, y: 2700, faction: 'ancient', radius: 260 })
]);

export const WARFRONT_WATERWAYS = Object.freeze([
  Object.freeze({ id: 'luminous_channel', x: 4620, y: 1640, width: 112, height: 2700, color: 0xa8edf2, alpha: 0.70 }),
  Object.freeze({ id: 'axis_pool', x: 3072, y: 1510, width: 690, height: 410, color: 0x96dce8, alpha: 0.34 })
]);

export const WARFRONT_BRIDGES = Object.freeze([
  Object.freeze({ id: 'halo_bridge_north', x: 4620, y: 820, rotation: Math.PI / 2, scale: 0.72 }),
  Object.freeze({ id: 'halo_bridge_center', x: 4620, y: 1470, rotation: Math.PI / 2, scale: 0.78 }),
  Object.freeze({ id: 'halo_bridge_south', x: 4620, y: 2360, rotation: Math.PI / 2, scale: 0.72 })
]);

export const WARFRONT_RUIN_BUILDINGS = Object.freeze([
  Object.freeze({ id: 'ruin_house_west', x: 2820, y: 2340, texture: 'adobe-house-west', scale: 0.82, tint: 0x827779, alpha: 0.82 }),
  Object.freeze({ id: 'ruin_house_east', x: 3370, y: 2290, texture: 'adobe-house-east', scale: 0.84, tint: 0x8b827e, alpha: 0.80 }),
  Object.freeze({ id: 'ruin_workshop', x: 3230, y: 2570, texture: 'adobe-workshop', scale: 0.76, tint: 0x756c70, alpha: 0.76 })
]);

export const WARFRONT_CLIFF_RIBBONS = Object.freeze([
  // Infernal west: autumn cliff shelves constrict the northern road without
  // making the map a corridor.
  Object.freeze({ id: 'west_crown_1', x: 1420, y: 430, length: 760, theme: 'infernal' }),
  Object.freeze({ id: 'west_crown_2', x: 2200, y: 735, length: 500, theme: 'infernal' }),
  // Celestial east mirrors the geography with winter/ice stone rather than a
  // simple hue shift.
  Object.freeze({ id: 'east_crown_1', x: 4720, y: 430, length: 760, theme: 'celestial' }),
  Object.freeze({ id: 'east_crown_2', x: 3945, y: 735, length: 500, theme: 'celestial' })
]);



// v0.1.4.4.1 detail clusters deliberately describe landmark identity rather
// than individual decorative sprites. WorldScene translates each cluster into
// a bounded composition from already-audited assets. This keeps later army
// passes independent from environment art and gives tests a stable way to
// verify that every major base/outpost/settlement received a detail pass.
export const WARFRONT_DETAIL_CLUSTERS = Object.freeze([
  Object.freeze({ id: 'detail_infernal_stronghold', landmarkId: 'infernal_stronghold', kind: 'infernal_stronghold', x: 470, y: 1535, faction: 'infernal', spriteBudget: 28 }),
  Object.freeze({ id: 'detail_infernal_rear', landmarkId: 'infernal_rear', kind: 'infernal_rear', x: 1280, y: 900, faction: 'infernal', spriteBudget: 14 }),
  Object.freeze({ id: 'detail_infernal_forward', landmarkId: 'infernal_forward', kind: 'infernal_forward', x: 2130, y: 1560, faction: 'infernal', spriteBudget: 14 }),
  Object.freeze({ id: 'detail_unhoused', landmarkId: 'ruined_settlement', kind: 'unhoused', x: 3160, y: 2390, faction: 'neutral', spriteBudget: 24 }),
  Object.freeze({ id: 'detail_celestial_forward', landmarkId: 'celestial_forward', kind: 'celestial_forward', x: 4010, y: 1560, faction: 'celestial', spriteBudget: 14 }),
  Object.freeze({ id: 'detail_celestial_rear', landmarkId: 'celestial_rear', kind: 'celestial_rear', x: 4860, y: 900, faction: 'celestial', spriteBudget: 14 }),
  Object.freeze({ id: 'detail_celestial_stronghold', landmarkId: 'celestial_stronghold', kind: 'celestial_stronghold', x: 5665, y: 1535, faction: 'celestial', spriteBudget: 28 })
]);

export const WARFRONT_DETAIL_FX = Object.freeze([
  Object.freeze({ id: 'infernal_altar_glow', kind: 'infernal_pulse', x: 470, y: 1535, radius: 112 }),
  Object.freeze({ id: 'riven_brazier_glow', kind: 'infernal_pulse', x: 2130, y: 1560, radius: 72 }),
  Object.freeze({ id: 'dawnward_relic_glow', kind: 'celestial_pulse', x: 4010, y: 1560, radius: 76 }),
  Object.freeze({ id: 'halo_pool_glow', kind: 'celestial_pulse', x: 4860, y: 900, radius: 90 }),
  Object.freeze({ id: 'celestial_sanctuary_glow', kind: 'celestial_pulse', x: 5665, y: 1535, radius: 118 }),
  Object.freeze({ id: 'unhoused_memory_glow', kind: 'ancient_fade', x: 3160, y: 2445, radius: 98 })
]);

export const WARFRONT_DETAIL_BUDGET = Object.freeze({
  maxAuthoredSprites: 136,
  maxPersistentDetailFx: 6
});

export const WARFRONT_COLLIDERS = Object.freeze([
  // Infernal stronghold shell, east-facing gate left open.
  solid('warfront-infernal-north', 480, 720, 800, 38, 'stronghold-wall'),
  solid('warfront-infernal-south', 480, 2350, 800, 38, 'stronghold-wall'),
  solid('warfront-infernal-west', 80, 1535, 38, 1668, 'stronghold-wall'),
  solid('warfront-infernal-east-upper', 880, 1050, 38, 660, 'stronghold-wall'),
  solid('warfront-infernal-east-lower', 880, 2040, 38, 620, 'stronghold-wall'),

  // Celestial stronghold shell, west-facing gate left open.
  solid('warfront-celestial-north', 5660, 720, 800, 38, 'stronghold-wall'),
  solid('warfront-celestial-south', 5660, 2350, 800, 38, 'stronghold-wall'),
  solid('warfront-celestial-east', 6064, 1535, 38, 1668, 'stronghold-wall'),
  solid('warfront-celestial-west-upper', 5260, 1050, 38, 660, 'stronghold-wall'),
  solid('warfront-celestial-west-lower', 5260, 2040, 38, 620, 'stronghold-wall'),

  // Outpost footprints intentionally leave their battlefield-facing side open.
  solid('warfront-infernal-rear-west', 1070, 900, 30, 330, 'outpost-wall'),
  solid('warfront-infernal-rear-north', 1280, 735, 450, 30, 'outpost-wall'),
  solid('warfront-infernal-rear-south', 1280, 1065, 450, 30, 'outpost-wall'),
  solid('warfront-infernal-forward-west', 1920, 1560, 30, 350, 'outpost-wall'),
  solid('warfront-infernal-forward-north', 2130, 1385, 450, 30, 'outpost-wall'),
  solid('warfront-infernal-forward-south', 2130, 1735, 450, 30, 'outpost-wall'),

  solid('warfront-celestial-forward-east', 4220, 1560, 30, 350, 'outpost-wall'),
  solid('warfront-celestial-forward-north', 4010, 1385, 450, 30, 'outpost-wall'),
  solid('warfront-celestial-forward-south', 4010, 1735, 450, 30, 'outpost-wall'),
  solid('warfront-celestial-rear-east', 5070, 900, 30, 330, 'outpost-wall'),
  solid('warfront-celestial-rear-north', 4860, 735, 450, 30, 'outpost-wall'),
  solid('warfront-celestial-rear-south', 4860, 1065, 450, 30, 'outpost-wall'),

  // Cliff shelves correspond to visible 4-Season mountain ribbons.
  solid('warfront-west-crown-cliff-1', 1420, 456, 760, 76, 'ancient-cliff'),
  solid('warfront-west-crown-cliff-2', 2200, 760, 500, 76, 'ancient-cliff'),
  solid('warfront-east-crown-cliff-1', 4720, 456, 760, 76, 'ancient-cliff'),
  solid('warfront-east-crown-cliff-2', 3945, 760, 500, 76, 'ancient-cliff'),

  // Luminous channel is deep/impassable except at three authored bridge gaps.
  solid('warfront-water-top', 4620, 475, 104, 530, 'luminous-water'),
  solid('warfront-water-upper-mid', 4620, 1120, 104, 440, 'luminous-water'),
  solid('warfront-water-lower-mid', 4620, 1925, 104, 705, 'luminous-water'),
  solid('warfront-water-bottom', 4620, 2755, 104, 500, 'luminous-water'),

  // Ruined neutral settlement buildings.
  solid('warfront-ruin-house-west', 2820, 2355, 122, 78, 'ruined-building'),
  solid('warfront-ruin-house-east', 3370, 2305, 122, 78, 'ruined-building'),
  solid('warfront-ruin-workshop', 3230, 2585, 138, 78, 'ruined-building'),



  // v0.1.4.4.1 large authored landmark props. Small clutter remains visual-only,
  // but the six centerpiece structures that read as solid on-screen share the
  // same visible-source collision rules as the rest of the Warfront.
  solid('warfront-infernal-war-altar', 470, 1535, 174, 104, 'landmark-prop'),
  solid('warfront-cinder-bastion-supply', 1280, 900, 112, 72, 'landmark-prop'),
  solid('warfront-riven-hold-brazier', 2130, 1560, 86, 72, 'landmark-prop'),
  solid('warfront-dawnward-relic', 4010, 1560, 88, 78, 'landmark-prop'),
  solid('warfront-halo-bastion-font', 4860, 900, 112, 82, 'landmark-prop'),
  solid('warfront-celestial-sanctuary-font', 5665, 1535, 174, 108, 'landmark-prop'),

  // Eight ancient pillars define the Axis without sealing the central floor.
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return solid(`warfront-axis-pillar-${i}`, 3072 + Math.cos(a) * 385, 1510 + Math.sin(a) * 285, 46, 46, 'axis-pillar');
  })
]);

export const WARFRONT_AMBIENT_EMITTERS = Object.freeze([
  Object.freeze({ id: 'celestial_motes', kind: 'mote', x: 4930, y: 1510, spreadX: 1030, spreadY: 1320, count: 14, tint: 0xeafcff, alpha: 0.52, minDuration: 4700, maxDuration: 7600 }),
  Object.freeze({ id: 'infernal_embers', kind: 'ember', x: 1210, y: 1510, spreadX: 1070, spreadY: 1320, count: 14, tint: 0xff6a3d, alpha: 0.46, minDuration: 3900, maxDuration: 6500 }),
  Object.freeze({ id: 'axis_dust', kind: 'mote', x: 3072, y: 1510, spreadX: 630, spreadY: 520, count: 10, tint: 0xf8df9a, alpha: 0.44, minDuration: 5200, maxDuration: 8200 })
]);



// v0.1.4.4.2 Living Warfront population. The realm deliberately stays below
// the proven 35-actor Cinder Wilds production ceiling. Spawn rows are grouped
// by defended landmarks and two contested patrol lanes; Enemy.js keeps distant
// groups asleep until the player approaches their sector.
export const WARFRONT_POPULATION_BUDGET = Object.freeze({
  maxProductionActors: 32,
  maxActiveSectorRange: 1080,
  mythicActors: 0
});

export const WARFRONT_SPAWN_REGIONS = Object.freeze([
  // Infernal Stronghold — four rear-line defenders around the inner muster
  // yard, split around the ritual altar so no spawn overlaps its solid.
  Object.freeze({ id: 'spawn_warfront_infernal_stronghold_abyss', encounterId: 'enc_warfront_infernal_stronghold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_stronghold', enemyId: 'enemy_demon_scout', x: 220, y: 930, width: 210, height: 190, count: 2, respawnMs: 14500, activationRange: 980, pursuitMargin: 110 }),
  Object.freeze({ id: 'spawn_warfront_infernal_stronghold_ashbone', encounterId: 'enc_warfront_infernal_stronghold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_stronghold', enemyId: 'enemy_ashbone_demon', x: 600, y: 1810, width: 170, height: 180, count: 1, respawnMs: 16800, activationRange: 980, pursuitMargin: 110 }),
  Object.freeze({ id: 'spawn_warfront_infernal_stronghold_fleshborn', encounterId: 'enc_warfront_infernal_stronghold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_stronghold', enemyId: 'enemy_fleshborn_demon', x: 240, y: 1900, width: 170, height: 180, count: 1, respawnMs: 22000, activationRange: 980, pursuitMargin: 110 }),

  // Cinder Bastion — compact rear logistics guard.
  Object.freeze({ id: 'spawn_warfront_cinder_abyss', encounterId: 'enc_warfront_cinder_bastion', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_rear', enemyId: 'enemy_demon_scout', x: 1110, y: 780, width: 100, height: 80, count: 1, respawnMs: 13800, activationRange: 920 }),
  Object.freeze({ id: 'spawn_warfront_cinder_hellfire', encounterId: 'enc_warfront_cinder_bastion', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_rear', enemyId: 'enemy_hellfire_demon', x: 1370, y: 780, width: 100, height: 80, count: 1, respawnMs: 15200, activationRange: 920 }),
  Object.freeze({ id: 'spawn_warfront_cinder_imp', encounterId: 'enc_warfront_cinder_bastion', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_rear', enemyId: 'enemy_blueflame_imp', x: 1370, y: 950, width: 100, height: 70, count: 1, respawnMs: 11800, activationRange: 900 }),

  // Riven Hold — the heavy forward infernal redoubt.
  Object.freeze({ id: 'spawn_warfront_riven_abyss', encounterId: 'enc_warfront_riven_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_front', enemyId: 'enemy_demon_scout', x: 1950, y: 1420, width: 110, height: 80, count: 1, respawnMs: 13200, activationRange: 1020, pursuitMargin: 130 }),
  Object.freeze({ id: 'spawn_warfront_riven_hellfire', encounterId: 'enc_warfront_riven_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_front', enemyId: 'enemy_hellfire_demon', x: 2200, y: 1420, width: 110, height: 80, count: 1, respawnMs: 14800, activationRange: 1020, pursuitMargin: 130 }),
  Object.freeze({ id: 'spawn_warfront_riven_ashbone', encounterId: 'enc_warfront_riven_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_front', enemyId: 'enemy_ashbone_demon', x: 1950, y: 1620, width: 110, height: 80, count: 1, respawnMs: 15800, activationRange: 1020, pursuitMargin: 130 }),
  Object.freeze({ id: 'spawn_warfront_riven_fleshborn', encounterId: 'enc_warfront_riven_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_infernal_front', enemyId: 'enemy_fleshborn_demon', x: 2200, y: 1620, width: 110, height: 80, count: 1, respawnMs: 21500, activationRange: 1020, pursuitMargin: 130 }),

  // Infernal Axis patrol — walks the western half of the ancient center and
  // meets the celestial patrol only when the player activates the sector.
  Object.freeze({ id: 'spawn_warfront_axis_infernal_abyss', encounterId: 'enc_warfront_axis_infernal_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_axis', enemyId: 'enemy_demon_scout', x: 2690, y: 1380, width: 100, height: 100, count: 1, respawnMs: 15500, activationRange: 1080, pursuitMargin: 150, patrolPath: [[2780, 1430], [2900, 1400], [2980, 1450], [3000, 1510], [2980, 1580], [2900, 1620], [2780, 1590]] }),
  Object.freeze({ id: 'spawn_warfront_axis_infernal_hellfire', encounterId: 'enc_warfront_axis_infernal_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_axis', enemyId: 'enemy_hellfire_demon', x: 2770, y: 1410, width: 100, height: 100, count: 1, respawnMs: 16500, activationRange: 1080, pursuitMargin: 150, patrolPath: [[2780, 1430], [2900, 1400], [2980, 1450], [3000, 1510], [2980, 1580], [2900, 1620], [2780, 1590]] }),
  Object.freeze({ id: 'spawn_warfront_axis_infernal_ashbone', encounterId: 'enc_warfront_axis_infernal_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_axis', enemyId: 'enemy_ashbone_demon', x: 2740, y: 1580, width: 100, height: 100, count: 1, respawnMs: 17500, activationRange: 1080, pursuitMargin: 150, patrolPath: [[2780, 1430], [2900, 1400], [2980, 1450], [3000, 1510], [2980, 1580], [2900, 1620], [2780, 1590]] }),

  // Infernal southern scout pair — uses Pilgrim's Ruin rather than idling in
  // the ruined settlement itself.
  Object.freeze({ id: 'spawn_warfront_south_infernal_abyss', encounterId: 'enc_warfront_south_infernal_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_unhoused', enemyId: 'enemy_demon_scout', x: 2700, y: 2140, width: 110, height: 80, count: 1, respawnMs: 16000, activationRange: 980, pursuitMargin: 135, patrolPath: [[2740, 2160], [2860, 2160], [2990, 2180], [2910, 2220], [2760, 2220]] }),
  Object.freeze({ id: 'spawn_warfront_south_infernal_hellfire', encounterId: 'enc_warfront_south_infernal_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_unhoused', enemyId: 'enemy_hellfire_demon', x: 2840, y: 2140, width: 110, height: 80, count: 1, respawnMs: 17000, activationRange: 980, pursuitMargin: 135, patrolPath: [[2740, 2160], [2860, 2160], [2990, 2180], [2910, 2220], [2760, 2220]] }),

  // Celestial Stronghold — four rear-line defenders around the sanctuary font.
  Object.freeze({ id: 'spawn_warfront_celestial_stronghold_sentinels', encounterId: 'enc_warfront_celestial_stronghold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_stronghold', enemyId: 'enemy_celestial_footsoldier', x: 5480, y: 950, width: 260, height: 180, count: 3, respawnMs: 15000, activationRange: 980, pursuitMargin: 110 }),
  Object.freeze({ id: 'spawn_warfront_celestial_stronghold_guardian', encounterId: 'enc_warfront_celestial_stronghold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_stronghold', enemyId: 'enemy_heavenly_guardian', x: 5700, y: 1880, width: 170, height: 170, count: 1, respawnMs: 20500, activationRange: 980, pursuitMargin: 110 }),

  // Halo Bastion — rear-line sanctuary guard.
  Object.freeze({ id: 'spawn_warfront_halo_sentinels', encounterId: 'enc_warfront_halo_bastion', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_rear', enemyId: 'enemy_celestial_footsoldier', x: 4680, y: 780, width: 100, height: 70, count: 2, respawnMs: 14500, activationRange: 920 }),
  Object.freeze({ id: 'spawn_warfront_halo_guardian', encounterId: 'enc_warfront_halo_bastion', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_rear', enemyId: 'enemy_heavenly_guardian', x: 4940, y: 950, width: 90, height: 65, count: 1, respawnMs: 19000, activationRange: 920 }),

  // Dawnward Hold — forward celestial defense mirrors Riven's four roles with
  // three mobile Sentinels and one durable Guardian.
  Object.freeze({ id: 'spawn_warfront_dawnward_sentinel_north', encounterId: 'enc_warfront_dawnward_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_front', enemyId: 'enemy_celestial_footsoldier', x: 3810, y: 1420, width: 120, height: 80, count: 2, respawnMs: 14200, activationRange: 1020, pursuitMargin: 130 }),
  Object.freeze({ id: 'spawn_warfront_dawnward_sentinel_south', encounterId: 'enc_warfront_dawnward_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_front', enemyId: 'enemy_celestial_footsoldier', x: 4070, y: 1620, width: 105, height: 80, count: 1, respawnMs: 14200, activationRange: 1020, pursuitMargin: 130 }),
  Object.freeze({ id: 'spawn_warfront_dawnward_guardian', encounterId: 'enc_warfront_dawnward_hold', archetype: 'guard', mapId: 'map_veil_warfront', areaId: 'area_warfront_celestial_front', enemyId: 'enemy_heavenly_guardian', x: 3810, y: 1620, width: 105, height: 80, count: 1, respawnMs: 19500, activationRange: 1020, pursuitMargin: 130 }),

  // Celestial Axis patrol — converges opposite the Infernal patrol around the
  // outer ring but retains its own home/leash so the fight cannot migrate.
  Object.freeze({ id: 'spawn_warfront_axis_celestial_sentinel_a', encounterId: 'enc_warfront_axis_celestial_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_axis', enemyId: 'enemy_celestial_footsoldier', x: 3350, y: 1380, width: 100, height: 100, count: 1, respawnMs: 15800, activationRange: 1080, pursuitMargin: 150, patrolPath: [[3360, 1430], [3240, 1400], [3165, 1450], [3140, 1510], [3165, 1580], [3240, 1620], [3360, 1590]] }),
  Object.freeze({ id: 'spawn_warfront_axis_celestial_sentinel_b', encounterId: 'enc_warfront_axis_celestial_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_axis', enemyId: 'enemy_celestial_footsoldier', x: 3270, y: 1410, width: 100, height: 100, count: 1, respawnMs: 15800, activationRange: 1080, pursuitMargin: 150, patrolPath: [[3360, 1430], [3240, 1400], [3165, 1450], [3140, 1510], [3165, 1580], [3240, 1620], [3360, 1590]] }),
  Object.freeze({ id: 'spawn_warfront_axis_celestial_guardian', encounterId: 'enc_warfront_axis_celestial_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_axis', enemyId: 'enemy_heavenly_guardian', x: 3300, y: 1580, width: 100, height: 100, count: 1, respawnMs: 20500, activationRange: 1080, pursuitMargin: 150, patrolPath: [[3360, 1430], [3240, 1400], [3165, 1450], [3140, 1510], [3165, 1580], [3240, 1620], [3360, 1590]] }),

  // Celestial southern scout pair mirrors the infernal Pilgrim's Ruin patrol.
  Object.freeze({ id: 'spawn_warfront_south_celestial_sentinel_a', encounterId: 'enc_warfront_south_celestial_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_unhoused', enemyId: 'enemy_celestial_footsoldier', x: 3340, y: 2140, width: 110, height: 80, count: 1, respawnMs: 16000, activationRange: 980, pursuitMargin: 135, patrolPath: [[3400, 2160], [3280, 2160], [3140, 2180], [3220, 2220], [3380, 2220]] }),
  Object.freeze({ id: 'spawn_warfront_south_celestial_sentinel_b', encounterId: 'enc_warfront_south_celestial_patrol', archetype: 'patrol', mapId: 'map_veil_warfront', areaId: 'area_warfront_unhoused', enemyId: 'enemy_celestial_footsoldier', x: 3200, y: 2140, width: 110, height: 80, count: 1, respawnMs: 16000, activationRange: 980, pursuitMargin: 135, patrolPath: [[3400, 2160], [3280, 2160], [3140, 2180], [3220, 2220], [3380, 2220]] })
]);

export const WARFRONT_ASSET_KEYS = Object.freeze([
  'warfront-winter-dirt', 'warfront-infernal-dirt', 'warfront-mountain-winter', 'warfront-mountain-autumn',
  'warfront-ice-water-tile', 'warfront-water-reflections', 'warfront-winter-plants', 'warfront-bridge-straight',
  'castle2-set', 'dungeon-elements', 'cave3-set', 'bridge', 'fire',
  'adobe-house-east', 'adobe-house-west', 'adobe-workshop', 'rocks-cliffs', 'rocks-grass', 'tree-trunks',
  'pine-tree-large', 'pine-tree-cluster', 'bush-evergreen', 'bush-seasonal', 'mushrooms', 'tall-grass',
  'prop-smith-forge', 'prop-smith-racks', 'prop-smith-tools', 'prop-wood-bench', 'prop-wood-toolboard',
  'prop-tailor-display', 'prop-tailor-loom'
]);
