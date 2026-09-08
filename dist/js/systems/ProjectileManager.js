import { PROJECTILE_DEFS } from '../data/projectiles.js';

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function actorAlive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}

export class ProjectileManager {
  constructor(scene, resolver, statuses, fx, audio, player, enemies, size = 40, hostileTargetsProvider = null) {
    this.scene = scene;
    this.resolver = resolver;
    this.statuses = statuses;
    this.fx = fx;
    this.audio = audio;
    this.player = player;
    this.enemies = enemies;
    this.hostileTargetsProvider = hostileTargetsProvider || (() => []);
    this.items = Array.from({ length: size }, () => ({
      sprite: scene.physics.add.sprite(-200, -200, 'projectile-arrow').setActive(false).setVisible(false).setDepth(8400),
      data: null,
      lastTrailAt: 0
    }));
    for (const item of this.items) item.sprite.body.setSize(10, 10, true);
    this.cursor = 0;
  }

  launch(projectileId, payload) {
    const def = PROJECTILE_DEFS[projectileId];
    if (!def) return false;
    const item = this.items.find(entry => !entry.sprite.active) || this.items[this.cursor++ % this.items.length];
    const sprite = item.sprite;
    const dx = payload.targetX - payload.x, dy = payload.targetY - payload.y;
    const dist = Math.hypot(dx, dy) || 1;
    const vx = dx / dist * def.speed, vy = dy / dist * def.speed;
    sprite.setTexture(def.texture).setPosition(payload.x, payload.y).setRotation(Math.atan2(vy, vx)).setActive(true).setVisible(true);
    sprite.body.enable = true; sprite.setVelocity(vx, vy);
    item.data = { ...payload, def, expiresAt: this.scene.time.now + def.lifetimeMs };
    item.lastTrailAt = 0;
    this.audio.play(projectileId === 'celestial_judgment' ? 'judgment_blast' : projectileId === 'lumen_bolt' ? 'celestial_strike' : projectileId === 'bone_arrow' ? 'arrow' : def.damageType === 'fire' ? 'fire' : def.damageType === 'poison' ? 'poison' : 'shadow');
    return true;
  }

  deactivate(item, impact = false) {
    if (impact && item.data) {
      if (item.data.def.impact === 'celestial') {
        const judgment = item.data.def.id === 'celestial_judgment';
        this.fx.celestialImpact(item.sprite.x, item.sprite.y, judgment ? 70 : 58, judgment ? 0.82 : 0.62);
      } else this.fx.impact(item.data.def.impact || item.data.def.damageType, item.sprite.x, item.sprite.y);
    }
    item.sprite.setVelocity(0).setActive(false).setVisible(false);
    item.sprite.body.enable = false; item.data = null;
  }

  applyHit(item, target) {
    const data = item.data;
    if (!data) return;
    const options = {
      type: data.def.damageType, sourceX: data.x, sourceY: data.y, impact: data.def.impact,
      knockback: data.knockback || data.def.knockback || 0,
      sourceTeam: data.team, sourceActor: data.sourceActor || null
    };
    const amount = this.resolver.damageTarget(target, data.damage, options);
    if (amount && data.status && Math.random() <= (data.status.chance ?? 1)) {
      this.statuses.apply(target, data.status.id, {
        power: data.sourcePower || data.damage, x: data.x, y: data.y, team: data.team
      });
    }
    if (amount && data.def.impact === 'celestial' && this.scene.state?.settings?.screenShake && this.player?.body) {
      const distance = Phaser.Math.Distance.Between(item.sprite.x, item.sprite.y, this.player.body.x, this.player.body.y);
      if (distance < 410) {
        const falloff = Math.max(0.18, 1 - distance / 410);
        this.scene.cameras.main.shake(Math.round(95 * (0.75 + falloff * 0.25)), 0.0032 * falloff);
      }
    }
    this.deactivate(item, true);
  }

  update(time) {
    for (const item of this.items) {
      if (!item.sprite.active || !item.data) continue;
      if (time >= item.data.expiresAt || item.sprite.x < 0 || item.sprite.y < 0 || item.sprite.x > this.scene.currentMap.width || item.sprite.y > this.scene.currentMap.height) { this.deactivate(item); continue; }
      if (item.data.def.wallCollision && this.scene.obstacles && this.scene.physics.overlap(item.sprite, this.scene.obstacles)) { this.deactivate(item, true); continue; }
      if (time - item.lastTrailAt > 85) {
        item.lastTrailAt = time;
        this.fx.trail(item.sprite.x, item.sprite.y, item.data.def.trail || item.data.def.damageType);
      }
      for (const target of this.hostileTargetsProvider(item.data.sourceActor, item.data.team) || []) {
        if (!actorAlive(target)) continue;
        const node = actorNode(target);
        const dx = node.x - item.sprite.x, dy = node.y - item.sprite.y;
        const targetRadius = target.isPlayer ? 13 : 18;
        const rr = (item.data.def.radius || 8) + targetRadius;
        if (dx * dx + dy * dy <= rr * rr) { this.applyHit(item, target); break; }
      }
    }
  }

  clear() { for (const item of this.items) if (item.sprite.active) this.deactivate(item); }
}
