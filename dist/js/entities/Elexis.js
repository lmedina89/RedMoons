import { areHostile, areFriendly } from '../data/factions.js';
import { isWorthyTarget } from '../data/powerTiers.js';

const FRAME_COUNTS = Object.freeze({ spellcast: 7, thrust: 8, walk: 9, slash: 6, shoot: 13, hurt: 6, idle: 2 });
const IDLE_SEQUENCE = Object.freeze([0, 0, 1, 0, 1, 0]);

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function factionOf(actor) { return actor?.faction || actor?.def?.faction || null; }
function tierOf(actor) { return actor?.tier || actor?.def?.tier || null; }

export class Elexis {
  constructor(scene, definition) {
    this.scene = scene;
    this.def = definition;
    this.faction = definition.faction;
    this.isFriendlyActor = true;
    this.uniqueActor = true;
    this.combat = null;

    this.homeX = definition.home.x;
    this.homeY = definition.home.y;
    this.body = scene.physics.add.sprite(this.homeX, this.homeY, 'solid').setVisible(false);
    this.body.body.setSize(20, 17, false).setOffset(-9, 2).setCollideWorldBounds(true);
    this.sprite = scene.add.sprite(this.homeX, this.homeY, definition.assets.idle, 0)
      .setOrigin(0.5, 0.72).setScale(definition.scale).setDepth(this.homeY + 3);

    this.direction = 2;
    this.hp = definition.maxHp;
    this.dead = false;
    this.state = 'idle';
    this.stateUntil = 0;
    this.target = null;
    this.supportTarget = null;
    this.nextThink = 0;
    this.animClock = Math.random() * 700;
    this.currentAbility = null;
    this.abilityStartedAt = 0;
    this.abilityTargetX = this.homeX;
    this.abilityTargetY = this.homeY;
    this.abilityTriggered = false;
    this.abilityTelegraph = null;
    this.abilityCooldowns = new Map();
    this.majorAbilityLockUntil = 0;
    this.repositionSign = Math.random() < 0.5 ? -1 : 1;
    this.repositionFlipAt = 0;

    this.crownUntil = 0;
    this.nextCrownPulseAt = 0;
    this.nextCrownDrawAt = 0;
    this.crownGraphics = scene.add.graphics().setVisible(false).setDepth(this.homeY - 2);

    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.deathStartedAt = 0;
    this.respawnAt = 0;
    this.debugEnabled = false;
    this.simulationAwake = true;
    this.lastActionName = 'Maternal vigil';

    this.createNameplate();
    this.createDebugLabel();
    this.renderLoop('idle', 0, 230);
  }

  createNameplate() {
    this.nameplate = this.scene.add.container(this.body.x, this.body.y - 86).setDepth(9100);
    const plate = this.scene.add.graphics();
    plate.fillStyle(0x0a0b15, 0.92).fillRoundedRect(-118, -25, 236, 51, 10);
    plate.lineStyle(1.2, 0xf7e7a8, 0.95).strokeRoundedRect(-118, -25, 236, 51, 10);
    plate.lineStyle(1, 0xcabaff, 0.66).strokeRoundedRect(-114, -21, 228, 43, 8);
    // Seven-point crown seal: El’exis is Dominion/protection rather than
    // Lailani's open halo or Azrael's wing crest.
    plate.lineStyle(1.5, 0xffffff, 0.82);
    const cx = -94, cy = -4;
    plate.lineBetween(cx - 9, cy + 5, cx - 7, cy - 5);
    plate.lineBetween(cx - 7, cy - 5, cx - 2, cy + 1);
    plate.lineBetween(cx - 2, cy + 1, cx, cy - 8);
    plate.lineBetween(cx, cy - 8, cx + 3, cy + 1);
    plate.lineBetween(cx + 3, cy + 1, cx + 8, cy - 5);
    plate.lineBetween(cx + 8, cy - 5, cx + 10, cy + 5);
    plate.lineBetween(cx - 9, cy + 5, cx + 10, cy + 5);
    plate.fillStyle(0xffec9f, 0.95).fillCircle(cx, cy - 9, 1.5);

    this.nameText = this.scene.add.text(8, -22, 'EL’EXIS', {
      fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'bold', color: '#fff2bd',
      stroke: '#170d20', strokeThickness: 3, letterSpacing: 0.6
    }).setOrigin(0.5, 0);
    this.titleText = this.scene.add.text(8, -8, 'MOTHER OF THE HOST', {
      fontFamily: 'Georgia, serif', fontSize: '8px', fontStyle: 'bold', color: '#e5ddff',
      stroke: '#0b0d19', strokeThickness: 2, letterSpacing: 0.35
    }).setOrigin(0.5, 0);
    this.levelText = this.scene.add.text(8, 4, 'Lv. ???  •  CELESTIAL MYTHIC', {
      fontFamily: 'Arial, sans-serif', fontSize: '7px', color: '#e9f6ff',
      stroke: '#071018', strokeThickness: 2, letterSpacing: 0.15
    }).setOrigin(0.5, 0);

    this.healthBack = this.scene.add.graphics();
    this.healthBack.fillStyle(0x150d18, 0.92).fillRoundedRect(-76, 18, 152, 5, 2);
    this.healthBar = this.scene.add.graphics();
    this.nameplate.add([plate, this.nameText, this.titleText, this.levelText, this.healthBack, this.healthBar]);
    this.updateHealthBar();
  }

  createDebugLabel() {
    this.debugText = this.scene.add.text(this.body.x, this.body.y + 40, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '8px', color: '#f0edff',
      backgroundColor: 'rgba(8,8,18,0.84)', stroke: '#090b15', strokeThickness: 2, padding: { x: 4, y: 3 }
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
    this.healthBar.fillStyle(0xffe59b, 0.98).fillRoundedRect(-75, 19, 150 * ratio, 3, 1);
    if (ratio > 0.35) this.healthBar.fillStyle(0xe6ddff, 0.56).fillRect(-74, 19, 148 * ratio, 1);
  }

  cooldownReady(id, time) { return time >= (this.abilityCooldowns.get(id) || 0); }
  setCooldown(ability, time) { this.abilityCooldowns.set(ability.id, time + ability.cooldownMs); }
  majorReady(time) { return time >= this.majorAbilityLockUntil; }
  crownActive(time = this.scene.time.now) { return !this.dead && time < this.crownUntil; }

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
    this.supportTarget = null;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityTriggered = false;
    this.state = 'idle';
    this.stateUntil = time;
    this.lastActionName = 'Distant vigil';
    this.crownGraphics.clear().setVisible(false);
    this.debugText?.setVisible(false);
  }

  wakeSimulation(time) {
    const wasSleeping = !this.simulationAwake;
    this.simulationAwake = true;
    if (wasSleeping && this.crownActive(time)) this.nextCrownPulseAt = time + this.def.abilities.crownDominion.pulseEveryMs;
    this.debugText?.setVisible(this.debugEnabled && !this.dead);
  }

  activeHostiles(enemies = []) { return enemies.filter(enemy => actorAlive(enemy) && areHostile(this, enemy)); }

  clusterCount(enemy, enemies, radius) {
    const p = actorNode(enemy);
    if (!p) return 0;
    const rr = radius * radius;
    let count = 0;
    for (const other of enemies) {
      if (!actorAlive(other) || !areHostile(this, other)) continue;
      const op = actorNode(other);
      const dx = op.x - p.x, dy = op.y - p.y;
      if (dx * dx + dy * dy <= rr) count += 1;
    }
    return count;
  }

  chooseTarget(enemies) {
    let best = null;
    let bestScore = Infinity;
    const throne = this.def.abilities.throneBeyondHeaven;
    for (const enemy of enemies) {
      const p = actorNode(enemy);
      if (!p) continue;
      const homeDistance = Math.hypot(p.x - this.homeX, p.y - this.homeY);
      if (homeDistance > this.def.leashRange) continue;
      const distance = Math.hypot(p.x - this.body.x, p.y - this.body.y);
      if (distance > this.def.senseRange) continue;
      const cluster = this.clusterCount(enemy, enemies, throne.targetClusterRadius);
      const score = distance - Math.max(0, cluster - 1) * 42;
      if (score < bestScore) { best = enemy; bestScore = score; }
    }
    return best;
  }

  vitalsFor(target) { return this.combat?.sanctuaryVitals?.(target) || null; }

  healScaleFor(target) {
    if (!target) return 0;
    if (target === this) return 1;
    if (target === this.scene?.player || target.isPlayer) return 1;
    return tierOf(target) === 'mythic' ? 0.46 : 1;
  }

  healTarget(target, pct, x = null, y = null) {
    if (!this.combat || !actorAlive(target) || !areFriendly(this, target)) return 0;
    const vitals = this.vitalsFor(target);
    if (!vitals || vitals.hp >= vitals.maxHp) return 0;
    const amount = Math.min(vitals.maxHp - vitals.hp, Math.max(1, Math.round(vitals.maxHp * Math.max(0, pct) * this.healScaleFor(target))));
    if (!amount) return 0;
    vitals.set(vitals.hp + amount);
    const node = actorNode(target);
    this.combat.damageNumbers?.showHealing?.(node.x, node.y - 34, amount);
    this.combat.fx?.burst?.(node.x, node.y - 12, 'heal', target === this ? 0.76 : 0.58);
    if (Number.isFinite(x) && Number.isFinite(y)) this.combat.fx?.ring?.(x, y, 42, 'heal', 300);
    return amount;
  }

  guardTarget(target, durationMs) {
    if (!this.combat || !actorAlive(target) || !areFriendly(this, target)) return false;
    return this.combat.statuses?.apply?.(target, 'guard', {
      power: this.def.attack, x: this.body.x, y: this.body.y, team: 'celestial', sourceActor: this
    }, { durationMs });
  }

  supportNeed() {
    if (!this.combat) return null;
    let best = null;
    for (const ally of this.combat.friendlyTargetsFor(this)) {
      if (!actorAlive(ally)) continue;
      const node = actorNode(ally);
      const distance = Math.hypot(node.x - this.body.x, node.y - this.body.y);
      if (distance > this.def.senseRange) continue;
      const vitals = this.vitalsFor(ally);
      if (!vitals) continue;
      const missing = Math.max(0, vitals.maxHp - vitals.hp) / vitals.maxHp;
      if (missing <= 0.01) continue;
      let nearbyWounded = 0;
      for (const other of this.combat.friendlyTargetsFor(this)) {
        if (!actorAlive(other)) continue;
        const op = actorNode(other);
        if (Math.hypot(op.x - node.x, op.y - node.y) > 180) continue;
        const ov = this.vitalsFor(other);
        if (ov && ov.hp / ov.maxHp < 0.80) nearbyWounded += 1;
      }
      const commonAngelBonus = factionOf(ally) === 'celestial' && tierOf(ally) !== 'mythic' ? 0.055 : 0;
      const score = missing + Math.min(0.18, nearbyWounded * 0.045) + commonAngelBonus - distance * 0.00005;
      if (!best || score > best.score) best = { ally, node, missing, score, distance };
    }
    return best;
  }

  damageTarget(target, multiplier, x = this.body.x, y = this.body.y, knockback = 0) {
    if (!this.combat || !actorAlive(target) || !areHostile(this, target)) return 0;
    return this.combat.resolver.damageTarget(target, this.def.attack * multiplier, {
      type: 'celestial', sourceX: x, sourceY: y, knockback,
      impact: 'celestial', sourceTeam: 'celestial', sourceActor: this
    });
  }

  damageInRadius(x, y, radius, multiplier, knockback = 0, options = {}) {
    if (!this.combat) return 0;
    let hits = 0;
    for (const target of this.combat.hostileTargetsFor(this)) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      const amount = this.damageTarget(target, multiplier, x, y, knockback);
      if (!amount) continue;
      hits += 1;
      if (options.slowMs) this.combat.statuses?.apply?.(target, 'slow', { power: this.def.attack, x, y, team: 'celestial', sourceActor: this }, { durationMs: options.slowMs });
      if (options.staggerMs) this.combat.statuses?.apply?.(target, 'stagger', { power: this.def.attack, x, y, team: 'celestial', sourceActor: this }, { durationMs: options.staggerMs });
    }
    return hits;
  }

  damageCone(range, arcDegrees, multiplier, knockback) {
    if (!this.combat) return 0;
    const facing = [[0, -1], [-1, 0], [0, 1], [1, 0]][this.direction] || [0, 1];
    const cosThreshold = Math.cos((arcDegrees || 140) * Math.PI / 360);
    let hits = 0;
    for (const target of this.combat.hostileTargetsFor(this)) {
      const node = actorNode(target);
      const dx = node.x - this.body.x, dy = node.y - this.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > range) continue;
      const dot = distance ? (dx / distance) * facing[0] + (dy / distance) * facing[1] : 1;
      if (dot < cosThreshold) continue;
      if (this.damageTarget(target, multiplier, this.body.x, this.body.y, knockback)) hits += 1;
    }
    return hits;
  }

  burst(x, y, kind = 'celestial', scale = 1) { this.combat?.fx?.burst?.(x, y, kind, scale); }
  ring(x, y, radius, kind = 'celestial', duration = 420) { this.combat?.fx?.ring?.(x, y, radius, kind, duration); }

  makeAnimatedTelegraph(duration, draw, depth = 8460) {
    const g = this.scene.add.graphics().setDepth(depth);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 38, loop: true, callback: () => {
      if (!g.active) return;
      const elapsed = this.scene.time.now - started;
      const p = clamp(elapsed / Math.max(1, duration), 0, 1);
      g.clear();
      draw(g, p, elapsed);
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); if (g.active) g.destroy(); } };
  }

  fxCrownInvocation(duration) {
    const x = this.body.x, y = this.body.y;
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const gather = 1.26 - p * 0.28;
      const alpha = 0.30 + p * 0.62;
      g.lineStyle(2.7, 0xffffff, alpha * 0.90).strokeCircle(x, y, 104 * gather);
      g.lineStyle(2.1, 0xffe69a, alpha).strokeCircle(x, y, 72 * gather);
      g.lineStyle(1.6, 0xc9b9ff, alpha * 0.86).strokeCircle(x, y, 44);
      const rot = elapsed * 0.0014;
      for (let i = 0; i < 7; i += 1) {
        const a = i * Math.PI * 2 / 7 + rot;
        const r = 78 * gather;
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.56;
        g.lineStyle(2, i % 2 ? 0xd9ceff : 0xffefb0, alpha * 0.78);
        g.lineBetween(px - 6, py + 4, px, py - 6);
        g.lineBetween(px, py - 6, px + 6, py + 4);
        g.lineBetween(px - 6, py + 4, px + 6, py + 4);
      }
    }, 8480);
  }

  activateCrown(time) {
    const ability = this.def.abilities.crownDominion;
    this.crownUntil = time + ability.durationMs;
    this.nextCrownPulseAt = time + ability.pulseEveryMs;
    this.nextCrownDrawAt = 0;
    this.crownGraphics.setVisible(true);
    this.ring(this.body.x, this.body.y, ability.auraRadius, 'celestial', 760);
    this.scene.time.delayedCall(70, () => this.ring(this.body.x, this.body.y, ability.auraRadius * 0.68, 'heal', 650));
    for (let i = 0; i < 7; i += 1) {
      const a = i * Math.PI * 2 / 7;
      this.scene.time.delayedCall(i * 22, () => this.burst(this.body.x + Math.cos(a) * 54, this.body.y + Math.sin(a) * 30 - 14, i % 2 ? 'celestial' : 'heal', 0.74));
    }
    this.combat?.audio?.play?.('sanctuary_first_light', { volume: 0.08, throttleMs: 650 });
  }

  crownPulse(time) {
    const ability = this.def.abilities.crownDominion;
    let healed = 0;
    for (const ally of this.combat?.friendlyTargetsFor?.(this) || []) {
      if (!actorAlive(ally)) continue;
      const node = actorNode(ally);
      if (Math.hypot(node.x - this.body.x, node.y - this.body.y) > ability.auraRadius) continue;
      const pct = ally === this
        ? ability.selfHealPct
        : (ally === this.scene.player || ally.isPlayer ? ability.playerHealPct : ability.celestialHealPct);
      healed += this.healTarget(ally, pct) > 0 ? 1 : 0;
      this.guardTarget(ally, ability.guardDurationMs);
    }
    const hits = this.damageInRadius(this.body.x, this.body.y, ability.auraRadius * 0.82, ability.retaliationMultiplier, 24);
    this.ring(this.body.x, this.body.y, ability.auraRadius, 'celestial', 540);
    this.scene.time.delayedCall(60, () => this.ring(this.body.x, this.body.y, ability.auraRadius * 0.74, healed ? 'heal' : 'celestial', 470));
    for (let i = 0; i < 7; i += 1) {
      const a = i * Math.PI * 2 / 7 + time * 0.001;
      this.burst(this.body.x + Math.cos(a) * 68, this.body.y + Math.sin(a) * 36 - 12, i % 2 ? 'celestial' : 'heal', 0.48);
    }
    if (hits) this.combat?.shakeAt?.(this.body.x, this.body.y, 75, 0.0016, 360);
  }

  updateCrown(time) {
    if (!this.crownActive(time)) {
      if (this.crownGraphics.visible) this.crownGraphics.clear().setVisible(false);
      return;
    }
    const ability = this.def.abilities.crownDominion;
    if (time >= this.nextCrownPulseAt) {
      this.nextCrownPulseAt += ability.pulseEveryMs;
      this.crownPulse(time);
    }
    if (time < this.nextCrownDrawAt) return;
    this.nextCrownDrawAt = time + 72;
    const elapsed = ability.durationMs - Math.max(0, this.crownUntil - time);
    const rot = elapsed * 0.0010;
    const breathe = 0.94 + Math.sin(elapsed * 0.0048) * 0.055;
    const g = this.crownGraphics;
    g.clear().setVisible(true).setPosition(this.body.x, this.body.y).setDepth(this.body.y - 2);
    g.fillStyle(0xe8e2ff, 0.032).fillCircle(0, 0, 92 * breathe);
    g.lineStyle(2.3, 0xffe99f, 0.54).strokeEllipse(0, 1, 148 * breathe, 58 * breathe);
    g.lineStyle(1.7, 0xd6caff, 0.58).strokeEllipse(0, 0, 116 * breathe, 45 * breathe);
    for (let i = 0; i < 7; i += 1) {
      const a = i * Math.PI * 2 / 7 + rot;
      const r = 64 + (i % 2) * 9;
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.44;
      g.lineStyle(1.8, i % 2 ? 0xffffff : 0xffe6a0, 0.64);
      g.lineBetween(x - 6, y + 4, x, y - 7);
      g.lineBetween(x, y - 7, x + 6, y + 4);
      g.lineBetween(x - 6, y + 4, x + 6, y + 4);
    }
  }

  fxSpearTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const alpha = 0.28 + p * 0.64;
      const r = radius * (1.40 - p * 0.40);
      g.lineStyle(2.6, 0xffe8a0, alpha).strokeCircle(x, y, r);
      g.lineStyle(1.8, 0xd7cbff, alpha * 0.92).strokeCircle(x, y, r * 0.62);
      const rot = elapsed * 0.0015;
      for (let i = 0; i < 7; i += 1) {
        const a = i * Math.PI * 2 / 7 + rot;
        g.lineStyle(i === 0 ? 2.8 : 1.3, i % 2 ? 0xffffff : 0xd7cbff, alpha * 0.76);
        g.lineBetween(x + Math.cos(a) * r * 0.70, y + Math.sin(a) * r * 0.70, x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      g.lineStyle(3, 0xffffff, alpha * 0.72).lineBetween(x, y - 118, x, y - 16);
    }, 8500);
  }

  fxSpearImpact(x, y, radius) {
    const g = this.scene.add.graphics().setDepth(8660);
    g.lineStyle(12, 0xffffff, 0.30).lineBetween(x, y - 150, x, y + 5);
    g.lineStyle(5, 0xffe49a, 0.92).lineBetween(x, y - 142, x, y + 4);
    g.lineStyle(2.5, 0xd6c9ff, 0.96).lineBetween(x + 4, y - 132, x, y + 4);
    g.lineStyle(3, 0xffffff, 0.82).strokeCircle(x, y, radius);
    g.lineStyle(2, 0xffe49a, 0.74).strokeCircle(x, y, radius * 0.62);
    this.scene.tweens.add({ targets: g, y: 9, alpha: 0, duration: 430, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.burst(x, y - 8, 'celestial', 1.15);
    this.ring(x, y, radius * 1.15, 'celestial', 420);
  }

  fxChainsTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const alpha = 0.26 + p * 0.62;
      const r = radius * (1.12 - p * 0.12);
      g.lineStyle(2.4, 0xd7c8ff, alpha).strokeCircle(x, y, r);
      g.lineStyle(1.8, 0xffe7a0, alpha * 0.88).strokeCircle(x, y, r * 0.72);
      const rot = elapsed * -0.001;
      for (let i = 0; i < 7; i += 1) {
        const a = i * Math.PI * 2 / 7 + rot;
        const sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r;
        const ex = x + Math.cos(a) * r * 0.42, ey = y + Math.sin(a) * r * 0.42;
        g.lineStyle(2, i % 2 ? 0xffffff : 0xffe6a0, alpha * 0.72).lineBetween(sx, sy, ex, ey);
        const mx = (sx + ex) / 2, my = (sy + ey) / 2;
        g.lineStyle(1, 0xffffff, alpha * 0.70).strokeCircle(mx, my, 3.5);
      }
    }, 8490);
  }

  fxChainsImpact(x, y, radius) {
    const g = this.scene.add.graphics().setDepth(8620);
    g.lineStyle(2.2, 0xd7c8ff, 0.88).strokeCircle(x, y, radius);
    g.lineStyle(2, 0xffe7a0, 0.78).strokeCircle(x, y, radius * 0.64);
    for (const target of this.combat?.hostileTargetsFor?.(this) || []) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      g.lineStyle(2.6, 0xffffff, 0.72).lineBetween(x, y, node.x, node.y);
      g.lineStyle(1.2, 0xcbb9ff, 0.94).lineBetween(x + 4, y, node.x + 4, node.y);
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 520, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius, 'blueflame', 520);
  }

  fxSeverance() {
    const facing = [[0, -1], [-1, 0], [0, 1], [1, 0]][this.direction] || [0, 1];
    const angle = Math.atan2(facing[1], facing[0]);
    const g = this.scene.add.graphics().setDepth(8590);
    const x = this.body.x, y = this.body.y;
    const drawArc = (radius, width, color, alpha, offset) => {
      let prev = null;
      for (let i = 0; i <= 14; i += 1) {
        const t = i / 14;
        const a = angle - 1.05 + t * 2.10 + offset;
        const px = x + Math.cos(a) * radius, py = y + Math.sin(a) * radius * 0.76;
        if (prev) g.lineStyle(width, color, alpha).lineBetween(prev.x, prev.y, px, py);
        prev = { x: px, y: py };
      }
    };
    drawArc(112, 5.2, 0xffffff, 0.72, 0);
    drawArc(126, 2.4, 0xffe49c, 0.95, -0.08);
    drawArc(96, 2.0, 0xd7c9ff, 0.90, 0.10);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 340, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.burst(x + facing[0] * 74, y + facing[1] * 56 - 10, 'celestial', 0.86);
  }

  fxEdictTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const alpha = 0.26 + p * 0.62;
      const r = radius * (1.08 - p * 0.08);
      g.fillStyle(0xe8e2ff, 0.025 + p * 0.035).fillCircle(x, y, r * 0.95);
      g.lineStyle(3, 0xffffff, alpha * 0.82).strokeCircle(x, y, r);
      g.lineStyle(2.1, 0xffe6a0, alpha).strokeCircle(x, y, r * 0.74);
      g.lineStyle(1.6, 0xcbbcff, alpha * 0.90).strokeCircle(x, y, r * 0.48);
      const rot = elapsed * 0.0008;
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI / 6 + rot * (i % 2 ? -1 : 1);
        const r0 = r * 0.74, r1 = r * (0.91 + (i % 3) * 0.025);
        g.lineStyle(i % 3 === 0 ? 2.6 : 1.3, i % 2 ? 0xd8ccff : 0xffe8a4, alpha * 0.72);
        g.lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
    }, 8485);
  }

  fxEdictField(x, y, radius, duration) {
    const g = this.scene.add.graphics().setDepth(8425);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 70, loop: true, callback: () => {
      if (!g.active) return;
      const elapsed = this.scene.time.now - started;
      if (elapsed >= duration) { timer.remove(false); g.destroy(); return; }
      const p = elapsed / duration;
      const breathe = 0.96 + Math.sin(elapsed * 0.004) * 0.035;
      const fade = Math.min(1, (1 - p) * 3.8);
      g.clear();
      g.fillStyle(0xe9e2ff, 0.030 * fade).fillCircle(x, y, radius * 0.92 * breathe);
      g.lineStyle(2.4, 0xffe7a4, 0.50 * fade).strokeCircle(x, y, radius * 0.96 * breathe);
      g.lineStyle(1.6, 0xcfc0ff, 0.48 * fade).strokeCircle(x, y, radius * 0.70 * breathe);
      for (let i = 0; i < 7; i += 1) {
        const a = i * Math.PI * 2 / 7 + elapsed * 0.0007;
        const px = x + Math.cos(a) * radius * 0.78, py = y + Math.sin(a) * radius * 0.78;
        g.lineStyle(1.5, i % 2 ? 0xffffff : 0xffe39a, 0.46 * fade);
        g.lineBetween(px - 5, py + 4, px, py - 6);
        g.lineBetween(px, py - 6, px + 5, py + 4);
      }
    }});
  }

  fxEdictPulse(x, y, radius, final = false) {
    this.ring(x, y, radius * (final ? 0.98 : 0.88), final ? 'celestial' : 'heal', final ? 560 : 480);
    const g = this.scene.add.graphics().setDepth(8570);
    g.lineStyle(final ? 3.2 : 2.3, 0xffffff, 0.72).strokeEllipse(x, y - 12, 76, 24);
    g.lineStyle(1.8, 0xffe6a0, 0.72).strokeEllipse(x, y - 23, 46, 14);
    for (let i = 0; i < 7; i += 1) {
      const a = i * Math.PI * 2 / 7;
      g.lineStyle(1.6, i % 2 ? 0xcfc0ff : 0xffe7a2, 0.64)
        .lineBetween(x + Math.cos(a) * 34, y + Math.sin(a) * 20, x + Math.cos(a) * 58, y + Math.sin(a) * 32);
    }
    this.scene.tweens.add({ targets: g, y: -9, alpha: 0, duration: final ? 620 : 500, ease: 'Quad.out', onComplete: () => g.destroy() });
  }

  fxConstellationTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const alpha = 0.25 + p * 0.66;
      const rot = elapsed * 0.0008;
      const points = [];
      for (let i = 0; i < 6; i += 1) {
        const a = i * Math.PI / 3 + rot;
        const r = radius * (0.34 + (i % 2) * 0.22);
        points.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.72 });
      }
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i], b = points[(i + 2) % points.length];
        g.lineStyle(1.5, i % 2 ? 0xcfc0ff : 0xffe7a0, alpha * 0.58).lineBetween(a.x, a.y, b.x, b.y);
        g.fillStyle(0xffffff, alpha * 0.90).fillCircle(a.x, a.y, 2.3 + p * 1.7);
      }
      g.lineStyle(2.3, 0xffffff, alpha * 0.72).strokeCircle(x, y, radius * (0.62 + p * 0.10));
    }, 8490);
  }

  fxStarStrike(x, y, index, radius) {
    const g = this.scene.add.graphics().setDepth(8665);
    const lean = (index % 2 ? -1 : 1) * 20;
    g.lineStyle(9, 0xffffff, 0.30).lineBetween(x + lean, y - 128, x, y + 3);
    g.lineStyle(4, index % 2 ? 0xd4c4ff : 0xffe29a, 0.92).lineBetween(x + lean * 0.62, y - 118, x, y + 3);
    for (let i = 0; i < 6; i += 1) {
      const a = i * Math.PI / 3;
      g.lineStyle(1.7, 0xffffff, 0.72).lineBetween(x, y, x + Math.cos(a) * radius * 0.65, y + Math.sin(a) * radius * 0.48);
    }
    this.scene.tweens.add({ targets: g, alpha: 0, y: 8, duration: 390, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius, index % 2 ? 'blueflame' : 'celestial', 380);
    this.burst(x, y - 8, 'celestial', 0.92);
  }

  fxThroneTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const alpha = 0.24 + p * 0.68;
      const rot = elapsed * 0.00055;
      const gather = 1.12 - p * 0.12;
      g.fillStyle(0xded4ff, 0.026 + p * 0.035).fillCircle(x, y, radius * 0.92);
      g.lineStyle(3.2, 0xffffff, alpha * 0.86).strokeCircle(x, y, radius * gather);
      g.lineStyle(2.3, 0xffe19a, alpha).strokeCircle(x, y, radius * 0.74 * gather);
      g.lineStyle(1.8, 0xcbb9ff, alpha * 0.92).strokeCircle(x, y, radius * 0.46);
      for (let i = 0; i < 14; i += 1) {
        const a = i * Math.PI / 7 + rot * (i % 2 ? -1 : 1);
        const r0 = radius * 0.74 * gather, r1 = radius * (0.92 + (i % 2) * 0.04) * gather;
        g.lineStyle(i % 7 === 0 ? 3.3 : 1.4, i % 2 ? 0xd1c2ff : 0xffe6a0, alpha * 0.72)
          .lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
      // Throne/crown silhouette suspended above the execution point.
      const ty = y - radius * 0.58;
      g.lineStyle(2.5, 0xffffff, alpha * 0.80);
      g.lineBetween(x - 42, ty + 18, x - 34, ty - 10);
      g.lineBetween(x - 34, ty - 10, x - 15, ty + 4);
      g.lineBetween(x - 15, ty + 4, x, ty - 20);
      g.lineBetween(x, ty - 20, x + 16, ty + 4);
      g.lineBetween(x + 16, ty + 4, x + 35, ty - 10);
      g.lineBetween(x + 35, ty - 10, x + 43, ty + 18);
      g.lineBetween(x - 42, ty + 18, x + 43, ty + 18);
    }, 8510);
  }

  fxThroneBind(x, y, radius) {
    const g = this.scene.add.graphics().setDepth(8640);
    g.lineStyle(3, 0xcbb9ff, 0.82).strokeCircle(x, y, radius * 0.88);
    for (const target of this.combat?.hostileTargetsFor?.(this) || []) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      g.lineStyle(2.7, 0xffffff, 0.70).lineBetween(node.x, node.y, x, y);
      g.lineStyle(1.2, 0xffe3a0, 0.90).lineBetween(node.x + 5, node.y, x + 5, y);
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 500, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius * 0.90, 'blueflame', 520);
  }

  fxThroneExecution(x, y, radius) {
    const g = this.scene.add.graphics().setDepth(8680);
    for (let i = -2; i <= 2; i += 1) {
      const px = x + i * 34;
      g.lineStyle(i === 0 ? 17 : 10, 0xffffff, i === 0 ? 0.34 : 0.22).lineBetween(px, y - 190 - Math.abs(i) * 12, px, y + 8);
      g.lineStyle(i === 0 ? 6 : 4, i % 2 ? 0xd2c2ff : 0xffdf93, 0.92).lineBetween(px, y - 178 - Math.abs(i) * 10, px, y + 6);
    }
    g.lineStyle(4, 0xffffff, 0.82).strokeCircle(x, y, radius);
    g.lineStyle(2.8, 0xffe09a, 0.82).strokeCircle(x, y, radius * 0.72);
    g.lineStyle(2.1, 0xcab8ff, 0.88).strokeCircle(x, y, radius * 0.44);
    this.scene.tweens.add({ targets: g, alpha: 0, y: 10, duration: 660, ease: 'Quad.out', onComplete: () => g.destroy() });
    for (let i = 0; i < 10; i += 1) {
      const a = i * Math.PI / 5;
      this.scene.time.delayedCall((i % 3) * 18, () => this.burst(x + Math.cos(a) * radius * 0.52, y + Math.sin(a) * radius * 0.34 - 8, i % 2 ? 'celestial' : 'blueflame', 0.82));
    }
    this.ring(x, y, radius, 'celestial', 650);
  }

  beginAbility(ability, target, time, targetPoint = null) {
    this.body.setVelocity(0);
    this.currentAbility = ability;
    this.target = target && areHostile(this, target) ? target : this.target;
    this.supportTarget = target && areFriendly(this, target) ? target : null;
    const p = targetPoint || actorNode(target) || actorNode(this.target) || { x: this.body.x, y: this.body.y };
    this.abilityTargetX = p.x;
    this.abilityTargetY = p.y;
    this.abilityStartedAt = time;
    this.abilityTriggered = false;
    this.state = 'ability';
    this.setCooldown(ability, time);
    if (ability.major) this.majorAbilityLockUntil = Math.max(this.majorAbilityLockUntil, time + ability.majorLockMs);
    this.lastActionName = ability.name;

    if (ability.id === 'elexis_crown_dominion') this.abilityTelegraph = this.fxCrownInvocation(ability.windupMs);
    else if (ability.id === 'elexis_spear_firmament') this.abilityTelegraph = this.fxSpearTelegraph(this.abilityTargetX, this.abilityTargetY, ability.impactRadius, ability.windupMs);
    else if (ability.id === 'elexis_chains_seventh_throne') this.abilityTelegraph = this.fxChainsTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
    else if (ability.id === 'elexis_edict_sanctuary') this.abilityTelegraph = this.fxEdictTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
    else if (ability.id === 'elexis_heavenfall_constellation') this.abilityTelegraph = this.fxConstellationTelegraph(this.abilityTargetX, this.abilityTargetY, ability.targetClusterRadius, ability.windupMs);
    else if (ability.id === 'elexis_throne_beyond_heaven') this.abilityTelegraph = this.fxThroneTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
    else if (ability.id === 'elexis_astral_severance') {
      this.burst(this.body.x, this.body.y - 18, 'celestial', 0.72);
      this.ring(this.body.x, this.body.y, 54, 'celestial', 300);
    }
    this.combat?.audio?.play?.(ability.major ? 'seraphic_judgment' : 'celestial_strike', { volume: ability.major ? 0.075 : 0.05, throttleMs: 160 });
  }

  finishAbility(time, recoverMs = 260) {
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityTriggered = false;
    this.supportTarget = null;
    this.state = 'recover';
    this.stateUntil = time + recoverMs;
    this.body.setVelocity(0);
  }

  triggerCrown(ability, time) { this.activateCrown(time); }

  triggerSpear(ability) {
    const p = actorAlive(this.target) ? actorNode(this.target) : { x: this.abilityTargetX, y: this.abilityTargetY };
    const x = p.x, y = p.y;
    const hits = this.damageInRadius(x, y, ability.impactRadius, ability.damageMultiplier, ability.knockback);
    this.fxSpearImpact(x, y, ability.impactRadius);
    this.combat?.audio?.play?.('heavenfall', { volume: 0.082, throttleMs: 300 });
    if (hits) this.combat?.shakeAt?.(x, y, 105, 0.0030, 430);
  }

  triggerChains(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier, ability.knockback, {
      slowMs: ability.slowDurationMs, staggerMs: ability.staggerDurationMs
    });
    this.fxChainsImpact(x, y, ability.radius);
    this.combat?.audio?.play?.('seraphic_judgment', { volume: 0.068, throttleMs: 300 });
    if (hits >= 2) this.combat?.shakeAt?.(x, y, 90, 0.0022, 420);
  }

  triggerSeverance(ability) {
    const hits = this.damageCone(ability.range, ability.arcDegrees, ability.damageMultiplier, ability.knockback);
    this.fxSeverance();
    this.combat?.audio?.play?.('celestial_strike', { volume: 0.068, throttleMs: 90 });
    if (hits) this.combat?.shakeAt?.(this.body.x, this.body.y, 72, 0.0018, 330);
  }

  edictPulse(ability, x, y, index) {
    if (this.dead || !this.simulationAwake) return 0;
    const final = index >= ability.pulseDelays.length - 1;
    let healed = 0;
    for (const ally of this.combat?.friendlyTargetsFor?.(this) || []) {
      if (!actorAlive(ally)) continue;
      const node = actorNode(ally);
      if (Math.hypot(node.x - x, node.y - y) > ability.radius) continue;
      const pct = index === 0
        ? (ally === this ? ability.initialSelfHealPct : (ally === this.scene.player || ally.isPlayer ? ability.initialPlayerHealPct : ability.initialCelestialHealPct))
        : (ally === this ? ability.pulseSelfHealPct : (ally === this.scene.player || ally.isPlayer ? ability.pulsePlayerHealPct : ability.pulseCelestialHealPct));
      if (this.healTarget(ally, pct) > 0) healed += 1;
      this.guardTarget(ally, ability.guardDurationMs);
    }
    if (index === 0) {
      this.damageInRadius(x, y, ability.radius, ability.enemyDamageMultiplier, 20, { slowMs: ability.enemySlowMs, staggerMs: 360 });
    }
    this.fxEdictPulse(x, y, ability.radius, final);
    this.combat?.audio?.play?.('sanctuary_first_light', { volume: final ? 0.095 : 0.070, throttleMs: 780 });
    if (final && healed) this.combat?.shakeAt?.(x, y, 100, 0.0018, 500);
    return healed;
  }

  triggerEdict(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    this.fxEdictField(x, y, ability.radius, ability.fieldDurationMs);
    ability.pulseDelays.forEach((delay, index) => this.scene.time.delayedCall(delay, () => this.edictPulse(ability, x, y, index)));
    this.ring(x, y, ability.radius, 'heal', 680);
  }

  constellationPositions(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    const hostiles = (this.combat?.hostileTargetsFor?.(this) || [])
      .filter(target => {
        const p = actorNode(target);
        return p && Math.hypot(p.x - x, p.y - y) <= ability.targetClusterRadius * 1.15;
      });
    const points = [];
    for (let i = 0; i < ability.strikes; i += 1) {
      const target = hostiles[i % Math.max(1, hostiles.length)];
      if (target) {
        const p = actorNode(target);
        const a = i * 2.399963;
        points.push({ x: p.x + Math.cos(a) * (i % 2 ? 18 : 8), y: p.y + Math.sin(a) * (i % 2 ? 14 : 6) });
      } else {
        const a = i * Math.PI * 2 / ability.strikes - Math.PI / 2;
        const r = i % 2 ? ability.targetClusterRadius * 0.52 : ability.targetClusterRadius * 0.28;
        points.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.72 });
      }
    }
    return points;
  }

  triggerConstellation(ability) {
    const points = this.constellationPositions(ability);
    points.forEach((point, index) => this.scene.time.delayedCall(index * ability.strikeDelayMs, () => {
      if (this.dead || !this.simulationAwake) return;
      const hits = this.damageInRadius(point.x, point.y, ability.impactRadius, ability.damageMultiplier, index === points.length - 1 ? ability.knockback : 24);
      this.fxStarStrike(point.x, point.y, index, ability.impactRadius);
      this.combat?.audio?.play?.('celestial_strike', { volume: 0.048 + index * 0.004, throttleMs: 75 });
      if (index === points.length - 1 && hits) this.combat?.shakeAt?.(point.x, point.y, 125, 0.0035, 480);
    }));
  }

  triggerThrone(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    this.scene.time.delayedCall(ability.bindDelayMs, () => {
      if (this.dead || !this.simulationAwake) return;
      this.damageInRadius(x, y, ability.radius, ability.bindDamageMultiplier, 15, { slowMs: ability.slowDurationMs, staggerMs: ability.staggerDurationMs });
      this.fxThroneBind(x, y, ability.radius);
    });
    this.scene.time.delayedCall(ability.executionDelayMs, () => {
      if (this.dead || !this.simulationAwake) return;
      const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier, ability.knockback);
      this.fxThroneExecution(x, y, ability.radius);
      this.combat?.audio?.play?.('heavenfall', { volume: 0.115, throttleMs: 700 });
      this.combat?.shakeAt?.(x, y, hits >= 3 ? 230 : 180, hits >= 3 ? 0.0066 : 0.0048, 620);
    });
  }

  triggerCastAbility(ability, time) {
    if (ability.id === 'elexis_crown_dominion') this.triggerCrown(ability, time);
    else if (ability.id === 'elexis_spear_firmament') this.triggerSpear(ability);
    else if (ability.id === 'elexis_chains_seventh_throne') this.triggerChains(ability);
    else if (ability.id === 'elexis_astral_severance') this.triggerSeverance(ability);
    else if (ability.id === 'elexis_edict_sanctuary') this.triggerEdict(ability);
    else if (ability.id === 'elexis_heavenfall_constellation') this.triggerConstellation(ability);
    else if (ability.id === 'elexis_throne_beyond_heaven') this.triggerThrone(ability);
  }

  updateCastAbility(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const elapsed = Math.max(0, time - this.abilityStartedAt);
    const progress = clamp(elapsed / Math.max(1, ability.windupMs), 0, 0.999999);
    if (ability.id === 'elexis_astral_severance') this.renderProgress('slash', progress);
    else if (ability.id === 'elexis_spear_firmament') this.renderProgress('thrust', progress);
    else if (ability.id === 'elexis_heavenfall_constellation') this.renderProgress('shoot', progress);
    else if (ability.id === 'elexis_throne_beyond_heaven') {
      if (progress < 0.72) this.renderProgress('spellcast', progress / 0.72);
      else this.renderProgress('shoot', (progress - 0.72) / 0.28);
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

  decide(time, enemies) {
    const available = this.activeHostiles(enemies);
    if (!actorAlive(this.target) || (this.target && !areHostile(this, this.target))) this.target = null;
    if (this.target) {
      const p = actorNode(this.target);
      if (!p || Math.hypot(p.x - this.homeX, p.y - this.homeY) > this.def.leashRange || Math.hypot(p.x - this.body.x, p.y - this.body.y) > this.def.senseRange * 1.18) this.target = null;
    }
    if (!this.target) this.target = this.chooseTarget(available);

    const support = this.supportNeed();
    const edict = this.def.abilities.edictSanctuary;
    // Mother-of-the-Host rule: a materially wounded Celestial takes priority
    // over El’exis entering her own long-duration Crown state. This keeps her
    // defining protection identity visible in real combat instead of letting a
    // self-buff delay an immediately needed rescue field.
    if (support && support.missing >= edict.castMissingThreshold && this.majorReady(time) && this.cooldownReady(edict.id, time)) {
      if (support.distance <= edict.range) {
        this.beginAbility(edict, support.ally, time, { x: support.node.x, y: support.node.y });
        return;
      }
      const dx = support.node.x - this.body.x, dy = support.node.y - this.body.y;
      const d = Math.hypot(dx, dy) || 1;
      this.body.setVelocity(dx / d * this.def.glideSpeed, dy / d * this.def.glideSpeed);
      this.setDirection(dx, dy);
      this.state = 'protect';
      this.lastActionName = `Moving to shelter ${support.ally.def?.name || support.ally.name || 'the Host'}`;
      return;
    }

    const crown = this.def.abilities.crownDominion;
    if (!this.crownActive(time) && this.cooldownReady(crown.id, time) && (this.target || (support?.missing || 0) >= 0.08)) {
      this.beginAbility(crown, this.target || support?.ally || this, time, { x: this.body.x, y: this.body.y });
      return;
    }

    if (!this.target) {
      const dx = this.homeX - this.body.x, dy = this.homeY - this.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 50) {
        const inv = 1 / Math.max(1, distance);
        this.body.setVelocity(dx * inv * this.def.glideSpeed * 0.70, dy * inv * this.def.glideSpeed * 0.70);
        this.setDirection(dx, dy);
        this.state = 'return';
        this.lastActionName = 'Returning to the Host';
      } else {
        this.body.setVelocity(0);
        this.state = 'idle';
        this.lastActionName = this.crownActive(time) ? 'Dominion vigil' : 'Maternal vigil';
      }
      return;
    }

    const p = actorNode(this.target);
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy);
    this.setDirection(dx, dy);

    const throne = this.def.abilities.throneBeyondHeaven;
    const constellation = this.def.abilities.heavenfallConstellation;
    const throneCluster = this.clusterCount(this.target, available, throne.targetClusterRadius);
    const constellationCluster = this.clusterCount(this.target, available, constellation.targetClusterRadius);
    const worthyThrone = isWorthyTarget(this.target, throne.worthyTargetTier);
    const worthyConstellation = isWorthyTarget(this.target, constellation.worthyTargetTier);
    if (this.majorReady(time)) {
      if ((throneCluster >= throne.minCluster || worthyThrone) && distance <= throne.range && this.cooldownReady(throne.id, time)) {
        this.beginAbility(throne, this.target, time); return;
      }
      if ((constellationCluster >= constellation.minCluster || worthyConstellation) && distance <= constellation.range && this.cooldownReady(constellation.id, time)) {
        this.beginAbility(constellation, this.target, time); return;
      }
    }

    const chains = this.def.abilities.chainsSeventhThrone;
    const chainsCluster = this.clusterCount(this.target, available, chains.radius);
    const worthyChains = isWorthyTarget(this.target, chains.worthyTargetTier);
    if ((chainsCluster >= chains.minCluster || worthyChains) && distance <= chains.range && this.cooldownReady(chains.id, time)) {
      this.beginAbility(chains, this.target, time); return;
    }

    const severance = this.def.abilities.astralSeverance;
    if (distance <= severance.range && this.cooldownReady(severance.id, time)) {
      this.beginAbility(severance, this.target, time); return;
    }

    const spear = this.def.abilities.spearFirmament;
    if (distance <= spear.range && distance >= 90 && this.cooldownReady(spear.id, time)) {
      this.beginAbility(spear, this.target, time); return;
    }

    if (time >= this.repositionFlipAt) {
      this.repositionFlipAt = time + 900 + Math.random() * 520;
      if (Math.random() < 0.56) this.repositionSign *= -1;
    }
    const inv = 1 / Math.max(1, distance);
    const tx = dx * inv, ty = dy * inv;
    const px = -ty * this.repositionSign, py = tx * this.repositionSign;
    const approach = distance > this.def.preferredRange ? 0.84 : distance < 110 ? -0.32 : 0.12;
    const orbit = distance > this.def.preferredRange ? 0.24 : 0.58;
    const mx = tx * approach + px * orbit, my = ty * approach + py * orbit;
    const norm = Math.hypot(mx, my) || 1;
    const speed = distance > this.def.preferredRange ? this.def.glideSpeed : this.def.speed * 0.72;
    this.body.setVelocity(mx / norm * speed, my / norm * speed);
    this.setDirection(mx, my);
    this.state = 'dominion';
    this.lastActionName = `Measuring ${this.target.def?.name || 'hostile'} formation`;
  }

  update(time, delta, enemies) {
    this.animClock += delta;

    if (!this.shouldSimulate()) {
      if (this.simulationAwake) this.sleepSimulation(time);
      if (this.dead && time >= this.respawnAt) this.respawn(time);
      return;
    }
    this.wakeSimulation(time);
    this.updateCrown(time);

    if (this.dead) {
      this.body.setVelocity(0);
      const p = clamp((time - this.deathStartedAt) / 760, 0, 0.999999);
      this.renderProgress('hurt', p);
      if (time >= this.respawnAt) this.respawn(time);
      this.syncPresentation(time);
      return;
    }

    if (time < this.knockbackUntil) {
      this.body.setVelocity(this.knockbackVX, this.knockbackVY);
      this.setDirection(this.knockbackVX, this.knockbackVY);
      this.renderLoop('idle', time, 130);
      this.syncPresentation(time);
      return;
    }
    if (this.knockbackUntil) {
      this.knockbackUntil = 0;
      this.knockbackVX = 0;
      this.knockbackVY = 0;
    }

    if (this.combat?.statuses?.actionLocked(this)) {
      this.body.setVelocity(0);
      if (this.currentAbility) this.finishAbility(time, 220);
      this.state = 'recover';
      this.stateUntil = Math.max(this.stateUntil, time + 170);
    }

    if (this.state === 'ability') {
      this.body.setVelocity(0);
      this.updateCastAbility(time);
    } else if (this.state === 'recover' && time < this.stateUntil) {
      this.body.setVelocity(0);
      this.renderLoop('idle', time, 150);
    } else {
      if (time >= this.nextThink) {
        this.nextThink = time + 105;
        this.decide(time, enemies);
      }
      const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
      if (speed > 8) {
        this.renderLoop('walk', time, 78);
        if (Math.floor(time / 120) !== Math.floor((time - delta) / 120)) {
          const vx = this.body.body.velocity.x, vy = this.body.body.velocity.y;
          const v = Math.hypot(vx, vy) || 1;
          this.burst(this.body.x - vx / v * 14, this.body.y - vy / v * 12 - 8, Math.floor(time / 240) % 2 ? 'celestial' : 'blueflame', this.crownActive(time) ? 0.40 : 0.28);
        }
      } else this.renderLoop('idle', time, this.target ? 175 : 235);
    }

    this.syncPresentation(time);
  }

  syncPresentation(time) {
    const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    const hoverAmp = this.dead ? 0 : (speed > 8 ? 2.0 : 1.35);
    const hoverY = Math.sin((time + 640) * 0.0064) * hoverAmp;
    this.sprite.setPosition(this.body.x, this.body.y - 5 + hoverY).setDepth(this.body.y + 5);
    this.nameplate.setPosition(this.body.x, this.body.y - 87 + hoverY).setDepth(this.body.y + 9000);
    this.debugText.setPosition(this.body.x, this.body.y + 40).setDepth(this.body.y + 16020);
    this.updateHealthBar();

    if (time < this.hurtUntil) this.sprite.setTintFill(0xffffff);
    else this.sprite.clearTint();

    this.levelText?.setText(this.crownActive(time)
      ? 'Lv. ???  •  CROWN OF DOMINION'
      : 'Lv. ???  •  CELESTIAL MYTHIC');

    if (this.debugEnabled && !this.dead) {
      const targetNode = actorNode(this.target);
      const distance = targetNode ? Math.round(Math.hypot(targetNode.x - this.body.x, targetNode.y - this.body.y)) : 0;
      const crown = Math.ceil(Math.max(0, this.crownUntil - time) / 1000);
      const support = this.supportNeed();
      this.debugText.setText(`AI ${this.state.toUpperCase()}  •  ${this.lastActionName}\nTarget: ${this.target?.def?.name || 'none'} (${distance}px)\nHP ${Math.ceil(this.hp)}/${this.def.maxHp}  •  Crown ${crown}s  •  Need ${support ? Math.round(support.missing * 100) : 0}%`);
    }
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, options = {}) {
    if (this.dead) return false;
    const crown = this.def.abilities.crownDominion;
    const defended = this.crownActive(time) ? amount * crown.damageTakenMultiplier : amount;
    const damage = Math.max(1, Math.floor(defended));
    this.hp = Math.max(0, this.hp - damage);
    this.hurtUntil = Math.max(this.hurtUntil, time + 90);

    if (options.knockback) {
      const retained = Math.max(0.035, 1 - (this.def.staggerResistance || 0));
      const power = options.knockback * retained;
      if (power >= 7) {
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.body.x, this.body.y);
        this.knockbackVX = Math.cos(angle) * power;
        this.knockbackVY = Math.sin(angle) * power;
        this.knockbackUntil = Math.max(this.knockbackUntil, time + 90);
      }
    }

    if (this.hp <= 0) this.die(time);
    return true;
  }

  die(time) {
    if (this.dead) return;
    this.dead = true;
    this.state = 'dead';
    this.deathStartedAt = time;
    this.respawnAt = time + this.def.respawnMs;
    this.body.setVelocity(0);
    this.body.body.enable = false;
    this.currentAbility = null;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.crownUntil = 0;
    this.crownGraphics.clear().setVisible(false);
    this.sprite.setAlpha(0.88);
    this.nameplate.setVisible(false);
    this.debugText.setVisible(false);
    this.combat?.statuses?.clear?.(this);
    this.burst(this.body.x, this.body.y - 14, 'celestial', 1.3);
    this.ring(this.body.x, this.body.y, 92, 'celestial', 620);
  }

  respawn(time) {
    this.dead = false;
    this.hp = this.def.maxHp;
    this.body.body.enable = true;
    this.body.setPosition(this.homeX, this.homeY).setVelocity(0);
    this.sprite.setAlpha(1).setVisible(true).clearTint();
    this.nameplate.setVisible(true);
    this.target = null;
    this.supportTarget = null;
    this.currentAbility = null;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.abilityTriggered = false;
    this.abilityCooldowns.clear();
    this.majorAbilityLockUntil = time + 900;
    this.crownUntil = 0;
    this.crownGraphics.clear().setVisible(false);
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.respawnAt = 0;
    this.state = 'idle';
    this.stateUntil = time + 500;
    this.lastActionName = 'Maternal vigil';
    this.renderFrame('idle', 0);
    this.updateHealthBar();
  }

  relocateForFieldTest(x, y, time = this.scene.time.now) {
    this.homeX = x;
    this.homeY = y;
    this.respawn(time);
    this.body.setPosition(x, y);
    this.homeX = x;
    this.homeY = y;
    this.stateUntil = time + 360;
    this.lastActionName = 'Field-test vigil';
    this.syncPresentation(time);
    return true;
  }

  snapshot(time = this.scene.time.now) {
    return {
      id: this.def.id,
      name: this.def.name,
      title: this.def.title,
      hp: Math.ceil(this.hp), maxHp: this.def.maxHp,
      dead: this.dead,
      state: this.state,
      target: this.target?.def?.name || null,
      action: this.lastActionName,
      crownRemainingMs: Math.max(0, this.crownUntil - time),
      debug: this.debugEnabled
    };
  }

  destroy() {
    this.abilityTelegraph?.destroy?.();
    this.crownGraphics?.destroy?.();
    this.body?.destroy?.();
    this.sprite?.destroy?.();
    this.nameplate?.destroy?.();
    this.debugText?.destroy?.();
  }
}
