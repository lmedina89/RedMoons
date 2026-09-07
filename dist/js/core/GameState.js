import { GAME_VERSION, PLAYER_START, SAVE_VERSION } from '../config.js';

export function createDefaultState() {
  return {
    saveVersion: SAVE_VERSION,
    gameVersion: GAME_VERSION,
    savedAt: 0,
    player: {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      level: 1,
      xp: 0,
      hp: 100,
      essence: 49,
      stats: { str: 5, dex: 5, vit: 5, spr: 5 },
      unspentStatPoints: 0,
      unspentSkillPoints: 0,
      currency: 35
    },
    inventory: [
      { instanceId: 'i_000001', itemId: 'weapon_arming_sword', rarity: 'normal', enhancement: 0, modifiers: {} },
      { instanceId: 'i_000002', itemId: 'chest_wayfarer', rarity: 'normal', enhancement: 0, modifiers: {} },
      { instanceId: 'i_000003', itemId: 'legs_ash_pants', rarity: 'normal', enhancement: 0, modifiers: {} },
      { instanceId: 'i_000004', itemId: 'hands_hide_wraps', rarity: 'normal', enhancement: 0, modifiers: {} },
      { instanceId: 'i_000005', itemId: 'feet_road_boots', rarity: 'normal', enhancement: 0, modifiers: {} }
    ],
    equipment: {
      head: null,
      shoulders: null,
      chest: 'i_000002',
      legs: 'i_000003',
      hands: 'i_000004',
      feet: 'i_000005',
      weapon: 'i_000001',
      offhand: null,
      necklace: null,
      ring1: null,
      ring2: null,
      wings: null
    },
    quests: {
      quest_ash_pest: { state: 'available', objectives: { kill_imp: 0 } },
      quest_ember_heart: { state: 'locked', objectives: { collect_heart: 0 } },
      quest_bone_captain: { state: 'locked', objectives: { kill_captain: 0 } }
    },
    worldFlags: { wingsUnlocked: false },
    npcStates: {},
    settings: { musicVolume: 0.5, sfxVolume: 0.75, screenShake: true, diagnostics: false },
    nextItemSequence: 6
  };
}
