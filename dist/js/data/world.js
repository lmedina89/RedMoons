export const ZONES = Object.freeze([
  { id: 'zone_cinder_refuge', name: 'Cinder Refuge', x: 0, y: 0, width: 720, height: 1280, danger: 'Sanctuary' },
  { id: 'zone_scorched_outskirts', name: 'Scorched Outskirts', x: 720, y: 0, width: 1220, height: 1280, danger: 'Hunting Ground' },
  { id: 'zone_bone_road', name: 'Bone Road', x: 1940, y: 0, width: 620, height: 1280, danger: 'Dead March' }
]);

export const SPAWN_REGIONS = Object.freeze([
  { id: 'spawn_imp_south', enemyId: 'enemy_cinder_imp', x: 920, y: 390, width: 640, height: 620, count: 8, respawnMs: 6500 },
  { id: 'spawn_skeleton_edge', enemyId: 'enemy_ash_skeleton', x: 1550, y: 210, width: 390, height: 850, count: 5, respawnMs: 9000 },
  { id: 'spawn_captain', enemyId: 'enemy_bone_captain', x: 2130, y: 590, width: 80, height: 100, count: 1, respawnMs: 22000 }
]);

export const COLLIDERS = Object.freeze([
  { id: 'north-cliff', x: 1280, y: 18, width: 2560, height: 36 },
  { id: 'south-cliff', x: 1280, y: 1262, width: 2560, height: 36 },
  { id: 'west-wall', x: 18, y: 640, width: 36, height: 1280 },
  { id: 'east-fog', x: 2542, y: 640, width: 36, height: 1280 },
  { id: 'refuge-north', x: 330, y: 242, width: 500, height: 28 },
  { id: 'refuge-south-a', x: 205, y: 910, width: 250, height: 28 },
  { id: 'refuge-south-b', x: 560, y: 910, width: 185, height: 28 },
  { id: 'forge', x: 235, y: 350, width: 175, height: 120 },
  { id: 'market', x: 430, y: 365, width: 150, height: 100 },
  { id: 'road-bones', x: 2050, y: 410, width: 85, height: 150 }
]);

export const PROP_DEFS = Object.freeze([
  ...Array.from({ length: 16 }, (_, i) => ({ texture: 'tree-trunks', frame: i % 12, x: 90 + (i % 4) * 155, y: 104 + Math.floor(i / 4) * 310, scale: 1.8 })),
  ...Array.from({ length: 20 }, (_, i) => ({ texture: 'rocks-grass', frame: (i * 3) % 18, x: 810 + (i % 5) * 222, y: 110 + Math.floor(i / 5) * 330, scale: 1.3 })),
  ...Array.from({ length: 11 }, (_, i) => ({ texture: 'rocks-cliffs', frame: (i * 5) % 24, x: 1780 + (i % 3) * 260, y: 120 + Math.floor(i / 3) * 290, scale: 1.55 })),
  { texture: 'dungeon-elements', frame: 2, x: 194, y: 330, scale: 1.4 },
  { texture: 'dungeon-elements', frame: 23, x: 340, y: 392, scale: 1.35 },
  { texture: 'dungeon-elements', frame: 31, x: 458, y: 410, scale: 1.3 },
  { texture: 'dungeon-elements', frame: 64, x: 2005, y: 555, scale: 1.5 },
  { texture: 'dungeon-elements', frame: 65, x: 2050, y: 555, scale: 1.5 }
]);

