import { worldEventsForMap } from '../data/exploration.js';

export class WorldEventSystem {
  constructor(scene, state, eventBus) {
    this.scene = scene;
    this.state = state;
    this.eventBus = eventBus;
    this.events = worldEventsForMap(scene.currentMap.id);
    this.triggeredThisVisit = new Set();
    this.cooldowns = new Map();
    this.nextCheckAt = 0;
  }

  update(time) {
    if (time < this.nextCheckAt || !this.events.length || !this.scene.player?.body) return;
    this.nextCheckAt = time + 220;
    const px = this.scene.player.body.x;
    const py = this.scene.player.body.y;
    for (const event of this.events) {
      if (event.oncePerVisit && this.triggeredThisVisit.has(event.id)) continue;
      if (time < (this.cooldowns.get(event.id) || 0)) continue;
      const dx = px - event.x;
      const dy = py - event.y;
      if (dx * dx + dy * dy > event.radius * event.radius) continue;
      const fired = this.scene.triggerWorldEvent?.(event) !== false;
      if (!fired) continue;
      this.triggeredThisVisit.add(event.id);
      if (event.cooldownMs) this.cooldowns.set(event.id, time + event.cooldownMs);
      if (event.text) this.eventBus.emit('toast', { text: event.text, tone: 'muted', short: true });
    }
  }
}
