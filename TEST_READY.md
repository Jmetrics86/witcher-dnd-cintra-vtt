# Test Infrastructure & Verification Readiness Report

**Project**: Witcher D&D 5e Virtual Tabletop (VTT) Gameplay Balance  
**Test Runner**: Vitest v5.1.0 (`"test": "vitest run"`)  
**Compilation**: TypeScript v5.7.2 + Vite v6.1.0 (`"build": "tsc && vite build"`)  
**Status**: 100% Passing (117 / 117 tests passing, 0 errors)  
**Date**: 2026-11-05

---

## 1. Executive Summary

Requirement R4 (Automated Verification Suite) is fully established. The test runner has been integrated into `package.json` with the standard script `"test": "vitest run"`. A comprehensive, 4-tier opaque-box test framework has been authored in `src/tests/`, asserting:
1. **Requirement R1 (Party-Scaled Monster Strength)**: HP multipliers ($1.0x, 1.5x, 2.0x, 2.5x$), attack to-hit bonuses ($+0, +1, +2, +3$), damage offsets ($+0, +2, +4, +6$), party size clamping ($1 \le N \le 4$), and reactive token health preservation.
2. **Requirement R2 (Weak Non-Magical Starter Gear)**: Mundane starter armors ($\le 13$ AC, 0 perks, no damage reduction, no sign bonuses) and starter weapons (mundane baselines, 0 bonus dice, 0 runes).
3. **Requirement R3 (Merchant Store & Loot Progression)**: Strict monotonic superiority of all Act I–IV merchant inventory weapons and armor, and all adventure secret treasures over starting equipment.
4. **End-to-End Campaign Scenarios**: 5 multi-round, full-campaign simulation scenarios modeling genuine game flow across 4 Acts.

---

## 2. Test Architecture & Suite Mapping

| Suite File | Focus / Requirements | Tier 1 (Features) | Tier 2 (Boundaries) | Tier 3 (Interactions) | Tier 4 (Scenarios) | Suite Total |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `src/tests/monsterScaling.test.ts` | R1 (Features 1, 2, 3) | 15 | 15 | — | — | **30** |
| `src/tests/starterGear.test.ts` | R2 (Features 4, 5) | 12 | 10 | — | — | **22** |
| `src/tests/storeAndLootProgression.test.ts` | R3 (Features 6, 7) | 10 | 10 | — | — | **20** |
| `src/tests/integrationCombatAndProgression.test.ts` | Cross-Feature & E2E (Tiers 3 & 4) | — | — | 10 | 5 | **15** |
| **Core E2E Verification Suites** | **All Requirements (R1–R4)** | **37** | **35** | **10** | **5** | **87** |
| `src/tests/challenger_m1_empirical.test.ts` | M1 Empirical Challenger | — | — | — | — | **18** |
| `src/tests/m1Adversarial.test.ts` | M1 Adversarial Auditor | — | — | — | — | **12** |
| **Total Test Suite Executed** | **Full Project Verification** | | | | | **117** |

*Threshold Target: $\ge 85$ tests. Achieved in Core Suites: **87 tests** ($\ge 85$). Total passing in repository: **117 tests**.*

---

## 3. Tier-by-Tier Coverage Matrix

### Tier 1: Feature Coverage (37 Tests)
- **Feature 1 (Monster HP Scaling)**:
  - Ancient Leshen ($135 \to 135, 203, 270, 338$)
  - Chort Fiend ($112 \to 112, 168, 224, 280$)
  - Grave Hag ($68 \to 68, 102, 136, 170$)
  - Barghest Hound ($34 \to 34, 51, 68, 85$)
  - Hostile NPCs: Dire Wolf, Rotfiend, Corvus Steward, Baron Raymond
- **Feature 2 (Monster Attack & Damage Scaling)**:
  - Attack to-hit bonus offset: $+(N-1)$ ($+0, +1, +2, +3$)
  - Attack flat damage offset: $+(N-1)\times 2$ ($+0, +2, +4, +6$)
  - Ancient Leshen Claws ($+7 \to +10$, $2\text{d}8+4 \to 2\text{d}8+10$)
  - Chort Gore ($+8 \to +11$, $2\text{d}10+5 \to 2\text{d}10+11$)
  - Grave Hag Claws ($+5 \to +8$, $2\text{d}6+3 \to 2\text{d}6+9$)
- **Feature 3 (Dynamic Token Spawning & Rescaling)**:
  - Spawned token Max HP and Current HP initialization
  - Dead token ($0$ HP) permanence under party expansion
  - Wounded token HP percentage preservation ($\text{round}((HP / MaxHP_{old}) \times MaxHP_{new})$)
  - Non-monster token (`isMonster === false`) protection
  - Active party size derivation from locked witcher claims and non-observer peers
- **Feature 4 (Mundane Starter Armor)**:
  - 4 school armors defined (Wolf AC 12, Cat AC 11, Griffin AC 13, Bear AC 13)
  - All armors $\le 13$ AC, exactly 0 perks, gold value $\le 35$
  - Banned DR keywords verified absent (no "DR 2", "damage reduction")
  - Banned Sign boosts verified absent (no "Sign DC", "Quen shield grants +5 Temp HP", "Fluid Riposte")
- **Feature 5 (Mundane Starter Weapons)**:
  - 4 steel weapons: Cat $1\text{d}6$, Wolf $1\text{d}8$, Griffin $1\text{d}8$, Bear $2\text{d}6$
  - Banned steel perks absent (no Meteorite $+1$, Keen $19\text{--}20$, Sunder, Knockback)
  - 4 silver weapons: strictly zero bonus dice (no $+2\text{d}6$, $+1\text{d}8$, $+1\text{d}4$)
  - Banned silver properties absent (no Runic Inscription, Bane of Relicts, Sign Focus)
  - All pregen witchers in `PREGEN_WITCHERS` match mundane baselines
- **Feature 6 (Merchant Store Progression)**:
  - Acts I–IV merchants configured (Torvin, Yann/Maeve, Lucian, Verek)
  - Every store armor has AC strictly superior to starting armor of same weight (Act I Ox-Hide AC 14 > 13, Act III Tir Na Lia AC 15 > 11, Act IV Cintrian Guard AC 16 > 13)
  - Every store armor has non-empty beneficial perks
  - Every store weapon has superior damage, attack bonus, or special perks
- **Feature 7 (Adventure Secret Treasure & Loot Progression)**:
  - Story beats across Acts I–IV define 12+ tangible secret treasures
  - Skellige Ring Mail drop (Heavy AC 16, DR 2 > Bear AC 13)
  - Moonblade drop ($+2\text{d}6$ silver, $+1\text{d}6$ radiant vs undead)
  - Gnomish Gwyhyr drop ($1\text{d}10+2$, Keen $19\text{--}20$, bypass 2 AC)
  - Capstone Aerondight drop ($+2\text{d}8$ silver, kinetic charging smite)

### Tier 2: Boundary & Corner Cases (35 Tests)
- Party size clamping: $N \le 0 \implies 1$, $N \ge 5 \implies 4$, floating point flooring
- Monster base HP boundary: $\le 0$ HP handling, $1$ HP scaling without truncating to 0
- Attack bonus scaling with $+0$ base bonus, no flat damage, and complex multi-damage strings
- Token rescaling boundary: empty list handling, same party size no-op, downscaling from $4 \to 1$ witchers, over-heal ratio preservation, token coordinates & ID preservation
- Observer peer exclusion from party size calculation
- Starter armor perks strictly Array with `length === 0` (not null/undefined)
- Starter armor weight category school archetype fidelity
- Banned regex scanning with case, whitespace, and modifier variations
- Merchant price monotonicity: Act I < Act II < Act III/IV, store prices $\ge 65$ Orens vs starter $\le 50$
- Merchant stock positivity (`stock > 0`) and zero starter IDs sold in stores
- Secret treasure coin rewards boundary ($15 \le \text{Orens} \le 300$) and valid discovery check definitions

### Tier 3: Cross-Feature Combinations (10 Tests)
- **T3-C1**: Scaled monster attack vs starter armor AC ($80\% \to 95\%$ hit chance)
- **T3-C2**: Scaled monster attack vs upgraded Act IV armor AC ($60\% \to 75\%$ hit chance, $-20\%$ hit mitigation)
- **T3-C3**: Starter silver weapon damage vs scaled monster HP ($16$ hits solo, $10$ hits/player in 4-player team)
- **T3-C4**: Upgraded store weapon damage vs scaled monster HP ($19$ hits total, $\le 5$ hits/player, $50\%$ faster)
- **T3-C5**: Dynamic mid-combat rescaling during damage exchange (preserves $73.9\%$ HP upon $N=2 \to N=4$ expansion)
- **T3-C6**: Bear witcher tank durability vs scaled Chort (DR removal verification, $16$ unmitigated dmg taken)
- **T3-C7**: Cat witcher critical striking (mundane crit on 20 vs Gwyhyr crit on $19\text{--}20$)
- **T3-C8**: Griffin witcher spell DC comparison ($+0$ DC on starter armor)
- **T3-C9**: Multi-monster encounter scaling ($3\times$ Barghest Hounds at $N=3 = 204$ HP)
- **T3-C10**: Store item purchase & equip simulation (Ox-Hide AC 14 reduces Rotfiend hit chance from $65\%$ to $55\%$)

### Tier 4: Real-World Application Scenarios (5 Comprehensive Scenarios)
1. **Scenario 1 (Full 4-Act Campaign Progression)**: Party starts with mundane gear, shops across Torvin, Yann, Lucian, and Verek, discovering secret treasures, verifying continuous monotonic equipment improvement.
2. **Scenario 2 (Dynamic Mid-Combat Party Expansion)**: Solo Wolf Witcher engages Ancient Leshen ($135$ HP), inflicts $27$ dmg ($80\%$ HP remaining). Three players connect mid-fight; Leshen rescales to $338$ Max HP, $270$ current HP ($80\%$), attacks scale to $+10$ / $2\text{d}8+10$, and dead minion remains at $0$ HP.
3. **Scenario 3 (Token Spawner Batch Verification)**: Simulates DM spawner across all 8 monster and NPC templates across party sizes $1\text{--}4$, validating exact mathematical scaling on every token.
4. **Scenario 4 (Exhaustive 4x4 Weapon & Armor Comparison Matrix)**: Combinatorial verification comparing every merchant and loot weapon/armor against all 4 starting witcher loadouts, proving strict superiority.
5. **Scenario 5 (Combat Lethality & 5-Round TTK Benchmark)**: Simulates 5 rounds of combat against Ancient Leshen under starter gear (Leshen survives with $168$ HP) vs upgraded gear (Leshen defeated with $370$ dmg dealt), proving balanced pacing and $50\%+$ combat acceleration.

---

## 4. Verification Execution Commands

To execute tests:
```bash
# Run full automated test suite
npm test

# Run vitest in watch mode (interactive)
npx vitest

# Run a specific test suite
npx vitest run src/tests/monsterScaling.test.ts
npx vitest run src/tests/starterGear.test.ts
npx vitest run src/tests/storeAndLootProgression.test.ts
npx vitest run src/tests/integrationCombatAndProgression.test.ts
```

To compile production build:
```bash
# Type check and build bundle
npm run build
```

---

## 5. Artifact Audit Verification

| Artifact | Location | Status |
|---|---|---|
| `package.json` | `/home/jasonbrewster/projects/roleplaying/package.json` | Configured with `"test": "vitest run"` and `"vitest": "^5.1.0"` |
| Monster Scaling Suite | `src/tests/monsterScaling.test.ts` | 30 tests passing |
| Starter Gear Suite | `src/tests/starterGear.test.ts` | 22 tests passing |
| Store & Loot Suite | `src/tests/storeAndLootProgression.test.ts` | 20 tests passing |
| Integration & E2E Suite | `src/tests/integrationCombatAndProgression.test.ts` | 15 tests passing |
| Scaling Contract Helper | `src/tests/scalingContract.ts` | Complete type-safe contract helper |
| Test Readiness Report | `TEST_READY.md` | Published |
