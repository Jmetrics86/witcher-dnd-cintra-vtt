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

export interface P2PPacket {
  type: 
    | 'SYNC_STATE'
    | 'PLAYER_JOIN'
    | 'CHAT_MESSAGE'
    | 'DICE_ROLL'
    | 'TOKEN_MOVE'
    | 'TOKEN_ADD'
    | 'TOKEN_REMOVE'
    | 'MAP_CHANGE'
    | 'CHARACTER_UPDATE'
    | 'PING_COORDINATE';
  senderId: string;
  senderName: string;
  payload: any;
  timestamp: number;
}
