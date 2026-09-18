import { describe, expect, it } from 'vitest';
import { ITEMS } from '../data/items';
import type { Entity, Room } from '../types/game';
import { claimEnemyLoot, claimInteractableLoot } from './loot';

const hero = (): Entity => ({ id: 'p', name: 'P', isPlayer: true, x: 0, y: 0, hp: 10, maxHp: 10, ac: 10, speed: 6, remainingSpeed: 6, attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, conditions: [], skills: [], inventory: [], equipment: {}, claimedLoot: [], color: '#fff', icon: 'x', deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false }, hasUsedAction: false, hasUsedBonusAction: false });
const room = { id: 'r', interactables: [], enemies: [] } as unknown as Room;

describe('runtime loot claims', () => {
  it('claims chest loot once and persists a source marker', () => {
    const chest = { id: 'chest_rations' } as Parameters<typeof claimInteractableLoot>[2];
    const first = claimInteractableLoot(hero(), room, chest);
    const second = claimInteractableLoot(first, room, chest);
    expect(first.inventory?.some((i) => i.id === ITEMS.guildPotion.id)).toBe(true);
    expect(second.inventory).toEqual(first.inventory);
    expect(second.claimedLoot).toEqual(first.claimedLoot);
  });
  it('claims defeated enemy rewards without duplicating repeated resolution', () => {
    const enemy = { id: 'skel_archer_1' } as Entity;
    const first = claimEnemyLoot(hero(), room, enemy);
    const second = claimEnemyLoot(first, room, enemy);
    expect(first.inventory?.map((i) => i.id)).toEqual([ITEMS.guildFlare.id, ITEMS.emberBlade.id]);
    expect(second.inventory).toEqual(first.inventory);
  });
});