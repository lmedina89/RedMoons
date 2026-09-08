import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AZRAEL_DEF } from '../dist/js/data/specialActors.js';
import { PROJECTILE_DEFS } from '../dist/js/data/projectiles.js';
import { ProjectileManager } from '../dist/js/systems/ProjectileManager.js';

const blast = AZRAEL_DEF.abilities.judgmentBlast;
assert.deepEqual([...blast.projectileDelays], [0, 90, 180], 'Judgment Blast must fire a three-shot staggered volley');
assert.deepEqual([...blast.projectileScales], [0.60, 0.45, 0.45], 'Judgment volley must preserve the intended center/wing damage hierarchy');
assert.deepEqual([...blast.projectileFanOffsets], [0, -26, 26], 'Judgment volley must use a shallow center/left/right coverage fan');
assert.equal(blast.targetLeadSeconds, 0.42, 'Judgment volley should use modest movement lead rather than homing');
assert.ok(Math.abs([...blast.projectileScales].reduce((a, b) => a + b, 0) - 1.5) < 0.0001, 'A perfect three-bolt connection should cap at 150% of the old single-blast damage budget');
assert.equal(PROJECTILE_DEFS.celestial_judgment.radius, 16, 'Judgment collision core should be slightly more forgiving than the original radius 13');

// Regression for the actual field bug: ProjectileManager derives hostility from
// sourceActor. With a real source actor, a celestial judgment shot crossing a
// hostile target must enter damageTarget; a missing sourceActor would return an
// empty target list and silently pass through every demon.
function fakeSprite() {
  return {
    x: -200, y: -200, active: false, visible: false, rotation: 0,
    body: { enable: false, velocity: { x: 0, y: 0 }, setSize() {} },
    setActive(v) { this.active = v; return this; },
    setVisible(v) { this.visible = v; return this; },
    setDepth() { return this; },
    setTexture() { return this; },
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setRotation(v) { this.rotation = v; return this; },
    setVelocity(x, y) { this.body.velocity.x = x; this.body.velocity.y = y; return this; }
  };
}

let damageCalls = 0;
let providerActor = null;
const sourceActor = { faction: 'celestial', body: { x: 0, y: 0 }, dead: false, state: 'idle' };
const hostile = { faction: 'monster', sprite: { x: 20, y: 0, active: true }, dead: false, state: 'idle' };
const scene = {
  time: { now: 0 },
  currentMap: { width: 1000, height: 1000 },
  state: { settings: { screenShake: false } },
  obstacles: null,
  physics: { add: { sprite: () => fakeSprite() } }
};
const resolver = { damageTarget(_target, amount) { damageCalls += 1; return Math.max(1, Math.round(amount)); } };
const statuses = { apply() {} };
const fx = { trail() {}, celestialImpact() {}, impact() {} };
const audio = { play() {} };
const manager = new ProjectileManager(scene, resolver, statuses, fx, audio, null, [], 2, actor => {
  providerActor = actor;
  return actor === sourceActor ? [hostile] : [];
});
assert.equal(manager.launch('celestial_judgment', {
  team: 'celestial', sourceActor, x: 0, y: 0, targetX: 100, targetY: 0,
  damage: 100, sourcePower: 100, sourceId: 'npc_archangel_azrael'
}), true);
manager.items[0].sprite.setPosition(20, 0);
manager.update(1);
assert.equal(providerActor, sourceActor, 'Projectile hostility lookup must receive Azrael as the firing actor');
assert.equal(damageCalls, 1, 'Judgment projectile crossing a hostile target must resolve damage exactly once');
assert.equal(manager.items[0].sprite.active, false, 'Judgment projectile should deactivate after a registered hit');

const combatSource = await readFile(new URL('../dist/js/systems/CombatSystem.js', import.meta.url), 'utf8');
const projectileSource = await readFile(new URL('../dist/js/systems/ProjectileManager.js', import.meta.url), 'utf8');
assert.ok(combatSource.includes("sourceActor: actor") && combatSource.includes('projectileDelays') && combatSource.includes('targetLeadSeconds'), 'Azrael volley execution must pass sourceActor and consume stagger/lead data');
assert.ok(combatSource.includes('liveTargetNode?.body?.velocity') && combatSource.includes('projectileFanOffsets'), 'Each staggered shot must re-read target motion and apply the authored shallow fan');
assert.ok(projectileSource.includes("item.data.def.id === 'celestial_judgment'") && projectileSource.includes('judgment ? 70 : 58'), 'Judgment hits must have distinct readable impact feedback');

console.log('Azrael Judgment Blast smoke passed: sourceActor hit-registration bug fixed, three-shot staggered fan/lead contract, larger collision core, real damage path, and clearer impact feedback.');
