const basicLoot = Object.freeze({ normal: 0.72, magic: 0.24, noble: 0.04 });
const goodLoot = Object.freeze({ normal: 0.55, magic: 0.37, noble: 0.08 });

export const ENEMY_DEFS = Object.freeze({
  enemy_cinder_imp: {
    id: 'enemy_cinder_imp', name: 'Cinder Imp', family: 'imp', level: 1, maxHp: 32, attack: 7, defense: 1,
    speed: 72, detectRange: 245, attackRange: 45, leashRange: 360, attackCooldown: 1100, recoverMs: 420,
    xp: 22, currency: [1, 4], walkTexture: 'imp-walk', attackTexture: 'imp-attack', walkFrames: 4, attackFrames: 4,
    loot: [
      { itemId: 'quest_ember_heart', chance: 0.08, rarityWeights: { normal: 1 } },
      { itemId: 'feet_leather_revised', chance: 0.03, rarityWeights: { normal: 0.78, magic: 0.22 } },
      { itemId: 'shoulders_leather_revised', chance: 0.025, rarityWeights: { normal: 0.80, magic: 0.20 } },
      { itemId: 'weapon_brass_arming_sword', chance: 0.02, rarityWeights: { normal: 0.76, magic: 0.24 } }
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
      weapon: [{ itemId: 'weapon_rustblade', weight: 45 }, { itemId: 'weapon_arming_sword', weight: 28 }, { itemId: 'weapon_katana_npc', weight: 15 }, { itemId: null, weight: 12 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 22 }, { itemId: null, weight: 78 }],
      head: [{ itemId: 'head_chain_coif', weight: 28 }, { itemId: 'head_bronze_revised', weight: 10 }, { itemId: null, weight: 62 }],
      chest: [{ itemId: 'chest_cinderhide', weight: 24 }, { itemId: 'chest_wayfarer', weight: 14 }, { itemId: null, weight: 62 }],
      shoulders: [{ itemId: 'shoulders_legion', weight: 12 }, { itemId: null, weight: 88 }],
      hands: [{ itemId: 'hands_iron', weight: 16 }, { itemId: null, weight: 84 }],
      feet: [{ itemId: 'feet_iron', weight: 18 }, { itemId: 'feet_road_boots', weight: 20 }, { itemId: null, weight: 62 }]
    },
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.055, rarityWeights: { normal: 0.66, magic: 0.29, noble: 0.05 } },
      { itemId: 'weapon_brass_arming_sword', chance: 0.045, rarityWeights: { normal: 0.62, magic: 0.32, noble: 0.06 } },
      { itemId: 'hands_legion', chance: 0.04, rarityWeights: { normal: 0.60, magic: 0.33, noble: 0.07 } },
      { itemId: 'head_iron_revised', chance: 0.035, rarityWeights: { normal: 0.56, magic: 0.36, noble: 0.08 } },
      { itemId: 'chest_silver_legion', chance: 0.025, rarityWeights: { normal: 0.48, magic: 0.42, noble: 0.10 } }
    ]
  },

  enemy_slate_revenant: {
    id: 'enemy_slate_revenant', name: 'Slate Revenant', family: 'skeleton', variant: 'slate', level: 4, maxHp: 84, attack: 14, defense: 4,
    speed: 64, detectRange: 300, attackRange: 50, leashRange: 450, attackCooldown: 1180, recoverMs: 470,
    xp: 66, currency: [5, 10], layered: true, baseVisual: 'enemy_slate_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.04,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_arming_sword', weight: 38 }, { itemId: 'weapon_katana_npc', weight: 30 }, { itemId: 'weapon_rustblade', weight: 22 }, { itemId: null, weight: 10 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 34 }, { itemId: null, weight: 66 }],
      head: [{ itemId: 'head_chain_coif', weight: 32 }, { itemId: 'head_warden', weight: 10 }, { itemId: null, weight: 58 }],
      chest: [{ itemId: 'chest_ash_plate', weight: 18 }, { itemId: 'chest_cinderhide', weight: 30 }, { itemId: null, weight: 52 }],
      hands: [{ itemId: 'hands_iron', weight: 32 }, { itemId: null, weight: 68 }],
      feet: [{ itemId: 'feet_iron', weight: 32 }, { itemId: 'feet_revised', weight: 8 }, { itemId: null, weight: 60 }]
    },
    loot: [
      { itemId: 'weapon_iron_arming_sword', chance: 0.045, rarityWeights: goodLoot },
      { itemId: 'chest_silver_legion', chance: 0.04, rarityWeights: goodLoot },
      { itemId: 'head_iron_revised', chance: 0.04, rarityWeights: goodLoot }
    ]
  },

  enemy_bloodbone: {
    id: 'enemy_bloodbone', name: 'Bloodbone Reaver', family: 'skeleton', variant: 'blood', level: 5, maxHp: 108, attack: 17, defense: 5,
    speed: 72, detectRange: 320, attackRange: 53, leashRange: 480, attackCooldown: 1020, recoverMs: 360,
    xp: 92, currency: [8, 14], layered: true, baseVisual: 'enemy_blood_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.06,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_katana_npc', weight: 38 }, { itemId: 'weapon_arming_sword', weight: 34 }, { itemId: 'weapon_rustblade', weight: 18 }, { itemId: null, weight: 10 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 20 }, { itemId: null, weight: 80 }],
      chest: [{ itemId: 'chest_ash_plate', weight: 30 }, { itemId: 'chest_cinderhide', weight: 18 }, { itemId: null, weight: 52 }],
      shoulders: [{ itemId: 'shoulders_legion', weight: 24 }, { itemId: null, weight: 76 }],
      hands: [{ itemId: 'hands_iron', weight: 36 }, { itemId: null, weight: 64 }],
      feet: [{ itemId: 'feet_iron', weight: 38 }, { itemId: null, weight: 62 }]
    },
    loot: [
      { itemId: 'weapon_iron_arming_sword', chance: 0.06, rarityWeights: { normal: 0.42, magic: 0.46, noble: 0.12 } },
      { itemId: 'chest_steel_plate', chance: 0.035, rarityWeights: { normal: 0.35, magic: 0.50, noble: 0.15 } },
      { itemId: 'hands_legion', chance: 0.055, rarityWeights: goodLoot }
    ]
  },

  enemy_gilded_guard: {
    id: 'enemy_gilded_guard', name: 'Gilded Ossuary Guard', family: 'skeleton', variant: 'gilded', level: 6, maxHp: 142, attack: 19, defense: 7,
    speed: 60, detectRange: 325, attackRange: 55, leashRange: 500, attackCooldown: 1160, recoverMs: 410,
    xp: 125, currency: [12, 19], layered: true, baseVisual: 'enemy_gilded_skeleton_base', walkFrames: 9, attackFrames: 6, scale: 1.08,
    equipmentPool: {
      weapon: [{ itemId: 'weapon_arming_sword', weight: 46 }, { itemId: 'weapon_katana_npc', weight: 28 }, { itemId: 'weapon_rustblade', weight: 16 }, { itemId: null, weight: 10 }],
      offhand: [{ itemId: 'offhand_wood_guard', weight: 48 }, { itemId: null, weight: 52 }],
      head: [{ itemId: 'head_warden', weight: 34 }, { itemId: 'head_chain_coif', weight: 24 }, { itemId: null, weight: 42 }],
      chest: [{ itemId: 'chest_ash_plate', weight: 42 }, { itemId: null, weight: 58 }],
      shoulders: [{ itemId: 'shoulders_legion', weight: 32 }, { itemId: null, weight: 68 }],
      hands: [{ itemId: 'hands_iron', weight: 52 }, { itemId: null, weight: 48 }],
      feet: [{ itemId: 'feet_iron', weight: 54 }, { itemId: null, weight: 46 }]
    },
    loot: [
      { itemId: 'chest_steel_plate', chance: 0.075, rarityWeights: { magic: 0.76, noble: 0.24 } },
      { itemId: 'weapon_iron_arming_sword', chance: 0.08, rarityWeights: { magic: 0.78, noble: 0.22 } },
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
      { itemId: 'weapon_iron_arming_sword', chance: 0.26, rarityWeights: { magic: 0.68, noble: 0.32 } },
      { itemId: 'chest_steel_plate', chance: 0.16, rarityWeights: { magic: 0.55, noble: 0.45 } },
      { itemId: 'head_iron_revised', chance: 0.14, rarityWeights: { magic: 0.64, noble: 0.36 } }
    ]
  }
});
