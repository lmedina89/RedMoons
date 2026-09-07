import { ANIMATION_GEOMETRIES, LAYER_ASSETS } from '../data/assets.js';
import { ITEM_DEFS } from '../data/items.js';
import { AnimationResolver } from '../systems/AnimationResolver.js';

const ROOT_X = Object.freeze({
  slash: Object.freeze([[0,0,0,0,-1,-1],[0,2,1,1,1,1],[0,0,1,-1,-1,-1],[0,-2,-1,-1,-1,-1]]),
  slash1h: Object.freeze([[-1,0,1,1,1,1,0],[-2,1,3,3,3,3,1],[0,0,-3,-3,-3,-3,0],[2,-1,-3,-3,-3,-3,-1]]),
  backslash1h: Object.freeze([[-1,0,1,1,1,1,1,0,0,-1,-1,-1],[-2,1,3,3,3,3,3,2,-1,-1,-1,-1],[0,0,-3,-3,-3,-3,-3,-3,0,0,0,0],[2,-1,-3,-3,-3,-3,-3,-2,1,1,1,1]]),
  halfslash1h: Object.freeze([[-1,0,0,0,0,0],[-2,1,5,6,6,1],[0,0,-1,-1,-1,0],[2,-1,-5,-6,-6,-1]])
});

export function createActorEquipmentState(loadout = {}) {
  const equipment = { head: null, shoulders: null, chest: null, legs: null, hands: null, feet: null, weapon: null, offhand: null, wings: null };
  const inventory = [];
  let n = 0;
  for (const [slot, itemId] of Object.entries(loadout || {})) {
    if (!itemId || !ITEM_DEFS[itemId] || !Object.prototype.hasOwnProperty.call(equipment, slot)) continue;
    const instanceId = `actor_${slot}_${n++}`;
    inventory.push({ instanceId, itemId, rarity: 'normal', enhancement: 0, modifiers: {} });
    equipment[slot] = instanceId;
  }
  return { inventory, equipment };
}

export class LayeredCharacter {
  constructor(scene, x, y, state, scale = 1.45, options = {}) {
    this.scene = scene;
    this.state = state;
    this.scale = scale;
    this.x = x;
    this.y = y;
    this.direction = 2;
    this.baseAsset = options.baseAsset || 'player_red_base';
    this.hairAsset = options.hairAsset || null;
    this.equipmentPolicy = options.equipmentPolicy || 'player';
    this.layers = new Map();
    this.layerOrder = ['wings', 'weaponBg', 'shieldBg', 'body', 'feet', 'legs', 'chest', 'shoulders', 'hands', 'head', 'hair', 'shieldFg', 'weaponFg'];
    for (let i = 0; i < this.layerOrder.length; i += 1) {
      const key = this.layerOrder[i];
      const sprite = scene.add.sprite(x, y, 'solid').setScale(scale).setOrigin(0.5, 0.69);
      sprite.setVisible(false);
      this.layers.set(key, { sprite, asset: null, order: i });
    }
    this.refreshEquipment();
  }

  refreshEquipment(nextState = null) {
    if (nextState) this.state = nextState;
    const byId = new Map((this.state?.inventory || []).map(item => [item.instanceId, item]));
    const visual = slot => {
      const item = byId.get(this.state?.equipment?.[slot]);
      const def = item ? ITEM_DEFS[item.itemId] : null;
      if (!def) return null;
      if (this.equipmentPolicy === 'player') {
        if (def.playerEquipReady === false || def.npcOnly) return null;
        if (slot === 'weapon' && def.playerCombatReady === false) return null;
        // Some saved low-level item IDs are shared with NPC loadouts. Player-only
        // revised-combo art keeps those IDs/save semantics intact without forcing
        // revised player geometry onto classic NPC/skeleton renderers.
        return def.playerVisual || def.visual || null;
      }
      return def.visual || null;
    };
    this.setAsset('body', this.baseAsset);
    this.setAsset('wings', visual('wings'));
    this.setAsset('feet', visual('feet'));
    this.setAsset('legs', visual('legs'));
    this.setAsset('chest', visual('chest'));
    this.setAsset('shoulders', visual('shoulders'));
    this.setAsset('hands', visual('hands'));
    this.setAsset('head', visual('head'));
    this.setAsset('hair', this.hairAsset);
    const weapon = visual('weapon');
    this.setAsset('weaponBg', weapon ? `${weapon}_bg` : null);
    this.setAsset('weaponFg', weapon ? `${weapon}_fg` : null);
    const shield = visual('offhand');
    this.setAsset('shieldBg', shield ? `${shield}_bg` : null);
    this.setAsset('shieldFg', shield ? `${shield}_fg` : null);
  }

  setAsset(layerKey, assetKey) {
    const layer = this.layers.get(layerKey);
    layer.asset = assetKey ? LAYER_ASSETS[assetKey] || null : null;
    layer.sprite.setVisible(Boolean(layer.asset)).setFlipX(false);
  }

  setFacing(dx, dy) {
    if (!dx && !dy) return;
    if (Math.abs(dx) > Math.abs(dy)) this.direction = dx < 0 ? 1 : 3;
    else this.direction = dy < 0 ? 0 : 2;
  }

  resolveAnimation(asset, requestedAction, layerKey = '') {
    const geometry = ANIMATION_GEOMETRIES[asset.geometry];
    return AnimationResolver.resolve(asset, geometry, requestedAction, layerKey);
  }

  render(x, y, stateName, frameStep, baseDepth, frameProgress = null) {
    this.x = x;
    this.y = y;
    const requestedAction = stateName || 'idle';
    const rootFrames = ROOT_X[requestedAction]?.[this.direction];
    const rootX = rootFrames ? (rootFrames[Math.max(0, Math.min(rootFrames.length - 1, frameStep || 0))] || 0) * this.scale : 0;
    for (const [layerKey, layer] of this.layers.entries()) {
      if (!layer.asset) continue;
      const asset = layer.asset;
      const resolved = this.resolveAnimation(asset, requestedAction, layerKey);
      if (!resolved) { layer.sprite.setVisible(false); continue; }
      const { animation } = resolved;
      const texture = asset[animation.source];
      if (!texture) { layer.sprite.setVisible(false); continue; }
      const row = animation.rows[this.direction];
      const sequence = animation.sequence || [0];
      const fallbackProgress = frameProgress !== null && resolved.action !== requestedAction;
      const rawStep = fallbackProgress
        ? Math.floor(Math.max(0, Math.min(0.999999, frameProgress)) * sequence.length)
        : (frameStep || 0);
      const step = Math.max(0, Math.min(sequence.length - 1, rawStep));
      const sourceFrame = sequence[step];
      const frameIndex = row * animation.stride + sourceFrame;
      const mirrored = Boolean(animation.mirror?.[this.direction]);
      layer.sprite.setVisible(true).setTexture(texture).setFrame(frameIndex).setFlipX(mirrored);
      layer.sprite.setPosition(x + rootX, y).setDepth(baseDepth + layer.order * 0.001);
      const oversized = asset.oversizedSources?.includes(animation.source) || asset.geometry === 'dcssSword128';
      if (oversized) layer.sprite.setOrigin(0.5, 0.595).setScale(this.scale);
      else layer.sprite.setOrigin(0.5, 0.69).setScale(this.scale);
    }
  }

  missingTextureKeys(requestedAction = 'idle') {
    const missing = [];
    for (const [layerKey, layer] of this.layers.entries()) {
      if (!layer.asset) continue;
      const resolved = this.resolveAnimation(layer.asset, requestedAction, layerKey);
      if (!resolved) continue;
      const textureKey = layer.asset[resolved.animation.source];
      if (textureKey && !this.scene.textures.exists(textureKey)) missing.push(textureKey);
    }
    return [...new Set(missing)];
  }

  restore(x = this.x, y = this.y, baseDepth = y) {
    this.refreshEquipment();
    this.setAlpha(1);
    this.clearTint();
    this.render(x, y, 'idle', 0, baseDepth);
    return this.missingTextureKeys('idle');
  }

  setAlpha(value) { for (const layer of this.layers.values()) layer.sprite.setAlpha(value); }
  setTint(color) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setTint(color); }
  setTintFill(color) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setTintFill(color); }
  clearTint() { for (const layer of this.layers.values()) layer.sprite.clearTint(); }
  setVisible(value) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setVisible(value); }
  destroy() { for (const layer of this.layers.values()) layer.sprite.destroy(); }
}
