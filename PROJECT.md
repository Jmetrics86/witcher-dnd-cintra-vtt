# Project: Witcher D&D 5e VTT Gameplay Balance

## Architecture
The application is a browser-based multiplayer Virtual Tabletop (VTT) for Witcher D&D 5e built with React 19, Vite 6, and TypeScript. Peer-to-peer networking is coordinated over WebRTC via PeerJS, with the Game Master host client acting as the authoritative state manager.

Data and state flow:
- **Character Baseline**: `src/data/characters.ts` defines `PREGEN_WITCHERS` (Wolf, Cat, Griffin, Bear). Starting equipment is synced with `src/data/items.ts` (`STARTER_ARMOR_SETS` and `MASTER_FINITE_ITEMS`).
- **Store & Loot Progression**: `DEFAULT_ACT_MERCHANTS` in `src/data/items.ts` defines stores across Acts I–IV. `src/data/adventure.ts` defines `secretTreasures` across 8 story beats, referencing `MASTER_FINITE_ITEMS` and the DM Vault.
- **Combat & Scaling**: Active combat is represented by `MapToken[]` in `src/App.tsx`. Dynamic scaling is managed by `src/utils/monsterScaling.ts`, deriving active party size ($N \in [1, 4]$) and scaling monster HP ($1.0 + (N-1) \times 0.5$) and attack values ($+(N-1)$ to-hit, $+(N-1)\times 2$ damage). State updates synchronize across connected peers via WebRTC.
- **Verification**: `src/tests/` contains automated unit and E2E verification suites executed via `vitest` (`npm test`) and compiled via `tsc && vite build` (`npm run build`).

## Code Layout
- `src/types.ts`: TypeScript data contracts for `MapToken`, `Monster`, `MonsterAttack`, `GameItem`, `ArmorSet`.
- `src/utils/monsterScaling.ts`: Pure scaling calculations, party size derivation, token rescaling math.
- `src/data/characters.ts`: Pre-generated witcher character stats, equipped armor, steel & silver weapon definitions.
- `src/data/items.ts`: Master finite item catalog, starter armor sets, Act I–IV merchant store inventories.
- `src/data/adventure.ts`: Adventure story beats, secret treasures, DM vault reward bindings.
- `src/data/monsters.ts`: Base monster stat blocks (Ancient Leshen, Chort Fiend, Grave Hag, Barghest Hound).
- `src/data/npcs.ts`: Hostile NPC stat blocks (Dire Wolf, Rotfiend, Corvus Steward, Baron Raymond).
- `src/components/TokenSpawnerDrawer.tsx`: DM token spawner with scaled stats preview.
- `src/components/BestiaryModal.tsx`: Bestiary modal with party-scaled stats and token spawning.
- `src/components/TacticalMap.tsx`: Tactical battle map HUD displaying monster tokens and combat actions.
- `src/components/CharacterSheet.tsx`: Player character sheet and equipment fallbacks.
- `src/App.tsx`: Main application coordinator, reactive party size hook, token state sync.
- `src/tests/`: Automated unit & E2E tests for monster scaling, starter gear, and loot progression.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Party Size Derivation | Dynamically derive active witchers ($N \in [1,4]$) from locked claims and connected players | M3 | R1 |
| 2 | Monster HP Scaling | Scale monster Max HP by $1.0 + (N-1) \times 0.5$ (1.0x, 1.5x, 2.0x, 2.5x) | M3 | R1 |
| 3 | Monster Attack To-Hit Scaling | Scale monster attack to-hit bonus by $+(N-1)$ (+0, +1, +2, +3) | M3 | R1 |
| 4 | Monster Attack Damage Scaling | Scale monster damage formula by $+(N-1)\times 2$ flat damage | M3 | R1 |
| 5 | Token Spawner Scaling | Spawn new monster tokens with stats scaled to active party size | M3 | R1 |
| 6 | Dynamic Token Rescaling | Reactively rescale active monster tokens when party size changes, preserving % HP and keeping dead tokens at 0 HP | M3 | R1 |
| 7 | Mundane Starter Armor | Rebalance starter armor sets to AC 11-13, Common rarity, 0 perks | M1 | R2 |
| 8 | Remove Armor Perks | Remove flat damage reduction (Bear DR 2) and Sign boosts (Griffin +1 DC, +5 Quen HP) from starter armor | M1 | R2 |
| 9 | Mundane Starter Weapons | Rebalance starter steel and silver weapons to mundane baselines with 0 bonus dice and 0 runes | M1 | R2 |
| 10 | Remove Weapon Perks | Remove +2d6/+1d8 bonus dice, Meteorite +1, Keen 19-20, Sunder, and Knockback from starter weapons | M1 | R2 |
| 11 | Sync Character & Items Data | Synchronize weapon names, stats, and character sheet fallbacks between characters.ts and items.ts | M1 | R2 |
| 12 | Store Weapon Progression | Ensure all weapons sold in Act I–IV stores are strictly superior to starter weapons | M2 | R3 |
| 13 | Store Armor Progression | Ensure all armors sold in Act I–IV stores are strictly superior to starter armors | M2 | R3 |
| 14 | Loot Table Progression | Ensure all adventure secret treasures and loot drops strictly improve over starter gear | M2 | R3 |
| 15 | Missing Catalog Item Fix | Add missing `quest-grave-hag-ear` to `MASTER_FINITE_ITEMS` in `src/data/items.ts` | M2 | R3 |
| 16 | Test Runner Setup | Configure `vitest` in package.json with `"test": "vitest run"` script | E2E Track | R4 |
| 17 | Monster Scaling Test Suite | Automated tests asserting monster HP, attack to-hit, and damage scaling formulas across party sizes 1 to 4 | E2E Track | R4 |
| 18 | Starter Gear Test Suite | Automated tests asserting non-magical mundane starter gear baselines, 0 perks, 0 bonus dice | E2E Track | R4 |
| 19 | Progression Test Suite | Automated tests asserting strict mathematical progression of store items and secret loot over starter gear | E2E Track | R4 |
| 20 | Clean Production Build | Ensure `npm run build` compiles cleanly with zero TypeScript errors | M4 | R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Weak Non-Magical Starter Gear | Rebalance all 4 witchers' starter armors (AC 11-13, 0 perks) and weapons (mundane, 0 bonus dice, 0 runes) in `src/data/characters.ts`, `src/data/items.ts`, and `src/components/CharacterSheet.tsx` | none | DONE |
| M2 | Merchant Store & Loot Progression | Verify and tune Act I–IV store inventories and adventure secret treasures in `src/data/items.ts` and `src/data/adventure.ts` to ensure strict progression over M1 starter gear; add missing `quest-grave-hag-ear` | M1 | PLANNED |
| M3 | Party-Scaled Monster Strength | Implement `src/utils/monsterScaling.ts`, augment `MapToken` in `src/types.ts`, wire reactive party size and dynamic token re-scaling into `src/App.tsx`, `TokenSpawnerDrawer.tsx`, `BestiaryModal.tsx`, `TacticalMap.tsx` | none | PLANNED |
| M4 | Final Milestone: 100% E2E Pass & Hardening | Execute full automated test suite (Tiers 1-4) via `npm test`, verify clean build (`npm run build`), conduct Tier 5 adversarial hardening and integrity audit | M1, M2, M3, E2E Track | PLANNED |

## Interface Contracts
### `src/utils/monsterScaling.ts`
- `getScalingFactors(partySize: number): { hpMultiplier: number; attackBonusOffset: number; damageBonusOffset: number }`
  - Clamps party size to $1 \le N \le 4$.
  - Returns `hpMultiplier = 1.0 + (N-1)*0.5`, `attackBonusOffset = N-1`, `damageBonusOffset = (N-1)*2`.
- `getActivePartySize(assignments, connectedPeers, isConnected, gmPlaysWitcher): number`
  - Computes active party size from locked witcher claims and connected non-observer peers.
- `scaleMonsterHp(baseHp: number, partySize: number): number`
  - Computes `Math.round(baseHp * hpMultiplier)`.
- `scaleMonsterAttack(attack: MonsterAttack, partySize: number): MonsterAttack`
  - Increases `bonus` by `attackBonusOffset` and adjusts damage formula by `damageBonusOffset`.
- `rescaleMonsterTokens(tokens: MapToken[], newPartySize: number): MapToken[]`
  - Rescales active monster tokens, preserving dead status (`0 HP`) and scaling wounded monsters by `Math.round((currentHp / oldMaxHp) * newMaxHp)`.

### `src/types.ts` Augmentation
- `MapToken`:
  - `baseMaxHp?: number`
  - `scaledPartySize?: number`
  - `attacks?: MonsterAttack[]`
  - `monsterId?: string`

### Starter Gear Baseline Contracts
- Starter Armors: `perks: []`, `armorClass`: Cat 11, Wolf 12, Griffin 13, Bear 13, `rarity: 'Common'`, `valueGold <= 35`.
- Starter Steel Weapons: `damage`: 1d6 (Cat), 1d8 (Wolf/Griffin), 2d6 (Bear); no `Meteorite`, `Sign DC`, `Crit 19-20`, `Sunder`, `Knockback`.
- Starter Silver Weapons: `damage`: 1d6 (Cat), 1d8 (Wolf/Griffin), 2d6 (Bear); strictly **NO bonus dice** (`+2d6`, `+1d8`, `+1d4`); `properties`: `['Silver', ...]`; no runes or sign bonuses.

### Store & Loot Progression Invariant Contracts
- For every armor in `DEFAULT_ACT_MERCHANTS`: `item.armorClass > baselineStarterArmor[item.weightCategory]`.
- For every weapon in `DEFAULT_ACT_MERCHANTS` and loot table: item damage, attack bonus, or special perks strictly exceed the corresponding starter weapon.
