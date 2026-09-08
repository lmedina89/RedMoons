import { INFERNAL_LEVEL_HIERARCHY } from './powerTiers.js';

const hierarchy = INFERNAL_LEVEL_HIERARCHY.zerakoth;

export const ZERAKOTH_DEF = Object.freeze({
  id: 'npc_zerakoth_warden_pit',
  name: 'Zerakoth',
  title: 'Warden of the Pit',
  family: 'demon',
  variant: 'warden',
  subfaction: 'demon_legion',
  role: 'commander_duelist',
  faction: 'monster',
  named: true,
  commander: true,
  unique: true,
  internalLevel: hierarchy.internalLevel,
  level: hierarchy.internalLevel,
  levelDisplay: '???',
  threatTier: hierarchy.threatTier,

  // Commander band: a decisive step above Lv30 elites, but intentionally well
  // below Bloodwing's Lv94 mythic durability/damage budget.
  maxHp: 6100,
  attack: 188,
  defense: 102,
  speed: 118,
  detectRange: 620,
  attackRange: 72,
  leashRange: 820,
  attackCooldown: 760,
  recoverMs: 275,
  resistances: Object.freeze({ fire: 0.54, poison: 0.55, shadow: 0.48, celestial: 0.10 }),
  statusResistances: Object.freeze({ burn: 0.76, poison: 0.70, slow: 0.52 }),
  staggerResistance: 0.68,

  layered: true,
  baseVisual: 'zerakoth_base',
  walkFrames: 9,
  attackFrames: 6,
  scale: 1.20,
  fixedLoadout: Object.freeze({
    chest: 'armor_zerakoth_warplate_npc',
    weapon: 'weapon_wardens_hellblade_npc'
  }),
  abilities: Object.freeze([
    'zerakoth_ward_pit',
    'zerakoth_pitfall_eruption',
    'zerakoth_ashen_decree',
    'zerakoth_hellbrand_volley',
    'zerakoth_pitbound_rush',
    'zerakoth_wardens_rend'
  ]),
  xp: 0,
  currency: Object.freeze([0, 0]),
  loot: Object.freeze([]),

  home: Object.freeze({ mapId: 'map_veil_warfront', x: 1640, y: 1510 }),
  respawnMs: 18000,
  activationRange: 1200,
  pursuitMargin: 180,
  majorAbilityLockMs: 4200
});

export const ZERAKOTH_SPAWN_DEF = Object.freeze({
  id: 'debug_zerakoth_warden_pit',
  encounterId: 'debug_zerakoth_field_test',
  archetype: 'guard',
  mapId: 'map_veil_warfront',
  areaId: 'area_warfront_infernal_front',
  x: 1588,
  y: 1458,
  width: 104,
  height: 104,
  respawnMs: ZERAKOTH_DEF.respawnMs,
  activationRange: ZERAKOTH_DEF.activationRange,
  pursuitMargin: ZERAKOTH_DEF.pursuitMargin,
  debugOnly: true
});

export const ZERAKOTH_SOLO_TEST_DEF = Object.freeze({
  mapId: 'map_veil_warfront',
  entryId: 'zerakoth_solo',
  player: Object.freeze({ x: 1050, y: 2860 }),
  zerakoth: Object.freeze({ x: 1280, y: 2860 }),
  spawnCenter: Object.freeze({ x: 1640, y: 2860 }),
  nextWaveDelayMs: 2200,
  spawnOffsets: Object.freeze([
    Object.freeze({ x: 0, y: -150 }), Object.freeze({ x: 100, y: -65 }),
    Object.freeze({ x: 105, y: 70 }), Object.freeze({ x: 0, y: 150 }),
    Object.freeze({ x: -90, y: 50 })
  ]),
  waves: Object.freeze([
    Object.freeze(['enemy_celestial_footsoldier', 'enemy_celestial_footsoldier', 'enemy_heavenly_guardian']),
    Object.freeze(['enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier']),
    Object.freeze(['enemy_heavenly_guardian', 'enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier']),
    Object.freeze(['enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier'])
  ])
});
