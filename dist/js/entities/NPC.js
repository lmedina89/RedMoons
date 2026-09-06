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
    this.sprites = [
      scene.add.sprite(this.x, this.y, 'body-walk', 18).setScale(1.32).setOrigin(0.5, 0.69),
      scene.add.sprite(this.x, this.y, 'shirt-walk', 18).setScale(1.32).setOrigin(0.5, 0.69).setTint(definition.tint),
      scene.add.sprite(this.x, this.y, 'pants-walk', 18).setScale(1.32).setOrigin(0.5, 0.69),
      scene.add.sprite(this.x, this.y, 'hair-walk', 18).setScale(1.32).setOrigin(0.5, 0.69)
    ];
    this.label = scene.add.text(this.x, this.y - 54, `${definition.name}\n${definition.role}`, { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffe2a1', align: 'center', stroke: '#160d0b', strokeThickness: 3 }).setOrigin(0.5).setDepth(5000);
  }

  update(time, delta, player) {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.body.x, player.body.y);
    if (distance > 650) return;
    this.walkClock += delta;
    if (time >= this.nextThink) {
      this.nextThink = time + 180;
      const target = this.def.route[this.routeIndex];
      const dx = target.x - this.x, dy = target.y - this.y;
      const len = Math.hypot(dx, dy);
      if (len < 5) this.routeIndex = (this.routeIndex + 1) % this.def.route.length;
      else {
        const step = Math.min(len, this.def.speed * 0.18);
        this.x += dx / len * step; this.y += dy / len * step;
        if (Math.abs(dx) > Math.abs(dy)) this.direction = dx < 0 ? 1 : 3; else this.direction = dy < 0 ? 0 : 2;
      }
    }
    const moving = this.def.route.length > 1;
    const frame = moving ? 1 + Math.floor(this.walkClock / 150) % 8 : 0;
    for (let i = 0; i < this.sprites.length; i += 1) this.sprites[i].setPosition(this.x, this.y).setFrame(this.direction * 9 + frame).setDepth(this.y + i * 0.001);
    this.label.setPosition(this.x, this.y - 54);
  }
}

