import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

globalThis.location = { search: '' };

const { GAME_VERSION } = await import('../dist/js/config.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const { WARFRONT_COLLIDERS, WARFRONT_POPULATION_BUDGET, WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { MYTHIC_FREEPLAY_WARFRONT_BUDGET, MYTHIC_FREEPLAY_WARFRONT_SPAWNS } = await import('../dist/js/data/mythicFreeplayWarfront.js');
const { ZERAKOTH_DEF } = await import('../dist/js/data/zerakoth.js');
const { MYTHICAL_DEMON_DEF } = await import('../dist/js/data/mythicalDemon.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

assert.equal(GAME_VERSION, '0.1.4.4.5.4.4.1');

// Campaign contract is still the physically approved 32 regular actors.
const campaignCount = WARFRONT_SPAWN_REGIONS.reduce((sum, row) => sum + row.count, 0);
assert.equal(WARFRONT_POPULATION_BUDGET.maxProductionActors, 32);
assert.equal(campaignCount, 32);
assert.ok(!SPAWN_REGIONS.some(row => String(row.enemyId).startsWith('enemy_freeplay_')), 'Campaign spawn table must not use Freeplay ranks');

// Freeplay swaps in a denser but locally slept eternal-war profile.
const freeplayCount = MYTHIC_FREEPLAY_WARFRONT_SPAWNS.reduce((sum, row) => sum + row.count, 0);
const infernalCount = MYTHIC_FREEPLAY_WARFRONT_SPAWNS.filter(row => (ENEMY_DEFS[row.enemyId]?.faction || 'monster') === 'monster').reduce((sum, row) => sum + row.count, 0);
const celestialCount = freeplayCount - infernalCount;
assert.equal(freeplayCount, 54);
assert.equal(infernalCount, 34);
assert.equal(celestialCount, 20);
assert.deepEqual(MYTHIC_FREEPLAY_WARFRONT_BUDGET, { regularActors: 54, infernalActors: 34, celestialActors: 20, activationRangeMin: 760, activationRangeMax: 980, maxApproxActiveRegularActors: 20 });
assert.ok(MYTHIC_FREEPLAY_WARFRONT_SPAWNS.every(row => row.mapId === 'map_veil_warfront'));
assert.ok(MYTHIC_FREEPLAY_WARFRONT_SPAWNS.every(row => row.activationRange >= 760 && row.activationRange <= 980));

const coveredAreas = new Set(MYTHIC_FREEPLAY_WARFRONT_SPAWNS.map(row => row.areaId));
for (const id of ['area_warfront_infernal_stronghold','area_warfront_infernal_rear','area_warfront_infernal_front','area_warfront_axis','area_warfront_unhoused','area_warfront_celestial_front','area_warfront_celestial_rear','area_warfront_celestial_stronghold']) {
  assert.ok(coveredAreas.has(id), `Freeplay Eternal Warfront should populate ${id}`);
}

const ranks = [
  ['enemy_freeplay_abyss_warwing_veteran', 22],
  ['enemy_freeplay_gravesworn_veteran', 25],
  ['enemy_freeplay_ossuary_knight', 34],
  ['enemy_freeplay_hellfire_veteran', 36],
  ['enemy_freeplay_ashbone_praetorian', 42],
  ['enemy_freeplay_dread_ossuary_champion', 47],
  ['enemy_freeplay_fleshborn_executioner', 53]
];
for (const [id, level] of ranks) {
  const def = ENEMY_DEFS[id];
  assert.ok(def, `${id} must exist`);
  assert.equal(def.level, level);
  assert.equal(def.freeplayOnly, true);
  assert.equal(def.threatTier, 'elite');
  assert.equal(def.xp, 0);
  assert.deepEqual(def.currency, [0, 0]);
  assert.deepEqual(def.loot, []);
  assert.ok((def.abilities || []).length >= 3, `${id} needs a real combat kit`);
}

// Every higher-rank skeletal Freeplay demon wears a complete fixed armor set.
const armoredSkeletons = ['enemy_freeplay_gravesworn_veteran','enemy_freeplay_ossuary_knight','enemy_freeplay_dread_ossuary_champion'];
for (const id of armoredSkeletons) {
  const def = ENEMY_DEFS[id];
  assert.equal(def.layered, true);
  assert.equal(def.family, 'skeleton');
  for (const slot of ['weapon','head','shoulders','chest','legs','hands','feet']) assert.ok(def.fixedLoadout?.[slot], `${id} missing fixed ${slot}`);
}

// Spawn rectangles stay away from authored solid geometry, including randomizable interior points.
function overlapsCollider(x, y, collider, padding = 24) {
  return Math.abs(x - collider.x) <= collider.width / 2 + padding && Math.abs(y - collider.y) <= collider.height / 2 + padding;
}
for (const row of MYTHIC_FREEPLAY_WARFRONT_SPAWNS) {
  assert.ok(ENEMY_DEFS[row.enemyId], `Unknown Freeplay enemy ${row.enemyId}`);
  for (const fx of [0.28, 0.5, 0.72]) for (const fy of [0.28, 0.5, 0.72]) {
    const x = row.x + row.width * fx;
    const y = row.y + row.height * fy;
    assert.ok(!WARFRONT_COLLIDERS.some(collider => overlapsCollider(x, y, collider)), `${row.id} overlaps a Warfront solid near ${Math.round(x)},${Math.round(y)}`);
  }
}

// Coarse 100px grid ensures local sleeping keeps the approximate regular-actor wake set bounded.
let approximateMaxActive = 0;
for (let x = 100; x < 6044; x += 100) for (let y = 100; y < 2972; y += 100) {
  let count = 0;
  for (const row of MYTHIC_FREEPLAY_WARFRONT_SPAWNS) {
    const cx = row.x + row.width / 2, cy = row.y + row.height / 2;
    if ((cx - x) ** 2 + (cy - y) ** 2 <= row.activationRange ** 2) count += row.count;
  }
  approximateMaxActive = Math.max(approximateMaxActive, count);
}
assert.ok(approximateMaxActive <= MYTHIC_FREEPLAY_WARFRONT_BUDGET.maxApproxActiveRegularActors, `Approximate local wake budget exceeded: ${approximateMaxActive}`);

// Freeplay also activates the existing Lv60 commander; Bloodwing is canonically Lv135 mythic.
assert.equal(ZERAKOTH_DEF.internalLevel, 60);
assert.equal(MYTHICAL_DEMON_DEF.internalLevel, 135);
const worldScene = fs.readFileSync(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const resolver = fs.readFileSync(new URL('../dist/js/systems/AssetResolver.js', import.meta.url), 'utf8');
assert.match(worldScene, /MYTHIC_FREEPLAY_WARFRONT_SPAWNS/);
assert.match(worldScene, /freeplayWarfront[\s\S]*MYTHIC_FREEPLAY_WARFRONT_SPAWNS/);
assert.match(worldScene, /\(!DEBUG && !this\.azraelFreeplayActive\)/, 'Zerakoth should be allowed only by debug or Freeplay outside campaign');
assert.match(resolver, /state\?\.sessionMode === 'azrael_freeplay'[\s\S]*MYTHIC_FREEPLAY_WARFRONT_SPAWNS/);

const assets = assetDefsForMap({ sessionMode: 'azrael_freeplay', player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} }, 'map_veil_warfront');
const assetKeys = new Set(assets.map(asset => asset.key));
for (const key of ['skeleton-walk','gilded-skeleton-walk','blood-skeleton-walk','hellfire-demon-walk','ashbone-demon-walk','fleshborn-demon-walk']) {
  // Asset naming can evolve; at least one exact/prefix match must have been resolved from each family.
  assert.ok([...assetKeys].some(candidate => candidate === key || candidate.includes(key.replace('-walk',''))), `Freeplay asset package missing family for ${key}`);
}

// Most important inherited safety invariant: autonomous Azrael implementation is unchanged from approved .5.3.1/.5.4.
const azraelBytes = fs.readFileSync(new URL('../dist/js/entities/Azrael.js', import.meta.url));
assert.equal(crypto.createHash('sha256').update(azraelBytes).digest('hex'), '116fb856816a3a7c1d13022508a583d5ed395ab4e6537f8f0825bc8ebab6dab1');

console.log(`Mythic Freeplay Eternal Warfront smoke passed: ${freeplayCount} regular actors (${infernalCount} Infernal / ${celestialCount} Celestial), approx local wake max ${approximateMaxActive}.`);
