const DIRECTION_VECTORS = Object.freeze([[0, -1], [-1, 0], [0, 1], [1, 0]]);
function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dead' && actor.state !== 'dying' && node.active !== false);
}

export class SeraphelFreeplayController {
  constructor(scene, actor, input) {
    this.scene = scene;
    this.actor = actor;
    this.input = input;
    this.lastAimX = 0;
    this.lastAimY = 1;
    this.stillSince = scene.time.now;
    this.nextTrailAt = 0;
  }

  facingVector() {
    const mx = Number(this.input.moveX) || 0;
    const my = Number(this.input.moveY) || 0;
    const len = Math.hypot(mx, my);
    if (len > 0.08) {
      this.lastAimX = mx / len;
      this.lastAimY = my / len;
      return [this.lastAimX, this.lastAimY];
    }
    const facing = DIRECTION_VECTORS[this.actor.direction] || [0, 1];
    this.lastAimX = facing[0];
    this.lastAimY = facing[1];
    return facing;
  }

  hostileTargets() { return (this.scene.combat?.hostileTargetsFor?.(this.actor) || []).filter(actorAlive); }

  selectTarget(range = 520, coneDegrees = 175) {
    const origin = actorNode(this.actor);
    if (!origin) return null;
    const [fx, fy] = this.facingVector();
    const cosThreshold = Math.cos(Math.max(20, Math.min(180, coneDegrees)) * Math.PI / 360);
    let best = null, bestScore = Infinity;
    for (const target of this.hostileTargets()) {
      const node = actorNode(target);
      if (!node) continue;
      const dx = node.x - origin.x, dy = node.y - origin.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 1 || distance > range) continue;
      const dot = (dx / distance) * fx + (dy / distance) * fy;
      if (dot < cosThreshold) continue;
      const score = distance + (1 - dot) * 235;
      if (score < bestScore) { best = target; bestScore = score; }
    }
    if (best) return best;
    for (const target of this.hostileTargets()) {
      const node = actorNode(target);
      const distance = node ? Math.hypot(node.x - origin.x, node.y - origin.y) : Infinity;
      if (distance <= range && distance < bestScore) { best = target; bestScore = distance; }
    }
    return best;
  }

  pointTarget(distance = 260) {
    const node = actorNode(this.actor);
    const [fx, fy] = this.facingVector();
    return {
      dead: false, _freeplayAimPoint: true,
      body: { x: node.x + fx * distance, y: node.y + fy * distance, active: true, velocity: { x: 0, y: 0 } },
      def: { name: 'Fallen Aim Point', faction: 'neutral' }
    };
  }

  abilityTarget(ability) {
    if (!ability) return null;
    if (ability.id === 'seraphel_prismatic_dominion') return this.actor;
    if (ability.id === 'seraphel_tempest_exile') return this.selectTarget(ability.range, 180) || this.pointTarget(Math.min(ability.range, 320));
    if (ability.id === 'seraphel_pyre_fallen_sun' || ability.id === 'seraphel_crown_frozen_abyss' || ability.id === 'seraphel_worldbreaker_testament' || ability.id === 'seraphel_eclipse_grace' || ability.id === 'seraphel_sevenfold_cataclysm') {
      return this.selectTarget(ability.range, 175) || this.pointTarget(Math.min(ability.range, 360));
    }
    return this.selectTarget(ability.range || 480, 175) || this.pointTarget(Math.min(ability.range || 280, 340));
  }

  requestAbility(abilityId, time = this.scene.time.now) {
    const actor = this.actor;
    const ability = Object.values(actor.def.abilities || {}).find(entry => entry.id === abilityId);
    if (!ability || actor.dead) return false;
    if (actor.state === 'combo' || actor.state === 'tempest' || actor.currentAbility) return false;
    if (actor.state === 'recover' && time < actor.stateUntil) return false;
    if (time < actor.knockbackUntil || actor.combat?.statuses?.actionLocked?.(actor)) return false;
    if (!actor.cooldownReady(ability.id, time)) return false;
    if (ability.major && !actor.majorReady(time)) return false;
    return actor.beginAbility(ability, this.abilityTarget(ability), time);
  }

  requestAttack(time = this.scene.time.now) { return this.actor.requestBasicAttack(time); }

  update(time, delta) {
    const actor = this.actor;
    actor.animClock += delta;
    this.input.update();

    if (this.input.consumeAttack()) this.requestAttack(time);
    if (this.input.consumeSkill(0)) this.requestAbility('seraphel_pyre_fallen_sun', time);
    if (this.input.consumeSkill(1)) this.requestAbility('seraphel_crown_frozen_abyss', time);
    if (this.input.consumeSkill(2)) this.requestAbility('seraphel_tempest_exile', time);

    if (actor.dead) {
      actor.body.setVelocity(0);
      actor.renderProgress('hurt', Math.min(0.999999, (time - actor.deathStartedAt) / Math.max(700, actor.def.freeplayRespawnMs * 0.55)));
      if (time >= actor.respawnAt) actor.respawn(time);
      actor.syncPresentation(time);
      return;
    }

    if (time < actor.knockbackUntil) {
      actor.body.setVelocity(actor.knockbackVX, actor.knockbackVY);
      actor.setDirection(actor.knockbackVX, actor.knockbackVY);
      actor.renderLoop('combatIdle', time, 120);
      actor.syncPresentation(time);
      return;
    }
    if (actor.knockbackUntil) { actor.knockbackUntil = 0; actor.knockbackVX = 0; actor.knockbackVY = 0; }

    if (actor.combat?.statuses?.actionLocked?.(actor)) {
      actor.body.setVelocity(0);
      if (actor.currentAbility) actor.finishAbility(time, 220);
      actor.state = 'recover';
      actor.stateUntil = Math.max(actor.stateUntil, time + 180);
    }

    if (actor.state === 'combo') actor.updateCombo(time);
    else if (actor.state === 'tempest') actor.updateTempest(time);
    else if (actor.state === 'ability') { actor.body.setVelocity(0); actor.updateAbility(time); }
    else if (actor.state === 'recover' && time < actor.stateUntil) {
      actor.body.setVelocity(0);
      actor.renderLoop('combatIdle', time, 140);
    } else {
      let dx = Number(this.input.moveX) || 0;
      let dy = Number(this.input.moveY) || 0;
      const length = Math.hypot(dx, dy);
      if (length > 1) { dx /= length; dy /= length; }
      const magnitude = Math.hypot(dx, dy);
      const moving = magnitude > 0.05;
      if (moving) {
        this.stillSince = time;
        const fast = this.input.run || magnitude > 0.62;
        const speed = actor.def.glideSpeed * (fast ? actor.def.runMultiplier : 0.78);
        actor.body.setVelocity(dx * speed, dy * speed);
        actor.setDirection(dx, dy);
        this.lastAimX = dx / Math.max(0.001, magnitude);
        this.lastAimY = dy / Math.max(0.001, magnitude);
        actor.state = fast ? 'glide' : 'walk';
        actor.lastActionName = fast ? 'Fallen glide' : 'Measured advance';
        actor.renderLoop(fast ? 'run' : 'walk', time, fast ? 62 : 92);
        if (time >= this.nextTrailAt) {
          this.nextTrailAt = time + (fast ? 78 : 130);
          const palette = fast ? [0xd05cff, 0x50dfff, 0xff6b4a] : [0x5d1d87, 0xff784f, 0x70e7ff];
          actor.paletteBurst(actor.body.x - dx * 14, actor.body.y - dy * 14 - 7, palette, fast ? 38 : 28, 190, fast ? 7 : 5);
        }
      } else {
        actor.body.setVelocity(0);
        const hostileNearby = this.hostileTargets().some(target => {
          const node = actorNode(target);
          return node && Math.hypot(node.x - actor.body.x, node.y - actor.body.y) <= 430;
        });
        const meditating = !hostileNearby && time - this.stillSince >= 6500;
        actor.renderControlledIdle(time, meditating, hostileNearby);
      }
    }

    actor.syncPresentation(time);
  }
}
