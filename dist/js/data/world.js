// v0.1.4.2 world data: Cinder Refuge is now its own deliberately composed
// settlement map while the Cinder Wilds have room to breathe as a larger
// exterior region. All placement remains data-driven so future maps can reuse
// the same render/collision paths without baking coordinates into actor code.

export const ZONES = Object.freeze([
  {
    id: 'zone_cinder_refuge', name: 'Cinder Refuge', x: 0, y: 0, width: 2048, height: 1536, danger: 'Sanctuary',
    levelRange: [1, 3], safe: true, hostile: false, biome: 'ash_settlement', eventTags: ['guild_hub_future', 'town_event_future'], dungeonHooks: [], mapId: 'map_cinder_refuge'
  },
  {
    id: 'zone_scorched_outskirts', name: 'Scorched Outskirts', x: 0, y: 0, width: 5600, height: 2048, danger: 'Hunting Ground',
    levelRange: [1, 5], safe: false, hostile: true, biome: 'scorched_waste', eventTags: ['hunt', 'assault_future'], dungeonHooks: ['outskirts_ruin_future'], mapId: 'map_cinder_wilds'
  },
  {
    id: 'zone_bone_road', name: 'Bone Road', x: 5600, y: 0, width: 800, height: 2048, danger: 'Dead March',
    levelRange: [4, 8], safe: false, hostile: true, biome: 'bone_march', eventTags: ['elite_hunt', 'guild_conflict_future'], dungeonHooks: ['ossuary_future'], mapId: 'map_cinder_wilds'
  },
  {
    id: 'zone_ashfall_hollow', name: 'Ashfall Hollow', x: 0, y: 0, width: 1024, height: 768, danger: 'Cavern',
    levelRange: [2, 5], safe: false, hostile: true, biome: 'ash_cavern', eventTags: ['cave_hunt'], dungeonHooks: [], mapId: 'map_ashfall_hollow'
  }
]);

// Every active map is partitioned exactly once by local areas. The HUD uses
// these records for identity while the encounter metadata remains staged for
// later family/group population work.
export const AREA_DEFS = Object.freeze([
  Object.freeze({ id: 'area_cinder_refuge', mapId: 'map_cinder_refuge', parentZoneId: 'zone_cinder_refuge', name: 'Cinder Refuge', danger: 'Sanctuary', x: 0, y: 0, width: 2048, height: 1536, identity: 'A fortified survivor settlement of repaired adobe, old fortress stone and scavenged war material.', encounter: Object.freeze({ families: Object.freeze([]), groups: Object.freeze([]) }) }),
  Object.freeze({ id: 'area_ashen_causeway', mapId: 'map_cinder_wilds', parentZoneId: 'zone_scorched_outskirts', name: 'Ashen Causeway', danger: 'Frayed Safety', x: 0, y: 0, width: 1200, height: 2048, identity: 'The long battered road east of Refuge, dotted with old checkpoints, carts and abandoned camps.', encounter: Object.freeze({ families: Object.freeze([{ id: 'human', weight: 35 }, { id: 'imp', weight: 35 }, { id: 'goblin', weight: 20 }, { id: 'carrion', weight: 10 }]), groups: Object.freeze(['roam', 'patrol', 'guard']) }) }),
  Object.freeze({ id: 'area_emberfields', mapId: 'map_cinder_wilds', parentZoneId: 'zone_scorched_outskirts', name: 'Emberfields', danger: 'Open Hunting Ground', x: 1200, y: 0, width: 1600, height: 1024, identity: 'Wide burned flats with long sightlines, ash gullies and the remains of small roadside settlements.', encounter: Object.freeze({ families: Object.freeze([{ id: 'imp', weight: 38 }, { id: 'goblin', weight: 27 }, { id: 'human', weight: 20 }, { id: 'spider', weight: 15 }]), groups: Object.freeze(['roam', 'pack', 'patrol', 'guard']) }) }),
  Object.freeze({ id: 'area_cinderwood', mapId: 'map_cinder_wilds', parentZoneId: 'zone_scorched_outskirts', name: 'Cinderwood', danger: 'Ambush Country', x: 1200, y: 1024, width: 1600, height: 1024, identity: 'A burned woodland fringe where dead trunks, stone shelves and brush break sightlines into narrow hunting lanes.', encounter: Object.freeze({ families: Object.freeze([{ id: 'spider', weight: 45 }, { id: 'carrion', weight: 25 }, { id: 'human', weight: 20 }, { id: 'imp', weight: 10 }]), groups: Object.freeze(['pack', 'ambush']) }) }),
  Object.freeze({ id: 'area_first_light_scar', mapId: 'map_cinder_wilds', parentZoneId: 'zone_scorched_outskirts', name: 'First-Light Scar', danger: 'Celestial Incursion', x: 2800, y: 0, width: 1400, height: 2048, identity: 'A gold-white wound through the ash where ancient holy geometry and battlefield wreckage surround Azrael.', encounter: Object.freeze({ families: Object.freeze([{ id: 'demon', weight: 38 }, { id: 'imp', weight: 27 }, { id: 'carrion', weight: 20 }, { id: 'celestial', weight: 15 }]), groups: Object.freeze(['guard', 'patrol', 'ritual']), celestialPopulationPlanned: true }) }),
  Object.freeze({ id: 'area_fallen_watch', mapId: 'map_cinder_wilds', parentZoneId: 'zone_scorched_outskirts', name: 'The Fallen Watch', danger: 'Ruined Strongpoint', x: 4200, y: 0, width: 1400, height: 1024, identity: 'A shattered fortress outpost with broken walls, defensive lanes and abandoned supply works.', encounter: Object.freeze({ families: Object.freeze([{ id: 'skeleton', weight: 40 }, { id: 'human', weight: 25 }, { id: 'goblin', weight: 15 }, { id: 'spider', weight: 10 }, { id: 'construct', weight: 10 }]), groups: Object.freeze(['patrol', 'guard', 'ambush', 'pack']) }) }),
  Object.freeze({ id: 'area_ashgrave_hollow', mapId: 'map_cinder_wilds', parentZoneId: 'zone_scorched_outskirts', name: 'Ashgrave Hollow', danger: 'Restless Dead', x: 4200, y: 1024, width: 1400, height: 1024, identity: 'A corpse-strewn basin of graves, ruined shrines and scavenger paths descending toward deeper death.', encounter: Object.freeze({ families: Object.freeze([{ id: 'skeleton', weight: 55 }, { id: 'rotwing', weight: 20 }, { id: 'carrion', weight: 15 }, { id: 'spider', weight: 10 }]), groups: Object.freeze(['ritual', 'guard', 'pack']) }) }),
  Object.freeze({ id: 'area_bone_road', mapId: 'map_cinder_wilds', parentZoneId: 'zone_bone_road', name: 'Bone Road', danger: 'Dead March', x: 5600, y: 0, width: 800, height: 2048, identity: 'A hostile military road dominated by organized ossuary dead and heavier guardians.', encounter: Object.freeze({ families: Object.freeze([{ id: 'skeleton', weight: 85 }, { id: 'construct', weight: 15 }]), groups: Object.freeze(['patrol', 'guard', 'ritual']) }) }),
  Object.freeze({ id: 'area_ashfall_hollow', mapId: 'map_ashfall_hollow', parentZoneId: 'zone_ashfall_hollow', name: 'Ashfall Hollow', danger: 'Cavern', x: 0, y: 0, width: 1024, height: 768, identity: 'A separate enclosed cavern habitat with tight sightlines and arachnid pressure.', encounter: Object.freeze({ families: Object.freeze([{ id: 'spider', weight: 100 }]), groups: Object.freeze(['pack', 'ambush']) }) })
]);

export const BUILDING_DEFS = Object.freeze([
  { id: 'refuge_forge', mapId: 'map_cinder_refuge', name: 'Torren’s Forge', texture: 'adobe-workshop', x: 470, y: 390, scale: 0.92, depthOffset: -30, collider: { x: 470, y: 423, width: 245, height: 62 } },
  { id: 'refuge_warden_hall', mapId: 'map_cinder_refuge', name: 'Warden Hall', texture: 'adobe-house-tower', x: 1515, y: 500, scale: 1.13, depthOffset: -38, collider: { x: 1515, y: 548, width: 130, height: 84 } },
  { id: 'refuge_inn', mapId: 'map_cinder_refuge', name: 'Ashen Rest', texture: 'adobe-house-east', x: 760, y: 1115, scale: 1.08, flipX: true, depthOffset: -38, collider: { x: 760, y: 1158, width: 124, height: 80 } },
  { id: 'refuge_storehouse', mapId: 'map_cinder_refuge', name: 'Refuge Stores', texture: 'adobe-house-east', x: 1150, y: 1120, scale: 1.04, depthOffset: -38, collider: { x: 1150, y: 1162, width: 120, height: 78 } },
  { id: 'refuge_hunter_house', mapId: 'map_cinder_refuge', name: 'Hunter House', texture: 'adobe-house-tower', x: 360, y: 1000, scale: 0.88, flipX: true, depthOffset: -34, collider: { x: 360, y: 1036, width: 100, height: 66 } },
  { id: 'refuge_cinder_house', mapId: 'map_cinder_refuge', name: 'Cinder House', texture: 'adobe-house-tower', x: 1190, y: 330, scale: 0.86, depthOffset: -34, collider: { x: 1190, y: 365, width: 98, height: 64 } },
  { id: 'refuge_tailor', mapId: 'map_cinder_refuge', name: 'Thread & Ash', texture: 'adobe-house-west', x: 815, y: 350, scale: 0.95, depthOffset: -34, collider: { x: 815, y: 389, width: 92, height: 72 } },
  { id: 'refuge_lodge', mapId: 'map_cinder_refuge', name: 'East Lodge', texture: 'adobe-house-east', x: 1440, y: 1030, scale: 0.92, flipX: true, depthOffset: -34, collider: { x: 1440, y: 1068, width: 108, height: 70 } },
  { id: 'refuge_south_house', mapId: 'map_cinder_refuge', name: 'Road House', texture: 'adobe-house-west', x: 540, y: 1190, scale: 0.85, flipX: true, depthOffset: -34, collider: { x: 540, y: 1225, width: 82, height: 64 } }
]);

export const RECOVERY_POINTS = Object.freeze([
  Object.freeze({ id: 'recovery_ashen_rest', name: 'Ashen Rest Hearth', mapId: 'map_cinder_refuge', x: 760, y: 1250, radius: 82, label: 'FULL HEAL • HP + ESSENCE' })
]);

// Small curated props harvested from existing tilesheets and source workshop
// art. They make the town lived-in without loading the full authoring sheets.
export const TOWN_PROP_DEFS = Object.freeze([
  { mapId: 'map_cinder_refuge', texture: 'prop-smith-forge', x: 360, y: 465, scale: 0.78, depthOffset: 4 },
  { mapId: 'map_cinder_refuge', texture: 'prop-smith-tools', x: 535, y: 495, scale: 0.9, depthOffset: 5 },
  { mapId: 'map_cinder_refuge', texture: 'prop-smith-racks', x: 500, y: 550, scale: 0.68, depthOffset: 5 },
  { mapId: 'map_cinder_refuge', texture: 'prop-wood-bench', x: 285, y: 630, scale: 0.72, depthOffset: 5 },
  { mapId: 'map_cinder_refuge', texture: 'prop-wood-toolboard', x: 285, y: 700, scale: 0.64, depthOffset: 5 },
  { mapId: 'map_cinder_refuge', texture: 'prop-tailor-loom', x: 910, y: 435, scale: 0.82, depthOffset: 5 },
  { mapId: 'map_cinder_refuge', texture: 'prop-tailor-display', x: 825, y: 525, scale: 0.58, depthOffset: 5 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 148, x: 430, y: 545, scale: 1.0 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 233, x: 1030, y: 755, scale: 1.0 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 232, x: 1070, y: 755, scale: 1.0 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 249, x: 1110, y: 760, scale: 1.0 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 255, x: 995, y: 760, scale: 1.15 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 158, x: 940, y: 845, scale: 1.05 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 159, x: 1065, y: 845, scale: 1.05 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 128, x: 1235, y: 1040, scale: 0.95 },
  { mapId: 'map_cinder_refuge', texture: 'castle2-set', frame: 129, x: 1280, y: 1040, scale: 0.95 },
  { mapId: 'map_cinder_refuge', texture: 'adobe2-set', frame: 68, x: 970, y: 735, scale: 1.0 },
  { mapId: 'map_cinder_refuge', texture: 'adobe2-set', frame: 150, x: 1540, y: 610, scale: 1.0 },
  { mapId: 'map_cinder_refuge', texture: 'adobe2-set', frame: 67, x: 435, y: 425, scale: 0.95 }
]);

export const SPAWN_REGIONS = Object.freeze([
  // Ashen Causeway: loose imps near the road plus a human toll gang guarding
  // a chokepoint. Shared encounterId values make related actors alert together.
  { id: 'spawn_cinder_imp_south', encounterId: 'enc_causeway_imps', archetype: 'roam', mapId: 'map_cinder_wilds', areaId: 'area_ashen_causeway', enemyId: 'enemy_cinder_imp', x: 560, y: 650, width: 360, height: 480, count: 2, respawnMs: 7200, activationRange: 900 },
  { id: 'spawn_causeway_scavengers', encounterId: 'enc_causeway_tollgang', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_ashen_causeway', enemyId: 'enemy_ash_scavenger', x: 720, y: 1320, width: 300, height: 280, count: 2, respawnMs: 9800, activationRange: 980 },
  { id: 'spawn_causeway_enforcer', encounterId: 'enc_causeway_tollgang', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_ashen_causeway', enemyId: 'enemy_ironbound_raider', x: 830, y: 1400, width: 150, height: 160, count: 1, respawnMs: 12800, activationRange: 980 },

  // Emberfields: packs remain separated spatially so a player can read one
  // local threat at a time instead of chain-pulling the entire biome.
  { id: 'spawn_blight_imp_north', encounterId: 'enc_ember_blighters', archetype: 'pack', mapId: 'map_cinder_wilds', areaId: 'area_emberfields', enemyId: 'enemy_blight_imp', x: 1320, y: 150, width: 430, height: 320, count: 2, respawnMs: 7600, activationRange: 950 },
  { id: 'spawn_goblin_north', encounterId: 'enc_ember_goblin_raid', archetype: 'patrol', mapId: 'map_cinder_wilds', areaId: 'area_emberfields', enemyId: 'enemy_ash_goblin', x: 1880, y: 220, width: 470, height: 330, count: 2, respawnMs: 8200, activationRange: 980, patrolPath: [[1880, 330], [2260, 310], [2500, 500], [2180, 590]] },
  { id: 'spawn_ember_scavenger_looters', encounterId: 'enc_ember_looters', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_emberfields', enemyId: 'enemy_ash_scavenger', x: 1980, y: 840, width: 470, height: 145, count: 2, respawnMs: 10400, activationRange: 980 },

  // Cinderwood: creature packs plus two genuine proximity ambushes.
  { id: 'spawn_cave_spider_south', encounterId: 'enc_cinderwood_web', archetype: 'ambush', mapId: 'map_cinder_wilds', areaId: 'area_cinderwood', enemyId: 'enemy_cave_spider', x: 1450, y: 1390, width: 470, height: 430, count: 2, respawnMs: 8200, activationRange: 850, ambushRange: 155 },
  { id: 'spawn_cinderwood_assassin', encounterId: 'enc_cinderwood_stalker', archetype: 'ambush', mapId: 'map_cinder_wilds', areaId: 'area_cinderwood', enemyId: 'enemy_ash_assassin', x: 2470, y: 1640, width: 190, height: 180, count: 1, respawnMs: 26000, activationRange: 850, ambushRange: 175 },

  // First-Light Scar: a small Demon Legion recon element gives Azrael's
  // territory an active front line without introducing unfinished friendly
  // celestial troops yet. Azrael's own controller remains untouched.
  { id: 'spawn_firstlight_demon_scouts', encounterId: 'enc_firstlight_demon_patrol', archetype: 'patrol', mapId: 'map_cinder_wilds', areaId: 'area_first_light_scar', enemyId: 'enemy_demon_scout', x: 2920, y: 250, width: 500, height: 180, count: 2, respawnMs: 11800, activationRange: 1050, patrolPath: [[2980, 330], [3380, 340], [3700, 610], [3300, 760], [3000, 610]] },

  // Fallen Watch: undead inside the broken fort, beasts outside it, a human
  // salvage crew east of the wall, and a dormant emberweb nest.
  { id: 'spawn_carrion_mid', encounterId: 'enc_fallen_watch_carrion', archetype: 'pack', mapId: 'map_cinder_wilds', areaId: 'area_fallen_watch', enemyId: 'enemy_carrion_beast', x: 4250, y: 550, width: 250, height: 300, count: 1, respawnMs: 9000, activationRange: 900 },
  { id: 'spawn_fallen_watch_deadguard', encounterId: 'enc_fallen_watch_guard', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_fallen_watch', enemyId: 'enemy_ash_skeleton', x: 4660, y: 300, width: 470, height: 300, count: 2, respawnMs: 10400, activationRange: 980 },
  { id: 'spawn_fallen_watch_raiders', encounterId: 'enc_fallen_watch_raiders', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_fallen_watch', enemyId: 'enemy_ash_scavenger', x: 5360, y: 640, width: 170, height: 260, count: 1, respawnMs: 10800, activationRange: 980 },
  { id: 'spawn_fallen_watch_ironbound', encounterId: 'enc_fallen_watch_raiders', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_fallen_watch', enemyId: 'enemy_ironbound_raider', x: 5390, y: 690, width: 130, height: 150, count: 1, respawnMs: 14500, activationRange: 980 },
  { id: 'spawn_ember_spider_edge', encounterId: 'enc_fallen_watch_emberweb', archetype: 'ambush', mapId: 'map_cinder_wilds', areaId: 'area_fallen_watch', enemyId: 'enemy_ember_spider', x: 5350, y: 300, width: 180, height: 280, count: 1, respawnMs: 10800, activationRange: 850, ambushRange: 145 },

  // Ashgrave: one mixed ritual group demonstrates role composition while other
  // creatures remain separate packs so the basin does not become one giant pull.
  { id: 'spawn_rotwing_south', encounterId: 'enc_ashgrave_rotwings', archetype: 'pack', mapId: 'map_cinder_wilds', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_rotwing_ravager', x: 4390, y: 1320, width: 430, height: 380, count: 1, respawnMs: 10200, activationRange: 950 },
  { id: 'spawn_blueflame_edge', encounterId: 'enc_ashgrave_blueflame', archetype: 'roam', mapId: 'map_cinder_wilds', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_blueflame_imp', x: 4930, y: 1490, width: 380, height: 330, count: 1, respawnMs: 10800, activationRange: 900 },
  { id: 'spawn_ashgrave_ritual_guard', encounterId: 'enc_ashgrave_ritual', archetype: 'ritual', mapId: 'map_cinder_wilds', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_ash_skeleton', x: 5040, y: 1160, width: 310, height: 250, count: 2, respawnMs: 10800, activationRange: 1000 },
  { id: 'spawn_ashgrave_ritual_mage', encounterId: 'enc_ashgrave_ritual', archetype: 'ritual', mapId: 'map_cinder_wilds', areaId: 'area_ashgrave_hollow', enemyId: 'enemy_skeleton_mage', x: 5150, y: 1240, width: 150, height: 150, count: 1, respawnMs: 14500, activationRange: 1000 },

  // Bone Road: explicit military patrol/guard composition.
  { id: 'spawn_skeleton_spearman', encounterId: 'enc_bone_road_patrol', archetype: 'patrol', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_skeleton_spearman', x: 5660, y: 1320, width: 250, height: 300, count: 1, respawnMs: 12800, activationRange: 1050, patrolPath: [[5700, 1500], [5850, 1260], [6030, 1080], [6150, 820], [5920, 660], [5750, 900]] },
  { id: 'spawn_skeleton_archer', encounterId: 'enc_bone_road_patrol', archetype: 'patrol', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_skeleton_archer', x: 5700, y: 780, width: 260, height: 320, count: 1, respawnMs: 12200, activationRange: 1050, patrolPath: [[5700, 1500], [5850, 1260], [6030, 1080], [6150, 820], [5920, 660], [5750, 900]] },
  { id: 'spawn_slate_road', encounterId: 'enc_bone_road_patrol', archetype: 'patrol', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_slate_revenant', x: 5650, y: 180, width: 280, height: 420, count: 1, respawnMs: 11800, activationRange: 1050, patrolPath: [[5700, 1500], [5850, 1260], [6030, 1080], [6150, 820], [5920, 660], [5750, 900]] },
  { id: 'spawn_bloodbone_road', encounterId: 'enc_bone_road_guard', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_bloodbone', x: 5940, y: 1040, width: 250, height: 380, count: 1, respawnMs: 13200, activationRange: 1000 },
  { id: 'spawn_gilded_guard', encounterId: 'enc_bone_road_guard', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_gilded_guard', x: 6110, y: 280, width: 220, height: 320, count: 1, respawnMs: 16500, activationRange: 1000 },
  { id: 'spawn_paleweb_road', encounterId: 'enc_bone_road_guard', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_frost_spider', x: 5680, y: 1610, width: 250, height: 280, count: 1, respawnMs: 14000, activationRange: 1000 },
  { id: 'spawn_ashstone_golem', encounterId: 'enc_bone_road_guard', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_ashstone_golem', x: 6070, y: 1510, width: 240, height: 260, count: 1, respawnMs: 23000, activationRange: 1000 },
  { id: 'spawn_captain', encounterId: 'enc_bone_road_captain', archetype: 'guard', mapId: 'map_cinder_wilds', areaId: 'area_bone_road', enemyId: 'enemy_bone_captain', x: 6200, y: 930, width: 100, height: 130, count: 1, respawnMs: 25000, activationRange: 1000 },

  // Ashfall Hollow remains deliberately small but now differentiates a visible
  // roaming nest from a proximity-triggered mire ambush.
  { id: 'spawn_hollow_cave_spider', encounterId: 'enc_hollow_cave_nest', archetype: 'pack', mapId: 'map_ashfall_hollow', areaId: 'area_ashfall_hollow', enemyId: 'enemy_cave_spider', x: 120, y: 100, width: 420, height: 430, count: 3, respawnMs: 8200, activationRange: 760 },
  { id: 'spawn_hollow_mire_spider', encounterId: 'enc_hollow_mire_ambush', archetype: 'ambush', mapId: 'map_ashfall_hollow', areaId: 'area_ashfall_hollow', enemyId: 'enemy_mire_spider', x: 515, y: 120, width: 390, height: 390, count: 2, respawnMs: 10800, activationRange: 720, ambushRange: 145 }
]);

export const REFUGE_WALLS = Object.freeze([
  // A broad east gate replaces the old thin divider. Visual stone tiles and
  // buttresses are rendered from these exact segments, so art and collision
  // share one source of truth.
  { id: 'refuge-north', mapId: 'map_cinder_refuge', x1: 92, y1: 92, x2: 1956, y2: 92, thickness: 30 },
  { id: 'refuge-south', mapId: 'map_cinder_refuge', x1: 92, y1: 1444, x2: 1956, y2: 1444, thickness: 30 },
  { id: 'refuge-west', mapId: 'map_cinder_refuge', x1: 92, y1: 92, x2: 92, y2: 1444, thickness: 30 },
  { id: 'refuge-east-north', mapId: 'map_cinder_refuge', x1: 1956, y1: 92, x2: 1956, y2: 558, thickness: 30 },
  { id: 'refuge-east-south', mapId: 'map_cinder_refuge', x1: 1956, y1: 978, x2: 1956, y2: 1444, thickness: 30 }
]);

const wallCollider = wall => {
  const horizontal = wall.y1 === wall.y2;
  return {
    id: wall.id,
    mapId: wall.mapId,
    source: wall.source || 'visible-wall',
    x: (wall.x1 + wall.x2) / 2,
    y: (wall.y1 + wall.y2) / 2,
    width: horizontal ? Math.abs(wall.x2 - wall.x1) : wall.thickness,
    height: horizontal ? wall.thickness : Math.abs(wall.y2 - wall.y1),
    blocksActors: Object.freeze([...(wall.blocksActors || ['player', 'enemy'])])
  };
};

export const FALLEN_WATCH_WALLS = Object.freeze([
  { id: 'fallen-watch-west', mapId: 'map_cinder_wilds', source: 'ruin-wall', x1: 4560, y1: 210, x2: 4560, y2: 720, thickness: 24 },
  { id: 'fallen-watch-north-west', mapId: 'map_cinder_wilds', source: 'ruin-wall', x1: 4560, y1: 210, x2: 4820, y2: 210, thickness: 24 },
  { id: 'fallen-watch-north-east', mapId: 'map_cinder_wilds', source: 'ruin-wall', x1: 4970, y1: 210, x2: 5320, y2: 210, thickness: 24 },
  { id: 'fallen-watch-south-west', mapId: 'map_cinder_wilds', source: 'ruin-wall', x1: 4560, y1: 790, x2: 4900, y2: 790, thickness: 24 },
  { id: 'fallen-watch-south-east', mapId: 'map_cinder_wilds', source: 'ruin-wall', x1: 5050, y1: 790, x2: 5320, y2: 790, thickness: 24 },
  { id: 'fallen-watch-east', mapId: 'map_cinder_wilds', source: 'ruin-wall', x1: 5320, y1: 210, x2: 5320, y2: 610, thickness: 24 }
]);

// A handful of large natural/ruin blockers give the enlarged wilds true
// sightline breaks. Each is paired with visible art in the renderer.
export const WILDS_STRUCTURE_COLLIDERS = Object.freeze([
  { id: 'burnt-hamlet-west-house', mapId: 'map_cinder_wilds', source: 'ruined-building', x: 2110, y: 720, width: 124, height: 76, blocksActors: Object.freeze(['player', 'enemy']) },
  { id: 'burnt-hamlet-east-house', mapId: 'map_cinder_wilds', source: 'ruined-building', x: 2400, y: 760, width: 116, height: 74, blocksActors: Object.freeze(['player', 'enemy']) },
  { id: 'cinderwood-rock-shelf', mapId: 'map_cinder_wilds', source: 'natural-rock', x: 2040, y: 1350, width: 170, height: 58, blocksActors: Object.freeze(['player', 'enemy']) },
  { id: 'first-light-shrine', mapId: 'map_cinder_wilds', source: 'ruined-shrine', x: 3250, y: 540, width: 105, height: 68, blocksActors: Object.freeze(['player', 'enemy']) }
]);

// All normal ground-solid colliders carry a mapId. WorldScene filters this
// array for the active map, avoiding parallel collision registries as maps grow.
export const COLLIDERS = Object.freeze([
  ...REFUGE_WALLS.map(wallCollider),
  ...FALLEN_WATCH_WALLS.map(wallCollider),
  ...WILDS_STRUCTURE_COLLIDERS,
  ...BUILDING_DEFS.map(building => ({ id: `building-${building.id}`, mapId: building.mapId, source: 'building', blocksActors: Object.freeze(['player', 'enemy']), ...building.collider }))
]);

export const PROP_DEFS = Object.freeze([
  // Refuge vegetation and perimeter clutter.
  { mapId: 'map_cinder_refuge', texture: 'tree-trunks', frame: 2, x: 155, y: 260, scale: 1.7 },
  { mapId: 'map_cinder_refuge', texture: 'tree-trunks', frame: 6, x: 1860, y: 270, scale: 1.7 },
  { mapId: 'map_cinder_refuge', texture: 'tree-trunks', frame: 9, x: 165, y: 1325, scale: 1.75 },
  { mapId: 'map_cinder_refuge', texture: 'tree-trunks', frame: 3, x: 1850, y: 1320, scale: 1.7 },
  { mapId: 'map_cinder_refuge', texture: 'bush-evergreen', frame: 3, x: 260, y: 300, scale: 1.15 },
  { mapId: 'map_cinder_refuge', texture: 'bush-evergreen', frame: 4, x: 1710, y: 310, scale: 1.15 },
  { mapId: 'map_cinder_refuge', texture: 'bush-seasonal', frame: 13, x: 260, y: 1290, scale: 0.95 },
  { mapId: 'map_cinder_refuge', texture: 'mushrooms', frame: 18, x: 630, y: 1280, scale: 0.85 },

  // Ashen Causeway road-side clutter.
  { mapId: 'map_cinder_wilds', texture: 'rocks-grass', frame: 3, x: 430, y: 690, scale: 1.3 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-grass', frame: 9, x: 760, y: 1230, scale: 1.3 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 232, x: 500, y: 1035, scale: 1.0 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 249, x: 545, y: 1035, scale: 1.0 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 158, x: 820, y: 915, scale: 1.0 },
  { mapId: 'map_cinder_wilds', texture: 'tree-trunks', frame: 5, x: 1030, y: 580, scale: 1.6 },

  // Emberfields: sparse, open, with a burnt roadside hamlet near the far edge.
  { mapId: 'map_cinder_wilds', texture: 'adobe-house-east', x: 2110, y: 690, scale: 0.82, alpha: 0.78, tint: 0x80635a },
  { mapId: 'map_cinder_wilds', texture: 'adobe-house-west', x: 2400, y: 730, scale: 0.86, alpha: 0.78, tint: 0x76564f },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 250, x: 2250, y: 790, scale: 1.0 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 248, x: 2290, y: 790, scale: 1.0 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-grass', frame: 15, x: 1520, y: 560, scale: 1.45 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 6, x: 2680, y: 350, scale: 1.55 },

  // Cinderwood: dense visual screening using trees, brush and rock shelves.
  { mapId: 'map_cinder_wilds', texture: 'pine-tree-cluster', x: 1330, y: 1160, scale: 0.88 },
  { mapId: 'map_cinder_wilds', texture: 'pine-tree-large', x: 1510, y: 1210, scale: 1.15 },
  { mapId: 'map_cinder_wilds', texture: 'pine-tree-cluster', x: 1720, y: 1115, scale: 0.9 },
  { mapId: 'map_cinder_wilds', texture: 'pine-tree-large', x: 1900, y: 1285, scale: 1.05 },
  { mapId: 'map_cinder_wilds', texture: 'pine-tree-cluster', x: 2250, y: 1180, scale: 0.92 },
  { mapId: 'map_cinder_wilds', texture: 'pine-tree-large', x: 2520, y: 1260, scale: 1.08 },
  { mapId: 'map_cinder_wilds', texture: 'tree-trunks', frame: 6, x: 1430, y: 1650, scale: 1.9 },
  { mapId: 'map_cinder_wilds', texture: 'tree-trunks', frame: 3, x: 1810, y: 1510, scale: 1.85 },
  { mapId: 'map_cinder_wilds', texture: 'tree-trunks', frame: 9, x: 2380, y: 1680, scale: 1.9 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 18, x: 1980, y: 1350, scale: 1.75 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 19, x: 2100, y: 1350, scale: 1.75 },
  { mapId: 'map_cinder_wilds', texture: 'mushrooms', frame: 3, x: 1650, y: 1600, scale: 0.9 },
  { mapId: 'map_cinder_wilds', texture: 'bush-evergreen', frame: 5, x: 2300, y: 1480, scale: 1.25 },

  // First-Light Scar: deliberate, sparse ancient geometry instead of clutter.
  { mapId: 'map_cinder_wilds', texture: 'dungeon-elements', frame: 64, x: 3220, y: 520, scale: 1.65 },
  { mapId: 'map_cinder_wilds', texture: 'dungeon-elements', frame: 65, x: 3270, y: 520, scale: 1.65 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 99, x: 3250, y: 475, scale: 1.1 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 100, x: 3250, y: 590, scale: 1.0 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 237, x: 3740, y: 880, scale: 1.15 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-grass', frame: 6, x: 2920, y: 1530, scale: 1.3 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-grass', frame: 12, x: 3970, y: 430, scale: 1.3 },

  // Fallen Watch and Ashgrave get authored-feeling debris clusters.
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 250, x: 4700, y: 530, scale: 1.05 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 248, x: 4760, y: 560, scale: 1.05 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 251, x: 5200, y: 560, scale: 1.05 },
  { mapId: 'map_cinder_wilds', texture: 'dungeon-elements', frame: 64, x: 4450, y: 860, scale: 1.5 },
  { mapId: 'map_cinder_wilds', texture: 'dungeon-elements', frame: 65, x: 4500, y: 860, scale: 1.5 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 10, x: 5390, y: 810, scale: 1.6 },
  { mapId: 'map_cinder_wilds', texture: 'tree-trunks', frame: 8, x: 4480, y: 1240, scale: 1.8 },
  { mapId: 'map_cinder_wilds', texture: 'tree-trunks', frame: 2, x: 5360, y: 1710, scale: 1.75 },
  { mapId: 'map_cinder_wilds', texture: 'mushrooms', frame: 23, x: 4660, y: 1500, scale: 0.9 },
  { mapId: 'map_cinder_wilds', texture: 'bush-seasonal', frame: 15, x: 5180, y: 1650, scale: 0.95 },

  // Bone Road: heavier rock/castle language foreshadows later warfront maps.
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 5, x: 5700, y: 340, scale: 1.55 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 15, x: 6170, y: 560, scale: 1.55 },
  { mapId: 'map_cinder_wilds', texture: 'rocks-cliffs', frame: 20, x: 5780, y: 1680, scale: 1.6 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 64, x: 6100, y: 1180, scale: 1.2 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 65, x: 6150, y: 1180, scale: 1.2 },
  { mapId: 'map_cinder_wilds', texture: 'castle2-set', frame: 128, x: 5860, y: 920, scale: 1.0 }
]);

export const DEFAULT_MAP_ID = 'map_cinder_refuge';

export const MAP_DEFS = Object.freeze({
  map_cinder_refuge: Object.freeze({
    id: 'map_cinder_refuge',
    name: 'Cinder Refuge',
    width: 2048,
    height: 1536,
    renderer: 'cinder_refuge',
    entryPoints: Object.freeze({
      cinder_start: Object.freeze({ x: 1010, y: 790 }),
      from_wilds: Object.freeze({ x: 1780, y: 768 })
    }),
    zoneIds: Object.freeze(['zone_cinder_refuge']),
    areaIds: Object.freeze(['area_cinder_refuge']),
    worldAssetKeys: Object.freeze([
      'terrain-dirt', 'grass-dirt', 'rocks-cliffs', 'rocks-grass', 'tree-trunks', 'tall-grass',
      'castle2-set', 'adobe2-set', 'mushrooms', 'bush-evergreen', 'bush-seasonal', 'pine-tree-large', 'pine-tree-cluster',
      'adobe-house-tower', 'adobe-house-east', 'adobe-house-west', 'adobe-workshop',
      'prop-smith-forge', 'prop-smith-tools', 'prop-smith-racks', 'prop-wood-bench', 'prop-wood-toolboard', 'prop-tailor-loom', 'prop-tailor-display'
    ])
  }),
  map_cinder_wilds: Object.freeze({
    id: 'map_cinder_wilds',
    name: 'Cinder Wilds',
    width: 6400,
    height: 2048,
    renderer: 'cinder_wilds',
    entryPoints: Object.freeze({
      from_refuge: Object.freeze({ x: 190, y: 1024 }),
      from_hollow: Object.freeze({ x: 2440, y: 1700 }),
      first_light_test: Object.freeze({ x: 3380, y: 1040 })
    }),
    zoneIds: Object.freeze(['zone_scorched_outskirts', 'zone_bone_road']),
    areaIds: Object.freeze(['area_ashen_causeway', 'area_emberfields', 'area_cinderwood', 'area_first_light_scar', 'area_fallen_watch', 'area_ashgrave_hollow', 'area_bone_road']),
    worldAssetKeys: Object.freeze([
      'terrain-dirt', 'grass-dirt', 'rocks-cliffs', 'rocks-grass', 'tree-trunks', 'tall-grass', 'bridge',
      'dungeon-elements', 'castle2-set', 'adobe2-set', 'cave3-set', 'mushrooms', 'bush-evergreen', 'bush-seasonal',
      'pine-tree-large', 'pine-tree-cluster', 'adobe-house-tower', 'adobe-house-east', 'adobe-house-west', 'adobe-workshop'
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

export const MAP_TRANSITIONS = Object.freeze([
  Object.freeze({
    id: 'transition_refuge_wilds', mapId: 'map_cinder_refuge', x: 1910, y: 768, radius: 100,
    label: 'East Gate • Cinder Wilds', destinationMapId: 'map_cinder_wilds', destinationEntryId: 'from_refuge'
  }),
  Object.freeze({
    id: 'transition_wilds_refuge', mapId: 'map_cinder_wilds', x: 105, y: 1024, radius: 95,
    label: 'Cinder Refuge', destinationMapId: 'map_cinder_refuge', destinationEntryId: 'from_wilds'
  }),
  Object.freeze({
    id: 'transition_outskirts_hollow', mapId: 'map_cinder_wilds', x: 2440, y: 1835, radius: 86,
    label: 'Ashfall Hollow', destinationMapId: 'map_ashfall_hollow', destinationEntryId: 'from_cinder'
  }),
  Object.freeze({
    id: 'transition_hollow_outskirts', mapId: 'map_ashfall_hollow', x: 512, y: 715, radius: 78,
    label: 'Return to Cinderwood', destinationMapId: 'map_cinder_wilds', destinationEntryId: 'from_hollow'
  })
]);

export const HOLLOW_WALLS = Object.freeze([
  { id: 'hollow-north', mapId: 'map_ashfall_hollow', x1: 36, y1: 36, x2: 988, y2: 36, thickness: 22 },
  { id: 'hollow-west', mapId: 'map_ashfall_hollow', x1: 36, y1: 36, x2: 36, y2: 732, thickness: 22 },
  { id: 'hollow-east', mapId: 'map_ashfall_hollow', x1: 988, y1: 36, x2: 988, y2: 732, thickness: 22 },
  { id: 'hollow-south-west', mapId: 'map_ashfall_hollow', x1: 36, y1: 732, x2: 438, y2: 732, thickness: 22 },
  { id: 'hollow-south-east', mapId: 'map_ashfall_hollow', x1: 586, y1: 732, x2: 988, y2: 732, thickness: 22 }
]);

export const HOLLOW_COLLIDERS = Object.freeze(HOLLOW_WALLS.map(wallCollider));

export function mapIdForZone(zoneId) {
  if (zoneId === 'zone_cinder_refuge') return 'map_cinder_refuge';
  if (zoneId === 'zone_ashfall_hollow') return 'map_ashfall_hollow';
  return 'map_cinder_wilds';
}

export function mapForId(mapId) {
  return MAP_DEFS[mapId] || MAP_DEFS[DEFAULT_MAP_ID];
}
