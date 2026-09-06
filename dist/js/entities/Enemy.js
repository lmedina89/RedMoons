export class Enemy {
  constructor(scene, group, definition, spawn, index, callbacks) {
    this.scene = scene;
    this.group = group;
    this.def = definition;
    this.spawn = spawn;
    this.index = index;
    this.callbacks = callbacks;
    this.sprite = scene.physics.add.sprite(0, 0, definition.walkTexture, 0).setScale((definition.scale || 1) * 1.25).setOrigin(0.5, 0.7);
    this.sprite.body.setSize(24, 28).setOffset(20, 28);
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
    this.animClock = Math.random() * 500;
    this.respawn(0);
  }

  respawn(time) {
    const margin = 36;
    const usableW = Math.max(1, this.spawn.width - margin * 2);
    const usableH = Math.max(1, this.spawn.height - margin * 2);
    this.homeX = this.spawn.x + margin + ((this.index * 137 + Math.random() * 71) % usableW);
    this.homeY = this.spawn.y + margin + ((this.index * 83 + Math.random() * 53) % usableH);
    this.sprite.setPosition(this.homeX, this.homeY).setActive(true).setVisible(true).clearTint();
    this.sprite.body.enable = true;
    this.hp = this.def.maxHp;
    this.state = 'idle';
    this.stateUntil = time + 450 + Math.random() * 800;
    this.sprite.setVelocity(0);
  }

  setDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) this.direction = vx < 0 ? 1 : 3;
    else if (vy) this.direction = vy < 0 ? 0 : 2;
  }

  update(time, delta, player) {
    if (!this.sprite.active) {
      if (this.respawnAt && time >= this.respawnAt) this.respawn(time);
      return;
    }
    const dx = player.body.x - this.sprite.x;
    const dy = player.body.y - this.sprite.y;
    const distanceSq = dx * dx + dy * dy;
    const activeRangeSq = 720 * 720;
    if (distanceSq > activeRangeSq && this.state !== 'return') { this.sprite.setVelocity(0); return; }

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
    const columns = attacking ? this.def.attackFrames : this.def.walkFrames;
    const frameInRow = attacking ? Math.min(columns - 1, Math.floor((1 - Math.max(0, this.stateUntil - time) / this.def.attackCooldown) * columns)) : Math.floor(this.animClock / 130) % columns;
    this.sprite.setTexture(attacking ? this.def.attackTexture : this.def.walkTexture).setFrame(this.direction * columns + frameInRow).setDepth(this.sprite.y);
  }

  takeDamage(amount, sourceX, sourceY, time) {
    if (!this.sprite.active) return false;
    const damage = Math.max(1, Math.floor(amount - this.def.defense * 0.45 + Math.random() * 4));
    this.hp -= damage;
    this.state = 'recover';
    this.stateUntil = time + 210;
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.sprite.x, this.sprite.y);
    this.sprite.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150).setTintFill(0xffffff);
    this.scene.time.delayedCall(85, () => this.sprite.active && this.sprite.clearTint());
    this.callbacks.damageNumber(this.sprite.x, this.sprite.y - 38, damage, false);
    if (this.hp <= 0) this.die(time);
    return true;
  }

  die(time) {
    this.callbacks.died(this);
    this.sprite.setVelocity(0).setActive(false).setVisible(false);
    this.sprite.body.enable = false;
    this.respawnAt = time + this.spawn.respawnMs;
  }
}

