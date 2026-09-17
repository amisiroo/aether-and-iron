import { Attributes, CharacterClass } from '../types/game';

export interface ClassDefinition {
  id: CharacterClass;
  title: string;
  role: string;
  hitDie: number;
  baseAc: number;
  baseSpeed: number; // in tiles
  recommendedAttributes: Attributes;
  skillIds: string[];
  description: string;
  flavor: string;
  color: string;
  badgeColor: string;
}

export const CLASSES_DATA: Record<CharacterClass, ClassDefinition> = {
  fighter: {
    id: 'fighter',
    title: 'Iron Vanguard',
    role: 'Frontline Striker & Tank',
    hitDie: 10,
    baseAc: 16, // Chain Mail + Shield
    baseSpeed: 6,
    recommendedAttributes: {
      STR: 15,
      DEX: 12,
      CON: 14,
      INT: 8,
      WIS: 12,
      CHA: 8,
    },
    skillIds: ['melee_strike', 'second_wind'],
    description: 'Prajurit berpengalaman dengan zirah rantai berat dan pedang baja. Memiliki pertahanan fisik tangguh dan daya tahan prima.',
    flavor: '"Baja tak pernah berbohong di hadapan monster."',
    color: '#ef4444',
    badgeColor: 'bg-red-950/60 border-red-500/40 text-red-300',
  },
  rogue: {
    id: 'rogue',
    title: 'Shadow Striker',
    role: 'Scout & Critical Assassin',
    hitDie: 8,
    baseAc: 14, // Studded Leather + DEX
    baseSpeed: 7,
    recommendedAttributes: {
      STR: 10,
      DEX: 15,
      CON: 12,
      INT: 13,
      WIS: 12,
      CHA: 10,
    },
    skillIds: ['melee_strike', 'ranged_shot', 'cunning_stride'],
    description: 'Ahli menyusup yang mengeksploitasi celah lawan. Sangat lincah melompati rintangan dan mematikan saat mendapat Advantage.',
    flavor: '"Satu tebasan di kegelapan lebih berharga dari seribu teriak."',
    color: '#10b981',
    badgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
  },
  wizard: {
    id: 'wizard',
    title: 'Arcane Scholar',
    role: 'Ranged Nuker & Battlefield Controller',
    hitDie: 6,
    baseAc: 11, // Mage Armor / Robes
    baseSpeed: 6,
    recommendedAttributes: {
      STR: 8,
      DEX: 13,
      CON: 13,
      INT: 15,
      WIS: 12,
      CHA: 9,
    },
    skillIds: ['fire_bolt', 'magic_missile', 'thunderwave'],
    description: 'Sarjana sihir yang meneliti rahasia reruntuhan kuno. Menguasai Magic Missile yang tembus cover dan gelombang guntur Thunderwave.',
    flavor: '"Reruntuhan ini penuh formula yang menunggu dirapalkan."',
    color: '#8b5cf6',
    badgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
  },
  cleric: {
    id: 'cleric',
    title: 'Dawn Templar',
    role: 'Support Tank & Sacred Blaster',
    hitDie: 8,
    baseAc: 15, // Scale Mail + Shield
    baseSpeed: 6,
    recommendedAttributes: {
      STR: 13,
      DEX: 10,
      CON: 14,
      INT: 10,
      WIS: 15,
      CHA: 10,
    },
    skillIds: ['melee_strike', 'sacred_flame', 'guiding_bolt', 'cure_wounds'],
    description: 'Utusan ordo suci yang menyinari kegelapan kubur bawah tanah. Mampu menyembuhkan diri dan menembakkan Guiding Bolt pembuka advantage.',
    flavor: '"Cahaya Fajar membimbing mereka yang tersesat di kedalaman."',
    color: '#f59e0b',
    badgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
  },
};
