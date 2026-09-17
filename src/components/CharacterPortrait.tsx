import React from 'react';
import { CharacterClass } from '../types/game';

interface PortraitProps {
  classType?: CharacterClass | string;
  className?: string;
  size?: number;
}

/**
 * High-definition vector fantasy portraits for classes and monsters.
 * Sharp at any resolution, zero external asset dependencies.
 */
export const CharacterPortrait: React.FC<PortraitProps> = ({
  classType = 'fighter',
  className = '',
  size = 64,
}) => {
  // --- FIGHTER: Iron Vanguard ---
  if (classType === 'fighter') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="fighterGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#180404" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="steelMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#475569" />
            <stop offset="70%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="goldFiligree" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="47" fill="url(#fighterGlow)" stroke="url(#goldFiligree)" strokeWidth="3" />
        <path d="M 22 88 Q 50 72 78 88 L 84 96 Q 50 82 16 96 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        <path d="M 16 92 L 32 74 L 40 82 L 20 98 Z" fill="url(#steelMetal)" stroke="#0f172a" />
        <path d="M 84 92 L 68 74 L 60 82 L 80 98 Z" fill="url(#steelMetal)" stroke="#0f172a" />
        <path d="M 36 72 Q 50 80 64 72 L 60 84 Q 50 90 40 84 Z" fill="#334155" stroke="#1e293b" />
        <path d="M 32 46 C 30 20, 70 20, 68 46 L 70 70 C 60 76, 40 76, 30 70 Z" fill="url(#steelMetal)" stroke="#0f172a" strokeWidth="2" />
        <path d="M 47 16 C 47 10, 53 10, 53 16 L 53 48 C 50 50, 50 50, 47 48 Z" fill="url(#goldFiligree)" stroke="#713f12" />
        <path d="M 34 46 L 50 52 L 66 46 L 65 67 L 50 75 L 35 67 Z" fill="#1e293b" stroke="url(#goldFiligree)" strokeWidth="1" />
        <path d="M 38 52 L 47 54 L 47 51 L 39 49 Z" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
        <path d="M 62 52 L 53 54 L 53 51 L 61 49 Z" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
        <circle cx="45" cy="64" r="1.5" fill="#090d16" />
        <circle cx="50" cy="65" r="1.5" fill="#090d16" />
        <circle cx="55" cy="64" r="1.5" fill="#090d16" />
        <circle cx="47" cy="69" r="1.5" fill="#090d16" />
        <circle cx="53" cy="69" r="1.5" fill="#090d16" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(253,224,71,0.25)" strokeWidth="1" />
      </svg>
    );
  }

  // --- ROGUE: Shadow Striker ---
  if (classType === 'rogue') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="rogueGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#021f17" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="darkLeather" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="emeraldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="47" fill="url(#rogueGlow)" stroke="url(#emeraldEdge)" strokeWidth="3" />
        <path d="M 20 90 Q 50 78 80 90 L 86 98 L 14 98 Z" fill="url(#darkLeather)" stroke="#047857" />
        <path d="M 24 55 C 20 25, 35 14, 50 14 C 65 14, 80 25, 76 55 C 80 75, 68 85, 50 86 C 32 85, 20 75, 24 55 Z" fill="url(#darkLeather)" stroke="#047857" strokeWidth="1.5" />
        <path d="M 32 46 C 32 30, 68 30, 68 46 C 68 64, 58 72, 50 72 C 42 72, 32 64, 32 46 Z" fill="#000000" />
        <path d="M 35 56 Q 50 64 65 56 L 62 72 Q 50 78 38 72 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <ellipse cx="42" cy="50" rx="4.5" ry="2" fill="#10b981" filter="drop-shadow(0 0 5px #34d399)" />
        <circle cx="42" cy="50" r="1.2" fill="#ffffff" />
        <ellipse cx="58" cy="50" rx="4.5" ry="2" fill="#10b981" filter="drop-shadow(0 0 5px #34d399)" />
        <circle cx="58" cy="50" r="1.2" fill="#ffffff" />
        <path d="M 26 50 C 22 28, 38 18, 50 18 C 62 18, 78 28, 74 50" fill="none" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth="1" />
      </svg>
    );
  }

  // --- WIZARD: Arcane Scholar ---
  if (classType === 'wizard') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="wizGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e0c3a" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="robePurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="60%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#1e0c3a" />
          </linearGradient>
          <linearGradient id="arcaneRune" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="47" fill="url(#wizGlow)" stroke="url(#arcaneRune)" strokeWidth="3" />
        <path d="M 22 92 Q 50 78 78 92 L 86 98 L 14 98 Z" fill="url(#robePurple)" stroke="#9333ea" />
        <path d="M 50 10 C 65 18, 76 34, 76 60 C 76 78, 64 86, 50 86 C 36 86, 24 78, 24 60 C 24 34, 35 18, 50 10 Z" fill="url(#robePurple)" stroke="#a855f7" strokeWidth="1.5" />
        <circle cx="50" cy="34" r="3.5" fill="#c084fc" filter="drop-shadow(0 0 6px #c084fc)" />
        <path d="M 50 26 L 50 42 M 42 34 L 58 34" stroke="#e9d5ff" strokeWidth="1.2" />
        <path d="M 33 46 C 33 36, 67 36, 67 46 C 67 66, 59 74, 50 74 C 41 74, 33 66, 33 46 Z" fill="#130722" />
        <circle cx="43" cy="52" r="3" fill="#e9d5ff" filter="drop-shadow(0 0 5px #c084fc)" />
        <circle cx="43" cy="52" r="1.2" fill="#ffffff" />
        <circle cx="57" cy="52" r="3" fill="#e9d5ff" filter="drop-shadow(0 0 5px #c084fc)" />
        <circle cx="57" cy="52" r="1.2" fill="#ffffff" />
        <circle cx="28" cy="38" r="1.5" fill="#c084fc" opacity="0.8" />
        <circle cx="72" cy="42" r="1.5" fill="#c084fc" opacity="0.8" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(192,132,252,0.3)" strokeWidth="1" />
      </svg>
    );
  }

  // --- CLERIC: Dawn Templar ---
  if (classType === 'cleric') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="clericGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#291203" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="solarGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="47" fill="url(#clericGlow)" stroke="url(#solarGold)" strokeWidth="3" />
        <path d="M 50 6 L 50 18 M 22 22 L 31 31 M 78 22 L 69 31 M 8 50 L 20 50 M 92 50 L 80 50" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        <path d="M 20 92 Q 50 82 80 92 L 86 98 L 14 98 Z" fill="#451a03" stroke="#d97706" />
        <path d="M 40 76 L 60 76 L 64 98 L 36 98 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
        <path d="M 50 82 L 50 94 M 45 86 L 55 86" stroke="#fef08a" strokeWidth="1.5" />
        <path d="M 30 50 C 30 24, 70 24, 70 50 C 70 70, 62 78, 50 78 C 38 78, 30 70, 30 50 Z" fill="#292524" stroke="#78716c" strokeWidth="1.5" />
        <path d="M 28 42 L 38 32 L 50 24 L 62 32 L 72 42 L 68 47 L 50 38 L 32 47 Z" fill="url(#solarGold)" stroke="#78350f" strokeWidth="1" filter="drop-shadow(0 0 4px #f59e0b)" />
        <circle cx="50" cy="31" r="2.5" fill="#fef08a" />
        <ellipse cx="42" cy="52" rx="3.5" ry="2" fill="#fbbf24" filter="drop-shadow(0 0 4px #fbbf24)" />
        <circle cx="42" cy="52" r="1" fill="#ffffff" />
        <ellipse cx="58" cy="52" rx="3.5" ry="2" fill="#fbbf24" filter="drop-shadow(0 0 4px #fbbf24)" />
        <circle cx="58" cy="52" r="1" fill="#ffffff" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(254,240,138,0.3)" strokeWidth="1" />
      </svg>
    );
  }

  // --- BOSS: The Iron Warden ---
  if (classType === 'boss' || classType.includes('boss') || classType.includes('warden')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bossGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#450a0a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="47" fill="url(#bossGlow)" stroke="#dc2626" strokeWidth="3" />
        {/* Massive Horns */}
        <path d="M 32 30 C 18 10, 10 32, 14 48 C 22 42, 28 38, 32 30 Z" fill="#7f1d1d" stroke="#ef4444" />
        <path d="M 68 30 C 82 10, 90 32, 86 48 C 78 42, 72 38, 68 30 Z" fill="#7f1d1d" stroke="#ef4444" />
        {/* Iron Skull Plate */}
        <path d="M 28 42 C 28 20, 72 20, 72 42 L 75 72 C 60 84, 40 84, 25 72 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
        {/* Triple Fiery Eye Slits */}
        <ellipse cx="38" cy="50" rx="4" ry="1.5" fill="#f87171" filter="drop-shadow(0 0 5px #ef4444)" />
        <ellipse cx="50" cy="46" rx="3.5" ry="1.5" fill="#f87171" filter="drop-shadow(0 0 5px #ef4444)" />
        <ellipse cx="62" cy="50" rx="4" ry="1.5" fill="#f87171" filter="drop-shadow(0 0 5px #ef4444)" />
        {/* Iron Teeth / Jaw */}
        <path d="M 35 68 L 40 76 L 45 68 L 50 76 L 55 68 L 60 76 L 65 68" stroke="#dc2626" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  // --- MONSTER: Skeletal Archer / Crypt Monster default ---
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="47" fill="#18181b" stroke="#71717a" strokeWidth="3" />
      {/* Skull Outline */}
      <path d="M 30 45 C 30 25, 70 25, 70 45 C 70 60, 62 66, 62 76 L 38 76 C 38 66, 30 60, 30 45 Z" fill="#e4e4e7" stroke="#27272a" strokeWidth="2" />
      {/* Eye Cavities with Crimson Embers */}
      <ellipse cx="42" cy="48" rx="6" ry="7" fill="#09090b" />
      <circle cx="43" cy="48" r="2" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
      <ellipse cx="58" cy="48" rx="6" ry="7" fill="#09090b" />
      <circle cx="57" cy="48" r="2" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
      {/* Nose Hole */}
      <path d="M 50 56 L 47 62 L 53 62 Z" fill="#09090b" />
      {/* Teeth */}
      <path d="M 42 70 L 42 76 M 46 70 L 46 76 M 50 70 L 50 76 M 54 70 L 54 76 M 58 70 L 58 76" stroke="#09090b" strokeWidth="1.5" />
    </svg>
  );
};
