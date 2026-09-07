export const FACTIONS = Object.freeze({
  PLAYER: 'player',
  CELESTIAL: 'celestial',
  MONSTER: 'monster',
  NEUTRAL: 'neutral'
});

const RELATIONS = Object.freeze({
  player: Object.freeze({ player: 'friendly', celestial: 'friendly', monster: 'hostile', neutral: 'neutral' }),
  celestial: Object.freeze({ player: 'friendly', celestial: 'friendly', monster: 'hostile', neutral: 'neutral' }),
  monster: Object.freeze({ player: 'hostile', celestial: 'hostile', monster: 'friendly', neutral: 'neutral' }),
  neutral: Object.freeze({ player: 'neutral', celestial: 'neutral', monster: 'neutral', neutral: 'neutral' })
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
