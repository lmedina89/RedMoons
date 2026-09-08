// v0.1.4.4.5.4.2 canonical primary-stat progression contract.
// Mortal/player progression and supernatural entities share the same primary
// point arithmetic. Supernatural combat output may use a separate scaling layer;
// a canonical stat sheet is identity/progression metadata until that later layer
// is explicitly adopted by the combat resolver.
export const PRIMARY_STAT_KEYS = Object.freeze(['str', 'dex', 'vit', 'spr']);
export const BASE_PRIMARY_STATS = Object.freeze({ str: 5, dex: 5, vit: 5, spr: 5 });
export const BASE_PRIMARY_STAT_TOTAL = 20;
export const STAT_POINTS_PER_LEVEL = 5;
export const MORTAL_LEVEL_CAP = 100;
export const SUPERNATURAL_LEVEL_CAP = 250;

export function statBudgetForLevel(level) {
  const resolved = Math.max(1, Math.min(SUPERNATURAL_LEVEL_CAP, Math.floor(Number(level) || 1)));
  return BASE_PRIMARY_STAT_TOTAL + (resolved - 1) * STAT_POINTS_PER_LEVEL;
}

export function statSheetTotal(stats = {}) {
  return PRIMARY_STAT_KEYS.reduce((sum, key) => sum + Math.max(0, Math.floor(Number(stats[key]) || 0)), 0);
}

export function isValidStatSheet(level, stats = {}) {
  return PRIMARY_STAT_KEYS.every(key => Number.isInteger(stats[key]) && stats[key] >= BASE_PRIMARY_STATS[key])
    && statSheetTotal(stats) === statBudgetForLevel(level);
}
