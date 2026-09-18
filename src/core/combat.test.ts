import { describe, expect, it } from 'vitest';
import { advanceTurn, createTurnSnapshot, orderInitiative, resetActionEconomy, startCombat, updateCombatant } from './combat';
import { decideEnemyAction } from './enemyAi';
import type { Attributes, Entity } from '../types/game';

const attributes: Attributes = { STR: 12, DEX: 12, CON: 10, INT: 10, WIS: 10, CHA: 10 };
const entity = (id: string, isPlayer: boolean, x: number, y: number, initiative: number, extra: Partial<Entity> = {}): Entity => ({
  id, name: id, isPlayer, x, y, initiative, hp: 10, maxHp: 10, ac: 10, speed: 3, remainingSpeed: 0,
  attributes, conditions: [], skills: [{ id: 'strike', name: 'Strike', type: 'action', costType: 'action', range: 1, stat: 'STR', damageDice: '1d6', description: '' }],
  color: 'white', icon: 'x', deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false }, hasUsedAction: true, hasUsedBonusAction: true, ...extra,
});

describe('combat turn model', () => {
  it('orders initiative descending with deterministic id tie-break', () => {
    expect(orderInitiative([entity('z', false, 0, 0, 12), entity('a', true, 0, 0, 12), entity('b', false, 0, 0, 18)])).toEqual(['b', 'a', 'z']);
  });
  it('resets only the active combatant on turn transition', () => {
    const state = startCombat([entity('hero', true, 0, 0, 20), entity('enemy', false, 1, 0, 10)]);
    const used = updateCombatant(state, { ...state.combatants[0], hasUsedAction: true, remainingSpeed: 0 });
    const next = advanceTurn(used);
    expect(createTurnSnapshot(next)).toMatchObject({ actorId: 'enemy', actionAvailable: true, bonusActionAvailable: true, movementRemaining: 3 });
    expect(next.combatants.find((e) => e.id === 'hero')).toMatchObject({ hasUsedAction: true, remainingSpeed: 0 });
  });
  it('resets action, bonus action, and movement explicitly', () => {
    expect(resetActionEconomy(entity('x', true, 0, 0, 1))).toMatchObject({ hasUsedAction: false, hasUsedBonusAction: false, remainingSpeed: 3 });
  });
  it('completes when one side has no living combatants', () => {
    const state = startCombat([entity('hero', true, 0, 0, 20), entity('enemy', false, 1, 0, 10)]);
    expect(updateCombatant(state, { ...state.combatants[1], hp: 0 }).status).toBe('completed');
  });
});

describe('enemy tactical AI', () => {
  it('routes around walls and attacks after reaching range', () => {
    const enemy = entity('enemy', false, 0, 1, 1, { remainingSpeed: 5 });
    const hero = entity('hero', true, 2, 1, 2);
    const decision = decideEnemyAction(enemy, [hero], ['.....', '.#...', '.....'], []);
    expect(decision.path.every((point) => ['#'].includes(['.....', '.#...', '.....'][point.y][point.x]) === false)).toBe(true);
    expect(decision.destination).not.toEqual({ x: 1, y: 1 });
  });
  it('does not walk through occupied tiles or hazards when a safe route exists', () => {
    const enemy = entity('enemy', false, 0, 0, 1, { remainingSpeed: 6 });
    const hero = entity('hero', true, 4, 0, 2);
    const decision = decideEnemyAction(enemy, [hero], ['.....', '.^...', '.....'], []);
    expect(decision.path).not.toContainEqual({ x: 1, y: 1 });
  });
  it('waits instead of getting stuck when no route exists', () => {
    const enemy = entity('enemy', false, 0, 1, 1, { remainingSpeed: 3 });
    const hero = entity('hero', true, 4, 1, 2);
    expect(decideEnemyAction(enemy, [hero], ['#####', '..#..', '#####'], []).action).toBe('wait');
  });
});
