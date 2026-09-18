import type { Entity, QuestState, ConsequenceFlags, Room } from '../types/game';
import { awardXp } from './progression';

export type QuestDefinition = { id: string; title: string; description: string; objectives: Array<{ id: string; text: string; target: number }> };
export const CHAPTER_1_QUESTS: QuestDefinition[] = [
  { id: 'reliquary_expedition', title: 'The Sunken Reliquary', description: 'Recover the Obsidian Heart for the Guild.', objectives: [
    { id: 'enter_scriptorium', text: 'Reach the Scriptorium of Ashes', target: 1 },
    { id: 'solve_runes', text: 'Resolve the Scriptorium runes', target: 1 },
    { id: 'secure_relic', text: 'Secure the Obsidian Heart', target: 1 },
  ] },
];

export const createQuestStates = (): QuestState[] => CHAPTER_1_QUESTS.map(q => ({ id: q.id, status: 'active', objectives: q.objectives.map(o => ({ id: o.id, progress: 0, target: o.target, status: 'active' })), rewardClaimed: false }));
export const createConsequenceFlags = (): ConsequenceFlags => ({});

export function progressObjective(quests: QuestState[], questId: string, objectiveId: string, amount = 1): QuestState[] {
  return quests.map(q => {
    if (q.id !== questId || q.status !== 'active') return q;
    const objectives = q.objectives.map(o => o.id === objectiveId && o.status === 'active' ? { ...o, progress: Math.min(o.target, o.progress + Math.max(0, amount)), status: o.progress + amount >= o.target ? 'completed' as const : 'active' as const } : o);
    const completed = objectives.every(o => o.status === 'completed');
    return { ...q, objectives, status: completed ? 'completed' : 'active' };
  });
}
export const failQuest = (quests: QuestState[], questId: string): QuestState[] => quests.map(q => q.id === questId && q.status === 'active' ? { ...q, status: 'failed' } : q);
export function claimQuestReward(player: Entity, quests: QuestState[], questId: string, amount: number): { player: Entity; quests: QuestState[]; awarded: number } {
  const quest = quests.find(q => q.id === questId);
  if (!quest || quest.status !== 'completed' || quest.rewardClaimed) return { player, quests, awarded: 0 };
  const result = awardXp(player, { id: `quest:${questId}`, amount, source: 'quest', label: questId });
  return { player: result.player, quests: quests.map(q => q.id === questId ? { ...q, rewardClaimed: true } : q), awarded: result.awarded };
}
export function unlockRoom(room: Room, flags: ConsequenceFlags): boolean {
  return !room.unlockRequirement || room.unlockRequirement.every(key => flags[key] === true);
}
export function resolvePuzzle(flags: ConsequenceFlags, puzzleId: string, success: boolean, successFlag: string, failureFlag: string): { flags: ConsequenceFlags; outcome: 'success' | 'failure' | 'already_resolved' } {
  const resolvedKey = `puzzle:${puzzleId}:resolved`;
  if (flags[resolvedKey]) return { flags, outcome: 'already_resolved' };
  return { flags: { ...flags, [resolvedKey]: true, [success ? successFlag : failureFlag]: true }, outcome: success ? 'success' : 'failure' };
}
