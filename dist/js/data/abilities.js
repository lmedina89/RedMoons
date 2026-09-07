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
  earthshatter: Object.freeze({
    id: 'earthshatter', name: 'Earthshatter', type: 'radial_aoe', animation: 'attack',
    range: 122, minRange: 0, radius: 118, cooldownMs: 5200, windupMs: 820, triggerAt: 0.88, recoverMs: 720,
    damageMultiplier: 1.2, knockback: 235, status: Object.freeze({ id: 'stagger', chance: 1 }), telegraph: 'earth'
  })
});
