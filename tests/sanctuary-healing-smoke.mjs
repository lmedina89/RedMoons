import assert from 'node:assert/strict';

globalThis.location = { search: '' };
const { CombatSystem } = await import('../dist/js/systems/CombatSystem.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');

const ability = AZRAEL_DEF.abilities.sanctuaryFirstLight;
const player = { isPlayer: true, faction: 'player', dead: false, body: { x: 50, y: 0, active: true } };
const azrael = { faction: 'celestial', dead: false, hp: 9000, def: AZRAEL_DEF, body: { x: 0, y: 0, active: true }, updateHealthBar() {} };
const angel = { faction: 'celestial', dead: false, hp: 500, def: { maxHp: 1000 }, body: { x: 80, y: 0, active: true }, updateHealthBar() {} };
const farAngel = { faction: 'celestial', dead: false, hp: 100, def: { maxHp: 1000 }, body: { x: ability.radius + 20, y: 0, active: true }, updateHealthBar() {} };
const neutral = { faction: 'neutral', dead: false, hp: 100, def: { maxHp: 1000 }, body: { x: 30, y: 0, active: true }, updateHealthBar() {} };

const combat = Object.create(CombatSystem.prototype);
combat.player = player;
combat.state = {
  player: { hp: 50, level: 1, stats: { str: 5, dex: 5, vit: 5, spr: 5 } },
  inventory: [], equipment: {}
};
combat.scene = { friendlyCombatants: () => [player, azrael, angel, farAngel, neutral] };
combat.damageNumbers = { showHealing() {} };
combat.fx = { sanctuaryFirstLightBlessing() {}, sanctuaryFirstLightPulse() {} };
combat.audio = { play() {} };
combat.shakeAt = () => {};

const need = combat.sanctuaryNeedScore(azrael, ability);
assert.ok(need >= 0.5, 'Nearby wounded celestial ally should make Sanctuary useful');
assert.equal(combat.sanctuaryEligibleTarget(player), true);
assert.equal(combat.sanctuaryEligibleTarget(angel), true);
assert.equal(combat.sanctuaryEligibleTarget(neutral), false);

const playerBefore = combat.state.player.hp;
const azraelBefore = azrael.hp;
const angelBefore = angel.hp;
const farBefore = farAngel.hp;
const neutralBefore = neutral.hp;
const healedCount = combat.sanctuaryPulse(azrael, ability, 0, 0, 0);
assert.equal(healedCount, 3, 'Pulse should heal player, caster and nearby celestial ally only');
assert.ok(combat.state.player.hp > playerBefore, 'Player inside Sanctuary must be healed');
assert.ok(azrael.hp > azraelBefore, 'Azrael must receive conservative self-healing');
assert.ok(angel.hp > angelBefore, 'Other celestial allies inside Sanctuary must be healed');
assert.equal(farAngel.hp, farBefore, 'Celestial allies outside Sanctuary must not be healed');
assert.equal(neutral.hp, neutralBefore, 'Non-celestial neutral actors must not be healed');

const playerGain = combat.state.player.hp - playerBefore;
const selfGain = azrael.hp - azraelBefore;
assert.ok(playerGain > 0 && selfGain > 0);
assert.ok(selfGain < Math.round(AZRAEL_DEF.maxHp * ability.celestialHealPct), 'Caster self-heal must stay below normal celestial ally percentage');

console.log('Sanctuary healing smoke passed: position gating, faction gating, player healing, celestial ally healing, and conservative Azrael self-heal.');
