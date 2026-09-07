import assert from 'node:assert/strict';
import { Azrael } from '../dist/js/entities/Azrael.js';
import { Enemy } from '../dist/js/entities/Enemy.js';
import { CombatResolver } from '../dist/js/systems/CombatResolver.js';
import { relationBetween } from '../dist/js/data/factions.js';
import { AZRAEL_DEF } from '../dist/js/data/specialActors.js';

// Faction contract: the player and celestial actor are allies, monsters are
// hostile in both directions, so Azrael can never select the player as prey.
assert.equal(relationBetween({ faction: 'celestial' }, { faction: 'player' }), 'friendly');
assert.equal(relationBetween({ faction: 'celestial' }, { faction: 'monster' }), 'hostile');
assert.equal(relationBetween({ faction: 'monster' }, { faction: 'celestial' }), 'hostile');

// Cluster-aware targeting smoke. A slightly farther group must outrank a lone
// closer mob so Heavenfall has a reason to exist in autonomous combat.
const azrael = Object.create(Azrael.prototype);
azrael.faction = 'celestial';
azrael.body = { x: 0, y: 0 };
azrael.homeX = 0; azrael.homeY = 0;
azrael.def = {
  senseRange: 1000,
  leashRange: 1000,
  abilities: { heavenfall: { targetClusterRadius: 150 } }
};
const mob = (name, x, y) => ({ faction: 'monster', def: { name }, sprite: { x, y, active: true }, dead: false, state: 'idle' });
const lone = mob('Lone', -100, 0);
const clusterA = mob('Cluster A', 132, 0);
const clusterB = mob('Cluster B', 146, 18);
const clusterC = mob('Cluster C', 144, -22);
assert.equal(azrael.chooseTarget([lone, clusterA, clusterB, clusterC]), clusterA);

// Celestial expansion contract: the two added AoEs are intentionally more
// frequent than Heavenfall and all three major invocations participate in a
// shared pacing lock so the spectacle stays readable on mobile.
const { sanctifiedNova, seraphicJudgment, heavenfall } = AZRAEL_DEF.abilities;
assert.ok(sanctifiedNova && seraphicJudgment, 'Expanded six-skill kit must include both new celestial AoEs');
assert.ok(sanctifiedNova.cooldownMs < heavenfall.cooldownMs);
assert.ok(seraphicJudgment.cooldownMs < heavenfall.cooldownMs);
assert.equal(sanctifiedNova.major, true);
assert.equal(seraphicJudgment.major, true);
assert.equal(heavenfall.major, true);
assert.deepEqual([...seraphicJudgment.pulseDelays], [0, 120, 250]);
assert.ok(Math.abs([...seraphicJudgment.pulseScales].reduce((a, b) => a + b, 0) - 1) < 0.0001, 'Seraphic Judgment pulse damage must total its configured single-cast multiplier');

// Contribution gate smoke. Pure celestial damage must not generate player
// rewards; recent material player damage should qualify a later shared kill.
const enemy = Object.create(Enemy.prototype);
enemy.def = { maxHp: 100 };
enemy.playerContributionDamage = 0;
enemy.lastPlayerContributionAt = 0;
enemy.lastDamageTeam = null;
enemy.recordDamageContribution('celestial', 100, 1000);
assert.equal(enemy.playerRewardEligible(1000), false);
enemy.recordDamageContribution('player', 10, 1400);
assert.equal(enemy.playerRewardEligible(1500), true);
assert.equal(enemy.playerRewardEligible(14001), false);

// Real-damage smoke: Azrael is not invulnerable. His huge defense reduces a
// low-level physical hit to chip damage, but HP still falls through the same
// resolver used by normal combatants.
const fakeScene = { time: { now: 5000 } };
const noOp = { show() {}, impact() {}, play() {} };
const resolver = new CombatResolver(fakeScene, { player: { stats: {} }, equipment: {}, inventory: [] }, noOp, noOp, noOp);
let hp = AZRAEL_DEF.maxHp;
const friendlyAzrael = {
  isFriendlyActor: true,
  dead: false,
  def: AZRAEL_DEF,
  body: { x: 20, y: 20 },
  sprite: { active: true },
  takeResolvedDamage(amount) { hp -= amount; return true; }
};
const applied = resolver.damageFriendly(friendlyAzrael, 25, { type: 'physical', sourceX: 0, sourceY: 0, sourceTeam: 'enemy' });
assert.ok(applied >= 1, 'High defense should still allow real minimum chip damage');
assert.ok(hp < AZRAEL_DEF.maxHp, 'Azrael HP must decrease; he is not invulnerable');

console.log('Azrael logic smoke passed: faction targeting, cluster choice, six-skill pacing, contribution gate, and real chip damage.');
