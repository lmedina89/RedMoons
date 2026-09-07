export class AudioManager {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;
    this.context = null;
    this.master = null;
    this.lastPlayed = new Map();
    this.unlockHandler = () => this.unlock();
    window.addEventListener('pointerdown', this.unlockHandler, { passive: true, capture: true });
    window.addEventListener('keydown', this.unlockHandler, { passive: true, capture: true });
  }

  unlock() {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return false;
      if (!this.context) {
        this.context = new Context();
        this.master = this.context.createGain();
        this.master.gain.value = Math.max(0, Math.min(1, this.state?.settings?.sfxVolume ?? 0.75));
        this.master.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') void this.context.resume();
      return true;
    } catch (_) { return false; }
  }

  setVolume(value) {
    if (!this.master) return;
    this.master.gain.value = Math.max(0, Math.min(1, Number(value) || 0));
  }

  play(id, options = {}) {
    const now = performance.now();
    const throttleMs = options.throttleMs ?? 55;
    if (now - (this.lastPlayed.get(id) || -Infinity) < throttleMs) return;
    this.lastPlayed.set(id, now);
    if (!this.unlock() || !this.context || !this.master) return;
    const specs = {
      sword: [175, 95, 0.07, 'sawtooth'],
      hit: [110, 72, 0.055, 'square'],
      ember_cleave: [250, 95, 0.15, 'sawtooth'],
      guard: [330, 520, 0.18, 'sine'],
      ruin_pulse: [138, 42, 0.26, 'triangle'],
      fire: [300, 145, 0.14, 'sawtooth'],
      poison: [210, 135, 0.15, 'triangle'],
      arrow: [520, 265, 0.08, 'triangle'],
      shadow: [180, 82, 0.2, 'sine'],
      slam: [90, 38, 0.22, 'square'],
      blocked: [620, 390, 0.055, 'square'],
      ready: [540, 760, 0.08, 'sine'],
      denied: [150, 110, 0.08, 'square'],
      heal: [360, 720, 0.16, 'sine'],
      essence: [280, 610, 0.17, 'sine'],
      food: [190, 260, 0.09, 'triangle'],
      rest: [240, 540, 0.24, 'sine']
    };
    const [from, to, duration, type] = specs[id] || specs.hit;
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime;
    const volume = Math.max(0.005, Math.min(0.3, options.volume ?? 0.07));
    osc.type = type;
    osc.frequency.setValueAtTime(from * (0.96 + Math.random() * 0.08), start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, to), start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain); gain.connect(this.master);
    osc.start(start); osc.stop(start + duration + 0.02);
  }

  destroy() {
    window.removeEventListener('pointerdown', this.unlockHandler, { capture: true });
    window.removeEventListener('keydown', this.unlockHandler, { capture: true });
    try { this.master?.disconnect(); } catch (_) { /* no-op */ }
    try { if (this.context && this.context.state !== 'closed') void this.context.close(); } catch (_) { /* no-op */ }
    this.context = null;
    this.master = null;
  }
}
