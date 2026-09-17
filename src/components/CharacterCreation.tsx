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
import { Shield, Heart, Zap, Sparkles, Sword, Crosshair, Wand2, Compass } from 'lucide-react';

interface CharacterCreationProps {
  onCharacterCreated: (character: Entity) => void;
  hasSave?: boolean;
  onLoadGame?: () => void;
}

const ABILITY_DESCRIPTIONS: Record<AbilityScore, string> = {
  STR: 'Kekuatan fisik & daya pukul melee.',
  DEX: 'Kelincahan, inisiatif, Armor Class, & serangan panah.',
  CON: 'Daya tahan tubuh & total Hit Points (HP).',
  INT: 'Ketajaman logika & kekuatan spell Wizard.',
  WIS: 'Persepsi, kepekaan lingkungan, & mantra Cleric.',
  CHA: 'Karisma & kekuatan pengaruh pribadi.',
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
    <div className="min-h-screen bg-[#08090c] text-gray-200 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      {/* Background Ambience / Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent" />

      <div className="w-full max-w-5xl bg-[#121520] border border-[#2a2f42] rounded-2xl shadow-2xl p-6 md:p-10 relative z-10">
        {/* Header Title */}
        <div className="text-center mb-8 border-b border-[#23283b] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            Adventurer's Guild — Delver Registration
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 tracking-wide font-cinzel">
            AETHER & IRON
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
            Daftarkan identitas petualangmu sebelum menyelam ke dalam reruntuhan kuno <i>The Sunken Reliquary</i>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Class Selection & Name (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                Nama Petualang (Adventurer Alias)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d0f17] border border-[#2a2f42] rounded-lg px-4 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                placeholder="Masukkan nama petualang..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                Pilih Kelas & Peran (D&D 5e Archetype)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(CLASSES_DATA) as CharacterClass[]).map((cId) => {
                  const c = CLASSES_DATA[cId];
                  const isSelected = selectedClassId === cId;
                  return (
                    <button
                      key={cId}
                      onClick={() => handleClassChange(cId)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-gradient-to-b from-amber-500/10 to-amber-950/20 shadow-lg ring-1 ring-amber-500/30'
                          : 'border-[#222738] bg-[#0d0f17] hover:border-[#38405c] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-gray-100 font-cinzel">{c.title}</span>
                        {cId === 'fighter' && <Sword className="w-4 h-4 text-red-400" />}
                        {cId === 'rogue' && <Crosshair className="w-4 h-4 text-emerald-400" />}
                        {cId === 'wizard' && <Wand2 className="w-4 h-4 text-purple-400" />}
                        {cId === 'cleric' && <Sparkles className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="text-[11px] text-gray-400">{c.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Class Details Card */}
            <div className="p-4 rounded-xl bg-[#0a0c13] border border-[#222738] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  {selectedClass.title}
                </span>
                <span className="text-xs text-gray-400 italic">{selectedClass.flavor}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{selectedClass.description}</p>

              {/* Skills Preview */}
              <div className="pt-2 border-t border-[#1d2232]">
                <span className="text-[11px] font-mono text-gray-400 block mb-1.5">Starting Skills:</span>
                <div className="space-y-1.5">
                  {selectedClass.skillIds.map((sId) => {
                    const skill = SKILLS_DATABASE[sId];
                    if (!skill) return null;
                    return (
                      <div key={sId} className="flex items-start gap-2 bg-[#121520] p-2 rounded border border-[#1f2436]">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-gray-200">{skill.name}</span>
                          <span className="text-[11px] text-gray-400 ml-1.5">
                            {skill.damageDice ? `[${skill.damageDice}]` : ''} {skill.healDice ? `[Heal ${skill.healDice}]` : ''}
                          </span>
                          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{skill.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Point Buy Attributes & Derived Stats (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Point Buy Pool Status */}
            <div className="flex items-center justify-between p-3.5 bg-[#0d0f17] border border-[#2a2f42] rounded-xl">
              <div>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  D&D 5e Point-Buy Pool
                </span>
                <span className="text-xs text-gray-500">Rentang nilai: 8 - 15 poin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Sisa Poin:</span>
                <span
                  className={`font-mono font-extrabold text-xl px-2.5 py-0.5 rounded ${
                    remainingPoints === 0
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      : remainingPoints < 0
                      ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {remainingPoints} / {MAX_POINT_BUY_POINTS}
                </span>
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityScore[]).map((stat) => {
                const score = attributes[stat];
                const mod = getAbilityModifier(score);
                const nextCost = POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score];
                const canIncrease = score < 15 && remainingPoints >= nextCost;
                const canDecrease = score > 8;

                return (
                  <div
                    key={stat}
                    className="p-3 bg-[#0d0f17] border border-[#1f2436] rounded-xl flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-100 font-mono">{stat}</span>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                        {formatModifier(mod)} Mod
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mb-2">{ABILITY_DESCRIPTIONS[stat]}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1a1e2c]">
                      <span className="text-lg font-bold font-mono text-white">{score}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={!canDecrease}
                          onClick={() => handleStatChange(stat, -1)}
                          className="w-7 h-7 rounded bg-[#161a26] border border-[#2a2f42] text-gray-200 font-bold hover:bg-[#252c3f] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <button
                          disabled={!canIncrease}
                          onClick={() => handleStatChange(stat, 1)}
                          className="w-7 h-7 rounded bg-[#161a26] border border-[#2a2f42] text-gray-200 font-bold hover:bg-[#252c3f] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Derived Combat Stats Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#0a0c13] border border-[#222738]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Max HP</span>
                  <span className="text-lg font-bold font-mono text-red-300">{calculatedHp}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Armor Class (AC)</span>
                  <span className="text-lg font-bold font-mono text-blue-300">{calculatedAc}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Speed (Grid)</span>
                  <span className="text-lg font-bold font-mono text-emerald-300">{selectedClass.baseSpeed} Tiles</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-3">
              <button
                onClick={handleStartGame}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-[#090b10] font-black font-cinzel text-lg tracking-wider shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                EMBARK INTO THE SUNKEN RELIQUARY
              </button>

              {hasSave && onLoadGame && (
                <button
                  onClick={onLoadGame}
                  className="w-full py-3 rounded-xl bg-[#1a2030] hover:bg-[#232b40] border border-amber-500/40 text-amber-300 font-mono text-sm tracking-wider transition flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  CONTINUE PREVIOUS EXPEDITION (LOAD CHECKPOINT)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
