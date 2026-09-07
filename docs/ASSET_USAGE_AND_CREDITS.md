# Asset Usage and Credits

## Shipping/development policy

Ashfall uses legally reusable LPC-family assets and preserves the attribution records supplied with the project. No Dekaron/2Moons artwork, names, maps, UI, monsters or story content is included.

v0.1.1.1 also includes user-supplied Universal LPC generator exports created on 2026-09-06. The complete supplied PNGs and the credit files that accompanied them are preserved under `dist/assets/source-exports/2026-09-06/`. Gameplay does **not** preload those complete generator sheets; it loads only the smaller runtime crops under `dist/assets/player/revised/`.

This document separates assets with supplied attribution from assets whose matching generator credit export is still missing. An attribution hold means the file may be used in this private/development build as requested, but it should not be treated as cleared for a commercial/store release until its exact generator credits are captured and reviewed.

## Original core assets

| Runtime use | Source family | Preserved record |
| --- | --- | --- |
| Legacy modular body/hair/clothing/armor | LPC Medieval Fantasy modular pack | original supplied README/credits under `dist/assets/licenses/original/` |
| Legacy oversized Rustblade | LPC DCSS Swords | `LPC_DCSS_Swords_CREDITS.txt` |
| Wooden offhand | Expanded Universal LPC shield layers | original supplied records |
| Cinder Imp | LPC Imp 2 | `LPC_Imp_2_readme.txt` |
| Ash Skeleton / Captain Ossivar | LPC Medieval Fantasy skeleton layers | original supplied records |
| Terrain/rocks/trees/bridge | LPC Revised 4-Season Terrain | 4-Season terrain/object/structure credit files |
| Dungeon/Refuge props | LPC Dungeon Elements | `LPC_Dungeon_Elements_credit.txt` |

## 2026-09-06 user generator exports with supplied credits

### Revised base body / head / face and Katana export

The supplied `credits.txt` records the revised male body/head/face components and the Katana layer. It includes OGA-BY 3.0 as an available license route for the listed face/Katana pieces, and the body/head entries also list their applicable mixed license options. Preserve the complete supplied credit file with distribution and select a compatible license route for final release.

Runtime use:

- revised player body animation foundation;
- staged Ashland Katana limited/NPC weapon asset.

### Arming Sword export

The supplied `credits 2.txt` identifies `weapon/sword/arming/universal/fg/walk/silver.png`, credits ElizaWy with walk/down work by JaidynReiman, and lists OGA-BY 3.0.

Runtime use:

- Ashen Arming Sword walk / standard slash / one-handed slash / backslash / halfslash visual set.

## 2026-09-06 generator exports on attribution hold

Matching generator credit text was **not** supplied for these PNGs:

- `Boots.png`
- `Gloves.png`
- `Legion chest.png`
- `Red bat wings.png`
- `Iron helmet.png`
- `Shoulders.png`

They are integrated into the development build because the user explicitly wants all current assets represented, but their production/store-release status remains unresolved until their exact generator credits are exported and preserved.

Runtime use:

- Legion Boots — player equipment with standard-slash fallback on unsupported revised attacks;
- Legion Gloves — full revised-combat player equipment;
- Legion Cuirass — full revised-combat player equipment;
- Crimson Bat Wings — full revised-combat, progression-gated Wing equipment with buffs;
- Iron War Helm — full revised-combat player equipment;
- Legion Pauldrons — Shoulder equipment with standard-slash fallback on unsupported revised attacks.

## v0.1.1.5 gear-expansion exports

The following full generator PNGs supplied for the v0.1.1.5 gear pass are preserved under `dist/assets/source-exports/2026-09-06/gear-expansion-v0115/`:

- `Bronze helm.png`
- `Leather shoulders.png`
- `Leather boots.png`
- `Silver legion.png`
- `Steel plate.png`
- `Iron arming.png`
- `Brass arming.png`

All seven were verified against the actual populated source pixels used by the current walk + four-hit revised-combat profile before being admitted to normal player loot. Runtime crops are lossless rectangular extracts only.

The supplied `credits-silver-arming.txt` confirms the LPC Arming Sword family (`weapon/sword/arming/universal/fg/...`) under OGA-BY 3.0, crediting ElizaWy with walk/down work by JaidynReiman. The Iron and Brass uploads are palette variants with the same verified arming-sword geometry, but their exact variant-specific generator credit export was not supplied in this batch. Preserve the known family credit, and capture the exact variant exports before commercial/store release.

Matching generator credit text was also not supplied for Bronze Helm, Leather Shoulders, Leather Boots, Silver Legion or Steel Plate. Those five pieces are therefore integrated for development/testing but remain on the same attribution hold used for earlier user generator exports. Two additional supplied TXT files in this batch reference the Katana/body export rather than these armor pieces and are preserved as received instead of being misattributed.

## Runtime crops

Runtime crops are lossless rectangular extracts/reorganizations of the user-supplied generator sheets for the specific animation bands used by gameplay. They are not intended as new authorship claims. Full source exports remain preserved beside the supplied credit files.

The current mappings use:

- 64×64 revised body/armor bands for walk, standard slash, revised one-handed/backslash source, and halfslash;
- 128×128 Arming Sword combat bands plus its compact walk band;
- 128×128 Katana walk/slash bands for future humanoid NPC/enemy loadouts.

## Final-release checklist

Before an App Store / Play Store / commercial release:

1. Export and preserve the matching Universal LPC credits for every generator-created armor/wing layer still on hold.
2. Review all mixed-license base-body entries and select/document one compatible distribution route.
3. Keep the full attribution directory with the build/repository and add required attribution to store/legal pages as appropriate.
4. Re-run an asset provenance audit after any new tileset, building pack, enemy pack or equipment export is added.

This organization note is not legal advice.
