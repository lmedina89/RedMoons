import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { AREA_DEFS, BUILDING_DEFS, COLLIDERS, DEFAULT_MAP_ID, FALLEN_WATCH_WALLS, HOLLOW_COLLIDERS, MAP_DEFS, MAP_TRANSITIONS, SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const { MONSTER_FAMILY_DEFS, ENCOUNTER_GROUP_ARCHETYPES } = await import('../dist/js/data/encounters.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { ACTOR_COLLISION_KIND, colliderBlocksActor, detourVelocity, enemyIgnoresWorldCollision, pointInRectArea, segmentIntersectsCollider } = await import('../dist/js/systems/WorldNavigation.js');

assert.ok(FALLEN_WATCH_WALLS.length >= 5, 'Fallen Watch should seed traversal-heavy visible ruin walls');
for (const collider of [...COLLIDERS, ...HOLLOW_COLLIDERS]) {
  assert.equal(colliderBlocksActor(collider, ACTOR_COLLISION_KIND.PLAYER), true, `${collider.id} must block the player`);
  assert.equal(colliderBlocksActor(collider, ACTOR_COLLISION_KIND.ENEMY), true, `${collider.id} must block ordinary ground enemies`);
}
assert.equal(enemyIgnoresWorldCollision({ def: { traversal: { worldCollision: 'phase' } } }), true, 'Explicit phase traversal must be able to opt out later');
assert.equal(enemyIgnoresWorldCollision({ def: {} }), false, 'Ground actors must not phase by default');
for (const enemy of Object.values(ENEMY_DEFS)) assert.notEqual(enemy.traversal?.worldCollision, 'phase', `${enemy.id} must respect world solids in this build`);

const detourRight = detourVelocity(100, 0, 1);
const detourLeft = detourVelocity(100, 0, -1);
assert.ok(Math.abs(detourRight.vx) < 0.001 && detourRight.vy > 90, 'Positive detour should rotate forward movement 90 degrees');
assert.ok(Math.abs(detourLeft.vx) < 0.001 && detourLeft.vy < -90, 'Negative detour should rotate the opposite direction');
assert.ok(Math.abs(Math.hypot(detourRight.vx, detourRight.vy) - 92) < 0.001, 'Detour should preserve a predictable mobile-friendly steering magnitude');
const testWall = { x: 50, y: 50, width: 10, height: 100 };
assert.equal(segmentIntersectsCollider(0, 50, 100, 50, testWall), true, 'A line crossing a wall must be blocked');
assert.equal(segmentIntersectsCollider(0, 0, 40, 0, testWall), false, 'A line that never reaches the wall must remain clear');

for (const map of Object.values(MAP_DEFS)) {
  const areas = AREA_DEFS.filter(area => area.mapId === map.id);
  assert.deepEqual(new Set(areas.map(area => area.id)), new Set(map.areaIds), `${map.id} area registry must match map metadata`);
  for (let y = 16; y < map.height; y += 64) {
    for (let x = 16; x < map.width; x += 64) {
      const matches = areas.filter(area => pointInRectArea(area, x, y));
      assert.equal(matches.length, 1, `${map.id} position ${x},${y} must resolve to exactly one local area`);
    }
  }
}

// Map entries and transition centers must remain free of static solids. A map
// split is only useful if the prepared destination cannot immediately place the
// player inside a wall/building footprint.
const allSolids = [...COLLIDERS, ...HOLLOW_COLLIDERS];
const pointHitsSolid = (mapId, x, y, margin = 18) => allSolids.some(collider => {
  if (collider.mapId !== mapId) return false;
  return Math.abs(x - collider.x) < collider.width / 2 + margin && Math.abs(y - collider.y) < collider.height / 2 + margin;
});
for (const map of Object.values(MAP_DEFS)) {
  for (const [entryId, entry] of Object.entries(map.entryPoints || {})) {
    assert.equal(pointHitsSolid(map.id, entry.x, entry.y), false, `${map.id}/${entryId} must not spawn the player inside a static solid`);
  }
}
for (const transition of MAP_TRANSITIONS) {
  assert.equal(pointHitsSolid(transition.mapId, transition.x, transition.y, 8), false, `${transition.id} interaction center must remain in a visible opening`);
  assert.ok(MAP_DEFS[transition.destinationMapId]?.entryPoints?.[transition.destinationEntryId], `${transition.id} must target a real destination entry`);
}

const firstLight = AREA_DEFS.find(area => area.id === 'area_first_light_scar');
assert.ok(firstLight && pointInRectArea(firstLight, AZRAEL_DEF.home.x, AZRAEL_DEF.home.y), 'Azrael must physically inhabit the First-Light Scar area');
assert.ok(firstLight.encounter.families.some(entry => entry.id === 'celestial'), 'First-Light Scar must include celestial family identity');

for (const area of AREA_DEFS) {
  for (const family of area.encounter?.families || []) assert.ok(MONSTER_FAMILY_DEFS[family.id], `${area.id} references unknown monster family ${family.id}`);
  for (const group of area.encounter?.groups || []) assert.ok(ENCOUNTER_GROUP_ARCHETYPES[group], `${area.id} references unknown group archetype ${group}`);
}

for (const spawn of SPAWN_REGIONS) {
  assert.ok(spawn.areaId, `${spawn.id} must identify its intended local area`);
  const area = AREA_DEFS.find(candidate => candidate.id === spawn.areaId);
  assert.ok(area, `${spawn.id} references unknown area ${spawn.areaId}`);
  const mapId = spawn.mapId || DEFAULT_MAP_ID;
  assert.equal(area.mapId, mapId, `${spawn.id} area must belong to its spawn map`);
  const centerX = spawn.x + spawn.width / 2;
  const centerY = spawn.y + spawn.height / 2;
  assert.equal(pointInRectArea(area, centerX, centerY), true, `${spawn.id} center should sit inside its intended area`);
  const mapColliders = mapId === 'map_ashfall_hollow' ? HOLLOW_COLLIDERS : COLLIDERS.filter(collider => collider.mapId === mapId);
  const overlapsSolid = mapColliders.some(collider => {
    const left = collider.x - collider.width / 2, right = collider.x + collider.width / 2;
    const top = collider.y - collider.height / 2, bottom = collider.y + collider.height / 2;
    return spawn.x < right && spawn.x + spawn.width > left && spawn.y < bottom && spawn.y + spawn.height > top;
  });
  assert.equal(overlapsSolid, false, `${spawn.id} region should not overlap a static solid and create trapped respawns`);
}

const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const enemySource = await readFile(new URL('../dist/js/entities/Enemy.js', import.meta.url), 'utf8');
assert.ok(worldSource.includes('this.physics.add.collider(\n      this.enemyGroup,\n      this.obstacles') && worldSource.includes('enemyObstacleProcess') && worldSource.includes('onEnemyObstacleCollision'), 'WorldScene must wire enemies to static world collision without enemy/player separation');
assert.ok(enemySource.includes('onWorldCollision(obstacle, time)') && enemySource.includes("this.state = 'obstructed'") && enemySource.includes('detourVelocity') && enemySource.includes('hasWorldLineOfSight'), 'Enemy AI must steer around blockers, avoid melee through walls and disengage from unreachable targets instead of pushing through walls forever');
assert.ok(BUILDING_DEFS.length >= 9, 'Rebuilt Refuge should preserve a substantial visible building/collision layout');

console.log(`World navigation smoke passed: ${AREA_DEFS.length} areas, ${COLLIDERS.length + HOLLOW_COLLIDERS.length} ground-solid colliders, ${Object.keys(MONSTER_FAMILY_DEFS).length} family seeds.`);
