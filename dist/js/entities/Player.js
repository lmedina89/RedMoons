import { ITEM_DEFS } from '../data/items.js';
import { WEAPON_COMBAT_PROFILES } from '../data/combat.js';
import { derivedStats } from '../systems/StatsSystem.js';
import { LayeredCharacter } from './LayeredCharacter.js';

export class Player {
  constructor(scene, state, input, onAttack) {
    this.scene = scene;
    this.state = state;
    this.input = input;
    this.onAttack = onAttack;
    this.body = scene.physics.add.sprite(state.player.x, state.player.y, 'solid').setVisible(false);
    // The proxy texture is only 2x2. Never scale the GameObject before setSize():
    // Arcade applies display scale to body dimensions, which previously turned
    // this compact footprint into a several-hundred-pixel invisible force field.
    this.body.body.setSize(16, 14, false).setOffset(-7, 2).setCollideWorldBounds(true);
    this.visual = new LayeredCharacter(scene, this.body.x, this.body.y, state);
    this.attackStarted = -Infinity;
    this.currentAttack = null;
    this.currentProfileId = null;
    this.comboIndex = 0;
    this.comboExpiresAt = 0;
    this.attackHit = false;
    this.invulnerableUntil = 0;
    this.dead = false;
    this.walkClock = 0;
  }

  weaponDefinition() {
    const instanceId = this.state.equipment.weapon;
    const instance = this.state.inventory.find(item => item.instanceId === instanceId);
    return instance ? ITEM_DEFS[instance.itemId] : null;
  }

  combatProfile() {
    const def = this.weaponDefinition();
    return WEAPON_COMBAT_PROFILES[def?.combatProfile] || WEAPON_COMBAT_PROFILES.single_slash;
  }

  beginAttack(time, dx, dy, length) {
    const profile = this.combatProfile();
    if (length > 0.05) this.visual.setFacing(dx, dy);
    if (this.currentProfileId !== profile.id || time > this.comboExpiresAt) this.comboIndex = 0;
    else this.comboIndex = (this.comboIndex + 1) % profile.attacks.length;
    this.currentProfileId = profile.id;
    this.currentAttack = profile.attacks[this.comboIndex];
    this.attackStarted = time;
    this.comboExpiresAt = time + this.currentAttack.durationMs + profile.comboWindowMs;
    this.attackHit = false;
    this.body.setVelocity(0);
  }

  update(time, delta) {
    if (this.dead) { this.body.setVelocity(0); this.visual.render(this.body.x, this.body.y, 'idle', 0, this.body.y); return; }
    if (window.__ashfallUiBlocked) { this.body.setVelocity(0); this.visual.render(this.body.x, this.body.y, 'idle', 0, this.body.y); return; }
    this.input.update();

    let dx = this.input.moveX;
    let dy = this.input.moveY;
    const length = Math.hypot(dx, dy);
    if (length > 1) { dx /= length; dy /= length; }

    let attacking = Boolean(this.currentAttack && time - this.attackStarted < this.currentAttack.durationMs);
    if (!attacking && this.input.consumeAttack()) {
      this.beginAttack(time, dx, dy, length);
      attacking = true;
    }

    if (attacking) {
      const elapsed = Math.max(0, time - this.attackStarted);
      const attack = this.currentAttack;
      const frameStep = Math.min(attack.frames - 1, Math.floor((elapsed / attack.durationMs) * attack.frames));
      if (!this.attackHit && elapsed >= attack.durationMs * attack.hitAt) {
        this.attackHit = true;
        this.onAttack(attack);
      }
      this.visual.render(this.body.x, this.body.y, attack.action, frameStep, this.body.y, elapsed / attack.durationMs);
      this.body.setVelocity(0);
      return;
    }

    const derived = derivedStats(this.state);
    const speed = derived.moveSpeed * (this.input.run ? 1.42 : 1);
    this.body.setVelocity(dx * speed, dy * speed);
    this.visual.setFacing(dx, dy);
    if (length > 0.05) this.walkClock += delta * (this.input.run ? 1.5 : 1);
    const frameStep = length > 0.05 ? Math.floor(this.walkClock / 92) % 8 : 0;
    this.visual.render(this.body.x, this.body.y, length > 0.05 ? 'walk' : 'idle', frameStep, this.body.y);
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
    this.currentAttack = null;
    this.comboExpiresAt = 0;
    this.state.player.hp = derived.maxHp;
    this.state.player.essence = derived.maxEssence;
    this.body.setPosition(x, y).setVelocity(0);
    this.state.player.x = x;
    this.state.player.y = y;
    this.visual.setAlpha(1);
  }

  refreshEquipment() {
    this.currentAttack = null;
    this.comboExpiresAt = 0;
    this.currentProfileId = null;
    this.visual.refreshEquipment();
  }
}
