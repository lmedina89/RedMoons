export const QUEST_DEFS = Object.freeze({
  quest_ash_pest: {
    id: 'quest_ash_pest', name: 'Ash-Pest Cull', giver: 'npc_vesra', summary: 'Cull 5 Cinder Imps in the Scorched Outskirts.',
    objectives: [{ id: 'kill_imp', type: 'killFamily', targetId: 'imp', required: 5 }],
    rewards: { xp: 80, currency: 24 }, nextQuest: 'quest_ember_heart', completionFlag: 'ash_pest_cleared'
  },
  quest_ember_heart: {
    id: 'quest_ember_heart', name: 'A Heart Still Burning', giver: 'npc_vesra', summary: 'Recover a Living Ember Heart from the hunting grounds.',
    objectives: [{ id: 'collect_heart', type: 'collectItem', targetId: 'quest_ember_heart', required: 1 }],
    rewards: { xp: 120, currency: 38, item: { itemId: 'hands_legion', rarity: 'magic' } }, nextQuest: 'quest_bone_captain', completionFlag: 'ember_heart_delivered'
  },
  quest_bone_captain: {
    id: 'quest_bone_captain', name: 'The Bone Road Warden', giver: 'npc_vesra', summary: 'Defeat Captain Ossivar at the edge of Bone Road.',
    objectives: [{ id: 'kill_captain', type: 'killEnemy', targetId: 'enemy_bone_captain', required: 1 }],
    rewards: { xp: 260, currency: 75, item: { itemId: 'head_iron_revised', rarity: 'noble' } }, completionFlag: 'bone_road_open'
  }
});

