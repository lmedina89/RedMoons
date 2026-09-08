import { GAME_VERSION, SAVE_KEY, SAVE_VERSION } from '../config.js';
import { DEFAULT_MAP_ID, MAP_DEFS, mapForId } from '../data/world.js';
import { createDefaultState } from './GameState.js';
import { ITEM_DEFS } from '../data/items.js';
import { normalizeSkillState } from '../data/skills.js';
import { normalizeTravelState } from '../systems/TravelSystem.js';

const plainObject = value => value && typeof value === 'object' && !Array.isArray(value);
const finite = value => Number.isFinite(value);

// v0.1.4.1 splits the former monolithic map_cinder_region into a dedicated
// Refuge map and a much larger Wilds map. Old saves keep schema 2; this one-
// time location translation moves them to a safe equivalent area rather than
// stranding the player in obsolete coordinates.
function migrateLegacyCinderLocation(player = {}) {
  if (player.mapId !== 'map_cinder_region') return null;
  const x = Number.isFinite(player.x) ? player.x : 330;
  const y = Number.isFinite(player.y) ? player.y : 610;
  if (x < 720) return { mapId: 'map_cinder_refuge', entryPointId: 'cinder_start', x: 1010, y: 790 };
  if (x >= 1940) return { mapId: 'map_cinder_wilds', entryPointId: 'from_refuge', x: 5760, y: 1024 };
  if (x >= 1440 && y < 640) return { mapId: 'map_cinder_wilds', entryPointId: 'from_refuge', x: 4350, y: 900 };
  if (x >= 1440) return { mapId: 'map_cinder_wilds', entryPointId: 'from_refuge', x: 4380, y: 1200 };
  if (x >= 1080 && y >= 390 && y < 830) return { mapId: 'map_cinder_wilds', entryPointId: 'first_light_test', x: 3380, y: 1040 };
  if (y < 390) return { mapId: 'map_cinder_wilds', entryPointId: 'from_refuge', x: 1700, y: 620 };
  if (y >= 830) return { mapId: 'map_cinder_wilds', entryPointId: 'from_refuge', x: 1800, y: 1450 };
  return { mapId: 'map_cinder_wilds', entryPointId: 'from_refuge', x: 720, y: 1024 };
}

export class SaveManager {
  hasSave() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  loadExisting() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return this.validate(parsed);
    } catch (error) {
      try {
        localStorage.setItem(`${SAVE_KEY}.corrupt.${Date.now()}`, raw);
        localStorage.removeItem(SAVE_KEY);
      } catch (_) { /* storage may be full */ }
      console.warn('[Ashfall] Invalid save isolated; no runnable slot remains.', error);
      return null;
    }
  }

  load() {
    return this.loadExisting() || createDefaultState();
  }

  summary(state) {
    if (!state) return null;
    const map = mapForId(state.player?.mapId);
    return {
      level: state.player?.level || 1,
      currency: state.player?.currency || 0,
      mapId: map.id,
      mapName: map.name,
      savedAt: state.savedAt || 0
    };
  }

  validate(value) {
    if (!plainObject(value) || ![1, SAVE_VERSION].includes(value.saveVersion)) throw new Error('Unsupported save schema');
    const base = createDefaultState();
    if (!plainObject(value.player) || !plainObject(value.player.stats)) throw new Error('Missing player state');
    if (!Array.isArray(value.inventory) || !plainObject(value.equipment) || !plainObject(value.quests)) throw new Error('Invalid collections');

    const state = structuredClone(base);
    // Preserve slot metadata for the title/load screen while normalizing accepted schema-1/2 states to the current schema.
    // Older saves that predate savedAt/gameVersion normalize safely.
    state.savedAt = this.number(value.savedAt, 0, Number.MAX_SAFE_INTEGER, 0);
    state.gameVersion = typeof value.gameVersion === 'string' ? value.gameVersion.slice(0, 32) : base.gameVersion;
    state.player.level = this.number(value.player.level, 1, 10, 1);
    const legacyLocation = migrateLegacyCinderLocation(value.player);
    const incomingMapId = legacyLocation?.mapId || (typeof value.player.mapId === 'string' && MAP_DEFS[value.player.mapId] ? value.player.mapId : DEFAULT_MAP_ID);
    const map = mapForId(incomingMapId);
    state.player.mapId = map.id;
    const requestedEntry = legacyLocation?.entryPointId || value.player.entryPointId;
    state.player.entryPointId = typeof requestedEntry === 'string' && map.entryPoints?.[requestedEntry]
      ? requestedEntry
      : (base.player.entryPointId && map.entryPoints?.[base.player.entryPointId] ? base.player.entryPointId : Object.keys(map.entryPoints || {})[0] || null);
    const incomingX = legacyLocation?.x ?? value.player.x;
    const incomingY = legacyLocation?.y ?? value.player.y;
    state.player.x = this.number(incomingX, 48, map.width - 48, map.entryPoints?.[state.player.entryPointId]?.x ?? base.player.x);
    state.player.y = this.number(incomingY, 48, map.height - 48, map.entryPoints?.[state.player.entryPointId]?.y ?? base.player.y);
    state.player.xp = this.number(value.player.xp, 0, 1000000, 0);
    state.player.hp = this.number(value.player.hp, 0, 100000, base.player.hp);
    state.player.essence = this.number(value.player.essence, 0, 100000, base.player.essence);
    state.player.unspentStatPoints = this.number(value.player.unspentStatPoints, 0, 500, 0);
    state.player.unspentSkillPoints = this.number(value.player.unspentSkillPoints, 0, 100, 0);
    state.player.currency = this.number(value.player.currency, 0, 99999999, 0);
    for (const key of ['str', 'dex', 'vit', 'spr']) state.player.stats[key] = this.number(value.player.stats[key], 1, 500, 5);

    const legacyPlayerRewardMap = Object.freeze({
      // These NPC-only pieces were granted to players by older quest/debug
      // helpers. Convert the item instance in place so rarity/modifiers and
      // inventory identity survive while the replacement is actually usable.
      head_warden: 'head_iron_revised',
      chest_cinderhide: 'feet_leather_revised'
    });
    state.inventory = value.inventory.slice(0, 80).filter(item => plainObject(item) && typeof item.instanceId === 'string' && typeof item.itemId === 'string' && ITEM_DEFS[item.itemId]).map(item => ({
      instanceId: item.instanceId.slice(0, 64),
      itemId: legacyPlayerRewardMap[item.itemId] || item.itemId.slice(0, 64),
      rarity: typeof item.rarity === 'string' ? item.rarity : 'normal',
      enhancement: this.number(item.enhancement, 0, 9, 0),
      modifiers: plainObject(item.modifiers) ? Object.fromEntries(Object.entries(item.modifiers).filter(([, v]) => finite(v)).slice(0, 8)) : {},
      // v0.1.3.2 introduces stackable consumables without changing save schema.
      // Every older inventory instance safely normalizes to quantity 1.
      quantity: this.number(item.quantity, 1, Math.max(1, ITEM_DEFS[legacyPlayerRewardMap[item.itemId] || item.itemId]?.stackMax || 1), 1)
    }));
    const itemsById = new Map(state.inventory.map(item => [item.instanceId, item]));
    const equippedIds = new Set();
    for (const slot of Object.keys(state.equipment)) {
      const id = value.equipment[slot];
      const item = typeof id === 'string' ? itemsById.get(id) : null;
      const def = item && ITEM_DEFS[item.itemId];
      const validForSlot = Boolean(item && def?.slot === slot && def.playerEquipReady !== false && !def.npcOnly && !equippedIds.has(id));
      state.equipment[slot] = validForSlot ? id : null;
      if (validForSlot) equippedIds.add(id);
    }
    // v0.1.1 shipped the Rustblade as the starter player weapon before the
    // full four-hit LPC Revised weapon set existed. Upgrade only the *equipped*
    // legacy Rustblade in-place so returning players immediately receive the
    // new combat-ready starter sword while unequipped Rustblades remain valid
    // limited-animation content for future humanoid enemy loadouts.
    const equippedWeapon = itemsById.get(state.equipment.weapon);
    if (equippedWeapon?.itemId === 'weapon_rustblade') equippedWeapon.itemId = 'weapon_arming_sword';
    state.quests = structuredClone(base.quests);
    for (const [id, fallback] of Object.entries(base.quests)) {
      const incoming = value.quests[id];
      if (!plainObject(incoming)) continue;
      state.quests[id].state = ['locked', 'available', 'active', 'ready', 'complete'].includes(incoming.state) ? incoming.state : fallback.state;
      if (plainObject(incoming.objectives)) {
        for (const key of Object.keys(fallback.objectives)) state.quests[id].objectives[key] = this.number(incoming.objectives[key], 0, 9999, 0);
      }
    }
    state.worldFlags = { ...base.worldFlags, ...(plainObject(value.worldFlags) ? structuredClone(value.worldFlags) : {}) };
    if (!plainObject(state.worldFlags.poiStates)) state.worldFlags.poiStates = {};
    state.travel = normalizeTravelState(value.travel, MAP_DEFS);
    state.npcStates = plainObject(value.npcStates) ? structuredClone(value.npcStates) : {};
    state.settings = { ...base.settings, ...(plainObject(value.settings) ? value.settings : {}) };
    if (plainObject(value.skills)) state.skills = structuredClone(value.skills);
    normalizeSkillState(state);
    state.nextItemSequence = this.number(value.nextItemSequence, 1, 99999999, state.inventory.length + 1);
    return state;
  }

  number(value, min, max, fallback) {
    return finite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  }

  save(state) {
    state.savedAt = Date.now();
    state.saveVersion = SAVE_VERSION;
    state.gameVersion = GAME_VERSION;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  reset() {
    localStorage.removeItem(SAVE_KEY);
    return createDefaultState();
  }
}
