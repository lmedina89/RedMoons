// v0.1.4.3 Exploration/POI foundation. These records are deliberately small
// and declarative: map rendering, rewards and world-event behavior consume the
// same definitions without hard-coding individual landmarks into UI logic.

export const POI_DEFS = Object.freeze([
  Object.freeze({
    id: 'poi_causeway_memorial', mapId: 'map_cinder_wilds', type: 'lore', x: 890, y: 1120, radius: 78,
    name: 'Broken Legion Marker', detail: 'Read the weathered campaign stone.', visual: 'relic',
    text: 'Half-erased names run beneath a split legion crest. The oldest line reads: “Neither gate was ours to open.”'
  }),
  Object.freeze({
    id: 'poi_burnt_hamlet_cache', mapId: 'map_cinder_wilds', type: 'cache', x: 2260, y: 860, radius: 74,
    name: 'Burnt-Hamlet Cache', detail: 'Search the scavenged supply box.', visual: 'cache',
    reward: Object.freeze({ currency: 18, items: Object.freeze([{ itemId: 'consumable_cinder_ration', quantity: 2 }]) })
  }),
  Object.freeze({
    id: 'poi_cinderwood_waystone', mapId: 'map_cinder_wilds', type: 'shrine', x: 2580, y: 1530, radius: 82,
    name: 'Ashen Waystone', detail: 'Touch the warm stone.', visual: 'shrine',
    recovery: Object.freeze({ hpRatio: 0.35, essenceRatio: 0.40, cooldownMs: 45000 })
  }),
  Object.freeze({
    id: 'poi_firstlight_reliquary', mapId: 'map_cinder_wilds', type: 'cache', x: 3075, y: 665, radius: 78,
    name: 'First-Light Reliquary', detail: 'Open the cracked celestial reliquary.', visual: 'reliquary',
    reward: Object.freeze({ currency: 24, items: Object.freeze([{ itemId: 'consumable_essence_minor', quantity: 2 }]) })
  }),
  Object.freeze({
    id: 'poi_fallen_watch_cache', mapId: 'map_cinder_wilds', type: 'cache', x: 4925, y: 520, radius: 76,
    name: 'Watch Quartermaster Chest', detail: 'Search the ruined strongpoint chest.', visual: 'cache',
    reward: Object.freeze({ currency: 30, items: Object.freeze([{ itemId: 'consumable_ashblood_minor', quantity: 2 }]) })
  }),
  Object.freeze({
    id: 'poi_ashgrave_epitaph', mapId: 'map_cinder_wilds', type: 'lore', x: 4720, y: 1770, radius: 78,
    name: 'Ashgrave Epitaph', detail: 'Read the blackened grave marker.', visual: 'relic',
    text: 'The inscription calls the dead “keepers of the road below” and warns that the oldest crypt predates Cinder Refuge.'
  }),
  Object.freeze({
    id: 'poi_veil_observatory', mapId: 'map_veil_threshold', type: 'lore', x: 640, y: 300, radius: 105,
    name: 'Veil Observatory', detail: 'Study the fracture beyond the threshold.', visual: 'rift',
    text: 'Through the fracture, distant formations of white-gold and ember-black move across impossible terrain. The passage is not stable enough to cross yet.'
  }),
  Object.freeze({
    id: 'poi_warden_archive', mapId: 'map_warden_hall', type: 'lore', x: 710, y: 330, radius: 76,
    name: 'Warden Archive', detail: 'Inspect the old campaign ledgers.', visual: 'relic',
    text: 'The ledgers describe Cinder Refuge as a repair settlement built over fortifications from an older, unnamed war.'
  }),
  Object.freeze({
    id: 'poi_forge_supply', mapId: 'map_torrens_forge', type: 'cache', x: 745, y: 420, radius: 72,
    name: 'Torren’s Spare Supplies', detail: 'Check the small supply crate.', visual: 'cache',
    reward: Object.freeze({ currency: 10, items: Object.freeze([{ itemId: 'consumable_cinder_ration', quantity: 1 }]) })
  }),
  Object.freeze({
    id: 'poi_crypt_cache', mapId: 'map_ashgrave_crypt', type: 'cache', x: 1010, y: 310, radius: 76,
    name: 'Sealed Ossuary Cache', detail: 'Break the brittle seal and search inside.', visual: 'reliquary',
    reward: Object.freeze({ currency: 36, items: Object.freeze([{ itemId: 'consumable_ashblood_minor', quantity: 2 }, { itemId: 'consumable_essence_minor', quantity: 1 }]) })
  })
]);

export const WORLD_EVENT_DEFS = Object.freeze([
  Object.freeze({
    id: 'event_burnt_hamlet_looters', mapId: 'map_cinder_wilds', x: 2250, y: 820, radius: 330,
    kind: 'encounter_alert_player', encounterIds: Object.freeze(['enc_ember_looters']), oncePerVisit: true,
    text: 'Voices snap through the burned homes—the looting crew has spotted you.'
  }),
  Object.freeze({
    id: 'event_firstlight_crossfire', mapId: 'map_cinder_wilds', x: 3450, y: 850, radius: 430,
    kind: 'faction_clash', encounterIds: Object.freeze(['enc_firstlight_demon_patrol', 'enc_firstlight_celestial_guard']), cooldownMs: 60000,
    text: 'First-Light erupts as celestial sentinels and the Demon Legion collide.'
  }),
  Object.freeze({
    id: 'event_ashgrave_rite', mapId: 'map_cinder_wilds', x: 5200, y: 1370, radius: 300,
    kind: 'encounter_alert_player', encounterIds: Object.freeze(['enc_ashgrave_ritual']), oncePerVisit: true,
    text: 'The bone rite stirs. Dead eyes turn toward the living.'
  }),
  Object.freeze({
    id: 'event_crypt_pressure', mapId: 'map_ashgrave_crypt', x: 640, y: 440, radius: 280,
    kind: 'encounter_alert_player', encounterIds: Object.freeze(['enc_ashgrave_crypt_nest']), oncePerVisit: true,
    text: 'Something skitters behind the crypt walls.'
  })
]);

export function poisForMap(mapId) { return POI_DEFS.filter(poi => poi.mapId === mapId); }
export function worldEventsForMap(mapId) { return WORLD_EVENT_DEFS.filter(event => event.mapId === mapId); }
