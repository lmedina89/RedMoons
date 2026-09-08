import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '?debug=1' };
globalThis.Phaser = { Math: { Distance: { Between: (x1,y1,x2,y2) => Math.hypot(x2-x1,y2-y1) } } };

const { DEBUG_BATTLE_ARENA_DEF, DEBUG_ARENA_NAMED_SUMMONS, DEBUG_ARENA_UNIT_SUMMONS, DEBUG_ARENA_GROUPS } = await import('../dist/js/data/debugArena.js');
const { MAP_DEFS } = await import('../dist/js/data/world.js');
const { WARFRONT_COLLIDERS, WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');
const { CombatResolver } = await import('../dist/js/systems/CombatResolver.js');

assert.equal(DEBUG_BATTLE_ARENA_DEF.mapId, 'map_veil_warfront');
assert.equal(DEBUG_BATTLE_ARENA_DEF.maxActors, 14);
assert.deepEqual(Object.keys(DEBUG_ARENA_NAMED_SUMMONS), ['azrael','lailani','elexis','zerakoth','bloodwing']);
assert.equal(DEBUG_ARENA_NAMED_SUMMONS.azrael.faction, 'celestial');
assert.equal(DEBUG_ARENA_NAMED_SUMMONS.bloodwing.faction, 'monster');
assert.ok(MAP_DEFS.map_veil_warfront.entryPoints.battle_arena, 'Warfront must expose the isolated battle_arena debug entry');

for (const [key, spec] of Object.entries(DEBUG_ARENA_UNIT_SUMMONS)) {
  assert.ok(ENEMY_DEFS[spec.enemyId], `Arena unit ${key} must reference a real enemy definition`);
  assert.ok(['celestial','monster'].includes(spec.faction));
}
const armyCount = DEBUG_ARENA_GROUPS.armyClash.named.length + DEBUG_ARENA_GROUPS.armyClash.units.length;
assert.ok(armyCount <= DEBUG_BATTLE_ARENA_DEF.maxActors, 'Army Clash preset must stay under the mobile-conscious arena cap');
assert.equal(DEBUG_ARENA_GROUPS.allNamed.named.length, 5);

// Every authored spectator/summon anchor must be clear of visible-source Warfront solids.
const points = [DEBUG_BATTLE_ARENA_DEF.spectator, ...DEBUG_BATTLE_ARENA_DEF.celestialSlots, ...DEBUG_BATTLE_ARENA_DEF.infernalSlots];
const pointHits = (point, pad = 34) => WARFRONT_COLLIDERS.filter(c => point.x >= c.x - pad && point.x <= c.x + c.width + pad && point.y >= c.y - pad && point.y <= c.y + c.height + pad);
for (const point of points) assert.deepEqual(pointHits(point), [], `Arena anchor ${point.x},${point.y} must be collision-clear`);
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum,row)=>sum+row.count,0), 32, 'Debug arena must not alter the 32-actor production Warfront');

// Debug Warfront package must stream Azrael's compact crops so he can be summoned there.
const keys = new Set(assetDefsForMap({ player:{mapId:'map_veil_warfront'}, inventory:[], equipment:{} }, 'map_veil_warfront').map(a=>a.key));
for (const key of ['azrael-idle','azrael-slash','lailani-idle','elexis-idle','mythical-demon-idle','zerakoth-base-walk']) assert.ok(keys.has(key), `Debug arena Warfront package missing ${key}`);

// God Mode must hard-stop player damage before normal resolver math or presentation.
const resolver = Object.create(CombatResolver.prototype);
resolver.scene = { debugGodMode: true };
assert.equal(resolver.damagePlayer({ dead:false }, 99999, {}), 0);

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
for (const marker of [
  'Arena Controls','Celestial Summons','Infernal Summons',
  'data-debug="battlearena"','data-debug="godmode"','data-debug="arenastart"',
  'data-debug="arena_azrael"','data-debug="arena_lailani"','data-debug="arena_elexis"',
  'data-debug="arena_zerakoth"','data-debug="arena_bloodwing"','data-debug="arena_dreadknight"',
  'data-debug="arena_all_named"','data-debug="arena_army_clash"'
]) assert.ok(html.includes(marker), `Debug menu missing ${marker}`);

const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
assert.ok(worldSource.includes("registry.set('debugBattleArenaRequested', true)"));
assert.ok(worldSource.includes('Battle Arena is isolated; your real save was not changed.'));
assert.ok(worldSource.includes('this.debugGodMode ? [...(this.enemies || [])]'), 'God Mode must remove player from AI combat target pools');
assert.ok(worldSource.includes('enemy._debugBattleArena = true') && worldSource.includes('died: enemy => { enemy._debugArenaDefeated = true;'), 'Arena-spawned troops must use rewardless debug deaths');

console.log('Debug battle-arena smoke passed: categorized summon UI, individual/group faction staging, HOLD/start/reset/clear, 14-actor cap, collision-clear Warfront arena, save isolation, rewardless summons, Azrael Warfront streaming, and God Mode spectator safety.');
