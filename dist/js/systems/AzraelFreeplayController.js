const DIRECTION_VECTORS = Object.freeze([[0, -1], [-1, 0], [0, 1], [1, 0]]);

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dead' && actor.state !== 'dying' && node.active !== false);
}

export class AzraelFreeplayController {
  constructor(scene, actor, input) {
    this.scene = scene;
    this.actor = actor;
    this.input = input;
    this.lastAimX = 0;
    this.lastAimY = 1;
    this.nextTrailAt = 0;
  }

  facingVector() {
    const movingX = Number(this.input.moveX) || 0;
    const movingY = Number(this.input.moveY) || 0;
    if (Math.hypot(movingX, movingY) > 0.08) {
      const inv = 1 / Math.hypot(movingX, movingY);
      this.lastAimX = movingX * inv;
      this.lastAimY = movingY * inv;
      return [this.lastAimX, this.lastAimY];
    }
    const facing = DIRECTION_VECTORS[this.actor.direction] || [0, 1];
    this.lastAimX = facing[0];
    this.lastAimY = facing[1];
    return facing;
  }

  hostileTargets() {
    return (this.scene.combat?.hostileTargetsFor?.(this.actor) || []).filter(actorAlive);
  }

  selectTarget(range = 520, coneDegrees = 170) {
    const origin = actorNode(this.actor);
    if (!origin) return null;
    const [fx, fy] = this.facingVector();
    const cosThreshold = Math.cos(Math.max(20, Math.min(180, coneDegrees)) * Math.PI / 360);
    let best = null;
    let bestScore = Infinity;
    for (const target of this.hostileTargets()) {
      const node = actorNode(target);
      if (!node) continue;
      const dx = node.x - origin.x;
      const dy = node.y - origin.y;
      const distance = Math.hypot(dx, dy);
      if (distance > range || distance < 1) continue;
      const dot = (dx / distance) * fx + (dy / distance) * fy;
      if (dot < cosThreshold) continue;
      // Direction matters more than a tiny distance advantage, making touch
      // facing feel intentional without requiring a second aim stick.
      const score = distance + (1 - dot) * 230;
      if (score < bestScore) { best = target; bestScore = score; }
    }
    if (best) return best;
    // If no target is in the facing cone, accept the closest hostile in range
    // so a large finger movement does not make a cast mysteriously fail.
    for (const target of this.hostileTargets()) {
      const node = actorNode(target);
      if (!node) continue;
      const distance = Math.hypot(node.x - origin.x, node.y - origin.y);
      if (distance <= range && distance < bestScore) { best = target; bestScore = distance; }
    }
    return best;
  }

  pointTarget(distance = 220) {
    const node = actorNode(this.actor);
    const [fx, fy] = this.facingVector();
    return {
      dead: false,
      _freeplayAimPoint: true,
      body: { x: node.x + fx * distance, y: node.y + fy * distance, active: true, velocity: { x: 0, y: 0 } },
      def: { name: 'Aim Point' }
    };
  }

  abilityTarget(ability) {
    if (!ability) return null;
    if (ability.id === 'azrael_sanctified_nova' || ability.id === 'azrael_sanctuary_first_light') return this.actor;
    if (ability.id === 'azrael_celestial_strike') return this.selectTarget(ability.range + 30, 170) || this.pointTarget(ability.range);
    if (ability.id === 'azrael_wing_burst') return this.selectTarget(ability.range, 150) || this.pointTarget(Math.min(ability.range, 240));
    if (ability.id === 'azrael_judgment_blast') return this.selectTarget(ability.range, 155) || this.pointTarget(Math.min(ability.range, 330));
    if (ability.id === 'azrael_seraphic_judgment') return this.selectTarget(ability.range, 160) || this.pointTarget(Math.min(ability.range, 300));
    if (ability.id === 'azrael_heavenfall') return this.selectTarget(390, 170) || this.pointTarget(300);
    return this.selectTarget(ability.range || 420, 170) || this.pointTarget(Math.min(ability.range || 220, 300));
  }

  requestAbility(abilityId, time = this.scene.time.now) {
    const actor = this.actor;
    const ability = Object.values(actor.def.abilities || {}).find(entry => entry.id === abilityId);
    if (!ability || actor.dead || actor.currentAbility) return false;
    if (actor.state === 'wingburst' || actor.state === 'wingburst_dash' || actor.state === 'ability') return false;
    if (actor.state === 'recover' && time < actor.stateUntil) return false;
    if (time < actor.knockbackUntil || actor.combat?.statuses?.actionLocked?.(actor)) return false;
    if (!actor.cooldownReady(ability.id, time)) return false;
    if (ability.major && !actor.majorReady(time)) return false;
    const target = this.abilityTarget(ability);
    return actor.beginAbility(ability, target, time);
  }

  update(time, delta) {
    const actor = this.actor;
    actor.animClock += delta;
    this.input.update();

    // Keyboard/desktop parity: Space always performs Celestial Strike and
    // 1/2/3 use the first freeplay bank. Touch can access all seven abilities.
    if (this.input.consumeAttack()) this.requestAbility('azrael_celestial_strike', time);
    if (this.input.consumeSkill(0)) this.requestAbility('azrael_wing_burst', time);
    if (this.input.consumeSkill(1)) this.requestAbility('azrael_judgment_blast', time);
    if (this.input.consumeSkill(2)) this.requestAbility('azrael_sanctified_nova', time);

    if (actor.dead) {
      actor.body.setVelocity(0);
      const p = Math.min(0.999999, (time - actor.deathStartedAt) / 720);
      actor.renderProgress('hurt', p);
      if (time >= actor.respawnAt) actor.respawn(time);
      actor.syncPresentation(time);
      return;
    }

    if (time < actor.knockbackUntil) {
      actor.body.setVelocity(actor.knockbackVX, actor.knockbackVY);
      actor.setDirection(actor.knockbackVX, actor.knockbackVY);
      actor.renderLoop('combatIdle', time, 150);
      actor.syncPresentation(time);
      return;
    }
    if (actor.knockbackUntil) {
      actor.knockbackUntil = 0;
      actor.knockbackVX = 0;
      actor.knockbackVY = 0;
    }

    if (actor.combat?.statuses?.actionLocked?.(actor)) {
      actor.body.setVelocity(0);
      if (actor.currentAbility) actor.finishAbility(time, 250);
      actor.state = 'recover';
      actor.stateUntil = Math.max(actor.stateUntil, time + 180);
    }

    if (actor.state === 'wingburst') actor.updateWingBurst(time);
    else if (actor.state === 'wingburst_dash') actor.updateWingBurstDash(time);
    else if (actor.state === 'ability') {
      actor.body.setVelocity(0);
      actor.updateAbility(time);
    } else if (actor.state === 'recover' && time < actor.stateUntil) {
      actor.body.setVelocity(0);
      actor.renderLoop('combatIdle', time, 150);
    } else {
      let dx = Number(this.input.moveX) || 0;
      let dy = Number(this.input.moveY) || 0;
      const length = Math.hypot(dx, dy);
      if (length > 1) { dx /= length; dy /= length; }
      const moving = Math.hypot(dx, dy) > 0.05;
      const speed = actor.def.glideSpeed * (this.input.run ? 1.16 : 1);
      actor.body.setVelocity(dx * speed, dy * speed);
      if (moving) {
        actor.setDirection(dx, dy);
        this.lastAimX = dx / Math.max(0.001, Math.hypot(dx, dy));
        this.lastAimY = dy / Math.max(0.001, Math.hypot(dx, dy));
        actor.state = 'glide';
        actor.lastActionName = 'Player-controlled glide';
        actor.renderLoop('run', time, this.input.run ? 65 : 76);
        if (time >= this.nextTrailAt) {
          this.nextTrailAt = time + 105;
          actor.combat?.fx?.burst?.(actor.body.x - dx * 16, actor.body.y - dy * 16 - 8, 'celestial', 0.28);
        }
      } else {
        actor.state = 'idle';
        actor.lastActionName = 'Awaiting command';
        actor.renderLoop('combatIdle', time, 150);
      }
    }

    actor.syncPresentation(time);
  }
}
