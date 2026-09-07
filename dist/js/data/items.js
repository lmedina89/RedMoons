const PLAYER_GEAR_PRESENTATION = Object.freeze({
  inventoryBorder: 'rarity',
  worldGlow: 'rarity',
  enhancementGlowScale: 1,
  sparkleEffect: null,
  trailEffect: null,
  auraEffect: null
});

export const EQUIPMENT_SET_DEFS = Object.freeze({
  set_legion_remnant: {
    id: 'set_legion_remnant',
    name: 'Gravesworn Legion',
    theme: 'heavy_melee',
    status: 'planned',
    bonuses: [
      { pieces: 2, stats: { defense: 2 } },
      { pieces: 3, stats: { vit: 2 } },
      { pieces: 4, stats: { attack: 2 } },
      { pieces: 5, effectId: 'legion_unbroken', label: 'Legion Unbroken' }
    ]
  },
  set_ashrunner: {
    id: 'set_ashrunner',
    name: 'Ashrunner Leathers',
    theme: 'agile_hunter',
    status: 'planned',
    bonuses: [
      { pieces: 2, stats: { dex: 2 } },
      { pieces: 3, stats: { moveSpeed: 4 } },
      { pieces: 4, effectId: 'ashrunner_hunt', label: 'Ashrunner Hunt' }
    ]
  },
  set_steel_bastion: {
    id: 'set_steel_bastion',
    name: 'Steel Bastion',
    theme: 'fortress_tank',
    status: 'planned',
    bonuses: [
      { pieces: 2, stats: { defense: 3 } },
      { pieces: 3, stats: { maxHp: 20 } },
      { pieces: 4, effectId: 'bastion_stance', label: 'Bastion Stance' }
    ]
  }
});

export const ITEM_DEFS = Object.freeze({
  // Older limited-animation sword retained for old saves and future humanoid enemies.
  weapon_rustblade: { id: 'weapon_rustblade', name: 'Rustblade', slot: 'weapon', tags: ['weapon', 'sword', 'npc_loadout'], levelReq: 1, requirements: {}, baseStats: { attack: 3 }, visual: 'weapon_long_sword', value: 9, combatProfile: 'single_slash', playerCombatReady: false, animationClass: 'limited' },
  weapon_arming_sword: { id: 'weapon_arming_sword', name: 'Ashen Arming Sword', slot: 'weapon', tags: ['weapon', 'sword', 'player_ready'], levelReq: 1, requirements: {}, baseStats: { attack: 4 }, visual: 'weapon_arming_sword', value: 18, combatProfile: 'sword_four_hit', playerCombatReady: true, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },
  weapon_brass_arming_sword: { id: 'weapon_brass_arming_sword', name: 'Brass Arming Sword', slot: 'weapon', tags: ['weapon', 'sword', 'player_ready', 'material_brass'], levelReq: 2, requirements: { str: 7 }, baseStats: { attack: 5 }, visual: 'weapon_brass_arming_sword', value: 30, combatProfile: 'sword_four_hit', playerCombatReady: true, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },
  weapon_iron_arming_sword: { id: 'weapon_iron_arming_sword', name: 'Iron Arming Sword', slot: 'weapon', tags: ['weapon', 'sword', 'player_ready', 'material_iron'], levelReq: 4, requirements: { str: 9 }, baseStats: { attack: 7 }, visual: 'weapon_iron_arming_sword', value: 56, combatProfile: 'sword_four_hit', playerCombatReady: true, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },
  weapon_katana_npc: { id: 'weapon_katana_npc', name: 'Ashland Katana', slot: 'weapon', tags: ['weapon', 'sword', 'npc_loadout'], levelReq: 1, requirements: {}, baseStats: { attack: 5 }, visual: 'weapon_katana_npc', value: 24, combatProfile: 'single_slash', playerCombatReady: false, animationClass: 'npc_only', npcOnly: true },

  offhand_wood_guard: { id: 'offhand_wood_guard', name: 'Charred Wood Guard', slot: 'offhand', tags: ['armor', 'shield', 'npc_loadout'], levelReq: 2, requirements: { vit: 7 }, baseStats: { defense: 2 }, visual: 'shield_wood', value: 18, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },

  head_chain_coif: { id: 'head_chain_coif', name: 'Cinder Chain Coif', slot: 'head', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 2, requirements: { str: 7 }, baseStats: { defense: 2 }, visual: 'head_chain', value: 22, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  head_warden: { id: 'head_warden', name: 'Warden Helm', slot: 'head', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 4, requirements: { str: 10 }, baseStats: { defense: 4 }, visual: 'head_plate', value: 55, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  head_iron_revised: { id: 'head_iron_revised', name: 'Iron War Helm', gearFamily: 'legion_remnant', setId: 'set_legion_remnant', slot: 'head', tags: ['armor', 'metal', 'revised_combat'], levelReq: 4, requirements: { str: 9 }, baseStats: { defense: 4 }, visual: 'head_iron_revised', value: 58, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },
  head_bronze_revised: { id: 'head_bronze_revised', name: 'Bronze War Helm', slot: 'head', tags: ['armor', 'metal', 'player_ready', 'material_bronze'], levelReq: 2, requirements: { str: 7 }, baseStats: { defense: 2 }, visual: 'head_bronze_revised', value: 30, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },

  shoulders_legion: { id: 'shoulders_legion', name: 'Legion Pauldrons', gearFamily: 'legion_remnant', setId: 'set_legion_remnant', slot: 'shoulders', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 4, requirements: { str: 9 }, baseStats: { defense: 3, str: 1 }, visual: 'shoulders_legion', value: 52, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  shoulders_leather_revised: { id: 'shoulders_leather_revised', name: 'Ashhide Shoulders', gearFamily: 'ashrunner', setId: 'set_ashrunner', slot: 'shoulders', tags: ['armor', 'leather', 'player_ready'], levelReq: 2, requirements: { dex: 7 }, baseStats: { defense: 2 }, visual: 'shoulders_leather_revised', value: 28, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },

  chest_wayfarer: { id: 'chest_wayfarer', name: 'Wayfarer Shirt', slot: 'chest', tags: ['armor', 'cloth', 'npc_loadout'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'chest_wayfarer', value: 5, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  chest_cinderhide: { id: 'chest_cinderhide', name: 'Cinderhide Jerkin', slot: 'chest', tags: ['armor', 'leather', 'npc_loadout'], levelReq: 2, requirements: { dex: 7 }, baseStats: { defense: 3, maxHp: 8 }, visual: 'chest_leather', value: 28, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  chest_ash_plate: { id: 'chest_ash_plate', name: 'Ashforged Cuirass', slot: 'chest', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 5, requirements: { str: 12 }, baseStats: { defense: 7, maxHp: 15 }, visual: 'chest_plate', value: 88, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  chest_legion: { id: 'chest_legion', name: 'Legion Cuirass', gearFamily: 'legion_remnant', setId: 'set_legion_remnant', slot: 'chest', tags: ['armor', 'metal', 'revised_combat'], levelReq: 5, requirements: { str: 11 }, baseStats: { defense: 7, maxHp: 12 }, visual: 'chest_legion', value: 92, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },
  chest_silver_legion: { id: 'chest_silver_legion', name: 'Silver Legion Cuirass', slot: 'chest', tags: ['armor', 'metal', 'player_ready', 'material_silver'], levelReq: 5, requirements: { str: 10 }, baseStats: { defense: 6, maxHp: 10 }, visual: 'chest_silver_legion', value: 86, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },
  chest_steel_plate: { id: 'chest_steel_plate', name: 'Steel Bastion Plate', gearFamily: 'steel_bastion', setId: 'set_steel_bastion', slot: 'chest', tags: ['armor', 'metal', 'player_ready', 'material_steel'], levelReq: 6, requirements: { str: 13 }, baseStats: { defense: 9, maxHp: 16 }, visual: 'chest_steel_plate', value: 128, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },

  legs_ash_pants: { id: 'legs_ash_pants', name: 'Ashcloth Trousers', slot: 'legs', tags: ['armor', 'cloth', 'npc_loadout'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'legs_ash', value: 5, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  legs_iron_greaves: { id: 'legs_iron_greaves', name: 'Iron Greaves', gearFamily: 'legion_remnant', setId: 'set_legion_remnant', slot: 'legs', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 4, requirements: { str: 9 }, baseStats: { defense: 4 }, visual: 'legs_plate', value: 42, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },

  hands_hide_wraps: { id: 'hands_hide_wraps', name: 'Hide Handwraps', slot: 'hands', tags: ['armor', 'leather', 'npc_loadout'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'hands_hide', value: 5, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  hands_iron: { id: 'hands_iron', name: 'Iron Gauntlets', slot: 'hands', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 3, requirements: { str: 8 }, baseStats: { defense: 3 }, visual: 'hands_plate', value: 34, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  hands_legion: { id: 'hands_legion', name: 'Legion Gloves', gearFamily: 'legion_remnant', setId: 'set_legion_remnant', slot: 'hands', tags: ['armor', 'metal', 'revised_combat'], levelReq: 4, requirements: { str: 9 }, baseStats: { defense: 3, attack: 1 }, visual: 'hands_legion', value: 48, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },

  feet_road_boots: { id: 'feet_road_boots', name: 'Road Boots', slot: 'feet', tags: ['armor', 'leather', 'npc_loadout'], levelReq: 1, requirements: {}, baseStats: { defense: 1 }, visual: 'feet_road', value: 5, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  feet_iron: { id: 'feet_iron', name: 'Iron Sabatons', slot: 'feet', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 3, requirements: { str: 8 }, baseStats: { defense: 3 }, visual: 'feet_plate', value: 35, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  feet_revised: { id: 'feet_revised', name: 'Legion Boots', gearFamily: 'legion_remnant', setId: 'set_legion_remnant', slot: 'feet', tags: ['armor', 'metal', 'npc_loadout'], levelReq: 4, requirements: { str: 8 }, baseStats: { defense: 3, dex: 1 }, visual: 'feet_revised', value: 46, playerEquipReady: false, npcOnly: true, animationClass: 'npc_only' },
  feet_leather_revised: { id: 'feet_leather_revised', name: 'Ashrunner Leather Boots', gearFamily: 'ashrunner', setId: 'set_ashrunner', slot: 'feet', tags: ['armor', 'leather', 'player_ready'], levelReq: 2, requirements: { dex: 7 }, baseStats: { defense: 1, dex: 1 }, visual: 'feet_leather_revised', value: 28, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },

  wings_red_bat: { id: 'wings_red_bat', name: 'Crimson Bat Wings', slot: 'wings', tags: ['wings', 'prestige', 'revised_combat'], levelReq: 1, requirements: {}, equipGate: 'wingsUnlocked', gateLabel: 'Ascendant wing attunement', baseStats: { defense: 3, maxHp: 25, moveSpeed: 6 }, visual: 'wings_red_bat', value: 250, playerEquipReady: true, animationClass: 'full_combo', presentation: PLAYER_GEAR_PRESENTATION },

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
