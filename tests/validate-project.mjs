import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.location = { search: '' };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const { ASSET_DEFS } = await import('../dist/js/data/assets.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { NPC_DEFS } = await import('../dist/js/data/npcs.js');
const { QUEST_DEFS } = await import('../dist/js/data/quests.js');
const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { SaveManager } = await import('../dist/js/core/SaveManager.js');

const missing = [];
for (const asset of ASSET_DEFS) {
  try { await access(path.join(dist, asset.path)); } catch { missing.push(asset.path); }
}
assert.deepEqual(missing, [], `Missing runtime assets: ${missing.join(', ')}`);
assert.ok((await stat(path.join(dist, 'vendor/phaser.min.js'))).size > 900_000, 'Vendored Phaser runtime is unexpectedly small');

const html = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const required of ['vendor/phaser.min.js', 'js/main.js', 'css/game.css', 'viewport-fit=cover']) assert.ok(html.includes(required), `index.html missing ${required}`);
assert.ok(!html.includes('90_user_generated'), 'Prototype-only generator assets must not ship');

const ids = groups => Object.values(groups).map(value => value.id);
for (const registry of [ITEM_DEFS, ENEMY_DEFS, NPC_DEFS, QUEST_DEFS]) assert.equal(new Set(ids(registry)).size, ids(registry).length, 'Stable content IDs must be unique');
for (const enemy of Object.values(ENEMY_DEFS)) for (const drop of enemy.loot) assert.ok(ITEM_DEFS[drop.itemId], `Enemy loot references unknown item ${drop.itemId}`);
for (const quest of Object.values(QUEST_DEFS)) assert.ok(NPC_DEFS[quest.giver], `Quest references unknown giver ${quest.giver}`);

const saveManager = new SaveManager();
const valid = saveManager.validate(createDefaultState());
assert.equal(valid.saveVersion, 1);
assert.equal(valid.player.level, 1);
assert.throws(() => saveManager.validate({ saveVersion: 1 }), /player state/i);
const unknownItem = createDefaultState();
unknownItem.inventory.push({ instanceId: 'bad', itemId: 'missing_item', rarity: 'normal', modifiers: {} });
assert.ok(!saveManager.validate(unknownItem).inventory.some(item => item.instanceId === 'bad'), 'Unknown content must be removed safely');

console.log(`Validated ${ASSET_DEFS.length} assets, ${Object.keys(ITEM_DEFS).length} items, ${Object.keys(ENEMY_DEFS).length} enemies, ${Object.keys(NPC_DEFS).length} NPCs, ${Object.keys(QUEST_DEFS).length} quests, and save schema 1.`);

