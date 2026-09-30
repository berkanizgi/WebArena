export type Mode = 'training' | 'arena';
export type Skin = 'black' | 'green' | 'red' | 'blue';
export type Point = { x: number; y: number };
export type Grid = { width: number; height: number; tileSize: number; blocked: readonly number[] };
export type RunResult = { won: boolean; score: number; kills: number; seconds: number; mode: Mode };
export type Hud = { health: number; maxHealth: number; wave: number; kills: number; score: number; seconds: number; remaining: number; boost: boolean; objective: string };
export const CHARACTERS: { id: Skin; name: string; role: string; health: number; speed: number; damage: number; color: string }[] = [
  { id: 'black', name: 'Schatten', role: 'Ausgewogen', health: 120, speed: 110, damage: 24, color: '#b8a3f9' },
  { id: 'green', name: 'Jade', role: 'Schnell & wendig', health: 100, speed: 135, damage: 20, color: '#a8e89a' },
  { id: 'red', name: 'Glut', role: 'Hohe Angriffskraft', health: 100, speed: 105, damage: 32, color: '#ff977a' },
  { id: 'blue', name: 'Frost', role: 'Hohe Ausdauer', health: 160, speed: 95, damage: 22, color: '#8fd7f5' },
];
export const WAVE_COUNT = 3;
export const waveSize = (wave: number) => 2 + Math.max(1, Math.min(WAVE_COUNT, wave));
export const formatTime = (seconds: number) => Math.floor(seconds / 60).toString().padStart(2, '0') + ':' + Math.floor(seconds % 60).toString().padStart(2, '0');
export const cellAt = (grid: Grid, p: Point) => Math.floor(p.y / grid.tileSize) * grid.width + Math.floor(p.x / grid.tileSize);
export const pointAt = (grid: Grid, cell: number): Point => ({ x: (cell % grid.width + .5) * grid.tileSize, y: (Math.floor(cell / grid.width) + .5) * grid.tileSize });
export function neighbours(grid: Grid, cell: number): number[] {
  const x = cell % grid.width, y = Math.floor(cell / grid.width);
  return [x > 0 ? cell - 1 : -1, x < grid.width - 1 ? cell + 1 : -1, y > 0 ? cell - grid.width : -1, y < grid.height - 1 ? cell + grid.width : -1].filter(n => n >= 0 && !grid.blocked[n]);
}
export function reachableCells(grid: Grid, start: Point): number[] {
  const origin = cellAt(grid, start);
  if (grid.blocked[origin]) return [];
  const queue = [origin], seen = new Set(queue);
  for (let i = 0; i < queue.length; i++) for (const next of neighbours(grid, queue[i])) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return queue;
}
export function findPath(grid: Grid, from: Point, to: Point): Point[] {
  const start = cellAt(grid, from), goal = cellAt(grid, to);
  if (start === goal) return [to];
  const queue = [start], previous = new Map<number, number>([[start, -1]]);
  for (let i = 0; i < queue.length && !previous.has(goal); i++) for (const next of neighbours(grid, queue[i])) if (!previous.has(next)) { previous.set(next, queue[i]); queue.push(next); }
  if (!previous.has(goal)) return [];
  const path = [];
  for (let cell = goal; cell !== start; cell = previous.get(cell)!) path.push(pointAt(grid, cell));
  return path.reverse();
}
export function safePoint(grid: Grid, cells: readonly number[], target: Point): Point {
  let best = cells[0], distance = Infinity;
  for (const cell of cells) {
    const p = pointAt(grid, cell), d = (p.x - target.x) ** 2 + (p.y - target.y) ** 2;
    if (d < distance) { best = cell; distance = d; }
  }
  return pointAt(grid, best);
}
export function normaliseMovement(x: number, y: number, speed: number): Point {
  const length = Math.hypot(x, y);
  return length ? { x: x / length * speed, y: y / length * speed } : { x: 0, y: 0 };
}
export function loadProgress(value: string | null): { best: number; wins: number } {
  try {
    const data = JSON.parse(value ?? '{}');
    return { best: Number.isFinite(data?.best) ? Math.max(0, Math.floor(data.best)) : 0, wins: Number.isFinite(data?.wins) ? Math.max(0, Math.floor(data.wins)) : 0 };
  } catch { return { best: 0, wins: 0 }; }
}
