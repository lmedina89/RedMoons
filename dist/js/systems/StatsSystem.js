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

function calculateDerived(level, primary, direct = {}) {
  return {
    maxHp: Math.floor(54 + primary.vit * 9 + level * 6 + (direct.maxHp || 0)),
    maxEssence: Math.floor(21 + primary.spr * 6 + level * 3 + (direct.maxEssence || 0)),
    attack: Math.floor(3 + primary.str * 1.75 + primary.dex * 0.45 + (direct.attack || 0)),
    defense: Math.floor(1 + primary.vit * 0.65 + primary.dex * 0.18 + (direct.defense || 0)),
    moveSpeed: 142 + Math.min(26, primary.dex * 1.2)
  };
}

export function statBreakdown(state) {
  const gear = equipmentBonuses(state);
  const basePrimary = { ...state.player.stats };
  const totalPrimary = {
    str: basePrimary.str + gear.str,
    dex: basePrimary.dex + gear.dex,
    vit: basePrimary.vit + gear.vit,
    spr: basePrimary.spr + gear.spr
  };
  const baseDerived = calculateDerived(state.player.level, basePrimary);
  const totalDerived = calculateDerived(state.player.level, totalPrimary, gear);
  const gearImpact = Object.fromEntries(Object.keys(totalDerived).map(key => [key, totalDerived[key] - baseDerived[key]]));
  return { gear, basePrimary, totalPrimary, baseDerived, totalDerived, gearImpact };
}

export function derivedStats(state) {
  return statBreakdown(state).totalDerived;
}

export function previewDerivedStats(state, pending = {}) {
  const gear = equipmentBonuses(state);
  const primary = {
    str: state.player.stats.str + gear.str + (pending.str || 0),
    dex: state.player.stats.dex + gear.dex + (pending.dex || 0),
    vit: state.player.stats.vit + gear.vit + (pending.vit || 0),
    spr: state.player.stats.spr + gear.spr + (pending.spr || 0)
  };
  return calculateDerived(state.player.level, primary, gear);
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
