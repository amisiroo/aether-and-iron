import type { AbilityScore, CharacterClass, Entity, Skill } from '../types/game';
import { SKILLS_DATABASE } from '../data/skills';

export type XpSource = 'enemy' | 'room' | 'quest' | 'discovery';
export type LevelUpChoice = 'power' | 'vitality' | 'skill';

export interface XpAward { id: string; amount: number; source: XpSource; label?: string }
export interface ProgressionState { xp: number; level: number; appliedLevel?: number; claimedXpAwards: string[]; skillRanks: Record<string, number> }
export interface LevelUpResult { player: Entity; choice: LevelUpChoice; unlockedSkill?: string }

export const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000];
export const MAX_EARLY_LEVEL = XP_THRESHOLDS.length;

const CLASS_SKILL_TREE: Record<CharacterClass, Array<{ level: number; skillId: string }>> = {
  fighter: [{ level: 2, skillId: 'guard_break' }, { level: 3, skillId: 'battle_focus' }],
  rogue: [{ level: 2, skillId: 'shadow_step' }, { level: 3, skillId: 'precision_strike' }],
  wizard: [{ level: 2, skillId: 'arcane_burst' }, { level: 3, skillId: 'mana_surge' }],
  cleric: [{ level: 2, skillId: 'blessing' }, { level: 3, skillId: 'radiant_ward' }],
};

export const xpForNextLevel = (level: number): number => XP_THRESHOLDS[Math.min(Math.max(level, 1), XP_THRESHOLDS.length - 1)] ?? Infinity;
export const levelForXp = (xp: number): number => XP_THRESHOLDS.reduce((level, threshold, i) => xp >= threshold ? i + 1 : level, 1);
export const createProgression = (): ProgressionState => ({ xp: 0, level: 1, claimedXpAwards: [], skillRanks: {} });

export function awardXp(player: Entity, award: XpAward): { player: Entity; awarded: number; leveledUp: boolean } {
  const state = player.progression ?? createProgression();
  if (!award.id || state.claimedXpAwards.includes(award.id)) return { player: { ...player, progression: state }, awarded: 0, leveledUp: false };
  const xp = state.xp + Math.max(0, award.amount);
  const level = levelForXp(xp);
  return { player: { ...player, progression: { ...state, xp, level, claimedXpAwards: [...state.claimedXpAwards, award.id] } }, awarded: Math.max(0, award.amount), leveledUp: level > state.level };
}

export function pendingLevelUps(player: Entity): number { return Math.max(0, (player.progression?.level ?? 1) - (player.progression?.appliedLevel ?? 1)); }

const skillFor = (id: string): Skill => {
  const skill = SKILLS_DATABASE[id];
  if (!skill) throw new Error(`Unknown progression skill: ${id}`);
  return { ...skill };
};

export function applyLevelUp(player: Entity, choice: LevelUpChoice): LevelUpResult {
  const state = player.progression ?? createProgression();
  const targetLevel = (state.appliedLevel ?? 1) + 1;
  if (targetLevel > state.level) throw new Error('No level-up available');
  if (!['power', 'vitality', 'skill'].includes(choice)) throw new Error('Invalid level-up choice');
  let updated: Entity = { ...player, attributes: { ...player.attributes }, progression: { ...state, appliedLevel: targetLevel } };
  if (choice === 'power') {
    const stat: AbilityScore = player.classType === 'fighter' ? 'STR' : player.classType === 'rogue' ? 'DEX' : player.classType === 'wizard' ? 'INT' : 'WIS';
    updated.attributes[stat] += 1;
  } else if (choice === 'vitality') {
    updated.maxHp += 4;
    updated.hp += 4;
  } else {
    const unlock = (CLASS_SKILL_TREE[player.classType ?? 'fighter'] ?? []).find((node) => node.level === targetLevel && !updated.skills.some((skill) => skill.id === node.skillId));
    if (!unlock) throw new Error('No skill available for this level');
    updated.skills = [...updated.skills, skillFor(unlock.skillId)];
    updated.progression = { ...updated.progression!, skillRanks: { ...updated.progression!.skillRanks, [unlock.skillId]: 1 } };
    return { player: updated, choice, unlockedSkill: unlock.skillId };
  }
  return { player: updated, choice };
}

export const progressionSkills = CLASS_SKILL_TREE;
