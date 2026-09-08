// v0.1.4.4.5 combat-threat hierarchy, extended in v0.1.4.4.5.4.3 with
// separate mortal (100) and supernatural (250) canonical ceilings plus the
// first canonical rescale of named mythic levels. Threat tier remains separate
// from level so AI escalation logic does not change merely because labels do.
// Threat tiers answer a different AI question:
// "is this single opponent important enough to justify an area/signature cast?"
// Keeping those concepts separate lets mythics use their full kit in duels
// without teaching ordinary units to waste screen-filling attacks on one mob.
export const THREAT_TIERS = Object.freeze({
  ordinary: 0,
  elite: 1,
  commander: 2,
  boss: 3,
  mythic: 4,
  apex: 5
});

export const INFERNAL_LEVEL_HIERARCHY = Object.freeze({
  demonKnight: Object.freeze({ internalLevel: 30, threatTier: 'elite' }),
  zerakoth: Object.freeze({ internalLevel: 60, threatTier: 'commander' })
});

export const MYTHIC_LEVEL_HIERARCHY = Object.freeze({
  mythicalDemon: Object.freeze({ internalLevel: 135, threatTier: 'mythic' }),
  lailani: Object.freeze({ internalLevel: 150, threatTier: 'mythic' }),
  ancientDemonLord: Object.freeze({ internalLevel: 160, threatTier: 'apex', reserved: true }),
  azrael: Object.freeze({ internalLevel: 175, threatTier: 'apex' }),
  elexis: Object.freeze({ internalLevel: 150, threatTier: 'apex' }),
  seraphel: Object.freeze({ internalLevel: 220, threatTier: 'apex' }),
  playerHardCap: 100,
  mortalHardCap: 100,
  supernaturalHardCap: 250
});

export function threatTierOf(actor) {
  const def = actor?.def || actor || {};
  const explicit = actor?.threatTier || def.threatTier;
  if (explicit && Object.prototype.hasOwnProperty.call(THREAT_TIERS, explicit)) return explicit;
  if (actor?.tier === 'mythic' || def.tier === 'mythic') return 'mythic';
  if (actor?.boss || def.boss) return 'boss';
  if (actor?.commander || def.commander || def.named) return 'commander';
  if (actor?.elite || def.elite) return 'elite';
  return 'ordinary';
}

export function threatRankOf(actor) {
  return THREAT_TIERS[threatTierOf(actor)] ?? THREAT_TIERS.ordinary;
}

export function isWorthyTarget(target, minimumTier = 'mythic') {
  const minimum = THREAT_TIERS[minimumTier];
  if (!Number.isFinite(minimum) || !target) return false;
  return threatRankOf(target) >= minimum;
}

export function clusterOrWorthy(clusterCount, minimumCluster, target, minimumTier = null) {
  if ((Number(clusterCount) || 0) >= Math.max(1, Number(minimumCluster) || 1)) return true;
  return minimumTier ? isWorthyTarget(target, minimumTier) : false;
}
