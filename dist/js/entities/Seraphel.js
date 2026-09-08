import { areHostile } from '../data/factions.js';

const FRAME_COUNTS = Object.freeze({
  spellcast: 7, thrust: 8, walk: 9, slash: 6, shoot: 13, hurt: 6,
  climb: 6, idle: 2, jump: 5, sit: 3, emote: 3, run: 8,
  combatIdle: 2, backslash: 13, halfslash: 6
});
const BACKSLASH_SEQUENCE = Object.freeze([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]);
const IDLE_SEQUENCE = Object.freeze([0, 0, 1]);
const JUMP_SEQUENCE = Object.freeze([0, 1, 2, 3, 4, 1]);
const PALETTES = Object.freeze({
  fallen: [0x12051f, 0x5d1d87, 0xd62b47, 0xff8c35, 0xffe57d, 0x70e7ff],
  fire: [0x25010a, 0x7b0713, 0xef281e, 0xff7a1a, 0xffd45a],
  ice: [0x071632, 0x0b57a1, 0x21c8ff, 0xbaf6ff, 0xc6b4ff],
  tempest: [0x21104f, 0x593cff, 0x20bfff, 0xb9ffff, 0x66ffca],
  earth: [0x24130b, 0x6f3a18, 0xd08d38, 0xffc35b, 0x55c96f],
  eclipse: [0x08020f, 0x4c116f, 0xb52bdb, 0xffd65a, 0xfffbd5, 0x66e9ff],
  prism: [0xff3b2f, 0xff9d2e, 0xffec65, 0x59e879, 0x50dfff, 0x7564ff, 0xd05cff]
});

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function directionVector(direction = 2) { return [[0, -1], [-1, 0], [0, 1], [1, 0]][direction] || [0, 1]; }

export class Seraphel {
  constructor(scene, definition) {
    this.scene = scene;
    this.def = definition;
    this.faction = definition.faction;
    this.isFriendlyActor = true; // CombatResolver named/special actor path; faction relation still decides hostility.
    this.uniqueActor = true;
    this.combat = null;

    this.homeX = definition.home.x;
    this.homeY = definition.home.y;
    this.body = scene.physics.add.sprite(this.homeX, this.homeY, 'solid').setVisible(false);
    this.body.body.setSize(22, 18, false).setOffset(-10, 1).setCollideWorldBounds(true);
    this.sprite = scene.add.sprite(this.homeX, this.homeY, definition.assets.combatIdle, 0)
      .setOrigin(0.5, 0.70).setScale(definition.scale).setDepth(this.homeY + 3);

    this.direction = 2;
    this.hp = definition.maxHp;
    this.dead = false;
    this.deathStartedAt = 0;
    this.respawnAt = 0;
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.state = 'idle';
    this.stateUntil = 0;
    this.currentAbility = null;
    this.abilityStartedAt = 0;
    this.abilityTriggered = false;
    this.abilityTarget = null;
    this.abilityTargetX = this.homeX;
    this.abilityTargetY = this.homeY;
    this.abilityCooldowns = new Map();
    this.majorAbilityLockUntil = 0;
    this.animClock = Math.random() * 500;
    this.lastActionName = 'Shattered vigil';
    this.comboIndex = 0;
    this.comboQueued = false;
    this.comboLastEndedAt = -Infinity;
    this.comboStage = null;
    this.tempest = null;
    this.debugEnabled = false;
    this.nextTrailAt = 0;

    this.createNameplate();
    this.createDebugLabel();
    this.renderFrame('combatIdle', 0);
  }

  createNameplate() {
    this.nameplate = this.scene.add.container(this.body.x, this.body.y - 82).setDepth(9100);
    const plate = this.scene.add.graphics();
    plate.fillStyle(0x09030e, 0.91).fillRoundedRect(-106, -22, 212, 45, 9);
    plate.lineStyle(2, 0xd45cff, 0.82).strokeRoundedRect(-106, -22, 212, 45, 9);
    plate.lineStyle(1, 0xff6b4a, 0.68).strokeRoundedRect(-101, -17, 202, 35, 7);
    // Broken halo emblem: deliberately asymmetric and split.
    plate.lineStyle(2, 0xffd966, 0.92).arc(-84, -4, 10, Math.PI * 0.10, Math.PI * 0.84, false).strokePath();
    plate.lineStyle(2, 0xb75cff, 0.92).arc(-84, -4, 10, Math.PI * 1.05, Math.PI * 1.72, false).strokePath();
    plate.lineStyle(1, 0x66e9ff, 0.72).lineBetween(-92, 4, -99, 10).lineBetween(-76, 3, -69, 9);
    this.nameText = this.scene.add.text(8, -16, 'SERAPHEL', {
      fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'bold', color: '#ffd47b',
      stroke: '#180519', strokeThickness: 3, letterSpacing: 0.8
    }).setOrigin(0.5, 0);
    this.titleText = this.scene.add.text(8, -1, 'THE SHATTERED HALO', {
      fontFamily: 'Arial, sans-serif', fontSize: '7px', color: '#e6b9ff', stroke: '#09020d', strokeThickness: 2, letterSpacing: 0.55
    }).setOrigin(0.5, 0);
    this.levelText = this.scene.add.text(8, 10, 'Lv. ???  •  FALLEN APEX', {
      fontFamily: 'Arial, sans-serif', fontSize: '6px', color: '#92efff', stroke: '#09020d', strokeThickness: 2
    }).setOrigin(0.5, 0);
    this.healthBack = this.scene.add.graphics();
    this.healthBack.fillStyle(0x160914, 0.94).fillRoundedRect(-76, 19, 152, 5, 2);
    this.healthBar = this.scene.add.graphics();
    this.nameplate.add([plate, this.nameText, this.titleText, this.levelText, this.healthBack, this.healthBar]);
    this.updateHealthBar();
  }

  createDebugLabel() {
    this.debugText = this.scene.add.text(this.body.x, this.body.y + 40, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '8px', color: '#f1c5ff',
      backgroundColor: 'rgba(10,2,15,.80)', stroke: '#07020a', strokeThickness: 2, padding: { x: 4, y: 3 }
    }).setOrigin(0.5, 0).setDepth(16030).setVisible(false);
  }

  setDebugEnabled(enabled) { this.debugEnabled = Boolean(enabled); this.debugText?.setVisible(this.debugEnabled && !this.dead); return this.debugEnabled; }
  updateHealthBar() {
    const ratio = clamp(this.hp / this.def.maxHp, 0, 1);
    this.healthBar.clear();
    const width = 150 * ratio;
    this.healthBar.fillStyle(0x5d1d87, 0.96).fillRoundedRect(-75, 20, width, 3, 1);
    if (ratio > 0.2) this.healthBar.fillStyle(0xff784f, 0.72).fillRect(-74, 20, Math.max(0, width - 2), 1);
  }

  cooldownReady(id, time) { return time >= (this.abilityCooldowns.get(id) || 0); }
  majorReady(time) { return time >= this.majorAbilityLockUntil; }
  setCooldown(ability, time) { this.abilityCooldowns.set(ability.id, time + ability.cooldownMs); }

  setDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) this.direction = vx < 0 ? 1 : 3;
    else if (Math.abs(vy) > 0.001) this.direction = vy < 0 ? 0 : 2;
  }

  frameFor(action, frame) {
    const count = FRAME_COUNTS[action] || 1;
    const clamped = clamp(frame, 0, count - 1);
    if (action === 'hurt' || action === 'climb') return clamped;
    return this.direction * count + clamped;
  }
  renderFrame(action, frame) {
    const texture = this.def.assets[action];
    if (!texture || !this.scene.textures.exists(texture)) return;
    this.sprite.setTexture(texture).setFrame(this.frameFor(action, frame));
  }
  renderLoop(action, time, frameMs = 110, sequence = null) {
    let seq = sequence;
    if (!seq && (action === 'idle' || action === 'combatIdle')) seq = IDLE_SEQUENCE;
    const frames = seq || Array.from({ length: FRAME_COUNTS[action] || 1 }, (_, i) => i);
    const index = Math.floor((time + this.animClock) / frameMs) % frames.length;
    this.renderFrame(action, frames[index]);
  }
  renderProgress(action, progress, sequence = null) {
    const seq = sequence || Array.from({ length: FRAME_COUNTS[action] || 1 }, (_, i) => i);
    const index = Math.min(seq.length - 1, Math.floor(clamp(progress, 0, 0.999999) * seq.length));
    this.renderFrame(action, seq[index]);
  }

  hostileTargets() { return (this.combat?.hostileTargetsFor?.(this) || []).filter(actorAlive); }

  paletteBurst(x, y, palette, radius = 90, duration = 420, rays = 10, depth = 8550) {
    const colors = palette?.length ? palette : PALETTES.fallen;
    const g = this.scene.add.graphics().setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 32, loop: true, callback: () => {
      if (!g.active) return;
      const p = clamp((this.scene.time.now - started) / duration, 0, 1);
      g.clear();
      colors.forEach((color, i) => {
        const rr = radius * (0.16 + p * (0.46 + i * 0.065));
        g.lineStyle(Math.max(1, 4 - i * 0.35), color, (0.62 - i * 0.035) * (1 - p)).strokeCircle(x, y, rr);
      });
      for (let i = 0; i < rays; i += 1) {
        const angle = (Math.PI * 2 * i / rays) + p * 0.9;
        const inner = radius * (0.12 + p * 0.18);
        const outer = radius * (0.42 + p * 0.62);
        const color = colors[i % colors.length];
        g.lineStyle(2, color, 0.55 * (1 - p)).lineBetween(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner, x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
      }
      if (p >= 1) { timer.remove(false); g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); g.destroy(); } };
  }

  brokenHalo(x, y, radius = 86, palette = PALETTES.eclipse, duration = 700) {
    const g = this.scene.add.graphics().setDepth(8500).setBlendMode(Phaser.BlendModes.ADD);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 32, loop: true, callback: () => {
      if (!g.active) return;
      const p = clamp((this.scene.time.now - started) / duration, 0, 1);
      g.clear();
      const r = radius * (0.72 + p * 0.28);
      for (let i = 0; i < 4; i += 1) {
        const a0 = i * Math.PI / 2 + 0.10 + p * 0.25;
        const a1 = a0 + Math.PI * 0.34;
        g.lineStyle(5 - i * 0.7, palette[i % palette.length], 0.88 * (1 - p * 0.65));
        g.arc(x, y, r + i * 7, a0, a1, false).strokePath();
      }
      if (p >= 1) { timer.remove(false); g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); g.destroy(); } };
  }

  featherBurst(x, y, palette = PALETTES.fallen, radius = 72, count = 12, duration = 420) {
    const g = this.scene.add.graphics().setDepth(8580);
    const seeds = Array.from({ length: count }, (_, i) => ({
      a: (Math.PI * 2 * i / count) + (i % 3) * 0.13,
      len: radius * (0.48 + (i % 5) * 0.08),
      c: palette[i % palette.length]
    }));
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 34, loop: true, callback: () => {
      if (!g.active) return;
      const p = clamp((this.scene.time.now - started) / duration, 0, 1);
      g.clear();
      seeds.forEach((seed, i) => {
        const d = seed.len * (0.15 + p * 0.85);
        const px = x + Math.cos(seed.a) * d;
        const py = y + Math.sin(seed.a) * d;
        g.fillStyle(i % 2 ? seed.c : 0x0b0710, 0.72 * (1 - p));
        g.fillTriangle(px, py - 5, px + 3, py + 5, px - 2, py + 2);
      });
      if (p >= 1) { timer.remove(false); g.destroy(); }
    }});
  }

  beam(x1, y1, x2, y2, palette = PALETTES.tempest, duration = 220, width = 8) {
    const g = this.scene.add.graphics().setDepth(8570).setBlendMode(Phaser.BlendModes.ADD);
    palette.slice(0, 4).forEach((color, i) => g.lineStyle(Math.max(1, width - i * 2), color, 0.70 - i * 0.10).lineBetween(x1, y1, x2, y2));
    this.scene.tweens.add({ targets: g, alpha: 0, duration, ease: 'Quad.out', onComplete: () => g.destroy() });
  }

  damageTarget(target, multiplier, damageType, x, y, knockback = 0, status = null) {
    if (!actorAlive(target) || !areHostile(this, target)) return 0;
    const amount = this.combat?.resolver?.damageTarget?.(target, this.def.attack * multiplier, {
      type: damageType, sourceX: x, sourceY: y, knockback,
      impact: damageType === 'fire' ? 'fire' : damageType === 'shadow' ? 'shadow' : damageType === 'earth' ? 'earth' : 'celestial',
      sourceTeam: 'fallen', sourceActor: this
    }) || 0;
    if (amount && status?.id) this.combat?.statuses?.apply?.(target, status.id, { power: this.def.attack, x, y, team: 'fallen' });
    return amount;
  }

  radialDamage(x, y, radius, multiplier, damageType, knockback = 0, status = null) {
    let hits = 0;
    for (const target of this.hostileTargets()) {
      const node = actorNode(target);
      if (!node || Math.hypot(node.x - x, node.y - y) > radius) continue;
      if (this.damageTarget(target, multiplier, damageType, x, y, knockback, status)) hits += 1;
    }
    return hits;
  }

  scheduleHostileRadialPulses(x, y, radius, multiplier, damageType, knockback, status, delays = [0], options = {}) {
    const palette = options.palette || PALETTES.fallen;
    const baseRadiusScale = options.baseRadiusScale ?? 1;
    const radiusStepScale = options.radiusStepScale ?? 0;
    const particleBase = options.particleBase ?? 10;
    const particleStep = options.particleStep ?? 2;
    const fxDuration = options.fxDuration ?? 460;
    const cameraShake = options.cameraShake || null;
    let totalHits = 0;
    delays.forEach((delay, i) => this.scene.time.delayedCall(delay, () => {
      if (this.dead) return;
      const scale = options.scales?.[i] ?? 1;
      const burstRadius = radius * (baseRadiusScale + radiusStepScale * i);
      const final = i === delays.length - 1;
      const pulseHits = this.radialDamage(x, y, radius, multiplier * scale, damageType, final ? knockback : knockback * 0.22, status);
      totalHits += pulseHits;
      this.paletteBurst(x, y, palette, burstRadius, fxDuration, particleBase + i * particleStep);
      if (options.featherBurst) this.featherBurst(x, y, palette, burstRadius * 0.82, (options.featherBase ?? 12) + i * (options.featherStep ?? 2), options.featherDuration ?? 520);
      if (options.halo && (options.haloEveryPulse || final)) this.brokenHalo(x, y, burstRadius * (options.haloScale ?? 0.78), palette, options.haloDuration ?? 480);
      if (cameraShake && pulseHits) this.scene.cameras.main.shake(cameraShake.ms + i * (cameraShake.msStep ?? 0), cameraShake.intensity + i * (cameraShake.intensityStep ?? 0));
    }));
    return totalHits;
  }

  selectPrismaticTarget(i = 0, used = new Set()) {
    const ability = this.def.abilities.prismaticDominion;
    const live = this.hostileTargets().filter(target => {
      const node = actorNode(target);
      return node && Math.hypot(node.x - this.body.x, node.y - this.body.y) <= ability.range;
    });
    if (!live.length) return null;
    let pool = live.filter(target => !used.has(target));
    if (!pool.length) pool = live;
    pool.sort((a, b) => {
      const an = actorNode(a), bn = actorNode(b);
      const ad = Math.hypot(an.x - this.body.x, an.y - this.body.y);
      const bd = Math.hypot(bn.x - this.body.x, bn.y - this.body.y);
      if (Math.abs(ad - bd) > 0.01) return ad - bd;
      return String(a.id || '').localeCompare(String(b.id || '')) || i;
    });
    return pool[0] || null;
  }

  coneDamage(stage) {
    const facing = directionVector(this.direction);
    const cosThreshold = Math.cos((stage.arcDegrees || 110) * Math.PI / 360);
    let hits = 0;
    for (const target of this.hostileTargets()) {
      const node = actorNode(target);
      if (!node) continue;
      const dx = node.x - this.body.x, dy = node.y - this.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > stage.range) continue;
      const dot = distance ? (dx / distance) * facing[0] + (dy / distance) * facing[1] : 1;
      if (dot < cosThreshold) continue;
      const type = stage.element === 'dark' ? 'shadow' : stage.element === 'lightning' ? 'lightning' : stage.element === 'wind' ? 'wind' : stage.element === 'light' ? 'celestial' : 'celestial';
      if (this.damageTarget(target, stage.damageMultiplier, type, this.body.x, this.body.y, stage.knockback)) hits += 1;
    }
    return hits;
  }

  comboFx(stageIndex) {
    const stage = this.def.basicCombo[stageIndex];
    const progression = [PALETTES.fire.slice(0, 3), [0x160828, 0x6f41ff, 0x59dfff], PALETTES.eclipse.slice(1, 5), PALETTES.tempest, PALETTES.prism.slice(0, 6), PALETTES.prism];
    const palette = progression[stageIndex] || PALETTES.fallen;
    const radius = 58 + stageIndex * 28;
    this.paletteBurst(this.body.x, this.body.y - 6, palette, radius, 300 + stageIndex * 35, 7 + stageIndex * 2);
    this.featherBurst(this.body.x, this.body.y - 8, palette, radius * 0.72, 7 + stageIndex * 2, 320);
    if (stageIndex >= 2) this.brokenHalo(this.body.x, this.body.y - 8, 48 + stageIndex * 15, palette, 360);
    if (stageIndex === 4) {
      const [fx, fy] = directionVector(this.direction);
      this.beam(this.body.x, this.body.y - 8, this.body.x + fx * stage.range, this.body.y + fy * stage.range - 8, palette, 300, 10);
    }
  }

  requestBasicAttack(time = this.scene.time.now) {
    if (this.dead || this.currentAbility || this.state === 'tempest') return false;
    if (this.state === 'combo') { this.comboQueued = true; return true; }
    if (this.state === 'recover' && time < this.stateUntil) return false;
    if (time < this.knockbackUntil || this.combat?.statuses?.actionLocked?.(this)) return false;
    if (time - this.comboLastEndedAt > this.def.comboContinueMs) this.comboIndex = 0;
    this.beginComboStage(this.comboIndex, time);
    return true;
  }

  beginComboStage(index, time) {
    const stage = this.def.basicCombo[index % this.def.basicCombo.length];
    this.comboStage = stage;
    this.comboIndex = index % this.def.basicCombo.length;
    this.comboStartedAt = time;
    this.comboTriggered = false;
    this.comboQueued = false;
    this.state = 'combo';
    this.body.setVelocity(0);
    this.lastActionName = `${stage.name} • ${this.comboIndex + 1}/6`;
  }

  updateCombo(time) {
    const stage = this.comboStage;
    if (!stage) { this.state = 'idle'; return; }
    const elapsed = time - this.comboStartedAt;
    const progress = elapsed / stage.durationMs;
    const sequence = stage.action === 'backslash' ? BACKSLASH_SEQUENCE : null;
    this.renderProgress(stage.action, progress, sequence);
    if (!this.comboTriggered && progress >= stage.triggerAt) {
      this.comboTriggered = true;
      const hits = stage.arcDegrees >= 350
        ? this.radialDamage(this.body.x, this.body.y, stage.range, stage.damageMultiplier, 'celestial', stage.knockback)
        : this.coneDamage(stage);
      this.comboFx(this.comboIndex);
      this.combat?.audio?.play?.(this.comboIndex >= 4 ? 'heavenfall' : 'celestial_strike', { volume: 0.06 + this.comboIndex * 0.008, throttleMs: 80 });
      if (hits && this.scene.state?.settings?.screenShake) this.scene.cameras.main.shake(70 + this.comboIndex * 16, 0.0018 + this.comboIndex * 0.00065);
    }
    if (progress >= 1) {
      const queued = this.comboQueued;
      const next = (this.comboIndex + 1) % this.def.basicCombo.length;
      this.comboLastEndedAt = time;
      this.comboStage = null;
      this.comboTriggered = false;
      this.comboIndex = next;
      if (queued) this.beginComboStage(next, time);
      else { this.state = 'recover'; this.stateUntil = time + 70; }
    }
  }

  beginAbility(ability, target, time = this.scene.time.now) {
    if (!ability || this.dead || this.currentAbility || this.state === 'combo' || this.state === 'tempest') return false;
    if (this.state === 'recover' && time < this.stateUntil) return false;
    if (!this.cooldownReady(ability.id, time) || (ability.major && !this.majorReady(time))) return false;
    const point = actorNode(target) || target?.body;
    if (!point) return false;
    this.currentAbility = ability;
    this.abilityStartedAt = time;
    this.abilityTriggered = false;
    this.abilityTarget = target;
    this.abilityTargetX = point.x;
    this.abilityTargetY = point.y;
    this.setDirection(point.x - this.body.x, point.y - this.body.y);
    this.setCooldown(ability, time);
    if (ability.major) this.majorAbilityLockUntil = Math.max(this.majorAbilityLockUntil, time + ability.majorLockMs);
    this.body.setVelocity(0);
    this.lastActionName = ability.name;
    if (ability.id === 'seraphel_tempest_exile') {
      this.state = 'tempest';
      this.tempest = { phase: 'windup', nextAt: time + ability.windupMs, remaining: ability.bounces, lastTarget: null, visited: new Set(), startedAt: time };
      this.paletteBurst(this.body.x, this.body.y - 8, PALETTES.tempest, 94, ability.windupMs, 12);
      this.featherBurst(this.body.x, this.body.y - 8, PALETTES.tempest, 88, 14, ability.windupMs);
    } else {
      this.state = 'ability';
      this.beginAbilityVfx(ability);
    }
    return true;
  }

  beginAbilityVfx(ability) {
    const x = ability.id === 'seraphel_prismatic_dominion' ? this.body.x : this.abilityTargetX;
    const y = ability.id === 'seraphel_prismatic_dominion' ? this.body.y : this.abilityTargetY;
    if (ability.id === 'seraphel_pyre_fallen_sun') {
      this.brokenHalo(x, y, ability.radius * 0.68, PALETTES.fire, ability.windupMs);
      this.paletteBurst(x, y, PALETTES.fire, ability.radius * 0.60, ability.windupMs, 12);
    } else if (ability.id === 'seraphel_crown_frozen_abyss') {
      this.brokenHalo(x, y, ability.radius * 0.72, PALETTES.ice, ability.windupMs);
      this.paletteBurst(x, y, PALETTES.ice, ability.radius * 0.62, ability.windupMs, 14);
    } else if (ability.id === 'seraphel_worldbreaker_testament') {
      this.paletteBurst(x, y, PALETTES.earth, ability.radius * 0.68, ability.windupMs, 10);
    } else if (ability.id === 'seraphel_eclipse_grace') {
      this.brokenHalo(x, y, ability.radius * 0.84, PALETTES.eclipse, ability.windupMs);
      this.paletteBurst(x, y, PALETTES.eclipse, ability.radius * 0.70, ability.windupMs, 16);
    } else if (ability.id === 'seraphel_prismatic_dominion') {
      this.brokenHalo(x, y, 128, PALETTES.prism, ability.windupMs);
      this.paletteBurst(x, y, PALETTES.prism, 156, ability.windupMs, 18);
    } else if (ability.id === 'seraphel_sevenfold_cataclysm') {
      this.brokenHalo(this.body.x, this.body.y - 10, 148, PALETTES.prism, ability.windupMs);
      this.paletteBurst(this.body.x, this.body.y - 10, PALETTES.prism, 176, ability.windupMs, 21);
      this.featherBurst(this.body.x, this.body.y - 10, PALETTES.prism, 160, 24, ability.windupMs);
    }
  }

  abilityAnimation(ability, progress) {
    if (ability.id === 'seraphel_pyre_fallen_sun' || ability.id === 'seraphel_crown_frozen_abyss') this.renderProgress('spellcast', progress);
    else if (ability.id === 'seraphel_worldbreaker_testament') this.renderProgress('halfslash', progress);
    else if (ability.id === 'seraphel_eclipse_grace') this.renderProgress('emote', progress);
    else if (ability.id === 'seraphel_prismatic_dominion') this.renderProgress('shoot', progress);
    else if (ability.id === 'seraphel_sevenfold_cataclysm') {
      // Every complete source action is used deliberately. The climb block is
      // the vertical-rift ascension phase, not ordinary locomotion.
      if (progress < 0.22) this.renderProgress('emote', progress / 0.22);
      else if (progress < 0.42) this.renderProgress('climb', (progress - 0.22) / 0.20);
      else if (progress < 0.66) this.renderProgress('jump', (progress - 0.42) / 0.24, JUMP_SEQUENCE);
      else this.renderProgress('spellcast', (progress - 0.66) / 0.34);
    } else this.renderProgress('spellcast', progress);
  }

  updateAbility(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 180); return; }
    const progress = (time - this.abilityStartedAt) / ability.windupMs;
    this.abilityAnimation(ability, progress);
    if (!this.abilityTriggered && progress >= ability.triggerAt) {
      this.abilityTriggered = true;
      this.triggerAbility(ability);
    }
    if (progress >= 1) this.finishAbility(time, ability.recoverMs || 400);
  }

  triggerAbility(ability) {
    const x = this.abilityTargetX, y = this.abilityTargetY;
    if (ability.id === 'seraphel_pyre_fallen_sun') {
      const pulseDelays = ability.pulseDelays || [0, 150, 310, 520];
      this.scheduleHostileRadialPulses(x, y, ability.radius, ability.damageMultiplier, 'fire', ability.knockback, ability.status, pulseDelays, {
        scales: ability.pulseScales || [1.00, 0.56, 0.42, 0.36],
        palette: PALETTES.fire,
        baseRadiusScale: 0.52,
        radiusStepScale: 0.16,
        particleBase: 14,
        particleStep: 3,
        fxDuration: 520,
        featherBurst: true,
        featherBase: 10,
        featherStep: 2,
        featherDuration: 560,
        halo: true,
        haloEveryPulse: false,
        haloScale: 0.68,
        haloDuration: 460,
        cameraShake: { ms: 110, msStep: 18, intensity: 0.0032, intensityStep: 0.0008 }
      });
      this.combat?.audio?.play?.('fire', { volume: 0.12, throttleMs: 300 });
      return;
    }
    if (ability.id === 'seraphel_crown_frozen_abyss') {
      const hits = this.radialDamage(x, y, ability.radius, ability.damageMultiplier, 'ice', ability.knockback, ability.status);
      this.paletteBurst(x, y, PALETTES.ice, ability.radius, 820, 22);
      this.brokenHalo(x, y, ability.radius * 0.78, PALETTES.ice, 720);
      this.combat?.audio?.play?.('essence', { volume: 0.115, throttleMs: 300 });
      if (hits) this.scene.cameras.main.shake(170, 0.0056);
      return;
    }
    if (ability.id === 'seraphel_worldbreaker_testament') {
      const delays = ability.pulseDelays || [0];
      const scales = ability.pulseScales || [1];
      delays.forEach((delay, i) => this.scene.time.delayedCall(delay, () => {
        if (this.dead) return;
        const final = i === delays.length - 1;
        this.radialDamage(x, y, ability.radius, ability.damageMultiplier * (scales[i] || 0.33), 'earth', final ? ability.knockback : ability.knockback * 0.15);
        this.paletteBurst(x, y, PALETTES.earth, ability.radius * (0.62 + i * 0.18), 460, 10 + i * 4);
        if (final) this.featherBurst(x, y, PALETTES.earth, ability.radius * 0.86, 16, 600);
      }));
      this.combat?.audio?.play?.('slam', { volume: 0.13, throttleMs: 340 });
      this.scene.cameras.main.shake(230, 0.0072);
      return;
    }
    if (ability.id === 'seraphel_eclipse_grace') {
      // The visual begins as a pull/collapse. Damage remains one faction-safe
      // resolved event so the future boss can reuse the exact implementation.
      const hits = this.radialDamage(x, y, ability.radius, ability.damageMultiplier, 'shadow', ability.knockback);
      this.brokenHalo(x, y, ability.radius * 0.92, PALETTES.eclipse, 900);
      this.paletteBurst(x, y, PALETTES.eclipse, ability.radius * 1.08, 900, 26);
      this.featherBurst(x, y, PALETTES.eclipse, ability.radius, 22, 760);
      this.combat?.audio?.play?.('heavenfall', { volume: 0.13, throttleMs: 420 });
      if (hits) this.scene.cameras.main.shake(260, 0.0084);
      return;
    }
    if (ability.id === 'seraphel_prismatic_dominion') {
      const colors = PALETTES.prism;
      const damageTypes = ['fire','ice','lightning','wind','earth','celestial','shadow'];
      const usedTargets = new Set();
      let firedAnyBeam = false;
      for (let i = 0; i < ability.strikes; i += 1) this.scene.time.delayedCall(i * ability.strikeDelayMs, () => {
        if (this.dead) return;
        const target = this.selectPrismaticTarget(i, usedTargets);
        if (!target) return;
        const node = actorNode(target);
        if (!node || !actorAlive(target)) return;
        firedAnyBeam = true;
        usedTargets.add(target);
        const angle = i * Math.PI * 2 / ability.strikes;
        const sx = this.body.x + Math.cos(angle) * 74;
        const sy = this.body.y + Math.sin(angle) * 74 - 10;
        this.beam(sx, sy, node.x, node.y - 8, [colors[i], colors[(i + 2) % colors.length], 0xffffff], 290, 10);
        const hit = this.damageTarget(target, ability.damageMultiplier, damageTypes[i], sx, sy, ability.knockback * 0.24);
        if (hit) this.paletteBurst(node.x, node.y, [colors[i], colors[(i + 1) % colors.length], 0xffffff], 86, 360, 9);
      });
      this.scene.time.delayedCall((ability.strikes - 1) * ability.strikeDelayMs + (ability.collapseDelayMs || 140), () => {
        if (this.dead) return;
        const collapseHits = this.radialDamage(this.body.x, this.body.y, ability.radius, ability.finalDamageMultiplier, 'celestial', ability.knockback);
        this.paletteBurst(this.body.x, this.body.y, colors, ability.radius, 820, 30);
        this.brokenHalo(this.body.x, this.body.y, ability.radius * 0.74, colors, 720);
        this.featherBurst(this.body.x, this.body.y, colors, ability.radius * 0.86, 18, 620);
        if (firedAnyBeam || collapseHits) this.scene.cameras.main.shake(215, 0.0071);
      });
      this.combat?.audio?.play?.('seraphic_judgment', { volume: 0.13, throttleMs: 400 });
      return;
    }
    if (ability.id === 'seraphel_sevenfold_cataclysm') {
      const elements = [
        { type: 'fire', palette: PALETTES.fire }, { type: 'ice', palette: PALETTES.ice },
        { type: 'lightning', palette: PALETTES.tempest }, { type: 'wind', palette: [0x4cf4d2,0x88ffff,0x7c8cff] },
        { type: 'earth', palette: PALETTES.earth }, { type: 'celestial', palette: [0xfff09a,0xffffff,0x82eaff] },
        { type: 'shadow', palette: [0x09010f,0x581176,0xc239f2,0xff5a7a] }
      ];
      elements.forEach((entry, i) => this.scene.time.delayedCall(i * ability.stageDelayMs, () => {
        if (this.dead) return;
        const r = ability.radius * (0.54 + i * 0.06);
        this.radialDamage(x, y, r, ability.damageMultiplier, entry.type, i === elements.length - 1 ? ability.knockback * 0.30 : 60);
        this.paletteBurst(x, y, entry.palette, r, 520, 12 + i * 2);
        this.brokenHalo(x, y, r * 0.70, entry.palette, 470);
        if (i === elements.length - 1) this.scene.time.delayedCall(180, () => {
          if (this.dead) return;
          this.radialDamage(x, y, ability.radius, ability.finalDamageMultiplier, 'celestial', ability.knockback);
          this.paletteBurst(x, y, PALETTES.prism, ability.radius * 1.28, 1050, 34);
          this.featherBurst(x, y, PALETTES.prism, ability.radius * 1.08, 32, 900);
          this.brokenHalo(x, y, ability.radius, PALETTES.prism, 980);
          this.combat?.audio?.play?.('heavenfall', { volume: 0.16, throttleMs: 500 });
          this.scene.cameras.main.shake(340, 0.0115);
        });
      }));
    }
  }

  selectTempestTarget() {
    const all = this.hostileTargets().filter(target => {
      const node = actorNode(target);
      return node && Math.hypot(node.x - this.body.x, node.y - this.body.y) <= this.def.abilities.tempestExile.bounceRange;
    });
    if (!all.length) return null;
    // Prefer a different, not-yet-visited living opponent. If only one worthy
    // opponent remains, repeat strikes are allowed while it is alive; once it
    // dies, it disappears from this list before the next bounce.
    let pool = all.filter(target => target !== this.tempest?.lastTarget && !this.tempest?.visited?.has(target));
    if (!pool.length) pool = all.filter(target => target !== this.tempest?.lastTarget);
    if (!pool.length) pool = all;
    pool.sort((a, b) => {
      const an = actorNode(a), bn = actorNode(b);
      return Math.hypot(an.x - this.body.x, an.y - this.body.y) - Math.hypot(bn.x - this.body.x, bn.y - this.body.y);
    });
    return pool[0] || null;
  }

  updateTempest(time) {
    const ability = this.currentAbility;
    const t = this.tempest;
    if (!ability || !t) { this.finishAbility(time, 220); return; }
    if (t.phase === 'windup') {
      this.renderProgress('jump', clamp((time - t.startedAt) / ability.windupMs, 0, 1), JUMP_SEQUENCE);
      if (time < t.nextAt) return;
      t.phase = 'bouncing';
    }
    if (time < t.nextAt) { this.renderLoop('run', time, 48); return; }
    const target = this.selectTempestTarget();
    if (!target || t.remaining <= 0) { this.finishTempest(time); return; }
    const node = actorNode(target);
    if (!node || !actorAlive(target)) { t.nextAt = time + 20; return; }
    const ox = this.body.x, oy = this.body.y;
    const dx = node.x - ox, dy = node.y - oy;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = clamp(node.x - dx / dist * 34, 18, this.scene.currentMap.width - 18);
    const ny = clamp(node.y - dy / dist * 34, 18, this.scene.currentMap.height - 18);
    this.setDirection(dx, dy);
    this.body.setPosition(nx, ny).setVelocity(0);
    this.beam(ox, oy - 8, nx, ny - 8, PALETTES.tempest, 250, 11);
    this.featherBurst(nx, ny - 8, PALETTES.tempest, 76, 11, 300);
    this.paletteBurst(nx, ny - 8, PALETTES.tempest, 88, 330, 11);
    this.damageTarget(target, ability.damageMultiplier, 'lightning', ox, oy, ability.knockback);
    t.visited.add(target);
    t.lastTarget = target;
    t.remaining -= 1;
    t.nextAt = time + ability.bounceDelayMs;
    this.lastActionName = `Tempest of Exile • ${ability.bounces - t.remaining}/${ability.bounces}`;
    this.combat?.audio?.play?.('wing_burst', { volume: 0.09, throttleMs: 80 });
    if (t.remaining <= 0) this.scene.time.delayedCall(ability.bounceDelayMs, () => { if (this.state === 'tempest') this.finishTempest(this.scene.time.now); });
  }

  finishTempest(time) {
    const ability = this.currentAbility || this.def.abilities.tempestExile;
    this.radialDamage(this.body.x, this.body.y, ability.impactRadius * 1.55, ability.finalDamageMultiplier, 'wind', ability.knockback * 1.35);
    this.paletteBurst(this.body.x, this.body.y - 8, PALETTES.tempest, 142, 620, 22);
    this.brokenHalo(this.body.x, this.body.y - 8, 102, PALETTES.tempest, 560);
    this.scene.cameras.main.shake(190, 0.0065);
    this.tempest = null;
    this.finishAbility(time, ability.recoverMs || 320);
  }

  finishAbility(time, recoverMs = 350) {
    this.currentAbility = null;
    this.abilityTarget = null;
    this.abilityTriggered = false;
    this.tempest = null;
    this.body.setVelocity(0);
    this.state = 'recover';
    this.stateUntil = time + recoverMs;
  }

  renderControlledIdle(time, meditating = false, hostileNearby = false) {
    if (meditating) { this.state = 'meditate'; this.lastActionName = 'Fallen meditation'; this.renderLoop('sit', time, 520); }
    else { this.state = 'idle'; this.lastActionName = 'Shattered vigil'; this.renderLoop(hostileNearby ? 'combatIdle' : 'idle', time, hostileNearby ? 150 : 230); }
  }

  syncPresentation(time) {
    const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    const hoverAmp = this.dead ? 0 : speed > 8 ? 2.1 : 1.35;
    const hoverY = Math.sin((time + 260) * 0.0068) * hoverAmp;
    this.sprite.setPosition(this.body.x, this.body.y - 4 + hoverY).setDepth(this.body.y + 4);
    this.nameplate.setPosition(this.body.x, this.body.y - 83 + hoverY).setDepth(this.body.y + 9000);
    this.debugText.setPosition(this.body.x, this.body.y + 40).setDepth(this.body.y + 16020);
    this.updateHealthBar();
    if (time < this.hurtUntil) this.sprite.setTintFill(0xffffff); else this.sprite.clearTint();
    if (this.debugEnabled && !this.dead) {
      this.debugText.setText(`FALLEN ${this.state.toUpperCase()} • ${this.lastActionName}\nHP ${Math.ceil(this.hp)}/${this.def.maxHp} • Lv ${this.def.internalLevel} • ∞ Essence`);
    }
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, options = {}) {
    if (this.dead) return false;
    const damage = Math.max(1, Math.floor(amount));
    this.hp = Math.max(0, this.hp - damage);
    this.hurtUntil = Math.max(this.hurtUntil, time + 90);
    if (options.knockback) {
      const retained = Math.max(0.025, 1 - (this.def.staggerResistance || 0));
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
    this.respawnAt = time + this.def.freeplayRespawnMs;
    this.body.setVelocity(0);
    this.body.body.enable = false;
    this.currentAbility = null;
    this.tempest = null;
    this.comboStage = null;
    this.combat?.statuses?.clear?.(this);
    this.lastActionName = 'Halo extinguished';
    this.debugText.setVisible(false);
  }

  respawn(time, x = this.homeX, y = this.homeY) {
    this.dead = false;
    this.hp = this.def.maxHp;
    this.homeX = x; this.homeY = y;
    this.body.setPosition(x, y).setVelocity(0);
    this.body.body.enable = true;
    this.sprite.setActive(true).setVisible(true).clearTint();
    this.nameplate.setVisible(true);
    this.currentAbility = null;
    this.tempest = null;
    this.comboStage = null;
    this.comboIndex = 0;
    this.comboQueued = false;
    this.comboLastEndedAt = -Infinity;
    this.abilityCooldowns.clear();
    this.majorAbilityLockUntil = 0;
    this.knockbackUntil = 0;
    this.state = 'idle';
    this.stateUntil = time + 280;
    this.lastActionName = 'Shattered return';
    this.debugText.setVisible(this.debugEnabled);
    this.renderFrame('combatIdle', 0);
    this.paletteBurst(x, y - 8, PALETTES.prism, 150, 720, 20);
    this.featherBurst(x, y - 8, PALETTES.fallen, 130, 18, 650);
  }

  snapshot(time = this.scene.time.now) {
    return {
      active: !this.dead, name: this.def.displayName, levelDisplay: this.def.levelDisplay,
      hp: Math.ceil(this.hp), maxHp: this.def.maxHp, state: this.state, action: this.lastActionName,
      internalLevel: this.def.internalLevel, threatTier: this.def.threatTier,
      cooldowns: Object.fromEntries(Object.values(this.def.abilities).map(ability => [ability.id, Math.max(0, (this.abilityCooldowns.get(ability.id) || 0) - time)]))
    };
  }

  destroy() {
    this.body.destroy();
    this.sprite.destroy();
    this.nameplate.destroy();
    this.debugText.destroy();
  }
}
