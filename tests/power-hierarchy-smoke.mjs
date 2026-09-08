import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };
globalThis.Phaser = { Math: { Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) } } };

const { THREAT_TIERS, INFERNAL_LEVEL_HIERARCHY, MYTHIC_LEVEL_HIERARCHY, isWorthyTarget, clusterOrWorthy } = await import('../dist/js/data/powerTiers.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { LAILANI_DEF } = await import('../dist/js/data/lailani.js');
const { ELEXIS_DEF } = await import('../dist/js/data/elexis.js');
const { MYTHICAL_DEMON_DEF } = await import('../dist/js/data/mythicalDemon.js');
const { Azrael } = await import('../dist/js/entities/Azrael.js');
const { CombatSystem } = await import('../dist/js/systems/CombatSystem.js');

assert.deepEqual(THREAT_TIERS, { ordinary: 0, elite: 1, commander: 2, boss: 3, mythic: 4, apex: 5 });
assert.deepEqual(INFERNAL_LEVEL_HIERARCHY.demonKnight, { internalLevel: 30, threatTier: 'elite' });
assert.deepEqual(INFERNAL_LEVEL_HIERARCHY.zerakoth, { internalLevel: 60, threatTier: 'commander' });
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.mythicalDemon, { internalLevel: 135, threatTier: 'mythic' });
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.lailani, { internalLevel: 150, threatTier: 'mythic' });
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.ancientDemonLord, { internalLevel: 160, threatTier: 'apex', reserved: true });
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.azrael, { internalLevel: 175, threatTier: 'apex' });
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.elexis, { internalLevel: 150, threatTier: 'apex' });
assert.equal(MYTHIC_LEVEL_HIERARCHY.playerHardCap, 100);

assert.equal(AZRAEL_DEF.internalLevel, 175); assert.equal(AZRAEL_DEF.threatTier, 'apex');
assert.equal(LAILANI_DEF.internalLevel, 150); assert.equal(LAILANI_DEF.threatTier, 'mythic');
assert.equal(ELEXIS_DEF.internalLevel, 150); assert.equal(ELEXIS_DEF.threatTier, 'apex');
assert.equal(MYTHICAL_DEMON_DEF.internalLevel, 135); assert.equal(MYTHICAL_DEMON_DEF.threatTier, 'mythic');

const ordinary = { faction: 'monster', def: { faction: 'monster', tier: 'common' }, sprite: { x: 100, y: 0, active: true }, dead: false, state: 'idle' };
const mythic = { faction: 'monster', def: { faction: 'monster', tier: 'mythic', threatTier: 'mythic' }, sprite: { x: 200, y: 0, active: true }, dead: false, state: 'idle' };
const apex = { faction: 'monster', def: { faction: 'monster', tier: 'mythic', threatTier: 'apex' }, sprite: { x: 200, y: 0, active: true }, dead: false, state: 'idle' };
assert.equal(isWorthyTarget(ordinary, 'mythic'), false, 'Ordinary lone mobs must not unlock mythic AoEs');
assert.equal(isWorthyTarget(mythic, 'mythic'), true, 'A lone mythic must qualify as worthy');
assert.equal(isWorthyTarget(apex, 'mythic'), true, 'A lone apex threat must qualify as worthy');
assert.equal(clusterOrWorthy(1, 4, ordinary, 'mythic'), false);
assert.equal(clusterOrWorthy(1, 4, mythic, 'mythic'), true);
assert.equal(clusterOrWorthy(4, 4, ordinary, 'mythic'), true, 'Normal crowd requirement still works unchanged');

for (const ability of [AZRAEL_DEF.abilities.sanctifiedNova, AZRAEL_DEF.abilities.seraphicJudgment, AZRAEL_DEF.abilities.heavenfall]) {
  assert.equal(ability.worthyTargetTier, 'mythic', `${ability.name} must allow a worthy single-target override`);
}
for (const ability of [LAILANI_DEF.abilities.gardenHeaven, LAILANI_DEF.abilities.transcendentDawn]) {
  assert.equal(ability.worthyTargetTier, 'mythic', `${ability.name} must allow a worthy single-target override`);
}
for (const ability of [ELEXIS_DEF.abilities.chainsSeventhThrone, ELEXIS_DEF.abilities.heavenfallConstellation, ELEXIS_DEF.abilities.throneBeyondHeaven]) {
  assert.equal(ability.worthyTargetTier, 'mythic', `${ability.name} must allow a worthy single-target override`);
}

// Direct Azrael 1v1 decision regression: one mythic target is enough to unlock
// Heavenfall even though the old crowd gate remains four targets.
const azrael = Object.create(Azrael.prototype);
azrael.faction = 'celestial'; azrael.def = AZRAEL_DEF;
azrael.body = { x: 0, y: 0, setVelocity() {} }; azrael.homeX = 0; azrael.homeY = 0;
azrael.target = mythic; azrael.abilityCooldowns = new Map(); azrael.majorAbilityLockUntil = 0;
azrael.combat = { sanctuaryNeedScore() { return 0; } };
azrael.beginAbility = ability => { azrael._chosenAbility = ability.id; return true; };
azrael.decide(1000, [mythic]);
assert.equal(azrael._chosenAbility, 'azrael_heavenfall', 'Azrael must escalate to Heavenfall against one worthy mythic opponent');

const ordinaryAzrael = Object.create(Azrael.prototype);
ordinaryAzrael.faction = 'celestial'; ordinaryAzrael.def = AZRAEL_DEF;
ordinaryAzrael.body = { x: 0, y: 0, setVelocity() {} }; ordinaryAzrael.homeX = 0; ordinaryAzrael.homeY = 0;
ordinaryAzrael.target = ordinary; ordinaryAzrael.abilityCooldowns = new Map(); ordinaryAzrael.majorAbilityLockUntil = 0;
ordinaryAzrael.combat = { sanctuaryNeedScore() { return 0; } };
ordinaryAzrael.beginAbility = ability => { ordinaryAzrael._chosenAbility = ability.id; return true; };
ordinaryAzrael.decide(1000, [ordinary]);
assert.notEqual(ordinaryAzrael._chosenAbility, 'azrael_heavenfall', 'Azrael must not waste Heavenfall on one ordinary mob');

// Damage-path regression: Azrael's shared cone/radial helpers must hit special
// hostile actors too, not just objects stored in CombatSystem.enemies.
const specialDemon = { faction: 'monster', isFriendlyActor: true, def: { faction: 'monster' }, body: { x: 60, y: 0, active: true }, dead: false, state: 'idle' };
const celestial = { faction: 'celestial', def: { attack: 400 }, body: { x: 0, y: 0 }, direction: 3 };
let damageCalls = 0;
const combat = Object.create(CombatSystem.prototype);
combat.hostileTargetsFor = () => [specialDemon];
combat.resolver = { damageTarget(target) { assert.equal(target, specialDemon); damageCalls += 1; return 50; } };
combat.fx = { celestialStrike() {} }; combat.audio = { play() {} }; combat.shakeAt = () => {};
assert.equal(combat.allyCone(celestial, { range: 100, arcDegrees: 120, damageMultiplier: 1, knockback: 0 }), 1);
assert.equal(combat.allyRadial(celestial, { radius: 100, damageMultiplier: 1, knockback: 0 }, 0, 0), 1);
assert.equal(damageCalls, 2, 'Both shared Azrael damage paths must resolve the special mythic target');

const azraelSource = await readFile(new URL('../dist/js/entities/Azrael.js', import.meta.url), 'utf8');
const lailaniSource = await readFile(new URL('../dist/js/entities/Lailani.js', import.meta.url), 'utf8');
const elexisSource = await readFile(new URL('../dist/js/entities/Elexis.js', import.meta.url), 'utf8');
for (const [name, source] of [['Azrael', azraelSource], ['Lailani', lailaniSource], ['El’exis', elexisSource]]) {
  assert.ok(source.includes('isWorthyTarget'), `${name} AI must consult the shared worthy-target hierarchy`);
}

console.log('Power hierarchy smoke passed: recalibrated 135/150/160/175 mythic ladder, ordinary-vs-worthy distinction, Azrael 1v1 Heavenfall escalation, and special-actor celestial damage resolution.');
