import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  calculateSpentPoints,
  evaluateCombatAdvantage,
  getAbilityModifier,
  rollD20,
  rollDeathSave,
  rollDamageString,
} from './dnd';
import type { Attributes, DeathSaves, Entity } from '../types/game';

const attributes: Attributes = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };

function entity(conditions: Entity['conditions'] = []): Entity {
  return {
    id: 'entity', name: 'Test Entity', isPlayer: true, x: 0, y: 0, hp: 10, maxHp: 10,
    ac: 10, speed: 6, remainingSpeed: 6, attributes, conditions, skills: [], color: 'white', icon: 'x',
    deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false },
    hasUsedAction: false, hasUsedBonusAction: false,
  };
}

const saves = (overrides: Partial<DeathSaves> = {}): DeathSaves => ({
  successes: 0, failures: 0, stabilized: false, dead: false, ...overrides,
});

afterEach(() => vi.restoreAllMocks());

describe('ability modifiers and point buy', () => {
  it.each([[1, -5], [8, -1], [9, -1], [10, 0], [11, 0], [12, 1], [15, 2], [20, 5]])(
    'calculates the modifier for score %i', (score, expected) => {
      expect(getAbilityModifier(score)).toBe(expected);
    },
  );

  it('calculates standard point-buy cost across all abilities', () => {
    expect(calculateSpentPoints(attributes)).toBe(27);
  });
});

describe('advantage and d20 rules', () => {
  it('cancels advantage and disadvantage instead of stacking them', () => {
    const result = evaluateCombatAdvantage(
      entity(['inspired']), entity(['downed']), 2, null, true, false,
    );
    expect(result.mode).toBe('normal');
    expect(result.reasons[0]).toContain('Cancelled');
  });

  it('uses the higher die with advantage and the lower die with disadvantage', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
    expect(rollD20(2, 'advantage').chosen).toBe(19);

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
    expect(rollD20(2, 'disadvantage').chosen).toBe(3);
  });

  it('treats a natural 1 as failure and natural 20 as success', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0);
    expect(rollD20(100, 'normal', 999)).toMatchObject({ chosen: 1, isFumble: true, success: false });

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.999);
    expect(rollD20(-100, 'normal', 1)).toMatchObject({ chosen: 20, isCrit: true, success: true });
  });
});

describe('damage and death saves', () => {
  it('parses damage dice and includes formula and modifier bonuses', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.5);
    const result = rollDamageString('2d6+3', 2);
    expect(result.rolls).toEqual([1, 4]);
    expect(result.total).toBe(10);
    expect(result.details).toContain('2d6');
  });

  it('doubles only the dice for a critical hit', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = rollDamageString('1d8+3', 2, true);
    expect(result.rolls).toEqual([1, 1]);
    expect(result.total).toBe(7);
    expect(result.details).toContain('CRIT 2x DICE');
  });

  it('handles natural 1 as two failures and marks death at three failures', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(rollDeathSave(saves()).updated).toMatchObject({ failures: 2, dead: false });
    expect(rollDeathSave(saves({ failures: 1 })).updated).toMatchObject({ failures: 3, dead: true });
  });

  it('stabilizes on three successes and revives on natural 20', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5);
    expect(rollDeathSave(saves({ successes: 2 })).updated).toMatchObject({ successes: 3, stabilized: true });

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.999);
    expect(rollDeathSave(saves())).toMatchObject({ roll: 20, revivedWithHp: 1, updated: { stabilized: true } });
  });
});
