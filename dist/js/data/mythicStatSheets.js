import { statBudgetForLevel } from './statProgression.js';

function sheet(level, archetype, stats, resourceModel = 'finite_essence') {
  return Object.freeze({
    level,
    archetype,
    statBudget: statBudgetForLevel(level),
    stats: Object.freeze({ ...stats }),
    resourceModel,
    combatStatsMode: 'hand_tuned_preserved'
  });
}

// v0.1.4.4.5.4.3 canonical supernatural-level pass. The new allocations
// preserve each physically approved character's established stat identity while
// scaling that distribution into the legal budget for the user's chosen level.
// Combat HP/ATK/DEF remains hand-tuned/preserved. Named mythics use Infinite
// Essence as a resource rule; SPR remains finite and always spends a legal share.
export const CANONICAL_POWER_STAT_SHEETS = Object.freeze({
  demonKnight: sheet(30, 'infernal heavy knight', { str: 60, dex: 30, vit: 60, spr: 15 }),
  zerakoth: sheet(60, 'infernal commander duelist', { str: 120, dex: 65, vit: 100, spr: 30 }),
  mythicalDemon: sheet(135, 'infernal mythic ravager', { str: 235, dex: 171, vit: 206, spr: 78 }, 'infinite_essence'),
  lailani: sheet(150, 'celestial transcendent skirmisher', { str: 124, dex: 278, vit: 162, spr: 201 }, 'infinite_essence'),
  ancientDemonLord: sheet(160, 'infernal apex ancient', { str: 274, dex: 145, vit: 283, spr: 113 }, 'infinite_essence'),
  azrael: sheet(175, 'celestial apex warrior', { str: 305, dex: 175, vit: 288, spr: 122 }, 'infinite_essence'),
  elexis: sheet(150, 'celestial apex dominion support', { str: 143, dex: 128, vit: 217, spr: 277 }, 'infinite_essence')
});
