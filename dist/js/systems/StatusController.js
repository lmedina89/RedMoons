import { STATUS_DEFS } from '../data/statuses.js';

export class StatusController {
  constructor(scene, resolver, fx) {
    this.scene = scene;
    this.resolver = resolver;
    this.fx = fx;
    this.byTarget = new Map();
    this.staggerImmuneUntil = new WeakMap();
  }

  bucket(target) {
    if (!this.byTarget.has(target)) this.byTarget.set(target, new Map());
    return this.byTarget.get(target);
  }

  apply(target, statusId, source = {}, options = {}) {
    const def = STATUS_DEFS[statusId];
    if (!target || !def) return false;
    const now = this.scene.time.now;
    if (statusId === 'stagger' && now < (this.staggerImmuneUntil.get(target) || 0)) return false;
    if (statusId === 'stagger') {
      const resistance = [...(this.byTarget.get(target)?.values() || [])].reduce((best, effect) => Math.max(best, effect.def.staggerResistance || 0), 0);
      if (resistance > 0 && Math.random() < resistance) return false;
    }
    const bucket = this.bucket(target);
    const current = bucket.get(statusId);
    if (current && !def.refresh && (def.maxStacks || 1) <= current.stacks) return false;
    const stacks = Math.min(def.maxStacks || 1, current ? current.stacks + (statusId === 'poison' ? 1 : 0) : 1);
    const durationMs = options.durationMs || def.durationMs;
    bucket.set(statusId, {
      id: statusId, def, stacks, source,
      endsAt: now + durationMs,
      nextTickAt: current?.nextTickAt || (def.tickMs ? now + def.tickMs : Infinity)
    });
    if (statusId === 'stagger') this.staggerImmuneUntil.set(target, now + durationMs + (def.immunityMs || 0));
    this.fx.burst(target.body?.x ?? target.sprite?.x ?? 0, (target.body?.y ?? target.sprite?.y ?? 0) - 16, statusId === 'guard' ? 'guard' : statusId === 'slow' ? 'blueflame' : statusId === 'burn' ? 'fire' : statusId === 'poison' ? 'poison' : 'physical', 0.65);
    return true;
  }

  has(target, id) { return Boolean(this.byTarget.get(target)?.get(id)); }
  actionLocked(target) { return [...(this.byTarget.get(target)?.values() || [])].some(effect => effect.def.actionLocked); }
  moveMultiplier(target) { return [...(this.byTarget.get(target)?.values() || [])].reduce((m, effect) => m * (effect.def.moveMultiplier || 1), 1); }
  damageTakenMultiplier(target) { return [...(this.byTarget.get(target)?.values() || [])].reduce((m, effect) => m * (effect.def.damageTakenMultiplier || 1), 1); }

  update(time) {
    for (const [target, bucket] of [...this.byTarget.entries()]) {
      if ((target.dead === true) || (target.sprite && !target.sprite.active && target.state === 'dead')) { this.byTarget.delete(target); continue; }
      for (const [id, effect] of [...bucket.entries()]) {
        if (effect.def.tickMs && time >= effect.nextTickAt) {
          while (time >= effect.nextTickAt && effect.nextTickAt < effect.endsAt) {
            const sourcePower = Number(effect.source.power) || 0;
            const base = (effect.def.flatDamage || 0) + sourcePower * (effect.def.powerScale || 0);
            if (target.body) this.resolver.damagePlayer(target, base * effect.stacks, { type: effect.def.damageType, sourceX: effect.source.x, sourceY: effect.source.y, impact: id === 'burn' ? 'fire' : 'poison' });
            else this.resolver.damageEnemy(target, base * effect.stacks, { type: effect.def.damageType, sourceX: effect.source.x, sourceY: effect.source.y, impact: id === 'burn' ? 'fire' : 'poison' });
            effect.nextTickAt += effect.def.tickMs;
          }
        }
        if (time >= effect.endsAt) bucket.delete(id);
      }
      if (!bucket.size) this.byTarget.delete(target);
    }
  }

  snapshot(target, time = this.scene.time.now) {
    return [...(this.byTarget.get(target)?.values() || [])].map(effect => ({
      id: effect.id, name: effect.def.name, kind: effect.def.kind, stacks: effect.stacks,
      remainingMs: Math.max(0, effect.endsAt - time)
    }));
  }

  clear(target) { this.byTarget.delete(target); }
}
