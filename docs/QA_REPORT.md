# v0.1.2 QA report — Cinder Refuge & World/Enemy Variety Foundation

## Automated checks completed

- All runtime asset paths resolve.
- All JS/MJS files pass `node --check`.
- Project validator passes red-haired full-combat base coverage, item/enemy/NPC references, weighted skeleton loadout references, player-safe loot filtering, named-set metadata, six refuge buildings, future-ready zone metadata, inventory Drop/Destroy behavior and save schema 1 normalization.
- New LPC runtime crops are compact animation slices rather than full 832×3456 sheets, keeping the mobile runtime texture footprint bounded.

## Physical iPhone regression checklist

1. Load an existing v0.1.1.5 save and confirm level, inventory, equipment, quests and position survive.
2. Confirm the player is the red-haired character in idle/walk and through all four sword attacks in every facing.
3. Equip Bronze/Iron helmets, Ashhide Shoulders, Legion/Silver Legion/Steel chest pieces, Legion Gloves, Ashrunner Boots and each Arming Sword palette; watch for layer drift/clipping.
4. Walk through Cinder Refuge. Confirm all six buildings render, paths/gate are readable and invisible building colliders do not trap the player.
5. Confirm Torren, Ilyan, Vesra and Sable visibly wear different loadouts. Verify dialogue interaction remains reachable.
6. Use `?debug=1` to visit Imp, Carrion, Rotwing, Slate, Bloodbone, Gilded and Captain enemies.
7. Kill/respawn Skeleton variants repeatedly and confirm their visible gear can change only on respawn, not during one life.
8. Confirm skeleton equipment never causes the player to be physically shoved; combat remains range-driven.
9. Confirm only player-compatible equipment appears as new normal loot even when an enemy visibly wears legacy/NPC-only gear.
10. Fill the inventory, then test Drop and Destroy including equipped items and quest-item protection.
11. Perform the long-right-movement Safari regression: hold/release joystick, multi-touch Attack + movement, drag outside joystick, app-switch, return, orientation/visibility changes. No phantom sliding should remain.
12. Save/reload after fighting new enemy families and with new gear equipped.

## Known manual-only areas

Browser rendering, exact art alignment, touch feel, Safari lifecycle behavior and performance under a real horde still require physical-device observation. Automated validation cannot certify visual taste or iOS event delivery.
