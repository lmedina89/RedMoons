import { ITEM_DEFS } from '../data/items.js';

export const xpForLevel = level => Math.floor(70 * level * level + 30 * level);

export function equipmentBonuses(state) {
  const totals = { attack: 0, defense: 0, maxHp: 0, maxEssence: 0, str: 0, dex: 0, vit: 0, spr: 0 };
  const byId = new Map(state.inventory.map(item => [item.instanceId, item]));
  for (const instanceId of Object.values(state.equipment)) {
    if (!instanceId) continue;
    const item = byId.get(instanceId);
    const def = item && ITEM_DEFS[item.itemId];
    if (!def) continue;
    for (const [key, value] of Object.entries(def.baseStats || {})) totals[key] = (totals[key] || 0) + value;
    for (const [key, value] of Object.entries(item.modifiers || {})) totals[key] = (totals[key] || 0) + value;
  }
  return totals;
}

export function derivedStats(state) {
  const gear = equipmentBonuses(state);
  const stats = state.player.stats;
  const str = stats.str + gear.str;
  const dex = stats.dex + gear.dex;
  const vit = stats.vit + gear.vit;
  const spr = stats.spr + gear.spr;
  return {
    str, dex, vit, spr,
    maxHp: Math.floor(54 + vit * 9 + state.player.level * 6 + gear.maxHp),
    maxEssence: Math.floor(21 + spr * 6 + state.player.level * 3 + gear.maxEssence),
    attack: Math.floor(3 + str * 1.75 + dex * 0.45 + gear.attack),
    defense: Math.floor(1 + vit * 0.65 + dex * 0.18 + gear.defense),
    moveSpeed: 142 + Math.min(26, dex * 1.2)
  };
}

export function grantXp(state, amount) {
  if (state.player.level >= 10) return { levels: 0, capped: true };
  state.player.xp += amount;
  let levels = 0;
  while (state.player.level < 10) {
    const needed = xpForLevel(state.player.level);
    if (state.player.xp < needed) break;
    state.player.xp -= needed;
    state.player.level += 1;
    state.player.unspentStatPoints += 5;
    state.player.unspentSkillPoints += 1;
    levels += 1;
  }
  const derived = derivedStats(state);
  state.player.hp = Math.min(derived.maxHp, state.player.hp + levels * 28);
  state.player.essence = Math.min(derived.maxEssence, state.player.essence + levels * 16);
  return { levels, capped: state.player.level >= 10 };
}

