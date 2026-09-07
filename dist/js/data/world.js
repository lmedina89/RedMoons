export const ZONES = Object.freeze([
  {
    id: 'zone_cinder_refuge', name: 'Cinder Refuge', x: 0, y: 0, width: 720, height: 1280, danger: 'Sanctuary',
    levelRange: [1, 3], safe: true, hostile: false, biome: 'ash_settlement', eventTags: ['guild_hub_future', 'town_event_future'], dungeonHooks: []
  },
  {
    id: 'zone_scorched_outskirts', name: 'Scorched Outskirts', x: 720, y: 0, width: 1220, height: 1280, danger: 'Hunting Ground',
    levelRange: [1, 5], safe: false, hostile: true, biome: 'scorched_waste', eventTags: ['hunt', 'assault_future'], dungeonHooks: ['outskirts_ruin_future']
  },
  {
    id: 'zone_bone_road', name: 'Bone Road', x: 1940, y: 0, width: 620, height: 1280, danger: 'Dead March',
    levelRange: [4, 8], safe: false, hostile: true, biome: 'bone_march', eventTags: ['elite_hunt', 'guild_conflict_future'], dungeonHooks: ['ossuary_future']
  }
]);

// Settlement buildings are data, not scene code, so future towns can reuse the
// same placement/render path with a different art family.
export const BUILDING_DEFS = Object.freeze([
  { id: 'refuge_forge', name: 'Torren’s Forge', texture: 'adobe-workshop', x: 205, y: 330, scale: 0.78, depthOffset: -28, collider: { x: 205, y: 356, width: 210, height: 54 } },
  { id: 'refuge_warden_hall', name: 'Warden Hall', texture: 'adobe-house-tower', x: 515, y: 335, scale: 0.9, depthOffset: -34, collider: { x: 515, y: 370, width: 104, height: 68 } },
  { id: 'refuge_inn', name: 'Ashen Rest', texture: 'adobe-house-east', x: 180, y: 690, scale: 0.88, flipX: true, depthOffset: -34, collider: { x: 180, y: 725, width: 104, height: 66 } },
  { id: 'refuge_storehouse', name: 'Refuge Stores', texture: 'adobe-house-east', x: 505, y: 720, scale: 0.84, depthOffset: -34, collider: { x: 505, y: 754, width: 100, height: 64 } },
  { id: 'refuge_house_north', name: 'Hunter House', texture: 'adobe-house-tower', x: 185, y: 104, scale: 0.72, flipX: true, depthOffset: -30, collider: { x: 185, y: 132, width: 82, height: 53 } },
  { id: 'refuge_house_east', name: 'Cinder House', texture: 'adobe-house-tower', x: 510, y: 100, scale: 0.70, depthOffset: -30, collider: { x: 510, y: 128, width: 80, height: 52 } }
]);

export const TOWN_PROP_DEFS = Object.freeze([
  { texture: 'castle2-set', frame: 148, x: 286, y: 425, scale: 1.0 }, // anvil
  { texture: 'castle2-set', frame: 233, x: 390, y: 620, scale: 1.0 }, // barrel
  { texture: 'castle2-set', frame: 232, x: 425, y: 620, scale: 1.0 }, // crate
  { texture: 'castle2-set', frame: 249, x: 465, y: 625, scale: 1.0 },
  { texture: 'castle2-set', frame: 255, x: 345, y: 800, scale: 1.15 }, // well/brazier-like round prop
  { texture: 'castle2-set', frame: 128, x: 595, y: 450, scale: 0.9 },
  { texture: 'castle2-set', frame: 129, x: 135, y: 825, scale: 0.95 },
  { texture: 'castle2-set', frame: 219, x: 565, y: 820, scale: 0.9 }
]);

export const SPAWN_REGIONS = Object.freeze([
  { id: 'spawn_imp_south', enemyId: 'enemy_cinder_imp', x: 800, y: 520, width: 430, height: 560, count: 7, respawnMs: 6500 },
  { id: 'spawn_carrion_north', enemyId: 'enemy_carrion_beast', x: 980, y: 130, width: 520, height: 380, count: 5, respawnMs: 7600 },
  { id: 'spawn_rotwing_south', enemyId: 'enemy_rotwing_ravager', x: 1250, y: 700, width: 470, height: 400, count: 3, respawnMs: 9000 },
  { id: 'spawn_skeleton_edge', enemyId: 'enemy_ash_skeleton', x: 1550, y: 180, width: 380, height: 850, count: 4, respawnMs: 9000 },
  { id: 'spawn_slate_road', enemyId: 'enemy_slate_revenant', x: 1980, y: 160, width: 300, height: 520, count: 3, respawnMs: 10500 },
  { id: 'spawn_bloodbone_road', enemyId: 'enemy_bloodbone', x: 2180, y: 650, width: 300, height: 450, count: 3, respawnMs: 12000 },
  { id: 'spawn_gilded_guard', enemyId: 'enemy_gilded_guard', x: 2260, y: 180, width: 220, height: 360, count: 2, respawnMs: 15000 },
  { id: 'spawn_captain', enemyId: 'enemy_bone_captain', x: 2390, y: 560, width: 90, height: 120, count: 1, respawnMs: 24000 }
]);

export const REFUGE_WALLS = Object.freeze([
  // Visual wall geometry is the collision source of truth. The east opening is
  // deliberately broad so touch players can leave town without hunting for a
  // narrow invisible gate.
  { id: 'refuge-north', x1: 46, y1: 52, x2: 690, y2: 52, thickness: 10 },
  { id: 'refuge-south', x1: 46, y1: 990, x2: 690, y2: 990, thickness: 10 },
  { id: 'refuge-west', x1: 46, y1: 52, x2: 46, y2: 990, thickness: 10 },
  { id: 'refuge-east-north', x1: 690, y1: 52, x2: 690, y2: 390, thickness: 10 },
  { id: 'refuge-east-south', x1: 690, y1: 860, x2: 690, y2: 990, thickness: 10 }
]);

const wallCollider = wall => {
  const horizontal = wall.y1 === wall.y2;
  return {
    id: wall.id,
    source: 'visible-wall',
    x: (wall.x1 + wall.x2) / 2,
    y: (wall.y1 + wall.y2) / 2,
    width: horizontal ? Math.abs(wall.x2 - wall.x1) : wall.thickness,
    height: horizontal ? wall.thickness : Math.abs(wall.y2 - wall.y1)
  };
};

// Only visibly represented town walls and building footprints receive static
// collision. World edges are already enforced by Arcade world bounds, and
// decorative rocks/road props intentionally never create hidden blockers.
export const COLLIDERS = Object.freeze([
  ...REFUGE_WALLS.map(wallCollider),
  ...BUILDING_DEFS.map(building => ({ id: `building-${building.id}`, source: 'building', ...building.collider }))
]);



export const PROP_DEFS = Object.freeze([
  // Deliberate refuge greenery instead of a grid of trees through buildings.
  { texture: 'tree-trunks', frame: 2, x: 75, y: 235, scale: 1.65 },
  { texture: 'tree-trunks', frame: 6, x: 635, y: 215, scale: 1.6 },
  { texture: 'tree-trunks', frame: 9, x: 80, y: 925, scale: 1.7 },
  { texture: 'tree-trunks', frame: 3, x: 625, y: 945, scale: 1.65 },
  ...Array.from({ length: 24 }, (_, i) => ({ texture: 'rocks-grass', frame: (i * 3) % 18, x: 790 + (i % 6) * 190, y: 100 + Math.floor(i / 6) * 320, scale: 1.15 + (i % 3) * 0.12 })),
  ...Array.from({ length: 12 }, (_, i) => ({ texture: 'rocks-cliffs', frame: (i * 5) % 24, x: 1980 + (i % 3) * 190, y: 90 + Math.floor(i / 3) * 300, scale: 1.35 })),
  { texture: 'dungeon-elements', frame: 64, x: 2010, y: 555, scale: 1.5 },
  { texture: 'dungeon-elements', frame: 65, x: 2055, y: 555, scale: 1.5 }
]);
