import React from 'react';
import { RollResult } from '../types/game';
import { Sparkles, Skull, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

interface DiceModalProps {
  roll: RollResult;
  onClose: () => void;
}

export const DiceModal: React.FC<DiceModalProps> = ({ roll, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121520] border border-[#2e354d] rounded-2xl shadow-2xl p-6 relative overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25 ${
            roll.isCrit
              ? 'bg-amber-400'
              : roll.success
              ? 'bg-emerald-500'
              : roll.isFumble
              ? 'bg-red-600'
              : 'bg-red-500'
          }`}
        />

        {/* Reason / Title */}
        <span className="text-xs font-mono uppercase tracking-widest text-gray-400 block mb-1">
          D&D 5e d20 Resolution
        </span>
        <h3 className="text-lg font-bold text-gray-100 font-cinzel mb-4 px-2">
          {roll.reason}
        </h3>

        {/* Mode Pill */}
        <div className="mb-6 flex justify-center">
          {roll.mode === 'advantage' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              ADVANTAGE (HIGHEST KEPT)
            </span>
          )}
          {roll.mode === 'disadvantage' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 border border-red-500/50 text-red-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              DISADVANTAGE (LOWEST KEPT)
            </span>
          )}
          {roll.mode === 'normal' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#1b2030] border border-[#303852] text-gray-300">
              NORMAL ROLL
            </span>
          )}
        </div>

        {/* Dice Visual Presentation */}
        <div className="flex items-center justify-center gap-6 my-6">
          {roll.mode === 'normal' ? (
            <div
              className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-300 transform scale-105 ${
                roll.isCrit
                  ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-950/40 text-amber-200'
                  : roll.isFumble
                  ? 'border-red-600 bg-gradient-to-b from-red-600/20 to-red-950/40 text-red-300'
                  : roll.success
                  ? 'border-emerald-500 bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 text-emerald-200'
                  : 'border-red-500 bg-gradient-to-b from-red-500/20 to-red-950/40 text-red-200'
              }`}
            >
              <span className="text-[10px] font-mono text-gray-400 uppercase">d20</span>
              <span className="text-4xl font-black font-mono tracking-tight">{roll.d1}</span>
            </div>
          ) : (
            <>
              {/* Die 1 */}
              <div
                className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                  roll.chosen === roll.d1
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/30 scale-105'
                    : 'border-gray-700 bg-black/40 text-gray-500 opacity-40 line-through'
                }`}
              >
                <span className="text-[9px] font-mono uppercase">Die 1</span>
                <span className="text-3xl font-bold font-mono">{roll.d1}</span>
              </div>

              {/* Die 2 */}
              {roll.d2 !== undefined && (
                <div
                  className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                    roll.chosen === roll.d2
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/30 scale-105'
                      : 'border-gray-700 bg-black/40 text-gray-500 opacity-40 line-through'
                  }`}
                >
                  <span className="text-[9px] font-mono uppercase">Die 2</span>
                  <span className="text-3xl font-bold font-mono">{roll.d2}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Calculation Formula */}
        <div className="bg-[#0b0d14] rounded-xl p-3 border border-[#202538] font-mono text-sm mb-6 inline-block w-full text-center">
          <span className="text-gray-300 font-bold">{roll.chosen}</span>
          <span className="text-gray-500 mx-1.5">
            {roll.modifier >= 0 ? `+ ${roll.modifier}` : `- ${Math.abs(roll.modifier)}`} (Mod)
          </span>
          <span className="text-gray-400 font-bold">=</span>
          <span
            className={`font-black text-lg mx-2 ${
              roll.success ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {roll.total}
          </span>
          <span className="text-gray-500 text-xs">
            vs Target {roll.targetValue}
          </span>
        </div>

        {/* Outcome Verdict */}
        <div className="mb-6">
          {roll.isCrit ? (
            <div className="flex items-center justify-center gap-2 text-amber-300 font-cinzel font-black text-xl">
              <Sparkles className="w-5 h-5 text-amber-400" />
              CRITICAL SUCCESS (NATURAL 20)!
            </div>
          ) : roll.isFumble ? (
            <div className="flex items-center justify-center gap-2 text-red-400 font-cinzel font-black text-xl">
              <Skull className="w-5 h-5" />
              CRITICAL FUMBLE (NATURAL 1)!
            </div>
          ) : roll.success ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-cinzel font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              SUCCESSFUL HIT / CHECK!
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-400 font-cinzel font-bold text-lg">
              <XCircle className="w-5 h-5" />
              MISSED / FAILED CHECK!
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-950 font-bold font-mono tracking-wider transition shadow-lg"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};
