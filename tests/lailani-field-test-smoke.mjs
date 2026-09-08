import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { LAILANI_DEF } = await import('../dist/js/data/lailani.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { Lailani } = await import('../dist/js/entities/Lailani.js');
const { COLLIDERS, MAP_DEFS } = await import('../dist/js/data/world.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

assert.equal(LAILANI_DEF.home.mapId, 'map_veil_warfront', 'Lailani field test must live on the Veil Warfront');
assert.equal(LAILANI_DEF.faction, 'celestial');
assert.equal(LAILANI_DEF.tier, 'mythic');
assert.equal(LAILANI_DEF.unique, true);
assert.equal(Object.keys(LAILANI_DEF.abilities).length, 7, 'Lailani must ship exactly the seven approved field-test abilities');

const { mantleEmpyrean, seraphicPassage, lancesSeventhSky, celestialWaltz, haloStillWaters, gardenHeaven, transcendentDawn } = LAILANI_DEF.abilities;
for (const ability of [mantleEmpyrean, seraphicPassage, lancesSeventhSky, celestialWaltz, haloStillWaters, gardenHeaven, transcendentDawn]) {
  assert.ok(ability?.id?.startsWith('lailani_'), 'Every Lailani ability must have its own namespace');
}
assert.equal(mantleEmpyrean.durationMs, 60000, 'Mantle of the Empyrean must last one minute');
assert.ok(mantleEmpyrean.damageTakenMultiplier > 0.65 && mantleEmpyrean.damageTakenMultiplier < 0.85, 'Mantle defense should be meaningful without becoming invulnerability');
assert.ok(mantleEmpyrean.selfHealPct > 0 && mantleEmpyrean.selfHealPct <= 0.02, 'Mantle pulse heal must stay deliberately small');
assert.equal(mantleEmpyrean.pulseEveryMs, 5000, 'Mantle should breathe/pulse on a readable five-second cadence');
assert.ok(LAILANI_DEF.glideSpeed > AZRAEL_DEF.glideSpeed, 'Lailani must be the faster graceful battlefield mover');
assert.ok(LAILANI_DEF.simulationRange >= 1000 && LAILANI_DEF.simulationRange <= 1400, 'Lailani must use a bounded player-scoped simulation range on the large Warfront');
assert.ok(LAILANI_DEF.passageSpeed > AZRAEL_DEF.wingBurstSpeed, 'Seraphic Passage must read faster than Azrael\'s heavier Wing Burst');
assert.ok(transcendentDawn.cooldownMs > gardenHeaven.cooldownMs, 'Transcendent Dawn must remain rarer than Garden of Heaven');
assert.ok(gardenHeaven.cooldownMs > lancesSeventhSky.cooldownMs, 'Frequent lances must appear more often than major garden spectacle');

// Targeting smoke: clustered demons should beat a slightly closer lone target,
// supporting Garden/Dawn selection without copying Azrael's controller.
const lailani = Object.create(Lailani.prototype);
lailani.faction = 'celestial';
lailani.body = { x: 0, y: 0 };
lailani.homeX = 0; lailani.homeY = 0;
lailani.def = {
  senseRange: 1000,
  leashRange: 1000,
  abilities: { gardenHeaven: { targetClusterRadius: 165 } }
};
const mob = (name, x, y) => ({ faction: 'monster', def: { name }, sprite: { x, y, active: true }, dead: false, state: 'idle' });
const lone = mob('Lone', -105, 0);
const clusterA = mob('Cluster A', 136, 0);
const clusterB = mob('Cluster B', 148, 18);
const clusterC = mob('Cluster C', 150, -20);
assert.equal(lailani.chooseTarget([lone, clusterA, clusterB, clusterC]), clusterA);

// Large-map sleeping smoke: the named actor must not run an offscreen mythic
// battle while the player is far away at another Warfront sector.
const sleeper = Object.create(Lailani.prototype);
sleeper.def = { simulationRange: 1200 };
sleeper.body = { x: 3660, y: 1510 };
sleeper.scene = { player: { body: { x: 3072, y: 2700 } } };
assert.equal(sleeper.shouldSimulate(), false, 'Lailani should sleep while the player is far away at the Veil Gate');
sleeper.scene.player.body.setPosition = undefined;
sleeper.scene.player.body.x = 3560; sleeper.scene.player.body.y = 1575;
assert.equal(sleeper.shouldSimulate(), true, 'Lailani should wake near her dedicated field-test entry');

// Mantle defense smoke is independent from CombatSystem: her own damage intake
// applies the one-minute transcendence multiplier before HP is reduced.
const defended = Object.create(Lailani.prototype);
defended.dead = false;
defended.hp = 1000;
defended.mantleUntil = 10000;
defended.def = { ...LAILANI_DEF, abilities: LAILANI_DEF.abilities };
defended.hurtUntil = 0;
defended.knockbackUntil = 0;
defended.knockbackVX = 0;
defended.knockbackVY = 0;
defended.takeResolvedDamage(100, 0, 0, 5000, {});
assert.equal(defended.hp, 926, 'Active Mantle should reduce a 100-point resolved hit to 74 damage');

// Field-test home and debug entry must not spawn inside visible-source solids.
const map = MAP_DEFS.map_veil_warfront;
assert.ok(map.entryPoints.lailani_test, 'Warfront must expose a dedicated Lailani field-test entry');
const solids = COLLIDERS.filter(row => row.mapId === 'map_veil_warfront');
const pointInside = (x, y, c, padding = 24) => (
  x >= c.x - c.width / 2 - padding && x <= c.x + c.width / 2 + padding &&
  y >= c.y - c.height / 2 - padding && y <= c.y + c.height / 2 + padding
);
assert.equal(solids.some(c => pointInside(LAILANI_DEF.home.x, LAILANI_DEF.home.y, c)), false, 'Lailani home must be clear of Warfront solids');
assert.equal(solids.some(c => pointInside(map.entryPoints.lailani_test.x, map.entryPoints.lailani_test.y, c)), false, 'Lailani debug entry must be clear of Warfront solids');

// Runtime asset policy: only complete dressed action blocks are loaded. The
// source-only expanded actions that dropped clothing never enter runtime.
assert.deepEqual(Object.keys(LAILANI_DEF.assets).sort(), ['hurt', 'idle', 'shoot', 'slash', 'spellcast', 'thrust', 'walk']);
const warfrontAssets = new Set(assetDefsForMap({ player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} }, 'map_veil_warfront').map(def => def.key));
for (const key of Object.values(LAILANI_DEF.assets)) assert.ok(warfrontAssets.has(key), `Warfront package must stream ${key}`);
const wildsAssets = new Set(assetDefsForMap({ player: { mapId: 'map_cinder_wilds' }, inventory: [], equipment: {} }, 'map_cinder_wilds').map(def => def.key));
for (const key of Object.values(LAILANI_DEF.assets)) assert.equal(wildsAssets.has(key), false, `${key} must not load on Cinder Wilds`);

// Parse PNG IHDR directly so the test guards crop geometry without image/OCR deps.
const expectedPngSizes = new Map([
  ['lailani-spellcast.png', [448, 256]], ['lailani-thrust.png', [512, 256]],
  ['lailani-walk.png', [576, 256]], ['lailani-slash.png', [384, 256]],
  ['lailani-shoot.png', [832, 256]], ['lailani-hurt.png', [384, 64]], ['lailani-idle.png', [128, 256]]
]);
for (const [name, expected] of expectedPngSizes) {
  const bytes = await readFile(new URL(`../dist/assets/npcs/lailani/${name}`, import.meta.url));
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${name} must be PNG`);
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], expected, `${name} crop dimensions must match its exact source action block`);
}

const lailaniSource = await readFile(new URL('../dist/js/entities/Lailani.js', import.meta.url), 'utf8');
assert.equal(lailaniSource.includes("from './Azrael.js'"), false, 'Lailani must not subclass or import Azrael');
for (const token of ['passage_dash', 'waltz_charge', 'updateMantle', 'fxGardenPulse', 'fxDawnImpact']) {
  assert.ok(lailaniSource.includes(token), `Lailani controller must preserve custom behavior token ${token}`);
}

console.log('Lailani field-test smoke passed: seven-skill transcendent kit, 60s defensive/healing Mantle, faster dance movement, independent controller/VFX, dressed runtime crops, safe Warfront home, and map-scoped streaming.');
