import { areHostile } from '../data/factions.js';
import { isWorthyTarget, threatRankOf } from '../data/powerTiers.js';

const FRAME_COUNTS = Object.freeze({ spellcast: 7, thrust: 8, walk: 9, slash: 6, shoot: 13, hurt: 6, idle: 2 });
const IDLE_SEQUENCE = Object.freeze([0, 0, 1, 0, 1, 0]);

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function distanceToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const lenSq = vx * vx + vy * vy;
  if (lenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * vx + (py - ay) * vy) / lenSq, 0, 1);
  const x = ax + vx * t, y = ay + vy * t;
  return Math.hypot(px - x, py - y);
}

export class MythicalDemon {
  constructor(scene, definition) {
    this.scene = scene;
    this.def = definition;
    this.faction = definition.faction;
    // CombatResolver's existing special-actor path is named isFriendlyActor for
    // historical reasons; faction relationships still determine hostility.
    this.isFriendlyActor = true;
    this.isSpecialActor = true;
    this.uniqueActor = true;
    this.combat = null;

    this.homeX = definition.home.x;
    this.homeY = definition.home.y;
    this.body = scene.physics.add.sprite(this.homeX, this.homeY, 'solid').setVisible(false);
    this.body.body.setSize(21, 18, false).setOffset(-9, 2).setCollideWorldBounds(true);
    this.sprite = scene.add.sprite(this.homeX, this.homeY, definition.assets.idle, 0)
      .setOrigin(0.5, 0.72).setScale(definition.scale).setDepth(this.homeY + 3);

    this.direction = 2;
    this.hp = definition.maxHp;
    this.dead = false;
    this.state = 'idle';
    this.stateUntil = 0;
    this.target = null;
    this.nextThink = 0;
    this.animClock = Math.random() * 700;
    this.currentAbility = null;
    this.abilityStartedAt = 0;
    this.abilityTargetX = this.homeX;
    this.abilityTargetY = this.homeY;
    this.abilityOriginX = this.homeX;
    this.abilityOriginY = this.homeY;
    this.abilityTriggered = false;
    this.abilityTelegraph = null;
    this.abilityCooldowns = new Map();
    this.majorAbilityLockUntil = 0;

    this.rushVX = 0;
    this.rushVY = 0;
    this.rushEndsAt = 0;
    this.nextRushTrailAt = 0;
    this.orbitSign = Math.random() < 0.5 ? -1 : 1;
    this.orbitFlipAt = 0;

    this.ascendanceUntil = 0;
    this.nextAscendancePulseAt = 0;
    this.nextAscendanceDrawAt = 0;
    this.ascendanceGraphics = scene.add.graphics().setVisible(false).setDepth(this.homeY - 2);

    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.deathStartedAt = 0;
    this.respawnAt = 0;
    this.debugEnabled = false;
    this.simulationAwake = true;
    this.lastActionName = 'Bloodwing vigil';

    this.createNameplate();
    this.createDebugLabel();
    this.renderLoop('idle', 0, 225);
  }

  createNameplate() {
    this.nameplate = this.scene.add.container(this.body.x, this.body.y - 86).setDepth(9100);
    const plate = this.scene.add.graphics();
    plate.fillStyle(0x12070b, 0.93).fillRoundedRect(-118, -25, 236, 51, 10);
    plate.lineStyle(1.3, 0xff4b35, 0.94).strokeRoundedRect(-118, -25, 236, 51, 10);
    plate.lineStyle(1, 0x8c39d8, 0.72).strokeRoundedRect(-114, -21, 228, 43, 8);
    // Broken infernal crown / wing-hook emblem. Procedural only: no new texture.
    const cx = -94, cy = -4;
    plate.lineStyle(2, 0xff5a42, 0.88);
    plate.lineBetween(cx - 11, cy + 6, cx - 7, cy - 7);
    plate.lineBetween(cx - 7, cy - 7, cx - 1, cy + 2);
    plate.lineBetween(cx - 1, cy + 2, cx + 2, cy - 10);
    plate.lineBetween(cx + 2, cy - 10, cx + 6, cy + 2);
    plate.lineBetween(cx + 6, cy + 2, cx + 11, cy - 6);
    plate.lineBetween(cx - 11, cy + 6, cx + 10, cy + 6);
    plate.fillStyle(0x9a3cff, 0.95).fillCircle(cx + 1, cy - 10, 1.8);

    this.nameText = this.scene.add.text(8, -22, 'MYTHICAL DEMON', {
      fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'bold', color: '#ffd0bf',
      stroke: '#1b080c', strokeThickness: 3, letterSpacing: 0.45
    }).setOrigin(0.5, 0);
    this.titleText = this.scene.add.text(8, -8, 'BLOODWING SCOURGE', {
      fontFamily: 'Georgia, serif', fontSize: '8px', fontStyle: 'bold', color: '#d9b8ff',
      stroke: '#110812', strokeThickness: 2, letterSpacing: 0.35
    }).setOrigin(0.5, 0);
    this.levelText = this.scene.add.text(8, 4, 'Lv. ???  •  INFERNAL MYTHIC', {
      fontFamily: 'Arial, sans-serif', fontSize: '7px', color: '#ffb59f',
      stroke: '#12060a', strokeThickness: 2, letterSpacing: 0.15
    }).setOrigin(0.5, 0);

    this.healthBack = this.scene.add.graphics();
    this.healthBack.fillStyle(0x18080c, 0.94).fillRoundedRect(-76, 18, 152, 5, 2);
    this.healthBar = this.scene.add.graphics();
    this.nameplate.add([plate, this.nameText, this.titleText, this.levelText, this.healthBack, this.healthBar]);
    this.updateHealthBar();
  }

  createDebugLabel() {
    this.debugText = this.scene.add.text(this.body.x, this.body.y + 40, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '8px', color: '#ffd8cc',
      backgroundColor: 'rgba(18,5,10,0.86)', stroke: '#12050a', strokeThickness: 2, padding: { x: 4, y: 3 }
    }).setOrigin(0.5, 0).setDepth(16030).setVisible(false);
  }

  setDebugEnabled(enabled) {
    this.debugEnabled = Boolean(enabled);
    this.debugText?.setVisible(this.debugEnabled && !this.dead);
    return this.debugEnabled;
  }

  updateHealthBar() {
    if (!this.healthBar) return;
    const ratio = clamp(this.hp / this.def.maxHp, 0, 1);
    this.healthBar.clear();
    this.healthBar.fillStyle(0xef4439, 0.98).fillRoundedRect(-75, 19, 150 * ratio, 3, 1);
    if (ratio > 0.35) this.healthBar.fillStyle(0xa94cff, 0.56).fillRect(-74, 19, 148 * ratio, 1);
  }

  cooldownReady(id, time) { return time >= (this.abilityCooldowns.get(id) || 0); }
  setCooldown(ability, time) { this.abilityCooldowns.set(ability.id, time + ability.cooldownMs); }
  majorReady(time) { return time >= this.majorAbilityLockUntil; }
  ascendanceActive(time = this.scene.time.now) { return !this.dead && time < this.ascendanceUntil; }

  setDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) this.direction = vx < 0 ? 1 : 3;
    else if (Math.abs(vy) > 0.001) this.direction = vy < 0 ? 0 : 2;
  }

  frameFor(action, frame) {
    if (action === 'hurt') return clamp(frame, 0, FRAME_COUNTS.hurt - 1);
    return this.direction * FRAME_COUNTS[action] + clamp(frame, 0, FRAME_COUNTS[action] - 1);
  }

  renderFrame(action, frame) {
    const texture = this.def.assets[action];
    if (!texture || !this.scene.textures.exists(texture)) return;
    this.sprite.setTexture(texture).setFrame(this.frameFor(action, frame));
  }

  renderLoop(action, time, frameMs = 120, sequence = null) {
    const frames = sequence || (action === 'idle' ? IDLE_SEQUENCE : Array.from({ length: FRAME_COUNTS[action] || 1 }, (_, i) => i));
    const index = Math.floor((time + this.animClock) / frameMs) % frames.length;
    this.renderFrame(action, frames[index]);
  }

  renderProgress(action, progress) {
    const count = FRAME_COUNTS[action] || 1;
    const index = Math.min(count - 1, Math.floor(clamp(progress, 0, 0.999999) * count));
    this.renderFrame(action, index);
  }

  shouldSimulate() {
    const playerNode = actorNode(this.scene?.player);
    if (!playerNode) return true;
    const range = Math.max(320, Number(this.def.simulationRange) || 1200);
    const dx = playerNode.x - this.body.x, dy = playerNode.y - this.body.y;
    return dx * dx + dy * dy <= range * range;
  }

  sleepSimulation(time) {
    this.simulationAwake = false;
    this.body.setVelocity(0);
    this.target = null;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityTriggered = false;
    this.state = 'idle';
    this.stateUntil = time;
    this.lastActionName = 'Distant infernal vigil';
    this.ascendanceGraphics.clear().setVisible(false);
    this.debugText?.setVisible(false);
  }

  wakeSimulation(time) {
    const wasSleeping = !this.simulationAwake;
    this.simulationAwake = true;
    if (wasSleeping && this.ascendanceActive(time)) this.nextAscendancePulseAt = time + this.def.abilities.abyssalAscendance.pulseEveryMs;
    this.debugText?.setVisible(this.debugEnabled && !this.dead);
  }

  activeHostiles(actors = []) { return actors.filter(actor => actorAlive(actor) && areHostile(this, actor)); }

  clusterCount(target, actors, radius) {
    const p = actorNode(target);
    if (!p) return 0;
    const rr = radius * radius;
    let count = 0;
    for (const other of actors) {
      if (!actorAlive(other) || !areHostile(this, other)) continue;
      const op = actorNode(other);
      const dx = op.x - p.x, dy = op.y - p.y;
      if (dx * dx + dy * dy <= rr) count += 1;
    }
    return count;
  }

  chooseTarget(actors) {
    let best = null;
    let bestScore = Infinity;
    const eclipse = this.def.abilities.crimsonEclipse;
    for (const actor of actors) {
      const p = actorNode(actor);
      if (!p) continue;
      const homeDistance = Math.hypot(p.x - this.homeX, p.y - this.homeY);
      if (homeDistance > this.def.leashRange) continue;
      const distance = Math.hypot(p.x - this.body.x, p.y - this.body.y);
      if (distance > this.def.senseRange) continue;
      const cluster = this.clusterCount(actor, actors, eclipse.targetClusterRadius);
      // Infernal mythic aggressively values worthy foes and dense formations.
      const score = distance - Math.max(0, cluster - 1) * 40 - threatRankOf(actor) * 22;
      if (score < bestScore) { best = actor; bestScore = score; }
    }
    return best;
  }

  damageMultiplier(time = this.scene.time.now) {
    return this.ascendanceActive(time) ? this.def.abilities.abyssalAscendance.damageDealtMultiplier : 1;
  }

  damageTarget(target, multiplier, x = this.body.x, y = this.body.y, knockback = 0, type = 'shadow', impact = 'blood') {
    if (!this.combat || !actorAlive(target) || !areHostile(this, target)) return 0;
    return this.combat.resolver.damageTarget(target, this.def.attack * multiplier * this.damageMultiplier(), {
      type, sourceX: x, sourceY: y, knockback, impact, sourceTeam: 'enemy', sourceActor: this
    });
  }

  damageInRadius(x, y, radius, multiplier, knockback = 0, options = {}) {
    let hits = 0;
    for (const target of this.combat?.hostileTargetsFor?.(this) || []) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      const amount = this.damageTarget(target, multiplier, x, y, knockback, options.type || 'shadow', options.impact || 'abyss');
      if (!amount) continue;
      hits += 1;
      if (options.slowMs) this.combat.statuses?.apply?.(target, 'slow', { power: this.def.attack, x, y, team: 'enemy', sourceActor: this }, { durationMs: options.slowMs });
      if (options.staggerMs) this.combat.statuses?.apply?.(target, 'stagger', { power: this.def.attack, x, y, team: 'enemy', sourceActor: this }, { durationMs: options.staggerMs });
    }
    return hits;
  }

  damageAlongSegment(ax, ay, bx, by, radius, multiplier, knockback = 0) {
    let hits = 0;
    for (const target of this.combat?.hostileTargetsFor?.(this) || []) {
      const node = actorNode(target);
      if (!node || distanceToSegment(node.x, node.y, ax, ay, bx, by) > radius) continue;
      if (this.damageTarget(target, multiplier, bx, by, knockback, 'physical', 'blood')) hits += 1;
    }
    return hits;
  }

  burst(x, y, kind = 'blood', scale = 1) { this.combat?.fx?.burst?.(x, y, kind, scale); }
  ring(x, y, radius, kind = 'blood', duration = 420) { this.combat?.fx?.ring?.(x, y, radius, kind, duration); }

  makeAnimatedTelegraph(duration, draw, depth = 8450) {
    const g = this.scene.add.graphics().setDepth(depth);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 38, loop: true, callback: () => {
      if (!g.active) return;
      const p = clamp((this.scene.time.now - started) / Math.max(1, duration), 0, 1);
      g.clear();
      draw(g, p, this.scene.time.now - started);
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); if (g.active) g.destroy(); } };
  }

  fxAscendanceInvocation(duration) {
    const x = this.body.x, y = this.body.y;
    return this.makeAnimatedTelegraph(duration, (g, p) => {
      const r = 104 - p * 28;
      const alpha = 0.30 + p * 0.62;
      g.fillStyle(0x4a0610, 0.07 + p * 0.08).fillCircle(x, y, r);
      g.lineStyle(3, 0xff4a32, alpha).strokeCircle(x, y, r);
      g.lineStyle(2, 0x8f39df, alpha * 0.90).strokeCircle(x, y, r * 0.68);
      for (let i = 0; i < 10; i += 1) {
        const a = i * Math.PI / 5 + p * (i % 2 ? -1.2 : 1.1);
        g.lineStyle(i % 2 ? 1.5 : 2.4, i % 2 ? 0x9d48e8 : 0xff5a3d, alpha * 0.76);
        g.lineBetween(x + Math.cos(a) * r * 0.52, y + Math.sin(a) * r * 0.52, x + Math.cos(a) * r * 0.94, y + Math.sin(a) * r * 0.94);
      }
    });
  }

  activateAscendance(time) {
    const ability = this.def.abilities.abyssalAscendance;
    this.ascendanceUntil = time + ability.durationMs;
    this.nextAscendancePulseAt = time + ability.pulseEveryMs;
    this.nextAscendanceDrawAt = 0;
    this.ascendanceGraphics.setVisible(true);
    this.ring(this.body.x, this.body.y, ability.auraRadius, 'blood', 680);
    this.scene.time.delayedCall(55, () => this.ring(this.body.x, this.body.y, ability.auraRadius * 0.72, 'abyss', 590));
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4;
      this.scene.time.delayedCall(i * 18, () => this.burst(this.body.x + Math.cos(a) * 44, this.body.y + Math.sin(a) * 28 - 10, i % 2 ? 'abyss' : 'blood', 0.80));
    }
    this.combat?.audio?.play?.('shadow', { volume: 0.08, throttleMs: 550 });
  }

  updateAscendance(time) {
    if (!this.ascendanceActive(time)) {
      if (this.ascendanceGraphics.visible) this.ascendanceGraphics.clear().setVisible(false);
      return;
    }
    const ability = this.def.abilities.abyssalAscendance;
    if (time >= this.nextAscendancePulseAt) {
      this.nextAscendancePulseAt += ability.pulseEveryMs;
      const missing = Math.max(0, this.def.maxHp - this.hp);
      const amount = Math.min(missing, Math.max(1, Math.round(this.def.maxHp * ability.selfHealPct)));
      if (amount > 0) { this.hp += amount; this.combat?.damageNumbers?.showHealing?.(this.body.x, this.body.y - 38, amount); }
      this.ring(this.body.x, this.body.y, ability.auraRadius * 0.85, amount ? 'blood' : 'abyss', 460);
    }
    if (time < this.nextAscendanceDrawAt) return;
    this.nextAscendanceDrawAt = time + 72;
    const elapsed = ability.durationMs - Math.max(0, this.ascendanceUntil - time);
    const rot = elapsed * 0.0012;
    const breathe = 0.92 + Math.sin(elapsed * 0.006) * 0.07;
    const g = this.ascendanceGraphics;
    g.clear().setVisible(true).setPosition(this.body.x, this.body.y).setDepth(this.body.y - 2);
    g.fillStyle(0x440510, 0.04).fillCircle(0, 0, 86 * breathe);
    g.lineStyle(2.5, 0xff4a31, 0.58).strokeEllipse(0, 1, 142 * breathe, 54 * breathe);
    g.lineStyle(1.7, 0x8f43dc, 0.62).strokeEllipse(0, 0, 106 * breathe, 41 * breathe);
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4 + rot * (i % 2 ? -0.8 : 1);
      const x = Math.cos(a) * 58, y = Math.sin(a) * 24;
      g.lineStyle(i % 2 ? 1.5 : 2.1, i % 2 ? 0xa444e2 : 0xff553c, 0.55).lineBetween(x - 6, y - 3, x + 6, y + 3);
    }
  }

  fxMawTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p) => {
      const spin = p * Math.PI * 1.6;
      g.fillStyle(0x260315, 0.08 + p * 0.10).fillCircle(x, y, radius * (0.78 + p * 0.08));
      g.lineStyle(3, 0x8d36de, 0.45 + p * 0.45).strokeCircle(x, y, radius);
      g.lineStyle(2, 0xff3e28, 0.42 + p * 0.42).strokeCircle(x, y, radius * 0.62);
      for (let i = 0; i < 9; i += 1) {
        const a = i * Math.PI * 2 / 9 + spin;
        const r0 = radius * 0.40, r1 = radius * (0.84 - p * 0.18);
        g.lineStyle(i % 3 === 0 ? 2.4 : 1.4, i % 2 ? 0x9b43e4 : 0xff4c35, 0.55 + p * 0.28)
          .lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
    });
  }

  fxMawPulse(x, y, radius, index, final) {
    this.ring(x, y, radius * (final ? 1 : 0.78), final ? 'blood' : 'abyss', final ? 560 : 390);
    this.burst(x, y - 8, final ? 'hellfire' : 'abyss', final ? 1.8 : 1.05);
    const count = final ? 10 : 6;
    for (let i = 0; i < count; i += 1) {
      const a = i * Math.PI * 2 / count + index * 0.34;
      const r = radius * (0.35 + (i % 3) * 0.15);
      this.scene.time.delayedCall((i % 4) * 16, () => this.burst(x + Math.cos(a) * r, y + Math.sin(a) * r, i % 2 ? 'blood' : 'abyss', final ? 0.85 : 0.58));
    }
  }

  fxEclipseTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p) => {
      const alpha = 0.28 + p * 0.64;
      g.fillStyle(0x16020a, 0.10 + p * 0.13).fillCircle(x, y, radius * 0.70);
      g.lineStyle(4, 0xff402c, alpha).strokeCircle(x, y, radius);
      g.lineStyle(2, 0x9f42e6, alpha * 0.92).strokeCircle(x, y, radius * (0.48 + p * 0.08));
      const spin = p * Math.PI * 1.25;
      for (let i = 0; i < 6; i += 1) {
        const a = i * Math.PI / 3 + spin;
        const x0 = x + Math.cos(a) * radius * 0.30, y0 = y + Math.sin(a) * radius * 0.30;
        const x1 = x + Math.cos(a) * radius * 0.88, y1 = y + Math.sin(a) * radius * 0.88;
        g.lineStyle(2.2, i % 2 ? 0xff5b3a : 0x9c43e3, alpha * 0.76).lineBetween(x0, y0, x1, y1);
      }
    });
  }

  fxEclipseImpact(x, y, radius) {
    const g = this.scene.add.graphics().setDepth(8610);
    g.fillStyle(0x170109, 0.34).fillCircle(x, y, radius * 0.65);
    g.lineStyle(7, 0xff3f2c, 0.76).strokeCircle(x, y, radius * 0.74);
    g.lineStyle(3, 0xa947e8, 0.92).strokeCircle(x, y, radius * 0.48);
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6;
      g.lineStyle(i % 2 ? 2 : 4, i % 2 ? 0x9e41df : 0xff5639, 0.72)
        .lineBetween(x + Math.cos(a) * 45, y + Math.sin(a) * 45, x + Math.cos(a) * radius * 0.92, y + Math.sin(a) * radius * 0.92);
    }
    this.scene.tweens.add({ targets: g, scaleX: 1.08, scaleY: 1.08, alpha: 0, duration: 610, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius, 'hellfire', 620);
    this.scene.time.delayedCall(70, () => this.ring(x, y, radius * 0.74, 'abyss', 520));
    this.burst(x, y - 10, 'blood', 2.2);
  }

  fxCataclysmTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p) => {
      const spin = p * Math.PI * 1.8;
      const alpha = 0.25 + p * 0.68;
      g.fillStyle(0x120107, 0.11 + p * 0.12).fillCircle(x, y, radius * 0.84);
      for (const [r, color, width] of [[1, 0xff3b27, 4], [0.72, 0x9c42e2, 2.5], [0.46, 0xff6946, 2]]) {
        g.lineStyle(width, color, alpha).strokeCircle(x, y, radius * r);
      }
      for (let i = 0; i < 14; i += 1) {
        const a = i * Math.PI / 7 + spin * (i % 2 ? -0.6 : 1);
        const r0 = radius * (i % 2 ? 0.34 : 0.48), r1 = radius * (0.88 - p * 0.10);
        g.lineStyle(i % 3 === 0 ? 3 : 1.5, i % 2 ? 0x9d43e4 : 0xff4b31, alpha * 0.78)
          .lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
    }, 8425);
  }

  fxCataclysmImpact(x, y, radius, final = false) {
    const g = this.scene.add.graphics().setDepth(8630);
    const r = final ? radius : radius * 0.70;
    g.fillStyle(0x190108, final ? 0.40 : 0.24).fillCircle(x, y, r * 0.62);
    g.lineStyle(final ? 9 : 5, 0xff3e2b, final ? 0.86 : 0.66).strokeCircle(x, y, r * 0.74);
    g.lineStyle(final ? 4 : 2.5, 0xa647e9, 0.92).strokeCircle(x, y, r * 0.50);
    for (let i = 0; i < (final ? 16 : 10); i += 1) {
      const a = i * Math.PI * 2 / (final ? 16 : 10);
      g.lineStyle(i % 2 ? 2 : 4, i % 2 ? 0xa345e6 : 0xff5c3c, final ? 0.80 : 0.62)
        .lineBetween(x + Math.cos(a) * r * 0.28, y + Math.sin(a) * r * 0.28, x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96);
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: final ? 720 : 480, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, r, final ? 'hellfire' : 'abyss', final ? 700 : 450);
    this.burst(x, y - 12, final ? 'hellfire' : 'blood', final ? 2.6 : 1.4);
  }

  beginAbility(ability, target, time) {
    const p = actorNode(target);
    if (!ability || !p) return false;
    this.currentAbility = ability;
    this.target = target;
    this.abilityStartedAt = time;
    this.abilityTriggered = false;
    this.abilityTargetX = p.x;
    this.abilityTargetY = p.y;
    this.abilityOriginX = this.body.x;
    this.abilityOriginY = this.body.y;
    this.body.setVelocity(0);
    this.setDirection(p.x - this.body.x, p.y - this.body.y);
    this.setCooldown(ability, time);
    if (ability.major) this.majorAbilityLockUntil = Math.max(this.majorAbilityLockUntil, time + ability.majorLockMs);
    this.lastActionName = ability.name;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;

    if (ability.id === 'mythical_demon_bloodwing_rush') {
      this.state = 'rush_charge';
      this.stateUntil = time + ability.windupMs;
      this.combat?.fx?.lineTelegraph?.(this.body.x, this.body.y, p.x, p.y, Math.min(ability.range, Math.hypot(p.x - this.body.x, p.y - this.body.y) + 40), 'blood', ability.windupMs);
    } else {
      this.state = 'ability';
      this.stateUntil = time + ability.windupMs;
      if (ability.id === 'mythical_demon_abyssal_ascendance') this.abilityTelegraph = this.fxAscendanceInvocation(ability.windupMs);
      else if (ability.id === 'mythical_demon_maw_void') this.abilityTelegraph = this.fxMawTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
      else if (ability.id === 'mythical_demon_crimson_eclipse') this.abilityTelegraph = this.fxEclipseTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
      else if (ability.id === 'mythical_demon_cataclysm_first_pit') this.abilityTelegraph = this.fxCataclysmTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
    }
    return true;
  }

  finishAbility(time, recoverMs = 260) {
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityTriggered = false;
    this.body.setVelocity(0);
    this.state = 'recover';
    this.stateUntil = time + recoverMs;
    this.orbitSign *= -1;
  }

  triggerTalon(ability) {
    const p = actorNode(this.target);
    if (!p) return;
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy) || 1;
    const facing = [dx / distance, dy / distance];
    let hits = 0;
    for (const target of this.combat?.hostileTargetsFor?.(this) || []) {
      const node = actorNode(target);
      if (!node) continue;
      const tx = node.x - this.body.x, ty = node.y - this.body.y;
      const td = Math.hypot(tx, ty) || 1;
      if (td > ability.range) continue;
      const dot = tx / td * facing[0] + ty / td * facing[1];
      if (dot < Math.cos((ability.arcDegrees || 132) * Math.PI / 360)) continue;
      if (this.damageTarget(target, ability.damageMultiplier, this.body.x, this.body.y, ability.knockback, 'physical', 'blood')) hits += 1;
    }
    this.combat?.fx?.demonClaw?.(this.body.x, this.body.y, facing, ability.range, 'blood', 1.18);
    this.combat?.audio?.play?.('sword', { volume: 0.075, throttleMs: 100 });
    if (hits) this.combat?.shakeAt?.(this.body.x, this.body.y, hits > 1 ? 96 : 70, hits > 1 ? 0.0028 : 0.0019, 320);
  }

  triggerVolley(ability) {
    const target = this.target;
    const node = actorNode(target);
    if (!node) return;
    const vx = node.body?.velocity?.x || 0, vy = node.body?.velocity?.y || 0;
    const leadSeconds = 0.28;
    const centerX = node.x + vx * leadSeconds;
    const centerY = node.y + vy * leadSeconds;
    const dx = centerX - this.body.x, dy = centerY - this.body.y;
    const d = Math.hypot(dx, dy) || 1;
    const px = -dy / d, py = dx / d;
    ability.projectileDelays.forEach((delay, index) => this.scene.time.delayedCall(delay, () => {
      if (this.dead || !this.simulationAwake) return;
      const offset = ability.projectileFanOffsets[index] || 0;
      const projectileId = index % 2 ? 'hellfire_orb' : 'blood_lance';
      this.combat?.projectiles?.launch?.(projectileId, {
        team: 'enemy', sourceActor: this, x: this.body.x, y: this.body.y - 12,
        targetX: centerX + px * offset, targetY: centerY + py * offset,
        damage: this.def.attack * ability.damageMultiplier * this.damageMultiplier(),
        sourcePower: this.def.attack, sourceId: this.def.id, targetRef: target
      });
    }));
    this.burst(this.body.x, this.body.y - 18, 'blood', 1.0);
  }

  triggerMaw(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    ability.pulseDelays.forEach((delay, index) => this.scene.time.delayedCall(delay, () => {
      if (this.dead || !this.simulationAwake) return;
      const final = index === ability.pulseDelays.length - 1;
      const scale = ability.pulseScales[index] || 0.33;
      const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier * scale, final ? ability.knockback : 25, { slowMs: ability.slowDurationMs, impact: 'abyss' });
      this.fxMawPulse(x, y, ability.radius, index, final);
      this.combat?.audio?.play?.(final ? 'shadow' : 'fire', { volume: final ? 0.095 : 0.055, throttleMs: 100 });
      if (final && hits) this.combat?.shakeAt?.(x, y, hits >= 3 ? 150 : 112, hits >= 3 ? 0.0042 : 0.0030, 500);
    }));
  }

  triggerEclipse(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    this.fxEclipseImpact(x, y, ability.radius);
    this.scene.time.delayedCall(180, () => {
      if (this.dead || !this.simulationAwake) return;
      const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier, ability.knockback, { slowMs: ability.slowDurationMs, impact: 'blood' });
      this.combat?.audio?.play?.('shadow', { volume: 0.105, throttleMs: 500 });
      if (hits) this.combat?.shakeAt?.(x, y, hits >= 3 ? 185 : 150, hits >= 3 ? 0.0052 : 0.0040, 560);
    });
  }

  triggerCataclysm(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    this.scene.time.delayedCall(ability.ruptureDelayMs, () => {
      if (this.dead || !this.simulationAwake) return;
      this.damageInRadius(x, y, ability.radius * 0.82, ability.ruptureDamageMultiplier, 35, { slowMs: ability.slowDurationMs, staggerMs: 260, impact: 'abyss' });
      this.fxCataclysmImpact(x, y, ability.radius, false);
    });
    this.scene.time.delayedCall(ability.executionDelayMs, () => {
      if (this.dead || !this.simulationAwake) return;
      const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier, ability.knockback, { slowMs: ability.slowDurationMs, staggerMs: ability.staggerDurationMs, impact: 'hellfire' });
      this.fxCataclysmImpact(x, y, ability.radius, true);
      this.combat?.audio?.play?.('heavenfall', { volume: 0.11, throttleMs: 700 });
      this.combat?.shakeAt?.(x, y, hits >= 3 ? 230 : 185, hits >= 3 ? 0.0063 : 0.0048, 660);
    });
  }

  triggerCastAbility(ability, time) {
    if (ability.id === 'mythical_demon_abyssal_ascendance') this.activateAscendance(time);
    else if (ability.id === 'mythical_demon_rending_talon') this.triggerTalon(ability);
    else if (ability.id === 'mythical_demon_hellspine_volley') this.triggerVolley(ability);
    else if (ability.id === 'mythical_demon_maw_void') this.triggerMaw(ability);
    else if (ability.id === 'mythical_demon_crimson_eclipse') this.triggerEclipse(ability);
    else if (ability.id === 'mythical_demon_cataclysm_first_pit') this.triggerCataclysm(ability);
  }

  updateCastAbility(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const elapsed = Math.max(0, time - this.abilityStartedAt);
    const progress = clamp(elapsed / Math.max(1, ability.windupMs), 0, 0.999999);
    if (ability.id === 'mythical_demon_hellspine_volley') this.renderProgress('shoot', progress);
    else if (ability.id === 'mythical_demon_rending_talon') this.renderProgress('slash', progress);
    else if (ability.id === 'mythical_demon_cataclysm_first_pit') {
      if (progress < 0.68) this.renderProgress('spellcast', progress / 0.68);
      else this.renderProgress('thrust', (progress - 0.68) / 0.32);
    } else this.renderProgress('spellcast', progress);

    if (!this.abilityTriggered && progress >= (ability.triggerAt ?? 0.62)) {
      this.abilityTriggered = true;
      this.triggerCastAbility(ability, time);
    }
    if (elapsed >= ability.windupMs) {
      if (!this.abilityTriggered) { this.abilityTriggered = true; this.triggerCastAbility(ability, time); }
      this.finishAbility(time, ability.recoverMs);
    }
  }

  updateRushCharge(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const elapsed = time - this.abilityStartedAt;
    this.body.setVelocity(0);
    this.renderProgress('thrust', elapsed / Math.max(1, ability.windupMs));
    if (elapsed < ability.windupMs) return;
    const p = actorNode(this.target) || { x: this.abilityTargetX, y: this.abilityTargetY };
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy) || 1;
    this.abilityOriginX = this.body.x; this.abilityOriginY = this.body.y;
    this.rushVX = dx / distance * this.def.rushSpeed;
    this.rushVY = dy / distance * this.def.rushSpeed;
    this.rushEndsAt = time + Math.min(ability.dashMs, (Math.min(distance + 54, ability.range + 50) / this.def.rushSpeed) * 1000);
    this.nextRushTrailAt = time;
    this.abilityTriggered = true;
    this.state = 'rush_dash';
    this.setDirection(dx, dy);
    this.combat?.audio?.play?.('shadow', { volume: 0.075, throttleMs: 260 });
  }

  updateRushDash(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    this.body.setVelocity(this.rushVX, this.rushVY);
    this.setDirection(this.rushVX, this.rushVY);
    this.renderLoop('walk', time, 48);
    if (time >= this.nextRushTrailAt) {
      this.nextRushTrailAt = time + 48;
      this.combat?.fx?.demonRushTrail?.(this.body.x - this.rushVX * 0.025, this.body.y - this.rushVY * 0.025, this.body.x, this.body.y, Math.floor(time / 96) % 2 ? 'blood' : 'abyss');
    }
    const targetNode = actorNode(this.target);
    const reached = targetNode ? Math.hypot(targetNode.x - this.body.x, targetNode.y - this.body.y) <= 34 : false;
    if (!reached && time < this.rushEndsAt) return;
    this.body.setVelocity(0);
    const hits = this.damageAlongSegment(this.abilityOriginX, this.abilityOriginY, this.body.x, this.body.y, ability.lineRadius, ability.damageMultiplier, ability.knockback);
    this.combat?.fx?.demonClaw?.(this.body.x, this.body.y, [this.rushVX, this.rushVY], 88, 'blood', 1.25);
    this.ring(this.body.x, this.body.y, 70, 'abyss', 380);
    if (hits) this.combat?.shakeAt?.(this.body.x, this.body.y, hits > 2 ? 120 : 88, hits > 2 ? 0.0034 : 0.0023, 420);
    this.finishAbility(time, ability.recoverMs);
  }

  decide(time, actors) {
    const available = this.activeHostiles(actors);
    if (!actorAlive(this.target) || (this.target && !areHostile(this, this.target))) this.target = null;
    if (this.target) {
      const p = actorNode(this.target);
      if (!p || Math.hypot(p.x - this.homeX, p.y - this.homeY) > this.def.leashRange || Math.hypot(p.x - this.body.x, p.y - this.body.y) > this.def.senseRange * 1.20) this.target = null;
    }
    if (!this.target) this.target = this.chooseTarget(available);

    if (!this.target) {
      const dx = this.homeX - this.body.x, dy = this.homeY - this.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 48) {
        const inv = 1 / Math.max(1, distance);
        this.body.setVelocity(dx * inv * this.def.glideSpeed * 0.72, dy * inv * this.def.glideSpeed * 0.72);
        this.setDirection(dx, dy);
        this.state = 'return'; this.lastActionName = 'Returning to the infernal line';
      } else {
        this.body.setVelocity(0); this.state = 'idle';
        this.lastActionName = this.ascendanceActive(time) ? 'Ascendant vigil' : 'Bloodwing vigil';
      }
      return;
    }

    const p = actorNode(this.target);
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy);
    this.setDirection(dx, dy);

    const ascend = this.def.abilities.abyssalAscendance;
    if (!this.ascendanceActive(time) && this.cooldownReady(ascend.id, time)) {
      this.beginAbility(ascend, this.target, time); return;
    }

    const cataclysm = this.def.abilities.cataclysmFirstPit;
    const eclipse = this.def.abilities.crimsonEclipse;
    const maw = this.def.abilities.mawVoid;
    const catCluster = this.clusterCount(this.target, available, cataclysm.targetClusterRadius);
    const eclipseCluster = this.clusterCount(this.target, available, eclipse.targetClusterRadius);
    const mawCluster = this.clusterCount(this.target, available, maw.targetClusterRadius);
    if (this.majorReady(time)) {
      if ((catCluster >= cataclysm.minCluster || isWorthyTarget(this.target, cataclysm.worthyTargetTier)) && distance <= cataclysm.range && this.cooldownReady(cataclysm.id, time)) {
        this.beginAbility(cataclysm, this.target, time); return;
      }
      if ((eclipseCluster >= eclipse.minCluster || isWorthyTarget(this.target, eclipse.worthyTargetTier)) && distance <= eclipse.range && this.cooldownReady(eclipse.id, time)) {
        this.beginAbility(eclipse, this.target, time); return;
      }
      if ((mawCluster >= maw.minCluster || isWorthyTarget(this.target, maw.worthyTargetTier)) && distance <= maw.range && this.cooldownReady(maw.id, time)) {
        this.beginAbility(maw, this.target, time); return;
      }
    }

    const talon = this.def.abilities.rendingTalon;
    if (distance <= talon.range && this.cooldownReady(talon.id, time)) {
      this.beginAbility(talon, this.target, time); return;
    }

    const volley = this.def.abilities.hellspineVolley;
    if (distance >= volley.minRange && distance <= volley.range && this.cooldownReady(volley.id, time)) {
      this.beginAbility(volley, this.target, time); return;
    }

    const rush = this.def.abilities.bloodwingRush;
    if (distance > talon.range * 0.90 && distance <= rush.range && this.cooldownReady(rush.id, time)) {
      this.beginAbility(rush, this.target, time); return;
    }

    if (time >= this.orbitFlipAt) {
      this.orbitFlipAt = time + 700 + Math.random() * 420;
      if (Math.random() < 0.62) this.orbitSign *= -1;
    }
    const inv = 1 / Math.max(1, distance);
    const tx = dx * inv, ty = dy * inv;
    const px = -ty * this.orbitSign, py = tx * this.orbitSign;
    const approach = distance > this.def.preferredRange ? 0.92 : distance < 96 ? -0.25 : 0.20;
    const orbit = distance > this.def.preferredRange ? 0.28 : 0.66;
    const mx = tx * approach + px * orbit, my = ty * approach + py * orbit;
    const norm = Math.hypot(mx, my) || 1;
    const speed = distance > this.def.preferredRange ? this.def.glideSpeed : this.def.speed;
    this.body.setVelocity(mx / norm * speed, my / norm * speed);
    this.setDirection(mx, my);
    this.state = 'stalk';
    this.lastActionName = `Stalking ${this.target.def?.name || this.target.name || 'worthy prey'}`;
  }

  update(time, delta, actors) {
    this.animClock += delta;
    if (!this.shouldSimulate()) {
      if (this.simulationAwake) this.sleepSimulation(time);
      if (this.dead && time >= this.respawnAt) this.respawn(time);
      return;
    }
    if (!this.simulationAwake) this.wakeSimulation(time);

    if (this.dead) {
      if (time >= this.respawnAt) this.respawn(time);
      else {
        const p = clamp((time - this.deathStartedAt) / 680, 0, 1);
        this.sprite.setAlpha(1 - p).setScale(this.def.scale * (1 - p * 0.20));
        this.nameplate.setVisible(false);
      }
      return;
    }

    this.updateAscendance(time);

    if (this.knockbackUntil > time) {
      this.body.setVelocity(this.knockbackVX, this.knockbackVY);
      this.renderLoop('hurt', time, 70);
      this.syncPresentation(time); return;
    }
    if (this.knockbackUntil) { this.knockbackUntil = 0; this.knockbackVX = 0; this.knockbackVY = 0; }

    if (this.combat?.statuses?.actionLocked(this)) {
      this.body.setVelocity(0);
      if (this.currentAbility) this.finishAbility(time, 240);
      this.state = 'recover'; this.stateUntil = Math.max(this.stateUntil, time + 180);
    }

    if (this.state === 'rush_charge') this.updateRushCharge(time);
    else if (this.state === 'rush_dash') this.updateRushDash(time);
    else if (this.state === 'ability') { this.body.setVelocity(0); this.updateCastAbility(time); }
    else if (this.state === 'recover' && time < this.stateUntil) { this.body.setVelocity(0); this.renderLoop('idle', time, 150); }
    else {
      if (time >= this.nextThink) { this.nextThink = time + 115; this.decide(time, actors); }
      const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
      if (speed > 8) this.renderLoop('walk', time, this.state === 'stalk' ? 64 : 82);
      else this.renderLoop(this.target ? 'idle' : 'idle', time, this.target ? 150 : 220);
    }
    this.syncPresentation(time);
  }

  syncPresentation(time) {
    const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    const hover = this.dead ? 0 : Math.sin((time + 90) * 0.0068) * (speed > 8 ? 1.8 : 1.25);
    this.sprite.setPosition(this.body.x, this.body.y - 2 + hover).setDepth(this.body.y + 4);
    this.nameplate.setPosition(this.body.x, this.body.y - 86 + hover).setDepth(this.body.y + 9000);
    this.debugText.setPosition(this.body.x, this.body.y + 40).setDepth(this.body.y + 16020);
    this.updateHealthBar();
    if (time < this.hurtUntil) this.sprite.setTintFill(0xffffff); else this.sprite.clearTint();
    if (this.debugEnabled && !this.dead) {
      const node = actorNode(this.target);
      const distance = node ? Math.round(Math.hypot(node.x - this.body.x, node.y - this.body.y)) : 0;
      const asc = Math.ceil(Math.max(0, this.ascendanceUntil - time) / 1000);
      this.debugText.setText(`AI ${this.state.toUpperCase()}  •  ${this.lastActionName}\nTarget: ${this.target?.def?.name || this.target?.name || 'none'} (${distance}px)\nHP ${Math.ceil(this.hp)}/${this.def.maxHp}  •  Ascendance ${asc}s  •  Internal Lv ${this.def.internalLevel}`);
    }
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, options = {}) {
    if (this.dead) return false;
    const reduction = this.ascendanceActive(time) ? this.def.abilities.abyssalAscendance.damageTakenMultiplier : 1;
    const damage = Math.max(1, Math.floor(amount * reduction));
    this.hp = Math.max(0, this.hp - damage);
    this.hurtUntil = Math.max(this.hurtUntil, time + 100);
    if (options.knockback) {
      const retained = Math.max(0.05, 1 - (this.def.staggerResistance || 0));
      const power = options.knockback * retained;
      if (power >= 8) {
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.body.x, this.body.y);
        this.knockbackVX = Math.cos(angle) * power; this.knockbackVY = Math.sin(angle) * power;
        this.knockbackUntil = Math.max(this.knockbackUntil, time + 110);
      }
    }
    if (this.hp <= 0) this.die(time);
    return true;
  }

  die(time) {
    if (this.dead) return;
    this.dead = true; this.state = 'dead'; this.deathStartedAt = time; this.respawnAt = time + this.def.respawnMs;
    this.body.setVelocity(0); this.body.body.enable = false;
    this.currentAbility = null; this.abilityTelegraph?.destroy?.(); this.abilityTelegraph = null;
    this.ascendanceUntil = 0; this.ascendanceGraphics.clear().setVisible(false);
    this.combat?.statuses?.clear(this); this.target = null;
    this.lastActionName = 'Banished'; this.debugText.setVisible(false);
  }

  respawn(time) {
    this.dead = false; this.hp = this.def.maxHp;
    this.body.setPosition(this.homeX, this.homeY).setVelocity(0); this.body.body.enable = true;
    this.sprite.setActive(true).setVisible(true).setAlpha(1).setScale(this.def.scale).clearTint();
    this.nameplate.setVisible(true);
    this.target = null; this.currentAbility = null; this.abilityCooldowns.clear(); this.majorAbilityLockUntil = 0;
    this.ascendanceUntil = 0; this.nextAscendancePulseAt = 0; this.ascendanceGraphics.clear().setVisible(false);
    this.state = 'idle'; this.stateUntil = time + 420; this.nextThink = time + 330;
    this.lastActionName = 'Bloodwing vigil'; this.debugText.setVisible(this.debugEnabled); this.renderFrame('idle', 0);
  }

  relocateForFieldTest(x, y, time = this.scene.time.now) {
    const nextX = Number(x), nextY = Number(y);
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return false;
    this.abilityTelegraph?.destroy?.(); this.abilityTelegraph = null; this.currentAbility = null; this.abilityTriggered = false;
    this.combat?.statuses?.clear(this);
    this.homeX = nextX; this.homeY = nextY; this.respawn(time);
    this.sprite.setPosition(nextX, nextY).setDepth(nextY + 3);
    this.nameplate.setPosition(nextX, nextY - 86).setDepth(nextY + 9000);
    this.lastActionName = 'Solo-test vigil';
    return true;
  }

  snapshot(time = this.scene.time.now) {
    const node = actorNode(this.target);
    return {
      active: !this.dead, name: this.def.displayName, title: this.def.title, levelDisplay: this.def.levelDisplay,
      hp: Math.ceil(this.hp), maxHp: this.def.maxHp, state: this.state, action: this.lastActionName,
      target: this.target?.def?.name || this.target?.name || null,
      targetDistance: node ? Math.round(Math.hypot(node.x - this.body.x, node.y - this.body.y)) : null,
      ascendanceRemainingMs: Math.max(0, this.ascendanceUntil - time),
      internalLevel: this.debugEnabled ? this.def.internalLevel : null,
      cooldowns: Object.fromEntries(Object.values(this.def.abilities).map(ability => [ability.id, Math.max(0, (this.abilityCooldowns.get(ability.id) || 0) - time)]))
    };
  }

  destroy() {
    this.abilityTelegraph?.destroy?.();
    this.ascendanceGraphics?.destroy?.();
    this.body.destroy(); this.sprite.destroy(); this.nameplate.destroy(); this.debugText.destroy();
  }
}
