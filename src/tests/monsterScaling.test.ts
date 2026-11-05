import { describe, it, expect } from 'vitest';
import { MONSTERS } from '../data/monsters';
import { NPCS } from '../data/npcs';
import {
  getScalingFactors,
  scaleMonsterHp,
  scaleMonsterAttack,
  rescaleMonsterTokens,
  getActivePartySize,
  ScaledMapToken,
} from './scalingContract';

describe('Requirement R1: Party-Scaled Monster Strength', () => {
  const leshen = MONSTERS.find((m) => m.id === 'ancient-leshen')!;
  const chort = MONSTERS.find((m) => m.id === 'chort-fiend')!;
  const hag = MONSTERS.find((m) => m.id === 'grave-hag')!;
  const hound = MONSTERS.find((m) => m.id === 'barghest-hound')!;

  // ==========================================
  // TIER 1: FEATURE COVERAGE (Features 1, 2, 3)
  // ==========================================
  describe('Tier 1: Feature 1 - Monster HP Scaling (Party Size 1–4)', () => {
    it('T1-F1.1: Ancient Leshen base HP (135) scales exactly across party sizes 1 to 4', () => {
      expect(leshen).toBeDefined();
      expect(scaleMonsterHp(leshen.hp, 1)).toBe(135); // 1.0x -> 135
      expect(scaleMonsterHp(leshen.hp, 2)).toBe(203); // 1.5x -> 202.5 -> 203
      expect(scaleMonsterHp(leshen.hp, 3)).toBe(270); // 2.0x -> 270
      expect(scaleMonsterHp(leshen.hp, 4)).toBe(338); // 2.5x -> 337.5 -> 338
    });

    it('T1-F1.2: Chort Fiend base HP (112) scales exactly across party sizes 1 to 4', () => {
      expect(chort).toBeDefined();
      expect(scaleMonsterHp(chort.hp, 1)).toBe(112); // 1.0x -> 112
      expect(scaleMonsterHp(chort.hp, 2)).toBe(168); // 1.5x -> 168
      expect(scaleMonsterHp(chort.hp, 3)).toBe(224); // 2.0x -> 224
      expect(scaleMonsterHp(chort.hp, 4)).toBe(280); // 2.5x -> 280
    });

    it('T1-F1.3: Grave Hag base HP (68) scales exactly across party sizes 1 to 4', () => {
      expect(hag).toBeDefined();
      expect(scaleMonsterHp(hag.hp, 1)).toBe(68); // 1.0x -> 68
      expect(scaleMonsterHp(hag.hp, 2)).toBe(102); // 1.5x -> 102
      expect(scaleMonsterHp(hag.hp, 3)).toBe(136); // 2.0x -> 136
      expect(scaleMonsterHp(hag.hp, 4)).toBe(170); // 2.5x -> 170
    });

    it('T1-F1.4: Barghest Hound base HP (34) scales exactly across party sizes 1 to 4', () => {
      expect(hound).toBeDefined();
      expect(scaleMonsterHp(hound.hp, 1)).toBe(34); // 1.0x -> 34
      expect(scaleMonsterHp(hound.hp, 2)).toBe(51); // 1.5x -> 51
      expect(scaleMonsterHp(hound.hp, 3)).toBe(68); // 2.0x -> 68
      expect(scaleMonsterHp(hound.hp, 4)).toBe(85); // 2.5x -> 85
    });

    it('T1-F1.5: Hostile NPCs scale HP proportionally across party sizes 1 to 4', () => {
      const direWolf = NPCS.find((n) => n.id === 'dire-wolf')!;
      const rotfiend = NPCS.find((n) => n.id === 'rotfiend')!;
      const steward = NPCS.find((n) => n.id === 'corvus-steward')!;
      const baron = NPCS.find((n) => n.id === 'baron-raymond')!;

      expect(direWolf).toBeDefined();
      expect(scaleMonsterHp(direWolf.hp, 1)).toBe(37);
      expect(scaleMonsterHp(direWolf.hp, 2)).toBe(56);
      expect(scaleMonsterHp(direWolf.hp, 3)).toBe(74);
      expect(scaleMonsterHp(direWolf.hp, 4)).toBe(93);

      expect(rotfiend).toBeDefined();
      expect(scaleMonsterHp(rotfiend.hp, 1)).toBe(28);
      expect(scaleMonsterHp(rotfiend.hp, 2)).toBe(42);
      expect(scaleMonsterHp(rotfiend.hp, 3)).toBe(56);
      expect(scaleMonsterHp(rotfiend.hp, 4)).toBe(70);

      expect(steward).toBeDefined();
      expect(scaleMonsterHp(steward.hp, 1)).toBe(48);
      expect(scaleMonsterHp(steward.hp, 4)).toBe(120);

      expect(baron).toBeDefined();
      expect(scaleMonsterHp(baron.hp, 1)).toBe(75);
      expect(scaleMonsterHp(baron.hp, 4)).toBe(188);
    });
  });

  describe('Tier 1: Feature 2 - Monster Attack & Damage Scaling', () => {
    it('T1-F2.1: attack bonus offset scales by +(N-1) across party sizes 1 to 4', () => {
      expect(getScalingFactors(1).attackBonusOffset).toBe(0);
      expect(getScalingFactors(2).attackBonusOffset).toBe(1);
      expect(getScalingFactors(3).attackBonusOffset).toBe(2);
      expect(getScalingFactors(4).attackBonusOffset).toBe(3);
    });

    it('T1-F2.2: Leshen Gnarled Root Claws to-hit bonus (+7 base) scales up to +10', () => {
      const claw = leshen.attacks[0];
      expect(claw.bonus).toBe(7);

      expect(scaleMonsterAttack(claw, 1).bonus).toBe(7);
      expect(scaleMonsterAttack(claw, 2).bonus).toBe(8);
      expect(scaleMonsterAttack(claw, 3).bonus).toBe(9);
      expect(scaleMonsterAttack(claw, 4).bonus).toBe(10);
    });

    it('T1-F2.3: damage formula flat offset scales by +(N-1)*2 across party sizes 1 to 4', () => {
      expect(getScalingFactors(1).damageBonusOffset).toBe(0);
      expect(getScalingFactors(2).damageBonusOffset).toBe(2);
      expect(getScalingFactors(3).damageBonusOffset).toBe(4);
      expect(getScalingFactors(4).damageBonusOffset).toBe(6);
    });

    it('T1-F2.4: Chort Gore damage formula ("2d10 + 5" base) scales by +2 flat per additional witcher', () => {
      const gore = chort.attacks[0];
      expect(gore.damage).toBe('2d10 + 5');

      expect(scaleMonsterAttack(gore, 1).damage).toBe('2d10 + 5');
      expect(scaleMonsterAttack(gore, 2).damage).toBe('2d10 + 7');
      expect(scaleMonsterAttack(gore, 3).damage).toBe('2d10 + 9');
      expect(scaleMonsterAttack(gore, 4).damage).toBe('2d10 + 11');
    });

    it('T1-F2.5: Grave Hag Rotten Claws damage formula ("2d6 + 3" base) scales up to +6 flat damage', () => {
      const claw = hag.attacks[0];
      expect(claw.damage).toBe('2d6 + 3');

      expect(scaleMonsterAttack(claw, 1).damage).toBe('2d6 + 3');
      expect(scaleMonsterAttack(claw, 2).damage).toBe('2d6 + 5');
      expect(scaleMonsterAttack(claw, 3).damage).toBe('2d6 + 7');
      expect(scaleMonsterAttack(claw, 4).damage).toBe('2d6 + 9');
    });
  });

  describe('Tier 1: Feature 3 - Dynamic Token Spawning & Mid-Combat Rescaling', () => {
    it('T1-F3.1: newly spawned token has maxHp equal to scaleMonsterHp and currentHp equal to maxHp', () => {
      const partySize = 3;
      const baseHp = leshen.hp; // 135
      const expectedHp = scaleMonsterHp(baseHp, partySize); // 270

      const token: ScaledMapToken = {
        id: 'token-leshen-1',
        name: leshen.name,
        isMonster: true,
        avatarUrl: '',
        x: 50,
        y: 50,
        baseMaxHp: baseHp,
        maxHp: expectedHp,
        currentHp: expectedHp,
        color: '#ff0000',
        scaledPartySize: partySize,
      };

      expect(token.maxHp).toBe(270);
      expect(token.currentHp).toBe(270);
      expect(token.scaledPartySize).toBe(3);
    });

    it('T1-F3.2: dynamic token rescaling keeps dead tokens (0 HP) dead (0 HP)', () => {
      const deadToken: ScaledMapToken = {
        id: 'token-chort-dead',
        name: chort.name,
        isMonster: true,
        avatarUrl: '',
        x: 10,
        y: 10,
        baseMaxHp: chort.hp, // 112
        maxHp: 112,
        currentHp: 0, // dead
        color: '#ff0000',
        scaledPartySize: 1,
      };

      // Party expands from 1 to 4
      const rescaled = rescaleMonsterTokens([deadToken], 4);
      expect(rescaled.length).toBe(1);
      expect(rescaled[0].maxHp).toBe(280); // 2.5x base
      expect(rescaled[0].currentHp).toBe(0); // must remain dead
    });

    it('T1-F3.3: dynamic token rescaling preserves wounded token health percentage', () => {
      // Leshen at N=1 with 50% HP (68 / 135)
      const woundedToken: ScaledMapToken = {
        id: 'token-leshen-wounded',
        name: leshen.name,
        isMonster: true,
        avatarUrl: '',
        x: 20,
        y: 20,
        baseMaxHp: 135,
        maxHp: 135,
        currentHp: 68,
        color: '#ff0000',
        scaledPartySize: 1,
      };

      // Rescale to N=3 (maxHp becomes 270)
      const rescaled = rescaleMonsterTokens([woundedToken], 3);
      expect(rescaled[0].maxHp).toBe(270);
      // 68 / 135 * 270 = 136
      expect(rescaled[0].currentHp).toBe(136);
    });

    it('T1-F3.4: non-monster tokens (witcher/player tokens) are completely untouched by rescaling', () => {
      const witcherToken: ScaledMapToken = {
        id: 'token-witcher-wolf',
        name: 'Vane of Kaer Morhen',
        isMonster: false,
        avatarUrl: '',
        x: 40,
        y: 40,
        maxHp: 49,
        currentHp: 32,
        color: '#3b82f6',
      };

      const rescaled = rescaleMonsterTokens([witcherToken], 4);
      expect(rescaled[0].maxHp).toBe(49);
      expect(rescaled[0].currentHp).toBe(32);
      expect(rescaled[0].scaledPartySize).toBeUndefined();
    });

    it('T1-F3.5: getActivePartySize derives party size accurately from claims and peers', () => {
      // Solo offline GM
      expect(getActivePartySize({}, [], false, true)).toBe(1);

      // 2 claimed witchers
      const twoClaims = {
        'witcher-wolf': { isLocked: true },
        'witcher-cat': { isLocked: true },
      };
      expect(getActivePartySize(twoClaims, [], true, false)).toBe(2);

      // 3 connected player peers + GM
      const peers = [{ isObserver: false }, { isObserver: false }];
      expect(getActivePartySize({}, peers, true, true)).toBe(3); // GM(1) + 2 peers = 3
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2-B1: party size <= 0 is strictly clamped to minimum party size of 1', () => {
      expect(getScalingFactors(0).hpMultiplier).toBe(1.0);
      expect(getScalingFactors(-1).hpMultiplier).toBe(1.0);
      expect(getScalingFactors(-99).attackBonusOffset).toBe(0);
      expect(scaleMonsterHp(100, 0)).toBe(100);
      expect(scaleMonsterHp(100, -5)).toBe(100);
    });

    it('T2-B2: party size >= 5 is strictly clamped to maximum party size of 4', () => {
      expect(getScalingFactors(5).hpMultiplier).toBe(2.5);
      expect(getScalingFactors(10).hpMultiplier).toBe(2.5);
      expect(getScalingFactors(99).attackBonusOffset).toBe(3);
      expect(getScalingFactors(99).damageBonusOffset).toBe(6);
      expect(scaleMonsterHp(100, 5)).toBe(250);
      expect(scaleMonsterHp(100, 20)).toBe(250);
    });

    it('T2-B3: non-integer float party sizes floor to valid integer range [1, 4]', () => {
      expect(scaleMonsterHp(100, 2.8)).toBe(150); // floored to 2 (1.5x)
      expect(scaleMonsterHp(100, 3.9)).toBe(200); // floored to 3 (2.0x)
    });

    it('T2-B4: zero or negative base HP input guard returns 0', () => {
      expect(scaleMonsterHp(0, 4)).toBe(0);
      expect(scaleMonsterHp(-50, 4)).toBe(0);
    });

    it('T2-B5: monster with 1 HP scales without truncating to 0', () => {
      expect(scaleMonsterHp(1, 1)).toBe(1);
      expect(scaleMonsterHp(1, 2)).toBe(2); // 1 * 1.5 = 1.5 -> round to 2
      expect(scaleMonsterHp(1, 3)).toBe(2); // 1 * 2.0 = 2
      expect(scaleMonsterHp(1, 4)).toBe(3); // 1 * 2.5 = 2.5 -> round to 3
    });

    it('T2-B6: attack with +0 base bonus (e.g. Leshen Root Burst) scales to +0, +1, +2, +3', () => {
      const rootBurst = leshen.attacks[1];
      expect(rootBurst.bonus).toBe(0);

      expect(scaleMonsterAttack(rootBurst, 1).bonus).toBe(0);
      expect(scaleMonsterAttack(rootBurst, 2).bonus).toBe(1);
      expect(scaleMonsterAttack(rootBurst, 3).bonus).toBe(2);
      expect(scaleMonsterAttack(rootBurst, 4).bonus).toBe(3);
    });

    it('T2-B7: attack with no flat bonus (e.g. "4d8") appends flat bonus "+ X"', () => {
      const rootBurst = leshen.attacks[1];
      expect(rootBurst.damage).toBe('4d8');

      expect(scaleMonsterAttack(rootBurst, 1).damage).toBe('4d8');
      expect(scaleMonsterAttack(rootBurst, 2).damage).toBe('4d8 + 2');
      expect(scaleMonsterAttack(rootBurst, 3).damage).toBe('4d8 + 4');
      expect(scaleMonsterAttack(rootBurst, 4).damage).toBe('4d8 + 6');
    });

    it('T2-B8: attack with multi-type damage string preserves remainder text', () => {
      const complexAttack = {
        name: 'Ghostfire Bite',
        bonus: 5,
        damage: '1d8 + 3 piercing + 1d6 fire',
        damageType: 'Piercing/Fire',
        description: 'Spectral jaws',
      };

      const scaledN2 = scaleMonsterAttack(complexAttack, 2);
      expect(scaledN2.damage).toBe('1d8 + 5 piercing + 1d6 fire');

      const scaledN4 = scaleMonsterAttack(complexAttack, 4);
      expect(scaledN4.damage).toBe('1d8 + 9 piercing + 1d6 fire');
    });

    it('T2-B9: scaling preserves attack name, damageType, and description', () => {
      const attack = leshen.attacks[0];
      const scaled = scaleMonsterAttack(attack, 4);
      expect(scaled.name).toBe(attack.name);
      expect(scaled.damageType).toBe(attack.damageType);
      expect(scaled.description).toBe(attack.description);
    });

    it('T2-B10: empty token list rescaling returns empty array', () => {
      expect(rescaleMonsterTokens([], 4)).toEqual([]);
    });

    it('T2-B11: rescaling with same party size leaves token HP completely unchanged', () => {
      const token: ScaledMapToken = {
        id: 'token-hag',
        name: hag.name,
        isMonster: true,
        avatarUrl: '',
        x: 10,
        y: 10,
        baseMaxHp: 68,
        maxHp: 102,
        currentHp: 75,
        color: '#ff0000',
        scaledPartySize: 2,
      };

      const rescaled = rescaleMonsterTokens([token], 2);
      expect(rescaled[0].maxHp).toBe(102);
      expect(rescaled[0].currentHp).toBe(75);
    });

    it('T2-B12: downscaling from 4 witchers to 1 witcher downscales HP proportionally', () => {
      const token: ScaledMapToken = {
        id: 'token-chort-4p',
        name: chort.name,
        isMonster: true,
        avatarUrl: '',
        x: 15,
        y: 15,
        baseMaxHp: 112,
        maxHp: 280, // N=4
        currentHp: 140, // 50%
        color: '#ff0000',
        scaledPartySize: 4,
      };

      const rescaled = rescaleMonsterTokens([token], 1);
      expect(rescaled[0].maxHp).toBe(112);
      expect(rescaled[0].currentHp).toBe(56); // 50% of 112
    });

    it('T2-B13: token with temporary over-heal (currentHp > maxHp) preserves ratio safely', () => {
      const buffedToken: ScaledMapToken = {
        id: 'token-buffed',
        name: 'Buffed Beast',
        isMonster: true,
        avatarUrl: '',
        x: 30,
        y: 30,
        baseMaxHp: 100,
        maxHp: 100,
        currentHp: 120, // 120%
        color: '#ff0000',
        scaledPartySize: 1,
      };

      const rescaled = rescaleMonsterTokens([buffedToken], 2);
      expect(rescaled[0].maxHp).toBe(150);
      expect(rescaled[0].currentHp).toBe(180); // 1.2 * 150 = 180
    });

    it('T2-B14: token rescaling preserves token position (x, y), id, name, and color', () => {
      const token: ScaledMapToken = {
        id: 'preserve-id-99',
        name: 'Alpha Leshen',
        isMonster: true,
        avatarUrl: 'test-url',
        x: 82.5,
        y: 17.3,
        baseMaxHp: 135,
        maxHp: 135,
        currentHp: 135,
        color: '#10b981',
      };

      const rescaled = rescaleMonsterTokens([token], 3);
      expect(rescaled[0].id).toBe('preserve-id-99');
      expect(rescaled[0].name).toBe('Alpha Leshen');
      expect(rescaled[0].avatarUrl).toBe('test-url');
      expect(rescaled[0].x).toBe(82.5);
      expect(rescaled[0].y).toBe(17.3);
      expect(rescaled[0].color).toBe('#10b981');
    });

    it('T2-B15: observer peers are strictly excluded from active party size calculation', () => {
      const connected = [
        { isObserver: false, id: 'peer-player-1' },
        { isObserver: true, id: 'peer-observer-1' },
        { isObserver: true, id: 'peer-observer-2' },
      ];
      // Only 1 player peer + GM = 2
      expect(getActivePartySize({}, connected, true, true)).toBe(2);
    });
  });
});
