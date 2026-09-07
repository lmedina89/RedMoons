export const ACTOR_COLLISION_KIND = Object.freeze({
  PLAYER: 'player',
  ENEMY: 'enemy'
});

export function colliderBlocksActor(colliderLike, actorKind) {
  const blocks = colliderLike?.colliderBlocksActors || colliderLike?.blocksActors || colliderLike?.blocks || [];
  return Array.isArray(blocks) && blocks.includes(actorKind);
}

export function enemyIgnoresWorldCollision(enemy) {
  return enemy?.def?.traversal?.worldCollision === 'phase';
}

export function detourVelocity(vx, vy, sign = 1, scale = 0.92) {
  const magnitude = Math.hypot(vx, vy);
  if (!magnitude) return { vx: 0, vy: 0 };
  const normalizedSign = sign < 0 ? -1 : 1;
  return {
    vx: -vy * normalizedSign * scale,
    vy: vx * normalizedSign * scale
  };
}

export function pointInRectArea(area, x, y) {
  return Boolean(area && x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height);
}
export function segmentIntersectsCollider(x1, y1, x2, y2, colliderLike, padding = 0) {
  const width = colliderLike?.colliderWidth ?? colliderLike?.width ?? 0;
  const height = colliderLike?.colliderHeight ?? colliderLike?.height ?? 0;
  const cx = colliderLike?.x ?? 0;
  const cy = colliderLike?.y ?? 0;
  const minX = cx - width / 2 - padding, maxX = cx + width / 2 + padding;
  const minY = cy - height / 2 - padding, maxY = cy + height / 2 + padding;
  const dx = x2 - x1, dy = y2 - y1;
  let tMin = 0, tMax = 1;
  const clip = (origin, delta, min, max) => {
    if (Math.abs(delta) < 1e-9) return origin >= min && origin <= max;
    let a = (min - origin) / delta, b = (max - origin) / delta;
    if (a > b) [a, b] = [b, a];
    tMin = Math.max(tMin, a);
    tMax = Math.min(tMax, b);
    return tMin <= tMax;
  };
  return clip(x1, dx, minX, maxX) && clip(y1, dy, minY, maxY);
}

