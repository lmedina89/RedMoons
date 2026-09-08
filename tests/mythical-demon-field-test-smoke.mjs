import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { MYTHICAL_DEMON_DEF } = await import('../dist/js/data/mythicalDemon.js');
const { MythicalDemon } = await import('../dist/js/entities/MythicalDemon.js');
const { COLLIDERS, MAP_DEFS } = await import('../dist/js/data/world.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

assert.equal(MYTHICAL_DEMON_DEF.home.mapId, 'map_veil_warfront');
assert.equal(MYTHICAL_DEMON_DEF.faction, 'monster');
assert.equal(MYTHICAL_DEMON_DEF.tier, 'mythic');
assert.equal(MYTHICAL_DEMON_DEF.threatTier, 'mythic');
assert.equal(MYTHICAL_DEMON_DEF.internalLevel, 135);
assert.equal(MYTHICAL_DEMON_DEF.levelDisplay, '???');
assert.equal(MYTHICAL_DEMON_DEF.unique, true);
assert.equal(Object.keys(MYTHICAL_DEMON_DEF.abilities).length, 7, 'First infernal mythic must ship seven bespoke abilities');

const { abyssalAscendance, rendingTalon, bloodwingRush, hellspineVolley, mawVoid, crimsonEclipse, cataclysmFirstPit } = MYTHICAL_DEMON_DEF.abilities;
for (const ability of [abyssalAscendance, rendingTalon, bloodwingRush, hellspineVolley, mawVoid, crimsonEclipse, cataclysmFirstPit]) {
  assert.ok(ability.id.startsWith('mythical_demon_'), `${ability.name} must use its independent namespace`);
}
assert.ok(abyssalAscendance.durationMs >= 50000 && abyssalAscendance.durationMs <= 60000, 'Ascendance must be a long-lived but bounded mythic state');
assert.ok(abyssalAscendance.damageTakenMultiplier > 0.75 && abyssalAscendance.damageTakenMultiplier < 0.9, 'Ascendance mitigation must matter without granting invulnerability');
assert.ok(cataclysmFirstPit.cooldownMs > crimsonEclipse.cooldownMs && crimsonEclipse.cooldownMs > mawVoid.cooldownMs, 'Infernal spectacle should escalate from frequent AoE to rare signature Cataclysm');
for (const ability of [mawVoid, crimsonEclipse, cataclysmFirstPit]) {
  assert.equal(ability.worthyTargetTier, 'mythic', `${ability.name} must remain available against one worthy mythic foe`);
}
assert.ok(MYTHICAL_DEMON_DEF.simulationRange >= 1000 && MYTHICAL_DEMON_DEF.simulationRange <= 1400, 'Large-map mythic simulation must remain player-scoped');

// AI duel regression: with Ascendance already unavailable, a single mythic
// celestial should unlock Cataclysm; a single ordinary celestial should not.
const worthyCelestial = { faction: 'celestial', def: { faction: 'celestial', tier: 'mythic', threatTier: 'mythic', name: 'Worthy Celestial' }, sprite: { x: 170, y: 0, active: true }, dead: false, state: 'idle' };
const ordinaryCelestial = { faction: 'celestial', def: { faction: 'celestial', tier: 'common', name: 'Sentinel' }, sprite: { x: 170, y: 0, active: true }, dead: false, state: 'idle' };
const makeDuelist = target => {
  const actor = Object.create(MythicalDemon.prototype);
  actor.faction = 'monster'; actor.def = MYTHICAL_DEMON_DEF;
  actor.body = { x: 0, y: 0, setVelocity() {} }; actor.homeX = 0; actor.homeY = 0;
  actor.target = target; actor.abilityCooldowns = new Map([[abyssalAscendance.id, 999999]]);
  actor.majorAbilityLockUntil = 0; actor.ascendanceUntil = 0; actor.orbitFlipAt = 999999; actor.orbitSign = 1;
  actor.beginAbility = ability => { actor._chosenAbility = ability.id; return true; };
  return actor;
};
const mythicDuelist = makeDuelist(worthyCelestial);
mythicDuelist.decide(1000, [worthyCelestial]);
assert.equal(mythicDuelist._chosenAbility, cataclysmFirstPit.id, 'Mythical Demon must unleash Cataclysm against one worthy opponent');
const ordinaryDuelist = makeDuelist(ordinaryCelestial);
ordinaryDuelist.decide(1000, [ordinaryCelestial]);
assert.notEqual(ordinaryDuelist._chosenAbility, cataclysmFirstPit.id, 'Mythical Demon must preserve crowd gating against one ordinary troop');

const sleeper = Object.create(MythicalDemon.prototype);
sleeper.def = { simulationRange: 1200 };
sleeper.body = { x: MYTHICAL_DEMON_DEF.home.x, y: MYTHICAL_DEMON_DEF.home.y };
sleeper.scene = { player: { body: { x: 3072, y: 2700 } } };
assert.equal(sleeper.shouldSimulate(), false, 'Infernal mythic should sleep while player is distant');
sleeper.scene.player.body.x = 2380; sleeper.scene.player.body.y = 1575;
assert.equal(sleeper.shouldSimulate(), true, 'Infernal mythic should wake near its field-test entry');

const map = MAP_DEFS.map_veil_warfront;
assert.ok(map.entryPoints.mythical_demon_test, 'Warfront needs a dedicated Mythical Demon entry');
const solids = COLLIDERS.filter(row => row.mapId === 'map_veil_warfront');
const pointInside = (x, y, c, padding = 28) => x >= c.x - c.width / 2 - padding && x <= c.x + c.width / 2 + padding && y >= c.y - c.height / 2 - padding && y <= c.y + c.height / 2 + padding;
assert.equal(solids.some(c => pointInside(MYTHICAL_DEMON_DEF.home.x, MYTHICAL_DEMON_DEF.home.y, c)), false, 'Mythical Demon home must be clear of Warfront solids');
assert.equal(solids.some(c => pointInside(map.entryPoints.mythical_demon_test.x, map.entryPoints.mythical_demon_test.y, c)), false, 'Mythical Demon field-test entry must be clear of solids');

assert.deepEqual(Object.keys(MYTHICAL_DEMON_DEF.assets).sort(), ['hurt', 'idle', 'shoot', 'slash', 'spellcast', 'thrust', 'walk']);
const warfrontAssets = new Set(assetDefsForMap({ player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} }, 'map_veil_warfront').map(def => def.key));
for (const key of Object.values(MYTHICAL_DEMON_DEF.assets)) assert.ok(warfrontAssets.has(key), `Warfront package must stream ${key}`);
const wildsAssets = new Set(assetDefsForMap({ player: { mapId: 'map_cinder_wilds' }, inventory: [], equipment: {} }, 'map_cinder_wilds').map(def => def.key));
for (const key of Object.values(MYTHICAL_DEMON_DEF.assets)) assert.equal(wildsAssets.has(key), false, `${key} must not load on Cinder Wilds`);

const expectedPngSizes = new Map([
  ['mythical-demon-spellcast.png', [448, 256]], ['mythical-demon-thrust.png', [512, 256]],
  ['mythical-demon-walk.png', [576, 256]], ['mythical-demon-slash.png', [384, 256]],
  ['mythical-demon-shoot.png', [832, 256]], ['mythical-demon-hurt.png', [384, 64]], ['mythical-demon-idle.png', [128, 256]]
]);
for (const [name, expected] of expectedPngSizes) {
  const bytes = await readFile(new URL(`../dist/assets/npcs/mythical-demon/${name}`, import.meta.url));
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], expected, `${name} crop dimensions must match the verified complete source block`);
}

const source = await readFile(new URL('../dist/js/entities/MythicalDemon.js', import.meta.url), 'utf8');
assert.equal(source.includes("from './Azrael.js'"), false, 'Infernal mythic must not subclass Azrael');
assert.equal(source.includes("from './Lailani.js'"), false, 'Infernal mythic must not subclass Lailani');
assert.equal(source.includes("from './Elexis.js'"), false, 'Infernal mythic must not subclass El’exis');
for (const token of ['updateAscendance', 'rush_dash', 'fxMawPulse', 'fxEclipseImpact', 'fxCataclysmImpact']) assert.ok(source.includes(token), `Mythical Demon controller must preserve ${token}`);

console.log('Mythical Demon field-test smoke passed: internal Lv135 infernal mythic, seven independent abilities, worthy-foe Cataclysm duel escalation, bounded simulation, safe Warfront placement, and compact Warfront-only runtime crops.');
