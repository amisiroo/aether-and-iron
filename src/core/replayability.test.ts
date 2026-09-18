import { describe, expect, it } from 'vitest';
import { achievement, applyChallenge, createRunState, endEncounter, logCombatEvent, resolveRandomEvent, rollSeeded, startNewGamePlus } from './replayability';

describe('phase 9 replayability', () => {
  it('produces reproducible seeded rolls', () => {
    expect(Array.from({ length: 5 }, (_, i) => rollSeeded('alpha', i))).toEqual(Array.from({ length: 5 }, (_, i) => rollSeeded('alpha', i)));
    expect(rollSeeded('alpha', 0)).not.toBe(rollSeeded('beta', 0));
  });
  it('applies challenge modifiers to encounter rules', () => {
    expect(applyChallenge({ hp: 10, damage: 4, xp: 20 }, ['iron_will'])).toEqual({ hp: 13, damage: 4, xp: 30 });
    expect(applyChallenge({ hp: 10, damage: 4, xp: 20 }, ['glass_dungeon'])).toEqual({ hp: 10, damage: 6, xp: 20 });
  });
  it('carries legacy progress into NG+ while resetting rooms and run stats', () => {
    const old = createRunState('s1');
    const withProgress = { ...old, completedRuns: 1, carryover: { relicIds: ['r1'], achievementIds: ['first_blood'] } };
    const next = startNewGamePlus(withProgress, ['iron_will']);
    expect(next.newGamePlus).toBe(1);
    expect(next.completedRuns).toBe(0);
    expect(next.carryover.relicIds).toEqual(['r1']);
    expect(next.challengeModifiers).toEqual(['iron_will']);
    expect(next.combatStats.totalDamage).toBe(0);
  });
  it('resolves random events deterministically and only once', () => {
    const event = resolveRandomEvent('seed', 2, 'room_2', { hp: 10, maxHp: 10 });
    expect(event.eventId).toBe('room_2:2');
    expect(resolveRandomEvent('seed', 2, 'room_2', { hp: 10, maxHp: 10 })).toEqual(event);
    expect(event.hp).toBeLessThanOrEqual(10);
    expect(['cache', 'ambush']).toContain(event.kind);
  });
  it('makes achievements idempotent', () => {
    const once = achievement({ ...createRunState('s'), achievements: [] }, 'first_blood');
    const twice = achievement(once, 'first_blood');
    expect(once.achievements).toEqual(['first_blood']);
    expect(twice.achievements).toEqual(['first_blood']);
  });
  it('aggregates combat statistics and deduplicates save/load events', () => {
    let run = createRunState('s');
    run = logCombatEvent(run, { id: 'e1', encounterId: 'c1', kind: 'damage', actorId: 'hero', amount: 7, text: 'hit' });
    run = logCombatEvent(run, { id: 'e1', encounterId: 'c1', kind: 'damage', actorId: 'hero', amount: 7, text: 'hit' });
    run = endEncounter(run, 'c1', 'victory');
    expect(run.combatLog).toHaveLength(1);
    expect(run.combatStats.totalDamage).toBe(7);
    expect(run.encounters[0].eventIds).toEqual(['e1']);
  });
});
