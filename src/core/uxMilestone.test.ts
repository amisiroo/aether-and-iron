import { describe, expect, it } from 'vitest';
import { continueSave, initialShellView, menuRoute } from './gameShell';
import { defaultDraft, nextStep, stepIsValid } from './characterPipeline';
import { encounterIntro, shouldShowEncounter } from './encounterIntro';
import { CHAPTER_1_ROOMS } from '../data/rooms';

describe('game shell routing', () => { it('opens menu and routes new expedition', () => { expect(initialShellView()).toBe('menu'); expect(menuRoute('creation')).toBe('creation'); }); it('continues only when a valid save exists', () => { expect(continueSave(null)).toBe('creation'); expect(continueSave({} as never)).toBe('menu'); }); });
describe('character pipeline', () => { it('blocks incomplete identity and advances valid stages', () => { const draft=defaultDraft(); expect(stepIsValid(draft)).toBe(false); const named={...draft,name:'Ada'}; expect(nextStep(named).step).toBe('origin'); expect(stepIsValid({...named,origin:'guild'})).toBe(true); }); });
describe('encounter intro', () => { it('shows once per exploration-to-combat transition', () => { const room=CHAPTER_1_ROOMS.room_entrance; expect(shouldShowEncounter('exploration','combat',room.id,new Set())).toBe(true); expect(shouldShowEncounter('combat','combat',room.id,new Set())).toBe(false); expect(encounterIntro(room).roomName).toBe(room.name); }); });
