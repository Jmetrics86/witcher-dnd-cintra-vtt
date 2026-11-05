import { describe, it, expect } from 'vitest';
import { STARTER_ARMOR_SETS, MASTER_FINITE_ITEMS } from '../data/items';
import { PREGEN_WITCHERS } from '../data/characters';
import { WitcherSchool } from '../types';

describe('Requirement R2: Weak Non-Magical Starter Gear', () => {
  const ALL_SCHOOLS: WitcherSchool[] = ['Wolf', 'Cat', 'Griffin', 'Bear'];

  // ==========================================
  // TIER 1: FEATURE COVERAGE (Features 4 & 5)
  // ==========================================
  describe('Tier 1: Feature 4 - Mundane Starter Armor Sets', () => {
    it('T1-F4.1: defines starter armor sets for all four witcher schools', () => {
      expect(STARTER_ARMOR_SETS).toBeDefined();
      for (const school of ALL_SCHOOLS) {
        expect(STARTER_ARMOR_SETS[school]).toBeDefined();
        expect(STARTER_ARMOR_SETS[school].id).toBe(`armor-${school.toLowerCase()}-starter`);
      }
    });

    it('T1-F4.2: all starter armor sets have armorClass <= 13', () => {
      for (const school of ALL_SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        expect(armor.armorClass).toBeLessThanOrEqual(13);
      }
      expect(STARTER_ARMOR_SETS.Wolf.armorClass).toBe(12);
      expect(STARTER_ARMOR_SETS.Cat.armorClass).toBe(11);
      expect(STARTER_ARMOR_SETS.Griffin.armorClass).toBe(13);
      expect(STARTER_ARMOR_SETS.Bear.armorClass).toBe(13);
    });

    it('T1-F4.3: all starter armor sets have strictly 0 perks', () => {
      for (const school of ALL_SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        expect(Array.isArray(armor.perks)).toBe(true);
        expect(armor.perks.length).toBe(0);
      }
    });

    it('T1-F4.4: starter armor gold values do not exceed 35 Orens', () => {
      for (const school of ALL_SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        expect(armor.valueGold).toBeLessThanOrEqual(35);
        expect(armor.valueGold).toBeGreaterThan(0);
      }
    });

    it('T1-F4.5: starter armors provide no damage reduction perks or mechanics', () => {
      // Perks must not contain damage reduction
      for (const school of ALL_SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        for (const perk of armor.perks) {
          expect(perk.toLowerCase()).not.toMatch(/damage reduction|reduces (?:all|bludgeoning|slashing|piercing)/i);
        }
        // Description must not grant damage reduction
        expect(armor.description.toLowerCase()).not.toMatch(/reduces (?:all|bludgeoning|slashing|piercing) damage by \d+/i);
        expect(armor.description.toLowerCase()).not.toContain('dr 2');
      }
    });

    it('T1-F4.6: starter armor descriptions contain no magic sign boost keywords', () => {
      const bannedSignTerms = [
        'sign dc',
        'witcher signs',
        'quen shield',
        'temp hp',
        'fluid riposte',
        'parry reactions',
      ];
      for (const school of ALL_SCHOOLS) {
        const desc = STARTER_ARMOR_SETS[school].description.toLowerCase();
        for (const term of bannedSignTerms) {
          expect(desc).not.toContain(term);
        }
      }
    });
  });

  describe('Tier 1: Feature 5 - Mundane Starter Weapons', () => {
    const starterSteelIds = [
      'steel-wolf-starter',
      'steel-cat-starter',
      'steel-griffin-starter',
      'steel-bear-starter',
    ];
    const starterSilverIds = [
      'silver-wolf-starter',
      'silver-cat-starter',
      'silver-griffin-starter',
      'silver-bear-starter',
    ];

    it('T1-F5.1: starter steel weapons have mundane baseline damage strings', () => {
      const steelItems = MASTER_FINITE_ITEMS.filter((i) => starterSteelIds.includes(i.id));
      expect(steelItems.length).toBe(4);

      const catSteel = steelItems.find((i) => i.id === 'steel-cat-starter')!;
      expect(catSteel.damage).toContain('1d6');

      const wolfSteel = steelItems.find((i) => i.id === 'steel-wolf-starter')!;
      expect(wolfSteel.damage).toContain('1d8');

      const griffinSteel = steelItems.find((i) => i.id === 'steel-griffin-starter')!;
      expect(griffinSteel.damage).toContain('1d8');

      const bearSteel = steelItems.find((i) => i.id === 'steel-bear-starter')!;
      expect(bearSteel.damage).toContain('2d6');
    });

    it('T1-F5.2: starter steel weapons contain no advanced combat perks or runic properties', () => {
      const steelItems = MASTER_FINITE_ITEMS.filter((i) => starterSteelIds.includes(i.id));
      const bannedProperties = [
        'meteorite core',
        'crit on 19-20',
        'sunder armor',
        'knockback',
        'runic hilt',
        '+1 to hit',
        'sign dc',
      ];

      for (const item of steelItems) {
        const props = (item.properties || []).map((p) => p.toLowerCase());
        for (const banned of bannedProperties) {
          expect(props.some((p) => p.includes(banned))).toBe(false);
        }
      }
    });

    it('T1-F5.3: starter silver weapons contain strictly NO bonus damage dice', () => {
      const silverItems = MASTER_FINITE_ITEMS.filter((i) => starterSilverIds.includes(i.id));
      expect(silverItems.length).toBe(4);

      const bonusDiceRegex = /\+\s*(?:2d6|1d8|1d4)/i;
      for (const item of silverItems) {
        expect(bonusDiceRegex.test(item.damage || '')).toBe(false);
      }
    });

    it('T1-F5.4: starter silver weapons have mundane Silver properties without runic enhancements', () => {
      const silverItems = MASTER_FINITE_ITEMS.filter((i) => starterSilverIds.includes(i.id));
      const bannedSilverProps = [
        'runic inscription',
        'bane of relicts',
        'crit on 19-20',
        'bonus strike on crit',
        'sign focus',
        'glowing runes',
        '+1 vigor recovery',
        'brutal critical',
      ];

      for (const item of silverItems) {
        expect(item.properties).toContain('Silver');
        const props = (item.properties || []).map((p) => p.toLowerCase());
        for (const banned of bannedSilverProps) {
          expect(props.some((p) => p.includes(banned))).toBe(false);
        }
      }
    });

    it('T1-F5.5: all starter weapons have Common rarity and mundane gold values (<= 50)', () => {
      const allStarterWeapons = MASTER_FINITE_ITEMS.filter((i) =>
        [...starterSteelIds, ...starterSilverIds].includes(i.id)
      );
      expect(allStarterWeapons.length).toBe(8);

      for (const item of allStarterWeapons) {
        expect(item.rarity).toBe('Common');
        expect(item.valueGold).toBeLessThanOrEqual(50);
      }
    });

    it('T1-F5.6: pre-generated witchers in PREGEN_WITCHERS match mundane baselines', () => {
      expect(PREGEN_WITCHERS.length).toBe(4);

      const bonusDiceRegex = /\+\s*(?:2d6|1d8|1d4)/i;

      for (const witcher of PREGEN_WITCHERS) {
        // Armor class matches rebalanced starter armor
        const expectedAc = STARTER_ARMOR_SETS[witcher.school].armorClass;
        expect(witcher.armorClass).toBe(expectedAc);
        expect(witcher.armorClass).toBeLessThanOrEqual(13);

        // Steel weapon damage has no bonus dice
        expect(bonusDiceRegex.test(witcher.steelWeapon.damage)).toBe(false);

        // Silver weapon damage has no bonus dice
        expect(bonusDiceRegex.test(witcher.silverWeapon.damage)).toBe(false);

        // No banned properties on character weapon definitions
        const allProps = [
          ...witcher.steelWeapon.properties,
          ...witcher.silverWeapon.properties,
        ].map((p) => p.toLowerCase());

        expect(allProps.some((p) => p.includes('meteorite'))).toBe(false);
        expect(allProps.some((p) => p.includes('runic inscription'))).toBe(false);
        expect(allProps.some((p) => p.includes('bane of relicts'))).toBe(false);
      }
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2-B1: armor perks is strictly an array with length === 0 (not null, undefined, or string)', () => {
      for (const school of ALL_SCHOOLS) {
        const armor = STARTER_ARMOR_SETS[school];
        expect(armor.perks).toSatisfy((p: unknown) => Array.isArray(p) && p.length === 0);
      }
    });

    it('T2-B2: armor weight categories strictly match expected school archetypes', () => {
      expect(STARTER_ARMOR_SETS.Cat.weightCategory).toBe('Light');
      expect(STARTER_ARMOR_SETS.Wolf.weightCategory).toBe('Medium');
      expect(STARTER_ARMOR_SETS.Griffin.weightCategory).toBe('Medium');
      expect(STARTER_ARMOR_SETS.Bear.weightCategory).toBe('Heavy');
    });

    it('T2-B3: starter armor names do not contain masterwork or gilded titles', () => {
      const bannedTitles = ['masterwork', 'gilded', 'assassin shadow', 'ursine heavy'];
      for (const school of ALL_SCHOOLS) {
        const name = STARTER_ARMOR_SETS[school].name.toLowerCase();
        for (const title of bannedTitles) {
          expect(name).not.toContain(title);
        }
      }
    });

    it('T2-B4: starter armor AC strictly satisfies 10 <= AC <= 13', () => {
      for (const school of ALL_SCHOOLS) {
        const ac = STARTER_ARMOR_SETS[school].armorClass;
        expect(ac).toBeGreaterThanOrEqual(10);
        expect(ac).toBeLessThanOrEqual(13);
      }
    });

    it('T2-B5: case-insensitive check ensures no sign names appear in starter armor descriptions', () => {
      const signs = ['aard', 'igni', 'quen', 'yrden', 'axii'];
      for (const school of ALL_SCHOOLS) {
        const desc = STARTER_ARMOR_SETS[school].description.toLowerCase();
        for (const sign of signs) {
          // ensure sign is not mentioned as a combat buff (e.g. "quen shield", "igni intensity")
          expect(desc).not.toMatch(new RegExp(`\\b${sign}\\b\\s*(?:shield|intensity|bonus|damage)`, 'i'));
        }
      }
    });

    it('T2-B6: banned bonus dice regex catches whitespace and case variations across all starter weapons', () => {
      const variationsRegex = /\+\s*[12]d[468]/i;
      const allStarterWeapons = MASTER_FINITE_ITEMS.filter((i) => i.id.includes('-starter'));

      for (const weapon of allStarterWeapons) {
        expect(variationsRegex.test(weapon.damage || '')).toBe(false);
      }
    });

    it('T2-B7: steel weapon attack bonuses do not exceed baseline proficiency + ability modifiers (+5 to +8)', () => {
      const starterSteel = MASTER_FINITE_ITEMS.filter((i) => i.id.startsWith('steel-') && i.id.endsWith('-starter'));
      for (const weapon of starterSteel) {
        expect(weapon.attackBonus).toBeGreaterThanOrEqual(5);
        expect(weapon.attackBonus).toBeLessThanOrEqual(8);
      }
    });

    it('T2-B8: silver weapon attack bonuses do not exceed baseline proficiency + ability modifiers (+5 to +8)', () => {
      const starterSilver = MASTER_FINITE_ITEMS.filter((i) => i.id.startsWith('silver-') && i.id.endsWith('-starter'));
      for (const weapon of starterSilver) {
        expect(weapon.attackBonus).toBeGreaterThanOrEqual(5);
        expect(weapon.attackBonus).toBeLessThanOrEqual(8);
      }
    });

    it('T2-B9: all pregen starter weapons are marked equipped: true in MASTER_FINITE_ITEMS', () => {
      const starterWeapons = MASTER_FINITE_ITEMS.filter(
        (i) => (i.category === 'steel_sword' || i.category === 'silver_sword') && i.id.endsWith('-starter')
      );
      expect(starterWeapons.length).toBe(8);
      for (const weapon of starterWeapons) {
        expect(weapon.equipped).toBe(true);
      }
    });

    it('T2-B10: Bear witcher flavor backstory does not assert outdated 18 AC or +2d6 bonus damage', () => {
      const bearWitcher = PREGEN_WITCHERS.find((w) => w.school === 'Bear')!;
      expect(bearWitcher).toBeDefined();
      expect(bearWitcher.armorClass).toBe(13);
      expect(bearWitcher.steelWeapon.damage).not.toContain('+2d6');
      expect(bearWitcher.silverWeapon.damage).not.toContain('+2d6');
    });
  });
});
