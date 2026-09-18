import type { Entity } from '../types/game';

export interface CombatTurn {
  actorId: string;
  round: number;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  movementRemaining: number;
}

export interface CombatState {
  combatants: Entity[];
  turnOrder: string[];
  activeIndex: number;
  round: number;
  status: 'active' | 'completed';
}

/** Stable initiative ordering: higher initiative first, then entity id. */
export function orderInitiative(combatants: Entity[]): string[] {
  return [...combatants]
    .filter((entity) => !entity.deathSaves.dead)
    .sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0) || a.id.localeCompare(b.id))
    .map((entity) => entity.id);
}

export function startCombat(combatants: Entity[]): CombatState {
  const state: CombatState = {
    combatants: combatants.map((entity) => ({ ...entity })),
    turnOrder: orderInitiative(combatants),
    activeIndex: 0,
    round: 1,
    status: 'active',
  };
  return state.turnOrder.length ? resetActiveTurn(state) : { ...state, status: 'completed' };
}

export function getActiveCombatant(state: CombatState): Entity | undefined {
  return state.combatants.find((entity) => entity.id === state.turnOrder[state.activeIndex]);
}

export function resetActionEconomy(entity: Entity): Entity {
  return { ...entity, remainingSpeed: entity.speed, hasUsedAction: false, hasUsedBonusAction: false };
}

/** Advances to the next living combatant and resets only that combatant's turn resources. */
export function advanceTurn(state: CombatState): CombatState {
  if (state.status === 'completed' || !state.turnOrder.length) return state;
  const livingIds = new Set(state.combatants.filter((entity) => entity.hp > 0 && !entity.deathSaves.dead).map((entity) => entity.id));
  const nextOrder = state.turnOrder.filter((id) => livingIds.has(id));
  if (!nextOrder.length) return { ...state, turnOrder: [], status: 'completed' };
  const oldIndex = nextOrder.indexOf(state.turnOrder[state.activeIndex]);
  const nextIndex = (oldIndex + 1) % nextOrder.length;
  const round = nextIndex <= oldIndex ? state.round + 1 : state.round;
  const nextState: CombatState = { ...state, turnOrder: nextOrder, activeIndex: nextIndex, round };
  return resetActiveTurn(nextState);
}

export function updateCombatant(state: CombatState, updated: Entity): CombatState {
  const combatants = state.combatants.map((entity) => entity.id === updated.id ? updated : entity);
  const hasPlayers = combatants.some((entity) => entity.isPlayer && entity.hp > 0 && !entity.deathSaves.dead);
  const hasEnemies = combatants.some((entity) => !entity.isPlayer && entity.hp > 0 && !entity.deathSaves.dead);
  return { ...state, combatants, status: hasPlayers && hasEnemies ? 'active' : 'completed' };
}

function resetActiveTurn(state: CombatState): CombatState {
  const active = getActiveCombatant(state);
  if (!active) return state;
  return { ...state, combatants: state.combatants.map((entity) => entity.id === active.id ? resetActionEconomy(entity) : entity) };
}

export function createTurnSnapshot(state: CombatState): CombatTurn | undefined {
  const active = getActiveCombatant(state);
  return active ? {
    actorId: active.id,
    round: state.round,
    actionAvailable: !active.hasUsedAction,
    bonusActionAvailable: !active.hasUsedBonusAction,
    movementRemaining: active.remainingSpeed,
  } : undefined;
}
