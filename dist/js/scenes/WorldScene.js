import { ENEMY_DEFS } from '../data/enemies.js';
import { ITEM_DEFS } from '../data/items.js';
import { NPC_DEFS } from '../data/npcs.js';
import { BUILDING_DEFS, COLLIDERS, DEFAULT_MAP_ID, HOLLOW_COLLIDERS, HOLLOW_WALLS, MAP_TRANSITIONS, PROP_DEFS, REFUGE_WALLS, SPAWN_REGIONS, TOWN_PROP_DEFS, ZONES, mapForId } from '../data/world.js';
import { DEBUG, GAME_VERSION, PLAYER_START, RARITY, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from '../config.js';
import { gameEvents } from '../core/EventBus.js';
import { actionInput } from '../systems/ActionInput.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { InventorySystem, pickRarity } from '../systems/InventorySystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { assetDefsForMap, ensureItemVisualAssets, queueAssetDefs, releaseAssetsNotNeededForMap } from '../systems/AssetResolver.js';
import { derivedStats, grantXp } from '../systems/StatsSystem.js';
import { Enemy } from '../entities/Enemy.js';
import { NPC } from '../entities/NPC.js';
import { Player } from '../entities/Player.js';

export class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }

  preload() {
    this.state = this.registry.get('state');
    this.currentMap = mapForId(this.state?.player?.mapId);
    queueAssetDefs(this, assetDefsForMap(this.state, this.currentMap.id));
    this.load.on('progress', value => gameEvents.emit('loading', { value }));
  }

  create() {
    this.state = this.registry.get('state');
    this.saveManager = this.registry.get('saveManager');
    this.currentMap = mapForId(this.state.player.mapId);
    this.state.player.mapId = this.currentMap.id;
    this.makeRuntimeTextures();
    this.physics.world.setBounds(0, 0, this.currentMap.width, this.currentMap.height);
    this.cameras.main.setBounds(0, 0, this.currentMap.width, this.currentMap.height).setRoundPixels(true).setZoom(1);
    this.buildWorld();
    this.createTransitionMarkers();

    this.inventory = new InventorySystem(this.state);
    this.questSystem = new QuestSystem(this.state, this.inventory, (rewards, name) => this.grantRewards(rewards, name));
    this.dialogueSystem = new DialogueSystem(this.state, this.inventory);
    actionInput.bind(this);
    this.player = new Player(this, this.state, actionInput, attack => this.combat.playerAttack(attack));
    this.physics.add.collider(this.player.body, this.obstacles);
    // Enemy contact is handled by combat range, not Arcade body separation.
    // Dynamic enemy colliders could physically shove the player after input
    // stopped, which felt like intermittent reverse sliding on mobile.
    this.cameras.main.startFollow(this.player.body, true, 1, 1);

    this.createEnemies();
    this.createNPCs();
    if (DEBUG) this.dynamicCollisionDebug = this.add.graphics().setDepth(15001);
    this.combat = new CombatSystem(this, this.state, this.player, this.enemies, gameEvents);
    this.createLootPool();
    this.currentZone = null;
    this.lastHudUpdate = 0;
    this.lastSave = 0;
    this.deathAnnounced = false;
    this.killRewardBatch = { kills: 0, xp: 0, coins: 0, noble: false };
    this.killRewardTimer = null;

    this.offUiCommand = gameEvents.on('command', command => this.handleCommand(command));
    this.onPageHide = () => this.safeSave();
    this.onVisibilityChange = () => { if (document.hidden) this.safeSave(); };
    window.addEventListener('pagehide', this.onPageHide, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.offUiCommand?.();
      actionInput.resetTouchMovement();
      actionInput.unbind();
      window.removeEventListener('pagehide', this.onPageHide);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    });
    this.updateZone();
    this.emitState();
    this.cameras.main.fadeIn(150, 12, 6, 4);
    gameEvents.emit('ready', { version: GAME_VERSION });
    if (!this.state.worldFlags.introToastShown && this.currentMap.id === DEFAULT_MAP_ID) {
      this.state.worldFlags.introToastShown = true;
      gameEvents.emit('toast', { text: 'Find Warden Vesra at Warden Hall in Cinder Refuge.', tone: 'quest' });
    } else if (this.currentMap.id !== DEFAULT_MAP_ID) {
      gameEvents.emit('toast', { text: `Entered ${this.currentMap.name}.`, tone: 'muted', short: true });
    }
  }

  makeRuntimeTextures() {
    // Generated helper textures live in Phaser's global TextureManager, so a
    // map-driven Scene restart can encounter keys created by the previous map.
    // Reuse them rather than trying to generate duplicate texture keys.
    if (!this.textures.exists('solid')) {
      const pixel = this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 2, 2);
      pixel.generateTexture('solid', 2, 2).destroy();
    }
    if (!this.textures.exists('hit-spark')) {
      const spark = this.add.graphics().fillStyle(0xffdc7a, 0.9).fillCircle(10, 10, 4).lineStyle(2, 0xff6b35, 0.9).strokeCircle(10, 10, 8);
      spark.generateTexture('hit-spark', 20, 20).destroy();
    }
    for (const [key, color] of [['loot-normal', 0xded7c7], ['loot-magic', 0x65a7ff], ['loot-noble', 0xd98cff], ['loot-quest', 0xff6b35]]) {
      if (this.textures.exists(key)) continue;
      const graphic = this.add.graphics().fillStyle(color, 0.22).fillCircle(10, 10, 10).fillStyle(color, 1).fillRect(7, 7, 6, 6).lineStyle(1, 0x1b0c09, 1).strokeRect(7, 7, 6, 6);
      graphic.generateTexture(key, 20, 20).destroy();
    }
  }

  buildWorld() {
    if (this.currentMap.renderer === 'ashfall_hollow') return this.buildAshfallHollow();
    return this.buildCinderRegion();
  }

  buildCinderRegion() {
    const cols = WORLD_WIDTH / TILE_SIZE;
    const rows = WORLD_HEIGHT / TILE_SIZE;
    const data = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => (x * 7 + y * 11 + (x * y) % 5) % 6));
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tiles = map.addTilesetImage('dirt', 'terrain-dirt', 32, 32, 0, 0);
    this.groundLayer = map.createLayer(0, tiles, 0, 0).setDepth(-1000);

    const worldArt = this.add.graphics().setDepth(-700);
    worldArt.fillStyle(0x261713, 0.38).fillRect(0, 0, 720, WORLD_HEIGHT);
    worldArt.fillStyle(0x4c261c, 0.58).fillRect(1940, 0, 620, WORLD_HEIGHT);
    worldArt.fillStyle(0x160c0b, 0.86).fillRect(1930, 0, 18, WORLD_HEIGHT);

    // Cinder Refuge streets: broad readable paths connect the east gate to
    // every important structure without hard-coding movement logic.
    const roads = this.add.graphics().setDepth(-760);
    roads.lineStyle(48, 0x6f4a32, 0.48).lineBetween(690, 610, 340, 610);
    roads.lineStyle(34, 0x6f4a32, 0.42).lineBetween(340, 610, 250, 430);
    roads.lineStyle(34, 0x6f4a32, 0.42).lineBetween(340, 610, 525, 485);
    roads.lineStyle(34, 0x6f4a32, 0.42).lineBetween(340, 610, 180, 790);
    roads.lineStyle(34, 0x6f4a32, 0.42).lineBetween(340, 610, 505, 790);
    roads.lineStyle(28, 0x6f4a32, 0.38).lineBetween(340, 610, 340, 170);
    roads.fillStyle(0x76513a, 0.4).fillCircle(340, 610, 96);

    // Draw refuge walls from the exact same data used to build collision.
    // This prevents visible art and physics from drifting apart over time.
    worldArt.lineStyle(10, 0x493127, 0.95);
    for (const wall of REFUGE_WALLS) worldArt.lineBetween(wall.x1, wall.y1, wall.x2, wall.y2);

    for (let i = 0; i < 95; i += 1) {
      const x = 720 + ((i * 193) % 1810);
      const y = 50 + ((i * 107) % 1160);
      const frame = [0, 3, 6, 9, 12, 15, 18][i % 7];
      this.add.sprite(x, y, 'grass-dirt', frame).setAlpha(0.34).setDepth(-850).setScale(1 + (i % 3) * 0.35);
    }

    for (const building of BUILDING_DEFS) {
      const image = this.add.image(building.x, building.y, building.texture)
        .setOrigin(0.5, 0.82)
        .setScale(building.scale || 1)
        .setFlipX(Boolean(building.flipX))
        .setDepth(building.y + (building.depthOffset || -20));
      image.buildingId = building.id;
      if (['refuge_forge', 'refuge_warden_hall', 'refuge_inn', 'refuge_storehouse'].includes(building.id)) {
        this.add.text(building.x, building.y + 18, building.name, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#e7c58f', stroke: '#170c0a', strokeThickness: 3
        }).setOrigin(0.5).setDepth(building.y + 120);
      }
    }

    for (const prop of PROP_DEFS) this.add.sprite(prop.x, prop.y, prop.texture, prop.frame).setScale(prop.scale || 1).setDepth(prop.y - 2).setAlpha(prop.x < 720 ? 0.9 : 1);
    for (const prop of TOWN_PROP_DEFS) this.add.sprite(prop.x, prop.y, prop.texture, prop.frame).setScale(prop.scale || 1).setDepth(prop.y + 2);
    this.add.image(710, 610, 'bridge').setScale(0.64).setDepth(600).setAlpha(0.9);

    this.add.text(350, 72, 'CINDER REFUGE', { fontFamily: 'Georgia, serif', fontSize: '21px', color: '#f3c77b', stroke: '#170c0a', strokeThickness: 5, letterSpacing: 3 }).setOrigin(0.5).setDepth(1000);
    this.add.text(1270, 105, 'SCORCHED OUTSKIRTS', { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#d89a62', stroke: '#170c0a', strokeThickness: 5, letterSpacing: 2 }).setOrigin(0.5).setDepth(1000);
    this.add.text(2200, 330, 'BONE ROAD', { fontFamily: 'Georgia, serif', fontSize: '20px', color: '#d4c1ad', stroke: '#170c0a', strokeThickness: 5, letterSpacing: 4 }).setOrigin(0.5).setDepth(1000);

    this.obstacles = this.physics.add.staticGroup();
    for (const collider of COLLIDERS) {
      const body = this.obstacles.create(collider.x, collider.y, 'solid').setDisplaySize(collider.width, collider.height).setAlpha(0.001).refreshBody();
      body.colliderId = collider.id;
      body.colliderSource = collider.source;
    }
    if (DEBUG) {
      // Static blockers are green. Phaser's all-body debug renderer stays off so
      // diagnostics show only collision surfaces that matter to traversal.
      const collisionDebug = this.add.graphics().setDepth(15000).lineStyle(2, 0x38ff76, 0.82);
      for (const collider of COLLIDERS) collisionDebug.strokeRect(collider.x - collider.width / 2, collider.y - collider.height / 2, collider.width, collider.height);
    }
    this.enemyGroup = this.physics.add.group({ allowGravity: false, immovable: false });
  }

  buildAshfallHollow() {
    const cols = this.currentMap.width / TILE_SIZE;
    const rows = this.currentMap.height / TILE_SIZE;
    const data = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 192));
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tiles = map.addTilesetImage('ashfall-hollow', 'cave3-set', 32, 32, 0, 0);
    this.groundLayer = map.createLayer(0, tiles, 0, 0).setDepth(-1000);

    const shade = this.add.graphics().setDepth(-900);
    shade.fillStyle(0x090605, 0.28).fillRect(0, 0, this.currentMap.width, this.currentMap.height);
    shade.fillStyle(0x321c0f, 0.30).fillEllipse(300, 300, 430, 270);
    shade.fillStyle(0x1c100b, 0.34).fillEllipse(720, 340, 360, 300);

    // The collision border is drawn from the exact same wall records used by
    // Arcade bodies. The south gap is a visible exit, never an invisible wall.
    const wallArt = this.add.graphics().setDepth(-650).lineStyle(24, 0x6c4825, 0.98);
    for (const wall of HOLLOW_WALLS) wallArt.lineBetween(wall.x1, wall.y1, wall.x2, wall.y2);
    wallArt.lineStyle(5, 0xa06d36, 0.8);
    for (const wall of HOLLOW_WALLS) wallArt.lineBetween(wall.x1, wall.y1, wall.x2, wall.y2);

    const caveProps = [
      [122, 184, 182, 1.25], [147, 294, 128, 1.15], [148, 774, 172, 1.2],
      [123, 830, 520, 1.1], [150, 220, 560, 1.15], [124, 705, 585, 1.25],
      [291, 450, 285, 1.05], [292, 578, 280, 1.05]
    ];
    for (const [frame, x, y, scale] of caveProps) this.add.sprite(x, y, 'cave3-set', frame).setScale(scale).setDepth(y - 10).setAlpha(0.9);

    this.add.text(this.currentMap.width / 2, 68, 'ASHFALL HOLLOW', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#d8ad72', stroke: '#120907', strokeThickness: 5, letterSpacing: 3
    }).setOrigin(0.5).setDepth(1000);
    this.add.text(this.currentMap.width / 2, 94, 'A separate cavern map', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#9f866c', stroke: '#120907', strokeThickness: 3
    }).setOrigin(0.5).setDepth(1000);

    this.obstacles = this.physics.add.staticGroup();
    for (const collider of HOLLOW_COLLIDERS) {
      const body = this.obstacles.create(collider.x, collider.y, 'solid').setDisplaySize(collider.width, collider.height).setAlpha(0.001).refreshBody();
      body.colliderId = collider.id;
      body.colliderSource = collider.source;
    }
    if (DEBUG) {
      const collisionDebug = this.add.graphics().setDepth(15000).lineStyle(2, 0x38ff76, 0.82);
      for (const collider of HOLLOW_COLLIDERS) collisionDebug.strokeRect(collider.x - collider.width / 2, collider.y - collider.height / 2, collider.width, collider.height);
    }
    this.enemyGroup = this.physics.add.group({ allowGravity: false, immovable: false });
  }

  createTransitionMarkers() {
    this.mapTransitions = MAP_TRANSITIONS.filter(transition => transition.mapId === this.currentMap.id);
    for (const transition of this.mapTransitions) {
      const marker = this.add.graphics().setDepth(transition.y - 20);
      if (this.currentMap.id === DEFAULT_MAP_ID) {
        marker.fillStyle(0x090504, 0.94).fillEllipse(transition.x, transition.y + 7, 100, 56);
        marker.lineStyle(7, 0x654026, 0.95).strokeEllipse(transition.x, transition.y + 7, 108, 62);
        for (const offset of [-48, -24, 24, 48]) marker.fillStyle(0x7a5330, 0.92).fillCircle(transition.x + offset, transition.y - 13 + Math.abs(offset) * 0.12, 11);
      } else {
        marker.fillStyle(0x080504, 0.88).fillRect(transition.x - 62, transition.y - 12, 124, 34);
        marker.lineStyle(4, 0x7b522e, 0.95).strokeRect(transition.x - 62, transition.y - 12, 124, 34);
      }
      this.add.text(transition.x, transition.y - 54, transition.label, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#f0cc8c', align: 'center', stroke: '#130907', strokeThickness: 4
      }).setOrigin(0.5).setDepth(transition.y + 30);
      this.add.text(transition.x, transition.y - 36, 'Use', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#c8a67e', stroke: '#130907', strokeThickness: 3
      }).setOrigin(0.5).setDepth(transition.y + 30);
    }
  }

  transitionToMap(destinationMapId, destinationEntryId) {
    const destination = mapForId(destinationMapId);
    const entry = destination.entryPoints?.[destinationEntryId] || Object.values(destination.entryPoints || {})[0];
    if (!entry || this.transitioning) return;
    this.transitioning = true;
    actionInput.resetTouchMovement();
    this.player.body.setVelocity(0);
    this.state.player.mapId = destination.id;
    this.state.player.entryPointId = destinationEntryId;
    this.state.player.x = entry.x;
    this.state.player.y = entry.y;
    this.safeSave();
    this.cameras.main.fadeOut(170, 10, 4, 3);
    this.time.delayedCall(185, () => {
      releaseAssetsNotNeededForMap(this, this.state, destination.id);
      this.scene.restart();
    });
  }

  createEnemies() {
    this.enemies = [];
    const callbacks = {
      hitPlayer: (amount, x, y) => this.hitPlayer(amount, x, y),
      damageNumber: (x, y, amount, hostile) => this.combat?.damageNumbers.show(x, y, amount, hostile),
      died: enemy => this.onEnemyDied(enemy)
    };
    for (const spawn of SPAWN_REGIONS) {
      if ((spawn.mapId || DEFAULT_MAP_ID) !== this.currentMap.id) continue;
      const def = ENEMY_DEFS[spawn.enemyId];
      for (let i = 0; i < spawn.count; i += 1) this.enemies.push(new Enemy(this, this.enemyGroup, def, spawn, i, callbacks));
    }
  }

  createNPCs() {
    const zoneIds = new Set(this.currentMap.zoneIds || []);
    this.npcs = Object.values(NPC_DEFS).filter(def => zoneIds.has(def.homeZone)).map(def => new NPC(this, def));
  }

  createLootPool() {
    this.lootPool = Array.from({ length: 30 }, () => {
      const sprite = this.physics.add.sprite(0, 0, 'loot-normal').setActive(false).setVisible(false).setDepth(7000);
      sprite.body.enable = false;
      sprite.item = null;
      return sprite;
    });
    this.lootCursor = 0;
  }

  dropLoot(x, y, item) {
    const sprite = this.lootPool.find(drop => !drop.active) || this.lootPool[this.lootCursor++ % this.lootPool.length];
    const def = ITEM_DEFS[item.itemId];
    const texture = def.questItem ? 'loot-quest' : `loot-${item.rarity}`;
    sprite.setTexture(texture).setPosition(x + Phaser.Math.Between(-16, 16), y + Phaser.Math.Between(-12, 12)).setActive(true).setVisible(true).setAlpha(1);
    sprite.body.enable = true;
    sprite.item = item;
    this.tweens.killTweensOf(sprite);
    this.tweens.add({ targets: sprite, y: sprite.y - 6, yoyo: true, repeat: -1, duration: 520, ease: 'Sine.inOut' });
  }

  onEnemyDied(enemy) {
    const def = enemy.def;
    this.questSystem.recordKill(def);
    const xpResult = grantXp(this.state, def.xp);
    const coins = Phaser.Math.Between(def.currency[0], def.currency[1]);
    this.state.player.currency += coins;
    if (def.family === 'imp') this.state.worldFlags.impKillsSinceHeart = (this.state.worldFlags.impKillsSinceHeart || 0) + 1;
    for (const entry of def.loot) {
      const lootDef = ITEM_DEFS[entry.itemId];
      const playerLootEligible = lootDef?.questItem || !lootDef?.slot || (lootDef?.playerEquipReady !== false && !lootDef?.npcOnly && !(lootDef?.slot === 'weapon' && lootDef?.playerCombatReady === false));
      if (!playerLootEligible) continue;
      const pityHeart = entry.itemId === 'quest_ember_heart' && this.state.worldFlags.impKillsSinceHeart >= 6 && !this.inventory.countItem('quest_ember_heart');
      if (Math.random() <= entry.chance || pityHeart) {
        const item = this.inventory.createItem(entry.itemId, pickRarity(entry.rarityWeights));
        this.dropLoot(enemy.sprite.x, enemy.sprite.y, item);
        if (entry.itemId === 'quest_ember_heart') this.state.worldFlags.impKillsSinceHeart = 0;
      }
    }
    this.queueKillReward(def, coins);
    if (xpResult.levels) gameEvents.emit('toast', { text: `Level ${this.state.player.level}! +5 stat points, +1 skill point`, tone: 'level' });
    this.emitState();
    this.safeSave();
  }

  queueKillReward(def, coins) {
    this.killRewardBatch.kills += 1;
    this.killRewardBatch.xp += def.xp;
    this.killRewardBatch.coins += coins;
    this.killRewardBatch.noble ||= Boolean(def.named);
    this.killRewardTimer?.remove(false);
    this.killRewardTimer = this.time.delayedCall(320, () => {
      const batch = this.killRewardBatch;
      const prefix = batch.kills > 1 ? `${batch.kills} kills  •  ` : '';
      gameEvents.emit('toast', { text: `${prefix}+${batch.xp} XP  •  +${batch.coins} ash coin`, tone: batch.noble ? 'noble' : 'combat', short: true });
      this.killRewardBatch = { kills: 0, xp: 0, coins: 0, noble: false };
      this.killRewardTimer = null;
    });
  }

  hitPlayer(amount) {
    const damage = this.player.takeDamage(amount, this.time.now);
    if (!damage) return;
    this.combat.damageNumbers.show(this.player.body.x, this.player.body.y - 40, damage, true);
    gameEvents.emit('hit', { damage });
    if (this.player.dead && !this.deathAnnounced) {
      this.deathAnnounced = true;
      gameEvents.emit('death', { text: 'The ash takes you—but Cinder Refuge still calls.' });
    }
    this.emitState();
  }

  interact() {
    let nearestTransition = null;
    let nearestDistance = Infinity;
    for (const transition of this.mapTransitions || []) {
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, transition.x, transition.y);
      if (distance <= transition.radius && distance < nearestDistance) { nearestTransition = transition; nearestDistance = distance; }
    }
    if (nearestTransition) {
      this.transitionToMap(nearestTransition.destinationMapId, nearestTransition.destinationEntryId);
      return;
    }

    let nearestNpc = null;
    nearestDistance = 92;
    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, npc.x, npc.y);
      if (distance < nearestDistance) { nearestNpc = npc; nearestDistance = distance; }
    }
    if (nearestNpc) { this.talkTo(nearestNpc); return; }

    let nearestDrop = null;
    nearestDistance = 78;
    for (const drop of this.lootPool) {
      if (!drop.active) continue;
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, drop.x, drop.y);
      if (distance < nearestDistance) { nearestDrop = drop; nearestDistance = distance; }
    }
    if (nearestDrop) {
      const item = nearestDrop.item;
      if (!this.inventory.add(item)) { gameEvents.emit('toast', { text: 'Inventory full (30 slots).', tone: 'danger' }); return; }
      this.tweens.killTweensOf(nearestDrop);
      nearestDrop.setActive(false).setVisible(false); nearestDrop.body.enable = false; nearestDrop.item = null;
      this.questSystem.recordCollect(item.itemId);
      const def = ITEM_DEFS[item.itemId];
      gameEvents.emit('toast', { text: `Picked up ${RARITY[item.rarity].label} ${def.name}`, tone: item.rarity });
      this.emitState(); this.safeSave();
      return;
    }
    gameEvents.emit('toast', { text: 'Nothing nearby to interact with.', tone: 'muted', short: true });
  }

  talkTo(npc) {
    const text = this.dialogueSystem.resolve(npc.def);
    let action = null;
    if (npc.def.id === 'npc_vesra') {
      for (const id of ['quest_ash_pest', 'quest_ember_heart', 'quest_bone_captain']) {
        const quest = this.state.quests[id];
        if (quest?.state === 'ready' && this.questSystem.turnIn(id)) { action = `Quest complete: ${id}`; break; }
        if (quest?.state === 'available' && this.questSystem.accept(id)) { action = `Quest accepted: ${id}`; break; }
      }
    }
    if (DEBUG) console.info('[Ashfall diagnostics] talk', npc.def.id);
    gameEvents.emit('dialogue', { speaker: npc.def.name, role: npc.def.role, text, action });
    this.emitState(); this.safeSave();
  }

  grantRewards(rewards, questName) {
    const result = grantXp(this.state, rewards.xp || 0);
    this.state.player.currency += rewards.currency || 0;
    if (rewards.item) this.inventory.add(this.inventory.createItem(rewards.item.itemId, rewards.item.rarity));
    gameEvents.emit('toast', { text: `${questName} complete • +${rewards.xp} XP • +${rewards.currency} coin`, tone: 'quest' });
    if (result.levels) gameEvents.emit('toast', { text: `Level ${this.state.player.level}! Stat points are ready.`, tone: 'level' });
  }

  async equipItem(instanceId) {
    const instance = this.inventory.get(instanceId);
    const check = this.inventory.canEquip(instance);
    if (!check.ok) {
      gameEvents.emit('toast', { text: check.reason, tone: 'danger', short: true });
      return;
    }
    try {
      await ensureItemVisualAssets(this, instance.itemId);
    } catch (error) {
      console.warn('[Ashfall] Equipment asset load failed', error);
      gameEvents.emit('toast', { text: 'That equipment art could not be loaded.', tone: 'danger' });
      return;
    }
    const result = this.inventory.equip(instanceId);
    gameEvents.emit('toast', { text: result.ok ? 'Equipment changed.' : result.reason, tone: result.ok ? 'normal' : 'danger', short: true });
    if (result.ok) this.player.refreshEquipment();
    this.emitState();
    this.safeSave();
  }

  respawnAtRefuge() {
    this.deathAnnounced = false;
    gameEvents.emit('death-cleared');
    this.player.respawn(PLAYER_START.x, PLAYER_START.y);
    if (this.currentMap.id !== DEFAULT_MAP_ID) {
      this.transitionToMap(DEFAULT_MAP_ID, 'cinder_start');
      return;
    }
    this.state.player.mapId = DEFAULT_MAP_ID;
    this.state.player.entryPointId = 'cinder_start';
    this.emitState();
    this.safeSave();
  }

  handleCommand(command) {
    if (!command) return;
    if (command.type === 'attack') actionInput.attackQueued = true;
    if (command.type === 'interact') actionInput.interactQueued = true;
    if (command.type === 'move') actionInput.setTouchMovement(command.x, command.y, command.active);
    if (command.type === 'equip') void this.equipItem(command.instanceId);
    if (command.type === 'unequip') { this.inventory.unequip(command.slot); this.player.refreshEquipment(); this.emitState(); this.safeSave(); }
    if (command.type === 'dropItem' || command.type === 'destroyItem') {
      const result = this.inventory.removeInstance(command.instanceId);
      if (!result.ok) {
        gameEvents.emit('toast', { text: result.reason, tone: 'danger' });
      } else {
        const def = ITEM_DEFS[result.item.itemId];
        if (result.unequippedSlots.length) this.player.refreshEquipment();
        if (command.type === 'dropItem') {
          const angle = Math.random() * Math.PI * 2;
          const distance = 42;
          this.dropLoot(this.player.body.x + Math.cos(angle) * distance, this.player.body.y + Math.sin(angle) * distance, result.item);
          gameEvents.emit('toast', { text: `Dropped ${def?.name || result.item.itemId}.`, tone: 'normal', short: true });
        } else {
          gameEvents.emit('toast', { text: `Destroyed ${def?.name || result.item.itemId}.`, tone: 'danger', short: true });
        }
        this.emitState();
        this.safeSave();
      }
    }
    if (command.type === 'allocateStats') this.allocateStats(command.points);
    if (command.type === 'respawn') this.respawnAtRefuge();
    if (command.type === 'save') { this.safeSave(); gameEvents.emit('toast', { text: 'Progress saved.', tone: 'normal', short: true }); }
    if (command.type === 'debug') this.runDiagnostic(command.action);
  }

  runDiagnostic(action) {
    const moveNear = target => {
      if (!target) return;
      this.player.body.setPosition(target.x - 58, target.y);
      this.player.visual.direction = 3;
    };
    if (action === 'hollow') { this.transitionToMap('map_ashfall_hollow', 'hollow_center'); return; }
    if (action === 'refuge') { this.transitionToMap(DEFAULT_MAP_ID, 'cinder_start'); return; }
    if (action === 'level') grantXp(this.state, 650);
    if (action === 'vesra') moveNear(this.npcs.find(npc => npc.def.id === 'npc_vesra'));
    if (action === 'merchant') moveNear(this.npcs.find(npc => npc.def.id === 'npc_merchant'));
    if (action === 'imp') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_cinder_imp')?.sprite);
    if (action === 'blight') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_blight_imp')?.sprite);
    if (action === 'goblin') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ash_goblin')?.sprite);
    if (action === 'spider') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_cave_spider')?.sprite);
    if (action === 'blueflame') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_blueflame_imp')?.sprite);
    if (action === 'emberweb') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ember_spider')?.sprite);
    if (action === 'carrion') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_carrion_beast')?.sprite);
    if (action === 'rotwing') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_rotwing_ravager')?.sprite);
    if (action === 'slate') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_slate_revenant')?.sprite);
    if (action === 'bloodbone') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_bloodbone')?.sprite);
    if (action === 'gilded') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_gilded_guard')?.sprite);
    if (action === 'golem') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ashstone_golem')?.sprite);
    if (action === 'boss') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.named)?.sprite);
    if (action === 'heart') this.dropLoot(this.player.body.x + 28, this.player.body.y, this.inventory.createItem('quest_ember_heart', 'normal'));
    if (action === 'magichelm') {
      // This diagnostic must grant a real player-compatible item, not the old
      // NPC-only Warden Helm that cannot render the full player combo.
      this.state.player.level = Math.max(this.state.player.level, 2);
      this.state.player.stats.str = Math.max(this.state.player.stats.str, 7);
      this.inventory.add(this.inventory.createItem('head_bronze_revised', 'magic'));
    }
    if (action === 'gear115') {
      // Make the development gear immediately testable without requiring a
      // full progression grind. This helper exists only when ?debug=1.
      this.state.player.level = Math.max(this.state.player.level, 7);
      this.state.player.stats.str = Math.max(this.state.player.stats.str, 13);
      this.state.player.stats.dex = Math.max(this.state.player.stats.dex, 9);
      this.state.player.stats.vit = Math.max(this.state.player.stats.vit, 7);
      const ids = [
        'weapon_brass_arming_sword', 'weapon_copper_arming_sword', 'weapon_bronze_arming_sword',
        'weapon_iron_arming_sword', 'weapon_steel_arming_sword', 'weapon_ceramic_arming_sword', 'weapon_gold_arming_sword',
        'head_bronze_revised', 'head_iron_revised', 'shoulders_leather_revised',
        'chest_silver_legion', 'chest_legion', 'chest_steel_plate', 'hands_legion', 'feet_leather_revised'
      ];
      for (const itemId of ids) if (!this.state.inventory.some(item => item.itemId === itemId)) this.inventory.add(this.inventory.createItem(itemId, 'normal'));
    }
    if (action === 'wings') {
      this.state.worldFlags.wingsUnlocked = true;
      if (!this.state.inventory.some(item => item.itemId === 'wings_red_bat')) this.inventory.add(this.inventory.createItem('wings_red_bat', 'normal'));
    }
    if (action === 'fall') { this.state.player.hp = 1; this.hitPlayer(9999); }
    this.emitState();
    gameEvents.emit('toast', { text: `Diagnostic: ${action}`, tone: 'muted', short: true });
  }

  allocateStats(points) {
    const values = ['str', 'dex', 'vit', 'spr'];
    const spend = values.reduce((sum, key) => sum + Math.max(0, Math.floor(points[key] || 0)), 0);
    if (spend <= 0 || spend > this.state.player.unspentStatPoints) { gameEvents.emit('toast', { text: 'That allocation cannot be applied.', tone: 'danger' }); return; }
    for (const key of values) this.state.player.stats[key] += Math.max(0, Math.floor(points[key] || 0));
    this.state.player.unspentStatPoints -= spend;
    const derived = derivedStats(this.state);
    this.state.player.hp = Math.min(derived.maxHp, this.state.player.hp + spend * 5);
    this.state.player.essence = Math.min(derived.maxEssence, this.state.player.essence + spend * 3);
    gameEvents.emit('toast', { text: `${spend} stat points committed.`, tone: 'level' });
    this.emitState(); this.safeSave();
  }

  updateZone() {
    const allowed = new Set(this.currentMap.zoneIds || []);
    const zone = ZONES.find(entry => allowed.has(entry.id)
      && this.player.body.x >= entry.x && this.player.body.x < entry.x + entry.width
      && this.player.body.y >= entry.y && this.player.body.y < entry.y + entry.height);
    if (zone?.id !== this.currentZone?.id) { this.currentZone = zone; gameEvents.emit('zone', zone); }
  }

  emitState() {
    const derived = derivedStats(this.state);
    this.state.player.hp = Math.min(this.state.player.hp, derived.maxHp);
    this.state.player.essence = Math.min(this.state.player.essence, derived.maxEssence);
    gameEvents.emit('state', { state: this.state, derived, quests: this.questSystem?.activeSummary() || [] });
  }

  safeSave() { try { this.saveManager.save(this.state); } catch (error) { console.warn('[Ashfall] Save failed', error); gameEvents.emit('toast', { text: 'Save could not be written on this device.', tone: 'danger' }); } }

  drawDynamicCollisionDebug() {
    if (!this.dynamicCollisionDebug) return;
    const graphics = this.dynamicCollisionDebug;
    graphics.clear();
    const drawBody = (body, color, alpha = 0.9) => {
      if (!body?.enable) return;
      graphics.lineStyle(2, color, alpha).strokeRect(body.x, body.y, body.width, body.height);
    };
    // Cyan = player's actual compact movement footprint.
    drawBody(this.player?.body?.body, 0x38d7ff, 0.95);
    // Magenta = active enemy footprints. These are informational only; enemies
    // do not physically shove the player.
    for (const enemy of this.enemies || []) if (enemy.sprite?.active) drawBody(enemy.sprite.body, 0xff4bd8, 0.55);
  }

  update(time, delta) {
    // During the short fade between maps, the destination coordinates have
    // already been written into persistent state. Do not let Player.update()
    // overwrite them with the still-visible source-map body coordinates.
    if (this.transitioning) {
      this.player.body.setVelocity(0);
      if (DEBUG) this.drawDynamicCollisionDebug();
      return;
    }
    this.player.update(time, delta);
    if (DEBUG) this.drawDynamicCollisionDebug();
    if (actionInput.consumeInteract()) this.interact();
    for (const enemy of this.enemies) enemy.update(time, delta, this.player);
    for (const npc of this.npcs) npc.update(time, delta, this.player);
    this.updateZone();
    if (time - this.lastHudUpdate > 120) { this.lastHudUpdate = time; this.emitState(); }
    if (time - this.lastSave > 10000) { this.lastSave = time; this.safeSave(); }
  }
}
