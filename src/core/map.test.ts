import { describe, expect, it } from 'vitest';
import { findPath, getTileInfo, movementCost } from './map';

const map = [
  '#####',
  '...~.',
  '#####',
];

const point = (x: number, y: number) => ({ x, y });

describe('tile map and movement', () => {
  it('finds a valid path and charges rubble per traversed tile', () => {
    const result = findPath(map, point(0, 1), point(3, 1));
    expect(result.path[0]).toEqual(point(0, 1));
    expect(result.path[result.path.length - 1]).toEqual(point(3, 1));
    expect(result.cost).toBe(4);
  });

  it('blocks walls and occupied tiles', () => {
    const result = findPath(['...', '.#.', '...'], point(0, 1), point(2, 1), [point(0, 2), point(1, 2), point(2, 2), point(1, 0), point(2, 0)]);
    expect(result.path).toEqual([]);
    expect(result.reason).toBe('unavailable');
  });

  it('reports blocked destinations, unavailable paths, and bounds', () => {
    expect(findPath(['..'], point(0, 0), point(1, 0), [point(1, 0)]).reason).toBe('occupied');
    expect(findPath(['.#'], point(0, 0), point(1, 0)).reason).toBe('blocked');
    expect(findPath(['..'], point(0, 0), point(2, 0)).reason).toBe('out_of_bounds');
  });

  it('centralizes tile semantics and difficult terrain cost', () => {
    expect(getTileInfo('~')).toMatchObject({ type: 'rubble', walkable: true, cost: 2 });
    expect(getTileInfo('#').walkable).toBe(false);
    expect(getTileInfo('B').walkable).toBe(false);
    expect(movementCost('^')).toBe(1);
  });
});
