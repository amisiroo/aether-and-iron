import { describe, expect, it } from 'vitest';
import { CHAPTER_1_ROOMS } from '../data/rooms';
import { findPath, getTileInfo } from './map';
import { closeOnEscape, toggleCollapsed } from './uiState';

describe('gameplay entry and secondary UI state', () => {
  it('spawns The Weeping Threshold on a walkable tile with an immediate route', () => {
    const room = CHAPTER_1_ROOMS.room_entrance;
    const spawn = room.playerSpawn;
    expect(getTileInfo(room.layout[spawn.y][spawn.x]).walkable).toBe(true);
    expect(findPath(room.layout, spawn, { x: spawn.x + 1, y: spawn.y }).path.length).toBeGreaterThan(1);
    expect(findPath(room.layout, spawn, { x: spawn.x, y: spawn.y - 1 }).path.length).toBeGreaterThan(1);
  });

  it('keeps true walls blocked while the starting area remains traversable', () => {
    const room = CHAPTER_1_ROOMS.room_entrance;
    expect(findPath(room.layout, room.playerSpawn, { x: 0, y: 0 }).reason).toBe('blocked');
    expect(findPath(room.layout, room.playerSpawn, { x: 4, y: 5 }).path.length).toBeGreaterThan(1);
  });

  it('provides pure modal and chronicle state transitions', () => {
    expect(toggleCollapsed(false)).toBe(true);
    expect(toggleCollapsed(true)).toBe(false);
    expect(closeOnEscape('Escape')).toBe(true);
    expect(closeOnEscape('Enter')).toBe(false);
  });
});
