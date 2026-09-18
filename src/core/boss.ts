export type BossPhase = 'armored' | 'overdrive' | 'cataclysm' | 'defeated';
export type Telegraph = { id: 'warden_cataclysm'; name: string; area: number; damageDice: string };
export interface VictoryState { completed: boolean; rewardId: 'obsidian_heart'; summary: string }
export interface BossEncounterState {
  bossId: 'boss_iron_warden'; hp: number; maxHp: number; phase: BossPhase;
  transitions: Array<'overdrive' | 'cataclysm'>; summonsRemaining: number;
  arenaHazards: string[]; disabledPillars: string[]; telegraph?: Telegraph;
  turn: number; victory: VictoryState;
}
export interface BossTurnResult { state: BossEncounterState; telegraph?: Telegraph; resolvedAttack?: Telegraph }

export const createIronWardenEncounter = (): BossEncounterState => ({
  bossId: 'boss_iron_warden', hp: 35, maxHp: 35, phase: 'armored', transitions: [],
  summonsRemaining: 0, arenaHazards: [], disabledPillars: [], turn: 0,
  victory: { completed: false, rewardId: 'obsidian_heart', summary: 'The Iron Warden fell and the Obsidian Heart was secured.' },
});

function transition(state: BossEncounterState): BossEncounterState {
  const next = { ...state, transitions: [...state.transitions] };
  if (next.hp <= 24 && !next.transitions.includes('overdrive')) {
    next.transitions.push('overdrive'); next.phase = 'overdrive'; next.summonsRemaining = 1; next.arenaHazards = [...new Set([...next.arenaHazards, 'pillar_shock'])];
  }
  if (next.hp <= 13 && !next.transitions.includes('cataclysm')) {
    next.transitions.push('cataclysm'); next.phase = 'cataclysm'; next.arenaHazards = [...new Set([...next.arenaHazards, 'cracking_floor'])];
  }
  return next;
}
export function applyBossDamage(state: BossEncounterState, damage: number): { state: BossEncounterState; transitioned: boolean } {
  if (state.phase === 'defeated') return { state, transitioned: false };
  const before = state.transitions.length;
  const next = transition({ ...state, hp: Math.max(0, state.hp - Math.max(0, damage)) });
  return { state: next, transitioned: next.transitions.length > before };
}
export function resolveBossTurn(state: BossEncounterState, turn: number): BossTurnResult {
  if (state.phase === 'defeated') return { state };
  const resolvedAttack = state.telegraph;
  const next = { ...state, turn, telegraph: undefined };
  if (resolvedAttack) return { state: next, resolvedAttack };
  if (next.phase === 'armored') {
    next.phase = 'overdrive'; next.transitions = ['overdrive']; next.summonsRemaining = 1; next.arenaHazards = ['pillar_shock'];
  }
  if (next.phase === 'overdrive') {
    const telegraph: Telegraph = { id: 'warden_cataclysm', name: 'Cataclysmic Pulse', area: 2, damageDice: '2d8' };
    return { state: { ...next, telegraph }, telegraph };
  }
  if (next.phase === 'cataclysm') {
    const telegraph: Telegraph = { id: 'warden_cataclysm', name: 'Cataclysmic Pulse', area: 2, damageDice: '2d8' };
    return { state: { ...next, telegraph }, telegraph };
  }
  return { state: next };
}
export function markBossDefeated(state: BossEncounterState): BossEncounterState {
  if (state.phase === 'defeated') return state;
  return { ...state, hp: 0, phase: 'defeated', telegraph: undefined, victory: { ...state.victory, completed: true } };
}
