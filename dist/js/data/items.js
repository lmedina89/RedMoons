export const ITEM_DEFS = Object.freeze({
  weapon_rustblade: { id: 'weapon_rustblade', name: 'Rustblade', slot: 'weapon', tags: ['weapon', 'sword'], levelReq: 1, requirements: {}, baseStats: { attack: 3 }, visual: 'weapon_long_sword', value: 9 },
  offhand_wood_guard: { id: 'offhand_wood_guard', name: 'Charred Wood Guard', slot: 'offhand', tags: ['armor', 'shield'], levelReq: 2, requirements: { vit: 7 }, baseStats: { defense: 2 }, visual: 'shield_wood', value: 18 },
  head_chain_coif: { id: 'head_chain_coif', name: 'Cinder Chain Coif', slot: 'head', tags: ['armor', 'metal'], levelReq: 2, requirements: { str: 7 }, baseStats: { defense: 2 }, visual: 'head_chain', value: 22 },
  head_warden: { id: 'head_warden', name: 'Warden Helm', slot: 'head', tags: ['armor', 'metal'], levelReq: 4, requirements: { str: 10 }, baseStats: { defense: 4 }, visual: 'head_plate', value: 55 },
  chest_wayfarer: { id: 'chest_wayfarer', name: 'Wayfarer Shirt', slot: 'chest', tags: ['armor', 'cloth'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'chest_wayfarer', value: 5 },
  chest_cinderhide: { id: 'chest_cinderhide', name: 'Cinderhide Jerkin', slot: 'chest', tags: ['armor', 'leather'], levelReq: 2, requirements: { dex: 7 }, baseStats: { defense: 3, maxHp: 8 }, visual: 'chest_leather', value: 28 },
  chest_ash_plate: { id: 'chest_ash_plate', name: 'Ashforged Cuirass', slot: 'chest', tags: ['armor', 'metal'], levelReq: 5, requirements: { str: 12 }, baseStats: { defense: 7, maxHp: 15 }, visual: 'chest_plate', value: 88 },
  legs_ash_pants: { id: 'legs_ash_pants', name: 'Ashcloth Trousers', slot: 'legs', tags: ['armor', 'cloth'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'legs_ash', value: 5 },
  legs_iron_greaves: { id: 'legs_iron_greaves', name: 'Iron Greaves', slot: 'legs', tags: ['armor', 'metal'], levelReq: 4, requirements: { str: 9 }, baseStats: { defense: 4 }, visual: 'legs_plate', value: 42 },
  hands_hide_wraps: { id: 'hands_hide_wraps', name: 'Hide Handwraps', slot: 'hands', tags: ['armor', 'leather'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'hands_hide', value: 5 },
  hands_iron: { id: 'hands_iron', name: 'Iron Gauntlets', slot: 'hands', tags: ['armor', 'metal'], levelReq: 3, requirements: { str: 8 }, baseStats: { defense: 3 }, visual: 'hands_plate', value: 34 },
  feet_road_boots: { id: 'feet_road_boots', name: 'Road Boots', slot: 'feet', tags: ['armor', 'leather'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'feet_road', value: 5 },
  feet_iron: { id: 'feet_iron', name: 'Iron Sabatons', slot: 'feet', tags: ['armor', 'metal'], levelReq: 3, requirements: { str: 8 }, baseStats: { defense: 3 }, visual: 'feet_plate', value: 35 },
  quest_ember_heart: { id: 'quest_ember_heart', name: 'Living Ember Heart', slot: null, tags: ['quest', 'rare_essence'], levelReq: 1, requirements: {}, baseStats: {}, visual: null, value: 0, questItem: true }
});

export const MODIFIER_POOL = Object.freeze([
  { id: 'fierce', label: 'Fierce', stat: 'attack', min: 1, max: 3 },
  { id: 'stout', label: 'Stout', stat: 'defense', min: 1, max: 3 },
  { id: 'vital', label: 'Vital', stat: 'maxHp', min: 4, max: 12 },
  { id: 'focused', label: 'Focused', stat: 'maxEssence', min: 3, max: 9 },
  { id: 'strong', label: 'Strong', stat: 'str', min: 1, max: 2 },
  { id: 'nimble', label: 'Nimble', stat: 'dex', min: 1, max: 2 }
]);

