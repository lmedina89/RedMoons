const P = 'assets/player/';
const R = 'assets/player/revised/';
const E = 'assets/enemies/';
const W = 'assets/world/';

export const ASSET_DEFS = [
  // Original v0.1.x modular LPC layers retained for backwards-compatible gear.
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

  // v0.1.1.1 LPC Revised runtime crops. Only the animation regions actually
  // used by gameplay are preloaded, avoiding the cost of loading every full
  // 832x3456 generator export on mobile GPUs.
  { key: 'revised-body-walk', path: `${R}body-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'revised-body-slash', path: `${R}body-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'revised-body-backslash', path: `${R}body-backslash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'revised-body-halfslash', path: `${R}body-halfslash.png`, frameWidth: 64, frameHeight: 64 },
  ...['protagonist-red', 'npc-olive'].flatMap(key => [
    { key: `${key}-walk`, path: `${R}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-slash`, path: `${R}${key}-slash.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-backslash`, path: `${R}${key}-backslash.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-halfslash`, path: `${R}${key}-halfslash.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  // v0.1.3 expanded LPC action crops. Only the player base and the
  // verified starter clothing set claim these actions; other gear falls back
  // safely through AnimationResolver until it receives its own migration.
  ...['protagonist-red', 'legion-chest', 'leather-boots', 'starter-trousers', 'starter-wraps'].flatMap(key => [
    { key: `${key}-spellcast`, path: `${R}${key}-spellcast.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-thrust`, path: `${R}${key}-thrust.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-shoot`, path: `${R}${key}-shoot.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-hurt`, path: `${R}${key}-hurt.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  // v0.1.3.1 true-run crops from the verified Expanded ULPC run block.
  ...['protagonist-red', 'legion-chest', 'leather-boots', 'starter-trousers', 'starter-wraps'].map(key =>
    ({ key: `${key}-run`, path: `${R}${key}-run.png`, frameWidth: 64, frameHeight: 64 })
  ),
  // v0.1.2.4.3 combo-safe starter trouser overlay. It is derived from the
  // exact revised player poses, so beginner clothing no longer shifts when the
  // sword combo changes from slash to one-handed/backslash/halfslash actions.
  ...['walk', 'slash', 'backslash', 'halfslash'].flatMap(action => [
    { key: `starter-trousers-${action}`, path: `${R}starter-trousers-${action}.png`, frameWidth: 64, frameHeight: 64 },
    { key: `starter-wraps-${action}`, path: `${R}starter-wraps-${action}.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  ...['legion-chest', 'legion-gloves', 'iron-helmet', 'red-bat-wings', 'bronze-helmet', 'leather-shoulders', 'leather-boots', 'silver-legion', 'steel-plate'].flatMap(key => [
    { key: `${key}-walk`, path: `${R}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-slash`, path: `${R}${key}-slash.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-backslash`, path: `${R}${key}-backslash.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-halfslash`, path: `${R}${key}-halfslash.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  ...['boots', 'shoulders'].flatMap(key => [
    { key: `${key}-walk`, path: `${R}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-slash`, path: `${R}${key}-slash.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  { key: 'arming-sword-walk', path: `${R}arming-sword-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'arming-sword-slash', path: `${R}arming-sword-slash.png`, frameWidth: 128, frameHeight: 128, oversized: true },
  { key: 'arming-sword-backslash', path: `${R}arming-sword-backslash.png`, frameWidth: 128, frameHeight: 128, oversized: true },
  { key: 'arming-sword-halfslash', path: `${R}arming-sword-halfslash.png`, frameWidth: 128, frameHeight: 128, oversized: true },
  ...['iron-arming-sword', 'brass-arming-sword', 'bronze-arming-sword', 'copper-arming-sword', 'steel-arming-sword', 'gold-arming-sword', 'ceramic-arming-sword'].flatMap(key => [
    { key: `${key}-walk`, path: `${R}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-slash`, path: `${R}${key}-slash.png`, frameWidth: 128, frameHeight: 128, oversized: true },
    { key: `${key}-backslash`, path: `${R}${key}-backslash.png`, frameWidth: 128, frameHeight: 128, oversized: true },
    { key: `${key}-halfslash`, path: `${R}${key}-halfslash.png`, frameWidth: 128, frameHeight: 128, oversized: true }
  ]),
  { key: 'katana-walk', path: `${R}katana-walk.png`, frameWidth: 128, frameHeight: 128, oversized: true },
  { key: 'katana-slash', path: `${R}katana-slash.png`, frameWidth: 128, frameHeight: 128, oversized: true },

  { key: 'imp-walk', path: `${E}imp-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'imp-attack', path: `${E}imp-attack.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'imp-death', path: `${E}imp-death.png`, frameWidth: 64, frameHeight: 64 },

  // v0.1.2.3 curated Imp color/loadout variants. Each family rolls one
  // presentation per spawn instead of loading the entire source pack into play.
  ...[
    'imp-red-sword', 'imp-red-sword-shield', 'imp-red-pitchfork',
    'imp-green-pitchfork', 'imp-green-pitchfork-shield', 'imp-green-sword',
    'imp-blue-sword', 'imp-blue-sword-shield', 'imp-blue-pitchfork'
  ].flatMap(key => [
    { key: `${key}-walk`, path: `${E}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-attack`, path: `${E}${key}-attack.png`, frameWidth: 64, frameHeight: 64 }
  ]),

  { key: 'goblin-walk', path: `${E}goblin-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'goblin-attack', path: `${E}goblin-attack.png`, frameWidth: 64, frameHeight: 64 },

  // v0.1.4.2 compact hostile-faction crops harvested from preserved 832×3456
  // source sheets. The authoring sheets remain source-only; runtime receives
  // only the walk/slash blocks used by the generic Enemy controller.
  { key: 'ash-assassin-walk', path: `${E}hostile-human/ash-assassin-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'ash-assassin-slash', path: `${E}hostile-human/ash-assassin-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'demon-scout-walk', path: `${E}demon/demon-scout-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'demon-scout-slash', path: `${E}demon/demon-scout-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'hellfire-demon-walk', path: `${E}demon/hellfire-demon-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'hellfire-demon-slash', path: `${E}demon/hellfire-demon-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'ashbone-demon-walk', path: `${E}demon/ashbone-demon-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'ashbone-demon-slash', path: `${E}demon/ashbone-demon-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'fleshborn-demon-walk', path: `${E}demon/fleshborn-demon-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'fleshborn-demon-slash', path: `${E}demon/fleshborn-demon-slash.png`, frameWidth: 64, frameHeight: 64 },
  // v0.1.4.2.3 common celestial runtime crops. BaseAngel remains a reusable
  // layered celestial body/wings source; HeavenlyKnight is a baked heavy guard.
  { key: 'base-angel-walk', path: `${E}celestial/base-angel-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'base-angel-slash', path: `${E}celestial/base-angel-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'heavenly-knight-walk', path: `${E}celestial/heavenly-knight-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'heavenly-knight-slash', path: `${E}celestial/heavenly-knight-slash.png`, frameWidth: 64, frameHeight: 64 },
  ...['cave-spider', 'ember-spider', 'frost-spider', 'mire-spider'].flatMap(key => [
    { key: `${key}-walk`, path: `${E}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-attack`, path: `${E}${key}-attack.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  { key: 'golem-walk', path: `${E}golem-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'golem-attack', path: `${E}golem-attack.png`, frameWidth: 64, frameHeight: 96 },
  { key: 'golem-death', path: `${E}golem-death.png`, frameWidth: 64, frameHeight: 64 },

  // v0.1.3.2.3 ArchAngel Azrael celestial-expansion runtime crops. The original
  // 832x3456 user-supplied ULPC expanded sheet remains in source-assets; only
  // the action blocks used by his live AI are uploaded to the mobile GPU.
  ...[
    ['spellcast', 7], ['thrust', 8], ['slash', 6], ['shoot', 13],
    ['idle', 2], ['jump', 5], ['emote', 3], ['run', 8],
    ['combat-idle', 2], ['backslash', 13], ['halfslash', 6]
  ].map(([action, frames]) => ({
    key: `azrael-${action}`, path: `assets/npcs/azrael/azrael-${action}.png`,
    frameWidth: 64, frameHeight: 64, frames
  })),
  { key: 'azrael-hurt', path: 'assets/npcs/azrael/azrael-hurt.png', frameWidth: 64, frameHeight: 64, frames: 6 },

  { key: 'skeleton-walk', path: `${E}skeleton-walk.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'skeleton-slash', path: `${E}skeleton-slash.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'skeleton-bow-shoot', path: `${E}skeleton-bow-shoot.png`, frameWidth: 64, frameHeight: 64 },
  { key: 'skeleton-spear-thrust', path: `${E}skeleton-spear-thrust.png`, frameWidth: 192, frameHeight: 192, oversized: true },
  ...['skeleton', 'slate-skeleton'].flatMap(key => [
    { key: `${key}-spellcast`, path: `${E}${key}-spellcast.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-thrust`, path: `${E}${key}-thrust.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-shoot`, path: `${E}${key}-shoot.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-hurt`, path: `${E}${key}-hurt.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  ...['beast-zombie', 'rotwing-zombie', 'slate-skeleton', 'blood-skeleton', 'gilded-skeleton'].flatMap(key => [
    { key: `${key}-walk`, path: `${E}${key}-walk.png`, frameWidth: 64, frameHeight: 64 },
    { key: `${key}-slash`, path: `${E}${key}-slash.png`, frameWidth: 64, frameHeight: 64 }
  ]),
  { key: 'terrain-dirt', path: `${W}dirt.png`, image: true },
  { key: 'grass-dirt', path: `${W}grass-dirt.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'rocks-cliffs', path: `${W}rocks-cliffs.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'rocks-grass', path: `${W}rocks-grasslands.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'tree-trunks', path: `${W}tree-trunks.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'tall-grass', path: `${W}tall-grass.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'bridge', path: `${W}bridge.png`, image: true },
  { key: 'dungeon-elements', path: `${W}dungeon-elements.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'fire', path: `${W}fire.png`, frameWidth: 32, frameHeight: 64 },
  { key: 'castle2-set', path: `${W}castle2-set.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'adobe2-set', path: `${W}adobe2-set.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'mushrooms', path: `${W}mushrooms.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'bush-evergreen', path: `${W}bush-evergreen.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'bush-seasonal', path: `${W}bush-seasonal.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'pine-tree-large', path: `${W}pine-tree-large.png`, image: true },
  { key: 'pine-tree-cluster', path: `${W}pine-tree-cluster.png`, image: true },
  // Map-specific assets are resolved by the asset loader. Cave3 is now a
  // runtime tilesheet because Ashfall Hollow is the first separately loaded map.
  { key: 'cave3-set', path: `${W}cave3.png`, frameWidth: 32, frameHeight: 32 },
  // Workshop sheets remain staged until an enterable interior references them.
  { key: 'adobe-house-tower', path: `${W}buildings/adobe_house_tower.png`, image: true },
  { key: 'adobe-house-east', path: `${W}buildings/adobe_house_east.png`, image: true },
  { key: 'adobe-house-west', path: `${W}buildings/adobe_house_west.png`, image: true },
  { key: 'adobe-workshop', path: `${W}buildings/adobe_workshop_full.png`, image: true },

  // v0.1.4.4.1 Warfront-specific runtime environment assets curated from the
  // already-preserved LPC Revised 4-Season Terrain library. Only the compact
  // sheets needed by the dedicated realm are map-loaded; the original source
  // sheets/credits remain preserved under source-assets/world/warfront/.
  { key: 'warfront-winter-dirt', path: `${W}warfront/winter-dirt.png`, image: true },
  { key: 'warfront-infernal-dirt', path: `${W}warfront/infernal-dirt.png`, image: true },
  { key: 'warfront-mountain-winter', path: `${W}warfront/mountain-winter.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'warfront-mountain-autumn', path: `${W}warfront/mountain-autumn.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'warfront-ice-water-tile', path: `${W}warfront/ice-water-tile.png`, image: true },
  { key: 'warfront-water-reflections', path: `${W}warfront/water-reflections.png`, frameWidth: 32, frameHeight: 32 },
  { key: 'warfront-winter-plants', path: `${W}warfront/winter-plants.png`, frameWidth: 16, frameHeight: 16 },
  { key: 'warfront-bridge-straight', path: `${W}warfront/bridge-straight.png`, image: true },

  // v0.1.4.1 curated workshop props. These are tiny transparent crops from
  // the preserved source-only revised workshop sheets, not the full 512px-wide
  // authoring atlases. This keeps the rebuilt Refuge visually rich without
  // paying the mobile GPU cost of three large sheets.
  { key: 'prop-smith-forge', path: `${W}props/smith-forge.png`, image: true },
  { key: 'prop-smith-tools', path: `${W}props/smith-tools.png`, image: true },
  { key: 'prop-smith-racks', path: `${W}props/smith-racks.png`, image: true },
  { key: 'prop-wood-bench', path: `${W}props/wood-bench.png`, image: true },
  { key: 'prop-wood-toolboard', path: `${W}props/wood-toolboard.png`, image: true },
  { key: 'prop-tailor-loom', path: `${W}props/tailor-loom.png`, image: true },
  { key: 'prop-tailor-display', path: `${W}props/tailor-display.png`, image: true }
];

const range = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, i) => start + i));
const dirs = Object.freeze([0, 1, 2, 3]);

// Direction order is up, left, down, right. `sequence` is the actual frame
// cycle from the LPC animation guide; it is intentionally not assumed to be
// every frame from left to right.
export const ANIMATION_GEOMETRIES = Object.freeze({
  classic: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) })
  }),
  classicExpanded: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) }),
    spellcast: Object.freeze({ source: 'spellcast', rows: dirs, stride: 7, sequence: range(0, 6) }),
    thrust: Object.freeze({ source: 'thrust', rows: dirs, stride: 8, sequence: range(0, 7) }),
    shoot: Object.freeze({ source: 'shoot', rows: dirs, stride: 13, sequence: range(0, 12) }),
    hurt: Object.freeze({ source: 'hurt', rows: [0, 0, 0, 0], stride: 6, sequence: range(0, 5) })
  }),
  revised64: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) }),
    slash1h: Object.freeze({ source: 'backslash', rows: dirs, stride: 13, sequence: range(0, 6) }),
    backslash1h: Object.freeze({ source: 'backslash', rows: dirs, stride: 13, sequence: Object.freeze([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]) }),
    halfslash1h: Object.freeze({ source: 'halfslash', rows: dirs, stride: 6, sequence: range(0, 5) })
  }),
  revised64Expanded: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) }),
    slash1h: Object.freeze({ source: 'backslash', rows: dirs, stride: 13, sequence: range(0, 6) }),
    backslash1h: Object.freeze({ source: 'backslash', rows: dirs, stride: 13, sequence: Object.freeze([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]) }),
    halfslash1h: Object.freeze({ source: 'halfslash', rows: dirs, stride: 6, sequence: range(0, 5) }),
    run: Object.freeze({ source: 'run', rows: dirs, stride: 8, sequence: range(0, 7) }),
    spellcast: Object.freeze({ source: 'spellcast', rows: dirs, stride: 7, sequence: range(0, 6) }),
    thrust: Object.freeze({ source: 'thrust', rows: dirs, stride: 8, sequence: range(0, 7) }),
    shoot: Object.freeze({ source: 'shoot', rows: dirs, stride: 13, sequence: range(0, 12) }),
    hurt: Object.freeze({ source: 'hurt', rows: [0, 0, 0, 0], stride: 6, sequence: range(0, 5) })
  }),
  revised64Basic: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) })
  }),
  expanded64: Object.freeze({
    idle: Object.freeze({ source: 'texture', rows: [8, 9, 10, 11], stride: 13, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'texture', rows: [8, 9, 10, 11], stride: 13, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'texture', rows: [12, 13, 14, 15], stride: 13, sequence: range(0, 5) })
  }),
  classicSpear192: Object.freeze({
    idle: Object.freeze({ source: 'texture', rows: dirs, stride: 8, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'texture', rows: dirs, stride: 8, sequence: Object.freeze([0]) }),
    thrust: Object.freeze({ source: 'texture', rows: dirs, stride: 8, sequence: range(0, 7) })
  }),
  dcssSword128: Object.freeze({
    // The older DCSS source stores up / left / down and mirrors left for right.
    idle: Object.freeze({ source: 'texture', rows: [6, 7, 8, 7], stride: 13, sequence: Object.freeze([0]), mirror: [false, false, false, true] }),
    walk: Object.freeze({ source: 'texture', rows: [6, 7, 8, 7], stride: 13, sequence: range(1, 8), mirror: [false, false, false, true] }),
    slash: Object.freeze({ source: 'texture', rows: [9, 10, 11, 10], stride: 13, sequence: range(0, 5), mirror: [false, false, false, true] })
  }),
  armingSword: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) }),
    slash1h: Object.freeze({ source: 'backslash', rows: dirs, stride: 13, sequence: range(0, 6) }),
    backslash1h: Object.freeze({ source: 'backslash', rows: dirs, stride: 13, sequence: Object.freeze([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]) }),
    halfslash1h: Object.freeze({ source: 'halfslash', rows: dirs, stride: 6, sequence: range(0, 5) })
  }),
  katanaNpc128: Object.freeze({
    idle: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: Object.freeze([0]) }),
    walk: Object.freeze({ source: 'walk', rows: dirs, stride: 9, sequence: range(1, 8) }),
    slash: Object.freeze({ source: 'slash', rows: dirs, stride: 6, sequence: range(0, 5) })
  })
});

export const LAYER_ASSETS = Object.freeze({
  // Actor bases. The player now uses the user's full-combat red-haired LPC
  // export as one synchronized base layer (body + face + hair). NPC/enemy
  // bases remain selectable so the same layered renderer can power future
  // adventurers and equipment-bearing skeletons.
  player_red_base: { walk: 'protagonist-red-walk', run: 'protagonist-red-run', slash: 'protagonist-red-slash', backslash: 'protagonist-red-backslash', halfslash: 'protagonist-red-halfslash', spellcast: 'protagonist-red-spellcast', thrust: 'protagonist-red-thrust', shoot: 'protagonist-red-shoot', hurt: 'protagonist-red-hurt', geometry: 'revised64Expanded' },
  npc_olive_base: { walk: 'npc-olive-walk', slash: 'npc-olive-slash', backslash: 'npc-olive-backslash', halfslash: 'npc-olive-halfslash', geometry: 'revised64' },
  npc_classic_body: { walk: 'body-walk', slash: 'body-slash', geometry: 'classic', attackFallback: 'slash' },
  npc_classic_hair: { walk: 'hair-walk', slash: 'hair-slash', geometry: 'classic', attackFallback: 'slash' },
  enemy_skeleton_base: { walk: 'skeleton-walk', slash: 'skeleton-slash', spellcast: 'skeleton-spellcast', thrust: 'skeleton-thrust', shoot: 'skeleton-shoot', hurt: 'skeleton-hurt', geometry: 'classicExpanded', attackFallback: 'slash' },
  enemy_slate_skeleton_base: { walk: 'slate-skeleton-walk', slash: 'slate-skeleton-slash', spellcast: 'slate-skeleton-spellcast', thrust: 'slate-skeleton-thrust', shoot: 'slate-skeleton-shoot', hurt: 'slate-skeleton-hurt', geometry: 'classicExpanded', attackFallback: 'slash' },
  enemy_blood_skeleton_base: { walk: 'blood-skeleton-walk', slash: 'blood-skeleton-slash', geometry: 'classic', attackFallback: 'slash' },
  enemy_gilded_skeleton_base: { walk: 'gilded-skeleton-walk', slash: 'gilded-skeleton-slash', geometry: 'classic', attackFallback: 'slash' },
  enemy_fleshborn_base: { walk: 'fleshborn-demon-walk', slash: 'fleshborn-demon-slash', geometry: 'revised64Basic', attackFallback: 'slash' },
  enemy_base_angel_base: { walk: 'base-angel-walk', slash: 'base-angel-slash', geometry: 'revised64Basic', attackFallback: 'slash' },

  // Backwards alias used by older code/tools; player rendering explicitly asks
  // for player_red_base in v0.1.2.
  body: { walk: 'revised-body-walk', slash: 'revised-body-slash', backslash: 'revised-body-backslash', halfslash: 'revised-body-halfslash', geometry: 'revised64' },
  hair: { walk: 'hair-walk', slash: 'hair-slash', geometry: 'classic', attackFallback: 'slash' },

  // Beginner presentation aliases intentionally reuse verified revised-combat
  // layers. The item IDs/names stay low-level and save-compatible while the
  // visuals remain synchronized through the full four-hit sword chain.
  chest_starter_revised: { walk: 'legion-chest-walk', run: 'legion-chest-run', slash: 'legion-chest-slash', backslash: 'legion-chest-backslash', halfslash: 'legion-chest-halfslash', spellcast: 'legion-chest-spellcast', thrust: 'legion-chest-thrust', shoot: 'legion-chest-shoot', hurt: 'legion-chest-hurt', geometry: 'revised64Expanded' },
  legs_starter_revised: { walk: 'starter-trousers-walk', run: 'starter-trousers-run', slash: 'starter-trousers-slash', backslash: 'starter-trousers-backslash', halfslash: 'starter-trousers-halfslash', spellcast: 'starter-trousers-spellcast', thrust: 'starter-trousers-thrust', shoot: 'starter-trousers-shoot', hurt: 'starter-trousers-hurt', geometry: 'revised64Expanded' },
  hands_starter_revised: { walk: 'starter-wraps-walk', run: 'starter-wraps-run', slash: 'starter-wraps-slash', backslash: 'starter-wraps-backslash', halfslash: 'starter-wraps-halfslash', spellcast: 'starter-wraps-spellcast', thrust: 'starter-wraps-thrust', shoot: 'starter-wraps-shoot', hurt: 'starter-wraps-hurt', geometry: 'revised64Expanded' },
  feet_starter_revised: { walk: 'leather-boots-walk', run: 'leather-boots-run', slash: 'leather-boots-slash', backslash: 'leather-boots-backslash', halfslash: 'leather-boots-halfslash', spellcast: 'leather-boots-spellcast', thrust: 'leather-boots-thrust', shoot: 'leather-boots-shoot', hurt: 'leather-boots-hurt', geometry: 'revised64Expanded' },

  // Legacy classic-animation layers are retained for NPCs/source compatibility,
  // but player starter items no longer point at them.
  chest_wayfarer: { walk: 'shirt-walk', slash: 'shirt-slash', geometry: 'classic', attackFallback: 'slash' },
  chest_leather: { walk: 'leather-walk', slash: 'leather-slash', geometry: 'classic', attackFallback: 'slash' },
  chest_plate: { walk: 'plate-chest-walk', slash: 'plate-chest-slash', geometry: 'classic', attackFallback: 'slash' },
  legs_ash: { walk: 'pants-walk', slash: 'pants-slash', geometry: 'classic', attackFallback: 'slash' },
  legs_plate: { walk: 'plate-legs-walk', slash: 'plate-legs-slash', geometry: 'classic', attackFallback: 'slash' },
  feet_road: { walk: 'shoes-walk', slash: 'shoes-slash', geometry: 'classic', attackFallback: 'slash' },
  feet_plate: { walk: 'plate-feet-walk', slash: 'plate-feet-slash', geometry: 'classic', attackFallback: 'slash' },
  hands_hide: { walk: 'bracers-walk', slash: 'bracers-slash', geometry: 'classic', attackFallback: 'slash' },
  hands_plate: { walk: 'plate-hands-walk', slash: 'plate-hands-slash', geometry: 'classic', attackFallback: 'slash' },
  head_chain: { walk: 'chain-head-walk', slash: 'chain-head-slash', geometry: 'classic', attackFallback: 'slash' },
  head_plate: { walk: 'plate-head-walk', slash: 'plate-head-slash', geometry: 'classic', attackFallback: 'slash' },

  head_iron_revised: { walk: 'iron-helmet-walk', slash: 'iron-helmet-slash', backslash: 'iron-helmet-backslash', halfslash: 'iron-helmet-halfslash', geometry: 'revised64' },
  head_bronze_revised: { walk: 'bronze-helmet-walk', slash: 'bronze-helmet-slash', backslash: 'bronze-helmet-backslash', halfslash: 'bronze-helmet-halfslash', geometry: 'revised64' },
  shoulders_legion: { walk: 'shoulders-walk', slash: 'shoulders-slash', geometry: 'revised64Basic', attackFallback: 'slash' },
  shoulders_leather_revised: { walk: 'leather-shoulders-walk', slash: 'leather-shoulders-slash', backslash: 'leather-shoulders-backslash', halfslash: 'leather-shoulders-halfslash', geometry: 'revised64' },
  chest_legion: { walk: 'legion-chest-walk', slash: 'legion-chest-slash', backslash: 'legion-chest-backslash', halfslash: 'legion-chest-halfslash', geometry: 'revised64' },
  chest_silver_legion: { walk: 'silver-legion-walk', slash: 'silver-legion-slash', backslash: 'silver-legion-backslash', halfslash: 'silver-legion-halfslash', geometry: 'revised64' },
  chest_steel_plate: { walk: 'steel-plate-walk', slash: 'steel-plate-slash', backslash: 'steel-plate-backslash', halfslash: 'steel-plate-halfslash', geometry: 'revised64' },
  hands_legion: { walk: 'legion-gloves-walk', slash: 'legion-gloves-slash', backslash: 'legion-gloves-backslash', halfslash: 'legion-gloves-halfslash', geometry: 'revised64' },
  feet_revised: { walk: 'boots-walk', slash: 'boots-slash', geometry: 'revised64Basic', attackFallback: 'slash' },
  feet_leather_revised: { walk: 'leather-boots-walk', slash: 'leather-boots-slash', backslash: 'leather-boots-backslash', halfslash: 'leather-boots-halfslash', geometry: 'revised64' },
  wings_red_bat: { walk: 'red-bat-wings-walk', slash: 'red-bat-wings-slash', backslash: 'red-bat-wings-backslash', halfslash: 'red-bat-wings-halfslash', geometry: 'revised64' },

  weapon_long_sword_bg: { texture: 'long-sword-bg', geometry: 'dcssSword128', attackFallback: 'slash' },
  weapon_long_sword_fg: { texture: 'long-sword-fg', geometry: 'dcssSword128', attackFallback: 'slash' },
  weapon_arming_sword_fg: { walk: 'arming-sword-walk', slash: 'arming-sword-slash', backslash: 'arming-sword-backslash', halfslash: 'arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_iron_arming_sword_fg: { walk: 'iron-arming-sword-walk', slash: 'iron-arming-sword-slash', backslash: 'iron-arming-sword-backslash', halfslash: 'iron-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_brass_arming_sword_fg: { walk: 'brass-arming-sword-walk', slash: 'brass-arming-sword-slash', backslash: 'brass-arming-sword-backslash', halfslash: 'brass-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_bronze_arming_sword_fg: { walk: 'bronze-arming-sword-walk', slash: 'bronze-arming-sword-slash', backslash: 'bronze-arming-sword-backslash', halfslash: 'bronze-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_copper_arming_sword_fg: { walk: 'copper-arming-sword-walk', slash: 'copper-arming-sword-slash', backslash: 'copper-arming-sword-backslash', halfslash: 'copper-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_steel_arming_sword_fg: { walk: 'steel-arming-sword-walk', slash: 'steel-arming-sword-slash', backslash: 'steel-arming-sword-backslash', halfslash: 'steel-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_gold_arming_sword_fg: { walk: 'gold-arming-sword-walk', slash: 'gold-arming-sword-slash', backslash: 'gold-arming-sword-backslash', halfslash: 'gold-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_ceramic_arming_sword_fg: { walk: 'ceramic-arming-sword-walk', slash: 'ceramic-arming-sword-slash', backslash: 'ceramic-arming-sword-backslash', halfslash: 'ceramic-arming-sword-halfslash', geometry: 'armingSword', oversizedSources: ['slash', 'backslash', 'halfslash'] },
  weapon_katana_npc_fg: { walk: 'katana-walk', slash: 'katana-slash', geometry: 'katanaNpc128', oversizedSources: ['walk', 'slash'], attackFallback: 'slash' },
  weapon_bone_bow_fg: { shoot: 'skeleton-bow-shoot', geometry: 'classicExpanded', specialOnly: true },
  weapon_bone_spear_fg: { texture: 'skeleton-spear-thrust', geometry: 'classicSpear192', oversizedSources: ['texture'] },
  shield_wood_bg: { texture: 'wood-shield-bg', geometry: 'expanded64', attackFallback: 'slash' },
  shield_wood_fg: { texture: 'wood-shield-fg', geometry: 'expanded64', attackFallback: 'slash' }
});
