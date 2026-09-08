import assert from 'node:assert/strict';

globalThis.location = { search: '' };
globalThis.Phaser = { Math: { Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) } } };

const { GAME_VERSION } = await import('../dist/js/config.js');
const { SERAPHEL_DEF } = await import('../dist/js/data/seraphel.js');
const { Seraphel } = await import('../dist/js/entities/Seraphel.js');

assert.equal(GAME_VERSION, '0.1.4.4.5.4.4.1');

function makeScheduler() {
  const tasks = [];
  return {
    tasks,
    delayedCall(delay, fn) { tasks.push({ delay, fn }); return { remove() {} }; }
  };
}

// Pyre of the Fallen Sun must resolve multiple real damaging pulses rather than
// one flashy hit. The first impact is strongest; follow-up solar bursts remain real.
{
  const scheduler = makeScheduler();
  const pulseLog = [];
  const probe = Object.create(Seraphel.prototype);
  probe.dead = false;
  probe.body = { x: 100, y: 100 };
  probe.scene = {
    time: scheduler,
    cameras: { main: { shake(ms, intensity) { probe._shakes.push([ms, intensity]); } } },
  };
  probe._shakes = [];
  probe.combat = { audio: { play() {} } };
  probe.paletteBurst = (...args) => probe._fx.push(['palette', ...args]);
  probe.featherBurst = (...args) => probe._fx.push(['feather', ...args]);
  probe.brokenHalo = (...args) => probe._fx.push(['halo', ...args]);
  probe._fx = [];
  probe.hostileTargets = () => [];
  probe.radialDamage = (x, y, radius, multiplier, type, knockback, status) => {
    pulseLog.push({ x, y, radius, multiplier, type, knockback, status: status?.id || null });
    return 1;
  };
  probe.abilityTargetX = 280;
  probe.abilityTargetY = 320;
  const ability = SERAPHEL_DEF.abilities.pyreFallenSun;
  assert.deepEqual(ability.pulseDelays, [0, 150, 310, 520]);
  probe.triggerAbility(ability);
  assert.equal(scheduler.tasks.length, 4, 'Pyre must schedule four real pulses');
  scheduler.tasks.sort((a, b) => a.delay - b.delay).forEach(task => task.fn());
  assert.equal(pulseLog.length, 4, 'Pyre must execute all four damage pulses');
  assert.deepEqual(pulseLog.map(entry => entry.type), ['fire', 'fire', 'fire', 'fire']);
  assert.deepEqual(pulseLog.map(entry => entry.status), ['burn', 'burn', 'burn', 'burn']);
  assert.ok(pulseLog[0].multiplier > pulseLog[1].multiplier && pulseLog[1].multiplier > pulseLog[2].multiplier, 'Pyre opening impact should remain the strongest');
  assert.ok(probe._fx.some(entry => entry[0] === 'feather'), 'Pyre pulses should still carry fallen feather effects');
  assert.ok(probe._shakes.length >= 1, 'Pyre pulses should be capable of shaking the camera on real hits');
}

// Prismatic Dominion must produce seven real damaging beams, prefer different
// living targets when available, re-acquire after kills, and still collapse for
// a final damaging pulse.
{
  const scheduler = makeScheduler();
  const probe = Object.create(Seraphel.prototype);
  probe.dead = false;
  probe.body = { x: 0, y: 0 };
  probe.def = SERAPHEL_DEF;
  probe.scene = {
    time: scheduler,
    cameras: { main: { shake(ms, intensity) { probe._shakes.push([ms, intensity]); } } },
  };
  probe._shakes = [];
  probe.combat = { audio: { play() {} } };
  probe.beam = (...args) => probe._beams.push(args);
  probe.paletteBurst = (...args) => probe._fx.push(['palette', ...args]);
  probe.featherBurst = (...args) => probe._fx.push(['feather', ...args]);
  probe.brokenHalo = (...args) => probe._fx.push(['halo', ...args]);
  probe._beams = [];
  probe._fx = [];
  const a = { id: 'a', dead: false, state: 'idle', body: { x: 90, y: 0, active: true } };
  const b = { id: 'b', dead: false, state: 'idle', body: { x: 110, y: 0, active: true } };
  const c = { id: 'c', dead: false, state: 'idle', body: { x: 130, y: 0, active: true } };
  probe.hostileTargets = () => [a, b, c].filter(t => !t.dead);
  const damageLog = [];
  probe.damageTarget = (target, multiplier, type) => {
    damageLog.push({ id: target.id, multiplier, type });
    if (target === a || target === b) target.dead = true; // Force live-pool reacquisition after kills.
    return true;
  };
  const collapseLog = [];
  probe.radialDamage = (x, y, radius, multiplier, type) => { collapseLog.push({ x, y, radius, multiplier, type }); return 1; };
  probe.abilityTargetX = 0;
  probe.abilityTargetY = 0;
  const ability = SERAPHEL_DEF.abilities.prismaticDominion;
  assert.equal(ability.strikes, 7);
  probe.triggerAbility(ability);
  assert.equal(scheduler.tasks.length, 8, 'Prismatic should schedule seven beams plus one final collapse pulse');
  scheduler.tasks.sort((a, b) => a.delay - b.delay).forEach(task => task.fn());
  assert.equal(damageLog.length, 7, 'All seven beams must attempt real damage');
  assert.deepEqual(damageLog.map(entry => entry.id), ['a', 'b', 'c', 'c', 'c', 'c', 'c'], 'Beams should prefer fresh living targets, then repeat the sole survivor rather than fizzle');
  assert.deepEqual(damageLog.map(entry => entry.type), ['fire','ice','lightning','wind','earth','celestial','shadow']);
  assert.equal(collapseLog.length, 1, 'Prismatic must still finish with one collapse pulse');
  assert.equal(collapseLog[0].type, 'celestial');
  assert.ok(probe._beams.length >= 7, 'Each Prismatic beam should still render beam FX');
  assert.ok(probe._fx.some(entry => entry[0] === 'feather') && probe._fx.some(entry => entry[0] === 'halo'), 'Prismatic collapse should keep its larger finishing effects');
  assert.ok(probe._shakes.length >= 1, 'Prismatic collapse should be able to shake the camera once real beams/collapse land');
}

console.log('Seraphel multihit reliability smoke passed: Pyre schedules four real pulses and Prismatic fires seven damaging beams with live-target reacquisition plus a finishing collapse.');
