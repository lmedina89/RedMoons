// v0.1.4.4.3 Lailani Field Test. This named celestial remains independent
// from the ordinary Warfront population budget and from Azrael's controller.
// Her identity is speed, graceful repositioning, layered holy geometry, and a
// long-lived defensive mantle rather than Azrael's heavier judgment cadence.
export const LAILANI_DEF = Object.freeze({
  id: 'npc_lailani_transcendent',
  name: 'Lailani',
  title: 'Transcendent Seraph',
  displayName: 'Lailani',
  faction: 'celestial',
  tier: 'mythic',
  unique: true,
  internalLevel: 96,
  levelDisplay: '???',

  maxHp: 14800,
  attack: 365,
  defense: 205,
  resistances: Object.freeze({ fire: 0.55, poison: 0.72, shadow: 0.52, celestial: 0.28 }),
  statusResistances: Object.freeze({ poison: 0.90, burn: 0.82, slow: 0.95 }),
  staggerResistance: 0.94,

  scale: 1.34,
  speed: 205,
  glideSpeed: 238,
  passageSpeed: 520,
  senseRange: 900,
  simulationRange: 1200,
  leashRange: 1120,
  preferredRange: 158,
  // Field-test position only. Her eventual permanent home belongs in the
  // Celestial Stronghold during the later named-celestial deployment pass.
  home: Object.freeze({ mapId: 'map_veil_warfront', x: 3660, y: 1510 }),
  respawnMs: 15000,

  assets: Object.freeze({
    spellcast: 'lailani-spellcast',
    thrust: 'lailani-thrust',
    walk: 'lailani-walk',
    slash: 'lailani-slash',
    shoot: 'lailani-shoot',
    hurt: 'lailani-hurt',
    idle: 'lailani-idle'
  }),

  abilities: Object.freeze({
    mantleEmpyrean: Object.freeze({
      id: 'lailani_mantle_empyrean', name: 'Mantle of the Empyrean',
      cooldownMs: 82000, windupMs: 920, triggerAt: 0.70, recoverMs: 320,
      durationMs: 60000, pulseEveryMs: 5000, auraRadius: 96,
      damageTakenMultiplier: 0.74, selfHealPct: 0.012
    }),
    seraphicPassage: Object.freeze({
      id: 'lailani_seraphic_passage', name: 'Seraphic Passage',
      range: 340, lineRadius: 54, damageMultiplier: 0.74, knockback: 135,
      cooldownMs: 2600, windupMs: 230, dashMs: 440, recoverMs: 180
    }),
    lancesSeventhSky: Object.freeze({
      id: 'lailani_lances_seventh_sky', name: 'Lances of the Seventh Sky',
      range: 440, targetClusterRadius: 175, strikes: 5, strikeDelayMs: 92,
      damageMultiplier: 0.36, knockback: 70,
      cooldownMs: 3200, windupMs: 680, triggerAt: 0.62, recoverMs: 270
    }),
    celestialWaltz: Object.freeze({
      id: 'lailani_celestial_waltz', name: 'Celestial Waltz',
      range: 185, stepRadius: 70, impactRadius: 68, steps: 4, stepDelayMs: 145,
      damageMultiplier: 0.30, finalDamageMultiplier: 0.50, knockback: 90,
      cooldownMs: 3900, windupMs: 280, recoverMs: 230
    }),
    haloStillWaters: Object.freeze({
      id: 'lailani_halo_still_waters', name: 'Halo of Still Waters',
      range: 340, radius: 150, damageMultiplier: 0.78, knockback: 100,
      slowDurationMs: 3200,
      cooldownMs: 5200, windupMs: 720, triggerAt: 0.68, recoverMs: 330
    }),
    gardenHeaven: Object.freeze({
      id: 'lailani_garden_heaven', name: 'Garden of Heaven',
      range: 390, radius: 184, targetClusterRadius: 165,
      pulseDelays: Object.freeze([0, 150, 340]), pulseScales: Object.freeze([0.24, 0.30, 0.58]),
      damageMultiplier: 1.0, knockback: 170,
      cooldownMs: 7600, windupMs: 980, triggerAt: 0.72, recoverMs: 430,
      minCluster: 2, major: true, majorLockMs: 2800
    }),
    transcendentDawn: Object.freeze({
      id: 'lailani_transcendent_dawn', name: 'Transcendent Dawn',
      range: 430, radius: 220, targetClusterRadius: 190,
      damageMultiplier: 1.38, knockback: 245,
      cooldownMs: 14800, windupMs: 1260, triggerAt: 0.80, recoverMs: 620,
      minCluster: 3, major: true, majorLockMs: 5000
    })
  })
});
