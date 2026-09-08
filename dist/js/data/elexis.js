// v0.1.4.4.4.1 El’exis Healing Polish. El’exis is an Azrael-tier named celestial
// built around Dominion, protection, restoration, and deliberate formation
// control. She is independent from Azrael and Lailani controllers and from the
// 32-actor production Warfront population budget.
export const ELEXIS_DEF = Object.freeze({
  id: 'npc_elexis_mother_host',
  name: 'El’exis',
  title: 'Mother of the Host',
  displayName: 'El’exis',
  faction: 'celestial',
  tier: 'mythic',
  unique: true,
  internalLevel: 99,
  levelDisplay: '???',

  // Comparable overall battlefield value to Azrael, expressed through control
  // and protection rather than simply exceeding his raw attack/HP numbers.
  maxHp: 17200,
  attack: 405,
  defense: 232,
  resistances: Object.freeze({ fire: 0.58, poison: 0.76, shadow: 0.54, celestial: 0.24 }),
  statusResistances: Object.freeze({ poison: 0.94, burn: 0.86, slow: 0.92 }),
  staggerResistance: 0.95,

  scale: 1.36,
  speed: 172,
  glideSpeed: 194,
  senseRange: 920,
  simulationRange: 1200,
  leashRange: 1080,
  preferredRange: 176,
  // Temporary frontline field-test station. Permanent named-celestial homes
  // belong to the later deployment pass when Azrael also moves to the Warfront.
  home: Object.freeze({ mapId: 'map_veil_warfront', x: 4860, y: 1160 }),
  respawnMs: 15000,

  assets: Object.freeze({
    spellcast: 'elexis-spellcast',
    thrust: 'elexis-thrust',
    walk: 'elexis-walk',
    slash: 'elexis-slash',
    shoot: 'elexis-shoot',
    hurt: 'elexis-hurt',
    idle: 'elexis-idle'
  }),

  abilities: Object.freeze({
    crownDominion: Object.freeze({
      id: 'elexis_crown_dominion', name: 'Crown of Dominion',
      cooldownMs: 80000, windupMs: 980, triggerAt: 0.70, recoverMs: 340,
      durationMs: 60000, pulseEveryMs: 4500, auraRadius: 190,
      damageTakenMultiplier: 0.80, selfHealPct: 0.006, celestialHealPct: 0.015, playerHealPct: 0.030,
      guardDurationMs: 5000, retaliationMultiplier: 0.18
    }),
    spearFirmament: Object.freeze({
      id: 'elexis_spear_firmament', name: 'Spear of the Firmament',
      range: 440, impactRadius: 58, damageMultiplier: 1.34, knockback: 150,
      cooldownMs: 3500, windupMs: 720, triggerAt: 0.67, recoverMs: 310
    }),
    chainsSeventhThrone: Object.freeze({
      id: 'elexis_chains_seventh_throne', name: 'Chains of the Seventh Throne',
      range: 370, radius: 172, damageMultiplier: 0.46, knockback: 30,
      slowDurationMs: 3800, staggerDurationMs: 430,
      cooldownMs: 5100, windupMs: 830, triggerAt: 0.72, recoverMs: 380,
      minCluster: 2
    }),
    astralSeverance: Object.freeze({
      id: 'elexis_astral_severance', name: 'Astral Severance',
      range: 164, arcDegrees: 148, damageMultiplier: 0.88, knockback: 125,
      cooldownMs: 1750, windupMs: 420, triggerAt: 0.54, recoverMs: 210
    }),
    edictSanctuary: Object.freeze({
      id: 'elexis_edict_sanctuary', name: 'Edict of Sanctuary',
      range: 360, radius: 232,
      cooldownMs: 9600, windupMs: 1080, triggerAt: 0.73, recoverMs: 520,
      fieldDurationMs: 5600, pulseDelays: Object.freeze([0, 1750, 3500, 5250]),
      initialCelestialHealPct: 0.10, pulseCelestialHealPct: 0.032,
      initialSelfHealPct: 0.055, pulseSelfHealPct: 0.020,
      initialPlayerHealPct: 0.120, pulsePlayerHealPct: 0.050,
      guardDurationMs: 5600, enemyDamageMultiplier: 0.24, enemySlowMs: 4200,
      castMissingThreshold: 0.20, major: true, majorLockMs: 4300
    }),
    heavenfallConstellation: Object.freeze({
      id: 'elexis_heavenfall_constellation', name: 'Heavenfall Constellation',
      range: 430, targetClusterRadius: 178, impactRadius: 72,
      strikes: 6, strikeDelayMs: 135, damageMultiplier: 0.27, knockback: 85,
      cooldownMs: 7300, windupMs: 980, triggerAt: 0.74, recoverMs: 460,
      minCluster: 2, major: true, majorLockMs: 3600
    }),
    throneBeyondHeaven: Object.freeze({
      id: 'elexis_throne_beyond_heaven', name: 'Throne Beyond Heaven',
      range: 450, radius: 224, targetClusterRadius: 196,
      bindDelayMs: 240, executionDelayMs: 590,
      bindDamageMultiplier: 0.22, damageMultiplier: 1.46, knockback: 275,
      slowDurationMs: 3400, staggerDurationMs: 520,
      cooldownMs: 15400, windupMs: 1320, triggerAt: 0.80, recoverMs: 680,
      minCluster: 3, major: true, majorLockMs: 5400
    })
  })
});

// Debug-only repeated combat observation. Production soldiers are suspended in
// this scene instance, waves target El’exis only, and deaths bypass rewards.
export const ELEXIS_SOLO_TEST_DEF = Object.freeze({
  mapId: 'map_veil_warfront',
  entryId: 'elexis_solo',
  player: Object.freeze({ x: 4740, y: 2700 }),
  elexis: Object.freeze({ x: 4930, y: 2700 }),
  spawnCenter: Object.freeze({ x: 5180, y: 2700 }),
  nextWaveDelayMs: 2200,
  spawnOffsets: Object.freeze([
    Object.freeze({ x: 0, y: -155 }),
    Object.freeze({ x: 95, y: -65 }),
    Object.freeze({ x: 110, y: 72 }),
    Object.freeze({ x: 5, y: 158 }),
    Object.freeze({ x: -85, y: 48 })
  ]),
  waves: Object.freeze([
    Object.freeze(['enemy_demon_scout', 'enemy_hellfire_demon', 'enemy_ashbone_demon']),
    Object.freeze(['enemy_hellfire_demon', 'enemy_ashbone_demon', 'enemy_demon_scout', 'enemy_demon_scout']),
    Object.freeze(['enemy_ashbone_demon', 'enemy_fleshborn_demon', 'enemy_hellfire_demon', 'enemy_demon_scout']),
    Object.freeze(['enemy_fleshborn_demon', 'enemy_hellfire_demon', 'enemy_ashbone_demon', 'enemy_fleshborn_demon', 'enemy_demon_scout'])
  ])
});
