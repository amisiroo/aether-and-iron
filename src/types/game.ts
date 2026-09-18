export type AbilityScore = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type Attributes = Record<AbilityScore, number>;

export type CharacterClass = 'fighter' | 'rogue' | 'wizard' | 'cleric';

export type Condition = 'restrained' | 'prone' | 'downed' | 'exhausted' | 'inspired';

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollResult {
  d1: number;
  d2?: number;
  chosen: number;
  modifier: number;
  total: number;
  mode: RollMode;
  isCrit: boolean;
  isFumble: boolean;
  targetValue: number;
  success: boolean;
  reason: string;
}

export interface DeathSaves {
  successes: number;
  failures: number;
  stabilized: boolean;
  dead: boolean;
}

export type TileType = 'wall' | 'floor' | 'rubble' | 'hazard' | 'door' | 'altar' | 'chest' | 'bookshelf';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  hazardType?: 'rubble' | 'web' | 'spikes' | 'chasm';
  targetRoomId?: string;
  doorDir?: 'north' | 'south' | 'east' | 'west';
  visible: boolean;
  explored: boolean;
}

export interface Skill {
  id: string;
  name: string;
  type: 'action' | 'bonus_action' | 'passive';
  costType: 'action' | 'bonus_action' | 'none';
  range: number; // in tiles
  areaOfEffect?: number; // radius in tiles
  stat: AbilityScore;
  damageDice?: string; // e.g. "1d8", "1d10", "3d4+3"
  damageType?: 'slashing' | 'piercing' | 'fire' | 'radiant' | 'force' | 'thunder';
  saveDC?: { stat: AbilityScore };
  healDice?: string;
  description: string;
  cooldown?: number;
  currentCooldown?: number;
}

export interface Interactable {
  id: string;
  x: number;
  y: number;
  name: string;
  description: string;
  icon: string;
  check?: {
    stat: AbilityScore;
    dc: number;
    prompt: string;
  };
  onSuccess: {
    message: string;
    effect: 'inspiration' | 'heal' | 'unlock' | 'reveal_weakness' | 'disarm_trap';
  };
  onFailure: {
    message: string;
    effect: 'damage' | 'curse' | 'alert_enemies' | 'none';
    damage?: number;
  };
  resolved: boolean;
}

export type ItemType = 'potion' | 'scroll' | 'weapon' | 'armor' | 'relic';
export type EquipmentSlot = 'weapon' | 'armor' | 'relic';
export type StatModifiers = Partial<Record<AbilityScore, number>> & { ac?: number; maxHp?: number; speed?: number };

export interface ProgressionState {
  xp: number;
  level: number;
  appliedLevel?: number;
  claimedXpAwards: string[];
  skillRanks: Record<string, number>;
}

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  effect?: 'heal' | 'buff_ac' | 'inspiration' | 'damage' | 'stat';
  value: number;
  count: number;
  slot?: EquipmentSlot;
  modifiers?: StatModifiers;
  unique?: boolean;
  lootSource?: string;
}

export interface Entity {
  id: string;
  name: string;
  isPlayer: boolean;
  classType?: CharacterClass;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number; // tiles per turn
  remainingSpeed: number;
  attributes: Attributes;
  conditions: Condition[];
  skills: Skill[];
  inventory?: GameItem[];
  equipment?: Partial<Record<EquipmentSlot, GameItem>>;
  claimedLoot?: string[];
  progression?: ProgressionState;
  color: string;
  icon: string;
  deathSaves: DeathSaves;
  initiative?: number;
  hasUsedAction: boolean;
  hasUsedBonusAction: boolean;
}

export interface Room {
  id: string;
  name: string;
  subtitle: string;
  lore: string;
  width: number;
  height: number;
  layout: string[];
  interactables: Interactable[];
  enemies: Entity[];
  playerSpawn: { x: number; y: number };
  visited: boolean;
  cleared: boolean;
  exits: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  unlockRequirement?: string[];
}

export type QuestStatus = 'active' | 'completed' | 'failed';
export interface ObjectiveState { id: string; progress: number; target: number; status: 'active' | 'completed'; }
export interface QuestState { id: string; status: QuestStatus; objectives: ObjectiveState[]; rewardClaimed: boolean; }
export type ConsequenceFlags = Record<string, boolean>;

export interface ChronicleEntry {
  id: string;
  timestamp: string;
  type: 'narrative' | 'combat' | 'check' | 'hazard' | 'death_save' | 'quest' | 'choice';
  eventId?: string;
  text: string;
}

export type GamePhase = 'creation' | 'exploration' | 'combat' | 'game_over' | 'victory';
export type BossPhase = 'armored' | 'overdrive' | 'cataclysm' | 'defeated';
export interface BossEncounterState {
  bossId: 'boss_iron_warden'; hp: number; maxHp: number; phase: BossPhase;
  transitions: Array<'overdrive' | 'cataclysm'>; summonsRemaining: number;
  arenaHazards: string[]; disabledPillars: string[];
  telegraph?: { id: 'warden_cataclysm'; name: string; area: number; damageDice: string };
  turn: number; victory: { completed: boolean; rewardId: 'obsidian_heart'; summary: string };
}
