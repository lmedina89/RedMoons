import { LayeredCharacter, createActorEquipmentState } from './LayeredCharacter.js';

function weightedEntry(entries = []) {
  const valid = entries.filter(entry => entry && Number(entry.weight) > 0);
  const total = valid.reduce((sum, entry) => sum + Number(entry.weight), 0);
  if (!total) return null;
  let roll = Math.random() * total;
  for (const entry of valid) {
    roll -= Number(entry.weight);
    if (roll <= 0) return entry;
  }
  return valid.at(-1) || null;
}

function weightedChoice(entries = []) {
  return weightedEntry(entries)?.itemId || null;
}

function rollLoadout(definition) {
  if (definition.fixedLoadout) return { ...definition.fixedLoadout };
  const loadout = {};
  for (const [slot, entries] of Object.entries(definition.equipmentPool || {})) {
    const itemId = weightedChoice(entries);
    if (itemId) loadout[slot] = itemId;
  }
  return loadout;
}

export class Enemy {
  constructor(scene, group, definition, spawn, index, callbacks) {
    this.scene = scene;
    this.group = group;
    this.def = definition;
    this.spawn = spawn;
    this.index = index;
    this.callbacks = callbacks;
    this.layered = Boolean(definition.layered);
    this.visualSpec = definition;
    if (this.layered) {
      this.sprite = scene.physics.add.sprite(0, 0, 'solid').setVisible(false);
      // Keep layered actors on an unscaled helper sprite. Scaling the 2x2
      // texture also scales Arcade body dimensions and creates huge phantom
      // rectangles in diagnostics and proximity behavior.
      this.sprite.body.setSize(18, 16, false).setOffset(-8, 2);
      this.actorState = createActorEquipmentState({});
      this.visual = new LayeredCharacter(scene, 0, 0, this.actorState, (definition.scale || 1) * 1.3, {
        baseAsset: definition.baseVisual || 'enemy_skeleton_base',
        equipmentPolicy: 'npc'
      });
    } else {
      this.visualSpec = this.rollVisualSpec();
      this.sprite = scene.physics.add.sprite(0, 0, this.visualSpec.walkTexture, 0)
        .setScale((definition.scale || 1) * 1.25)
        .setOrigin(0.5, definition.originY || 0.7);
      const body = definition.body || {};
      this.sprite.body.setSize(body.width || 24, body.height || 28).setOffset(body.offsetX ?? 20, body.offsetY ?? 28);
    }
    this.sprite.enemyRef = this;
    group.add(this.sprite);
    this.state = 'idle';
    this.hp = definition.maxHp;
    this.homeX = 0;
    this.homeY = 0;
    this.direction = 2;
    this.nextThink = 0;
    this.stateUntil = 0;
    this.attackApplied = false;
    this.respawnAt = 0;
    this.deathStartedAt = 0;
    this.deathEndsAt = 0;
    this.animClock = Math.random() * 500;
    this.loadout = {};
    this.respawn(0);
  }

  rollVisualSpec() {
    const choice = weightedEntry(this.def.visualPool || []);
    return choice ? { ...this.def, ...choice } : this.def;
  }

  applyLoadout() {
    if (!this.layered) return;
    this.loadout = rollLoadout(this.def);
    this.actorState = createActorEquipmentState(this.loadout);
    this.visual.refreshEquipment(this.actorState);
    this.visual.direction = this.direction;
  }

  respawn(time) {
    const margin = 36;
    const usableW = Math.max(1, this.spawn.width - margin * 2);
    const usableH = Math.max(1, this.spawn.height - margin * 2);
    this.homeX = this.spawn.x + margin + ((this.index * 137 + Math.random() * 71) % usableW);
    this.homeY = this.spawn.y + margin + ((this.index * 83 + Math.random() * 53) % usableH);
    if (!this.layered) {
      this.visualSpec = this.rollVisualSpec();
      this.sprite.setTexture(this.visualSpec.walkTexture, 0)
        .setOrigin(0.5, this.def.originY || 0.7)
        .setScale((this.def.scale || 1) * 1.25);
    }
    this.sprite.setPosition(this.homeX, this.homeY).setActive(true).setVisible(!this.layered).clearTint();
    this.sprite.body.enable = true;
    this.hp = this.def.maxHp;
    this.deathStartedAt = 0;
    this.deathEndsAt = 0;
    this.state = 'idle';
    this.stateUntil = time + 450 + Math.random() * 800;
    this.sprite.setVelocity(0);
    this.applyLoadout();
    this.visual?.setVisible(true);
    this.visual?.clearTint();
    this.renderVisual('idle', 0, null);
  }

  setDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) this.direction = vx < 0 ? 1 : 3;
    else if (vy) this.direction = vy < 0 ? 0 : 2;
    if (this.visual) this.visual.direction = this.direction;
  }

  renderVisual(action, frameStep, progress = null) {
    if (!this.layered || !this.visual || !this.sprite.active) return;
    this.visual.direction = this.direction;
    this.visual.render(this.sprite.x, this.sprite.y, action, frameStep, this.sprite.y, progress);
  }

  update(time, delta, player) {
    if (this.state === 'dying') { this.updateDeath(time); return; }
    if (!this.sprite.active) {
      if (this.respawnAt && time >= this.respawnAt) this.respawn(time);
      return;
    }
    const dx = player.body.x - this.sprite.x;
    const dy = player.body.y - this.sprite.y;
    const distanceSq = dx * dx + dy * dy;
    const activeRangeSq = 720 * 720;
    if (distanceSq > activeRangeSq && this.state !== 'return') {
      this.sprite.setVelocity(0);
      if (this.layered) this.renderVisual('idle', 0, null);
      return;
    }

    this.animClock += delta;
    if (time >= this.nextThink) {
      this.nextThink = time + 110;
      const distance = Math.sqrt(distanceSq);
      const homeDx = this.homeX - this.sprite.x;
      const homeDy = this.homeY - this.sprite.y;
      const homeDistance = Math.hypot(homeDx, homeDy);
      if (homeDistance > this.def.leashRange) this.state = 'return';
      if (this.state === 'idle' && time >= this.stateUntil) { this.state = 'patrol'; this.stateUntil = time + 1000 + Math.random() * 1600; }
      if ((this.state === 'idle' || this.state === 'patrol') && distance < this.def.detectRange && !player.dead) { this.state = 'detect'; this.stateUntil = time + 220; }
      if (this.state === 'detect' && time >= this.stateUntil) this.state = 'chase';
      if (this.state === 'chase' && distance <= this.def.attackRange) { this.state = 'attack'; this.stateUntil = time + this.def.attackCooldown; this.attackApplied = false; }
      if (this.state === 'attack' && !this.attackApplied && time >= this.stateUntil - this.def.attackCooldown * 0.48) {
        this.attackApplied = true;
        if (distance <= this.def.attackRange + 18) this.callbacks.hitPlayer(this.def.attack, this.sprite.x, this.sprite.y);
      }
      if (this.state === 'attack' && time >= this.stateUntil) { this.state = 'recover'; this.stateUntil = time + this.def.recoverMs; }
      if (this.state === 'recover' && time >= this.stateUntil) { this.state = Math.random() < 0.42 ? 'reposition' : 'chase'; this.stateUntil = time + 420; }
      if (this.state === 'reposition' && time >= this.stateUntil) this.state = 'chase';
      if (this.state === 'return' && homeDistance < 18) { this.state = 'idle'; this.stateUntil = time + 900; }

      let vx = 0, vy = 0;
      if (this.state === 'chase') { const inv = distance ? 1 / distance : 0; vx = dx * inv * this.def.speed; vy = dy * inv * this.def.speed; }
      else if (this.state === 'return') { const inv = homeDistance ? 1 / homeDistance : 0; vx = homeDx * inv * this.def.speed; vy = homeDy * inv * this.def.speed; }
      else if (this.state === 'patrol') {
        const angle = this.index * 1.7 + time * 0.0005;
        vx = Math.cos(angle) * this.def.speed * 0.35; vy = Math.sin(angle) * this.def.speed * 0.35;
        if (time >= this.stateUntil) { this.state = 'idle'; this.stateUntil = time + 700 + Math.random() * 900; }
      } else if (this.state === 'reposition') {
        const inv = distance ? 1 / distance : 0; vx = -dy * inv * this.def.speed * 0.65; vy = dx * inv * this.def.speed * 0.65;
      }
      this.sprite.setVelocity(vx, vy);
      this.setDirection(vx || dx, vy || dy);
    }

    const attacking = this.state === 'attack';
    if (this.layered) {
      if (attacking) {
        const progress = Math.max(0, Math.min(0.999999, 1 - Math.max(0, this.stateUntil - time) / this.def.attackCooldown));
        const frame = Math.min(5, Math.floor(progress * 6));
        this.renderVisual('slash', frame, progress);
      } else {
        const moving = Math.hypot(this.sprite.body.velocity.x, this.sprite.body.velocity.y) > 2;
        const frame = moving ? Math.floor(this.animClock / 130) % 8 : 0;
        this.renderVisual(moving ? 'walk' : 'idle', frame, null);
      }
      return;
    }

    const spec = this.visualSpec || this.def;
    const columns = attacking ? spec.attackFrames : spec.walkFrames;
    const frameInRow = attacking
      ? Math.min(columns - 1, Math.floor((1 - Math.max(0, this.stateUntil - time) / this.def.attackCooldown) * columns))
      : Math.floor(this.animClock / (spec.frameMs || 130)) % columns;
    const texture = attacking ? spec.attackTexture : spec.walkTexture;
    const directionRows = attacking ? (spec.attackDirectionRows || spec.directionRows) : (spec.walkDirectionRows || spec.directionRows);
    const sourceRow = directionRows?.[this.direction] ?? this.direction;
    this.sprite
      .setTexture(texture)
      .setFrame(sourceRow * columns + frameInRow)
      .setOrigin(0.5, attacking ? (spec.attackOriginY || this.def.attackOriginY || this.def.originY || 0.7) : (spec.originY || this.def.originY || 0.7))
      .setDepth(this.sprite.y);
  }

  takeDamage(amount, sourceX, sourceY, time) {
    if (!this.sprite.active || this.state === 'dying') return false;
    const damage = Math.max(1, Math.floor(amount - this.def.defense * 0.45 + Math.random() * 4));
    this.hp -= damage;
    this.state = 'recover';
    this.stateUntil = time + 210;
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.sprite.x, this.sprite.y);
    this.sprite.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
    if (this.layered) this.visual.setTintFill(0xffffff);
    else this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(85, () => {
      if (!this.sprite.active) return;
      if (this.layered) this.visual.clearTint();
      else this.sprite.clearTint();
    });
    this.callbacks.damageNumber(this.sprite.x, this.sprite.y - 38, damage, false);
    if (this.hp <= 0) this.die(time);
    return true;
  }

  die(time) {
    if (this.state === 'dying') return;
    this.callbacks.died(this);
    this.sprite.setVelocity(0);
    this.sprite.body.enable = false;
    this.respawnAt = time + this.spawn.respawnMs;
    const spec = this.visualSpec || this.def;
    if (!this.layered && spec.deathTexture && spec.deathFrames > 0) {
      this.state = 'dying';
      this.deathStartedAt = time;
      this.deathEndsAt = time + spec.deathFrames * (spec.deathFrameMs || 110);
      this.sprite.clearTint().setActive(true).setVisible(true).setTexture(spec.deathTexture).setFrame(0)
        .setOrigin(0.5, spec.deathOriginY || spec.originY || this.def.originY || 0.7).setDepth(this.sprite.y);
      return;
    }
    this.finishDeath();
  }

  updateDeath(time) {
    const spec = this.visualSpec || this.def;
    if (!spec.deathTexture || time >= this.deathEndsAt) { this.finishDeath(); return; }
    const frameMs = spec.deathFrameMs || 110;
    const frame = Math.min(spec.deathFrames - 1, Math.floor((time - this.deathStartedAt) / frameMs));
    const rows = spec.deathDirectionRows || spec.directionRows;
    const row = rows?.[this.direction] ?? 0;
    this.sprite.setTexture(spec.deathTexture).setFrame(row * spec.deathFrames + frame).setDepth(this.sprite.y);
  }

  finishDeath() {
    this.state = 'dead';
    this.sprite.setVelocity(0).setActive(false).setVisible(false);
    this.sprite.body.enable = false;
    this.visual?.setVisible(false);
  }
}
