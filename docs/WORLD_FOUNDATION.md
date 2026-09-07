# v0.1.4.0 World Foundation — Physical Test Route

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
