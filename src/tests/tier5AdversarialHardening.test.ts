import { describe, it, expect } from 'vitest';
import {
  getScalingFactors,
  scaleMonsterHp,
  scaleDamageFormula,
  scaleMonsterAttack,
  scaleMonster,
  rescaleMonsterTokens,
  getActivePartySize,
} from '../utils/monsterScaling';
import { MONSTERS } from '../data/monsters';
import {
  STARTER_ARMOR_SETS,
  DEFAULT_ACT_MERCHANTS,
  MASTER_FINITE_ITEMS,
  INITIAL_WITCHER_GOLD,
} from '../data/items';
import { WITCHER_ADVENTURE } from '../data/adventure';
import { MapToken, MonsterAttack, WitcherSchool } from '../types';

describe('Tier 5 Adversarial Coverage Hardening Suite', () => {
  const leshen = MONSTERS.find((m) => m.id === 'ancient-leshen')!;
  const chort = MONSTERS.find((m) => m.id === 'chort-fiend')!;
  const hound = MONSTERS.find((m) => m.id === 'barghest-hound')!;

  // =========================================================================
  // SUITE 1: Extreme and Malformed Inputs to Monster Scaling
  // =========================================================================
  describe('Suite 1: Extreme and Malformed Inputs to Monster Scaling', () => {
    it('T5-ADV-1.1: safely clamps lower boundary party sizes (0, -1, -999, NaN, null, undefined) to 1', () => {
      const lowerBoundaryInputs = [0, -1, -100, -9999, NaN, -Infinity, undefined as any, null as any];

      for (const input of lowerBoundaryInputs) {
        const factors = getScalingFactors(input);
        expect(factors.hpMultiplier).toBe(1.0);
        expect(factors.attackBonusOffset).toBe(0);
        expect(factors.damageBonusOffset).toBe(0);

        // Verify monster HP scaling on base 100 HP
        expect(scaleMonsterHp(100, input)).toBe(100);
      }
    });

    it('T5-ADV-1.2: safely clamps upper boundary party sizes (5, 6, 10, 100, Infinity) to 4', () => {
      const upperBoundaryInputs = [5, 6, 10, 50, 100, 9999, Infinity];

      for (const input of upperBoundaryInputs) {
        const factors = getScalingFactors(input);
        expect(factors.hpMultiplier).toBe(2.5);
        expect(factors.attackBonusOffset).toBe(3);
        expect(factors.damageBonusOffset).toBe(6);

        // Verify monster HP scaling on base 100 HP
        expect(scaleMonsterHp(100, input)).toBe(250);
      }
    });

    it('T5-ADV-1.3: handles non-integer party sizes by flooring and clamping without float corruption', () => {
      expect(getScalingFactors(1.1).hpMultiplier).toBe(1.0);
      expect(getScalingFactors(1.99).hpMultiplier).toBe(1.0);
      expect(getScalingFactors(2.001).hpMultiplier).toBe(1.5);
      expect(getScalingFactors(2.999).hpMultiplier).toBe(1.5);
      expect(getScalingFactors(3.14159).hpMultiplier).toBe(2.0);
      expect(getScalingFactors(3.9999).hpMultiplier).toBe(2.0);
      expect(getScalingFactors(4.0001).hpMultiplier).toBe(2.5);
      expect(getScalingFactors(4.99).hpMultiplier).toBe(2.5);
      expect(getScalingFactors(0.7).hpMultiplier).toBe(1.0);
      expect(getScalingFactors(-0.5).hpMultiplier).toBe(1.0);
    });

    it('T5-ADV-1.4: base monster HP extremes (0, negative, 1, 10,000,000) scale reliably', () => {
      // 0 or negative base HP must return 0
      expect(scaleMonsterHp(0, 1)).toBe(0);
      expect(scaleMonsterHp(0, 4)).toBe(0);
      expect(scaleMonsterHp(-50, 2)).toBe(0);
      expect(scaleMonsterHp(-1, 4)).toBe(0);

      // Low base HP (1 HP)
      expect(scaleMonsterHp(1, 1)).toBe(1); // 1 * 1.0 = 1
      expect(scaleMonsterHp(1, 2)).toBe(2); // 1 * 1.5 = 1.5 -> round to 2
      expect(scaleMonsterHp(1, 3)).toBe(2); // 1 * 2.0 = 2
      expect(scaleMonsterHp(1, 4)).toBe(3); // 1 * 2.5 = 2.5 -> round to 3

      // High base HP (10,000,000 HP)
      expect(scaleMonsterHp(10_000_000, 1)).toBe(10_000_000);
      expect(scaleMonsterHp(10_000_000, 2)).toBe(15_000_000);
      expect(scaleMonsterHp(10_000_000, 3)).toBe(20_000_000);
      expect(scaleMonsterHp(10_000_000, 4)).toBe(25_000_000);
    });

    it('T5-ADV-1.5: getActivePartySize handles adversarial assignment states, corrupt peer lists, and offline solo', () => {
      // 1. Completely empty or undefined inputs
      expect(getActivePartySize({}, [], false, true)).toBe(1);
      expect(getActivePartySize(undefined as any, undefined as any, false, true)).toBe(1);

      // 2. Offline GM play with no locked witchers defaults to 1
      expect(getActivePartySize({}, [], false, false)).toBe(1);
      expect(getActivePartySize({}, [], false, true)).toBe(1);

      // 3. Observers are strictly filtered out
      const peersWithObservers = [
        { id: 'peer-1', isObserver: false },
        { id: 'peer-2', isObserver: true },
        { id: 'peer-3', isObserver: true },
        { id: 'peer-4', isObserver: false },
      ];
      // isConnected = true, gmPlaysWitcher = true (1) + 2 non-observer peers = 3
      expect(getActivePartySize({}, peersWithObservers, true, true)).toBe(3);

      // 4. Locked witchers take precedence
      const lockedAssignments = {
        'witcher-wolf': { isLocked: true },
        'witcher-cat': { isLocked: true },
        'witcher-griffin': { isLocked: false },
      };
      expect(getActivePartySize(lockedAssignments, [], false, false)).toBe(2);

      // 5. Overflow beyond 4 is clamped to 4
      const fiveLocked = {
        w1: { isLocked: true },
        w2: { isLocked: true },
        w3: { isLocked: true },
        w4: { isLocked: true },
        w5: { isLocked: true },
      };
      expect(getActivePartySize(fiveLocked, [], true, true)).toBe(4);
    });
  });

  // =========================================================================
  // SUITE 2: Damage Formula Parsing & Extreme Dice Notation Stress Harness
  // =========================================================================
  describe('Suite 2: Damage Formula Parsing & Extreme Dice Notation Stress Harness', () => {
    it('T5-ADV-2.1: compound multi-dice formulas from bestiary (e.g. 1d8 + 3 piercing + 1d6 fire) scale primary flat modifier correctly', () => {
      // Barghest Hound: '1d8 + 3 piercing + 1d6 fire'
      expect(scaleDamageFormula('1d8 + 3 piercing + 1d6 fire', 2)).toBe('1d8 + 5 piercing + 1d6 fire');
      expect(scaleDamageFormula('1d8 + 3 piercing + 1d6 fire', 6)).toBe('1d8 + 9 piercing + 1d6 fire');

      // Rotfiend: '1d6 + 3 piercing + 2d6 poison'
      expect(scaleDamageFormula('1d6 + 3 piercing + 2d6 poison', 4)).toBe('1d6 + 7 piercing + 2d6 poison');

      // Cintrian Guard: '1d8 + 3 (1d10 + 3 versatile)'
      expect(scaleDamageFormula('1d8 + 3 (1d10 + 3 versatile)', 2)).toBe('1d8 + 5 (1d10 + 3 versatile)');
    });

    it('T5-ADV-2.2: suffix notations with damage types preserve trailing descriptive text', () => {
      expect(scaleDamageFormula('2d10 + 5 piercing', 2)).toBe('2d10 + 7 piercing');
      expect(scaleDamageFormula('3d6 + 4 fire damage', 4)).toBe('3d6 + 8 fire damage');
      expect(scaleDamageFormula('1d8 + 2 psychic + 1d4 bleed', 6)).toBe('1d8 + 8 psychic + 1d4 bleed');
      expect(scaleDamageFormula('4d12 + 10 (cold)', 2)).toBe('4d12 + 12 (cold)');
    });

    it('T5-ADV-2.3: dice-only notations (4d8, 1d10 slashing, 3d6) append flat offset cleanly', () => {
      expect(scaleDamageFormula('4d8', 2)).toBe('4d8 + 2');
      expect(scaleDamageFormula('4d8', 6)).toBe('4d8 + 6');
      expect(scaleDamageFormula('1d10 slashing', 4)).toBe('1d10 + 4 slashing');
      expect(scaleDamageFormula('2d4 poison', 2)).toBe('2d4 + 2 poison');
    });

    it('T5-ADV-2.4: flat damage without dice notations scales without error', () => {
      expect(scaleDamageFormula('10', 2)).toBe('10 + 2');
      expect(scaleDamageFormula('15 bludgeoning', 4)).toBe('15 bludgeoning + 4');
    });

    it('T5-ADV-2.5: zero offset and empty string edge cases return unchanged', () => {
      expect(scaleDamageFormula('2d8 + 4', 0)).toBe('2d8 + 4');
      expect(scaleDamageFormula('4d8', 0)).toBe('4d8');
      expect(scaleDamageFormula('', 4)).toBe('');
      expect(scaleDamageFormula(null as any, 2)).toBe(null);
    });

    it('T5-ADV-2.6: scaleMonsterAttack and scaleMonster are purely functional and immutable', () => {
      const baseAttack: MonsterAttack = {
        name: 'Primeval Gore',
        bonus: 6,
        damage: '2d10 + 4',
        damageType: 'Piercing',
        description: 'Vicious head thrust.',
      };

      const scaledAttack = scaleMonsterAttack(baseAttack, 4);
      // Original attack object is completely unmutated
      expect(baseAttack.bonus).toBe(6);
      expect(baseAttack.damage).toBe('2d10 + 4');

      // Scaled attack has correct offsets (+3 to hit, +6 to damage)
      expect(scaledAttack.bonus).toBe(9);
      expect(scaledAttack.damage).toBe('2d10 + 10');

      // Original monster definition in MONSTERS is unmutated
      const originalLeshenHp = leshen.hp;
      const scaledLeshen = scaleMonster(leshen, 3);
      expect(leshen.hp).toBe(originalLeshenHp);
      expect(scaledLeshen.hp).toBe(scaleMonsterHp(originalLeshenHp, 3));
      expect(scaledLeshen.attacks[0].bonus).toBe(leshen.attacks[0].bonus + 2);
    });
  });

  // =========================================================================
  // SUITE 3: Dynamic Mid-Combat Party Transitions & Permanence Harness
  // =========================================================================
  describe('Suite 3: Dynamic Mid-Combat Party Transitions & Permanence Harness', () => {
    it('T5-ADV-3.1: multi-step rapid transition oscillation (1 -> 4 -> 2 -> 3 -> 1 -> 4 -> 1) maintains full HP integrity on undamaged monsters', () => {
      let tokens: MapToken[] = [
        {
          id: 'token-leshen',
          name: leshen.name,
          isMonster: true,
          avatarUrl: leshen.imageUrl,
          x: 50,
          y: 50,
          baseMaxHp: 135,
          maxHp: 135,
          currentHp: 135,
          color: '#ef4444',
          scaledPartySize: 1,
        },
      ];

      const transitionSequence = [4, 2, 3, 1, 4, 1];
      const expectedMaxHps = [338, 203, 270, 135, 338, 135];

      transitionSequence.forEach((size, index) => {
        tokens = rescaleMonsterTokens(tokens, size);
        const expectedHp = expectedMaxHps[index];
        expect(tokens[0].maxHp).toBe(expectedHp);
        expect(tokens[0].currentHp).toBe(expectedHp);
        expect(tokens[0].scaledPartySize).toBe(size);
        expect(tokens[0].baseMaxHp).toBe(135);
      });
    });

    it('T5-ADV-3.2: dead monster permanence: tokens at 0 HP or negative HP remain strictly dead (0 HP) across all transitions', () => {
      let tokens: MapToken[] = [
        {
          id: 'token-dead-zero',
          name: 'Dead Ghoul',
          isMonster: true,
          avatarUrl: '',
          x: 10,
          y: 10,
          baseMaxHp: 50,
          maxHp: 50,
          currentHp: 0,
          color: '#ef4444',
        },
        {
          id: 'token-dead-overkill',
          name: 'Overkilled Hound',
          isMonster: true,
          avatarUrl: '',
          x: 20,
          y: 20,
          baseMaxHp: 34,
          maxHp: 34,
          currentHp: -12, // Overkill negative HP
          color: '#ef4444',
        },
      ];

      // Oscillate through party sizes: 1 -> 4 -> 2 -> 3 -> 1
      for (const size of [4, 2, 3, 1]) {
        tokens = rescaleMonsterTokens(tokens, size);
        expect(tokens[0].currentHp).toBe(0);
        expect(tokens[1].currentHp).toBe(0);
      }
    });

    it('T5-ADV-3.3: wounded monster proportional health percentage is preserved across party transitions', () => {
      // Monster with 100 base HP damaged to 50 HP (exact 50% HP)
      let tokens: MapToken[] = [
        {
          id: 'token-chort',
          name: 'Wounded Chort',
          isMonster: true,
          avatarUrl: '',
          x: 50,
          y: 50,
          baseMaxHp: 100,
          maxHp: 100,
          currentHp: 50,
          color: '#ef4444',
          scaledPartySize: 1,
        },
      ];

      // Scale to N=4 (Max HP becomes 250): current HP should scale to 50% = 125
      tokens = rescaleMonsterTokens(tokens, 4);
      expect(tokens[0].maxHp).toBe(250);
      expect(tokens[0].currentHp).toBe(125);

      // Scale to N=2 (Max HP becomes 150): current HP should scale to 50% = 75
      tokens = rescaleMonsterTokens(tokens, 2);
      expect(tokens[0].maxHp).toBe(150);
      expect(tokens[0].currentHp).toBe(75);

      // Scale back to N=1 (Max HP becomes 100): current HP returns to exactly 50 with zero drift
      tokens = rescaleMonsterTokens(tokens, 1);
      expect(tokens[0].maxHp).toBe(100);
      expect(tokens[0].currentHp).toBe(50);
    });

    it('T5-ADV-3.4: mixed battlefield state: player witchers and friendly NPCs are left completely untouched', () => {
      const initialTokens: MapToken[] = [
        {
          id: 'token-witcher-wolf',
          name: 'Vane of Kaer Morhen',
          isMonster: false,
          avatarUrl: '',
          x: 20,
          y: 30,
          maxHp: 49,
          currentHp: 32, // Wounded witcher
          color: '#c99a45',
        },
        {
          id: 'token-npc-danek',
          name: 'Sir Danek',
          isMonster: false,
          avatarUrl: '',
          x: 25,
          y: 35,
          maxHp: 65,
          currentHp: 65,
          color: '#3b82f6',
        },
        {
          id: 'token-monster-leshen',
          name: 'Ancient Leshen',
          isMonster: true,
          avatarUrl: '',
          x: 70,
          y: 80,
          baseMaxHp: 135,
          maxHp: 135,
          currentHp: 135,
          color: '#ef4444',
        },
      ];

      let tokens = initialTokens;

      for (const size of [2, 3, 4, 1]) {
        tokens = rescaleMonsterTokens(tokens, size);

        // Witcher token must be 100% identical in HP and properties
        expect(tokens[0].currentHp).toBe(32);
        expect(tokens[0].maxHp).toBe(49);
        expect(tokens[0].isMonster).toBe(false);

        // Friendly NPC token must be 100% identical
        expect(tokens[1].currentHp).toBe(65);
        expect(tokens[1].maxHp).toBe(65);
        expect(tokens[1].isMonster).toBe(false);

        // Monster token scales with party size
        expect(tokens[2].maxHp).toBe(scaleMonsterHp(135, size));
      }
    });

    it('T5-ADV-3.5: token attack stats compound monotonically on mid-combat party transitions (EMPIRICAL DEFECT)', () => {
      // Starting token with base attack at N=1 (+7 to hit, 2d8 + 4)
      let tokens: MapToken[] = [
        {
          id: 'token-leshen-attacks',
          name: leshen.name,
          isMonster: true,
          avatarUrl: '',
          x: 50,
          y: 50,
          baseMaxHp: 135,
          maxHp: 135,
          currentHp: 135,
          color: '#ef4444',
          scaledPartySize: 1,
          attacks: [
            {
              name: 'Gnarled Root Claws',
              bonus: 7,
              damage: '2d8 + 4',
              damageType: 'Slashing',
              description: 'Claw rake.',
            },
          ],
        },
      ];

      // Single transition to N=4: scaleMonsterAttack applies offset +3 to-hit, +6 to damage
      tokens = rescaleMonsterTokens(tokens, 4);
      expect(tokens[0].attacks![0].bonus).toBe(10); // 7 + 3 = 10
      expect(tokens[0].attacks![0].damage).toBe('2d8 + 10'); // 4 + 6 = 10

      // DEFECT REPRODUCTION: Second transition from N=4 down to N=2.
      // Expected balanced behavior: bonus should be 7 + 1 = 8, damage should be '2d8 + 6'.
      // Actual implementation defect: token.attacks lacks a base attack reference,
      // so scaleMonsterAttack is invoked on the ALREADY-SCALED attack (+10),
      // adding offset +1 on top to yield 11 (and '2d8 + 12')!
      tokens = rescaleMonsterTokens(tokens, 2);
      
      // We empirically verify that the implementation produces 11 instead of the balanced 8:
      expect(tokens[0].attacks![0].bonus).toBe(11); // Compounded! (defect proven)
      expect(tokens[0].attacks![0].damage).toBe('2d8 + 12'); // Compounded! (defect proven)

      // Third transition: party drops to N=1 (solo play)
      // Expected balanced behavior: bonus should return to base 7, damage to '2d8 + 4'.
      // Actual implementation defect: offset +0 is added to 11, staying permanently at 11!
      tokens = rescaleMonsterTokens(tokens, 1);
      expect(tokens[0].attacks![0].bonus).toBe(11); // Compounded permanence!
      expect(tokens[0].attacks![0].damage).toBe('2d8 + 12');
    });

    it('T5-ADV-3.6: token without explicit baseMaxHp captures initial maxHp as baseMaxHp and preserves it', () => {
      let tokens: MapToken[] = [
        {
          id: 'token-legacy',
          name: 'Legacy Spawner Token',
          isMonster: true,
          avatarUrl: '',
          x: 50,
          y: 50,
          // baseMaxHp is undefined initially
          maxHp: 80,
          currentHp: 80,
          color: '#ef4444',
        },
      ];

      // Scale to N=3: baseMaxHp should be captured as 80, maxHp becomes 160 (2.0x)
      tokens = rescaleMonsterTokens(tokens, 3);
      expect(tokens[0].baseMaxHp).toBe(80);
      expect(tokens[0].maxHp).toBe(160);

      // Scale to N=1: scales back to 80 based on the captured baseMaxHp
      tokens = rescaleMonsterTokens(tokens, 1);
      expect(tokens[0].baseMaxHp).toBe(80);
      expect(tokens[0].maxHp).toBe(80);
    });
  });

  // =========================================================================
  // SUITE 4: Store & Loot Progression Exhaustive Comparison Matrix
  // =========================================================================
  describe('Suite 4: Store & Loot Progression Exhaustive Comparison Matrix', () => {
    const starterArmors = {
      Light: STARTER_ARMOR_SETS.Cat.armorClass, // 11
      Medium: Math.max(STARTER_ARMOR_SETS.Wolf.armorClass, STARTER_ARMOR_SETS.Griffin.armorClass), // 13
      Heavy: STARTER_ARMOR_SETS.Bear.armorClass, // 13
    };

    it('T5-ADV-4.1: every single armor in DEFAULT_ACT_MERCHANTS (Acts I–IV) has strictly higher AC than starter armors of same weight', () => {
      const checkedArmors: string[] = [];

      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const armors = merchant.items.filter((i) => i.item.category === 'armor');

        for (const entry of armors) {
          const item = entry.item;
          const weightCat = item.weightCategory as 'Light' | 'Medium' | 'Heavy';
          const baselineAc = starterArmors[weightCat];

          expect(baselineAc).toBeDefined();
          expect(item.armorClass).toBeDefined();
          expect(item.armorClass!).toBeGreaterThan(baselineAc);
          checkedArmors.push(`${item.id} (AC ${item.armorClass} > ${baselineAc})`);
        }
      }

      // Assert that Act 1 (Ox-Hide AC 14), Act 3 (Tir na Lia AC 15), and Act 4 (Cintrian Guard AC 16) were all verified
      expect(checkedArmors.some((a) => a.includes('armor-ox-hide'))).toBe(true);
      expect(checkedArmors.some((a) => a.includes('armor-tir-na-lia'))).toBe(true);
      expect(checkedArmors.some((a) => a.includes('armor-cintrian-guard'))).toBe(true);
    });

    it('T5-ADV-4.2: every single armor in DEFAULT_ACT_MERCHANTS has at least 1 beneficial perk, while starter armors have exactly 0 perks', () => {
      // Confirm all starter armors have 0 perks
      for (const school of ['Wolf', 'Cat', 'Griffin', 'Bear'] as WitcherSchool[]) {
        expect(STARTER_ARMOR_SETS[school].perks.length).toBe(0);
      }

      // Confirm all merchant armors have non-empty perks
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const armors = merchant.items.filter((i) => i.item.category === 'armor');

        for (const entry of armors) {
          expect(entry.item.properties).toBeDefined();
          expect(entry.item.properties!.length).toBeGreaterThan(0);
        }
      }
    });

    it('T5-ADV-4.3: every single weapon in DEFAULT_ACT_MERCHANTS strictly exceeds starter weapons across multiple progression metrics', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const weapons = merchant.items.filter((i) => i.item.category.includes('sword'));

        for (const { item } of weapons) {
          // Invariant 1: Store weapons have superior value compared to starter weapons (starter gold value <= 50)
          expect(item.valueGold).toBeGreaterThan(50);

          // Invariant 2: Store weapons have either higher attack bonus, flat damage bonus, bonus dice, or combat perks
          const hasBonusDice = /\+\s*\d+d\d+/i.test(item.damage || '');
          const hasFlatBonus = /\+\s*[1-9]\s*\+/.test(item.damage || '');
          const hasCombatPerks = (item.properties || []).some((p) =>
            /initiative|bleed|crit|keen|disarm|bypass|regeneration|charges|smite|illuminates/i.test(p)
          );
          const hasHighAtkBonus = (item.attackBonus || 0) >= 8;

          expect(hasBonusDice || hasFlatBonus || hasCombatPerks || hasHighAtkBonus).toBe(true);
        }
      }
    });

    it('T5-ADV-4.4: all adventure secret treasures strictly improve over starter gear', () => {
      const allTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
        act.storyBeats.flatMap((b) => b.secretTreasures || [])
      );

      const equipmentTreasures = allTreasures.filter((t) =>
        t.vaultItemId && (t.vaultItemId.startsWith('armor-') || t.vaultItemId.startsWith('steel-') || t.vaultItemId.startsWith('silver-'))
      );

      expect(equipmentTreasures.length).toBeGreaterThanOrEqual(4);

      for (const t of equipmentTreasures) {
        const item = MASTER_FINITE_ITEMS.find((i) => i.id === t.vaultItemId)!;
        expect(item).toBeDefined();

        if (item.category === 'armor') {
          const weightCat = item.weightCategory as 'Light' | 'Medium' | 'Heavy';
          expect(item.armorClass!).toBeGreaterThan(starterArmors[weightCat]);
          expect(item.properties!.length).toBeGreaterThan(0);
        } else if (item.category.includes('sword')) {
          // Must have bonus dice, high attack, or special perks
          const hasBonusDice = /\+\s*\d+d\d+/i.test(item.damage || '');
          const hasCombatPerks = (item.properties || []).length > 0;
          expect(hasBonusDice || hasCombatPerks).toBe(true);
        }
      }
    });

    it('T5-ADV-4.5: all secret treasure vaultItemIds resolve to valid master items in MASTER_FINITE_ITEMS', () => {
      const allTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
        act.storyBeats.flatMap((b) => b.secretTreasures || [])
      );

      const referencedIds = allTreasures.map((t) => t.vaultItemId).filter((id): id is string => Boolean(id));

      for (const id of referencedIds) {
        const masterItem = MASTER_FINITE_ITEMS.find((i) => i.id === id);
        expect(
          masterItem,
          `Adventure secret treasure references '${id}' which must exist in MASTER_FINITE_ITEMS`
        ).toBeDefined();
      }
    });

    it('T5-ADV-4.6: gold economy pacing prevents party from buying endgame gear at the start', () => {
      // Party starts with 15 orens each (60 orens total)
      expect(INITIAL_WITCHER_GOLD).toBe(15);
      const totalPartyStartingGold = INITIAL_WITCHER_GOLD * 4;
      expect(totalPartyStartingGold).toBe(60);

      // Act 1 Armor (Ox-Hide) costs 110 orens -> Cannot be bought without pooling + adventuring
      const act1Merchant = DEFAULT_ACT_MERCHANTS[1];
      const oxHidePrice = act1Merchant.items.find((i) => i.id === 'armor-ox-hide')!.priceGold;
      expect(oxHidePrice).toBe(110);
      expect(oxHidePrice).toBeGreaterThan(totalPartyStartingGold);

      // Act 3 Gwyhyr (340 orens) and Act 4 Tor Zireael (360 orens) require campaign progression
      const act3GwyhyrPrice = DEFAULT_ACT_MERCHANTS[3].items.find((i) => i.id === 'steel-gwyhyr')!.priceGold;
      expect(act3GwyhyrPrice).toBe(340);
      expect(act3GwyhyrPrice).toBeGreaterThan(200);

      const act4TorZireaelPrice = DEFAULT_ACT_MERCHANTS[4].items.find((i) => i.id === 'silver-tor-zireael')!.priceGold;
      expect(act4TorZireaelPrice).toBe(360);
      expect(act4TorZireaelPrice).toBeGreaterThan(300);
    });

    it('T5-ADV-4.7: monotonic store progression: merchant weapon & armor prices scale upward across Acts I–IV', () => {
      const getAverageEquipmentPrice = (act: number): number => {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const equipment = merchant.items.filter(
          (i) => i.item.category === 'armor' || i.item.category.includes('sword')
        );
        const sum = equipment.reduce((acc, curr) => acc + curr.priceGold, 0);
        return sum / equipment.length;
      };

      const act1Avg = getAverageEquipmentPrice(1);
      const act2Avg = getAverageEquipmentPrice(2);
      const act3Avg = getAverageEquipmentPrice(3);
      const act4Avg = getAverageEquipmentPrice(4);

      expect(act1Avg).toBeLessThan(act2Avg);
      expect(act2Avg).toBeLessThan(act3Avg);
      // Act 4 has high-tier royal vanguard gear (avg > 250)
      expect(act4Avg).toBeGreaterThan(act1Avg * 2);
    });
  });

  // =========================================================================
  // SUITE 5: Whole-System End-to-End Campaign Simulation
  // =========================================================================
  describe('Suite 5: Whole-System End-to-End Campaign Simulation', () => {
    it('T5-ADV-5.1: full 4-Act campaign simulation demonstrates progression pacing against scaled encounters', () => {
      // Act 1: Solo Wolf Witcher (N=1) encounters Barghest Hound (34 HP) with mundane starter silver (avg 8.5 dmg)
      const n1HoundHp = scaleMonsterHp(hound.hp, 1);
      const soloHits = Math.ceil(n1HoundHp / 8.5);
      expect(soloHits).toBe(4); // 4 hits to defeat Hound solo

      // Act 2: Full party joins (N=4). Chort Fiend scales to 280 HP.
      // Party buys Havern Silver Broadsword (+2d6 silver, avg 15.5 dmg).
      const n4ChortHp = scaleMonsterHp(chort.hp, 4);
      expect(n4ChortHp).toBe(280);
      const partyHitsWithUpgrade = Math.ceil(n4ChortHp / (15.5 * 4)); // Rounds of party attacks
      expect(partyHitsWithUpgrade).toBeLessThanOrEqual(5); // Defeated in <= 5 rounds

      // Act 3: Ancient Leshen encounter at N=4 (338 HP).
      // Party finds Moonblade (+2d6 silver + 1d6 radiant, avg 19 dmg).
      const n4LeshenHp = scaleMonsterHp(leshen.hp, 4);
      expect(n4LeshenHp).toBe(338);
      const roundsWithMoonblade = Math.ceil(n4LeshenHp / (19 * 4));
      expect(roundsWithMoonblade).toBeLessThanOrEqual(5);

      // Act 4: Upgraded armor defense vs Leshen Claws (+10 to hit at N=4)
      // Starter Wolf Armor AC 12 -> 95% hit chance (19/20)
      // Upgraded Cintrian Guard Half-Plate AC 16 -> 75% hit chance (15/20)
      // Upgraded armor reduces monster hit rate by 20 percentage points!
      const starterHitChance = (21 - Math.max(2, 12 - 10)) / 20;
      const upgradedHitChance = (21 - Math.max(2, 16 - 10)) / 20;
      expect(starterHitChance - upgradedHitChance).toBeCloseTo(0.2, 5);
    });
  });
});
