export const SKILL_DEFS = Object.freeze({
  skill_ember_cleave: Object.freeze({
    id: 'skill_ember_cleave', name: 'Ember Cleave', shortName: 'Cleave', icon: 'I', unlockLevel: 1,
    essenceCost: 8, cooldownMs: 4000, castMs: 420, triggerAt: 0.48, animation: 'slash',
    type: 'cone_melee', damageType: 'fire', damageMultiplier: 1.35, range: 108, arcDegrees: 112,
    status: Object.freeze({ id: 'burn', chance: 0.45 }), fx: 'ember_cleave', sfx: 'ember_cleave'
  }),
  skill_ashen_guard: Object.freeze({
    id: 'skill_ashen_guard', name: 'Ashen Guard', shortName: 'Guard', icon: 'II', unlockLevel: 3,
    essenceCost: 12, cooldownMs: 12000, castMs: 520, triggerAt: 0.56, animation: 'spellcast',
    type: 'self_buff', status: Object.freeze({ id: 'guard', chance: 1 }), fx: 'ashen_guard', sfx: 'guard'
  }),
  skill_ruin_pulse: Object.freeze({
    id: 'skill_ruin_pulse', name: 'Ruin Pulse', shortName: 'Pulse', icon: 'III', unlockLevel: 5,
    essenceCost: 14, cooldownMs: 8000, castMs: 650, triggerAt: 0.62, animation: 'spellcast',
    type: 'radial_aoe', damageType: 'shadow', damageMultiplier: 1.05, radius: 104, knockback: 210,
    status: Object.freeze({ id: 'stagger', chance: 1 }), fx: 'ruin_pulse', sfx: 'ruin_pulse'
  })
});

export const DEFAULT_SKILL_SLOTS = Object.freeze(['skill_ember_cleave', null, null]);

export function unlockedSkillIdsForLevel(level) {
  return Object.values(SKILL_DEFS).filter(skill => level >= skill.unlockLevel).sort((a, b) => a.unlockLevel - b.unlockLevel).map(skill => skill.id);
}

export function normalizeSkillState(state) {
  const unlocked = new Set(Array.isArray(state?.skills?.unlocked) ? state.skills.unlocked.filter(id => SKILL_DEFS[id]) : []);
  for (const id of unlockedSkillIdsForLevel(state?.player?.level || 1)) unlocked.add(id);
  const slots = Array.isArray(state?.skills?.slots) ? state.skills.slots.slice(0, 3) : [...DEFAULT_SKILL_SLOTS];
  while (slots.length < 3) slots.push(null);
  for (let i = 0; i < slots.length; i += 1) if (!slots[i] || !unlocked.has(slots[i]) || !SKILL_DEFS[slots[i]]) slots[i] = null;
  for (const id of [...unlocked].sort((a, b) => SKILL_DEFS[a].unlockLevel - SKILL_DEFS[b].unlockLevel)) {
    if (slots.includes(id)) continue;
    const open = slots.indexOf(null);
    if (open >= 0) slots[open] = id;
  }
  state.skills = { unlocked: [...unlocked], slots };
  return state.skills;
}
