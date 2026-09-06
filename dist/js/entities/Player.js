import { derivedStats } from '../systems/StatsSystem.js';
import { LayeredCharacter } from './LayeredCharacter.js';

export class Player {
  constructor(scene, state, input, onAttack) {
    this.scene = scene;
    this.state = state;
    this.input = input;
    this.onAttack = onAttack;
    this.body = scene.physics.add.sprite(state.player.x, state.player.y, 'solid').setAlpha(0.001).setDisplaySize(25, 28);
    this.body.body.setSize(18, 20).setOffset(0, 6).setCollideWorldBounds(true);
    this.visual = new LayeredCharacter(scene, this.body.x, this.body.y, state);
    this.attackStarted = 0;
    this.attackHit = false;
    this.invulnerableUntil = 0;
    this.dead = false;
    this.walkClock = 0;
  }

  update(time, delta) {
    if (this.dead) { this.body.setVelocity(0); this.visual.render(this.body.x, this.body.y, 'idle', 0, this.body.y); return; }
    if (window.__ashfallUiBlocked) { this.body.setVelocity(0); this.visual.render(this.body.x, this.body.y, 'idle', 0, this.body.y); return; }
    this.input.update();

    let dx = this.input.moveX;
    let dy = this.input.moveY;
    const length = Math.hypot(dx, dy);
    if (length > 1) { dx /= length; dy /= length; }

    if (this.input.consumeAttack() && time - this.attackStarted > 420) {
      // Sample facing before the swing begins so a direction+attack input uses
      // the intended direction instead of the previous movement direction.
      if (length > 0.05) this.visual.setFacing(dx, dy);
      this.attackStarted = time;
      this.attackHit = false;
      this.body.setVelocity(0);
    }
    const attacking = time - this.attackStarted < 360;
    if (attacking) {
      const frame = Math.min(5, Math.floor(((time - this.attackStarted) / 360) * 6));
      if (!this.attackHit && frame >= 2) { this.attackHit = true; this.onAttack(); }
      this.visual.render(this.body.x, this.body.y, 'slash', frame, this.body.y);
      this.body.setVelocity(0);
      return;
    }

    const derived = derivedStats(this.state);
    const speed = derived.moveSpeed * (this.input.run ? 1.42 : 1);
    this.body.setVelocity(dx * speed, dy * speed);
    this.visual.setFacing(dx, dy);
    if (length > 0.05) this.walkClock += delta * (this.input.run ? 1.5 : 1);
    const frame = length > 0.05 ? 1 + Math.floor(this.walkClock / 92) % 8 : 0;
    this.visual.render(this.body.x, this.body.y, length > 0.05 ? 'walk' : 'idle', frame, this.body.y);
    this.state.player.x = Math.round(this.body.x);
    this.state.player.y = Math.round(this.body.y);
  }

  takeDamage(rawDamage, time) {
    if (this.dead || time < this.invulnerableUntil) return 0;
    const defense = derivedStats(this.state).defense;
    const damage = Math.max(1, Math.floor(rawDamage - defense * 0.45 + Math.random() * 3));
    this.state.player.hp = Math.max(0, this.state.player.hp - damage);
    this.invulnerableUntil = time + 520;
    this.scene.tweens.add({ targets: [...this.visual.layers.values()].map(v => v.sprite), alpha: 0.3, yoyo: true, duration: 70, repeat: 2 });
    if (this.state.player.hp <= 0) this.dead = true;
    return damage;
  }

  respawn(x, y) {
    const derived = derivedStats(this.state);
    this.dead = false;
    this.state.player.hp = derived.maxHp;
    this.state.player.essence = derived.maxEssence;
    this.body.setPosition(x, y).setVelocity(0);
    this.state.player.x = x;
    this.state.player.y = y;
    this.visual.setAlpha(1);
  }

  refreshEquipment() { this.visual.refreshEquipment(); }
}
