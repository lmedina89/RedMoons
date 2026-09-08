import { ASSET_DEFS, LAYER_ASSETS } from '../data/assets.js';
import { ENEMY_DEFS } from '../data/enemies.js';
import { ITEM_DEFS } from '../data/items.js';
import { NPC_DEFS } from '../data/npcs.js';
import { DEBUG_SPAWN_REGIONS, DEFAULT_MAP_ID, MAP_DEFS, SPAWN_REGIONS, mapForId } from '../data/world.js';
import { AZRAEL_DEF } from '../data/specialActors.js';
import { LAILANI_DEF } from '../data/lailani.js';
import { ELEXIS_DEF } from '../data/elexis.js';
import { MYTHICAL_DEMON_DEF } from '../data/mythicalDemon.js';
import { ZERAKOTH_DEF } from '../data/zerakoth.js';
import { DEBUG } from '../config.js';

const ASSET_BY_KEY = new Map(ASSET_DEFS.map(asset => [asset.key, asset]));
const LAYER_TEXTURE_FIELDS = Object.freeze(['texture', 'walk', 'run', 'slash', 'backslash', 'halfslash', 'spellcast', 'thrust', 'shoot', 'hurt']);

function addAssetKey(keys, key) {
  if (key && ASSET_BY_KEY.has(key)) keys.add(key);
}

function addLayer(keys, layerKey) {
  const layer = layerKey && LAYER_ASSETS[layerKey];
  if (!layer) return;
  for (const field of LAYER_TEXTURE_FIELDS) addAssetKey(keys, layer[field]);
}

function addVisual(keys, visual) {
  if (!visual) return;
  addLayer(keys, visual);
  addLayer(keys, `${visual}_bg`);
  addLayer(keys, `${visual}_fg`);
}

function addItem(keys, itemId, policy = 'npc') {
  const item = itemId && ITEM_DEFS[itemId];
  if (!item) return;
  addVisual(keys, policy === 'player' ? (item.playerVisual || item.visual) : item.visual);
}

function addEnemy(keys, enemy) {
  if (!enemy) return;
  if (enemy.layered) {
    addLayer(keys, enemy.baseVisual || 'enemy_skeleton_base');
    for (const itemId of Object.values(enemy.fixedLoadout || {})) addItem(keys, itemId);
    for (const entries of Object.values(enemy.equipmentPool || {})) {
      for (const entry of entries || []) addItem(keys, entry?.itemId);
    }
    for (const preset of enemy.loadoutPresets || []) {
      for (const itemId of Object.values(preset?.loadout || {})) addItem(keys, itemId);
    }
    return;
  }
  for (const spec of [enemy, ...(enemy.visualPool || [])]) {
    addAssetKey(keys, spec.walkTexture);
    addAssetKey(keys, spec.attackTexture);
    addAssetKey(keys, spec.deathTexture);
  }
}

function addNpc(keys, npc) {
  if (!npc) return;
  addLayer(keys, npc.baseVisual || 'npc_classic_body');
  addLayer(keys, npc.hairVisual);
  for (const itemId of Object.values(npc.loadout || {})) addItem(keys, itemId);
}

function mapIdForSpawn(spawn) { return spawn.mapId || DEFAULT_MAP_ID; }

export function assetDefsForItem(itemId) {
  const keys = new Set();
  addItem(keys, itemId, 'player');
  return [...keys].map(key => ASSET_BY_KEY.get(key));
}

export function assetDefsForMap(state, requestedMapId = null) {
  const map = mapForId(requestedMapId || state?.player?.mapId || DEFAULT_MAP_ID);
  const keys = new Set(map.worldAssetKeys || []);

  // Player base and only the equipment actually being worn are core. Pack
  // contents use generic UI cards and are loaded lazily if the player equips them.
  addLayer(keys, 'player_red_base');
  const inventoryById = new Map((state?.inventory || []).map(item => [item.instanceId, item]));
  for (const instanceId of Object.values(state?.equipment || {})) {
    const instance = inventoryById.get(instanceId);
    if (instance) addItem(keys, instance.itemId, 'player');
  }

  const spawnRows = DEBUG ? [...SPAWN_REGIONS, ...DEBUG_SPAWN_REGIONS] : SPAWN_REGIONS;
  for (const spawn of spawnRows) {
    if (mapIdForSpawn(spawn) !== map.id) continue;
    addEnemy(keys, ENEMY_DEFS[spawn.enemyId]);
  }

  // The temporary Azrael field-test actor is map-scoped just like enemies.
  // Load only his compact runtime action crops when the Cinder Region is live.
  if (AZRAEL_DEF.home.mapId === map.id || (DEBUG && map.id === 'map_veil_warfront')) {
    // Debug Warfront sessions also stream Azrael's compact crops so the battle
    // arena can summon him without loading his full preserved source sheet.
    for (const key of Object.values(AZRAEL_DEF.assets)) addAssetKey(keys, key);
  }

  // Lailani's field-test actor is independently map-scoped to the Veil
  // Warfront. Her compact crops are not loaded on Cinder maps.
  if (LAILANI_DEF.home.mapId === map.id) {
    for (const key of Object.values(LAILANI_DEF.assets)) addAssetKey(keys, key);
  }


  // El’exis is independently map-scoped to the Veil Warfront and streams only
  // her seven compact complete runtime action crops.
  if (ELEXIS_DEF.home.mapId === map.id) {
    for (const key of Object.values(ELEXIS_DEF.assets)) addAssetKey(keys, key);
  }

  // First infernal mythic is independently Warfront-scoped and never loads on
  // Cinder/interior maps.
  if (MYTHICAL_DEMON_DEF.home.mapId === map.id) {
    for (const key of Object.values(MYTHICAL_DEMON_DEF.assets)) addAssetKey(keys, key);
  }

  // Zerakoth is debug-only in this commander field-test pass. His compact
  // base/warplate/Hellblade layers stream only on the Warfront under ?debug=1.
  if (DEBUG && ZERAKOTH_DEF.home.mapId === map.id) addEnemy(keys, ZERAKOTH_DEF);

  const zoneIds = new Set(map.zoneIds || []);
  for (const npc of Object.values(NPC_DEFS)) {
    // Current NPC data uses homeZone as its persistent location. A future NPC
    // can opt into another map simply by pointing homeZone at one of its zones.
    if (!zoneIds.has(npc.homeZone)) continue;
    addNpc(keys, npc);
  }

  return [...keys].map(key => ASSET_BY_KEY.get(key)).filter(Boolean);
}

export function queueAssetDefs(scene, defs) {
  for (const asset of defs) {
    if (!asset || scene.textures.exists(asset.key)) continue;
    if (asset.image) scene.load.image(asset.key, asset.path);
    else scene.load.spritesheet(asset.key, asset.path, { frameWidth: asset.frameWidth, frameHeight: asset.frameHeight });
  }
}

export async function ensureAssetDefs(scene, defs, onProgress = null) {
  const missing = defs.filter(asset => asset && !scene.textures.exists(asset.key));
  if (!missing.length) {
    onProgress?.(1);
    return;
  }
  await new Promise((resolve, reject) => {
    const failures = [];
    const onError = file => failures.push(file?.key || file?.src || 'unknown');
    const onProgressEvent = value => onProgress?.(value);
    const cleanup = () => {
      scene.load.off('loaderror', onError);
      scene.load.off('progress', onProgressEvent);
    };
    const onComplete = () => {
      cleanup();
      const stillMissing = missing.filter(asset => !scene.textures.exists(asset.key)).map(asset => asset.key);
      const allFailures = [...new Set([...failures, ...stillMissing])];
      if (allFailures.length) reject(new Error(`Could not load: ${allFailures.join(', ')}`));
      else resolve();
    };
    scene.load.on('loaderror', onError);
    scene.load.on('progress', onProgressEvent);
    scene.load.once('complete', onComplete);
    queueAssetDefs(scene, missing);
    scene.load.start();
  });
}

export async function prepareMapAssets(scene, state, destinationMapId, onProgress = null) {
  const defs = assetDefsForMap(state, destinationMapId);
  await ensureAssetDefs(scene, defs, onProgress);
  const missing = defs.filter(asset => !scene.textures.exists(asset.key));
  if (missing.length) throw new Error(`Destination package incomplete: ${missing.map(asset => asset.key).join(', ')}`);
  return defs;
}

export async function ensureItemVisualAssets(scene, itemId) {
  return ensureAssetDefs(scene, assetDefsForItem(itemId));
}


export function mapAssetSummary(state, mapId) {
  const map = MAP_DEFS[mapId] || MAP_DEFS[DEFAULT_MAP_ID];
  const defs = assetDefsForMap(state, map.id);
  return { mapId: map.id, assets: defs.length, keys: defs.map(def => def.key) };
}
