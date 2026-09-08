export const GAME_VERSION = '0.1.4.4.5.4.3';
export const SAVE_VERSION = 2;
export const SAVE_KEY = 'hellrpg.ashfall.save.v1';
export const TILE_SIZE = 32;
export const WORLD_WIDTH = 2048;
export const WORLD_HEIGHT = 1536;
export const PLAYER_START = Object.freeze({ x: 1010, y: 790 });
export const DEBUG = new URLSearchParams(location.search).get('debug') === '1';

export const RARITY = Object.freeze({
  normal: { id: 'normal', label: 'Normal', color: '#ded7c7', modifierRolls: 0, rank: 0 },
  magic: { id: 'magic', label: 'Magic', color: '#65a7ff', modifierRolls: 1, rank: 1 },
  noble: { id: 'noble', label: 'Noble', color: '#d98cff', modifierRolls: 2, rank: 2 },
  divine_noble: { id: 'divine_noble', label: 'Divine Noble', color: '#ffd65a', modifierRolls: 3, rank: 3, future: true },
  abyss: { id: 'abyss', label: 'Abyss', color: '#ff5a4f', modifierRolls: 4, rank: 4, future: true },
  legendary: { id: 'legendary', label: 'Legendary', color: '#ff9e39', modifierRolls: 4, rank: 5, future: true }
});

