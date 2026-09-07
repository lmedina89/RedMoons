export const WEAPON_COMBAT_PROFILES = Object.freeze({
  single_slash: Object.freeze({
    id: 'single_slash',
    comboWindowMs: 520,
    attacks: Object.freeze([
      Object.freeze({ action: 'slash', frames: 6, durationMs: 360, hitAt: 0.42, damageMultiplier: 1, rangeMultiplier: 1, arcDegrees: 96 })
    ])
  }),
  sword_four_hit: Object.freeze({
    id: 'sword_four_hit',
    comboWindowMs: 620,
    attacks: Object.freeze([
      Object.freeze({ action: 'slash', frames: 6, durationMs: 330, hitAt: 0.42, damageMultiplier: 1, rangeMultiplier: 1, arcDegrees: 96 }),
      Object.freeze({ action: 'slash1h', frames: 7, durationMs: 350, hitAt: 0.46, damageMultiplier: 1, rangeMultiplier: 1, arcDegrees: 102 }),
      Object.freeze({ action: 'backslash1h', frames: 12, durationMs: 430, hitAt: 0.52, damageMultiplier: 1.08, rangeMultiplier: 1.08, arcDegrees: 112 }),
      Object.freeze({ action: 'halfslash1h', frames: 6, durationMs: 470, hitAt: 0.50, damageMultiplier: 1.20, rangeMultiplier: 1.12, arcDegrees: 120 })
    ])
  })
});
