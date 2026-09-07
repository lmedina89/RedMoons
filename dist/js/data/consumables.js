export const CONSUMABLE_EFFECT_DEFS = Object.freeze({
  heal_minor: Object.freeze({
    id: 'heal_minor', kind: 'heal', label: 'Restore 35 HP', amount: 35,
    cooldownGroup: 'flask', cooldownMs: 4000, quickSlot: 'health', fx: 'heal', audio: 'heal'
  }),
  essence_minor: Object.freeze({
    id: 'essence_minor', kind: 'essence', label: 'Restore 28 Essence', amount: 28,
    cooldownGroup: 'flask', cooldownMs: 4000, quickSlot: 'essence', fx: 'essence', audio: 'essence'
  }),
  cinder_ration: Object.freeze({
    id: 'cinder_ration', kind: 'food', label: 'Restore 28 HP over 7 seconds', totalAmount: 28,
    durationMs: 7000, tickMs: 1000, cooldownGroup: 'food', cooldownMs: 8000,
    outOfCombatMs: 4000, fx: 'heal', audio: 'food'
  })
});

export const QUICK_CONSUMABLE_SLOTS = Object.freeze([
  Object.freeze({ slot: 'health', itemId: 'consumable_ashblood_minor', label: 'HP', name: 'Minor Ashblood Flask' }),
  Object.freeze({ slot: 'essence', itemId: 'consumable_essence_minor', label: 'ES', name: 'Minor Essence Flask' })
]);

export const MERCHANT_SUPPLY_DEFS = Object.freeze([
  Object.freeze({ itemId: 'consumable_ashblood_minor', price: 12, description: 'Reliable field healing.' }),
  Object.freeze({ itemId: 'consumable_essence_minor', price: 14, description: 'Restores skill Essence.' }),
  Object.freeze({ itemId: 'consumable_cinder_ration', price: 6, description: 'Cheap recovery between fights.' })
]);

// Recovery drops are kept separate from monster-specific equipment tables so
// survival tuning can change without rewriting every enemy definition.
export const RECOVERY_DROP_TABLE = Object.freeze([
  Object.freeze({ itemId: 'consumable_ashblood_minor', chance: 0.085, minLevel: 1, maxLevel: 99 }),
  Object.freeze({ itemId: 'consumable_essence_minor', chance: 0.055, minLevel: 2, maxLevel: 99 }),
  Object.freeze({ itemId: 'consumable_cinder_ration', chance: 0.060, minLevel: 1, maxLevel: 5 })
]);
