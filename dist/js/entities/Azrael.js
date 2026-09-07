import { areHostile } from '../data/factions.js';

const FRAME_COUNTS = Object.freeze({
  spellcast: 7, thrust: 8, slash: 6, shoot: 13, hurt: 6,
  idle: 2, jump: 5, emote: 3, run: 8, combatIdle: 2,
  backslash: 13, halfslash: 6
});

const BACKSLASH_SEQUENCE = Object.freeze([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]);
const JUMP_SEQUENCE = Object.freeze([0, 1, 2, 3, 4, 1]);
const IDLE_SEQUENCE = Object.freeze([0, 0, 1]);

function actorPoint(actor) {
  const node = actor?.body || actor?.sprite;
  return node ? { x: node.x, y: node.y } : null;
}

function actorAlive(actor) {
  if (!actor) return false;
  if (actor.dead === true || actor.state === 'dying' || actor.state === 'dead') return false;
  if (actor.sprite && actor.sprite.active === false) return false;
  return Boolean(actorPoint(actor));
}

export class Azrael {
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
    this.body.body.setSize(22, 18, false).setOffset(-10, 1).setCollideWorldBounds(true);

    this.sprite = scene.add.sprite(this.homeX, this.homeY, definition.assets.combatIdle, 0)
      .setOrigin(0.5, 0.70).setScale(definition.scale).setDepth(this.homeY + 2);

    this.direction = 2;
    this.hp = definition.maxHp;
    this.state = 'idle';
    this.stateUntil = 0;
    this.target = null;
    this.nextThink = 0;
    this.animClock = Math.random() * 500;
    this.currentAbility = null;
    this.abilityStartedAt = 0;
    this.abilityTargetX = this.homeX;
    this.abilityTargetY = this.homeY;
    this.abilityTriggered = false;
    this.abilityTelegraph = null;
    this.abilityCooldowns = new Map();
    this.majorAbilityLockUntil = 0;
    this.strikeVariant = 0;
    this.nextGlideTrailAt = 0;
    this.repositionSign = 1;
    this.dashVX = 0;
    this.dashVY = 0;
    this.dashEndsAt = 0;
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.dead = false;
    this.deathStartedAt = 0;
    this.respawnAt = 0;
    this.debugEnabled = false;
    this.lastActionName = 'Hovering';

    this.createNameplate();
    this.createDebugLabel();
    this.renderLoop('combatIdle', 0, 210);
  }

  createNameplate() {
    this.nameplate = this.scene.add.container(this.body.x, this.body.y - 76).setDepth(9100);
    const plate = this.scene.add.graphics();
    // Wider mythic plate keeps the full ARCHANGEL AZRAEL title comfortably
    // inside its frame at phone scale while leaving room for the emblem slot.
    plate.fillStyle(0x080b13, 0.88).fillRoundedRect(-88, -19, 176, 40, 9);
    plate.lineStyle(1, 0xffe394, 0.92).strokeRoundedRect(-88, -19, 176, 40, 9);
    plate.lineStyle(1, 0xbff6ff, 0.46).strokeRoundedRect(-84, -15, 168, 32, 7);
    // Reserved celestial emblem slot: a tiny halo-and-wing seal. A bespoke SVG
    // can replace this later without changing the nameplate contract.
    plate.lineStyle(2, 0xffe8a6, 0.92).strokeEllipse(-70, -4, 12, 5);
    plate.lineStyle(2, 0xdff9ff, 0.72).lineBetween(-76, 0, -84, 5).lineBetween(-76, 2, -83, 9);
    plate.lineStyle(2, 0xdff9ff, 0.72).lineBetween(-64, 0, -56, 5).lineBetween(-64, 2, -57, 9);

    this.nameText = this.scene.add.text(9, -14, 'ARCHANGEL AZRAEL', {
      fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'bold', color: '#fff0b0',
      stroke: '#241306', strokeThickness: 3, letterSpacing: 0.35
    }).setOrigin(0.5, 0);
    this.levelText = this.scene.add.text(9, 0, 'Lv. ???  •  CELESTIAL MYTHIC', {
      fontFamily: 'Arial, sans-serif', fontSize: '7px', color: '#d9f8ff',
      stroke: '#0a141b', strokeThickness: 2, letterSpacing: 0.2
    }).setOrigin(0.5, 0);

    this.healthBack = this.scene.add.graphics();
    this.healthBack.fillStyle(0x140d0a, 0.92).fillRoundedRect(-63, 14, 126, 5, 2);
    this.healthBar = this.scene.add.graphics();
    this.nameplate.add([plate, this.nameText, this.levelText, this.healthBack, this.healthBar]);
    this.updateHealthBar();
  }

  createDebugLabel() {
    this.debugText = this.scene.add.text(this.body.x, this.body.y + 38, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '8px', color: '#c8fbff',
      backgroundColor: 'rgba(5,10,15,0.78)', stroke: '#071015', strokeThickness: 2, padding: { x: 4, y: 3 }
    }).setOrigin(0.5, 0).setDepth(16030).setVisible(false);
  }

  setDebugEnabled(enabled) {
    this.debugEnabled = Boolean(enabled);
    this.debugText?.setVisible(this.debugEnabled && !this.dead);
    return this.debugEnabled;
  }

  updateHealthBar() {
    if (!this.healthBar) return;
    const ratio = Math.max(0, Math.min(1, this.hp / this.def.maxHp));
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffe58a, 0.96).fillRoundedRect(-62, 15, 124 * ratio, 3, 1);
    if (ratio > 0.35) this.healthBar.fillStyle(0xe7ffff, 0.48).fillRect(-61, 15, 122 * ratio, 1);
  }

  cooldownReady(id, time) { return time >= (this.abilityCooldowns.get(id) || 0); }
  majorReady(time) { return time >= this.majorAbilityLockUntil; }
  setCooldown(ability, time) { this.abilityCooldowns.set(ability.id, time + ability.cooldownMs); }

  setDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) this.direction = vx < 0 ? 1 : 3;
    else if (Math.abs(vy) > 0.001) this.direction = vy < 0 ? 0 : 2;
  }

  frameFor(action, frame) {
    if (action === 'hurt') return Math.max(0, Math.min(FRAME_COUNTS.hurt - 1, frame));
    return this.direction * FRAME_COUNTS[action] + Math.max(0, Math.min(FRAME_COUNTS[action] - 1, frame));
  }

  renderFrame(action, frame) {
    const texture = this.def.assets[action];
    if (!texture || !this.scene.textures.exists(texture)) return;
    this.sprite.setTexture(texture).setFrame(this.frameFor(action, frame));
  }

  renderLoop(action, time, frameMs = 120, sequence = null) {
    const seq = sequence || (action === 'combatIdle' || action === 'idle' ? IDLE_SEQUENCE : null);
    const frames = seq || Array.from({ length: FRAME_COUNTS[action] || 1 }, (_, i) => i);
    const index = Math.floor((time + this.animClock) / frameMs) % frames.length;
    this.renderFrame(action, frames[index]);
  }

  renderProgress(action, progress, sequence = null) {
    const seq = sequence || Array.from({ length: FRAME_COUNTS[action] || 1 }, (_, i) => i);
    const index = Math.min(seq.length - 1, Math.floor(Math.max(0, Math.min(0.999999, progress)) * seq.length));
    this.renderFrame(action, seq[index]);
  }

  activeEnemies(enemies) {
    return enemies.filter(enemy => actorAlive(enemy) && areHostile(this, enemy));
  }

  clusterCount(enemy, enemies, radius) {
    const p = actorPoint(enemy);
    if (!p) return 0;
    const rr = radius * radius;
    let count = 0;
    for (const other of enemies) {
      if (!actorAlive(other) || !areHostile(this, other)) continue;
      const op = actorPoint(other);
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
      const p = actorPoint(enemy);
      const dx = p.x - x, dy = p.y - y;
      if (dx * dx + dy * dy <= rr) count += 1;
    }
    return count;
  }

  chooseTarget(enemies) {
    const candidates = this.activeEnemies(enemies);
    let best = null;
    let bestScore = Infinity;
    for (const enemy of candidates) {
      const p = actorPoint(enemy);
      const homeDistance = Math.hypot(p.x - this.homeX, p.y - this.homeY);
      if (homeDistance > this.def.leashRange) continue;
      const distance = Math.hypot(p.x - this.body.x, p.y - this.body.y);
      if (distance > this.def.senseRange) continue;
      const cluster = this.clusterCount(enemy, candidates, this.def.abilities.heavenfall.targetClusterRadius);
      // Azrael is deliberately cluster-aware: groups are slightly more valuable
      // than a marginally closer lone target, especially for Heavenfall.
      const score = distance - Math.max(0, cluster - 1) * 46 + (enemy.def?.named ? 24 : 0);
      if (score < bestScore) { best = enemy; bestScore = score; }
    }
    return best;
  }

  beginAbility(ability, target, time) {
    const point = actorPoint(target);
    if (!ability || !point) return false;
    this.currentAbility = ability;
    this.target = target;
    this.abilityStartedAt = time;
    this.abilityTriggered = false;
    this.abilityTargetX = point.x;
    this.abilityTargetY = point.y;
    this.state = ability.id === 'azrael_wing_burst' ? 'wingburst' : 'ability';
    this.stateUntil = time + ability.windupMs;
    this.setCooldown(ability, time);
    if (ability.major) this.majorAbilityLockUntil = Math.max(this.majorAbilityLockUntil, time + (ability.majorLockMs || 2200));
    this.body.setVelocity(0);
    this.setDirection(point.x - this.body.x, point.y - this.body.y);
    this.lastActionName = ability.name;
    this.combat?.beginAllyAbility?.(this, ability, target, point.x, point.y);
    return true;
  }

  finishAbility(time, recoverMs = 300) {
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityTriggered = false;
    this.body.setVelocity(0);
    this.state = 'recover';
    this.stateUntil = time + recoverMs;
    this.repositionSign *= -1;
  }

  updateWingBurst(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 200); return; }
    const elapsed = time - this.abilityStartedAt;
    if (!this.abilityTriggered) {
      this.body.setVelocity(0);
      this.renderProgress('jump', elapsed / Math.max(1, ability.windupMs), JUMP_SEQUENCE);
      if (elapsed >= ability.windupMs) {
        this.abilityTriggered = true;
        const targetPoint = actorPoint(this.target) || { x: this.abilityTargetX, y: this.abilityTargetY };
        const dx = targetPoint.x - this.body.x, dy = targetPoint.y - this.body.y;
        const distance = Math.hypot(dx, dy) || 1;
        this.dashVX = dx / distance * this.def.wingBurstSpeed;
        this.dashVY = dy / distance * this.def.wingBurstSpeed;
        this.dashEndsAt = time + ability.dashMs;
        this.state = 'wingburst_dash';
        this.combat?.startAllyDash?.(this, ability, this.dashVX, this.dashVY);
      }
      return;
    }
  }

  updateWingBurstDash(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 200); return; }
    this.body.setVelocity(this.dashVX, this.dashVY);
    this.setDirection(this.dashVX, this.dashVY);
    this.renderLoop('run', time, 58);
    const targetPoint = actorPoint(this.target);
    const targetDistance = targetPoint ? Math.hypot(targetPoint.x - this.body.x, targetPoint.y - this.body.y) : Infinity;
    if (targetDistance <= 52 || time >= this.dashEndsAt) {
      this.body.setVelocity(0);
      this.combat?.triggerAllyAbility?.(this, ability, this.target, this.body.x, this.body.y);
      this.finishAbility(time, ability.recoverMs);
    }
  }

  updateAbility(time) {
    const ability = this.currentAbility;
    if (!ability) { this.finishAbility(time, 200); return; }
    const elapsed = Math.max(0, time - this.abilityStartedAt);
    const progress = Math.max(0, Math.min(0.999999, elapsed / Math.max(1, ability.windupMs)));

    if (ability.id === 'azrael_celestial_strike') {
      // Rotate through four supported melee blocks so Azrael actually shows off
      // the unusually complete sheet instead of repeating one generic swing.
      const action = ['halfslash', 'slash', 'thrust', 'backslash'][this.strikeVariant % 4];
      this.renderProgress(action, progress, action === 'backslash' ? BACKSLASH_SEQUENCE : null);
    } else if (ability.id === 'azrael_judgment_blast') {
      this.renderProgress('shoot', progress);
    } else if (ability.id === 'azrael_sanctified_nova') {
      if (progress < 0.52) this.renderProgress('spellcast', progress / 0.52);
      else this.renderProgress('emote', (progress - 0.52) / 0.48);
    } else if (ability.id === 'azrael_seraphic_judgment') {
      if (progress < 0.76) this.renderProgress('spellcast', progress / 0.76);
      else this.renderProgress('emote', (progress - 0.76) / 0.24);
    } else if (ability.id === 'azrael_sanctuary_first_light') {
      if (progress < 0.70) this.renderProgress('spellcast', progress / 0.70);
      else this.renderProgress('emote', (progress - 0.70) / 0.30);
    } else if (ability.id === 'azrael_heavenfall') {
      if (progress < 0.68) this.renderProgress('spellcast', progress / 0.68);
      else this.renderProgress('emote', (progress - 0.68) / 0.32);
    } else {
      this.renderProgress('thrust', progress);
    }

    if (!this.abilityTriggered && progress >= (ability.triggerAt ?? 0.58)) {
      this.abilityTriggered = true;
      this.combat?.triggerAllyAbility?.(this, ability, this.target, this.abilityTargetX, this.abilityTargetY);
    }
    if (elapsed >= ability.windupMs) {
      if (!this.abilityTriggered) {
        this.abilityTriggered = true;
        this.combat?.triggerAllyAbility?.(this, ability, this.target, this.abilityTargetX, this.abilityTargetY);
      }
      if (ability.id === 'azrael_celestial_strike') this.strikeVariant = (this.strikeVariant + 1) % 4;
      this.finishAbility(time, ability.recoverMs);
    }
  }

  decide(time, enemies) {
    const available = this.activeEnemies(enemies);
    if (!actorAlive(this.target) || (this.target && !areHostile(this, this.target))) this.target = null;
    if (this.target) {
      const p = actorPoint(this.target);
      if (!p || Math.hypot(p.x - this.homeX, p.y - this.homeY) > this.def.leashRange || Math.hypot(p.x - this.body.x, p.y - this.body.y) > this.def.senseRange * 1.18) this.target = null;
    }
    if (!this.target) this.target = this.chooseTarget(available);

    if (!this.target) {
      const dx = this.homeX - this.body.x, dy = this.homeY - this.body.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 54) {
        const inv = 1 / Math.max(1, distance);
        this.body.setVelocity(dx * inv * this.def.glideSpeed * 0.72, dy * inv * this.def.glideSpeed * 0.72);
        this.setDirection(dx, dy);
        this.state = 'return';
        this.lastActionName = 'Returning to vigil';
      } else {
        this.body.setVelocity(0);
        this.state = 'idle';
        this.lastActionName = 'Celestial vigil';
      }
      return;
    }

    const p = actorPoint(this.target);
    const dx = p.x - this.body.x, dy = p.y - this.body.y;
    const distance = Math.hypot(dx, dy);
    this.setDirection(dx, dy);

    const heavenfall = this.def.abilities.heavenfall;
    const sanctified = this.def.abilities.sanctifiedNova;
    const seraphic = this.def.abilities.seraphicJudgment;
    const sanctuary = this.def.abilities.sanctuaryFirstLight;
    const cluster = this.clusterCount(this.target, available, heavenfall.targetClusterRadius);
    const seraphicCluster = this.clusterCount(this.target, available, seraphic.targetClusterRadius);
    const nearby = this.hostileCountNear(available, this.body.x, this.body.y, sanctified.radius);
    const sanctuaryNeed = sanctuary ? (this.combat?.sanctuaryNeedScore?.(this, sanctuary) || 0) : 0;

    // Major celestial abilities share a short pacing lock so their huge visuals
    // read as deliberate invocations instead of becoming an unreadable nuke loop.
    // Sanctuary is support-priority only when somebody actually inside its
    // future field is meaningfully wounded; it never fires as empty spectacle.
    if (this.majorReady(time)) {
      if (sanctuary && sanctuaryNeed >= sanctuary.castMissingThreshold && this.cooldownReady(sanctuary.id, time)) {
        this.beginAbility(sanctuary, this.target, time); return;
      }
      if (cluster >= heavenfall.minCluster && distance <= 390 && this.cooldownReady(heavenfall.id, time)) {
        this.beginAbility(heavenfall, this.target, time); return;
      }
      if (nearby >= sanctified.minNearby && this.cooldownReady(sanctified.id, time)) {
        this.beginAbility(sanctified, this.target, time); return;
      }
      if (seraphicCluster >= seraphic.minCluster && distance <= seraphic.range && this.cooldownReady(seraphic.id, time)) {
        this.beginAbility(seraphic, this.target, time); return;
      }
    }

    const strike = this.def.abilities.celestialStrike;
    if (distance <= strike.range && this.cooldownReady(strike.id, time)) {
      this.beginAbility(strike, this.target, time); return;
    }

    const judgment = this.def.abilities.judgmentBlast;
    if (distance >= judgment.minRange && distance <= judgment.range && distance > 205 && this.cooldownReady(judgment.id, time)) {
      this.beginAbility(judgment, this.target, time); return;
    }

    const burst = this.def.abilities.wingBurst;
    if (distance > strike.range * 0.9 && distance <= burst.range && this.cooldownReady(burst.id, time)) {
      this.beginAbility(burst, this.target, time); return;
    }

    if (distance > this.def.preferredRange) {
      const inv = 1 / Math.max(1, distance);
      this.body.setVelocity(dx * inv * this.def.glideSpeed, dy * inv * this.def.glideSpeed);
      this.state = 'glide';
      this.lastActionName = `Gliding to ${this.target.def?.name || 'hostile'}`;
      return;
    }

    // If the fast strike is briefly cooling down, orbit instead of standing
    // rigidly on the target. This gives Azrael a composed skirmishing cadence.
    const inv = 1 / Math.max(1, distance);
    this.body.setVelocity(-dy * inv * this.def.speed * 0.56 * this.repositionSign, dx * inv * this.def.speed * 0.56 * this.repositionSign);
    this.state = 'reposition';
    this.stateUntil = time + 260;
    this.lastActionName = 'Repositioning';
  }

  update(time, delta, enemies) {
    this.animClock += delta;

    if (this.dead) {
      this.body.setVelocity(0);
      const p = Math.min(0.999999, (time - this.deathStartedAt) / 720);
      this.renderProgress('hurt', p);
      if (time >= this.respawnAt) this.respawn(time);
      this.syncPresentation(time);
      return;
    }

    if (time < this.knockbackUntil) {
      this.body.setVelocity(this.knockbackVX, this.knockbackVY);
      this.setDirection(this.knockbackVX, this.knockbackVY);
      this.renderLoop('combatIdle', time, 150);
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
      if (this.currentAbility) this.finishAbility(time, 250);
      this.state = 'recover';
      this.stateUntil = Math.max(this.stateUntil, time + 180);
    }

    if (this.state === 'wingburst') this.updateWingBurst(time);
    else if (this.state === 'wingburst_dash') this.updateWingBurstDash(time);
    else if (this.state === 'ability') {
      this.body.setVelocity(0);
      this.updateAbility(time);
    } else if (this.state === 'recover' && time < this.stateUntil) {
      this.body.setVelocity(0);
      this.renderLoop('combatIdle', time, 150);
    } else {
      if (time >= this.nextThink) {
        this.nextThink = time + 120;
        this.decide(time, enemies);
      }
      const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
      if (speed > 8) {
        this.renderLoop('run', time, this.state === 'glide' ? 72 : 86);
        // A restrained pooled light trail makes ordinary locomotion read as a
        // celestial glide while staying cheap enough for iPhone Safari.
        if (time >= this.nextGlideTrailAt) {
          this.nextGlideTrailAt = time + (this.state === 'wingburst_dash' ? 55 : 115);
          const inv = 1 / Math.max(1, speed);
          this.combat?.fx?.burst?.(this.body.x - this.body.body.velocity.x * inv * 18, this.body.y - this.body.body.velocity.y * inv * 18 - 8, 'celestial', 0.30);
        }
      } else this.renderLoop(this.target ? 'combatIdle' : 'idle', time, this.target ? 150 : 220);
    }

    this.syncPresentation(time);
  }

  syncPresentation(time) {
    const speed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    const hoverAmp = this.dead ? 0 : (speed > 8 ? 1.8 : 1.15);
    const hoverY = Math.sin((time + 170) * 0.0065) * hoverAmp;
    this.sprite.setPosition(this.body.x, this.body.y - 3 + hoverY).setDepth(this.body.y + 4);
    this.nameplate.setPosition(this.body.x, this.body.y - 79 + hoverY).setDepth(this.body.y + 9000);
    this.debugText.setPosition(this.body.x, this.body.y + 38).setDepth(this.body.y + 16020);
    this.updateHealthBar();

    if (time < this.hurtUntil) this.sprite.setTintFill(0xffffff);
    else this.sprite.clearTint();

    if (this.debugEnabled && !this.dead) {
      const targetName = this.target?.def?.name || 'none';
      const targetPoint = actorPoint(this.target);
      const distance = targetPoint ? Math.round(Math.hypot(targetPoint.x - this.body.x, targetPoint.y - this.body.y)) : 0;
      this.debugText.setText(`AI ${this.state.toUpperCase()}  •  ${this.lastActionName}\nTarget: ${targetName} (${distance}px)\nHP ${Math.ceil(this.hp)}/${this.def.maxHp}  •  Internal Lv ${this.def.internalLevel}`);
    }
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, options = {}) {
    if (this.dead) return false;
    const damage = Math.max(1, Math.floor(amount));
    this.hp = Math.max(0, this.hp - damage);
    this.hurtUntil = Math.max(this.hurtUntil, time + 95);

    if (options.knockback) {
      const retained = Math.max(0.05, 1 - (this.def.staggerResistance || 0));
      const power = options.knockback * retained;
      if (power >= 8) {
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.body.x, this.body.y);
        this.knockbackVX = Math.cos(angle) * power;
        this.knockbackVY = Math.sin(angle) * power;
        this.knockbackUntil = Math.max(this.knockbackUntil, time + 105);
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
    this.combat?.statuses?.clear(this);
    this.target = null;
    this.lastActionName = 'Fallen';
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
    this.strikeVariant = 0;
    this.nextGlideTrailAt = 0;
    this.state = 'idle';
    this.stateUntil = time + 450;
    this.nextThink = time + 350;
    this.lastActionName = 'Celestial vigil';
    this.debugText.setVisible(this.debugEnabled);
    this.renderFrame('combatIdle', 0);
  }

  snapshot(time = this.scene.time.now) {
    const p = actorPoint(this.target);
    return {
      active: !this.dead,
      name: this.def.displayName,
      levelDisplay: this.def.levelDisplay,
      hp: Math.ceil(this.hp), maxHp: this.def.maxHp,
      state: this.state,
      action: this.lastActionName,
      target: this.target?.def?.name || null,
      targetDistance: p ? Math.round(Math.hypot(p.x - this.body.x, p.y - this.body.y)) : null,
      internalLevel: this.debugEnabled ? this.def.internalLevel : null,
      cooldowns: Object.fromEntries(Object.values(this.def.abilities).map(ability => [ability.id, Math.max(0, (this.abilityCooldowns.get(ability.id) || 0) - time)]))
    };
  }

  destroy() {
    this.abilityTelegraph?.destroy?.();
    this.body.destroy();
    this.sprite.destroy();
    this.nameplate.destroy();
    this.debugText.destroy();
  }
}
