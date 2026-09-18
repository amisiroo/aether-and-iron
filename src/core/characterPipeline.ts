import type { AbilityScore, Attributes, CharacterClass, Entity } from '../types/game';
import { CLASSES_DATA } from '../data/classes';
import { SKILLS_DATABASE } from '../data/skills';
import { MAX_POINT_BUY_POINTS, calculateSpentPoints, getAbilityModifier, POINT_BUY_COSTS } from './dnd';

export type CreationStep = 'identity' | 'origin' | 'class' | 'attributes' | 'skills' | 'review';
export const CREATION_STEPS: CreationStep[] = ['identity', 'origin', 'class', 'attributes', 'skills', 'review'];
export const ORIGINS = [
  { id: 'guild', name: 'Guild Delver', tags: ['Resourced', 'Disciplined'], passive: 'Begin with the Guild starter kit.' },
  { id: 'scholar', name: 'Reliquary Scholar', tags: ['Lore', 'Arcane'], passive: 'Ancient inscriptions feel strangely familiar.' },
  { id: 'outlander', name: 'Ashen Outlander', tags: ['Survivor', 'Scout'], passive: 'Hazards never catch you completely unaware.' },
] as const;
export interface CreationDraft { step: CreationStep; name: string; origin: string; classId: CharacterClass; attributes: Attributes; }
export function defaultDraft(): CreationDraft { return { step: 'identity', name: '', origin: '', classId: 'fighter', attributes: { ...CLASSES_DATA.fighter.recommendedAttributes } }; }
export function spentPoints(attributes: Attributes): number { return calculateSpentPoints(attributes); }
export function stepIsValid(draft: CreationDraft, step: CreationStep = draft.step): boolean {
  if (step === 'identity') return draft.name.trim().length >= 2;
  if (step === 'origin') return ORIGINS.some((origin) => origin.id === draft.origin);
  if (step === 'class') return Boolean(CLASSES_DATA[draft.classId]);
  if (step === 'attributes') return spentPoints(draft.attributes) <= MAX_POINT_BUY_POINTS && Object.values(draft.attributes).every((value) => value >= 8 && value <= 15);
  return true;
}
export function canNext(draft: CreationDraft): boolean { return stepIsValid(draft); }
export function nextStep(draft: CreationDraft): CreationDraft { const index = CREATION_STEPS.indexOf(draft.step); return index < CREATION_STEPS.length - 1 && canNext(draft) ? { ...draft, step: CREATION_STEPS[index + 1] } : draft; }
export function previousStep(draft: CreationDraft): CreationDraft { const index = CREATION_STEPS.indexOf(draft.step); return index > 0 ? { ...draft, step: CREATION_STEPS[index - 1] } : draft; }
export function updateAttribute(draft: CreationDraft, stat: AbilityScore, delta: number): CreationDraft { const next = draft.attributes[stat] + delta; if (next < 8 || next > 15) return draft; const cost = POINT_BUY_COSTS[next] - POINT_BUY_COSTS[draft.attributes[stat]]; if (delta > 0 && spentPoints(draft.attributes) + cost > MAX_POINT_BUY_POINTS) return draft; return { ...draft, attributes: { ...draft.attributes, [stat]: next } }; }
export function buildEntity(draft: CreationDraft): Entity {
  const cls = CLASSES_DATA[draft.classId]; const hp = cls.hitDie + getAbilityModifier(draft.attributes.CON);
  return { id: 'player_hero', name: draft.name.trim(), isPlayer: true, classType: draft.classId, x: 6, y: 4, hp, maxHp: hp, ac: cls.baseAc + (draft.classId === 'rogue' ? getAbilityModifier(draft.attributes.DEX) : 0), speed: cls.baseSpeed, remainingSpeed: cls.baseSpeed, attributes: draft.attributes, conditions: [], progression: { xp: 0, level: 1, appliedLevel: 1, claimedXpAwards: [], skillRanks: {} }, skills: cls.skillIds.map((id) => SKILLS_DATABASE[id]).filter(Boolean), inventory: [{ id: 'guild_potion', name: 'Guild Healing Draught', description: 'Heal 2d4+2 HP.', type: 'potion', effect: 'heal', rarity: 'common', value: 50, count: 2 }, { id: 'guild_flare', name: 'Luminescent Flare', description: 'Gain inspiration.', type: 'scroll', effect: 'inspiration', rarity: 'common', value: 75, count: 1 }], color: cls.color, icon: 'Shield', deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false }, hasUsedAction: false, hasUsedBonusAction: false };
}
