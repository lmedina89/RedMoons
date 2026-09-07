import { derivedStats } from './StatsSystem.js';
import { CombatResolver } from './CombatResolver.js';
import { StatusController } from './StatusController.js';
import { ProjectileManager } from './ProjectileManager.js';
import { FxManager } from './FxManager.js';
import { AudioManager } from './AudioManager.js';
import { SkillController } from './SkillController.js';
import { DEBUG } from '../config.js';
import { resolvedSkillDef } from '../data/skills.js';

export class DamageNumberPool {
  constructor(scene, size = 28) {
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
      enemyDamaged: () => this.scene.recovery?.markCombat()
    });
    this.statuses = new StatusController(scene, this.resolver, this.fx);
    this.resolver.setStatusController(this.statuses);
    this.projectiles = new ProjectileManager(scene, this.resolver, this.statuses, this.fx, this.audio, player, enemies);
    this.skills = new SkillController(scene, state, player, this, this.statuses, this.fx, this.audio, events);
    this.rangeDebugEnabled = false;
    this.rangeDebugGraphics = DEBUG ? scene.add.graphics().setDepth(16020).setVisible(false) : null;
  }

  playerAttack(attack = {}) {
    const derived = derivedStats(this.state);
    const range = 92 * (attack.rangeMultiplier || 1);
    const arcDegrees = attack.arcDegrees || 96;
    const cosThreshold = Math.cos(arcDegrees * Math.PI / 360);
    const damage = derived.attack * (attack.damageMultiplier || 1);
    const facing = [[0, -1], [-1, 0], [0, 1], [1, 0]][this.player.visual.direction];
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
        critChance: Math.min(0.18, (this.state.player.stats.dex || 0) * 0.008), impact: 'physical'
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
        critChance: Math.min(0.2, (this.state.player.stats.dex || 0) * 0.009), impact: 'fire'
      });
      if (amount) {
        hits += 1;
        if (def.status && Math.random() <= (def.status.chance ?? 1)) this.statuses.apply(enemy, def.status.id, { power: derived.attack, x: this.player.body.x, y: this.player.body.y });
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
        knockback: def.knockback || 0, impact: 'shadow'
      });
      if (amount) {
        hits += 1;
        if (def.status && Math.random() <= (def.status.chance ?? 1)) this.statuses.apply(enemy, def.status.id, { power: derived.attack, x: this.player.body.x, y: this.player.body.y });
      }
    }
    if (hits && this.state.settings.screenShake) this.scene.cameras.main.shake(hits >= 2 ? 135 : 105, hits >= 2 ? 0.0042 : 0.0032);
  }

  enemyMelee(amount, x, y, enemy = null) {
    return this.resolver.damagePlayer(this.player, amount, { type: 'physical', sourceX: x, sourceY: y, impact: 'physical', enemy });
  }

  beginEnemyAbility(enemy, ability, targetX = this.player.body.x, targetY = this.player.body.y) {
    const x = enemy.sprite.x, y = enemy.sprite.y;
    if (ability.type === 'radial_aoe') enemy.abilityTelegraph = this.fx.telegraph(x, y, ability.radius, ability.telegraph || 'earth', ability.windupMs);
    else if (ability.type === 'melee_reach') enemy.abilityTelegraph = this.fx.lineTelegraph(x, y, targetX, targetY, ability.range, ability.telegraph || 'physical', ability.windupMs);
    else this.fx.burst(x, y - 18, ability.telegraph === 'fire' ? 'blueflame' : ability.telegraph || 'physical', 0.72);
  }

  triggerEnemyAbility(enemy, ability, targetX, targetY) {
    const x = enemy.sprite.x, y = enemy.sprite.y;
    if (ability.type === 'projectile') {
      this.projectiles.launch(ability.projectileId, {
        team: 'enemy', x, y: y - 10, targetX, targetY,
        damage: enemy.def.attack * ability.damageMultiplier, sourcePower: enemy.def.attack,
        status: ability.status || null, sourceId: enemy.def.id
      });
      return;
    }
    if (ability.type === 'melee_reach') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      const aimAngle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
      const currentDx = this.player.body.x - x, currentDy = this.player.body.y - y;
      const distance = Math.hypot(currentDx, currentDy);
      const currentAngle = Phaser.Math.Angle.Between(x, y, this.player.body.x, this.player.body.y);
      const angleDelta = Math.abs(Phaser.Math.Angle.Wrap(currentAngle - aimAngle));
      const halfArc = (ability.arcDegrees || 40) * Math.PI / 360;
      this.fx.burst(x + Math.cos(aimAngle) * Math.min(ability.range * 0.62, 72), y + Math.sin(aimAngle) * Math.min(ability.range * 0.62, 72), 'physical', 0.9);
      if (distance <= ability.range && angleDelta <= halfArc) {
        this.resolver.damagePlayer(this.player, enemy.def.attack * ability.damageMultiplier, {
          type: 'physical', sourceX: x, sourceY: y, knockback: ability.knockback || 0, impact: 'physical', enemy
        });
      }
      this.audio.play('sword', { throttleMs: 90 });
      return;
    }
    if (ability.type === 'radial_aoe') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      this.fx.ring(x, y, ability.radius, ability.telegraph || 'earth', 300);
      const distance = Phaser.Math.Distance.Between(x, y, this.player.body.x, this.player.body.y);
      if (distance <= ability.radius) {
        const amount = this.resolver.damagePlayer(this.player, enemy.def.attack * ability.damageMultiplier, {
          type: 'physical', sourceX: x, sourceY: y, knockback: ability.knockback || 0, impact: 'earth'
        });
        if (amount && ability.status && Math.random() <= (ability.status.chance ?? 1)) this.statuses.apply(this.player, ability.status.id, { power: enemy.def.attack, x, y });
      }
      this.audio.play('slam');
      if (this.state.settings.screenShake) this.scene.cameras.main.shake(130, 0.004);
    }
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
    const facing = [[0, -1], [-1, 0], [0, 1], [1, 0]][this.player.visual.direction];
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
