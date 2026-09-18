import type { VersionedSave } from './persistence';

export type ShellView = 'menu' | 'creation' | 'load' | 'settings' | 'codex' | 'credits';
export function initialShellView(): ShellView { return 'menu'; }
export function continueSave(save: VersionedSave | null): ShellView { return save ? 'menu' : 'creation'; }
export function menuRoute(route: Exclude<ShellView, 'menu'>): ShellView { return route; }

export interface Preferences { sound: boolean; reducedMotion: boolean; fontScale: number; }
export const DEFAULT_PREFERENCES: Preferences = { sound: true, reducedMotion: false, fontScale: 1 };
export function readPreferences(storage: Pick<Storage, 'getItem'> = localStorage): Preferences {
  try { const parsed = JSON.parse(storage.getItem('aether_and_iron_preferences') || 'null'); return { ...DEFAULT_PREFERENCES, ...(parsed || {}) }; } catch { return DEFAULT_PREFERENCES; }
}
export function writePreferences(preferences: Preferences, storage: Pick<Storage, 'setItem'> = localStorage): void { storage.setItem('aether_and_iron_preferences', JSON.stringify(preferences)); }
