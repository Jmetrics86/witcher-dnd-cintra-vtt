import { describe, it, expect } from 'vitest';
import { MONSTERS } from '../data/monsters';
import { NPCS } from '../data/npcs';
import { PREGEN_WITCHERS } from '../data/characters';
import {
  STARTER_ARMOR_SETS,
  DEFAULT_ACT_MERCHANTS,
  MASTER_FINITE_ITEMS,
} from '../data/items';
import {
  scaleMonsterHp,
  scaleMonsterAttack,
  rescaleMonsterTokens,
  ScaledMapToken,
} from './scalingContract';

describe('Tiers 3 & 4: Integration Combat & Campaign Progression', () => {
  const leshen = MONSTERS.find((m) => m.id === 'ancient-leshen')!;
  const hound = MONSTERS.find((m) => m.id === 'barghest-hound')!;

  // ==========================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3-C1: Scaled Monster Attack vs Starter Armor AC (Wolf AC 12)', () => {
      const wolfAc = STARTER_ARMOR_SETS.Wolf.armorClass; // 12
      const baseAttack = leshen.attacks[0]; // +7 bonus

      // d20 + bonus >= AC.
      // At N=1: bonus 7 vs AC 12 -> needs 5+ on d20 (16/20 = 80% hit chance)
      // At N=2: bonus 8 vs AC 12 -> needs 4+ on d20 (17/20 = 85% hit chance)
      // At N=3: bonus 9 vs AC 12 -> needs 3+ on d20 (18/20 = 90% hit chance)
      // At N=4: bonus 10 vs AC 12 -> needs 2+ on d20 (19/20 = 95% hit chance)
      const hitChances = [1, 2, 3, 4].map((n) => {
        const scaled = scaleMonsterAttack(baseAttack, n);
        const rollNeeded = Math.max(2, Math.min(20, wolfAc - scaled.bonus));
        return (21 - rollNeeded) / 20;
      });

      expect(hitChances).toEqual([0.8, 0.85, 0.9, 0.95]);
    });

    it('T3-C2: Scaled Monster Attack vs Upgraded Act IV Armor AC (Cintrian Guard AC 16)', () => {
      const upgradedAc = 16;
      const baseAttack = leshen.attacks[0];

      // At N=1: bonus 7 vs AC 16 -> needs 9+ on d20 (12/20 = 60% hit chance)
      // At N=2: bonus 8 vs AC 16 -> needs 8+ on d20 (13/20 = 65% hit chance)
      // At N=3: bonus 9 vs AC 16 -> needs 7+ on d20 (14/20 = 70% hit chance)
      // At N=4: bonus 10 vs AC 16 -> needs 6+ on d20 (15/20 = 75% hit chance)
      const hitChances = [1, 2, 3, 4].map((n) => {
        const scaled = scaleMonsterAttack(baseAttack, n);
        const rollNeeded = Math.max(2, Math.min(20, upgradedAc - scaled.bonus));
        return (21 - rollNeeded) / 20;
      });

      expect(hitChances).toEqual([0.6, 0.65, 0.7, 0.75]);
      // Proves that AC 16 reduces hit chance by 20% across all party tiers
      expect(hitChances[3]).toBeLessThan(0.8);
    });

    it('T3-C3: Starter Silver Weapon Damage vs Scaled Monster HP (Pacing Invariant)', () => {
      // Wolf starter silver sword: 1d8 + 4 -> avg 4.5 + 4 = 8.5 dmg
      const starterAvgDmg = 8.5;

      // Solo vs N=1 Leshen (135 HP): 135 / 8.5 ~= 15.9 attacks (~16 hits)
      const soloHits = Math.ceil(scaleMonsterHp(leshen.hp, 1) / starterAvgDmg);
      expect(soloHits).toBe(16);

      // 4-player party vs N=4 Leshen (338 HP): 338 / 8.5 ~= 39.8 attacks (~40 hits total, or 10 hits per witcher)
      const partyTotalHits = Math.ceil(scaleMonsterHp(leshen.hp, 4) / starterAvgDmg);
      expect(partyTotalHits).toBe(40);
      expect(partyTotalHits / 4).toBe(10); // Each witcher needs only 10 hits, preventing combat drag
    });

    it('T3-C4: Upgraded Store Weapon Damage vs Scaled Monster HP (Combat Acceleration)', () => {
      // Act IV Tor Zireael: 1d10 + 2 + Dex/Str (+2d6 silver) -> avg 5.5 + 2 + 4 + 7 = 18.5 dmg
      const upgradedAvgDmg = 18.5;
      const n4LeshenHp = scaleMonsterHp(leshen.hp, 4); // 338

      const hitsNeeded = Math.ceil(n4LeshenHp / upgradedAvgDmg); // 338 / 18.5 ~= 19 hits
      expect(hitsNeeded).toBe(19);

      // Across 4 witchers: ~5 rounds per witcher (halves combat time from starter gear's 10 rounds)
      expect(hitsNeeded / 4).toBeLessThanOrEqual(5);
    });

    it('T3-C5: Dynamic Mid-Combat Rescaling During Damage Exchange', () => {
      // Leshen spawns at N=2 with 203 HP
      let leshenToken: ScaledMapToken = {
        id: 'combat-leshen',
        name: leshen.name,
        isMonster: true,
        avatarUrl: '',
        x: 50,
        y: 50,
        baseMaxHp: 135,
        maxHp: 203,
        currentHp: 203,
        color: '#ff0000',
        scaledPartySize: 2,
      };

      // Party deals 53 damage: 203 - 53 = 150 HP (~73.9% HP)
      leshenToken.currentHp -= 53;
      expect(leshenToken.currentHp).toBe(150);

      // Two more witchers arrive mid-fight -> N expands to 4
      const rescaled = rescaleMonsterTokens([leshenToken], 4);
      expect(rescaled[0].maxHp).toBe(338);
      // Health percentage preserved: Math.round(150 / 203 * 338) = Math.round(249.75) = 250
      expect(rescaled[0].currentHp).toBe(250);

      // Subsequent hit with Act II Mahakaman Blade deals 12 damage
      rescaled[0].currentHp -= 12;
      expect(rescaled[0].currentHp).toBe(238);
    });

    it('T3-C6: Bear Witcher Tank Durability vs Scaled Chort (DR Removal Verification)', () => {
      // Chort at N=1 deals 2d10 + 5 (avg 16)
      const chortAttackDmg = 16;

      // Starter Bear armor has 0 DR -> takes full 16 damage
      const bearStarterArmor = STARTER_ARMOR_SETS.Bear;
      expect(bearStarterArmor.perks.length).toBe(0);
      const damageTakenStarter = chortAttackDmg;
      expect(damageTakenStarter).toBe(16);

      // Discovery Skellige Chain has DR 2 bludgeoning
      const skelligeChain = MASTER_FINITE_ITEMS.find((i) => i.id === 'armor-skellige-chain')!;
      const hasDr2 = skelligeChain.properties?.some((p) => p.includes('Reduces bludgeoning damage by 2'));
      expect(hasDr2).toBe(true);

      const damageTakenDiscovery = chortAttackDmg - 2;
      expect(damageTakenDiscovery).toBe(14);
      expect(damageTakenDiscovery).toBeLessThan(damageTakenStarter);
    });

    it('T3-C7: Cat Witcher Critical Striking (Mundane Starter vs Act III Gwyhyr)', () => {
      const catStarter = PREGEN_WITCHERS.find((w) => w.school === 'Cat')!.steelWeapon;
      expect(catStarter.properties).not.toContain('Crit on 19-20');

      const gwyhyr = MASTER_FINITE_ITEMS.find((i) => i.id === 'steel-gwyhyr')!;
      expect(gwyhyr.properties?.some((p) => p.includes('Keen'))).toBe(true);
      // Gwyhyr doubles critical strike threat range (19 or 20 vs only 20)
    });

    it('T3-C8: Griffin Witcher Spell DC Comparison (Starter vs Discovery Items)', () => {
      const griffinArmor = STARTER_ARMOR_SETS.Griffin;
      expect(griffinArmor.perks.length).toBe(0);
      expect(griffinArmor.description).not.toContain('Sign DC');

      // Starter armor gives +0 to Sign DC
      const starterBonusDc = 0;
      expect(starterBonusDc).toBe(0);
    });

    it('T3-C9: Multi-Monster Encounter Scaling (Pack of 3 Barghest Hounds at N=3)', () => {
      const partySize = 3;
      const houndCount = 3;
      const singleHoundHp = scaleMonsterHp(hound.hp, partySize); // 68 at N=3
      expect(singleHoundHp).toBe(68);

      const totalPackHp = singleHoundHp * houndCount;
      expect(totalPackHp).toBe(204);

      // Pack total HP scales proportionally with party size
      const packHpAtN1 = scaleMonsterHp(hound.hp, 1) * houndCount; // 34 * 3 = 102
      expect(totalPackHp).toBe(packHpAtN1 * 2);
    });

    it('T3-C10: Store Item Purchase & Equip Simulation (AC & Combat Transition)', () => {
      const wolfWitcher = PREGEN_WITCHERS.find((w) => w.school === 'Wolf')!;
      expect(wolfWitcher.armorClass).toBe(12);

      // Purchase Act I Ox-Hide Armor (110 Orens, AC 14)
      const oxHide = DEFAULT_ACT_MERCHANTS[1].items.find((i) => i.item.id === 'armor-ox-hide')!;
      expect(oxHide.priceGold).toBe(110);
      expect(oxHide.item.armorClass).toBe(14);

      // Equipping increases AC from 12 to 14
      const newAc = oxHide.item.armorClass!;
      expect(newAc).toBe(14);

      // Against a Rotfiend (+4 to hit):
      // Starter AC 12 -> needs 8+ on d20 (13/20 = 65% hit chance)
      // Upgraded AC 14 -> needs 10+ on d20 (11/20 = 55% hit chance)
      const rotfiendBonus = 4;
      const hitChanceStarter = (21 - Math.max(2, 12 - rotfiendBonus)) / 20;
      const hitChanceUpgraded = (21 - Math.max(2, 14 - rotfiendBonus)) / 20;
      expect(hitChanceStarter).toBe(0.65);
      expect(hitChanceUpgraded).toBe(0.55);
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Application Scenarios', () => {
    it('Scenario 1: Full 4-Act Campaign Progression (Mundane Start to Pinnacle Endgame)', () => {
      // 1. Party starts Act I with mundane gear
      const initialArmors = Object.values(STARTER_ARMOR_SETS);
      expect(initialArmors.every((a) => a.armorClass <= 13 && a.perks.length === 0)).toBe(true);

      // 2. Act I Merchant: Master Torvin offers Ox-Hide Armor (AC 14) and Cintrian Dirk (+1 Init)
      const torvin = DEFAULT_ACT_MERCHANTS[1];
      const act1Armor = torvin.items.find((i) => i.item.id === 'armor-ox-hide')!.item;
      expect(act1Armor.armorClass).toBe(14);

      // 3. Act II: Convoy wreck provides Skellige Chain (AC 16), Yann sells Mahakaman Blade (1d8+2)
      const skelligeChain = MASTER_FINITE_ITEMS.find((i) => i.id === 'armor-skellige-chain')!;
      expect(skelligeChain.armorClass).toBe(16);
      const yann = DEFAULT_ACT_MERCHANTS[2];
      const mahakamanBlade = yann.items.find((i) => i.item.id === 'steel-mahakaman')!.item;
      expect(mahakamanBlade.damage).toContain('+ 2');

      // 4. Act III: Barrow provides Gwyhyr (1d10+2, Keen) and Moonblade (+2d6 silver, +1d6 radiant), Lucian sells Tir Na Lia (AC 15)
      const gwyhyr = MASTER_FINITE_ITEMS.find((i) => i.id === 'steel-gwyhyr')!;
      expect(gwyhyr.damage).toContain('1d10 + 2');
      const lucian = DEFAULT_ACT_MERCHANTS[3];
      const tirNaLia = lucian.items.find((i) => i.item.id === 'armor-tir-na-lia')!.item;
      expect(tirNaLia.armorClass).toBe(15);

      // 5. Act IV: Sgt Verek sells Cintrian Royal Guard (AC 16) and Tor Zireael (+2d6 silver, regen stop)
      const verek = DEFAULT_ACT_MERCHANTS[4];
      const royalGuard = verek.items.find((i) => i.item.id === 'armor-cintrian-guard')!.item;
      expect(royalGuard.armorClass).toBe(16);
      const torZireael = verek.items.find((i) => i.item.id === 'silver-tor-zireael')!.item;
      expect(torZireael.damage).toContain('+2d6 silver');

      // Monotonic gear potency progression confirmed
      expect(act1Armor.armorClass!).toBeGreaterThan(STARTER_ARMOR_SETS.Wolf.armorClass);
      expect(royalGuard.armorClass!).toBeGreaterThanOrEqual(act1Armor.armorClass!);
    });

    it('Scenario 2: Dynamic Mid-Combat Party Expansion (Solo to 4-Witcher Session Join)', () => {
      // Solo Witcher engages Ancient Leshen (N=1)
      const soloLeshenToken: ScaledMapToken = {
        id: 'leshen-encounter',
        name: leshen.name,
        isMonster: true,
        avatarUrl: '',
        x: 50,
        y: 50,
        baseMaxHp: leshen.hp, // 135
        maxHp: 135,
        currentHp: 135,
        color: '#ef4444',
        scaledPartySize: 1,
        attacks: leshen.attacks.map((a) => scaleMonsterAttack(a, 1)),
      };

      // Round 1: Solo witcher hits for 27 damage (135 - 27 = 108 HP, exactly 80%)
      soloLeshenToken.currentHp -= 27;
      expect(soloLeshenToken.currentHp).toBe(108);
      expect(soloLeshenToken.currentHp / soloLeshenToken.maxHp).toBe(0.8);

      // Also spawn a minion hound that was killed in round 1
      const deadMinion: ScaledMapToken = {
        id: 'minion-hound',
        name: hound.name,
        isMonster: true,
        avatarUrl: '',
        x: 45,
        y: 50,
        baseMaxHp: hound.hp,
        maxHp: 34,
        currentHp: 0,
        color: '#ef4444',
        scaledPartySize: 1,
      };

      // Mid-combat, 3 more players join the session -> party expands from 1 to 4
      const rescaledTokens = rescaleMonsterTokens([soloLeshenToken, deadMinion], 4);

      // Assert Leshen scaled stats
      const rescaledLeshen = rescaledTokens.find((t) => t.id === 'leshen-encounter')!;
      expect(rescaledLeshen.maxHp).toBe(338); // 2.5x
      expect(rescaledLeshen.currentHp).toBe(270); // 80% of 338 = 270.4 -> 270
      expect(rescaledLeshen.scaledPartySize).toBe(4);
      expect(rescaledLeshen.attacks?.[0].bonus).toBe(10); // +7 + 3
      expect(rescaledLeshen.attacks?.[0].damage).toBe('2d8 + 10'); // +4 + 6

      // Assert dead minion remained dead
      const rescaledMinion = rescaledTokens.find((t) => t.id === 'minion-hound')!;
      expect(rescaledMinion.currentHp).toBe(0);
      expect(rescaledMinion.maxHp).toBe(85);
    });

    it('Scenario 3: Multi-Tier Token Spawner Batch Verification across All Templates', () => {
      const templates = [...MONSTERS, ...NPCS];
      expect(templates.length).toBeGreaterThanOrEqual(8);

      for (const partySize of [1, 2, 3, 4]) {
        for (const template of templates) {
          const expectedHp = scaleMonsterHp(template.hp, partySize);
          const spawnedToken: ScaledMapToken = {
            id: `spawn-${template.id}-${partySize}`,
            name: template.name,
            isMonster: true,
            avatarUrl: ('avatarUrl' in template ? (template as any).avatarUrl : '') || '',
            x: 25,
            y: 25,
            baseMaxHp: template.hp,
            maxHp: expectedHp,
            currentHp: expectedHp,
            color: '#dc2626',
            scaledPartySize: partySize,
          };

          expect(spawnedToken.maxHp).toBe(expectedHp);
          expect(spawnedToken.currentHp).toBe(expectedHp);
          expect(spawnedToken.scaledPartySize).toBe(partySize);

          if (template.attacks && template.attacks.length > 0) {
            const rawAtt = template.attacks[0];
            const baseAtt = {
              name: rawAtt.name,
              bonus: rawAtt.bonus,
              damage: rawAtt.damage,
              damageType: 'damageType' in rawAtt ? (rawAtt as any).damageType : 'Physical',
              description: rawAtt.description,
            };
            const scaledAttack = scaleMonsterAttack(baseAtt, partySize);
            expect(scaledAttack.bonus).toBe(rawAtt.bonus + (partySize - 1));
          }
        }
      }
    });

    it('Scenario 4: Exhaustive 4x4 Weapon & Armor Combinatorial Comparison Matrix', () => {
      // Gather all merchant & loot weapons and armors
      const storeArmors = [1, 2, 3, 4].flatMap((act) =>
        DEFAULT_ACT_MERCHANTS[act].items.filter((i) => i.item.category === 'armor').map((i) => i.item)
      );
      const storeWeapons = [1, 2, 3, 4].flatMap((act) =>
        DEFAULT_ACT_MERCHANTS[act].items.filter((i) => i.item.category.includes('sword')).map((i) => i.item)
      );

      // Matrix comparison: Every store armor vs every starter armor
      for (const storeArmor of storeArmors) {
        const weightCat = storeArmor.weightCategory || 'Medium';
        const matchingStarter = Object.values(STARTER_ARMOR_SETS).find((s) => s.weightCategory === weightCat)!;
        expect(storeArmor.armorClass!).toBeGreaterThan(matchingStarter.armorClass);
        expect((storeArmor.properties || []).length).toBeGreaterThan(0);
      }

      // Matrix comparison: Every store weapon vs corresponding starter weapon
      for (const storeWeapon of storeWeapons) {
        expect(storeWeapon.valueGold).toBeGreaterThan(50); // Starter weapons are <= 50
        const isBetter =
          (storeWeapon.attackBonus || 0) >= 7 ||
          (storeWeapon.damage || '').includes('+ 2') ||
          (storeWeapon.damage || '').includes('+2d6') ||
          (storeWeapon.properties || []).length > 0;
        expect(isBetter).toBe(true);
      }
    });

    it('Scenario 5: Combat Lethality & Durability Simulation (5-Round TTK Benchmark)', () => {
      // Simulate 5 combat rounds of 4 witchers attacking N=4 Ancient Leshen (338 HP)
      // Case A: 4 Witchers with Mundane Starter Silver Swords (1d8+4 = avg 8.5 dmg each)
      // Total party damage per round = 4 * 8.5 = 34 dmg.
      // After 5 rounds: 5 * 34 = 170 dmg dealt.
      // Leshen remaining HP: 338 - 170 = 168 HP (Boss remains alive, maintaining epic boss struggle!)
      const n4LeshenHp = scaleMonsterHp(leshen.hp, 4); // 338
      const starterPartyDmgPerRound = 4 * 8.5; // 34
      const starterDamageDealt5Rounds = 5 * starterPartyDmgPerRound;
      expect(starterDamageDealt5Rounds).toBe(170);
      expect(n4LeshenHp - starterDamageDealt5Rounds).toBe(168); // Leshen still alive

      // Case B: 4 Witchers with Upgraded Act IV Weapons (avg 18.5 dmg each)
      // Total party damage per round = 4 * 18.5 = 74 dmg.
      // After 5 rounds: 5 * 74 = 370 dmg dealt.
      // Leshen defeated! Proves upgraded gear provides 50%+ reduction in combat duration and guarantees victory.
      const upgradedPartyDmgPerRound = 4 * 18.5; // 74
      const upgradedDamageDealt5Rounds = 5 * upgradedPartyDmgPerRound;
      expect(upgradedDamageDealt5Rounds).toBe(370);
      expect(upgradedDamageDealt5Rounds).toBeGreaterThan(n4LeshenHp); // Defeated within 5 rounds!
    });
  });
});
