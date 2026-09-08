import assert from 'node:assert/strict';

globalThis.location = { search: '' };

const { ELEXIS_DEF } = await import('../dist/js/data/elexis.js');
const { Elexis } = await import('../dist/js/entities/Elexis.js');

const { crownDominion, edictSanctuary } = ELEXIS_DEF.abilities;
assert.equal(edictSanctuary.initialPlayerHealPct, 0.12, 'Edict opening player pulse must restore 12% max HP');
assert.equal(edictSanctuary.pulsePlayerHealPct, 0.05, 'Edict sustained player pulses must restore 5% max HP');
assert.equal(crownDominion.playerHealPct, 0.03, 'Crown player aura pulse must restore 3% max HP');
assert.equal(edictSanctuary.initialCelestialHealPct, 0.10, 'Ordinary-celestial Edict opening heal must remain unchanged');
assert.equal(edictSanctuary.pulseCelestialHealPct, 0.032, 'Ordinary-celestial Edict sustained heal must remain unchanged');
assert.equal(edictSanctuary.initialSelfHealPct, 0.055, 'El’exis Edict self-heal must remain unchanged');
assert.equal(edictSanctuary.pulseSelfHealPct, 0.020, 'El’exis Edict self pulse must remain unchanged');
assert.equal(crownDominion.celestialHealPct, 0.015, 'Crown ordinary-celestial healing must remain unchanged');
assert.equal(crownDominion.selfHealPct, 0.006, 'Crown El’exis self-healing must remain unchanged');

function makeHarness() {
  const player = {
    isPlayer: true,
    faction: 'player',
    hp: 50,
    maxHp: 100,
    body: { x: 0, y: 0, active: true },
    dead: false,
    state: 'idle'
  };
  const elexis = Object.create(Elexis.prototype);
  elexis.dead = false;
  elexis.simulationAwake = true;
  elexis.def = ELEXIS_DEF;
  elexis.faction = 'celestial';
  elexis.body = { x: 0, y: 0, active: true };
  elexis.scene = {
    player,
    time: { delayedCall(_delay, callback) { callback(); } }
  };
  elexis.combat = {
    friendlyTargetsFor() { return [player]; },
    sanctuaryVitals(target) {
      return {
        hp: target.hp,
        maxHp: target.maxHp,
        set(value) { target.hp = value; }
      };
    },
    damageNumbers: { showHealing() {} },
    fx: { burst() {}, ring() {} },
    statuses: { apply() { return true; } },
    audio: { play() {} },
    shakeAt() {}
  };
  elexis.damageInRadius = () => 0;
  elexis.fxEdictPulse = () => {};
  elexis.ring = () => {};
  elexis.burst = () => {};
  return { elexis, player };
}

{
  const { elexis, player } = makeHarness();
  const healed = elexis.edictPulse(edictSanctuary, 0, 0, 0);
  assert.equal(healed, 1, 'Edict opening pulse should recognize the wounded player');
  assert.equal(player.hp, 62, 'Edict opening pulse should restore exactly 12 HP on a 100 max-HP player');
  elexis.edictPulse(edictSanctuary, 0, 0, 1);
  assert.equal(player.hp, 67, 'Edict sustained pulse should restore exactly 5 HP on a 100 max-HP player');
}

{
  const { elexis, player } = makeHarness();
  elexis.crownPulse(1000);
  assert.equal(player.hp, 53, 'Crown pulse should restore exactly 3 HP on a 100 max-HP player');
}

// Named-mythic cross-healing reduction remains independent of the player buff.
{
  const elexis = Object.create(Elexis.prototype);
  elexis.dead = false;
  elexis.def = ELEXIS_DEF;
  elexis.faction = 'celestial';
  elexis.scene = { player: null };
  const mythic = {
    faction: 'celestial',
    def: { faction: 'celestial', tier: 'mythic', maxHp: 1000 },
    hp: 500,
    body: { x: 0, y: 0, active: true },
    dead: false,
    state: 'idle'
  };
  elexis.combat = {
    sanctuaryVitals(target) {
      return { hp: target.hp, maxHp: target.def.maxHp, set(value) { target.hp = value; } };
    },
    damageNumbers: { showHealing() {} },
    fx: { burst() {}, ring() {} }
  };
  assert.equal(elexis.healTarget(mythic, 0.10), 46, 'Named mythic cross-healing must remain reduced to 46% of configured healing');
}

console.log('El’exis healing-polish smoke passed: player Edict is 12% + 5% sustained, Crown is 3% per pulse, and self/common/mythic safeguards remain unchanged.');
