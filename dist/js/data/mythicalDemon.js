import { MYTHIC_LEVEL_HIERARCHY } from './powerTiers.js';

// v0.1.4.4.5 first infernal mythic field test. "Mythical Demon" is an
// intentionally provisional field-test identity; the source/kit are stable,
// while a later story pass may replace the display name without changing IDs.
const hierarchy = MYTHIC_LEVEL_HIERARCHY.mythicalDemon;

export const MYTHICAL_DEMON_DEF = Object.freeze({
  id: 'npc_mythical_demon_bloodwing',
  name: 'Mythical Demon',
  title: 'Bloodwing Scourge',
  displayName: 'Mythical Demon',
  faction: 'monster',
  tier: 'mythic',
  threatTier: hierarchy.threatTier,
  unique: true,
  internalLevel: hierarchy.internalLevel,
  levelDisplay: '???',

  // Level 94: decisively above ordinary troops/commanders but intentionally
  // below the reserved Lv98 Ancient Demon Lord and Lv99 apex celestials.
  maxHp: 14200,
  attack: 388,
  defense: 198,
  resistances: Object.freeze({ fire: 0.68, poison: 0.82, shadow: 0.62, celestial: 0.14 }),
  statusResistances: Object.freeze({ poison: 0.92, burn: 0.90, slow: 0.82 }),
  staggerResistance: 0.90,

  scale: 1.40,
  speed: 184,
  glideSpeed: 214,
  rushSpeed: 410,
  senseRange: 980,
  simulationRange: 1200,
  leashRange: 1120,
  preferredRange: 146,
  home: Object.freeze({ mapId: 'map_veil_warfront', x: 2500, y: 1510 }),
  respawnMs: 15000,

  assets: Object.freeze({
    spellcast: 'mythical-demon-spellcast',
    thrust: 'mythical-demon-thrust',
    walk: 'mythical-demon-walk',
    slash: 'mythical-demon-slash',
    shoot: 'mythical-demon-shoot',
    hurt: 'mythical-demon-hurt',
    idle: 'mythical-demon-idle'
  }),

  abilities: Object.freeze({
    abyssalAscendance: Object.freeze({
      id: 'mythical_demon_abyssal_ascendance', name: 'Abyssal Ascendance',
      cooldownMs: 70000, windupMs: 900, triggerAt: 0.68, recoverMs: 330,
      durationMs: 52000, pulseEveryMs: 6000, auraRadius: 150,
      damageTakenMultiplier: 0.82, damageDealtMultiplier: 1.10, selfHealPct: 0.008
    }),
    rendingTalon: Object.freeze({
      id: 'mythical_demon_rending_talon', name: 'Rending Talon',
      range: 132, arcDegrees: 132, damageMultiplier: 0.94, knockback: 150,
      cooldownMs: 1180, windupMs: 390, triggerAt: 0.56, recoverMs: 190
    }),
    bloodwingRush: Object.freeze({
      id: 'mythical_demon_bloodwing_rush', name: 'Bloodwing Rush',
      range: 340, lineRadius: 48, damageMultiplier: 0.90, knockback: 235,
      cooldownMs: 3100, windupMs: 260, dashMs: 460, recoverMs: 270
    }),
    hellspineVolley: Object.freeze({
      id: 'mythical_demon_hellspine_volley', name: 'Hellspine Volley',
      range: 430, minRange: 105, damageMultiplier: 0.32,
      projectileDelays: Object.freeze([0, 80, 160, 240, 320]),
      projectileFanOffsets: Object.freeze([0, -26, 26, -48, 48]),
      cooldownMs: 4100, windupMs: 680, triggerAt: 0.62, recoverMs: 320
    }),
    mawVoid: Object.freeze({
      id: 'mythical_demon_maw_void', name: 'Maw of the Void',
      range: 385, radius: 174, targetClusterRadius: 170,
      pulseDelays: Object.freeze([0, 170, 390]), pulseScales: Object.freeze([0.24, 0.30, 0.52]),
      damageMultiplier: 1.02, knockback: 100, slowDurationMs: 3000,
      cooldownMs: 6500, windupMs: 900, triggerAt: 0.72, recoverMs: 420,
      minCluster: 2, worthyTargetTier: 'mythic', major: true, majorLockMs: 3000
    }),
    crimsonEclipse: Object.freeze({
      id: 'mythical_demon_crimson_eclipse', name: 'Crimson Eclipse',
      range: 420, radius: 206, targetClusterRadius: 188,
      damageMultiplier: 1.30, knockback: 210, slowDurationMs: 3600,
      cooldownMs: 9300, windupMs: 1080, triggerAt: 0.76, recoverMs: 510,
      minCluster: 2, worthyTargetTier: 'mythic', major: true, majorLockMs: 4100
    }),
    cataclysmFirstPit: Object.freeze({
      id: 'mythical_demon_cataclysm_first_pit', name: 'Cataclysm of the First Pit',
      range: 450, radius: 238, targetClusterRadius: 205,
      ruptureDelayMs: 340, executionDelayMs: 690,
      ruptureDamageMultiplier: 0.30, damageMultiplier: 1.48, knockback: 330,
      slowDurationMs: 4200, staggerDurationMs: 520,
      cooldownMs: 15800, windupMs: 1320, triggerAt: 0.80, recoverMs: 680,
      minCluster: 3, worthyTargetTier: 'mythic', major: true, majorLockMs: 5500
    })
  })
});

// Debug-only repeated observation against ordinary celestial troops. Production
// actors are suspended, wave deaths grant no rewards, and the test does not
// mutate the 32-actor Living Warfront population definition.
export const MYTHICAL_DEMON_SOLO_TEST_DEF = Object.freeze({
  mapId: 'map_veil_warfront',
  entryId: 'mythical_demon_solo',
  player: Object.freeze({ x: 740, y: 2740 }),
  demon: Object.freeze({ x: 960, y: 2740 }),
  spawnCenter: Object.freeze({ x: 1280, y: 2740 }),
  nextWaveDelayMs: 2200,
  spawnOffsets: Object.freeze([
    Object.freeze({ x: 0, y: -155 }), Object.freeze({ x: 95, y: -65 }),
    Object.freeze({ x: 110, y: 72 }), Object.freeze({ x: 5, y: 158 }),
    Object.freeze({ x: -85, y: 48 })
  ]),
  waves: Object.freeze([
    Object.freeze(['enemy_celestial_footsoldier', 'enemy_celestial_footsoldier', 'enemy_heavenly_guardian']),
    Object.freeze(['enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier']),
    Object.freeze(['enemy_heavenly_guardian', 'enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier']),
    Object.freeze(['enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_heavenly_guardian', 'enemy_celestial_footsoldier', 'enemy_celestial_footsoldier'])
  ])
});
