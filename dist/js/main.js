import { DEBUG } from './config.js';
import { SaveManager } from './core/SaveManager.js';
import { WorldScene } from './scenes/WorldScene.js';
import { UIManager } from './ui.js';

window.__ashfallTouchMoving = false;
window.__ashfallRun = false;
window.__ashfallUiBlocked = false;

const saveManager = new SaveManager();
const state = saveManager.load();
new UIManager();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-canvas',
  width: 960,
  height: 540,
  backgroundColor: '#170b08',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  render: { powerPreference: 'high-performance', antialiasGL: false, batchSize: 2048 },
  fps: { target: 60, min: 30, forceSetTimeOut: false },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false, fps: 60 } },
  callbacks: { preBoot: gameInstance => { gameInstance.registry.set('state', state); gameInstance.registry.set('saveManager', saveManager); } },
  scene: [WorldScene]
});
window.__ASHFALL_DEBUG__ = DEBUG ? { game, state } : undefined;
