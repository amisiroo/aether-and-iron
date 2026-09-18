import { describe, expect, it, vi } from 'vitest';
import {
  CURRENT_SAVE_VERSION,
  deserializeSave,
  migrateSave,
  serializeSave,
  createDebouncedAutosave,
  type SaveGame,
} from './persistence';

const state: SaveGame = {
  player: {
    id: 'hero', name: 'A', isPlayer: true, x: 1, y: 2, hp: 8, maxHp: 10, ac: 12,
    speed: 6, remainingSpeed: 6, attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    conditions: [], skills: [], color: '#fff', icon: 'x',
    deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false },
    hasUsedAction: false, hasUsedBonusAction: false,
  },
  currentRoomId: 'room_entrance',
  rooms: { room_entrance: { id: 'room_entrance', name: 'Entrance', subtitle: '', lore: '', width: 1, height: 1, layout: ['.'], interactables: [], enemies: [], playerSpawn: { x: 0, y: 0 }, visited: true, cleared: false, exits: {} } },
  chronicle: [{ id: '1', timestamp: '00:01', type: 'narrative', text: 'start' }],
};

describe('save persistence', () => {
  it('round-trips a versioned save', () => {
    const parsed = deserializeSave(serializeSave(state));
    expect(parsed).toEqual({ ...state, version: CURRENT_SAVE_VERSION });
  });

  it('migrates the legacy unversioned v1 payload', () => {
    const legacy = { player: state.player, currentRoomId: state.currentRoomId, rooms: state.rooms, chronicle: state.chronicle };
    expect(migrateSave(legacy)).toEqual({ ...state, version: CURRENT_SAVE_VERSION });
  });

  it('rejects corrupt and incompatible payloads safely', () => {
    expect(deserializeSave('{not json')).toBeNull();
    expect(deserializeSave(JSON.stringify({ player: state.player }))).toBeNull();
    expect(deserializeSave(JSON.stringify({ ...state, version: 999 }))).toBeNull();
    expect(deserializeSave(JSON.stringify({ ...state, player: { ...state.player, hp: 'bad' } }))).toBeNull();
  });

  it('rejects unsupported versions rather than guessing', () => {
    expect(migrateSave({ ...state, version: 0 })).toBeNull();
  });

  it('debounces bursts into one autosave', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const autosave = createDebouncedAutosave(save, 100);
    autosave.schedule();
    autosave.schedule();
    vi.advanceTimersByTime(99);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
