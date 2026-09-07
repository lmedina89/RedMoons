export const STATUS_DEFS = Object.freeze({
  burn: Object.freeze({
    id: 'burn', name: 'Burn', kind: 'debuff', damageType: 'fire', durationMs: 4200, tickMs: 900,
    flatDamage: 2, powerScale: 0.08, maxStacks: 1, refresh: true, color: 0xff6b2f
  }),
  poison: Object.freeze({
    id: 'poison', name: 'Poison', kind: 'debuff', damageType: 'poison', durationMs: 6000, tickMs: 1200,
    flatDamage: 2, powerScale: 0.05, maxStacks: 3, refresh: true, color: 0x75d447
  }),
  slow: Object.freeze({
    id: 'slow', name: 'Slow', kind: 'debuff', durationMs: 3600, moveMultiplier: 0.68,
    maxStacks: 1, refresh: true, color: 0x8ab7ff
  }),
  guard: Object.freeze({
    id: 'guard', name: 'Guard', kind: 'buff', durationMs: 5000, damageTakenMultiplier: 0.75,
    staggerResistance: 0.65, maxStacks: 1, refresh: true, color: 0xf0b45d
  }),
  stagger: Object.freeze({
    id: 'stagger', name: 'Stagger', kind: 'control', durationMs: 360, actionLocked: true,
    immunityMs: 900, maxStacks: 1, refresh: false, color: 0xffd27a
  })
});
