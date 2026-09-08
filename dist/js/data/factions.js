export const FACTIONS = Object.freeze({
  PLAYER: 'player',
  CELESTIAL: 'celestial',
  MONSTER: 'monster',
  FALLEN: 'fallen',
  NEUTRAL: 'neutral'
});

// `fallen` is deliberately a third combat side. Its presence must not change
// the established Celestial↔Infernal war: both existing factions remain hostile
// to one another, and each is additionally hostile to Fallen actors.
const RELATIONS = Object.freeze({
  player: Object.freeze({ player: 'friendly', celestial: 'friendly', monster: 'hostile', fallen: 'hostile', neutral: 'neutral' }),
  celestial: Object.freeze({ player: 'friendly', celestial: 'friendly', monster: 'hostile', fallen: 'hostile', neutral: 'neutral' }),
  monster: Object.freeze({ player: 'hostile', celestial: 'hostile', monster: 'friendly', fallen: 'hostile', neutral: 'neutral' }),
  fallen: Object.freeze({ player: 'hostile', celestial: 'hostile', monster: 'hostile', fallen: 'friendly', neutral: 'neutral' }),
  neutral: Object.freeze({ player: 'neutral', celestial: 'neutral', monster: 'neutral', fallen: 'neutral', neutral: 'neutral' })
});

export function factionOf(actor) {
  return actor?.faction || actor?.def?.faction || (actor?.isPlayer ? FACTIONS.PLAYER : FACTIONS.NEUTRAL);
}

export function relationBetween(a, b) {
  const af = factionOf(a);
  const bf = factionOf(b);
  return RELATIONS[af]?.[bf] || 'neutral';
}

export function areHostile(a, b) { return relationBetween(a, b) === 'hostile'; }
export function areFriendly(a, b) { return relationBetween(a, b) === 'friendly'; }
