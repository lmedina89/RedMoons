// v0.1.4.4.0 Warfront geography/atmosphere data. This file deliberately owns
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

export const WARFRONT_ASSET_KEYS = Object.freeze([
  'warfront-winter-dirt', 'warfront-infernal-dirt', 'warfront-mountain-winter', 'warfront-mountain-autumn',
  'warfront-ice-water-tile', 'warfront-water-reflections', 'warfront-winter-plants',
  'castle2-set', 'dungeon-elements', 'cave3-set', 'bridge', 'fire',
  'adobe-house-east', 'adobe-house-west', 'adobe-workshop', 'rocks-cliffs', 'tree-trunks'
]);
