import { describe, expect, it } from 'vitest';
import { applyLevelUp, awardXp, levelForXp, xpForNextLevel } from './progression';
import type { Entity } from '../types/game';

const hero = (classType: Entity['classType'] = 'fighter'): Entity => ({ id: 'h', name: 'Hero', isPlayer: true, classType, x: 0, y: 0, hp: 10, maxHp: 10, ac: 10, speed: 6, remainingSpeed: 6, attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, conditions: [], skills: [], color: '', icon: '', deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false }, hasUsedAction: false, hasUsedBonusAction: false, progression: { xp: 0, level: 1, appliedLevel: 1, claimedXpAwards: [], skillRanks: {} } });

describe('progression', () => {
  it('uses early XP thresholds', () => { expect(xpForNextLevel(1)).toBe(100); expect(levelForXp(100)).toBe(2); expect(levelForXp(249)).toBe(2); expect(levelForXp(250)).toBe(3); });
  it('prevents duplicate awards', () => { const first = awardXp(hero(), { id: 'enemy-1', amount: 100, source: 'enemy' }); const second = awardXp(first.player, { id: 'enemy-1', amount: 100, source: 'enemy' }); expect(first.awarded).toBe(100); expect(second.awarded).toBe(0); expect(second.player.progression?.xp).toBe(100); });
  it('applies stat and vitality choices', () => { const leveled = awardXp(hero(), { id: 'x', amount: 100, source: 'enemy' }).player; expect(applyLevelUp(leveled, 'power').player.attributes.STR).toBe(11); const vital = applyLevelUp(leveled, 'vitality').player; expect(vital.maxHp).toBe(14); });
  it('unlocks class-specific skills', () => { const leveled = awardXp(hero('wizard'), { id: 'x', amount: 100, source: 'enemy' }).player; expect(applyLevelUp(leveled, 'skill').unlockedSkill).toBe('arcane_burst'); });
  it('rejects invalid choices and unavailable level-ups', () => { expect(() => applyLevelUp(hero(), 'skill')).toThrow('No level-up'); const leveled = awardXp(hero(), { id: 'x', amount: 100, source: 'enemy' }).player; expect(() => applyLevelUp(leveled, 'bad' as never)).toThrow('Invalid'); });
});
