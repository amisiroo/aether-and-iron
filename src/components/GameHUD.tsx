import React from 'react';
import { Entity, GamePhase, Room, Skill, ChronicleEntry, GameItem, EquipmentSlot } from '../types/game';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  Skull,
  Compass,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface GameHUDProps {
  player: Entity;
  currentRoom: Room;
  phase: GamePhase;
  selectedSkill: Skill | null;
  chronicle: ChronicleEntry[];
  onSelectSkill: (skill: Skill | null) => void;
  onOpenMinimap: () => void;
  onUseItem: (item: GameItem) => void;
  onEquipItem: (item: GameItem) => void;
  onEndTurn: () => void;
  onRollDeathSave: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  currentRoom,
  phase,
  selectedSkill,
  chronicle,
  onSelectSkill,
  onOpenMinimap,
  onUseItem,
  onEquipItem,
  onEndTurn,
  onRollDeathSave,
  onRestart,
}) => {
  const isDowned = player.hp <= 0 || player.conditions.includes('downed');
  const hasInspiration = player.conditions.includes('inspired');
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'relic'];
  const tooltip = (item: GameItem) => {
    if (!item.slot) return item.description;
    const old = player.equipment?.[item.slot];
    const delta = (key: string) => (item.modifiers?.[key as keyof NonNullable<GameItem['modifiers']>] || 0) - (old?.modifiers?.[key as keyof NonNullable<GameItem['modifiers']>] || 0);
    return `${item.description}\n${old ? `Replaces ${old.name}. ` : ''}AC ${delta('ac') >= 0 ? '+' : ''}${delta('ac')}, STR ${delta('STR') >= 0 ? '+' : ''}${delta('STR')}`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090c] text-gray-200 select-none overflow-hidden">
      {/* 1. TOP STATUS BAR */}
      <header className="h-14 border-b border-[#1f2436] bg-[#0c0e15] px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-gray-100 font-cinzel">
                {currentRoom.name}
              </h2>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  phase === 'combat'
                    ? 'bg-red-950/60 border-red-500/40 text-red-300 animate-pulse'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {phase === 'combat' ? '⚔️ TACTICAL COMBAT' : '🛡️ FREE ROAM'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden md:block">{currentRoom.subtitle}</p>
          </div>
        </div>

        {/* Status Indicators (Inspiration & Restrained) */}
        <div className="flex items-center gap-2 md:gap-4">
          {hasInspiration && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              GUILD INSPIRATION (+ADVANTAGE)
            </div>
          )}

          {player.conditions.includes('restrained') && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/50 text-purple-300 text-xs font-mono font-bold">
              🕸️ RESTRAINED (-DISADVANTAGE)
            </div>
          )}

          <button
            onClick={onOpenMinimap}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141926] hover:bg-[#1f263a] border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">CHART / MAP</span>
          </button>

          <button
            onClick={onRestart}
            className="text-xs font-mono text-gray-400 hover:text-gray-200 border border-[#23283a] hover:border-[#3b4463] px-3 py-1 rounded transition"
          >
            Reset Run
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (CANVAS IN CENTER/LEFT, CHRONICLE IN RIGHT) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* CENTER: Canvas and On-Screen Action Bar */}
        <div className="flex-1 flex flex-col relative bg-[#090a10]">
          {/* Canvas will be injected into this container */}
          <div id="canvas-container" className="flex-1 relative flex items-center justify-center overflow-hidden p-2">
            {/* Downed Overlay if HP <= 0 */}
            {isDowned && (
              <div className="absolute inset-0 bg-red-950/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <Skull className="w-16 h-16 text-red-500 animate-pulse mb-3" />
                <h3 className="text-2xl font-black text-red-300 font-cinzel mb-1">
                  YOU HAVE FALLEN (DOWNED)!
                </h3>
                <p className="text-sm text-gray-300 max-w-md mb-6">
                  Nafasmu tersengal di lantai dingin. Musuh di sekitarmu tanpa ampun (Merciless). Lemparkan dadu Death Saving Throw untuk bertahan hidup!
                </p>

                {/* Death Save Indicators */}
                <div className="flex items-center justify-center gap-8 mb-6 p-4 rounded-xl bg-[#0e1017] border border-red-500/40">
                  {/* Successes */}
                  <div>
                    <span className="text-xs font-mono text-emerald-400 block mb-2">SUCCESSES (3 to Stabilize)</span>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono ${
                            player.deathSaves.successes >= i
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'border-emerald-900 bg-emerald-950/30 text-emerald-700'
                          }`}
                        >
                          {player.deathSaves.successes >= i ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Failures */}
                  <div>
                    <span className="text-xs font-mono text-red-400 block mb-2">FAILURES (3 = Death)</span>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono ${
                            player.deathSaves.failures >= i
                              ? 'bg-red-600 border-red-400 text-white'
                              : 'border-red-950 bg-red-950/30 text-red-800'
                          }`}
                        >
                          {player.deathSaves.failures >= i ? '✕' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!player.deathSaves.dead && !player.deathSaves.stabilized && (
                  <button
                    onClick={onRollDeathSave}
                    className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black font-cinzel text-base tracking-wider shadow-xl shadow-red-950/60 transition transform hover:scale-105"
                  >
                    ROLL DEATH SAVING THROW (1d20)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM COMBAT ACTION BAR */}
          <div className="h-20 bg-[#0d0f17] border-t border-[#1f2436] px-4 py-2 flex items-center justify-between shrink-0 z-10 gap-3">
            {/* Player Quick Stats */}
            <div className="flex items-center gap-3 shrink-0">
              <CharacterPortrait
                classType={player.classType}
                size={44}
                className="rounded-xl shadow-lg ring-1 ring-amber-500/40 shrink-0"
              />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs md:text-sm text-gray-100 font-cinzel truncate max-w-[140px] md:max-w-[180px]">
                    {player.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase">
                    Lv.1 {player.classType}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-0.5">
                  {/* HP Bar */}
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <div className="w-20 bg-[#1f2436] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full transition-all duration-300"
                        style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-gray-300">
                      {player.hp}/{player.maxHp}
                    </span>
                  </div>

                  {/* AC */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-blue-300">
                    <Shield className="w-3 h-3 text-blue-400" />
                    AC {player.ac}
                  </div>

                  {/* Speed */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Speed {player.remainingSpeed}/{player.speed}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Active Skills Buttons */}
            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto py-1 px-1">
              {player.skills.map((skill) => {
                const isSelected = selectedSkill?.id === skill.id;
                const isActionUsed = skill.costType === 'action' && player.hasUsedAction;
                const isBonusUsed = skill.costType === 'bonus_action' && player.hasUsedBonusAction;
                const isDisabled = isDowned || (phase === 'combat' && (isActionUsed || isBonusUsed));

                return (
                  <button
                    key={skill.id}
                    disabled={isDisabled}
                    onClick={() => onSelectSkill(isSelected ? null : skill)}
                    className={`px-3 py-1.5 rounded-xl border text-left flex flex-col transition shrink-0 min-w-[125px] ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-white shadow-lg ring-1 ring-amber-400/40'
                        : isDisabled
                        ? 'border-[#1b2030] bg-[#090b10] text-gray-600 opacity-40 cursor-not-allowed'
                        : 'border-[#262c40] bg-[#121520] hover:border-amber-500/50 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold font-cinzel truncate">{skill.name}</span>
                      <span className="text-[9px] font-mono text-amber-400 shrink-0">
                        {skill.costType === 'action' ? '[Act]' : '[Bonus]'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono truncate">
                      Rng: {skill.range} {skill.damageDice ? `| ${skill.damageDice}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Item Belt */}
            {player.inventory && player.inventory.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 border-l border-[#22283a] pl-2.5 shrink-0">
                {player.inventory.map((item) => (
                  <button
                    key={item.id}
                    disabled={item.count <= 0 || isDowned}
                    onClick={() => onUseItem(item)}
                    title={`${item.name}: ${item.description}`}
                    className="px-2.5 py-1.5 rounded-xl border border-[#2b334a] bg-[#111420] hover:border-amber-500/50 hover:bg-[#181d2e] text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>{item.type === 'potion' ? '🧪' : '📜'}</span>
                    <span className="font-bold text-gray-200 text-[11px] hidden md:inline">
                      {item.name.replace('Guild ', '')}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40">
                      x{item.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Right: End Turn Button (Active in combat) */}
            {phase === 'combat' && (
              <button
                onClick={onEndTurn}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold font-mono text-xs tracking-wider shadow-lg transition transform hover:-translate-y-0.5 shrink-0 flex items-center gap-1.5"
              >
                END TURN <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

          {/* INVENTORY / EQUIPMENT */}
          <div className="border-t border-[#1f2436] bg-[#0b0d14] p-3 shrink-0">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">Inventory & Equipment</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {slots.map((slot) => {
                const item = player.equipment?.[slot];
                return <div key={slot} className="rounded border border-[#292f43] bg-[#111420] p-2" title={item?.description || `Empty ${slot}`}>
                  <div className="text-[9px] uppercase text-gray-500">{slot}</div><div className="text-[10px] truncate">{item?.name || '— empty —'}</div>
                  {item && <button onClick={() => onEquipItem(item)} className="text-[9px] text-amber-300">Unequip</button>}
                </div>;
              })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(player.inventory || []).map((item) => <div key={item.id} className="group relative flex items-center gap-1 rounded border border-[#292f43] bg-[#111420] px-2 py-1">
                <span className="text-[10px]">{item.type === 'potion' ? '🧪' : item.type === 'scroll' ? '📜' : item.type === 'weapon' ? '⚔️' : '🛡️'} {item.name} x{item.count}</span>
                <button onClick={() => item.slot ? onEquipItem(item) : onUseItem(item)} className="text-[10px] text-emerald-300">{item.slot ? 'Equip' : 'Use'}</button>
                <div className="pointer-events-none absolute bottom-full left-0 z-40 mb-1 hidden w-56 whitespace-pre-line rounded border border-amber-500/40 bg-[#080a10] p-2 text-[10px] shadow-xl group-hover:block">{tooltip(item)}{item.modifiers && `\nMods: ${Object.entries(item.modifiers).map(([k,v]) => `${k} ${v >= 0 ? '+' : ''}${v}`).join(', ')}`}</div>
              </div>)}
            </div>
          </div>

        {/* RIGHT PANEL: CHRONICLE & LORE LOG (col-span-4) */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#1f2436] bg-[#0a0c13] flex flex-col h-64 lg:h-full shrink-0">
          {/* Chronicle Header */}
          <div className="p-3 border-b border-[#1c2132] bg-[#0e1018] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 truncate">
                Guild Chronicle & Log
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0 font-mono">
              <HelpCircle className="w-3 h-3" />
              <span>WASD / Click</span>
            </div>
          </div>

          {/* Chronicle List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 font-mono text-xs">
            {chronicle.map((entry) => (
              <div
                key={entry.id}
                className={`p-2.5 rounded-lg border leading-relaxed break-words ${
                  entry.type === 'narrative'
                    ? 'bg-[#111420] border-[#22273b] text-gray-300 font-sans italic'
                    : entry.type === 'combat'
                    ? 'bg-red-950/20 border-red-500/30 text-red-200'
                    : entry.type === 'check'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : entry.type === 'hazard'
                    ? 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase pr-0.5">
                  <span>[{entry.type}]</span>
                  <span>{entry.timestamp}</span>
                </div>
                <div>{entry.text}</div>
              </div>
            ))}
          </div>

          {/* Tactical Hints Footer */}
          <div className="p-3 bg-[#0c0e15] border-t border-[#1c2132] text-[11px] text-gray-400 space-y-1 font-mono">
            <div className="text-amber-400 font-bold">💡 D&D TACTICAL RULES:</div>
            <div>• <b className="text-gray-300">~ Rubble:</b> Menyerang dari sini kena Disadvantage.</div>
            <div>• <b className="text-gray-300">^ Hazard:</b> Gagal save membuatmu Restrained.</div>
            <div>• <b className="text-gray-300">Merciless AI:</b> Musuh mengeksekusi petualang downed!</div>
          </div>
        </aside>
      </div>
    </div>
  );
};
