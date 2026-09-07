const FX_COLORS = Object.freeze({
  physical: 0xffd18a,
  fire: 0xff6730,
  blueflame: 0x64a7ff,
  poison: 0x79d64d,
  shadow: 0xb26cff,
  guard: 0xe7b85d,
  earth: 0xc99558
});

export class FxManager {
  constructor(scene) {
    this.scene = scene;
    this.makeTextures();
    this.pools = new Map();
    for (const key of ['physical', 'fire', 'blueflame', 'poison', 'shadow', 'guard', 'earth']) {
      this.pools.set(key, Array.from({ length: 12 }, () => scene.add.sprite(0, 0, `fx-${key}`).setVisible(false).setDepth(8600)));
    }
    this.indices = new Map();
  }

  makeTextures() {
    const makeOrb = (key, color, radius = 8) => {
      if (this.scene.textures.exists(key)) return;
      const g = this.scene.add.graphics();
      g.fillStyle(color, 0.22).fillCircle(12, 12, radius + 4);
      g.fillStyle(color, 0.82).fillCircle(12, 12, radius);
      g.fillStyle(0xffffff, 0.72).fillCircle(10, 10, Math.max(2, radius * 0.28));
      g.generateTexture(key, 24, 24).destroy();
    };
    for (const [key, color] of Object.entries(FX_COLORS)) makeOrb(`fx-${key}`, color, key === 'earth' ? 7 : 6);
    makeOrb('projectile-poison', FX_COLORS.poison, 5);
    makeOrb('projectile-blueflame', FX_COLORS.blueflame, 5);
    makeOrb('projectile-shadow', FX_COLORS.shadow, 6);
    if (!this.scene.textures.exists('projectile-arrow')) {
      const g = this.scene.add.graphics();
      g.lineStyle(2, 0xe7d5ad, 1).lineBetween(3, 12, 19, 12);
      g.fillStyle(0xf1d28f, 1).fillTriangle(19, 8, 23, 12, 19, 16);
      g.generateTexture('projectile-arrow', 26, 24).destroy();
    }
  }

  pooled(kind) {
    const pool = this.pools.get(kind) || this.pools.get('physical');
    const index = this.indices.get(kind) || 0;
    this.indices.set(kind, index + 1);
    return pool[index % pool.length];
  }

  burst(x, y, kind = 'physical', scale = 1) {
    const sprite = this.pooled(kind);
    this.scene.tweens.killTweensOf(sprite);
    sprite.setTexture(`fx-${FX_COLORS[kind] ? kind : 'physical'}`).setPosition(x, y).setScale(0.35 * scale).setAlpha(1).setVisible(true);
    this.scene.tweens.add({ targets: sprite, scale: 1.7 * scale, alpha: 0, duration: 220, ease: 'Quad.out', onComplete: () => sprite.setVisible(false) });
  }

  ring(x, y, radius, kind = 'fire', duration = 320) {
    const color = FX_COLORS[kind] || FX_COLORS.fire;
    const g = this.scene.add.graphics().setDepth(8450);
    g.lineStyle(3, color, 0.9).strokeCircle(x, y, Math.max(8, radius * 0.2));
    this.scene.tweens.add({ targets: g, alpha: 0, duration, onUpdate: tween => {
      g.clear();
      const t = tween.progress;
      g.lineStyle(3, color, 0.9 * (1 - t)).strokeCircle(x, y, Math.max(8, radius * (0.2 + t * 0.8)));
    }, onComplete: () => g.destroy() });
  }

  telegraph(x, y, radius, kind = 'earth', duration = 700) {
    const color = FX_COLORS[kind] || FX_COLORS.earth;
    const g = this.scene.add.graphics().setDepth(8200);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 35, loop: true, callback: () => {
      if (!g.active) return;
      const p = Math.min(1, (this.scene.time.now - started) / Math.max(1, duration));
      g.clear();
      g.fillStyle(color, 0.08 + p * 0.12).fillCircle(x, y, radius);
      g.lineStyle(2 + p * 2, color, 0.45 + p * 0.5).strokeCircle(x, y, radius);
      g.lineStyle(1, color, 0.25).strokeCircle(x, y, Math.max(6, radius * p));
      if (p >= 1) { timer.remove(false); g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); g.destroy(); } };
  }

  lineTelegraph(x, y, targetX, targetY, length, kind = 'physical', duration = 650) {
    const color = FX_COLORS[kind] || FX_COLORS.physical;
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const ex = x + Math.cos(angle) * length;
    const ey = y + Math.sin(angle) * length;
    const g = this.scene.add.graphics().setDepth(8200);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 35, loop: true, callback: () => {
      if (!g.active) return;
      const p = Math.min(1, (this.scene.time.now - started) / Math.max(1, duration));
      g.clear();
      g.lineStyle(6, color, 0.08 + p * 0.10).lineBetween(x, y, ex, ey);
      g.lineStyle(2 + p * 2, color, 0.42 + p * 0.45).lineBetween(x, y, ex, ey);
      g.fillStyle(color, 0.35 + p * 0.35).fillCircle(ex, ey, 4 + p * 3);
      if (p >= 1) { timer.remove(false); g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); if (g.active) g.destroy(); } };
  }

  trail(x, y, kind = 'physical') { this.burst(x, y, kind, 0.45); }

  skill(skillId, x, y, facing = [0, 1]) {
    if (skillId === 'skill_ember_cleave') {
      const g = this.scene.add.graphics().setDepth(8500);
      const angle = Math.atan2(facing[1], facing[0]);
      g.lineStyle(10, FX_COLORS.fire, 0.78);
      g.beginPath();
      g.arc(x, y, 108, angle - 1.10, angle + 1.10, false); g.strokePath();
      g.lineStyle(3, 0xffc879, 0.82);
      g.beginPath();
      g.arc(x, y, 91, angle - 1.05, angle + 1.05, false); g.strokePath();
      this.scene.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() });
    } else if (skillId === 'skill_ashen_guard') {
      this.ring(x, y, 56, 'guard', 420); this.burst(x, y - 18, 'guard', 1.2);
    } else if (skillId === 'skill_ruin_pulse') {
      this.ring(x, y, 114, 'shadow', 500);
      this.scene.time.delayedCall(70, () => this.ring(x, y, 88, 'shadow', 390));
      this.burst(x, y, 'shadow', 1.75);
      for (let i = 0; i < 6; i += 1) {
        const angle = i * Math.PI / 3;
        this.scene.time.delayedCall(i * 16, () => this.burst(x + Math.cos(angle) * 48, y + Math.sin(angle) * 48, 'earth', 0.72));
      }
    }
  }

  impact(kind, x, y) { this.burst(x, y, kind, 0.95); }
}
