export const SKILL_DEFS = Object.freeze({
  skill_ember_cleave: Object.freeze({
    id: 'skill_ember_cleave', name: 'Ember Cleave', shortName: 'Cleave', icon: 'I', unlockLevel: 1, maxRank: 5,
    essenceCost: 8, cooldownMs: 4000, castMs: 420, triggerAt: 0.48, animation: 'slash',
    type: 'cone_melee', damageType: 'fire', damageMultiplier: 1.35, range: 132, arcDegrees: 126,
    status: Object.freeze({ id: 'burn', chance: 0.45 }), fx: 'ember_cleave', sfx: 'ember_cleave',
    rankGrowth: Object.freeze({ damageMultiplier: 0.07, range: 5, arcDegrees: 2, statusChance: 0.04 })
  }),
  skill_ashen_guard: Object.freeze({
    id: 'skill_ashen_guard', name: 'Ashen Guard', shortName: 'Guard', icon: 'II', unlockLevel: 3, maxRank: 5,
    essenceCost: 12, cooldownMs: 12000, durationMs: 5000, castMs: 520, triggerAt: 0.56, animation: 'spellcast',
    type: 'self_buff', status: Object.freeze({ id: 'guard', chance: 1 }), fx: 'ashen_guard', sfx: 'guard',
    rankGrowth: Object.freeze({ durationMs: 450, cooldownMs: -250 })
  }),
  skill_ruin_pulse: Object.freeze({
    id: 'skill_ruin_pulse', name: 'Ruin Pulse', shortName: 'Pulse', icon: 'III', unlockLevel: 5, maxRank: 5,
    essenceCost: 14, cooldownMs: 8000, castMs: 650, triggerAt: 0.62, animation: 'spellcast',
    type: 'radial_aoe', damageType: 'shadow', damageMultiplier: 1.18, radius: 110, knockback: 260,
    status: Object.freeze({ id: 'stagger', chance: 1 }), fx: 'ruin_pulse', sfx: 'ruin_pulse',
    rankGrowth: Object.freeze({ damageMultiplier: 0.08, radius: 3, knockback: 14 })
  })
});

export const DEFAULT_SKILL_SLOTS = Object.freeze(['skill_ember_cleave', null, null]);

export function unlockedSkillIdsForLevel(level) {
  return Object.values(SKILL_DEFS).filter(skill => level >= skill.unlockLevel).sort((a, b) => a.unlockLevel - b.unlockLevel).map(skill => skill.id);
}

export function skillRank(state, id) {
  const def = SKILL_DEFS[id];
  if (!def) return 0;
  const raw = Number(state?.skills?.ranks?.[id]);
  return Math.max(1, Math.min(def.maxRank || 1, Number.isFinite(raw) ? Math.floor(raw) : 1));
}


export function resolvedSkillDef(state, id) {
  const def = SKILL_DEFS[id];
  if (!def) return null;
  const rank = skillRank(state, id);
  const steps = Math.max(0, rank - 1);
  if (!steps || !def.rankGrowth) return def;
  const out = { ...def };
  for (const [key, perRank] of Object.entries(def.rankGrowth)) {
    if (key === 'statusChance') continue;
    if (typeof out[key] === 'number') out[key] += perRank * steps;
  }
  if (def.status && typeof def.rankGrowth.statusChance === 'number') {
    out.status = { ...def.status, chance: Math.min(1, (def.status.chance ?? 1) + def.rankGrowth.statusChance * steps) };
  }
  return out;
}

export function normalizeSkillState(state) {
  const incoming = state?.skills || {};
  const unlocked = new Set(Array.isArray(incoming.unlocked) ? incoming.unlocked.filter(id => SKILL_DEFS[id]) : []);
  for (const id of unlockedSkillIdsForLevel(state?.player?.level || 1)) unlocked.add(id);
  const slots = Array.isArray(incoming.slots) ? incoming.slots.slice(0, 3) : [...DEFAULT_SKILL_SLOTS];
  while (slots.length < 3) slots.push(null);
  for (let i = 0; i < slots.length; i += 1) if (!slots[i] || !unlocked.has(slots[i]) || !SKILL_DEFS[slots[i]]) slots[i] = null;
  for (const id of [...unlocked].sort((a, b) => SKILL_DEFS[a].unlockLevel - SKILL_DEFS[b].unlockLevel)) {
    if (slots.includes(id)) continue;
    const open = slots.indexOf(null);
    if (open >= 0) slots[open] = id;
  }
  const ranks = {};
  const incomingRanks = incoming.ranks && typeof incoming.ranks === 'object' && !Array.isArray(incoming.ranks) ? incoming.ranks : {};
  for (const id of unlocked) {
    const def = SKILL_DEFS[id];
    const raw = Number(incomingRanks[id]);
    ranks[id] = Math.max(1, Math.min(def.maxRank || 1, Number.isFinite(raw) ? Math.floor(raw) : 1));
  }
  state.skills = { unlocked: [...unlocked], slots, ranks };
  return state.skills;
}
