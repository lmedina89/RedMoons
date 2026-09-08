import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };

const { ELEXIS_DEF } = await import('../dist/js/data/elexis.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { Elexis } = await import('../dist/js/entities/Elexis.js');
const { COLLIDERS, MAP_DEFS } = await import('../dist/js/data/world.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

assert.equal(ELEXIS_DEF.name, 'El’exis');
assert.equal(ELEXIS_DEF.title, 'Mother of the Host');
assert.equal(ELEXIS_DEF.home.mapId, 'map_veil_warfront');
assert.equal(ELEXIS_DEF.faction, 'celestial');
assert.equal(ELEXIS_DEF.tier, 'mythic');
assert.equal(ELEXIS_DEF.internalLevel, 99, 'El’exis should be authored on Azrael’s mythic tier');
assert.equal(Object.keys(ELEXIS_DEF.abilities).length, 7, 'El’exis must ship exactly seven named abilities');

const { crownDominion, spearFirmament, chainsSeventhThrone, astralSeverance, edictSanctuary, heavenfallConstellation, throneBeyondHeaven } = ELEXIS_DEF.abilities;
for (const ability of [crownDominion, spearFirmament, chainsSeventhThrone, astralSeverance, edictSanctuary, heavenfallConstellation, throneBeyondHeaven]) {
  assert.ok(ability.id.startsWith('elexis_'), `${ability.name} must use El’exis namespace`);
}
assert.equal(crownDominion.durationMs, 60000, 'Crown of Dominion should last one minute');
assert.ok(crownDominion.celestialHealPct > crownDominion.selfHealPct, 'Crown should emphasize care for nearby angels');
assert.equal(crownDominion.guardDurationMs, 5000, 'Crown pulses must refresh a meaningful Guard blessing');
assert.ok(edictSanctuary.initialCelestialHealPct >= 0.09, 'Edict must be capable of materially rescuing ordinary angels');
assert.ok(edictSanctuary.pulseCelestialHealPct > 0 && edictSanctuary.pulseDelays.length >= 4, 'Edict needs sustained restorative pulses');
assert.ok(edictSanctuary.castMissingThreshold <= 0.22, 'Support AI should react before allied squads are nearly dead');
assert.ok(throneBeyondHeaven.cooldownMs > heavenfallConstellation.cooldownMs, 'Throne Beyond Heaven must remain rarer than Constellation');
assert.ok(heavenfallConstellation.cooldownMs > spearFirmament.cooldownMs, 'Precision spear must remain a frequent attack');
assert.ok(ELEXIS_DEF.maxHp >= AZRAEL_DEF.maxHp * 0.90 && ELEXIS_DEF.maxHp <= AZRAEL_DEF.maxHp * 1.05, 'El’exis HP must remain on Azrael’s tier without simply exceeding him');
assert.ok(ELEXIS_DEF.attack >= AZRAEL_DEF.attack * 0.90 && ELEXIS_DEF.attack <= AZRAEL_DEF.attack * 1.02, 'El’exis attack must remain Azrael-tier but not copy his raw damage identity');
assert.ok(ELEXIS_DEF.simulationRange >= 1050 && ELEXIS_DEF.simulationRange <= 1300, 'Large-Warfront simulation must remain player scoped');

// Crown defense is owned by El’exis herself and does not require changes to the
// shared resolver. A resolved 100-point hit becomes 80 while Crown is active.
const defended = Object.create(Elexis.prototype);
defended.dead = false;
defended.hp = 1000;
defended.crownUntil = 10000;
defended.def = ELEXIS_DEF;
defended.hurtUntil = 0;
defended.knockbackUntil = 0;
defended.knockbackVX = 0;
defended.knockbackVY = 0;
defended.takeResolvedDamage(100, 0, 0, 5000, {});
assert.equal(defended.hp, 920, 'Crown of Dominion should reduce a 100-point resolved hit to 80 damage before any Guard status');

// Healing policy: ordinary angels get the full configured restoration while
// named mythics get reduced allied healing to avoid an immortal mythic triangle.
const healer = Object.create(Elexis.prototype);
healer.dead = false;
healer.def = ELEXIS_DEF;
healer.scene = { player: null };
const common = { faction: 'celestial', def: { faction: 'celestial', tier: 'common', maxHp: 1000 }, hp: 500, sprite: { x: 10, y: 10, active: true }, dead: false, state: 'idle', updateHealthBar() {} };
const mythic = { faction: 'celestial', def: { faction: 'celestial', tier: 'mythic', maxHp: 1000 }, hp: 500, sprite: { x: 20, y: 20, active: true }, dead: false, state: 'idle', updateHealthBar() {} };
healer.combat = {
  sanctuaryVitals(target) { return { hp: target.hp, maxHp: target.def.maxHp, set(value) { target.hp = value; } }; },
  damageNumbers: { showHealing() {} }, fx: { burst() {}, ring() {} }
};
assert.equal(healer.healTarget(common, 0.10), 100, 'Ordinary celestial should receive full 10% restoration');
assert.equal(healer.healTarget(mythic, 0.10), 46, 'Allied mythic healing should be intentionally reduced');

// Mother-of-the-Host decision priority: an ally already missing enough HP for
// Edict must be rescued before El’exis spends the opening on Crown of Dominion.
const protector = Object.create(Elexis.prototype);
protector.dead = false;
protector.def = ELEXIS_DEF;
protector.body = { x: 0, y: 0, setVelocity() {} };
protector.homeX = 0; protector.homeY = 0;
protector.target = null; protector.supportTarget = null;
protector.abilityCooldowns = new Map(); protector.majorAbilityLockUntil = 0; protector.crownUntil = 0;
protector.repositionFlipAt = 0; protector.repositionSign = 1;
protector.scene = { player: null };
const woundedAngel = { faction: 'celestial', def: { faction: 'celestial', tier: 'common', maxHp: 1000, name: 'Wounded Sentinel' }, hp: 650, sprite: { x: 90, y: 0, active: true }, dead: false, state: 'idle', updateHealthBar() {} };
protector.combat = {
  friendlyTargetsFor() { return [protector, woundedAngel]; },
  sanctuaryVitals(target) { const maxHp = target === protector ? ELEXIS_DEF.maxHp : target.def.maxHp; const hp = target === protector ? ELEXIS_DEF.maxHp : target.hp; return { hp, maxHp, set() {} }; }
};
protector.activeHostiles = () => [];
protector.beginAbility = ability => { protector._chosenAbility = ability.id; };
protector.decide(1000, []);
assert.equal(protector._chosenAbility, 'elexis_edict_sanctuary', 'A materially wounded angel must trigger Edict before Crown');

// Sleep gate: El’exis must not conduct a remote mythic fight while the player
// is elsewhere in the 6144×3072 realm.
const sleeper = Object.create(Elexis.prototype);
sleeper.def = { simulationRange: 1200 };
sleeper.body = { x: ELEXIS_DEF.home.x, y: ELEXIS_DEF.home.y };
sleeper.scene = { player: { body: { x: 3072, y: 2700 } } };
assert.equal(sleeper.shouldSimulate(), false, 'El’exis should sleep from the distant Veil Gate');
sleeper.scene.player.body.x = 4740; sleeper.scene.player.body.y = 1160;
assert.equal(sleeper.shouldSimulate(), true, 'El’exis should wake at her dedicated field-test entry');

const pointInside = (x, y, c, padding = 28) => (
  x >= c.x - c.width / 2 - padding && x <= c.x + c.width / 2 + padding &&
  y >= c.y - c.height / 2 - padding && y <= c.y + c.height / 2 + padding
);
const map = MAP_DEFS.map_veil_warfront;
const solids = COLLIDERS.filter(row => row.mapId === 'map_veil_warfront');
assert.ok(map.entryPoints.elexis_test, 'Warfront must expose an El’exis field-test entry');
assert.equal(solids.some(c => pointInside(ELEXIS_DEF.home.x, ELEXIS_DEF.home.y, c)), false, 'El’exis field-test home must be clear of Warfront solids');
assert.equal(solids.some(c => pointInside(map.entryPoints.elexis_test.x, map.entryPoints.elexis_test.y, c)), false, 'El’exis field-test entry must be clear of Warfront solids');

assert.deepEqual(Object.keys(ELEXIS_DEF.assets).sort(), ['hurt', 'idle', 'shoot', 'slash', 'spellcast', 'thrust', 'walk']);
const warfrontAssets = new Set(assetDefsForMap({ player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} }, 'map_veil_warfront').map(def => def.key));
for (const key of Object.values(ELEXIS_DEF.assets)) assert.ok(warfrontAssets.has(key), `Warfront package must stream ${key}`);
const wildsAssets = new Set(assetDefsForMap({ player: { mapId: 'map_cinder_wilds' }, inventory: [], equipment: {} }, 'map_cinder_wilds').map(def => def.key));
for (const key of Object.values(ELEXIS_DEF.assets)) assert.equal(wildsAssets.has(key), false, `${key} must not load on Cinder Wilds`);

const expectedPngSizes = new Map([
  ['elexis-spellcast.png', [448, 256]], ['elexis-thrust.png', [512, 256]],
  ['elexis-walk.png', [576, 256]], ['elexis-slash.png', [384, 256]],
  ['elexis-shoot.png', [832, 256]], ['elexis-hurt.png', [384, 64]], ['elexis-idle.png', [128, 256]]
]);
for (const [name, expected] of expectedPngSizes) {
  const bytes = await readFile(new URL(`../dist/assets/npcs/elexis/${name}`, import.meta.url));
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${name} must be PNG`);
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], expected, `${name} must preserve the exact verified source action block`);
}

const source = await readFile(new URL('../dist/js/entities/Elexis.js', import.meta.url), 'utf8');
assert.equal(source.includes("from './Azrael.js'"), false, 'El’exis must not subclass/import Azrael');
assert.equal(source.includes("from './Lailani.js'"), false, 'El’exis must not subclass/import Lailani');
for (const token of ['supportNeed()', 'healScaleFor', 'fxEdictField', 'fxThroneExecution', 'CROWN OF DOMINION']) {
  assert.ok(source.includes(token), `El’exis controller must preserve custom Dominion/support token ${token}`);
}

console.log('El’exis field-test smoke passed: Azrael-tier seven-skill Dominion kit, 60s protective Crown, support-priority sanctuary healing, reduced mythic cross-healing, independent controller/VFX, verified complete runtime crops, safe Warfront home, and bounded simulation.');
