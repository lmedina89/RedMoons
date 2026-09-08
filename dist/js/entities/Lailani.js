import { areHostile } from '../data/factions.js';
import { isWorthyTarget } from '../data/powerTiers.js';

const FRAME_COUNTS = Object.freeze({
  spellcast: 7,
  thrust: 8,
  walk: 9,
  slash: 6,
  shoot: 13,
  hurt: 6,
  idle: 2
});

const IDLE_SEQUENCE = Object.freeze([0, 0, 1, 0, 1]);
const WALTZ_ANGLES = Object.freeze([0.18, 0.92, 1.58, 2.28]);

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

export class Lailani {
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

    this.passVX = 0;
    this.passVY = 0;
    this.passEndsAt = 0;
    this.nextPassTrailAt = 0;

    this.waltzStep = 0;
    this.nextWaltzStepAt = 0;
    this.waltzPhase = Math.random() * Math.PI * 2;

    this.orbitSign = Math.random() < 0.5 ? -1 : 1;
    this.orbitFlipAt = 0;
    this.nextTrailAt = 0;

    this.mantleUntil = 0;
    this.nextMantlePulseAt = 0;
    this.nextMantleDrawAt = 0;
    this.mantleGraphics = scene.add.graphics().setVisible(false).setDepth(this.homeY - 3);

    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.deathStartedAt = 0;
    this.respawnAt = 0;
    this.debugEnabled = false;
    this.simulationAwake = true;
    this.lastActionName = 'Transcendent vigil';

    this.createNameplate();
    this.createDebugLabel();
    this.renderLoop('idle', 0, 230);
  }

  createNameplate() {
    this.nameplate = this.scene.add.container(this.body.x, this.body.y - 82).setDepth(9100);
    const plate = this.scene.add.graphics();
    plate.fillStyle(0x090c14, 0.90).fillRoundedRect(-112, -23, 224, 48, 10);
    plate.lineStyle(1, 0xf8e8a8, 0.92).strokeRoundedRect(-112, -23, 224, 48, 10);
    plate.lineStyle(1, 0xbfeeff, 0.54).strokeRoundedRect(-108, -19, 216, 40, 8);
    // A small open halo with four drifting points differentiates her plate from
    // Azrael's wing seal without requiring another texture.
    plate.lineStyle(2, 0xffffff, 0.84).strokeEllipse(-91, -6, 14, 5);
    for (let i = 0; i < 4; i += 1) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      plate.fillStyle(i % 2 ? 0xcff7ff : 0xffefad, 0.92)
        .fillCircle(-91 + Math.cos(a) * 10, -6 + Math.sin(a) * 7, 1.4);
    }

    this.nameText = this.scene.add.text(8, -20, 'LAILANI', {
      fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'bold', color: '#fff3c7',
      stroke: '#18101d', strokeThickness: 3, letterSpacing: 0.55
    }).setOrigin(0.5, 0);
    this.titleText = this.scene.add.text(8, -6, 'TRANSCENDENT SERAPH', {
      fontFamily: 'Georgia, serif', fontSize: '8px', fontStyle: 'bold', color: '#dff9ff',
      stroke: '#08131b', strokeThickness: 2, letterSpacing: 0.35
    }).setOrigin(0.5, 0);
    this.levelText = this.scene.add.text(8, 5, 'Lv. ???  •  CELESTIAL MYTHIC', {
      fontFamily: 'Arial, sans-serif', fontSize: '7px', color: '#dff9ff',
      stroke: '#08131b', strokeThickness: 2, letterSpacing: 0.15
    }).setOrigin(0.5, 0);

    this.healthBack = this.scene.add.graphics();
    this.healthBack.fillStyle(0x140d16, 0.92).fillRoundedRect(-74, 17, 148, 5, 2);
    this.healthBar = this.scene.add.graphics();
    this.nameplate.add([plate, this.nameText, this.titleText, this.levelText, this.healthBack, this.healthBar]);
    this.updateHealthBar();
  }

  createDebugLabel() {
    this.debugText = this.scene.add.text(this.body.x, this.body.y + 39, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '8px', color: '#e9fbff',
      backgroundColor: 'rgba(5,9,17,0.82)', stroke: '#071015', strokeThickness: 2, padding: { x: 4, y: 3 }
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
    this.healthBar.fillStyle(0xffe89a, 0.96).fillRoundedRect(-73, 18, 146 * ratio, 3, 1);
    if (ratio > 0.35) this.healthBar.fillStyle(0xdffcff, 0.54).fillRect(-72, 18, 144 * ratio, 1);
  }

  cooldownReady(id, time) { return time >= (this.abilityCooldowns.get(id) || 0); }
  setCooldown(ability, time) { this.abilityCooldowns.set(ability.id, time + ability.cooldownMs); }
  majorReady(time) { return time >= this.majorAbilityLockUntil; }
  mantleActive(time = this.scene.time.now) { return !this.dead && time < this.mantleUntil; }

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
    this.lastActionName = 'Distant vigil';
    this.mantleGraphics.clear().setVisible(false);
    this.debugText?.setVisible(false);
  }

  wakeSimulation(time) {
    const wasSleeping = !this.simulationAwake;
    this.simulationAwake = true;
    if (wasSleeping && this.mantleActive(time)) {
      this.nextMantlePulseAt = time + this.def.abilities.mantleEmpyrean.pulseEveryMs;
    }
    this.debugText?.setVisible(this.debugEnabled && !this.dead);
  }

  activeHostiles(enemies = []) {
    return enemies.filter(enemy => actorAlive(enemy) && areHostile(this, enemy));
  }

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

  hostileCountNear(enemies, x, y, radius) {
    const rr = radius * radius;
    let count = 0;
    for (const enemy of enemies) {
      if (!actorAlive(enemy) || !areHostile(this, enemy)) continue;
      const p = actorNode(enemy);
      const dx = p.x - x, dy = p.y - y;
      if (dx * dx + dy * dy <= rr) count += 1;
    }
    return count;
  }

  chooseTarget(enemies) {
    let best = null;
    let bestScore = Infinity;
    const garden = this.def.abilities.gardenHeaven;
    for (const enemy of enemies) {
      const p = actorNode(enemy);
      if (!p) continue;
      const homeDistance = Math.hypot(p.x - this.homeX, p.y - this.homeY);
      if (homeDistance > this.def.leashRange) continue;
      const distance = Math.hypot(p.x - this.body.x, p.y - this.body.y);
      if (distance > this.def.senseRange) continue;
      const cluster = this.clusterCount(enemy, enemies, garden.targetClusterRadius);
      const score = distance - Math.max(0, cluster - 1) * 34;
      if (score < bestScore) { best = enemy; bestScore = score; }
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

  damageInRadius(x, y, radius, multiplier, knockback = 0, slowDurationMs = 0) {
    if (!this.combat) return 0;
    let hits = 0;
    for (const target of this.combat.hostileTargetsFor(this)) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      const amount = this.damageTarget(target, multiplier, x, y, knockback);
      if (!amount) continue;
      hits += 1;
      if (slowDurationMs) this.combat.statuses.apply(target, 'slow', {
        power: this.def.attack, x, y, team: 'celestial', sourceActor: this
      }, { durationMs: slowDurationMs });
    }
    return hits;
  }

  damageAlongSegment(ax, ay, bx, by, radius, multiplier, knockback = 0) {
    if (!this.combat) return 0;
    let hits = 0;
    for (const target of this.combat.hostileTargetsFor(this)) {
      const node = actorNode(target);
      if (!node || distanceToSegment(node.x, node.y, ax, ay, bx, by) > radius) continue;
      if (this.damageTarget(target, multiplier, ax, ay, knockback)) hits += 1;
    }
    return hits;
  }

  burst(x, y, kind = 'celestial', scale = 1) { this.combat?.fx?.burst?.(x, y, kind, scale); }
  ring(x, y, radius, kind = 'celestial', duration = 420) { this.combat?.fx?.ring?.(x, y, radius, kind, duration); }

  makeAnimatedTelegraph(duration, draw, depth = 8445) {
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

  fxMantleInvocation(duration) {
    const x = this.body.x, y = this.body.y;
    return this.makeAnimatedTelegraph(duration, (g, p) => {
      const gather = 1.22 - p * 0.28;
      const alpha = 0.28 + p * 0.62;
      g.lineStyle(2.5, 0xffffff, alpha * 0.88).strokeCircle(x, y, 96 * gather);
      g.lineStyle(2, 0xffe99f, alpha).strokeCircle(x, y, 64 * gather);
      g.lineStyle(1.5, 0xbfefff, alpha * 0.86).strokeCircle(x, y, 38);
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI / 6 - p * 0.9;
        const r0 = 66 * gather, r1 = (78 + (i % 3) * 7) * gather;
        g.lineStyle(i % 3 === 0 ? 2.8 : 1.4, i % 2 ? 0xcff7ff : 0xffefb0, alpha * (i % 3 === 0 ? 0.9 : 0.6));
        g.lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
    }, 8460);
  }

  activateMantle(time) {
    const ability = this.def.abilities.mantleEmpyrean;
    this.mantleUntil = time + ability.durationMs;
    this.nextMantlePulseAt = time + ability.pulseEveryMs;
    this.nextMantleDrawAt = 0;
    this.mantleGraphics.setVisible(true);
    this.ring(this.body.x, this.body.y, ability.auraRadius, 'celestial', 720);
    this.scene.time.delayedCall(70, () => this.ring(this.body.x, this.body.y, ability.auraRadius * 0.72, 'heal', 620));
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4;
      this.scene.time.delayedCall(i * 20, () => {
        if (this.dead) return;
        this.burst(this.body.x + Math.cos(a) * 42, this.body.y + Math.sin(a) * 28 - 12, i % 2 ? 'celestial' : 'blueflame', 0.82);
      });
    }
    this.combat?.audio?.play?.('sanctuary_first_light', { volume: 0.075, throttleMs: 650 });
  }

  updateMantle(time) {
    if (!this.mantleActive(time)) {
      if (this.mantleGraphics.visible) { this.mantleGraphics.clear().setVisible(false); }
      return;
    }
    const ability = this.def.abilities.mantleEmpyrean;
    if (time >= this.nextMantlePulseAt) {
      this.nextMantlePulseAt += ability.pulseEveryMs;
      const missing = Math.max(0, this.def.maxHp - this.hp);
      const amount = Math.min(missing, Math.max(1, Math.round(this.def.maxHp * ability.selfHealPct)));
      if (amount > 0) {
        this.hp += amount;
        this.combat?.damageNumbers?.showHealing?.(this.body.x, this.body.y - 38, amount);
      }
      this.fxMantlePulse(amount > 0);
    }
    if (time < this.nextMantleDrawAt) return;
    this.nextMantleDrawAt = time + 70;
    const elapsed = ability.durationMs - Math.max(0, this.mantleUntil - time);
    const rot = elapsed * 0.0011;
    const breathe = 0.92 + Math.sin(elapsed * 0.0055) * 0.07;
    const g = this.mantleGraphics;
    g.clear().setVisible(true).setPosition(this.body.x, this.body.y).setDepth(this.body.y - 2);
    g.fillStyle(0xe8fbff, 0.035).fillCircle(0, 0, 88 * breathe);
    g.lineStyle(2.4, 0xffedaa, 0.56).strokeEllipse(0, 1, 136 * breathe, 54 * breathe);
    g.lineStyle(1.8, 0xdff9ff, 0.62).strokeEllipse(0, 0, 100 * breathe, 40 * breathe);
    g.lineStyle(1.3, 0xffffff, 0.46).strokeCircle(0, 0, 36 * breathe);
    for (let i = 0; i < 10; i += 1) {
      const a = i * Math.PI / 5 + rot * (i % 2 ? -0.7 : 1);
      const r = 58 + (i % 3) * 8;
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.42;
      const tx = -Math.sin(a), ty = Math.cos(a) * 0.42;
      g.lineStyle(i % 2 ? 1.4 : 2.2, i % 2 ? 0xc7f5ff : 0xffefae, 0.52);
      g.lineBetween(x - tx * 6, y - ty * 6, x + tx * 6, y + ty * 6);
    }
  }

  fxMantlePulse(healed) {
    const x = this.body.x, y = this.body.y;
    const ability = this.def.abilities.mantleEmpyrean;
    this.ring(x, y, ability.auraRadius * 0.92, 'celestial', 520);
    this.scene.time.delayedCall(55, () => this.ring(x, y, ability.auraRadius * 0.68, healed ? 'heal' : 'celestial', 430));
    const g = this.scene.add.graphics().setDepth(8580);
    g.lineStyle(2.5, 0xffffff, 0.74).strokeEllipse(x, y - 10, 52, 17);
    g.lineStyle(2, 0xcff7ff, 0.65).strokeEllipse(x, y - 19, 34, 10);
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4;
      g.lineStyle(1.6, i % 2 ? 0xffe99f : 0xdff9ff, 0.68)
        .lineBetween(x + Math.cos(a) * 30, y + Math.sin(a) * 18, x + Math.cos(a) * 52, y + Math.sin(a) * 28);
    }
    this.scene.tweens.add({ targets: g, y: -8, alpha: 0, duration: 520, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.burst(x, y - 18, healed ? 'heal' : 'celestial', 0.9);
  }

  fxPassageRibbon(ax, ay, bx, by, final = false) {
    const g = this.scene.add.graphics().setDepth(8550);
    const dx = bx - ax, dy = by - ay;
    const distance = Math.hypot(dx, dy) || 1;
    const nx = -dy / distance, ny = dx / distance;
    const curve = 18 * this.orbitSign;
    const segments = 12;
    let px = ax, py = ay;
    for (let i = 1; i <= segments; i += 1) {
      const t = i / segments;
      const bend = Math.sin(t * Math.PI) * curve;
      const x = ax + dx * t + nx * bend;
      const y = ay + dy * t + ny * bend;
      g.lineStyle(final ? 5 : 3.5, 0xffec9e, (final ? 0.72 : 0.58) * (1 - t * 0.18)).lineBetween(px, py, x, y);
      g.lineStyle(final ? 2.4 : 1.5, 0xdffaff, 0.88).lineBetween(px + nx * 3, py + ny * 3, x + nx * 3, y + ny * 3);
      px = x; py = y;
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: final ? 380 : 260, ease: 'Quad.out', onComplete: () => g.destroy() });
  }

  fxSkyLance(x, y, index = 0) {
    const g = this.scene.add.graphics().setDepth(8610);
    const lean = (index % 2 ? -1 : 1) * (18 + (index % 3) * 4);
    g.lineStyle(9, 0xffffff, 0.36).lineBetween(x + lean, y - 118, x, y + 2);
    g.lineStyle(4, 0xffe9a0, 0.90).lineBetween(x + lean * 0.72, y - 108, x, y + 2);
    g.lineStyle(2, 0xcff7ff, 0.96).lineBetween(x + lean * 0.48, y - 98, x, y + 2);
    g.lineStyle(2, 0xffffff, 0.84).strokeEllipse(x + lean * 0.48, y - 78, 34, 10);
    g.lineStyle(2, 0xffe9a0, 0.72).strokeCircle(x, y, 24);
    this.scene.tweens.add({ targets: g, y: 8, alpha: 0, duration: 360, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, 48, 'celestial', 330);
    this.burst(x, y - 8, index % 2 ? 'blueflame' : 'celestial', 0.82);
  }

  fxWaltzRibbon(ax, ay, bx, by, step, final = false) {
    const g = this.scene.add.graphics().setDepth(8570);
    const dx = bx - ax, dy = by - ay;
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    const bend = (step % 2 ? -1 : 1) * 24;
    let px = ax, py = ay;
    for (let i = 1; i <= 10; i += 1) {
      const t = i / 10;
      const bow = Math.sin(t * Math.PI) * bend;
      const x = ax + dx * t + nx * bow;
      const y = ay + dy * t + ny * bow;
      g.lineStyle(final ? 5 : 3, 0xffffff, 0.72 - t * 0.18).lineBetween(px, py, x, y);
      g.lineStyle(final ? 2.5 : 1.7, step % 2 ? 0xbfefff : 0xffe69a, 0.92).lineBetween(px + nx * 4, py + ny * 4, x + nx * 4, y + ny * 4);
      px = x; py = y;
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: final ? 420 : 300, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.burst(bx, by - 12, step % 2 ? 'blueflame' : 'celestial', final ? 1.15 : 0.78);
  }

  fxStillWatersTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p) => {
      const r = radius * (0.32 + p * 0.68);
      const fade = 0.35 + p * 0.55;
      g.fillStyle(0xbfefff, 0.045 + p * 0.035).fillCircle(x, y, r);
      g.lineStyle(2.5, 0xdffaff, fade).strokeCircle(x, y, r);
      g.lineStyle(2, 0xffe99f, fade * 0.82).strokeCircle(x, y, r * 0.68);
      g.lineStyle(1.5, 0xffffff, fade * 0.68).strokeCircle(x, y, r * 0.38);
      for (let i = 0; i < 8; i += 1) {
        const a = i * Math.PI / 4 + p * 0.45;
        const px = x + Math.cos(a) * r * 0.82;
        const py = y + Math.sin(a) * r * 0.82;
        g.lineStyle(1.5, i % 2 ? 0xffe99f : 0xcff7ff, fade * 0.72).strokeEllipse(px, py, 18, 6);
      }
    }, 8438);
  }

  fxStillWatersImpact(x, y, radius) {
    const g = this.scene.add.graphics().setDepth(8580);
    g.fillStyle(0xcff7ff, 0.10).fillCircle(x, y, radius * 0.62);
    g.lineStyle(4, 0xffffff, 0.76).strokeCircle(x, y, radius * 0.48);
    g.lineStyle(3, 0xbfefff, 0.82).strokeCircle(x, y, radius * 0.72);
    g.lineStyle(2, 0xffe69a, 0.80).strokeCircle(x, y, radius);
    this.scene.tweens.add({ targets: g, alpha: 0, scaleX: 1.08, scaleY: 1.08, duration: 460, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius, 'blueflame', 520);
    this.burst(x, y - 8, 'celestial', 1.25);
  }

  fxGardenTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const rot = elapsed * 0.0012;
      const alpha = 0.30 + p * 0.58;
      g.lineStyle(2.4, 0xffeaa0, alpha).strokeCircle(x, y, radius);
      g.lineStyle(1.8, 0xcdf6ff, alpha * 0.86).strokeCircle(x, y, radius * 0.64);
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI / 6 + rot * (i % 2 ? -1 : 1);
        const rr = radius * (0.46 + (i % 3) * 0.16);
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        const size = 8 + (i % 3) * 2;
        g.lineStyle(1.8, i % 2 ? 0xffffff : 0xffeaa0, alpha * 0.78);
        g.strokeEllipse(px, py, size * 1.8, size * 0.72);
        g.lineBetween(px, py, x + Math.cos(a) * (rr - 11), y + Math.sin(a) * (rr - 11));
      }
    }, 8444);
  }

  fxGardenPulse(x, y, radius, pulse, final = false) {
    const g = this.scene.add.graphics().setDepth(8600);
    const bloom = radius * (0.40 + pulse * 0.18);
    g.fillStyle(0xfff6cf, final ? 0.16 : 0.09).fillCircle(x, y, bloom * 0.58);
    g.lineStyle(final ? 4 : 2.5, 0xffffff, final ? 0.84 : 0.66).strokeCircle(x, y, bloom);
    g.lineStyle(2, pulse % 2 ? 0xbfefff : 0xffe99f, 0.84).strokeCircle(x, y, Math.min(radius, bloom * 1.34));
    for (let i = 0; i < 10; i += 1) {
      const a = i * Math.PI / 5 + pulse * 0.22;
      const rr = radius * (0.34 + (i % 3) * 0.18);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      g.lineStyle(1.7, i % 2 ? 0xffffff : 0xffe99f, 0.78).strokeEllipse(px, py, final ? 23 : 17, final ? 9 : 6);
      this.scene.time.delayedCall((i % 3) * 14, () => this.burst(px, py - 5, i % 2 ? 'blueflame' : 'celestial', final ? 0.78 : 0.56));
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: final ? 520 : 390, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, Math.min(radius, bloom * 1.28), final ? 'celestial' : 'blueflame', final ? 540 : 420);
  }

  fxDawnTelegraph(x, y, radius, duration) {
    return this.makeAnimatedTelegraph(duration, (g, p, elapsed) => {
      const rot = elapsed * 0.00075;
      const gather = 1.14 - p * 0.14;
      const alpha = 0.30 + p * 0.62;
      g.fillStyle(0xdff9ff, 0.035 + p * 0.04).fillCircle(x, y, radius * 0.92);
      g.lineStyle(3, 0xffffff, alpha * 0.88).strokeCircle(x, y, radius * gather);
      g.lineStyle(2.2, 0xffe89a, alpha).strokeCircle(x, y, radius * 0.72 * gather);
      g.lineStyle(1.6, 0xc8f5ff, alpha * 0.84).strokeCircle(x, y, radius * 0.44);
      for (let i = 0; i < 16; i += 1) {
        const a = i * Math.PI / 8 + rot * (i % 2 ? -1.25 : 1);
        const r0 = radius * 0.76 * gather;
        const r1 = radius * (0.90 + (i % 4) * 0.025) * gather;
        g.lineStyle(i % 4 === 0 ? 3 : 1.4, i % 3 === 0 ? 0xffffff : (i % 2 ? 0xc8f5ff : 0xffe89a), alpha * 0.72);
        g.lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
      // Four open crowns keep the geometry elegant rather than visually dense.
      for (let i = 0; i < 4; i += 1) {
        const a = i * Math.PI / 2 - rot * 0.6;
        const cx = x + Math.cos(a) * radius * 0.52;
        const cy = y + Math.sin(a) * radius * 0.52;
        const tx = -Math.sin(a), ty = Math.cos(a);
        g.lineStyle(2.2, 0xffffff, alpha * 0.70);
        g.beginPath();
        g.moveTo(cx - tx * 12, cy - ty * 12);
        g.lineTo(cx, cy - 10);
        g.lineTo(cx + tx * 12, cy + ty * 12);
        g.strokePath();
      }
    }, 8448);
  }

  fxDawnImpact(x, y, radius) {
    const beams = [
      [-72, -25], [68, -18], [-34, 42], [42, 55], [0, 0]
    ];
    beams.forEach(([ox, oy], index) => this.scene.time.delayedCall(index * 68, () => {
      const g = this.scene.add.graphics().setDepth(8620 + index);
      const bx = x + ox, by = y + oy;
      const width = index === beams.length - 1 ? 12 : 7;
      g.lineStyle(width + 7, 0xffffff, index === beams.length - 1 ? 0.28 : 0.18).lineBetween(bx, by - 180, bx, by + 8);
      g.lineStyle(width, index % 2 ? 0xc9f6ff : 0xffe89a, 0.88).lineBetween(bx, by - 165, bx, by + 8);
      g.lineStyle(2, 0xffffff, 0.92).strokeEllipse(bx, by - 58, index === beams.length - 1 ? 48 : 31, index === beams.length - 1 ? 14 : 9);
      this.scene.tweens.add({ targets: g, alpha: 0, duration: index === beams.length - 1 ? 520 : 380, ease: 'Quad.out', onComplete: () => g.destroy() });
      this.burst(bx, by - 7, index % 2 ? 'blueflame' : 'celestial', index === beams.length - 1 ? 1.55 : 0.86);
    }));
    this.scene.time.delayedCall(290, () => {
      this.ring(x, y, radius, 'celestial', 620);
      this.scene.time.delayedCall(65, () => this.ring(x, y, radius * 0.72, 'blueflame', 520));
    });
  }

  beginAbility(ability, target, time) {
    if (!ability) return false;
    const targetNode = actorNode(target) || this.body;
    this.currentAbility = ability;
    if (target) this.target = target;
    this.abilityStartedAt = time;
    this.abilityTriggered = false;
    this.abilityTargetX = targetNode.x;
    this.abilityTargetY = targetNode.y;
    this.abilityOriginX = this.body.x;
    this.abilityOriginY = this.body.y;
    this.setCooldown(ability, time);
    if (ability.major) this.majorAbilityLockUntil = Math.max(this.majorAbilityLockUntil, time + (ability.majorLockMs || 2500));
    this.body.setVelocity(0);
    this.setDirection(targetNode.x - this.body.x, targetNode.y - this.body.y);
    this.lastActionName = ability.name;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;

    if (ability.id === 'lailani_seraphic_passage') {
      this.state = 'passage_charge';
      this.stateUntil = time + ability.windupMs;
      this.fxPassageRibbon(this.body.x - 18, this.body.y + 6, this.body.x + 18, this.body.y - 8, false);
    } else if (ability.id === 'lailani_celestial_waltz') {
      this.state = 'waltz_charge';
      this.stateUntil = time + ability.windupMs;
      this.ring(this.body.x, this.body.y, 48, 'celestial', 300);
    } else {
      this.state = 'ability';
      this.stateUntil = time + ability.windupMs;
      if (ability.id === 'lailani_mantle_empyrean') this.abilityTelegraph = this.fxMantleInvocation(ability.windupMs);
      if (ability.id === 'lailani_lances_seventh_sky') {
        this.abilityTelegraph = this.makeAnimatedTelegraph(ability.windupMs, (g, p) => {
          const x = this.body.x, y = this.body.y - 18;
          const alpha = 0.30 + p * 0.62;
          g.lineStyle(2, 0xffffff, alpha).strokeEllipse(x, y, 54 + p * 12, 16 + p * 4);
          for (let i = 0; i < ability.strikes; i += 1) {
            const a = i * Math.PI * 2 / ability.strikes - p * 0.8;
            const px = x + Math.cos(a) * (28 + p * 9), py = y + Math.sin(a) * (15 + p * 5);
            g.lineStyle(2, i % 2 ? 0xcaf5ff : 0xffe99f, alpha * 0.84).lineBetween(px, py - 12, px, py + 7);
          }
        }, 8470);
      }
      if (ability.id === 'lailani_halo_still_waters') this.abilityTelegraph = this.fxStillWatersTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
      if (ability.id === 'lailani_garden_heaven') this.abilityTelegraph = this.fxGardenTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
      if (ability.id === 'lailani_transcendent_dawn') this.abilityTelegraph = this.fxDawnTelegraph(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.windupMs);
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

  triggerLances(ability) {
    const available = this.combat?.hostileTargetsFor(this) || [];
    const primary = actorNode(this.target);
    const centerX = primary?.x ?? this.abilityTargetX;
    const centerY = primary?.y ?? this.abilityTargetY;
    const candidates = available
      .filter(actorAlive)
      .map(target => ({ target, node: actorNode(target) }))
      .filter(row => row.node && Math.hypot(row.node.x - centerX, row.node.y - centerY) <= ability.targetClusterRadius)
      .sort((a, b) => Math.hypot(a.node.x - centerX, a.node.y - centerY) - Math.hypot(b.node.x - centerX, b.node.y - centerY));
    const pool = candidates.length ? candidates : (this.target && actorAlive(this.target) ? [{ target: this.target, node: actorNode(this.target) }] : []);
    for (let i = 0; i < ability.strikes; i += 1) {
      this.scene.time.delayedCall(i * ability.strikeDelayMs, () => {
        if (this.dead || !this.simulationAwake) return;
        const row = pool.length ? pool[i % pool.length] : null;
        const node = row?.target && actorAlive(row.target) ? actorNode(row.target) : null;
        const spreadA = i * 2.399;
        const x = node?.x ?? centerX + Math.cos(spreadA) * 34;
        const y = node?.y ?? centerY + Math.sin(spreadA) * 24;
        if (row?.target && actorAlive(row.target)) this.damageTarget(row.target, ability.damageMultiplier, x, y, ability.knockback);
        else this.damageInRadius(x, y, 34, ability.damageMultiplier, ability.knockback);
        this.fxSkyLance(x, y, i);
        this.combat?.audio?.play?.('celestial_strike', { volume: 0.055, throttleMs: 72 });
      });
    }
  }

  triggerStillWaters(ability) {
    const hits = this.damageInRadius(this.abilityTargetX, this.abilityTargetY, ability.radius, ability.damageMultiplier, ability.knockback, ability.slowDurationMs);
    this.fxStillWatersImpact(this.abilityTargetX, this.abilityTargetY, ability.radius);
    this.combat?.audio?.play?.('sanctuary_first_light', { volume: 0.07, throttleMs: 420 });
    if (hits) this.combat?.shakeAt?.(this.abilityTargetX, this.abilityTargetY, hits > 2 ? 130 : 90, hits > 2 ? 0.0032 : 0.0021, 440);
  }

  triggerGarden(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    const delays = ability.pulseDelays || [0];
    const scales = ability.pulseScales || [1];
    delays.forEach((delay, index) => this.scene.time.delayedCall(delay, () => {
      if (this.dead || !this.simulationAwake) return;
      const final = index === delays.length - 1;
      const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier * (scales[index] || 0.33), final ? ability.knockback : 20);
      this.fxGardenPulse(x, y, ability.radius, index, final);
      this.combat?.audio?.play?.(final ? 'seraphic_judgment' : 'celestial_strike', { volume: final ? 0.09 : 0.05, throttleMs: 90 });
      if (final && hits) this.combat?.shakeAt?.(x, y, hits >= 3 ? 160 : 120, hits >= 3 ? 0.0042 : 0.0030, 520);
    }));
  }

  triggerDawn(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    this.fxDawnImpact(x, y, ability.radius);
    this.scene.time.delayedCall(290, () => {
      if (this.dead || !this.simulationAwake) return;
      const hits = this.damageInRadius(x, y, ability.radius, ability.damageMultiplier, ability.knockback);
      this.combat?.audio?.play?.('heavenfall', { volume: 0.105, throttleMs: 700 });
      this.combat?.shakeAt?.(x, y, hits >= 3 ? 215 : 170, hits >= 3 ? 0.0060 : 0.0044, 600);
    });
  }

  triggerCastAbility(ability, time) {
    if (ability.id === 'lailani_mantle_empyrean') this.activateMantle(time);
    else if (ability.id === 'lailani_lances_seventh_sky') this.triggerLances(ability);
    else if (ability.id === 'lailani_halo_still_waters') this.triggerStillWaters(ability);
    else if (ability.id === 'lailani_garden_heaven') this.triggerGarden(ability);
    else if (ability.id === 'lailani_transcendent_dawn') this.triggerDawn(ability);
  }

  updateCastAbility(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const elapsed = Math.max(0, time - this.abilityStartedAt);
    const progress = clamp(elapsed / Math.max(1, ability.windupMs), 0, 0.999999);
    if (ability.id === 'lailani_lances_seventh_sky') this.renderProgress('shoot', progress);
    else if (ability.id === 'lailani_mantle_empyrean') this.renderProgress('spellcast', progress);
    else if (ability.id === 'lailani_transcendent_dawn') {
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

  updatePassageCharge(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const elapsed = time - this.abilityStartedAt;
    this.body.setVelocity(0);
    this.renderProgress('thrust', elapsed / Math.max(1, ability.windupMs));
    if (elapsed < ability.windupMs) return;
    const p = actorNode(this.target) || { x: this.abilityTargetX, y: this.abilityTargetY };
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy) || 1;
    const nx = dx / distance, ny = dy / distance;
    this.abilityOriginX = this.body.x;
    this.abilityOriginY = this.body.y;
    this.passVX = nx * this.def.passageSpeed;
    this.passVY = ny * this.def.passageSpeed;
    this.passEndsAt = time + Math.min(ability.dashMs, ((Math.min(distance + 64, ability.range + 46)) / this.def.passageSpeed) * 1000);
    this.nextPassTrailAt = time;
    this.abilityTriggered = true;
    this.state = 'passage_dash';
    this.setDirection(dx, dy);
    this.combat?.audio?.play?.('wing_burst', { volume: 0.07, throttleMs: 260 });
  }

  updatePassageDash(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    this.body.setVelocity(this.passVX, this.passVY);
    this.setDirection(this.passVX, this.passVY);
    this.renderLoop('walk', time, 48);
    if (time >= this.nextPassTrailAt) {
      this.nextPassTrailAt = time + 48;
      this.burst(this.body.x, this.body.y - 12, Math.floor(time / 96) % 2 ? 'blueflame' : 'celestial', 0.46);
    }
    const targetNode = actorNode(this.target);
    const passedTarget = targetNode ? Math.hypot(targetNode.x - this.body.x, targetNode.y - this.body.y) <= 34 : false;
    if (!passedTarget && time < this.passEndsAt) return;
    this.body.setVelocity(0);
    const hits = this.damageAlongSegment(this.abilityOriginX, this.abilityOriginY, this.body.x, this.body.y, ability.lineRadius, ability.damageMultiplier, ability.knockback);
    this.fxPassageRibbon(this.abilityOriginX, this.abilityOriginY, this.body.x, this.body.y, true);
    this.ring(this.body.x, this.body.y, 60, 'celestial', 350);
    if (hits) this.combat?.shakeAt?.(this.body.x, this.body.y, hits > 2 ? 115 : 82, hits > 2 ? 0.0032 : 0.0022, 400);
    this.finishAbility(time, ability.recoverMs);
  }

  startWaltz(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    this.state = 'waltz';
    this.waltzStep = 0;
    this.nextWaltzStepAt = time;
    this.abilityTriggered = true;
  }

  updateWaltzCharge(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const elapsed = time - this.abilityStartedAt;
    this.body.setVelocity(0);
    this.renderProgress('slash', elapsed / Math.max(1, ability.windupMs));
    if (elapsed >= ability.windupMs) this.startWaltz(time);
  }

  updateWaltz(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    this.body.setVelocity(0);
    this.renderLoop('slash', time, 54);
    if (time < this.nextWaltzStepAt) return;
    if (this.waltzStep >= ability.steps) { this.finishAbility(time, ability.recoverMs); return; }
    const targetNode = actorNode(this.target) || { x: this.abilityTargetX, y: this.abilityTargetY };
    const prevX = this.body.x, prevY = this.body.y;
    const phase = WALTZ_ANGLES[this.waltzStep % WALTZ_ANGLES.length] * Math.PI + this.waltzPhase;
    const radius = ability.stepRadius + (this.waltzStep % 2) * 14;
    const margin = 42;
    const nx = clamp(targetNode.x + Math.cos(phase) * radius, margin, this.scene.currentMap.width - margin);
    const ny = clamp(targetNode.y + Math.sin(phase) * radius * 0.72, margin, this.scene.currentMap.height - margin);
    this.body.setPosition(nx, ny);
    this.setDirection(targetNode.x - nx, targetNode.y - ny);
    const final = this.waltzStep === ability.steps - 1;
    const multiplier = final ? ability.finalDamageMultiplier : ability.damageMultiplier;
    const hits = this.damageInRadius(nx, ny, ability.impactRadius, multiplier, final ? ability.knockback : 24);
    this.fxWaltzRibbon(prevX, prevY, nx, ny, this.waltzStep, final);
    this.ring(nx, ny, final ? 74 : 48, final ? 'celestial' : 'blueflame', final ? 420 : 280);
    this.combat?.audio?.play?.('celestial_strike', { volume: final ? 0.078 : 0.045, throttleMs: 85 });
    if (final && hits) this.combat?.shakeAt?.(nx, ny, 115, 0.0030, 420);
    this.waltzStep += 1;
    this.nextWaltzStepAt = time + ability.stepDelayMs;
    if (this.waltzStep >= ability.steps) this.stateUntil = this.nextWaltzStepAt;
  }

  decide(time, enemies) {
    const available = this.activeHostiles(enemies);
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
        this.body.setVelocity(dx * inv * this.def.glideSpeed * 0.70, dy * inv * this.def.glideSpeed * 0.70);
        this.setDirection(dx, dy);
        this.state = 'return';
        this.lastActionName = 'Returning in grace';
      } else {
        this.body.setVelocity(0);
        this.state = 'idle';
        this.lastActionName = this.mantleActive(time) ? 'Empyrean vigil' : 'Transcendent vigil';
      }
      return;
    }

    const p = actorNode(this.target);
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy);
    this.setDirection(dx, dy);

    const mantle = this.def.abilities.mantleEmpyrean;
    if (!this.mantleActive(time) && this.cooldownReady(mantle.id, time)) {
      this.beginAbility(mantle, this.target, time); return;
    }

    const dawn = this.def.abilities.transcendentDawn;
    const garden = this.def.abilities.gardenHeaven;
    const dawnCluster = this.clusterCount(this.target, available, dawn.targetClusterRadius);
    const gardenCluster = this.clusterCount(this.target, available, garden.targetClusterRadius);
    const worthyDawn = isWorthyTarget(this.target, dawn.worthyTargetTier);
    const worthyGarden = isWorthyTarget(this.target, garden.worthyTargetTier);
    if (this.majorReady(time)) {
      if ((dawnCluster >= dawn.minCluster || worthyDawn) && distance <= dawn.range && this.cooldownReady(dawn.id, time)) {
        this.beginAbility(dawn, this.target, time); return;
      }
      if ((gardenCluster >= garden.minCluster || worthyGarden) && distance <= garden.range && this.cooldownReady(garden.id, time)) {
        this.beginAbility(garden, this.target, time); return;
      }
    }

    const still = this.def.abilities.haloStillWaters;
    const nearby = this.hostileCountNear(available, p.x, p.y, still.radius * 0.92);
    if ((nearby >= 2 || distance <= 125) && distance <= still.range && this.cooldownReady(still.id, time)) {
      this.beginAbility(still, this.target, time); return;
    }

    const waltz = this.def.abilities.celestialWaltz;
    if (distance <= waltz.range && this.cooldownReady(waltz.id, time)) {
      this.beginAbility(waltz, this.target, time); return;
    }

    const lances = this.def.abilities.lancesSeventhSky;
    if (distance <= lances.range && distance >= 92 && this.cooldownReady(lances.id, time)) {
      this.beginAbility(lances, this.target, time); return;
    }

    const passage = this.def.abilities.seraphicPassage;
    if (distance <= passage.range && distance > 88 && this.cooldownReady(passage.id, time)) {
      this.beginAbility(passage, this.target, time); return;
    }

    // Her fallback movement deliberately combines approach and orbit vectors.
    // The result is a curved, dancing pursuit instead of the straight-line
    // chase used by ordinary actors.
    if (time >= this.orbitFlipAt) {
      this.orbitFlipAt = time + 720 + Math.random() * 380;
      if (Math.random() < 0.72) this.orbitSign *= -1;
    }
    const inv = 1 / Math.max(1, distance);
    const tx = dx * inv, ty = dy * inv;
    const px = -ty * this.orbitSign, py = tx * this.orbitSign;
    const approach = distance > this.def.preferredRange ? 0.78 : distance < 105 ? -0.20 : 0.18;
    const orbit = distance > this.def.preferredRange ? 0.42 : 0.92;
    const mx = tx * approach + px * orbit;
    const my = ty * approach + py * orbit;
    const norm = Math.hypot(mx, my) || 1;
    const speed = distance > this.def.preferredRange ? this.def.glideSpeed : this.def.speed;
    this.body.setVelocity(mx / norm * speed, my / norm * speed);
    this.setDirection(mx, my);
    this.state = 'dance';
    this.lastActionName = `Dancing around ${this.target.def?.name || 'hostile'}`;
  }

  update(time, delta, enemies) {
    this.animClock += delta;

    if (!this.shouldSimulate()) {
      if (this.simulationAwake) this.sleepSimulation(time);
      if (this.dead && time >= this.respawnAt) this.respawn(time);
      return;
    }
    this.wakeSimulation(time);
    this.updateMantle(time);

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

    if (this.state === 'passage_charge') this.updatePassageCharge(time);
    else if (this.state === 'passage_dash') this.updatePassageDash(time);
    else if (this.state === 'waltz_charge') this.updateWaltzCharge(time);
    else if (this.state === 'waltz') this.updateWaltz(time);
    else if (this.state === 'ability') {
      this.body.setVelocity(0);
      this.updateCastAbility(time);
    } else if (this.state === 'recover' && time < this.stateUntil) {
      this.body.setVelocity(0);
      this.renderLoop('idle', time, 150);
    } else {
      if (time >= this.nextThink) {
        this.nextThink = time + 92;
        this.decide(time, enemies);
      }
      const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
      if (speed > 8) {
        this.renderLoop('walk', time, this.state === 'dance' ? 62 : 74);
        if (time >= this.nextTrailAt) {
          this.nextTrailAt = time + (this.mantleActive(time) ? 72 : 96);
          const vx = this.body.body.velocity.x, vy = this.body.body.velocity.y;
          const v = Math.hypot(vx, vy) || 1;
          const x = this.body.x - vx / v * 16;
          const y = this.body.y - vy / v * 14 - 9;
          this.burst(x, y, Math.floor(time / 140) % 2 ? 'blueflame' : 'celestial', this.mantleActive(time) ? 0.44 : 0.34);
        }
      } else this.renderLoop('idle', time, this.target ? 170 : 230);
    }

    this.syncPresentation(time);
  }

  syncPresentation(time) {
    const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    const hoverAmp = this.dead ? 0 : (speed > 8 ? 2.4 : 1.65);
    const hoverY = Math.sin((time + 420) * 0.0072) * hoverAmp;
    this.sprite.setPosition(this.body.x, this.body.y - 5 + hoverY).setDepth(this.body.y + 5);
    this.nameplate.setPosition(this.body.x, this.body.y - 85 + hoverY).setDepth(this.body.y + 9000);
    this.debugText.setPosition(this.body.x, this.body.y + 39).setDepth(this.body.y + 16020);
    this.updateHealthBar();

    if (time < this.hurtUntil) this.sprite.setTintFill(0xffffff);
    else this.sprite.clearTint();

    this.levelText?.setText(this.mantleActive(time)
      ? 'Lv. ???  •  EMPYREAN MANTLE'
      : 'Lv. ???  •  CELESTIAL MYTHIC');

    if (this.debugEnabled && !this.dead) {
      const targetNode = actorNode(this.target);
      const distance = targetNode ? Math.round(Math.hypot(targetNode.x - this.body.x, targetNode.y - this.body.y)) : 0;
      const mantle = Math.ceil(Math.max(0, this.mantleUntil - time) / 1000);
      this.debugText.setText(`AI ${this.state.toUpperCase()}  •  ${this.lastActionName}\nTarget: ${this.target?.def?.name || 'none'} (${distance}px)\nHP ${Math.ceil(this.hp)}/${this.def.maxHp}  •  Mantle ${mantle}s`);
    }
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, options = {}) {
    if (this.dead) return false;
    const mantle = this.def.abilities.mantleEmpyrean;
    const defended = this.mantleActive(time) ? amount * mantle.damageTakenMultiplier : amount;
    const damage = Math.max(1, Math.floor(defended));
    this.hp = Math.max(0, this.hp - damage);
    this.hurtUntil = Math.max(this.hurtUntil, time + 85);

    if (options.knockback) {
      const retained = Math.max(0.04, 1 - (this.def.staggerResistance || 0));
      const power = options.knockback * retained;
      if (power >= 7) {
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.body.x, this.body.y);
        this.knockbackVX = Math.cos(angle) * power;
        this.knockbackVY = Math.sin(angle) * power;
        this.knockbackUntil = Math.max(this.knockbackUntil, time + 95);
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
    this.mantleUntil = 0;
    this.mantleGraphics.clear().setVisible(false);
    this.combat?.statuses?.clear(this);
    this.target = null;
    this.lastActionName = 'Fallen beyond the veil';
    this.debugText.setVisible(false);
  }

  respawn(time) {
    this.dead = false;
    this.hp = this.def.maxHp;
    this.body.setPosition(this.homeX, this.homeY).setVelocity(0);
    this.body.body.enable = true;
    this.sprite.setActive(true).setVisible(true).clearTint();
    this.nameplate.setVisible(true);
    this.target = null;
    this.currentAbility = null;
    this.abilityCooldowns.clear();
    this.majorAbilityLockUntil = 0;
    this.mantleUntil = 0;
    this.nextMantlePulseAt = 0;
    this.mantleGraphics.clear().setVisible(false);
    this.state = 'idle';
    this.stateUntil = time + 420;
    this.nextThink = time + 330;
    this.lastActionName = 'Transcendent vigil';
    this.debugText.setVisible(this.debugEnabled);
    this.renderFrame('idle', 0);
  }

  relocateForFieldTest(x, y, time = this.scene.time.now) {
    const nextX = Number(x);
    const nextY = Number(y);
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return false;
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityTriggered = false;
    this.combat?.statuses?.clear(this);
    this.homeX = nextX;
    this.homeY = nextY;
    this.respawn(time);
    this.sprite.setPosition(nextX, nextY).setDepth(nextY + 3);
    this.nameplate.setPosition(nextX, nextY - 85).setDepth(nextY + 9000);
    this.lastActionName = 'Solo-test vigil';
    return true;
  }

  snapshot(time = this.scene.time.now) {
    const targetNode = actorNode(this.target);
    return {
      active: !this.dead,
      name: this.def.displayName,
      title: this.def.title,
      levelDisplay: this.def.levelDisplay,
      hp: Math.ceil(this.hp), maxHp: this.def.maxHp,
      state: this.state,
      action: this.lastActionName,
      target: this.target?.def?.name || null,
      targetDistance: targetNode ? Math.round(Math.hypot(targetNode.x - this.body.x, targetNode.y - this.body.y)) : null,
      mantleRemainingMs: Math.max(0, this.mantleUntil - time),
      internalLevel: this.debugEnabled ? this.def.internalLevel : null,
      cooldowns: Object.fromEntries(Object.values(this.def.abilities).map(ability => [ability.id, Math.max(0, (this.abilityCooldowns.get(ability.id) || 0) - time)]))
    };
  }

  destroy() {
    this.abilityTelegraph?.destroy?.();
    this.mantleGraphics?.destroy?.();
    this.body.destroy();
    this.sprite.destroy();
    this.nameplate.destroy();
    this.debugText.destroy();
  }
}
