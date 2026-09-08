import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { ASSET_DEFS } = await import('../dist/js/data/assets.js');
const { AREA_DEFS, COLLIDERS, MAP_DEFS, MAP_TRANSITIONS, SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const {
  WARFRONT_AMBIENT_EMITTERS,
  WARFRONT_ASSET_KEYS,
  WARFRONT_BRIDGES,
  WARFRONT_CLIFF_RIBBONS,
  WARFRONT_COLLIDERS,
  WARFRONT_DIMENSIONS,
  WARFRONT_LANDMARKS,
  WARFRONT_ROUTE_BANDS,
  WARFRONT_RUIN_BUILDINGS,
  WARFRONT_WATERWAYS
} = await import('../dist/js/data/warfront.js');

const map = MAP_DEFS.map_veil_warfront;
assert.ok(map, 'Warfront map must exist');
assert.deepEqual([map.width, map.height], [6144, 3072], 'First Warfront geography must use the planned 6144x3072 footprint');
assert.equal(map.renderer, 'veil_warfront', 'Warfront must use its dedicated renderer');
assert.ok(map.entryPoints.veil_gate && map.entryPoints.axis_test, 'Warfront must expose safe portal and Axis test entries');

const areas = AREA_DEFS.filter(area => area.mapId === map.id);
assert.equal(areas.length, 8, 'Warfront must ship eight non-overlapping local geography identities');
const pointCount = (x, y) => areas.filter(area => x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height).length;
for (let y = 16; y < map.height; y += 64) for (let x = 16; x < map.width; x += 64) {
  assert.equal(pointCount(x, y), 1, `Warfront area partition must resolve exactly once at ${x},${y}`);
}

assert.equal(WARFRONT_ROUTE_BANDS.length, 3, 'Warfront must preserve north/center/south traversal bands');
assert.ok(WARFRONT_LANDMARKS.some(row => row.id === 'infernal_stronghold'), 'Infernal main stronghold footprint must exist');
assert.ok(WARFRONT_LANDMARKS.some(row => row.id === 'celestial_stronghold'), 'Celestial main stronghold footprint must exist');
assert.equal(WARFRONT_LANDMARKS.filter(row => row.id.includes('rear') || row.id.includes('forward')).length, 4, 'Each faction must have rear and forward outpost footprints');
assert.ok(WARFRONT_LANDMARKS.some(row => row.id === 'axis'), 'The Axis of First Light must anchor the center');
assert.ok(WARFRONT_LANDMARKS.some(row => row.id === 'ruined_settlement'), 'The ruined neutral settlement must exist');
assert.ok(WARFRONT_LANDMARKS.some(row => row.id === 'veil_arrival'), 'The Veil Gate arrival landmark must exist');

assert.ok(WARFRONT_CLIFF_RIBBONS.length >= 4, 'Both territorial halves must use authored cliff screening');
assert.equal(WARFRONT_BRIDGES.length, 3, 'Luminous channel must expose three authored crossings');
assert.ok(WARFRONT_WATERWAYS.some(row => row.id === 'luminous_channel'), 'Celestial territory must use real luminous water geography');
assert.equal(WARFRONT_RUIN_BUILDINGS.length, 3, 'Southern neutral ruins must seed three visible structure footprints');

const warfrontSolids = COLLIDERS.filter(row => row.mapId === map.id);
assert.equal(warfrontSolids.length, WARFRONT_COLLIDERS.length, 'All Warfront data colliders must enter the shared actor collision registry');
for (const source of ['stronghold-wall', 'outpost-wall', 'ancient-cliff', 'luminous-water', 'ruined-building', 'axis-pillar']) {
  assert.ok(warfrontSolids.some(row => row.source === source), `Warfront must expose visible-source collision for ${source}`);
}

const assetKeys = new Set(ASSET_DEFS.map(asset => asset.key));
for (const key of WARFRONT_ASSET_KEYS) assert.ok(assetKeys.has(key), `Warfront references missing runtime asset key ${key}`);
for (const key of ['warfront-winter-dirt', 'warfront-infernal-dirt', 'warfront-mountain-winter', 'warfront-mountain-autumn', 'warfront-ice-water-tile', 'warfront-water-reflections', 'warfront-winter-plants', 'warfront-bridge-straight']) {
  assert.ok(assetKeys.has(key), `Audited 4-Season Warfront asset must be registered: ${key}`);
}

const enter = MAP_TRANSITIONS.find(row => row.id === 'transition_threshold_warfront');
const leave = MAP_TRANSITIONS.find(row => row.id === 'transition_warfront_threshold');
assert.ok(enter?.captureReturn && enter.destinationMapId === map.id, 'Threshold portal must push a nested exact return anchor into the Warfront');
assert.ok(leave?.returnToOrigin && leave.fallbackDestinationMapId === 'map_veil_threshold', 'Warfront return portal must pop to Threshold with a safe direct-entry fallback');

const ambientCount = WARFRONT_AMBIENT_EMITTERS.reduce((sum, row) => sum + row.count, 0);
assert.ok(ambientCount >= 30 && ambientCount <= 42, 'Persistent ambient world sprites must stay bounded while still visibly present');
assert.equal(SPAWN_REGIONS.filter(row => row.mapId === map.id).length, 0, 'v0.1.4.4.0.1 must remain a geography/atmosphere pass with no live Warfront army population yet');

const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
for (const needle of ['buildVeilWarfront()', 'createWarfrontAmbientFx()', 'drawWarfrontCliffRibbon(ribbon)', 'drawWarfrontWallCollider(collider)', "action === 'warfront'"]) {
  assert.ok(worldSource.includes(needle), `WorldScene must wire Warfront geography/atmosphere behavior: ${needle}`);
}
assert.ok(worldSource.includes("this.add.tileSprite(0, 0, this.currentMap.width, this.currentMap.height, 'warfront-winter-dirt')"), 'Warfront must use audited winter ground instead of reusing Cinder dirt');
assert.ok(worldSource.includes("const celestial = ribbon.theme === 'celestial'") && worldSource.includes("const cap = celestial ? 0xe7f5f3 : 0xaa7056"), 'Warfront cliff ribbons must visibly distinguish celestial and infernal ridge treatments');
assert.ok(worldSource.includes("[[172, -64, -128], [173, 0, -128]"), 'Axis tree/orb must include the verified upper crown frames from Castle2');
assert.ok(worldSource.includes("'warfront-bridge-straight'"), 'Warfront crossings must render the curated straight bridge sprite');
assert.ok(!worldSource.includes("this.add.image(bridge.x, bridge.y, 'bridge')"), 'Warfront must never render the complete bridge authoring sheet as one crossing');
assert.ok(worldSource.includes('one continuous ancient shelf'), 'Warfront cliff ribbons must render as continuous shelves rather than cycling unrelated source frames');
assert.ok(!worldSource.includes('add.shader(') && !worldSource.includes('this.add.shader('), 'Foundation atmosphere must avoid permanent full-screen custom shaders on iPhone');

console.log(`Warfront foundation smoke passed: ${map.width}x${map.height}, ${areas.length} areas, ${warfrontSolids.length} solids, ${ambientCount} bounded ambient sprites, zero live army spawns.`);
