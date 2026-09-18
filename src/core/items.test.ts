import { describe, expect, it } from 'vitest';
import { ITEMS, addItem, equipItem, getEquipmentStats, removeItem, useItem } from '../data/items';
import type { Entity } from '../types/game';

const hero = (): Entity => ({
  id: 'h', name: 'Hero', isPlayer: true, x: 0, y: 0, hp: 5, maxHp: 10, ac: 10, speed: 6, remainingSpeed: 6,
  attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, conditions: [], skills: [],
  inventory: [], equipment: {}, color: '#fff', icon: 'x', deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false }, hasUsedAction: false, hasUsedBonusAction: false,
});

describe('loot and inventory', () => {
  it('adds and consumes a potion without mutating the original', () => {
    const added = addItem(hero(), ITEMS.guildPotion);
    const used = useItem(added, ITEMS.guildPotion.id);
    expect(used.player.hp).toBe(9);
    expect(used.player.inventory).toEqual([]);
    expect(hero().hp).toBe(5);
  });
  it('equip and unequip reversibly applies modifiers', () => {
    const withArmor = equipItem(addItem(hero(), ITEMS.ironMail), ITEMS.ironMail.id).player;
    expect(withArmor.ac).toBe(12);
    expect(getEquipmentStats(withArmor.equipment)).toEqual({ ac: 2 });
    const removed = equipItem(withArmor, ITEMS.ironMail.id).player;
    expect(removed.ac).toBe(10);
  });
  it('enforces a unique relic once', () => {
    const first = addItem(hero(), ITEMS.obsidianHeart);
    const second = addItem(first, ITEMS.obsidianHeart);
    expect(second.inventory?.filter((i) => i.id === ITEMS.obsidianHeart.id)).toHaveLength(1);
    expect(second.equipment?.relic).toBeUndefined();
  });
  it('removes an inventory item by id', () => {
    const player = addItem(hero(), ITEMS.guildPotion);
    expect(removeItem(player, ITEMS.guildPotion.id).inventory).toEqual([]);
  });
});

describe('loot resolution', () => {
  it('is idempotent for a source id', () => {
    const first = addItem(hero(), ITEMS.guildPotion, 'chest-a');
    const second = addItem(first, ITEMS.guildPotion, 'chest-a');
    expect(second.inventory?.[0].count).toBe(1);
  });
});
