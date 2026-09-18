import { findPath, type Point } from './map';
import { checkInterveningCover } from './dnd';
import type { Entity, Skill } from '../types/game';

export interface AiDecision {
  enemyId: string;
  targetId?: string;
  path: Point[];
  destination: Point;
  action: 'attack' | 'move' | 'wait';
  skill?: Skill;
  reason: string;
}

const distance = (a: Point, b: Point) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

/** Chooses the nearest living target, preferring players and then stable id order. */
export function selectTarget(enemy: Entity, targets: Entity[]): Entity | undefined {
  return targets
    .filter((target) => target.hp > 0 && !target.deathSaves.dead && !target.conditions.includes('downed'))
    .sort((a, b) => distance(enemy, a) - distance(enemy, b) || a.id.localeCompare(b.id))[0];
}

/** Deterministic chase/attack decision using Phase 1 pathfinding and dynamic occupancy. */
export function decideEnemyAction(
  enemy: Entity,
  targets: Entity[],
  layout: string[],
  occupied: Point[] = [],
): AiDecision {
  const target = selectTarget(enemy, targets);
  const fallback = { x: enemy.x, y: enemy.y };
  if (!target) return { enemyId: enemy.id, path: [fallback], destination: fallback, action: 'wait', reason: 'no-valid-target' };
  const skill = enemy.skills.find((candidate) => candidate.costType === 'action') ?? enemy.skills[0];
  const range = skill?.range ?? 1;
  if (distance(enemy, target) <= range && !checkInterveningCover(enemy.x, enemy.y, target.x, target.y, layout)) {
    return { enemyId: enemy.id, targetId: target.id, path: [fallback], destination: fallback, action: 'attack', skill, reason: 'target-in-range' };
  }

  // The target tile remains occupied, so path toward an adjacent reachable tile.
  const candidates: Point[] = [];
  for (let y = target.y - range; y <= target.y + range; y += 1) {
    for (let x = target.x - range; x <= target.x + range; x += 1) {
      if (distance({ x, y }, target) <= range) candidates.push({ x, y });
    }
  }
  const paths = candidates
    .filter((point) => point.x !== target.x || point.y !== target.y)
    .map((goal) => ({ goal, result: findPath(layout, fallback, goal, [...occupied, ...targets.map(({ x, y }) => ({ x, y }))]) }))
    .filter(({ result }) => result.path.length > 0);
  const safePaths = paths.filter(({ result }) => !result.path.some((point) => layout[point.y][point.x] === '^'));
  const rankedPaths = (safePaths.length ? safePaths : paths).sort((a, b) => {
    const hazardCost = (path: Point[]) => path.slice(1).reduce((sum, point) => sum + (layout[point.y][point.x] === '^' ? 100 : 0), 0);
    return hazardCost(a.result.path) - hazardCost(b.result.path) || a.result.cost - b.result.cost || a.goal.y - b.goal.y || a.goal.x - b.goal.x;
  });
  const chosen = rankedPaths[0];
  if (!chosen) return { enemyId: enemy.id, targetId: target.id, path: [fallback], destination: fallback, action: 'wait', skill, reason: 'no-safe-path' };
  const movement = Math.max(0, enemy.remainingSpeed);
  let cost = 0;
  let destination = fallback;
  let steps = 1;
  for (; steps < chosen.result.path.length; steps += 1) {
    const nextCost = chosen.result.cost === 0 ? 0 : Math.max(1, chosen.result.cost / (chosen.result.path.length - 1));
    if (cost + nextCost > movement) break;
    cost += nextCost;
    destination = chosen.result.path[steps];
  }
  const path = chosen.result.path.slice(0, Math.max(1, steps));
  const canAttack = distance(destination, target) <= range;
  return { enemyId: enemy.id, targetId: target.id, path, destination, action: canAttack ? 'attack' : 'move', skill, reason: canAttack ? 'moved-into-range' : 'chasing-target' };
}
