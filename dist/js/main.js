import { DEBUG } from './config.js';
import { SaveManager } from './core/SaveManager.js';
import { WorldScene } from './scenes/WorldScene.js';
import { UIManager } from './ui.js';
import { createDefaultState } from './core/GameState.js';

window.__ashfallTouchMoving = false;
window.__ashfallRun = false;
window.__ashfallUiBlocked = false;

const saveManager = new SaveManager();
let existingState = saveManager.loadExisting();
let game = null;
let uiManager = null;

const $ = selector => document.querySelector(selector);
const startScreen = $('#start-screen');
const continueButton = $('#continue-game');
const loadButton = $('#load-game');
const newButton = $('#new-game');
const mythicButton = $('#mythic-freeplay');
const mythicPanel = $('#mythic-freeplay-panel');
const azraelFreeplayButton = $('#freeplay-azrael');
const seraphelFreeplayButton = $('#freeplay-seraphel');
const cancelFreeplayButton = $('#cancel-freeplay');
const loadPanel = $('#load-slot-panel');
const loadSlotButton = $('#load-slot-button');
const newConfirm = $('#new-game-confirm');
const confirmNewButton = $('#confirm-new-game');
const cancelNewButton = $('#cancel-new-game');

function formatSavedAt(value) {
  if (!value) return 'Not yet manually saved';
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return 'Saved game';
  }
}

function refreshStartScreen() {
  existingState = saveManager.loadExisting();
  const summary = saveManager.summary(existingState);
  const hasSave = Boolean(summary);
  continueButton.disabled = !hasSave;
  loadButton.disabled = !hasSave;
  loadSlotButton.disabled = !hasSave;
  $('#save-slot-empty').classList.toggle('hidden', hasSave);
  $('#save-slot-details').classList.toggle('hidden', !hasSave);
  if (summary) {
    $('#slot-level').textContent = `Level ${summary.level}`;
    $('#slot-location').textContent = summary.mapName;
    $('#slot-ash').textContent = `${summary.currency} ash`;
    $('#slot-time').textContent = formatSavedAt(summary.savedAt);
  }
}


function createAzraelFreeplayState() {
  const state = createDefaultState();
  state.sessionMode = 'azrael_freeplay';
  state.player.mapId = 'map_veil_warfront';
  state.player.entryPointId = 'azrael_freeplay';
  state.player.x = 5550;
  state.player.y = 1710;
  // Freeplay is disposable. This state is deliberately never handed to SaveManager.save().
  state.worldFlags.introToastShown = true;
  return state;
}

function createSeraphelFreeplayState() {
  const state = createDefaultState();
  state.sessionMode = 'seraphel_freeplay';
  state.player.mapId = 'map_veil_warfront';
  state.player.entryPointId = 'seraphel_freeplay';
  state.player.x = 3072;
  state.player.y = 360;
  state.worldFlags.introToastShown = true;
  return state;
}

function bootGame(state, options = {}) {
  if (game) return;
  startScreen.classList.add('hidden');
  $('#loading-screen').classList.remove('hidden');
  $('#loading-fill').style.width = '0%';
  window.__ashfallUiBlocked = false;
  uiManager = new UIManager();

  game = new Phaser.Game({
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
    callbacks: {
      preBoot: gameInstance => {
        gameInstance.registry.set('state', state);
        gameInstance.registry.set('saveManager', saveManager);
        gameInstance.registry.set('sessionMode', options.sessionMode || state?.sessionMode || null);
      }
    },
    scene: [WorldScene]
  });

  window.__ASHFALL_DEBUG__ = DEBUG ? { game, state, saveManager, uiManager } : undefined;
}

continueButton.addEventListener('click', () => {
  if (existingState) bootGame(existingState);
});

mythicButton?.addEventListener('click', () => {
  loadPanel.classList.add('hidden');
  newConfirm.classList.add('hidden');
  mythicPanel?.classList.toggle('hidden');
});

azraelFreeplayButton?.addEventListener('click', () => {
  const state = createAzraelFreeplayState();
  bootGame(state, { sessionMode: 'azrael_freeplay' });
});

seraphelFreeplayButton?.addEventListener('click', () => {
  const state = createSeraphelFreeplayState();
  bootGame(state, { sessionMode: 'seraphel_freeplay' });
});

cancelFreeplayButton?.addEventListener('click', () => mythicPanel?.classList.add('hidden'));

loadButton.addEventListener('click', () => {
  loadPanel.classList.toggle('hidden');
  newConfirm.classList.add('hidden');
  mythicPanel?.classList.add('hidden');
});

loadSlotButton.addEventListener('click', () => {
  if (existingState) bootGame(existingState);
});

newButton.addEventListener('click', () => {
  loadPanel.classList.add('hidden');
  mythicPanel?.classList.add('hidden');
  if (existingState) newConfirm.classList.remove('hidden');
  else {
    const state = saveManager.reset();
    saveManager.save(state);
    bootGame(state);
  }
});

confirmNewButton.addEventListener('click', () => {
  const state = saveManager.reset();
  saveManager.save(state);
  existingState = null;
  bootGame(state);
});

cancelNewButton.addEventListener('click', () => newConfirm.classList.add('hidden'));

refreshStartScreen();
