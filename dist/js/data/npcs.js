export const NPC_DEFS = Object.freeze({
  npc_blacksmith: {
    id: 'npc_blacksmith', name: 'Torren', role: 'Blacksmith', x: 238, y: 405, tint: 0xd28a54,
    route: [{ x: 238, y: 405 }, { x: 276, y: 405 }], speed: 18,
    dialogue: [
      { conditions: [{ type: 'equippedRarityAtLeast', value: 'noble' }], text: 'That Noble piece carries a clean resonance. Keep it away from the forge-flame unless you want the modifiers burned out.' },
      { conditions: [{ type: 'playerLevelAtLeast', value: 4 }], text: 'You move like the ash has stopped weighing on you. Bone Road will test whether that strength is real.' },
      { conditions: [], text: 'Steel survives here because it learns when to bend. Bring back anything the dead drop; some of it can still serve.' }
    ]
  },
  npc_merchant: {
    id: 'npc_merchant', name: 'Ilyan', role: 'Merchant', x: 420, y: 438, tint: 0xe7c876,
    route: [{ x: 420, y: 438 }, { x: 446, y: 460 }, { x: 404, y: 472 }], speed: 20,
    dialogue: [
      { conditions: [{ type: 'hasItemTag', value: 'rare_essence' }], text: 'Wrap that heart twice. Vesra will want it alive, and living embers have a habit of choosing new owners.' },
      { conditions: [{ type: 'worldFlag', key: 'ash_pest_cleared', value: true }], text: 'Trade is moving again. Fewer imps means fewer teeth in my supply carts.' },
      { conditions: [], text: 'Coin spends. Ash does not. Fortunately, the Outskirts are full of creatures carrying both.' }
    ]
  },
  npc_vesra: {
    id: 'npc_vesra', name: 'Warden Vesra', role: 'Quest Warden', x: 536, y: 570, tint: 0xb068d4,
    route: [{ x: 536, y: 570 }, { x: 560, y: 570 }], speed: 14,
    dialogue: [
      { conditions: [{ type: 'hasItemTag', value: 'rare_essence' }, { type: 'questState', questId: 'quest_ember_heart', value: 'active' }], text: 'You carry the heart. I can hear it striking against your pack. Hand it over before the imps follow its pulse.' },
      { conditions: [{ type: 'questState', questId: 'quest_bone_captain', value: 'complete' }], text: 'Ossivar is ash again. The Bone Road remembers your name now.' },
      { conditions: [{ type: 'npcConversationAtLeast', value: 2 }], text: 'You came back. Good. Most new hunters mistake courage for refusing to return.' },
      { conditions: [], text: 'The refuge holds because hunters keep the Outskirts thin. Speak with me when you are ready to carry that burden.' }
    ]
  },
  npc_wanderer: {
    id: 'npc_wanderer', name: 'Sable', role: 'Ash Wanderer', x: 650, y: 720, tint: 0x79a7a3,
    route: [{ x: 650, y: 720 }, { x: 772, y: 670 }, { x: 850, y: 760 }, { x: 735, y: 820 }], speed: 28,
    dialogue: [
      { conditions: [{ type: 'previousConversationAtLeast', value: 1 }, { type: 'playerLevelAtLeast', value: 3 }], text: 'Still walking east? Then remember: skeletons hear straight roads better than soft ground.' },
      { conditions: [], text: 'Bone Road begins where the wind stops carrying voices back to town.' }
    ]
  }
});

