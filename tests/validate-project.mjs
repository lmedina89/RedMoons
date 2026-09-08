import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

globalThis.location = { search: '' };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const { GAME_VERSION, SAVE_VERSION } = await import('../dist/js/config.js');
const { ANIMATION_GEOMETRIES, ASSET_DEFS, LAYER_ASSETS } = await import('../dist/js/data/assets.js');
const { WEAPON_COMBAT_PROFILES } = await import('../dist/js/data/combat.js');
const { ENEMY_DEFS } = await import('../dist/js/data/enemies.js');
const { EQUIPMENT_SET_DEFS, ITEM_DEFS } = await import('../dist/js/data/items.js');
const { CONSUMABLE_EFFECT_DEFS, MERCHANT_SUPPLY_DEFS, QUICK_CONSUMABLE_SLOTS, RECOVERY_DROP_TABLE } = await import('../dist/js/data/consumables.js');
const { NPC_DEFS, NPC_GUILD_SEEDS } = await import('../dist/js/data/npcs.js');
const { AREA_DEFS, BUILDING_DEFS, COLLIDERS, DEFAULT_MAP_ID, FALLEN_WATCH_WALLS, HOLLOW_COLLIDERS, HOLLOW_WALLS, INTERIOR_COLLIDERS, MAP_DEFS, MAP_TRANSITIONS, RECOVERY_POINTS, REFUGE_WALLS, SPAWN_REGIONS, WILDS_STRUCTURE_COLLIDERS, ZONES } = await import('../dist/js/data/world.js');
const { WARFRONT_COLLIDERS } = await import('../dist/js/data/warfront.js');
const { POI_DEFS, WORLD_EVENT_DEFS } = await import('../dist/js/data/exploration.js');
const { MONSTER_FAMILY_DEFS, ENCOUNTER_GROUP_ARCHETYPES, ENCOUNTER_DEFS } = await import('../dist/js/data/encounters.js');
const { QUEST_DEFS } = await import('../dist/js/data/quests.js');
const { SKILL_DEFS, DEFAULT_SKILL_SLOTS, normalizeSkillState, resolvedSkillDef } = await import('../dist/js/data/skills.js');
const { STATUS_DEFS } = await import('../dist/js/data/statuses.js');
const { PROJECTILE_DEFS } = await import('../dist/js/data/projectiles.js');
const { ENEMY_ABILITY_DEFS } = await import('../dist/js/data/abilities.js');
const { AZRAEL_DEF } = await import('../dist/js/data/specialActors.js');
const { relationBetween } = await import('../dist/js/data/factions.js');
const { createDefaultState } = await import('../dist/js/core/GameState.js');
const { SaveManager } = await import('../dist/js/core/SaveManager.js');
const { InventorySystem } = await import('../dist/js/systems/InventorySystem.js');
const { RecoverySystem } = await import('../dist/js/systems/RecoverySystem.js');
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
const skillControllerSource = await readFile(path.join(dist, 'js/systems/SkillController.js'), 'utf8');
const statusControllerSource = await readFile(path.join(dist, 'js/systems/StatusController.js'), 'utf8');
const projectileManagerSource = await readFile(path.join(dist, 'js/systems/ProjectileManager.js'), 'utf8');
const fxManagerSource = await readFile(path.join(dist, 'js/systems/FxManager.js'), 'utf8');
const audioManagerSource = await readFile(path.join(dist, 'js/systems/AudioManager.js'), 'utf8');
const recoverySource = await readFile(path.join(dist, 'js/systems/RecoverySystem.js'), 'utf8');
const animationResolverSource = await readFile(path.join(dist, 'js/systems/AnimationResolver.js'), 'utf8');
const combatResolverSource = await readFile(path.join(dist, 'js/systems/CombatResolver.js'), 'utf8');
const azraelSource = await readFile(path.join(dist, 'js/entities/Azrael.js'), 'utf8');
const factionsSource = await readFile(path.join(dist, 'js/data/factions.js'), 'utf8');
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
assert.equal(GAME_VERSION, '0.1.4.4.5.4.3', 'Mythic Level Recalibration version must be v0.1.4.4.5.4.3');
assert.ok(html.includes('v0.1.4.4.5.4.3'), 'Build shell must identify v0.1.4.4.5.4.3');
assert.ok(html.includes('id="start-screen"') && html.includes('id="continue-game"') && html.includes('id="new-game"') && html.includes('id="load-game"') && html.includes('id="mythic-freeplay"'), 'Start menu must expose Continue, New Game, Load Save and Mythic Freeplay');
assert.ok(html.includes('data-quick-consumable="health"') && html.includes('data-quick-consumable="essence"'), 'Mobile HUD must expose dedicated HP and Essence quick-use controls');
assert.ok(html.includes('class="flask-glyph"') && cssSource.includes('#skill-button-0') && cssSource.includes('#skill-button-1') && cssSource.includes('#skill-button-2'), 'Combat hotfix must expose recognizable flask glyphs and absolute radial skill positions');
assert.ok(cssSource.includes('width: 338px; height: 205px') && cssSource.includes('#interact-button { position: absolute; right: 158px; bottom: 0;') && cssSource.includes('.recovery-cluster { position: absolute; right: 120px; bottom: 126px;'), 'Combat controls must use the final right/down-biased geometry so Use/recovery stay out of the center combat lane');
assert.ok(cssSource.includes('#skill-button-2 { right: 30px; bottom: 104px; }'), "Final Skill III position must stay tightened into Attack's upper arc");
assert.ok(uiSource.includes("interaction.available") && worldSource.includes('nearestInteraction()') && worldSource.includes('interaction: this.interactionSnapshot()'), 'Use must reflect the nearby interaction without changing interaction priority');
assert.ok(uiSource.includes('quick.count <= 0 || quick.remainingMs > 0') && uiSource.includes("button.classList.toggle('empty'"), 'Recovery HUD must expose disabled cooldown/empty states instead of accepting misleading taps');
assert.ok(combatSource.includes('const arcDegrees = attack.arcDegrees || 96') && combatSource.includes('dot < cosThreshold'), 'Basic attacks must use an explicit narrower directional arc instead of an almost-half-circle hit test');
assert.ok(combatSource.includes('toggleRangeDebug') && combatSource.includes('cyan basic / orange Cleave') === false, 'CombatSystem must expose the range-debug toggle without owning UI copy');
assert.ok(worldSource.includes("action === 'ranges'") && html.includes('data-debug="ranges"'), 'Diagnostics must expose the basic/Cleave combat range overlay');
assert.ok(html.includes('data-debug="recoverykit"'), 'Diagnostics must include a recovery test kit');
assert.ok(recoverySource.includes('cooldownGroup') && recoverySource.includes('activeFood') && recoverySource.includes('9000'), 'RecoverySystem must own shared cooldowns, food recovery and delayed passive regen');
assert.ok(worldSource.includes('createRecoveryMarkers') && worldSource.includes('✦ HEAL ✦') && worldSource.includes('buyMerchantItem') && worldSource.includes('RECOVERY_DROP_TABLE'), 'WorldScene must wire a clearly visible sanctuary recovery marker, merchant supplies and recovery loot');
assert.ok(html.includes('id="map-loading-overlay"') && uiSource.includes("gameEvents.on('map-loading'"), 'Map transitions must expose a visible loading state');
assert.ok(mainSource.includes('loadExisting()') && mainSource.includes('saveManager.reset()') && mainSource.includes('confirm-new-game'), 'Main boot flow must preserve Continue/Load and require explicit overwrite confirmation for an existing single-slot save');
assert.ok(saveSource.includes('loadExisting()') && saveSource.includes('summary(state)'), 'Save manager must expose non-destructive slot inspection for the title menu');
assert.ok(cssSource.includes('overflow-x: auto') && cssSource.includes('left: calc(var(--safe-left)') && cssSource.includes('flex: 0 0 auto'), 'Debug tray must stay inside safe-area bounds and scroll horizontally on iPhone');
assert.ok(worldSource.includes('transitionToMap') && worldSource.includes('buildAshfallHollow'), 'WorldScene must support separate map transitions');
assert.match(worldSource, /this\.player\.respawn\(this\.player\.body\.x, this\.player\.body\.y\);[\s\S]{0,400}this\.transitionToMap\(DEFAULT_MAP_ID, 'cinder_start'\)/, 'Off-map death must restore HP locally before the prepared Refuge transition');
assert.ok(!worldSource.includes('releaseAssetsNotNeededForMap('), 'v0.1.4.2 must not eagerly evict textures during the WebKit-sensitive Scene handoff');
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
const createStart = worldSource.indexOf('create() {');
const transitionResetIndex = worldSource.indexOf('this.transitioning = false;', createStart);
const inputBindIndex = worldSource.indexOf('actionInput.bind(this);', createStart);
assert.ok(transitionResetIndex > createStart && inputBindIndex > transitionResetIndex, 'WorldScene restart must clear the transient transition gate before destination input/gameplay binds');
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


// v0.1.3 combat-foundation shell: mobile skill slots, keyboard slots, reusable
// combat systems and a debug kit must all be wired into the live scene.
assert.equal((html.match(/data-skill-slot=/g) || []).length, 3, 'Mobile HUD must expose exactly three compact skill slots');
assert.ok(uiSource.includes("command: 'skill'") || uiSource.includes("type: 'skill'"), 'UI must route skill-slot taps into game commands');
assert.ok(worldSource.includes("command.type === 'skill'") && worldSource.includes("action === 'combatkit'"), 'WorldScene must consume skill commands and expose the Combat Test Kit');
assert.ok(actionInputSource.includes('skillQueued') && actionInputSource.includes("skill1: 'ONE'") && actionInputSource.includes("skill2: 'TWO'") && actionInputSource.includes("skill3: 'THREE'") && actionInputSource.includes('consumeSkill(slot)'), 'Keyboard 1/2/3 skill input must be restart-safe through ActionInput');
for (const [name, source] of [
  ['SkillController', skillControllerSource], ['StatusController', statusControllerSource], ['ProjectileManager', projectileManagerSource],
  ['FxManager', fxManagerSource], ['AudioManager', audioManagerSource], ['AnimationResolver', animationResolverSource], ['CombatResolver', combatResolverSource]
]) assert.ok(source.length > 300, `${name} must ship as a concrete reusable combat module`);
assert.ok(combatSource.includes('new SkillController') && combatSource.includes('new ProjectileManager') && combatSource.includes('new StatusController') && combatSource.includes('new CombatResolver'), 'CombatSystem must compose the reusable combat modules rather than hard-code all abilities in WorldScene');
assert.ok(cssSource.includes('.skill-cluster') && cssSource.includes('.skill-button'), 'Landscape HUD must include compact iPhone skill-button styling');
assert.ok(html.includes('id="status-strip"') && cssSource.includes('.status-chip') && uiSource.includes('--cooldown-angle') && uiSource.includes('button.dataset.rank'), 'Combat polish must expose readable active-status chips, rank badges and cooldown progress');
assert.ok(uiSource.includes('Skill Ranks') && uiSource.includes('Future upgrades will spend Skill Points here.'), 'Growth UI must surface persisted skill ranks without enabling the later spending interface yet');
assert.ok(animationResolverSource.indexOf('SPECIAL_ACTIONS.has(requestedAction)') < animationResolverSource.indexOf('asset.attackFallback'), 'Special casts/hurt must hide unsupported weapons or hold old armor static before generic slash fallback is considered');
assert.ok(worldSource.includes("if (action === 'level') {") && worldSource.includes('skills.syncUnlocks(true)'), 'Debug XP grants must exercise normal skill-unlock synchronization');

const ids = groups => Object.values(groups).map(value => value.id);
for (const registry of [ITEM_DEFS, ENEMY_DEFS, NPC_DEFS, QUEST_DEFS]) assert.equal(new Set(ids(registry)).size, ids(registry).length, 'Stable content IDs must be unique');
assert.ok(BUILDING_DEFS.length >= 5, 'Cinder Refuge must contain a real multi-building settlement layout');
assert.equal(REFUGE_WALLS.length, 5, 'Refuge perimeter must be defined by visible wall segments with one broad east opening');
assert.ok(REFUGE_WALLS.some(wall => wall.id === 'refuge-east-north') && REFUGE_WALLS.some(wall => wall.id === 'refuge-east-south'), 'Refuge east wall must be split around a visible exit');
const eastNorth = REFUGE_WALLS.find(wall => wall.id === 'refuge-east-north');
const eastSouth = REFUGE_WALLS.find(wall => wall.id === 'refuge-east-south');
assert.ok(eastSouth.y1 - eastNorth.y2 >= 400, 'Refuge east exit must remain broadly touch-traversable');
assert.ok(COLLIDERS.every(collider => ['visible-wall', 'ruin-wall', 'building', 'ruined-building', 'natural-rock', 'ruined-shrine', 'interior-wall', 'stronghold-wall', 'outpost-wall', 'ancient-cliff', 'luminous-water', 'axis-pillar', 'landmark-prop'].includes(collider.source)), 'Every static collider must correspond to visible wall/building/ruin/natural geometry');
assert.equal(COLLIDERS.length, REFUGE_WALLS.length + FALLEN_WATCH_WALLS.length + BUILDING_DEFS.length + WILDS_STRUCTURE_COLLIDERS.length + INTERIOR_COLLIDERS.length + WARFRONT_COLLIDERS.length, 'Static collision must be fully explained by visible refuge walls, Watch ruins, buildings, authored wild structures, visible interior walls and Warfront geography');
assert.ok(!COLLIDERS.some(collider => ['north-cliff', 'south-cliff', 'west-wall', 'east-fog', 'road-bones'].includes(collider.id)), 'Unrepresented/redundant invisible world blockers must not return');
assert.ok(worldSource.includes('renderStoneWallSegments(REFUGE_WALLS)') && worldSource.includes('renderStoneWallSegments(FALLEN_WATCH_WALLS') && worldSource.includes('collisionDebug.strokeRect'), 'Visible Refuge/Fallen Watch stone art and debug collider audit must share the same wall data');
assert.ok(ZONES.every(zone => Array.isArray(zone.levelRange) && typeof zone.safe === 'boolean' && Array.isArray(zone.eventTags)), 'Zones must expose future-proof level/safety/event metadata');
assert.equal(Object.keys(MAP_DEFS).length, 8, 'World streaming must ship Refuge, Wilds, Hollow, four proof maps and the Warfront geography map');
assert.equal(DEFAULT_MAP_ID, 'map_cinder_refuge', 'Fresh characters and deaths must resolve to the dedicated Refuge map');
assert.equal(MAP_DEFS.map_cinder_refuge.width, 2048, 'Cinder Refuge must have room for a real settlement layout');
assert.equal(MAP_DEFS.map_cinder_refuge.height, 1536, 'Cinder Refuge must have a deeper settlement footprint');
assert.equal(MAP_DEFS.map_cinder_wilds.width, 6400, 'Cinder Wilds must materially expand regional travel spacing');
assert.equal(MAP_DEFS.map_cinder_wilds.height, 2048, 'Cinder Wilds must expand vertical routing/sightline space');
assert.equal(MAP_DEFS.map_ashfall_hollow.width, 1024, 'Ashfall Hollow must keep its own smaller map bounds');
assert.deepEqual(
  ['map_warden_hall', 'map_torrens_forge', 'map_ashgrave_crypt', 'map_veil_threshold'].map(id => MAP_DEFS[id]?.renderer),
  ['warden_hall', 'torrens_forge', 'ashgrave_crypt', 'veil_threshold'],
  'Exploration foundation must register all four proof-map renderers'
);
assert.equal(HOLLOW_COLLIDERS.length, HOLLOW_WALLS.length, 'Hollow collision must come only from its visible wall records');
assert.ok(COLLIDERS.every(collider => collider.blocksActors?.includes('player') && collider.blocksActors?.includes('enemy')), 'Every current Cinder solid must block both player and ordinary ground enemies');
assert.ok(HOLLOW_COLLIDERS.every(collider => collider.blocksActors?.includes('player') && collider.blocksActors?.includes('enemy')), 'Every Hollow wall must block both player and ordinary ground enemies');
assert.equal(AREA_DEFS.filter(area => area.mapId === DEFAULT_MAP_ID).length, 1, 'Dedicated Refuge map should resolve to one stable local area');
assert.equal(AREA_DEFS.filter(area => area.mapId === 'map_cinder_wilds').length, 7, 'Expanded Wilds must expose seven spaced local areas');
assert.ok(AREA_DEFS.some(area => area.id === 'area_first_light_scar') && AREA_DEFS.some(area => area.id === 'area_fallen_watch') && AREA_DEFS.some(area => area.id === 'area_ashgrave_hollow'), 'World layout foundation must expose the First-Light Scar, Fallen Watch and Ashgrave Hollow identities');
for (const area of AREA_DEFS) {
  for (const family of area.encounter?.families || []) assert.ok(MONSTER_FAMILY_DEFS[family.id], `${area.id} references unknown monster family ${family.id}`);
  for (const group of area.encounter?.groups || []) assert.ok(ENCOUNTER_GROUP_ARCHETYPES[group], `${area.id} references unknown encounter group ${group}`);
}
assert.ok(worldSource.includes('this.enemyGroup,') && worldSource.includes('this.obstacles,') && worldSource.includes('enemyObstacleProcess') && worldSource.includes('onEnemyObstacleCollision'), 'Enemy group must collide with static world solids through a filtered collider');
assert.ok(enemySource.includes('onWorldCollision(obstacle, time)') && enemySource.includes("this.state = 'obstructed'") && enemySource.includes('worldDetourUntil') && enemySource.includes('hasWorldLineOfSight'), 'Ground enemy AI must steer/disengage when world collision blocks pursuit and must not basic-melee through solids');
assert.ok(uiSource.includes("gameEvents.on('area'"), 'HUD must display fine-grained local area identity');
assert.ok(MAP_TRANSITIONS.some(t => t.mapId === DEFAULT_MAP_ID && t.destinationMapId === 'map_cinder_wilds'), 'Refuge east gate must transition into the expanded Wilds');
assert.ok(MAP_TRANSITIONS.some(t => t.mapId === 'map_cinder_wilds' && t.destinationMapId === DEFAULT_MAP_ID), 'Wilds must provide a physical return to Refuge');
assert.ok(MAP_TRANSITIONS.some(t => t.mapId === 'map_cinder_wilds' && t.destinationMapId === 'map_ashfall_hollow'), 'Cinderwood must expose an enterable Hollow transition');
assert.ok(MAP_TRANSITIONS.some(t => t.mapId === 'map_ashfall_hollow' && t.destinationMapId === 'map_cinder_wilds'), 'Ashfall Hollow must return to Cinderwood in the Wilds');
for (const [sourceMapId, destinationMapId] of [
  ['map_cinder_refuge', 'map_warden_hall'],
  ['map_cinder_refuge', 'map_torrens_forge'],
  ['map_cinder_wilds', 'map_ashgrave_crypt'],
  ['map_cinder_wilds', 'map_veil_threshold']
]) {
  assert.ok(MAP_TRANSITIONS.some(t => t.mapId === sourceMapId && t.destinationMapId === destinationMapId && t.captureReturn), `${sourceMapId} must capture an exact return anchor when entering ${destinationMapId}`);
  assert.ok(MAP_TRANSITIONS.some(t => t.mapId === destinationMapId && t.returnToOrigin && t.fallbackDestinationMapId), `${destinationMapId} must expose a safe return-to-origin transition`);
}
assert.ok(POI_DEFS.length >= 10 && WORLD_EVENT_DEFS.length >= 4, 'Exploration foundation must include meaningful POIs and dynamic world-event seeds');
assert.ok(Object.keys(ENEMY_DEFS).length >= 16, 'Asset variety expansion should ship a broad early enemy roster');
assert.ok(Object.values(ENEMY_DEFS).filter(enemy => enemy.layered).length >= 4, 'Skeleton family should use layered equipment-bearing actors');
for (const id of ['enemy_cinder_imp', 'enemy_blight_imp', 'enemy_blueflame_imp']) {
  assert.ok(Array.isArray(ENEMY_DEFS[id].visualPool) && ENEMY_DEFS[id].visualPool.length >= 3, `${id} must expose weighted visual/loadout variety`);
}
for (const id of ['enemy_ash_goblin', 'enemy_cave_spider', 'enemy_ember_spider', 'enemy_frost_spider', 'enemy_mire_spider', 'enemy_ashstone_golem']) assert.ok(ENEMY_DEFS[id], `Missing enemy ${id}`);
assert.deepEqual(ENEMY_DEFS.enemy_ash_goblin.directionRows, [2, 3, 0, 1], 'Goblin source rows must be remapped so chase movement faces toward the player');
assert.equal(ENEMY_DEFS.enemy_ashstone_golem.deathTexture, 'golem-death', 'Ashstone Golem must use its supplied death sheet');
assert.equal(ENEMY_DEFS.enemy_ashstone_golem.deathFrames, 7, 'Ashstone Golem death sequence must expose all seven frames');


assert.deepEqual(Object.keys(SKILL_DEFS), ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'], 'Combat foundation should prove the player framework with exactly three initial skills');
assert.deepEqual(Object.values(SKILL_DEFS).map(skill => skill.unlockLevel), [1, 3, 5], 'Initial player skills must unlock at levels 1/3/5');
assert.deepEqual(DEFAULT_SKILL_SLOTS, ['skill_ember_cleave', null, null]);
assert.ok(SKILL_DEFS.skill_ember_cleave.range >= 148 && SKILL_DEFS.skill_ember_cleave.arcDegrees >= 148 && SKILL_DEFS.skill_ember_cleave.damageMultiplier >= 1.5 && SKILL_DEFS.skill_ember_cleave.knockback >= 140, 'Ember Cleave hotfix must clearly outrange/out-angle basic attacks and add stronger impact');
const basicSwordAttacks = WEAPON_COMBAT_PROFILES.sword_four_hit.attacks;
assert.ok(Math.max(...basicSwordAttacks.map(attack => 92 * (attack.rangeMultiplier || 1))) < SKILL_DEFS.skill_ember_cleave.range, 'Cleave must physically outrange every ordinary sword-combo hit');
assert.ok(Math.max(...basicSwordAttacks.map(attack => attack.arcDegrees || 96)) < SKILL_DEFS.skill_ember_cleave.arcDegrees, 'Cleave must remain wider than every ordinary sword-combo hit');
assert.ok(SKILL_DEFS.skill_ruin_pulse.damageMultiplier >= 1.15 && SKILL_DEFS.skill_ruin_pulse.knockback >= 250, 'Ruin Pulse polish must add meaningful impact without becoming a giant-radius screen clear');
assert.equal(SKILL_DEFS.skill_ashen_guard.durationMs, 5000, 'Ashen Guard rank hook must start from the live five-second duration');
assert.ok(fxManagerSource.includes('outerRadius = range * 0.94') && fxManagerSource.includes('halfArc') && fxManagerSource.includes('this.ring(x, y, 114'), 'Cleave FX must derive from the live skill range/arc while Ruin Pulse keeps its existing radial presentation');
assert.ok(combatSource.includes("ability.type === 'melee_reach'") && fxManagerSource.includes('lineTelegraph'), 'Bone Spearman must use shared telegraphed reach combat rather than bespoke collision code');
for (const skill of Object.values(SKILL_DEFS)) assert.equal(skill.maxRank, 5, `${skill.id} must expose five future progression ranks`);
for (const id of ['burn', 'poison', 'slow', 'guard', 'stagger']) assert.ok(STATUS_DEFS[id], `Missing initial status ${id}`);
for (const id of ['toxic_spit', 'blueflame_bolt', 'bone_arrow', 'grave_hex', 'celestial_judgment']) assert.ok(PROJECTILE_DEFS[id], `Missing projectile definition ${id}`);
assert.equal(AZRAEL_DEF.displayName, 'ArchAngel Azrael', 'Azrael must use the canonical ArchAngel title');
assert.equal(AZRAEL_DEF.levelDisplay, '???', 'Azrael normal presentation must hide his numeric level');
assert.equal(AZRAEL_DEF.internalLevel, 175, 'Azrael field-test stats must be endgame-scale while the visible level remains hidden');
assert.ok(AZRAEL_DEF.maxHp >= 10000 && AZRAEL_DEF.defense >= 150 && AZRAEL_DEF.attack >= 300, 'Azrael must use real extreme stats rather than an invulnerability flag');
assert.ok(AZRAEL_DEF.statusResistances?.poison >= 0.8 && AZRAEL_DEF.staggerResistance >= 0.9, 'Azrael should resist ordinary control/status effects through data, not immunity hacks');
assert.ok(PROJECTILE_DEFS.celestial_judgment.knockback >= 180, 'Judgment Blast must land with visible celestial knockback');
assert.equal(relationBetween({ faction: 'celestial' }, { faction: 'player' }), 'friendly', 'Celestial actors must be friendly to the player');
assert.equal(relationBetween({ faction: 'celestial' }, { faction: 'monster' }), 'hostile', 'Celestial actors must target monsters');
assert.equal(relationBetween({ faction: 'monster' }, { faction: 'celestial' }), 'hostile', 'Monsters must be able to attack Azrael back');
for (const key of Object.values(AZRAEL_DEF.assets)) assert.ok(ASSET_DEFS.some(asset => asset.key === key), `Missing runtime Azrael crop ${key}`);
assert.ok(azraelSource.includes("renderLoop('run'") && azraelSource.includes("renderProgress('jump'") && azraelSource.includes('wingburst_dash'), 'Azrael must use run as glide and jump as the wing-burst transition');
assert.ok(azraelSource.includes('ARCHANGEL AZRAEL') && azraelSource.includes('Lv. ???') && azraelSource.includes('CELESTIAL MYTHIC'), 'Azrael must ship with his unique mythic hidden-level nameplate');
assert.ok(azraelSource.includes('clusterCount') && azraelSource.includes('chooseTarget') && azraelSource.includes('minCluster'), 'Azrael AI must be cluster-aware rather than a simple chase attacker');
for (const action of ["'halfslash'", "'slash'", "'thrust'", "'backslash'"]) assert.ok(azraelSource.includes(action), `Azrael combat rotation must preserve ${action} from the supplied moveset`);
assert.ok(azraelSource.includes('nextGlideTrailAt') && azraelSource.includes("'celestial', 0.30"), 'Azrael ordinary locomotion must visibly read as a lightweight celestial glide');
for (const key of ['sanctifiedNova', 'seraphicJudgment', 'heavenfall']) assert.ok(AZRAEL_DEF.abilities[key]?.major, `${key} must participate in shared major-skill pacing`);
assert.ok(AZRAEL_DEF.abilities.sanctifiedNova.cooldownMs < AZRAEL_DEF.abilities.heavenfall.cooldownMs && AZRAEL_DEF.abilities.seraphicJudgment.cooldownMs < AZRAEL_DEF.abilities.heavenfall.cooldownMs, 'The two new AoEs must be available more often than Heavenfall');
assert.ok(AZRAEL_DEF.abilities.sanctifiedNova.minNearby >= 2 && AZRAEL_DEF.abilities.seraphicJudgment.minCluster >= 2, 'New AoEs must be context-aware instead of random screen spam');
const sanctuary = AZRAEL_DEF.abilities.sanctuaryFirstLight;
assert.equal(sanctuary?.name, 'Sanctuary of the First Light', 'Azrael must expose the canonical sanctuary ability name');
assert.equal(sanctuary?.major, true, 'Sanctuary must participate in shared major-skill pacing');
assert.ok(sanctuary.radius >= 200 && sanctuary.fieldDurationMs >= 5000, 'Sanctuary must be a large persistent field rather than a tiny instant heal');
assert.deepEqual([...sanctuary.pulseDelays], [0, 1650, 3300, 4950], 'Sanctuary healing must pulse four times across the live field');
assert.ok(sanctuary.selfHealPct < sanctuary.celestialHealPct && sanctuary.celestialHealPct < sanctuary.playerHealPct, 'Sanctuary must keep Azrael self-healing conservative while rewarding allies/player who stay inside');
assert.ok(sanctuary.castMissingThreshold >= 0.15, 'Sanctuary AI must require meaningful missing health instead of casting at full health');
assert.ok(azraelSource.includes('majorAbilityLockUntil') && azraelSource.includes('hostileCountNear') && azraelSource.includes('sanctuaryNeedScore') && azraelSource.includes('azrael_sanctuary_first_light'), 'Azrael AI must pace and selectively cast the expanded seven-skill kit');
assert.ok(azraelSource.includes('fillRoundedRect(-88, -19, 176, 40, 9)') && azraelSource.includes('ARCHANGEL AZRAEL'), 'Azrael mythic nameplate must be widened so the full title stays inside the frame');
assert.ok(combatSource.includes('beginAllyAbility') && combatSource.includes('triggerAllyAbility') && combatSource.includes('shakeAt'), 'CombatSystem must expose reusable ally ability and proximity-shake foundations');
assert.ok(fxManagerSource.includes('celestialSigil') && fxManagerSource.includes('celestialWingBurst') && fxManagerSource.includes('ancientCelestialSeal') && fxManagerSource.includes('sanctifiedNovaImpact') && fxManagerSource.includes('seraphicJudgmentSeal') && fxManagerSource.includes('seraphicJudgmentImpact') && fxManagerSource.includes('sanctuaryFirstLightField') && fxManagerSource.includes('sanctuaryFirstLightPulse') && fxManagerSource.includes('sanctuaryFirstLightBlessing') && fxManagerSource.includes('heavenfallImpact'), 'Azrael attacks/support must use a distinct ancient-celestial VFX language');
assert.ok(combatSource.includes('azrael_sanctified_nova') && combatSource.includes('azrael_seraphic_judgment') && combatSource.includes('azrael_sanctuary_first_light') && combatSource.includes('sanctuaryPulse') && combatSource.includes('showHealing') && combatSource.includes('pulseScales'), 'CombatSystem must execute offensive AoEs plus the persistent Sanctuary healing field');
assert.ok(audioManagerSource.includes('sanctified_nova') && audioManagerSource.includes('seraphic_judgment') && audioManagerSource.includes('sanctuary_first_light'), 'Expanded Azrael skills need distinct procedural audio signatures');
assert.ok(enemySource.includes('potentialTargets') && enemySource.includes('areHostile') && enemySource.includes('playerRewardEligible'), 'Enemy AI must support faction targets and contribution-gated rewards');
assert.ok(worldSource.includes('createAzrael()') && worldSource.includes('friendlyCombatants()') && worldSource.includes('enemy.playerRewardEligible'), 'WorldScene must spawn Azrael and block solo-Azrael XP/loot farming');
assert.ok(html.includes('data-debug="azrael"') && html.includes('data-debug="azraelai"'), 'Diagnostics must expose Azrael teleport and AI overlay controls');
assert.ok(html.includes('data-debug="lailani"') && html.includes('data-debug="lailanisolo"') && html.includes('data-debug="lailaniai"'), 'Diagnostics must expose Lailani field, solo-loop and AI controls');
assert.ok(projectileManagerSource.includes('hostileTargetsProvider') && projectileManagerSource.includes('sourceActor') && projectileManagerSource.includes('damageTarget'), 'Projectiles must resolve hostile targets from the actual source actor without hard-coded enemy/player branches');
assert.ok(projectileManagerSource.includes("item.data.def.impact === 'celestial'") && projectileManagerSource.includes('data.def.knockback'), 'Judgment Blast must use a celestial impact burst and projectile knockback');
assert.ok(combatSource.includes("sourceTeam: 'celestial'") && combatSource.includes("team: 'celestial'"), 'Azrael damage must be identified as celestial so it cannot count as player contribution');
assert.ok(statusControllerSource.includes('innateResistance') && combatResolverSource.includes('damageFriendly') && combatResolverSource.includes('damageTarget'), 'Azrael must take real resolved damage/statuses through the shared combat pipeline');
for (const id of ['toxic_spit', 'blueflame_bolt', 'bone_arrow', 'grave_hex', 'bone_lunge', 'earthshatter']) assert.ok(ENEMY_ABILITY_DEFS[id], `Missing enemy ability ${id}`);
assert.equal(ENEMY_DEFS.enemy_skeleton_archer.fixedLoadout?.weapon, 'weapon_bone_bow_npc', 'Bone Archer must visibly carry the verified shoot-pose bow layer');
assert.ok(LAYER_ASSETS.weapon_bone_bow_fg?.shoot === 'skeleton-bow-shoot', 'Bone Archer bow layer must map to the compact shoot sheet');
assert.ok(enemySource.includes('knockbackUntil') && enemySource.includes('knockbackVX') && enemySource.includes('knockbackVY'), 'Enemy knockback must persist across frames instead of being overwritten immediately by AI velocity');
assert.ok(ENEMY_DEFS.enemy_blight_imp.abilities?.includes('toxic_spit'), 'Blight Imp must use Toxic Spit');
assert.ok(ENEMY_DEFS.enemy_blueflame_imp.abilities?.includes('blueflame_bolt'), 'Blueflame Imp must use Blueflame Bolt');
assert.ok(ENEMY_DEFS.enemy_ashstone_golem.abilities?.includes('earthshatter'), 'Ashstone Golem must use Earthshatter');
for (const id of ['enemy_skeleton_spearman', 'enemy_skeleton_archer', 'enemy_skeleton_mage']) assert.ok(ENEMY_DEFS[id], `Missing specialized enemy ${id}`);
assert.equal(ENEMY_DEFS.enemy_skeleton_spearman.fixedLoadout?.weapon, 'weapon_bone_spear_npc', 'Bone Spearman must visibly carry the verified long-spear thrust layer');
assert.ok(LAYER_ASSETS.weapon_bone_spear_fg?.texture === 'skeleton-spear-thrust', 'Bone Spearman spear layer must map to the 192px thrust sheet');
assert.ok(ENEMY_DEFS.enemy_skeleton_spearman.abilities?.includes('bone_lunge'), 'Bone Spearman must use the telegraphed reach/thrust ability');
assert.equal(ENEMY_DEFS.enemy_skeleton_spearman.meleeAnimation, 'thrust', 'Bone Spearman basic melee must keep the spear/body in the thrust action instead of falling back to a sword slash');
assert.ok(enemySource.includes("this.def.meleeAnimation || 'slash'"), 'Layered enemies must support data-driven basic melee animation selection');
assert.ok(ENEMY_DEFS.enemy_skeleton_archer.abilities?.includes('bone_arrow'), 'Bone Archer must use the pooled arrow projectile ability');
assert.ok(ENEMY_DEFS.enemy_skeleton_mage.abilities?.includes('grave_hex'), 'Gravecaller must use the spellcast/slow projectile ability');
assert.ok(NPC_DEFS.npc_bone_hunter && NPC_DEFS.npc_road_seeker, 'Asset variety pass must add additional persistent adventurer NPC seeds');
assert.ok(NPC_GUILD_SEEDS.guild_emberbound?.name === 'Emberbound', 'Emberbound must exist as a future NPC-guild seed');
for (const enemy of Object.values(ENEMY_DEFS)) {
  for (const itemId of Object.values(enemy.fixedLoadout || {})) assert.ok(ITEM_DEFS[itemId], `${enemy.id} fixed loadout references unknown item ${itemId}`);
  for (const entries of Object.values(enemy.equipmentPool || {})) for (const entry of entries) if (entry.itemId) assert.ok(ITEM_DEFS[entry.itemId], `${enemy.id} equipment pool references unknown item ${entry.itemId}`);
  for (const preset of enemy.loadoutPresets || []) {
    assert.ok(Number(preset.weight) > 0 && preset.loadout, `${enemy.id} loadout preset must be weighted and complete`);
    for (const itemId of Object.values(preset.loadout || {})) assert.ok(ITEM_DEFS[itemId], `${enemy.id} loadout preset references unknown item ${itemId}`);
  }
}
for (const npc of Object.values(NPC_DEFS)) {
  assert.ok(typeof npc.npcType === 'string' && typeof npc.activityState === 'string' && Object.prototype.hasOwnProperty.call(npc, 'guildId'), `${npc.id} must expose persistent-adventurer/guild-ready metadata`);
  for (const itemId of Object.values(npc.loadout || {})) assert.ok(ITEM_DEFS[itemId], `${npc.id} loadout references unknown item ${itemId}`);
}
assert.ok(NPC_DEFS.npc_wanderer.recruitable && NPC_DEFS.npc_wanderer.baseVisual === 'npc_olive_base', 'Sable should seed the future recruitable adventurer system with the new humanoid base');
assert.equal(LAYER_ASSETS.player_red_base.geometry, 'revised64Expanded', 'Red-haired protagonist must use expanded LPC combat actions');
assert.ok(Object.keys(EQUIPMENT_SET_DEFS).length >= 3 && EQUIPMENT_SET_DEFS.set_legion_remnant?.name, 'Named equipment-set metadata must exist without activating bonuses yet');
assert.ok(SPAWN_REGIONS.some(spawn => spawn.enemyId === 'enemy_carrion_beast') && SPAWN_REGIONS.some(spawn => spawn.enemyId === 'enemy_bloodbone'), 'New enemy families must actually be spawned in the world');
for (const id of ['enemy_blight_imp', 'enemy_blueflame_imp', 'enemy_ash_goblin', 'enemy_cave_spider', 'enemy_ember_spider', 'enemy_frost_spider', 'enemy_ashstone_golem', 'enemy_skeleton_spearman', 'enemy_skeleton_archer', 'enemy_skeleton_mage']) assert.ok(SPAWN_REGIONS.some(spawn => spawn.enemyId === id), `${id} must appear in a real spawn region`);
for (const mapId of Object.keys(MAP_DEFS)) {
  const population = SPAWN_REGIONS.filter(spawn => (spawn.mapId || DEFAULT_MAP_ID) === mapId).reduce((sum, spawn) => sum + spawn.count, 0);
  assert.ok(population <= 35, `${mapId} population must remain mobile-conscious`);
}
for (const spawn of SPAWN_REGIONS) {
  const area = AREA_DEFS.find(entry => entry.id === spawn.areaId);
  assert.ok(area, `${spawn.id} must reference a valid intended local area`);
  assert.equal(area.mapId, spawn.mapId || DEFAULT_MAP_ID, `${spawn.id} area/map metadata must agree`);
}
for (const spawn of SPAWN_REGIONS) {
  assert.ok(spawn.encounterId && ENCOUNTER_DEFS[spawn.encounterId], `${spawn.id} must reference a live encounter definition`);
  assert.equal(ENCOUNTER_DEFS[spawn.encounterId].areaId, spawn.areaId, `${spawn.id} encounter must belong to its local area`);
  assert.ok(ENCOUNTER_GROUP_ARCHETYPES[spawn.archetype], `${spawn.id} must use a known encounter archetype`);
  assert.ok(Number(spawn.activationRange) >= 480, `${spawn.id} must expose a bounded activation range`);
}
for (const id of ['enemy_ash_scavenger', 'enemy_ironbound_raider', 'enemy_ash_assassin', 'enemy_demon_scout']) assert.ok(ENEMY_DEFS[id], `Living Wilds must include ${id}`);
assert.ok(ENEMY_DEFS.enemy_ash_scavenger.layered && ENEMY_DEFS.enemy_ironbound_raider.layered, 'Human hostile groups must use layered LPC equipment');
assert.ok(SPAWN_REGIONS.some(spawn => spawn.enemyId === 'enemy_ash_assassin'), 'The staged Assassin source must now power a compact live rare encounter');
assert.ok(SPAWN_REGIONS.some(spawn => spawn.enemyId === 'enemy_demon_scout'), 'DemonBase source must now seed a live Demon Legion patrol');
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
  assert.ok(assetDefsForItem(itemId).length >= 8, `${itemId} must resolve core combo plus expanded action runtime art`);
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

assert.equal(defaultState.inventory.find(item => item.itemId === 'consumable_ashblood_minor')?.quantity, 3, 'Fresh characters should start with three health flasks in one stack');
assert.equal(defaultState.inventory.find(item => item.itemId === 'consumable_essence_minor')?.quantity, 2, 'Fresh characters should start with two Essence flasks in one stack');
assert.equal(defaultState.inventory.find(item => item.itemId === 'consumable_cinder_ration')?.quantity, 2, 'Fresh characters should start with two field rations in one stack');
for (const itemId of ['consumable_ashblood_minor', 'consumable_essence_minor', 'consumable_cinder_ration']) {
  assert.ok(ITEM_DEFS[itemId].consumableEffect && ITEM_DEFS[itemId].stackMax === 20, `${itemId} must use the reusable stackable consumable path`);
  assert.ok(CONSUMABLE_EFFECT_DEFS[ITEM_DEFS[itemId].consumableEffect], `${itemId} references an unknown recovery effect`);
}
assert.equal(QUICK_CONSUMABLE_SLOTS.length, 2, 'The first recovery HUD should stay compact at two flask shortcuts');
assert.equal(MERCHANT_SUPPLY_DEFS.length, 3, 'Ilyan should carry the three foundation recovery supplies');
assert.ok(RECOVERY_DROP_TABLE.some(entry => entry.itemId === 'consumable_ashblood_minor'), 'Enemy recovery table must include health flasks');
assert.ok(RECOVERY_POINTS.some(point => point.id === 'recovery_ashen_rest' && point.mapId === DEFAULT_MAP_ID), 'Cinder Refuge must contain a reusable sanctuary recovery point');

assert.deepEqual(defaultState.skills, { unlocked: ['skill_ember_cleave'], slots: ['skill_ember_cleave', null, null], ranks: { skill_ember_cleave: 1 } }, 'Fresh Level-1 state must start with Ember Cleave equipped at Rank 1');
const levelFiveSkillState = createDefaultState();
levelFiveSkillState.player.level = 5;
normalizeSkillState(levelFiveSkillState);
assert.deepEqual(levelFiveSkillState.skills.unlocked, ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'], 'Level 5 normalization must unlock all three foundation skills');
assert.deepEqual(levelFiveSkillState.skills.slots, ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'], 'Unlocked foundation skills should fill open slots deterministically');
assert.deepEqual(levelFiveSkillState.skills.ranks, { skill_ember_cleave: 1, skill_ashen_guard: 1, skill_ruin_pulse: 1 }, 'Unlocked skills must normalize persistent Rank-1 defaults');
levelFiveSkillState.skills.ranks.skill_ember_cleave = 3;
const rankThreeCleave = resolvedSkillDef(levelFiveSkillState, 'skill_ember_cleave');
assert.ok(rankThreeCleave.damageMultiplier > SKILL_DEFS.skill_ember_cleave.damageMultiplier && rankThreeCleave.range > SKILL_DEFS.skill_ember_cleave.range, 'Stored skill ranks must already resolve through data-driven future scaling hooks');

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
  'starter-wraps-backslash': [832, 256], 'starter-wraps-halfslash': [384, 256],
  'protagonist-red-spellcast': [448, 256], 'protagonist-red-thrust': [512, 256], 'protagonist-red-shoot': [832, 256], 'protagonist-red-hurt': [384, 64],
  'legion-chest-spellcast': [448, 256], 'legion-chest-thrust': [512, 256], 'legion-chest-shoot': [832, 256], 'legion-chest-hurt': [384, 64],
  'starter-trousers-spellcast': [448, 256], 'starter-trousers-thrust': [512, 256], 'starter-trousers-shoot': [832, 256], 'starter-trousers-hurt': [384, 64],
  'starter-wraps-spellcast': [448, 256], 'starter-wraps-thrust': [512, 256], 'starter-wraps-shoot': [832, 256], 'starter-wraps-hurt': [384, 64],
  'leather-boots-spellcast': [448, 256], 'leather-boots-thrust': [512, 256], 'leather-boots-shoot': [832, 256], 'leather-boots-hurt': [384, 64],
  'skeleton-spellcast': [448, 256], 'skeleton-thrust': [512, 256], 'skeleton-shoot': [832, 256], 'skeleton-hurt': [384, 64],
  'slate-skeleton-spellcast': [448, 256], 'slate-skeleton-thrust': [512, 256], 'slate-skeleton-shoot': [832, 256], 'slate-skeleton-hurt': [384, 64],
  'skeleton-bow-shoot': [832, 256],
  'protagonist-red-run': [512, 256], 'legion-chest-run': [512, 256], 'starter-trousers-run': [512, 256],
  'starter-wraps-run': [512, 256], 'leather-boots-run': [512, 256], 'skeleton-spear-thrust': [1536, 768]
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
  'demon-castle/DemonBase.png', 'demon-castle/RedDemon.png', 'demon-castle/TanDemon.png', 'demon-castle/DemonLordFlesh.png', 'demon-castle/DemonMythical.png', 'demon-castle/AncientDemonLord.png',
  'heavenly-and-unique/Truetrans.png', 'heavenly-and-unique/TransupOrHolyKnight.png', 'heavenly-and-unique/HoodedAzrael.png', 'heavenly-and-unique/BaseAngel.png', 'heavenly-and-unique/HeavenlyKnight.png', 'heavenly-and-unique/LailaniAngel.png', 'heavenly-and-unique/LexiAngel.png',
  'human-hostile/Assassin.png', 'README.md', 'SHA256SUMS.txt'
]) await access(path.join(conceptRoot, file));
for (const file of await recursiveNames(conceptRoot)) {
  if (!file.toLowerCase().endsWith('.png')) continue;
  const size = await pngSize(file);
  const base = path.basename(file);
  const expected = ['LailaniAngel.png', 'LexiAngel.png'].includes(base) ? [1536, 4224] : [832, 3456];
  assert.deepEqual([size.width, size.height], expected, `${file} must preserve its full source-sheet geometry`);
}
assert.ok(!(await recursiveNames(path.join(dist, 'assets'))).some(file => ['Transformation.png', 'Truetrans.png', 'HoodedAzrael.png', 'LailaniAngel.png', 'LexiAngel.png', 'DemonMythical.png', 'AncientDemonLord.png', 'Assassin.png'].some(name => file.includes(name))), 'Full concept sheets, including staged mythical/unique sources, must not ship in runtime dist/assets before compact runtime harvesting');
for (const file of ['WEAPON_long_spear.png', 'README.md', 'lpc_entry_README.txt', 'SHA256SUMS.txt']) await access(path.join(root, 'source-assets/combat-v0131/classic-spear', file));
const refugeAssetKeys = new Set(assetDefsForMap(createDefaultState(), DEFAULT_MAP_ID).map(asset => asset.key));
const wildAssetKeys = new Set(assetDefsForMap(createDefaultState(), 'map_cinder_wilds').map(asset => asset.key));
const hollowAssetKeys = new Set(assetDefsForMap(createDefaultState(), 'map_ashfall_hollow').map(asset => asset.key));
for (const key of ['adobe-workshop', 'adobe-house-west', 'prop-smith-forge', 'prop-smith-tools', 'prop-smith-racks', 'prop-wood-bench', 'prop-wood-toolboard', 'prop-tailor-loom', 'prop-tailor-display']) assert.ok(refugeAssetKeys.has(key), `Refuge asset package must include curated settlement art ${key}`);
assert.ok(!refugeAssetKeys.has('cave3-set'), 'Dedicated Refuge must not preload cave-only art');
assert.ok(wildAssetKeys.has('cave3-set') && wildAssetKeys.has('castle2-set') && wildAssetKeys.has('adobe-house-west'), 'Wilds package should reuse broad terrain/structure assets for ruins and landmarks');
assert.ok(hollowAssetKeys.has('cave3-set') && !hollowAssetKeys.has('adobe-workshop'), 'Hollow map package must load cave art without town buildings');
assert.ok(hollowAssetKeys.size < refugeAssetKeys.size && hollowAssetKeys.size < wildAssetKeys.size, 'Secondary cavern map should remain the smallest texture package');
for (const [layerKey, layer] of Object.entries(LAYER_ASSETS)) {
  const geometry = ANIMATION_GEOMETRIES[layer.geometry];
  assert.ok(geometry, `Layer ${layerKey} references unknown geometry ${layer.geometry}`);
  for (const [action, animation] of Object.entries(geometry)) {
    const textureKey = layer[animation.source];
    if (!textureKey && layer.specialOnly) continue;
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

for (const geometryId of ['revised64Expanded', 'classicExpanded']) {
  const geometry = ANIMATION_GEOMETRIES[geometryId];
  for (const action of ['spellcast', 'thrust', 'shoot', 'hurt']) assert.ok(geometry[action], `${geometryId} must expose ${action}`);
  assert.deepEqual(geometry.hurt.rows, [0, 0, 0, 0], `${geometryId} hurt crop is direction-neutral and must safely resolve every facing`);
}
assert.ok(ANIMATION_GEOMETRIES.revised64Expanded.run && ANIMATION_GEOMETRIES.revised64Expanded.run.sequence.length === 8, 'Revised player geometry must expose a true eight-frame run cycle');
assert.equal(ANIMATION_GEOMETRIES.classicSpear192?.thrust?.sequence?.length, 8, 'Classic spear geometry must expose the full eight-frame thrust');
for (const layerKey of ['player_red_base', 'chest_starter_revised', 'legs_starter_revised', 'hands_starter_revised', 'feet_starter_revised', 'enemy_skeleton_base', 'enemy_slate_skeleton_base']) {
  const layer = LAYER_ASSETS[layerKey];
  const geometry = ANIMATION_GEOMETRIES[layer.geometry];
  for (const action of ['spellcast', 'thrust', 'shoot', 'hurt']) {
    const animation = geometry[action];
    const textureKey = layer[animation.source];
    assert.ok(textureKey, `${layerKey} must supply a real ${action} crop`);
    for (let direction = 0; direction < 4; direction += 1) {
      const row = animation.rows[direction];
      let populated = 0;
      for (const frame of animation.sequence) populated += Number(await frameHasAlpha(textureKey, row, frame));
      assert.ok(populated >= 1, `${layerKey}/${action} direction ${direction} must contain real visible artwork`);
    }
  }
}

for (const layerKey of ['player_red_base', 'chest_starter_revised', 'legs_starter_revised', 'hands_starter_revised', 'feet_starter_revised']) {
  const layer = LAYER_ASSETS[layerKey];
  const animation = ANIMATION_GEOMETRIES[layer.geometry].run;
  const textureKey = layer[animation.source];
  assert.ok(textureKey, `${layerKey} must supply true run art`);
  for (let direction = 0; direction < 4; direction += 1) {
    let populated = 0;
    for (const frame of animation.sequence) populated += Number(await frameHasAlpha(textureKey, animation.rows[direction], frame));
    assert.ok(populated >= 1, `${layerKey}/run direction ${direction} must contain visible run artwork`);
  }
}
assert.ok(playerSource.includes("supportsAction('run')") && layeredSource.includes('supportsAction(requestedAction)'), 'Player true run must activate only when visible non-held layers support run, with safe fallback for incompatible gear');
assert.ok(assetResolverSource.includes("'run'"), 'Map packages must include true-run textures after a cold load/transition');

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
assert.equal(valid.saveVersion, SAVE_VERSION);
assert.equal(SAVE_VERSION, 2, 'Combat line must retain persistent skill state on save schema 2');
assert.equal(valid.gameVersion, GAME_VERSION);
assert.equal(valid.player.level, 1);
assert.equal(valid.inventory.find(item => item.itemId === 'consumable_ashblood_minor')?.quantity, 3, 'Current saves must preserve consumable stack quantities');
const legacyQuantitySave = createDefaultState();
for (const item of legacyQuantitySave.inventory) delete item.quantity;
const normalizedLegacyQuantities = saveManager.validate(legacyQuantitySave);
assert.ok(normalizedLegacyQuantities.inventory.every(item => item.quantity === 1), 'Pre-stack inventory instances must normalize safely to quantity 1');
const timestampedSave = createDefaultState();
timestampedSave.saveVersion = 1;
delete timestampedSave.skills;
timestampedSave.savedAt = 1788775200000;
timestampedSave.gameVersion = '0.1.2.4.3';
const normalizedTimestampedSave = saveManager.validate(timestampedSave);
assert.equal(normalizedTimestampedSave.savedAt, 1788775200000, 'Load-menu save metadata must preserve the stored save timestamp');
assert.equal(normalizedTimestampedSave.saveVersion, SAVE_VERSION, 'Schema-1 saves must migrate to schema 2 in memory');
assert.equal(normalizedTimestampedSave.gameVersion, '0.1.2.4.3', 'Validation must preserve an older slot build marker until the migrated save is next written');

const legacyCombatSave = createDefaultState();
legacyCombatSave.saveVersion = 1;
legacyCombatSave.gameVersion = '0.1.2.4.3';
legacyCombatSave.player.level = 5;
delete legacyCombatSave.skills;
const migratedCombatSave = saveManager.validate(legacyCombatSave);
assert.equal(migratedCombatSave.saveVersion, SAVE_VERSION, 'Legacy schema-1 state must normalize to schema 2');
assert.deepEqual(migratedCombatSave.skills.unlocked, ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'], 'Legacy Level-5 saves must gain the skills earned by their existing level');
assert.deepEqual(migratedCombatSave.skills.slots, ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'], 'Legacy skill migration must produce a playable three-slot loadout');
assert.deepEqual(migratedCombatSave.skills.ranks, { skill_ember_cleave: 1, skill_ashen_guard: 1, skill_ruin_pulse: 1 }, 'Legacy schema-1 skill migration must establish Rank-1 defaults');
const v013SaveWithoutRanks = createDefaultState();
v013SaveWithoutRanks.gameVersion = '0.1.3';
v013SaveWithoutRanks.player.level = 5;
v013SaveWithoutRanks.skills = { unlocked: ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'], slots: ['skill_ember_cleave', 'skill_ashen_guard', 'skill_ruin_pulse'] };
const normalizedV013Save = saveManager.validate(v013SaveWithoutRanks);
assert.deepEqual(normalizedV013Save.skills.ranks, { skill_ember_cleave: 1, skill_ashen_guard: 1, skill_ruin_pulse: 1 }, 'Existing schema-2 v0.1.3 saves without rank metadata must normalize safely to Rank 1');
assert.equal(valid.player.mapId, DEFAULT_MAP_ID);
const caveSave = createDefaultState();
caveSave.player.mapId = 'map_ashfall_hollow';
caveSave.player.entryPointId = 'from_cinder';
caveSave.player.x = 512; caveSave.player.y = 620;
const normalizedCaveSave = saveManager.validate(caveSave);
assert.equal(normalizedCaveSave.player.mapId, 'map_ashfall_hollow');
assert.equal(normalizedCaveSave.player.x, 512);
const legacyMaplessSave = createDefaultState();
legacyMaplessSave.saveVersion = 1;
delete legacyMaplessSave.skills;
delete legacyMaplessSave.player.mapId; delete legacyMaplessSave.player.entryPointId;
assert.equal(saveManager.validate(legacyMaplessSave).player.mapId, DEFAULT_MAP_ID, 'Schema-1 mapless saves must migrate safely to Cinder Refuge');
const legacyMonolithSave = createDefaultState();
legacyMonolithSave.gameVersion = '0.1.4.0';
legacyMonolithSave.player.mapId = 'map_cinder_region';
legacyMonolithSave.player.entryPointId = 'cinder_start';
legacyMonolithSave.player.x = 1190; legacyMonolithSave.player.y = 590;
const migratedMonolith = saveManager.validate(legacyMonolithSave);
assert.equal(migratedMonolith.player.mapId, 'map_cinder_wilds', 'Old monolithic Cinder saves outside town must migrate into the Wilds');
assert.equal(migratedMonolith.player.entryPointId, 'first_light_test', 'An old First-Light field-test position should migrate near the expanded First-Light Scar');
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

// v0.1.3.2 stackable recovery inventory: add merges stacks, countItem sums
// quantities, and consuming one never destroys the whole stack.
const stackState = createDefaultState();
const stackInventory = new InventorySystem(stackState);
const healthStack = stackState.inventory.find(item => item.itemId === 'consumable_ashblood_minor');
assert.equal(stackInventory.countItem('consumable_ashblood_minor'), 3);
assert.equal(stackInventory.add(stackInventory.createItem('consumable_ashblood_minor', 'normal', 4)), true);
assert.equal(stackInventory.countItem('consumable_ashblood_minor'), 7);
assert.equal(stackState.inventory.filter(item => item.itemId === 'consumable_ashblood_minor').length, 1, 'Compatible consumables should merge before consuming another pack slot');
assert.equal(stackInventory.consumeOne(healthStack.instanceId), true);
assert.equal(stackInventory.countItem('consumable_ashblood_minor'), 6);

// A full 30-slot pack may still merge into an existing partial stack, but a
// purchase/drop that would require a 31st slot must fail atomically.
const fullStackState = createDefaultState();
const fullStackInventory = new InventorySystem(fullStackState);
const fullHealth = fullStackState.inventory.find(item => item.itemId === 'consumable_ashblood_minor');
fullHealth.quantity = 19;
while (fullStackState.inventory.length < 30) {
  const id = `i_fill_${String(fullStackState.inventory.length).padStart(2, '0')}`;
  fullStackState.inventory.push({ instanceId: id, itemId: 'weapon_rustblade', rarity: 'normal', enhancement: 0, modifiers: {}, quantity: 1 });
}
assert.equal(fullStackInventory.add(fullStackInventory.createItem('consumable_ashblood_minor', 'normal', 1)), true, 'A full pack must allow filling an existing partial stack');
assert.equal(fullHealth.quantity, 20);
fullHealth.quantity = 19;
assert.equal(fullStackInventory.add(fullStackInventory.createItem('consumable_ashblood_minor', 'normal', 2)), false, 'A full pack must reject a recovery pickup requiring a new stack');
assert.equal(fullHealth.quantity, 19, 'Failed stacked adds must not partially mutate an existing stack');

// Recovery behavior smoke without a browser renderer.
const recoveryState = createDefaultState();
const recoveryInventory = new InventorySystem(recoveryState);
const derivedRecovery = statBreakdown(recoveryState).totalDerived;
recoveryState.player.hp = 20;
recoveryState.player.essence = 5;
const recoveryEvents = { emitted: [], emit(type, data) { this.emitted.push([type, data]); } };
const recoveryScene = {
  time: { now: 10000 },
  enemies: [],
  combat: { fx: { burst() {}, ring() {} }, audio: { play() {} }, statuses: { clear() {} } },
  emitState() {}, safeSave() {}
};
const recoveryPlayer = { dead: false, body: { x: 100, y: 100 } };
const recovery = new RecoverySystem(recoveryScene, recoveryState, recoveryInventory, recoveryPlayer, recoveryEvents);
assert.equal(recovery.useQuick('health'), true, 'Health quick slot should consume a flask when injured');
assert.equal(recoveryState.player.hp, Math.min(derivedRecovery.maxHp, 55));
assert.equal(recoveryInventory.countItem('consumable_ashblood_minor'), 2);
assert.equal(recovery.useQuick('essence'), false, 'Health and Essence flasks must share one cooldown group');
recoveryScene.time.now += 4001;
assert.equal(recovery.useQuick('essence'), true, 'Essence flask should work after the shared cooldown expires');
assert.equal(recoveryState.player.essence, Math.min(derivedRecovery.maxEssence, 33));

// Scene.restart() must not create an instant potion/meal cooldown exploit. A
// newly constructed RecoverySystem for the same in-memory state inherits the
// transient session clock, while JSON saves remain clean.
recoveryState.player.hp = 20;
recoveryScene.time.now += 4001;
assert.equal(recovery.useQuick('health'), true);
const restartedRecovery = new RecoverySystem(recoveryScene, recoveryState, recoveryInventory, recoveryPlayer, recoveryEvents);
assert.ok(restartedRecovery.cooldownRemaining('flask') > 0, 'Recovery cooldown must survive WorldScene restart/map handoff');
assert.ok(!JSON.stringify(recoveryState).includes('__recoveryRuntime'), 'Transient recovery timing must not be persisted in save JSON');
recoveryScene.time.now += 4001;
recovery.rest({ name: 'Ashen Rest Hearth' });
assert.equal(recoveryState.player.hp, derivedRecovery.maxHp, 'Sanctuary rest must fully restore HP');
assert.equal(recoveryState.player.essence, derivedRecovery.maxEssence, 'Sanctuary rest must fully restore Essence');

// Food is out-of-combat recovery: nearby hostiles block starting it and any
// later combat event interrupts an active meal without consuming another item.
recoveryState.player.hp = 30;
recoveryScene.time.now += 5000;
recoveryScene.enemies = [{ dead: false, sprite: { active: true, x: 120, y: 100 } }];
const ration = recoveryState.inventory.find(item => item.itemId === 'consumable_cinder_ration');
const rationBefore = ration.quantity;
assert.equal(recovery.useInstance(ration.instanceId), false, 'A ration must not start while a hostile is nearby');
assert.equal(ration.quantity, rationBefore, 'Blocked ration use must not consume the stack');
recoveryScene.enemies = [];
assert.equal(recovery.useInstance(ration.instanceId), true, 'A ration should start after combat pressure is gone');
assert.ok(recovery.session.activeFood, 'Ration use must create a timed recovery state');
recovery.markCombat();
assert.equal(recovery.session.activeFood, null, 'Taking or dealing damage must interrupt meal recovery');

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
assert.ok(saveSource.includes('normalizeSkillState(state)') && saveSource.includes('state.saveVersion = SAVE_VERSION'), 'SaveManager must migrate skill state and write schema 2 without changing the legacy storage key');

const wrongSlotSave = createDefaultState();
wrongSlotSave.equipment.head = 'i_000001'; // Arming Sword cannot occupy Head.
const normalizedWrongSlot = saveManager.validate(wrongSlotSave);
assert.equal(normalizedWrongSlot.equipment.head, null, 'Wrong-slot saved equipment must be discarded');
assert.equal(normalizedWrongSlot.equipment.weapon, 'i_000001', 'Valid weapon reference must survive normalization');

console.log(`Validated ${ASSET_DEFS.length} assets, ${Object.keys(ITEM_DEFS).length} items, ${Object.keys(ENEMY_DEFS).length} enemies, ${Object.keys(NPC_DEFS).length} NPCs, ${BUILDING_DEFS.length} refuge buildings, ${COLLIDERS.length} visible-source colliders, ${Object.keys(QUEST_DEFS).length} quests, ${Object.keys(SKILL_DEFS).length} player skills, ${Object.keys(ENEMY_ABILITY_DEFS).length} enemy abilities, v0.1.4.4.5.4.3 Mythic Level Recalibration, preserved Eternal Warfront, eight streamed maps, ten POIs, six world-event seeds, reusable nested return anchors, debug-only First-Light stress warband, bounded faction assist, target-loss recovery, pursuit leashes, preserved common celestial troops and faction-safe shared combat, preserved Demon Combat Foundation and Refuge geometry/building integrity, Living Wilds ecology, grouped aggro, authored patrols, proximity ambushes, layered hostile humans, four-role Demon Legion patrol, bounded offscreen simulation, preserved v0.1.4.1 region scale/refuge rebuild, inherited Sanctuary of the First Light, seven-skill paced Azrael AI, faction combat, knockback/shake, contribution-gated rewards, recovery/consumables, stable map streaming, and save schema ${SAVE_VERSION}.`);
