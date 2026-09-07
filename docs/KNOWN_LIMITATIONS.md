# Known Limitations

- v0.1.1.1 is still a foundation slice: one continuous map, three quests, three enemy definitions and four NPCs; it is not a full campaign.
- Cinder Refuge still lacks a dedicated house/town tileset and therefore does not yet read as the intended settlement. Building/town art and the data-driven settlement pass are targeted for v0.1.2.
- LPC rendering uses four cardinal facing rows. Movement is smooth in eight directions, but the nearest cardinal facing row is used while moving diagonally.
- The new player sword has a four-hit basic combo, but only the sword profile is implemented. Axes, spears, daggers, two-handed weapons and weapon swapping are deferred.
- The legacy Rustblade and supplied Katana are intentionally classified as limited/humanoid weapons rather than newly player-equippable weapons. Randomized level/family/zone-appropriate enemy weapon loadouts are targeted for v0.1.2 and do not ship here.
- Legion Boots and Legion Pauldrons do not contain all revised one-handed combat rows in the supplied PNGs. They explicitly fall back to their valid standard slash poses during newer combo actions instead of indexing empty artwork.
- Some older v0.1.x hair/armor layers also use the standard-slash fallback during revised combo actions. Additional matching revised exports can improve pose fidelity later without changing the equipment/save model.
- The Arming Sword supplied export is a foreground weapon layer. v0.1.1.1 does not fabricate a background layer; visual front/back crossover should be checked carefully on device.
- Wings are now a real equipment slot and buff source, but the actual advanced-progression unlock quest/system has not been authored. `wingsUnlocked` defaults false; a debug helper exists only for development testing.
- Necklace and both ring slots exist but there are no accessory item definitions yet.
- Temporary buff/debuff gameplay is not implemented yet, so Character → Active Effects correctly reports no active effects.
- The inventory has 30 slots and no sorting, stacking, selling or drag-and-drop in this release.
- Loot rarity supports Normal, Magic and Noble. Higher reserved tiers do not drop yet. Enhancement is stored separately at +0, but enhancement gameplay, sockets and crafting are not implemented.
- Saves are device-local browser data. Cloud saves, multiple characters and account login are outside scope.
- Audio is not included in this asset archive, so the build ships silently rather than using unrelated placeholder sound.
- Controller actions can plug into the input abstraction, but no gamepad mapping UI ships yet.
- Matching generator credits are still missing for the supplied Boots, Gloves, Legion chest, Red Bat Wings, Iron helmet and Shoulders exports. They are on an attribution hold and should not be considered production/store-release cleared yet.
