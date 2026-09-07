// v0.1.4.1 seeds the vocabulary for habitat-driven encounter design without
// replacing the current proven spawn runtime yet. Existing enemies keep their
// individual definitions; areas can now describe which families and group
// shapes belong there so later population passes stay data-driven.
export const MONSTER_FAMILY_DEFS = Object.freeze({
  imp: Object.freeze({ id: 'imp', name: 'Infernal Imps', ecology: 'infernal', roles: ['skirmisher', 'caster', 'raider'] }),
  goblin: Object.freeze({ id: 'goblin', name: 'Ash Goblins', ecology: 'scavenger', roles: ['raider', 'ambusher', 'support'] }),
  spider: Object.freeze({ id: 'spider', name: 'Ashland Arachnids', ecology: 'beast', roles: ['hunter', 'ambusher', 'elite'] }),
  carrion: Object.freeze({ id: 'carrion', name: 'Carrion Beasts', ecology: 'corrupted_beast', roles: ['hunter', 'bruiser'] }),
  rotwing: Object.freeze({ id: 'rotwing', name: 'Rotwing Ravagers', ecology: 'corrupted_beast', roles: ['flanker', 'elite'] }),
  skeleton: Object.freeze({ id: 'skeleton', name: 'Ossuary Dead', ecology: 'undead', roles: ['vanguard', 'ranged', 'caster', 'elite', 'captain'] }),
  construct: Object.freeze({ id: 'construct', name: 'Ashstone Constructs', ecology: 'construct', roles: ['bruiser', 'guardian'] }),
  celestial: Object.freeze({ id: 'celestial', name: 'First-Light Celestials', ecology: 'celestial', roles: ['vanguard', 'support', 'elite'], future: true })
});

export const ENCOUNTER_GROUP_ARCHETYPES = Object.freeze({
  roam: Object.freeze({ id: 'roam', label: 'Roaming', description: 'Loose individuals or small packs moving through open habitat.' }),
  pack: Object.freeze({ id: 'pack', label: 'Pack', description: 'Several related creatures that aggro as one local threat.' }),
  patrol: Object.freeze({ id: 'patrol', label: 'Patrol', description: 'A route-minded group appropriate for roads, walls and military ruins.' }),
  guard: Object.freeze({ id: 'guard', label: 'Guard', description: 'Frontline actors protecting a fixed point, elite, cache or entrance.' }),
  ritual: Object.freeze({ id: 'ritual', label: 'Ritual', description: 'Stationary formation around a shrine, corpse field or magical site.' }),
  ambush: Object.freeze({ id: 'ambush', label: 'Ambush', description: 'Hidden or dormant actors triggered by player approach.' })
});
