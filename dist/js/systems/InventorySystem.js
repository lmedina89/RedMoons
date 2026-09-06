import { RARITY } from '../config.js';
import { ITEM_DEFS, MODIFIER_POOL } from '../data/items.js';

export class InventorySystem {
  constructor(state) { this.state = state; }

  createItem(itemId, rarity = 'normal') {
    const safeRarity = RARITY[rarity] && !RARITY[rarity].future ? rarity : 'normal';
    const instance = {
      instanceId: `i_${String(this.state.nextItemSequence++).padStart(6, '0')}`,
      itemId,
      rarity: safeRarity,
      enhancement: 0,
      modifiers: {}
    };
    const rolls = RARITY[safeRarity].modifierRolls;
    const used = new Set();
    for (let i = 0; i < rolls; i += 1) {
      let modifier = MODIFIER_POOL[Math.floor(Math.random() * MODIFIER_POOL.length)];
      let guard = 0;
      while (used.has(modifier.id) && guard++ < 10) modifier = MODIFIER_POOL[Math.floor(Math.random() * MODIFIER_POOL.length)];
      used.add(modifier.id);
      const value = modifier.min + Math.floor(Math.random() * (modifier.max - modifier.min + 1));
      instance.modifiers[modifier.stat] = (instance.modifiers[modifier.stat] || 0) + value;
    }
    return instance;
  }

  add(item) {
    if (this.state.inventory.length >= 30) return false;
    this.state.inventory.push(item);
    return true;
  }

  countItem(itemId) { return this.state.inventory.filter(item => item.itemId === itemId).length; }
  hasTag(tag) { return this.state.inventory.some(item => ITEM_DEFS[item.itemId]?.tags?.includes(tag)); }
  get(instanceId) { return this.state.inventory.find(item => item.instanceId === instanceId) || null; }

  canEquip(instance) {
    const def = instance && ITEM_DEFS[instance.itemId];
    if (!def?.slot) return { ok: false, reason: 'This item cannot be equipped.' };
    if (this.state.player.level < (def.levelReq || 1)) return { ok: false, reason: `Requires level ${def.levelReq}.` };
    for (const [stat, needed] of Object.entries(def.requirements || {})) {
      if ((this.state.player.stats[stat] || 0) < needed) return { ok: false, reason: `Requires ${stat.toUpperCase()} ${needed}.` };
    }
    return { ok: true, reason: '' };
  }

  equip(instanceId) {
    const instance = this.get(instanceId);
    const check = this.canEquip(instance);
    if (!check.ok) return check;
    const def = ITEM_DEFS[instance.itemId];
    this.state.equipment[def.slot] = instanceId;
    return { ok: true, reason: '' };
  }

  unequip(slot) {
    if (!(slot in this.state.equipment)) return false;
    this.state.equipment[slot] = null;
    return true;
  }

  removeItem(itemId, count = 1) {
    let remaining = count;
    for (let i = this.state.inventory.length - 1; i >= 0 && remaining > 0; i -= 1) {
      const item = this.state.inventory[i];
      if (item.itemId !== itemId) continue;
      if (Object.values(this.state.equipment).includes(item.instanceId)) continue;
      this.state.inventory.splice(i, 1);
      remaining -= 1;
    }
    return remaining === 0;
  }
}

export function pickRarity(weights) {
  let roll = Math.random();
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return Object.keys(weights)[0] || 'normal';
}
