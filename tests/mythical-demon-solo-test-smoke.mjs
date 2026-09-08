import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '?debug=1' };

const { MYTHICAL_DEMON_DEF, MYTHICAL_DEMON_SOLO_TEST_DEF } = await import('../dist/js/data/mythicalDemon.js');
const { MAP_DEFS, COLLIDERS } = await import('../dist/js/data/world.js');
const { WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');

assert.equal(MYTHICAL_DEMON_SOLO_TEST_DEF.mapId, 'map_veil_warfront');
assert.equal(MYTHICAL_DEMON_SOLO_TEST_DEF.entryId, 'mythical_demon_solo');
assert.ok(MAP_DEFS.map_veil_warfront.entryPoints.mythical_demon_solo, 'Warfront needs a dedicated Mythical Demon solo entry');
assert.equal(MYTHICAL_DEMON_SOLO_TEST_DEF.waves.length, 4);
assert.ok(MYTHICAL_DEMON_SOLO_TEST_DEF.waves.every(wave => wave.length >= 3 && wave.length <= 5), 'Solo waves must stay bounded to 3–5 celestials');
assert.ok(MYTHICAL_DEMON_SOLO_TEST_DEF.waves.some(wave => wave.filter(id => id === 'enemy_heavenly_guardian').length >= 2), 'Later waves should apply meaningful Guardian pressure');

const pointInside = (x, y, c, padding = 30) => x >= c.x - c.width / 2 - padding && x <= c.x + c.width / 2 + padding && y >= c.y - c.height / 2 - padding && y <= c.y + c.height / 2 + padding;
const solids = COLLIDERS.filter(row => row.mapId === MYTHICAL_DEMON_SOLO_TEST_DEF.mapId);
for (const [label, point] of Object.entries({ player: MYTHICAL_DEMON_SOLO_TEST_DEF.player, demon: MYTHICAL_DEMON_SOLO_TEST_DEF.demon, spawnCenter: MYTHICAL_DEMON_SOLO_TEST_DEF.spawnCenter })) {
  assert.equal(solids.some(c => pointInside(point.x, point.y, c)), false, `${label} anchor must be clear of Warfront solids`);
}
for (const offset of MYTHICAL_DEMON_SOLO_TEST_DEF.spawnOffsets) {
  const x = MYTHICAL_DEMON_SOLO_TEST_DEF.spawnCenter.x + offset.x, y = MYTHICAL_DEMON_SOLO_TEST_DEF.spawnCenter.y + offset.y;
  assert.equal(solids.some(c => pointInside(x, y, c, 18)), false, `Solo celestial slot ${x},${y} must be clear of Warfront solids`);
}
for (const spawn of WARFRONT_SPAWN_REGIONS) {
  const sx = spawn.x + spawn.width / 2, sy = spawn.y + spawn.height / 2;
  assert.ok(Math.hypot(MYTHICAL_DEMON_SOLO_TEST_DEF.spawnCenter.x - sx, MYTHICAL_DEMON_SOLO_TEST_DEF.spawnCenter.y - sy) > 850, `Solo arena must stay separated from production spawn ${spawn.id}`);
}

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
assert.ok(html.includes('data-debug="mythicaldemon"') && html.includes('Mythical Demon Field Test'));
assert.ok(html.includes('data-debug="mythicaldemonsolo"') && html.includes('Mythical Demon Solo Test'));
assert.ok(html.includes('data-debug="mythicaldemonai"') && html.includes('Mythical Demon AI Overlay'));
assert.ok(worldSource.includes('suspendProductionEnemiesForMythicalDemonSoloTest') && worldSource.includes('debug_mythical_demon_solo_wave_'), 'Solo harness must isolate production Warfront actors');
assert.ok(worldSource.includes('died: enemy => { enemy._mythicalDemonSoloDefeated = true; }'), 'Debug celestial deaths must bypass production reward handling');
assert.ok(worldSource.includes('enemy.update(time, delta, this.mythicalDemon, this.mythicalDemon ? [this.mythicalDemon] : [])'), 'Solo celestial troops must target the Mythical Demon only');
assert.ok(worldSource.includes("beforeCommit: () => this.registry.set('mythicalDemonSoloRequested', true)"), 'Solo request must arm only after destination preparation succeeds');
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum, row) => sum + row.count, 0), 32, 'Mythical field test must not alter the 32-actor production Warfront definition');
assert.deepEqual(MYTHICAL_DEMON_DEF.home, { mapId: 'map_veil_warfront', x: 2500, y: 1510 });

console.log('Mythical Demon solo-test smoke passed: isolated 3–5 celestial loop, safe anchors, no production rewards, demon-only targeting, prepared-map restart, and unchanged 32-actor production Warfront.');
