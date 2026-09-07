import { derivedStats } from './StatsSystem.js';

export class CombatResolver {
  constructor(scene, state, damageNumbers, fx, audio, callbacks = {}) {
    this.scene = scene;
    this.state = state;
    this.damageNumbers = damageNumbers;
    this.fx = fx;
    this.audio = audio;
    this.statuses = null;
    this.callbacks = callbacks;
  }

  setStatusController(statuses) { this.statuses = statuses; }

  resistanceFor(target, type) {
    if (!type || type === 'physical') return 0;
    if (target?.def?.resistances && Number.isFinite(target.def.resistances[type])) return target.def.resistances[type];
    return 0;
  }

  playerPower() { return derivedStats(this.state).attack; }

  resolveAmount(base, target, type = 'physical', options = {}) {
    const defense = target === options.player ? derivedStats(this.state).defense : (target?.def?.defense || 0);
    const armorFactor = type === 'physical' ? 0.45 : 0.15;
    const resist = Math.max(-0.5, Math.min(0.85, this.resistanceFor(target, type)));
    let amount = Math.max(1, base - defense * armorFactor);
    amount *= 1 - resist;
    if (this.statuses) amount *= this.statuses.damageTakenMultiplier(target);
    const critChance = Math.max(0, Math.min(0.5, options.critChance || 0));
    const critical = Math.random() < critChance;
    if (critical) amount *= options.critMultiplier || 1.5;
    return { amount: Math.max(1, Math.floor(amount + Math.random() * 2.2)), critical };
  }

  damageEnemy(enemy, base, options = {}) {
    if (!enemy?.sprite?.active) return 0;
    const type = options.type || 'physical';
    const result = this.resolveAmount(base, enemy, type, options);
    const applied = enemy.takeResolvedDamage(result.amount, options.sourceX ?? 0, options.sourceY ?? 0, this.scene.time.now, { knockback: options.knockback || 0, stagger: options.stagger || false });
    if (!applied) return 0;
    this.damageNumbers.show(enemy.sprite.x, enemy.sprite.y - 38, result.amount, false, result.critical);
    this.fx.impact(options.impact || type, enemy.sprite.x, enemy.sprite.y - 12);
    this.audio.play('hit', { throttleMs: 35 });
    this.callbacks.enemyDamaged?.(result.amount, enemy, options);
    return result.amount;
  }

  damagePlayer(player, base, options = {}) {
    if (!player || player.dead) return 0;
    const type = options.type || 'physical';
    const result = this.resolveAmount(base, player, type, { ...options, player });
    const applied = player.takeResolvedDamage(result.amount, this.scene.time.now, options);
    if (!applied) return 0;
    this.damageNumbers.show(player.body.x, player.body.y - 40, result.amount, true, result.critical);
    this.fx.impact(options.impact || type, player.body.x, player.body.y - 14);
    this.audio.play('hit', { throttleMs: 35 });
    this.callbacks.playerDamaged?.(result.amount, options);
    return result.amount;
  }
}
