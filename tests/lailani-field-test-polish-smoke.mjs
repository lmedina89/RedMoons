import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '?debug=1' };

const { LAILANI_DEF, LAILANI_SOLO_TEST_DEF } = await import('../dist/js/data/lailani.js');
const { MAP_DEFS, COLLIDERS } = await import('../dist/js/data/world.js');
const { WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');

assert.equal(LAILANI_SOLO_TEST_DEF.mapId, 'map_veil_warfront');
assert.equal(LAILANI_SOLO_TEST_DEF.entryId, 'lailani_solo');
assert.ok(MAP_DEFS.map_veil_warfront.entryPoints.lailani_solo, 'Warfront needs a dedicated solo-test entry');
assert.equal(LAILANI_SOLO_TEST_DEF.waves.length, 4, 'Solo loop should cycle four authored observation waves');
assert.ok(LAILANI_SOLO_TEST_DEF.waves.some(wave => wave.includes('enemy_fleshborn_demon')), 'At least one observation wave must pressure Lailani with a Fleshborn');
assert.ok(LAILANI_SOLO_TEST_DEF.waves.every(wave => wave.length >= 3 && wave.length <= 5), 'Solo waves must stay bounded to 3–5 demons');
assert.ok(LAILANI_SOLO_TEST_DEF.nextWaveDelayMs >= 1500 && LAILANI_SOLO_TEST_DEF.nextWaveDelayMs <= 3000, 'Wave recycle delay should be brief but readable');

const pointInside = (x, y, c, padding = 30) => (
  x >= c.x - c.width / 2 - padding && x <= c.x + c.width / 2 + padding &&
  y >= c.y - c.height / 2 - padding && y <= c.y + c.height / 2 + padding
);
const solids = COLLIDERS.filter(row => row.mapId === LAILANI_SOLO_TEST_DEF.mapId);
for (const [label, point] of Object.entries({ player: LAILANI_SOLO_TEST_DEF.player, lailani: LAILANI_SOLO_TEST_DEF.lailani, spawnCenter: LAILANI_SOLO_TEST_DEF.spawnCenter })) {
  assert.equal(solids.some(c => pointInside(point.x, point.y, c)), false, `${label} solo-test anchor must be clear of Warfront solids`);
}
for (const offset of LAILANI_SOLO_TEST_DEF.spawnOffsets) {
  const x = LAILANI_SOLO_TEST_DEF.spawnCenter.x + offset.x;
  const y = LAILANI_SOLO_TEST_DEF.spawnCenter.y + offset.y;
  assert.equal(solids.some(c => pointInside(x, y, c, 18)), false, `Solo demon slot ${x},${y} must be clear of Warfront solids`);
}

// The authored arena sits away from every production spawn. Normal armies are
// suspended when the loop starts, but this distance guard prevents accidental
// overlap if the debug setup is refactored later.
const center = LAILANI_SOLO_TEST_DEF.spawnCenter;
for (const spawn of WARFRONT_SPAWN_REGIONS) {
  const sx = spawn.x + spawn.width / 2;
  const sy = spawn.y + spawn.height / 2;
  assert.ok(Math.hypot(center.x - sx, center.y - sy) > 850, `Solo arena must stay separated from production spawn ${spawn.id}`);
}

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const lailaniSource = await readFile(new URL('../dist/js/entities/Lailani.js', import.meta.url), 'utf8');
assert.ok(html.includes('data-debug="lailanisolo"') && html.includes('Lailani Solo Test'), 'Debug tray must expose the solo observation loop');
assert.ok(worldSource.includes('suspendProductionEnemiesForLailaniSoloTest') && worldSource.includes('debug_lailani_solo_wave_'), 'Solo loop must suspend production actors and namespace its own waves');
assert.ok(worldSource.includes('died: enemy => { enemy._lailaniSoloDefeated = true; }'), 'Solo-wave deaths must bypass production reward handling');
assert.ok(worldSource.includes('enemy.update(time, delta, this.lailani, this.lailani ? [this.lailani] : [])'), 'Solo demons must target only Lailani');
assert.ok(worldSource.includes('beforeCommit: () => this.registry.set(\'lailaniSoloRequested\', true)') && worldSource.includes('this.transitionToMap(LAILANI_SOLO_TEST_DEF.mapId, LAILANI_SOLO_TEST_DEF.entryId'), 'Solo command must restart into a clean deterministic Warfront scene without arming the request before asset preparation succeeds');
assert.ok(lailaniSource.includes("'LAILANI'") && lailaniSource.includes("'TRANSCENDENT SERAPH'") && lailaniSource.includes('fillRoundedRect(-112, -23, 224, 48, 10)'), 'Lailani mythic plate must separate her name/title in a wider readable frame');
assert.ok(lailaniSource.includes('relocateForFieldTest'), 'Lailani must expose a safe test-only relocation reset');

// Production identity remains unchanged by the debug harness.
assert.deepEqual(LAILANI_DEF.home, { mapId: 'map_veil_warfront', x: 3660, y: 1510 });
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum, row) => sum + row.count, 0), 32, 'Solo loop must not inflate the 32-actor production Warfront data');

console.log('Lailani field-test polish smoke passed: readable mythic plate, isolated debug-only solo arena, bounded recyclable demon waves, zero production reward hook, Lailani-only targeting, and unchanged 32-actor Warfront population.');
