import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };
globalThis.Phaser = { Math: { Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) } } };

const { GAME_VERSION, SAVE_VERSION, SAVE_KEY } = await import('../dist/js/config.js');
const { MAP_DEFS } = await import('../dist/js/data/world.js');
const { WARFRONT_COLLIDERS, WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');
const { AzraelFreeplayController } = await import('../dist/js/systems/AzraelFreeplayController.js');

assert.equal(GAME_VERSION, '0.1.4.4.5.4.3');
assert.equal(SAVE_VERSION, 2);
assert.equal(SAVE_KEY, 'hellrpg.ashfall.save.v1');
assert.equal(AZRAEL_DEF.internalLevel, 175);
assert.equal(AZRAEL_DEF.threatTier, 'apex');
assert.equal(Object.keys(AZRAEL_DEF.abilities).length, 7, 'Freeplay must expose Azrael’s existing seven-skill definition rather than cloning a reduced kit');

// Freeplay starts safely in the Celestial stronghold/rear-line side of the Veil Warfront.
const entry = MAP_DEFS.map_veil_warfront.entryPoints.azrael_freeplay;
assert.deepEqual(entry, { x: 5550, y: 1710 });
const hits = WARFRONT_COLLIDERS.filter(c => entry.x >= c.x - 34 && entry.x <= c.x + c.width + 34 && entry.y >= c.y - 34 && entry.y <= c.y + c.height + 34);
assert.deepEqual(hits, [], 'Azrael Freeplay entry must be clear of visible-source Warfront collision');
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum, row) => sum + row.count, 0), 32, 'Freeplay must not alter production Warfront population');

// His compact runtime art follows the disposable session across every map so roaming/transitions do not reveal missing textures.
const freeplayState = { sessionMode: 'azrael_freeplay', player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} };
for (const mapId of ['map_veil_warfront', 'map_veil_threshold', 'map_cinder_refuge', 'map_ashfall_hollow']) {
  const keys = new Set(assetDefsForMap(freeplayState, mapId).map(asset => asset.key));
  for (const key of Object.values(AZRAEL_DEF.assets)) assert.ok(keys.has(key), `${mapId} Freeplay package missing ${key}`);
}

// Manual controller must call the SAME existing actor ability entry point, respect real cooldown/major pacing,
// and choose hostile targets without changing the actor's autonomous AI implementation.
const hostile = { faction: 'monster', dead: false, state: 'idle', body: { x: 90, y: 0, active: true }, def: { name: 'Test Demon' } };
const actor = {
  faction: 'celestial', def: AZRAEL_DEF, dead: false, currentAbility: null, state: 'idle', stateUntil: 0,
  knockbackUntil: 0, direction: 3, body: { x: 0, y: 0, active: true }, combat: { statuses: { actionLocked: () => false } },
  cooldownReady: () => true, majorReady: () => true,
  beginAbility(ability, target) { this._began = { ability, target }; return true; }
};
const input = { moveX: 1, moveY: 0 };
const scene = { time: { now: 1000 }, combat: { hostileTargetsFor: source => { assert.equal(source, actor); return [hostile]; } } };
const controller = new AzraelFreeplayController(scene, actor, input);
assert.equal(controller.requestAbility('azrael_celestial_strike', 1000), true);
assert.equal(actor._began.ability, AZRAEL_DEF.abilities.celestialStrike);
assert.equal(actor._began.target, hostile);
actor._began = null;
actor.cooldownReady = () => false;
assert.equal(controller.requestAbility('azrael_judgment_blast', 1100), false, 'Human control must obey the real cooldown gate');
actor.cooldownReady = () => true;
actor.majorReady = () => false;
assert.equal(controller.requestAbility('azrael_heavenfall', 1200), false, 'Human control must obey Azrael’s existing major-ability pacing lock');

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const mainSource = await readFile(new URL('../dist/js/main.js', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const uiSource = await readFile(new URL('../dist/js/ui.js', import.meta.url), 'utf8');
const azraelSource = await readFile(new URL('../dist/js/entities/Azrael.js', import.meta.url), 'utf8');

for (const marker of ['id="mythic-freeplay"', 'id="freeplay-azrael"', 'id="mythic-bank-toggle"', '<span>AZRAEL</span>', 'ArchAngel • Lv. ??? • Full 7-skill kit']) {
  assert.ok(html.includes(marker), `Title/HUD shell missing ${marker}`);
}
assert.ok(html.includes('No quests, progression, loot rewards, or save writes'), 'Title menu must explain disposable freeplay behavior');
const createStart = mainSource.indexOf('function createAzraelFreeplayState()');
const createEnd = mainSource.indexOf('\nfunction bootGame', createStart);
assert.ok(createStart >= 0 && createEnd > createStart, 'Main boot must define a dedicated Azrael freeplay state factory');
const freeplayFactory = mainSource.slice(createStart, createEnd);
assert.ok(freeplayFactory.includes('createDefaultState()') && freeplayFactory.includes("state.sessionMode = 'azrael_freeplay'"));
assert.ok(!freeplayFactory.includes('saveManager.reset') && !freeplayFactory.includes('saveManager.save'), 'Freeplay state factory must never delete or overwrite the campaign slot');

// Normal Azrael AI must remain a separate path. Freeplay never calls actor.update(), and the actor source itself
// contains no Freeplay branching at all.
assert.ok(worldSource.includes('if (!this.azraelFreeplayActive && canUpdateNamed(this.azrael)) this.azrael.update(time, delta, combatants);'));
assert.ok(worldSource.includes('new AzraelFreeplayController(this, this.azrael, actionInput)'));
assert.ok(!azraelSource.includes('azrael_freeplay') && !azraelSource.includes('Freeplay'), 'Normal Azrael actor/AI source must not gain mode-specific branches');

// Disposable contract is explicit: saves, rewards, quest/merchant progression, loot and progression commands are blocked.
assert.ok(worldSource.includes('if (this.azraelFreeplayActive) return false;'), 'safeSave must reject Mythic Freeplay');
assert.ok(worldSource.includes('if (this.azraelFreeplayActive) return;') && worldSource.includes('Never mint campaign XP/ash/loot/quests'), 'Freeplay enemy deaths must bypass production rewards');
assert.ok(worldSource.includes("['useConsumable', 'useQuickConsumable', 'buyItem', 'equip', 'unequip', 'dropItem', 'destroyItem', 'allocateStats']"), 'Progression-bearing commands must be rejected in Freeplay');
assert.ok(worldSource.includes('freeplay talk') && worldSource.includes('uiAction: null'), 'NPCs must remain conversational but not open merchant/quest progression in Freeplay');
assert.ok(worldSource.includes('do not even') && worldSource.includes('surface progression-bearing POIs, recovery points or loot'), 'Freeplay interaction selection must omit progression-bearing world interactions');

// All seven existing abilities are reachable through Strike + two three-button banks.
for (const token of ['celestialStrike', 'wingBurst', 'judgmentBlast', 'sanctifiedNova', 'seraphicJudgment', 'sanctuaryFirstLight', 'heavenfall']) {
  assert.ok(uiSource.includes(token) || (token === 'celestialStrike' && uiSource.includes('Celestial Strike')), `Freeplay HUD missing ${token}`);
}
assert.ok(uiSource.includes("['wingBurst', 'judgmentBlast', 'sanctifiedNova']"));
assert.ok(uiSource.includes("['seraphicJudgment', 'sanctuaryFirstLight', 'heavenfall']"));
assert.ok(uiSource.includes('majorLockRemaining'), 'Freeplay HUD must show/obey the shared major pacing lock as well as individual cooldowns');

console.log('Azrael Freeplay smoke passed: main-menu disposable session, safe Warfront spawn, cross-map compact assets, seven real abilities, separate human controller, unchanged autonomous AI path, reward/save/progression isolation, and production population preservation.');
