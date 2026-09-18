import type { ChronicleEntry, Entity, Room } from '../types/game';

export const SAVE_KEY = 'aether_and_iron_save_primary';
export const LEGACY_SAVE_KEY = 'aether_and_iron_save_v1';
export const CURRENT_SAVE_VERSION = 2;

export interface SaveGame {
  version?: number;
  player: Entity;
  currentRoomId: string;
  rooms: Record<string, Room>;
  chronicle: ChronicleEntry[];
}

export interface VersionedSave extends SaveGame {
  version: typeof CURRENT_SAVE_VERSION;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEntity = (value: unknown): value is Entity => {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.x === 'number' && typeof value.y === 'number' &&
    typeof value.hp === 'number' && typeof value.maxHp === 'number' &&
    typeof value.ac === 'number' && typeof value.speed === 'number' &&
    typeof value.remainingSpeed === 'number' && isRecord(value.attributes) &&
    Array.isArray(value.conditions) && Array.isArray(value.skills) &&
    isRecord(value.deathSaves) && typeof value.hasUsedAction === 'boolean' &&
    typeof value.hasUsedBonusAction === 'boolean';
};

const isRoom = (value: unknown): value is Room => {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.width === 'number' && typeof value.height === 'number' &&
    Array.isArray(value.layout) && Array.isArray(value.interactables) &&
    Array.isArray(value.enemies) && isEntityArray(value.enemies) &&
    isRecord(value.playerSpawn) && typeof value.playerSpawn.x === 'number' &&
    typeof value.playerSpawn.y === 'number' && typeof value.visited === 'boolean' &&
    typeof value.cleared === 'boolean' && isRecord(value.exits);
};

const isEntityArray = (value: unknown): value is Entity[] => Array.isArray(value) && value.every(isEntity);

const isSaveShape = (value: unknown): value is SaveGame => {
  if (!isRecord(value) || !isEntity(value.player) || typeof value.currentRoomId !== 'string' ||
      !isRecord(value.rooms) || !Object.values(value.rooms).every(isRoom) || !Array.isArray(value.chronicle)) return false;
  return value.chronicle.every((entry) => isRecord(entry) && typeof entry.id === 'string' &&
    typeof entry.timestamp === 'string' && typeof entry.type === 'string' && typeof entry.text === 'string');
};

export function migrateSave(value: unknown): VersionedSave | null {
  if (!isRecord(value)) return null;
  const version = value.version;
  if (version !== undefined && version !== CURRENT_SAVE_VERSION) return null;
  if (!isSaveShape(value)) return null;
  return { version: CURRENT_SAVE_VERSION, player: value.player, currentRoomId: value.currentRoomId, rooms: value.rooms, chronicle: value.chronicle.slice(0, 50) };
}

export function serializeSave(save: SaveGame): string {
  const migrated = migrateSave(save);
  if (!migrated) throw new Error('Cannot serialize invalid save state');
  return JSON.stringify(migrated);
}

export function deserializeSave(serialized: string): VersionedSave | null {
  try { return migrateSave(JSON.parse(serialized)); } catch { return null; }
}

export function readSave(storage: Pick<Storage, 'getItem'> = localStorage): VersionedSave | null {
  try {
    const primary = storage.getItem(SAVE_KEY);
    const legacy = storage.getItem(LEGACY_SAVE_KEY);
    if (primary) {
      const parsed = deserializeSave(primary);
      if (parsed) return parsed;
    }
    return legacy ? deserializeSave(legacy) : null;
  } catch { return null; }
}

export function writeSave(save: SaveGame, storage: Pick<Storage, 'setItem'> = localStorage): boolean {
  try { storage.setItem(SAVE_KEY, serializeSave(save)); return true; } catch { return false; }
}

export function createDebouncedAutosave(save: () => void, delayMs = 350): { schedule: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    schedule: () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = undefined; save(); }, delayMs); },
    cancel: () => { if (timer) clearTimeout(timer); timer = undefined; },
  };
}

export function exportSave(save: SaveGame): string { return serializeSave(save); }
export function importSave(serialized: string): VersionedSave | null { return deserializeSave(serialized); }
