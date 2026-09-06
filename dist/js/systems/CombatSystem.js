import { derivedStats } from './StatsSystem.js';

export class DamageNumberPool {
  constructor(scene, size = 24) {
    this.scene = scene;
    this.items = Array.from({ length: size }, () => ({
      text: scene.add.text(0, 0, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '15px', color: '#ffd36a', stroke: '#170b08', strokeThickness: 4 }).setOrigin(0.5).setVisible(false).setDepth(9000),
      busyUntil: 0
    }));
    this.index = 0;
  }
  show(x, y, amount, hostile = false) {
    const item = this.items[this.index++ % this.items.length];
    item.text.setPosition(x, y).setText(String(amount)).setColor(hostile ? '#ff6b56' : '#ffd36a').setAlpha(1).setVisible(true);
    this.scene.tweens.killTweensOf(item.text);
    this.scene.tweens.add({ targets: item.text, y: y - 34, alpha: 0, duration: 620, ease: 'Quad.out', onComplete: () => item.text.setVisible(false) });
  }
}

export class EffectPool {
  constructor(scene, size = 18) {
    this.scene = scene;
    this.items = Array.from({ length: size }, () => scene.add.sprite(0, 0, 'hit-spark').setVisible(false).setDepth(8500));
    this.index = 0;
  }
  burst(x, y) {
    const sprite = this.items[this.index++ % this.items.length];
    sprite.setPosition(x, y).setScale(0.5).setAlpha(1).setVisible(true);
    this.scene.tweens.killTweensOf(sprite);
    this.scene.tweens.add({ targets: sprite, scale: 1.8, alpha: 0, duration: 180, onComplete: () => sprite.setVisible(false) });
  }
}

export class CombatSystem {
  constructor(scene, state, player, enemies, events) {
    this.scene = scene;
    this.state = state;
    this.player = player;
    this.enemies = enemies;
    this.events = events;
    this.damageNumbers = new DamageNumberPool(scene);
    this.effects = new EffectPool(scene);
  }

  playerAttack() {
    const derived = derivedStats(this.state);
    const facing = [[0, -1], [-1, 0], [0, 1], [1, 0]][this.player.visual.direction];
    let hitCount = 0;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const dx = enemy.sprite.x - this.player.body.x;
      const dy = enemy.sprite.y - this.player.body.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > 92 * 92) continue;
      const distance = Math.sqrt(distSq) || 1;
      const dot = (dx / distance) * facing[0] + (dy / distance) * facing[1];
      if (dot < 0.05 && distance > 34) continue;
      if (enemy.takeDamage(derived.attack, this.player.body.x, this.player.body.y, this.scene.time.now)) {
        hitCount += 1;
        this.effects.burst(enemy.sprite.x, enemy.sprite.y - 12);
      }
    }
    if (!hitCount) this.events.emit('toast', { text: 'Your blade cuts only ash.', tone: 'muted', short: true });
  }
}

