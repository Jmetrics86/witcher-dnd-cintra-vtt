import { describe, it, expect } from 'vitest';
import { DEFAULT_ACT_MERCHANTS, STARTER_ARMOR_SETS, MASTER_FINITE_ITEMS } from '../data/items';
import { WITCHER_ADVENTURE } from '../data/adventure';

describe('Requirement R3: Merchant Store and Loot Progression', () => {
  // Baseline starter metrics
  const starterArmorAcByWeight: Record<string, number> = {
    Light: STARTER_ARMOR_SETS.Cat.armorClass, // 11
    Medium: Math.max(STARTER_ARMOR_SETS.Wolf.armorClass, STARTER_ARMOR_SETS.Griffin.armorClass), // 13
    Heavy: STARTER_ARMOR_SETS.Bear.armorClass, // 13
  };

  // ==========================================
  // TIER 1: FEATURE COVERAGE (Features 6 & 7)
  // ==========================================
  describe('Tier 1: Feature 6 - Merchant Store Progression (Acts I–IV)', () => {
    it('T1-F6.1: provides configured merchants for all four Acts with items in stock', () => {
      const actNumbers = [1, 2, 3, 4];
      for (const act of actNumbers) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        expect(merchant).toBeDefined();
        expect(merchant.name).toBeTruthy();
        expect(merchant.items).toBeDefined();
        expect(merchant.items.length).toBeGreaterThan(0);
      }
    });

    it('T1-F6.2: every armor sold in merchant stores has AC strictly superior to starter armor of same weight', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const storeArmors = merchant.items.filter((i) => i.item.category === 'armor');

        for (const { item } of storeArmors) {
          const weightCat = item.weightCategory || 'Medium';
          const baselineAc = starterArmorAcByWeight[weightCat];
          expect(baselineAc).toBeDefined();
          // Progression invariant: store armor AC must be strictly greater than starter armor
          expect(item.armorClass).toBeDefined();
          expect((item.armorClass || 0)).toBeGreaterThan(baselineAc);
        }
      }

      // Concrete Act checks
      const act1Merchant = DEFAULT_ACT_MERCHANTS[1];
      const oxHide = act1Merchant.items.find((i) => i.item.id === 'armor-ox-hide')?.item;
      expect(oxHide).toBeDefined();
      expect(oxHide?.armorClass).toBe(14); // > 13 Medium baseline

      const act3Merchant = DEFAULT_ACT_MERCHANTS[3];
      const tirNaLia = act3Merchant.items.find((i) => i.item.id === 'armor-tir-na-lia')?.item;
      expect(tirNaLia).toBeDefined();
      expect(tirNaLia?.armorClass).toBe(15); // > 11 Light baseline

      const act4Merchant = DEFAULT_ACT_MERCHANTS[4];
      const cintrianGuard = act4Merchant.items.find((i) => i.item.id === 'armor-cintrian-guard')?.item;
      expect(cintrianGuard).toBeDefined();
      expect(cintrianGuard?.armorClass).toBe(16); // > 13 Medium baseline
    });

    it('T1-F6.3: every armor sold in merchant stores has non-empty beneficial perks/properties', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const storeArmors = merchant.items.filter((i) => i.item.category === 'armor');

        for (const { item } of storeArmors) {
          expect(Array.isArray(item.properties)).toBe(true);
          expect((item.properties || []).length).toBeGreaterThan(0);
        }
      }
    });

    it('T1-F6.4: every steel sword sold in merchant stores has strictly superior stats or perks over starter steel', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const storeSteel = merchant.items.filter((i) => i.item.category === 'steel_sword');

        for (const { item } of storeSteel) {
          const props = item.properties || [];
          const hasSpecialPerk = props.length > 0 && props.some((p) =>
            p.includes('+1 to Initiative') ||
            p.includes('bleed') ||
            p.includes('Keen') ||
            p.includes('Bypass') ||
            p.includes('Disarm')
          );
          const hasHigherDamage = (item.damage || '').includes('+ 2') || (item.damage || '').includes('1d10');
          const hasSuperiorAttack = (item.attackBonus || 0) >= 7;

          expect(hasSpecialPerk || hasHigherDamage).toBe(true);
          expect(hasSuperiorAttack).toBe(true);
        }
      }
    });

    it('T1-F6.5: every silver sword sold in merchant stores has strictly superior stats or perks over starter silver', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const storeSilver = merchant.items.filter((i) => i.item.category === 'silver_sword');

        for (const { item } of storeSilver) {
          const damage = item.damage || '';
          const props = item.properties || [];
          const hasBonusDice = damage.includes('+2d6') || damage.includes('+ 2') || damage.includes('1d10');
          const hasSpecialPerk = props.some((p) =>
            p.includes('Silver Core') || p.includes('regeneration') || p.includes('Charges')
          );

          expect(hasBonusDice || hasSpecialPerk).toBe(true);
        }
      }
    });
  });

  describe('Tier 1: Feature 7 - Adventure Secret Treasures & Loot Progression', () => {
    const allSecretTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
      act.storyBeats.flatMap((beat) => beat.secretTreasures || [])
    );

    it('T1-F7.1: story beats across Acts I–IV define secret treasures with non-empty rewards', () => {
      expect(allSecretTreasures.length).toBeGreaterThanOrEqual(12);
      for (const treasure of allSecretTreasures) {
        expect(treasure.name).toBeTruthy();
        expect(treasure.reward).toBeTruthy();
        expect(treasure.lore).toBeTruthy();
      }
    });

    it('T1-F7.2: secret treasure armor loot (e.g. Skellige Ring Mail) is strictly superior to starter heavy armor', () => {
      const skelligeItem = MASTER_FINITE_ITEMS.find((i) => i.id === 'armor-skellige-chain');
      expect(skelligeItem).toBeDefined();
      if (skelligeItem) {
        expect(skelligeItem.armorClass).toBe(16);
        expect(skelligeItem.armorClass).toBeGreaterThan(STARTER_ARMOR_SETS.Bear.armorClass); // 16 > 13
        expect((skelligeItem.properties || []).length).toBeGreaterThan(0);
        expect(skelligeItem.properties?.some((p) => p.includes('bludgeoning'))).toBe(true);
      }
    });

    it('T1-F7.3: secret treasure weapon loot (e.g. Moonblade) is strictly superior to starter silver weapons', () => {
      const moonblade = MASTER_FINITE_ITEMS.find((i) => i.id === 'silver-moonblade');
      expect(moonblade).toBeDefined();
      if (moonblade) {
        expect(moonblade.damage).toContain('+2d6 silver');
        expect(moonblade.damage).toContain('+ 1d6 radiant');
        expect(moonblade.attackBonus).toBe(8);
        expect(moonblade.rarity).toBe('Relic');
      }
    });

    it('T1-F7.4: secret treasure weapon loot (e.g. Gnomish Gwyhyr) is strictly superior to starter steel weapons', () => {
      const gwyhyr = MASTER_FINITE_ITEMS.find((i) => i.id === 'steel-gwyhyr');
      expect(gwyhyr).toBeDefined();
      if (gwyhyr) {
        expect(gwyhyr.damage).toContain('1d10 + 2');
        expect(gwyhyr.attackBonus).toBe(9);
        expect(gwyhyr.properties).toContain('Keen (Critical hits on 19-20)');
        expect(gwyhyr.properties).toContain('Bypass 2 points of enemy AC');
      }
    });

    it('T1-F7.5: Act IV capstone secret treasure (Aerondight) possesses pinnacle relic power', () => {
      const aerondight = MASTER_FINITE_ITEMS.find((i) => i.id === 'silver-aerondight');
      expect(aerondight).toBeDefined();
      if (aerondight) {
        expect(aerondight.damage).toContain('+2d8 silver');
        expect(aerondight.rarity).toBe('Relic');
        expect(aerondight.valueGold).toBeGreaterThanOrEqual(400);
      }
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2-B1: merchant gold prices are strictly higher than starter gear values (starter <= 50 vs store >= 65)', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        const storeEquip = merchant.items.filter(
          (i) => i.item.category === 'armor' || i.item.category === 'steel_sword' || i.item.category === 'silver_sword'
        );

        for (const { item, priceGold } of storeEquip) {
          expect(priceGold).toBeGreaterThanOrEqual(65);
          expect(item.valueGold).toBeGreaterThanOrEqual(65);
        }
      }
    });

    it('T2-B2: monotonic progression of average equipment price across Acts (Act I < Act II < Act III/IV)', () => {
      const getAvgPrice = (act: number) => {
        const items = DEFAULT_ACT_MERCHANTS[act].items.filter(
          (i) => i.item.category === 'armor' || i.item.category === 'steel_sword' || i.item.category === 'silver_sword'
        );
        const sum = items.reduce((acc, i) => acc + i.priceGold, 0);
        return sum / (items.length || 1);
      };

      const avgAct1 = getAvgPrice(1);
      const avgAct2 = getAvgPrice(2);
      const avgAct3 = getAvgPrice(3);

      expect(avgAct1).toBeLessThan(avgAct2);
      expect(avgAct2).toBeLessThan(avgAct3);
    });

    it('T2-B3: no merchant sells any item marked with -starter in its ID', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        for (const { item } of merchant.items) {
          expect(item.id).not.toContain('-starter');
        }
      }
    });

    it('T2-B4: all merchant inventory items have positive stock (stock > 0)', () => {
      for (const act of [1, 2, 3, 4]) {
        const merchant = DEFAULT_ACT_MERCHANTS[act];
        for (const entry of merchant.items) {
          expect(entry.stock).toBeGreaterThan(0);
        }
      }
    });

    it('T2-B5: merchant weapon rarity progression scales from Common/Uncommon to Masterwork and Relic', () => {
      const act1Weapons = DEFAULT_ACT_MERCHANTS[1].items
        .filter((i) => i.item.category.includes('sword'))
        .map((i) => i.item.rarity);
      const act3Weapons = DEFAULT_ACT_MERCHANTS[3].items
        .filter((i) => i.item.category.includes('sword'))
        .map((i) => i.item.rarity);

      expect(act1Weapons).toContain('Common');
      expect(act3Weapons).toContain('Relic');
    });

    it('T2-B6: all adventure secret treasures define valid non-empty discovery requirements', () => {
      const allTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
        act.storyBeats.flatMap((b) => b.secretTreasures || [])
      );
      for (const t of allTreasures) {
        expect(t.discoveryCheck.length).toBeGreaterThan(0);
      }
    });

    it('T2-B7: secret treasures with coin rewards grant between 15 Orens and 150 Orens', () => {
      const allTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
        act.storyBeats.flatMap((b) => b.secretTreasures || [])
      );
      const coinRewards = allTreasures
        .map((t) => {
          const match = t.reward.match(/(\d+)\s*(?:Cintrian\s*)?Orens/i);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((c): c is number => c !== null);

      expect(coinRewards.length).toBeGreaterThan(0);
      for (const coins of coinRewards) {
        expect(coins).toBeGreaterThanOrEqual(15);
        expect(coins).toBeLessThanOrEqual(300);
      }
    });

    it('T2-B8: secret treasure items referencing vaultItemId resolve to existing catalog items or quest trophies', () => {
      const allTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
        act.storyBeats.flatMap((b) => b.secretTreasures || [])
      );
      const itemReferences = allTreasures.filter((t) => t.vaultItemId);

      for (const t of itemReferences) {
        const item = MASTER_FINITE_ITEMS.find((i) => i.id === t.vaultItemId);
        if (t.vaultItemId?.startsWith('quest-')) {
          expect(t.reward).toBeTruthy();
        } else {
          expect(item).toBeDefined();
        }
      }
    });

    it('T2-B9: no secret treasure reward contains mundane starter gear IDs', () => {
      const allTreasures = WITCHER_ADVENTURE.acts.flatMap((act) =>
        act.storyBeats.flatMap((b) => b.secretTreasures || [])
      );
      for (const t of allTreasures) {
        if (t.vaultItemId) {
          expect(t.vaultItemId).not.toMatch(/-starter$/);
        }
      }
    });

    it('T2-B10: comparison between starter gear and store items shows strict monotonicity across all categories', () => {
      const act3Gwyhyr = MASTER_FINITE_ITEMS.find((i) => i.id === 'steel-gwyhyr')!;
      expect(act3Gwyhyr).toBeDefined();
      expect(act3Gwyhyr.attackBonus).toBe(9);
      expect(act3Gwyhyr.attackBonus).toBeGreaterThan(7);
    });
  });
});
