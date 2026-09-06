import { LAYER_ASSETS } from '../data/assets.js';
import { ITEM_DEFS } from '../data/items.js';

const CLASSIC = { walkColumns: 9, slashColumns: 6, walkRowBase: 0, slashRowBase: 0 };
const EXPANDED = { walkColumns: 13, slashColumns: 13, walkRowBase: 8, slashRowBase: 12 };

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
    layer.sprite.setVisible(Boolean(layer.asset));
  }

  setFacing(dx, dy) {
    if (!dx && !dy) return;
    if (Math.abs(dx) > Math.abs(dy)) this.direction = dx < 0 ? 1 : 3;
    else this.direction = dy < 0 ? 0 : 2;
  }

  render(x, y, stateName, frame, baseDepth) {
    this.x = x;
    this.y = y;
    for (const layer of this.layers.values()) {
      if (!layer.asset) continue;
      const asset = layer.asset;
      const action = stateName === 'slash' ? 'slash' : 'walk';
      const texture = asset.texture || asset[action];
      if (!texture) { layer.sprite.setVisible(false); continue; }
      layer.sprite.setVisible(true).setTexture(texture);
      const expanded = asset.geometry === 'expanded64' || asset.geometry === 'oversized128';
      const geometry = expanded ? EXPANDED : CLASSIC;
      const row = (action === 'slash' ? geometry.slashRowBase : geometry.walkRowBase) + this.direction;
      const columns = action === 'slash' ? geometry.slashColumns : geometry.walkColumns;
      const maxFrame = action === 'slash' ? 5 : 8;
      layer.sprite.setFrame(row * columns + Math.min(maxFrame, frame));
      layer.sprite.setPosition(x, y).setDepth(baseDepth + layer.order * 0.001);
      if (asset.geometry === 'oversized128') layer.sprite.setOrigin(0.5, 0.595).setScale(this.scale);
      else layer.sprite.setOrigin(0.5, 0.69).setScale(this.scale);
    }
  }

  setAlpha(value) { for (const layer of this.layers.values()) layer.sprite.setAlpha(value); }
  setTint(color) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setTint(color); }
  clearTint() { for (const layer of this.layers.values()) layer.sprite.clearTint(); }
  setVisible(value) { for (const layer of this.layers.values()) if (layer.asset) layer.sprite.setVisible(value); }
  destroy() { for (const layer of this.layers.values()) layer.sprite.destroy(); }
}

