const MAX_RETURN_DEPTH = 4;

function finite(value) { return Number.isFinite(Number(value)); }

export function ensureTravelState(state) {
  if (!state.travel || typeof state.travel !== 'object' || Array.isArray(state.travel)) state.travel = { returnStack: [] };
  if (!Array.isArray(state.travel.returnStack)) state.travel.returnStack = [];
  return state.travel;
}

export function makeReturnAnchor({ mapId, x, y, entryPointId = null, transitionId = null }) {
  if (!mapId || !finite(x) || !finite(y)) return null;
  return {
    mapId: String(mapId),
    x: Number(x),
    y: Number(y),
    entryPointId: typeof entryPointId === 'string' ? entryPointId : null,
    transitionId: typeof transitionId === 'string' ? transitionId : null
  };
}

export function pushReturnAnchor(state, anchor) {
  const travel = ensureTravelState(state);
  if (!anchor) return false;
  travel.returnStack.push({ ...anchor });
  while (travel.returnStack.length > MAX_RETURN_DEPTH) travel.returnStack.shift();
  return true;
}

export function peekReturnAnchor(state) {
  const travel = ensureTravelState(state);
  return travel.returnStack.length ? travel.returnStack[travel.returnStack.length - 1] : null;
}

export function popReturnAnchor(state) {
  const travel = ensureTravelState(state);
  return travel.returnStack.pop() || null;
}

export function normalizeTravelState(value, mapDefs) {
  const result = { returnStack: [] };
  const rows = value && typeof value === 'object' && !Array.isArray(value) && Array.isArray(value.returnStack)
    ? value.returnStack
    : [];
  for (const row of rows.slice(-MAX_RETURN_DEPTH)) {
    if (!row || typeof row !== 'object' || !mapDefs?.[row.mapId] || !finite(row.x) || !finite(row.y)) continue;
    const map = mapDefs[row.mapId];
    result.returnStack.push({
      mapId: row.mapId,
      x: Math.max(48, Math.min(map.width - 48, Number(row.x))),
      y: Math.max(48, Math.min(map.height - 48, Number(row.y))),
      entryPointId: typeof row.entryPointId === 'string' && map.entryPoints?.[row.entryPointId] ? row.entryPointId : null,
      transitionId: typeof row.transitionId === 'string' ? row.transitionId.slice(0, 96) : null
    });
  }
  return result;
}

export const RETURN_STACK_LIMIT = MAX_RETURN_DEPTH;
