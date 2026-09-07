import { LayeredCharacter, createActorEquipmentState } from './LayeredCharacter.js';

export class NPC {
  constructor(scene, definition) {
    this.scene = scene;
    this.def = definition;
    this.x = definition.x;
    this.y = definition.y;
    this.routeIndex = 0;
    this.nextThink = 0;
    this.walkClock = Math.random() * 800;
    this.direction = 2;
    this.actorState = createActorEquipmentState(definition.loadout || {});
    this.visual = new LayeredCharacter(scene, this.x, this.y, this.actorState, definition.scale || 1.32, {
      baseAsset: definition.baseVisual || 'npc_classic_body',
      hairAsset: definition.hairVisual || null,
      equipmentPolicy: 'npc'
    });
    this.visual.direction = this.direction;
    this.label = scene.add.text(this.x, this.y - 54, `${definition.name}\n${definition.role}`, {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffe2a1', align: 'center', stroke: '#160d0b', strokeThickness: 3
    }).setOrigin(0.5).setDepth(5000);
  }

  update(time, delta, player) {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.body.x, player.body.y);
    if (distance > 650) return;
    this.walkClock += delta;
    let movingNow = false;
    if (time >= this.nextThink) {
      this.nextThink = time + 180;
      const target = this.def.route[this.routeIndex];
      const dx = target.x - this.x, dy = target.y - this.y;
      const len = Math.hypot(dx, dy);
      if (len < 5) this.routeIndex = (this.routeIndex + 1) % this.def.route.length;
      else {
        movingNow = true;
        const step = Math.min(len, this.def.speed * 0.18);
        this.x += dx / len * step; this.y += dy / len * step;
        if (Math.abs(dx) > Math.abs(dy)) this.direction = dx < 0 ? 1 : 3; else this.direction = dy < 0 ? 0 : 2;
      }
    }
    // Use route distance as a stable movement hint between think ticks.
    const target = this.def.route[this.routeIndex];
    const routeDistance = target ? Math.hypot(target.x - this.x, target.y - this.y) : 0;
    const moving = movingNow || (this.def.route.length > 1 && routeDistance > 6);
    const frame = moving ? Math.floor(this.walkClock / 150) % 8 : 0;
    this.visual.direction = this.direction;
    this.visual.render(this.x, this.y, moving ? 'walk' : 'idle', frame, this.y);
    this.label.setPosition(this.x, this.y - 54);
  }

  destroy() {
    this.visual.destroy();
    this.label.destroy();
  }
}
