# v0.1.4.2 Living Wilds — Physical Test Route

No automated interactive iPhone/browser playthrough is claimed. Use `?debug=1` for direct encounter teleports. Save schema remains 2.

## v0.1.4.2 encounter/ecology test route

1. **Ash Scavenger:** use `?debug=1` → `Near Ash Scavenger`. Check that nearby scavengers can look materially different because their clothing/armor/weapons are rolled from the same rough faction pool. Hit one member and confirm the nearby toll-gang member reacts without distant Causeway enemies chain-pulling.
2. **Ironbound Raider:** teleport near the Raider and confirm the visual reads more armored/organized than a scavenger. Fight beside walls/props and re-check the v0.1.4.0 collision/no-shove rules.
3. **Ashblade Stalker:** teleport near the Assassin. It should begin dormant/faint, wake only at close approach, then use the compact hooded slash presentation. Verify it does not appear as a giant full authoring sheet or misaligned frames.
4. **Cinderwood spider ambush:** approach the web area naturally. Dormant spiders should wake at local proximity instead of aggroing from an entire screen away.
5. **Emberfields Goblin patrol:** watch for the raid party moving through its waypoint loop. Pull one member and verify the local encounter reacts while unrelated packs remain independent.
6. **First-Light Demon Scouts:** teleport `Near Demon Scout`, then travel toward Azrael. Scouts should patrol First-Light Scar and can naturally become involved with Azrael through existing faction hostility. Azrael's seven-skill behavior/Sanctuary must remain unchanged.
7. **Fallen Watch:** test the deadguard, human salvage crew and Emberweb nest as separate local encounters. Confirm wall collision still prevents enemies from phasing/meleeing through visible stone.
8. **Ashgrave Bone Rite:** approach the ritual group and confirm the skeleton guards + Gravecaller behave as one local encounter without pulling the entire basin.
9. **Bone Road patrol:** observe the Spearman/Archer/Slate Revenant shared patrol route. It should feel like a mixed military patrol, not three unrelated wanderers. Check that the separate Gilded Road Guard/Captain groups do not automatically join from unreasonable distance.
10. **Ashfall Hollow:** verify the normal cave-spider nest versus the proximity Mire-spider ambush. Enter/exit the map afterward to confirm transition state remains stable.
11. **Performance traversal:** spend 10–15 minutes moving from Refuge through the full Wilds, waking/fighting several encounters. Watch for cumulative stutter, delayed controls, missing layered textures or Safari reloads. The Wilds intentionally remains capped at 35 ordinary actor slots.
12. Save/reload in Wilds after seeing randomized human gear. Exact individual enemy loadouts are runtime spawn state and are not promised as persistent save data; player/map progression must remain stable.

**Approval question:** do the Wilds now feel populated by believable local groups/factions while remaining readable and smooth, or does any encounter feel too empty, too chain-reactive, visually inconsistent or too expensive on iPhone?

---

## Historical v0.1.4.1 scale/map-split gate

This release is the scale/map-split/art-composition gate before deeper monster-family population work. Save schema remains 2. No automated interactive iPhone/browser playthrough is claimed.

## What changed

Cinder Refuge is now a dedicated **2048×1536** map. The exterior is a separate **6400×2048 Cinder Wilds** map, and Ashfall Hollow remains separate. Refuge and the wilderness therefore no longer need to share one compressed camera space. The Wilds spread the Causeway, Emberfields, Cinderwood, First-Light Scar, Fallen Watch, Ashgrave Hollow and Bone Road over much larger territories, with trees, rocks, ruins, abandoned homes and road bends used to screen adjacent locations.

Refuge now uses a stronger stone perimeter/gate presentation, nine building footprints, more streets and district clutter, plus compact forge/woodworking/tailor props curated from preserved source sheets. The formal area name remains in the HUD rather than being repeated on nearby ground labels.

Older v0.1.4.0 saves that still reference `map_cinder_region` are translated to safe new Refuge/Wilds positions on load. The collision/navigation behavior from v0.1.4.0 remains active.

## iPhone Safari test route

1. **First launch with your existing v0.1.4.0 save.** Confirm the player appears in a sensible equivalent location rather than at a blank/obsolete coordinate.
2. Walk around the entire **Cinder Refuge**. Confirm the town has room to breathe, the perimeter reads as a real wall rather than a flat line, buildings/props do not visibly float, and there are no invisible blockers across normal streets.
3. Test several town wall/building edges. The player must stop at visible solids and pass naturally through the broad east gate.
4. Walk through the east gate and trigger **Refuge → Cinder Wilds**. The destination should render before control resumes; the player sprite/HUD/audio must remain alive.
5. Immediately turn around and test **Wilds → Refuge**. Repeat the handoff several times, including after moving/attacking/opening a panel. No blank world, invisible player or frozen simulation.
6. Travel east through **Ashen Causeway → Emberfields/Cinderwood → First-Light Scar**. Judge the thing this release is specifically trying to fix: major places should feel separated by actual travel and should not present three formal locations in one camera view.
7. In the **Burnt Hamlet/Cinderwood** transition, confirm tree/ruin/rock screens make the environment feel layered without creating frustrating invisible walls.
8. Reach **First-Light Scar** and re-test Azrael. He should still feel mechanically identical to the approved build: seven abilities, Sanctuary healing, faction behavior and spectacle unchanged.
9. At **Fallen Watch**, lure ordinary ground enemies around the enlarged visible ruin walls. They must not phase through stone or basic-melee through it. Watch for excessive jitter at corners/gaps.
10. Continue into **Ashgrave Hollow/Bone Road** and look for accidental spawn-inside-geometry, unreachable enemies or scenery that blocks movement without an obvious visual reason.
11. Enter **Ashfall Hollow**, then return to the Wilds. Verify the return location is sensible and all current-map art/player layers restore correctly.
12. Save while in Refuge, Wilds and Hollow (separate saves/iterations if practical), reload/refresh Safari, and confirm `mapId`/position persistence on each map.
13. Background Safari during or immediately after a map transition, return, and verify joystick/buttons/audio/world simulation recover normally.
14. Spend 10–15 minutes traversing the larger Wilds and fighting. Watch for rising stutter, missing textures or unusual memory pressure after visiting all three maps.

## Approval question for this gate

The key subjective test is not “is every area finished?” It is: **does the Cinder Region now feel spacious and deliberately composed enough that the next pass can safely populate monster families, groups, secrets and smaller POIs without another structural rescale?**

---

## Historical v0.1.4.0 collision/layout gate


This build is the collision/layout gate before deeper Cinder Region beautification and monster-family population work. Save schema remains 2.

## What changed

Ordinary ground enemies now respect the same visible static walls/building footprints as the player. They do not physically collide with the player, so combat contact should not push or reverse-slide the character. When pursuit is blocked, enemies temporarily steer along the obstacle; repeated failure eventually causes a short disengage instead of phasing through or pressing forever into the wall.

The Cinder Region now has stable local identities: Cinder Refuge, Ashen Causeway, Emberfields, Cinderwood, First-Light Scar, The Fallen Watch, Ashgrave Hollow and Bone Road. The top location chip should change as the player crosses these boundaries. Ashfall Hollow remains its own separate-map area.

## iPhone Safari test route

1. **Refuge east wall:** stand inside Cinder Refuge behind either solid east-wall segment and lure an Outskirts enemy toward you. It must remain outside the wall. Watch whether it tries to move along the wall toward the broad gate rather than passing through.
2. **Refuge gate:** lure an enemy while standing near the actual opening. The opening should remain traversable; there must not be an invisible wall across the gate.
3. **Building corners:** circle Torren's Forge or another building with an enemy chasing. Both actors must respect the footprint. The enemy should not cut through the building or trap the player through physical shoving.
4. **Fallen Watch:** travel to the new broken ruin walls in the northern/eastern Outskirts. Walk through the visible gaps, then use a wall segment to break a monster's direct path. The monster must collide with the segment and attempt a side route.
5. **Long obstruction:** deliberately keep yourself unreachable behind a wall for several seconds. The enemy may retry/steer, but it should eventually disengage briefly rather than vibrate forever or phase through.
6. **Ashfall Hollow:** enter the cave and test its visible border walls. Cave spiders must respect the same walls as the player. Confirm the southern transition opening is still usable.
7. **No shove regression:** stop moving while an enemy reaches normal melee range in open ground. Enemy contact should not physically drag/push the player; damage remains combat-system/range driven.
8. **Area identity:** travel through Ashen Causeway, Emberfields/Cinderwood, First-Light Scar, Fallen Watch and Ashgrave Hollow. Confirm the HUD location chip changes cleanly and does not flicker between two area names.
9. **Azrael regression:** watch Azrael fight in First-Light Scar. His seven abilities, Sanctuary healing, nameplate, movement and performance should feel identical to v0.1.3.2.4 aside from the surrounding ground identity.

Use `?debug=1` if useful. Static blockers draw green; active enemy bodies draw magenta; the player body draws cyan. The debug view is especially useful for confirming that a visible wall and its collision rectangle match.

## Deliberately deferred

This build does not turn the staged family/group metadata into coordinated pack/patrol/ritual AI yet, does not add the Assassin, and does not attempt the full Cinder Refuge art overhaul. Those should follow only after the collision/nav gate is physically approved.
