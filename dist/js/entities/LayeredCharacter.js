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
    this.layerOrder = ['weaponBg', 'shieldBg', 'body', 'feet', 'legs', 'chest', 'hands', 'head', 'hair', 'shieldFg', 'weaponFg'];
    for (let i = 0; i < this.layerOrder.length; i += 1) {
      const key = this.layerOrder[i];
      const sprite = scene.add.sprite(x, y, 'body-walk', 18).setScale(scale).setOrigin(0.5, 0.69);
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
    this.setAsset('feet', visual('feet'));
    this.setAsset('legs', visual('legs'));
    this.setAsset('chest', visual('chest'));
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
    layer.asset = assetKey ? LAYER_ASSETS[assetKey] : null;
    layer.sprite.setVisible(Boolean(layer.asset)).setFlipX(false);
  }

  setFacing(dx, dy) {
    if (!dx && !dy) return;
    if (Math.abs(dx) > Math.abs(dy)) this.direction = dx < 0 ? 1 : 3;
    else this.direction = dy < 0 ? 0 : 2;
  }

  render(x, y, stateName, frame, baseDepth) {
    this.x = x;
    this.y = y;
    const action = stateName === 'slash' ? 'slash' : stateName === 'idle' ? 'idle' : 'walk';
    for (const layer of this.layers.values()) {
      if (!layer.asset) continue;
      const asset = layer.asset;
      const geometry = ANIMATION_GEOMETRIES[asset.geometry];
      const animation = geometry?.[action];
      if (!animation) { layer.sprite.setVisible(false); continue; }
      const texture = asset[animation.source];
      if (!texture) { layer.sprite.setVisible(false); continue; }
      const row = animation.rows[this.direction];
      const maxFrame = Math.max(0, animation.frames - 1);
      const frameIndex = row * animation.stride + Math.min(maxFrame, action === 'idle' ? 0 : frame);
      const mirrored = Boolean(animation.mirror?.[this.direction]);
      layer.sprite.setVisible(true).setTexture(texture).setFrame(frameIndex).setFlipX(mirrored);
      layer.sprite.setPosition(x, y).setDepth(baseDepth + layer.order * 0.001);
      if (asset.geometry === 'dcssSword128') layer.sprite.setOrigin(0.5, 0.595).setScale(this.scale);
      else layer.sprite.setOrigin(0.5, 0.69).setScale(this.scale);
    }
  }

  setAlpha(value) { for (const layer of this.layers.values()) layer.sprite.setAlpha(value); }
  setTint(color) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setTint(color); }
  clearTint() { for (const layer of this.layers.values()) layer.sprite.clearTint(); }
  setVisible(value) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setVisible(value); }
  destroy() { for (const layer of this.layers.values()) layer.sprite.destroy(); }
}
