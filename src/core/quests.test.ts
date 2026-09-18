import { describe, expect, it } from 'vitest';
import { createQuestStates, progressObjective, claimQuestReward, resolvePuzzle, unlockRoom } from './quests';
import type { Entity, Room } from '../types/game';

const player = { id:'p', name:'p', isPlayer:true, x:0,y:0,hp:10,maxHp:10,ac:10,speed:5,remainingSpeed:5,attributes:{STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10},conditions:[],skills:[],color:'',icon:'',deathSaves:{successes:0,failures:0,stabilized:false,dead:false},hasUsedAction:false,hasUsedBonusAction:false } as Entity;
describe('quest and narrative state', () => {
 it('transitions objective and quest active to completed', () => { let q = progressObjective(createQuestStates(),'reliquary_expedition','enter_scriptorium'); expect(q[0].status).toBe('active'); q=progressObjective(q,'reliquary_expedition','solve_runes'); q=progressObjective(q,'reliquary_expedition','secure_relic'); expect(q[0].status).toBe('completed'); });
 it('prevents duplicate quest rewards', () => { let q=createQuestStates(); q=progressObjective(q,'reliquary_expedition','enter_scriptorium'); q=progressObjective(q,'reliquary_expedition','solve_runes'); q=progressObjective(q,'reliquary_expedition','secure_relic'); const a=claimQuestReward(player,q,'reliquary_expedition',100); const b=claimQuestReward(a.player,a.quests,'reliquary_expedition',100); expect(a.awarded).toBe(100); expect(b.awarded).toBe(0); });
 it('resolves a puzzle once and unlocks by consequence flag', () => { const first=resolvePuzzle({},'runes',true,'runes_deciphered','runes_backlash'); expect(resolvePuzzle(first.flags,'runes',false,'runes_deciphered','runes_backlash').outcome).toBe('already_resolved'); const room={unlockRequirement:['runes_deciphered']} as Room; expect(unlockRoom(room,first.flags)).toBe(true); });
});
