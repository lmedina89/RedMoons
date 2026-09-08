# El’exis Field Test — v0.1.4.4.4

**El’exis — Mother of the Host** is an Azrael-tier named celestial whose combat identity is Dominion, protection, restoration, and formation control.

## Seven-skill kit

- **Crown of Dominion** — 60-second state; personal mitigation; 4.5-second restorative/Guard pulses for nearby Celestials; restrained retaliatory holy pulse.
- **Spear of the Firmament** — precise high-damage celestial execution strike.
- **Chains of the Seventh Throne** — binds enemy formations with damage, slow, stagger pressure, and radiant chain geometry.
- **Astral Severance** — frequent close-range triple-crescent celestial cut.
- **Edict of Sanctuary** — support-priority sanctuary: large initial ordinary-angel heal, sustained healing pulses, Guard, and enemy slow/control.
- **Heavenfall Constellation** — six sequential star strikes across a clustered formation.
- **Throne Beyond Heaven** — rare two-stage bind/execution signature with a suspended throne/crown seal and descending celestial columns.

## Healing policy

Ordinary Celestial troops receive the full configured healing. When an ally is materially wounded, Edict of Sanctuary is prioritized before El’exis enters Crown of Dominion. Player healing is conservative, and healing received by other named mythics is reduced. This preserves El’exis’s maternal battlefield identity without allowing future named Celestials to create an effectively immortal sustain loop.

## Runtime art

The preserved source is `source-assets/character-concepts/2026-09-07/heavenly-and-unique/LexiAngel.png` (1536×4224). Runtime crops use the verified complete LPC blocks:

- spellcast: source x0 y0, 448×256
- thrust: source x0 y256, 512×256
- walk: source x0 y512, 576×256
- slash: source x0 y768, 384×256
- shoot: source x0 y1024, 832×256
- hurt: source x0 y1280, 384×64
- idle: source x0 y1408, 128×256

All preserve the complete wings/clothing presentation visible in the supplied sheet.

## Physical QA

Use `?debug=1`:

- **El’exis Field Test** — jumps to her temporary station south of Halo Bastion among ordinary Celestials.
- **El’exis Solo Test** — clean isolated recurring demon waves for uninterrupted offensive/defensive observation.
- **El’exis AI Overlay** — shows current state, target, HP, Crown timer, and highest allied support need.

Watch especially for Edict priority/readability, Crown pulse density, Chains control clarity, Constellation sequencing, Throne spectacle, and sustained iPhone smoothness.
