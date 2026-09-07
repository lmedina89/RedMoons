import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
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
const { EQUIPMENT_SET_DEFS, ITEM_DEFS } = await import('../dist/js/data/items.js');
const { NPC_DEFS, NPC_GUILD_SEEDS } = await import('../dist/js/data/npcs.js');
const { BUILDING_DEFS, COLLIDERS, DEFAULT_MAP_ID, HOLLOW_COLLIDERS, HOLLOW_WALLS, MAP_DEFS, MAP_TRANSITIONS, REFUGE_WALLS, SPAWN_REGIONS, ZONES } = await import('../dist/js/data/world.js');
const { QUEST_DEFS } = await import('../dist/js/data/quests.js');
const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { SaveManager } = await import('../dist/js/core/SaveManager.js');
const { InventorySystem } = await import('../dist/js/systems/InventorySystem.js');
const { equipmentBonuses, previewDerivedStats, statBreakdown } = await import('../dist/js/systems/StatsSystem.js');
const { assetDefsForItem, assetDefsForMap } = await import('../dist/js/systems/AssetResolver.js');

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
const playerSource = await readFile(path.join(dist, 'js/entities/Player.js'), 'utf8');
const enemySource = await readFile(path.join(dist, 'js/entities/Enemy.js'), 'utf8');
const mainSource = await readFile(path.join(dist, 'js/main.js'), 'utf8');
const saveSource = await readFile(path.join(dist, 'js/core/SaveManager.js'), 'utf8');
const cssSource = await readFile(path.join(dist, 'css/game.css'), 'utf8');
const assetResolverSource = await readFile(path.join(dist, 'js/systems/AssetResolver.js'), 'utf8');
for (const required of ['vendor/phaser.min.js', 'js/main.js', 'css/game.css', 'viewport-fit=cover']) assert.ok(html.includes(required), `index.html missing ${required}`);
assert.ok(html.includes('data-panel="character"'), 'HUD must expose the Character sheet');
assert.ok(uiSource.includes('Equipment Buffs') && uiSource.includes('Active Effects'), 'Character overview must expose gear buffs and effect status');
assert.ok(uiSource.includes('NPC / legacy only') && uiSource.includes('stack.replaceChildren(element)') && uiSource.includes("stack.classList.toggle('routine'") && !uiSource.includes('stack.children.length > 3'), 'UI must label incompatible gear and use a singleton, routine-aware toast surface');
assert.ok(uiSource.includes('activeMovePointerId') && uiSource.includes('lostpointercapture') && uiSource.includes('visibilitychange') && uiSource.includes('orientationchange'), 'Touch joystick must clear stale movement across pointer/device lifecycle events');
assert.ok(actionInputSource.includes('setTouchMovement') && actionInputSource.includes('resetTouchMovement') && actionInputSource.includes('>= 0.08'), 'ActionInput must own normalized touch movement and deadzone state');
assert.ok(combatSource.includes('cooldownMs: 2400'), 'Empty-swing combat feedback must be strongly rate-limited');
assert.ok(worldSource.includes('queueKillReward') && worldSource.includes('delayedCall(320'), 'Horde kill rewards must be batched');
assert.ok(layeredSource.includes('ROOT_X') && layeredSource.includes('baseAsset') && layeredSource.includes("equipmentPolicy === 'player'"), 'Renderer must stabilize revised root motion and support actor-specific bases/equipment policies');
assert.ok(!html.includes('90_user_generated'), 'Prototype-only generator assets must not ship');
assert.ok(html.includes('v0.1.2.4.2'), 'Build shell must identify v0.1.2.4.2');
assert.ok(html.includes('id="start-screen"') && html.includes('id="continue-game"') && html.includes('id="new-game"') && html.includes('id="load-game"'), 'Start menu must expose Continue, New Game and Load Save');
assert.ok(html.includes('id="map-loading-overlay"') && uiSource.includes("gameEvents.on('map-loading'"), 'Map transitions must expose a visible loading state');
assert.ok(mainSource.includes('loadExisting()') && mainSource.includes('saveManager.reset()') && mainSource.includes('confirm-new-game'), 'Main boot flow must preserve Continue/Load and require explicit overwrite confirmation for an existing single-slot save');
assert.ok(saveSource.includes('loadExisting()') && saveSource.includes('summary(state)'), 'Save manager must expose non-destructive slot inspection for the title menu');
assert.ok(cssSource.includes('overflow-x: auto') && cssSource.includes('left: calc(var(--safe-left)') && cssSource.includes('flex: 0 0 auto'), 'Debug tray must stay inside safe-area bounds and scroll horizontally on iPhone');
assert.ok(worldSource.includes('transitionToMap') && worldSource.includes('buildAshfallHollow'), 'WorldScene must support separate map transitions');
assert.ok(!worldSource.includes('releaseAssetsNotNeededForMap('), 'v0.1.2.4.2 must not eagerly evict textures during the WebKit-sensitive Scene handoff');
assert.ok(!assetResolverSource.includes('releaseAssetsNotNeededForMap'), 'Unsafe eager texture-eviction helper must not remain exposed in the hotfix resolver API');
assert.ok(worldSource.includes('recoverPlayerVisual') && worldSource.includes('this.player.restoreVisual()'), 'WorldScene must explicitly reconstruct and verify the layered player after map handoff');
assert.ok(playerSource.includes('restoreVisual()') && layeredSource.includes('missingTextureKeys') && layeredSource.includes('restore('), 'Player renderer must expose deterministic visual restoration/integrity checks');
assert.ok(layeredSource.includes('def.playerVisual || def.visual'), 'Player renderer must support player-only revised visual overrides without changing NPC art');
assert.ok(assetResolverSource.includes("policy === 'player' ? (item.playerVisual || item.visual)"), 'Asset resolver must load playerVisual for player equipment while keeping NPC mappings separate');
assert.ok(assetResolverSource.includes('prepareMapAssets') && worldSource.includes('await prepareMapAssets'), 'Destination map textures must be prepared explicitly before Scene restart');
const prepareIndex = worldSource.indexOf('await prepareMapAssets');
const commitIndex = worldSource.indexOf('this.state.player.mapId = destination.id', prepareIndex);
const restartIndex = worldSource.indexOf('this.scene.restart()', prepareIndex);
assert.ok(prepareIndex >= 0 && commitIndex > prepareIndex && restartIndex > commitIndex, 'Transition order must prepare destination assets before committing state and restarting');
assert.ok(worldSource.includes('textures already been loaded') || worldSource.includes('retains textures'), 'Transition hotfix must document session-retained texture caching');
assert.ok(worldSource.includes('if (this.transitioning)'), 'WorldScene must freeze source-map updates during map fade so destination coordinates are not overwritten');
assert.ok(worldSource.includes("this.textures.exists('solid')"), 'Generated helper textures must be reused safely across scene restarts');
assert.ok(actionInputSource.includes('unbind()'), 'ActionInput must expose restart-safe keyboard handler cleanup');
assert.ok(worldSource.includes('actionInput.unbind()'), 'WorldScene shutdown must detach ActionInput keyboard handlers');
assert.ok(assetResolverSource.includes('assetDefsForMap') && assetResolverSource.includes('ensureItemVisualAssets'), 'Asset loading must be map-scoped with lazy equipment support');
assert.ok(worldSource.includes('playerLootEligible') && worldSource.includes('actionInput.setTouchMovement'), 'WorldScene must enforce player-loot eligibility and route touch vectors through ActionInput');
assert.ok(worldSource.includes('startFollow(this.player.body, true, 1, 1)'), 'Camera must track the player without delayed catch-up that looks like reverse sliding');
assert.ok(!worldSource.includes('this.physics.add.collider(this.player.body, this.enemyGroup)'), 'Enemies must not physically shove the player through dynamic body separation');
assert.ok(playerSource.includes("physics.add.sprite(state.player.x, state.player.y, 'solid').setVisible(false)") && playerSource.includes('setSize(16, 14, false).setOffset(-7, 2)') && !playerSource.includes("'solid').setAlpha(0.001).setDisplaySize"), 'Player physics proxy must stay unscaled with a compact foot-area body');
assert.ok(enemySource.includes("physics.add.sprite(0, 0, 'solid').setVisible(false)") && enemySource.includes('setSize(18, 16, false).setOffset(-8, 2)') && enemySource.includes('setVisible(!this.layered)') && !enemySource.includes("'solid').setAlpha(0.001).setDisplaySize(25, 30)"), 'Layered enemy physics proxies must stay compact, unscaled, and visually hidden across respawns');
assert.ok(mainSource.includes('debug: false') && worldSource.includes('drawDynamicCollisionDebug') && worldSource.includes('0x38d7ff') && worldSource.includes('0xff4bd8'), 'Debug mode must use targeted collision overlays instead of Phaser global body clutter');
assert.ok(worldSource.includes("command.type === 'dropItem' || command.type === 'destroyItem'"), 'WorldScene must handle inventory drop/destroy commands');
assert.ok(uiSource.includes('touchend') && uiSource.includes('capture: true') && uiSource.includes('Confirm Destroy'), 'Mobile input and discard confirmation must be hardened in the UI');
assert.ok(worldSource.includes("action === 'gear115'") && html.includes('Add Gear Test Set'), 'Debug build must expose the player-gear regression helper');
assert.ok(worldSource.includes("action === 'magichelm'") && worldSource.includes("createItem('head_bronze_revised', 'magic')") && html.includes('Add Magic Bronze Helm') && !html.includes('Add Noble Helm'), 'Debug helmet helper must grant player-compatible Magic Bronze War Helm');

const ids = groups => Object.values(groups).map(value => value.id);
for (const registry of [ITEM_DEFS, ENEMY_DEFS, NPC_DEFS, QUEST_DEFS]) assert.equal(new Set(ids(registry)).size, ids(registry).length, 'Stable content IDs must be unique');
assert.ok(BUILDING_DEFS.length >= 5, 'Cinder Refuge must contain a real multi-building settlement layout');
assert.equal(REFUGE_WALLS.length, 5, 'Refuge perimeter must be defined by visible wall segments with one broad east opening');
assert.ok(REFUGE_WALLS.some(wall => wall.id === 'refuge-east-north') && REFUGE_WALLS.some(wall => wall.id === 'refuge-east-south'), 'Refuge east wall must be split around a visible exit');
const eastNorth = REFUGE_WALLS.find(wall => wall.id === 'refuge-east-north');
const eastSouth = REFUGE_WALLS.find(wall => wall.id === 'refuge-east-south');
assert.ok(eastSouth.y1 - eastNorth.y2 >= 400, 'Refuge east exit must remain broadly touch-traversable');
assert.ok(COLLIDERS.every(collider => ['visible-wall', 'building'].includes(collider.source)), 'Every static collider must correspond to visible wall/building geometry');
assert.equal(COLLIDERS.length, REFUGE_WALLS.length + BUILDING_DEFS.length, 'Asset-variety pass must not introduce any extra static colliders');
assert.ok(!COLLIDERS.some(collider => ['north-cliff', 'south-cliff', 'west-wall', 'east-fog', 'road-bones'].includes(collider.id)), 'Unrepresented/redundant invisible world blockers must not return');
assert.ok(worldSource.includes('for (const wall of REFUGE_WALLS) worldArt.lineBetween') && worldSource.includes('collisionDebug.strokeRect'), 'Visible refuge wall art and debug collider audit must share collision data');
assert.ok(ZONES.every(zone => Array.isArray(zone.levelRange) && typeof zone.safe === 'boolean' && Array.isArray(zone.eventTags)), 'Zones must expose future-proof level/safety/event metadata');
assert.equal(Object.keys(MAP_DEFS).length, 2, 'World streaming foundation must ship the original region plus one proof secondary map');
assert.equal(MAP_DEFS[DEFAULT_MAP_ID].width, 2560, 'Cinder Region dimensions must remain unchanged');
assert.equal(MAP_DEFS[DEFAULT_MAP_ID].height, 1280, 'Cinder Region dimensions must remain unchanged');
assert.equal(MAP_DEFS.map_ashfall_hollow.width, 1024, 'Ashfall Hollow must use its own smaller map bounds');
assert.equal(HOLLOW_COLLIDERS.length, HOLLOW_WALLS.length, 'Hollow collision must come only from its visible wall records');
assert.ok(MAP_TRANSITIONS.some(t => t.mapId === DEFAULT_MAP_ID && t.destinationMapId === 'map_ashfall_hollow'), 'Cinder Region must expose an enterable Hollow transition');
assert.ok(MAP_TRANSITIONS.some(t => t.mapId === 'map_ashfall_hollow' && t.destinationMapId === DEFAULT_MAP_ID), 'Ashfall Hollow must provide a return transition');
assert.ok(Object.keys(ENEMY_DEFS).length >= 16, 'Asset variety expansion should ship a broad early enemy roster');
assert.ok(Object.values(ENEMY_DEFS).filter(enemy => enemy.layered).length >= 4, 'Skeleton family should use layered equipment-bearing actors');
for (const id of ['enemy_cinder_imp', 'enemy_blight_imp', 'enemy_blueflame_imp']) {
  assert.ok(Array.isArray(ENEMY_DEFS[id].visualPool) && ENEMY_DEFS[id].visualPool.length >= 3, `${id} must expose weighted visual/loadout variety`);
}
for (const id of ['enemy_ash_goblin', 'enemy_cave_spider', 'enemy_ember_spider', 'enemy_frost_spider', 'enemy_mire_spider', 'enemy_ashstone_golem']) assert.ok(ENEMY_DEFS[id], `Missing enemy ${id}`);
assert.deepEqual(ENEMY_DEFS.enemy_ash_goblin.directionRows, [2, 3, 0, 1], 'Goblin source rows must be remapped so chase movement faces toward the player');
assert.equal(ENEMY_DEFS.enemy_ashstone_golem.deathTexture, 'golem-death', 'Ashstone Golem must use its supplied death sheet');
assert.equal(ENEMY_DEFS.enemy_ashstone_golem.deathFrames, 7, 'Ashstone Golem death sequence must expose all seven frames');
assert.ok(NPC_DEFS.npc_bone_hunter && NPC_DEFS.npc_road_seeker, 'Asset variety pass must add additional persistent adventurer NPC seeds');
assert.ok(NPC_GUILD_SEEDS.guild_emberbound?.name === 'Emberbound', 'Emberbound must exist as a future NPC-guild seed');
for (const enemy of Object.values(ENEMY_DEFS)) {
  for (const itemId of Object.values(enemy.fixedLoadout || {})) assert.ok(ITEM_DEFS[itemId], `${enemy.id} fixed loadout references unknown item ${itemId}`);
  for (const entries of Object.values(enemy.equipmentPool || {})) for (const entry of entries) if (entry.itemId) assert.ok(ITEM_DEFS[entry.itemId], `${enemy.id} equipment pool references unknown item ${entry.itemId}`);
}
for (const npc of Object.values(NPC_DEFS)) {
  assert.ok(typeof npc.npcType === 'string' && typeof npc.activityState === 'string' && Object.prototype.hasOwnProperty.call(npc, 'guildId'), `${npc.id} must expose persistent-adventurer/guild-ready metadata`);
  for (const itemId of Object.values(npc.loadout || {})) assert.ok(ITEM_DEFS[itemId], `${npc.id} loadout references unknown item ${itemId}`);
}
assert.ok(NPC_DEFS.npc_wanderer.recruitable && NPC_DEFS.npc_wanderer.baseVisual === 'npc_olive_base', 'Sable should seed the future recruitable adventurer system with the new humanoid base');
assert.equal(LAYER_ASSETS.player_red_base.geometry, 'revised64', 'Red-haired protagonist must be the active full-combat base asset');
assert.ok(Object.keys(EQUIPMENT_SET_DEFS).length >= 3 && EQUIPMENT_SET_DEFS.set_legion_remnant?.name, 'Named equipment-set metadata must exist without activating bonuses yet');
assert.ok(SPAWN_REGIONS.some(spawn => spawn.enemyId === 'enemy_carrion_beast') && SPAWN_REGIONS.some(spawn => spawn.enemyId === 'enemy_bloodbone'), 'New enemy families must actually be spawned in the world');
for (const id of ['enemy_blight_imp', 'enemy_blueflame_imp', 'enemy_ash_goblin', 'enemy_cave_spider', 'enemy_ember_spider', 'enemy_frost_spider', 'enemy_ashstone_golem']) assert.ok(SPAWN_REGIONS.some(spawn => spawn.enemyId === id), `${id} must appear in a real spawn region`);
for (const mapId of Object.keys(MAP_DEFS)) {
  const population = SPAWN_REGIONS.filter(spawn => (spawn.mapId || DEFAULT_MAP_ID) === mapId).reduce((sum, spawn) => sum + spawn.count, 0);
  assert.ok(population <= 35, `${mapId} population must remain mobile-conscious`);
}
assert.ok(SPAWN_REGIONS.some(spawn => spawn.mapId === 'map_ashfall_hollow' && spawn.enemyId === 'enemy_mire_spider'), 'Previously staged Mire Spider must now inhabit the separate cave map');
for (const enemy of Object.values(ENEMY_DEFS)) for (const drop of enemy.loot) {
  const item = ITEM_DEFS[drop.itemId];
  assert.ok(item, `Enemy loot references unknown item ${drop.itemId}`);
  const playerLootEligible = item.questItem || !item.slot || (item.playerEquipReady !== false && !item.npcOnly && !(item.slot === 'weapon' && item.playerCombatReady === false));
  assert.equal(playerLootEligible, true, `Enemy loot must not expose NPC/legacy-only gear: ${drop.itemId}`);
}
assert.ok(ENEMY_DEFS.enemy_cinder_imp.loot.some(drop => drop.itemId === 'quest_ember_heart'), 'Quest loot must remain eligible even when normal legacy gear is blocked');
for (const itemId of ['feet_leather_revised', 'shoulders_leather_revised', 'weapon_brass_arming_sword', 'weapon_copper_arming_sword', 'weapon_bronze_arming_sword', 'weapon_iron_arming_sword', 'weapon_steel_arming_sword', 'weapon_ceramic_arming_sword', 'weapon_gold_arming_sword', 'head_bronze_revised', 'chest_silver_legion', 'chest_steel_plate']) assert.ok(Object.values(ENEMY_DEFS).some(enemy => enemy.loot.some(drop => drop.itemId === itemId)), `New player gear must be reachable from a loot table: ${itemId}`);
for (const itemId of ['weapon_brass_arming_sword', 'weapon_iron_arming_sword', 'head_bronze_revised', 'shoulders_leather_revised', 'chest_silver_legion', 'chest_steel_plate', 'feet_leather_revised']) {
  const item = ITEM_DEFS[itemId];
  assert.equal(item.playerEquipReady, true, `${itemId} must be player-ready`);
  assert.equal(item.animationClass, 'full_combo', `${itemId} must declare full combo coverage`);
  assert.equal(item.presentation?.worldGlow, 'rarity', `${itemId} must carry future rarity glow metadata`);
}
for (const quest of Object.values(QUEST_DEFS)) {
  assert.ok(NPC_DEFS[quest.giver], `Quest references unknown giver ${quest.giver}`);
  const rewardId = quest.rewards?.item?.itemId;
  if (rewardId) {
    const reward = ITEM_DEFS[rewardId];
    assert.ok(reward, `Quest ${quest.id} rewards unknown item ${rewardId}`);
    if (reward.slot) assert.ok(reward.playerEquipReady !== false && !reward.npcOnly && !(reward.slot === 'weapon' && reward.playerCombatReady === false), `Quest ${quest.id} must not reward NPC/legacy-only player gear: ${rewardId}`);
  }
}
assert.equal(QUEST_DEFS.quest_ember_heart.rewards.item.itemId, 'feet_leather_revised', 'Ember Heart quest should reward compatible Ashrunner boots');
assert.equal(QUEST_DEFS.quest_bone_captain.rewards.item.itemId, 'head_iron_revised', 'Bone Captain quest should reward compatible Iron War Helm');

const defaultState = createDefaultState();
assert.equal(defaultState.player.mapId, DEFAULT_MAP_ID);
assert.equal(defaultState.player.entryPointId, 'cinder_start');
assert.deepEqual(
  ['chest', 'legs', 'hands', 'feet'].map(slot => defaultState.inventory.find(item => item.instanceId === defaultState.equipment[slot])?.itemId),
  ['chest_wayfarer', 'legs_ash_pants', 'hands_hide_wraps', 'feet_road_boots'],
  'New characters must begin in a complete low-level starter outfit'
);
for (const itemId of ['chest_wayfarer', 'legs_ash_pants', 'hands_hide_wraps', 'feet_road_boots']) {
  assert.equal(ITEM_DEFS[itemId].playerEquipReady, true, `${itemId} must be player-equippable starter gear`);
  assert.equal(ITEM_DEFS[itemId].npcOnly, false, `${itemId} must no longer be NPC-only`);
  assert.equal(ITEM_DEFS[itemId].animationClass, 'full_combo', `${itemId} must use full-combo starter presentation`);
  assert.ok(assetDefsForItem(itemId).length >= 4, `${itemId} must resolve walk/slash/backslash/halfslash runtime art`);
}
assert.deepEqual(
  ['chest_wayfarer', 'legs_ash_pants', 'hands_hide_wraps', 'feet_road_boots'].map(id => ITEM_DEFS[id].playerVisual),
  ['chest_starter_revised', 'legs_starter_revised', 'hands_starter_revised', 'feet_starter_revised'],
  'Starter item IDs must remain save-compatible while redirecting the player to combo-safe visuals'
);
assert.deepEqual(
  ['chest_wayfarer', 'legs_ash_pants', 'hands_hide_wraps', 'feet_road_boots'].map(id => ITEM_DEFS[id].visual),
  ['chest_wayfarer', 'legs_ash', 'hands_hide', 'feet_road'],
  'NPC/shared starter item IDs must retain classic visual mappings instead of receiving player-only revised geometry'
);

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

for (const [key, expected] of Object.entries({
  'goblin-walk': [512, 256], 'goblin-attack': [192, 256],
  'cave-spider-walk': [384, 256], 'cave-spider-attack': [256, 256],
  'ember-spider-walk': [384, 256], 'frost-spider-walk': [384, 256], 'mire-spider-walk': [384, 256],
  'golem-walk': [448, 256], 'golem-attack': [448, 384], 'golem-death': [448, 128],
  'cave3-set': [768, 512],
  'starter-trousers-walk': [576, 256], 'starter-trousers-slash': [384, 256],
  'starter-trousers-backslash': [832, 256], 'starter-trousers-halfslash': [384, 256],
  'starter-wraps-walk': [576, 256], 'starter-wraps-slash': [384, 256],
  'starter-wraps-backslash': [832, 256], 'starter-wraps-halfslash': [384, 256]
})) {
  const def = assetByKey.get(key);
  assert.ok(def, `Missing runtime asset definition ${key}`);
  const size = await pngSize(path.join(dist, def.path));
  assert.deepEqual([size.width, size.height], expected, `${key} has unexpected runtime crop dimensions`);
}
for (const key of ['imp-red-sword-walk', 'imp-red-sword-shield-walk', 'imp-red-pitchfork-walk', 'imp-green-pitchfork-walk', 'imp-green-pitchfork-shield-walk', 'imp-green-sword-walk', 'imp-blue-sword-walk', 'imp-blue-sword-shield-walk', 'imp-blue-pitchfork-walk']) assert.ok(assetByKey.has(key), `Missing harvested Imp variant ${key}`);
for (const key of ['adobe2-set', 'mushrooms', 'bush-evergreen', 'bush-seasonal', 'pine-tree-large', 'pine-tree-cluster']) assert.ok(assetByKey.has(key), `Missing expanded world asset ${key}`);
await access(path.join(dist, 'assets/world/cave3.png'));
for (const file of [
  path.join(root, 'source-assets/world/cave3.png'),
  path.join(root, 'source-assets/world/workshops/lpc-revised-blacksmith.png'),
  path.join(root, 'source-assets/world/workshops/lpc-revised-tailor.png'),
  path.join(root, 'source-assets/world/workshops/lpc-revised-woodshop.png')
]) await access(file);
assert.ok(assetByKey.has('cave3-set'), 'Cave3 must move from staged art into the runtime registry only because a live map now uses it');
assert.ok(!ASSET_DEFS.some(asset => asset.path.includes('/workshops/')), 'Unused workshop source sheets must remain outside runtime dist');
async function recursiveNames(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) names.push(...await recursiveNames(full)); else names.push(full);
  }
  return names;
}
assert.ok(!(await recursiveNames(path.join(dist, 'assets'))).some(file => file.toLowerCase().endsWith('.psd')), 'Photoshop source files must never ship in runtime dist/assets');
assert.ok(!(await recursiveNames(path.join(dist, 'assets'))).some(file => file.includes('source-exports')), 'Development source exports must not live inside shipping dist/assets');
assert.ok((await recursiveNames(path.join(root, 'source-assets'))).length > 20, 'Development source art must be preserved outside dist rather than deleted');
const conceptRoot = path.join(root, 'source-assets/character-concepts/2026-09-07');
for (const file of [
  'player-transformation/Transformation.png',
  'demon-castle/DemonBase.png', 'demon-castle/RedDemon.png', 'demon-castle/TanDemon.png', 'demon-castle/DemonLordFlesh.png',
  'heavenly-and-unique/Truetrans.png', 'heavenly-and-unique/TransupOrHolyKnight.png', 'README.md', 'SHA256SUMS.txt'
]) await access(path.join(conceptRoot, file));
for (const file of await recursiveNames(conceptRoot)) {
  if (!file.toLowerCase().endsWith('.png')) continue;
  const size = await pngSize(file);
  assert.deepEqual([size.width, size.height], [832, 3456], `${file} must preserve the full LPC source sheet`);
}
assert.ok(!(await recursiveNames(path.join(dist, 'assets'))).some(file => file.includes('Transformation.png') || file.includes('Truetrans.png')), 'Future full character concept sheets must not ship in runtime dist/assets');
const cinderAssetKeys = new Set(assetDefsForMap(createDefaultState(), DEFAULT_MAP_ID).map(asset => asset.key));
const hollowAssetKeys = new Set(assetDefsForMap(createDefaultState(), 'map_ashfall_hollow').map(asset => asset.key));
assert.ok(cinderAssetKeys.has('adobe-workshop') && !cinderAssetKeys.has('cave3-set'), 'Cinder map package must not preload cave-only world art');
assert.ok(hollowAssetKeys.has('cave3-set') && !hollowAssetKeys.has('adobe-workshop'), 'Hollow map package must load cave art without town buildings');
assert.ok(hollowAssetKeys.size < cinderAssetKeys.size, 'Secondary map should load a materially smaller texture package');
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

const fullComboLayers = ['player_red_base', 'chest_starter_revised', 'legs_starter_revised', 'hands_starter_revised', 'feet_starter_revised', 'head_iron_revised', 'head_bronze_revised', 'shoulders_leather_revised', 'chest_legion', 'chest_silver_legion', 'chest_steel_plate', 'hands_legion', 'feet_leather_revised', 'wings_red_bat'];
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
      const minimum = layerKey === 'player_red_base' ? animation.sequence.length : Math.max(1, animation.sequence.length - 1);
      assert.ok(populated >= minimum, `${layerKey}/${action} direction ${direction} has only ${populated}/${animation.sequence.length} populated source frames`);
    }
  }
}
for (const layerKey of ['shoulders_legion', 'feet_revised']) {
  const layer = LAYER_ASSETS[layerKey];
  assert.equal(layer.attackFallback, 'slash', `${layerKey} must explicitly declare its revised-attack fallback`);
  assert.equal(ANIMATION_GEOMETRIES[layer.geometry].slash1h, undefined, `${layerKey} must not pretend to contain unsupported revised attacks`);
}
for (const layerKey of ['weapon_arming_sword_fg', 'weapon_brass_arming_sword_fg', 'weapon_iron_arming_sword_fg', 'weapon_bronze_arming_sword_fg', 'weapon_copper_arming_sword_fg', 'weapon_steel_arming_sword_fg', 'weapon_ceramic_arming_sword_fg', 'weapon_gold_arming_sword_fg']) {
  const armingLayer = LAYER_ASSETS[layerKey];
  const armingGeometry = ANIMATION_GEOMETRIES[armingLayer.geometry];
  for (const action of ['walk', 'slash', 'slash1h', 'backslash1h', 'halfslash1h']) {
    const animation = armingGeometry[action];
    const textureKey = armingLayer[animation.source];
    for (let direction = 0; direction < 4; direction += 1) {
      const row = animation.rows[direction];
      for (const frame of animation.sequence) assert.ok(await frameHasAlpha(textureKey, row, frame), `${layerKey} ${action} direction ${direction} frame ${frame} maps to empty artwork`);
    }
  }
}
// v0.1.2.3 new enemy sheets must contain real artwork in every frame used by the
// generic four-direction enemy renderer.
for (const [walkKey, attackKey, walkFrames, attackFrames] of [
  ['goblin-walk', 'goblin-attack', 8, 3],
  ['cave-spider-walk', 'cave-spider-attack', 6, 4],
  ['ember-spider-walk', 'ember-spider-attack', 6, 4],
  ['frost-spider-walk', 'frost-spider-attack', 6, 4],
  ['mire-spider-walk', 'mire-spider-attack', 6, 4],
  ['golem-walk', 'golem-attack', 7, 7]
]) {
  for (let direction = 0; direction < 4; direction += 1) {
    for (let frame = 0; frame < walkFrames; frame += 1) assert.ok(await frameHasAlpha(walkKey, direction, frame), `${walkKey} direction ${direction} frame ${frame} is empty`);
    for (let frame = 0; frame < attackFrames; frame += 1) assert.ok(await frameHasAlpha(attackKey, direction, frame), `${attackKey} direction ${direction} frame ${frame} is empty`);
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
const timestampedSave = createDefaultState();
timestampedSave.savedAt = 1788775200000;
timestampedSave.gameVersion = '0.1.2.4';
const normalizedTimestampedSave = saveManager.validate(timestampedSave);
assert.equal(normalizedTimestampedSave.savedAt, 1788775200000, 'Load-menu save metadata must preserve the stored save timestamp');
assert.equal(normalizedTimestampedSave.gameVersion, '0.1.2.4', 'Existing schema-1 saves must preserve their recorded build version metadata');
assert.equal(valid.player.mapId, DEFAULT_MAP_ID);
const caveSave = createDefaultState();
caveSave.player.mapId = 'map_ashfall_hollow';
caveSave.player.entryPointId = 'from_cinder';
caveSave.player.x = 512; caveSave.player.y = 620;
const normalizedCaveSave = saveManager.validate(caveSave);
assert.equal(normalizedCaveSave.player.mapId, 'map_ashfall_hollow');
assert.equal(normalizedCaveSave.player.x, 512);
const legacyMaplessSave = createDefaultState();
delete legacyMaplessSave.player.mapId; delete legacyMaplessSave.player.entryPointId;
assert.equal(saveManager.validate(legacyMaplessSave).player.mapId, DEFAULT_MAP_ID, 'Schema-1 mapless saves must migrate safely to Cinder Region');
assert.throws(() => saveManager.validate({ saveVersion: 1 }), /player state/i);
const unknownItem = createDefaultState();
unknownItem.inventory.push({ instanceId: 'bad', itemId: 'missing_item', rarity: 'normal', modifiers: {} });
assert.ok(!saveManager.validate(unknownItem).inventory.some(item => item.instanceId === 'bad'), 'Unknown content must be removed safely');

// Multi-slot equipment remains a real state invariant, but only full-combo
// player-ready visual gear may be equipped.
const clearStarterArmor = state => { for (const slot of ['chest', 'legs', 'hands', 'feet']) state.equipment[slot] = null; };

const gearState = createDefaultState();
clearStarterArmor(gearState);
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

// v0.1.1.5 verified equipment can all be newly equipped when its requirements are met.
const expansionState = createDefaultState();
expansionState.player.level = 6;
expansionState.player.stats = { str: 14, dex: 10, vit: 10, spr: 7 };
const expansionInventory = new InventorySystem(expansionState);
for (const [index, itemId] of ['weapon_iron_arming_sword', 'head_bronze_revised', 'shoulders_leather_revised', 'chest_steel_plate', 'feet_leather_revised'].entries()) {
  const instanceId = `i_exp_${index}`;
  expansionState.inventory.push({ instanceId, itemId, rarity: 'normal', enhancement: 0, modifiers: {} });
  assert.equal(expansionInventory.equip(instanceId).ok, true, `${itemId} should equip after requirements are met`);
}
assert.equal(expansionState.equipment.weapon, 'i_exp_0');
assert.equal(expansionState.equipment.head, 'i_exp_1');
assert.equal(expansionState.equipment.shoulders, 'i_exp_2');
assert.equal(expansionState.equipment.chest, 'i_exp_3');
assert.equal(expansionState.equipment.feet, 'i_exp_4');

// Wings exist now but are deliberately progression-gated. Unlocking the flag
// makes the same item equippable and its buffs feed normal derived-stat math.
const wingState = createDefaultState();
clearStarterArmor(wingState);
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
const normalizedOldArmor = saveManager.validate(oldArmorSave);
for (const slot of ['chest', 'legs', 'hands', 'feet']) assert.ok(normalizedOldArmor.equipment[slot], `Starter ${slot} should remain valid when equipped`);
const returningUndressedSave = createDefaultState();
for (const slot of ['chest', 'legs', 'hands', 'feet']) returningUndressedSave.equipment[slot] = null;
const normalizedReturningUndressed = saveManager.validate(returningUndressedSave);
for (const slot of ['chest', 'legs', 'hands', 'feet']) assert.equal(normalizedReturningUndressed.equipment[slot], null, 'Existing saves must not be force-dressed');

const legacyRewardSave = createDefaultState();
legacyRewardSave.inventory.push({ instanceId: 'i_old_warden_reward', itemId: 'head_warden', rarity: 'noble', enhancement: 2, modifiers: { defense: 2 } });
legacyRewardSave.inventory.push({ instanceId: 'i_old_cinderhide_reward', itemId: 'chest_cinderhide', rarity: 'magic', enhancement: 1, modifiers: { maxHp: 8 } });
const normalizedLegacyRewards = saveManager.validate(legacyRewardSave);
const recoveredHelm = normalizedLegacyRewards.inventory.find(item => item.instanceId === 'i_old_warden_reward');
const recoveredLeather = normalizedLegacyRewards.inventory.find(item => item.instanceId === 'i_old_cinderhide_reward');
assert.equal(recoveredHelm.itemId, 'head_iron_revised');
assert.equal(recoveredHelm.rarity, 'noble');
assert.equal(recoveredHelm.enhancement, 2);
assert.equal(recoveredHelm.modifiers.defense, 2);
assert.equal(recoveredLeather.itemId, 'feet_leather_revised');
assert.equal(recoveredLeather.rarity, 'magic');
assert.equal(recoveredLeather.enhancement, 1);
assert.equal(recoveredLeather.modifiers.maxHp, 8);
assert.ok(saveSource.includes('legacyPlayerRewardMap'), 'Save normalization must preserve a narrow legacy reward recovery map');

const wrongSlotSave = createDefaultState();
wrongSlotSave.equipment.head = 'i_000001'; // Arming Sword cannot occupy Head.
const normalizedWrongSlot = saveManager.validate(wrongSlotSave);
assert.equal(normalizedWrongSlot.equipment.head, null, 'Wrong-slot saved equipment must be discarded');
assert.equal(normalizedWrongSlot.equipment.weapon, 'i_000001', 'Valid weapon reference must survive normalization');

console.log(`Validated ${ASSET_DEFS.length} assets, ${Object.keys(ITEM_DEFS).length} items, ${Object.keys(ENEMY_DEFS).length} enemies, ${Object.keys(NPC_DEFS).length} NPCs, ${BUILDING_DEFS.length} refuge buildings, ${COLLIDERS.length} visible-source colliders, ${Object.keys(QUEST_DEFS).length} quests, v0.1.2.4.2 player-transition/starter-visual recovery, scrollable diagnostics, corrected Goblin facing, combo-safe starter clothes, Golem death animation, separate Ashfall Hollow map, map-scoped/lazy texture loading, preserved source art outside dist, collision preservation, player-safe loot, four-hit combat geometry, hardened mobile movement, inventory recovery, and save schema 1.`);
