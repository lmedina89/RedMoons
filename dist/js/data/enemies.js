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
  enemy_ash_skeleton: {
    id: 'enemy_ash_skeleton', name: 'Ash Skeleton', family: 'skeleton', level: 3, maxHp: 58, attack: 11, defense: 3,
    speed: 62, detectRange: 275, attackRange: 48, leashRange: 420, attackCooldown: 1250, recoverMs: 520,
    xp: 42, currency: [3, 7], walkTexture: 'skeleton-walk', attackTexture: 'skeleton-slash', walkFrames: 9, attackFrames: 6,
    loot: [
      { itemId: 'head_bronze_revised', chance: 0.055, rarityWeights: { normal: 0.66, magic: 0.29, noble: 0.05 } },
      { itemId: 'weapon_brass_arming_sword', chance: 0.045, rarityWeights: { normal: 0.62, magic: 0.32, noble: 0.06 } },
      { itemId: 'hands_legion', chance: 0.04, rarityWeights: { normal: 0.60, magic: 0.33, noble: 0.07 } },
      { itemId: 'head_iron_revised', chance: 0.035, rarityWeights: { normal: 0.56, magic: 0.36, noble: 0.08 } },
      { itemId: 'chest_silver_legion', chance: 0.025, rarityWeights: { normal: 0.48, magic: 0.42, noble: 0.10 } }
    ]
  },
  enemy_bone_captain: {
    id: 'enemy_bone_captain', name: 'Captain Ossivar', family: 'skeleton', named: true, level: 6, maxHp: 180, attack: 18, defense: 6,
    speed: 68, detectRange: 330, attackRange: 54, leashRange: 520, attackCooldown: 1050, recoverMs: 380,
    xp: 180, currency: [18, 28], walkTexture: 'skeleton-walk', attackTexture: 'skeleton-slash', walkFrames: 9, attackFrames: 6, scale: 1.18,
    loot: [
      { itemId: 'chest_silver_legion', chance: 0.26, rarityWeights: { magic: 0.68, noble: 0.32 } },
      { itemId: 'chest_legion', chance: 0.20, rarityWeights: { magic: 0.66, noble: 0.34 } },
      { itemId: 'weapon_iron_arming_sword', chance: 0.22, rarityWeights: { magic: 0.70, noble: 0.30 } },
      { itemId: 'chest_steel_plate', chance: 0.12, rarityWeights: { magic: 0.58, noble: 0.42 } },
      { itemId: 'head_iron_revised', chance: 0.11, rarityWeights: { magic: 0.68, noble: 0.32 } }
    ]
  }
});
