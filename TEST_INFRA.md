# E2E Test Infra: Witcher D&D 5e VTT

## Test Philosophy
- Opaque-box, requirement-driven. Derives strictly from `ORIGINAL_REQUEST.md` and user-facing specifications.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing across Tiers 1–4.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|----------------------|:------:|:------:|:------:|:------:|
| 1 | Monster HP Scaling (1-4 Witchers) | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Monster Attack & Damage Scaling | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Dynamic Token Spawning & Mid-Combat Rescaling | R1 | 5 | 5 | ✓ | ✓ |
| 4 | Weak Non-Magical Starter Armor (AC 11-13, 0 perks) | R2 | 5 | 5 | ✓ | ✓ |
| 5 | Weak Non-Magical Starter Weapons (0 bonus dice, 0 runes) | R2 | 5 | 5 | ✓ | ✓ |
| 6 | Merchant Store Progression (Acts I–IV) | R3 | 5 | 5 | ✓ | ✓ |
| 7 | Adventure Secret Treasure & Loot Table Progression | R3 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: `vitest` v5.1.0 executed via `npm test` (`vitest run`).
- **Location**: `src/tests/`
  - `src/tests/monsterScaling.test.ts` (Covers Features 1, 2, 3)
  - `src/tests/starterGear.test.ts` (Covers Features 4, 5)
  - `src/tests/storeAndLootProgression.test.ts` (Covers Features 6, 7)
  - `src/tests/integrationCombatAndProgression.test.ts` (Tiers 3 & 4 cross-feature & end-to-end campaign scenarios)
- **Pass/Fail Semantics**: All test suites must execute with exit code 0. TypeScript compile (`npm run build`) must pass with 0 errors.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full 4-Act Campaign Progression: Party starts with mundane gear, shops at Torvin (Act I), Yann (Act II), Lucian (Act III), Verek (Act IV), and discovers secret treasures | F4, F5, F6, F7 | High |
| 2 | Dynamic Party Expansion: Solo Witcher encounters Ancient Leshen, 3 additional Witchers join session mid-fight, verifying HP percentage preservation and threat scaling | F1, F2, F3 | High |
| 3 | Token Spawning at Different Party Sizes: Spawning monsters at party size 1, 2, 3, and 4 verifies proportional baseline scaling on each spawn | F1, F2, F3 | Medium |
| 4 | Weapon & Armor Comparison Matrix: Exhaustive verification comparing every merchant and loot weapon/armor against all 4 starting witcher gear loadouts | F4, F5, F6, F7 | High |
| 5 | Combat Lethality & Durability Simulation: Simulating multi-round combat turns between scaled monsters and party gear to ensure balanced time-to-kill | F1, F2, F4, F5 | High |

## Coverage Thresholds
- Tier 1 (Feature Coverage): ≥5 tests per feature (35+ test cases total)
- Tier 2 (Boundary & Corner Cases): ≥5 tests per feature (party size 0, 1, 4, 5, negative HP, dead token revival guard, unarmored vs heavy armor) (35+ test cases)
- Tier 3 (Cross-Feature Combinations): Pairwise interactions between monster scaling, gear baselines, store upgrades, and combat instances (≥10 test cases)
- Tier 4 (Real-World Application Scenarios): 5 comprehensive end-to-end campaign scenarios
- Total Target: ≥85 verified test cases
