import { MonsterAttack, MapToken } from '../types';

export interface ScaledMapToken extends MapToken {
  baseMaxHp?: number;
  scaledPartySize?: number;
  attacks?: MonsterAttack[];
  monsterId?: string;
}

export interface ScalingFactors {
  hpMultiplier: number;
  attackBonusOffset: number;
  damageBonusOffset: number;
}

/**
 * Clamps party size to 1 <= N <= 4 and returns scaling factors.
 * hpMultiplier: 1.0 + (N - 1) * 0.5 (1.0x, 1.5x, 2.0x, 2.5x)
 * attackBonusOffset: +(N - 1) (+0, +1, +2, +3)
 * damageBonusOffset: +(N - 1) * 2 (+0, +2, +4, +6)
 */
export function getScalingFactors(partySize: number): ScalingFactors {
  const clampedSize = Math.max(1, Math.min(4, Math.floor(partySize) || 1));
  const offset = clampedSize - 1;
  return {
    hpMultiplier: 1.0 + offset * 0.5,
    attackBonusOffset: offset,
    damageBonusOffset: offset * 2,
  };
}

/**
 * Scales monster Max HP using Math.round(baseHp * hpMultiplier).
 */
export function scaleMonsterHp(baseHp: number, partySize: number): number {
  if (baseHp <= 0) return 0;
  const { hpMultiplier } = getScalingFactors(partySize);
  return Math.round(baseHp * hpMultiplier);
}

/**
 * Adjusts flat damage bonus inside a damage formula string (e.g. '2d8 + 4' -> '2d8 + 6').
 */
export function adjustDamageFormula(damage: string, flatBonusOffset: number): string {
  if (!damage || flatBonusOffset === 0) return damage;

  const plusRegex = /^([0-9]+d[0-9]+(?:\s*[+-]\s*[a-zA-Z0-9/]+)*?)\s*\+\s*([0-9]+)(.*)$/;
  const match = damage.match(plusRegex);

  if (match) {
    const dicePart = match[1];
    const currentBonus = parseInt(match[2], 10);
    const remainder = match[3];
    return `${dicePart} + ${currentBonus + flatBonusOffset}${remainder}`;
  }

  const diceOnlyRegex = /^([0-9]+d[0-9]+)(.*)$/;
  const diceMatch = damage.match(diceOnlyRegex);
  if (diceMatch) {
    return `${diceMatch[1]} + ${flatBonusOffset}${diceMatch[2]}`;
  }

  return damage;
}

/**
 * Scales a monster attack: adds attackBonusOffset to to-hit bonus and adjusts damage formula.
 */
export function scaleMonsterAttack(attack: MonsterAttack, partySize: number): MonsterAttack {
  const { attackBonusOffset, damageBonusOffset } = getScalingFactors(partySize);
  return {
    ...attack,
    bonus: attack.bonus + attackBonusOffset,
    damage: adjustDamageFormula(attack.damage, damageBonusOffset),
  };
}

/**
 * Rescales active monster tokens when party size changes:
 * - Dead tokens (0 HP) remain dead (0 HP).
 * - Wounded tokens preserve their health percentage: Math.round((currentHp / oldMaxHp) * newMaxHp).
 * - Tokens marked with isMonster === false are left completely untouched.
 */
export function rescaleMonsterTokens(tokens: ScaledMapToken[], newPartySize: number): ScaledMapToken[] {
  const clampedSize = Math.max(1, Math.min(4, Math.floor(newPartySize) || 1));

  return tokens.map((token) => {
    // Only rescale monster tokens
    if (!token.isMonster) {
      return token;
    }

    const baseMaxHp = token.baseMaxHp ?? token.maxHp;
    const oldMaxHp = token.maxHp;
    const newMaxHp = scaleMonsterHp(baseMaxHp, clampedSize);

    let newCurrentHp = token.currentHp;
    if (token.currentHp <= 0) {
      newCurrentHp = 0; // dead remain dead
    } else if (oldMaxHp > 0) {
      const hpPercentage = token.currentHp / oldMaxHp;
      newCurrentHp = Math.round(hpPercentage * newMaxHp);
    } else {
      newCurrentHp = newMaxHp;
    }

    const scaledAttacks = token.attacks?.map((att) => scaleMonsterAttack(att, clampedSize));

    return {
      ...token,
      baseMaxHp,
      maxHp: newMaxHp,
      currentHp: newCurrentHp,
      scaledPartySize: clampedSize,
      ...(scaledAttacks ? { attacks: scaledAttacks } : {}),
    };
  });
}

/**
 * Derives active party size (1 to 4) based on character assignments and connected peers.
 */
export function getActivePartySize(
  characterAssignments: Record<string, { isLocked?: boolean; claimedByPeerId?: string }>,
  connectedPeers: Array<{ isObserver?: boolean; id?: string }>,
  isConnected: boolean,
  gmPlaysWitcher: boolean = true
): number {
  const lockedWitchers = Object.values(characterAssignments).filter((a) => a.isLocked).length;
  const nonObserverPeers = connectedPeers.filter((p) => !p.isObserver).length;
  const gmCount = gmPlaysWitcher ? 1 : 0;

  let activeCount = Math.max(lockedWitchers, gmCount + nonObserverPeers);
  if (!isConnected && lockedWitchers === 0) {
    activeCount = 1; // baseline solo play
  }

  return Math.max(1, Math.min(4, activeCount || 1));
}
