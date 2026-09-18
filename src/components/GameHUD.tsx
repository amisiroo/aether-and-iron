import React from 'react';
import { Entity, GamePhase, Room, Skill, ChronicleEntry, GameItem, EquipmentSlot, QuestState } from '../types/game';
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
  Backpack,
  User,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';
import type { CombatStats } from '../core/replayability';

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
  onNewGamePlus?: () => void;
  onOpenHelp?: () => void;
  onScaleFont?: (delta: number) => void;
  quests?: QuestState[];
  combatStats?: CombatStats;
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
  onNewGamePlus,
  onOpenHelp,
  onScaleFont,
  quests = [],
  combatStats,
}) => {
  const isDowned = player.hp <= 0 || player.conditions.includes('downed');
  const hasInspiration = player.conditions.includes('inspired');
  const [modal, setModal] = React.useState<'inventory' | 'profile' | null>(null);
  const [chronicleCollapsed, setChronicleCollapsed] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!modal) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', onKeyDown);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal]);
  const closeModal = () => setModal(null);
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'relic'];

  return (
    <div className="game-hud flex flex-col min-h-screen h-[100dvh] w-full bg-[#08090c] text-gray-200 select-none overflow-hidden">
      {/* 1. TOP STATUS BAR */}
      <header className="min-h-14 border-b border-[#1f2436] bg-[#0c0e15] px-3 md:px-6 py-2 flex flex-wrap items-center justify-between shrink-0 z-20 gap-2">
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
        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
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

          <button onClick={() => setModal('inventory')} aria-label="Open inventory and equipment" className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/40 text-amber-300 text-xs font-mono"><Backpack className="w-3.5 h-3.5" /> <span className="hidden sm:inline">INVENTORY</span></button>
          <button onClick={() => setModal('profile')} aria-label="Open character profile" className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-cyan-500/40 text-cyan-200 text-xs font-mono"><User className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PROFILE</span></button>
          <button
            onClick={onOpenMinimap}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141926] hover:bg-[#1f263a] border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">CHART / MAP</span>
          </button>

          <button onClick={onOpenHelp} aria-label="Open field guide" title="Help (?)" className="px-2.5 py-1 rounded-lg border border-cyan-500/40 text-cyan-200 text-xs font-mono">? HELP</button>
          <button onClick={() => onScaleFont?.(-.05)} aria-label="Decrease text size" className="px-2 py-1 rounded border border-[#2b334a] text-xs">A−</button>
          <button onClick={() => onScaleFont?.(.05)} aria-label="Increase text size" className="px-2 py-1 rounded border border-[#2b334a] text-xs">A+</button>

          {onNewGamePlus && <button onClick={onNewGamePlus} className="text-xs font-mono text-amber-300 border border-amber-500/40 px-3 py-1 rounded transition">NG+</button>}
          <button
            onClick={onRestart}
            className="text-xs font-mono text-gray-400 hover:text-gray-200 border border-[#23283a] hover:border-[#3b4463] px-3 py-1 rounded transition"
          >
            Reset Run
          </button>
        </div>
      </header>
      <div role="status" aria-live="polite" className="absolute top-14 left-0 right-0 lg:right-96 z-20 px-4 py-1 bg-amber-950/70 text-[10px] font-mono text-amber-200 truncate">
        {quests.filter(q => q.status === 'active').flatMap(q => q.objectives.filter(o => o.status === 'active').map(o => `${o.id} ${o.progress}/${o.target}`)).join(' · ')}
        {currentRoom.enemies.some(e => e.id.includes('boss') && e.hp > 0) && <span className="ml-3 text-red-200">⚠ BOSS PRESENT · summon/hazard telegraphs active</span>}
        {currentRoom.layout.some(row => row.includes('^')) && <span className="ml-3 text-purple-200">◇ HAZARD TILES TELEGRAPHED (^)</span>}
      </div>

      {/* 2. MAIN WORKSPACE (CANVAS IN CENTER/LEFT, CHRONICLE IN RIGHT) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
        {/* CENTER: Canvas and On-Screen Action Bar */}
        <div className="flex-1 min-h-0 flex flex-col relative bg-[#090a10]">
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
          <div className="min-h-20 bg-[#0d0f17] border-t border-[#1f2436] px-3 py-2 flex flex-wrap items-center justify-between shrink-0 z-10 gap-3">
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
                    {player.progression ? `Lv.${player.progression.level} · XP ${player.progression.xp}` : 'Lv.1'} {player.classType}
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

          {/* INVENTORY / EQUIPMENT is available in an accessible modal from the header. */}

        {/* RIGHT PANEL: CHRONICLE & LORE LOG (col-span-4) */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#1f2436] bg-[#0a0c13] flex flex-col min-h-0 h-64 lg:h-full shrink-0">
          {/* Chronicle Header */}
          <div className="p-3 border-b border-[#1c2132] bg-[#0e1018] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 truncate">
                Guild Chronicle & Log
              </h3>
            </div>
            <button onClick={() => setChronicleCollapsed((value) => !value)} aria-expanded={!chronicleCollapsed} aria-controls="chronicle-log" className="p-1.5 rounded border border-[#2b334a] text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400" title={chronicleCollapsed ? 'Expand chronicle' : 'Collapse chronicle'}>{chronicleCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}</button>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0 font-mono">
              <HelpCircle className="w-3 h-3" />
              <span>WASD / Click</span>
            </div>
          </div>
          {combatStats && <div className="px-3 py-2 border-b border-[#1c2132] bg-amber-950/10 text-[10px] font-mono text-amber-200" aria-label="Run combat summary">
            RUN SUMMARY · {combatStats.totalDamage} damage · {combatStats.totalHealing} healing · {combatStats.defeats} defeated · {combatStats.turns} turns
          </div>}

          {!chronicleCollapsed && <div id="chronicle-log" className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2.5 font-mono text-xs" aria-label="Chronicle entries">
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
          </div>}

          {/* Tactical Hints Footer */}
          <div className="p-3 bg-[#0c0e15] border-t border-[#1c2132] text-[11px] text-gray-400 space-y-1 font-mono">
            <div className="text-amber-400 font-bold">💡 D&D TACTICAL RULES:</div>
            <div>• <b className="text-gray-300">~ Rubble:</b> Menyerang dari sini kena Disadvantage.</div>
            <div>• <b className="text-gray-300">^ Hazard:</b> Gagal save membuatmu Restrained.</div>
            <div>• <b className="text-gray-300">Merciless AI:</b> Musuh mengeksekusi petualang downed!</div>
          </div>
        </aside>
        {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="secondary-panel-title" className="w-full max-w-2xl max-h-[min(80vh,680px)] overflow-y-auto rounded-xl border border-amber-500/40 bg-[#0b0d14] p-4 shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 id="secondary-panel-title" className="font-cinzel text-lg font-bold text-amber-300">{modal === 'inventory' ? 'Inventory & Equipment' : 'Character Profile'}</h2><button onClick={closeModal} aria-label="Close panel" className="rounded border border-[#2b334a] p-1.5 text-gray-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"><X className="h-4 w-4" /></button></div>
            {modal === 'inventory' ? <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-3">{slots.map((slot) => { const item = player.equipment?.[slot]; return <div key={slot} className="rounded border border-[#292f43] bg-[#111420] p-3"><div className="text-[10px] uppercase text-gray-500">{slot}</div><div className="truncate text-sm">{item?.name || '— empty —'}</div>{item && <button onClick={() => onEquipItem(item)} className="mt-1 text-xs text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">Unequip</button>}</div>; })}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{(player.inventory || []).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded border border-[#292f43] bg-[#111420] p-3"><span className="text-sm">{item.type === 'potion' ? '🧪' : item.type === 'scroll' ? '📜' : item.type === 'weapon' ? '⚔️' : '🛡️'} {item.name} x{item.count}</span><button onClick={() => item.slot ? onEquipItem(item) : onUseItem(item)} className="text-xs text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">{item.slot ? 'Equip' : 'Use'}</button></div>)}</div>
            </> : <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{[['Class', player.classType], ['Level', String(player.progression?.level ?? 1)], ['HP', `${player.hp}/${player.maxHp}`], ['Armor Class', String(player.ac)], ...Object.entries(player.attributes).map(([key, value]) => [key, String(value)])].map(([label, value]) => <div key={label} className="rounded border border-[#292f43] bg-[#111420] p-3"><div className="text-xs text-gray-500">{label}</div><div className="font-mono text-amber-100">{value}</div></div>)}</div>}
          </div>
        </div>}
      </div>
    </div>
  );
};
