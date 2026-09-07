import { ANIMATION_GEOMETRIES, LAYER_ASSETS } from '../data/assets.js';
import { ITEM_DEFS } from '../data/items.js';

export class LayeredCharacter {
  constructor(scene, x, y, state, scale = 1.45) {
    this.scene = scene;
    this.state = state;
    this.scale = scale;
    this.x = x;
    this.y = y;
    this.direction = 2;
    this.layers = new Map();
    this.layerOrder = ['wings', 'weaponBg', 'shieldBg', 'body', 'feet', 'legs', 'chest', 'shoulders', 'hands', 'head', 'hair', 'shieldFg', 'weaponFg'];
    for (let i = 0; i < this.layerOrder.length; i += 1) {
      const key = this.layerOrder[i];
      const sprite = scene.add.sprite(x, y, 'revised-body-walk', 18).setScale(scale).setOrigin(0.5, 0.69);
      sprite.setVisible(false);
      this.layers.set(key, { sprite, asset: null, order: i });
    }
    this.refreshEquipment();
  }

  refreshEquipment() {
    const byId = new Map(this.state.inventory.map(item => [item.instanceId, item]));
    const visual = slot => {
      const item = byId.get(this.state.equipment[slot]);
      return item ? ITEM_DEFS[item.itemId]?.visual : null;
    };
    this.setAsset('body', 'body');
    this.setAsset('wings', visual('wings'));
    this.setAsset('feet', visual('feet'));
    this.setAsset('legs', visual('legs'));
    this.setAsset('chest', visual('chest'));
    this.setAsset('shoulders', visual('shoulders'));
    this.setAsset('hands', visual('hands'));
    const head = visual('head');
    this.setAsset('head', head);
    this.setAsset('hair', head ? null : 'hair');
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

  resolveAnimation(asset, requestedAction) {
    const geometry = ANIMATION_GEOMETRIES[asset.geometry];
    if (!geometry) return null;
    if (geometry[requestedAction]) return { geometry, animation: geometry[requestedAction], action: requestedAction };
    if (asset.attackFallback && !['idle', 'walk'].includes(requestedAction) && geometry[asset.attackFallback]) {
      return { geometry, animation: geometry[asset.attackFallback], action: asset.attackFallback };
    }
    return null;
  }

  render(x, y, stateName, frameStep, baseDepth, frameProgress = null) {
    this.x = x;
    this.y = y;
    const requestedAction = stateName || 'idle';
    for (const layer of this.layers.values()) {
      if (!layer.asset) continue;
      const asset = layer.asset;
      const resolved = this.resolveAnimation(asset, requestedAction);
      if (!resolved) { layer.sprite.setVisible(false); continue; }
      const { animation } = resolved;
      const texture = asset[animation.source];
      if (!texture) { layer.sprite.setVisible(false); continue; }
      const row = animation.rows[this.direction];
      const sequence = animation.sequence || [0];
      // Full-coverage layers use the exact source step. Limited armor uses an
      // explicit fallback attack, so scale that fallback across the *whole*
      // requested swing instead of racing to its last frame and freezing.
      const fallbackProgress = frameProgress !== null && resolved.action !== requestedAction;
      const rawStep = fallbackProgress
        ? Math.floor(Math.max(0, Math.min(0.999999, frameProgress)) * sequence.length)
        : (frameStep || 0);
      const step = Math.max(0, Math.min(sequence.length - 1, rawStep));
      const sourceFrame = sequence[step];
      const frameIndex = row * animation.stride + sourceFrame;
      const mirrored = Boolean(animation.mirror?.[this.direction]);
      layer.sprite.setVisible(true).setTexture(texture).setFrame(frameIndex).setFlipX(mirrored);
      layer.sprite.setPosition(x, y).setDepth(baseDepth + layer.order * 0.001);
      const oversized = asset.oversizedSources?.includes(animation.source) || asset.geometry === 'dcssSword128';
      if (oversized) layer.sprite.setOrigin(0.5, 0.595).setScale(this.scale);
      else layer.sprite.setOrigin(0.5, 0.69).setScale(this.scale);
    }
  }

  setAlpha(value) { for (const layer of this.layers.values()) layer.sprite.setAlpha(value); }
  setTint(color) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setTint(color); }
  clearTint() { for (const layer of this.layers.values()) layer.sprite.clearTint(); }
  setVisible(value) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setVisible(value); }
  destroy() { for (const layer of this.layers.values()) layer.sprite.destroy(); }
}
