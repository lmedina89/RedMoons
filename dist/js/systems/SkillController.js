import { SKILL_DEFS, normalizeSkillState, skillRank, resolvedSkillDef } from '../data/skills.js';
import { derivedStats } from './StatsSystem.js';

export class SkillController {
  constructor(scene, state, player, combat, statuses, fx, audio, events) {
    this.scene = scene;
    this.state = state;
    this.player = player;
    this.combat = combat;
    this.statuses = statuses;
    this.fx = fx;
    this.audio = audio;
    this.events = events;
    this.cooldowns = new Map();
    normalizeSkillState(state);
  }

  syncUnlocks(announce = false) {
    const before = new Set(this.state.skills?.unlocked || []);
    normalizeSkillState(this.state);
    if (announce) {
      for (const id of this.state.skills.unlocked) if (!before.has(id)) this.events.emit('toast', { text: `Skill unlocked: ${SKILL_DEFS[id].name}`, tone: 'level' });
    }
  }

  canUse(id, time = this.scene.time.now) {
    const def = resolvedSkillDef(this.state, id);
    if (!def || !this.state.skills.unlocked.includes(id)) return { ok: false, reason: 'Locked' };
    if (this.player.dead) return { ok: false, reason: 'Fallen' };
    if (typeof window !== 'undefined' && window.__ashfallUiBlocked) return { ok: false, reason: 'Unavailable' };
    if (this.player.isBusy()) return { ok: false, reason: 'Busy' };
    if (this.statuses.actionLocked(this.player)) return { ok: false, reason: 'Staggered' };
    const readyAt = this.cooldowns.get(id) || 0;
    if (time < readyAt) return { ok: false, reason: 'Cooling down' };
    if (this.state.player.essence < def.essenceCost) return { ok: false, reason: 'Not enough Essence' };
    return { ok: true };
  }

  useSlot(slot) {
    const id = this.state.skills.slots[slot];
    if (!id) { this.audio.play('denied'); return false; }
    return this.use(id);
  }

  use(id) {
    const time = this.scene.time.now;
    const check = this.canUse(id, time);
    const def = resolvedSkillDef(this.state, id);
    if (!check.ok) {
      this.audio.play('denied', { throttleMs: 180 });
      this.events.emit('toast', { text: `${def?.name || 'Skill'}: ${check.reason}.`, tone: 'muted', short: true, cooldownMs: 750 });
      return false;
    }
    const began = this.player.beginSkill(def, time, skill => this.trigger(skill));
    if (!began) return false;
    this.state.player.essence -= def.essenceCost;
    this.cooldowns.set(id, time + def.cooldownMs);
    this.audio.play(def.sfx || 'sword');
    return true;
  }

  trigger(def) {
    const p = this.player.body;
    const facing = [[0, -1], [-1, 0], [0, 1], [1, 0]][this.player.visual.direction];
    this.fx.skill(def.id, p.x, p.y, facing, def);
    if (def.type === 'cone_melee') {
      this.combat.playerCone(def, facing);
    } else if (def.type === 'self_buff') {
      if (def.status) this.statuses.apply(this.player, def.status.id, { power: derivedStats(this.state).attack, x: p.x, y: p.y }, { durationMs: def.durationMs });
    } else if (def.type === 'radial_aoe') {
      this.combat.playerRadial(def);
    }
  }

  snapshot(time = this.scene.time.now) {
    normalizeSkillState(this.state);
    return this.state.skills.slots.map((id, slot) => {
      const def = id ? resolvedSkillDef(this.state, id) : null;
      const readyAt = id ? (this.cooldowns.get(id) || 0) : 0;
      return {
        slot, id, name: def?.name || 'Empty', shortName: def?.shortName || 'Empty', icon: def?.icon || String(slot + 1),
        unlocked: Boolean(def && this.state.skills.unlocked.includes(id)), essenceCost: def?.essenceCost || 0,
        rank: id ? skillRank(this.state, id) : 0, maxRank: def?.maxRank || 0,
        cooldownMs: def?.cooldownMs || 0, remainingMs: Math.max(0, readyAt - time), ready: Boolean(def && time >= readyAt && this.state.player.essence >= def.essenceCost)
      };
    });
  }

  resetCooldowns() { this.cooldowns.clear(); }
  refillAndUnlock() {
    this.state.player.level = Math.max(this.state.player.level, 5);
    this.syncUnlocks(false);
    const derived = derivedStats(this.state);
    this.state.player.essence = derived.maxEssence;
    this.state.player.hp = derived.maxHp;
    this.resetCooldowns();
  }
}
