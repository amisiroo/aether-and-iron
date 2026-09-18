import type { Entity, EquipmentSlot, GameItem, StatModifiers } from '../types/game';

export const ITEMS: Record<string, GameItem> = {
  guildPotion: { id: 'guild_potion', name: 'Guild Healing Draught', description: 'Heal 2d4+2 HP.', type: 'potion', rarity: 'common', effect: 'heal', value: 50, count: 1 },
  guildFlare: { id: 'guild_flare', name: 'Luminescent Flare', description: 'Gain inspiration.', type: 'scroll', rarity: 'common', effect: 'inspiration', value: 75, count: 1 },
  ironMail: { id: 'iron_mail', name: 'Reinforced Iron Mail', description: 'Heavy armor. +2 AC.', type: 'armor', rarity: 'uncommon', value: 150, count: 1, slot: 'armor', modifiers: { ac: 2 } },
  emberBlade: { id: 'ember_blade', name: 'Ember Blade', description: 'A sword warm with residual fire.', type: 'weapon', rarity: 'rare', value: 300, count: 1, slot: 'weapon', modifiers: { STR: 1 } },
  obsidianHeart: { id: 'obsidian_heart', name: 'Obsidian Heart', description: 'Unique relic: +2 max HP and +1 CON.', type: 'relic', rarity: 'legendary', value: 500, count: 1, slot: 'relic', modifiers: { CON: 1, maxHp: 2 }, unique: true },
};

export function normalizeItem(item: Partial<GameItem>): GameItem {
  return { id: item.id || 'unknown', name: item.name || 'Unknown item', description: item.description || '', type: item.type || 'potion', rarity: item.rarity || 'common', effect: item.effect, value: item.value || 0, count: item.count || 1, slot: item.slot, modifiers: item.modifiers, unique: item.unique, lootSource: item.lootSource };
};

export const getEquipmentStats = (equipment: Partial<Record<EquipmentSlot, GameItem>> = {}): StatModifiers =>
  Object.values(equipment).reduce<StatModifiers>((stats, item) => {
    if (!item?.modifiers) return stats;
    for (const [key, value] of Object.entries(item.modifiers)) stats[key as keyof StatModifiers] = (stats[key as keyof StatModifiers] || 0) + (value || 0);
    return stats;
  }, {});

const applyStats = (player: Entity, equipment: Partial<Record<EquipmentSlot, GameItem>>): Entity => {
  const stats = getEquipmentStats(equipment);
  const previous = getEquipmentStats(player.equipment);
  const delta = (key: keyof StatModifiers) => (stats[key] || 0) - (previous[key] || 0);
  return {
    ...player,
    ac: player.ac + delta('ac'), maxHp: player.maxHp + delta('maxHp'), hp: Math.min(player.maxHp + delta('maxHp'), player.hp + delta('maxHp')),
    speed: player.speed + delta('speed'), remainingSpeed: player.remainingSpeed + delta('speed'),
    attributes: Object.fromEntries(Object.entries(player.attributes).map(([key, value]) => [key, value + delta(key as keyof StatModifiers)])) as Entity['attributes'],
    equipment,
  };
};

export function addItem(player: Entity, item: GameItem, sourceId?: string): Entity {
  if (sourceId && player.inventory?.some((entry) => entry.lootSource === sourceId)) return player;
  if (item.unique && (player.inventory?.some((entry) => entry.id === item.id) || player.equipment?.relic?.id === item.id)) return player;
  const inventory = [...(player.inventory || [])];
  const existing = inventory.find((entry) => entry.id === item.id && !item.unique);
  if (existing) existing.count += item.count;
  else inventory.push({ ...item, lootSource: sourceId });
  return { ...player, inventory };
}

export function removeItem(player: Entity, itemId: string): Entity {
  return { ...player, inventory: (player.inventory || []).map((item) => item.id === itemId ? { ...item, count: item.count - 1 } : item).filter((item) => item.count > 0) };
}

export function useItem(player: Entity, itemId: string): { player: Entity; used: boolean } {
  const item = player.inventory?.find((entry) => entry.id === itemId);
  if (!item || !item.effect || item.type === 'weapon' || item.type === 'armor' || item.type === 'relic') return { player, used: false };
  const next = removeItem(player, itemId);
  if (item.effect === 'heal') next.hp = Math.min(next.maxHp, next.hp + 4);
  if (item.effect === 'inspiration' && !next.conditions.includes('inspired')) next.conditions = [...next.conditions, 'inspired'];
  return { player: next, used: true };
}

export function equipItem(player: Entity, itemId: string): { player: Entity; equipped: boolean } {
  const item = player.inventory?.find((entry) => entry.id === itemId) || Object.values(player.equipment || {}).find((entry) => entry?.id === itemId);
  if (!item?.slot || !item.modifiers) return { player, equipped: false };
  const old = player.equipment?.[item.slot];
  if (old?.id === item.id) return { player: applyStats(player, {}), equipped: false };
  const equipment = { ...(player.equipment || {}), [item.slot]: item };
  return { player: applyStats({ ...player, inventory: old && old.id !== item.id ? [...(player.inventory || []), old] : player.inventory?.filter((entry) => entry.id !== item.id) }, equipment), equipped: !old || old.id !== item.id };
}

export const LOOT_TABLES = { chest: ['guildPotion', 'ironMail'], enemy: ['guildFlare', 'emberBlade'], reward: ['obsidianHeart'] } as const;
export function resolveLoot(player: Entity, table: keyof typeof LOOT_TABLES, sourceId: string): Entity {
  return LOOT_TABLES[table].reduce((current, id) => addItem(current, ITEMS[id], sourceId), player);
}
