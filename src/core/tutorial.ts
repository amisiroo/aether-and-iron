export const TUTORIAL_STEPS = [
  { id: 'movement', title: 'Move & pathfind', body: 'Click a reachable tile or tap it on touch screens. The highlighted path shows cost; WASD and arrow keys move one tile at a time.', hint: 'Click / tap a tile · WASD / arrows' },
  { id: 'combat', title: 'Combat actions', body: 'Select a skill, then select a target in range. End your turn to let enemies act. Action and bonus-action badges show what remains.', hint: 'Click a skill · Tab to focus controls' },
  { id: 'cover', title: 'Cover & advantage', body: 'Rubble and walls block line of sight. Use cover to protect yourself and look for advantage from positioning or inspiration.', hint: 'Rubble: ~ · Hazard: ^' },
  { id: 'items', title: 'Items & equipment', body: 'Use potions from the belt and equip weapons, armor, or relics in the inventory panel. Equipment changes your stats immediately.', hint: 'Use / Equip buttons · I opens inventory focus' },
  { id: 'downed', title: 'Downed & death saves', body: 'At 0 HP you are downed. Roll death saves: three successes stabilize you; three failures end the run. A natural 20 revives you.', hint: 'Roll Death Saving Throw when downed' },
] as const;

export type TutorialStepId = typeof TUTORIAL_STEPS[number]['id'];
export interface TutorialState { completed: boolean; step: number; }
export const initialTutorialState = (): TutorialState => ({ completed: false, step: 0 });
export const advanceTutorial = (state: TutorialState): TutorialState => state.step >= TUTORIAL_STEPS.length - 1
  ? { completed: true, step: TUTORIAL_STEPS.length - 1 }
  : { ...state, step: state.step + 1 };
export const replayTutorial = (): TutorialState => initialTutorialState();
export const clampTutorialStep = (step: number): number => Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, Math.floor(step)));
