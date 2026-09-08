import { ENEMY_DEFS } from '../data/enemies.js';
import { areFriendly, areHostile } from '../data/factions.js';
import { encounterForId } from '../data/encounters.js';
import { MERCHANT_SUPPLY_DEFS, RECOVERY_DROP_TABLE } from '../data/consumables.js';
import { ITEM_DEFS } from '../data/items.js';
import { NPC_DEFS } from '../data/npcs.js';
import { AZRAEL_DEF } from '../data/specialActors.js';
import { AREA_DEFS, BUILDING_DEFS, COLLIDERS, DEBUG_SPAWN_REGIONS, DEFAULT_MAP_ID, FALLEN_WATCH_WALLS, HOLLOW_COLLIDERS, HOLLOW_WALLS, INTERIOR_WALLS, MAP_TRANSITIONS, PROP_DEFS, RECOVERY_POINTS, REFUGE_WALLS, SPAWN_REGIONS, TOWN_PROP_DEFS, ZONES, mapForId } from '../data/world.js';
import { DEBUG, GAME_VERSION, PLAYER_START, RARITY, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from '../config.js';
import { gameEvents } from '../core/EventBus.js';
import { POI_DEFS } from '../data/exploration.js';
import { WARFRONT_AMBIENT_EMITTERS, WARFRONT_BRIDGES, WARFRONT_CLIFF_RIBBONS, WARFRONT_COLLIDERS, WARFRONT_LANDMARKS, WARFRONT_ROUTE_BANDS, WARFRONT_RUIN_BUILDINGS, WARFRONT_WATERWAYS } from '../data/warfront.js';
import { actionInput } from '../systems/ActionInput.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { InventorySystem, pickRarity } from '../systems/InventorySystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { RecoverySystem } from '../systems/RecoverySystem.js';
import { makeReturnAnchor, peekReturnAnchor, popReturnAnchor, pushReturnAnchor, ensureTravelState } from '../systems/TravelSystem.js';
import { WorldEventSystem } from '../systems/WorldEventSystem.js';
import { assetDefsForMap, ensureItemVisualAssets, prepareMapAssets, queueAssetDefs } from '../systems/AssetResolver.js';
import { derivedStats, grantXp } from '../systems/StatsSystem.js';
import { ACTOR_COLLISION_KIND, colliderBlocksActor, enemyIgnoresWorldCollision, pointInRectArea, segmentIntersectsCollider } from '../systems/WorldNavigation.js';
import { Enemy } from '../entities/Enemy.js';
import { NPC } from '../entities/NPC.js';
import { Azrael } from '../entities/Azrael.js';
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
    // Phaser Scene.restart() reuses this WorldScene instance. A transition sets
    // this flag before the fade so the source map cannot overwrite committed
    // destination coordinates. Reset it on every create() or the restarted
    // destination Scene will render normally but update() will return forever.
    this.transitioning = false;
    this.makeRuntimeTextures();
    this.physics.world.setBounds(0, 0, this.currentMap.width, this.currentMap.height);
    this.cameras.main.setBounds(0, 0, this.currentMap.width, this.currentMap.height).setRoundPixels(true).setZoom(1);
    this.buildWorld();
    this.createTransitionMarkers();
    this.createRecoveryMarkers();
    this.createPoiMarkers();

    this.inventory = new InventorySystem(this.state);
    this.questSystem = new QuestSystem(this.state, this.inventory, (rewards, name) => this.grantRewards(rewards, name));
    this.dialogueSystem = new DialogueSystem(this.state, this.inventory);
    actionInput.bind(this);
    this.player = new Player(this, this.state, actionInput, attack => this.combat.playerAttack(attack));
    // Rebuild the layered player presentation explicitly on every Scene start.
    // Physical iPhone Safari testing exposed a WebKit/Phaser transition case
    // where the physics proxy survived but layered sprites could remain hidden.
    this.player.restoreVisual();
    this.physics.add.collider(this.player.body, this.obstacles, null, this.playerObstacleProcess, this);
    // Enemy contact is handled by combat range, not Arcade body separation.
    // Dynamic enemy/player colliders still stay disabled so monsters cannot
    // shove the player; only static world solids separate both actor classes.
    this.cameras.main.startFollow(this.player.body, true, 1, 1);

    this.createEnemies();
    this.enemyObstacleCollider = this.physics.add.collider(
      this.enemyGroup,
      this.obstacles,
      this.onEnemyObstacleCollision,
      this.enemyObstacleProcess,
      this
    );
    this.createNPCs();
    this.createAzrael();
    if (DEBUG) this.dynamicCollisionDebug = this.add.graphics().setDepth(15001);
    this.combat = new CombatSystem(this, this.state, this.player, this.enemies, gameEvents);
    this.player.combat = this.combat;
    for (const enemy of this.enemies) enemy.combat = this.combat;
    if (this.azrael) this.azrael.combat = this.combat;
    this.recovery = new RecoverySystem(this, this.state, this.inventory, this.player, gameEvents);
    this.worldEvents = new WorldEventSystem(this, this.state, gameEvents);
    this.createLootPool();
    this.currentZone = null;
    this.currentArea = null;
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
      this.azrael?.destroy();
      this.combat?.destroy();
    });
    this.updateZone();
    this.updateArea();
    this.emitState();
    this.cameras.main.fadeIn(150, 12, 6, 4);
    gameEvents.emit('ready', { version: GAME_VERSION });
    // v0.1.2.4.3 retains the v0.1.2.4.2 texture policy and intentionally retains textures that have already been loaded
    // during this browser session. Map-scoped loading still prevents unopened
    // regions from loading at startup, but WebKit device testing showed that
    // eager TextureManager eviction during Scene restarts could invalidate the
    // freshly rebuilt player layer stack. Safe cache eviction can return later
    // behind a device-tested handoff boundary; reliability wins for this hotfix.
    this.time.delayedCall(16, () => this.recoverPlayerVisual());
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
    if (!this.textures.exists('warfront-mote')) {
      const mote = this.add.graphics().fillStyle(0xffffff, 0.95).fillCircle(4, 4, 2.1).lineStyle(1, 0xffffff, 0.35).strokeCircle(4, 4, 3.5);
      mote.generateTexture('warfront-mote', 8, 8).destroy();
    }
    if (!this.textures.exists('warfront-ember')) {
      const ember = this.add.graphics().fillStyle(0xffffff, 0.95).fillCircle(4, 4, 2.4).fillStyle(0xffffff, 0.32).fillCircle(4, 4, 3.8);
      ember.generateTexture('warfront-ember', 8, 8).destroy();
    }
  }

  buildWorld() {
    if (this.currentMap.renderer === 'cinder_refuge') return this.buildCinderRefuge();
    if (this.currentMap.renderer === 'cinder_wilds') return this.buildCinderWilds();
    if (this.currentMap.renderer === 'ashfall_hollow') return this.buildAshfallHollow();
    if (this.currentMap.renderer === 'warden_hall') return this.buildWardenHall();
    if (this.currentMap.renderer === 'torrens_forge') return this.buildTorrensForge();
    if (this.currentMap.renderer === 'ashgrave_crypt') return this.buildAshgraveCrypt();
    if (this.currentMap.renderer === 'veil_threshold') return this.buildVeilThreshold();
    if (this.currentMap.renderer === 'veil_warfront') return this.buildVeilWarfront();
    return this.buildAshfallHollow();
  }

  makeGroundLayer(textureKey = 'terrain-dirt') {
    const cols = Math.ceil(this.currentMap.width / TILE_SIZE);
    const rows = Math.ceil(this.currentMap.height / TILE_SIZE);
    const data = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => (x * 7 + y * 11 + (x * y) % 5) % 6));
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tiles = map.addTilesetImage(`ground-${this.currentMap.id}`, textureKey, 32, 32, 0, 0);
    this.groundLayer = map.createLayer(0, tiles, 0, 0).setDepth(-1000);
  }

  addPlacedProp(prop) {
    const object = prop.frame === undefined || prop.frame === null
      ? this.add.image(prop.x, prop.y, prop.texture)
      : this.add.sprite(prop.x, prop.y, prop.texture, prop.frame);
    object.setScale(prop.scale || 1).setDepth(prop.y + (prop.depthOffset ?? -2)).setAlpha(prop.alpha ?? 1);
    if (prop.tint) object.setTint(prop.tint);
    if (prop.flipX) object.setFlipX(true);
    return object;
  }

  activeMapColliders() {
    return COLLIDERS.filter(collider => collider.mapId === this.currentMap.id);
  }

  createStaticObstacles(colliders) {
    this.obstacles = this.physics.add.staticGroup();
    for (const collider of colliders) {
      const body = this.obstacles.create(collider.x, collider.y, 'solid').setDisplaySize(collider.width, collider.height).setAlpha(0.001).refreshBody();
      body.colliderId = collider.id;
      body.colliderSource = collider.source;
      body.colliderBlocksActors = collider.blocksActors || ['player', 'enemy'];
      body.colliderWidth = collider.width;
      body.colliderHeight = collider.height;
    }
    if (DEBUG) {
      const collisionDebug = this.add.graphics().setDepth(15000).lineStyle(2, 0x38ff76, 0.82);
      for (const collider of colliders) collisionDebug.strokeRect(collider.x - collider.width / 2, collider.y - collider.height / 2, collider.width, collider.height);
    }
    this.enemyGroup = this.physics.add.group({ allowGravity: false, immovable: false });
  }

  renderStoneWallSegments(walls, { ruined = false } = {}) {
    const shadow = this.add.graphics().setDepth(-590);
    for (const wall of walls) {
      shadow.lineStyle((wall.thickness || 24) + 20, 0x110a08, ruined ? 0.34 : 0.48).lineBetween(wall.x1 + 7, wall.y1 + 11, wall.x2 + 7, wall.y2 + 11);
      const horizontal = wall.y1 === wall.y2;
      const length = horizontal ? Math.abs(wall.x2 - wall.x1) : Math.abs(wall.y2 - wall.y1);
      const steps = Math.max(1, Math.floor(length / 30));
      for (let i = 0; i <= steps; i += 1) {
        if (ruined && i % 11 === 6) continue;
        const t = steps ? i / steps : 0;
        const x = Phaser.Math.Linear(wall.x1, wall.x2, t);
        const y = Phaser.Math.Linear(wall.y1, wall.y2, t);
        const frame = ruined ? [48, 49, 52, 55, 60, 61][i % 6] : [48, 52, 56, 60][i % 4];
        this.add.sprite(x, y, 'castle2-set', frame)
          .setScale(1.08)
          .setDepth(y - (horizontal ? 8 : 0))
          .setAlpha(ruined ? 0.9 : 1)
          .setTint(ruined ? 0xb39a86 : 0xc6a98c);
        if (!ruined && i > 0 && i < steps && i % 5 === 0) {
          this.add.sprite(x, y + 4, 'castle2-set', 16).setScale(1.05).setDepth(y + 3).setTint(0xa98b71);
        }
      }
    }
  }

  buildCinderRefuge() {
    this.makeGroundLayer();

    const ground = this.add.graphics().setDepth(-920);
    ground.fillStyle(0x2e211b, 0.26).fillRect(0, 0, this.currentMap.width, this.currentMap.height);
    ground.fillStyle(0x72503b, 0.18).fillEllipse(1020, 790, 720, 510);
    ground.fillStyle(0x241715, 0.26).fillRect(0, 0, 150, this.currentMap.height);
    ground.fillStyle(0x241715, 0.22).fillRect(1900, 0, 148, this.currentMap.height);

    // Refuge streets form districts instead of every building facing one tiny
    // central point. The east road ends at the dedicated Wilds transition.
    const roads = this.add.graphics().setDepth(-840);
    const road = (x1, y1, x2, y2, width = 56) => {
      roads.lineStyle(width + 12, 0x35251f, 0.20).lineBetween(x1 + 3, y1 + 7, x2 + 3, y2 + 7);
      roads.lineStyle(width, 0x76523b, 0.49).lineBetween(x1, y1, x2, y2);
      roads.lineStyle(Math.max(5, width * 0.18), 0xb17b4d, 0.10).lineBetween(x1, y1, x2, y2);
    };
    road(1900, 768, 1030, 768, 72);
    road(1030, 768, 500, 520, 54);
    road(1030, 768, 820, 445, 46);
    road(1030, 768, 1510, 590, 52);
    road(1030, 768, 760, 1080, 50);
    road(1030, 768, 1180, 1080, 50);
    road(760, 1080, 420, 1160, 38);
    road(1180, 1080, 1450, 1030, 38);
    roads.fillStyle(0x79563e, 0.52).fillEllipse(1030, 770, 310, 225);
    roads.lineStyle(5, 0x3d2b25, 0.22).strokeEllipse(1030, 770, 318, 233);

    // The old single flat line is gone. Refuge uses chunky stone art, deep
    // shadow and periodic buttresses while collision still comes from the same
    // REFUGE_WALLS records.
    this.renderStoneWallSegments(REFUGE_WALLS);

    // Gate towers visually terminate the two east wall sections and make the
    // exit read as a real defended entrance rather than a missing line.
    for (const [x, y, flip] of [[1885, 548, false], [1885, 988, true]]) {
      this.add.image(x, y, 'adobe-house-tower').setScale(0.62).setFlipX(flip).setTint(0xb18d75).setDepth(y + 20);
      this.add.sprite(x + 22, y + 24, 'castle2-set', 120).setScale(0.85).setDepth(y + 54);
    }
    const gate = this.add.graphics().setDepth(930);
    // Open gate leaves sit against the wall/towers instead of drawing a
    // fake closed barrier through a passable transition opening.
    gate.lineStyle(7, 0x5a3826, 0.92).lineBetween(1912, 590, 1912, 676);
    gate.lineStyle(7, 0x5a3826, 0.92).lineBetween(1912, 860, 1912, 946);
    for (const y of [604, 630, 656, 878, 904, 930]) gate.fillStyle(0x3d271d, 0.96).fillRect(1889, y, 43, 8);

    for (const building of BUILDING_DEFS.filter(entry => entry.mapId === this.currentMap.id)) {
      const image = this.add.image(building.x, building.y, building.texture)
        .setOrigin(0.5, building.originY ?? 0.82)
        .setFlipX(Boolean(building.flipX))
        .setDepth(building.y + (building.depthOffset || -20));
      if (building.displayWidth && building.displayHeight) image.setDisplaySize(building.displayWidth, building.displayHeight);
      else image.setScale(building.scale || 1);
      image.buildingId = building.id;
      if (['refuge_forge', 'refuge_warden_hall', 'refuge_inn', 'refuge_storehouse', 'refuge_tailor'].includes(building.id)) {
        this.add.text(building.x, building.y + 24, building.name, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#e7c58f', stroke: '#170c0a', strokeThickness: 3
        }).setOrigin(0.5).setDepth(building.y + 130);
      }
    }

    for (const prop of PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);
    for (const prop of TOWN_PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);

    // Additional lightweight district clutter from existing sheets. It gives
    // empty corners purpose without turning the whole town into collision soup.
    const districtProps = [
      ['castle2-set', 160, 910, 700, 1.05], ['castle2-set', 161, 1140, 700, 1.05],
      ['castle2-set', 232, 350, 590, 1], ['castle2-set', 249, 390, 590, 1],
      ['castle2-set', 250, 1310, 1160, 1], ['castle2-set', 248, 1350, 1160, 1],
      ['adobe2-set', 67, 695, 410, 0.95], ['adobe2-set', 68, 895, 410, 0.95],
      ['castle2-set', 136, 1575, 690, 0.92], ['castle2-set', 138, 1620, 690, 0.92]
    ];
    for (const [texture, frame, x, y, scale] of districtProps) this.add.sprite(x, y, texture, frame).setScale(scale).setDepth(y + 2);

    // Sparse ground-detail patches make the large town feel authored without
    // obscuring mobile combat/readability.
    for (let i = 0; i < 70; i += 1) {
      const x = 150 + ((i * 227) % 1720);
      const y = 140 + ((i * 139) % 1240);
      if (x > 820 && x < 1230 && y > 640 && y < 900) continue;
      const frame = [0, 3, 6, 9, 12, 15, 18][i % 7];
      this.add.sprite(x, y, 'grass-dirt', frame).setAlpha(0.22).setDepth(-870).setScale(1 + (i % 3) * 0.28);
    }

    this.add.text(1030, 170, 'CINDER REFUGE', {
      fontFamily: 'Georgia, serif', fontSize: '25px', color: '#f0c77f', stroke: '#170c0a', strokeThickness: 6, letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0.82).setDepth(1000);
    this.add.text(1030, 201, 'A survivor sanctuary rebuilt from older wars', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#bca184', stroke: '#170c0a', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0.78).setDepth(1000);

    this.createStaticObstacles(this.activeMapColliders());
  }

  buildCinderWilds() {
    this.makeGroundLayer();

    const art = this.add.graphics().setDepth(-910);
    // Broad biome tone, with soft visual boundaries rather than colored boxes.
    art.fillStyle(0x6c2b17, 0.11).fillRect(1200, 0, 1600, 1024);
    art.fillStyle(0x171413, 0.29).fillRect(1200, 1024, 1600, 1024);
    art.fillStyle(0xd7b95f, 0.065).fillRect(2800, 0, 1400, 2048);
    art.fillStyle(0x40352d, 0.17).fillRect(4200, 0, 1400, 1024);
    art.fillStyle(0x24171a, 0.25).fillRect(4200, 1024, 1400, 1024);
    art.fillStyle(0x4a251e, 0.58).fillRect(5600, 0, 800, 2048);
    art.fillStyle(0x110a09, 0.70).fillRect(5586, 0, 18, 2048);

    // Long approach road. The first named wilderness no longer starts five
    // steps outside the town wall.
    const roads = this.add.graphics().setDepth(-850);
    const path = [[0, 1024], [520, 1010], [1040, 980], [1460, 880], [1960, 820], [2460, 920], [3000, 1040]];
    for (let i = 1; i < path.length; i += 1) {
      const [x1, y1] = path[i - 1], [x2, y2] = path[i];
      roads.lineStyle(72, 0x35231d, 0.25).lineBetween(x1 + 5, y1 + 9, x2 + 5, y2 + 9);
      roads.lineStyle(58, 0x76503a, 0.48).lineBetween(x1, y1, x2, y2);
      roads.lineStyle(8, 0xaf7447, 0.09).lineBetween(x1, y1, x2, y2);
    }
    // Bone Road reads like a hardened military track.
    roads.lineStyle(78, 0x291915, 0.42).lineBetween(5480, 1030, 6400, 1030);
    roads.lineStyle(48, 0x765445, 0.30).lineBetween(5480, 1030, 6400, 1030);

    // Scorched open-field patches.
    for (let i = 0; i < 24; i += 1) {
      const x = 1320 + ((i * 271) % 1380), y = 120 + ((i * 157) % 760);
      art.fillStyle(0x8b3119, 0.08 + (i % 3) * 0.02).fillEllipse(x, y, 110 + (i % 4) * 34, 55 + (i % 3) * 16);
    }

    // First-Light Scar: ancient holy geometry is concentrated well inside the
    // area so neighboring regions are not visible as a stack of labels.
    const scarX = 3500, scarY = 1040;
    art.lineStyle(6, 0xf8dc8d, 0.13).strokeCircle(scarX, scarY, 300);
    art.lineStyle(2, 0xfff2bd, 0.15).strokeCircle(scarX, scarY, 238);
    art.lineStyle(2, 0xf7cd73, 0.10).strokeCircle(scarX, scarY, 380);
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI / 4;
      art.lineStyle(2, 0xf5d985, 0.10).lineBetween(
        scarX + Math.cos(angle) * 140, scarY + Math.sin(angle) * 140,
        scarX + Math.cos(angle) * 355, scarY + Math.sin(angle) * 355
      );
    }
    for (let i = 0; i < 11; i += 1) {
      const angle = (i / 11) * Math.PI * 2;
      art.fillStyle(0xffe49b, 0.07).fillEllipse(scarX + Math.cos(angle) * 460, scarY + Math.sin(angle) * 420, 160, 70);
    }

    // Fallen Watch uses the same wall records for visible stone and collision.
    this.renderStoneWallSegments(FALLEN_WATCH_WALLS, { ruined: true });

    // Grave basin silhouettes and a ruined shrine axis.
    for (let i = 0; i < 18; i += 1) {
      const gx = 4380 + (i % 6) * 180 + (i % 2) * 26;
      const gy = 1240 + Math.floor(i / 6) * 260 + (i % 3) * 18;
      art.fillStyle(0x695c54, 0.77).fillRoundedRect(gx - 9, gy - 22, 18, 32, 4);
      art.fillStyle(0x160f10, 0.38).fillEllipse(gx, gy + 14, 44, 15);
      if (i % 4 === 0) art.lineStyle(3, 0x8d7769, 0.55).lineBetween(gx, gy - 38, gx, gy + 2);
    }

    // Large dirt/grass breakup remains cheap and helps the 6.4k map avoid a
    // repeated carpet look.
    for (let i = 0; i < 210; i += 1) {
      const x = 80 + ((i * 293) % 6240);
      const y = 60 + ((i * 179) % 1920);
      const frame = [0, 3, 6, 9, 12, 15, 18][i % 7];
      const alpha = x > 1200 && x < 2800 && y > 1024 ? 0.22 : 0.30;
      this.add.sprite(x, y, 'grass-dirt', frame).setAlpha(alpha).setDepth(-875).setScale(1 + (i % 4) * 0.26);
    }

    // Dense Cinderwood edge clusters block the eye before they block movement.
    // They intentionally sit away from the main travel lane and cave entrance.
    for (let i = 0; i < 14; i += 1) {
      const x = 1280 + (i % 7) * 225;
      const y = i < 7 ? 1085 + (i % 3) * 34 : 1935 - (i % 4) * 35;
      this.add.image(x, y, i % 2 ? 'pine-tree-large' : 'pine-tree-cluster')
        .setScale(i % 2 ? 1.03 : 0.78).setAlpha(0.92).setDepth(y - 10).setTint(0x7f766a);
    }

    for (const prop of PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);

    // Burnt Hamlet is intentionally unnamed: a real place between formal area
    // boundaries, not another giant HUD label.
    this.add.text(2260, 865, 'burnt homes • abandoned', {
      fontFamily: 'Georgia, serif', fontSize: '9px', color: '#92776c', stroke: '#170c0a', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0.48).setDepth(900);

    this.createStaticObstacles(this.activeMapColliders());
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
      body.colliderBlocksActors = collider.blocksActors || ['player', 'enemy'];
      body.colliderWidth = collider.width;
      body.colliderHeight = collider.height;
    }
    if (DEBUG) {
      const collisionDebug = this.add.graphics().setDepth(15000).lineStyle(2, 0x38ff76, 0.82);
      for (const collider of HOLLOW_COLLIDERS) collisionDebug.strokeRect(collider.x - collider.width / 2, collider.y - collider.height / 2, collider.width, collider.height);
    }
    this.enemyGroup = this.physics.add.group({ allowGravity: false, immovable: false });
  }

  renderInteriorWalls({ fill = 0x3c2b25, edge = 0x8b6a52, ruin = false } = {}) {
    const graphics = this.add.graphics().setDepth(120);
    for (const wall of INTERIOR_WALLS.filter(entry => entry.mapId === this.currentMap.id)) {
      const horizontal = wall.y1 === wall.y2;
      const x = (wall.x1 + wall.x2) / 2;
      const y = (wall.y1 + wall.y2) / 2;
      const width = horizontal ? Math.abs(wall.x2 - wall.x1) : wall.thickness;
      const height = horizontal ? wall.thickness : Math.abs(wall.y2 - wall.y1);
      graphics.fillStyle(fill, ruin ? 0.88 : 0.96).fillRect(x - width / 2, y - height / 2, width, height);
      graphics.lineStyle(3, edge, ruin ? 0.55 : 0.82).strokeRect(x - width / 2, y - height / 2, width, height);
      const step = 34;
      const length = horizontal ? width : height;
      const count = Math.floor(length / step);
      for (let i = 0; i <= count; i += 1) {
        const px = horizontal ? x - width / 2 + i * step : x;
        const py = horizontal ? y : y - height / 2 + i * step;
        if (this.textures.exists('castle2-set')) this.add.sprite(px, py, 'castle2-set', ruin ? [48, 52, 55, 60][i % 4] : [48, 52, 56, 60][i % 4])
          .setScale(1.0).setAlpha(ruin ? 0.62 : 0.76).setTint(ruin ? 0x8f8078 : 0xb69a7e).setDepth(y + 2);
      }
    }
  }

  buildWardenHall() {
    this.makeGroundLayer();
    const art = this.add.graphics().setDepth(-900);
    art.fillStyle(0x3a2922, 0.74).fillRect(70, 70, 884, 630);
    art.fillStyle(0x765039, 0.30).fillRoundedRect(250, 170, 520, 390, 28);
    art.lineStyle(5, 0xb78b59, 0.20).strokeRoundedRect(250, 170, 520, 390, 28);
    art.fillStyle(0x261914, 0.55).fillRect(462, 145, 100, 390);
    this.renderInteriorWalls({ fill: 0x34231d, edge: 0x9b7656 });
    for (const prop of PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);
    this.add.sprite(512, 300, 'castle2-set', 128).setScale(1.25).setDepth(302).setTint(0xb79a76);
    this.add.sprite(585, 300, 'castle2-set', 136).setScale(1.05).setDepth(302).setTint(0x9e8165);
    this.add.text(512, 115, 'WARDEN HALL', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#e9c886', stroke: '#160b08', strokeThickness: 5, letterSpacing: 3 }).setOrigin(0.5).setDepth(900);
    this.add.text(512, 143, 'Command chamber • campaign archive', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#bea287', stroke: '#160b08', strokeThickness: 3 }).setOrigin(0.5).setDepth(900);
    this.createStaticObstacles(this.activeMapColliders());
  }

  buildTorrensForge() {
    this.makeGroundLayer();
    const art = this.add.graphics().setDepth(-900);
    art.fillStyle(0x3b261d, 0.80).fillRect(70, 70, 884, 630);
    art.fillStyle(0x8f4929, 0.16).fillEllipse(320, 330, 360, 300);
    art.fillStyle(0x2c1b17, 0.44).fillRoundedRect(180, 170, 650, 420, 22);
    this.renderInteriorWalls({ fill: 0x3b2922, edge: 0xa36b47 });
    for (const prop of PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);
    if (this.textures.exists('fire')) {
      for (const [x, y] of [[250, 345], [310, 345]]) this.add.sprite(x, y, 'fire', 0).setScale(1.1).setDepth(y + 5).setAlpha(0.9);
    }
    this.add.text(512, 115, 'TORREN’S FORGE', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f0b56c', stroke: '#160b08', strokeThickness: 5, letterSpacing: 3 }).setOrigin(0.5).setDepth(900);
    this.add.text(512, 143, 'Repair benches • weapon racks • field supplies', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c69a78', stroke: '#160b08', strokeThickness: 3 }).setOrigin(0.5).setDepth(900);
    this.createStaticObstacles(this.activeMapColliders());
  }

  buildAshgraveCrypt() {
    this.makeGroundLayer();
    const art = this.add.graphics().setDepth(-900);
    art.fillStyle(0x171113, 0.78).fillRect(0, 0, this.currentMap.width, this.currentMap.height);
    art.fillStyle(0x3b3230, 0.66).fillRoundedRect(80, 80, 1120, 730, 18);
    art.lineStyle(4, 0x72635d, 0.26).strokeRoundedRect(120, 120, 1040, 650, 18);
    this.renderInteriorWalls({ fill: 0x252021, edge: 0x776965, ruin: true });
    for (let i = 0; i < 12; i += 1) {
      const x = 175 + (i % 4) * 285;
      const y = 175 + Math.floor(i / 4) * 210;
      art.fillStyle(0x5e5551, 0.72).fillRoundedRect(x - 34, y - 18, 68, 36, 5);
      art.lineStyle(2, 0x8c7b72, 0.42).strokeRoundedRect(x - 34, y - 18, 68, 36, 5);
    }
    for (const prop of PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);
    this.add.text(640, 92, 'ASHGRAVE CRYPT', { fontFamily: 'Georgia, serif', fontSize: '23px', color: '#c8b5a6', stroke: '#11090b', strokeThickness: 6, letterSpacing: 4 }).setOrigin(0.5).setDepth(900);
    this.add.text(640, 122, 'The road below remembers older dead', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#8f8180', stroke: '#11090b', strokeThickness: 3 }).setOrigin(0.5).setDepth(900);
    this.createStaticObstacles(this.activeMapColliders());
  }

  buildVeilThreshold() {
    this.makeGroundLayer();
    const art = this.add.graphics().setDepth(-900);
    art.fillStyle(0x111017, 0.82).fillRect(0, 0, this.currentMap.width, this.currentMap.height);
    art.fillStyle(0x4e473e, 0.36).fillEllipse(640, 450, 960, 650);
    art.lineStyle(5, 0xf2d78a, 0.20).strokeCircle(640, 420, 300);
    art.lineStyle(3, 0x8f4c3f, 0.24).strokeCircle(640, 420, 370);
    art.lineStyle(2, 0xc8e3ff, 0.15).strokeCircle(640, 420, 225);
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      art.lineStyle(2, i % 2 ? 0xf4da96 : 0x9c5146, 0.19).lineBetween(
        640 + Math.cos(angle) * 175, 420 + Math.sin(angle) * 175,
        640 + Math.cos(angle) * 390, 420 + Math.sin(angle) * 390
      );
    }
    this.renderInteriorWalls({ fill: 0x242128, edge: 0x857465, ruin: true });
    for (const prop of PROP_DEFS.filter(entry => entry.mapId === this.currentMap.id)) this.addPlacedProp(prop);
    const rift = this.add.graphics().setDepth(520);
    rift.fillStyle(0x05050a, 0.90).fillEllipse(640, 300, 150, 250);
    rift.lineStyle(7, 0xe5cf86, 0.62).strokeEllipse(640, 300, 160, 260);
    rift.lineStyle(3, 0x9d4d45, 0.58).strokeEllipse(640, 300, 126, 225);
    this.tweens.add({ targets: rift, alpha: { from: 0.72, to: 1 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(640, 95, 'VEIL THRESHOLD', { fontFamily: 'Georgia, serif', fontSize: '23px', color: '#ead491', stroke: '#0d090d', strokeThickness: 6, letterSpacing: 4 }).setOrigin(0.5).setDepth(900);
    this.add.text(640, 125, 'A fractured antechamber to a larger warfront', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#b9a88e', stroke: '#0d090d', strokeThickness: 3 }).setOrigin(0.5).setDepth(900);
    this.createStaticObstacles(this.activeMapColliders());
  }

  drawWarfrontCliffRibbon(ribbon) {
    // v0.1.4.4.0.1: the mountain source is a composition sheet, not a row of
    // interchangeable standalone cliff tiles. The previous renderer cycled
    // unrelated frames and exposed their square source backgrounds/gaps.
    // Keep the same collider/geography but render one continuous ancient shelf
    // with a jagged pixel-like cap so the ridge reads as a single landform.
    const celestial = ribbon.theme === 'celestial';
    const rock = celestial ? 0x69534a : 0x5a382d;
    const shadow = celestial ? 0x263438 : 0x241517;
    const cap = celestial ? 0xe7f5f3 : 0xaa7056;
    const left = ribbon.x - ribbon.length / 2;
    const right = ribbon.x + ribbon.length / 2;
    const top = ribbon.y - 34;
    const bottom = ribbon.y + 34;
    const ridge = this.add.graphics().setDepth(ribbon.y - 18);
    ridge.fillStyle(shadow, 0.34).fillRect(left + 7, top + 11, ribbon.length, 70);
    ridge.fillStyle(rock, 0.96);
    ridge.beginPath();
    ridge.moveTo(left, bottom);
    ridge.lineTo(left, top + 11);
    const step = 32;
    for (let x = left; x <= right; x += step) {
      const n = Math.round((x - left) / step);
      ridge.lineTo(Math.min(x, right), top + (n % 3 === 0 ? 5 : (n % 3 === 1 ? 0 : 8)));
    }
    ridge.lineTo(right, bottom);
    ridge.closePath();
    ridge.fillPath();
    ridge.lineStyle(6, cap, celestial ? 0.92 : 0.68);
    ridge.beginPath();
    ridge.moveTo(left, top + 11);
    for (let x = left; x <= right; x += step) {
      const n = Math.round((x - left) / step);
      ridge.lineTo(Math.min(x, right), top + (n % 3 === 0 ? 5 : (n % 3 === 1 ? 0 : 8)));
    }
    ridge.strokePath();
    ridge.lineStyle(2, celestial ? 0xffffff : 0xe6a17b, celestial ? 0.42 : 0.24);
    ridge.lineBetween(left + 10, top + 15, right - 10, top + 9);
  }

  drawWarfrontWallCollider(collider) {
    const celestial = collider.x > this.currentMap.width / 2;
    const outpost = collider.source === 'outpost-wall';
    const tint = celestial ? (outpost ? 0xd9e1d9 : 0xe7eee5) : (outpost ? 0x8a6659 : 0x6f4b43);
    const horizontal = collider.width >= collider.height;
    const length = horizontal ? collider.width : collider.height;
    const count = Math.max(1, Math.floor(length / 30));
    const startX = collider.x - (horizontal ? collider.width / 2 : 0);
    const startY = collider.y - (horizontal ? 0 : collider.height / 2);
    const shadow = this.add.graphics().setDepth(collider.y - 30);
    shadow.fillStyle(0x08060a, celestial ? 0.26 : 0.42).fillRect(
      collider.x - collider.width / 2 + 6,
      collider.y - collider.height / 2 + 9,
      collider.width,
      collider.height
    );
    for (let i = 0; i <= count; i += 1) {
      if (outpost && i % 9 === 5) continue;
      const t = count ? i / count : 0;
      const x = horizontal ? startX + collider.width * t : collider.x;
      const y = horizontal ? collider.y : startY + collider.height * t;
      this.add.sprite(x, y, 'castle2-set', [48, 52, 56, 60][i % 4])
        .setScale(outpost ? 0.98 : 1.16)
        .setTint(tint)
        .setAlpha(outpost ? 0.86 : 0.96)
        .setDepth(y - 4);
    }
  }

  createWarfrontAmbientFx() {
    this.warfrontAmbient = [];
    for (const emitter of WARFRONT_AMBIENT_EMITTERS) {
      for (let i = 0; i < emitter.count; i += 1) {
        const key = emitter.kind === 'ember' ? 'warfront-ember' : 'warfront-mote';
        const x = emitter.x + Phaser.Math.FloatBetween(-emitter.spreadX / 2, emitter.spreadX / 2);
        const y = emitter.y + Phaser.Math.FloatBetween(-emitter.spreadY / 2, emitter.spreadY / 2);
        const particle = this.add.image(x, y, key)
          .setTint(emitter.tint)
          .setAlpha(Phaser.Math.FloatBetween(emitter.alpha * 0.45, emitter.alpha))
          .setScale(Phaser.Math.FloatBetween(0.65, 1.35))
          .setDepth(-30);
        const rise = emitter.kind === 'ember' ? Phaser.Math.Between(60, 120) : Phaser.Math.Between(42, 86);
        this.tweens.add({
          targets: particle,
          y: particle.y - rise,
          x: particle.x + Phaser.Math.Between(-22, 22),
          alpha: 0.05,
          scale: particle.scale * 0.55,
          duration: Phaser.Math.Between(emitter.minDuration, emitter.maxDuration),
          delay: Phaser.Math.Between(0, 2200),
          repeat: -1,
          onRepeat: () => {
            particle.setPosition(
              emitter.x + Phaser.Math.FloatBetween(-emitter.spreadX / 2, emitter.spreadX / 2),
              emitter.y + Phaser.Math.FloatBetween(-emitter.spreadY / 2, emitter.spreadY / 2)
            );
            particle.setAlpha(Phaser.Math.FloatBetween(emitter.alpha * 0.45, emitter.alpha));
            particle.setScale(Phaser.Math.FloatBetween(0.65, 1.35));
          }
        });
        this.warfrontAmbient.push(particle);
      }
    }

    // The ancient Axis uses two counter-rotating world-space rings. These are
    // Graphics/tweens rather than a shader so iPhone Safari gets the mystical
    // movement without a permanent full-screen WebGL cost.
    const axisOuter = this.add.container(3072, 1510).setDepth(880);
    const outerG = this.add.graphics();
    outerG.lineStyle(4, 0xf1dda0, 0.24).strokeCircle(0, 0, 300);
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6;
      const dx = Math.cos(a) * 300, dy = Math.sin(a) * 225;
      outerG.fillStyle(i % 2 ? 0xeaf7ff : 0xf4d28d, 0.54);
      outerG.fillTriangle(dx, dy - 10, dx + 7, dy, dx, dy + 10);
      outerG.fillTriangle(dx, dy - 10, dx - 7, dy, dx, dy + 10);
    }
    axisOuter.add(outerG);
    this.tweens.add({ targets: axisOuter, angle: 360, duration: 32000, repeat: -1, ease: 'Linear' });

    const axisInner = this.add.container(3072, 1510).setDepth(881);
    const innerG = this.add.graphics();
    innerG.lineStyle(3, 0xa8e4ef, 0.22).strokeEllipse(0, 0, 420, 290);
    innerG.lineStyle(2, 0xc85b45, 0.18).strokeEllipse(0, 0, 350, 235);
    axisInner.add(innerG);
    this.tweens.add({ targets: axisInner, angle: -360, duration: 24000, repeat: -1, ease: 'Linear' });

    const veilPulse = this.add.graphics().setDepth(830);
    veilPulse.lineStyle(5, 0xf0da9a, 0.32).strokeEllipse(3072, 2700, 260, 150);
    veilPulse.lineStyle(3, 0x9d544b, 0.26).strokeEllipse(3072, 2700, 330, 190);
    this.tweens.add({ targets: veilPulse, alpha: { from: 0.42, to: 1 }, duration: 1450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // A few distant localized flashes imply warfare beyond the currently
    // active sector without simulating dozens of offscreen combatants.
    for (const [x, y, tint, delay] of [[2520, 820, 0xff754f, 700], [3650, 920, 0xe7f6ff, 1500], [2440, 1910, 0xff8a59, 2600], [3740, 2050, 0xf8e9ad, 3300]]) {
      const flash = this.add.image(x, y, 'warfront-mote').setTint(tint).setScale(5).setAlpha(0.03).setDepth(-25);
      this.tweens.add({ targets: flash, alpha: { from: 0.02, to: 0.62 }, scale: { from: 3.5, to: 8.5 }, duration: 190, yoyo: true, repeat: -1, repeatDelay: 4200, delay });
    }
  }

  buildVeilWarfront() {
    this.cameras.main.setBackgroundColor('#0d0a10');

    // One tiled texture per territorial half keeps the 6144x3072 realm cheap
    // while still giving Heaven and the Infernal host genuinely different
    // ground language from Cinder Wilds.
    this.groundLayer = this.add.tileSprite(0, 0, this.currentMap.width, this.currentMap.height, 'warfront-winter-dirt')
      .setOrigin(0).setDepth(-1000).setTint(0xc9e5e5);
    this.add.tileSprite(0, 0, 2700, this.currentMap.height, 'warfront-infernal-dirt')
      .setOrigin(0).setDepth(-995).setTint(0x8c5f4d).setAlpha(0.96);

    const ground = this.add.graphics().setDepth(-980);
    // The center is older than either army: overlapping neutral stone/scar
    // bands make the transition gradual instead of a hard red/blue biome line.
    ground.fillStyle(0x312b32, 0.46).fillRect(2520, 0, 1120, this.currentMap.height);
    ground.fillStyle(0x734330, 0.16).fillRect(2300, 0, 420, this.currentMap.height);
    ground.fillStyle(0xc9e8e5, 0.12).fillRect(3500, 0, 420, this.currentMap.height);
    ground.fillStyle(0x131016, 0.24).fillRect(0, 0, this.currentMap.width, 150);
    ground.fillStyle(0x131016, 0.20).fillRect(0, this.currentMap.height - 145, this.currentMap.width, 145);

    // Three broad roads remain cross-connected rather than becoming MMO lanes.
    const routes = this.add.graphics().setDepth(-925);
    for (const route of WARFRONT_ROUTE_BANDS) {
      routes.lineStyle(route.width + 24, 0x0c090c, 0.18).lineBetween(500, route.y + 10, 5640, route.y + 10);
      routes.lineStyle(route.width, 0x655a57, route.id === 'center' ? 0.40 : 0.28).lineBetween(500, route.y, 5640, route.y);
      routes.lineStyle(6, route.id === 'center' ? 0xcfad72 : 0xa78b70, 0.10).lineBetween(500, route.y, 5640, route.y);
    }
    for (const x of [1450, 2360, 3072, 3840, 4720]) {
      routes.lineStyle(70, 0x514a49, 0.24).lineBetween(x, 650, x, 2360);
      routes.lineStyle(4, 0xb9a078, 0.08).lineBetween(x, 650, x, 2360);
    }

    // Celestial luminous water channel. The collider data leaves three bridge
    // gaps matching the visible crossings.
    const water = WARFRONT_WATERWAYS[0];
    this.add.tileSprite(water.x, water.y, water.width, water.height, 'warfront-ice-water-tile')
      .setDepth(-915).setAlpha(water.alpha).setTint(0xbdf8ff);
    const axisPool = WARFRONT_WATERWAYS[1];
    const pool = this.add.graphics().setDepth(-914);
    pool.fillStyle(axisPool.color, axisPool.alpha).fillEllipse(axisPool.x, axisPool.y, axisPool.width, axisPool.height);
    pool.lineStyle(5, 0xd8fbff, 0.28).strokeEllipse(axisPool.x, axisPool.y, axisPool.width, axisPool.height);
    for (let i = 0; i < 9; i += 1) {
      this.add.sprite(water.x + Phaser.Math.Between(-30, 30), 390 + i * 300, 'warfront-water-reflections', i % 12)
        .setScale(1.2).setAlpha(0.42).setDepth(-910).setTint(0xe9ffff);
    }
    for (const bridge of WARFRONT_BRIDGES) {
      // Use the curated straight bridge sprite, not the full authoring sheet.
      this.add.image(bridge.x, bridge.y, 'warfront-bridge-straight')
        .setRotation(bridge.rotation).setScale(1.72).setDepth(bridge.y - 18).setTint(0xc8c5b5);
    }

    // Infernal fissures are walkable visual scars rather than hidden blockers.
    const fissures = this.add.graphics().setDepth(-905);
    for (const [x1, y1, x2, y2] of [[560, 420, 980, 760], [1140, 2040, 1640, 1790], [1780, 1120, 2320, 1280], [2080, 2460, 2470, 2180]]) {
      fissures.lineStyle(18, 0x19090a, 0.32).lineBetween(x1, y1, x2, y2);
      fissures.lineStyle(5, 0xc84a33, 0.52).lineBetween(x1, y1, x2, y2);
      fissures.lineStyle(2, 0xff9b54, 0.32).lineBetween(x1 + 3, y1 - 2, x2 + 3, y2 - 2);
    }

    for (const ribbon of WARFRONT_CLIFF_RIBBONS) this.drawWarfrontCliffRibbon(ribbon);

    // Visible walls are driven from the same collider rows used by physics.
    for (const collider of WARFRONT_COLLIDERS.filter(row => ['stronghold-wall', 'outpost-wall'].includes(row.source))) this.drawWarfrontWallCollider(collider);

    // Stronghold identity remains a footprint in 0.1.4.4.0.1; the next detail
    // pass can replace/extend these compositions without changing geography.
    const addGate = (x, y, celestial) => {
      const tint = celestial ? 0xebf1e5 : 0x6f453d;
      const frames = [64, 65, 66, 67, 68, 69, 70];
      for (let i = 0; i < frames.length; i += 1) this.add.sprite(x + (i - 3) * 32, y, 'castle2-set', frames[i]).setScale(1.55).setTint(tint).setDepth(y + 5);
    };
    addGate(875, 1550, false);
    addGate(5265, 1550, true);

    // Infernal occupation: dungeon/bone/fire language mixed into the ancient
    // fortress rather than a generic lava castle.
    for (const [x, y, frame] of [[300, 1060, 176], [640, 1040, 178], [260, 1900, 114], [640, 1980, 119], [500, 1840, 128]]) {
      this.add.sprite(x, y, 'castle2-set', frame).setScale(1.28).setTint(0x8f5f50).setDepth(y + 4);
    }
    for (const [x, y, frame] of [[250, 1300, 64], [310, 1300, 65], [620, 1820, 64], [680, 1820, 65]]) {
      this.add.sprite(x, y, 'dungeon-elements', frame).setScale(1.65).setTint(0xa36a55).setDepth(y + 5);
    }

    // Celestial occupation: fountain/statue/pale-stone language with sparse
    // winter plants around the inner court.
    for (const [x, y, frame] of [[5500, 1080, 217], [5532, 1080, 218], [5564, 1080, 219], [5800, 1840, 100], [5480, 1910, 116]]) {
      this.add.sprite(x, y, 'castle2-set', frame).setScale(1.35).setTint(0xe9efe4).setDepth(y + 4);
    }
    for (let i = 0; i < 12; i += 1) {
      this.add.sprite(5380 + (i % 4) * 150, 1280 + Math.floor(i / 4) * 310, 'warfront-winter-plants', i % 6)
        .setScale(1.8).setTint(0xe9ffff).setAlpha(0.78).setDepth(1400 + i);
    }

    // Central Axis: real Castle2 mystical fragments + procedural ancient rings.
    const axis = this.add.graphics().setDepth(-850);
    axis.fillStyle(0x14131b, 0.52).fillEllipse(3072, 1510, 980, 720);
    axis.lineStyle(10, 0x51493f, 0.54).strokeEllipse(3072, 1510, 930, 670);
    axis.lineStyle(5, 0xe4cd91, 0.34).strokeEllipse(3072, 1510, 790, 555);
    axis.lineStyle(3, 0x9ddce8, 0.24).strokeEllipse(3072, 1510, 610, 405);
    axis.lineStyle(2, 0xbc553f, 0.20).strokeEllipse(3072, 1510, 490, 310);
    for (let i = 0; i < 16; i += 1) {
      const a = i * Math.PI / 8;
      axis.lineStyle(2, i % 2 ? 0xf3dfa2 : 0xa5dbe3, 0.24).lineBetween(
        3072 + Math.cos(a) * 250, 1510 + Math.sin(a) * 170,
        3072 + Math.cos(a) * 450, 1510 + Math.sin(a) * 320
      );
    }
    for (const collider of WARFRONT_COLLIDERS.filter(row => row.source === 'axis-pillar')) {
      this.add.sprite(collider.x, collider.y, 'castle2-set', 100).setScale(1.45).setTint(0xe4d8a7).setDepth(collider.y + 2);
    }
    // Complete ancient tree/orb composition from Castle2. Frames 172/173
    // are the real upper crown and were accidentally omitted in 0.1.4.4.0.
    for (const [frame, dx, dy] of [[172, -64, -128], [173, 0, -128], [188, -64, -64], [189, 0, -64], [190, 64, -64], [204, -64, 0], [205, 0, 0], [206, 64, 0]]) {
      this.add.sprite(3072 + dx * 1.4, 1510 + dy * 1.4, 'castle2-set', frame).setScale(2.8).setTint(0xd8d7bf).setDepth(1560 + dy);
    }

    // Ruined neutral settlement around the southern route.
    for (const building of WARFRONT_RUIN_BUILDINGS) {
      this.add.image(building.x, building.y, building.texture)
        .setScale(building.scale).setTint(building.tint).setAlpha(building.alpha).setDepth(building.y - 20);
    }
    for (const [x, y, frame, tint] of [[2980, 2450, 250, 0x867b75], [3060, 2500, 248, 0x7c7270], [3450, 2420, 176, 0x6f6466], [2890, 2610, 128, 0x81766c]]) {
      this.add.sprite(x, y, 'castle2-set', frame).setScale(1.15).setTint(tint).setDepth(y + 3);
    }

    // The Veil Gate is intentionally ancient/neutral, not owned by either side.
    const gate = this.add.graphics().setDepth(820);
    gate.fillStyle(0x05050a, 0.90).fillEllipse(3072, 2700, 190, 285);
    gate.lineStyle(10, 0xe5cf86, 0.58).strokeEllipse(3072, 2700, 205, 300);
    gate.lineStyle(4, 0xa04f46, 0.50).strokeEllipse(3072, 2700, 164, 258);
    gate.lineStyle(2, 0xb8e8f4, 0.36).strokeEllipse(3072, 2700, 130, 220);

    this.add.text(3072, 1085, 'AXIS OF FIRST LIGHT', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#eadca6', stroke: '#100c12', strokeThickness: 6, letterSpacing: 4 })
      .setOrigin(0.5).setDepth(5000).setAlpha(0.82);
    this.add.text(3072, 274, 'THE VEIL WARFRONT', { fontFamily: 'Georgia, serif', fontSize: '25px', color: '#d8d2bf', stroke: '#0b080d', strokeThickness: 7, letterSpacing: 5 })
      .setOrigin(0.5).setDepth(5000).setAlpha(0.72);
    this.add.text(3072, 307, 'Two armies occupy a realm neither one built', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#aaa2a4', stroke: '#0b080d', strokeThickness: 3 })
      .setOrigin(0.5).setDepth(5000).setAlpha(0.72);

    // Small landmark labels are deliberately sparse. The HUD remains the main
    // area locator; these simply help the first geometry test read at a glance.
    for (const landmark of WARFRONT_LANDMARKS.filter(item => ['infernal_stronghold', 'celestial_stronghold', 'ruined_settlement'].includes(item.id))) {
      const color = landmark.faction === 'celestial' ? '#e8f3df' : (landmark.faction === 'infernal' ? '#d89578' : '#c5b6a5');
      this.add.text(landmark.x, landmark.y - 455, landmark.name.toUpperCase(), { fontFamily: 'Georgia, serif', fontSize: '12px', color, stroke: '#0d090d', strokeThickness: 4, letterSpacing: 2 })
        .setOrigin(0.5).setDepth(5000).setAlpha(0.72);
    }

    this.createWarfrontAmbientFx();
    this.createStaticObstacles(this.activeMapColliders());
  }

  playerObstacleProcess(_playerBody, obstacle) {
    return colliderBlocksActor(obstacle, ACTOR_COLLISION_KIND.PLAYER);
  }

  enemyObstacleProcess(enemySprite, obstacle) {
    const enemy = enemySprite?.enemyRef;
    if (!enemy || !enemySprite.active || enemyIgnoresWorldCollision(enemy)) return false;
    return colliderBlocksActor(obstacle, ACTOR_COLLISION_KIND.ENEMY);
  }

  onEnemyObstacleCollision(enemySprite, obstacle) {
    enemySprite?.enemyRef?.onWorldCollision?.(obstacle, this.time.now);
  }

  hasWorldLineOfSight(x1, y1, x2, y2, actorKind = ACTOR_COLLISION_KIND.ENEMY) {
    for (const obstacle of this.obstacles?.getChildren?.() || []) {
      if (!colliderBlocksActor(obstacle, actorKind)) continue;
      if (segmentIntersectsCollider(x1, y1, x2, y2, obstacle, -0.5)) return false;
    }
    return true;
  }

  createTransitionMarkers() {
    this.mapTransitions = MAP_TRANSITIONS.filter(transition => transition.mapId === this.currentMap.id);
    for (const transition of this.mapTransitions) {
      const marker = this.add.graphics().setDepth(transition.y - 20);
      const kind = transition.kind || 'travel';
      if (kind === 'portal' || kind === 'return_portal') {
        marker.fillStyle(0x09070d, 0.78).fillEllipse(transition.x, transition.y, kind === 'portal' ? 126 : 104, kind === 'portal' ? 78 : 64);
        marker.lineStyle(6, 0xe7ca7f, 0.68).strokeEllipse(transition.x, transition.y, kind === 'portal' ? 132 : 110, kind === 'portal' ? 84 : 70);
        marker.lineStyle(3, 0x9f5045, 0.58).strokeEllipse(transition.x, transition.y, kind === 'portal' ? 104 : 86, kind === 'portal' ? 64 : 54);
        for (let i = 0; i < 6; i += 1) {
          const a = i * Math.PI / 3;
          marker.fillStyle(i % 2 ? 0xf0d58b : 0xa55349, 0.74).fillCircle(transition.x + Math.cos(a) * 58, transition.y + Math.sin(a) * 36, 4);
        }
        this.tweens.add({ targets: marker, alpha: { from: 0.72, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      } else if (kind === 'door') {
        marker.fillStyle(0x1b110e, 0.28).fillRect(transition.x - 30, transition.y - 16, 60, 26);
        marker.lineStyle(3, 0xd0a46b, 0.55).lineBetween(transition.x - 28, transition.y + 8, transition.x + 28, transition.y + 8);
      } else if (kind === 'crypt') {
        marker.fillStyle(0x080607, 0.88).fillEllipse(transition.x, transition.y + 4, 118, 64);
        marker.lineStyle(6, 0x64524c, 0.92).strokeEllipse(transition.x, transition.y + 4, 124, 70);
        marker.lineStyle(2, 0xa18d80, 0.55).strokeEllipse(transition.x, transition.y + 4, 94, 52);
      } else if (this.currentMap.renderer === 'cinder_refuge') {
        marker.fillStyle(0xdca45e, 0.10).fillRect(transition.x - 24, transition.y - 94, 48, 188);
        marker.lineStyle(3, 0xd5a05c, 0.45).lineBetween(transition.x - 18, transition.y - 92, transition.x - 18, transition.y + 92);
        marker.lineStyle(3, 0xd5a05c, 0.45).lineBetween(transition.x + 18, transition.y - 92, transition.x + 18, transition.y + 92);
      } else if (this.currentMap.renderer === 'cinder_wilds' && transition.destinationMapId === 'map_cinder_refuge') {
        marker.fillStyle(0x2c1a13, 0.72).fillRect(transition.x - 10, transition.y - 50, 20, 100);
        marker.lineStyle(4, 0x8a6748, 0.82).strokeRect(transition.x - 10, transition.y - 50, 20, 100);
      } else if (this.currentMap.renderer === 'cinder_wilds') {
        marker.fillStyle(0x090504, 0.94).fillEllipse(transition.x, transition.y + 7, 108, 60);
        marker.lineStyle(7, 0x654026, 0.95).strokeEllipse(transition.x, transition.y + 7, 116, 66);
        for (const offset of [-50, -25, 25, 50]) marker.fillStyle(0x7a5330, 0.92).fillCircle(transition.x + offset, transition.y - 13 + Math.abs(offset) * 0.12, 11);
      } else {
        marker.fillStyle(0x080504, 0.88).fillRect(transition.x - 62, transition.y - 12, 124, 34);
        marker.lineStyle(4, 0x7b522e, 0.95).strokeRect(transition.x - 62, transition.y - 12, 124, 34);
      }
      this.add.text(transition.x, transition.y - 58, transition.label, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#f0cc8c', align: 'center', stroke: '#130907', strokeThickness: 4
      }).setOrigin(0.5).setDepth(transition.y + 30);
      this.add.text(transition.x, transition.y - 38, 'Use', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#c8a67e', stroke: '#130907', strokeThickness: 3
      }).setOrigin(0.5).setDepth(transition.y + 30);
    }
  }

  travelThroughTransition(transition) {
    if (!transition || this.transitioning) return;
    ensureTravelState(this.state);
    if (transition.returnToOrigin) {
      const anchor = peekReturnAnchor(this.state);
      if (anchor) {
        this.transitionToMap(anchor.mapId, anchor.entryPointId, {
          position: { x: anchor.x, y: anchor.y },
          beforeCommit: () => popReturnAnchor(this.state)
        });
        return;
      }
      this.transitionToMap(transition.fallbackDestinationMapId, transition.fallbackDestinationEntryId);
      return;
    }

    let beforeCommit = null;
    if (transition.captureReturn) {
      const anchor = makeReturnAnchor({
        mapId: this.currentMap.id,
        x: this.player.body.x,
        y: this.player.body.y,
        entryPointId: this.state.player.entryPointId,
        transitionId: transition.id
      });
      beforeCommit = () => pushReturnAnchor(this.state, anchor);
    }
    this.transitionToMap(transition.destinationMapId, transition.destinationEntryId, { beforeCommit });
  }

  async transitionToMap(destinationMapId, destinationEntryId, options = {}) {
    const destination = mapForId(destinationMapId);
    const resolvedEntryId = destination.entryPoints?.[destinationEntryId] ? destinationEntryId : Object.keys(destination.entryPoints || {})[0];
    const entry = destination.entryPoints?.[resolvedEntryId] || Object.values(destination.entryPoints || {})[0];
    if (!entry || this.transitioning) return;
    this.transitioning = true;
    actionInput.resetTouchMovement();
    this.player.body.setVelocity(0);

    // Safari/WebKit can restart a Phaser Scene before a newly requested map
    // package has finished entering the global TextureManager. Explicitly
    // prepare and verify the destination package while the source map is still
    // alive. Only after success do we commit map state and restart the Scene.
    gameEvents.emit('map-loading', { active: true, name: destination.name, value: 0 });
    try {
      await prepareMapAssets(this, this.state, destination.id, value => {
        gameEvents.emit('map-loading', { active: true, name: destination.name, value });
      });
    } catch (error) {
      console.warn('[Ashfall] Map package load failed; transition cancelled.', error);
      this.transitioning = false;
      gameEvents.emit('map-loading', { active: false, name: destination.name, value: 0 });
      gameEvents.emit('toast', { text: `${destination.name} could not be loaded. You stayed on the current map.`, tone: 'danger' });
      return;
    }

    options.beforeCommit?.();
    const requestedPosition = options.position || entry;
    this.state.player.mapId = destination.id;
    this.state.player.entryPointId = resolvedEntryId || null;
    this.state.player.x = Phaser.Math.Clamp(Number(requestedPosition.x) || entry.x, 48, destination.width - 48);
    this.state.player.y = Phaser.Math.Clamp(Number(requestedPosition.y) || entry.y, 48, destination.height - 48);
    this.safeSave();
    this.cameras.main.fadeOut(170, 10, 4, 3);
    this.time.delayedCall(185, () => {
      gameEvents.emit('map-loading', { active: false, name: destination.name, value: 1 });
      this.scene.restart();
    });
  }

  async recoverPlayerVisual() {
    if (!this.player || !this.scene.isActive()) return;
    const missing = this.player.restoreVisual();
    if (!missing.length) return;
    console.warn('[Ashfall] Player visual textures missing after map handoff; recovering.', missing);
    try {
      await prepareMapAssets(this, this.state, this.currentMap.id);
      if (!this.scene.isActive() || !this.player) return;
      const stillMissing = this.player.restoreVisual();
      if (stillMissing.length) throw new Error(`Player visual recovery incomplete: ${stillMissing.join(', ')}`);
    } catch (error) {
      console.warn('[Ashfall] Player visual recovery failed.', error);
      gameEvents.emit('toast', { text: 'Player visuals could not be restored. Reload once and report this build.', tone: 'danger' });
    }
  }

  createPoiMarkers() {
    this.poiCooldowns = new Map();
    this.poiMarkers = new Map();
    this.pois = POI_DEFS.filter(poi => poi.mapId === this.currentMap.id);
    if (!this.state.worldFlags.poiStates || typeof this.state.worldFlags.poiStates !== 'object') this.state.worldFlags.poiStates = {};
    for (const poi of this.pois) {
      const marker = this.add.graphics().setDepth(poi.y + 8);
      const opened = this.state.worldFlags.poiStates[poi.id] === 'opened';
      if (poi.visual === 'cache') {
        marker.fillStyle(0x2a1710, 0.86).fillRoundedRect(poi.x - 18, poi.y - 12, 36, 24, 4);
        marker.lineStyle(2, opened ? 0x6e5a4b : 0xd39a54, opened ? 0.45 : 0.86).strokeRoundedRect(poi.x - 18, poi.y - 12, 36, 24, 4);
        marker.lineStyle(2, 0x1a0e0b, 0.85).lineBetween(poi.x - 16, poi.y - 1, poi.x + 16, poi.y - 1);
      } else if (poi.visual === 'shrine') {
        marker.fillStyle(0x2c3426, 0.65).fillCircle(poi.x, poi.y, 18);
        marker.lineStyle(3, 0xe1c772, 0.78).strokeCircle(poi.x, poi.y, 18);
        marker.lineStyle(2, 0x8ed79d, 0.62).strokeCircle(poi.x, poi.y, 11);
      } else if (poi.visual === 'rift') {
        marker.fillStyle(0x07060b, 0.72).fillEllipse(poi.x, poi.y, 66, 42);
        marker.lineStyle(3, 0xe3cd83, 0.68).strokeEllipse(poi.x, poi.y, 70, 46);
        marker.lineStyle(2, 0x9d5147, 0.58).lineBetween(poi.x - 10, poi.y - 18, poi.x + 8, poi.y + 19);
      } else {
        marker.fillStyle(0x403832, 0.78).fillRoundedRect(poi.x - 10, poi.y - 22, 20, 36, 4);
        marker.lineStyle(2, 0xcbb58c, 0.62).strokeRoundedRect(poi.x - 10, poi.y - 22, 20, 36, 4);
      }
      if (poi.visual === 'reliquary') {
        marker.fillStyle(0x272017, 0.90).fillRoundedRect(poi.x - 20, poi.y - 14, 40, 28, 5);
        marker.lineStyle(3, opened ? 0x6f6755 : 0xead58a, opened ? 0.42 : 0.84).strokeRoundedRect(poi.x - 20, poi.y - 14, 40, 28, 5);
        marker.fillStyle(0xcdb86f, opened ? 0.22 : 0.72).fillCircle(poi.x, poi.y - 1, 5);
      }
      if (opened) marker.setAlpha(0.48);
      this.poiMarkers.set(poi.id, marker);
    }
  }

  canReceivePoiItems(items = []) {
    let freeSlots = Math.max(0, 30 - this.state.inventory.length);
    for (const row of items) {
      const def = ITEM_DEFS[row.itemId];
      if (!def) return false;
      const max = Math.max(1, Math.floor(def.stackMax || 1));
      let remaining = Math.max(1, Math.floor(row.quantity || 1));
      if (max > 1) {
        const capacity = this.state.inventory
          .filter(item => item.itemId === row.itemId && item.rarity === (row.rarity || 'normal'))
          .reduce((sum, item) => sum + Math.max(0, max - (item.quantity || 1)), 0);
        remaining = Math.max(0, remaining - capacity);
      }
      const needed = Math.ceil(remaining / max);
      if (needed > freeSlots) return false;
      freeSlots -= needed;
    }
    return true;
  }

  usePoi(poi) {
    if (!poi) return;
    const flags = this.state.worldFlags.poiStates || (this.state.worldFlags.poiStates = {});
    if (poi.type === 'cache') {
      if (flags[poi.id] === 'opened') {
        gameEvents.emit('toast', { text: `${poi.name} is empty.`, tone: 'muted', short: true });
        return;
      }
      const items = poi.reward?.items || [];
      if (!this.canReceivePoiItems(items)) {
        gameEvents.emit('toast', { text: 'Your pack is too full to empty this cache.', tone: 'danger', short: true });
        return;
      }
      for (const row of items) this.inventory.add(this.inventory.createItem(row.itemId, row.rarity || 'normal', row.quantity || 1));
      const currency = Math.max(0, Number(poi.reward?.currency) || 0);
      this.state.player.currency += currency;
      flags[poi.id] = 'opened';
      this.poiMarkers.get(poi.id)?.setAlpha(0.48);
      const names = items.map(row => `${ITEM_DEFS[row.itemId]?.name || row.itemId}${(row.quantity || 1) > 1 ? ` ×${row.quantity}` : ''}`).join(', ');
      gameEvents.emit('toast', { text: `${poi.name}: ${currency ? `+${currency} ash${names ? ' • ' : ''}` : ''}${names || 'supplies recovered'}`, tone: 'noble' });
      this.emitState();
      this.safeSave();
      return;
    }
    if (poi.type === 'shrine') {
      const now = this.time.now;
      if (now < (this.poiCooldowns.get(poi.id) || 0)) {
        gameEvents.emit('toast', { text: `${poi.name} is quiet for now.`, tone: 'muted', short: true });
        return;
      }
      const stats = derivedStats(this.state);
      const hpGain = Math.max(1, Math.floor(stats.maxHp * (poi.recovery?.hpRatio || 0)));
      const essenceGain = Math.max(1, Math.floor(stats.maxEssence * (poi.recovery?.essenceRatio || 0)));
      this.state.player.hp = Math.min(stats.maxHp, this.state.player.hp + hpGain);
      this.state.player.essence = Math.min(stats.maxEssence, this.state.player.essence + essenceGain);
      this.poiCooldowns.set(poi.id, now + Math.max(5000, poi.recovery?.cooldownMs || 30000));
      gameEvents.emit('toast', { text: `${poi.name}: +${hpGain} HP • +${essenceGain} Essence`, tone: 'level', short: true });
      this.emitState();
      return;
    }
    if (poi.type === 'lore') {
      flags[poi.id] = flags[poi.id] || 'read';
      gameEvents.emit('dialogue', { speaker: poi.name, role: 'Discovery', text: poi.text || poi.detail, action: null, uiAction: null });
      this.safeSave();
    }
  }

  createRecoveryMarkers() {
    this.recoveryPoints = RECOVERY_POINTS.filter(point => point.mapId === this.currentMap.id);
    for (const point of this.recoveryPoints) {
      const marker = this.add.graphics().setDepth(point.y - 4);
      marker.fillStyle(0x244227, 0.42).fillCircle(point.x, point.y, 24);
      marker.lineStyle(3, 0x9fe58d, 0.92).strokeCircle(point.x, point.y, 24);
      marker.lineStyle(1, 0xffdf8a, 0.72).strokeCircle(point.x, point.y, 17);
      marker.fillStyle(0xffc968, 0.94).fillCircle(point.x, point.y - 2, 6);
      marker.fillStyle(0xfff0a6, 0.74).fillCircle(point.x, point.y - 11, 3);
      const healTag = this.add.text(point.x, point.y - 42, '✦ HEAL ✦', {
        fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'bold', color: '#c9f5b8', stroke: '#10220f', strokeThickness: 4
      }).setOrigin(0.5).setDepth(point.y + 36);
      this.tweens.add({ targets: [marker, healTag], alpha: { from: 0.72, to: 1 }, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.text(point.x, point.y + 31, `${point.name}
${point.label || 'Use'}`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', align: 'center', color: '#e5f5c8', stroke: '#170c0a', strokeThickness: 3
      }).setOrigin(0.5, 0).setDepth(point.y + 36);
    }
  }

  createEnemies() {
    this.enemies = [];
    const callbacks = {
      hitTarget: (target, amount, x, y, enemy) => this.combat?.enemyMeleeTarget(target, amount, x, y, enemy),
      beginAbility: (enemy, ability, target) => this.combat?.beginEnemyAbility(enemy, ability, target, enemy.abilityTargetX, enemy.abilityTargetY),
      triggerAbility: (enemy, ability, targetX, targetY, target) => this.combat?.triggerEnemyAbility(enemy, ability, targetX, targetY, target),
      damageNumber: (x, y, amount, hostile) => this.combat?.damageNumbers.show(x, y, amount, hostile),
      alertEncounter: (enemy, target, time) => this.alertEncounterGroup(enemy, target, time),
      died: enemy => this.onEnemyDied(enemy)
    };
    const spawnRows = DEBUG ? [...SPAWN_REGIONS, ...DEBUG_SPAWN_REGIONS] : SPAWN_REGIONS;
    for (const spawn of spawnRows) {
      if ((spawn.mapId || DEFAULT_MAP_ID) !== this.currentMap.id) continue;
      const def = ENEMY_DEFS[spawn.enemyId];
      for (let i = 0; i < spawn.count; i += 1) this.enemies.push(new Enemy(this, this.enemyGroup, def, spawn, i, callbacks));
    }
  }

  alertEncounterGroup(source, target, time = this.time.now) {
    const encounterId = source?.encounterId;
    if (!encounterId || !target) return;
    const encounter = encounterForId(encounterId);
    const radius = Math.max(80, Number(encounter?.alertRadius) || 260);
    const radiusSq = radius * radius;
    for (const ally of this.enemies || []) {
      if (ally === source || ally.encounterId !== encounterId || !ally.sprite?.active) continue;
      const dx = ally.sprite.x - source.sprite.x;
      const dy = ally.sprite.y - source.sprite.y;
      if (dx * dx + dy * dy > radiusSq) continue;
      ally.forceEncounterAggro(target, time);
    }
    this.alertFactionAllies(source, target, time, encounter);
  }

  alertFactionAllies(source, target, time, encounter = null) {
    const assistRadius = Math.max(0, Number(encounter?.assistRadius) || 0);
    if (!assistRadius || !source?.sprite?.active || !areHostile(source, target)) return;
    const assistCap = Math.max(1, Math.min(6, Number(encounter?.assistCap) || 2));
    const radiusSq = assistRadius * assistRadius;
    const candidates = [];
    for (const ally of this.enemies || []) {
      if (ally === source || ally.encounterId === source.encounterId || !ally.sprite?.active) continue;
      if (!areFriendly(source, ally) || !areHostile(ally, target)) continue;
      const dx = ally.sprite.x - source.sprite.x;
      const dy = ally.sprite.y - source.sprite.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > radiusSq) continue;
      candidates.push({ ally, d2 });
    }
    candidates.sort((a, b) => a.d2 - b.d2);
    for (const { ally } of candidates.slice(0, assistCap)) ally.forceEncounterAggro(target, time);
  }

  createNPCs() {
    const zoneIds = new Set(this.currentMap.zoneIds || []);
    this.npcs = Object.values(NPC_DEFS).filter(def => zoneIds.has(def.homeZone)).map(def => new NPC(this, def));
  }

  createAzrael() {
    this.azrael = null;
    if (AZRAEL_DEF.home.mapId !== this.currentMap.id) return;
    this.azrael = new Azrael(this, AZRAEL_DEF);
    // His hidden proxy obeys world bounds, but intentionally does not collide
    // with low terrain props: the field-test locomotion is a wing-assisted
    // hover/glide and should cross rocks instead of snagging like a walker.
  }

  triggerWorldEvent(event) {
    const members = encounterId => (this.enemies || []).filter(enemy => enemy.encounterId === encounterId && enemy.sprite?.active);
    if (event.kind === 'encounter_alert_player') {
      const actors = (event.encounterIds || []).flatMap(members);
      if (!actors.length) return false;
      for (const actor of actors) actor.forceEncounterAggro(this.player, this.time.now);
      if (actors[0]) this.alertEncounterGroup(actors[0], this.player, this.time.now);
      return true;
    }
    if (event.kind === 'faction_clash') {
      const [aId, bId] = event.encounterIds || [];
      const a = members(aId);
      const b = members(bId);
      if (!a.length || !b.length) return false;
      let best = null;
      for (const left of a) for (const right of b) {
        if (!areHostile(left, right)) continue;
        const dx = left.sprite.x - right.sprite.x, dy = left.sprite.y - right.sprite.y;
        const d2 = dx * dx + dy * dy;
        if (!best || d2 < best.d2) best = { left, right, d2 };
      }
      if (!best) return false;
      best.left.forceEncounterAggro(best.right, this.time.now);
      best.right.forceEncounterAggro(best.left, this.time.now);
      this.alertEncounterGroup(best.left, best.right, this.time.now);
      this.alertEncounterGroup(best.right, best.left, this.time.now);
      return true;
    }
    return false;
  }

  combatants() {
    const actors = [this.player, ...(this.enemies || [])];
    if (this.azrael && !this.azrael.dead) actors.push(this.azrael);
    return actors.filter(Boolean);
  }

  friendlyCombatants() {
    return this.combatants().filter(actor => actor === this.player || areFriendly(this.player, actor));
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
    // ArchAngel Azrael can clear mobs for the field test, but his solo kills do
    // not become an AFK XP/loot engine. Player rewards require recent material
    // contribution through the shared combat resolver.
    if (!enemy.playerRewardEligible?.(this.time.now)) return;
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
    for (const entry of RECOVERY_DROP_TABLE) {
      if (def.level < entry.minLevel || def.level > entry.maxLevel || Math.random() > entry.chance) continue;
      this.dropLoot(enemy.sprite.x, enemy.sprite.y, this.inventory.createItem(entry.itemId, 'normal'));
    }
    this.queueKillReward(def, coins);
    if (xpResult.levels) {
      gameEvents.emit('toast', { text: `Level ${this.state.player.level}! +5 stat points, +1 skill point`, tone: 'level' });
      this.combat?.skills.syncUnlocks(true);
    }
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

  hitPlayer(amount, x = this.player.body.x, y = this.player.body.y, enemy = null) {
    return this.combat?.enemyMelee(amount, x, y, enemy) || 0;
  }

  afterPlayerDamage(amount) {
    if (!amount) return;
    gameEvents.emit('hit', { damage: amount });
    if (this.player.dead && !this.deathAnnounced) {
      this.deathAnnounced = true;
      gameEvents.emit('death', { text: 'The ash takes you—but Cinder Refuge still calls.' });
    }
    this.emitState();
  }

  nearestInteraction() {
    let target = null;
    let nearestDistance = Infinity;
    for (const transition of this.mapTransitions || []) {
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, transition.x, transition.y);
      if (distance <= transition.radius && distance < nearestDistance) {
        target = { type: 'transition', target: transition, distance, label: 'Travel', detail: transition.label || 'Map transition' };
        nearestDistance = distance;
      }
    }
    if (target) return target;

    nearestDistance = Infinity;
    for (const poi of this.pois || []) {
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, poi.x, poi.y);
      if (distance <= poi.radius && distance < nearestDistance) {
        target = { type: 'poi', target: poi, distance, label: poi.type === 'cache' ? 'Search' : (poi.type === 'shrine' ? 'Touch' : 'Inspect'), detail: poi.name };
        nearestDistance = distance;
      }
    }
    if (target) return target;

    nearestDistance = Infinity;
    for (const point of this.recoveryPoints || []) {
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, point.x, point.y);
      if (distance <= point.radius && distance < nearestDistance) {
        target = { type: 'recovery', target: point, distance, label: 'Rest', detail: point.name || 'Recovery point' };
        nearestDistance = distance;
      }
    }
    if (target) return target;

    nearestDistance = 92;
    for (const npc of this.npcs || []) {
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, npc.x, npc.y);
      if (distance < nearestDistance) {
        target = { type: 'npc', target: npc, distance, label: 'Talk', detail: npc.def?.name || 'NPC' };
        nearestDistance = distance;
      }
    }
    if (target) return target;

    nearestDistance = 78;
    for (const drop of this.lootPool || []) {
      if (!drop.active) continue;
      const distance = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, drop.x, drop.y);
      if (distance < nearestDistance) {
        const def = drop.item && ITEM_DEFS[drop.item.itemId];
        target = { type: 'loot', target: drop, distance, label: 'Loot', detail: def?.name || 'Dropped item' };
        nearestDistance = distance;
      }
    }
    return target;
  }

  interactionSnapshot() {
    const interaction = this.nearestInteraction();
    return interaction
      ? { available: true, type: interaction.type, label: interaction.label, detail: interaction.detail }
      : { available: false, type: null, label: 'Use', detail: 'Nothing nearby' };
  }

  interact() {
    const interaction = this.nearestInteraction();
    if (!interaction) {
      gameEvents.emit('toast', { text: 'Nothing nearby to interact with.', tone: 'muted', short: true });
      return;
    }
    if (interaction.type === 'transition') {
      this.travelThroughTransition(interaction.target);
      return;
    }
    if (interaction.type === 'poi') {
      this.usePoi(interaction.target);
      return;
    }
    if (interaction.type === 'recovery') {
      this.recovery?.rest(interaction.target);
      return;
    }
    if (interaction.type === 'npc') {
      this.talkTo(interaction.target);
      return;
    }
    if (interaction.type === 'loot') {
      const nearestDrop = interaction.target;
      const item = nearestDrop.item;
      if (!this.inventory.add(item)) { gameEvents.emit('toast', { text: 'Inventory full (30 slots).', tone: 'danger' }); return; }
      this.tweens.killTweensOf(nearestDrop);
      nearestDrop.setActive(false).setVisible(false); nearestDrop.body.enable = false; nearestDrop.item = null;
      this.questSystem.recordCollect(item.itemId);
      const def = ITEM_DEFS[item.itemId];
      gameEvents.emit('toast', { text: `Picked up ${RARITY[item.rarity].label} ${def.name}${(item.quantity || 1) > 1 ? ` ×${item.quantity}` : ''}`, tone: item.rarity });
      this.emitState(); this.safeSave();
    }
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
    gameEvents.emit('dialogue', { speaker: npc.def.name, role: npc.def.role, text, action, uiAction: npc.def.id === 'npc_merchant' ? 'merchant' : null });
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
    if (this.currentMap.id !== DEFAULT_MAP_ID) {
      ensureTravelState(this.state).returnStack.length = 0;
      // Restore the live actor before the prepared map handoff, but keep the
      // temporary respawn position inside the current map. transitionToMap()
      // then commits the actual Refuge entry coordinates. This avoids both the
      // old wrong-map PLAYER_START jump and carrying zero HP into the restart.
      this.player.respawn(this.player.body.x, this.player.body.y);
      this.transitionToMap(DEFAULT_MAP_ID, 'cinder_start');
      return;
    }
    this.player.respawn(PLAYER_START.x, PLAYER_START.y);
    this.state.player.mapId = DEFAULT_MAP_ID;
    this.state.player.entryPointId = 'cinder_start';
    this.emitState();
    this.safeSave();
  }

  handleCommand(command) {
    if (!command) return;
    if (command.type === 'attack') actionInput.attackQueued = true;
    if (command.type === 'interact') actionInput.interactQueued = true;
    if (command.type === 'skill') {
      if (this.combat?.skills.useSlot(command.slot)) this.emitState();
    }
    if (command.type === 'useConsumable') this.recovery?.useInstance(command.instanceId);
    if (command.type === 'useQuickConsumable') this.recovery?.useQuick(command.slot);
    if (command.type === 'buyItem') this.buyMerchantItem(command.itemId);
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
    if (action === 'wardenhall') { this.transitionToMap('map_warden_hall', 'arrival'); return; }
    if (action === 'forge') { this.transitionToMap('map_torrens_forge', 'arrival'); return; }
    if (action === 'crypt') { this.transitionToMap('map_ashgrave_crypt', 'arrival'); return; }
    if (action === 'veil') { this.transitionToMap('map_veil_threshold', 'arrival'); return; }
    if (action === 'warfront') { this.transitionToMap('map_veil_warfront', 'veil_gate'); return; }
    if (action === 'burntcache') {
      if (this.currentMap.id !== 'map_cinder_wilds') { this.transitionToMap('map_cinder_wilds', 'from_refuge', { position: { x: 2200, y: 900 } }); return; }
      this.player.body.setPosition(2200, 900); return;
    }
    if (action === 'level') {
      const result = grantXp(this.state, 650);
      if (result.levels) this.combat?.skills.syncUnlocks(true);
    }
    if (action === 'vesra') moveNear(this.npcs.find(npc => npc.def.id === 'npc_vesra'));
    if (action === 'merchant') moveNear(this.npcs.find(npc => npc.def.id === 'npc_merchant'));
    if (action === 'imp') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_cinder_imp')?.sprite);
    if (action === 'blight') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_blight_imp')?.sprite);
    if (action === 'goblin') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ash_goblin')?.sprite);
    if (action === 'scavenger') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ash_scavenger')?.sprite);
    if (action === 'raider') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ironbound_raider')?.sprite);
    if (action === 'assassin') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ash_assassin')?.sprite);
    if (action === 'warband') {
      if (this.currentMap.id !== 'map_cinder_wilds') { this.transitionToMap('map_cinder_wilds', 'first_light_test'); return; }
      this.player.body.setPosition(3380, 920);
      this.player.visual.direction = 0;
      gameEvents.emit('toast', { text: 'Faction stress test: 12 Demon Legion troops vs First-Light defenders + Azrael.', tone: 'muted', short: true });
      return;
    }
    if (action === 'demonscout') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_demon_scout')?.sprite);
    if (action === 'hellfire') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_hellfire_demon')?.sprite);
    if (action === 'ashbone') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ashbone_demon')?.sprite);
    if (action === 'fleshborn') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_fleshborn_demon')?.sprite);
    if (action === 'sentinel') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_celestial_footsoldier')?.sprite);
    if (action === 'guardian') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_heavenly_guardian')?.sprite);
    if (action === 'spider') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_cave_spider')?.sprite);
    if (action === 'blueflame') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_blueflame_imp')?.sprite);
    if (action === 'emberweb') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ember_spider')?.sprite);
    if (action === 'carrion') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_carrion_beast')?.sprite);
    if (action === 'rotwing') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_rotwing_ravager')?.sprite);
    if (action === 'slate') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_slate_revenant')?.sprite);
    if (action === 'spearman') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_skeleton_spearman')?.sprite);
    if (action === 'archer') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_skeleton_archer')?.sprite);
    if (action === 'mage') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_skeleton_mage')?.sprite);
    if (action === 'bloodbone') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_bloodbone')?.sprite);
    if (action === 'gilded') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_gilded_guard')?.sprite);
    if (action === 'golem') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.id === 'enemy_ashstone_golem')?.sprite);
    if (action === 'boss') moveNear(this.enemies.find(enemy => enemy.sprite.active && enemy.def.named)?.sprite);
    if (action === 'azrael') moveNear(this.azrael?.body);
    if (action === 'azraelai') {
      const enabled = this.azrael?.setDebugEnabled(!this.azrael.debugEnabled);
      gameEvents.emit('toast', { text: enabled ? 'Azrael AI diagnostics on.' : 'Azrael AI diagnostics off.', tone: 'muted', short: true });
      this.emitState();
      return;
    }
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
    if (action === 'combatkit') {
      this.combat?.skills.refillAndUnlock();
      const derived = derivedStats(this.state);
      this.state.player.hp = derived.maxHp;
      this.combat?.statuses.clear(this.player);
      this.player.dead = false;
      this.deathAnnounced = false;
      gameEvents.emit('death-cleared');
    }
    if (action === 'recoverykit') {
      for (const [itemId, quantity] of [['consumable_ashblood_minor', 5], ['consumable_essence_minor', 5], ['consumable_cinder_ration', 3]]) {
        this.inventory.add(this.inventory.createItem(itemId, 'normal', quantity));
      }
      const derived = derivedStats(this.state);
      this.state.player.hp = Math.max(1, Math.floor(derived.maxHp * 0.35));
      this.state.player.essence = Math.max(0, Math.floor(derived.maxEssence * 0.25));
    }
    if (action === 'ranges') {
      const enabled = this.combat?.toggleRangeDebug();
      gameEvents.emit('toast', { text: enabled ? 'Combat ranges: cyan basic / orange Cleave.' : 'Combat range overlay off.', tone: 'muted', short: true });
      this.emitState();
      return;
    }
    if (action === 'wings') {
      this.state.worldFlags.wingsUnlocked = true;
      if (!this.state.inventory.some(item => item.itemId === 'wings_red_bat')) this.inventory.add(this.inventory.createItem('wings_red_bat', 'normal'));
    }
    if (action === 'fall') { this.state.player.hp = 1; this.hitPlayer(9999); }
    this.emitState();
    gameEvents.emit('toast', { text: `Diagnostic: ${action}`, tone: 'muted', short: true });
  }

  buyMerchantItem(itemId) {
    const stock = MERCHANT_SUPPLY_DEFS.find(entry => entry.itemId === itemId);
    const def = ITEM_DEFS[itemId];
    if (!stock || !def) return;
    if (this.state.player.currency < stock.price) {
      gameEvents.emit('toast', { text: `Need ${stock.price} ash for ${def.name}.`, tone: 'danger', short: true });
      return;
    }
    const item = this.inventory.createItem(itemId, 'normal');
    if (!this.inventory.add(item)) {
      gameEvents.emit('toast', { text: 'Pack is full. Make room before buying supplies.', tone: 'danger' });
      return;
    }
    this.state.player.currency -= stock.price;
    gameEvents.emit('toast', { text: `Bought ${def.name} • ${stock.price} ash`, tone: 'normal', short: true });
    this.emitState();
    this.safeSave();
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

  updateArea() {
    const allowed = new Set(this.currentMap.areaIds || []);
    const area = AREA_DEFS.find(entry => allowed.has(entry.id) && pointInRectArea(entry, this.player.body.x, this.player.body.y));
    if (area?.id !== this.currentArea?.id) { this.currentArea = area; if (area) gameEvents.emit('area', area); }
  }

  emitState() {
    const derived = derivedStats(this.state);
    this.state.player.hp = Math.min(this.state.player.hp, derived.maxHp);
    this.state.player.essence = Math.min(this.state.player.essence, derived.maxEssence);
    gameEvents.emit('state', { state: this.state, derived, quests: this.questSystem?.activeSummary() || [], combat: this.combat?.snapshot(this.time.now) || { skills: [], effects: [] }, recovery: this.recovery?.snapshot(this.time.now) || { quick: [], food: { active: false }, passive: { active: false } }, interaction: this.interactionSnapshot(), azrael: this.azrael?.snapshot(this.time.now) || null });
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
    // Gold = ArchAngel Azrael's compact combat/navigation proxy.
    if (this.azrael && !this.azrael.dead) drawBody(this.azrael.body?.body, 0xffd86b, 0.72);
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
    this.combat?.update(time, delta);
    this.recovery?.update(time, delta);
    this.player.update(time, delta);
    this.worldEvents?.update(time);
    for (let slot = 0; slot < 3; slot += 1) if (actionInput.consumeSkill(slot)) this.combat?.skills.useSlot(slot);
    if (actionInput.consumeRecovery(0)) this.recovery?.useQuick('health');
    if (actionInput.consumeRecovery(1)) this.recovery?.useQuick('essence');
    if (DEBUG) this.drawDynamicCollisionDebug();
    if (actionInput.consumeInteract()) this.interact();
    this.azrael?.update(time, delta, this.enemies);
    const combatants = this.combatants();
    for (const enemy of this.enemies) enemy.update(time, delta, this.player, combatants);
    for (const npc of this.npcs) npc.update(time, delta, this.player);
    this.updateZone();
    this.updateArea();
    if (time - this.lastHudUpdate > 120) { this.lastHudUpdate = time; this.emitState(); }
    if (time - this.lastSave > 10000) { this.lastSave = time; this.safeSave(); }
  }
}
