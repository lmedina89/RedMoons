import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BUILDING_DEFS, COLLIDERS, buildingVisualBounds } from '../dist/js/data/world.js';
import { NPC_DEFS } from '../dist/js/data/npcs.js';

const buildingColliders = new Map(
  COLLIDERS.filter(collider => collider.source === 'building')
    .map(collider => [collider.id.replace(/^building-/, ''), collider])
);

assert.equal(buildingColliders.size, BUILDING_DEFS.length, 'Every Refuge building must have exactly one derived solid');

for (const building of BUILDING_DEFS) {
  const visual = buildingVisualBounds(building);
  const collider = buildingColliders.get(building.id);
  assert.ok(collider, `${building.id} must have a building collider`);
  const left = collider.x - collider.width / 2;
  const right = collider.x + collider.width / 2;
  const top = collider.y - collider.height / 2;
  const bottom = collider.y + collider.height / 2;

  assert.ok(left >= visual.left - 0.01 && right <= visual.right + 0.01, `${building.id} collider must stay inside the rendered building width`);
  assert.ok(top >= visual.top - 0.01 && bottom <= visual.bottom + 0.01, `${building.id} collider must stay inside the rendered building height`);
  assert.ok(collider.width >= visual.width * 0.82, `${building.id} collider should cover most of the visible structure width`);
  assert.ok(collider.height >= visual.height * 0.82, `${building.id} collider should cover most of the visible structure height`);
  assert.ok(collider.y < building.y + visual.height * 0.05, `${building.id} collider must not drift below its visual anchor`);
}


const segmentIntersectsCollider = (a, b, collider) => {
  const left = collider.x - collider.width / 2;
  const right = collider.x + collider.width / 2;
  const top = collider.y - collider.height / 2;
  const bottom = collider.y + collider.height / 2;
  let u1 = 0;
  let u2 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const [p, q] of [[-dx, a.x - left], [dx, right - a.x], [-dy, a.y - top], [dy, bottom - a.y]]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const u = q / p;
    if (p < 0) {
      if (u > u2) return false;
      if (u > u1) u1 = u;
    } else {
      if (u < u1) return false;
      if (u < u2) u2 = u;
    }
  }
  return true;
};

for (const npc of Object.values(NPC_DEFS)) {
  const route = npc.route || [];
  for (let i = 0; i < route.length; i += 1) {
    const a = route[i];
    const b = route[(i + 1) % route.length];
    for (const collider of buildingColliders.values()) {
      assert.equal(segmentIntersectsCollider(a, b, collider), false, `${npc.id} route segment ${i} must not visually walk through ${collider.id}`);
    }
  }
}

const forge = BUILDING_DEFS.find(building => building.id === 'refuge_forge');
assert.ok(forge, 'Torren’s Forge must exist');
assert.ok(forge.displayHeight >= 140, 'Torren’s Forge must use the completed taller workshop shell rather than the old 92px facade slice');
assert.ok(forge.displayHeight / forge.displayWidth >= 0.5, 'Torren’s Forge should read as a complete building footprint, not a thin facade');

const png = await readFile(new URL('../dist/assets/world/buildings/adobe_workshop_full.png', import.meta.url));
assert.equal(png.toString('ascii', 1, 4), 'PNG', 'Completed forge shell must be a PNG');
assert.equal(png.readUInt32BE(16), 288, 'Completed forge shell width must remain the authored 9-tile workshop width');
assert.equal(png.readUInt32BE(20), 156, 'Completed forge shell must include the added 64px adobe upper structure');

const worldSceneSource = await readFile(new URL('../dist/js/scenes/WorldScene.js', import.meta.url), 'utf8');
assert.ok(worldSceneSource.includes('setDisplaySize(building.displayWidth, building.displayHeight)'), 'Building render dimensions must use the same explicit values that drive collision geometry');

console.log(`Building integrity smoke passed: ${BUILDING_DEFS.length} Refuge structures use render-derived collision; Torren’s Forge uses the completed 288×156 shell.`);
