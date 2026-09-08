const FX_COLORS = Object.freeze({
  physical: 0xffd18a,
  fire: 0xff6730,
  blueflame: 0x64a7ff,
  poison: 0x79d64d,
  shadow: 0xb26cff,
  abyss: 0x7b2cff,
  hellfire: 0xff3d18,
  ashbone: 0xe8c96f,
  blood: 0xb51e2e,
  guard: 0xe7b85d,
  earth: 0xc99558,
  heal: 0x72d78a,
  essence: 0xa98cff,
  celestial: 0xffe88a
});

export class FxManager {
  constructor(scene) {
    this.scene = scene;
    this.makeTextures();
    this.pools = new Map();
    for (const key of ['physical', 'fire', 'blueflame', 'poison', 'shadow', 'abyss', 'hellfire', 'ashbone', 'blood', 'guard', 'earth', 'heal', 'essence', 'celestial']) {
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
    makeOrb('projectile-abyss', FX_COLORS.abyss, 6);
    makeOrb('projectile-hellfire', FX_COLORS.hellfire, 6);
    makeOrb('projectile-ashbone', FX_COLORS.ashbone, 5);
    makeOrb('projectile-blood', FX_COLORS.blood, 6);
    makeOrb('projectile-lumen', FX_COLORS.celestial, 5);
    if (!this.scene.textures.exists('projectile-celestial')) {
      const g = this.scene.add.graphics();
      g.fillStyle(0xfff7c2, 0.16).fillCircle(16, 16, 15);
      g.fillStyle(FX_COLORS.celestial, 0.48).fillCircle(16, 16, 11);
      g.fillStyle(0xffffff, 0.92).fillCircle(16, 16, 5);
      g.lineStyle(2, 0xd9fbff, 0.86).strokeEllipse(16, 16, 27, 10);
      g.lineStyle(1, 0xffffff, 0.62).lineBetween(4, 16, 28, 16).lineBetween(16, 4, 16, 28);
      g.generateTexture('projectile-celestial', 32, 32).destroy();
    }
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

  demonClaw(x, y, facing = [0, 1], range = 90, kind = 'abyss', scale = 1) {
    const color = FX_COLORS[kind] || FX_COLORS.shadow;
    const g = this.scene.add.graphics().setDepth(8520);
    const angle = Math.atan2(facing[1], facing[0]);
    const half = 0.58;
    for (let i = 0; i < 3; i += 1) {
      const radius = range * (0.58 + i * 0.10) * scale;
      g.lineStyle(Math.max(2, 5 - i), color, 0.76 - i * 0.14);
      g.beginPath();
      g.arc(x, y, radius, angle - half + i * 0.08, angle + half - i * 0.05, false);
      g.strokePath();
    }
    const hx = x + Math.cos(angle) * range * 0.68;
    const hy = y + Math.sin(angle) * range * 0.68;
    this.burst(hx, hy, kind, 0.72 * scale);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 210, ease: 'Quad.out', onComplete: () => g.destroy() });
  }

  demonRushTrail(x1, y1, x2, y2, kind = 'blood') {
    const steps = 4;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      this.scene.time.delayedCall(i * 18, () => this.burst(
        x1 + (x2 - x1) * t,
        y1 + (y2 - y1) * t - 8,
        kind,
        0.52 + t * 0.18
      ));
    }
  }

  trail(x, y, kind = 'physical') { this.burst(x, y, kind, 0.45); }

  skill(skillId, x, y, facing = [0, 1], def = null) {
    if (skillId === 'skill_ember_cleave') {
      const g = this.scene.add.graphics().setDepth(8500);
      const angle = Math.atan2(facing[1], facing[0]);
      const range = Math.max(96, def?.range || 148);
      const halfArc = (def?.arcDegrees || 148) * Math.PI / 360;
      const outerRadius = range * 0.94;
      const innerRadius = range * 0.69;
      g.lineStyle(12, FX_COLORS.fire, 0.72);
      g.beginPath();
      g.arc(x, y, outerRadius, angle - halfArc, angle + halfArc, false); g.strokePath();
      g.lineStyle(4, 0xffd69a, 0.90);
      g.beginPath();
      g.arc(x, y, innerRadius, angle - halfArc * 0.96, angle + halfArc * 0.96, false); g.strokePath();
      for (const offset of [-0.72, -0.24, 0.24, 0.72]) {
        const a = angle + halfArc * offset;
        this.burst(x + Math.cos(a) * range * 0.82, y + Math.sin(a) * range * 0.82, 'fire', 0.58);
      }
      this.scene.tweens.add({ targets: g, alpha: 0, duration: 330, onComplete: () => g.destroy() });
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

  celestialSigil(x, y, radius = 74, duration = 760) {
    const g = this.scene.add.graphics().setDepth(8440);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 32, loop: true, callback: () => {
      if (!g.active) return;
      const p = Math.min(1, (this.scene.time.now - started) / Math.max(1, duration));
      const pulse = 0.72 + Math.sin(p * Math.PI * 5) * 0.08;
      g.clear();
      g.lineStyle(2.5, 0xffe88a, (0.52 + p * 0.35) * pulse).strokeCircle(x, y, radius);
      g.lineStyle(1.5, 0xdffcff, 0.50 + p * 0.30).strokeCircle(x, y, radius * (0.56 + p * 0.08));
      g.lineStyle(2, 0xfff6c8, 0.45 + p * 0.35);
      for (let i = 0; i < 8; i += 1) {
        const a = i * Math.PI / 4 + p * 0.32;
        const r0 = radius * 0.64, r1 = radius * 0.94;
        g.lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
      // Simple wing-like mirrored glyphs give the field a celestial signature
      // without shipping another texture or expensive particle system.
      g.lineStyle(2, 0xdffcff, 0.52 + p * 0.30);
      g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x - 30, y - 13); g.lineTo(x - 47, y - 4); g.lineTo(x - 28, y + 4); g.lineTo(x - 45, y + 14); g.strokePath();
      g.beginPath(); g.moveTo(x + 8, y); g.lineTo(x + 30, y - 13); g.lineTo(x + 47, y - 4); g.lineTo(x + 28, y + 4); g.lineTo(x + 45, y + 14); g.strokePath();
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); if (g.active) g.destroy(); } };
  }

  celestialStrike(x, y, facing = [0, 1], range = 110) {
    const g = this.scene.add.graphics().setDepth(8560);
    const angle = Math.atan2(facing[1], facing[0]);
    const half = 0.74;
    g.lineStyle(11, 0xffe88a, 0.70);
    g.beginPath(); g.arc(x, y, range * 0.76, angle - half, angle + half, false); g.strokePath();
    g.lineStyle(3, 0xe8fdff, 0.96);
    g.beginPath(); g.arc(x, y, range * 0.86, angle - half * 0.94, angle + half * 0.94, false); g.strokePath();
    for (const offset of [-0.65, -0.22, 0.22, 0.65]) {
      const a = angle + half * offset;
      this.burst(x + Math.cos(a) * range * 0.72, y + Math.sin(a) * range * 0.72, 'celestial', 0.58);
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
  }

  celestialWingBurst(x, y, facing = [0, 1], scale = 1) {
    const angle = Math.atan2(facing[1], facing[0]);
    const g = this.scene.add.graphics().setDepth(8540);
    g.lineStyle(4, 0xe7fdff, 0.86);
    for (const side of [-1, 1]) {
      const a = angle + side * Math.PI * 0.52;
      g.beginPath();
      g.moveTo(x, y - 4);
      g.lineTo(x + Math.cos(a - side * 0.30) * 38 * scale, y + Math.sin(a - side * 0.30) * 25 * scale);
      g.lineTo(x + Math.cos(a) * 62 * scale, y + Math.sin(a) * 40 * scale);
      g.lineTo(x + Math.cos(a + side * 0.26) * 43 * scale, y + Math.sin(a + side * 0.26) * 31 * scale);
      g.strokePath();
    }
    this.ring(x, y, 56 * scale, 'celestial', 260);
    this.burst(x, y - 12, 'celestial', 1.35 * scale);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
  }

  celestialImpact(x, y, radius = 92, intensity = 1) {
    this.ring(x, y, radius, 'celestial', 420);
    this.scene.time.delayedCall(55, () => this.ring(x, y, radius * 0.68, 'celestial', 340));
    this.burst(x, y - 8, 'celestial', 2.0 * intensity);
    const count = Math.min(12, 7 + Math.round(intensity * 3));
    for (let i = 0; i < count; i += 1) {
      const angle = i / count * Math.PI * 2 + (i % 2) * 0.18;
      const r = radius * (0.35 + (i % 3) * 0.18);
      this.scene.time.delayedCall((i % 4) * 18, () => this.burst(x + Math.cos(angle) * r, y + Math.sin(angle) * r, i % 3 === 0 ? 'heal' : 'celestial', 0.65 + intensity * 0.18));
    }
  }

  ancientCelestialSeal(x, y, radius = 128, duration = 900, variant = 'nova') {
    const g = this.scene.add.graphics().setDepth(8435);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 32, loop: true, callback: () => {
      if (!g.active) return;
      const p = Math.min(1, (this.scene.time.now - started) / Math.max(1, duration));
      const rotation = (variant === 'judgment' ? -1 : 1) * (0.22 + p * 0.66);
      const pulse = 0.82 + Math.sin(p * Math.PI * 7) * 0.10;
      g.clear();
      g.fillStyle(0xffefad, (0.018 + p * 0.034) * pulse).fillCircle(x, y, radius * 0.94);
      g.lineStyle(3, 0xffe58b, (0.48 + p * 0.42) * pulse).strokeCircle(x, y, radius);
      g.lineStyle(1.5, 0xe8fdff, 0.54 + p * 0.28).strokeCircle(x, y, radius * 0.72);
      g.lineStyle(1.5, 0xfff9d8, 0.44 + p * 0.34).strokeCircle(x, y, radius * 0.43);

      // Twelve geometric rune marks around the seal. They intentionally avoid a
      // real-world alphabet/religious symbol while still reading as ancient law.
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI / 6 + rotation;
        const r = radius * 0.84;
        const cx = x + Math.cos(a) * r;
        const cy = y + Math.sin(a) * r;
        const tx = -Math.sin(a), ty = Math.cos(a);
        const rx = Math.cos(a), ry = Math.sin(a);
        const size = 5 + (i % 3);
        g.lineStyle(i % 2 ? 1.5 : 2, i % 3 === 0 ? 0xe9fdff : 0xffe58b, 0.54 + p * 0.30);
        g.beginPath();
        g.moveTo(cx + rx * size, cy + ry * size);
        g.lineTo(cx + tx * size, cy + ty * size);
        g.lineTo(cx - rx * size, cy - ry * size);
        g.lineTo(cx - tx * size, cy - ty * size);
        g.closePath(); g.strokePath();
      }

      // Interlocking six-point celestial geometry in the core.
      for (let pass = 0; pass < 2; pass += 1) {
        const offset = rotation * (pass ? -0.72 : 1);
        g.lineStyle(pass ? 1.5 : 2, pass ? 0xdffcff : 0xfff3b0, 0.50 + p * 0.28);
        g.beginPath();
        for (let i = 0; i <= 6; i += 1) {
          const a = offset + i * Math.PI * 2 / 6 + (pass ? Math.PI / 6 : 0);
          const px = x + Math.cos(a) * radius * 0.50;
          const py = y + Math.sin(a) * radius * 0.50;
          if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.strokePath();
      }

      g.lineStyle(2, 0xf2ffff, 0.46 + p * 0.34);
      for (let i = 0; i < 8; i += 1) {
        const a = i * Math.PI / 4 - rotation * 0.58;
        g.lineBetween(x + Math.cos(a) * radius * 0.47, y + Math.sin(a) * radius * 0.47,
          x + Math.cos(a) * radius * 0.68, y + Math.sin(a) * radius * 0.68);
      }
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    return { destroy: () => { timer.remove(false); if (g.active) g.destroy(); } };
  }

  sanctifiedNovaImpact(x, y, radius = 146) {
    const corona = this.scene.add.graphics().setDepth(8590);
    corona.fillStyle(0xfff7cf, 0.38).fillCircle(x, y, radius * 0.42);
    corona.lineStyle(5, 0xffffff, 0.88).strokeCircle(x, y, radius * 0.36);
    corona.lineStyle(3, 0xffe58b, 0.78);
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6;
      corona.lineBetween(x + Math.cos(a) * radius * 0.34, y + Math.sin(a) * radius * 0.34,
        x + Math.cos(a) * radius * 0.94, y + Math.sin(a) * radius * 0.94);
    }
    // Mirrored wing-corona strokes make the detonation unmistakably Azrael's.
    corona.lineStyle(5, 0xe8fdff, 0.78);
    for (const side of [-1, 1]) {
      corona.beginPath();
      corona.moveTo(x + side * 10, y - 7);
      corona.lineTo(x + side * radius * 0.30, y - radius * 0.24);
      corona.lineTo(x + side * radius * 0.55, y - radius * 0.12);
      corona.lineTo(x + side * radius * 0.34, y + radius * 0.02);
      corona.lineTo(x + side * radius * 0.60, y + radius * 0.16);
      corona.strokePath();
    }
    this.scene.tweens.add({ targets: corona, alpha: 0, duration: 360, ease: 'Quad.out', onComplete: () => corona.destroy() });
    this.ring(x, y, radius * 0.58, 'celestial', 330);
    this.scene.time.delayedCall(45, () => this.ring(x, y, radius * 0.82, 'celestial', 390));
    this.scene.time.delayedCall(95, () => this.ring(x, y, radius, 'celestial', 440));
    this.burst(x, y - 12, 'celestial', 2.35);
    const count = 16;
    for (let i = 0; i < count; i += 1) {
      const a = i / count * Math.PI * 2 + (i % 2) * 0.12;
      const r = radius * (0.34 + (i % 4) * 0.13);
      this.scene.time.delayedCall((i % 4) * 22, () => this.burst(x + Math.cos(a) * r, y + Math.sin(a) * r - 5, i % 4 === 0 ? 'heal' : 'celestial', 0.78 + (i % 3) * 0.10));
    }
  }

  seraphicJudgmentSeal(x, y, radius = 158, duration = 1040) {
    const base = this.ancientCelestialSeal(x, y, radius, duration, 'judgment');
    const g = this.scene.add.graphics().setDepth(8445);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 34, loop: true, callback: () => {
      if (!g.active) return;
      const p = Math.min(1, (this.scene.time.now - started) / Math.max(1, duration));
      g.clear();
      const alpha = 0.30 + p * 0.52;
      g.lineStyle(2, 0xffffff, alpha);
      // Four cardinal 'gates' converge toward the condemned area.
      for (let i = 0; i < 4; i += 1) {
        const a = i * Math.PI / 2;
        const outer = radius * (1.12 - p * 0.10);
        const inner = radius * 0.78;
        const sx = x + Math.cos(a) * outer, sy = y + Math.sin(a) * outer;
        const ex = x + Math.cos(a) * inner, ey = y + Math.sin(a) * inner;
        g.lineBetween(sx, sy, ex, ey);
        const tx = -Math.sin(a), ty = Math.cos(a);
        g.lineBetween(ex + tx * 9, ey + ty * 9, ex - tx * 9, ey - ty * 9);
      }
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    return { destroy: () => { base.destroy(); timer.remove(false); if (g.active) g.destroy(); } };
  }

  seraphicJudgmentImpact(x, y, radius = 158, pulse = 0, final = false) {
    const g = this.scene.add.graphics().setDepth(8600);
    const offsets = [-0.34, 0, 0.34];
    const spread = radius * 0.56;
    for (let i = 0; i < offsets.length; i += 1) {
      const ox = offsets[i] * spread + ((pulse % 2) ? (i - 1) * 7 : 0);
      const oy = ((i + pulse) % 2 ? 8 : -7);
      const ix = x + ox, iy = y + oy;
      g.lineStyle(final ? 11 : 8, 0xffffff, final ? 0.82 : 0.62).lineBetween(ix, iy - radius * 1.28, ix, iy + 8);
      g.lineStyle(final ? 5 : 3, 0xffe58b, 0.92).lineBetween(ix - 5, iy - radius * 1.12, ix - 1, iy + 4);
      g.lineStyle(2, 0xdffcff, 0.86).lineBetween(ix + 6, iy - radius * 1.05, ix + 2, iy + 6);
      g.lineStyle(2, 0xffffff, 0.72).strokeEllipse(ix, iy, 30 + pulse * 5, 11 + pulse * 2);
      this.burst(ix, iy - 4, 'celestial', final ? 1.35 : 0.92);
    }
    g.fillStyle(0xfff8cf, final ? 0.28 : 0.16).fillCircle(x, y, radius * (final ? 0.46 : 0.30));
    this.scene.tweens.add({ targets: g, alpha: 0, duration: final ? 360 : 260, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius * (final ? 1.0 : 0.62 + pulse * 0.10), 'celestial', final ? 460 : 310);
    if (final) {
      this.scene.time.delayedCall(70, () => this.ring(x, y, radius * 0.76, 'celestial', 390));
      this.celestialImpact(x, y, radius * 0.92, 1.35);
    } else {
      this.celestialImpact(x, y, radius * 0.44, 0.62);
    }
  }

  sanctuaryFirstLightSeal(x, y, radius = 218, duration = 1180) {
    const base = this.ancientCelestialSeal(x, y, radius, duration, 'sanctuary');
    const g = this.scene.add.graphics().setDepth(8448);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 38, loop: true, callback: () => {
      if (!g.active) return;
      const p = Math.min(1, (this.scene.time.now - started) / Math.max(1, duration));
      const gather = 1.18 - p * 0.18;
      const alpha = 0.28 + p * 0.60;
      g.clear();
      g.lineStyle(2.5, 0xffffff, alpha * 0.82).strokeCircle(x, y, radius * 0.92 * gather);
      g.lineStyle(2, 0xffe79a, alpha).strokeCircle(x, y, radius * 0.58 * gather);
      g.lineStyle(1.5, 0xdffcff, alpha * 0.78).strokeCircle(x, y, radius * 0.34);
      for (let i = 0; i < 16; i += 1) {
        const a = i * Math.PI / 8 - p * 0.74;
        const r0 = radius * 0.70 * gather;
        const r1 = radius * (0.82 + (i % 2) * 0.06) * gather;
        g.lineStyle(i % 4 === 0 ? 3 : 1.5, i % 3 === 0 ? 0xffffff : 0xffe79a, alpha * (i % 4 === 0 ? 0.92 : 0.68));
        g.lineBetween(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
      // Four ancient 'gate crowns' pull inward as the sanctuary prepares to bloom.
      for (let i = 0; i < 4; i += 1) {
        const a = i * Math.PI / 2 + p * 0.24;
        const cx = x + Math.cos(a) * radius * 0.48;
        const cy = y + Math.sin(a) * radius * 0.48;
        const tx = -Math.sin(a), ty = Math.cos(a);
        const rx = Math.cos(a), ry = Math.sin(a);
        g.lineStyle(2.5, 0xe9fdff, alpha * 0.86);
        g.beginPath();
        g.moveTo(cx - tx * 12, cy - ty * 12);
        g.lineTo(cx + rx * 10, cy + ry * 10);
        g.lineTo(cx + tx * 12, cy + ty * 12);
        g.lineTo(cx - rx * 4, cy - ry * 4);
        g.closePath(); g.strokePath();
      }
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    return { destroy: () => { base.destroy(); timer.remove(false); if (g.active) g.destroy(); } };
  }

  sanctuaryFirstLightField(x, y, radius = 218, duration = 5600) {
    const g = this.scene.add.graphics().setDepth(8428);
    const started = this.scene.time.now;
    const timer = this.scene.time.addEvent({ delay: 50, loop: true, callback: () => {
      if (!g.active) return;
      const elapsed = this.scene.time.now - started;
      const p = Math.min(1, elapsed / Math.max(1, duration));
      const bloom = Math.min(1, elapsed / 620);
      const r = radius * (0.14 + bloom * 0.86);
      const fade = p < 0.80 ? 1 : Math.max(0, (1 - p) / 0.20);
      const breathe = 0.86 + Math.sin(elapsed * 0.0052) * 0.10;
      const rot = elapsed * 0.00034;
      g.clear();
      g.fillStyle(0xfff3b0, 0.065 * fade * bloom).fillCircle(x, y, r * 0.96);
      g.fillStyle(0xe6fbff, 0.030 * fade * bloom).fillCircle(x, y, r * 0.63);
      g.lineStyle(4, 0xffeb9e, 0.64 * fade * breathe).strokeCircle(x, y, r);
      g.lineStyle(2, 0xffffff, 0.74 * fade).strokeCircle(x, y, r * 0.82);
      g.lineStyle(2, 0xdffcff, 0.54 * fade).strokeCircle(x, y, r * 0.61);
      g.lineStyle(2, 0xfff7d0, 0.58 * fade).strokeCircle(x, y, r * 0.39);

      // Counter-rotating celestial law geometry. These are invented glyphs,
      // deliberately not a real-world sacred alphabet or symbol set.
      for (let pass = 0; pass < 2; pass += 1) {
        const step = pass ? 7 : 8;
        const rr = r * (pass ? 0.52 : 0.72);
        const offset = rot * (pass ? -1.25 : 1) + (pass ? Math.PI / 7 : 0);
        g.lineStyle(pass ? 1.5 : 2, pass ? 0xe7fdff : 0xffe79a, (pass ? 0.42 : 0.52) * fade);
        g.beginPath();
        for (let i = 0; i <= step; i += 1) {
          const a = offset + i * Math.PI * 2 / step;
          const px = x + Math.cos(a) * rr;
          const py = y + Math.sin(a) * rr;
          if (!i) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.strokePath();
      }

      for (let i = 0; i < 16; i += 1) {
        const a = i * Math.PI / 8 + rot * (i % 2 ? -1 : 1);
        const rr = r * 0.90;
        const cx = x + Math.cos(a) * rr;
        const cy = y + Math.sin(a) * rr;
        const tx = -Math.sin(a), ty = Math.cos(a);
        const rx = Math.cos(a), ry = Math.sin(a);
        const size = 5 + (i % 4);
        g.lineStyle(i % 4 === 0 ? 2.5 : 1.5, i % 3 === 0 ? 0xffffff : 0xffe79a, (0.42 + (i % 4 === 0 ? 0.20 : 0)) * fade);
        g.beginPath();
        g.moveTo(cx + rx * size, cy + ry * size);
        g.lineTo(cx + tx * size, cy + ty * size);
        g.lineTo(cx - rx * size, cy - ry * size);
        g.lineTo(cx - tx * size, cy - ty * size);
        g.closePath(); g.strokePath();
      }

      // First-Light sun core and four winged gates make the field immediately
      // readable as Azrael's ancient holy sanctuary rather than a generic heal.
      g.fillStyle(0xffffff, 0.12 * fade * breathe).fillCircle(x, y, r * 0.18);
      g.lineStyle(3, 0xfff0ad, 0.72 * fade).strokeCircle(x, y, r * 0.20);
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI / 6 - rot * 0.72;
        g.lineStyle(i % 3 === 0 ? 3 : 1.5, i % 2 ? 0xe9fdff : 0xffe79a, 0.52 * fade);
        g.lineBetween(x + Math.cos(a) * r * 0.22, y + Math.sin(a) * r * 0.22,
          x + Math.cos(a) * r * 0.34, y + Math.sin(a) * r * 0.34);
      }
      for (let i = 0; i < 4; i += 1) {
        const a = i * Math.PI / 2 - rot * 0.34;
        const gx = x + Math.cos(a) * r * 0.48;
        const gy = y + Math.sin(a) * r * 0.48;
        const tx = -Math.sin(a), ty = Math.cos(a);
        const rx = Math.cos(a), ry = Math.sin(a);
        g.lineStyle(2.5, 0xdffcff, 0.58 * fade);
        g.beginPath();
        g.moveTo(gx, gy);
        g.lineTo(gx + tx * 16 - rx * 6, gy + ty * 16 - ry * 6);
        g.lineTo(gx + tx * 26, gy + ty * 26);
        g.lineTo(gx + tx * 13 + rx * 6, gy + ty * 13 + ry * 6);
        g.strokePath();
        g.beginPath();
        g.moveTo(gx, gy);
        g.lineTo(gx - tx * 16 - rx * 6, gy - ty * 16 - ry * 6);
        g.lineTo(gx - tx * 26, gy - ty * 26);
        g.lineTo(gx - tx * 13 + rx * 6, gy - ty * 13 + ry * 6);
        g.strokePath();
      }
      if (p >= 1) { timer.remove(false); if (g.active) g.destroy(); }
    }});
    this.ring(x, y, radius, 'celestial', 720);
    this.scene.time.delayedCall(95, () => this.ring(x, y, radius * 0.82, 'celestial', 620));
    return { destroy: () => { timer.remove(false); if (g.active) g.destroy(); } };
  }

  sanctuaryFirstLightPulse(x, y, radius = 218, pulse = 0, final = false) {
    const g = this.scene.add.graphics().setDepth(8595);
    const ringRadius = radius * (0.76 + Math.min(0.20, pulse * 0.06));
    g.fillStyle(0xfff7d0, final ? 0.21 : 0.13).fillCircle(x, y, radius * (final ? 0.34 : 0.24));
    g.lineStyle(final ? 5 : 3, 0xffffff, final ? 0.88 : 0.70).strokeCircle(x, y, radius * 0.29);
    g.lineStyle(final ? 4 : 2.5, 0xffe58b, 0.82).strokeCircle(x, y, ringRadius);
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4 + pulse * 0.12;
      const px = x + Math.cos(a) * radius * 0.66;
      const py = y + Math.sin(a) * radius * 0.66;
      const beam = radius * (0.36 + (i % 2) * 0.10);
      g.lineStyle(final ? 7 : 4, 0xffffff, final ? 0.58 : 0.38).lineBetween(px, py - beam, px, py + 5);
      g.lineStyle(2, i % 2 ? 0xdffcff : 0xffe58b, 0.88).strokeEllipse(px, py, final ? 32 : 25, final ? 11 : 8);
    }
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6 - pulse * 0.15;
      const r = radius * (0.34 + (i % 3) * 0.18);
      this.scene.time.delayedCall((i % 4) * 18, () => this.burst(
        x + Math.cos(a) * r, y + Math.sin(a) * r - 5,
        i % 4 === 0 ? 'heal' : 'celestial', final ? 0.92 : 0.70
      ));
    }
    this.scene.tweens.add({ targets: g, alpha: 0, duration: final ? 520 : 390, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.ring(x, y, radius * 0.58, 'celestial', 390);
    this.scene.time.delayedCall(55, () => this.ring(x, y, radius * 0.82, 'celestial', 470));
    this.scene.time.delayedCall(115, () => this.ring(x, y, radius, final ? 'celestial' : 'heal', final ? 560 : 500));
    this.burst(x, y - 10, 'celestial', final ? 2.15 : 1.55);
  }

  sanctuaryFirstLightBlessing(x, y, scale = 1) {
    const g = this.scene.add.graphics().setDepth(8610);
    g.lineStyle(2.5, 0xffffff, 0.88).strokeEllipse(x, y - 26, 27 * scale, 9 * scale);
    g.lineStyle(2, 0xffe58b, 0.82).strokeCircle(x, y - 10, 13 * scale);
    g.lineStyle(2, 0xdffcff, 0.74).lineBetween(x, y - 28, x, y + 5);
    g.lineStyle(1.5, 0xffffff, 0.62).lineBetween(x - 9 * scale, y - 12, x + 9 * scale, y - 12);
    this.scene.tweens.add({ targets: g, y: -10, alpha: 0, duration: 520, ease: 'Quad.out', onComplete: () => g.destroy() });
    this.burst(x, y - 14, 'celestial', 0.92 * scale);
    this.burst(x - 10 * scale, y - 4, 'heal', 0.52 * scale);
    this.burst(x + 10 * scale, y - 4, 'heal', 0.52 * scale);
  }

  heavenfallImpact(x, y, radius = 176) {
    const flash = this.scene.add.graphics().setDepth(8580);
    flash.fillStyle(0xfff7c8, 0.52).fillCircle(x, y, radius * 0.48);
    flash.lineStyle(6, 0xffffff, 0.86).lineBetween(x, y - radius * 1.1, x, y + radius * 0.28);
    flash.lineStyle(3, 0xdffcff, 0.82).lineBetween(x - 12, y - radius, x - 3, y + radius * 0.12);
    flash.lineStyle(3, 0xffe88a, 0.82).lineBetween(x + 13, y - radius, x + 4, y + radius * 0.12);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 300, ease: 'Quad.out', onComplete: () => flash.destroy() });
    this.celestialImpact(x, y, radius, 1.45);
    this.scene.time.delayedCall(85, () => this.celestialImpact(x, y, radius * 0.72, 0.9));
  }

  impact(kind, x, y) { this.burst(x, y, kind, 0.95); }
}
