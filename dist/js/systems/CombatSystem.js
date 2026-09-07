import { derivedStats } from './StatsSystem.js';
import { CombatResolver } from './CombatResolver.js';
import { StatusController } from './StatusController.js';
import { ProjectileManager } from './ProjectileManager.js';
import { FxManager } from './FxManager.js';
import { AudioManager } from './AudioManager.js';
import { SkillController } from './SkillController.js';
import { DEBUG } from '../config.js';
import { resolvedSkillDef } from '../data/skills.js';

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}
function directionVector(direction = 2) { return [[0, -1], [-1, 0], [0, 1], [1, 0]][direction] || [0, 1]; }

export class DamageNumberPool {
  constructor(scene, size = 36) {
    this.scene = scene;
    this.items = Array.from({ length: size }, () => ({
      text: scene.add.text(0, 0, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '15px', color: '#ffd36a', stroke: '#170b08', strokeThickness: 4 }).setOrigin(0.5).setVisible(false).setDepth(9000)
    }));
    this.index = 0;
  }
  show(x, y, amount, hostile = false, critical = false) {
    const item = this.items[this.index++ % this.items.length];
    item.text.setPosition(x, y).setText(critical ? `${amount}!` : String(amount)).setFontSize(critical ? '19px' : '15px').setColor(hostile ? '#ff6b56' : critical ? '#fff1a8' : '#ffd36a').setAlpha(1).setVisible(true);
    this.scene.tweens.killTweensOf(item.text);
    this.scene.tweens.add({ targets: item.text, y: y - (critical ? 42 : 34), alpha: 0, duration: critical ? 760 : 620, ease: 'Quad.out', onComplete: () => item.text.setVisible(false) });
  }
}

export class CombatSystem {
  constructor(scene, state, player, enemies, events) {
    this.scene = scene;
    this.state = state;
    this.player = player;
    this.enemies = enemies;
    this.events = events;
    this.damageNumbers = new DamageNumberPool(scene);
    this.fx = new FxManager(scene);
    this.audio = new AudioManager(scene, state);
    this.resolver = new CombatResolver(scene, state, this.damageNumbers, this.fx, this.audio, {
      playerDamaged: amount => { this.scene.recovery?.markCombat(); this.scene.afterPlayerDamage?.(amount); },
      enemyDamaged: (_amount, _enemy, options) => { if ((options?.sourceTeam || 'player') === 'player') this.scene.recovery?.markCombat(); }
    });
    this.statuses = new StatusController(scene, this.resolver, this.fx);
    this.resolver.setStatusController(this.statuses);
    this.projectiles = new ProjectileManager(
      scene, this.resolver, this.statuses, this.fx, this.audio, player, enemies, 44,
      () => this.friendlyTargets()
    );
    this.skills = new SkillController(scene, state, player, this, this.statuses, this.fx, this.audio, events);
    this.rangeDebugEnabled = false;
    this.rangeDebugGraphics = DEBUG ? scene.add.graphics().setDepth(16020).setVisible(false) : null;
  }

  friendlyTargets() {
    const targets = this.scene.friendlyCombatants?.() || [this.player];
    return targets.filter(actorAlive);
  }

  playerAttack(attack = {}) {
    const derived = derivedStats(this.state);
    const range = 92 * (attack.rangeMultiplier || 1);
    const arcDegrees = attack.arcDegrees || 96;
    const cosThreshold = Math.cos(arcDegrees * Math.PI / 360);
    const damage = derived.attack * (attack.damageMultiplier || 1);
    const facing = directionVector(this.player.visual.direction);
    let hitCount = 0;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const dx = enemy.sprite.x - this.player.body.x;
      const dy = enemy.sprite.y - this.player.body.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > range * range) continue;
      const distance = Math.sqrt(distSq) || 1;
      const dot = (dx / distance) * facing[0] + (dy / distance) * facing[1];
      if (dot < cosThreshold) continue;
      const applied = this.resolver.damageEnemy(enemy, damage, {
        type: 'physical', sourceX: this.player.body.x, sourceY: this.player.body.y,
        critChance: Math.min(0.18, (this.state.player.stats.dex || 0) * 0.008), impact: 'physical', sourceTeam: 'player'
      });
      if (applied) hitCount += 1;
    }
    this.audio.play('sword', { throttleMs: 80 });
    if (!hitCount) this.events.emit('toast', { text: 'Your blade cuts only ash.', tone: 'muted', short: true, cooldownMs: 2400 });
  }

  playerCone(def, facing) {
    const derived = derivedStats(this.state);
    const cosThreshold = Math.cos((def.arcDegrees || 100) * Math.PI / 360);
    let hits = 0;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const dx = enemy.sprite.x - this.player.body.x, dy = enemy.sprite.y - this.player.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > def.range) continue;
      const dot = distance ? (dx / distance) * facing[0] + (dy / distance) * facing[1] : 1;
      if (dot < cosThreshold) continue;
      const amount = this.resolver.damageEnemy(enemy, derived.attack * def.damageMultiplier, {
        type: def.damageType, sourceX: this.player.body.x, sourceY: this.player.body.y,
        knockback: def.knockback || 0,
        critChance: Math.min(0.2, (this.state.player.stats.dex || 0) * 0.009), impact: 'fire', sourceTeam: 'player'
      });
      if (amount) {
        hits += 1;
        if (def.status && Math.random() <= (def.status.chance ?? 1)) this.statuses.apply(enemy, def.status.id, { power: derived.attack, x: this.player.body.x, y: this.player.body.y, team: 'player' });
      }
    }
    if (hits && this.state.settings.screenShake) this.scene.cameras.main.shake(hits >= 2 ? 120 : 82, hits >= 2 ? 0.0034 : 0.0022);
    if (!hits) this.events.emit('toast', { text: `${def.name} finds no target.`, tone: 'muted', short: true, cooldownMs: 1200 });
  }

  playerRadial(def) {
    const derived = derivedStats(this.state);
    let hits = 0;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, enemy.sprite.x, enemy.sprite.y);
      if (distance > def.radius) continue;
      const amount = this.resolver.damageEnemy(enemy, derived.attack * def.damageMultiplier, {
        type: def.damageType, sourceX: this.player.body.x, sourceY: this.player.body.y,
        knockback: def.knockback || 0, impact: 'shadow', sourceTeam: 'player'
      });
      if (amount) {
        hits += 1;
        if (def.status && Math.random() <= (def.status.chance ?? 1)) this.statuses.apply(enemy, def.status.id, { power: derived.attack, x: this.player.body.x, y: this.player.body.y, team: 'player' });
      }
    }
    if (hits && this.state.settings.screenShake) this.scene.cameras.main.shake(hits >= 2 ? 135 : 105, hits >= 2 ? 0.0042 : 0.0032);
  }

  enemyMelee(amount, x, y, enemy = null) {
    return this.resolver.damagePlayer(this.player, amount, { type: 'physical', sourceX: x, sourceY: y, impact: 'physical', enemy, sourceTeam: 'enemy' });
  }

  enemyMeleeTarget(target, amount, x, y, enemy = null) {
    if (!target) return 0;
    return this.resolver.damageTarget(target, amount, {
      type: 'physical', sourceX: x, sourceY: y, impact: 'physical', enemy, sourceTeam: 'enemy'
    });
  }

  beginEnemyAbility(enemy, ability, target = null, targetX = null, targetY = null) {
    const x = enemy.sprite.x, y = enemy.sprite.y;
    const node = actorNode(target);
    const tx = targetX ?? node?.x ?? this.player.body.x;
    const ty = targetY ?? node?.y ?? this.player.body.y;
    if (ability.type === 'radial_aoe') enemy.abilityTelegraph = this.fx.telegraph(x, y, ability.radius, ability.telegraph || 'earth', ability.windupMs);
    else if (ability.type === 'melee_reach') enemy.abilityTelegraph = this.fx.lineTelegraph(x, y, tx, ty, ability.range, ability.telegraph || 'physical', ability.windupMs);
    else this.fx.burst(x, y - 18, ability.telegraph === 'fire' ? 'blueflame' : ability.telegraph || 'physical', 0.72);
  }

  triggerEnemyAbility(enemy, ability, targetX, targetY, targetRef = null) {
    const x = enemy.sprite.x, y = enemy.sprite.y;
    if (ability.type === 'projectile') {
      this.projectiles.launch(ability.projectileId, {
        team: 'enemy', x, y: y - 10, targetX, targetY,
        damage: enemy.def.attack * ability.damageMultiplier, sourcePower: enemy.def.attack,
        status: ability.status || null, sourceId: enemy.def.id, targetRef
      });
      return;
    }
    if (ability.type === 'melee_reach') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      const aimAngle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
      const halfArc = (ability.arcDegrees || 40) * Math.PI / 360;
      this.fx.burst(x + Math.cos(aimAngle) * Math.min(ability.range * 0.62, 72), y + Math.sin(aimAngle) * Math.min(ability.range * 0.62, 72), 'physical', 0.9);
      for (const target of this.friendlyTargets()) {
        const node = actorNode(target);
        const currentDx = node.x - x, currentDy = node.y - y;
        const distance = Math.hypot(currentDx, currentDy);
        const currentAngle = Phaser.Math.Angle.Between(x, y, node.x, node.y);
        const angleDelta = Math.abs(Phaser.Math.Angle.Wrap(currentAngle - aimAngle));
        if (distance <= ability.range && angleDelta <= halfArc) {
          this.resolver.damageTarget(target, enemy.def.attack * ability.damageMultiplier, {
            type: 'physical', sourceX: x, sourceY: y, knockback: ability.knockback || 0,
            impact: 'physical', enemy, sourceTeam: 'enemy'
          });
        }
      }
      this.audio.play('sword', { throttleMs: 90 });
      return;
    }
    if (ability.type === 'radial_aoe') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      this.fx.ring(x, y, ability.radius, ability.telegraph || 'earth', 300);
      for (const target of this.friendlyTargets()) {
        const node = actorNode(target);
        const distance = Phaser.Math.Distance.Between(x, y, node.x, node.y);
        if (distance > ability.radius) continue;
        const amount = this.resolver.damageTarget(target, enemy.def.attack * ability.damageMultiplier, {
          type: 'physical', sourceX: x, sourceY: y, knockback: ability.knockback || 0,
          impact: 'earth', enemy, sourceTeam: 'enemy'
        });
        if (amount && ability.status && Math.random() <= (ability.status.chance ?? 1)) this.statuses.apply(target, ability.status.id, { power: enemy.def.attack, x, y, team: 'enemy' });
      }
      this.audio.play('slam');
      this.shakeAt(x, y, 130, 0.004, 430);
    }
  }

  beginAllyAbility(actor, ability, target, targetX, targetY) {
    const node = actorNode(actor);
    if (!node) return;
    const facing = directionVector(actor.direction);
    if (ability.id === 'azrael_heavenfall') {
      actor.abilityTelegraph?.destroy?.();
      actor.abilityTelegraph = this.fx.celestialSigil(targetX, targetY, ability.radius, ability.windupMs);
      this.fx.burst(node.x, node.y - 28, 'celestial', 1.15);
    } else if (ability.id === 'azrael_judgment_blast') {
      this.fx.celestialSigil(node.x, node.y - 12, 42, ability.windupMs * 0.72);
      this.fx.burst(node.x, node.y - 24, 'celestial', 0.9);
    } else if (ability.id === 'azrael_celestial_strike') {
      this.fx.celestialWingBurst(node.x, node.y, facing, 0.62);
    } else if (ability.id === 'azrael_wing_burst') {
      this.fx.celestialWingBurst(node.x, node.y, facing, 0.86);
    }
  }

  startAllyDash(actor, ability, vx, vy) {
    const node = actorNode(actor);
    if (!node) return;
    const speed = Math.hypot(vx, vy) || 1;
    const facing = [vx / speed, vy / speed];
    this.fx.celestialWingBurst(node.x, node.y, facing, 1.12);
    this.audio.play('wing_burst', { volume: 0.085, throttleMs: 240 });
    this.shakeAt(node.x, node.y, 85, 0.0024, 320);
  }

  allyCone(actor, ability) {
    const node = actorNode(actor);
    if (!node) return 0;
    const facing = directionVector(actor.direction);
    const cosThreshold = Math.cos((ability.arcDegrees || 110) * Math.PI / 360);
    let hits = 0;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active || enemy.state === 'dying') continue;
      const dx = enemy.sprite.x - node.x, dy = enemy.sprite.y - node.y;
      const distance = Math.hypot(dx, dy);
      if (distance > ability.range) continue;
      const dot = distance ? (dx / distance) * facing[0] + (dy / distance) * facing[1] : 1;
      if (dot < cosThreshold) continue;
      const amount = this.resolver.damageEnemy(enemy, actor.def.attack * ability.damageMultiplier, {
        type: 'celestial', sourceX: node.x, sourceY: node.y, knockback: ability.knockback || 0,
        impact: 'celestial', sourceTeam: 'celestial'
      });
      if (amount) hits += 1;
    }
    this.fx.celestialStrike(node.x, node.y, facing, ability.range);
    this.audio.play('celestial_strike', { volume: 0.075, throttleMs: 120 });
    if (hits) this.shakeAt(node.x, node.y, hits > 1 ? 100 : 70, hits > 1 ? 0.0032 : 0.0020, 360);
    return hits;
  }

  allyRadial(actor, ability, x = null, y = null) {
    const node = actorNode(actor);
    const cx = x ?? node?.x;
    const cy = y ?? node?.y;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return 0;
    const radius = ability.impactRadius || ability.radius || 90;
    let hits = 0;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active || enemy.state === 'dying') continue;
      const distance = Phaser.Math.Distance.Between(cx, cy, enemy.sprite.x, enemy.sprite.y);
      if (distance > radius) continue;
      const amount = this.resolver.damageEnemy(enemy, actor.def.attack * ability.damageMultiplier, {
        type: 'celestial', sourceX: cx, sourceY: cy, knockback: ability.knockback || 0,
        impact: 'celestial', sourceTeam: 'celestial'
      });
      if (amount) hits += 1;
    }
    return hits;
  }

  triggerAllyAbility(actor, ability, target, targetX, targetY) {
    const node = actorNode(actor);
    if (!node) return;
    if (ability.id === 'azrael_celestial_strike') {
      this.allyCone(actor, ability);
      return;
    }
    if (ability.id === 'azrael_wing_burst') {
      const hits = this.allyRadial(actor, ability, node.x, node.y);
      this.fx.celestialImpact(node.x, node.y, ability.impactRadius, 1.0);
      this.audio.play('wing_burst', { volume: 0.095, throttleMs: 180 });
      this.shakeAt(node.x, node.y, hits > 1 ? 150 : 105, hits > 1 ? 0.0052 : 0.0035, 470);
      return;
    }
    if (ability.id === 'azrael_judgment_blast') {
      const targetNode = actorNode(target);
      const tx = targetNode?.x ?? targetX;
      const ty = targetNode?.y ?? targetY;
      this.projectiles.launch(ability.projectileId, {
        team: 'celestial', x: node.x, y: node.y - 20, targetX: tx, targetY: ty,
        damage: actor.def.attack * ability.damageMultiplier, sourcePower: actor.def.attack,
        sourceId: actor.def.id
      });
      this.audio.play('judgment_blast', { volume: 0.09, throttleMs: 220 });
      return;
    }
    if (ability.id === 'azrael_heavenfall') {
      actor.abilityTelegraph?.destroy?.(); actor.abilityTelegraph = null;
      const hits = this.allyRadial(actor, ability, targetX, targetY);
      this.fx.heavenfallImpact(targetX, targetY, ability.radius);
      this.audio.play('heavenfall', { volume: 0.12, throttleMs: 600 });
      this.shakeAt(targetX, targetY, hits >= 3 ? 280 : 210, hits >= 3 ? 0.009 : 0.0065, 620);
    }
  }

  shakeAt(x, y, duration, intensity, radius = 480) {
    if (!this.state.settings.screenShake || !this.player?.body) return;
    const distance = Phaser.Math.Distance.Between(x, y, this.player.body.x, this.player.body.y);
    if (distance >= radius) return;
    const falloff = Math.max(0.16, 1 - distance / radius);
    this.scene.cameras.main.shake(Math.round(duration * (0.72 + falloff * 0.28)), intensity * falloff);
  }

  toggleRangeDebug() {
    if (!DEBUG || !this.rangeDebugGraphics) return false;
    this.rangeDebugEnabled = !this.rangeDebugEnabled;
    this.rangeDebugGraphics.setVisible(this.rangeDebugEnabled);
    if (!this.rangeDebugEnabled) this.rangeDebugGraphics.clear();
    return this.rangeDebugEnabled;
  }

  drawRangeDebug() {
    const g = this.rangeDebugGraphics;
    if (!this.rangeDebugEnabled || !g || !this.player?.body) return;
    g.clear();
    const px = this.player.body.x;
    const py = this.player.body.y;
    const facing = directionVector(this.player.visual.direction);
    const angle = Math.atan2(facing[1], facing[0]);
    const drawCone = (range, arcDegrees, color, width) => {
      const half = arcDegrees * Math.PI / 360;
      const a0 = angle - half;
      const a1 = angle + half;
      g.lineStyle(width, color, 0.9);
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px + Math.cos(a0) * range, py + Math.sin(a0) * range);
      g.arc(px, py, range, a0, a1, false);
      g.lineTo(px, py);
      g.strokePath();
    };
    const attack = this.player.currentAttack || this.player.combatProfile().attacks[0];
    drawCone(92 * (attack.rangeMultiplier || 1), attack.arcDegrees || 96, 0x3edcff, 2);
    const cleave = resolvedSkillDef(this.state, 'skill_ember_cleave');
    if (cleave) drawCone(cleave.range, cleave.arcDegrees || 100, 0xff7a32, 3);
  }

  update(time) {
    this.statuses.update(time);
    this.projectiles.update(time);
    if (DEBUG) this.drawRangeDebug();
  }

  snapshot(time = this.scene.time.now) {
    return { skills: this.skills.snapshot(time), effects: this.statuses.snapshot(this.player, time) };
  }

  destroy() {
    this.projectiles.clear();
    this.rangeDebugGraphics?.destroy();
    this.audio.destroy();
  }
}
