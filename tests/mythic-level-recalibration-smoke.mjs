import assert from 'node:assert/strict';
import fs from 'node:fs';

globalThis.location = { search: '' };

const { GAME_VERSION, SAVE_VERSION, SAVE_KEY } = await import('../dist/js/config.js');
const { statBudgetForLevel, statSheetTotal } = await import('../dist/js/data/statProgression.js');
const { MYTHIC_LEVEL_HIERARCHY } = await import('../dist/js/data/powerTiers.js');
const { CANONICAL_POWER_STAT_SHEETS } = await import('../dist/js/data/mythicStatSheets.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { LAILANI_DEF } = await import('../dist/js/data/lailani.js');
const { ELEXIS_DEF } = await import('../dist/js/data/elexis.js');
const { MYTHICAL_DEMON_DEF } = await import('../dist/js/data/mythicalDemon.js');

assert.equal(GAME_VERSION, '0.1.4.4.5.4.4.1');
assert.equal(SAVE_VERSION, 2);
assert.equal(SAVE_KEY, 'hellrpg.ashfall.save.v1');

const expected = Object.freeze({
  azrael: { level:175, budget:890, stats:{str:305,dex:175,vit:288,spr:122} },
  elexis: { level:150, budget:765, stats:{str:143,dex:128,vit:217,spr:277} },
  lailani: { level:150, budget:765, stats:{str:124,dex:278,vit:162,spr:201} },
  mythicalDemon: { level:135, budget:690, stats:{str:235,dex:171,vit:206,spr:78} },
  ancientDemonLord: { level:160, budget:815, stats:{str:274,dex:145,vit:283,spr:113} }
});
for (const [id, row] of Object.entries(expected)) {
  const hierarchy = MYTHIC_LEVEL_HIERARCHY[id];
  const sheet = CANONICAL_POWER_STAT_SHEETS[id];
  assert.equal(hierarchy.internalLevel, row.level, `${id} level mismatch`);
  assert.equal(sheet.level, row.level);
  assert.equal(sheet.statBudget, row.budget);
  assert.equal(statBudgetForLevel(row.level), row.budget);
  assert.deepEqual(sheet.stats, row.stats);
  assert.equal(statSheetTotal(sheet.stats), row.budget);
  assert.equal(sheet.resourceModel, 'infinite_essence', `${id} must have Infinite Essence`);
  assert.equal(sheet.combatStatsMode, 'hand_tuned_preserved');
}

for (const [def, id, hp, attack, defense] of [
  [AZRAEL_DEF,'azrael',18000,420,240],
  [ELEXIS_DEF,'elexis',17200,405,232],
  [LAILANI_DEF,'lailani',14800,365,205],
  [MYTHICAL_DEMON_DEF,'mythicalDemon',14200,388,198]
]) {
  assert.equal(def.internalLevel, expected[id].level);
  assert.deepEqual(def.primaryStats, expected[id].stats);
  assert.equal(def.statBudget, expected[id].budget);
  assert.equal(def.resourceModel, 'infinite_essence');
  assert.equal(def.maxHp, hp); assert.equal(def.attack, attack); assert.equal(def.defense, defense);
}

for (const row of Object.values(expected)) assert.ok(Number.isFinite(row.stats.spr), 'SPR must remain finite');
const ui = fs.readFileSync(new URL('../dist/js/ui.js', import.meta.url), 'utf8');
assert.match(ui, /∞ Essence/, 'Azrael Freeplay HUD should visibly communicate Infinite Essence');

console.log('Mythic level recalibration smoke passed: exact 175/150/150/135/160 levels, legal role-weighted sheets, Infinite Essence, and frozen combat tuning.');
