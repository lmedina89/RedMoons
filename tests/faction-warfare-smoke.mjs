import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };
globalThis.Phaser = {
  Math: {
    Angle: { Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1), Wrap: angle => Math.atan2(Math.sin(angle), Math.cos(angle)) },
    Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) }
  }
};

const { DEBUG_SPAWN_REGIONS, SPAWN_REGIONS, AREA_DEFS, COLLIDERS } = await import('../dist/js/data/world.js');
const { ENCOUNTER_DEFS } = await import('../dist/js/data/encounters.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { areHostile } = await import('../dist/js/data/factions.js');
const { Enemy } = await import('../dist/js/entities/Enemy.js');

const productionWilds = SPAWN_REGIONS.filter(spawn => spawn.mapId === 'map_cinder_wilds').reduce((sum, spawn) => sum + spawn.count, 0);
assert.equal(productionWilds, 35, 'Production Wilds population must remain at the established 35-actor ceiling');
assert.equal(DEBUG_SPAWN_REGIONS.reduce((sum, spawn) => sum + spawn.count, 0), 8, 'Debug stress force should add exactly eight Demon Legion reinforcements');
assert.deepEqual(new Set(DEBUG_SPAWN_REGIONS.map(spawn => spawn.enemyId)), new Set(['enemy_demon_scout', 'enemy_hellfire_demon', 'enemy_ashbone_demon', 'enemy_fleshborn_demon']), 'Debug warband must exercise all four Demon Legion combat identities');
for (const spawn of DEBUG_SPAWN_REGIONS) {
  assert.equal(spawn.debugOnly, true, `${spawn.id} must be explicitly debug-only`);
  assert.equal(spawn.encounterId, 'enc_firstlight_debug_warband');
  assert.ok(ENEMY_DEFS[spawn.enemyId], `${spawn.id} references a real demon definition`);
  const area = AREA_DEFS.find(candidate => candidate.id === spawn.areaId);
  assert.ok(area && area.id === 'area_first_light_scar', `${spawn.id} must stay inside First-Light Scar`);
  const centerX = spawn.x + spawn.width / 2;
  const centerY = spawn.y + spawn.height / 2;
  assert.ok(centerX >= area.x && centerX <= area.x + area.width && centerY >= area.y && centerY <= area.y + area.height, `${spawn.id} center must be in First-Light Scar`);
  const overlap = COLLIDERS.filter(c => c.mapId === spawn.mapId).some(collider => {
    const left = collider.x - collider.width / 2, right = collider.x + collider.width / 2;
    const top = collider.y - collider.height / 2, bottom = collider.y + collider.height / 2;
    return spawn.x < right && spawn.x + spawn.width > left && spawn.y < bottom && spawn.y + spawn.height > top;
  });
  assert.equal(overlap, false, `${spawn.id} must not create debug respawns inside a solid`);
}
assert.equal(ENCOUNTER_DEFS.enc_firstlight_debug_warband.debugOnly, true);
assert.ok(ENCOUNTER_DEFS.enc_firstlight_debug_warband.assistRadius >= 400, 'Debug warband should support cross-group reinforcement testing');
assert.ok(ENCOUNTER_DEFS.enc_firstlight_demon_patrol.assistRadius > 0, 'First-Light demon patrol should have bounded faction assist');
assert.ok(ENCOUNTER_DEFS.enc_firstlight_celestial_guard.assistRadius > 0, 'First-Light celestial defenders should have bounded faction assist');

const makeActor = (faction, x, y, active = true) => ({ faction, dead: false, state: 'idle', sprite: { x, y, active } });
const player = { isPlayer: true, faction: 'player', dead: false, body: { x: 100, y: 0, active: true } };
const demon = makeActor('monster', 120, 0);
const secondDemon = makeActor('monster', 180, 0);
const probe = {
  faction: 'celestial', state: 'chase', target: demon, homeX: 0, homeY: 0,
  def: { leashRange: 300, detectRange: 120 }, spawn: {}, sprite: { x: 0, y: 0 }
};
probe.targetWithinPursuitBounds = target => Enemy.prototype.targetWithinPursuitBounds.call(probe, target);
assert.equal(Enemy.prototype.selectCombatTarget.call(probe, [player, demon, secondDemon], player), demon, 'A celestial combatant should select the closest live hostile inside its pursuit territory');
demon.sprite.active = false;
assert.equal(Enemy.prototype.selectCombatTarget.call(probe, [player, demon, secondDemon], player), secondDemon, 'A combatant should switch to another live hostile when its prior target dies/despawns');
secondDemon.sprite.x = 500;
assert.equal(Enemy.prototype.selectCombatTarget.call(probe, [player, secondDemon], player), null, 'Targets beyond local pursuit bounds should be ignored instead of dragging combat across the map');
assert.equal(areHostile(probe, secondDemon), true);

const healAbility = { id: 'test_heal', type: 'friendly_heal', windupMs: 500, cooldownMs: 4000 };
const healerProbe = {
  sprite: { x: 30, y: 40, setVelocity() {} }, direction: 2, abilityCooldowns: new Map(), callbacks: { beginAbility() {} },
  setDirection() {}
};
Enemy.prototype.beginAbility.call(healerProbe, healAbility, null, 1000);
assert.equal(healerProbe.currentAbility, healAbility, 'Friendly heal abilities should be allowed to cast without a hostile target reference');
assert.equal(healerProbe.abilityTargetX, 30);
assert.equal(healerProbe.abilityTargetY, 40);

const enemySource = await readFile(new URL('../dist/js/entities/Enemy.js', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.ok(enemySource.includes('targetWithinPursuitBounds') && enemySource.includes("['detect', 'chase', 'attack', 'reposition']"), 'Enemy AI must harden pursuit territory and lost-target recovery');
assert.ok(worldSource.includes('DEBUG ? [...SPAWN_REGIONS, ...DEBUG_SPAWN_REGIONS] : SPAWN_REGIONS'), 'Debug reinforcements must not instantiate in normal builds');
assert.ok(worldSource.includes('alertFactionAllies') && worldSource.includes('assistCap'), 'WorldScene must provide bounded same-faction assist without unbounded chain aggro');
assert.ok(html.includes('data-debug="warband"') && html.includes('Faction War Test'), 'Debug UI needs a direct faction-war stress-test control');

console.log('Faction warfare smoke passed: production cap 35, +8 debug-only Demon Legion reinforcements, bounded same-faction assist, sticky committed attacks, target-loss retargeting, and local pursuit leashes.');
