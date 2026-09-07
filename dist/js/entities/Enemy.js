import { ENEMY_ABILITY_DEFS } from '../data/abilities.js';
import { LayeredCharacter, createActorEquipmentState } from './LayeredCharacter.js';
import { areHostile } from '../data/factions.js';

const ACTION_FRAMES = Object.freeze({ slash: 6, spellcast: 7, thrust: 8, shoot: 13, hurt: 6, attack: 6 });

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}


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

function weightedChoice(entries = []) { return weightedEntry(entries)?.itemId || null; }

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
    this.combat = null;
    this.faction = definition.faction || 'monster';
    this.target = null;
    this.playerContributionDamage = 0;
    this.lastPlayerContributionAt = 0;
    this.lastDamageTeam = null;
    this.layered = Boolean(definition.layered);
    this.visualSpec = definition;
    if (this.layered) {
      this.sprite = scene.physics.add.sprite(0, 0, 'solid').setVisible(false);
      this.sprite.body.setSize(18, 16, false).setOffset(-8, 2);
      this.actorState = createActorEquipmentState({});
      this.visual = new LayeredCharacter(scene, 0, 0, this.actorState, (definition.scale || 1) * 1.3, {
        baseAsset: definition.baseVisual || 'enemy_skeleton_base', equipmentPolicy: 'npc'
      });
    } else {
      this.visualSpec = this.rollVisualSpec();
      this.sprite = scene.physics.add.sprite(0, 0, this.visualSpec.walkTexture, 0)
        .setScale((definition.scale || 1) * 1.25).setOrigin(0.5, definition.originY || 0.7);
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
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.currentAbility = null;
    this.abilityStartedAt = 0;
    this.abilityTriggered = false;
    this.abilityTargetX = 0;
    this.abilityTargetY = 0;
    this.abilityTelegraph = null;
    this.abilityCooldowns = new Map();
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

  clearAbility() {
    this.abilityTelegraph?.destroy?.();
    this.abilityTelegraph = null;
    this.currentAbility = null;
    this.abilityStartedAt = 0;
    this.abilityTriggered = false;
    this.abilityTargetRef = null;
  }

  respawn(time) {
    const margin = 36;
    const usableW = Math.max(1, this.spawn.width - margin * 2);
    const usableH = Math.max(1, this.spawn.height - margin * 2);
    this.homeX = this.spawn.x + margin + ((this.index * 137 + Math.random() * 71) % usableW);
    this.homeY = this.spawn.y + margin + ((this.index * 83 + Math.random() * 53) % usableH);
    if (!this.layered) {
      this.visualSpec = this.rollVisualSpec();
      this.sprite.setTexture(this.visualSpec.walkTexture, 0).setOrigin(0.5, this.def.originY || 0.7).setScale((this.def.scale || 1) * 1.25);
    }
    this.sprite.setPosition(this.homeX, this.homeY).setActive(true).setVisible(!this.layered).clearTint();
    this.sprite.body.enable = true;
    this.hp = this.def.maxHp;
    this.playerContributionDamage = 0;
    this.lastPlayerContributionAt = 0;
    this.lastDamageTeam = null;
    this.target = null;
    this.deathStartedAt = 0;
    this.deathEndsAt = 0;
    this.hurtUntil = 0;
    this.knockbackUntil = 0;
    this.knockbackVX = 0;
    this.knockbackVY = 0;
    this.state = 'idle';
    this.stateUntil = time + 450 + Math.random() * 800;
    this.sprite.setVelocity(0);
    this.clearAbility();
    this.abilityCooldowns.clear();
    this.combat?.statuses.clear(this);
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

  availableAbility(time, distance) {
    for (const id of this.def.abilities || []) {
      const ability = ENEMY_ABILITY_DEFS[id];
      if (!ability || time < (this.abilityCooldowns.get(id) || 0)) continue;
      if (distance > ability.range || distance < (ability.minRange || 0)) continue;
      return ability;
    }
    return null;
  }

  beginAbility(ability, target, time) {
    const node = actorNode(target);
    if (!node) return;
    this.currentAbility = ability;
    this.abilityStartedAt = time;
    this.abilityTriggered = false;
    this.abilityTargetRef = target;
    this.abilityTargetX = node.x;
    this.abilityTargetY = node.y;
    this.state = 'ability';
    this.stateUntil = time + ability.windupMs;
    this.abilityCooldowns.set(ability.id, time + ability.cooldownMs);
    this.sprite.setVelocity(0);
    this.setDirection(this.abilityTargetX - this.sprite.x, this.abilityTargetY - this.sprite.y);
    this.callbacks.beginAbility?.(this, ability, target);
  }

  updateAbility(time) {
    const ability = this.currentAbility;
    if (!ability) { this.state = 'recover'; this.stateUntil = time + 250; return; }
    const elapsed = Math.max(0, time - this.abilityStartedAt);
    const progress = Math.max(0, Math.min(0.999999, elapsed / Math.max(1, ability.windupMs)));
    if (!this.abilityTriggered && progress >= (ability.triggerAt ?? 0.6)) {
      this.abilityTriggered = true;
      this.callbacks.triggerAbility?.(this, ability, this.abilityTargetX, this.abilityTargetY, this.abilityTargetRef);
    }
    if (time >= this.stateUntil) {
      if (!this.abilityTriggered) {
        this.abilityTriggered = true;
        this.callbacks.triggerAbility?.(this, ability, this.abilityTargetX, this.abilityTargetY, this.abilityTargetRef);
      }
      this.clearAbility();
      this.state = 'recover';
      this.stateUntil = time + (ability.recoverMs || this.def.recoverMs || 350);
    }
  }

  update(time, delta, player, potentialTargets = null) {
    if (this.state === 'dying') { this.updateDeath(time); return; }
    if (!this.sprite.active) {
      if (this.respawnAt && time >= this.respawnAt) this.respawn(time);
      return;
    }

    if (time < this.knockbackUntil) {
      this.sprite.setVelocity(this.knockbackVX, this.knockbackVY);
      this.setDirection(this.knockbackVX, this.knockbackVY);
      if (this.layered) this.renderVisual('hurt', Math.floor((time / 55) % 6), null);
      return;
    }
    if (this.knockbackUntil) {
      this.knockbackUntil = 0;
      this.knockbackVX = 0;
      this.knockbackVY = 0;
    }

    if (this.combat?.statuses.actionLocked(this)) {
      if (this.state === 'ability') this.clearAbility();
      this.state = 'recover';
      this.stateUntil = Math.max(this.stateUntil, time + 150);
      this.sprite.setVelocity(0);
    }

    // Keep enemy simulation camera/player scoped for iPhone performance, but
    // choose combat targets from faction-hostile actors inside that active area.
    const playerNode = actorNode(player);
    const playerDx = (playerNode?.x ?? this.sprite.x) - this.sprite.x;
    const playerDy = (playerNode?.y ?? this.sprite.y) - this.sprite.y;
    const activeRangeSq = 720 * 720;
    if (playerDx * playerDx + playerDy * playerDy > activeRangeSq && this.state !== 'return') {
      this.sprite.setVelocity(0);
      if (this.layered) this.renderVisual('idle', 0, null);
      return;
    }

    const candidates = (potentialTargets?.length ? potentialTargets : [player])
      .filter(target => actorAlive(target) && areHostile(this, target));
    let target = null;
    let bestDistanceSq = Infinity;
    for (const candidate of candidates) {
      const node = actorNode(candidate);
      const dx = node.x - this.sprite.x, dy = node.y - this.sprite.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDistanceSq) { target = candidate; bestDistanceSq = d2; }
    }
    this.target = target;
    const targetNode = actorNode(target);
    const dx = targetNode ? targetNode.x - this.sprite.x : 0;
    const dy = targetNode ? targetNode.y - this.sprite.y : 0;
    const distanceSq = targetNode ? dx * dx + dy * dy : Infinity;

    this.animClock += delta;
    if (this.state === 'ability') {
      this.sprite.setVelocity(0);
      this.updateAbility(time);
    }

    if (time >= this.nextThink && this.state !== 'ability') {
      this.nextThink = time + 110;
      const distance = targetNode ? Math.sqrt(distanceSq) : Infinity;
      const homeDx = this.homeX - this.sprite.x;
      const homeDy = this.homeY - this.sprite.y;
      const homeDistance = Math.hypot(homeDx, homeDy);
      if (homeDistance > this.def.leashRange) this.state = 'return';
      if (this.state === 'idle' && time >= this.stateUntil) { this.state = 'patrol'; this.stateUntil = time + 1000 + Math.random() * 1600; }
      if ((this.state === 'idle' || this.state === 'patrol') && targetNode && distance < this.def.detectRange) { this.state = 'detect'; this.stateUntil = time + 220; }
      if (this.state === 'detect' && time >= this.stateUntil) this.state = targetNode ? 'chase' : 'idle';

      if (this.state === 'chase' && targetNode) {
        const ability = this.availableAbility(time, distance);
        if (ability) this.beginAbility(ability, target, time);
        else if (distance <= this.def.attackRange) { this.state = 'attack'; this.stateUntil = time + this.def.attackCooldown; this.attackApplied = false; }
      }
      if (this.state === 'attack' && !this.attackApplied && time >= this.stateUntil - this.def.attackCooldown * 0.48) {
        this.attackApplied = true;
        if (targetNode && distance <= this.def.attackRange + 18) this.callbacks.hitTarget?.(target, this.def.attack, this.sprite.x, this.sprite.y, this);
      }
      if (this.state === 'attack' && time >= this.stateUntil) { this.state = 'recover'; this.stateUntil = time + this.def.recoverMs; }
      if (this.state === 'recover' && time >= this.stateUntil) { this.state = targetNode && Math.random() < 0.34 ? 'reposition' : (targetNode ? 'chase' : 'idle'); this.stateUntil = time + 420; }
      if (this.state === 'reposition' && time >= this.stateUntil) this.state = targetNode ? 'chase' : 'idle';
      if (this.state === 'return' && homeDistance < 18) { this.state = 'idle'; this.stateUntil = time + 900; }

      let vx = 0, vy = 0;
      const speed = this.def.speed * (this.combat?.statuses.moveMultiplier(this) ?? 1);
      if (this.state === 'chase' && targetNode) { const inv = distance ? 1 / distance : 0; vx = dx * inv * speed; vy = dy * inv * speed; }
      else if (this.state === 'return') { const inv = homeDistance ? 1 / homeDistance : 0; vx = homeDx * inv * speed; vy = homeDy * inv * speed; }
      else if (this.state === 'patrol') {
        const angle = this.index * 1.7 + time * 0.0005;
        vx = Math.cos(angle) * speed * 0.35; vy = Math.sin(angle) * speed * 0.35;
        if (time >= this.stateUntil) { this.state = 'idle'; this.stateUntil = time + 700 + Math.random() * 900; }
      } else if (this.state === 'reposition' && targetNode) {
        const inv = distance ? 1 / distance : 0; vx = -dy * inv * speed * 0.65; vy = dx * inv * speed * 0.65;
      }
      if (this.state !== 'ability') this.sprite.setVelocity(vx, vy);
      this.setDirection(vx || dx, vy || dy);
    }

    const attacking = this.state === 'attack';
    const usingAbility = this.state === 'ability' && this.currentAbility;
    if (this.layered) {
      if (usingAbility) {
        const progress = Math.max(0, Math.min(0.999999, (time - this.abilityStartedAt) / Math.max(1, this.currentAbility.windupMs)));
        const action = this.currentAbility.animation === 'attack' ? 'slash' : this.currentAbility.animation;
        const frames = ACTION_FRAMES[action] || 6;
        this.renderVisual(action, Math.min(frames - 1, Math.floor(progress * frames)), progress);
      } else if (attacking) {
        const progress = Math.max(0, Math.min(0.999999, 1 - Math.max(0, this.stateUntil - time) / this.def.attackCooldown));
        const action = this.def.meleeAnimation || 'slash';
        const frames = ACTION_FRAMES[action] || 6;
        this.renderVisual(action, Math.min(frames - 1, Math.floor(progress * frames)), progress);
      } else if (time < this.hurtUntil) {
        const progress = Math.max(0, Math.min(0.999999, 1 - (this.hurtUntil - time) / 180));
        this.renderVisual('hurt', Math.min(5, Math.floor(progress * 6)), progress);
      } else {
        const moving = Math.hypot(this.sprite.body.velocity.x, this.sprite.body.velocity.y) > 2;
        const frame = moving ? Math.floor(this.animClock / 130) % 8 : 0;
        this.renderVisual(moving ? 'walk' : 'idle', frame, null);
      }
      return;
    }

    const spec = this.visualSpec || this.def;
    const actionAttacking = attacking || usingAbility;
    const columns = actionAttacking ? spec.attackFrames : spec.walkFrames;
    const actionProgress = usingAbility
      ? Math.max(0, Math.min(0.999999, (time - this.abilityStartedAt) / Math.max(1, this.currentAbility.windupMs)))
      : Math.max(0, Math.min(0.999999, 1 - Math.max(0, this.stateUntil - time) / this.def.attackCooldown));
    const frameInRow = actionAttacking ? Math.min(columns - 1, Math.floor(actionProgress * columns)) : Math.floor(this.animClock / (spec.frameMs || 130)) % columns;
    const texture = actionAttacking ? spec.attackTexture : spec.walkTexture;
    const directionRows = actionAttacking ? (spec.attackDirectionRows || spec.directionRows) : (spec.walkDirectionRows || spec.directionRows);
    const sourceRow = directionRows?.[this.direction] ?? this.direction;
    this.sprite.setTexture(texture).setFrame(sourceRow * columns + frameInRow)
      .setOrigin(0.5, actionAttacking ? (spec.attackOriginY || this.def.attackOriginY || this.def.originY || 0.7) : (spec.originY || this.def.originY || 0.7))
      .setDepth(this.sprite.y);
  }

  recordDamageContribution(team, amount, time) {
    this.lastDamageTeam = team || null;
    if (team === 'player') {
      this.playerContributionDamage += Math.max(0, Number(amount) || 0);
      this.lastPlayerContributionAt = time;
    }
  }

  playerRewardEligible(time, windowMs = 12000) {
    const threshold = Math.max(1, Math.min(12, Math.ceil(this.def.maxHp * 0.10)));
    return this.playerContributionDamage >= threshold && time - this.lastPlayerContributionAt <= windowMs;
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, options = {}) {
    if (!this.sprite.active || this.state === 'dying') return false;
    const damage = Math.max(1, Math.floor(amount));
    this.hp -= damage;
    this.hurtUntil = Math.max(this.hurtUntil, time + 180);
    if (options.knockback) {
      const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.sprite.x, this.sprite.y);
      this.knockbackVX = Math.cos(angle) * options.knockback;
      this.knockbackVY = Math.sin(angle) * options.knockback;
      this.knockbackUntil = Math.max(this.knockbackUntil, time + (options.knockbackDuration || 170));
      this.sprite.setVelocity(this.knockbackVX, this.knockbackVY);
      if (this.state === 'ability') this.clearAbility();
      this.state = 'recover';
      this.stateUntil = Math.max(this.stateUntil, this.knockbackUntil + 100);
    }
    if (this.layered) this.visual.setTintFill(0xffffff); else this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(85, () => {
      if (!this.sprite.active) return;
      if (this.layered) this.visual.clearTint(); else this.sprite.clearTint();
    });
    if (this.hp <= 0) this.die(time);
    return true;
  }

  // Compatibility wrapper for pre-v0.1.3 call sites. CombatResolver is the
  // authoritative damage math for new skills/projectiles/statuses.
  takeDamage(amount, sourceX, sourceY, time) {
    const damage = Math.max(1, Math.floor(amount - this.def.defense * 0.45 + Math.random() * 4));
    return this.takeResolvedDamage(damage, sourceX, sourceY, time) ? true : false;
  }

  die(time) {
    if (this.state === 'dying') return;
    this.clearAbility();
    this.combat?.statuses.clear(this);
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
