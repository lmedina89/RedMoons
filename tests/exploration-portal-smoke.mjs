import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { ASSET_DEFS } = await import('../dist/js/data/assets.js');
const { SaveManager } = await import('../dist/js/core/SaveManager.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { ENCOUNTER_DEFS } = await import('../dist/js/data/encounters.js');
const { POI_DEFS, WORLD_EVENT_DEFS } = await import('../dist/js/data/exploration.js');
const { COLLIDERS, DEFAULT_MAP_ID, HOLLOW_COLLIDERS, MAP_DEFS, MAP_TRANSITIONS, SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const {
  RETURN_STACK_LIMIT,
  ensureTravelState,
  makeReturnAnchor,
  normalizeTravelState,
  peekReturnAnchor,
  popReturnAnchor,
  pushReturnAnchor
} = await import('../dist/js/systems/TravelSystem.js');

const proofMaps = ['map_warden_hall', 'map_torrens_forge', 'map_ashgrave_crypt', 'map_veil_threshold'];
for (const mapId of proofMaps) {
  const map = MAP_DEFS[mapId];
  assert.ok(map && map.entryPoints?.arrival, `${mapId} must expose a real arrival entry`);
}
const runtimeAssetKeys = new Set(ASSET_DEFS.map(asset => asset.key));
for (const mapId of proofMaps) for (const key of MAP_DEFS[mapId].worldAssetKeys || []) {
  assert.ok(runtimeAssetKeys.has(key), `${mapId} references unknown runtime world asset ${key}`);
}

const state = createDefaultState();
assert.deepEqual(ensureTravelState(state), { returnStack: [] }, 'Fresh state must expose an empty travel return stack');
const anchor = makeReturnAnchor({ mapId: DEFAULT_MAP_ID, x: 1515, y: 570, entryPointId: 'cinder_start', transitionId: 'transition_refuge_warden_hall' });
assert.ok(anchor, 'A valid source position must form a return anchor');
assert.equal(pushReturnAnchor(state, anchor), true, 'Return anchor must be accepted');
assert.deepEqual(peekReturnAnchor(state), anchor, 'Return anchor must preserve exact source coordinates and metadata');
assert.deepEqual(popReturnAnchor(state), anchor, 'Return anchor must pop only when the caller commits the return transition');
assert.equal(peekReturnAnchor(state), null, 'Popped return stack must be empty');

for (let i = 0; i < RETURN_STACK_LIMIT + 3; i += 1) {
  pushReturnAnchor(state, makeReturnAnchor({ mapId: 'map_cinder_wilds', x: 200 + i * 10, y: 400 + i * 10, transitionId: `test_${i}` }));
}
assert.equal(state.travel.returnStack.length, RETURN_STACK_LIMIT, 'Return stack must stay bounded for nested future interiors/realms');
assert.equal(state.travel.returnStack[0].transitionId, 'test_3', 'Bounded return stack must discard only the oldest overflow anchors');

const normalized = normalizeTravelState({ returnStack: [
  { mapId: 'missing_map', x: 1, y: 1 },
  { mapId: 'map_cinder_wilds', x: -500, y: 99999, entryPointId: 'missing_entry', transitionId: 'x'.repeat(200) },
  { mapId: 'map_warden_hall', x: 512, y: 610, entryPointId: 'arrival', transitionId: 'door' }
] }, MAP_DEFS);
assert.equal(normalized.returnStack.length, 2, 'Travel normalization must discard unknown maps without invalidating the save');
assert.deepEqual(
  { x: normalized.returnStack[0].x, y: normalized.returnStack[0].y, entryPointId: normalized.returnStack[0].entryPointId },
  { x: 48, y: MAP_DEFS.map_cinder_wilds.height - 48, entryPointId: null },
  'Travel normalization must clamp coordinates and clear unknown entry points'
);
assert.equal(normalized.returnStack[0].transitionId.length, 96, 'Travel normalization must bound transition metadata');

const saveProbe = createDefaultState();
saveProbe.travel.returnStack = [makeReturnAnchor({ mapId: 'map_cinder_wilds', x: 3980, y: 1740, entryPointId: 'first_light_test', transitionId: 'transition_firstlight_veil' })];
saveProbe.worldFlags.poiStates.poi_burnt_hamlet_cache = 'opened';
const validatedSave = new SaveManager().validate(saveProbe);
assert.equal(validatedSave.travel.returnStack.length, 1, 'Schema-2 save validation must preserve a valid return anchor');
assert.equal(validatedSave.travel.returnStack[0].x, 3980, 'Schema-2 save validation must preserve exact return X');
assert.equal(validatedSave.worldFlags.poiStates.poi_burnt_hamlet_cache, 'opened', 'Schema-2 save validation must preserve persistent POI state');

const captureTargets = new Map([
  ['map_warden_hall', 'map_cinder_refuge'],
  ['map_torrens_forge', 'map_cinder_refuge'],
  ['map_ashgrave_crypt', 'map_cinder_wilds'],
  ['map_veil_threshold', 'map_cinder_wilds']
]);
for (const [destinationMapId, originMapId] of captureTargets) {
  const enter = MAP_TRANSITIONS.find(t => t.mapId === originMapId && t.destinationMapId === destinationMapId);
  const leave = MAP_TRANSITIONS.find(t => t.mapId === destinationMapId && t.returnToOrigin);
  assert.ok(enter?.captureReturn, `${destinationMapId} entry must capture the exact origin`);
  assert.ok(leave?.fallbackDestinationMapId && leave?.fallbackDestinationEntryId, `${destinationMapId} return must have a safe fallback for debug/direct-entry use`);
  assert.ok(MAP_DEFS[leave.fallbackDestinationMapId]?.entryPoints?.[leave.fallbackDestinationEntryId], `${destinationMapId} fallback must resolve to a real entry point`);
}

const ids = POI_DEFS.map(poi => poi.id);
assert.equal(new Set(ids).size, ids.length, 'POI IDs must be unique');
const allSolids = [...COLLIDERS, ...HOLLOW_COLLIDERS];
for (const poi of POI_DEFS) {
  const map = MAP_DEFS[poi.mapId];
  assert.ok(map, `${poi.id} must reference a real map`);
  assert.ok(poi.x >= 48 && poi.x <= map.width - 48 && poi.y >= 48 && poi.y <= map.height - 48, `${poi.id} must sit safely inside map bounds`);
  assert.ok(['cache', 'shrine', 'lore'].includes(poi.type), `${poi.id} must use a supported exploration interaction type`);
  const overlaps = allSolids.some(c => c.mapId === poi.mapId && Math.abs(poi.x - c.x) < c.width / 2 + 12 && Math.abs(poi.y - c.y) < c.height / 2 + 12);
  assert.equal(overlaps, false, `${poi.id} interaction point must not be buried inside a static collider`);
  for (const item of poi.reward?.items || []) {
    assert.ok(ITEM_DEFS[item.itemId], `${poi.id} reward references unknown item ${item.itemId}`);
    assert.ok(Number(item.quantity) >= 1, `${poi.id} reward quantities must be positive`);
  }
}
assert.ok(POI_DEFS.some(poi => poi.mapId === 'map_cinder_wilds' && poi.type === 'cache'), 'Wilds must contain an off-road cache reward');
assert.ok(POI_DEFS.some(poi => poi.mapId === 'map_cinder_wilds' && poi.type === 'shrine'), 'Wilds must contain a reusable recovery shrine');
assert.ok(POI_DEFS.some(poi => poi.mapId === 'map_veil_threshold' && poi.visual === 'rift'), 'Veil Threshold must foreshadow the future warfront without implementing it yet');

const eventIds = WORLD_EVENT_DEFS.map(event => event.id);
assert.equal(new Set(eventIds).size, eventIds.length, 'World-event IDs must be unique');
for (const event of WORLD_EVENT_DEFS) {
  assert.ok(MAP_DEFS[event.mapId], `${event.id} must reference a real map`);
  assert.ok(['encounter_alert_player', 'faction_clash'].includes(event.kind), `${event.id} must use a supported event kind`);
  assert.ok(event.encounterIds?.length, `${event.id} must reference at least one encounter`);
  for (const encounterId of event.encounterIds) assert.ok(ENCOUNTER_DEFS[encounterId], `${event.id} references unknown encounter ${encounterId}`);
}
const wildsPopulation = SPAWN_REGIONS.filter(spawn => (spawn.mapId || DEFAULT_MAP_ID) === 'map_cinder_wilds').reduce((sum, spawn) => sum + spawn.count, 0);
assert.equal(wildsPopulation, 35, 'Exploration/POI additions must not raise the proven production Wilds actor ceiling');
const cryptPopulation = SPAWN_REGIONS.filter(spawn => spawn.mapId === 'map_ashgrave_crypt').reduce((sum, spawn) => sum + spawn.count, 0);
assert.equal(cryptPopulation, 3, 'First hostile interior should stay deliberately small at three actors');

const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const eventSource = await readFile(new URL('../dist/js/systems/WorldEventSystem.js', import.meta.url), 'utf8');
const saveSource = await readFile(new URL('../dist/js/core/SaveManager.js', import.meta.url), 'utf8');
for (const needle of ['travelThroughTransition(transition)', 'createPoiMarkers()', 'usePoi(poi)', 'triggerWorldEvent(event)', 'new WorldEventSystem']) {
  assert.ok(worldSource.includes(needle), `WorldScene must wire exploration foundation behavior: ${needle}`);
}
assert.ok(worldSource.includes('options.beforeCommit?.()') && worldSource.includes('prepareMapAssets'), 'Return anchors must mutate only after the destination map package loads successfully');
assert.ok(eventSource.includes('nextCheckAt = time + 220') && eventSource.includes('oncePerVisit'), 'World events must use bounded polling and per-visit guards');
assert.ok(saveSource.includes('normalizeTravelState') && saveSource.includes('poiStates'), 'Save normalization must preserve safe travel anchors and persistent POI state without a schema bump');

console.log(`Exploration/portal smoke passed: ${proofMaps.length} proof maps, ${POI_DEFS.length} POIs, ${WORLD_EVENT_DEFS.length} world events, bounded return stack ${RETURN_STACK_LIMIT}, Wilds cap ${wildsPopulation}.`);
