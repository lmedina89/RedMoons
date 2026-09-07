import { RARITY } from '../config.js';
import { ITEM_DEFS, MODIFIER_POOL } from '../data/items.js';

export class InventorySystem {
  constructor(state) { this.state = state; }

  nextInstanceId() { return `i_${String(this.state.nextItemSequence++).padStart(6, '0')}`; }

  createItem(itemId, rarity = 'normal', quantity = 1) {
    const def = ITEM_DEFS[itemId];
    const safeRarity = RARITY[rarity] && !RARITY[rarity].future ? rarity : 'normal';
    const instance = {
      instanceId: this.nextInstanceId(),
      itemId,
      rarity: safeRarity,
      enhancement: 0,
      modifiers: {},
      quantity: Math.max(1, Math.floor(quantity || 1))
    };
    // Consumables/quest objects do not roll equipment affixes merely because
    // they happen to exist as inventory instances.
    const rolls = def?.slot ? RARITY[safeRarity].modifierRolls : 0;
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
    const def = item && ITEM_DEFS[item.itemId];
    if (!item || !def) return false;
    const max = Math.max(1, Math.floor(def.stackMax || 1));
    let remaining = Math.max(1, Math.floor(item.quantity || 1));
    if (max <= 1) {
      if (this.state.inventory.length >= 30) return false;
      item.quantity = 1;
      this.state.inventory.push(item);
      return true;
    }

    const matching = this.state.inventory.filter(existing => existing.itemId === item.itemId && existing.rarity === item.rarity && (existing.quantity || 1) < max);
    const existingCapacity = matching.reduce((sum, existing) => sum + (max - (existing.quantity || 1)), 0);
    const neededNewStacks = Math.max(0, Math.ceil((remaining - existingCapacity) / max));
    if (this.state.inventory.length + neededNewStacks > 30) return false;

    for (const existing of matching) {
      if (remaining <= 0) break;
      const add = Math.min(remaining, max - (existing.quantity || 1));
      existing.quantity = (existing.quantity || 1) + add;
      remaining -= add;
    }
    let first = true;
    while (remaining > 0) {
      const quantity = Math.min(max, remaining);
      this.state.inventory.push({ ...item, instanceId: first ? item.instanceId : this.nextInstanceId(), modifiers: { ...(item.modifiers || {}) }, quantity });
      first = false;
      remaining -= quantity;
    }
    return true;
  }

  countItem(itemId) { return this.state.inventory.filter(item => item.itemId === itemId).reduce((sum, item) => sum + Math.max(1, Math.floor(item.quantity || 1)), 0); }
  hasTag(tag) { return this.state.inventory.some(item => ITEM_DEFS[item.itemId]?.tags?.includes(tag)); }
  get(instanceId) { return this.state.inventory.find(item => item.instanceId === instanceId) || null; }

  canEquip(instance) {
    const def = instance && ITEM_DEFS[instance.itemId];
    if (!def?.slot) return { ok: false, reason: 'This item cannot be equipped.' };
    if (def.npcOnly || def.playerEquipReady === false || (def.slot === 'weapon' && def.playerCombatReady === false)) return { ok: false, reason: 'NPC / legacy gear: this asset does not support the full player combat moveset.' };
    if (def.equipGate && !this.state.worldFlags?.[def.equipGate]) return { ok: false, reason: `${def.gateLabel || 'This equipment tier'} is not unlocked yet.` };
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
    for (const slot of Object.keys(this.state.equipment)) {
      if (this.state.equipment[slot] === instanceId) this.state.equipment[slot] = null;
    }
    this.state.equipment[def.slot] = instanceId;
    return { ok: true, reason: '' };
  }

  unequip(slot) {
    if (!(slot in this.state.equipment)) return false;
    this.state.equipment[slot] = null;
    return true;
  }

  consumeOne(instanceId) {
    const index = this.state.inventory.findIndex(item => item.instanceId === instanceId);
    if (index < 0) return false;
    const item = this.state.inventory[index];
    if ((item.quantity || 1) > 1) item.quantity = (item.quantity || 1) - 1;
    else this.state.inventory.splice(index, 1);
    return true;
  }

  removeInstance(instanceId, { allowQuest = false } = {}) {
    const index = this.state.inventory.findIndex(item => item.instanceId === instanceId);
    if (index < 0) return { ok: false, reason: 'Item not found.', item: null, unequippedSlots: [] };
    const item = this.state.inventory[index];
    const def = ITEM_DEFS[item.itemId];
    if (def?.questItem && !allowQuest) return { ok: false, reason: 'Quest items are protected so story progress cannot be lost.', item: null, unequippedSlots: [] };
    const unequippedSlots = [];
    for (const [slot, equippedId] of Object.entries(this.state.equipment)) {
      if (equippedId !== instanceId) continue;
      this.state.equipment[slot] = null;
      unequippedSlots.push(slot);
    }
    this.state.inventory.splice(index, 1);
    return { ok: true, reason: '', item, unequippedSlots };
  }

  removeItem(itemId, count = 1) {
    let remaining = Math.max(0, Math.floor(count));
    for (let i = this.state.inventory.length - 1; i >= 0 && remaining > 0; i -= 1) {
      const item = this.state.inventory[i];
      if (item.itemId !== itemId) continue;
      if (Object.values(this.state.equipment).includes(item.instanceId)) continue;
      const quantity = Math.max(1, Math.floor(item.quantity || 1));
      if (quantity > remaining) {
        item.quantity = quantity - remaining;
        remaining = 0;
      } else {
        this.state.inventory.splice(i, 1);
        remaining -= quantity;
      }
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
