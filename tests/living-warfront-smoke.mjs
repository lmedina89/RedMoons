import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { ASSET_DEFS } = await import('../dist/js/data/assets.js');
const { ENCOUNTER_DEFS } = await import('../dist/js/data/encounters.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { WORLD_EVENT_DEFS } = await import('../dist/js/data/exploration.js');
const { COLLIDERS, MAP_DEFS, SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const { WARFRONT_POPULATION_BUDGET, WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

const mapId = 'map_veil_warfront';
const map = MAP_DEFS[mapId];
assert.ok(map, 'Living Warfront map must exist');

const spawns = SPAWN_REGIONS.filter(row => row.mapId === mapId);
assert.equal(spawns.length, WARFRONT_SPAWN_REGIONS.length, 'Shared spawn registry must include every Living Warfront row exactly once');
const actorCount = spawns.reduce((sum, row) => sum + row.count, 0);
assert.equal(actorCount, WARFRONT_POPULATION_BUDGET.maxProductionActors, 'Living Warfront must obey its explicit production actor budget');
assert.ok(actorCount <= 35, 'Living Warfront must stay at or below the proven 35-actor Cinder Wilds ceiling');
assert.equal(WARFRONT_POPULATION_BUDGET.mythicActors, 0, 'First Living Warfront pass must not contain mythic actors');

const factionCount = { celestial: 0, infernal: 0 };
const allowedEnemyIds = new Set([
  'enemy_celestial_footsoldier', 'enemy_heavenly_guardian',
  'enemy_demon_scout', 'enemy_hellfire_demon', 'enemy_ashbone_demon', 'enemy_fleshborn_demon', 'enemy_blueflame_imp'
]);
for (const spawn of spawns) {
  assert.ok(allowedEnemyIds.has(spawn.enemyId), `${spawn.id} must use only approved regular faction troops`);
  const def = ENEMY_DEFS[spawn.enemyId];
  assert.ok(def, `${spawn.id} references missing enemy ${spawn.enemyId}`);
  assert.ok(ENCOUNTER_DEFS[spawn.encounterId], `${spawn.id} references missing encounter ${spawn.encounterId}`);
  assert.ok(spawn.activationRange <= WARFRONT_POPULATION_BUDGET.maxActiveSectorRange, `${spawn.id} activation range must stay inside the Warfront sector cap`);
  factionCount[def.faction === 'celestial' ? 'celestial' : 'infernal'] += spawn.count;
}
assert.deepEqual(factionCount, { celestial: 16, infernal: 16 }, 'First Warfront army pass should be deliberately symmetric at 16 vs 16 actor slots');

const colliders = COLLIDERS.filter(row => row.mapId === mapId);
const rectOverlap = (spawn, collider) => {
  const left = collider.x - collider.width / 2;
  const right = collider.x + collider.width / 2;
  const top = collider.y - collider.height / 2;
  const bottom = collider.y + collider.height / 2;
  return spawn.x < right && spawn.x + spawn.width > left && spawn.y < bottom && spawn.y + spawn.height > top;
};
for (const spawn of spawns) {
  assert.equal(colliders.some(collider => rectOverlap(spawn, collider)), false, `${spawn.id} spawn rectangle must not overlap visible-source Warfront collision`);
}

function segmentHitsCollider(a, b, collider, padding = 18) {
  const left = collider.x - collider.width / 2 - padding;
  const right = collider.x + collider.width / 2 + padding;
  const top = collider.y - collider.height / 2 - padding;
  const bottom = collider.y + collider.height / 2 + padding;
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const steps = Math.max(1, Math.ceil(length / 8));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    if (x >= left && x <= right && y >= top && y <= bottom) return true;
  }
  return false;
}

const patrols = spawns.filter(row => Array.isArray(row.patrolPath));
assert.equal(patrols.reduce((sum, row) => sum + row.count, 0), 10, 'Living Warfront should stage ten patrol/scout actor slots across two contested lanes');
for (const spawn of patrols) {
  assert.ok(spawn.patrolPath.length >= 5, `${spawn.id} patrol must have an authored route, not a two-point shuffle`);
  for (let i = 0; i < spawn.patrolPath.length; i += 1) {
    const a = spawn.patrolPath[i];
    const b = spawn.patrolPath[(i + 1) % spawn.patrolPath.length];
    assert.equal(colliders.some(collider => segmentHitsCollider(a, b, collider)), false, `${spawn.id} patrol segment ${i} must not path through a Warfront solid`);
  }
}

for (const encounterId of [
  'enc_warfront_infernal_stronghold', 'enc_warfront_cinder_bastion', 'enc_warfront_riven_hold',
  'enc_warfront_axis_infernal_patrol', 'enc_warfront_south_infernal_patrol',
  'enc_warfront_celestial_stronghold', 'enc_warfront_halo_bastion', 'enc_warfront_dawnward_hold',
  'enc_warfront_axis_celestial_patrol', 'enc_warfront_south_celestial_patrol'
]) {
  const encounter = ENCOUNTER_DEFS[encounterId];
  assert.ok(encounter, `Missing Living Warfront encounter ${encounterId}`);
  assert.ok((encounter.assistCap || 0) <= 2, `${encounterId} must keep same-faction reinforcement assist tightly capped`);
  assert.ok((encounter.assistRadius || 0) <= 330, `${encounterId} must keep reinforcement radius local`);
}

const clashEvents = WORLD_EVENT_DEFS.filter(event => event.mapId === mapId && event.kind === 'faction_clash');
assert.equal(clashEvents.length, 2, 'First Living Warfront should seed exactly two localized faction-clash sectors');
assert.ok(clashEvents.some(event => event.id === 'event_warfront_axis_clash'), 'Axis must seed an autonomous nearby faction clash');
assert.ok(clashEvents.some(event => event.id === 'event_warfront_unhoused_clash'), 'The Unhoused approach must seed a second smaller scout clash');

const assetPaths = ASSET_DEFS.map(asset => `${asset.key} ${asset.path}`.toLowerCase());
for (const forbidden of ['lailani', 'lexiangel', 'demonmythical', 'ancientdemonlord']) {
  assert.equal(assetPaths.some(text => text.includes(forbidden)), false, `${forbidden} must remain source-only and outside runtime assets`);
}

const mapAssets = assetDefsForMap({ player: { mapId }, inventory: [], equipment: {} }, mapId).map(asset => asset.key);
for (const key of ['demon-scout-walk', 'hellfire-demon-walk', 'ashbone-demon-walk', 'fleshborn-demon-walk', 'base-angel-walk', 'heavenly-knight-walk']) {
  assert.ok(mapAssets.includes(key), `Warfront streaming package must include regular army asset ${key}`);
}

const enemySource = await readFile(new URL('../dist/js/entities/Enemy.js', import.meta.url), 'utf8');
assert.ok(enemySource.includes('playerDistanceSq > activeRangeSq'), 'Living Warfront must inherit player-scoped offscreen AI sleeping');
assert.ok(enemySource.includes('targetWithinPursuitBounds'), 'Living Warfront must inherit bounded pursuit/leashes');

console.log(`Living Warfront smoke passed: ${actorCount} production actors (${factionCount.celestial} celestial / ${factionCount.infernal} infernal), ${patrols.length} patrol rows, ${clashEvents.length} localized clash sectors, zero mythic runtime actors.`);
