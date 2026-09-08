// v0.1.4.2 Living Wilds encounter ecology. Families define what belongs in a
// habitat; encounter definitions describe how related spawn rows behave as a
// local group. World data references these IDs rather than hard-coding behavior
// in actor code, so later regions can reuse the same runtime vocabulary.
export const MONSTER_FAMILY_DEFS = Object.freeze({
  imp: Object.freeze({ id: 'imp', name: 'Infernal Imps', ecology: 'infernal', roles: ['skirmisher', 'caster', 'raider'] }),
  goblin: Object.freeze({ id: 'goblin', name: 'Ash Goblins', ecology: 'scavenger', roles: ['raider', 'ambusher', 'support'] }),
  human: Object.freeze({ id: 'human', name: 'Ashland Hostiles', ecology: 'humanoid', roles: ['scavenger', 'raider', 'bruiser', 'assassin'] }),
  demon: Object.freeze({ id: 'demon', name: 'Demon Legion', ecology: 'infernal_military', roles: ['vanguard', 'assault', 'bulwark', 'elite'] }),
  spider: Object.freeze({ id: 'spider', name: 'Ashland Arachnids', ecology: 'beast', roles: ['hunter', 'ambusher', 'elite'] }),
  carrion: Object.freeze({ id: 'carrion', name: 'Carrion Beasts', ecology: 'corrupted_beast', roles: ['hunter', 'bruiser'] }),
  rotwing: Object.freeze({ id: 'rotwing', name: 'Rotwing Ravagers', ecology: 'corrupted_beast', roles: ['flanker', 'elite'] }),
  skeleton: Object.freeze({ id: 'skeleton', name: 'Ossuary Dead', ecology: 'undead', roles: ['vanguard', 'ranged', 'caster', 'elite', 'captain'] }),
  construct: Object.freeze({ id: 'construct', name: 'Ashstone Constructs', ecology: 'construct', roles: ['bruiser', 'guardian'] }),
  celestial: Object.freeze({ id: 'celestial', name: 'First-Light Celestials', ecology: 'celestial', roles: ['vanguard', 'guardian', 'support', 'elite'] })
});

export const ENCOUNTER_GROUP_ARCHETYPES = Object.freeze({
  roam: Object.freeze({ id: 'roam', label: 'Roaming', description: 'Loose individuals or small packs moving through open habitat.' }),
  pack: Object.freeze({ id: 'pack', label: 'Pack', description: 'Several related creatures that alert together as one local threat.' }),
  patrol: Object.freeze({ id: 'patrol', label: 'Patrol', description: 'A route-minded group appropriate for roads, walls and military ruins.' }),
  guard: Object.freeze({ id: 'guard', label: 'Guard', description: 'Frontline actors protecting a fixed point, elite, cache or entrance.' }),
  ritual: Object.freeze({ id: 'ritual', label: 'Ritual', description: 'Stationary formation around a shrine, corpse field or magical site.' }),
  ambush: Object.freeze({ id: 'ambush', label: 'Ambush', description: 'Dormant actors that wake only when the player enters their local trigger radius.' })
});

export const ENCOUNTER_DEFS = Object.freeze({
  enc_causeway_imps: Object.freeze({ id: 'enc_causeway_imps', areaId: 'area_ashen_causeway', archetype: 'roam', label: 'Cinder Imp Foragers', alertRadius: 230, activationRange: 900 }),
  enc_causeway_tollgang: Object.freeze({ id: 'enc_causeway_tollgang', areaId: 'area_ashen_causeway', archetype: 'guard', label: 'Ash Scavenger Toll Gang', alertRadius: 310, activationRange: 980 }),
  enc_ember_blighters: Object.freeze({ id: 'enc_ember_blighters', areaId: 'area_emberfields', archetype: 'pack', label: 'Blight Imp Hunting Pack', alertRadius: 270, activationRange: 950 }),
  enc_ember_goblin_raid: Object.freeze({ id: 'enc_ember_goblin_raid', areaId: 'area_emberfields', archetype: 'patrol', label: 'Goblin Raid Party', alertRadius: 300, activationRange: 980 }),
  enc_ember_looters: Object.freeze({ id: 'enc_ember_looters', areaId: 'area_emberfields', archetype: 'guard', label: 'Burnt-Hamlet Looters', alertRadius: 300, activationRange: 980 }),
  enc_cinderwood_web: Object.freeze({ id: 'enc_cinderwood_web', areaId: 'area_cinderwood', archetype: 'ambush', label: 'Cinderwood Web Ambush', alertRadius: 270, activationRange: 850, ambushRange: 155 }),
  enc_cinderwood_carrion: Object.freeze({ id: 'enc_cinderwood_carrion', areaId: 'area_cinderwood', archetype: 'pack', label: 'Carrion Feeding Pack', alertRadius: 250, activationRange: 900 }),
  enc_cinderwood_stalker: Object.freeze({ id: 'enc_cinderwood_stalker', areaId: 'area_cinderwood', archetype: 'ambush', label: 'Ashblade Stalker', alertRadius: 180, activationRange: 850, ambushRange: 175, rare: true }),
  enc_firstlight_demon_patrol: Object.freeze({ id: 'enc_firstlight_demon_patrol', areaId: 'area_first_light_scar', archetype: 'patrol', label: 'Ashwing Legion War Patrol', alertRadius: 390, activationRange: 1050, assistRadius: 290, assistCap: 3 }),
  enc_firstlight_debug_warband: Object.freeze({ id: 'enc_firstlight_debug_warband', areaId: 'area_first_light_scar', archetype: 'guard', label: 'Debug Demon Warband', alertRadius: 470, activationRange: 1200, assistRadius: 420, assistCap: 5, debugOnly: true }),
  enc_firstlight_celestial_guard: Object.freeze({ id: 'enc_firstlight_celestial_guard', areaId: 'area_first_light_scar', archetype: 'guard', label: 'First-Light Vanguard', alertRadius: 360, activationRange: 1050, assistRadius: 290, assistCap: 3 }),
  enc_fallen_watch_carrion: Object.freeze({ id: 'enc_fallen_watch_carrion', areaId: 'area_fallen_watch', archetype: 'pack', label: 'Watchyard Carrion Pack', alertRadius: 250, activationRange: 900 }),
  enc_fallen_watch_guard: Object.freeze({ id: 'enc_fallen_watch_guard', areaId: 'area_fallen_watch', archetype: 'guard', label: 'Fallen Watch Deadguard', alertRadius: 320, activationRange: 980 }),
  enc_fallen_watch_raiders: Object.freeze({ id: 'enc_fallen_watch_raiders', areaId: 'area_fallen_watch', archetype: 'guard', label: 'Ironbound Salvage Crew', alertRadius: 300, activationRange: 980 }),
  enc_fallen_watch_emberweb: Object.freeze({ id: 'enc_fallen_watch_emberweb', areaId: 'area_fallen_watch', archetype: 'ambush', label: 'Emberweb Nest', alertRadius: 220, activationRange: 850, ambushRange: 145 }),
  enc_ashgrave_ritual: Object.freeze({ id: 'enc_ashgrave_ritual', areaId: 'area_ashgrave_hollow', archetype: 'ritual', label: 'Ashgrave Bone Rite', alertRadius: 330, activationRange: 1000 }),
  enc_ashgrave_rotwings: Object.freeze({ id: 'enc_ashgrave_rotwings', areaId: 'area_ashgrave_hollow', archetype: 'pack', label: 'Rotwing Scavengers', alertRadius: 280, activationRange: 950 }),
  enc_ashgrave_blueflame: Object.freeze({ id: 'enc_ashgrave_blueflame', areaId: 'area_ashgrave_hollow', archetype: 'roam', label: 'Blueflame Wanderers', alertRadius: 240, activationRange: 900 }),
  enc_bone_road_patrol: Object.freeze({ id: 'enc_bone_road_patrol', areaId: 'area_bone_road', archetype: 'patrol', label: 'Ossuary Road Patrol', alertRadius: 360, activationRange: 1050 }),
  enc_bone_road_guard: Object.freeze({ id: 'enc_bone_road_guard', areaId: 'area_bone_road', archetype: 'guard', label: 'Gilded Road Guard', alertRadius: 340, activationRange: 1000 }),
  enc_bone_road_captain: Object.freeze({ id: 'enc_bone_road_captain', areaId: 'area_bone_road', archetype: 'guard', label: 'Captain Ossivar', alertRadius: 260, activationRange: 1000, rare: true }),
  enc_hollow_cave_nest: Object.freeze({ id: 'enc_hollow_cave_nest', areaId: 'area_ashfall_hollow', archetype: 'pack', label: 'Cave Spider Nest', alertRadius: 250, activationRange: 760 }),
  enc_hollow_mire_ambush: Object.freeze({ id: 'enc_hollow_mire_ambush', areaId: 'area_ashfall_hollow', archetype: 'ambush', label: 'Mire Spider Ambush', alertRadius: 240, activationRange: 720, ambushRange: 145 })
});

export function encounterForId(id) { return id ? ENCOUNTER_DEFS[id] || null : null; }
