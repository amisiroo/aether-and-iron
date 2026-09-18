export type SecondaryPanel = 'inventory' | 'profile' | null;

export function toggleCollapsed(collapsed: boolean): boolean {
  return !collapsed;
}

export function closeOnEscape(key: string): boolean {
  return key === 'Escape';
}
