export type WitcherSchool = 'Wolf' | 'Cat' | 'Griffin' | 'Bear';

export type WitcherSignName = 'Aard' | 'Igni' | 'Quen' | 'Yrden' | 'Axii';

export interface SignInfo {
  name: WitcherSignName;
  vigorCost: number;
  castingTime: string;
  range: string;
  duration: string;
  damage?: string;
  saveType?: string;
  effect: string;
  enhancedEffect: string;
}

export interface WitcherPotion {
  name: string;
  toxicity: number;
  charges: number;
  maxCharges: number;
  duration: string;
  effect: string;
}

export interface WitcherBomb {
  name: string;
  count: number;
  maxCount: number;
  radius: string;
  effect: string;
}

export interface WitcherOil {
  name: string;
  targetCategory: string;
  bonusDamage: string;
  charges: number;
  maxCharges: number;
}

export interface WitcherAbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export type ItemCategory = 
  | 'armor' 
  | 'steel_sword' 
  | 'silver_sword' 
  | 'potion' 
  | 'bomb' 
  | 'oil' 
  | 'gear'
  | 'relic' 
  | 'quest';

export interface ArmorSet {
  id: string;
  name: string;
  armorClass: number;
  weightCategory: 'Light' | 'Medium' | 'Heavy';
  perks: string[];
  description: string;
  valueGold: number;
}

export interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  rarity: 'Common' | 'Masterwork' | 'Relic' | 'Witcher';
  valueGold: number;
  equipped?: boolean;
  // Armor Stats
  armorClass?: number;
  weightCategory?: 'Light' | 'Medium' | 'Heavy';
  // Weapon Stats
  damage?: string;
  damageType?: string;
  attackBonus?: number;
  properties?: string[];
  isSilver?: boolean;
  // Consumable Stats
  effect?: string;
  charges?: number;
  maxCharges?: number;
  toxicity?: number;
  duration?: string;
  // Ownership tracking (finite universe of items)
  assignedToSchool?: WitcherSchool | 'DM_VAULT';
  assignedToName?: string;
  discoverySource?: string;
}

export interface RewardRecord {
  id: string;
  timestamp: number;
  recipientSchool: WitcherSchool;
  recipientName: string;
  type: 'roleplay' | 'exploration' | 'investigation' | 'combat' | 'item_grant' | 'custom';
  amountGold?: number;
  itemName?: string;
  note: string;
}

export interface MerchantItem {
  id: string;
  item: GameItem;
  priceGold: number;
  stock: number;
  maxStock: number;
  merchantNote?: string;
}

export interface ActMerchant {
  actNumber: number;
  name: string;
  title: string;
  location: string;
  avatarUrl?: string;
  greeting: string;
  lore: string;
  items: MerchantItem[];
}

export interface CampaignEconomyState {
  totalRealmGold: number;
  dmVaultGold: number;
  vaultItems: GameItem[];
  rewardLog: RewardRecord[];
  actMerchants?: Record<number, ActMerchant>;
}

export interface WitcherWeapon {
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  properties: string[];
  description: string;
  isSilver: boolean;
}

export interface WitcherCharacter {
  id: string;
  name: string;
  title: string;
  school: WitcherSchool;
  schoolMotto: string;
  level: number;
  armorClass: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  speed: number;
  hitDice: string;
  hitDiceCurrent: number;
  hitDiceTotal: number;
  vigor: number; // Signs resource
  maxVigor: number;
  toxicity: number; // Max 100
  maxToxicity: number;
  abilities: WitcherAbilityScores;
  savingThrows: string[];
  skills: { name: string; bonus: number; proficient: boolean }[];
  passivePerception: number;
  steelWeapon: WitcherWeapon;
  silverWeapon: WitcherWeapon;
  schoolPerk: {
    name: string;
    description: string;
  };
  mutations: string[];
  potions: WitcherPotion[];
  bombs: WitcherBomb[];
  oils: WitcherOil[];
  signs: WitcherSignName[];
  backstory: string;
  appearance: string;
  flaw: string;
  ideal: string;
  bond: string;
  avatarUrl: string;
  gold: number; // Cintrian Orens (Finite currency)
  equippedArmor?: ArmorSet; // Simplified complete armor set
  inventory: GameItem[]; // Weapons, potions, relics, quest items
  roleplayGuide?: WitcherRoleplayGuide;
}

export interface WitcherRoleplayGuide {
  whatMakesYouDifferent: string;
  voiceAndMannerisms: string;
  combatPhilosophy: string;
  roleplayTips: string[];
  signatureQuotes: string[];
  schoolHistoryAndSecrets: string;
  partyBonds: {
    school: WitcherSchool;
    witcherName: string;
    dynamic: string;
  }[];
  personalStakeInContract: string;
}

export interface StoryVisualOverlay {
  id: string;
  actNumber: number;
  title: string;
  subtitle: string;
  caption: string;
  imageUrl: string;
}

export interface PartyChoiceRecord {
  choicePointId: string;
  actNumber: number;
  selectedOptionId: string;
  customSurpriseText?: string;
  updatedAt: number;
}

export interface MonsterAttack {
  name: string;
  bonus: number;
  damage: string;
  damageType: string;
  description: string;
}

export interface MonsterAbility {
  name: string;
  description: string;
}

export interface Monster {
  id: string;
  name: string;
  title: string;
  category: 'Relict' | 'Necrophage' | 'Specter' | 'Cursed One' | 'Humanoid';
  cr: string;
  ac: number;
  hp: number;
  maxHp: number;
  speed: string;
  abilities: WitcherAbilityScores;
  vulnerabilities: string[];
  resistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: string;
  attacks: MonsterAttack[];
  specialAbilities: MonsterAbility[];
  lore: string;
  witcherTactics: string;
  imageUrl: string;
}

export interface MapScene {
  id: string;
  actNumber: number;
  name: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  gridRows: number;
  gridCols: number;
  gmNotes: string;
}

export interface NPCEntity {
  id: string;
  name: string;
  title: string;
  category: 'Nobility' | 'Soldier' | 'Commoner' | 'Specter' | 'Outlaw' | 'Beast' | 'Necrophage';
  role: 'Friendly' | 'Hostile' | 'Neutral' | 'Ally';
  ac: number;
  hp: number;
  maxHp: number;
  speed: string;
  avatarUrl: string;
  color: string;
  description: string;
  actPresence: string;
  attacks?: {
    name: string;
    bonus: number;
    damage: string;
    description: string;
  }[];
  specialAbilities?: {
    name: string;
    description: string;
  }[];
}

export interface MapToken {
  id: string;
  name: string;
  school?: WitcherSchool;
  isMonster: boolean;
  avatarUrl: string;
  x: number; // percentage 0-100 or grid col
  y: number; // percentage 0-100 or grid row
  currentHp: number;
  maxHp: number;
  color: string;
  isHiddenFromPlayers?: boolean;
  category?: string;
  ac?: number;
  title?: string;
  tokenType?: 'monster' | 'witcher' | 'npc' | 'custom';
}

export interface DiceRollMessage {
  id: string;
  senderId: string;
  senderName: string;
  school?: WitcherSchool;
  title: string;
  formula: string;
  diceRolls: number[];
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  timestamp: number;
}

export type SpeechRoleplayMode = 'ic' | 'ooc' | 'dm';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  school?: WitcherSchool;
  isDM?: boolean;
  text: string;
  type: 'chat' | 'system' | 'roll' | 'combat' | 'lore';
  speechMode?: SpeechRoleplayMode;
  isVoiceTranscribed?: boolean;
  rollData?: DiceRollMessage;
  timestamp: number;
}

export interface CharacterAssignment {
  characterId: string;
  claimedByPeerId: string;
  claimedByName: string;
  isLocked: boolean;
  claimedAt: number;
}

export interface P2PPacket {
  type: 
    | 'SYNC_STATE'
    | 'INITIAL_STATE_SYNC'
    | 'PLAYER_JOIN'
    | 'CHAT_MESSAGE'
    | 'DICE_ROLL'
    | 'TOKEN_MOVE'
    | 'TOKEN_ADD'
    | 'TOKEN_REMOVE'
    | 'MAP_CHANGE'
    | 'CHARACTER_UPDATE'
    | 'PING_COORDINATE'
    | 'CHARACTER_CLAIM'
    | 'CHARACTER_ASSIGNMENT_SYNC'
    | 'STORY_VISUAL_SYNC'
    | 'PARTY_CHOICES_SYNC'
    | 'ECONOMY_SYNC'
    | 'MERCHANT_PURCHASE';
  senderId: string;
  senderName: string;
  payload: any;
  timestamp: number;
}
