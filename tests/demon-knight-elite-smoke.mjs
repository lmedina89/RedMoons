import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '?debug=1' };

const { INFERNAL_LEVEL_HIERARCHY } = await import('../dist/js/data/powerTiers.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { ENEMY_ABILITY_DEFS } = await import('../dist/js/data/abilities.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { LAYER_ASSETS } = await import('../dist/js/data/assets.js');
const { DEBUG_SPAWN_REGIONS, SPAWN_REGIONS, COLLIDERS } = await import('../dist/js/data/world.js');
const { WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');
const { Enemy } = await import('../dist/js/entities/Enemy.js');
const { CombatSystem } = await import('../dist/js/systems/CombatSystem.js');
const { areHostile } = await import('../dist/js/data/factions.js');

assert.deepEqual(INFERNAL_LEVEL_HIERARCHY.demonKnight, { internalLevel: 30, threatTier: 'elite' });
assert.deepEqual(INFERNAL_LEVEL_HIERARCHY.zerakoth, { internalLevel: 60, threatTier: 'commander' });

const knight = ENEMY_DEFS.enemy_infernal_dreadknight;
assert.ok(knight, 'Infernal Dreadknight definition must exist');
assert.equal(knight.level, 30);
assert.equal(knight.threatTier, 'elite');
assert.equal(knight.elite, true);
assert.equal(knight.family, 'demon');
assert.equal(knight.subfaction, 'demon_legion');
assert.equal(knight.layered, true);
assert.equal(knight.baseVisual, 'enemy_demon_knight_base');
assert.deepEqual(knight.fixedLoadout, { weapon: 'weapon_pitsteel_sword_npc' });
assert.deepEqual(knight.abilities, ['blackguard_aegis', 'ember_lunge', 'dreadknight_cinder_burst', 'hellblade_cleave']);
assert.ok(knight.maxHp > ENEMY_DEFS.enemy_fleshborn_demon.maxHp * 4, 'Lv30 knight must sit decisively above fodder/low elites');
assert.ok(knight.maxHp < 3000 && knight.attack < 120, 'Lv30 elite must leave meaningful room below the planned Lv60 commander');

const pitsteel = ITEM_DEFS.weapon_pitsteel_sword_npc;
assert.ok(pitsteel?.npcOnly && pitsteel.playerEquipReady === false, 'Pitsteel sword must stay NPC-only');
assert.equal(pitsteel.visual, 'weapon_pitsteel_sword');
assert.ok(LAYER_ASSETS.enemy_demon_knight_base, 'Demon Knight needs its dedicated blackened armor base');
assert.ok(LAYER_ASSETS.weapon_pitsteel_sword_fg, 'Demon Knight needs its dedicated Pitsteel sword layer');

for (const id of knight.abilities) {
  const ability = ENEMY_ABILITY_DEFS[id];
  assert.ok(ability, `Missing Dreadknight ability ${id}`);
  assert.ok(['blood', 'hellfire'].includes(ability.telegraph), `${id} must use dark/fiery infernal telegraph language`);
  assert.notEqual(ability.telegraph, 'celestial');
}
assert.equal(ENEMY_ABILITY_DEFS.blackguard_aegis.type, 'self_guard');
assert.ok(ENEMY_ABILITY_DEFS.blackguard_aegis.durationMs >= 4500 && ENEMY_ABILITY_DEFS.blackguard_aegis.durationMs <= 6500);
assert.equal(ENEMY_ABILITY_DEFS.ember_lunge.type, 'dash_strike');
assert.equal(ENEMY_ABILITY_DEFS.dreadknight_cinder_burst.type, 'radial_aoe');
assert.equal(ENEMY_ABILITY_DEFS.hellblade_cleave.type, 'melee_reach');

// Low-health AI should prefer its defensive Aegis; healthy AI should not waste it.
const makeKnightAI = hp => {
  const actor = Object.create(Enemy.prototype);
  actor.def = knight; actor.hp = hp; actor.abilityCooldowns = new Map();
  actor.combat = { statuses: { has: () => false } };
  actor.scene = { hasWorldLineOfSight: () => true };
  actor.sprite = { x: 0, y: 0 };
  return actor;
};
assert.equal(makeKnightAI(knight.maxHp * 0.5).availableAbility(1000, 100, { x: 100, y: 0 })?.id, 'blackguard_aegis');
assert.notEqual(makeKnightAI(knight.maxHp).availableAbility(1000, 100, { x: 100, y: 0 })?.id, 'blackguard_aegis');

// Shared faction filtering is the friendly-fire contract: demons are allies,
// while Celestials remain valid hostile targets for every shared enemy ability.
const knightActor = { faction: 'monster', def: knight, sprite: { active: true } };
const fellowDemon = { faction: 'monster', def: ENEMY_DEFS.enemy_hellfire_demon, sprite: { active: true } };
const celestial = { faction: 'celestial', def: ENEMY_DEFS.enemy_celestial_footsoldier, sprite: { active: true } };
assert.equal(areHostile(knightActor, fellowDemon), false, 'Demon Knight must never regard another demon as hostile');
assert.equal(areHostile(knightActor, celestial), true, 'Demon Knight must regard Celestials as hostile');
const combatStub = { combatants: () => [knightActor, fellowDemon, celestial] };
assert.deepEqual(CombatSystem.prototype.hostileTargetsFor.call(combatStub, knightActor), [celestial], 'Shared AoE/dash/melee target list must exclude demon allies');

// Debug-only field test keeps production Warfront population exactly 32.
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((n, row) => n + row.count, 0), 32);
assert.equal(SPAWN_REGIONS.filter(row => row.mapId === 'map_veil_warfront' && row.enemyId === knight.id).length, 0, 'Lv30 knight must not silently alter production Warfront balance yet');
const { MAP_DEFS } = await import('../dist/js/data/world.js');
const testEntry = MAP_DEFS.map_veil_warfront.entryPoints.demon_knight_test;
assert.ok(testEntry, 'Warfront must expose a direct Demon Knight test entry');
const debugSpawn = DEBUG_SPAWN_REGIONS.find(row => row.enemyId === knight.id);
assert.ok(debugSpawn?.debugOnly && debugSpawn.mapId === 'map_veil_warfront', 'Demon Knight must have one isolated Warfront debug spawn');
const solids = COLLIDERS.filter(row => row.mapId === debugSpawn.mapId);
const inside = (x, y, c, pad = 34) => x >= c.x - c.width / 2 - pad && x <= c.x + c.width / 2 + pad && y >= c.y - c.height / 2 - pad && y <= c.y + c.height / 2 + pad;
assert.equal(solids.some(c => inside(debugSpawn.x + debugSpawn.width / 2, debugSpawn.y + debugSpawn.height / 2, c)), false, 'Demon Knight debug spawn must be clear of Warfront solids');
assert.equal(solids.some(c => inside(testEntry.x, testEntry.y, c)), false, 'Demon Knight test entry must be clear of Warfront solids');

const keys = new Set(assetDefsForMap({ player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} }, 'map_veil_warfront').map(x => x.key));
for (const key of ['demon-knight-walk', 'demon-knight-slash', 'demon-knight-hurt', 'pitsteel-sword-walk', 'pitsteel-sword-slash']) {
  assert.ok(keys.has(key), `Debug Warfront package must stream ${key}`);
}

const expected = new Map([
  ['demon-knight-walk.png', [576, 256]], ['demon-knight-slash.png', [384, 256]], ['demon-knight-hurt.png', [384, 64]],
  ['pitsteel-sword-walk.png', [576, 256]], ['pitsteel-sword-slash.png', [768, 512]]
]);
for (const [name, dims] of expected) {
  const bytes = await readFile(new URL(`../dist/assets/enemies/demon-knight/${name}`, import.meta.url));
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], dims, `${name} must keep verified LPC geometry`);
}

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
assert.ok(html.includes('Demon Knight Elite Test') && worldSource.includes("action === 'demonknight'"), 'Physical-device test button/action must exist');

console.log('Demon Knight elite smoke passed: Lv30 infernal elite, dark armor + Pitsteel sword, four evil/fiery abilities, self-Guard behavior, demon friendly-fire protection, debug-only Warfront field test, and unchanged 32-slot production population.');
