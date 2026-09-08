import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '?debug=1' };

const { ELEXIS_DEF, ELEXIS_SOLO_TEST_DEF } = await import('../dist/js/data/elexis.js');
const { MAP_DEFS, COLLIDERS } = await import('../dist/js/data/world.js');
const { WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');

assert.equal(ELEXIS_SOLO_TEST_DEF.mapId, 'map_veil_warfront');
assert.equal(ELEXIS_SOLO_TEST_DEF.entryId, 'elexis_solo');
assert.ok(MAP_DEFS.map_veil_warfront.entryPoints.elexis_solo, 'Warfront needs a dedicated El’exis solo entry');
assert.equal(ELEXIS_SOLO_TEST_DEF.waves.length, 4);
assert.ok(ELEXIS_SOLO_TEST_DEF.waves.some(wave => wave.filter(id => id === 'enemy_fleshborn_demon').length >= 2), 'Heavy wave should stress El’exis with multiple Fleshborn');
assert.ok(ELEXIS_SOLO_TEST_DEF.waves.every(wave => wave.length >= 3 && wave.length <= 5), 'Solo waves stay bounded to 3–5 demons');

const pointInside = (x, y, c, padding = 30) => (
  x >= c.x - c.width / 2 - padding && x <= c.x + c.width / 2 + padding &&
  y >= c.y - c.height / 2 - padding && y <= c.y + c.height / 2 + padding
);
const solids = COLLIDERS.filter(row => row.mapId === ELEXIS_SOLO_TEST_DEF.mapId);
for (const [label, point] of Object.entries({ player: ELEXIS_SOLO_TEST_DEF.player, elexis: ELEXIS_SOLO_TEST_DEF.elexis, spawnCenter: ELEXIS_SOLO_TEST_DEF.spawnCenter })) {
  assert.equal(solids.some(c => pointInside(point.x, point.y, c)), false, `${label} anchor must be clear of Warfront solids`);
}
for (const offset of ELEXIS_SOLO_TEST_DEF.spawnOffsets) {
  const x = ELEXIS_SOLO_TEST_DEF.spawnCenter.x + offset.x;
  const y = ELEXIS_SOLO_TEST_DEF.spawnCenter.y + offset.y;
  assert.equal(solids.some(c => pointInside(x, y, c, 18)), false, `Solo demon slot ${x},${y} must be clear of Warfront solids`);
}
for (const spawn of WARFRONT_SPAWN_REGIONS) {
  const sx = spawn.x + spawn.width / 2, sy = spawn.y + spawn.height / 2;
  assert.ok(Math.hypot(ELEXIS_SOLO_TEST_DEF.spawnCenter.x - sx, ELEXIS_SOLO_TEST_DEF.spawnCenter.y - sy) > 850, `El’exis solo arena must stay separated from production spawn ${spawn.id}`);
}

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
assert.ok(html.includes('data-debug="elexis"') && html.includes('El’exis Field Test'));
assert.ok(html.includes('data-debug="elexissolo"') && html.includes('El’exis Solo Test'));
assert.ok(html.includes('data-debug="elexisai"') && html.includes('El’exis AI Overlay'));
assert.ok(worldSource.includes('suspendProductionEnemiesForElexisSoloTest') && worldSource.includes('debug_elexis_solo_wave_'), 'Solo harness must isolate production Warfront actors');
assert.ok(worldSource.includes('died: enemy => { enemy._elexisSoloDefeated = true; }'), 'Solo deaths must bypass production rewards');
assert.ok(worldSource.includes('enemy.update(time, delta, this.elexis, this.elexis ? [this.elexis] : [])'), 'Solo demons must be driven against El’exis only');
assert.ok(worldSource.includes("beforeCommit: () => this.registry.set('elexisSoloRequested', true)"), 'Solo request must arm only after map assets prepare successfully');
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum, row) => sum + row.count, 0), 32, 'El’exis test must not alter the 32-actor production Warfront');
assert.deepEqual(ELEXIS_DEF.home, { mapId: 'map_veil_warfront', x: 4860, y: 1160 });

console.log('El’exis solo-test smoke passed: isolated bounded demon loop, safe anchors, no production rewards, El’exis-only targeting, deterministic prepared-map restart, and unchanged 32-actor Warfront population.');
