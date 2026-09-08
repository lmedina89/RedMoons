import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
globalThis.location = { search: '?debug=1' };
const { ZERAKOTH_DEF, ZERAKOTH_SOLO_TEST_DEF } = await import('../dist/js/data/zerakoth.js');
const { MAP_DEFS } = await import('../dist/js/data/world.js');
const { WARFRONT_COLLIDERS, WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');

assert.equal(ZERAKOTH_SOLO_TEST_DEF.mapId,'map_veil_warfront');
assert.equal(ZERAKOTH_SOLO_TEST_DEF.entryId,'zerakoth_solo');
assert.ok(MAP_DEFS.map_veil_warfront.entryPoints.zerakoth_test);
assert.ok(MAP_DEFS.map_veil_warfront.entryPoints.zerakoth_solo);
assert.equal(ZERAKOTH_SOLO_TEST_DEF.waves.length,4);
assert.ok(ZERAKOTH_SOLO_TEST_DEF.waves.every(w=>w.length>=3&&w.length<=5));

const inside=(x,y,c,pad=28)=>x>=c.x-pad&&x<=c.x+c.width+pad&&y>=c.y-pad&&y<=c.y+c.height+pad;
for (const [label,p] of Object.entries({player:ZERAKOTH_SOLO_TEST_DEF.player,zerakoth:ZERAKOTH_SOLO_TEST_DEF.zerakoth,spawnCenter:ZERAKOTH_SOLO_TEST_DEF.spawnCenter})) {
 assert.equal(WARFRONT_COLLIDERS.some(c=>inside(p.x,p.y,c)),false,`${label} anchor must be clear`);
}
for (const offset of ZERAKOTH_SOLO_TEST_DEF.spawnOffsets) {
 const x=ZERAKOTH_SOLO_TEST_DEF.spawnCenter.x+offset.x,y=ZERAKOTH_SOLO_TEST_DEF.spawnCenter.y+offset.y;
 assert.equal(WARFRONT_COLLIDERS.some(c=>inside(x,y,c,18)),false,`wave slot ${x},${y} must be clear`);
}
for (const spawn of WARFRONT_SPAWN_REGIONS) {
 const sx=spawn.x+spawn.width/2,sy=spawn.y+spawn.height/2;
 assert.ok(Math.hypot(ZERAKOTH_SOLO_TEST_DEF.spawnCenter.x-sx,ZERAKOTH_SOLO_TEST_DEF.spawnCenter.y-sy)>650,`solo arena too near ${spawn.id}`);
}
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((n,row)=>n+row.count,0),32);

const world=await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url),'utf8');
assert.ok(world.includes('suspendProductionEnemiesForZerakothSoloTest'));
assert.ok(world.includes('debug_zerakoth_solo_wave_'));
assert.ok(world.includes('died: enemy => { enemy._zerakothSoloDefeated = true; }'), 'solo deaths must bypass production rewards');
assert.ok(world.includes('enemy.update(time, delta, this.zerakoth, this.zerakoth ? [this.zerakoth] : [])'), 'solo Celestials must target Zerakoth only');
assert.ok(world.includes("beforeCommit: () => this.registry.set('zerakothSoloRequested', true)"), 'prepared-map restart gate required');
assert.equal(ZERAKOTH_DEF.xp,0); assert.deepEqual(ZERAKOTH_DEF.currency,[0,0]); assert.deepEqual(ZERAKOTH_DEF.loot,[]);

console.log('Zerakoth solo-test smoke passed: isolated 3–5 Celestial loop, safe southern anchors, rewardless deaths, Zerakoth-only targeting, prepared-map restart, and unchanged production population.');
