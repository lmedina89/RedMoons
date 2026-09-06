import { QUEST_DEFS } from '../data/quests.js';

export class QuestSystem {
  constructor(state, inventory, onReward) {
    this.state = state;
    this.inventory = inventory;
    this.onReward = onReward;
  }

  get(id) { return this.state.quests[id]; }

  accept(id) {
    const quest = this.get(id);
    if (!quest || quest.state !== 'available') return false;
    quest.state = 'active';
    for (const objective of QUEST_DEFS[id].objectives) {
      if (objective.type === 'collectItem') quest.objectives[objective.id] = Math.min(objective.required, this.inventory.countItem(objective.targetId));
    }
    this.refresh(id);
    return true;
  }

  recordKill(enemyDef) {
    for (const [id, quest] of Object.entries(this.state.quests)) {
      if (quest.state !== 'active') continue;
      for (const objective of QUEST_DEFS[id].objectives) {
        const match = (objective.type === 'killFamily' && objective.targetId === enemyDef.family) || (objective.type === 'killEnemy' && objective.targetId === enemyDef.id);
        if (match) quest.objectives[objective.id] = Math.min(objective.required, (quest.objectives[objective.id] || 0) + 1);
      }
      this.refresh(id);
    }
  }

  recordCollect(itemId) {
    for (const [id, quest] of Object.entries(this.state.quests)) {
      if (quest.state !== 'active') continue;
      for (const objective of QUEST_DEFS[id].objectives) {
        if (objective.type === 'collectItem' && objective.targetId === itemId) quest.objectives[objective.id] = Math.min(objective.required, this.inventory.countItem(itemId));
      }
      this.refresh(id);
    }
  }

  refresh(id) {
    const quest = this.get(id);
    const def = QUEST_DEFS[id];
    if (!quest || quest.state !== 'active') return;
    const done = def.objectives.every(objective => (quest.objectives[objective.id] || 0) >= objective.required);
    if (done) quest.state = 'ready';
  }

  turnIn(id) {
    const quest = this.get(id);
    const def = QUEST_DEFS[id];
    if (!quest || quest.state !== 'ready') return false;
    for (const objective of def.objectives) {
      if (objective.type === 'collectItem') this.inventory.removeItem(objective.targetId, objective.required);
    }
    quest.state = 'complete';
    this.state.worldFlags[def.completionFlag] = true;
    if (def.nextQuest && this.state.quests[def.nextQuest]?.state === 'locked') this.state.quests[def.nextQuest].state = 'available';
    this.onReward(def.rewards, def.name);
    return true;
  }

  activeSummary() {
    return Object.entries(this.state.quests).filter(([, q]) => ['active', 'ready'].includes(q.state)).map(([id, q]) => {
      const def = QUEST_DEFS[id];
      const progress = def.objectives.map(o => `${Math.min(o.required, q.objectives[o.id] || 0)}/${o.required}`).join(', ');
      return { id, name: def.name, summary: def.summary, progress, ready: q.state === 'ready' };
    });
  }
}
