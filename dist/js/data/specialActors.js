import { CANONICAL_POWER_STAT_SHEETS } from './mythicStatSheets.js';
import { MYTHIC_LEVEL_HIERARCHY } from './powerTiers.js';

const azraelHierarchy = MYTHIC_LEVEL_HIERARCHY.azrael;
const azraelSheet = CANONICAL_POWER_STAT_SHEETS.azrael;

export const AZRAEL_DEF = Object.freeze({
  id: 'npc_archangel_azrael',
  name: 'Azrael',
  title: 'ArchAngel',
  displayName: 'ArchAngel Azrael',
  faction: 'celestial',
  tier: 'mythic',
  threatTier: azraelHierarchy.threatTier,
  unique: true,
  internalLevel: azraelHierarchy.internalLevel,
  primaryStats: azraelSheet.stats,
  statBudget: azraelSheet.statBudget,
  combatStatsMode: azraelSheet.combatStatsMode,
  resourceModel: azraelSheet.resourceModel,
  levelDisplay: '???',

  // These are intentionally real combat stats, not an invulnerability flag.
  // Current low-level mobs can still chip him for minimum damage while future
  // mythic enemies can meaningfully threaten him through the normal resolver.
  maxHp: 18000,
  attack: 420,
  defense: 240,
  resistances: Object.freeze({ fire: 0.60, poison: 0.70, shadow: 0.48, celestial: 0.22 }),
  statusResistances: Object.freeze({ poison: 0.90, burn: 0.78, slow: 0.90 }),
  staggerResistance: 0.92,

  scale: 1.38,
  speed: 158,
  glideSpeed: 176,
  wingBurstSpeed: 330,
  senseRange: 520,
  leashRange: 610,
  preferredRange: 92,
  home: Object.freeze({ mapId: 'map_cinder_wilds', x: 3500, y: 1040 }),
  respawnMs: 12000,

  assets: Object.freeze({
    spellcast: 'azrael-spellcast',
    thrust: 'azrael-thrust',
    slash: 'azrael-slash',
    shoot: 'azrael-shoot',
    hurt: 'azrael-hurt',
    idle: 'azrael-idle',
    jump: 'azrael-jump',
    emote: 'azrael-emote',
    run: 'azrael-run',
    combatIdle: 'azrael-combat-idle',
    backslash: 'azrael-backslash',
    halfslash: 'azrael-halfslash'
  }),

  abilities: Object.freeze({
    celestialStrike: Object.freeze({
      id: 'azrael_celestial_strike', name: 'Celestial Strike', range: 112, arcDegrees: 118,
      damageMultiplier: 0.82, knockback: 165, cooldownMs: 720, windupMs: 430, triggerAt: 0.52, recoverMs: 230
    }),
    wingBurst: Object.freeze({
      id: 'azrael_wing_burst', name: 'Wing Burst', range: 300, impactRadius: 92,
      damageMultiplier: 0.72, knockback: 250, cooldownMs: 2500, windupMs: 240, dashMs: 430, recoverMs: 300
    }),
    judgmentBlast: Object.freeze({
      id: 'azrael_judgment_blast', name: 'Judgment Blast', range: 390, minRange: 118,
      damageMultiplier: 0.96, cooldownMs: 2350, windupMs: 730, triggerAt: 0.58, recoverMs: 360,
      projectileId: 'celestial_judgment',
      projectileDelays: Object.freeze([0, 90, 180]),
      projectileScales: Object.freeze([0.60, 0.45, 0.45]),
      projectileFanOffsets: Object.freeze([0, -26, 26]),
      targetLeadSeconds: 0.42
    }),
    sanctifiedNova: Object.freeze({
      id: 'azrael_sanctified_nova', name: 'Sanctified Nova', radius: 146,
      damageMultiplier: 1.04, knockback: 315, cooldownMs: 4600, windupMs: 860, triggerAt: 0.72, recoverMs: 430,
      minNearby: 2, worthyTargetTier: 'mythic', major: true, majorLockMs: 3400
    }),
    seraphicJudgment: Object.freeze({
      id: 'azrael_seraphic_judgment', name: 'Seraphic Judgment', radius: 158, targetClusterRadius: 152, range: 390,
      damageMultiplier: 1.08, knockback: 300, cooldownMs: 6200, windupMs: 1040, triggerAt: 0.72, recoverMs: 540,
      minCluster: 2, worthyTargetTier: 'mythic', major: true, majorLockMs: 4000, pulseDelays: Object.freeze([0, 120, 250]),
      pulseScales: Object.freeze([0.24, 0.30, 0.46])
    }),
    sanctuaryFirstLight: Object.freeze({
      id: 'azrael_sanctuary_first_light', name: 'Sanctuary of the First Light', radius: 218,
      cooldownMs: 8800, windupMs: 1180, triggerAt: 0.74, recoverMs: 620,
      fieldDurationMs: 5600, pulseDelays: Object.freeze([0, 1650, 3300, 4950]),
      selfHealPct: 0.025, celestialHealPct: 0.06, playerHealPct: 0.10,
      castMissingThreshold: 0.18, major: true, majorLockMs: 4700
    }),
    heavenfall: Object.freeze({
      id: 'azrael_heavenfall', name: 'Heavenfall', radius: 176, targetClusterRadius: 150,
      damageMultiplier: 1.34, knockback: 390, cooldownMs: 11600, windupMs: 1220, triggerAt: 0.78, recoverMs: 700,
      minCluster: 4, worthyTargetTier: 'mythic', major: true, majorLockMs: 5000
    })
  })
});
