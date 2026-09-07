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
  },
  {
    id: 'zone_ashfall_hollow', name: 'Ashfall Hollow', x: 0, y: 0, width: 1024, height: 768, danger: 'Cavern',
    levelRange: [2, 5], safe: false, hostile: true, biome: 'ash_cavern', eventTags: ['cave_hunt'], dungeonHooks: [], mapId: 'map_ashfall_hollow'
  }
]);

// Fine-grained area identity sits beneath the broad gameplay zones. These
// rectangles intentionally partition each active map without overlap so the
// HUD, future encounter director and quest hooks can all resolve one stable
// local area from a world position. v0.1.4.0 uses the metadata immediately for
// area identity; family/group weights are staged for later population passes.
export const AREA_DEFS = Object.freeze([
  Object.freeze({ id: 'area_cinder_refuge', mapId: 'map_cinder_region', parentZoneId: 'zone_cinder_refuge', name: 'Cinder Refuge', danger: 'Sanctuary', x: 0, y: 0, width: 720, height: 1280, identity: 'Fortified survivor settlement built around old ash-road foundations.', encounter: Object.freeze({ families: Object.freeze([]), groups: Object.freeze([]) }) }),
  Object.freeze({ id: 'area_ashen_causeway', mapId: 'map_cinder_region', parentZoneId: 'zone_scorched_outskirts', name: 'Ashen Causeway', danger: 'Frayed Safety', x: 720, y: 390, width: 360, height: 440, identity: 'The last guarded road east of the Refuge, littered with old checkpoints and wagon scars.', encounter: Object.freeze({ families: Object.freeze([{ id: 'imp', weight: 60 }, { id: 'goblin', weight: 25 }, { id: 'carrion', weight: 15 }]), groups: Object.freeze(['roam', 'patrol']) }) }),
  Object.freeze({ id: 'area_emberfields', mapId: 'map_cinder_region', parentZoneId: 'zone_scorched_outskirts', name: 'Emberfields', danger: 'Open Hunting Ground', x: 720, y: 0, width: 720, height: 390, identity: 'Wide burned flats with long sightlines, exposed nests and roaming infernal packs.', encounter: Object.freeze({ families: Object.freeze([{ id: 'imp', weight: 50 }, { id: 'goblin', weight: 25 }, { id: 'spider', weight: 25 }]), groups: Object.freeze(['roam', 'pack']) }) }),
  Object.freeze({ id: 'area_cinderwood', mapId: 'map_cinder_region', parentZoneId: 'zone_scorched_outskirts', name: 'Cinderwood', danger: 'Ambush Country', x: 720, y: 830, width: 720, height: 450, identity: 'A burned woodland fringe where dead trunks break sightlines and predators favor close approaches.', encounter: Object.freeze({ families: Object.freeze([{ id: 'spider', weight: 50 }, { id: 'carrion', weight: 30 }, { id: 'imp', weight: 20 }]), groups: Object.freeze(['pack', 'ambush']) }) }),
  Object.freeze({ id: 'area_first_light_scar', mapId: 'map_cinder_region', parentZoneId: 'zone_scorched_outskirts', name: 'First-Light Scar', danger: 'Celestial Incursion', x: 1080, y: 390, width: 360, height: 440, identity: 'A gold-white wound in the scorched earth where Azrael’s presence changes the battlefield itself.', encounter: Object.freeze({ families: Object.freeze([{ id: 'celestial', weight: 55 }, { id: 'imp', weight: 25 }, { id: 'carrion', weight: 20 }]), groups: Object.freeze(['guard', 'patrol', 'ritual']), planned: true }) }),
  Object.freeze({ id: 'area_fallen_watch', mapId: 'map_cinder_region', parentZoneId: 'zone_scorched_outskirts', name: 'The Fallen Watch', danger: 'Ruined Strongpoint', x: 1440, y: 0, width: 500, height: 640, identity: 'Broken military works and partial walls create chokepoints, cover and contested ground.', encounter: Object.freeze({ families: Object.freeze([{ id: 'skeleton', weight: 45 }, { id: 'goblin', weight: 25 }, { id: 'imp', weight: 20 }, { id: 'construct', weight: 10 }]), groups: Object.freeze(['patrol', 'guard', 'ambush']) }) }),
  Object.freeze({ id: 'area_ashgrave_hollow', mapId: 'map_cinder_region', parentZoneId: 'zone_scorched_outskirts', name: 'Ashgrave Hollow', danger: 'Restless Dead', x: 1440, y: 640, width: 500, height: 640, identity: 'A low corpse-strewn basin where old graves, scavengers and undead overlap.', encounter: Object.freeze({ families: Object.freeze([{ id: 'skeleton', weight: 55 }, { id: 'rotwing', weight: 20 }, { id: 'carrion', weight: 15 }, { id: 'spider', weight: 10 }]), groups: Object.freeze(['ritual', 'guard', 'pack']) }) }),
  Object.freeze({ id: 'area_bone_road', mapId: 'map_cinder_region', parentZoneId: 'zone_bone_road', name: 'Bone Road', danger: 'Dead March', x: 1940, y: 0, width: 620, height: 1280, identity: 'A hostile march route dominated by organized ossuary dead and heavier guardians.', encounter: Object.freeze({ families: Object.freeze([{ id: 'skeleton', weight: 85 }, { id: 'construct', weight: 15 }]), groups: Object.freeze(['patrol', 'guard', 'ritual']) }) }),
  Object.freeze({ id: 'area_ashfall_hollow', mapId: 'map_ashfall_hollow', parentZoneId: 'zone_ashfall_hollow', name: 'Ashfall Hollow', danger: 'Cavern', x: 0, y: 0, width: 1024, height: 768, identity: 'A separate enclosed cavern habitat with tight sightlines and arachnid pressure.', encounter: Object.freeze({ families: Object.freeze([{ id: 'spider', weight: 100 }]), groups: Object.freeze(['pack', 'ambush']) }) })
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

export const RECOVERY_POINTS = Object.freeze([
  Object.freeze({ id: 'recovery_ashen_rest', name: 'Ashen Rest Hearth', mapId: 'map_cinder_region', x: 180, y: 805, radius: 78, label: 'FULL HEAL • HP + ESSENCE' })
]);

export const TOWN_PROP_DEFS = Object.freeze([
  { texture: 'castle2-set', frame: 148, x: 286, y: 425, scale: 1.0 }, // anvil
  { texture: 'castle2-set', frame: 233, x: 390, y: 620, scale: 1.0 }, // barrel
  { texture: 'castle2-set', frame: 232, x: 425, y: 620, scale: 1.0 }, // crate
  { texture: 'castle2-set', frame: 249, x: 465, y: 625, scale: 1.0 },
  { texture: 'castle2-set', frame: 255, x: 345, y: 800, scale: 1.15 }, // well/brazier-like round prop
  { texture: 'castle2-set', frame: 128, x: 595, y: 450, scale: 0.9 },
  { texture: 'castle2-set', frame: 129, x: 135, y: 825, scale: 0.95 },
  { texture: 'castle2-set', frame: 219, x: 565, y: 820, scale: 0.9 },
  { texture: 'adobe2-set', frame: 68, x: 392, y: 602, scale: 1.0 },
  { texture: 'adobe2-set', frame: 150, x: 548, y: 340, scale: 1.0 },
  { texture: 'adobe2-set', frame: 67, x: 247, y: 355, scale: 0.95 }
]);

export const SPAWN_REGIONS = Object.freeze([
  // Scorched Outskirts: several small hunting pockets instead of one repeated
  // monster carpet. Total population stays mobile-conscious while silhouettes
  // and loadouts vary much more.
  { id: 'spawn_cinder_imp_south', areaId: 'area_ashen_causeway', enemyId: 'enemy_cinder_imp', x: 770, y: 560, width: 350, height: 500, count: 4, respawnMs: 6500 },
  { id: 'spawn_blight_imp_north', areaId: 'area_emberfields', enemyId: 'enemy_blight_imp', x: 785, y: 145, width: 360, height: 300, count: 3, respawnMs: 7000 },
  { id: 'spawn_goblin_north', areaId: 'area_emberfields', enemyId: 'enemy_ash_goblin', x: 1060, y: 165, width: 350, height: 330, count: 3, respawnMs: 7600 },
  { id: 'spawn_cave_spider_south', areaId: 'area_cinderwood', enemyId: 'enemy_cave_spider', x: 1060, y: 735, width: 340, height: 300, count: 3, respawnMs: 7200 },
  { id: 'spawn_carrion_mid', areaId: 'area_fallen_watch', enemyId: 'enemy_carrion_beast', x: 1540, y: 205, width: 300, height: 180, count: 3, respawnMs: 8000 },
  { id: 'spawn_rotwing_south', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_rotwing_ravager', x: 1430, y: 730, width: 330, height: 330, count: 2, respawnMs: 9200 },
  { id: 'spawn_blueflame_edge', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_blueflame_imp', x: 1650, y: 500, width: 250, height: 330, count: 2, respawnMs: 9800 },
  { id: 'spawn_ember_spider_edge', areaId: 'area_fallen_watch', enemyId: 'enemy_ember_spider', x: 1700, y: 210, width: 140, height: 180, count: 2, respawnMs: 9800 },
  { id: 'spawn_skeleton_edge', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_ash_skeleton', x: 1770, y: 800, width: 160, height: 300, count: 2, respawnMs: 9400 },

  // Bone Road: fewer but more dangerous encounters.
  { id: 'spawn_skeleton_spearman', areaId: 'area_bone_road', enemyId: 'enemy_skeleton_spearman', x: 1930, y: 850, width: 210, height: 235, count: 1, respawnMs: 11800 },
  { id: 'spawn_skeleton_archer', areaId: 'area_bone_road', enemyId: 'enemy_skeleton_archer', x: 1965, y: 460, width: 210, height: 260, count: 1, respawnMs: 11200 },
  { id: 'spawn_skeleton_mage', areaId: 'area_bone_road', enemyId: 'enemy_skeleton_mage', x: 2160, y: 260, width: 190, height: 260, count: 1, respawnMs: 13200 },
  { id: 'spawn_slate_road', areaId: 'area_bone_road', enemyId: 'enemy_slate_revenant', x: 1980, y: 150, width: 240, height: 410, count: 2, respawnMs: 10800 },
  { id: 'spawn_bloodbone_road', areaId: 'area_bone_road', enemyId: 'enemy_bloodbone', x: 2110, y: 675, width: 230, height: 350, count: 2, respawnMs: 12200 },
  { id: 'spawn_gilded_guard', areaId: 'area_bone_road', enemyId: 'enemy_gilded_guard', x: 2290, y: 165, width: 190, height: 300, count: 1, respawnMs: 15500 },
  { id: 'spawn_paleweb_road', areaId: 'area_bone_road', enemyId: 'enemy_frost_spider', x: 1985, y: 780, width: 190, height: 270, count: 1, respawnMs: 13000 },
  { id: 'spawn_ashstone_golem', areaId: 'area_bone_road', enemyId: 'enemy_ashstone_golem', x: 2290, y: 820, width: 190, height: 220, count: 1, respawnMs: 22000 },
  { id: 'spawn_captain', areaId: 'area_bone_road', enemyId: 'enemy_bone_captain', x: 2390, y: 545, width: 90, height: 120, count: 1, respawnMs: 24000 },

  // First separately loaded map. These actors do not exist while the Cinder
  // Region scene package is active, proving that map population is scoped.
  { id: 'spawn_hollow_cave_spider', areaId: 'area_ashfall_hollow', enemyId: 'enemy_cave_spider', x: 120, y: 100, width: 420, height: 430, count: 3, respawnMs: 7600, mapId: 'map_ashfall_hollow' },
  { id: 'spawn_hollow_mire_spider', areaId: 'area_ashfall_hollow', enemyId: 'enemy_mire_spider', x: 515, y: 120, width: 390, height: 390, count: 2, respawnMs: 9800, mapId: 'map_ashfall_hollow' }
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
    source: wall.source || 'visible-wall',
    x: (wall.x1 + wall.x2) / 2,
    y: (wall.y1 + wall.y2) / 2,
    width: horizontal ? Math.abs(wall.x2 - wall.x1) : wall.thickness,
    height: horizontal ? wall.thickness : Math.abs(wall.y2 - wall.y1),
    blocksActors: Object.freeze([...(wall.blocksActors || ['player', 'enemy'])])
  };
};

// Broken wall segments seed the first traversal-heavy wilderness landmark. The
// gaps are deliberate and visible; there is no invisible enclosing rectangle.
export const FALLEN_WATCH_WALLS = Object.freeze([
  { id: 'fallen-watch-west', source: 'ruin-wall', x1: 1510, y1: 165, x2: 1510, y2: 365, thickness: 14 },
  { id: 'fallen-watch-north-west', source: 'ruin-wall', x1: 1510, y1: 165, x2: 1635, y2: 165, thickness: 14 },
  { id: 'fallen-watch-north-east', source: 'ruin-wall', x1: 1730, y1: 165, x2: 1880, y2: 165, thickness: 14 },
  { id: 'fallen-watch-south-west', source: 'ruin-wall', x1: 1510, y1: 430, x2: 1680, y2: 430, thickness: 14 },
  { id: 'fallen-watch-east', source: 'ruin-wall', x1: 1880, y1: 165, x2: 1880, y2: 335, thickness: 14 }
]);

// Only visibly represented walls and building footprints receive static
// collision. World edges are already enforced by Arcade world bounds, and
// decorative rocks/road props intentionally never create hidden blockers.
// Ground enemies now respect the same solids as the player. Future phasing or
// flying actors opt out explicitly through their traversal profile.
export const COLLIDERS = Object.freeze([
  ...REFUGE_WALLS.map(wallCollider),
  ...FALLEN_WATCH_WALLS.map(wallCollider),
  ...BUILDING_DEFS.map(building => ({ id: `building-${building.id}`, source: 'building', blocksActors: Object.freeze(['player', 'enemy']), ...building.collider }))
]);



export const PROP_DEFS = Object.freeze([
  // Deliberate refuge greenery instead of a grid of trees through buildings.
  { texture: 'tree-trunks', frame: 2, x: 75, y: 235, scale: 1.65 },
  { texture: 'tree-trunks', frame: 6, x: 635, y: 215, scale: 1.6 },
  { texture: 'tree-trunks', frame: 9, x: 80, y: 925, scale: 1.7 },
  { texture: 'tree-trunks', frame: 3, x: 625, y: 945, scale: 1.65 },

  // Additional 4-season vegetation harvested from the existing Core archive.
  // These are scenery only and never create collision.
  ...[
    { texture: 'bush-evergreen', frame: 3, x: 845, y: 230, scale: 1.25 },
    { texture: 'bush-evergreen', frame: 4, x: 1015, y: 1045, scale: 1.15 },
    { texture: 'bush-evergreen', frame: 5, x: 1325, y: 540, scale: 1.2 },
    { texture: 'bush-seasonal', frame: 12, x: 1535, y: 270, scale: 1.0 },
    { texture: 'bush-seasonal', frame: 13, x: 1835, y: 1060, scale: 0.95 },
    { texture: 'bush-seasonal', frame: 15, x: 2045, y: 1080, scale: 0.9 },
    { texture: 'bush-seasonal', frame: 16, x: 2390, y: 1030, scale: 0.9 },
    { texture: 'mushrooms', frame: 3, x: 1160, y: 505, scale: 0.9 },
    { texture: 'mushrooms', frame: 18, x: 1225, y: 530, scale: 0.9 },
    { texture: 'mushrooms', frame: 21, x: 1710, y: 430, scale: 0.9 },
    { texture: 'mushrooms', frame: 23, x: 2010, y: 900, scale: 0.9 },
    { texture: 'mushrooms', frame: 25, x: 2215, y: 410, scale: 0.9 },
    { texture: 'pine-tree-large', x: 930, y: 1120, scale: 1.05 },
    { texture: 'pine-tree-large', x: 1470, y: 1145, scale: 0.92 },
    { texture: 'pine-tree-cluster', x: 1780, y: 1125, scale: 0.72 },
    { texture: 'pine-tree-large', x: 2075, y: 1160, scale: 0.92 },
    { texture: 'pine-tree-cluster', x: 2410, y: 1135, scale: 0.70 }
  ],

  ...Array.from({ length: 20 }, (_, i) => ({ texture: 'rocks-grass', frame: (i * 3) % 18, x: 790 + (i % 5) * 220, y: 100 + Math.floor(i / 5) * 320, scale: 1.12 + (i % 3) * 0.12 })),
  ...Array.from({ length: 10 }, (_, i) => ({ texture: 'rocks-cliffs', frame: (i * 5) % 24, x: 1980 + (i % 3) * 190, y: 90 + Math.floor(i / 3) * 300, scale: 1.30 })),
  { texture: 'dungeon-elements', frame: 64, x: 2010, y: 555, scale: 1.5 },
  { texture: 'dungeon-elements', frame: 65, x: 2055, y: 555, scale: 1.5 }
]);

// v0.1.2.4 map registry. The original 2560x1280 world remains one coherent
// region; interiors, caves and future distant regions can now be separate maps
// with their own bounds, population and world-art asset package.
export const DEFAULT_MAP_ID = 'map_cinder_region';

export const MAP_DEFS = Object.freeze({
  map_cinder_region: Object.freeze({
    id: 'map_cinder_region',
    name: 'Cinder Region',
    width: 2560,
    height: 1280,
    renderer: 'cinder_region',
    entryPoints: Object.freeze({
      cinder_start: Object.freeze({ x: 330, y: 610 }),
      from_hollow: Object.freeze({ x: 1215, y: 1040 })
    }),
    zoneIds: Object.freeze(['zone_cinder_refuge', 'zone_scorched_outskirts', 'zone_bone_road']),
    areaIds: Object.freeze(['area_cinder_refuge', 'area_ashen_causeway', 'area_emberfields', 'area_cinderwood', 'area_first_light_scar', 'area_fallen_watch', 'area_ashgrave_hollow', 'area_bone_road']),
    worldAssetKeys: Object.freeze([
      'terrain-dirt', 'grass-dirt', 'rocks-cliffs', 'rocks-grass', 'tree-trunks',
      'bridge', 'dungeon-elements', 'castle2-set', 'adobe2-set', 'mushrooms',
      'bush-evergreen', 'bush-seasonal', 'pine-tree-large', 'pine-tree-cluster',
      'adobe-house-tower', 'adobe-house-east', 'adobe-workshop'
    ])
  }),
  map_ashfall_hollow: Object.freeze({
    id: 'map_ashfall_hollow',
    name: 'Ashfall Hollow',
    width: 1024,
    height: 768,
    renderer: 'ashfall_hollow',
    entryPoints: Object.freeze({
      from_cinder: Object.freeze({ x: 512, y: 620 }),
      hollow_center: Object.freeze({ x: 512, y: 600 })
    }),
    zoneIds: Object.freeze(['zone_ashfall_hollow']),
    areaIds: Object.freeze(['area_ashfall_hollow']),
    worldAssetKeys: Object.freeze(['cave3-set'])
  })
});

// Transition records use stable map/entry IDs so saves never depend on scene
// implementation details. `Use` activates a nearby transition.
export const MAP_TRANSITIONS = Object.freeze([
  Object.freeze({
    id: 'transition_outskirts_hollow', mapId: 'map_cinder_region', x: 1215, y: 1120, radius: 82,
    label: 'Ashfall Hollow', destinationMapId: 'map_ashfall_hollow', destinationEntryId: 'from_cinder'
  }),
  Object.freeze({
    id: 'transition_hollow_outskirts', mapId: 'map_ashfall_hollow', x: 512, y: 715, radius: 78,
    label: 'Return to Scorched Outskirts', destinationMapId: 'map_cinder_region', destinationEntryId: 'from_hollow'
  })
]);

// Hollow walls are visible rock borders. The southern opening aligns with the
// return transition; there are no invisible arbitrary blockers.
export const HOLLOW_WALLS = Object.freeze([
  { id: 'hollow-north', x1: 36, y1: 36, x2: 988, y2: 36, thickness: 22 },
  { id: 'hollow-west', x1: 36, y1: 36, x2: 36, y2: 732, thickness: 22 },
  { id: 'hollow-east', x1: 988, y1: 36, x2: 988, y2: 732, thickness: 22 },
  { id: 'hollow-south-west', x1: 36, y1: 732, x2: 438, y2: 732, thickness: 22 },
  { id: 'hollow-south-east', x1: 586, y1: 732, x2: 988, y2: 732, thickness: 22 }
]);

export const HOLLOW_COLLIDERS = Object.freeze(HOLLOW_WALLS.map(wallCollider));

export function mapIdForZone(zoneId) {
  if (zoneId === 'zone_ashfall_hollow') return 'map_ashfall_hollow';
  return DEFAULT_MAP_ID;
}

export function mapForId(mapId) {
  return MAP_DEFS[mapId] || MAP_DEFS[DEFAULT_MAP_ID];
}

