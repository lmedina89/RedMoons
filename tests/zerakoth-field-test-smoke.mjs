import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '?debug=1' };
globalThis.Phaser = { Math: { Distance: { Between: (x1,y1,x2,y2) => Math.hypot(x2-x1,y2-y1) } } };

const { ZERAKOTH_DEF, ZERAKOTH_SPAWN_DEF } = await import('../dist/js/data/zerakoth.js');
const { INFERNAL_LEVEL_HIERARCHY, MYTHIC_LEVEL_HIERARCHY } = await import('../dist/js/data/powerTiers.js');
const { ENEMY_ABILITY_DEFS } = await import('../dist/js/data/abilities.js');
const { PROJECTILE_DEFS } = await import('../dist/js/data/projectiles.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { LAYER_ASSETS } = await import('../dist/js/data/assets.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');
const { areHostile } = await import('../dist/js/data/factions.js');
const { CombatSystem } = await import('../dist/js/systems/CombatSystem.js');
const { Zerakoth } = await import('../dist/js/entities/Zerakoth.js');

assert.deepEqual(INFERNAL_LEVEL_HIERARCHY.zerakoth, { internalLevel: 60, threatTier: 'commander' });
assert.equal(ZERAKOTH_DEF.internalLevel, 60);
assert.equal(ZERAKOTH_DEF.threatTier, 'commander');
assert.equal(ZERAKOTH_DEF.name, 'Zerakoth');
assert.equal(ZERAKOTH_DEF.title, 'Warden of the Pit');
assert.equal(ZERAKOTH_DEF.levelDisplay, '???');
assert.equal(ZERAKOTH_DEF.faction, 'monster');
assert.equal(ZERAKOTH_DEF.fixedLoadout.chest, 'armor_zerakoth_warplate_npc');
assert.equal(ZERAKOTH_DEF.fixedLoadout.weapon, 'weapon_wardens_hellblade_npc');
assert.equal(ZERAKOTH_DEF.abilities.length, 6);
assert.ok(ZERAKOTH_DEF.maxHp > ENEMY_DEFS.enemy_infernal_dreadknight.maxHp * 3, 'Lv60 commander must decisively exceed Lv30 elite durability');
assert.ok(ZERAKOTH_DEF.maxHp < 9000 && ZERAKOTH_DEF.attack < 300, 'Lv60 commander must remain clearly below Lv135 Bloodwing mythic budget');
assert.equal(MYTHIC_LEVEL_HIERARCHY.mythicalDemon.internalLevel, 135);
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.ancientDemonLord, { internalLevel: 160, threatTier: 'apex', reserved: true });

assert.ok(ITEM_DEFS.armor_zerakoth_warplate_npc?.npcOnly);
assert.equal(ITEM_DEFS.armor_zerakoth_warplate_npc.visual, 'zerakoth_warplate');
assert.ok(ITEM_DEFS.weapon_wardens_hellblade_npc?.npcOnly);
assert.equal(ITEM_DEFS.weapon_wardens_hellblade_npc.visual, 'weapon_wardens_hellblade');
for (const layer of ['zerakoth_base', 'zerakoth_warplate', 'weapon_wardens_hellblade_fg']) assert.ok(LAYER_ASSETS[layer], `Missing fixed Zerakoth layer ${layer}`);

const ids = ['zerakoth_wardens_rend','zerakoth_pitbound_rush','zerakoth_ashen_decree','zerakoth_hellbrand_volley','zerakoth_ward_pit','zerakoth_pitfall_eruption'];
for (const id of ids) {
  const ability = ENEMY_ABILITY_DEFS[id];
  assert.ok(ability, `Missing Zerakoth skill ${id}`);
  assert.equal(ability.telegraph, 'warden', `${id} must use Zerakoth's dark commander VFX language`);
}
assert.equal(ENEMY_ABILITY_DEFS.zerakoth_ward_pit.type, 'self_guard');
assert.equal(ENEMY_ABILITY_DEFS.zerakoth_pitfall_eruption.type, 'targeted_aoe');
assert.equal(ENEMY_ABILITY_DEFS.zerakoth_pitfall_eruption.worthyTargetTier, 'mythic');
assert.equal(ENEMY_ABILITY_DEFS.zerakoth_pitfall_eruption.minCluster, 2);
assert.equal(ENEMY_ABILITY_DEFS.zerakoth_hellbrand_volley.projectileDelays.length, 4);
assert.equal(PROJECTILE_DEFS.warden_hellbrand.wallCollision, true);
assert.equal(PROJECTILE_DEFS.warden_hellbrand.trail, 'warden');

// Worthy-single-target commander decision: one ordinary target must not unlock
// Pitfall, while one mythic target does. Ward is suppressed by full HP.
const makeAI = target => {
  const actor = Object.create(Zerakoth.prototype);
  actor.def = ZERAKOTH_DEF; actor.hp = ZERAKOTH_DEF.maxHp; actor.abilityCooldowns = new Map(); actor.majorAbilityLockUntil = 0;
  actor.target = target; actor.sprite = { x: 0, y: 0 };
  actor.scene = { hasWorldLineOfSight: () => true };
  actor.combat = { statuses: { has: () => false }, hostileTargetsFor: () => [target] };
  return actor;
};
const ordinaryCelestial = { faction:'celestial', def:{ faction:'celestial', threatTier:'ordinary', name:'Sentinel' }, sprite:{x:200,y:0,active:true}, state:'idle', dead:false };
const mythicCelestial = { faction:'celestial', def:{ faction:'celestial', threatTier:'mythic', name:'Mythic' }, sprite:{x:200,y:0,active:true}, state:'idle', dead:false };
assert.notEqual(makeAI(ordinaryCelestial).availableAbility(1000, 200, ordinaryCelestial.sprite)?.id, 'zerakoth_pitfall_eruption');
assert.equal(makeAI(mythicCelestial).availableAbility(1000, 200, mythicCelestial.sprite)?.id, 'zerakoth_pitfall_eruption');

// Shared faction contract protects ordinary demons, the Lv30 Dreadknight and
// Bloodwing from every generic Zerakoth attack path.
const zerakothActor = { faction:'monster', def:ZERAKOTH_DEF, sprite:{active:true} };
const normalDemon = { faction:'monster', def:ENEMY_DEFS.enemy_hellfire_demon, sprite:{active:true} };
const dreadknight = { faction:'monster', def:ENEMY_DEFS.enemy_infernal_dreadknight, sprite:{active:true} };
const bloodwing = { faction:'monster', def:{ faction:'monster', threatTier:'mythic', name:'Bloodwing Scourge' }, sprite:{active:true} };
const celestial = { faction:'celestial', def:ENEMY_DEFS.enemy_celestial_footsoldier, sprite:{active:true} };
for (const ally of [normalDemon,dreadknight,bloodwing]) assert.equal(areHostile(zerakothActor, ally), false);
assert.equal(areHostile(zerakothActor, celestial), true);
const combatStub = { combatants: () => [zerakothActor,normalDemon,dreadknight,bloodwing,celestial] };
assert.deepEqual(CombatSystem.prototype.hostileTargetsFor.call(combatStub, zerakothActor), [celestial]);

assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum,row)=>sum+row.count,0), 32, 'Commander field test must not change production population');
assert.equal(ZERAKOTH_SPAWN_DEF.debugOnly, true);
const keys = new Set(assetDefsForMap({ player:{mapId:'map_veil_warfront'}, inventory:[], equipment:{} }, 'map_veil_warfront').map(a=>a.key));
for (const key of ['zerakoth-base-walk','zerakoth-base-slash','zerakoth-base-hurt','zerakoth-warplate-walk','zerakoth-warplate-slash','zerakoth-warplate-hurt','wardens-hellblade-walk','wardens-hellblade-slash']) assert.ok(keys.has(key), `Debug Warfront must stream ${key}`);

const expected = new Map([
 ['zerakoth-base-walk.png',[576,256]],['zerakoth-base-slash.png',[384,256]],['zerakoth-base-hurt.png',[384,64]],
 ['zerakoth-warplate-walk.png',[576,256]],['zerakoth-warplate-slash.png',[384,256]],['zerakoth-warplate-hurt.png',[384,64]],
 ['wardens-hellblade-walk.png',[576,256]],['wardens-hellblade-slash.png',[768,512]]
]);
for (const [name,dims] of expected) {
 const bytes=await readFile(new URL(`../dist/assets/npcs/zerakoth/${name}`, import.meta.url));
 assert.equal(bytes.toString('ascii',1,4),'PNG');
 assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],dims);
}
const source = await readFile(new URL('../dist/js/systems/CombatSystem.js', import.meta.url), 'utf8');
assert.ok(source.includes("ability.type === 'targeted_aoe'") && source.includes('sourceActor: enemy'), 'Commander AoE/projectile must retain common source/faction attribution');
const html=await readFile(new URL('../dist/index.html', import.meta.url),'utf8');
assert.ok(html.includes('Zerakoth Field Test') && html.includes('Zerakoth Solo Test') && html.includes('Zerakoth AI Overlay'));

console.log('Zerakoth field-test smoke passed: Lv60 commander, fixed warplate + Hellblade, six dark/fiery skills, worthy-target Pitfall, shared Guard/projectile paths, demon friendly-fire protection, and unchanged 32-actor Warfront.');
