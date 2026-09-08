import { ENEMY_ABILITY_DEFS } from '../data/abilities.js';
import { clusterOrWorthy, threatTierOf } from '../data/powerTiers.js';
import { Enemy } from './Enemy.js';

function actorNode(actor) { return actor?.body || actor?.sprite || null; }
function alive(actor) {
  const node = actorNode(actor);
  return Boolean(actor && node && actor.dead !== true && actor.state !== 'dying' && actor.state !== 'dead' && node.active !== false);
}

export class Zerakoth extends Enemy {
  constructor(scene, group, definition, spawn, callbacks) {
    super(scene, group, definition, spawn, 0, callbacks);
    this.isSpecialActor = true;
    this.threatTier = definition.threatTier;
    this.internalLevel = definition.internalLevel;
    this.majorAbilityLockUntil = 0;
    this.debugEnabled = false;
    this.lastActionName = 'Infernal vigil';
    this.createNameplate();
    this.createDebugLabel();
  }

  createNameplate() {
    const plate = this.scene.add.rectangle(0, 0, 210, 43, 0x12050a, 0.88).setStrokeStyle(1, 0x8f1738, 0.95);
    this.nameText = this.scene.add.text(0, -14, 'ZERAKOTH', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#ff8679', fontStyle: 'bold' }).setOrigin(0.5);
    this.titleText = this.scene.add.text(0, -2, 'WARDEN OF THE PIT', { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '7px', color: '#d79aad' }).setOrigin(0.5);
    this.levelText = this.scene.add.text(0, 9, 'Lv. ??? • INFERNAL COMMANDER', { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '7px', color: '#c75f4f' }).setOrigin(0.5);
    this.healthBack = this.scene.add.rectangle(0, 18, 174, 4, 0x26060b, 0.95);
    this.healthBar = this.scene.add.rectangle(-87, 18, 174, 4, 0xb51e2e, 1).setOrigin(0, 0.5);
    this.nameplate = this.scene.add.container(this.sprite.x, this.sprite.y - 69, [plate, this.nameText, this.titleText, this.levelText, this.healthBack, this.healthBar]).setDepth(16020);
    this.updateNameplate();
  }

  createDebugLabel() {
    this.debugText = this.scene.add.text(this.sprite.x, this.sprite.y + 42, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '8px', color: '#ffd2ce',
      backgroundColor: 'rgba(18,5,10,0.88)', stroke: '#12050a', strokeThickness: 2, padding: { x: 4, y: 3 }
    }).setOrigin(0.5, 0).setDepth(16030).setVisible(false);
  }

  setDebugEnabled(enabled) {
    this.debugEnabled = Boolean(enabled);
    this.debugText?.setVisible(this.debugEnabled && this.sprite.active);
    return this.debugEnabled;
  }

  updateNameplate() {
    if (!this.nameplate) return;
    const visible = Boolean(this.sprite.active && this.state !== 'dead' && this.state !== 'dying');
    this.nameplate.setVisible(visible).setPosition(this.sprite.x, this.sprite.y - 69);
    if (visible) this.healthBar.width = 174 * Math.max(0, Math.min(1, this.hp / this.def.maxHp));
  }

  clusterCount(target, radius) {
    const center = actorNode(target);
    if (!center || !this.combat?.hostileTargetsFor) return 0;
    const rr = radius * radius;
    return this.combat.hostileTargetsFor(this).filter(other => {
      const node = actorNode(other);
      if (!alive(other) || !node) return false;
      const dx = node.x - center.x, dy = node.y - center.y;
      return dx * dx + dy * dy <= rr;
    }).length;
  }

  availableAbility(time, distance, targetNode = null) {
    for (const id of this.def.abilities || []) {
      const ability = ENEMY_ABILITY_DEFS[id];
      if (!ability || time < (this.abilityCooldowns.get(id) || 0)) continue;
      if (ability.major && time < this.majorAbilityLockUntil) continue;
      if (ability.type === 'self_guard') {
        const hpRatio = this.def.maxHp > 0 ? this.hp / this.def.maxHp : 1;
        if (hpRatio > (ability.castHpThreshold ?? 0.58)) continue;
        if (this.combat?.statuses?.has?.(this, 'guard')) continue;
        return ability;
      }
      if (distance > ability.range || distance < (ability.minRange || 0)) continue;
      if (['melee_reach', 'radial_aoe', 'targeted_aoe', 'dash_strike'].includes(ability.type) && targetNode
        && this.scene.hasWorldLineOfSight?.(this.sprite.x, this.sprite.y, targetNode.x, targetNode.y) === false) continue;
      if (ability.minCluster) {
        const cluster = this.clusterCount(this.target, ability.targetClusterRadius || ability.radius || ability.range);
        if (!clusterOrWorthy(cluster, ability.minCluster, this.target, ability.worthyTargetTier)) continue;
      }
      return ability;
    }
    return null;
  }

  beginAbility(ability, target, time) {
    super.beginAbility(ability, target, time);
    if (this.currentAbility !== ability) return;
    this.lastActionName = ability.name;
    if (ability.major) this.majorAbilityLockUntil = Math.max(this.majorAbilityLockUntil, time + (ability.majorLockMs || this.def.majorAbilityLockMs || 4000));
  }

  takeResolvedDamage(amount, sourceX, sourceY, time, context = {}) {
    const result = super.takeResolvedDamage(amount, sourceX, sourceY, time, context);
    this.updateNameplate();
    return result;
  }

  relocateForFieldTest(x, y, time = this.scene.time.now) {
    this.spawn = { ...this.spawn, x: x - 52, y: y - 52, width: 104, height: 104 };
    this.respawn(time);
    this.homeX = x; this.homeY = y;
    this.sprite.setPosition(x, y);
    this.visual?.render?.(x, y, 'idle', 0, y);
    this.updateNameplate();
  }

  update(time, delta, player, potentialTargets = null) {
    super.update(time, delta, player, potentialTargets);
    this.updateNameplate();
    if (this.debugText) {
      const targetTier = threatTierOf(this.target);
      const guard = this.combat?.statuses?.has?.(this, 'guard') ? 'ON' : 'off';
      const major = Math.max(0, this.majorAbilityLockUntil - time);
      this.debugText.setPosition(this.sprite.x, this.sprite.y + 42).setVisible(this.debugEnabled && this.sprite.active);
      if (this.debugEnabled && this.sprite.active) this.debugText.setText([
        `ZERAKOTH • Lv60 • commander • HP ${Math.ceil(this.hp)}/${this.def.maxHp}`,
        `AI ${this.state} • ${this.lastActionName}`,
        `Target ${this.target?.def?.name || this.target?.name || 'none'} • tier ${targetTier}`,
        `Ward ${guard} • major lock ${Math.ceil(major)}ms`
      ]);
    }
  }

  finishDeath() {
    super.finishDeath();
    this.nameplate?.setVisible(false);
    this.debugText?.setVisible(false);
  }

  snapshot(time = this.scene.time.now) {
    if (!this.sprite.active && this.state === 'dead') return { name: this.def.name, title: this.def.title, hp: 0, maxHp: this.def.maxHp, dead: true, internalLevel: 60, threatTier: 'commander' };
    return {
      name: this.def.name,
      title: this.def.title,
      levelDisplay: this.def.levelDisplay,
      internalLevel: this.def.internalLevel,
      threatTier: this.def.threatTier,
      hp: Math.max(0, Math.ceil(this.hp)),
      maxHp: this.def.maxHp,
      state: this.state,
      action: this.lastActionName,
      target: this.target?.def?.name || this.target?.name || null,
      guard: Boolean(this.combat?.statuses?.has?.(this, 'guard')),
      majorLockRemainingMs: Math.max(0, this.majorAbilityLockUntil - time),
      debug: this.debugEnabled
    };
  }

  destroy() {
    this.clearAbility?.();
    this.sprite?.destroy?.();
    for (const layer of this.visual?.layers?.values?.() || []) layer.sprite?.destroy?.();
    this.nameplate?.destroy?.(true);
    this.debugText?.destroy?.();
  }
}
