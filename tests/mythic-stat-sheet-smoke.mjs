import assert from 'node:assert/strict';
import fs from 'node:fs';

globalThis.location = { search: '' };

const { GAME_VERSION, SAVE_VERSION, SAVE_KEY } = await import('../dist/js/config.js');
const {
  BASE_PRIMARY_STATS, BASE_PRIMARY_STAT_TOTAL, STAT_POINTS_PER_LEVEL,
  MORTAL_LEVEL_CAP, SUPERNATURAL_LEVEL_CAP, statBudgetForLevel,
  statSheetTotal, isValidStatSheet
} = await import('../dist/js/data/statProgression.js');
const { CANONICAL_POWER_STAT_SHEETS } = await import('../dist/js/data/mythicStatSheets.js');
const { MYTHIC_LEVEL_HIERARCHY } = await import('../dist/js/data/powerTiers.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { LAILANI_DEF } = await import('../dist/js/data/lailani.js');
const { ELEXIS_DEF } = await import('../dist/js/data/elexis.js');
const { MYTHICAL_DEMON_DEF } = await import('../dist/js/data/mythicalDemon.js');
const { ZERAKOTH_DEF } = await import('../dist/js/data/zerakoth.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');

assert.equal(GAME_VERSION, '0.1.4.4.5.4.4.1');
assert.equal(SAVE_VERSION, 2);
assert.equal(SAVE_KEY, 'hellrpg.ashfall.save.v1');
assert.deepEqual(BASE_PRIMARY_STATS, { str: 5, dex: 5, vit: 5, spr: 5 });
assert.equal(BASE_PRIMARY_STAT_TOTAL, 20);
assert.equal(STAT_POINTS_PER_LEVEL, 5);
assert.equal(MORTAL_LEVEL_CAP, 100);
assert.equal(SUPERNATURAL_LEVEL_CAP, 250);
assert.equal(MYTHIC_LEVEL_HIERARCHY.playerHardCap, 100);
assert.equal(MYTHIC_LEVEL_HIERARCHY.mortalHardCap, 100);
assert.equal(MYTHIC_LEVEL_HIERARCHY.supernaturalHardCap, 250);

for (const [level, budget] of [[1,20],[30,165],[60,315],[100,515],[135,690],[150,765],[160,815],[175,890],[250,1265]]) {
  assert.equal(statBudgetForLevel(level), budget, `Level ${level} primary-stat budget mismatch`);
}

for (const [id, sheet] of Object.entries(CANONICAL_POWER_STAT_SHEETS)) {
  assert.equal(sheet.statBudget, statBudgetForLevel(sheet.level), `${id} stored budget must follow the common formula`);
  assert.equal(statSheetTotal(sheet.stats), sheet.statBudget, `${id} sheet must spend exactly its level budget`);
  assert.equal(isValidStatSheet(sheet.level, sheet.stats), true, `${id} must have a valid canonical STR/DEX/VIT/SPR sheet`);
  assert.equal(sheet.combatStatsMode, 'hand_tuned_preserved');
}

const live = [
  ['demonKnight', ENEMY_DEFS.enemy_infernal_dreadknight, { level: 30, hp: 1450, attack: 72, defense: 38 }],
  ['zerakoth', ZERAKOTH_DEF, { level: 60, hp: 6100, attack: 188, defense: 102 }],
  ['mythicalDemon', MYTHICAL_DEMON_DEF, { level: 135, hp: 14200, attack: 388, defense: 198 }],
  ['lailani', LAILANI_DEF, { level: 150, hp: 14800, attack: 365, defense: 205 }],
  ['azrael', AZRAEL_DEF, { level: 175, hp: 18000, attack: 420, defense: 240 }],
  ['elexis', ELEXIS_DEF, { level: 150, hp: 17200, attack: 405, defense: 232 }]
];

for (const [id, def, preserved] of live) {
  const sheet = CANONICAL_POWER_STAT_SHEETS[id];
  const level = def.internalLevel ?? def.level;
  assert.equal(level, preserved.level, `${id} canonical level must match the recalibrated supernatural scale`);
  assert.deepEqual(def.primaryStats, sheet.stats, `${id} definition must expose its canonical primary sheet`);
  assert.equal(def.statBudget, sheet.statBudget, `${id} definition must expose its canonical budget`);
  assert.equal(def.combatStatsMode, 'hand_tuned_preserved');
  if (['mythicalDemon','lailani','azrael','elexis'].includes(id)) assert.equal(def.resourceModel, 'infinite_essence', `${id} must use Infinite Essence`);
  assert.equal(def.maxHp, preserved.hp, `${id} HP must remain physically-tested tuning`);
  assert.equal(def.attack, preserved.attack, `${id} attack must remain physically-tested tuning`);
  assert.equal(def.defense, preserved.defense, `${id} defense must remain physically-tested tuning`);
}

assert.equal(CANONICAL_POWER_STAT_SHEETS.ancientDemonLord.level, 160);
assert.equal(CANONICAL_POWER_STAT_SHEETS.ancientDemonLord.statBudget, 815);
assert.equal(CANONICAL_POWER_STAT_SHEETS.ancientDemonLord.resourceModel, 'infinite_essence');
assert.equal(MYTHIC_LEVEL_HIERARCHY.ancientDemonLord.reserved, true);

// The ordinary player progression formula is intentionally unchanged in this
// foundation release; only shared metadata/rules are added for future use.
const statsSource = fs.readFileSync(new URL('../dist/js/systems/StatsSystem.js', import.meta.url), 'utf8');
assert.match(statsSource, /unspentStatPoints \+= 5/);
assert.match(statsSource, /state\.player\.level >= 10/);

console.log('Mythic stat-sheet smoke passed: recalibrated 135/150/160/175 supernatural levels, valid budgets, Infinite Essence metadata, and preserved combat tuning.');
