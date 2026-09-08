import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';

globalThis.location = { search: '' };
globalThis.Phaser = { Math: { Distance: { Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) } } };

const { GAME_VERSION, SAVE_VERSION, SAVE_KEY } = await import('../dist/js/config.js');
const { SERAPHEL_DEF } = await import('../dist/js/data/seraphel.js');
const { CANONICAL_POWER_STAT_SHEETS } = await import('../dist/js/data/mythicStatSheets.js');
const { statBudgetForLevel } = await import('../dist/js/data/statProgression.js');
const { MYTHIC_LEVEL_HIERARCHY } = await import('../dist/js/data/powerTiers.js');
const { areHostile } = await import('../dist/js/data/factions.js');
const { MAP_DEFS, SPAWN_REGIONS } = await import('../dist/js/data/world.js');
const { WARFRONT_COLLIDERS, WARFRONT_SPAWN_REGIONS } = await import('../dist/js/data/warfront.js');
const { MYTHIC_FREEPLAY_WARFRONT_SPAWNS } = await import('../dist/js/data/mythicFreeplayWarfront.js');
const { assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');
const { Seraphel } = await import('../dist/js/entities/Seraphel.js');
const { SeraphelFreeplayController } = await import('../dist/js/systems/SeraphelFreeplayController.js');

assert.equal(GAME_VERSION, '0.1.4.4.5.4.4.1');
assert.equal(SAVE_VERSION, 2);
assert.equal(SAVE_KEY, 'hellrpg.ashfall.save.v1');
assert.deepEqual(MYTHIC_LEVEL_HIERARCHY.seraphel, { internalLevel: 220, threatTier: 'apex' });
assert.equal(SERAPHEL_DEF.internalLevel, 220);
assert.equal(SERAPHEL_DEF.threatTier, 'apex');
assert.equal(SERAPHEL_DEF.faction, 'fallen');
assert.equal(SERAPHEL_DEF.resourceModel, 'infinite_essence');
assert.equal(statBudgetForLevel(220), 1115);
assert.equal(SERAPHEL_DEF.statBudget, 1115);
assert.deepEqual(SERAPHEL_DEF.primaryStats, { str: 205, dex: 285, vit: 270, spr: 355 });
assert.equal(Object.values(SERAPHEL_DEF.primaryStats).reduce((sum, value) => sum + value, 0), 1115);
assert.equal(CANONICAL_POWER_STAT_SHEETS.seraphel.statBudget, 1115);
assert.equal(SERAPHEL_DEF.combatStatsMode, 'hand_tuned_preserved');
assert.deepEqual([SERAPHEL_DEF.maxHp, SERAPHEL_DEF.attack, SERAPHEL_DEF.defense], [28500, 570, 320]);

// New third faction: Fallen is hostile to both armies, while the established
// Heaven-vs-Hell relationship remains unchanged and Fallen never self-harms.
const actor = faction => ({ faction, dead: false, body: { active: true } });
assert.equal(areHostile(actor('fallen'), actor('celestial')), true);
assert.equal(areHostile(actor('celestial'), actor('fallen')), true);
assert.equal(areHostile(actor('fallen'), actor('monster')), true);
assert.equal(areHostile(actor('monster'), actor('fallen')), true);
assert.equal(areHostile(actor('fallen'), actor('fallen')), false);
assert.equal(areHostile(actor('celestial'), actor('monster')), true, 'Existing Celestial-vs-Infernal hostility must remain unchanged');

// Exactly seven approved offensive abilities span every required elemental language.
const abilities = Object.values(SERAPHEL_DEF.abilities);
assert.equal(abilities.length, 7);
assert.deepEqual(abilities.map(a => a.name), [
  'Pyre of the Fallen Sun', 'Crown of the Frozen Abyss', 'Tempest of Exile',
  'Worldbreaker Testament', 'Eclipse of Grace', 'Prismatic Dominion', 'Sevenfold Cataclysm'
]);
assert.deepEqual(abilities.map(a => a.element), ['fire', 'ice_water', 'lightning_wind', 'earth', 'light_dark', 'all', 'all']);
assert.equal(SERAPHEL_DEF.abilities.sevenfoldCataclysm.ultimate, true);
assert.deepEqual(SERAPHEL_DEF.abilities.pyreFallenSun.pulseDelays, [0, 150, 310, 520]);
assert.deepEqual(SERAPHEL_DEF.abilities.pyreFallenSun.pulseScales, [1.00, 0.56, 0.42, 0.36]);
assert.equal(SERAPHEL_DEF.abilities.prismaticDominion.strikes, 7);
assert.equal(SERAPHEL_DEF.abilities.prismaticDominion.collapseDelayMs, 160);
assert.equal(SERAPHEL_DEF.abilities.sevenfoldCataclysm.stages, 7);
assert.ok(SERAPHEL_DEF.abilities.sevenfoldCataclysm.cooldownMs >= 18000, 'Sevenfold must remain an ultimate rather than spam');

// Six-stage basic chain deliberately uses six different complete source actions
// and grows in range, damage and presentation authority through the finisher.
assert.equal(SERAPHEL_DEF.basicCombo.length, 6);
assert.deepEqual(SERAPHEL_DEF.basicCombo.map(stage => stage.action), ['slash', 'thrust', 'backslash', 'halfslash', 'shoot', 'spellcast']);
for (let i = 1; i < SERAPHEL_DEF.basicCombo.length; i += 1) {
  assert.ok(SERAPHEL_DEF.basicCombo[i].range > SERAPHEL_DEF.basicCombo[i - 1].range, `Combo range must grow at hit ${i + 1}`);
  assert.ok(SERAPHEL_DEF.basicCombo[i].damageMultiplier > SERAPHEL_DEF.basicCombo[i - 1].damageMultiplier, `Combo damage must grow at hit ${i + 1}`);
}
assert.ok(SERAPHEL_DEF.basicCombo.at(-1).range >= 250 && SERAPHEL_DEF.basicCombo.at(-1).arcDegrees === 360);

// The authoritative source sheet is preserved unchanged and every one of its
// 15 expected Expanded-LPC action blocks has a compact runtime crop.
const sourceBytes = await readFile(new URL('../source-assets/character-concepts/2026-09-08/fallen/FallenAngel.png', import.meta.url));
assert.equal(sourceBytes.toString('ascii', 1, 4), 'PNG');
assert.deepEqual([sourceBytes.readUInt32BE(16), sourceBytes.readUInt32BE(20)], [832, 3456]);
assert.equal(crypto.createHash('sha256').update(sourceBytes).digest('hex'), '7326ac496b216e28f251cf537bb28f70c4dc80a49388629a28617a7e8a93e472');
const expectedCrops = new Map([
  ['spellcast',[448,256]], ['thrust',[512,256]], ['walk',[576,256]], ['slash',[384,256]], ['shoot',[832,256]],
  ['hurt',[384,64]], ['climb',[384,64]], ['idle',[128,256]], ['jump',[320,256]], ['sit',[192,256]],
  ['emote',[192,256]], ['run',[512,256]], ['combatIdle',[128,256]], ['backslash',[832,256]], ['halfslash',[384,256]]
]);
assert.deepEqual(Object.keys(SERAPHEL_DEF.assets).sort(), [...expectedCrops.keys()].sort());
for (const [action, dims] of expectedCrops) {
  const key = SERAPHEL_DEF.assets[action];
  assert.ok(key, `Missing runtime key for ${action}`);
  const fileAction = action === 'combatIdle' ? 'combat-idle' : action;
  const bytes = await readFile(new URL(`../dist/assets/npcs/seraphel/seraphel-${fileAction}.png`, import.meta.url));
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], dims, `${action} crop must preserve exact LPC geometry`);
  assert.ok(bytes.length > 500, `${action} crop must contain real image data`);
}

// Safe Fallen entry is deliberately outside immediate Eternal-Warfront formations.
const entry = MAP_DEFS.map_veil_warfront.entryPoints.seraphel_freeplay;
assert.deepEqual(entry, { x: 3072, y: 360 });
const pointInsideSolid = (x, y, c, pad = 34) => x >= c.x - c.width / 2 - pad && x <= c.x + c.width / 2 + pad && y >= c.y - c.height / 2 - pad && y <= c.y + c.height / 2 + pad;
assert.equal(WARFRONT_COLLIDERS.some(c => pointInsideSolid(entry.x, entry.y, c)), false, 'Seraphel Freeplay entry must be collision-clear');
const nearestRegular = Math.min(...MYTHIC_FREEPLAY_WARFRONT_SPAWNS.map(row => Math.hypot((row.x + row.width / 2) - entry.x, (row.y + row.height / 2) - entry.y)));
assert.ok(nearestRegular >= 600, `Seraphel should get a safe neutral opening pocket; nearest regular spawn is ${nearestRegular.toFixed(1)}px`);
assert.equal(WARFRONT_SPAWN_REGIONS.reduce((sum, row) => sum + row.count, 0), 32, 'Campaign Warfront must remain exactly 32 regular actors');
assert.equal(SPAWN_REGIONS.some(row => String(row.enemyId).includes('seraphel')), false, 'Seraphel must not have a campaign spawn before the optional-boss pass');

// Compact art follows Seraphel across disposable map transitions; the Eternal
// Warfront profile is reused only when he is actually on that realm.
const freeplayState = { sessionMode: 'seraphel_freeplay', player: { mapId: 'map_veil_warfront' }, inventory: [], equipment: {} };
for (const mapId of ['map_veil_warfront', 'map_veil_threshold', 'map_cinder_refuge', 'map_ashfall_hollow']) {
  const keys = new Set(assetDefsForMap(freeplayState, mapId).map(asset => asset.key));
  for (const key of Object.values(SERAPHEL_DEF.assets)) assert.ok(keys.has(key), `${mapId} Seraphel package missing ${key}`);
}

// Tempest of Exile re-queries the living hostile pool every bounce. A killed
// prior target is excluded immediately; one surviving target can be repeated;
// no surviving target ends the chain instead of swinging at a corpse.
const tempestProbe = Object.create(Seraphel.prototype);
tempestProbe.body = { x: 0, y: 0 };
tempestProbe.def = SERAPHEL_DEF;
const a = { id: 'a', dead: false, state: 'idle', body: { x: 90, y: 0, active: true } };
const b = { id: 'b', dead: false, state: 'idle', body: { x: 120, y: 0, active: true } };
tempestProbe._pool = [a, b];
tempestProbe.hostileTargets = () => tempestProbe._pool.filter(target => !target.dead);
tempestProbe.tempest = { lastTarget: a, visited: new Set([a]) };
assert.equal(tempestProbe.selectTempestTarget(), b, 'Tempest should bounce to a different living opponent when available');
b.dead = true;
assert.equal(tempestProbe.selectTempestTarget(), a, 'Tempest may return to the sole remaining living opponent');
a.dead = true;
assert.equal(tempestProbe.selectTempestTarget(), null, 'Tempest must terminate when all opponents are dead');
const seraphelSource = await readFile(new URL('../dist/js/entities/Seraphel.js', import.meta.url), 'utf8');
assert.ok(seraphelSource.includes('const target = this.selectTempestTarget();'), 'Every Tempest bounce must perform a fresh target selection');
assert.ok(seraphelSource.includes('if (!node || !actorAlive(target))'), 'Tempest must revalidate life immediately before impact');

// Full-sheet actions have purposeful roles rather than being tick-box animations.
for (const token of ["renderProgress('climb'", "renderProgress('jump'", "renderLoop('sit'", "renderLoop(fast ? 'run' : 'walk'", "renderLoop(hostileNearby ? 'combatIdle' : 'idle'"]) {
  const combined = seraphelSource + await readFile(new URL('../dist/js/systems/SeraphelFreeplayController.js', import.meta.url), 'utf8');
  assert.ok(combined.includes(token), `Seraphel full-sheet role missing ${token}`);
}

// Main-menu Freeplay is disposable and uses a separate human controller; no
// campaign boss AI is activated yet.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const mainSource = await readFile(new URL('../dist/js/main.js', import.meta.url), 'utf8');
const worldSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
const uiSource = await readFile(new URL('../dist/js/ui.js', import.meta.url), 'utf8');
for (const marker of ['id="freeplay-seraphel"', 'SERAPHEL', 'Fallen Apex', 'id="mythic-ultimate-button"']) assert.ok(html.includes(marker), `Freeplay shell missing ${marker}`);
const createStart = mainSource.indexOf('function createSeraphelFreeplayState()');
const createEnd = mainSource.indexOf('\nfunction bootGame', createStart);
assert.ok(createStart >= 0 && createEnd > createStart);
const factory = mainSource.slice(createStart, createEnd);
assert.ok(factory.includes('createDefaultState()') && factory.includes("state.sessionMode = 'seraphel_freeplay'"));
assert.ok(!factory.includes('saveManager.reset') && !factory.includes('saveManager.save'));
assert.ok(worldSource.includes('new SeraphelFreeplayController(this, this.seraphel, actionInput)'));
assert.ok(worldSource.includes('if (!this.seraphelFreeplayActive) return;'), 'Seraphel actor must not exist outside his Freeplay session yet');
assert.ok(uiSource.includes("['pyreFallenSun', 'crownFrozenAbyss', 'tempestExile']"));
assert.ok(uiSource.includes("['worldbreakerTestament', 'eclipseGrace', 'prismaticDominion']"));
assert.ok(uiSource.includes('sevenfoldCataclysm') && uiSource.includes('mythic-ultimate-button'));
assert.ok(worldSource.includes('if (this.seraphelFreeplayActive) return false;'), 'Seraphel Freeplay must reject save writes');
assert.ok(worldSource.includes('if (this.seraphelFreeplayActive) return;'), 'Seraphel kills must bypass campaign rewards');

// Existing autonomous named AI files remain byte-identical to the approved baseline.
const expectedAiHashes = new Map([
  ['Azrael.js','116fb856816a3a7c1d13022508a583d5ed395ab4e6537f8f0825bc8ebab6dab1'],
  ['Lailani.js','5e62d0ce6e7b587c7dca150718ce7c938d7279540f3cfe08f1d92aaac9349945'],
  ['Elexis.js','09dd733548dba01838a2402b871d10fc619150a68ab21a82781b24651ca8a02a'],
  ['MythicalDemon.js','78f5f7b96fda6512d76662a9cd966a9b8dd3e69a465076992bda803fa472b56a'],
  ['Zerakoth.js','0381d8c2bb6554efd1077658ad03eca0dcf3c2ed5295498daf914e3fdbd7d6e3']
]);
for (const [name, hash] of expectedAiHashes) {
  const bytes = fs.readFileSync(new URL(`../dist/js/entities/${name}`, import.meta.url));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), hash, `${name} autonomous AI must remain unchanged`);
}

// Freeplay respawn completeness: Seraphel ships at 2.6s and Azrael receives the
// same short-session recovery without modifying autonomous Azrael.js.
assert.equal(SERAPHEL_DEF.freeplayRespawnMs, 2600);
const seraphelControllerSource = await readFile(new URL('../dist/js/systems/SeraphelFreeplayController.js', import.meta.url), 'utf8');
const azraelControllerSource = await readFile(new URL('../dist/js/systems/AzraelFreeplayController.js', import.meta.url), 'utf8');
assert.ok(seraphelControllerSource.includes('if (time >= actor.respawnAt) actor.respawn(time);'));
assert.ok(azraelControllerSource.includes('actor.deathStartedAt + 2600'), 'Azrael Freeplay should no longer remain down for the old long respawn delay');

// Entity/controller separation makes a future optional-boss AI possible without
// cloning the seven ability implementations. No boss controller ships yet.
assert.equal(seraphelSource.includes('FreeplayController'), false);
assert.equal(SeraphelFreeplayController.prototype.requestAbility instanceof Function, true);
assert.equal(fs.existsSync(new URL('../dist/js/systems/SeraphelAIController.js', import.meta.url)), false, 'Optional boss AI must remain deferred');

console.log('Seraphel Mythic Freeplay smoke passed: Lv220 apex legal stat sheet, Fallen three-way faction, full 54-row action vocabulary, escalating six-hit combo, seven ultra-color elemental abilities, Pyre/Prismatic multihit metadata, corpse-safe Tempest bounces, disposable Freeplay/short respawn, safe Warfront entry, unchanged production population, and untouched existing named AI.');
