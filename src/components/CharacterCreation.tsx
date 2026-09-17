import React, { useState } from 'react';
import { AbilityScore, Attributes, CharacterClass, Entity } from '../types/game';
import { CLASSES_DATA, ClassDefinition } from '../data/classes';
import { SKILLS_DATABASE } from '../data/skills';
import {
  POINT_BUY_COSTS,
  MAX_POINT_BUY_POINTS,
  calculateSpentPoints,
  getAbilityModifier,
  formatModifier,
} from '../core/dnd';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  Sword,
  Crosshair,
  Wand2,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CharacterCreationProps {
  onCharacterCreated: (character: Entity) => void;
  hasSave?: boolean;
  onLoadGame?: () => void;
}

const ABILITY_INFO: Record<AbilityScore, { label: string; desc: string }> = {
  STR: { label: 'Strength', desc: 'Melee hit & damage, athletics' },
  DEX: { label: 'Dexterity', desc: 'Initiative, AC, ranged attacks' },
  CON: { label: 'Constitution', desc: 'Max HP & hazard saving throws' },
  INT: { label: 'Intelligence', desc: 'Wizard spells, ancient grimoire DC' },
  WIS: { label: 'Wisdom', desc: 'Cleric spells, perception & shrines' },
  CHA: { label: 'Charisma', desc: 'Willpower & morale resistance' },
};

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCharacterCreated,
  hasSave,
  onLoadGame,
}) => {
  const [name, setName] = useState<string>('Reza the Guild Delver');
  const [selectedClassId, setSelectedClassId] = useState<CharacterClass>('fighter');

  const selectedClass: ClassDefinition = CLASSES_DATA[selectedClassId];

  const [attributes, setAttributes] = useState<Attributes>({
    ...selectedClass.recommendedAttributes,
  });

  const spentPoints = calculateSpentPoints(attributes);
  const remainingPoints = MAX_POINT_BUY_POINTS - spentPoints;

  const handleClassChange = (classId: CharacterClass) => {
    setSelectedClassId(classId);
    setAttributes({ ...CLASSES_DATA[classId].recommendedAttributes });
  };

  const handleStatChange = (stat: AbilityScore, delta: number) => {
    const currentScore = attributes[stat];
    const newScore = currentScore + delta;

    if (newScore < 8 || newScore > 15) return;

    const currentCost = POINT_BUY_COSTS[currentScore];
    const newCost = POINT_BUY_COSTS[newScore];
    const costDiff = newCost - currentCost;

    if (delta > 0 && remainingPoints < costDiff) return;

    setAttributes((prev) => ({
      ...prev,
      [stat]: newScore,
    }));
  };

  const conMod = getAbilityModifier(attributes.CON);
  const dexMod = getAbilityModifier(attributes.DEX);
  const calculatedHp = selectedClass.hitDie + conMod;
  const calculatedAc = selectedClass.baseAc + (selectedClassId === 'rogue' ? dexMod : 0);

  const handleStartGame = () => {
    const skills = selectedClass.skillIds.map((id) => SKILLS_DATABASE[id]).filter(Boolean);

    const playerEntity: Entity = {
      id: 'player_hero',
      name: name.trim() || 'Guild Delver',
      isPlayer: true,
      classType: selectedClassId,
      x: 6,
      y: 4,
      hp: calculatedHp,
      maxHp: calculatedHp,
      ac: calculatedAc,
      speed: selectedClass.baseSpeed,
      remainingSpeed: selectedClass.baseSpeed,
      attributes,
      conditions: [],
      skills,
      inventory: [
        {
          id: 'guild_potion',
          name: 'Guild Healing Draught',
          description: 'Ramuan penyembuh resmi Guild (Heal 2d4+2 HP).',
          type: 'potion',
          effect: 'heal',
          value: 50,
          count: 2,
        },
        {
          id: 'guild_flare',
          name: 'Luminescent Flare',
          description: 'Obor magis pemberi ketenangan (Memberi status INSPIRED / Advantage).',
          type: 'scroll',
          effect: 'inspiration',
          value: 75,
          count: 1,
        },
      ],
      color: selectedClass.color,
      icon: 'Shield',
      deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false },
      hasUsedAction: false,
      hasUsedBonusAction: false,
    };

    onCharacterCreated(playerEntity);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#08090c] text-gray-200 flex flex-col p-2.5 sm:p-4 font-sans overflow-y-auto select-none">
      {/* Background Subtle Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent" />

      {/* TOP HEADER BAR (Compact Full-Width Bar) */}
      <header className="w-full bg-[#10131d] border border-[#222838] rounded-xl px-4 py-2 flex items-center justify-between gap-4 shrink-0 mb-2.5 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-400 shrink-0">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 font-cinzel tracking-wider leading-none">
              AETHER & IRON
            </h1>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
              Adventurer's Guild — Delver Registration
            </span>
          </div>
        </div>

        {/* Point Buy Pool Pill */}
        <div className="flex items-center gap-2 bg-[#090b10] border border-[#23293a] px-3 py-1 rounded-lg shrink-0">
          <span className="text-[11px] font-mono text-gray-400">Pool Poin D&D:</span>
          <span
            className={`font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded ${
              remainingPoints === 0
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : remainingPoints < 0
                ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
            }`}
          >
            {remainingPoints} / {MAX_POINT_BUY_POINTS} Pts
          </span>
        </div>
      </header>

      {/* 3-COLUMN FULL-WIDTH DASHBOARD (Fills screen without cut-off) */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 z-10">
        
        {/* ================= COLUMN 1: CLASS SELECTION (4 Cols) ================= */}
        <section className="lg:col-span-4 bg-[#10131d] border border-[#222838] rounded-xl p-3 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                1. Pilih Kelas Petualang
              </span>
              <span className="text-[10px] font-mono text-gray-400">D&D 5e SRD</span>
            </div>

            {/* 4 Class Cards in 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {(Object.keys(CLASSES_DATA) as CharacterClass[]).map((cId) => {
                const c = CLASSES_DATA[cId];
                const isSelected = selectedClassId === cId;
                return (
                  <button
                    key={cId}
                    onClick={() => handleClassChange(cId)}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-[#1a2032] shadow-md ring-1 ring-amber-400/40'
                        : 'border-[#202638] bg-[#0c0e15] hover:border-[#353f5c] hover:bg-[#131722]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {cId === 'fighter' && <Sword className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        {cId === 'rogue' && <Crosshair className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {cId === 'wizard' && <Wand2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                        {cId === 'cleric' && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span className="text-xs font-bold font-cinzel text-gray-100 truncate">
                          {c.title.split(' ')[0]}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-gray-400 truncate block font-mono">
                      Hit Die: d{c.hitDie} | AC {c.baseAc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Class Details & Starting Skills */}
            <div className="p-2.5 rounded-xl bg-[#0b0d14] border border-[#1c2233] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200 font-cinzel">
                  {selectedClass.title}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {selectedClass.role}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">
                {selectedClass.description}
              </p>
              <div className="text-[10px] text-amber-400/80 italic font-mono">
                {selectedClass.flavor}
              </div>

              {/* Skills Badges */}
              <div className="pt-1.5 border-t border-[#181d2c]">
                <span className="text-[10px] font-mono text-gray-400 block mb-1">
                  Starting Skill Loadout:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClass.skillIds.map((sId) => {
                    const skill = SKILLS_DATABASE[sId];
                    if (!skill) return null;
                    return (
                      <span
                        key={sId}
                        className="px-2 py-0.5 rounded bg-[#141824] border border-[#252d42] text-[10px] font-mono text-gray-200 flex items-center gap-1"
                        title={skill.description}
                      >
                        <span className="text-amber-400 font-bold">
                          {skill.costType === 'action' ? '[Act]' : '[Bonus]'}
                        </span>
                        <span>{skill.name}</span>
                        {skill.damageDice && <span className="text-red-400">({skill.damageDice})</span>}
                        {skill.healDice && <span className="text-emerald-400">(Heal)</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-gray-500 font-mono flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-500/70 shrink-0" />
            <span>Setiap kelas memiliki sinergi posisi medan & skill roll unik.</span>
          </div>
        </section>

        {/* ================= COLUMN 2: POINT-BUY ATTRIBUTES (4 Cols) ================= */}
        <section className="lg:col-span-4 bg-[#10131d] border border-[#222838] rounded-xl p-3 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                2. Alokasi Atribut (Point-Buy)
              </span>
              <span className="text-[10px] font-mono text-gray-400">Rentang 8 – 15</span>
            </div>

            {/* 6 Attributes Grid (Compact 2-Cols) */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(attributes) as AbilityScore[]).map((stat) => {
                const score = attributes[stat];
                const mod = getAbilityModifier(score);
                const nextCost = POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score];
                const canIncrease = score < 15 && remainingPoints >= nextCost;
                const canDecrease = score > 8;

                return (
                  <div
                    key={stat}
                    className="p-2 bg-[#0b0d14] border border-[#1d2334] rounded-lg flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-gray-100 font-mono">{stat}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {formatModifier(mod)} Mod
                      </span>
                    </div>

                    <p className="text-[9.5px] text-gray-400 truncate mb-1">
                      {ABILITY_INFO[stat].desc}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#181d2a]">
                      <span className="text-base font-black font-mono text-white">{score}</span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={!canDecrease}
                          onClick={() => handleStatChange(stat, -1)}
                          className="w-5 h-5 rounded bg-[#141824] border border-[#242b3e] text-gray-300 font-bold hover:bg-[#1f273b] disabled:opacity-20 disabled:cursor-not-allowed transition flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <button
                          disabled={!canIncrease}
                          onClick={() => handleStatChange(stat, 1)}
                          className="w-5 h-5 rounded bg-[#141824] border border-[#242b3e] text-amber-300 font-bold hover:bg-[#1f273b] disabled:opacity-20 disabled:cursor-not-allowed transition flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 p-2 rounded-lg bg-[#0b0d14] border border-[#1b2130] text-[10px] font-mono text-gray-400 leading-tight">
            💡 <b>Catatan:</b> Modifier menambah roll d20 serangan, damage, saving throw hazard, & check interaksi.
          </div>
        </section>

        {/* ================= COLUMN 3: SHEET, INVENTORY & EMBARK (4 Cols) ================= */}
        <section className="lg:col-span-4 bg-[#10131d] border border-[#222838] rounded-xl p-3 flex flex-col justify-between shadow-lg">
          <div className="space-y-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              3. Profil & Perlengkapan Petualang
            </span>

            {/* Hero Alias Input */}
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">
                Nama Petualang (Alias)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama petualang..."
                className="w-full bg-[#090b10] border border-[#242b3d] focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>

            {/* Derived Combat Stats Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-[#0b0d14] border border-red-500/30 text-center">
                <div className="flex items-center justify-center gap-1 text-red-400 text-[10px] font-mono mb-0.5">
                  <Heart className="w-3 h-3" /> Max HP
                </div>
                <span className="text-lg font-black font-mono text-red-300">{calculatedHp}</span>
              </div>

              <div className="p-2 rounded-xl bg-[#0b0d14] border border-blue-500/30 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 text-[10px] font-mono mb-0.5">
                  <Shield className="w-3 h-3" /> Armor Class
                </div>
                <span className="text-lg font-black font-mono text-blue-300">{calculatedAc}</span>
              </div>

              <div className="p-2 rounded-xl bg-[#0b0d14] border border-emerald-500/30 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-mono mb-0.5">
                  <Zap className="w-3 h-3" /> Speed
                </div>
                <span className="text-lg font-black font-mono text-emerald-300">
                  {selectedClass.baseSpeed}t
                </span>
              </div>
            </div>

            {/* Starter Kit Items */}
            <div className="p-2 rounded-xl bg-[#0b0d14] border border-[#1c2233] space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">
                Guild Starter Kit:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                <div className="flex items-center justify-between bg-[#111420] p-1.5 rounded border border-[#20273a]">
                  <span className="text-gray-300">🧪 Heal Draught</span>
                  <span className="text-amber-400 font-bold">x2</span>
                </div>
                <div className="flex items-center justify-between bg-[#111420] p-1.5 rounded border border-[#20273a]">
                  <span className="text-gray-300">📜 Flare</span>
                  <span className="text-amber-400 font-bold">x1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Launch Buttons */}
          <div className="pt-2.5 border-t border-[#1c2233] space-y-2 mt-2">
            <button
              onClick={handleStartGame}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-[#090b10] font-black font-cinzel text-sm tracking-wider shadow-lg shadow-amber-950/60 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              EMBARK INTO THE SUNKEN RELIQUARY
            </button>

            {hasSave && onLoadGame && (
              <button
                onClick={onLoadGame}
                className="w-full py-2 rounded-xl bg-[#141926] hover:bg-[#1e2538] border border-amber-500/40 text-amber-300 font-mono text-xs font-bold tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                CONTINUE PREVIOUS EXPEDITION
              </button>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
