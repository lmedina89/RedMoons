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
    const defense = target?.isPlayer ? derivedStats(this.state).defense : (target?.def?.defense || 0);
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
    if (!enemy?.sprite?.active || enemy.state === 'dying') return 0;
    const type = options.type || 'physical';
    const result = this.resolveAmount(base, enemy, type, options);
    // Record attribution before takeResolvedDamage(): a lethal hit invokes the
    // enemy death callback synchronously, and reward eligibility must already
    // know whether that killing blow came from the player or an ally.
    enemy.recordDamageContribution?.(options.sourceTeam || 'player', result.amount, this.scene.time.now);
    const applied = enemy.takeResolvedDamage(result.amount, options.sourceX ?? 0, options.sourceY ?? 0, this.scene.time.now, {
      knockback: options.knockback || 0,
      stagger: options.stagger || false
    });
    if (!applied) return 0;
    this.damageNumbers.show(enemy.sprite.x, enemy.sprite.y - 38, result.amount, false, result.critical);
    this.fx.impact(options.impact || type, enemy.sprite.x, enemy.sprite.y - 12);
    this.audio.play(options.impact === 'celestial' || type === 'celestial' ? 'celestial_strike' : 'hit', { throttleMs: 35 });
    this.callbacks.enemyDamaged?.(result.amount, enemy, options);
    return result.amount;
  }

  damagePlayer(player, base, options = {}) {
    // ?debug=1 God Mode is a spectator safety layer for battle observation.
    // It never enters save data and only suppresses player damage in-memory.
    if (this.scene?.debugGodMode === true) return 0;
    if (!player || player.dead) return 0;
    const type = options.type || 'physical';
    const result = this.resolveAmount(base, player, type, options);
    const applied = player.takeResolvedDamage(result.amount, this.scene.time.now, options);
    if (!applied) return 0;
    this.damageNumbers.show(player.body.x, player.body.y - 40, result.amount, true, result.critical);
    this.fx.impact(options.impact || type, player.body.x, player.body.y - 14);
    this.audio.play('hit', { throttleMs: 35 });
    this.callbacks.playerDamaged?.(result.amount, options);
    return result.amount;
  }

  damageFriendly(actor, base, options = {}) {
    if (!actor || actor.dead || actor.sprite?.active === false) return 0;
    const type = options.type || 'physical';
    const result = this.resolveAmount(base, actor, type, options);
    const applied = actor.takeResolvedDamage?.(result.amount, options.sourceX ?? 0, options.sourceY ?? 0, this.scene.time.now, options);
    if (!applied) return 0;
    const node = actor.body || actor.sprite;
    this.damageNumbers.show(node.x, node.y - 48, result.amount, true, result.critical);
    this.fx.impact(options.impact || type, node.x, node.y - 16);
    this.audio.play('hit', { throttleMs: 35 });
    this.callbacks.friendlyDamaged?.(result.amount, actor, options);
    return result.amount;
  }

  damageTarget(target, base, options = {}) {
    if (target?.isPlayer) return this.damagePlayer(target, base, options);
    if (target?.isFriendlyActor) return this.damageFriendly(target, base, options);
    return this.damageEnemy(target, base, options);
  }
}
