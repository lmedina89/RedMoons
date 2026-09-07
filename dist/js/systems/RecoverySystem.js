import { ITEM_DEFS } from '../data/items.js';
import { CONSUMABLE_EFFECT_DEFS, QUICK_CONSUMABLE_SLOTS } from '../data/consumables.js';
import { derivedStats } from './StatsSystem.js';

export class RecoverySystem {
  constructor(scene, state, inventory, player, events) {
    this.scene = scene;
    this.state = state;
    this.inventory = inventory;
    this.player = player;
    this.events = events;
    // Keep transient recovery timing on the in-memory game state so Phaser
    // Scene.restart() map handoffs cannot reset flask/meal safety. The property
    // is deliberately non-enumerable, so SaveManager JSON never persists
    // session clocks across a browser reload or New Game.
    if (!state.__recoveryRuntime) {
      Object.defineProperty(state, '__recoveryRuntime', {
        value: { cooldowns: new Map(), lastCombatAt: -Infinity, regenCarry: 0, activeFood: null },
        writable: true, configurable: true, enumerable: false
      });
    }
    this.session = state.__recoveryRuntime;
  }

  markCombat() {
    this.session.lastCombatAt = this.scene.time.now;
    if (this.session.activeFood) {
      this.session.activeFood = null;
      this.events.emit('toast', { text: 'Meal recovery interrupted by combat.', tone: 'muted', short: true, cooldownMs: 1800 });
    }
  }

  cooldownRemaining(group, time = this.scene.time.now) {
    return Math.max(0, (this.session.cooldowns.get(group) || 0) - time);
  }

  hostileNearby(radius = 250) {
    const px = this.player.body?.x ?? 0;
    const py = this.player.body?.y ?? 0;
    return (this.scene.enemies || []).some(enemy => enemy?.sprite?.active && !enemy.dead && Math.hypot(enemy.sprite.x - px, enemy.sprite.y - py) <= radius);
  }

  findQuick(slot) {
    const quick = QUICK_CONSUMABLE_SLOTS.find(entry => entry.slot === slot);
    if (!quick) return null;
    return this.state.inventory.find(item => item.itemId === quick.itemId && (item.quantity || 1) > 0) || null;
  }

  useQuick(slot) {
    const item = this.findQuick(slot);
    if (!item) {
      const quick = QUICK_CONSUMABLE_SLOTS.find(entry => entry.slot === slot);
      this.events.emit('toast', { text: `No ${quick?.name || 'recovery item'}s left.`, tone: 'danger', short: true, cooldownMs: 1200 });
      this.scene.combat?.audio.play('denied');
      return false;
    }
    return this.useInstance(item.instanceId);
  }

  useInstance(instanceId) {
    const item = this.inventory.get(instanceId);
    const itemDef = item && ITEM_DEFS[item.itemId];
    const effect = itemDef?.consumableEffect ? CONSUMABLE_EFFECT_DEFS[itemDef.consumableEffect] : null;
    if (!item || !effect || this.player.dead) return false;
    const now = this.scene.time.now;
    const remaining = this.cooldownRemaining(effect.cooldownGroup, now);
    if (remaining > 0) {
      this.events.emit('toast', { text: `${Math.ceil(remaining / 1000)}s until that recovery is ready.`, tone: 'muted', short: true, cooldownMs: 700 });
      this.scene.combat?.audio.play('denied');
      return false;
    }
    const derived = derivedStats(this.state);
    if (effect.kind === 'heal' && this.state.player.hp >= derived.maxHp) {
      this.events.emit('toast', { text: 'HP is already full.', tone: 'muted', short: true, cooldownMs: 1000 });
      return false;
    }
    if (effect.kind === 'essence' && this.state.player.essence >= derived.maxEssence) {
      this.events.emit('toast', { text: 'Essence is already full.', tone: 'muted', short: true, cooldownMs: 1000 });
      return false;
    }
    if (effect.kind === 'food') {
      const sinceCombat = now - this.session.lastCombatAt;
      if (sinceCombat < (effect.outOfCombatMs || 0) || this.hostileNearby(250)) {
        this.events.emit('toast', { text: 'You cannot settle into a ration while fighting.', tone: 'danger', short: true, cooldownMs: 1200 });
        this.scene.combat?.audio.play('denied');
        return false;
      }
      if (this.state.player.hp >= derived.maxHp) {
        this.events.emit('toast', { text: 'HP is already full.', tone: 'muted', short: true, cooldownMs: 1000 });
        return false;
      }
    }

    if (!this.inventory.consumeOne(instanceId)) return false;
    this.session.cooldowns.set(effect.cooldownGroup, now + effect.cooldownMs);
    let message = itemDef.name;
    if (effect.kind === 'heal') {
      const before = this.state.player.hp;
      this.state.player.hp = Math.min(derived.maxHp, before + effect.amount);
      message = `${itemDef.name} • +${Math.ceil(this.state.player.hp - before)} HP`;
    } else if (effect.kind === 'essence') {
      const before = this.state.player.essence;
      this.state.player.essence = Math.min(derived.maxEssence, before + effect.amount);
      message = `${itemDef.name} • +${Math.ceil(this.state.player.essence - before)} Essence`;
    } else if (effect.kind === 'food') {
      const ticks = Math.max(1, Math.floor(effect.durationMs / effect.tickMs));
      this.session.activeFood = { itemId: item.itemId, endsAt: now + effect.durationMs, nextTickAt: now + effect.tickMs, tickMs: effect.tickMs, amountPerTick: effect.totalAmount / ticks };
      message = `${itemDef.name} • recovery started`;
    }
    this.scene.combat?.fx.burst(this.player.body.x, this.player.body.y - 16, effect.kind === 'essence' ? 'essence' : 'heal', 1.05);
    this.scene.combat?.audio.play(effect.audio || 'heal');
    this.events.emit('toast', { text: message, tone: effect.kind === 'essence' ? 'magic' : 'normal', short: true });
    this.scene.emitState?.();
    this.scene.safeSave?.();
    return true;
  }

  rest(point) {
    if (this.player.dead) return false;
    const derived = derivedStats(this.state);
    const hpMissing = Math.max(0, derived.maxHp - this.state.player.hp);
    const essenceMissing = Math.max(0, derived.maxEssence - this.state.player.essence);
    this.state.player.hp = derived.maxHp;
    this.state.player.essence = derived.maxEssence;
    this.session.activeFood = null;
    this.session.cooldowns.clear();
    this.scene.combat?.statuses.clear(this.player);
    this.scene.combat?.fx.ring(this.player.body.x, this.player.body.y, 58, 'heal', 460);
    this.scene.combat?.audio.play('rest');
    this.events.emit('toast', { text: hpMissing || essenceMissing ? `${point?.name || 'Sanctuary'} restores HP and Essence.` : `${point?.name || 'Sanctuary'} • already fully restored.`, tone: 'quest' });
    this.scene.emitState?.();
    this.scene.safeSave?.();
    return true;
  }

  update(time, delta) {
    if (this.player.dead) return;
    const derived = derivedStats(this.state);
    if (this.session.activeFood) {
      while (this.session.activeFood && time >= this.session.activeFood.nextTickAt && this.session.activeFood.nextTickAt <= this.session.activeFood.endsAt) {
        this.state.player.hp = Math.min(derived.maxHp, this.state.player.hp + this.session.activeFood.amountPerTick);
        this.session.activeFood.nextTickAt += this.session.activeFood.tickMs;
      }
      if (this.session.activeFood && time >= this.session.activeFood.endsAt) this.session.activeFood = null;
    }

    // Very slow chip-damage recovery only after a meaningful break from combat.
    // It cannot replace flasks during a fight and restores no Essence.
    if (time - this.session.lastCombatAt >= 9000 && !this.hostileNearby(250) && this.state.player.hp > 0 && this.state.player.hp < derived.maxHp) {
      this.session.regenCarry += (derived.maxHp * 0.006) * (delta / 1000);
      if (this.session.regenCarry >= 1) {
        const amount = Math.floor(this.session.regenCarry);
        this.session.regenCarry -= amount;
        this.state.player.hp = Math.min(derived.maxHp, this.state.player.hp + amount);
      }
    } else if (time - this.session.lastCombatAt < 9000) {
      this.session.regenCarry = 0;
    }
  }

  snapshot(time = this.scene.time.now) {
    const quick = QUICK_CONSUMABLE_SLOTS.map(entry => {
      const def = ITEM_DEFS[entry.itemId];
      const effect = CONSUMABLE_EFFECT_DEFS[def.consumableEffect];
      const count = this.inventory.countItem(entry.itemId);
      const remainingMs = this.cooldownRemaining(effect.cooldownGroup, time);
      return {
        slot: entry.slot, itemId: entry.itemId, label: entry.label, name: entry.name,
        count, remainingMs, cooldownMs: effect.cooldownMs,
        ready: count > 0 && remainingMs <= 0 && !this.player.dead
      };
    });
    const regenStartsInMs = Math.max(0, this.session.lastCombatAt + 9000 - time);
    return {
      quick,
      food: this.session.activeFood ? { active: true, remainingMs: Math.max(0, this.session.activeFood.endsAt - time) } : { active: false, remainingMs: 0 },
      passive: { active: regenStartsInMs <= 0 && !this.hostileNearby(250) && this.state.player.hp > 0 && this.state.player.hp < derivedStats(this.state).maxHp, startsInMs: regenStartsInMs }
    };
  }
}
