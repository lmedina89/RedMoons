import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.location = { search: '' };

const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { ENEMY_ABILITY_DEFS } = await import('../dist/js/data/abilities.js');
const { PROJECTILE_DEFS } = await import('../dist/js/data/projectiles.js');
const { ANIMATION_GEOMETRIES, ASSET_DEFS, LAYER_ASSETS } = await import('../dist/js/data/assets.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { SPAWN_REGIONS } = await import('../dist/js/data/world.js');

const demonKits = {
  enemy_demon_scout: ['abyss_rend', 'abyss_bolt', 'void_pulse'],
  enemy_hellfire_demon: ['burning_rend', 'hellfire_orb', 'cinder_burst'],
  enemy_ashbone_demon: ['bone_rend', 'soul_shard', 'ashshock'],
  enemy_fleshborn_demon: ['flesh_rend', 'predators_rush', 'blood_lance', 'flesh_rupture']
};

for (const [enemyId, abilityIds] of Object.entries(demonKits)) {
  const enemy = ENEMY_DEFS[enemyId];
  assert.ok(enemy, `Missing demon ${enemyId}`);
  assert.equal(enemy.family, 'demon', `${enemyId} must belong to Demon Legion family`);
  assert.deepEqual(enemy.abilities, abilityIds, `${enemyId} must use its approved demon kit`);
  for (const id of abilityIds) {
    const ability = ENEMY_ABILITY_DEFS[id];
    assert.ok(ability, `${enemyId} references missing ability ${id}`);
    assert.ok(ability.cooldownMs >= 1500, `${id} must not spam every frame`);
    assert.ok(ability.windupMs >= 400, `${id} needs a readable telegraph/windup`);
    assert.ok(ability.damageMultiplier > 0 && ability.damageMultiplier <= 1.2, `${id} damage should stay in normal-monster scale`);
  }
}

for (const [abilityId, projectileId] of [
  ['abyss_bolt', 'abyss_bolt'],
  ['hellfire_orb', 'hellfire_orb'],
  ['soul_shard', 'soul_shard'],
  ['blood_lance', 'blood_lance']
]) {
  assert.equal(ENEMY_ABILITY_DEFS[abilityId].projectileId, projectileId, `${abilityId} projectile wiring mismatch`);
  assert.ok(PROJECTILE_DEFS[projectileId], `Missing projectile ${projectileId}`);
  assert.equal(PROJECTILE_DEFS[projectileId].wallCollision, true, `${projectileId} must respect world walls`);
}

const flesh = ENEMY_DEFS.enemy_fleshborn_demon;
assert.equal(flesh.layered, true, 'Fleshborn must use layered LPC armor');
assert.equal(flesh.baseVisual, 'enemy_fleshborn_base', 'Fleshborn must preserve its dedicated flesh/wing silhouette');
assert.ok(LAYER_ASSETS.enemy_fleshborn_base, 'Fleshborn base layer must exist');
assert.ok(Array.isArray(flesh.loadoutPresets) && flesh.loadoutPresets.length >= 3, 'Fleshborn needs multiple curated full armor sets');
for (const preset of flesh.loadoutPresets) {
  for (const slot of ['head', 'shoulders', 'chest', 'legs', 'hands', 'feet']) {
    assert.ok(preset.loadout?.[slot], `${preset.id} must include ${slot} for a full armor set`);
  }
  for (const forbidden of ['weapon', 'offhand', 'wings']) {
    assert.equal(preset.loadout?.[forbidden], undefined, `${preset.id} must leave ${forbidden} clear so Fleshborn fights with hands and keeps baked wings`);
  }
}



const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetByKey = new Map(ASSET_DEFS.map(asset => [asset.key, asset]));
const pngSize = async assetKey => {
  const def = assetByKey.get(assetKey);
  assert.ok(def, `Missing asset definition ${assetKey}`);
  const buffer = await readFile(path.join(root, 'dist', def.path));
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG', `${assetKey} must be PNG`);
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
};
for (const key of ['hellfire-demon-walk', 'ashbone-demon-walk', 'fleshborn-demon-walk']) {
  assert.deepEqual(await pngSize(key), [576, 256], `${key} must be the compact 9x4 walk crop`);
}
for (const key of ['hellfire-demon-slash', 'ashbone-demon-slash', 'fleshborn-demon-slash']) {
  assert.deepEqual(await pngSize(key), [384, 256], `${key} must be the compact 6x4 slash crop`);
}

for (const preset of flesh.loadoutPresets) {
  for (const [slot, itemId] of Object.entries(preset.loadout)) {
    const item = ITEM_DEFS[itemId];
    assert.ok(item && item.slot === slot, `${preset.id}/${slot} must use a real item in the matching slot`);
    const layer = LAYER_ASSETS[item.visual];
    assert.ok(layer, `${preset.id}/${slot} visual ${item.visual} must exist`);
    const geometry = ANIMATION_GEOMETRIES[layer.geometry];
    assert.ok(geometry?.walk && geometry?.slash, `${preset.id}/${slot} must support synchronized walk + slash presentation`);
  }
}

// Exercise the defining Fleshborn rush without constructing Phaser scenes.
globalThis.Phaser = {
  Math: {
    Angle: { Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1), Wrap: angle => Math.atan2(Math.sin(angle), Math.cos(angle)) },
    Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) }
  }
};
const { CombatSystem } = await import('../dist/js/systems/CombatSystem.js');
const { Enemy } = await import('../dist/js/entities/Enemy.js');
const target = { isPlayer: true, dead: false, body: { x: 150, y: 0, active: true } };
const makeEnemy = () => ({
  def: { id: 'enemy_fleshborn_demon', attack: 26 },
  sprite: { x: 0, y: 0, setPosition(x, y) { this.x = x; this.y = y; return this; } },
  abilityTelegraph: { destroy() {} },
  setDirection() {}
});
let hits = 0;
let lastOptions = null;
const dashContext = los => ({
  scene: { hasWorldLineOfSight: () => los },
  fx: { demonRushTrail() {}, demonClaw() {} },
  friendlyTargets: () => [target],
  resolver: { damageTarget(_target, _amount, options) { hits += 1; lastOptions = options; return 10; } },
  statuses: { apply() {} },
  audio: { play() {} },
  shakeAt() {}
});
let rushingEnemy = makeEnemy();
CombatSystem.prototype.triggerEnemyAbility.call(dashContext(true), rushingEnemy, ENEMY_ABILITY_DEFS.predators_rush, 150, 0, target);
assert.equal(Math.round(rushingEnemy.sprite.x), 108, `Predator's Rush must stop short of its target instead of teleporting onto it`);
assert.equal(hits, 1, `Predator's Rush should damage the target once`);
assert.equal(lastOptions.type, 'physical');
assert.equal(lastOptions.impact, 'blood');

hits = 0; rushingEnemy = makeEnemy();
CombatSystem.prototype.triggerEnemyAbility.call(dashContext(false), rushingEnemy, ENEMY_ABILITY_DEFS.predators_rush, 150, 0, target);
assert.equal(rushingEnemy.sprite.x, 0, `Predator's Rush must not cross a blocked world line`);
assert.equal(hits, 0, `Blocked Predator's Rush must not damage through a wall`);

const fleshAbilityProbe = {
  def: flesh,
  abilityCooldowns: new Map(),
  scene: { hasWorldLineOfSight: () => true },
  sprite: { x: 0, y: 0 }
};
assert.equal(Enemy.prototype.availableAbility.call(fleshAbilityProbe, 1000, 70, target.body)?.id, 'flesh_rend', 'Fleshborn should Rend at close range');
assert.equal(Enemy.prototype.availableAbility.call(fleshAbilityProbe, 1000, 150, target.body)?.id, 'predators_rush', 'Fleshborn should prioritize its signature Rush at medium range');
assert.equal(Enemy.prototype.availableAbility.call(fleshAbilityProbe, 1000, 250, target.body)?.id, 'blood_lance', 'Fleshborn should use Blood Lance at long range');

const assetKeys = new Set(ASSET_DEFS.map(asset => asset.key));
for (const key of [
  'hellfire-demon-walk', 'hellfire-demon-slash',
  'ashbone-demon-walk', 'ashbone-demon-slash',
  'fleshborn-demon-walk', 'fleshborn-demon-slash'
]) assert.ok(assetKeys.has(key), `Missing compact runtime demon asset ${key}`);

const firstLight = SPAWN_REGIONS.filter(spawn => spawn.encounterId === 'enc_firstlight_demon_patrol');
assert.deepEqual(new Set(firstLight.map(spawn => spawn.enemyId)), new Set(Object.keys(demonKits)), 'First-Light war patrol must expose all four approved Demon Legion identities');
const wildPopulation = SPAWN_REGIONS.filter(spawn => spawn.mapId === 'map_cinder_wilds').reduce((sum, spawn) => sum + spawn.count, 0);
assert.equal(wildPopulation, 35, 'Demon combat upgrade must preserve the 35-actor Wilds mobile ceiling');

const enemySource = await readFile(new URL('../dist/js/entities/Enemy.js', import.meta.url), 'utf8');
const combatSource = await readFile(new URL('../dist/js/systems/CombatSystem.js', import.meta.url), 'utf8');
const fxSource = await readFile(new URL('../dist/js/systems/FxManager.js', import.meta.url), 'utf8');
assert.ok(enemySource.includes('definition.loadoutPresets') && enemySource.includes("ability.type === 'dash_strike'"), 'Enemy runtime must support curated loadout presets and Fleshborn rush selection');
assert.ok(combatSource.includes("ability.type === 'dash_strike'") && combatSource.includes('demonRushTrail') && combatSource.includes('demonClaw'), 'Combat runtime must execute demon melee and Predator\'s Rush VFX');
for (const kind of ['abyss', 'hellfire', 'ashbone', 'blood']) assert.ok(fxSource.includes(`${kind}: 0x`), `FX palette must include ${kind}`);

console.log('Demon combat smoke passed: four Demon Legion identities, 13 family skills, compact runtime crops, three full Fleshborn armor sets, wall-safe Predator\'s Rush, four wall-blocked projectiles, and 35 Wilds actor slots.');
