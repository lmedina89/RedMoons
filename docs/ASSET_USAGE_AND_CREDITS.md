# Asset Usage and Credits

## Shipping/development policy

Ashfall uses legally reusable LPC-family assets and preserves the attribution records supplied with the project. No Dekaron/2Moons artwork, names, maps, UI, monsters or story content is included.

v0.1.1.1 also includes user-supplied Universal LPC generator exports created on 2026-09-06. The complete supplied PNGs and the credit files that accompanied them are preserved under `source-assets/source-exports/2026-09-06/`. Gameplay does **not** preload those complete generator sheets; it loads only the smaller runtime crops under `dist/assets/player/revised/`.

This document separates assets with supplied attribution from assets whose matching generator credit export is still missing. An attribution hold means the file may be used in this private/development build as requested, but it should not be treated as cleared for a commercial/store release until its exact generator credits are captured and reviewed.



## v0.1.4.2 hostile-character runtime crops

Four compact runtime animation sheets are deterministic rectangular crops from user-provided concept sheets already preserved under `source-assets/character-concepts/2026-09-07/`:

- `dist/assets/enemies/hostile-human/ash-assassin-walk.png` and `ash-assassin-slash.png` derive from `human-hostile/Assassin.png`.
- `dist/assets/enemies/demon/demon-scout-walk.png` and `demon-scout-slash.png` derive from `demon-castle/DemonBase.png`.

Only the verified LPC-style walk (rows 8–11) and slash (rows 12–15) bands are shipped at runtime; the 832×3456 authoring sheets remain source-only. These crops introduce no new authorship claim. Exact matching upstream license/credit records for the two concept sheets are not present in the project tree, so the runtime derivatives remain **development-authorized / attribution hold** until provenance is resolved before commercial/store distribution.

Ash Scavenger and Ironbound Raider visuals introduce no new external sheets: they reuse the existing `npc_olive_base` plus already-preserved NPC-compatible item/equipment layers through weighted data-driven loadouts.

## v0.1.4.1 workshop-derived environment props

The preserved user-supplied source sheets `source-assets/world/workshops/lpc-revised-blacksmith.png`, `lpc-revised-woodshop.png` and `lpc-revised-tailor.png` are now used more effectively without shipping the full authoring sheets. Seven compact transparent crops are stored under `dist/assets/world/props/` for Refuge: forge, smith tools, smith racks, carpentry bench, wood toolboard, loom and textile display.

No matching credit/license text for those three workshop source sheets is currently present in the project tree. Accordingly, these crops are **development-authorized / attribution hold** exactly like other user-supplied art with missing exact generator records. Before a commercial or store release, capture and preserve the matching source attribution/license records and verify that the chosen distribution license is compatible. The crop operation does not create a new authorship claim.

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

The following full generator PNGs supplied for the v0.1.1.5 gear pass are preserved under `source-assets/source-exports/2026-09-06/gear-expansion-v0115/`:

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

## v0.1.2 world/enemy/humanoid development assets

The following user-supplied source files are preserved under `source-assets/source-exports/2026-09-06/world-enemy-v012/` and processed into compact runtime crops where appropriate:

- Red haired guy.png — active player base.
- Olive skinned NPC mustache.png — Sable/future adventurer base.
- Beast zombie.png — Carrion Beast runtime walk/slash.
- Zombie boar wings(1).png — Rotwing Ravager runtime walk/slash.
- Zombie slate skeleton.png — Slate Revenant layered base.
- Red skeleton.png — Bloodbone layered base.
- Yellow skeleton.png — Gilded Ossuary Guard layered base.
- adobe.png / adobe6.png — Cinder Refuge building source. Included `adobe-credit.txt` is preserved.
- Castle2_set.png — Cinder Refuge prop source; exact final source/license attribution still needs collection.

The user authorized use during development before final credit collection. Missing attribution is tracked as a release-readiness limitation and should be resolved before commercial/store distribution.

## v0.1.2.3 asset-variety staging

- Runtime enemy crops were added for selected supplied Goblin, Spider and Golem art plus red/green/blue LPC Imp variants harvested from the pre-existing Core archive.
- `adobe2-set.png`, evergreen/seasonal bushes and mushrooms are used as non-colliding runtime scenery.
- `cave3.png` is now a curated runtime world asset for Ashfall Hollow. The revised blacksmith/tailor/woodshop source sheets remain preserved under `source-assets/world/workshops/` and are not served/preloaded until a mapped interior needs a curated runtime form.
- Source-authoring PSDs (including the supplied Wolf/Goblin source PSDs) are **not shipped in `dist/assets`**. The Goblin was converted to compact runtime PNGs; the Wolf remains deferred until its animation layout is verified rather than guessed.
- Development use was explicitly authorized by the user before final credit collection. Missing/unknown attribution remains a release-readiness task and must be resolved before any commercial/store release.


## v0.1.2.3 variety sources

Development/runtime additions in this pass come from two places:

- Existing organized LPC sources already preserved by the project: Imp color/loadout variants, 4-season vegetation/pines and additional Expanded Arming Sword material palettes.
- User-supplied LPC/OpenGameArt-derived Goblin, Spider, Golem, Adobe-2, Cave3 and revised Workshop source assets.

Only compact/map-required PNG runtime sheets/crops are loaded. Cave3 is now used by Ashfall Hollow; workshop full tilesheets remain source-only for future mapped interiors, and the supplied Wolf PSD is deliberately not shipped in runtime assets until a verified export is produced.

The user explicitly authorized development use without completing the final attribution pass now. Exact attribution/license verification remains a release-readiness checklist item before App Store/Play Store/commercial distribution; this development decision does not erase upstream license obligations.

## v0.1.2.4 source/runtime separation

No development art was discarded during the asset-hardening pass. Previous source exports were moved intact from the served `dist/assets/source-exports/` tree to top-level `source-assets/source-exports/`. Staged workshop authoring sheets likewise live under `source-assets/world/workshops/`.

The supplied Cave3 sheet has two roles that are kept explicit: a preserved development/source copy under `source-assets/world/` and the curated runtime copy under `dist/assets/world/` used by the new Ashfall Hollow map. The supplied Golem death PNG is now a live runtime dependency for Ashstone Golem's death presentation.

This layout is intentional: future harvesting can continue from the preserved source library while GitHub Pages serves only the assets the game is allowed/intended to request. Existing attribution caveats and upstream license obligations remain unchanged.


## 2026-09-07 user-created Demon / Heavenly / transformation concepts

The following user-supplied full 832×3456 RGBA LPC-style sheets are preserved under `source-assets/character-concepts/2026-09-07/` and are **not runtime assets in v0.1.3.1**:

- `player-transformation/Transformation.png` — authoritative future player transformation source.
- `demon-castle/DemonBase.png`
- `demon-castle/RedDemon.png`
- `demon-castle/TanDemon.png`
- `demon-castle/DemonLordFlesh.png`
- `heavenly-and-unique/Truetrans.png`
- `heavenly-and-unique/TransupOrHolyKnight.png`

The user created/provided these sheets for this project. Their final gameplay roles remain project-defined. Current intent is to use winged skeletal bodies as Demon Castle bases that can receive modular equipment/loadouts, while human-bodied winged characters bias toward Heavenly Castle NPC/guard/unique-character roles. Only `Transformation.png` is designated for the future player transformation. Full sheets remain source-only; future gameplay should harvest only the action-specific crops actually required.

### v0.1.2.4.2 starter-trouser runtime overlay

`dist/assets/player/revised/starter-trousers-{walk,slash,backslash,halfslash}.png` is a deterministic compact overlay derived from the user's existing `protagonist-red-*` revised runtime poses. It recolors only the lower-body pose pixels into a dark ash-cloth trouser presentation so the saved Level-1 `Ashcloth Trousers` item can remain aligned through the existing four-hit combo. It introduces no new external artwork or license dependency.

### v0.1.2.4.2 starter-handwrap runtime overlay

`dist/assets/player/revised/starter-wraps-{walk,slash,backslash,halfslash}.png` is a deterministic recolor of the already-verified revised `legion-gloves-*` runtime pose layer. Geometry/alpha are unchanged; only visible RGB values are remapped to a worn brown leather-wrap palette so the Level-1 `Hide Handwraps` read as beginner gear instead of bright metal gloves. This introduces no new external artwork or license dependency.


## v0.1.3 expanded LPC runtime crops

v0.1.3 adds compact `spellcast`, `thrust`, `shoot` and `hurt` runtime crops for the active red-haired player base, the combo-safe starter clothing layers, and the Skeleton/Slate Skeleton bases. These are deterministic action-region crops/derivatives of source art already preserved by the project; the full 832×3456 authoring sheets remain outside `dist/`.

The starter trouser and handwrap visual treatments are extended onto the matching expanded poses using the same v0.1.2.4.2 derivative policy: trouser appearance follows the verified player pose geometry and handwraps preserve verified glove alpha/geometry while remapping the visible palette. No external asset license is introduced by those deterministic derivatives.

Bone Archer now uses a verified compact bow+arrow shoot overlay harvested from the preserved LPC Medieval Fantasy (`lpc_entry`) modular source. The exact `WEAPON_bow.png` and `WEAPON_arrow.png` sources plus the preserved LPC README are kept under `source-assets/combat-v013/classic-bow/`; the runtime composite is `dist/assets/enemies/skeleton-bow-shoot.png`. The project uses the OGA-BY 3.0 source option already documented for `lpc_entry`. Gravecaller intentionally uses its real Skeleton spellcast body action plus procedural shadow FX without inventing an unverified staff spellcast layer.

## v0.1.3.1 run + spear crops

The player/starter true-run runtime sheets are compact crops/derivatives from the preserved Expanded LPC source exports already retained outside `dist/`. `starter-wraps-run.png` uses the same verified brown-wrap presentation as the existing starter hand layers; the source glove export has no rear-facing run pixels, so the rear row is deterministically reconstructed from the verified player's rear-run hand pixels using the existing brown wrap palette rather than leaving the handwraps to vanish.

The Bone Spearman uses `dist/assets/enemies/skeleton-spear-thrust.png`, harvested from the preserved LPC Medieval Fantasy / `lpc_entry` long-spear source. The exact source spear, source readme/credit text and hashes are retained under `source-assets/combat-v0131/classic-spear/`.
## v0.1.3.2 recovery presentation

v0.1.3.2 introduces no new external visual or audio asset dependency. The Ashen Rest marker, recovery feedback and cooldown presentation use procedural Phaser/DOM graphics, and heal/Essence/food/rest sounds use the existing procedural WebAudio foundation. All v0.1.3.1 source artwork is retained unchanged.
## v0.1.4.2.1 completed Refuge workshop shell

`dist/assets/world/buildings/adobe_workshop_full.png` is a local composite made exclusively from the already-included adobe building artwork: the existing `adobe2-set.png` tiles and preserved `adobe_workshop.png` facade. No new third-party art source or license is introduced by this hotfix.

