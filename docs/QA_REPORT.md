# v0.1.1 QA report

## Automated checks completed

- `npm run check` validates referenced asset paths, stable content relationships, equipment stacking, Character-sheet stat math, save normalization and animation geometry.
- The animation check decodes the RGBA spritesheets and verifies every mapped body/armor walk and slash frame contains artwork.
- Foreground/background sword and shield layers are validated as pairs, preventing an animation mapping from silently pointing at fully empty source frames.
- The DCSS sword now validates against walk rows 6–8 and slash rows 9–11, with the left-facing side row mirrored for right-facing rendering.
- Starter equipment is verified as five simultaneous equipped instances: chest, legs, hands, feet and weapon.
- Save validation is verified to reject an item referenced from an incompatible equipment slot.
- Every JavaScript source file under `dist/js` passes `node --check`.
- The production bundle remains self-contained and does not rely on a runtime CDN.

## Source-level behavior checks

- Player idle, walk and slash are separate semantic states.
- Attack start samples held movement direction before locking the swing facing.
- The equipped-gear renderer still synchronizes body, armor, offhand and weapon layers to the same action/frame clock.
- Inventory exposes all ten equipment slots and Character Overview reports base primary stats, gear additions, totals, derived combat values and aggregate equipment impact from the same `StatsSystem` used by combat.
- Growth preview now uses the normal stat formula with currently equipped gear instead of approximating the preview in UI code.
- Equipment swapping leaves replaced items in inventory; the same item instance cannot remain referenced by multiple slots.

## Browser limitation of this build pass

The container's managed Chromium policy blocks the local test server, so this pass does **not** claim interactive browser playthrough testing. Physical iPhone/GitHub Pages verification is still required for the visual sword alignment, Character-panel touch layout and save/load behavior on Safari.

## Recommended device regression

Test the Rustblade while idle, walking and attacking in all four cardinal directions; verify right-facing uses the mirrored side animation. Equip as many armor slots as available at once, open Character Overview, confirm each worn piece appears, compare base/gear/total values, unequip pieces one at a time, save/reload and confirm both visuals and totals persist.
