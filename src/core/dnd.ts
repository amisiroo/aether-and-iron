import { Attributes, RollMode, RollResult, DeathSaves, Entity, Tile } from '../types/game';

// D&D 5e Standard Point Buy costs for scores 8..15
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const MAX_POINT_BUY_POINTS = 27;

/**
 * Bresenham's line algorithm to check for intervening obstacle/cover in 2D grid
 * Returns true if line of sight crosses rubble (~), bookshelf (B), altar (A/C/R), or wall (#)
 */
export function checkInterveningCover(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  layout: string[]
): boolean {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    if (cx === x1 && cy === y1) break;

    // Check intermediate tiles
    if (cx !== x0 || cy !== y0) {
      if (cy >= 0 && cy < layout.length && cx >= 0 && cx < layout[0].length) {
        const char = layout[cy][cx];
        if (char === '~' || char === 'B' || char === 'A' || char === 'C' || char === '#') {
          return true;
        }
      }
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }

  return false;
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Calculates total point-buy points spent for given attributes
 */
export function calculateSpentPoints(attrs: Attributes): number {
  return Object.values(attrs).reduce((sum, score) => sum + (POINT_BUY_COSTS[score] ?? 0), 0);
}

/**
 * Roll a raw die between 1 and sides
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Evaluates Advantage / Disadvantage based on tactical environment and conditions
 */
export function evaluateCombatAdvantage(
  attacker: Entity,
  target: Entity,
  skillRange: number,
  attackerTile: Tile | null,
  isTargetAdjacentToAttacker: boolean,
  hasCoverBetween: boolean
): { mode: RollMode; reasons: string[] } {
  const advantageReasons: string[] = [];
  const disadvantageReasons: string[] = [];

  // 1. Inspired Condition (Guild Inspiration)
  if (attacker.conditions.includes('inspired')) {
    advantageReasons.push('Guild Inspiration (+Advantage)');
  }

  // 2. Attacker on Rubble / Difficult Terrain
  if (attackerTile && attackerTile.type === 'rubble') {
    disadvantageReasons.push('Unstable Rubble (-Disadvantage)');
  }

  // 3. Attacker Restrained by Web / Trap
  if (attacker.conditions.includes('restrained')) {
    disadvantageReasons.push('Entangled / Restrained (-Disadvantage)');
  }

  // 4. Close Quarters Ranged Attack
  if (skillRange > 1 && isTargetAdjacentToAttacker) {
    disadvantageReasons.push('Point-blank Ranged Penalty (-Disadvantage)');
  }

  // 5. Half-Cover Obstacle in Line of Sight
  if (hasCoverBetween && skillRange > 1) {
    disadvantageReasons.push('Partial Cover Obstacle (-Disadvantage)');
  }

  // 6. Target is Downed and Melee Attacker is adjacent (Merciless strike)
  if (target.conditions.includes('downed') && isTargetAdjacentToAttacker) {
    advantageReasons.push('Target Downed / Helpless (+Advantage)');
  }

  // Cancellation rule
  if (advantageReasons.length > 0 && disadvantageReasons.length > 0) {
    return {
      mode: 'normal',
      reasons: [
        `Cancelled: [${advantageReasons.join(', ')}] vs [${disadvantageReasons.join(', ')}]`
      ]
    };
  }

  if (advantageReasons.length > 0) {
    return { mode: 'advantage', reasons: advantageReasons };
  }

  if (disadvantageReasons.length > 0) {
    return { mode: 'disadvantage', reasons: disadvantageReasons };
  }

  return { mode: 'normal', reasons: ['Normal footing and line of sight'] };
}

/**
 * Core D&D 5e d20 Roll with Advantage / Disadvantage
 */
export function rollD20(
  modifier: number,
  mode: RollMode = 'normal',
  targetValue: number = 10,
  reason: string = 'Check'
): RollResult {
  const d1 = rollDie(20);

  if (mode === 'normal') {
    const total = d1 + modifier;
    const isCrit = d1 === 20;
    const isFumble = d1 === 1;
    const success = isCrit ? true : isFumble ? false : total >= targetValue;

    return {
      d1,
      chosen: d1,
      modifier,
      total,
      mode,
      isCrit,
      isFumble,
      targetValue,
      success,
      reason,
    };
  }

  const d2 = rollDie(20);
  const chosen = mode === 'advantage' ? Math.max(d1, d2) : Math.min(d1, d2);
  const total = chosen + modifier;
  const isCrit = chosen === 20;
  const isFumble = chosen === 1;
  const success = isCrit ? true : isFumble ? false : total >= targetValue;

  return {
    d1,
    d2,
    chosen,
    modifier,
    total,
    mode,
    isCrit,
    isFumble,
    targetValue,
    success,
    reason,
  };
}

/**
 * Parses and rolls damage strings (e.g. "1d8+3", "2d6", "1d10")
 */
export function rollDamageString(formula: string, modifierBonus: number = 0, isCrit: boolean = false): { total: number; rolls: number[]; details: string } {
  // Regex matches: "1d8", "2d6+2", "1d10"
  const match = formula.trim().match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/);
  if (!match) {
    return { total: Math.max(1, 1 + modifierBonus), rolls: [1], details: `1 + ${modifierBonus}` };
  }

  let count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const sign = match[3] === '-' ? -1 : 1;
  const baseBonus = match[4] ? parseInt(match[4], 10) * sign : 0;

  // Crits in D&D double the dice count!
  if (isCrit) {
    count *= 2;
  }

  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const r = rollDie(sides);
    rolls.push(r);
    sum += r;
  }

  const total = Math.max(1, sum + baseBonus + modifierBonus);
  const critLabel = isCrit ? ' [CRIT 2x DICE!]' : '';
  const details = `${count}d${sides}${critLabel} (${rolls.join('+')}) + mod(${baseBonus + modifierBonus}) = ${total}`;

  return { total, rolls, details };
}

/**
 * Evaluates Death Saving Throw (D&D 5e Standard + Merciless AI)
 */
export function rollDeathSave(currentSaves: DeathSaves): {
  updated: DeathSaves;
  roll: number;
  message: string;
  revivedWithHp?: number;
} {
  const d = rollDie(20);
  const updated = { ...currentSaves };

  if (d === 20) {
    // Natural 20: Regain 1 HP instantly!
    updated.stabilized = true;
    return {
      updated,
      roll: d,
      message: 'NATURAL 20! A surge of adrenaline! You rise with 1 HP!',
      revivedWithHp: 1,
    };
  }

  if (d === 1) {
    // Natural 1: Counts as 2 failures!
    updated.failures += 2;
    if (updated.failures >= 3) {
      updated.dead = true;
    }
    return {
      updated,
      roll: d,
      message: 'NATURAL 1! Fatal complication: 2 Death Save Failures suffered!',
    };
  }

  if (d >= 10) {
    updated.successes += 1;
    if (updated.successes >= 3) {
      updated.stabilized = true;
      return {
        updated,
        roll: d,
        message: '🎉 3 DEATH SAVE SUCCESSES! STABILIZED! Tekad bertahan hidup membangkitkanmu dengan 1 HP!',
        revivedWithHp: 1,
      };
    }
    return {
      updated,
      roll: d,
      message: `Death Save SUCCESS (${d} >= 10). [${updated.successes}/3 Successes]`,
    };
  } else {
    updated.failures += 1;
    if (updated.failures >= 3) {
      updated.dead = true;
    }
    return {
      updated,
      roll: d,
      message: `Death Save FAILED (${d} < 10). [${updated.failures}/3 Failures]`,
    };
  }
}
