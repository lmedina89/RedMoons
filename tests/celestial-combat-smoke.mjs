import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.location = { search: '' };
globalThis.Phaser = {
  Math: {
    Angle: { Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1), Wrap: angle => Math.atan2(Math.sin(angle), Math.cos(angle)) },
    Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) }
  }
};

const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { ENEMY_ABILITY_DEFS } = await import('../dist/js/data/abilities.js');
const { PROJECTILE_DEFS } = await import('../dist/js/data/projectiles.js');
const { ANIMATION_GEOMETRIES, ASSET_DEFS, LAYER_ASSETS } = await import('../dist/js/data/assets.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const { MONSTER_FAMILY_DEFS, ENCOUNTER_DEFS } = await import('../dist/js/data/encounters.js');
const { areFriendly, areHostile } = await import('../dist/js/data/factions.js');
const { CombatSystem } = await import('../dist/js/systems/CombatSystem.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');
const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { Enemy } = await import('../dist/js/entities/Enemy.js');

const sentinel = ENEMY_DEFS.enemy_celestial_footsoldier;
const guardian = ENEMY_DEFS.enemy_heavenly_guardian;
assert.ok(sentinel && guardian, 'Common celestial troop definitions must exist');
assert.equal(sentinel.family, 'celestial');
assert.equal(guardian.family, 'celestial');
assert.equal(sentinel.faction, 'celestial');
assert.equal(guardian.faction, 'celestial');
assert.deepEqual(sentinel.abilities, ['radiant_strike', 'lumen_bolt', 'judgment_pulse']);
assert.deepEqual(guardian.abilities, ['grace_of_light', 'radiant_strike', 'judgment_pulse']);
assert.equal(MONSTER_FAMILY_DEFS.celestial.future, undefined, 'Celestial family must be live rather than future-only');
assert.ok(MONSTER_FAMILY_DEFS.celestial.roles.includes('guardian'));

for (const id of ['radiant_strike', 'lumen_bolt', 'judgment_pulse', 'grace_of_light']) {
  const ability = ENEMY_ABILITY_DEFS[id];
  assert.ok(ability, `Missing celestial ability ${id}`);
  assert.ok(ability.windupMs >= 400, `${id} needs a readable telegraph`);
  assert.ok(ability.cooldownMs >= 1500, `${id} must not spam`);
  assert.equal(ability.telegraph, 'celestial');
}
assert.equal(ENEMY_ABILITY_DEFS.grace_of_light.type, 'friendly_heal');
assert.ok(ENEMY_ABILITY_DEFS.grace_of_light.healPct > 0 && ENEMY_ABILITY_DEFS.grace_of_light.healPct <= 0.1, 'Grace should be meaningful but modest');
assert.equal(ENEMY_ABILITY_DEFS.lumen_bolt.projectileId, 'lumen_bolt');
assert.equal(PROJECTILE_DEFS.lumen_bolt.wallCollision, true, 'Lumen Bolt must respect world walls');
assert.equal(PROJECTILE_DEFS.lumen_bolt.damageType, 'celestial');
assert.equal(PROJECTILE_DEFS.lumen_bolt.texture, 'projectile-lumen');

assert.equal(sentinel.layered, true, 'BaseAngel should be a reusable layered celestial body');
assert.equal(sentinel.baseVisual, 'enemy_base_angel_base');
assert.ok(LAYER_ASSETS.enemy_base_angel_base, 'BaseAngel runtime layer mapping must exist');
assert.ok(Array.isArray(sentinel.loadoutPresets) && sentinel.loadoutPresets.length >= 3, 'Sentinels need multiple coherent celestial armor sets');
for (const preset of sentinel.loadoutPresets) {
  assert.ok(preset.loadout.chest && preset.loadout.weapon, `${preset.id} needs an intentional chest + weapon identity`);
  assert.equal(preset.loadout.wings, undefined, `${preset.id} must keep BaseAngel baked white wings clear`);
  for (const [slot, itemId] of Object.entries(preset.loadout)) {
    const item = ITEM_DEFS[itemId];
    assert.ok(item && item.slot === slot, `${preset.id}/${slot} must use a real matching item`);
    const visualKey = slot === 'weapon' || slot === 'offhand' ? `${item.visual}_fg` : item.visual;
    const layer = LAYER_ASSETS[visualKey];
    assert.ok(layer, `${preset.id}/${slot} visual ${visualKey} must exist`);
    const geometry = ANIMATION_GEOMETRIES[layer.geometry];
    assert.ok(geometry?.walk && geometry?.slash, `${preset.id}/${slot} must stay synchronized for walk/slash`);
  }
}
assert.equal(guardian.layered, undefined, 'HeavenlyKnight should preserve its baked full armor rather than randomize gear');
assert.equal(guardian.walkTexture, 'heavenly-knight-walk');
assert.equal(guardian.attackTexture, 'heavenly-knight-slash');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetByKey = new Map(ASSET_DEFS.map(asset => [asset.key, asset]));
const pngSize = async key => {
  const def = assetByKey.get(key);
  assert.ok(def, `Missing asset ${key}`);
  const buffer = await readFile(path.join(root, 'dist', def.path));
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
};
for (const key of ['base-angel-walk', 'heavenly-knight-walk']) assert.deepEqual(await pngSize(key), [576, 256], `${key} must be compact 9x4 walk art`);
for (const key of ['base-angel-slash', 'heavenly-knight-slash']) assert.deepEqual(await pngSize(key), [384, 256], `${key} must be compact 6x4 slash art`);
const stateForAssets = createDefaultState();
stateForAssets.player.mapId = 'map_cinder_wilds';
const wildAssetKeys = new Set(assetDefsForMap(stateForAssets, 'map_cinder_wilds').map(asset => asset.key));
for (const key of ['base-angel-walk', 'base-angel-slash', 'heavenly-knight-walk', 'heavenly-knight-slash']) assert.ok(wildAssetKeys.has(key), `Cinder Wilds must preload ${key}`);

const celestialSpawns = SPAWN_REGIONS.filter(spawn => spawn.encounterId === 'enc_firstlight_celestial_guard');
assert.ok(ENCOUNTER_DEFS.enc_firstlight_celestial_guard, 'First-Light celestial guard encounter must exist');
assert.equal(celestialSpawns.filter(spawn => spawn.enemyId === sentinel.id).reduce((n, spawn) => n + spawn.count, 0), 2, 'First-Light Scar should field two common Sentinels');
assert.equal(celestialSpawns.filter(spawn => spawn.enemyId === guardian.id).reduce((n, spawn) => n + spawn.count, 0), 1, 'First-Light Scar should field one Heavenly Guardian');
assert.equal(SPAWN_REGIONS.filter(spawn => spawn.mapId === 'map_cinder_wilds').reduce((n, spawn) => n + spawn.count, 0), 35, 'Celestial foundation must preserve the 35-actor Wilds ceiling');

const player = { isPlayer: true, faction: 'player', dead: false, body: { x: 0, y: 0, active: true } };
const angel = { faction: 'celestial', dead: false, sprite: { x: 10, y: 0, active: true } };
const demon = { faction: 'monster', dead: false, state: 'idle', sprite: { x: 20, y: 0, active: true } };
assert.equal(areFriendly(player, angel), true);
assert.equal(areHostile(player, demon), true);
assert.equal(areHostile(angel, demon), true);
assert.equal(areHostile(demon, angel), true);

const factionContext = { combatants: () => [player, angel, demon] };
assert.deepEqual(CombatSystem.prototype.hostileTargetsFor.call(factionContext, angel), [demon], 'Common angels must target monsters, not the player');
assert.deepEqual(CombatSystem.prototype.friendlyTargetsFor.call(factionContext, angel), [player, angel], 'Common angels must treat player/celestials as friendly');

// Player melee must ignore friendly common angels even though they share the
// generic Enemy array with hostile creatures.
let playerHits = [];
const playerAttackContext = {
  state: { player: { stats: { str: 10, dex: 0, vit: 0, int: 0 }, hp: 100 }, equipment: {}, inventory: [] },
  player: { ...player, visual: { direction: 3 }, body: { x: 0, y: 0, active: true } },
  enemies: [angel, demon],
  resolver: { damageEnemy(target) { playerHits.push(target); return 5; } },
  audio: { play() {} },
  events: { emit() {} }
};
CombatSystem.prototype.playerAttack.call(playerAttackContext, { rangeMultiplier: 1, damageMultiplier: 1, arcDegrees: 120 });
assert.deepEqual(playerHits, [demon], 'Player attacks must never damage friendly celestial Enemy actors');

// Celestial projectile launch must identify its actual source actor so the
// pooled projectile system can acquire demons rather than player/celestial allies.
let projectilePayload = null;
const attackContext = {
  sourceTeamFor: CombatSystem.prototype.sourceTeamFor,
  hostileTargetsFor: () => [demon],
  projectiles: { launch(_id, payload) { projectilePayload = payload; } },
  fx: {}, resolver: {}, statuses: {}, audio: {}, shakeAt() {}, friendlyTargetsFor: () => []
};
const caster = { faction: 'celestial', def: { id: sentinel.id, attack: sentinel.attack }, sprite: { x: 0, y: 0 } };
CombatSystem.prototype.triggerEnemyAbility.call(attackContext, caster, ENEMY_ABILITY_DEFS.lumen_bolt, 100, 0, demon);
assert.equal(projectilePayload.team, 'celestial');
assert.equal(projectilePayload.sourceActor, caster);

// Guardian support should heal friendly celestials (and the friendly player if
// nearby) but never a demon. Use simple vitals to exercise the generic heal path.
let rings = 0;
const woundedAngel = { faction: 'celestial', hp: 50, def: { maxHp: 100 }, sprite: { x: 20, y: 0, active: true }, updateHealthBar() {} };
const woundedPlayer = { isPlayer: true, faction: 'player', body: { x: 30, y: 0, active: true } };
const healthyDemon = { faction: 'monster', hp: 50, def: { maxHp: 100 }, sprite: { x: 25, y: 0, active: true }, updateHealthBar() {} };
const healState = { player: { level: 1, hp: 50, stats: { vit: 0, str: 0, dex: 0, spr: 0 } }, equipment: {}, inventory: [] };
const healer = { faction: 'celestial', hp: 80, def: { maxHp: 100, attack: 20 }, sprite: { x: 0, y: 0 }, abilityTelegraph: { destroy() {} } };
const healContext = {
  state: healState, player: woundedPlayer,
  sourceTeamFor: CombatSystem.prototype.sourceTeamFor,
  hostileTargetsFor: () => [healthyDemon],
  friendlyTargetsFor: () => [healer, woundedAngel, woundedPlayer],
  sanctuaryVitals: CombatSystem.prototype.sanctuaryVitals,
  fx: { ring() { rings += 1; }, burst() {} },
  damageNumbers: { showHealing() {} }, audio: { play() {} }, shakeAt() {}
};
const beforeDemon = healthyDemon.hp;
CombatSystem.prototype.triggerEnemyAbility.call(healContext, healer, ENEMY_ABILITY_DEFS.grace_of_light, 25, 0, healthyDemon);
assert.ok(woundedAngel.hp > 50, 'Grace of Light must heal nearby celestial allies');
assert.ok(healState.player.hp > 50, 'Grace of Light may support the friendly player inside its radius');
assert.equal(healthyDemon.hp, beforeDemon, 'Grace of Light must never heal a demon');
assert.equal(rings, 1, 'Grace of Light should produce one modest readable support ring');

const supportProbe = { def: guardian, abilityCooldowns: new Map(), combat: { supportNeedScore: () => 0.5 }, scene: { hasWorldLineOfSight: () => true }, sprite: { x: 0, y: 0 } };
assert.equal(Enemy.prototype.availableAbility.call(supportProbe, 1000, 60, demon.sprite)?.id, 'grace_of_light', 'Wounded allied formation should let a Guardian prioritize Grace of Light');
supportProbe.combat.supportNeedScore = () => 0;
assert.notEqual(Enemy.prototype.availableAbility.call(supportProbe, 1000, 60, demon.sprite)?.id, 'grace_of_light', 'Guardian must not waste Grace at full allied health');

const combatSource = await readFile(new URL('../dist/js/systems/CombatSystem.js', import.meta.url), 'utf8');
const projectileSource = await readFile(new URL('../dist/js/systems/ProjectileManager.js', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const fxSource = await readFile(new URL('../dist/js/systems/FxManager.js', import.meta.url), 'utf8');
assert.ok(combatSource.includes('hostileTargetsFor') && combatSource.includes('friendlyTargetsFor') && combatSource.includes('areHostile'), 'Shared combat must be faction-aware');
assert.ok(projectileSource.includes('hostileTargetsProvider') && projectileSource.includes('sourceActor'), 'Pooled projectiles must resolve hostiles from their actual source actor');
assert.ok(worldSource.includes("action === 'sentinel'") && worldSource.includes("action === 'guardian'"), 'Debug tray must expose both common celestial archetypes');
assert.ok(fxSource.includes("makeOrb('projectile-lumen'"), 'Lumen Bolt needs its own compact celestial projectile texture');

console.log('Celestial combat smoke passed: BaseAngel layered Sentinels, baked Heavenly Guardian, four restrained holy abilities, player-safe faction combat, ally healing, autonomous demon targeting, wall-blocked Lumen Bolt, and 35 Wilds actor slots.');
