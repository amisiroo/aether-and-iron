export interface AccessibilityPreferences {
  reducedMotion: boolean;
  fontScale: number;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = { reducedMotion: false, fontScale: 1 };
export const clampFontScale = (scale: number): number => Math.max(0.85, Math.min(1.4, Number.isFinite(scale) ? scale : 1));
export const responsiveCanvasSize = (roomWidth: number, roomHeight: number, viewportWidth: number, viewportHeight: number, tileSize = 48) => {
  const safeWidth = Math.max(1, viewportWidth - 24);
  const safeHeight = Math.max(1, viewportHeight - 180);
  const scale = Math.min(1, safeWidth / (roomWidth * tileSize), safeHeight / (roomHeight * tileSize));
  return { width: Math.floor(roomWidth * tileSize * scale), height: Math.floor(roomHeight * tileSize * scale), scale };
};
export const getShortcutHint = (action: 'move' | 'skills' | 'items' | 'help') => ({
  move: 'WASD / arrow keys / tap', skills: '1–9 / Tab', items: 'I', help: '?',
}[action]);
