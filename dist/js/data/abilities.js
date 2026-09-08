export const ENEMY_ABILITY_DEFS = Object.freeze({
  toxic_spit: Object.freeze({
    id: 'toxic_spit', name: 'Toxic Spit', type: 'projectile', projectileId: 'toxic_spit', animation: 'attack',
    range: 265, minRange: 78, cooldownMs: 3000, windupMs: 620, triggerAt: 0.62, recoverMs: 360,
    damageMultiplier: 0.82, status: Object.freeze({ id: 'poison', chance: 1 }), telegraph: 'poison'
  }),
  blueflame_bolt: Object.freeze({
    id: 'blueflame_bolt', name: 'Blueflame Bolt', type: 'projectile', projectileId: 'blueflame_bolt', animation: 'attack',
    range: 330, minRange: 92, cooldownMs: 2700, windupMs: 520, triggerAt: 0.58, recoverMs: 300,
    damageMultiplier: 0.92, status: Object.freeze({ id: 'burn', chance: 0.55 }), telegraph: 'fire'
  }),
  bone_arrow: Object.freeze({
    id: 'bone_arrow', name: 'Bone Arrow', type: 'projectile', projectileId: 'bone_arrow', animation: 'shoot',
    range: 390, minRange: 105, cooldownMs: 2300, windupMs: 700, triggerAt: 0.66, recoverMs: 330,
    damageMultiplier: 1.0, telegraph: 'physical'
  }),
  grave_hex: Object.freeze({
    id: 'grave_hex', name: 'Grave Hex', type: 'projectile', projectileId: 'grave_hex', animation: 'spellcast',
    range: 340, minRange: 90, cooldownMs: 3400, windupMs: 760, triggerAt: 0.62, recoverMs: 420,
    damageMultiplier: 0.86, status: Object.freeze({ id: 'slow', chance: 1 }), telegraph: 'shadow'
  }),
  bone_lunge: Object.freeze({
    id: 'bone_lunge', name: 'Bone Lunge', type: 'melee_reach', animation: 'thrust',
    range: 126, minRange: 42, arcDegrees: 42, cooldownMs: 2450, windupMs: 700, triggerAt: 0.70, recoverMs: 430,
    damageMultiplier: 1.08, knockback: 86, telegraph: 'physical'
  }),
  abyss_rend: Object.freeze({
    id: 'abyss_rend', name: 'Demonic Rend', type: 'melee_reach', animation: 'attack',
    range: 94, minRange: 0, arcDegrees: 82, cooldownMs: 1850, windupMs: 440, triggerAt: 0.56, recoverMs: 300,
    damageMultiplier: 1.02, knockback: 44, damageType: 'shadow', impact: 'abyss', telegraph: 'abyss', audio: 'shadow'
  }),
  abyss_bolt: Object.freeze({
    id: 'abyss_bolt', name: 'Abyss Bolt', type: 'projectile', projectileId: 'abyss_bolt', animation: 'attack',
    range: 315, minRange: 96, cooldownMs: 3150, windupMs: 560, triggerAt: 0.60, recoverMs: 320,
    damageMultiplier: 0.84, telegraph: 'abyss', audio: 'shadow'
  }),
  void_pulse: Object.freeze({
    id: 'void_pulse', name: 'Void Pulse', type: 'radial_aoe', animation: 'attack',
    range: 84, minRange: 0, radius: 84, cooldownMs: 4300, windupMs: 690, triggerAt: 0.76, recoverMs: 420,
    damageMultiplier: 0.86, knockback: 92, damageType: 'shadow', impact: 'abyss', telegraph: 'abyss', audio: 'shadow'
  }),

  burning_rend: Object.freeze({
    id: 'burning_rend', name: 'Burning Rend', type: 'melee_reach', animation: 'attack',
    range: 96, minRange: 0, arcDegrees: 84, cooldownMs: 1780, windupMs: 430, triggerAt: 0.55, recoverMs: 290,
    damageMultiplier: 1.05, knockback: 42, damageType: 'fire', impact: 'hellfire', telegraph: 'hellfire', audio: 'fire'
  }),
  hellfire_orb: Object.freeze({
    id: 'hellfire_orb', name: 'Hellfire Orb', type: 'projectile', projectileId: 'hellfire_orb', animation: 'attack',
    range: 330, minRange: 92, cooldownMs: 2950, windupMs: 530, triggerAt: 0.58, recoverMs: 300,
    damageMultiplier: 0.90, status: Object.freeze({ id: 'burn', chance: 0.32 }), telegraph: 'hellfire', audio: 'fire'
  }),
  cinder_burst: Object.freeze({
    id: 'cinder_burst', name: 'Cinder Burst', type: 'radial_aoe', animation: 'attack',
    range: 88, minRange: 0, radius: 88, cooldownMs: 4100, windupMs: 650, triggerAt: 0.74, recoverMs: 390,
    damageMultiplier: 0.91, knockback: 82, damageType: 'fire', impact: 'hellfire',
    status: Object.freeze({ id: 'burn', chance: 0.28 }), telegraph: 'hellfire', audio: 'fire'
  }),

  bone_rend: Object.freeze({
    id: 'bone_rend', name: 'Bone Rend', type: 'melee_reach', animation: 'attack',
    range: 98, minRange: 0, arcDegrees: 88, cooldownMs: 1900, windupMs: 470, triggerAt: 0.58, recoverMs: 320,
    damageMultiplier: 1.04, knockback: 52, damageType: 'physical', impact: 'ashbone', telegraph: 'ashbone', audio: 'slam'
  }),
  soul_shard: Object.freeze({
    id: 'soul_shard', name: 'Soul Shard', type: 'projectile', projectileId: 'soul_shard', animation: 'attack',
    range: 300, minRange: 88, cooldownMs: 3250, windupMs: 590, triggerAt: 0.61, recoverMs: 330,
    damageMultiplier: 0.87, telegraph: 'ashbone', audio: 'slam'
  }),
  ashshock: Object.freeze({
    id: 'ashshock', name: 'Ashshock', type: 'radial_aoe', animation: 'attack',
    range: 92, minRange: 0, radius: 92, cooldownMs: 4450, windupMs: 730, triggerAt: 0.78, recoverMs: 440,
    damageMultiplier: 0.88, knockback: 118, damageType: 'physical', impact: 'ashbone',
    status: Object.freeze({ id: 'stagger', chance: 0.30 }), telegraph: 'ashbone', audio: 'slam'
  }),

  flesh_rend: Object.freeze({
    id: 'flesh_rend', name: 'Flesh Rend', type: 'melee_reach', animation: 'attack',
    range: 104, minRange: 0, arcDegrees: 96, cooldownMs: 1650, windupMs: 460, triggerAt: 0.56, recoverMs: 320,
    damageMultiplier: 1.16, knockback: 72, damageType: 'physical', impact: 'blood', telegraph: 'blood', audio: 'hit'
  }),
  blood_lance: Object.freeze({
    id: 'blood_lance', name: 'Blood Lance', type: 'projectile', projectileId: 'blood_lance', animation: 'attack',
    range: 340, minRange: 100, cooldownMs: 3000, windupMs: 570, triggerAt: 0.60, recoverMs: 330,
    damageMultiplier: 0.96, telegraph: 'blood', audio: 'shadow'
  }),
  flesh_rupture: Object.freeze({
    id: 'flesh_rupture', name: 'Flesh Rupture', type: 'radial_aoe', animation: 'attack',
    range: 108, minRange: 0, radius: 108, cooldownMs: 4200, windupMs: 720, triggerAt: 0.79, recoverMs: 460,
    damageMultiplier: 1.04, knockback: 132, damageType: 'shadow', impact: 'blood', telegraph: 'blood', audio: 'slam'
  }),
  predators_rush: Object.freeze({
    id: 'predators_rush', name: "Predator's Rush", type: 'dash_strike', animation: 'attack',
    range: 188, minRange: 82, arcDegrees: 64, dashDistance: 122, cooldownMs: 4550, windupMs: 560, triggerAt: 0.70, recoverMs: 390,
    damageMultiplier: 1.10, knockback: 98, damageType: 'physical', impact: 'blood', telegraph: 'blood', audio: 'hit'
  }),

  radiant_strike: Object.freeze({
    id: 'radiant_strike', name: 'Radiant Strike', type: 'melee_reach', animation: 'attack',
    range: 96, minRange: 0, arcDegrees: 86, cooldownMs: 1900, windupMs: 470, triggerAt: 0.58, recoverMs: 310,
    damageMultiplier: 1.00, knockback: 54, damageType: 'celestial', impact: 'celestial', telegraph: 'celestial', audio: 'celestial_strike'
  }),
  lumen_bolt: Object.freeze({
    id: 'lumen_bolt', name: 'Lumen Bolt', type: 'projectile', projectileId: 'lumen_bolt', animation: 'attack',
    range: 330, minRange: 104, cooldownMs: 3050, windupMs: 590, triggerAt: 0.61, recoverMs: 330,
    damageMultiplier: 0.84, damageType: 'celestial', impact: 'celestial', telegraph: 'celestial', audio: 'celestial_strike'
  }),
  judgment_pulse: Object.freeze({
    id: 'judgment_pulse', name: 'Judgment Pulse', type: 'radial_aoe', animation: 'attack',
    range: 94, minRange: 0, radius: 94, cooldownMs: 4400, windupMs: 720, triggerAt: 0.77, recoverMs: 430,
    damageMultiplier: 0.82, knockback: 96, damageType: 'celestial', impact: 'celestial', telegraph: 'celestial', audio: 'celestial_strike'
  }),
  grace_of_light: Object.freeze({
    id: 'grace_of_light', name: 'Grace of Light', type: 'friendly_heal', animation: 'attack',
    range: 420, minRange: 0, radius: 142, cooldownMs: 8200, windupMs: 780, triggerAt: 0.75, recoverMs: 480,
    healPct: 0.08, selfHealPct: 0.055, playerHealPct: 0.06, castMissingThreshold: 0.20,
    telegraph: 'celestial', audio: 'heal'
  }),

  earthshatter: Object.freeze({
    id: 'earthshatter', name: 'Earthshatter', type: 'radial_aoe', animation: 'attack',
    range: 122, minRange: 0, radius: 118, cooldownMs: 5200, windupMs: 820, triggerAt: 0.88, recoverMs: 720,
    damageMultiplier: 1.2, knockback: 235, status: Object.freeze({ id: 'stagger', chance: 1 }), telegraph: 'earth'
  })
});
