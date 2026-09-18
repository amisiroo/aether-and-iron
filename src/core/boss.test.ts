import { describe, expect, it } from 'vitest';
import { createIronWardenEncounter, applyBossDamage, resolveBossTurn, markBossDefeated, type BossEncounterState } from './boss';

describe('Iron Warden encounter', () => {
  it('transitions once at each HP threshold', () => {
    let s = createIronWardenEncounter();
    s = applyBossDamage(s, 11).state;
    expect(s.phase).toBe('overdrive');
    expect(s.transitions).toEqual(['overdrive']);
    s = applyBossDamage(s, 11).state;
    expect(s.phase).toBe('cataclysm');
    expect(s.transitions).toEqual(['overdrive', 'cataclysm']);
    expect(applyBossDamage(s, 1).state.transitions).toEqual(['overdrive', 'cataclysm']);
  });
  it('is idempotent when the same threshold is evaluated again', () => {
    const s = applyBossDamage(createIronWardenEncounter(), 20).state;
    expect(applyBossDamage(s, 0).state).toEqual(s);
  });
  it('summons only once and arms arena hazard', () => {
    const result = resolveBossTurn(createIronWardenEncounter(), 1);
    expect(result.state.summonsRemaining).toBe(1);
    expect(result.state.arenaHazards).toContain('pillar_shock');
    expect(result.telegraph?.id).toBe('warden_cataclysm');
    expect(resolveBossTurn(result.state, 2).state.summonsRemaining).toBe(1);
  });
  it('telegraph resolves on the following turn without consuming player action', () => {
    const first = resolveBossTurn({ ...createIronWardenEncounter(), phase: 'cataclysm', transitions: ['overdrive', 'cataclysm'] }, 1);
    const second = resolveBossTurn(first.state, 2);
    expect(second.resolvedAttack?.id).toBe('warden_cataclysm');
    expect(second.state.telegraph).toBeUndefined();
    expect(second.state.turn).toBe(2);
  });
  it('defeat is terminal and victory reward is stable', () => {
    const defeated = markBossDefeated(applyBossDamage(createIronWardenEncounter(), 99).state);
    expect(defeated.phase).toBe('defeated');
    expect(defeated.victory.rewardId).toBe('obsidian_heart');
    expect(markBossDefeated(defeated)).toEqual(defeated);
  });
  it('does not get stuck after a turn', () => {
    const s: BossEncounterState = createIronWardenEncounter();
    const next = resolveBossTurn(s, 1).state;
    expect(next.turn).toBe(1);
    expect(next.phase).not.toBe('defeated');
  });
});
