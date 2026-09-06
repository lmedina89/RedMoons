import { RARITY } from '../config.js';
import { ITEM_DEFS } from '../data/items.js';

export class DialogueSystem {
  constructor(state, inventory) {
    this.state = state;
    this.inventory = inventory;
  }

  resolve(npc) {
    const visits = this.state.npcStates[npc.id]?.conversations || 0;
    const line = npc.dialogue.find(entry => entry.conditions.every(condition => this.matches(condition, visits))) || npc.dialogue[npc.dialogue.length - 1];
    this.state.npcStates[npc.id] = { conversations: visits + 1, lastSpokenAt: Date.now() };
    return line.text;
  }

  matches(condition, visits) {
    switch (condition.type) {
      case 'playerLevelAtLeast': return this.state.player.level >= condition.value;
      case 'hasItemTag': return this.inventory.hasTag(condition.value);
      case 'worldFlag': return this.state.worldFlags[condition.key] === condition.value;
      case 'questState': return this.state.quests[condition.questId]?.state === condition.value;
      case 'npcConversationAtLeast':
      case 'previousConversationAtLeast': return visits >= condition.value;
      case 'equippedRarityAtLeast': {
        const target = RARITY[condition.value]?.rank ?? 99;
        return Object.values(this.state.equipment).some(id => {
          const item = this.inventory.get(id);
          return item && (RARITY[item.rarity]?.rank ?? -1) >= target;
        });
      }
      case 'hasItem': return this.state.inventory.some(item => item.itemId === condition.value && ITEM_DEFS[item.itemId]);
      default: return false;
    }
  }
}

