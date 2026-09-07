export const NPC_DEFS = Object.freeze({
  npc_blacksmith: {
    id: 'npc_blacksmith', name: 'Torren', role: 'Blacksmith', x: 276, y: 430,
    npcType: 'town_crafter', level: 8, combatRole: 'bruiser', guildId: null, recruitable: false, activityState: 'working', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: 'npc_classic_hair',
    loadout: { chest: 'chest_cinderhide', hands: 'hands_iron', legs: 'legs_ash_pants', feet: 'feet_road_boots' },
    route: [{ x: 276, y: 430 }, { x: 308, y: 430 }, { x: 286, y: 458 }], speed: 18,
    dialogue: [
      { conditions: [{ type: 'equippedRarityAtLeast', value: 'noble' }], text: 'That Noble piece carries a clean resonance. Keep it away from the forge-flame unless you want the modifiers burned out.' },
      { conditions: [{ type: 'playerLevelAtLeast', value: 4 }], text: 'You move like the ash has stopped weighing on you. Bone Road will test whether that strength is real.' },
      { conditions: [], text: 'Steel survives here because it learns when to bend. Bring back anything the dead drop; some of it can still serve.' }
    ]
  },
  npc_merchant: {
    id: 'npc_merchant', name: 'Ilyan', role: 'Merchant', x: 430, y: 635,
    npcType: 'town_merchant', level: 5, combatRole: 'support', guildId: null, recruitable: false, activityState: 'trading', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: 'npc_classic_hair',
    loadout: { chest: 'chest_wayfarer', legs: 'legs_ash_pants', hands: 'hands_hide_wraps', feet: 'feet_road_boots' },
    route: [{ x: 430, y: 635 }, { x: 468, y: 642 }, { x: 410, y: 668 }], speed: 20,
    dialogue: [
      { conditions: [{ type: 'hasItemTag', value: 'rare_essence' }], text: 'Wrap that heart twice. Vesra will want it alive, and living embers have a habit of choosing new owners.' },
      { conditions: [{ type: 'worldFlag', key: 'ash_pest_cleared', value: true }], text: 'Trade is moving again. Fewer imps means fewer teeth in my supply carts.' },
      { conditions: [], text: 'Coin spends. Ash does not. Fortunately, the Outskirts are full of creatures carrying both.' }
    ]
  },
  npc_vesra: {
    id: 'npc_vesra', name: 'Warden Vesra', role: 'Quest Warden', x: 525, y: 485,
    npcType: 'warden', level: 12, combatRole: 'vanguard', guildId: 'guild_cinder_watch', recruitable: false, activityState: 'watching_gate', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_classic_body', hairVisual: null,
    loadout: { head: 'head_warden', shoulders: 'shoulders_legion', chest: 'chest_ash_plate', hands: 'hands_iron', legs: 'legs_iron_greaves', feet: 'feet_iron', weapon: 'weapon_rustblade' },
    route: [{ x: 525, y: 485 }, { x: 560, y: 500 }, { x: 610, y: 540 }], speed: 14,
    dialogue: [
      { conditions: [{ type: 'hasItemTag', value: 'rare_essence' }, { type: 'questState', questId: 'quest_ember_heart', value: 'active' }], text: 'You carry the heart. I can hear it striking against your pack. Hand it over before the imps follow its pulse.' },
      { conditions: [{ type: 'questState', questId: 'quest_bone_captain', value: 'complete' }], text: 'Ossivar is ash again. The Bone Road remembers your name now.' },
      { conditions: [{ type: 'npcConversationAtLeast', value: 2 }], text: 'You came back. Good. Most new hunters mistake courage for refusing to return.' },
      { conditions: [], text: 'The refuge holds because hunters keep the Outskirts thin. Speak with me when you are ready to carry that burden.' }
    ]
  },
  npc_wanderer: {
    id: 'npc_wanderer', name: 'Sable', role: 'Ash Wanderer', x: 625, y: 790,
    npcType: 'adventurer', level: 6, combatRole: 'skirmisher', guildId: null, recruitable: true, activityState: 'between_hunts', homeZone: 'zone_cinder_refuge',
    baseVisual: 'npc_olive_base', hairVisual: null,
    loadout: { shoulders: 'shoulders_leather_revised', chest: 'chest_cinderhide', feet: 'feet_leather_revised', weapon: 'weapon_katana_npc' },
    route: [{ x: 625, y: 790 }, { x: 670, y: 730 }, { x: 665, y: 650 }, { x: 635, y: 710 }], speed: 28,
    dialogue: [
      { conditions: [{ type: 'previousConversationAtLeast', value: 1 }, { type: 'playerLevelAtLeast', value: 3 }], text: 'Still walking east? Then remember: skeletons hear straight roads better than soft ground.' },
      { conditions: [], text: 'Bone Road begins where the wind stops carrying voices back to town.' }
    ]
  }
});

// Data-only placeholder: guild mechanics are deliberately not active yet,
// but NPC membership can already reference stable IDs without a later schema
// rewrite.
export const NPC_GUILD_SEEDS = Object.freeze({
  guild_cinder_watch: { id: 'guild_cinder_watch', name: 'Cinder Watch', status: 'world_lore_only', emblem: 'watch_flame_future' }
});
