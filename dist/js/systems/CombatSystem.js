import { derivedStats } from './StatsSystem.js';
import { CombatResolver } from './CombatResolver.js';
import { StatusController } from './StatusController.js';
import { ProjectileManager } from './ProjectileManager.js';
import { FxManager } from './FxManager.js';
import { AudioManager } from './AudioManager.js';
import { SkillController } from './SkillController.js';
import { DEBUG } from '../config.js';
import { resolvedSkillDef } from '../data/skills.js';
import { areHostile, areFriendly } from '../data/factions.js';

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
  showHealing(x, y, amount) {
    const item = this.items[this.index++ % this.items.length];
    item.text.setPosition(x, y).setText(`+${amount}`).setFontSize('15px').setColor('#e8fff0').setAlpha(1).setVisible(true);
    this.scene.tweens.killTweensOf(item.text);
    this.scene.tweens.add({ targets: item.text, y: y - 38, alpha: 0, duration: 720, ease: 'Quad.out', onComplete: () => item.text.setVisible(false) });
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
      enemyDamaged: (_amount, enemy, options) => {
        const sourceTeam = options?.sourceTeam || 'player';
        if (sourceTeam === 'player') this.scene.recovery?.markCombat();
        const sourceActor = options?.sourceActor || (sourceTeam === 'player' ? this.player : (sourceTeam === 'celestial' ? this.scene.azrael : null));
        if (sourceActor) {
          enemy?.forceEncounterAggro?.(sourceActor, this.scene.time.now);
          enemy?.alertEncounter?.(sourceActor, this.scene.time.now);
        }
      }
    });
    this.statuses = new StatusController(scene, this.resolver, this.fx);
    this.resolver.setStatusController(this.statuses);
    this.projectiles = new ProjectileManager(
      scene, this.resolver, this.statuses, this.fx, this.audio, player, enemies, 44,
      sourceActor => this.hostileTargetsFor(sourceActor)
    );
    this.skills = new SkillController(scene, state, player, this, this.statuses, this.fx, this.audio, events);
    this.rangeDebugEnabled = false;
    this.rangeDebugGraphics = DEBUG ? scene.add.graphics().setDepth(16020).setVisible(false) : null;
  }

  combatants() {
    const sceneTargets = this.scene?.combatants?.();
    const fallbackFriendlies = this.scene?.friendlyCombatants?.() || [this.player];
    const targets = sceneTargets || [...fallbackFriendlies, ...(this.enemies || [])];
    return [...new Set(targets)].filter(actorAlive);
  }

  hostileTargetsFor(actor) {
    if (!actor) return [];
    return this.combatants().filter(target => target !== actor && areHostile(actor, target));
  }

  friendlyTargetsFor(actor) {
    if (!actor) return [];
    return this.combatants().filter(target => target === actor || areFriendly(actor, target));
  }

  friendlyTargets() { return this.friendlyTargetsFor(this.player); }

  sourceTeamFor(actor) {
    if (actor === this.player || actor?.isPlayer) return 'player';
    return (actor?.faction || actor?.def?.faction) === 'celestial' ? 'celestial' : 'enemy';
  }

  playerAttack(attack = {}) {
    const derived = derivedStats(this.state);
    const range = 92 * (attack.rangeMultiplier || 1);
    const arcDegrees = attack.arcDegrees || 96;
    const cosThreshold = Math.cos(arcDegrees * Math.PI / 360);
    const damage = derived.attack * (attack.damageMultiplier || 1);
    const facing = directionVector(this.player.visual.direction);
    let hitCount = 0;
    const targets = this.hostileTargetsFor?.(this.player) || (this.enemies || []).filter(enemy => areHostile(this.player, enemy));
    for (const enemy of targets) {
      const node = actorNode(enemy);
      if (!node || node.active === false) continue;
      const dx = node.x - this.player.body.x;
      const dy = node.y - this.player.body.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > range * range) continue;
      const distance = Math.sqrt(distSq) || 1;
      const dot = (dx / distance) * facing[0] + (dy / distance) * facing[1];
      if (dot < cosThreshold) continue;
      const applyDamage = this.resolver.damageTarget?.bind(this.resolver) || this.resolver.damageEnemy.bind(this.resolver);
      const applied = applyDamage(enemy, damage, {
        type: 'physical', sourceX: this.player.body.x, sourceY: this.player.body.y,
        critChance: Math.min(0.18, (this.state.player.stats.dex || 0) * 0.008), impact: 'physical', sourceTeam: 'player', sourceActor: this.player
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
    const targets = this.hostileTargetsFor?.(this.player) || (this.enemies || []).filter(enemy => areHostile(this.player, enemy));
    for (const enemy of targets) {
      const node = actorNode(enemy);
      if (!node || node.active === false) continue;
      const dx = node.x - this.player.body.x, dy = node.y - this.player.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > def.range) continue;
      const dot = distance ? (dx / distance) * facing[0] + (dy / distance) * facing[1] : 1;
      if (dot < cosThreshold) continue;
      const amount = this.resolver.damageTarget(enemy, derived.attack * def.damageMultiplier, {
        type: def.damageType, sourceX: this.player.body.x, sourceY: this.player.body.y,
        knockback: def.knockback || 0,
        critChance: Math.min(0.2, (this.state.player.stats.dex || 0) * 0.009), impact: 'fire', sourceTeam: 'player', sourceActor: this.player
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
    const targets = this.hostileTargetsFor?.(this.player) || (this.enemies || []).filter(enemy => areHostile(this.player, enemy));
    for (const enemy of targets) {
      const node = actorNode(enemy);
      if (!node || node.active === false) continue;
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, node.x, node.y);
      if (distance > def.radius) continue;
      const amount = this.resolver.damageTarget(enemy, derived.attack * def.damageMultiplier, {
        type: def.damageType, sourceX: this.player.body.x, sourceY: this.player.body.y,
        knockback: def.knockback || 0, impact: 'shadow', sourceTeam: 'player', sourceActor: this.player
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
    if (!target || (enemy && !areHostile(enemy, target))) return 0;
    return this.resolver.damageTarget(target, amount, {
      type: 'physical', sourceX: x, sourceY: y, impact: 'physical', enemy,
      sourceTeam: this.sourceTeamFor(enemy), sourceActor: enemy
    });
  }

  beginEnemyAbility(enemy, ability, target = null, targetX = null, targetY = null) {
    const x = enemy.sprite.x, y = enemy.sprite.y;
    const node = actorNode(target);
    const tx = targetX ?? node?.x ?? this.player.body.x;
    const ty = targetY ?? node?.y ?? this.player.body.y;
    if (ability.type === 'friendly_heal') {
      enemy.abilityTelegraph = this.fx.celestialSigil(x, y, Math.min(ability.radius || 120, 150), ability.windupMs);
      this.fx.burst(x, y - 18, 'heal', 0.66);
    } else if (ability.type === 'radial_aoe') {
      enemy.abilityTelegraph = this.fx.telegraph(x, y, ability.radius, ability.telegraph || 'earth', ability.windupMs);
    } else if (ability.type === 'melee_reach' || ability.type === 'dash_strike') {
      enemy.abilityTelegraph = this.fx.lineTelegraph(x, y, tx, ty, ability.range, ability.telegraph || 'physical', ability.windupMs);
    } else {
      this.fx.burst(x, y - 18, ability.telegraph === 'fire' ? 'blueflame' : ability.telegraph || 'physical', 0.72);
    }
  }

  triggerEnemyAbility(enemy, ability, targetX, targetY, targetRef = null) {
    const x = enemy.sprite.x, y = enemy.sprite.y;
    const abilityKind = ability.impact || ability.telegraph || 'physical';
    const damageType = ability.damageType || (abilityKind === 'hellfire' ? 'fire' : abilityKind === 'abyss' || abilityKind === 'blood' ? 'shadow' : 'physical');
    const audioId = ability.audio || (abilityKind === 'hellfire' ? 'fire' : abilityKind === 'abyss' || abilityKind === 'blood' ? 'shadow' : abilityKind === 'ashbone' ? 'slam' : 'sword');
    const sourceTeam = this.sourceTeamFor?.(enemy) || ((enemy?.faction || enemy?.def?.faction) === 'celestial' ? 'celestial' : 'enemy');
    const hostileTargets = this.hostileTargetsFor?.(enemy) || this.friendlyTargets?.() || [];

    if (ability.type === 'friendly_heal') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      const radius = ability.radius || 140;
      let healed = 0;
      this.fx.ring(x, y, radius, 'heal', 390);
      this.fx.burst(x, y - 8, 'heal', 0.88);
      for (const target of this.friendlyTargetsFor(enemy)) {
        const node = actorNode(target);
        if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
        const vitals = this.sanctuaryVitals(target);
        if (!vitals || vitals.hp >= vitals.maxHp) continue;
        const pct = (target === this.player || target.isPlayer)
          ? (ability.playerHealPct ?? ability.healPct)
          : target === enemy ? (ability.selfHealPct ?? ability.healPct) : ability.healPct;
        const amount = Math.min(vitals.maxHp - vitals.hp, Math.max(1, Math.round(vitals.maxHp * Math.max(0, Number(pct) || 0))));
        if (!amount) continue;
        vitals.set(vitals.hp + amount);
        healed += 1;
        this.damageNumbers.showHealing(node.x, node.y - 34, amount);
        this.fx.burst(node.x, node.y - 12, 'heal', target === enemy ? 0.68 : 0.54);
      }
      this.audio.play(audioId, { throttleMs: 240, volume: 0.055 });
      if (healed) this.shakeAt(x, y, 72, 0.0014, 260);
      return;
    }

    if (ability.type === 'projectile') {
      this.projectiles.launch(ability.projectileId, {
        team: sourceTeam, sourceActor: enemy, x, y: y - 10, targetX, targetY,
        damage: enemy.def.attack * ability.damageMultiplier, sourcePower: enemy.def.attack,
        status: ability.status || null, sourceId: enemy.def.id, targetRef
      });
      return;
    }

    if (ability.type === 'dash_strike') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      const targetNode = actorNode(targetRef);
      const tx = targetNode?.x ?? targetX;
      const ty = targetNode?.y ?? targetY;
      if (this.scene.hasWorldLineOfSight?.(x, y, tx, ty) === false) return;
      const dx = tx - x, dy = ty - y;
      const distance = Math.hypot(dx, dy) || 1;
      const travel = Math.max(0, Math.min(ability.dashDistance || 110, distance - 42));
      const nx = x + dx / distance * travel;
      const ny = y + dy / distance * travel;
      this.fx.demonRushTrail(x, y, nx, ny, abilityKind);
      enemy.sprite.setPosition(nx, ny);
      enemy.setDirection?.(dx, dy);
      const facing = [dx / distance, dy / distance];
      this.fx.demonClaw(nx, ny, facing, 82, abilityKind, 1.12);
      const halfArc = (ability.arcDegrees || 64) * Math.PI / 360;
      for (const target of hostileTargets) {
        const node = actorNode(target);
        const cdx = node.x - nx, cdy = node.y - ny;
        const currentDistance = Math.hypot(cdx, cdy);
        const dot = currentDistance ? (cdx / currentDistance) * facing[0] + (cdy / currentDistance) * facing[1] : 1;
        if (currentDistance > 86 || dot < Math.cos(halfArc)) continue;
        const amount = this.resolver.damageTarget(target, enemy.def.attack * ability.damageMultiplier, {
          type: damageType, sourceX: nx, sourceY: ny, knockback: ability.knockback || 0,
          impact: abilityKind, enemy, sourceTeam, sourceActor: enemy
        });
        if (amount && ability.status && Math.random() <= (ability.status.chance ?? 1)) {
          this.statuses.apply(target, ability.status.id, { power: enemy.def.attack, x: nx, y: ny, team: sourceTeam });
        }
      }
      this.audio.play(audioId, { throttleMs: 120, volume: 0.075 });
      this.shakeAt(nx, ny, 82, 0.0024, 300);
      return;
    }

    if (ability.type === 'melee_reach') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      const aimAngle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
      const facing = [Math.cos(aimAngle), Math.sin(aimAngle)];
      const halfArc = (ability.arcDegrees || 40) * Math.PI / 360;
      if (['abyss', 'hellfire', 'ashbone', 'blood'].includes(abilityKind)) {
        this.fx.demonClaw(x, y, facing, ability.range, abilityKind, abilityKind === 'blood' ? 1.10 : 0.92);
      } else {
        this.fx.burst(x + facing[0] * Math.min(ability.range * 0.62, 72), y + facing[1] * Math.min(ability.range * 0.62, 72), abilityKind, 0.9);
      }
      for (const target of hostileTargets) {
        const node = actorNode(target);
        const currentDx = node.x - x, currentDy = node.y - y;
        const distance = Math.hypot(currentDx, currentDy);
        const currentAngle = Phaser.Math.Angle.Between(x, y, node.x, node.y);
        const angleDelta = Math.abs(Phaser.Math.Angle.Wrap(currentAngle - aimAngle));
        if (distance <= ability.range && angleDelta <= halfArc) {
          const amount = this.resolver.damageTarget(target, enemy.def.attack * ability.damageMultiplier, {
            type: damageType, sourceX: x, sourceY: y, knockback: ability.knockback || 0,
            impact: abilityKind, enemy, sourceTeam, sourceActor: enemy
          });
          if (amount && ability.status && Math.random() <= (ability.status.chance ?? 1)) {
            this.statuses.apply(target, ability.status.id, { power: enemy.def.attack, x, y, team: sourceTeam });
          }
        }
      }
      this.audio.play(audioId, { throttleMs: 100, volume: 0.06 });
      return;
    }

    if (ability.type === 'radial_aoe') {
      enemy.abilityTelegraph?.destroy?.(); enemy.abilityTelegraph = null;
      this.fx.ring(x, y, ability.radius, abilityKind, 330);
      this.scene.time.delayedCall(55, () => this.fx.ring(x, y, ability.radius * 0.72, abilityKind, 290));
      this.fx.burst(x, y - 5, abilityKind, abilityKind === 'blood' ? 1.28 : 1.0);
      for (const target of hostileTargets) {
        const node = actorNode(target);
        const distance = Phaser.Math.Distance.Between(x, y, node.x, node.y);
        if (distance > ability.radius) continue;
        const amount = this.resolver.damageTarget(target, enemy.def.attack * ability.damageMultiplier, {
          type: damageType, sourceX: x, sourceY: y, knockback: ability.knockback || 0,
          impact: abilityKind, enemy, sourceTeam, sourceActor: enemy
        });
        if (amount && ability.status && Math.random() <= (ability.status.chance ?? 1)) {
          this.statuses.apply(target, ability.status.id, { power: enemy.def.attack, x, y, team: sourceTeam });
        }
      }
      this.audio.play(audioId, { throttleMs: 140, volume: 0.07 });
      this.shakeAt(x, y, abilityKind === 'blood' ? 115 : 88, abilityKind === 'blood' ? 0.0032 : 0.0023, 360);
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
    } else if (ability.id === 'azrael_sanctified_nova') {
      actor.abilityTelegraph?.destroy?.();
      actor.abilityTelegraph = this.fx.ancientCelestialSeal(node.x, node.y, ability.radius, ability.windupMs, 'nova');
      this.fx.celestialWingBurst(node.x, node.y, facing, 0.90);
      this.fx.burst(node.x, node.y - 30, 'celestial', 1.22);
      this.audio.play('sanctified_nova', { volume: 0.085, throttleMs: 420 });
    } else if (ability.id === 'azrael_seraphic_judgment') {
      actor.abilityTelegraph?.destroy?.();
      actor.abilityTelegraph = this.fx.seraphicJudgmentSeal(targetX, targetY, ability.radius, ability.windupMs);
      this.fx.celestialSigil(node.x, node.y - 12, 48, ability.windupMs * 0.78);
      this.fx.burst(node.x, node.y - 30, 'celestial', 1.18);
      this.audio.play('seraphic_judgment', { volume: 0.085, throttleMs: 460 });
    } else if (ability.id === 'azrael_sanctuary_first_light') {
      actor.abilityTelegraph?.destroy?.();
      actor.abilityTelegraph = this.fx.sanctuaryFirstLightSeal(node.x, node.y, ability.radius, ability.windupMs);
      this.fx.celestialWingBurst(node.x, node.y, facing, 1.02);
      this.fx.burst(node.x, node.y - 34, 'celestial', 1.34);
      this.audio.play('sanctuary_first_light', { volume: 0.072, throttleMs: 520 });
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
    for (const target of this.hostileTargetsFor(actor)) {
      const targetNode = actorNode(target);
      if (!targetNode || targetNode.active === false) continue;
      const dx = targetNode.x - node.x, dy = targetNode.y - node.y;
      const distance = Math.hypot(dx, dy);
      if (distance > ability.range) continue;
      const dot = distance ? (dx / distance) * facing[0] + (dy / distance) * facing[1] : 1;
      if (dot < cosThreshold) continue;
      const amount = this.resolver.damageTarget(target, actor.def.attack * ability.damageMultiplier, {
        type: 'celestial', sourceX: node.x, sourceY: node.y, knockback: ability.knockback || 0,
        impact: 'celestial', sourceTeam: 'celestial', sourceActor: actor
      });
      if (amount) hits += 1;
    }
    this.fx.celestialStrike(node.x, node.y, facing, ability.range);
    this.audio.play('celestial_strike', { volume: 0.075, throttleMs: 120 });
    if (hits) this.shakeAt(node.x, node.y, hits > 1 ? 100 : 70, hits > 1 ? 0.0032 : 0.0020, 360);
    return hits;
  }

  allyRadial(actor, ability, x = null, y = null, damageScale = 1, knockbackScale = 1) {
    const node = actorNode(actor);
    const cx = x ?? node?.x;
    const cy = y ?? node?.y;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return 0;
    const radius = ability.impactRadius || ability.radius || 90;
    let hits = 0;
    for (const target of this.hostileTargetsFor(actor)) {
      const targetNode = actorNode(target);
      if (!targetNode || targetNode.active === false) continue;
      const distance = Phaser.Math.Distance.Between(cx, cy, targetNode.x, targetNode.y);
      if (distance > radius) continue;
      const amount = this.resolver.damageTarget(target, actor.def.attack * ability.damageMultiplier * damageScale, {
        type: 'celestial', sourceX: cx, sourceY: cy, knockback: (ability.knockback || 0) * knockbackScale,
        impact: 'celestial', sourceTeam: 'celestial', sourceActor: actor
      });
      if (amount) hits += 1;
    }
    return hits;
  }


  sanctuaryEligibleTarget(target) {
    if (!actorAlive(target)) return false;
    if (target === this.player || target.isPlayer) return true;
    return (target.faction || target.def?.faction) === 'celestial';
  }

  sanctuaryVitals(target) {
    if (!target) return null;
    if (target === this.player || target.isPlayer) {
      const maxHp = derivedStats(this.state).maxHp;
      const hp = Number(this.state.player.hp);
      if (!Number.isFinite(hp) || !Number.isFinite(maxHp) || maxHp <= 0) return null;
      return { hp, maxHp, set: value => { this.state.player.hp = Math.max(0, Math.min(maxHp, value)); } };
    }
    const hp = Number(target.hp);
    const maxHp = Number(target.def?.maxHp ?? target.maxHp);
    if (!Number.isFinite(hp) || !Number.isFinite(maxHp) || maxHp <= 0) return null;
    return { hp, maxHp, set: value => { target.hp = Math.max(0, Math.min(maxHp, value)); target.updateHealthBar?.(); } };
  }

  supportNeedScore(actor, ability) {
    const center = actorNode(actor);
    if (!center || !ability) return 0;
    const radius = ability.radius || ability.range || 140;
    let score = 0;
    for (const target of this.friendlyTargetsFor(actor)) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - center.x, node.y - center.y) > radius) continue;
      const vitals = this.sanctuaryVitals(target);
      if (!vitals) continue;
      score = Math.max(score, Math.max(0, vitals.maxHp - vitals.hp) / vitals.maxHp);
    }
    return score;
  }

  sanctuaryNeedScore(actor, ability) {
    const center = actorNode(actor);
    if (!center || !ability) return 0;
    const radius = ability.radius || 200;
    let score = 0;
    for (const target of this.friendlyTargets()) {
      if (!this.sanctuaryEligibleTarget(target)) continue;
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - center.x, node.y - center.y) > radius) continue;
      const vitals = this.sanctuaryVitals(target);
      if (!vitals) continue;
      score = Math.max(score, Math.max(0, vitals.maxHp - vitals.hp) / vitals.maxHp);
    }
    return score;
  }

  sanctuaryHealAmount(actor, target, ability) {
    const vitals = this.sanctuaryVitals(target);
    if (!vitals || vitals.hp >= vitals.maxHp) return 0;
    const pct = (target === this.player || target.isPlayer)
      ? ability.playerHealPct
      : target === actor ? ability.selfHealPct : ability.celestialHealPct;
    const configured = Math.max(0, Number(pct) || 0);
    return Math.min(vitals.maxHp - vitals.hp, Math.max(1, Math.round(vitals.maxHp * configured)));
  }

  sanctuaryPulse(actor, ability, x, y, pulseIndex = 0) {
    const radius = ability.radius || 200;
    const delays = ability.pulseDelays || [0];
    const final = pulseIndex >= delays.length - 1;
    let healedTargets = 0;
    for (const target of this.friendlyTargets()) {
      if (!this.sanctuaryEligibleTarget(target)) continue;
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      const amount = this.sanctuaryHealAmount(actor, target, ability);
      if (!amount) continue;
      const vitals = this.sanctuaryVitals(target);
      vitals.set(vitals.hp + amount);
      healedTargets += 1;
      this.damageNumbers.showHealing(node.x, node.y - 32, amount);
      this.fx.sanctuaryFirstLightBlessing(node.x, node.y, target === actor ? 1.1 : 0.88);
    }
    this.fx.sanctuaryFirstLightPulse(x, y, radius, pulseIndex, final);
    this.audio.play('sanctuary_first_light', { volume: final ? 0.105 : 0.078, throttleMs: 900 });
    if (final) this.shakeAt(x, y, 105, healedTargets ? 0.0024 : 0.0017, 560);
    return healedTargets;
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
      const delays = ability.projectileDelays || [0, 90, 180];
      const scales = ability.projectileScales || [0.60, 0.45, 0.45];
      const fanOffsets = ability.projectileFanOffsets || [0, -26, 26];
      const leadSeconds = Math.max(0, Number(ability.targetLeadSeconds) || 0);
      const launchShot = index => {
        if (!actorAlive(actor)) return;
        const sourceNode = actorNode(actor);
        if (!sourceNode) return;
        const liveTargetNode = actorAlive(target) ? actorNode(target) : null;
        const baseTx = liveTargetNode?.x ?? targetX;
        const baseTy = liveTargetNode?.y ?? targetY;
        const velocity = liveTargetNode?.body?.velocity || liveTargetNode?.velocity || { x: 0, y: 0 };
        const predictedX = baseTx + (Number(velocity?.x) || 0) * leadSeconds;
        const predictedY = baseTy + (Number(velocity?.y) || 0) * leadSeconds;
        const dx = predictedX - sourceNode.x;
        const dy = predictedY - (sourceNode.y - 20);
        const distance = Math.hypot(dx, dy) || 1;
        const fan = Number(fanOffsets[index] ?? 0) || 0;
        const tx = predictedX + (-dy / distance) * fan;
        const ty = predictedY + (dx / distance) * fan;
        this.projectiles.launch(ability.projectileId, {
          team: 'celestial', sourceActor: actor, x: sourceNode.x, y: sourceNode.y - 20, targetX: tx, targetY: ty,
          damage: actor.def.attack * ability.damageMultiplier * (Number(scales[index]) || 0), sourcePower: actor.def.attack,
          sourceId: actor.def.id, targetRef: target
        });
      };
      delays.forEach((delay, index) => {
        if (delay <= 0) launchShot(index);
        else this.scene.time.delayedCall(delay, () => launchShot(index));
      });
      return;
    }
    if (ability.id === 'azrael_sanctified_nova') {
      actor.abilityTelegraph?.destroy?.(); actor.abilityTelegraph = null;
      const hits = this.allyRadial(actor, ability, node.x, node.y);
      this.fx.sanctifiedNovaImpact(node.x, node.y, ability.radius);
      this.audio.play('sanctified_nova', { volume: 0.11, throttleMs: 420 });
      this.shakeAt(node.x, node.y, hits >= 3 ? 205 : 160, hits >= 3 ? 0.0064 : 0.0048, 540);
      return;
    }
    if (ability.id === 'azrael_seraphic_judgment') {
      actor.abilityTelegraph?.destroy?.(); actor.abilityTelegraph = null;
      const delays = ability.pulseDelays || [0, 120, 250];
      const scales = ability.pulseScales || [0.24, 0.30, 0.46];
      delays.forEach((delay, index) => {
        this.scene.time.delayedCall(delay, () => {
          const final = index === delays.length - 1;
          const hits = this.allyRadial(actor, ability, targetX, targetY, scales[index] || 0.33, final ? 1 : 0.10);
          this.fx.seraphicJudgmentImpact(targetX, targetY, ability.radius, index, final);
          this.audio.play('seraphic_judgment', { volume: final ? 0.12 : 0.075, throttleMs: 85 });
          this.shakeAt(targetX, targetY, final ? (hits >= 3 ? 235 : 195) : 90, final ? (hits >= 3 ? 0.0074 : 0.0058) : 0.0026, final ? 590 : 440);
        });
      });
      return;
    }
    if (ability.id === 'azrael_sanctuary_first_light') {
      actor.abilityTelegraph?.destroy?.(); actor.abilityTelegraph = null;
      const cx = node.x, cy = node.y;
      this.fx.sanctuaryFirstLightField(cx, cy, ability.radius, ability.fieldDurationMs);
      const delays = ability.pulseDelays || [0, 1650, 3300, 4950];
      delays.forEach((delay, index) => this.scene.time.delayedCall(delay, () => this.sanctuaryPulse(actor, ability, cx, cy, index)));
      this.audio.play('sanctuary_first_light', { volume: 0.11, throttleMs: 520 });
      this.shakeAt(cx, cy, 92, 0.0018, 540);
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
