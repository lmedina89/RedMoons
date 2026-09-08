export const NPC_DEFS = Object.freeze({
  npc_blacksmith: {
    id: 'npc_blacksmith', name: 'Torren', role: 'Blacksmith', x: 470, y: 535,
    npcType: 'town_crafter', level: 8, combatRole: 'bruiser', guildId: null, recruitable: false, activityState: 'working', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: 'npc_classic_hair',
    loadout: { chest: 'chest_cinderhide', hands: 'hands_iron', legs: 'legs_ash_pants', feet: 'feet_road_boots' },
    route: [{ x: 470, y: 535 }, { x: 520, y: 545 }, { x: 445, y: 575 }], speed: 18,
    dialogue: [
      { conditions: [{ type: 'equippedRarityAtLeast', value: 'noble' }], text: 'That Noble piece carries a clean resonance. Keep it away from the forge-flame unless you want the modifiers burned out.' },
      { conditions: [{ type: 'playerLevelAtLeast', value: 4 }], text: 'You move like the ash has stopped weighing on you. Bone Road will test whether that strength is real.' },
      { conditions: [], text: 'Steel survives here because it learns when to bend. Bring back anything the dead drop; some of it can still serve.' }
    ]
  },
  npc_merchant: {
    id: 'npc_merchant', name: 'Ilyan', role: 'Merchant', x: 1040, y: 805,
    npcType: 'town_merchant', level: 5, combatRole: 'support', guildId: null, recruitable: false, activityState: 'trading', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: 'npc_classic_hair',
    loadout: { chest: 'chest_wayfarer', legs: 'legs_ash_pants', hands: 'hands_hide_wraps', feet: 'feet_road_boots' },
    route: [{ x: 1040, y: 805 }, { x: 1100, y: 820 }, { x: 985, y: 845 }], speed: 20,
    dialogue: [
      { conditions: [{ type: 'hasItemTag', value: 'rare_essence' }], text: 'Wrap that heart twice. Vesra will want it alive, and living embers have a habit of choosing new owners.' },
      { conditions: [{ type: 'worldFlag', key: 'ash_pest_cleared', value: true }], text: 'Trade is moving again. Fewer imps means fewer teeth in my supply carts.' },
      { conditions: [], text: 'Coin spends. Ash does not. Fortunately, the Outskirts are full of creatures carrying both.' }
    ]
  },
  npc_vesra: {
    id: 'npc_vesra', name: 'Warden Vesra', role: 'Quest Warden', x: 1590, y: 690,
    npcType: 'warden', level: 12, combatRole: 'vanguard', guildId: 'guild_cinder_watch', recruitable: false, activityState: 'watching_gate', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: null,
    loadout: { head: 'head_warden', shoulders: 'shoulders_legion', chest: 'chest_ash_plate', hands: 'hands_iron', legs: 'legs_iron_greaves', feet: 'feet_iron', weapon: 'weapon_rustblade' },
    route: [{ x: 1590, y: 690 }, { x: 1660, y: 720 }, { x: 1740, y: 760 }], speed: 14,
    dialogue: [
      { conditions: [{ type: 'hasItemTag', value: 'rare_essence' }, { type: 'questState', questId: 'quest_ember_heart', value: 'active' }], text: 'You carry the heart. I can hear it striking against your pack. Hand it over before the imps follow its pulse.' },
      { conditions: [{ type: 'questState', questId: 'quest_bone_captain', value: 'complete' }], text: 'Ossivar is ash again. The Bone Road remembers your name now.' },
      { conditions: [{ type: 'npcConversationAtLeast', value: 2 }], text: 'You came back. Good. Most new hunters mistake courage for refusing to return.' },
      { conditions: [], text: 'The refuge holds because hunters keep the Outskirts thin. Speak with me when you are ready to carry that burden.' }
    ]
  },
  npc_wanderer: {
    id: 'npc_wanderer', name: 'Sable', role: 'Ash Wanderer', x: 1420, y: 1120,
    npcType: 'adventurer', level: 6, combatRole: 'skirmisher', guildId: null, recruitable: true, activityState: 'between_hunts', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_olive_base', hairVisual: null,
    loadout: { shoulders: 'shoulders_leather_revised', chest: 'chest_cinderhide', feet: 'feet_leather_revised', weapon: 'weapon_katana_npc' },
    route: [{ x: 1420, y: 1120 }, { x: 1510, y: 1090 }, { x: 1570, y: 1040 }, { x: 1540, y: 1125 }], speed: 28,
    dialogue: [
      { conditions: [{ type: 'previousConversationAtLeast', value: 1 }, { type: 'playerLevelAtLeast', value: 3 }], text: 'Still walking east? Then remember: skeletons hear straight roads better than soft ground.' },
      { conditions: [], text: 'Bone Road begins where the wind stops carrying voices back to town.' }
    ]
  },
  npc_bone_hunter: {
    id: 'npc_bone_hunter', name: 'Renn', role: 'Bone Hunter', x: 910, y: 1190,
    npcType: 'adventurer', level: 7, combatRole: 'vanguard', guildId: 'guild_emberbound', recruitable: false, activityState: 'resting_between_hunts', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: 'npc_classic_hair',
    loadout: { head: 'head_chain_coif', chest: 'chest_cinderhide', hands: 'hands_iron', feet: 'feet_iron', weapon: 'weapon_steel_arming_sword', offhand: 'offhand_wood_guard' },
    route: [{ x: 910, y: 1190 }, { x: 970, y: 1160 }, { x: 1040, y: 1200 }, { x: 945, y: 1230 }], speed: 22,
    dialogue: [
      { conditions: [{ type: 'playerLevelAtLeast', value: 6 }], text: 'Blueflame imps are worse than the red kind. Same grin, smarter feet. Do not let the shielded ones stall you for the pack.' },
      { conditions: [], text: 'The Emberbound hunt in pairs when Bone Road is loud. I am waiting on mine.' }
    ]
  },
  npc_road_seeker: {
    id: 'npc_road_seeker', name: 'Doran', role: 'Road Seeker', x: 340, y: 820,
    npcType: 'adventurer', level: 4, combatRole: 'striker', guildId: null, recruitable: true, activityState: 'studying_routes', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_olive_base', hairVisual: null,
    loadout: { head: 'head_bronze_revised', shoulders: 'shoulders_legion', chest: 'chest_wayfarer', feet: 'feet_road_boots', weapon: 'weapon_copper_arming_sword' },
    route: [{ x: 340, y: 820 }, { x: 400, y: 845 }, { x: 440, y: 870 }, { x: 315, y: 850 }], speed: 24,
    dialogue: [
      { conditions: [{ type: 'worldFlag', key: 'bone_road_open', value: true }], text: 'Ossivar fell? Then I picked the right week to stop pretending I was ready for Bone Road.' },
      { conditions: [], text: 'I mark where the hunters return from, not where they leave. The difference keeps maps honest.' }
    ]
  }
});

// Data-only placeholder: guild mechanics are deliberately not active yet,
// but NPC membership can already reference stable IDs without a later schema
// rewrite.
export const NPC_GUILD_SEEDS = Object.freeze({
  guild_cinder_watch: { id: 'guild_cinder_watch', name: 'Cinder Watch', status: 'world_lore_only', emblem: 'watch_flame_future' },
  guild_emberbound: { id: 'guild_emberbound', name: 'Emberbound', status: 'world_lore_only', emblem: 'split_ember_future' }
});
