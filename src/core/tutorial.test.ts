import { describe, expect, it } from 'vitest';
import { advanceTutorial, initialTutorialState, TUTORIAL_STEPS } from './tutorial';
import { clampFontScale, responsiveCanvasSize, getShortcutHint } from './accessibility';

describe('tutorial progression', () => {
  it('advances through every lesson and persists a completed state shape', () => {
    let state = initialTutorialState();
    for (let i = 0; i < TUTORIAL_STEPS.length; i++) state = advanceTutorial(state);
    expect(state.completed).toBe(true);
    expect(state.step).toBe(TUTORIAL_STEPS.length - 1);
  });
});

describe('responsive accessibility helpers', () => {
  it('clamps readable font scaling and canvas dimensions', () => {
    expect(clampFontScale(9)).toBe(1.4);
    expect(clampFontScale(.2)).toBe(.85);
    const size = responsiveCanvasSize(20, 12, 360, 640);
    expect(size.width).toBeLessThanOrEqual(336);
    expect(size.height).toBeLessThanOrEqual(460);
  });
  it('provides non-color shortcut guidance', () => expect(getShortcutHint('move')).toContain('tap'));
});
