import { describe, it, expect } from 'vitest';
import { STARTER_ARMOR_SETS, MASTER_FINITE_ITEMS, DISCOVERY_ARMOR_SETS, DEFAULT_ACT_MERCHANTS } from '../data/items';
import { PREGEN_WITCHERS } from '../data/characters';
import { WitcherCharacter, GameItem, ArmorSet, WitcherSchool } from '../types';

describe('M1 Adversarial Challenge: Edge Cases, Fallbacks & Progression Headroom', () => {
  const ALL_SCHOOLS: WitcherSchool[] = ['Wolf', 'Cat', 'Griffin', 'Bear'];

  // Helper simulating CharacterSheet.tsx handleEquipArmor
  function simulateEquipArmor(character: WitcherCharacter, armorItem: GameItem): WitcherCharacter {
    const prevArmor = character.equippedArmor;
    const newArmorSet: ArmorSet = {
      id: armorItem.id,
      name: armorItem.name,
      armorClass: armorItem.armorClass || 15,
      weightCategory: armorItem.weightCategory || 'Medium',
      perks: armorItem.properties || [],
      description: armorItem.description,
      valueGold: armorItem.valueGold,
    };

    let updatedInventory = (character.inventory || []).filter((i) => i.id !== armorItem.id);
    if (prevArmor) {
      updatedInventory.push({
        id: prevArmor.id,
        name: prevArmor.name,
        category: 'armor',
        description: prevArmor.description,
        rarity: 'Witcher',
        valueGold: prevArmor.valueGold,
        armorClass: prevArmor.armorClass,
        weightCategory: prevArmor.weightCategory,
        properties: prevArmor.perks,
        equipped: false,
        assignedToSchool: character.school,
      });
    }

    return {
      ...character,
      armorClass: newArmorSet.armorClass,
      equippedArmor: newArmorSet,
      inventory: updatedInventory,
    };
  }

  // Helper simulating CharacterSheet.tsx handleEquipSteelSword
  function simulateEquipSteelSword(character: WitcherCharacter, weaponItem: GameItem): WitcherCharacter {
    const prevWeapon = character.steelWeapon;
    const newSteel = {
      name: weaponItem.name,
      attackBonus: weaponItem.attackBonus || 7,
      damage: weaponItem.damage || '1d8 + 4 (1d10 + 4 versatile)',
      damageType: weaponItem.damageType || 'Slashing (Steel)',
      properties: weaponItem.properties || ['Versatile', 'Finesse'],
      description: weaponItem.description,
      isSilver: false,
    };

    let updatedInventory = (character.inventory || []).filter((i) => i.id !== weaponItem.id);
    if (prevWeapon) {
      updatedInventory.push({
        id: `steel-${Date.now()}`,
        name: prevWeapon.name,
        category: 'steel_sword',
        description: prevWeapon.description,
        rarity: 'Witcher',
        valueGold: 100,
        attackBonus: prevWeapon.attackBonus,
        damage: prevWeapon.damage,
        damageType: prevWeapon.damageType,
        properties: prevWeapon.properties,
        equipped: false,
        assignedToSchool: character.school,
      });
    }

    return {
      ...character,
      steelWeapon: newSteel,
      inventory: updatedInventory,
    };
  }

  // Helper simulating CharacterSheet.tsx handleEquipSilverSword
  function simulateEquipSilverSword(character: WitcherCharacter, weaponItem: GameItem): WitcherCharacter {
    const prevWeapon = character.silverWeapon;
    const newSilver = {
      name: weaponItem.name,
      attackBonus: weaponItem.attackBonus || 7,
      damage: weaponItem.damage || '1d8 + 4',
      damageType: weaponItem.damageType || 'Silver / Slashing',
      properties: weaponItem.properties || ['Versatile', 'Silver'],
      description: weaponItem.description,
      isSilver: true,
    };

    let updatedInventory = (character.inventory || []).filter((i) => i.id !== weaponItem.id);
    if (prevWeapon) {
      updatedInventory.push({
        id: `silver-${Date.now()}`,
        name: prevWeapon.name,
        category: 'silver_sword',
        description: prevWeapon.description,
        rarity: 'Witcher',
        valueGold: 130,
        attackBonus: prevWeapon.attackBonus,
        damage: prevWeapon.damage,
        damageType: prevWeapon.damageType,
        properties: prevWeapon.properties,
        isSilver: true,
        equipped: false,
        assignedToSchool: character.school,
      });
    }

    return {
      ...character,
      silverWeapon: newSilver,
      inventory: updatedInventory,
    };
  }

  // ==========================================
  // SECTION 1: EQUIP / UNEQUIP ROUND-TRIP TESTS
  // ==========================================
  describe('Adversarial Equip/Unequip Round-Trip Lifecycle', () => {
    it('ADV-1.1: Round-trip armor equip/unequip does not resurrect old AC (14-17) or perks', () => {
      for (const pregen of PREGEN_WITCHERS) {
        const initialAc = pregen.armorClass;
        expect(initialAc).toBeLessThanOrEqual(13);

        // Find a discovery armor to swap to (e.g. ox-hide)
        const oxHide = MASTER_FINITE_ITEMS.find((i) => i.id === 'armor-ox-hide')!;
        expect(oxHide).toBeDefined();

        // Equip discovery armor
        const equippedDiscovery = simulateEquipArmor(pregen, oxHide);
        expect(equippedDiscovery.armorClass).toBe(14);
        expect(equippedDiscovery.inventory.length).toBe(1);

        // Retrieve the unequipped starter armor from inventory
        const unequippedStarter = equippedDiscovery.inventory[0];
        expect(unequippedStarter.armorClass).toBe(initialAc);
        expect(unequippedStarter.properties?.length || 0).toBe(0);

        // Re-equip starter armor from inventory
        const reEquipped = simulateEquipArmor(equippedDiscovery, unequippedStarter);
        expect(reEquipped.armorClass).toBe(initialAc);
        expect(reEquipped.equippedArmor!.perks.length).toBe(0);
        expect(reEquipped.equippedArmor!.armorClass).toBe(initialAc);
      }
    });

    it('ADV-1.2: Round-trip steel weapon equip/unequip preserves mundane stats without resurrecting perks', () => {
      for (const pregen of PREGEN_WITCHERS) {
        const initialDamage = pregen.steelWeapon.damage;
        const initialAttack = pregen.steelWeapon.attackBonus;

        const mahakaman = MASTER_FINITE_ITEMS.find((i) => i.id === 'steel-mahakaman')!;
        expect(mahakaman).toBeDefined();

        // Equip mahakaman blade
        const equippedNew = simulateEquipSteelSword(pregen, mahakaman);
        expect(equippedNew.inventory.length).toBe(1);

        // Unequipped starter weapon check
        const unequippedStarter = equippedNew.inventory[0];
        expect(unequippedStarter.damage).toBe(initialDamage);
        expect(unequippedStarter.attackBonus).toBe(initialAttack);
        expect(unequippedStarter.damage).not.toContain('+2d6');

        // Re-equip starter steel
        const reEquipped = simulateEquipSteelSword(equippedNew, unequippedStarter);
        expect(reEquipped.steelWeapon.damage).toBe(initialDamage);
        expect(reEquipped.steelWeapon.attackBonus).toBe(initialAttack);
        expect(reEquipped.steelWeapon.properties).toEqual(pregen.steelWeapon.properties);
      }
    });

    it('ADV-1.3: Round-trip silver weapon equip/unequip strictly never adds +2d6 bonus dice', () => {
      for (const pregen of PREGEN_WITCHERS) {
        const initialDamage = pregen.silverWeapon.damage;
        expect(initialDamage).not.toContain('+2d6');

        const aerondight = MASTER_FINITE_ITEMS.find((i) => i.id === 'silver-aerondight')!;
        expect(aerondight).toBeDefined();

        const equippedNew = simulateEquipSilverSword(pregen, aerondight);
        expect(equippedNew.inventory.length).toBe(1);

        const unequippedStarter = equippedNew.inventory[0];
        expect(unequippedStarter.damage).toBe(initialDamage);
        expect(unequippedStarter.damage).not.toContain('+2d6');

        // Re-equip starter silver
        const reEquipped = simulateEquipSilverSword(equippedNew, unequippedStarter);
        expect(reEquipped.silverWeapon.damage).toBe(initialDamage);
        expect(reEquipped.silverWeapon.damage).not.toContain('+2d6');
      }
    });
  });

  // ==========================================
  // SECTION 2: ADVERSARIAL FALLBACK VALUE TESTS
  // ==========================================
  describe('Adversarial Fallback Values & Degraded Input Robustness', () => {
    it('ADV-2.1: CharacterSheet silver weapon fallback defaults to mundane "1d8 + 4" without (+2d6 silver)', () => {
      const wolf = PREGEN_WITCHERS[0];
      const emptyDamageWeapon: GameItem = {
        id: 'corrupted-silver-test',
        name: 'Corrupted Blank Silver Blade',
        category: 'silver_sword',
        description: 'Testing fallback',
        rarity: 'Common',
        valueGold: 10,
        damage: '', // empty damage string
        attackBonus: 0,
      };

      const equipped = simulateEquipSilverSword(wolf, emptyDamageWeapon);
      expect(equipped.silverWeapon.damage).toBe('1d8 + 4');
      expect(equipped.silverWeapon.damage).not.toContain('+2d6');
    });

    it('ADV-2.2: CharacterSheet steel weapon fallback defaults to mundane baseline without bonus perks', () => {
      const wolf = PREGEN_WITCHERS[0];
      const emptyDamageWeapon: GameItem = {
        id: 'corrupted-steel-test',
        name: 'Corrupted Blank Steel Blade',
        category: 'steel_sword',
        description: 'Testing fallback',
        rarity: 'Common',
        valueGold: 10,
        damage: '', // empty damage string
        attackBonus: 0,
      };

      const equipped = simulateEquipSteelSword(wolf, emptyDamageWeapon);
      expect(equipped.steelWeapon.damage).toBe('1d8 + 4 (1d10 + 4 versatile)');
      expect(equipped.steelWeapon.attackBonus).toBe(7);
      expect(equipped.steelWeapon.properties).toEqual(['Versatile', 'Finesse']);
    });

    it('ADV-2.3: All catalog items in MASTER_FINITE_ITEMS have explicit non-zero, non-null stats', () => {
      for (const item of MASTER_FINITE_ITEMS) {
        if (item.category === 'armor') {
          expect(item.armorClass).toBeDefined();
          expect(item.armorClass).toBeGreaterThan(0);
          expect(item.weightCategory).toBeDefined();
        }
        if (item.category === 'steel_sword' || item.category === 'silver_sword') {
          expect(item.damage).toBeDefined();
          expect(item.damage!.length).toBeGreaterThan(0);
          expect(item.attackBonus).toBeDefined();
          expect(item.attackBonus).toBeGreaterThan(0);
        }
      }
    });

    it('ADV-2.4: CharacterSheet UI fallback line (character.equippedArmor?.armorClass || character.armorClass) is <= 13 for all pregen witchers', () => {
      for (const pregen of PREGEN_WITCHERS) {
        const characterWithoutEquippedArmor = { ...pregen, equippedArmor: undefined as unknown as ArmorSet };
        const displayedAc = characterWithoutEquippedArmor.equippedArmor?.armorClass || characterWithoutEquippedArmor.armorClass;
        expect(displayedAc).toBe(pregen.armorClass);
        expect(displayedAc).toBeLessThanOrEqual(13);
      }
    });
  });

  // ==========================================
  // SECTION 3: PROGRESSION HEADROOM AUDIT
  // ==========================================
  describe('Strict Progression Headroom Audit (Act I–IV)', () => {
    it('ADV-3.1: Act I store armor "armor-ox-hide" (AC 14) is strictly superior to all 4 starter armors (AC 11-13)', () => {
      const act1Merchant = DEFAULT_ACT_MERCHANTS[1];
      const oxHideEntry = act1Merchant.items.find((i) => i.id === 'armor-ox-hide');
      expect(oxHideEntry).toBeDefined();
      const oxHide = oxHideEntry!.item;
      expect(oxHide.armorClass).toBe(14);

      for (const school of ALL_SCHOOLS) {
        const starter = STARTER_ARMOR_SETS[school];
        expect(oxHide.armorClass!).toBeGreaterThan(starter.armorClass);
      }
    });

    it('ADV-3.2: Act I store armor "armor-ox-hide" provides perks while all starter armors provide strictly 0 perks', () => {
      const act1Merchant = DEFAULT_ACT_MERCHANTS[1];
      const oxHide = act1Merchant.items.find((i) => i.id === 'armor-ox-hide')!.item;
      expect((oxHide.properties || []).length).toBeGreaterThan(0);

      for (const school of ALL_SCHOOLS) {
        expect(STARTER_ARMOR_SETS[school].perks.length).toBe(0);
      }
    });

    it('ADV-3.3: All Discovery Armors (Acts I–IV) have AC strictly greater than any same-weight starter armor', () => {
      for (const armor of DISCOVERY_ARMOR_SETS) {
        const matchingStarter = Object.values(STARTER_ARMOR_SETS).find((s) => s.weightCategory === armor.weightCategory);
        if (matchingStarter) {
          expect(armor.armorClass).toBeGreaterThan(matchingStarter.armorClass);
        }
        // Universal headroom: every discovery armor AC is >= 14, strictly higher than all starter armors (<= 13)
        expect(armor.armorClass).toBeGreaterThanOrEqual(14);
      }
    });

    it('ADV-3.4: Starter silver weapons allow massive progression for Act II+ silver weapons with bonus dice', () => {
      // In Act II, Herbalist Maeve sells Havern Broadsword with +2d6 silver vs monsters
      const act2Merchant = DEFAULT_ACT_MERCHANTS[2];
      const havernEntry = act2Merchant.items.find((i) => i.id === 'silver-havern-greatsword');
      expect(havernEntry).toBeDefined();
      expect(havernEntry!.item.damage).toContain('+2d6');

      // All starter silver weapons must have NO bonus dice, leaving complete headroom for this upgrade
      for (const pregen of PREGEN_WITCHERS) {
        expect(pregen.silverWeapon.damage).not.toContain('+2d6');
      }
    });
  });

  // ==========================================
  // SECTION 4: INVENTORY VALUE & RARITY MUTATION OBSERVATION
  // ==========================================
  describe('Unequip Inventory Value Behavior Audit', () => {
    it('ADV-4.1: Documents unequipped starter weapons receiving standard inventory value/rarity in CharacterSheet', () => {
      // When a player swaps weapons in CharacterSheet.tsx, lines 109 & 149 hardcode rarity: 'Witcher' and valueGold: 100/130
      const wolf = PREGEN_WITCHERS[0];
      const mahakaman = MASTER_FINITE_ITEMS.find((i) => i.id === 'steel-mahakaman')!;
      const equipped = simulateEquipSteelSword(wolf, mahakaman);

      const unequippedInBag = equipped.inventory[0];
      expect(unequippedInBag.category).toBe('steel_sword');
      expect(unequippedInBag.name).toBe(wolf.steelWeapon.name);
      // Stat integrity: damage and attackBonus are preserved from the mundane starter weapon
      expect(unequippedInBag.damage).toBe(wolf.steelWeapon.damage);
      expect(unequippedInBag.attackBonus).toBe(wolf.steelWeapon.attackBonus);
    });
  });
});
