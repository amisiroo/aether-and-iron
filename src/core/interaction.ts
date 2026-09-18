import type { Entity, Interactable } from '../types/game';

export type TileInteraction =
  | { kind: 'enemy'; entity: Entity }
  | { kind: 'interactable'; interactable: Interactable }
  | { kind: 'tile' };

/** Resolves the most specific target first so a non-walkable object is not reported as blocked. */
export function classifyTileInteraction(
  x: number,
  y: number,
  enemies: Entity[],
  interactables: Interactable[],
): TileInteraction {
  const enemy = enemies.find((candidate) => candidate.x === x && candidate.y === y && candidate.hp > 0);
  if (enemy) return { kind: 'enemy', entity: enemy };
  const interactable = interactables.find((candidate) => candidate.x === x && candidate.y === y && !candidate.resolved);
  if (interactable) return { kind: 'interactable', interactable };
  return { kind: 'tile' };
}

export function interactableHint(interactable: Interactable): string {
  return interactable.resolved
    ? `${interactable.name} — already resolved`
    : `Interact: ${interactable.name}${interactable.check ? ` (${interactable.check.stat} DC ${interactable.check.dc})` : ''}`;
}
