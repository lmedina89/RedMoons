# 2026-09-07 Demon / Heavenly / Transformation Character Concepts

These full RGBA Universal-LPC-style sheets are **development/source artwork first**. Most use 832×3456 geometry; Lailani/Lexi use a larger 1536×4224 authoring layout. They are preserved outside `dist/` and are not preloaded by the mobile game.

## Authoritative player transformation source

- `player-transformation/Transformation.png` — the one sheet currently designated for the future timed **player transformation** system. It will eventually be harvested into compact action-specific runtime crops. Equipment remains mechanically equipped during transformation; incompatible armor/clothing visuals may be suppressed while compatible weapon/shield layers can remain visible.

No transformation gameplay is activated in v0.1.2.4.3. This file is staged only.

## Demon Castle source pool

- `demon-castle/DemonBase.png` — winged skeletal demon base; strong candidate for modular Demon Castle soldiers with armor/weapon loadouts.
- `demon-castle/RedDemon.png` — red winged skeletal demon variant; candidate for a separate legion/rank/elite family.
- `demon-castle/TanDemon.png` — tan/bone winged skeletal demon variant; candidate for another legion/rank/elite family.
- `demon-castle/DemonLordFlesh.png` — **Fleshborn Ravager** elite/heavy Demon Legion source.
- `demon-castle/DemonMythical.png` — reserved named mythical demon; fixed appearance/gear; source-only.
- `demon-castle/AncientDemonLord.png` — reserved Ancient Demon Lord near Azrael's power tier; fixed appearance/gear; source-only.

The skeletal demon bodies are specifically intended to reuse compatible LPC armor, helmets, weapons, shields, robes and later skill animations so Demon Castle can field distinct equipment sets rather than one repeated sprite.

## Heavenly / unique character source pool

- `heavenly-and-unique/BaseAngel.png` — common angel body + white wings; reusable layered troop base.
- `heavenly-and-unique/HeavenlyKnight.png` — fixed armored common Heavenly Guardian archetype.
- `heavenly-and-unique/LailaniAngel.png` — reserved named high/mythical angel near Azrael tier; fixed gear; source-only.
- `heavenly-and-unique/LexiAngel.png` — reserved named high/mythical angel near Azrael tier; fixed gear; source-only.
- `heavenly-and-unique/TransupOrHolyKnight.png` — special/unique humanoid NPC candidate; **not** the player transformation.
- `heavenly-and-unique/Truetrans.png` — preserved winged humanoid character source; **not** the player transformation after the 2026-09-07 reclassification. Candidate for a Heavenly Castle NPC/guard/named character or other future role.
- `heavenly-and-unique/HoodedAzrael.png` — canonical **ArchAngel Azrael** source. Azrael is a unique mythic/celestial NPC, never a generic spawn and never a player transformation. His normal presentation is planned around hover/glide/wing-burst movement and an expanded combat moveset. His public level presentation is intentionally obscured (`Lv. ???`). v0.1.3.2.2 harvests compact action-specific runtime crops for the temporary field test while this full authoring sheet remains source-only and is never preloaded directly.

Human-bodied winged sources should generally bias toward Heavenly Castle NPCs, guards, commanders, named characters or related factions; exact story roles remain flexible except for ArchAngel Azrael, whose unique role is now reserved.

## Hostile human source pool

- `human-hostile/Assassin.png` — reusable hostile human assassin/skirmisher source. Planned actions include agile run/walk movement, thrust/lunge, slash/backslash/halfslash combos, optional thrown-knife use from the shoot block, and evasive jump behavior.

## Expanded LPC row map used by the staged 832×3456 sheets

The sheets use 64×64 cells (13 columns × 54 rows). Four-row action blocks use direction order **North, West, South, East**:

- rows 0–3: spellcast (7 frames)
- rows 4–7: thrust (8)
- rows 8–11: walk (9)
- rows 12–15: slash (6)
- rows 16–19: shoot (13)
- row 20: hurt/down (6)
- row 21: climb (6)
- rows 22–25: idle (2)
- rows 26–29: jump (5)
- rows 30–33: sit (3)
- rows 34–37: emote (3)
- rows 38–41: run (8)
- rows 42–45: combat idle (2)
- rows 46–49: backslash (13)
- rows 50–53: halfslash (6)

For Azrael, `run` is reserved as the primary wing-assisted glide presentation, `jump` as lift/wing-burst material, and the advanced slash blocks for signature combat. The sheet's hurt/down row is reserved for knockdown/defeat rather than a routine hit flinch.

`SHA256SUMS.txt` records the exact staged bytes.
