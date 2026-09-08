# Veil Warfront Foundation — v0.1.4.4.1

## Purpose

The first Warfront release establishes the place before the armies. The player reaches it through the Veil Threshold using the existing nested return-anchor system. The map is 6144×3072 and is intentionally empty of live faction spawns so physical testing can isolate traversal, collision, scale and atmosphere.

## Geography

- West: Infernal Stronghold → Cinder Bastion → Riven Front.
- Center: Axis of First Light, with The Unhoused ruined settlement and Veil Gate to the south.
- East: Dawnward Front → Halo Bastion → Celestial Stronghold.
- Three east/west traversal bands (north, center, south) are connected at five vertical cross-routes.
- A luminous celestial water channel creates three meaningful bridge crossings.
- Northern cliff shelves use autumn stone in the west and winter/ice stone in the east to break sightlines without making hard biome borders.

## Atmosphere

Celestial territory uses winter ground, pale architecture, icy water, reflections and sparse winter plants. Infernal territory uses non-winter dark earth, autumn cliff stone, dungeon/bone/fire occupation details and walkable red fissures. The central band overlays both palettes around an ancient ring mechanism that visually predates both factions.

Ambient FX are bounded: 38 world-space mote/ember/rune-dust sprites, two rotating Axis Graphics rings, one Veil pulse and four tiny distant-battle flash sprites. No custom full-screen shader is used.

## v0.1.4.4.1 landmark-detail layer

The geography remains fixed, but the seven non-Axis landmark zones now have distinct environmental roles and bounded authored detail. Main strongholds receive ritual/sanctuary centerpiece compositions, rear outposts emphasize logistics/support, forward outposts emphasize damaged defense, and The Unhoused mixes workshop/civilian remnants. Six large centerpiece objects add visible-source collision; minor clutter remains visual-only. A 136 authored-sprite ceiling and six persistent landmark Graphics FX keep this richer pass mobile-conscious.

## Staged next pass

v0.1.4.4.2 can populate the approved/detail-complete map with bounded common-unit faction warfare. Named mythical actors remain separate bespoke releases.
