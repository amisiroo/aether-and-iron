import { TileType } from '../types/game';

export interface Point { x: number; y: number }
export type PathFailure = 'blocked' | 'occupied' | 'out_of_bounds' | 'unavailable';
export interface TileInfo { type: TileType; walkable: boolean; cost: number }
export interface PathResult { path: Point[]; cost: number; reason?: PathFailure }

const TILE_INFO: Record<string, TileInfo> = {
  '#': { type: 'wall', walkable: false, cost: Infinity },
  '~': { type: 'rubble', walkable: true, cost: 2 },
  '^': { type: 'hazard', walkable: true, cost: 1 },
  D: { type: 'door', walkable: true, cost: 1 }, S: { type: 'door', walkable: true, cost: 1 },
  A: { type: 'altar', walkable: false, cost: Infinity }, C: { type: 'chest', walkable: false, cost: Infinity },
  B: { type: 'bookshelf', walkable: false, cost: Infinity }, R: { type: 'altar', walkable: false, cost: Infinity },
};

export function getTileInfo(char: string): TileInfo {
  return TILE_INFO[char] ?? { type: 'floor', walkable: true, cost: 1 };
}
export function isInBounds(layout: string[], p: Point): boolean {
  return p.y >= 0 && p.y < layout.length && p.x >= 0 && p.x < (layout[p.y]?.length ?? 0);
}
export function movementCost(char: string): number { return getTileInfo(char).cost; }

export function findPath(layout: string[], start: Point, goal: Point, occupied: Point[] = []): PathResult {
  if (!isInBounds(layout, start) || !isInBounds(layout, goal)) return { path: [], cost: 0, reason: 'out_of_bounds' };
  if (!getTileInfo(layout[start.y][start.x]).walkable || !getTileInfo(layout[goal.y][goal.x]).walkable) return { path: [], cost: 0, reason: 'blocked' };
  const occupiedSet = new Set(occupied.map(({ x, y }) => `${x},${y}`));
  if (occupiedSet.has(`${goal.x},${goal.y}`)) return { path: [], cost: 0, reason: 'occupied' };
  const key = (p: Point) => `${p.x},${p.y}`;
  const queue: Point[] = [start];
  const previous = new Map<string, Point | null>([[key(start), null]]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.x === goal.x && current.y === goal.y) {
      const path: Point[] = [];
      let cursor: Point | null = current;
      while (cursor) { path.unshift(cursor); cursor = previous.get(key(cursor)) ?? null; }
      return { path, cost: path.slice(1).reduce((total, p) => total + movementCost(layout[p.y][p.x]), 0) };
    }
    for (const next of [{ x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y }, { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }]) {
      const nextKey = key(next);
      if (!isInBounds(layout, next) || previous.has(nextKey) || !getTileInfo(layout[next.y][next.x]).walkable || (occupiedSet.has(nextKey) && nextKey !== key(start))) continue;
      previous.set(nextKey, current); queue.push(next);
    }
  }
  return { path: [], cost: 0, reason: 'unavailable' };
}
