import { ITEM_DEFS } from '../data/items.js';
import { WEAPON_COMBAT_PROFILES } from '../data/combat.js';
import { derivedStats } from '../systems/StatsSystem.js';
import { LayeredCharacter } from './LayeredCharacter.js';

const ACTION_FRAMES = Object.freeze({ slash: 6, slash1h: 7, backslash1h: 12, halfslash1h: 6, spellcast: 7, thrust: 8, shoot: 13, hurt: 6 });

export class Player {
  constructor(scene, state, input, onAttack) {
    this.scene = scene;
    this.state = state;
    this.input = input;
    this.onAttack = onAttack;
    this.combat = null;
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
    this.currentSkill = null;
    this.skillStarted = -Infinity;
    this.skillTriggered = false;
    this.skillTrigger = null;
    this.invulnerableUntil = 0;
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
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

  isBusy(time = this.scene.time.now) {
    const attacking = Boolean(this.currentAttack && time - this.attackStarted < this.currentAttack.durationMs);
    const casting = Boolean(this.currentSkill && time - this.skillStarted < this.currentSkill.castMs);
    return attacking || casting || time < this.knockbackUntil;
  }

  cancelAction() {
    this.currentAttack = null;
    this.attackHit = false;
    this.currentSkill = null;
    this.skillTriggered = false;
    this.skillTrigger = null;
  }

  beginAttack(time, dx, dy, length) {
    if (this.combat?.statuses.actionLocked(this) || this.currentSkill || time < this.knockbackUntil) return false;
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
    return true;
  }

  beginSkill(def, time, trigger) {
    if (!def || this.dead || this.isBusy(time) || this.combat?.statuses.actionLocked(this)) return false;
    this.currentAttack = null;
    this.attackHit = false;
    this.currentSkill = def;
    this.skillStarted = time;
    this.skillTriggered = false;
    this.skillTrigger = trigger;
    this.body.setVelocity(0);
    return true;
  }

  applyKnockback(sourceX, sourceY, power = 150, duration = 170) {
    if (this.dead || power <= 0) return;
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.body.x, this.body.y);
    this.knockbackVX = Math.cos(angle) * power;
    this.knockbackVY = Math.sin(angle) * power;
    this.knockbackUntil = Math.max(this.knockbackUntil, this.scene.time.now + duration);
    this.cancelAction();
  }

  renderSkill(time) {
    const def = this.currentSkill;
    if (!def) return false;
    const elapsed = Math.max(0, time - this.skillStarted);
    if (elapsed >= def.castMs) {
      if (!this.skillTriggered) {
        this.skillTriggered = true;
        this.skillTrigger?.(def);
      }
      this.currentSkill = null;
      this.skillTrigger = null;
      this.body.setVelocity(0);
      return false;
    }
    const progress = Math.max(0, Math.min(0.999999, elapsed / Math.max(1, def.castMs)));
    if (!this.skillTriggered && progress >= (def.triggerAt ?? 0.5)) {
      this.skillTriggered = true;
      this.skillTrigger?.(def);
    }
    const frames = ACTION_FRAMES[def.animation] || 6;
    const frameStep = Math.min(frames - 1, Math.floor(progress * frames));
    this.visual.render(this.body.x, this.body.y, def.animation || 'slash', frameStep, this.body.y, progress);
    this.body.setVelocity(0);
    return true;
  }

  update(time, delta) {
    if (this.dead) {
      this.body.setVelocity(0);
      this.visual.render(this.body.x, this.body.y, 'hurt', 5, this.body.y, 0.999);
      return;
    }
    if (window.__ashfallUiBlocked) {
      this.body.setVelocity(0);
      this.visual.render(this.body.x, this.body.y, 'idle', 0, this.body.y);
      return;
    }
    this.input.update();

    if (time < this.knockbackUntil) {
      this.body.setVelocity(this.knockbackVX, this.knockbackVY);
      this.visual.render(this.body.x, this.body.y, 'hurt', Math.floor((time / 55) % 6), this.body.y);
      this.updateStoredPosition();
      return;
    }
    if (this.knockbackUntil) {
      this.knockbackUntil = 0;
      this.knockbackVX = 0;
      this.knockbackVY = 0;
    }

    if (this.combat?.statuses.actionLocked(this)) {
      this.cancelAction();
      this.body.setVelocity(0);
      this.visual.render(this.body.x, this.body.y, time < this.hurtUntil ? 'hurt' : 'idle', time < this.hurtUntil ? Math.floor((time / 55) % 6) : 0, this.body.y);
      this.updateStoredPosition();
      return;
    }

    if (this.renderSkill(time)) {
      this.updateStoredPosition();
      return;
    }

    let dx = this.input.moveX;
    let dy = this.input.moveY;
    const length = Math.hypot(dx, dy);
    if (length > 1) { dx /= length; dy /= length; }

    let attacking = Boolean(this.currentAttack && time - this.attackStarted < this.currentAttack.durationMs);
    if (!attacking && this.input.consumeAttack()) attacking = this.beginAttack(time, dx, dy, length);

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
      this.updateStoredPosition();
      return;
    }
    if (this.currentAttack) this.currentAttack = null;

    if (time < this.hurtUntil) {
      this.body.setVelocity(0);
      const progress = Math.max(0, Math.min(0.999, 1 - (this.hurtUntil - time) / 180));
      this.visual.render(this.body.x, this.body.y, 'hurt', Math.min(5, Math.floor(progress * 6)), this.body.y, progress);
      this.updateStoredPosition();
      return;
    }

    const derived = derivedStats(this.state);
    const statusMove = this.combat?.statuses.moveMultiplier(this) ?? 1;
    const wantsRun = Boolean(this.input.run && length > 0.05);
    const trueRun = wantsRun && this.visual.supportsAction('run');
    const speed = derived.moveSpeed * statusMove * (wantsRun ? 1.42 : 1);
    this.body.setVelocity(dx * speed, dy * speed);
    this.visual.setFacing(dx, dy);
    if (length > 0.05) this.walkClock += delta;
    const frameStep = length > 0.05 ? Math.floor(this.walkClock / (trueRun ? 82 : 92)) % 8 : 0;
    this.visual.render(this.body.x, this.body.y, length > 0.05 ? (trueRun ? 'run' : 'walk') : 'idle', frameStep, this.body.y);
    this.updateStoredPosition();
  }

  updateStoredPosition() {
    this.state.player.x = Math.round(this.body.x);
    this.state.player.y = Math.round(this.body.y);
  }

  takeResolvedDamage(damage, time, options = {}) {
    if (this.dead || time < this.invulnerableUntil) return false;
    const amount = Math.max(1, Math.floor(damage));
    this.state.player.hp = Math.max(0, this.state.player.hp - amount);
    this.invulnerableUntil = time + (options.ignoreInvulnerability ? 0 : 420);
    this.hurtUntil = Math.max(this.hurtUntil, time + 180);
    this.scene.tweens.add({ targets: [...this.visual.layers.values()].map(v => v.sprite), alpha: 0.35, yoyo: true, duration: 65, repeat: 1 });
    if (options.knockback) this.applyKnockback(options.sourceX ?? this.body.x, options.sourceY ?? this.body.y, options.knockback, options.knockbackDuration || 170);
    if (this.state.player.hp <= 0) {
      this.dead = true;
      this.cancelAction();
      this.body.setVelocity(0);
    }
    return true;
  }

  // Compatibility wrapper for older/debug call sites. New combat goes through
  // CombatResolver so damage types, statuses and guard modifiers are shared.
  takeDamage(rawDamage, time) {
    if (this.dead || time < this.invulnerableUntil) return 0;
    const defense = derivedStats(this.state).defense;
    const damage = Math.max(1, Math.floor(rawDamage - defense * 0.45 + Math.random() * 3));
    return this.takeResolvedDamage(damage, time) ? damage : 0;
  }

  respawn(x, y) {
    const derived = derivedStats(this.state);
    this.dead = false;
    this.cancelAction();
    this.comboExpiresAt = 0;
    this.invulnerableUntil = 0;
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.combat?.statuses.clear(this);
    this.state.player.hp = derived.maxHp;
    this.state.player.essence = derived.maxEssence;
    this.body.setPosition(x, y).setVelocity(0);
    this.state.player.x = x;
    this.state.player.y = y;
    this.visual.setAlpha(1);
    this.restoreVisual();
  }

  restoreVisual() {
    this.body.setVisible(false).setActive(true);
    this.visual.restore(this.body.x, this.body.y, this.body.y);
    return this.visual.missingTextureKeys('idle');
  }

  refreshEquipment() {
    this.cancelAction();
    this.comboExpiresAt = 0;
    this.currentProfileId = null;
    this.visual.refreshEquipment();
    this.restoreVisual();
  }
}
