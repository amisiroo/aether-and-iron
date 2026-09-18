import type { Entity, Interactable, Room } from '../types/game';
import { resolveLoot } from '../data/items';

export type LootTable = 'chest' | 'enemy' | 'reward';

/** Maps authored world events to stable, save-friendly loot source ids. */
export function claimLoot(player: Entity, table: LootTable, sourceId: string): Entity {
  return resolveLoot(player, table, sourceId);
}

export function claimInteractableLoot(player: Entity, room: Room, interactable: Interactable): Entity {
  const table: LootTable | undefined = interactable.id.startsWith('chest_')
    ? 'chest'
    : interactable.id === 'relic_pedestal'
    ? 'reward'
    : undefined;
  return table ? claimLoot(player, table, `interactable:${room.id}:${interactable.id}`) : player;
}

export function claimEnemyLoot(player: Entity, room: Room, enemy: Entity): Entity {
  return claimLoot(player, 'enemy', `enemy:${room.id}:${enemy.id}`);
}