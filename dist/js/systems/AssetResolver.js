import { ASSET_DEFS, LAYER_ASSETS } from '../data/assets.js';
import { ENEMY_DEFS } from '../data/enemies.js';
import { ITEM_DEFS } from '../data/items.js';
import { NPC_DEFS } from '../data/npcs.js';
import { DEFAULT_MAP_ID, MAP_DEFS, SPAWN_REGIONS, mapForId } from '../data/world.js';

const ASSET_BY_KEY = new Map(ASSET_DEFS.map(asset => [asset.key, asset]));
const LAYER_TEXTURE_FIELDS = Object.freeze(['texture', 'walk', 'slash', 'backslash', 'halfslash']);

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

  for (const spawn of SPAWN_REGIONS) {
    if (mapIdForSpawn(spawn) !== map.id) continue;
    addEnemy(keys, ENEMY_DEFS[spawn.enemyId]);
  }

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
