import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cellAt, findPath, loadProgress, normaliseMovement, pointAt, reachableCells, safePoint } from '../src/solo/rules.ts';

test('diagonal movement has the same speed as horizontal movement', () => {
  const diagonal = normaliseMovement(1, -1, 135);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 135) < 1e-8);
  assert.deepEqual(normaliseMovement(0, 0, 135), { x: 0, y: 0 });
});

test('enemies route around a wall without wrapping across rows', () => {
  const grid = { width: 5, height: 3, tileSize: 16, blocked: [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0] };
  const from = pointAt(grid, 0), to = pointAt(grid, 2);
  const route = findPath(grid, from, to).map(p => cellAt(grid, p));
  assert.deepEqual(route, [5, 10, 11, 12, 7, 2]);
  assert.deepEqual(findPath({ ...grid, blocked: grid.blocked.map((n, i) => i === 11 ? 1 : n) }, from, to), []);
});

test('real-map spawns and pickups are reachable from the player', () => {
  const map = JSON.parse(readFileSync(new URL('../public/map/WebArenaMap.json', import.meta.url), 'utf8'));
  const grid = { width: map.width, height: map.height, tileSize: map.tilewidth, blocked: map.layers.find(l => l.name === 'Collision').data };
  const start = { x: 648, y: 472 };
  const cells = reachableCells(grid, start);
  assert.ok(cells.length > 1000);
  for (const offset of [{ x: 66, y: 0 }, { x: -60, y: -15 }, { x: -175, y: -30 }, { x: 180, y: 30 }, { x: 0, y: -180 }, { x: -80, y: 170 }, { x: 190, y: 130 }]) {
    const spawn = safePoint(grid, cells, { x: start.x + offset.x, y: start.y + offset.y });
    assert.equal(grid.blocked[cellAt(grid, spawn)], 0);
    const path = findPath(grid, start, spawn);
    assert.ok(path.length > 0);
    for (const point of path) assert.equal(grid.blocked[cellAt(grid, point)], 0);
  }
});

test('broken or edited local progress never breaks the home screen', () => {
  for (const value of [null, 'not json', 'null', '[]', '{"best":"999","wins":null}']) assert.deepEqual(loadProgress(value), { best: 0, wins: 0 });
  assert.deepEqual(loadProgress('{"best":927.9,"wins":-3}'), { best: 927, wins: 0 });
  assert.deepEqual(loadProgress('{"best":1200,"wins":2}'), { best: 1200, wins: 2 });
});
