# Known Limitations

- v0.1.1 contains one continuous foundation map, three quests, three enemy definitions and four NPCs; it is not a full campaign.
- The included asset library lacks a complete town-building and Hell-specific lava/ash kit. Cinder Refuge therefore combines included terrain/props with lightweight Phaser-drawn settlement geometry. Source LPC art is not altered.
- LPC supports four directional animation rows. Movement is smooth in eight directions, but the nearest cardinal facing row is used while moving diagonally.
- NPCs use lightweight waypoint routes and contextual deterministic dialogue. Shops, repair and crafting are not implemented.
- The basic sword attack has no Essence cost. Skill points are awarded and stored, but the skill tree is intentionally deferred.
- Equipment currently supports one main-hand weapon plus one offhand. Two-handed weapons, dual wielding and weapon swapping are intentionally deferred; armor and accessory slots remain independent.
- The Character panel exposes an Active Effects section, but temporary buff/debuff gameplay is not implemented yet, so it correctly reports no active effects in this release.
- The inventory has 30 slots and no sorting, stacking, selling or drag-and-drop in this release. Equipment uses one weapon and one offhand; two-handed and dual-wield rules are deferred.
- Loot rarity supports Normal, Magic and Noble. Divine Noble, Abyss and unique Legendary tiers are reserved in data but do not drop.
- Enhancement is stored separately at +0, but enhancement gameplay, sockets and crafting are not implemented.
- The physical loot pool is capped at 30 simultaneous drops; the oldest inactive/reusable slot is reclaimed if saturated.
- Saves are device-local browser data. Cloud saves, multiple characters and account login are outside scope.
- Audio is not included in this asset archive, so v0.1.1 ships silently rather than using unrelated placeholder sound.
- Controller actions can plug into the input abstraction, but no gamepad mapping UI ships yet.

