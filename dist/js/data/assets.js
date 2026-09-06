const P = 'assets/player/';
const E = 'assets/enemies/';
const W = 'assets/world/';

export const ASSET_DEFS = [
  { key: 'body-walk', path: `${P}body-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'body-slash', path: `${P}body-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'hair-walk', path: `${P}hair-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'hair-slash', path: `${P}hair-slash.png`, frameWidth: 64, frameHeight: 64 },
  ...['shirt', 'leather', 'plate-chest', 'pants', 'plate-legs', 'shoes', 'plate-feet', 'bracers', 'plate-hands', 'chain-head', 'plate-head'].flatMap(key => [
    { key: `${key}-walk`, path: `${P}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-slash`, path: `${P}${key}-slash.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  { key: 'long-sword-bg', path: `${P}long-sword-bg.png`, frameWidth: 128, frameHeight: 128, oversized: true },
  { key: 'long-sword-fg', path: `${P}long-sword-fg.png`, frameWidth: 128, frameHeight: 128, oversized: true },
  { key: 'wood-shield-bg', path: `${P}wood-shield-bg.png`, frameWidth: 64, frameHeight: 64, expanded: true },
  { key: 'wood-shield-fg', path: `${P}wood-shield-fg.png`, frameWidth: 64, frameHeight: 64, expanded: true },
  { key: 'imp-walk', path: `${E}imp-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'imp-attack', path: `${E}imp-attack.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'imp-death', path: `${E}imp-death.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'skeleton-walk', path: `${E}skeleton-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'skeleton-slash', path: `${E}skeleton-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'terrain-dirt', path: `${W}dirt.png`, image: true },
  { key: 'grass-dirt', path: `${W}grass-dirt.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'rocks-cliffs', path: `${W}rocks-cliffs.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'rocks-grass', path: `${W}rocks-grasslands.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'tree-trunks', path: `${W}tree-trunks.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'tall-grass', path: `${W}tall-grass.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'bridge', path: `${W}bridge.png`, image: true },
  { key: 'dungeon-elements', path: `${W}dungeon-elements.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'fire', path: `${W}fire.png`, frameWidth: 32, frameHeight: 64 }
];

// All rows are expressed in the source spritesheet's real frame grid.
// Direction order matches the rest of Ashfall: up, left, down, right.
export const ANIMATION_GEOMETRIES = Object.freeze({
  classic: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: [0, 1, 2, 3], stride: 9, frames: 1 }),
    walk: Object.freeze({ source: 'walk', rows: [0, 1, 2, 3], stride: 9, frames: 9 }),
    slash: Object.freeze({ source: 'slash', rows: [0, 1, 2, 3], stride: 6, frames: 6 })
  }),
  expanded64: Object.freeze({
    idle: Object.freeze({ source: 'texture', rows: [8, 9, 10, 11], stride: 13, frames: 1 }),
    walk: Object.freeze({ source: 'texture', rows: [8, 9, 10, 11], stride: 13, frames: 9 }),
    slash: Object.freeze({ source: 'texture', rows: [12, 13, 14, 15], stride: 13, frames: 6 })
  }),
  dcssSword128: Object.freeze({
    // The DCSS sword source is not an Expanded LPC 4-row block. It stores
    // up / left / down and mirrors the left-facing side row for right.
    idle: Object.freeze({ source: 'texture', rows: [6, 7, 8, 7], stride: 13, frames: 1, mirror: [false, false, false, true] }),
    walk: Object.freeze({ source: 'texture', rows: [6, 7, 8, 7], stride: 13, frames: 9, mirror: [false, false, false, true] }),
    slash: Object.freeze({ source: 'texture', rows: [9, 10, 11, 10], stride: 13, frames: 6, mirror: [false, false, false, true] })
  })
});

export const LAYER_ASSETS = Object.freeze({
  body: { walk: 'body-walk', slash: 'body-slash', geometry: 'classic' },
  hair: { walk: 'hair-walk', slash: 'hair-slash', geometry: 'classic' },
  chest_wayfarer: { walk: 'shirt-walk', slash: 'shirt-slash', geometry: 'classic' },
  chest_leather: { walk: 'leather-walk', slash: 'leather-slash', geometry: 'classic' },
  chest_plate: { walk: 'plate-chest-walk', slash: 'plate-chest-slash', geometry: 'classic' },
  legs_ash: { walk: 'pants-walk', slash: 'pants-slash', geometry: 'classic' },
  legs_plate: { walk: 'plate-legs-walk', slash: 'plate-legs-slash', geometry: 'classic' },
  feet_road: { walk: 'shoes-walk', slash: 'shoes-slash', geometry: 'classic' },
  feet_plate: { walk: 'plate-feet-walk', slash: 'plate-feet-slash', geometry: 'classic' },
  hands_hide: { walk: 'bracers-walk', slash: 'bracers-slash', geometry: 'classic' },
  hands_plate: { walk: 'plate-hands-walk', slash: 'plate-hands-slash', geometry: 'classic' },
  head_chain: { walk: 'chain-head-walk', slash: 'chain-head-slash', geometry: 'classic' },
  head_plate: { walk: 'plate-head-walk', slash: 'plate-head-slash', geometry: 'classic' },
  weapon_long_sword_bg: { texture: 'long-sword-bg', geometry: 'dcssSword128' },
  weapon_long_sword_fg: { texture: 'long-sword-fg', geometry: 'dcssSword128' },
  shield_wood_bg: { texture: 'wood-shield-bg', geometry: 'expanded64' },
  shield_wood_fg: { texture: 'wood-shield-fg', geometry: 'expanded64' }
});
