import { describe, it, expect } from 'vitest';
import { STARTER_ARMOR_SETS, MASTER_FINITE_ITEMS } from '../data/items';
import { PREGEN_WITCHERS } from '../data/characters';
import { WitcherSchool } from '../types';

describe('CHALLENGER 1: Empirical Verification Harness for Milestone M1 (Starter Gear)', () => {
  const SCHOOLS: WitcherSchool[] = ['Wolf', 'Cat', 'Griffin', 'Bear'];
  const BONUS_DICE_REGEX = /\+\s*\d+d\d+/i;
  const BANNED_PROPERTIES_REGEX = /meteorite|runic|rune|masterwork|sunder|knockback|keen|crit on 19|bane of relicts|sign dc|sign focus|vigor recovery/i;

  // ----------------------------------------------------
  // SECTION 1: Pregen Characters (src/data/characters.ts)
  // ----------------------------------------------------
  describe('1. Pregen Characters Baseline Verification', () => {
    it('1.1: Every pregen character has armorClass <= 13', () => {
      expect(PREGEN_WITCHERS.length).toBe(4);
      for (const witcher of PREGEN_WITCHERS) {
        expect(witcher.armorClass).toBeLessThanOrEqual(13);
        expect(witcher.armorClass).toBeGreaterThanOrEqual(10);
      }
      expect(PREGEN_WITCHERS.find(w => w.school === 'Wolf')!.armorClass).toBe(12);
      expect(PREGEN_WITCHERS.find(w => w.school === 'Cat')!.armorClass).toBe(11);
      expect(PREGEN_WITCHERS.find(w => w.school === 'Griffin')!.armorClass).toBe(13);
      expect(PREGEN_WITCHERS.find(w => w.school === 'Bear')!.armorClass).toBe(13);
    });

    it('1.2: steelWeapon.damage contains NO bonus dice on any character', () => {
      for (const witcher of PREGEN_WITCHERS) {
        const damage = witcher.steelWeapon.damage;
        expect(BONUS_DICE_REGEX.test(damage)).toBe(false);
      }
      expect(PREGEN_WITCHERS.find(w => w.school === 'Wolf')!.steelWeapon.damage).toBe('1d8 + 4 (1d10 + 4 versatile)');
      expect(PREGEN_WITCHERS.find(w => w.school === 'Cat')!.steelWeapon.damage).toBe('1d6 + 5');
      expect(PREGEN_WITCHERS.find(w => w.school === 'Griffin')!.steelWeapon.damage).toBe('1d8 + 2 (1d10 + 2 versatile)');
      expect(PREGEN_WITCHERS.find(w => w.school === 'Bear')!.steelWeapon.damage).toBe('2d6 + 4');
    });

    it('1.3: silverWeapon.damage contains NO bonus dice on any character', () => {
      for (const witcher of PREGEN_WITCHERS) {
        const damage = witcher.silverWeapon.damage;
        expect(BONUS_DICE_REGEX.test(damage)).toBe(false);
      }
      expect(PREGEN_WITCHERS.find(w => w.school === 'Wolf')!.silverWeapon.damage).toBe('1d8 + 4 (1d10 + 4 versatile)');
      expect(PREGEN_WITCHERS.find(w => w.school === 'Cat')!.silverWeapon.damage).toBe('1d6 + 5');
      expect(PREGEN_WITCHERS.find(w => w.school === 'Griffin')!.silverWeapon.damage).toBe('1d8 + 2 (1d10 + 2 versatile)');
      expect(PREGEN_WITCHERS.find(w => w.school === 'Bear')!.silverWeapon.damage).toBe('2d6 + 4');
    });

    it('1.4: Weapons contain no masterwork, runic, or advanced combat perks in properties', () => {
      for (const witcher of PREGEN_WITCHERS) {
        const allProps = [
          ...witcher.steelWeapon.properties,
          ...witcher.silverWeapon.properties,
        ];
        for (const prop of allProps) {
          expect(BANNED_PROPERTIES_REGEX.test(prop)).toBe(false);
        }
      }
    });

    it('1.5: Pregen initial inventory is clean and empty (no smuggled gear)', () => {
      for (const witcher of PREGEN_WITCHERS) {
        expect(witcher.inventory).toEqual([]);
      }
    });

    it('1.6: Bear mutations do not grant flat AC override to 18', () => {
      const bear = PREGEN_WITCHERS.find(w => w.school === 'Bear')!;
      for (const mutation of bear.mutations) {
        expect(mutation.toLowerCase()).not.toContain('base ac is 18');
        expect(mutation.toLowerCase()).not.toContain('ac is 18');
      }
    });

    it('1.7: Roleplay text and backstory do not reference legacy 18 AC or 2d6+4+2d6 greatsword', () => {
      const bear = PREGEN_WITCHERS.find(w => w.school === 'Bear')!;
      expect(bear.roleplayGuide).toBeDefined();
      expect(bear.roleplayGuide!.whatMakesYouDifferent).toContain('13 AC');
      expect(bear.roleplayGuide!.whatMakesYouDifferent).not.toContain('18 AC');
      expect(bear.roleplayGuide!.combatPhilosophy).toContain('2d6+4 greatsword');
      expect(bear.roleplayGuide!.combatPhilosophy).not.toContain('2d6+4+2d6');
    });
  });

  // ----------------------------------------------------
  // SECTION 2: Starter Armors (STARTER_ARMOR_SETS in items.ts)
  // ----------------------------------------------------
  describe('2. Starter Armor Baseline Verification', () => {
    it('2.1: Every starter armor has perks.length === 0', () => {
      for (const school of SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        expect(armor.perks).toBeDefined();
        expect(armor.perks.length).toBe(0);
      }
    });

    it('2.2: Every starter armor has armorClass <= 13', () => {
      for (const school of SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        expect(armor.armorClass).toBeLessThanOrEqual(13);
        expect(armor.armorClass).toBeGreaterThanOrEqual(10);
      }
      expect(STARTER_ARMOR_SETS.Wolf.armorClass).toBe(12);
      expect(STARTER_ARMOR_SETS.Cat.armorClass).toBe(11);
      expect(STARTER_ARMOR_SETS.Griffin.armorClass).toBe(13);
      expect(STARTER_ARMOR_SETS.Bear.armorClass).toBe(13);
    });

    it('2.3: Starter armor descriptions contain no damage reduction or sign boost mechanics', () => {
      const bannedTerms = [
        /reduces (?:all|bludgeoning|slashing|piercing) damage/i,
        /dr 2/i,
        /\+1 to witcher signs/i,
        /\+5 bonus temp hp/i,
        /fluid riposte/i,
      ];
      for (const school of SCHOOLS) {
        const desc = STARTER_ARMOR_SETS[school].description;
        for (const pattern of bannedTerms) {
          expect(pattern.test(desc)).toBe(false);
        }
      }
    });

    it('2.4: Starter armor values are mundane (<= 35 Gold)', () => {
      for (const school of SCHOOLS) {
        expect(STARTER_ARMOR_SETS[school].valueGold).toBeLessThanOrEqual(35);
        expect(STARTER_ARMOR_SETS[school].valueGold).toBeGreaterThan(0);
      }
    });
  });

  // ----------------------------------------------------
  // SECTION 3: Starter Weapons (MASTER_FINITE_ITEMS in items.ts)
  // ----------------------------------------------------
  describe('3. Starter Weapons Baseline Verification', () => {
    const starterSteel = MASTER_FINITE_ITEMS.filter(
      i => i.category === 'steel_sword' && i.id.endsWith('-starter')
    );
    const starterSilver = MASTER_FINITE_ITEMS.filter(
      i => i.category === 'silver_sword' && i.id.endsWith('-starter')
    );

    it('3.1: Exactly 4 starter steel and 4 starter silver weapons exist in catalog', () => {
      expect(starterSteel.length).toBe(4);
      expect(starterSilver.length).toBe(4);
    });

    it('3.2: Zero bonus dice on all starter steel and silver weapons', () => {
      for (const weapon of [...starterSteel, ...starterSilver]) {
        expect(weapon.damage).toBeDefined();
        expect(BONUS_DICE_REGEX.test(weapon.damage!)).toBe(false);
      }
    });

    it('3.3: Zero runic, masterwork, or advanced perks on starter weapons', () => {
      for (const weapon of [...starterSteel, ...starterSilver]) {
        const props = weapon.properties || [];
        for (const prop of props) {
          expect(BANNED_PROPERTIES_REGEX.test(prop)).toBe(false);
        }
      }
    });

    it('3.4: All starter weapons have Common rarity and mundane gold values (<= 50)', () => {
      for (const weapon of [...starterSteel, ...starterSilver]) {
        expect(weapon.rarity).toBe('Common');
        expect(weapon.valueGold).toBeLessThanOrEqual(50);
        expect(weapon.valueGold).toBeGreaterThan(0);
      }
    });

    it('3.5: All starter weapons in MASTER_FINITE_ITEMS are equipped: true and assigned to schools', () => {
      for (const weapon of [...starterSteel, ...starterSilver]) {
        expect(weapon.equipped).toBe(true);
        expect(weapon.assignedToSchool).toBeDefined();
        expect(weapon.assignedToSchool).not.toBe('DM_VAULT');
      }
    });
  });

  // ----------------------------------------------------
  // SECTION 4: Cross-Module Data Synchronization
  // ----------------------------------------------------
  describe('4. Cross-Module Data Synchronization', () => {
    it('4.1: Pregen equippedArmor matches STARTER_ARMOR_SETS exactly', () => {
      for (const witcher of PREGEN_WITCHERS) {
        const starterArmor = STARTER_ARMOR_SETS[witcher.school];
        expect(witcher.equippedArmor).toEqual(starterArmor);
        expect(witcher.armorClass).toBe(starterArmor.armorClass);
      }
    });

    it('4.2: Pregen weapon names and attack bonuses match MASTER_FINITE_ITEMS', () => {
      for (const witcher of PREGEN_WITCHERS) {
        const schoolLower = witcher.school.toLowerCase();
        const catalogSteel = MASTER_FINITE_ITEMS.find(i => i.id === `steel-${schoolLower}-starter`)!;
        const catalogSilver = MASTER_FINITE_ITEMS.find(i => i.id === `silver-${schoolLower}-starter`)!;

        expect(witcher.steelWeapon.name).toBe(catalogSteel.name);
        expect(witcher.steelWeapon.attackBonus).toBe(catalogSteel.attackBonus);

        expect(witcher.silverWeapon.name).toBe(catalogSilver.name);
        expect(witcher.silverWeapon.attackBonus).toBe(catalogSilver.attackBonus);
      }
    });
  });
});
