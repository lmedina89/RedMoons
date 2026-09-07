import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

globalThis.location = { search: '' };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const { GAME_VERSION } = await import('../dist/js/config.js');
const { ANIMATION_GEOMETRIES, ASSET_DEFS, LAYER_ASSETS } = await import('../dist/js/data/assets.js');
const { WEAPON_COMBAT_PROFILES } = await import('../dist/js/data/combat.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { ITEM_DEFS } = await import('../dist/js/data/items.js');
const { NPC_DEFS } = await import('../dist/js/data/npcs.js');
const { QUEST_DEFS } = await import('../dist/js/data/quests.js');
const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { SaveManager } = await import('../dist/js/core/SaveManager.js');
const { InventorySystem } = await import('../dist/js/systems/InventorySystem.js');
const { equipmentBonuses, previewDerivedStats, statBreakdown } = await import('../dist/js/systems/StatsSystem.js');

const missing = [];
for (const asset of ASSET_DEFS) {
  try { await access(path.join(dist, asset.path)); } catch { missing.push(asset.path); }
}
assert.deepEqual(missing, [], `Missing runtime assets: ${missing.join(', ')}`);
assert.ok((await stat(path.join(dist, 'vendor/phaser.min.js'))).size > 900_000, 'Vendored Phaser runtime is unexpectedly small');

const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const uiSource = await readFile(path.join(dist, 'js/ui.js'), 'utf8');
const worldSource = await readFile(path.join(dist, 'js/scenes/WorldScene.js'), 'utf8');
const actionInputSource = await readFile(path.join(dist, 'js/systems/ActionInput.js'), 'utf8');
const combatSource = await readFile(path.join(dist, 'js/systems/CombatSystem.js'), 'utf8');
const layeredSource = await readFile(path.join(dist, 'js/entities/LayeredCharacter.js'), 'utf8');
for (const required of ['vendor/phaser.min.js', 'js/main.js', 'css/game.css', 'viewport-fit=cover']) assert.ok(html.includes(required), `index.html missing ${required}`);
assert.ok(html.includes('data-panel="character"'), 'HUD must expose the Character sheet');
assert.ok(uiSource.includes('Equipment Buffs') && uiSource.includes('Active Effects'), 'Character overview must expose gear buffs and effect status');
assert.ok(uiSource.includes('NPC / legacy only') && uiSource.includes('stack.replaceChildren(element)') && !uiSource.includes('stack.children.length > 3'), 'UI must label incompatible gear and use a singleton toast surface');
assert.ok(uiSource.includes('activeMovePointerId') && uiSource.includes('lostpointercapture') && uiSource.includes('visibilitychange') && uiSource.includes('orientationchange'), 'Touch joystick must clear stale movement across pointer/device lifecycle events');
assert.ok(actionInputSource.includes('setTouchMovement') && actionInputSource.includes('resetTouchMovement') && actionInputSource.includes('>= 0.08'), 'ActionInput must own normalized touch movement and deadzone state');
assert.ok(combatSource.includes('cooldownMs: 1800'), 'Empty-swing combat feedback must be rate-limited');
assert.ok(worldSource.includes('queueKillReward') && worldSource.includes('delayedCall(320'), 'Horde kill rewards must be batched');
assert.ok(layeredSource.includes('ROOT_X') && layeredSource.includes("this.setAsset('hair', null)"), 'Renderer must stabilize revised root motion and suppress incompatible hair');
assert.ok(!html.includes('90_user_generated'), 'Prototype-only generator assets must not ship');
assert.ok(html.includes('v0.1.1.4'), 'Build shell must identify v0.1.1.4');
assert.ok(worldSource.includes('playerLootEligible') && worldSource.includes('actionInput.setTouchMovement'), 'WorldScene must enforce player-loot eligibility and route touch vectors through ActionInput');
assert.ok(worldSource.includes('startFollow(this.player.body, true, 1, 1)'), 'Camera must track the player without delayed catch-up that looks like reverse sliding');
assert.ok(!worldSource.includes('this.physics.add.collider(this.player.body, this.enemyGroup)'), 'Enemies must not physically shove the player through dynamic body separation');
assert.ok(worldSource.includes("command.type === 'dropItem' || command.type === 'destroyItem'"), 'WorldScene must handle inventory drop/destroy commands');
assert.ok(uiSource.includes('touchend') && uiSource.includes('capture: true') && uiSource.includes('Confirm Destroy'), 'Mobile input and discard confirmation must be hardened in the UI');

const ids = groups => Object.values(groups).map(value => value.id);
for (const registry of [ITEM_DEFS, ENEMY_DEFS, NPC_DEFS, QUEST_DEFS]) assert.equal(new Set(ids(registry)).size, ids(registry).length, 'Stable content IDs must be unique');
for (const enemy of Object.values(ENEMY_DEFS)) for (const drop of enemy.loot) {
  const item = ITEM_DEFS[drop.itemId];
  assert.ok(item, `Enemy loot references unknown item ${drop.itemId}`);
  const playerLootEligible = item.questItem || !item.slot || (item.playerEquipReady !== false && !item.npcOnly && !(item.slot === 'weapon' && item.playerCombatReady === false));
  assert.equal(playerLootEligible, true, `Enemy loot must not expose NPC/legacy-only gear: ${drop.itemId}`);
}
assert.ok(ENEMY_DEFS.enemy_cinder_imp.loot.some(drop => drop.itemId === 'quest_ember_heart'), 'Quest loot must remain eligible even when normal legacy gear is blocked');
for (const quest of Object.values(QUEST_DEFS)) assert.ok(NPC_DEFS[quest.giver], `Quest references unknown giver ${quest.giver}`);

for (const def of Object.values(ITEM_DEFS)) {
  if (!def.visual) continue;
  if (def.slot === 'weapon' || def.slot === 'offhand') {
    assert.ok(LAYER_ASSETS[`${def.visual}_fg`] || LAYER_ASSETS[`${def.visual}_bg`], `Item ${def.id} references unknown layered visual ${def.visual}`);
  } else {
    assert.ok(LAYER_ASSETS[def.visual], `Item ${def.id} references unknown visual ${def.visual}`);
  }
}

// Validate animation geometry against the real PNG frame grids. This catches
// row/column drift such as treating the 3-direction DCSS sword as a generic
// four-row Expanded LPC action block.
const assetByKey = new Map(ASSET_DEFS.map(asset => [asset.key, asset]));
const pngSize = async file => {
  const buffer = await readFile(file);
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG', `${file} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};
for (const [layerKey, layer] of Object.entries(LAYER_ASSETS)) {
  const geometry = ANIMATION_GEOMETRIES[layer.geometry];
  assert.ok(geometry, `Layer ${layerKey} references unknown geometry ${layer.geometry}`);
  for (const [action, animation] of Object.entries(geometry)) {
    const textureKey = layer[animation.source];
    assert.ok(textureKey, `Layer ${layerKey} has no ${animation.source} texture for ${action}`);
    const def = assetByKey.get(textureKey);
    assert.ok(def && def.frameWidth && def.frameHeight, `Layer ${layerKey} references unknown spritesheet ${textureKey}`);
    const { width, height } = await pngSize(path.join(dist, def.path));
    const columns = width / def.frameWidth;
    const rows = height / def.frameHeight;
    assert.equal(Number.isInteger(columns) && Number.isInteger(rows), true, `${textureKey} dimensions do not fit declared frame size`);
    assert.equal(animation.stride, columns, `${layerKey}/${action} stride does not match ${textureKey} columns`);
    assert.ok(Array.isArray(animation.sequence) && animation.sequence.length >= 1, `${layerKey}/${action} must declare a non-empty frame sequence`);
    for (const frame of animation.sequence) assert.ok(Number.isInteger(frame) && frame >= 0 && frame < columns, `${layerKey}/${action} frame ${frame} is outside the source row`);
    assert.equal(animation.rows.length, 4, `${layerKey}/${action} must resolve all four Ashfall facings`);
    for (const row of animation.rows) assert.ok(Number.isInteger(row) && row >= 0 && row < rows, `${layerKey}/${action} row ${row} is outside ${textureKey}`);
  }
}
assert.deepEqual(ANIMATION_GEOMETRIES.dcssSword128.walk.rows, [6, 7, 8, 7]);
assert.deepEqual(ANIMATION_GEOMETRIES.dcssSword128.slash.rows, [9, 10, 11, 10]);
assert.deepEqual(ANIMATION_GEOMETRIES.dcssSword128.walk.mirror, [false, false, false, true]);

// Decode the sword alpha channel so a future row-number regression cannot pass
// merely because the requested row is within the PNG bounds. The DCSS source
// intentionally splits pixels across foreground/background sheets.
const rgbaCache = new Map();
const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
async function rgbaPixels(textureKey) {
  if (rgbaCache.has(textureKey)) return rgbaCache.get(textureKey);
  const def = assetByKey.get(textureKey);
  const buffer = await readFile(path.join(dist, def.path));
  let offset = 8, width = 0, height = 0, bitDepth = 0, colorType = 0;
  const chunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset); offset += 4;
    const type = buffer.toString('ascii', offset, offset + 4); offset += 4;
    const data = buffer.subarray(offset, offset + length); offset += length + 4;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') chunks.push(data);
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8, `${textureKey} alpha validation requires 8-bit PNG data`);
  assert.equal(colorType, 6, `${textureKey} alpha validation requires RGBA PNG data`);
  const raw = inflateSync(Buffer.concat(chunks));
  const bytesPerPixel = 4, rowBytes = width * bytesPerPixel;
  const pixels = Buffer.alloc(width * height * bytesPerPixel);
  let source = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[source++];
    const rowStart = y * rowBytes;
    for (let x = 0; x < rowBytes; x += 1) {
      const value = raw[source++];
      const left = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
      const up = y ? pixels[rowStart - rowBytes + x] : 0;
      const upLeft = y && x >= bytesPerPixel ? pixels[rowStart - rowBytes + x - bytesPerPixel] : 0;
      let decoded;
      if (filter === 0) decoded = value;
      else if (filter === 1) decoded = value + left;
      else if (filter === 2) decoded = value + up;
      else if (filter === 3) decoded = value + Math.floor((left + up) / 2);
      else if (filter === 4) decoded = value + paeth(left, up, upLeft);
      else throw new Error(`Unsupported PNG filter ${filter} in ${textureKey}`);
      pixels[rowStart + x] = decoded & 255;
    }
  }
  const result = { width, height, pixels, frameWidth: def.frameWidth, frameHeight: def.frameHeight };
  rgbaCache.set(textureKey, result);
  return result;
}
async function frameHasAlpha(textureKey, row, frame) {
  const image = await rgbaPixels(textureKey);
  const x0 = frame * image.frameWidth, y0 = row * image.frameHeight;
  for (let y = y0; y < y0 + image.frameHeight; y += 1) {
    for (let x = x0; x < x0 + image.frameWidth; x += 1) {
      if (image.pixels[(y * image.width + x) * 4 + 3]) return true;
    }
  }
  return false;
}
for (const action of ['walk', 'slash']) {
  const animation = ANIMATION_GEOMETRIES.dcssSword128[action];
  for (let direction = 0; direction < 4; direction += 1) {
    for (const frame of animation.sequence) {
      const row = animation.rows[direction];
      const background = await frameHasAlpha('long-sword-bg', row, frame);
      const foreground = await frameHasAlpha('long-sword-fg', row, frame);
      assert.ok(background || foreground, `DCSS sword ${action} direction ${direction} frame ${frame} maps to empty source artwork`);
    }
  }
}

// v0.1.1.2 combat coverage: the player-ready body, core revised armor, wings
// and arming sword must contain real pixels for every source frame used by the
// four-hit profile. Limited armor is explicitly allowed to fall back to slash.
assert.deepEqual(WEAPON_COMBAT_PROFILES.sword_four_hit.attacks.map(attack => attack.action), ['slash', 'slash1h', 'backslash1h', 'halfslash1h']);
assert.deepEqual(WEAPON_COMBAT_PROFILES.sword_four_hit.attacks.map(attack => attack.frames), [6, 7, 12, 6]);
assert.ok(WEAPON_COMBAT_PROFILES.sword_four_hit.comboWindowMs >= 500, 'Four-hit combo needs a usable continuation window');

const fullComboLayers = ['body', 'head_iron_revised', 'chest_legion', 'hands_legion', 'wings_red_bat'];
for (const layerKey of fullComboLayers) {
  const layer = LAYER_ASSETS[layerKey];
  const geometry = ANIMATION_GEOMETRIES[layer.geometry];
  for (const action of ['walk', 'slash', 'slash1h', 'backslash1h', 'halfslash1h']) {
    const animation = geometry[action];
    const textureKey = layer[animation.source];
    assert.ok(textureKey, `${layerKey} must supply ${animation.source} for ${action}`);
    for (let direction = 0; direction < 4; direction += 1) {
      const row = animation.rows[direction];
      let populated = 0;
      for (const frame of animation.sequence) populated += Number(await frameHasAlpha(textureKey, row, frame));
      // Modular LPC layers may intentionally be transparent for an isolated
      // pose (e.g. a glove pixel layer when the hand is fully occluded). An
      // entire missing action/direction, however, must fail validation.
      const minimum = layerKey === 'body' ? animation.sequence.length : Math.max(1, animation.sequence.length - 1);
      assert.ok(populated >= minimum, `${layerKey}/${action} direction ${direction} has only ${populated}/${animation.sequence.length} populated source frames`);
    }
  }
}
for (const layerKey of ['shoulders_legion', 'feet_revised']) {
  const layer = LAYER_ASSETS[layerKey];
  assert.equal(layer.attackFallback, 'slash', `${layerKey} must explicitly declare its revised-attack fallback`);
  assert.equal(ANIMATION_GEOMETRIES[layer.geometry].slash1h, undefined, `${layerKey} must not pretend to contain unsupported revised attacks`);
}
const armingLayer = LAYER_ASSETS.weapon_arming_sword_fg;
const armingGeometry = ANIMATION_GEOMETRIES[armingLayer.geometry];
for (const action of ['walk', 'slash', 'slash1h', 'backslash1h', 'halfslash1h']) {
  const animation = armingGeometry[action];
  const textureKey = armingLayer[animation.source];
  for (let direction = 0; direction < 4; direction += 1) {
    const row = animation.rows[direction];
    for (const frame of animation.sequence) assert.ok(await frameHasAlpha(textureKey, row, frame), `Arming sword ${action} direction ${direction} frame ${frame} maps to empty artwork`);
  }
}
const katanaLayer = LAYER_ASSETS.weapon_katana_npc_fg;
assert.ok(katanaLayer, 'Katana must be staged as a concrete NPC visual rather than an unused source export');
const katanaGeometry = ANIMATION_GEOMETRIES[katanaLayer.geometry];
for (const action of ['walk', 'slash']) {
  const animation = katanaGeometry[action];
  const textureKey = katanaLayer[animation.source];
  for (let direction = 0; direction < 4; direction += 1) {
    const row = animation.rows[direction];
    for (const frame of animation.sequence) assert.ok(await frameHasAlpha(textureKey, row, frame), `Katana ${action} direction ${direction} frame ${frame} maps to empty artwork`);
  }
}

const saveManager = new SaveManager();
const valid = saveManager.validate(createDefaultState());
assert.equal(valid.saveVersion, 1);
assert.equal(valid.gameVersion, GAME_VERSION);
assert.equal(valid.player.level, 1);
assert.throws(() => saveManager.validate({ saveVersion: 1 }), /player state/i);
const unknownItem = createDefaultState();
unknownItem.inventory.push({ instanceId: 'bad', itemId: 'missing_item', rarity: 'normal', modifiers: {} });
assert.ok(!saveManager.validate(unknownItem).inventory.some(item => item.instanceId === 'bad'), 'Unknown content must be removed safely');

// Multi-slot equipment remains a real state invariant, but only full-combo
// player-ready visual gear may be equipped.
const gearState = createDefaultState();
gearState.player.level = 5;
gearState.player.stats = { str: 12, dex: 8, vit: 10, spr: 7 };
gearState.inventory.push(
  { instanceId: 'i_head_test', itemId: 'head_iron_revised', rarity: 'magic', enhancement: 0, modifiers: { str: 2 } },
  { instanceId: 'i_chest_test', itemId: 'chest_legion', rarity: 'normal', enhancement: 0, modifiers: {} },
  { instanceId: 'i_hands_test', itemId: 'hands_legion', rarity: 'normal', enhancement: 0, modifiers: {} }
);
const inventory = new InventorySystem(gearState);
assert.equal(inventory.equip('i_head_test').ok, true);
assert.equal(inventory.equip('i_chest_test').ok, true);
assert.equal(inventory.equip('i_hands_test').ok, true);
assert.equal(Object.values(gearState.equipment).filter(Boolean).length, 4);
assert.equal(gearState.equipment.weapon, 'i_000001');
const readyGear = equipmentBonuses(gearState);
assert.equal(readyGear.attack, 5);
assert.equal(readyGear.defense, 14);
assert.equal(readyGear.str, 2);
const breakdown = statBreakdown(gearState);
assert.equal(breakdown.totalPrimary.str, gearState.player.stats.str + 2);
assert.ok(breakdown.gearImpact.attack > equipmentBonuses(gearState).attack);
const preview = previewDerivedStats(gearState, { vit: 1 });
assert.equal(preview.maxHp, breakdown.totalDerived.maxHp + 9);

// Inventory recovery: any normal item can be removed by instance, equipped
// instances are safely unequipped, and quest-critical items are protected.
const discardState = createDefaultState();
const discardInventory = new InventorySystem(discardState);
const weaponDiscard = discardInventory.removeInstance('i_000001');
assert.equal(weaponDiscard.ok, true);
assert.equal(weaponDiscard.item.itemId, 'weapon_arming_sword');
assert.equal(discardState.equipment.weapon, null);
assert.ok(!discardState.inventory.some(item => item.instanceId === 'i_000001'));
discardState.inventory.push({ instanceId: 'i_quest_test', itemId: 'quest_ember_heart', rarity: 'normal', enhancement: 0, modifiers: {} });
const questDiscard = discardInventory.removeInstance('i_quest_test');
assert.equal(questDiscard.ok, false);
assert.ok(discardState.inventory.some(item => item.instanceId === 'i_quest_test'));

// New slots are part of the save model even before their progression unlocks.
assert.deepEqual(Object.keys(createDefaultState().equipment), ['head', 'shoulders', 'chest', 'legs', 'hands', 'feet', 'weapon', 'offhand', 'necklace', 'ring1', 'ring2', 'wings']);
assert.equal(createDefaultState().worldFlags.wingsUnlocked, false);

// Limited-animation weapons remain valid content for old saves / future humanoid
// loadouts, but cannot be newly equipped by the player.
const limitedWeaponState = createDefaultState();
limitedWeaponState.inventory.push(
  { instanceId: 'i_rust_test', itemId: 'weapon_rustblade', rarity: 'normal', enhancement: 0, modifiers: {} },
  { instanceId: 'i_katana_test', itemId: 'weapon_katana_npc', rarity: 'normal', enhancement: 0, modifiers: {} }
);
const limitedInventory = new InventorySystem(limitedWeaponState);
assert.equal(limitedInventory.equip('i_rust_test').ok, false);
assert.equal(limitedInventory.equip('i_katana_test').ok, false);
limitedWeaponState.inventory.push({ instanceId: 'i_old_boots', itemId: 'feet_revised', rarity: 'normal', enhancement: 0, modifiers: {} });
assert.equal(limitedInventory.equip('i_old_boots').ok, false);
assert.equal(ITEM_DEFS.weapon_katana_npc.visual, 'weapon_katana_npc');
assert.equal(limitedWeaponState.equipment.weapon, 'i_000001', 'Rejected NPC weapons must not disturb the equipped player weapon');

// Wings exist now but are deliberately progression-gated. Unlocking the flag
// makes the same item equippable and its buffs feed normal derived-stat math.
const wingState = createDefaultState();
wingState.player.level = 5;
wingState.player.stats = { str: 12, dex: 10, vit: 10, spr: 7 };
wingState.inventory.push({ instanceId: 'i_wings_test', itemId: 'wings_red_bat', rarity: 'normal', enhancement: 0, modifiers: {} });
const wingInventory = new InventorySystem(wingState);
assert.equal(wingInventory.equip('i_wings_test').ok, false, 'Wings must remain locked before advanced progression unlocks them');
wingState.worldFlags.wingsUnlocked = true;
assert.equal(wingInventory.equip('i_wings_test').ok, true);
assert.equal(wingState.equipment.wings, 'i_wings_test');
const wingGear = equipmentBonuses(wingState);
assert.equal(wingGear.defense, 3, 'Wings defense should aggregate without legacy starter armor');
assert.equal(wingGear.maxHp, 25, 'Wing Max HP buff must aggregate');
assert.equal(wingGear.moveSpeed, 6, 'Wing movement bonus must aggregate');
assert.equal(statBreakdown(wingState).totalDerived.moveSpeed, 160, 'Wing movement bonus must participate in final movement speed');

// A v0.1.0/v0.1.1-style old save remains loadable, but its equipped starter
// Rustblade migrates in-place to the new four-hit player weapon. Unequipped
// Rustblades stay untouched for future humanoid loadouts.
const oldWeaponSave = createDefaultState();
oldWeaponSave.inventory[0].itemId = 'weapon_rustblade';
oldWeaponSave.inventory.push({ instanceId: 'i_old_spare', itemId: 'weapon_rustblade', rarity: 'magic', enhancement: 0, modifiers: { attack: 1 } });
const normalizedOldWeapon = saveManager.validate(oldWeaponSave);
assert.equal(normalizedOldWeapon.inventory[0].itemId, 'weapon_arming_sword');
assert.equal(normalizedOldWeapon.equipment.weapon, 'i_000001');
assert.equal(normalizedOldWeapon.inventory.find(item => item.instanceId === 'i_old_spare').itemId, 'weapon_rustblade');
const oldArmorSave = createDefaultState();
oldArmorSave.equipment.chest = 'i_000002';
oldArmorSave.equipment.legs = 'i_000003';
oldArmorSave.equipment.hands = 'i_000004';
oldArmorSave.equipment.feet = 'i_000005';
const normalizedOldArmor = saveManager.validate(oldArmorSave);
for (const slot of ['chest', 'legs', 'hands', 'feet']) assert.equal(normalizedOldArmor.equipment[slot], null);
assert.ok(normalizedOldArmor.inventory.some(item => item.instanceId === 'i_000002'));

const wrongSlotSave = createDefaultState();
wrongSlotSave.equipment.head = 'i_000001'; // Arming Sword cannot occupy Head.
const normalizedWrongSlot = saveManager.validate(wrongSlotSave);
assert.equal(normalizedWrongSlot.equipment.head, null, 'Wrong-slot saved equipment must be discarded');
assert.equal(normalizedWrongSlot.equipment.weapon, 'i_000001', 'Valid weapon reference must survive normalization');

console.log(`Validated ${ASSET_DEFS.length} assets, ${Object.keys(ITEM_DEFS).length} items, ${Object.keys(ENEMY_DEFS).length} enemies, ${Object.keys(NPC_DEFS).length} NPCs, ${Object.keys(QUEST_DEFS).length} quests, four-hit combat geometry, strict player/NPC animation compatibility, hardened touch movement, no enemy body shove, singleton/rate-limited toasts, player-safe loot tables, drop/destroy inventory recovery, root stabilization, batched horde rewards, 12-slot equipment, wing gating, stat aggregation, and save schema 1.`);
