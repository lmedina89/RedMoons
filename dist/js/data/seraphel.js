import { CANONICAL_POWER_STAT_SHEETS } from './mythicStatSheets.js';
import { MYTHIC_LEVEL_HIERARCHY } from './powerTiers.js';

const seraphelHierarchy = MYTHIC_LEVEL_HIERARCHY.seraphel;
const seraphelSheet = CANONICAL_POWER_STAT_SHEETS.seraphel;
export const SERAPHEL_PRIMARY_STATS = seraphelSheet.stats;
export const SERAPHEL_STAT_BUDGET = seraphelSheet.statBudget;

const BASIC_COMBO = Object.freeze([
  Object.freeze({ id: 'seraphel_combo_1', name: 'Fractured Edge', action: 'slash', durationMs: 310, triggerAt: 0.48, damageMultiplier: 1.00, range: 108, arcDegrees: 102, knockback: 105, element: 'dark' }),
  Object.freeze({ id: 'seraphel_combo_2', name: "Exile's Fang", action: 'thrust', durationMs: 340, triggerAt: 0.50, damageMultiplier: 1.08, range: 128, arcDegrees: 76, knockback: 115, element: 'lightning' }),
  Object.freeze({ id: 'seraphel_combo_3', name: 'Halo Reversal', action: 'backslash', durationMs: 390, triggerAt: 0.52, damageMultiplier: 1.16, range: 148, arcDegrees: 128, knockback: 145, element: 'light' }),
  Object.freeze({ id: 'seraphel_combo_4', name: 'Riven Crescent', action: 'halfslash', durationMs: 430, triggerAt: 0.52, damageMultiplier: 1.27, range: 170, arcDegrees: 154, knockback: 175, element: 'wind' }),
  Object.freeze({ id: 'seraphel_combo_5', name: 'Fallen Judgment', action: 'shoot', durationMs: 500, triggerAt: 0.58, damageMultiplier: 1.38, range: 222, arcDegrees: 86, knockback: 190, element: 'prismatic' }),
  Object.freeze({ id: 'seraphel_combo_6', name: 'Shattered Halo', action: 'spellcast', durationMs: 620, triggerAt: 0.64, damageMultiplier: 1.55, range: 258, arcDegrees: 360, knockback: 245, element: 'prismatic' })
]);

export const SERAPHEL_DEF = Object.freeze({
  id: 'mythic_seraphel_shattered_halo',
  name: 'Seraphel',
  title: 'The Shattered Halo',
  displayName: 'Seraphel, the Shattered Halo',
  faction: 'fallen',
  tier: 'mythic',
  threatTier: seraphelHierarchy.threatTier,
  unique: true,
  internalLevel: seraphelHierarchy.internalLevel,
  primaryStats: SERAPHEL_PRIMARY_STATS,
  statBudget: SERAPHEL_STAT_BUDGET,
  combatStatsMode: seraphelSheet.combatStatsMode,
  resourceModel: seraphelSheet.resourceModel,
  levelDisplay: '???',

  // Freeplay/boss tuning is intentionally hand-authored. The legal Lv220
  // primary sheet exists for character identity; these numbers can be tuned
  // physically without rewriting the whole combat formula or other mythics.
  maxHp: 28500,
  attack: 570,
  defense: 320,
  resistances: Object.freeze({ fire: 0.42, poison: 0.78, shadow: 0.34, celestial: 0.34 }),
  statusResistances: Object.freeze({ poison: 0.96, burn: 0.92, slow: 0.94 }),
  staggerResistance: 0.97,

  scale: 1.42,
  speed: 220,
  glideSpeed: 262,
  runMultiplier: 1.16,
  senseRange: 980,
  simulationRange: 1200,
  leashRange: 1180,
  preferredRange: 150,
  home: Object.freeze({ mapId: 'map_veil_warfront', x: 3072, y: 360 }),
  freeplayRespawnMs: 2600,

  assets: Object.freeze({
    spellcast: 'seraphel-spellcast',
    thrust: 'seraphel-thrust',
    walk: 'seraphel-walk',
    slash: 'seraphel-slash',
    shoot: 'seraphel-shoot',
    hurt: 'seraphel-hurt',
    climb: 'seraphel-climb',
    idle: 'seraphel-idle',
    jump: 'seraphel-jump',
    sit: 'seraphel-sit',
    emote: 'seraphel-emote',
    run: 'seraphel-run',
    combatIdle: 'seraphel-combat-idle',
    backslash: 'seraphel-backslash',
    halfslash: 'seraphel-halfslash'
  }),

  basicCombo: BASIC_COMBO,
  comboContinueMs: 760,

  abilities: Object.freeze({
    pyreFallenSun: Object.freeze({
      id: 'seraphel_pyre_fallen_sun', name: 'Pyre of the Fallen Sun', element: 'fire',
      range: 500, radius: 214, damageMultiplier: 1.34, knockback: 245,
      cooldownMs: 6100, windupMs: 900, triggerAt: 0.70, recoverMs: 420,
      status: Object.freeze({ id: 'burn', chance: 1 }), major: true, majorLockMs: 3000
    }),
    crownFrozenAbyss: Object.freeze({
      id: 'seraphel_crown_frozen_abyss', name: 'Crown of the Frozen Abyss', element: 'ice_water',
      range: 510, radius: 224, damageMultiplier: 1.16, knockback: 150,
      cooldownMs: 6500, windupMs: 940, triggerAt: 0.72, recoverMs: 430,
      status: Object.freeze({ id: 'slow', chance: 1 }), major: true, majorLockMs: 3100
    }),
    tempestExile: Object.freeze({
      id: 'seraphel_tempest_exile', name: 'Tempest of Exile', element: 'lightning_wind',
      range: 540, bounceRange: 470, bounces: 6, impactRadius: 72,
      damageMultiplier: 0.43, finalDamageMultiplier: 0.78, knockback: 135,
      cooldownMs: 5200, windupMs: 360, dashMs: 92, bounceDelayMs: 118, recoverMs: 340
    }),
    worldbreakerTestament: Object.freeze({
      id: 'seraphel_worldbreaker_testament', name: 'Worldbreaker Testament', element: 'earth',
      range: 470, radius: 236, damageMultiplier: 1.46, knockback: 315,
      pulseDelays: Object.freeze([0, 150, 330]), pulseScales: Object.freeze([0.24, 0.34, 0.52]),
      cooldownMs: 7900, windupMs: 1020, triggerAt: 0.73, recoverMs: 520,
      major: true, majorLockMs: 3900
    }),
    eclipseGrace: Object.freeze({
      id: 'seraphel_eclipse_grace', name: 'Eclipse of Grace', element: 'light_dark',
      range: 490, radius: 246, damageMultiplier: 1.62, knockback: 285,
      cooldownMs: 9400, windupMs: 1120, triggerAt: 0.76, recoverMs: 580,
      major: true, majorLockMs: 4700
    }),
    prismaticDominion: Object.freeze({
      id: 'seraphel_prismatic_dominion', name: 'Prismatic Dominion', element: 'all',
      range: 500, radius: 272, strikes: 7, strikeDelayMs: 125,
      damageMultiplier: 0.31, finalDamageMultiplier: 0.58, knockback: 155,
      cooldownMs: 10800, windupMs: 980, triggerAt: 0.70, recoverMs: 520,
      major: true, majorLockMs: 5200
    }),
    sevenfoldCataclysm: Object.freeze({
      id: 'seraphel_sevenfold_cataclysm', name: 'Sevenfold Cataclysm', element: 'all',
      range: 530, radius: 310, stages: 7, stageDelayMs: 250,
      damageMultiplier: 0.24, finalDamageMultiplier: 0.82, knockback: 390,
      cooldownMs: 20500, windupMs: 1420, triggerAt: 0.80, recoverMs: 860,
      major: true, ultimate: true, majorLockMs: 8500
    })
  })
});
