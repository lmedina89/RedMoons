import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { ENCOUNTER_DEFS, ENCOUNTER_GROUP_ARCHETYPES, MONSTER_FAMILY_DEFS } = await import('../dist/js/data/encounters.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { AREA_DEFS, COLLIDERS, HOLLOW_COLLIDERS, SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

for (const familyId of ['human', 'demon', 'imp', 'goblin', 'spider', 'skeleton', 'construct']) {
  assert.ok(MONSTER_FAMILY_DEFS[familyId], `Missing family ${familyId}`);
}
for (const archetypeId of ['roam', 'pack', 'patrol', 'guard', 'ritual', 'ambush']) {
  assert.ok(ENCOUNTER_GROUP_ARCHETYPES[archetypeId], `Missing encounter archetype ${archetypeId}`);
}

for (const enemyId of ['enemy_ash_scavenger', 'enemy_ironbound_raider', 'enemy_ash_assassin', 'enemy_demon_scout', 'enemy_hellfire_demon', 'enemy_ashbone_demon', 'enemy_fleshborn_demon']) {
  assert.ok(ENEMY_DEFS[enemyId], `Missing ecology enemy ${enemyId}`);
}
assert.equal(ENEMY_DEFS.enemy_ash_scavenger.layered, true, 'Ash Scavengers should use layered LPC gear');
assert.equal(ENEMY_DEFS.enemy_ironbound_raider.layered, true, 'Ironbound Raiders should use layered LPC gear');
assert.ok(Object.keys(ENEMY_DEFS.enemy_ash_scavenger.equipmentPool || {}).length >= 7, 'Scavengers need meaningful per-spawn outfit variety');
assert.ok(Object.keys(ENEMY_DEFS.enemy_ironbound_raider.equipmentPool || {}).length >= 7, 'Raiders need meaningful per-spawn armored variety');
assert.equal(ENEMY_DEFS.enemy_ash_assassin.rare, true, 'Ashblade Stalker should remain a rare human encounter');
assert.equal(ENEMY_DEFS.enemy_demon_scout.family, 'demon', 'Abyss demon must seed the Demon Legion family');
assert.equal(ENEMY_DEFS.enemy_fleshborn_demon.elite, true, 'Fleshborn must be an elite Demon Legion heavy');

const areaById = new Map(AREA_DEFS.map(area => [area.id, area]));
const allSolids = [...COLLIDERS, ...HOLLOW_COLLIDERS];
for (const spawn of SPAWN_REGIONS) {
  assert.ok(spawn.encounterId, `${spawn.id} must belong to an encounter`);
  const encounter = ENCOUNTER_DEFS[spawn.encounterId];
  assert.ok(encounter, `${spawn.id} references unknown encounter ${spawn.encounterId}`);
  assert.equal(encounter.areaId, spawn.areaId, `${spawn.id} encounter and spawn area must agree`);
  assert.ok(ENCOUNTER_GROUP_ARCHETYPES[spawn.archetype], `${spawn.id} uses unknown archetype ${spawn.archetype}`);
  assert.ok(Number(spawn.activationRange) >= 480, `${spawn.id} must declare bounded activation range`);
  if (spawn.archetype === 'ambush') assert.ok(Number(spawn.ambushRange) >= 80, `${spawn.id} ambush needs a real trigger radius`);
  if (spawn.patrolPath) {
    const area = areaById.get(spawn.areaId);
    assert.ok(spawn.patrolPath.length >= 3, `${spawn.id} patrol needs at least three waypoints`);
    for (const [x, y] of spawn.patrolPath) {
      assert.ok(x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height, `${spawn.id} waypoint ${x},${y} must stay inside ${area.id}`);
      const blocked = allSolids.some(c => c.mapId === spawn.mapId && Math.abs(x - c.x) < c.width / 2 + 14 && Math.abs(y - c.y) < c.height / 2 + 14);
      assert.equal(blocked, false, `${spawn.id} waypoint ${x},${y} must not sit inside a solid`);
    }
  }
}

const wildPopulation = SPAWN_REGIONS.filter(s => s.mapId === 'map_cinder_wilds').reduce((n, s) => n + s.count, 0);
assert.equal(wildPopulation, 35, 'Living Wilds should use composition rather than exceeding the established 35-enemy mobile budget');
assert.ok(SPAWN_REGIONS.some(s => s.encounterId === 'enc_causeway_tollgang' && s.enemyId === 'enemy_ash_scavenger'), 'Causeway needs a live scavenger group');
assert.ok(SPAWN_REGIONS.some(s => s.encounterId === 'enc_causeway_tollgang' && s.enemyId === 'enemy_ironbound_raider'), 'Causeway toll gang needs an armored enforcer');
assert.ok(SPAWN_REGIONS.some(s => s.encounterId === 'enc_cinderwood_stalker' && s.enemyId === 'enemy_ash_assassin'), 'Cinderwood needs its rare hostile-human ambush');
for (const enemyId of ['enemy_demon_scout', 'enemy_hellfire_demon', 'enemy_ashbone_demon', 'enemy_fleshborn_demon']) assert.ok(SPAWN_REGIONS.some(s => s.encounterId === 'enc_firstlight_demon_patrol' && s.enemyId === enemyId), `First-Light Scar must field ${enemyId}`);
assert.ok(SPAWN_REGIONS.filter(s => s.encounterId === 'enc_bone_road_patrol').length >= 3, 'Bone Road patrol should mix multiple undead roles');
assert.ok(SPAWN_REGIONS.filter(s => s.encounterId === 'enc_ashgrave_ritual').length >= 2, 'Ashgrave ritual should mix guard and caster roles');

const state = createDefaultState();
state.player.mapId = 'map_cinder_wilds';
const keys = new Set(assetDefsForMap(state, 'map_cinder_wilds').map(asset => asset.key));
for (const key of ['npc-olive-walk', 'ash-assassin-walk', 'ash-assassin-slash', 'demon-scout-walk', 'demon-scout-slash', 'hellfire-demon-walk', 'hellfire-demon-slash', 'ashbone-demon-walk', 'ashbone-demon-slash', 'fleshborn-demon-walk', 'fleshborn-demon-slash']) {
  assert.ok(keys.has(key), `Cinder Wilds asset package must include ${key}`);
}

const enemySource = await readFile(new URL('../dist/js/entities/Enemy.js', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
for (const token of ['activationRange', 'dormant', 'wakeFromAmbush', 'forceEncounterAggro', 'alertEncounter', 'patrolVelocity']) {
  assert.ok(enemySource.includes(token), `Enemy runtime must implement ${token}`);
}
assert.ok(worldSource.includes('alertEncounterGroup'), 'WorldScene must coordinate local encounter aggro');
assert.ok(worldSource.includes("action === 'scavenger'") && worldSource.includes("action === 'assassin'") && worldSource.includes("action === 'demonscout'") && worldSource.includes("action === 'fleshborn'"), 'Debug mode should expose ecology and Demon Combat actors for field testing');

console.log(`Encounter ecology smoke passed: ${Object.keys(ENCOUNTER_DEFS).length} groups, ${Object.keys(MONSTER_FAMILY_DEFS).length} families, ${wildPopulation} Wilds actor slots.`);
