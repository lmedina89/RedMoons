const basicLoot = Object.freeze({ normal: 0.72, magic: 0.24, noble: 0.04 });
const goodLoot = Object.freeze({ normal: 0.55, magic: 0.37, noble: 0.08 });

export const ENEMY_DEFS = Object.freeze({
  enemy_cinder_imp: {
    id: 'enemy_cinder_imp', name: 'Cinder Imp', family: 'imp', variant: 'cinder', level: 1, maxHp: 32, attack: 7, defense: 1,
    speed: 72, detectRange: 245, attackRange: 45, leashRange: 360, attackCooldown: 1100, recoverMs: 420,
    xp: 22, currency: [1, 4], walkTexture: 'imp-red-sword-walk', attackTexture: 'imp-red-sword-attack', walkFrames: 4, attackFrames: 4,
    visualPool: [
      { walkTexture: 'imp-red-sword-walk', attackTexture: 'imp-red-sword-attack', weight: 46 },
      { walkTexture: 'imp-red-pitchfork-walk', attackTexture: 'imp-red-pitchfork-attack', weight: 34 },
      { walkTexture: 'imp-red-sword-shield-walk', attackTexture: 'imp-red-sword-shield-attack', weight: 20 }
    ],
    loot: [
      { itemId: 'quest_ember_heart', chance: 0.08, rarityWeights: { normal: 1 } },
      { itemId: 'feet_leather_revised', chance: 0.03, rarityWeights: { normal: 0.78, magic: 0.22 } },
      { itemId: 'shoulders_leather_revised', chance: 0.025, rarityWeights: { normal: 0.80, magic: 0.20 } },
      { itemId: 'weapon_brass_arming_sword', chance: 0.02, rarityWeights: { normal: 0.76, magic: 0.24 } }
    ]
  },

  enemy_blight_imp: {
    id: 'enemy_blight_imp', name: 'Blight Imp', family: 'imp', variant: 'blight', level: 2, maxHp: 43, attack: 9, defense: 2,
    speed: 76, detectRange: 280, attackRange: 47, leashRange: 390, attackCooldown: 1050, recoverMs: 390, abilities: ['toxic_spit'],
    xp: 30, currency: [2, 5], walkTexture: 'imp-green-pitchfork-walk', attackTexture: 'imp-green-pitchfork-attack', walkFrames: 4, attackFrames: 4,
    visualPool: [
      { walkTexture: 'imp-green-pitchfork-walk', attackTexture: 'imp-green-pitchfork-attack', weight: 45 },
      { walkTexture: 'imp-green-sword-walk', attackTexture: 'imp-green-sword-attack', weight: 35 },
      { walkTexture: 'imp-green-pitchfork-shield-walk', attackTexture: 'imp-green-pitchfork-shield-attack', weight: 20 }
    ],
    loot: [
      { itemId: 'feet_leather_revised', chance: 0.038, rarityWeights: basicLoot },
      { itemId: 'shoulders_leather_revised', chance: 0.033, rarityWeights: basicLoot },
      { itemId: 'weapon_brass_arming_sword', chance: 0.020, rarityWeights: basicLoot },
      { itemId: 'weapon_bronze_arming_sword', chance: 0.014, rarityWeights: basicLoot }
    ]
  },

  enemy_blueflame_imp: {
    id: 'enemy_blueflame_imp', name: 'Blueflame Imp', family: 'imp', variant: 'blueflame', level: 4, maxHp: 76, attack: 14, defense: 4,
    speed: 80, detectRange: 340, attackRange: 49, leashRange: 440, attackCooldown: 980, recoverMs: 350, abilities: ['blueflame_bolt'],
    xp: 61, currency: [5, 10], walkTexture: 'imp-blue-sword-walk', attackTexture: 'imp-blue-sword-attack', walkFrames: 4, attackFrames: 4,
    visualPool: [
      { walkTexture: 'imp-blue-sword-walk', attackTexture: 'imp-blue-sword-attack', weight: 45 },
      { walkTexture: 'imp-blue-pitchfork-walk', attackTexture: 'imp-blue-pitchfork-attack', weight: 35 },
      { walkTexture: 'imp-blue-sword-shield-walk', attackTexture: 'imp-blue-sword-shield-attack', weight: 20 }
    ],
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.042, rarityWeights: goodLoot },
      { itemId: 'weapon_iron_arming_sword', chance: 0.024, rarityWeights: goodLoot },
      { itemId: 'weapon_steel_arming_sword', chance: 0.014, rarityWeights: goodLoot },
      { itemId: 'chest_silver_legion', chance: 0.016, rarityWeights: { normal: 0.48, magic: 0.44, noble: 0.08 } }
    ]
  },

  enemy_ash_goblin: {
    id: 'enemy_ash_goblin', name: 'Ash Goblin Raider', family: 'goblin', level: 2, maxHp: 49, attack: 10, defense: 2,
    speed: 75, detectRange: 275, attackRange: 46, leashRange: 410, attackCooldown: 1040, recoverMs: 380,
    xp: 34, currency: [2, 6], walkTexture: 'goblin-walk', attackTexture: 'goblin-attack', walkFrames: 8, attackFrames: 3, originY: 0.72, directionRows: [2, 3, 0, 1],
    loot: [
      { itemId: 'weapon_copper_arming_sword', chance: 0.026, rarityWeights: basicLoot },
      { itemId: 'weapon_bronze_arming_sword', chance: 0.016, rarityWeights: basicLoot },
      { itemId: 'feet_leather_revised', chance: 0.034, rarityWeights: basicLoot },
      { itemId: 'head_bronze_revised', chance: 0.022, rarityWeights: basicLoot }
    ]
  },

  enemy_cave_spider: {
    id: 'enemy_cave_spider', name: 'Cave Spider', family: 'spider', variant: 'cave', level: 2, maxHp: 38, attack: 9, defense: 1,
    speed: 88, detectRange: 245, attackRange: 43, leashRange: 380, attackCooldown: 930, recoverMs: 300,
    xp: 27, currency: [1, 4], walkTexture: 'cave-spider-walk', attackTexture: 'cave-spider-attack', walkFrames: 6, attackFrames: 4, scale: 0.92, originY: 0.68,
    loot: [
      { itemId: 'feet_leather_revised', chance: 0.025, rarityWeights: basicLoot },
      { itemId: 'shoulders_leather_revised', chance: 0.018, rarityWeights: basicLoot }
    ]
  },

  enemy_ember_spider: {
    id: 'enemy_ember_spider', name: 'Emberweb Spider', family: 'spider', variant: 'ember', level: 4, maxHp: 72, attack: 14, defense: 3,
    speed: 91, detectRange: 280, attackRange: 45, leashRange: 430, attackCooldown: 880, recoverMs: 280,
    xp: 58, currency: [4, 9], walkTexture: 'ember-spider-walk', attackTexture: 'ember-spider-attack', walkFrames: 6, attackFrames: 4, scale: 0.98, originY: 0.68,
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.032, rarityWeights: goodLoot },
      { itemId: 'weapon_iron_arming_sword', chance: 0.024, rarityWeights: goodLoot }
    ]
  },

  enemy_frost_spider: {
    id: 'enemy_frost_spider', name: 'Paleweb Spider', family: 'spider', variant: 'pale', level: 5, maxHp: 93, attack: 16, defense: 4,
    speed: 86, detectRange: 300, attackRange: 46, leashRange: 450, attackCooldown: 900, recoverMs: 300,
    xp: 76, currency: [6, 11], walkTexture: 'frost-spider-walk', attackTexture: 'frost-spider-attack', walkFrames: 6, attackFrames: 4, scale: 1.02, originY: 0.68,
    loot: [
      { itemId: 'chest_silver_legion', chance: 0.028, rarityWeights: goodLoot },
      { itemId: 'head_iron_revised', chance: 0.025, rarityWeights: goodLoot }
    ]
  },

  enemy_mire_spider: {
    id: 'enemy_mire_spider', name: 'Mire Spider', family: 'spider', variant: 'mire', level: 5, maxHp: 99, attack: 17, defense: 4,
    speed: 84, detectRange: 300, attackRange: 46, leashRange: 450, attackCooldown: 920, recoverMs: 310,
    xp: 80, currency: [6, 12], walkTexture: 'mire-spider-walk', attackTexture: 'mire-spider-attack', walkFrames: 6, attackFrames: 4, scale: 1.03, originY: 0.68,
    loot: [
      { itemId: 'chest_steel_plate', chance: 0.022, rarityWeights: goodLoot },
      { itemId: 'weapon_iron_arming_sword', chance: 0.025, rarityWeights: goodLoot }
    ]
  },

  enemy_ashstone_golem: {
    id: 'enemy_ashstone_golem', name: 'Ashstone Golem', family: 'construct', variant: 'ashstone', level: 7, maxHp: 260, attack: 23, defense: 10,
    speed: 44, detectRange: 310, attackRange: 62, leashRange: 470, attackCooldown: 1350, recoverMs: 520, abilities: ['earthshatter'],
    xp: 235, currency: [18, 30], walkTexture: 'golem-walk', attackTexture: 'golem-attack', walkFrames: 7, attackFrames: 7,
    scale: 1.08, originY: 0.72, attackOriginY: 0.80, body: { width: 30, height: 24, offsetX: 17, offsetY: 36 },
    deathTexture: 'golem-death', deathFrames: 7, deathFrameMs: 105, deathDirectionRows: [0, 0, 0, 0], deathOriginY: 0.72,
    loot: [
      { itemId: 'chest_steel_plate', chance: 0.14, rarityWeights: { magic: 0.72, noble: 0.28 } },
      { itemId: 'weapon_ceramic_arming_sword', chance: 0.070, rarityWeights: { magic: 0.70, noble: 0.30 } },
      { itemId: 'weapon_steel_arming_sword', chance: 0.060, rarityWeights: { magic: 0.74, noble: 0.26 } },
      { itemId: 'head_iron_revised', chance: 0.10, rarityWeights: { magic: 0.78, noble: 0.22 } }
    ]
  },

  enemy_carrion_beast: {
    id: 'enemy_carrion_beast', name: 'Carrion Beast', family: 'carrion', level: 2, maxHp: 46, attack: 9, defense: 2,
    speed: 78, detectRange: 260, attackRange: 47, leashRange: 390, attackCooldown: 1080, recoverMs: 390,
    xp: 31, currency: [2, 5], walkTexture: 'beast-zombie-walk', attackTexture: 'beast-zombie-slash', walkFrames: 9, attackFrames: 6, scale: 1.04,
    loot: [
      { itemId: 'shoulders_leather_revised', chance: 0.045, rarityWeights: basicLoot },
      { itemId: 'feet_leather_revised', chance: 0.04, rarityWeights: basicLoot },
      { itemId: 'weapon_brass_arming_sword', chance: 0.022, rarityWeights: basicLoot }
    ]
  },

  enemy_rotwing_ravager: {
    id: 'enemy_rotwing_ravager', name: 'Rotwing Ravager', family: 'rotwing', level: 3, maxHp: 70, attack: 12, defense: 3,
    speed: 82, detectRange: 300, attackRange: 50, leashRange: 430, attackCooldown: 980, recoverMs: 340,
    xp: 52, currency: [4, 8], walkTexture: 'rotwing-zombie-walk', attackTexture: 'rotwing-zombie-slash', walkFrames: 9, attackFrames: 6, scale: 1.08,
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.045, rarityWeights: goodLoot },
      { itemId: 'weapon_brass_arming_sword', chance: 0.04, rarityWeights: goodLoot },
      { itemId: 'chest_silver_legion', chance: 0.018, rarityWeights: { normal: 0.48, magic: 0.44, noble: 0.08 } }
    ]
  },

  enemy_ash_skeleton: {
    id: 'enemy_ash_skeleton', name: 'Ash Skeleton', family: 'skeleton', level: 3, maxHp: 58, attack: 11, defense: 3,
    speed: 62, detectRange: 275, attackRange: 48, leashRange: 420, attackCooldown: 1250, recoverMs: 520,
    xp: 42, currency: [3, 7], layered: true, baseVisual: 'enemy_skeleton_base', walkFrames: 9, attackFrames: 6,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_rustblade', weight: 34 }, { itemId: 'weapon_arming_sword', weight: 24 }, { itemId: 'weapon_copper_arming_sword', weight: 12 }, { itemId: 'weapon_bronze_arming_sword', weight: 8 }, { itemId: 'weapon_katana_npc', weight: 12 }, { itemId: null, weight: 10 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 22 }, { itemId: null, weight: 78 }],
      head: [{ itemId: 'head_chain_coif', weight: 28 }, { itemId: 'head_bronze_revised', weight: 10 }, { itemId: null, weight: 62 }],
      chest: [{ itemId: 'chest_cinderhide', weight: 24 }, { itemId: 'chest_wayfarer', weight: 14 }, { itemId: null, weight: 62 }],
      shoulders: [{ itemId: 'shoulders_legion', weight: 12 }, { itemId: null, weight: 88 }],
      hands: [{ itemId: 'hands_iron', weight: 16 }, { itemId: null, weight: 84 }],
      feet: [{ itemId: 'feet_iron', weight: 18 }, { itemId: 'feet_road_boots', weight: 20 }, { itemId: null, weight: 62 }]
    },
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.055, rarityWeights: { normal: 0.66, magic: 0.29, noble: 0.05 } },
      { itemId: 'weapon_brass_arming_sword', chance: 0.030, rarityWeights: { normal: 0.62, magic: 0.32, noble: 0.06 } },
      { itemId: 'weapon_bronze_arming_sword', chance: 0.024, rarityWeights: { normal: 0.60, magic: 0.33, noble: 0.07 } },
      { itemId: 'hands_legion', chance: 0.04, rarityWeights: { normal: 0.60, magic: 0.33, noble: 0.07 } },
      { itemId: 'head_iron_revised', chance: 0.035, rarityWeights: { normal: 0.56, magic: 0.36, noble: 0.08 } },
      { itemId: 'chest_silver_legion', chance: 0.025, rarityWeights: { normal: 0.48, magic: 0.42, noble: 0.10 } }
    ]
  },

  enemy_skeleton_spearman: {
    id: 'enemy_skeleton_spearman', name: 'Bone Spearman', family: 'skeleton', variant: 'spearman', level: 4, maxHp: 82, attack: 14, defense: 4,
    speed: 64, detectRange: 340, attackRange: 76, leashRange: 455, attackCooldown: 1280, recoverMs: 450, abilities: ['bone_lunge'], meleeAnimation: 'thrust',
    xp: 64, currency: [5, 10], layered: true, baseVisual: 'enemy_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.04,
    fixedLoadout: { weapon: 'weapon_bone_spear_npc' },
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.035, rarityWeights: basicLoot },
      { itemId: 'hands_legion', chance: 0.032, rarityWeights: basicLoot },
      { itemId: 'weapon_bronze_arming_sword', chance: 0.020, rarityWeights: basicLoot }
    ]
  },

  enemy_skeleton_archer: {
    id: 'enemy_skeleton_archer', name: 'Bone Archer', family: 'skeleton', variant: 'archer', level: 4, maxHp: 72, attack: 13, defense: 3,
    speed: 66, detectRange: 420, attackRange: 42, leashRange: 470, attackCooldown: 1320, recoverMs: 430, abilities: ['bone_arrow'],
    xp: 58, currency: [4, 9], layered: true, baseVisual: 'enemy_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.02,
    fixedLoadout: { weapon: 'weapon_bone_bow_npc' },
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.035, rarityWeights: basicLoot },
      { itemId: 'feet_leather_revised', chance: 0.045, rarityWeights: basicLoot },
      { itemId: 'weapon_bronze_arming_sword', chance: 0.018, rarityWeights: basicLoot }
    ]
  },

  enemy_skeleton_mage: {
    id: 'enemy_skeleton_mage', name: 'Gravecaller', family: 'skeleton', variant: 'mage', level: 5, maxHp: 88, attack: 16, defense: 3,
    speed: 58, detectRange: 390, attackRange: 42, leashRange: 470, attackCooldown: 1380, recoverMs: 470, abilities: ['grave_hex'],
    xp: 78, currency: [6, 12], layered: true, baseVisual: 'enemy_slate_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.04,
    fixedLoadout: {},
    resistances: { shadow: 0.22 },
    loot: [
      { itemId: 'head_iron_revised', chance: 0.040, rarityWeights: goodLoot },
      { itemId: 'chest_silver_legion', chance: 0.032, rarityWeights: goodLoot },
      { itemId: 'weapon_iron_arming_sword', chance: 0.020, rarityWeights: goodLoot }
    ]
  },

  enemy_slate_revenant: {
    id: 'enemy_slate_revenant', name: 'Slate Revenant', family: 'skeleton', variant: 'slate', level: 4, maxHp: 84, attack: 14, defense: 4,
    speed: 64, detectRange: 300, attackRange: 50, leashRange: 450, attackCooldown: 1180, recoverMs: 470,
    xp: 66, currency: [5, 10], layered: true, baseVisual: 'enemy_slate_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.04,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_arming_sword', weight: 24 }, { itemId: 'weapon_bronze_arming_sword', weight: 20 }, { itemId: 'weapon_iron_arming_sword', weight: 16 }, { itemId: 'weapon_katana_npc', weight: 18 }, { itemId: 'weapon_rustblade', weight: 12 }, { itemId: null, weight: 10 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 34 }, { itemId: null, weight: 66 }],
      head: [{ itemId: 'head_chain_coif', weight: 32 }, { itemId: 'head_warden', weight: 10 }, { itemId: null, weight: 58 }],
      chest: [{ itemId: 'chest_ash_plate', weight: 18 }, { itemId: 'chest_cinderhide', weight: 30 }, { itemId: null, weight: 52 }],
      hands: [{ itemId: 'hands_iron', weight: 32 }, { itemId: null, weight: 68 }],
      feet: [{ itemId: 'feet_iron', weight: 32 }, { itemId: 'feet_revised', weight: 8 }, { itemId: null, weight: 60 }]
    },
    loot: [
      { itemId: 'weapon_iron_arming_sword', chance: 0.030, rarityWeights: goodLoot },
      { itemId: 'weapon_steel_arming_sword', chance: 0.020, rarityWeights: goodLoot },
      { itemId: 'chest_silver_legion', chance: 0.04, rarityWeights: goodLoot },
      { itemId: 'head_iron_revised', chance: 0.04, rarityWeights: goodLoot }
    ]
  },

  enemy_bloodbone: {
    id: 'enemy_bloodbone', name: 'Bloodbone Reaver', family: 'skeleton', variant: 'blood', level: 5, maxHp: 108, attack: 17, defense: 5,
    speed: 72, detectRange: 320, attackRange: 53, leashRange: 480, attackCooldown: 1020, recoverMs: 360,
    xp: 92, currency: [8, 14], layered: true, baseVisual: 'enemy_blood_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.06,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_katana_npc', weight: 28 }, { itemId: 'weapon_steel_arming_sword', weight: 24 }, { itemId: 'weapon_iron_arming_sword', weight: 20 }, { itemId: 'weapon_arming_sword', weight: 14 }, { itemId: 'weapon_rustblade', weight: 8 }, { itemId: null, weight: 6 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 20 }, { itemId: null, weight: 80 }],
      chest: [{ itemId: 'chest_ash_plate', weight: 30 }, { itemId: 'chest_cinderhide', weight: 18 }, { itemId: null, weight: 52 }],
      shoulders: [{ itemId: 'shoulders_legion', weight: 24 }, { itemId: null, weight: 76 }],
      hands: [{ itemId: 'hands_iron', weight: 36 }, { itemId: null, weight: 64 }],
      feet: [{ itemId: 'feet_iron', weight: 38 }, { itemId: null, weight: 62 }]
    },
    loot: [
      { itemId: 'weapon_steel_arming_sword', chance: 0.045, rarityWeights: { normal: 0.42, magic: 0.46, noble: 0.12 } },
      { itemId: 'weapon_ceramic_arming_sword', chance: 0.018, rarityWeights: { normal: 0.28, magic: 0.54, noble: 0.18 } },
      { itemId: 'chest_steel_plate', chance: 0.035, rarityWeights: { normal: 0.35, magic: 0.50, noble: 0.15 } },
      { itemId: 'hands_legion', chance: 0.055, rarityWeights: goodLoot }
    ]
  },

  enemy_gilded_guard: {
    id: 'enemy_gilded_guard', name: 'Gilded Ossuary Guard', family: 'skeleton', variant: 'gilded', level: 6, maxHp: 142, attack: 19, defense: 7,
    speed: 60, detectRange: 325, attackRange: 55, leashRange: 500, attackCooldown: 1160, recoverMs: 410,
    xp: 125, currency: [12, 19], layered: true, baseVisual: 'enemy_gilded_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.08,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_gold_arming_sword', weight: 22 }, { itemId: 'weapon_steel_arming_sword', weight: 28 }, { itemId: 'weapon_arming_sword', weight: 20 }, { itemId: 'weapon_katana_npc', weight: 16 }, { itemId: 'weapon_rustblade', weight: 8 }, { itemId: null, weight: 6 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 48 }, { itemId: null, weight: 52 }],
      head: [{ itemId: 'head_warden', weight: 34 }, { itemId: 'head_chain_coif', weight: 24 }, { itemId: null, weight: 42 }],
      chest: [{ itemId: 'chest_ash_plate', weight: 42 }, { itemId: null, weight: 58 }],
      shoulders: [{ itemId: 'shoulders_legion', weight: 32 }, { itemId: null, weight: 68 }],
      hands: [{ itemId: 'hands_iron', weight: 52 }, { itemId: null, weight: 48 }],
      feet: [{ itemId: 'feet_iron', weight: 54 }, { itemId: null, weight: 46 }]
    },
    loot: [
      { itemId: 'chest_steel_plate', chance: 0.075, rarityWeights: { magic: 0.76, noble: 0.24 } },
      { itemId: 'weapon_gold_arming_sword', chance: 0.045, rarityWeights: { magic: 0.70, noble: 0.30 } },
      { itemId: 'weapon_steel_arming_sword', chance: 0.050, rarityWeights: { magic: 0.78, noble: 0.22 } },
      { itemId: 'head_iron_revised', chance: 0.07, rarityWeights: { magic: 0.80, noble: 0.20 } }
    ]
  },

  enemy_bone_captain: {
    id: 'enemy_bone_captain', name: 'Captain Ossivar', family: 'skeleton', named: true, level: 7, maxHp: 220, attack: 21, defense: 8,
    speed: 68, detectRange: 350, attackRange: 58, leashRange: 540, attackCooldown: 1000, recoverMs: 350,
    xp: 220, currency: [22, 34], layered: true, baseVisual: 'enemy_slate_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.18,
    fixedLoadout: {
      weapon: 'weapon_katana_npc', offhand: 'offhand_wood_guard', head: 'head_warden', shoulders: 'shoulders_legion',
      chest: 'chest_ash_plate', hands: 'hands_iron', feet: 'feet_iron'
    },
    loot: [
      { itemId: 'chest_silver_legion', chance: 0.30, rarityWeights: { magic: 0.66, noble: 0.34 } },
      { itemId: 'chest_legion', chance: 0.22, rarityWeights: { magic: 0.64, noble: 0.36 } },
      { itemId: 'weapon_gold_arming_sword', chance: 0.14, rarityWeights: { magic: 0.58, noble: 0.42 } },
      { itemId: 'weapon_steel_arming_sword', chance: 0.16, rarityWeights: { magic: 0.68, noble: 0.32 } },
      { itemId: 'chest_steel_plate', chance: 0.16, rarityWeights: { magic: 0.55, noble: 0.45 } },
      { itemId: 'head_iron_revised', chance: 0.14, rarityWeights: { magic: 0.64, noble: 0.36 } }
    ]
  }
});
