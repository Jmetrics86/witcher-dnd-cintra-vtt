import { WitcherSchool, StoryVisualOverlay } from '../types';
import { getAssetUrl } from '../utils/assets';

export interface CharacterBeatOpportunity {
  id: string;
  school: WitcherSchool;
  witcherName: string;
  beatTitle: string;
  trigger: string;
  checkOrAction: string;
  uniqueOutcome: string;
  scriptPrompt: string;
}

export interface CauseAndEffectRipple {
  targetAct: number; // 2, 3, 4, or 5 (Epilogue)
  rippleTitle: string;
  narrativeEffect: string;
  mechanicalEffect: string;
  bonusReadAloud?: string;
}

export interface PartyChoiceOption {
  id: string;
  label: string;
  summary: string;
  immediateOutcome: string;
  immediateReadAloud?: string;
  futureRipples: CauseAndEffectRipple[];
}

export interface PartyChoicePoint {
  id: string;
  actNumber: number;
  title: string;
  promptQuestion: string;
  contextNote: string;
  options: PartyChoiceOption[];
  otherSurpriseGuidance: string;
}

export interface BeatCharacter {
  name: string;
  role: string;
  disposition: 'Friendly' | 'Hostile' | 'Neutral' | 'Guarded' | 'Deceptive';
  description: string;
}

export interface BeatInteractable {
  name: string;
  interaction: string;
  skillCheck?: string;
  outcome: string;
}

export interface BeatSecretTreasure {
  name: string;
  discoveryCheck: string;
  reward: string;
  vaultItemId?: string;
  lore: string;
}

export interface ActStoryBeat {
  id: string;
  beatNumber: string;
  title: string;
  timeMarker: string;
  readAloudScript: string;
  npcRoleplayNotes: string[];
  charactersPresent: BeatCharacter[];
  interactableItems: BeatInteractable[];
  secretTreasures: BeatSecretTreasure[];
}

export interface AdventureAct {
  act: number;
  timeEstimate: string;
  title: string;
  location: string;
  overview: string;
  readAloud: string;
  storyVisuals: StoryVisualOverlay[];
  storyBeats: ActStoryBeat[];
  characterOpportunities: CharacterBeatOpportunity[];
  choicePoints: PartyChoicePoint[];
  dmPrompts: string[];
  keyEncounters: string[];
  investigationDCs: { check: string; dc: number; result: string }[];
  tacticalAdvice: string;
}

export interface WitcherAdventure {
  title: string;
  subtitle: string;
  estimatedPlaytime: string;
  recommendedPlayers: string;
  settingLore: string;
  witcherCodePrinciples: string[];
  acts: AdventureAct[];
  epilogue: {
    title: string;
    timeEstimate: string;
    location: string;
    overview: string;
    readAloud: string;
    storyVisuals: StoryVisualOverlay[];
    characterOpportunities: CharacterBeatOpportunity[];
    choicePoints: PartyChoicePoint[];
    choices: { name: string; description: string; consequences: string }[];
  };
}

export const WITCHER_ADVENTURE: WitcherAdventure = {
  title: 'The Blood of Marnadal',
  subtitle: 'A Witcher 5e Adventure in the Golden Age of Cintra (1184)',
  estimatedPlaytime: '4 Hours (Interactive Cause-and-Effect Module)',
  recommendedPlayers: 'Up to 4 Players (Wolf, Cat, Griffin, Bear) + 1 Narrator',
  settingLore: `The year is 1184 by the northern calendar—more than a century before the birth of Geralt of Rivia and generations before Queen Calanthe, the Lioness of Cintra, took the throne. Cintra is an ascending northern power of limestone bastions, gilded chivalric tourneys, and rich timber valleys bordering the wild ribbon of the Yaruga river.

Yet beyond the patrolled royal highways, the realm remains primeval and perilous. Ancient elven covenants carved before the First Landing still bind the deep woods, and apex relicts from the Conjunction of the Spheres slumber beneath barrow mounds. In this era, the four Witcher Schools—Wolf, Cat, Griffin, and Bear—still walk the Path in numbers, their silver medallions greeted with equal parts desperate relief and superstitious dread.`,
  witcherCodePrinciples: [
    'Silver for monsters, steel for men (and non-monstrous beasts).',
    'Never take a contract for free; negotiate before the blade is drawn.',
    'Every choice on the Path echoes forward: mercy, greed, or blood in Act I will reshape the hunt in Act IV.',
    'Use Witcher Senses to read the forensic truth of a kill site—clients almost always lie.',
    'Manage your Vigor and Elixir Toxicity wisely; a prepared Witcher wins before initiative is rolled.',
  ],
  acts: [
    {
      act: 1,
      timeEstimate: '0:00 – 0:45 (45 Minutes)',
      title: 'Act I: The Lion & The Lily',
      location: 'The Crossroads Waystation of Marnadal, Royal Highway of Cintra',
      overview:
        'Four lone witchers from four rival schools take shelter in a fortified roadside inn during a blinding Cintrian autumn storm. Royal Bailiff Sir Danek arrives in drenched blue-and-gold livery offering a massive 2,000-oren bounty—while hiding the true reason the forest has gone mad.',
      readAloud: `Autumn rain batters the heavy oak shutters of the Lion & Lily waystation like fistfuls of gravel. Inside, the peat fire sputters sour green smoke, casting long, shivering shadows across wool-traders, drenched Cintrian pikemen, and mud-caked loggers nursing dark ale.

At four separate corners of the low-timbered hall sit four figures who do not belong to the world of ordinary men. Each bears the unmistakable slit-pupil gaze of the Trial of the Grasses, twin blades strapped across the shoulder, and a heavy silver medallion resting against their chest—a snarling Wolf, a coiled Cat, a poised Griffin, and a broad-browed Bear.

Suddenly, the iron latch screams as the heavy cross-timber doors bang wide against the gale. In strides Sir Danek, Royal Bailiff to Baron Raymond of Marnadal, flanked by four Cintrian halberdiers bearing the golden rampant lion on soaked azure surcoats. With a gauntleted fist, Danek drives an iron dagger through a wax-sealed parchment straight into the central hearth-pillar.

"Two thousand Cintrian orens!" Danek bellows over the crack of thunder, his eyes darting nervously toward the four corners of the room. "By decree of Baron Raymond of Marnadal! Two thousand pieces of good royal gold for the severed head of the woodland devil slaughtering our timber convoys along the Yaruga! Do we have true monster-slayers under this roof... or only mutated vultures waiting for scraps?"`,
      storyVisuals: [
        {
          id: 'visual-act1-tavern',
          actNumber: 1,
          category: 'story',
          title: 'The Royal Bounty at the Lion & Lily',
          subtitle: 'Act I: Sir Danek Nails the Baron\'s Decree to the Hearth Pillar',
          caption:
            'Rain lashes the shutters of the Marnadal waystation as Royal Bailiff Sir Danek posts a 2,000-oren contract under the watchful amber eyes of four Witchers.',
          imageUrl: getAssetUrl('assets/story/act1_tavern_contract.jpg'),
        },
        {
          id: 'visual-act1-common-room',
          actNumber: 1,
          category: 'tavern',
          title: 'The Lion & Lily Common Room',
          subtitle: 'Roleplay Environment: Travelers, Ale & Whispers by the Hearth',
          caption:
            'Warm amber firelight washes over oak trestle tables, Cintrian lion heraldry, and quiet whispers as the four witchers size each other up before taking the contract.',
          imageUrl: getAssetUrl('assets/story/tavern_common_room.jpg'),
        },
      ],
      storyBeats: [
        {
          id: 'beat-1-1',
          beatNumber: 'Beat 1.1',
          title: 'Four Medallions in the Firelight & The Bailiff\'s Lie',
          timeMarker: '0:00 – 0:20',
          readAloudScript: `Sir Danek wipes rainwater from his trimmed gray beard and steps toward the hearth, his hand resting on his pommel. As he approaches, every Witcher medallion in the room gives the faintest, almost imperceptible tremor—not from Danek himself, but from something hidden beneath his wool cloak.

"Three royal logging convoys have vanished in the Primeval Blackwood in a fortnight," Danek says, lowering his voice so the common folk lean in to listen. "Fourteen guards and twenty draught horses torn to ribbons. The Baron wants the beast dead before the full moon rises tomorrow night. Two thousand orens—five hundred for each of your schools if you ride together. No questions asked about what cargo the wagons carried. Only bring back the creature's head."`,
          npcRoleplayNotes: [
            'Sir Danek (Voice: clipped, authoritative, yet ragged with lack of sleep): He avoids eye contact whenever asked *where* the loggers were cutting timber.',
            'Hidden Clue: Beneath his tunic, Danek clutches a cold-iron ward and a splinter of petrified golden heartwood that smells faintly of ozone and dried sap.',
          ],
          charactersPresent: [
            {
              name: 'Sir Danek of the Blue Banner',
              role: 'Royal Bailiff & Secret Desecrator',
              disposition: 'Deceptive',
              description: 'Weary Cintrian knight in sodden mantle, clutching an iron lockbox under his cloak. Haggles nervously while deflecting convoy details.',
            },
            {
              name: 'Innkeeper Torvin',
              role: 'Tavern Host & Local Gossip',
              disposition: 'Neutral',
              description: 'Burly barkeep wiping tankards with an eye on the door. Eager to see Danek leave before steel is drawn.',
            },
            {
              name: 'Terrified Logging Families',
              role: 'Marnadal Commoners & Refuges',
              disposition: 'Guarded',
              description: 'Widows and laborers murmuring about yellow eyes in the mists and weeping heart-trees.',
            },
          ],
          interactableItems: [
            {
              name: 'Bounty Contract Sheepskin',
              interaction: 'Examine the contract wording, official wax seal, and payment guarantees.',
              skillCheck: 'DC 13 Investigation',
              outcome: 'The seal is Baron Raymond\'s personal signet, not the Royal Crown of Cintra; the designated logging trail avoids timber stands and heads directly toward ancient barrow mounds.',
            },
            {
              name: 'Sir Danek\'s Concealed Lockbox',
              interaction: 'Focus Witcher Senses on the slight humming vibration near Danek\'s hip.',
              skillCheck: 'DC 14 Perception (Witcher Senses)',
              outcome: 'Your medallion pulses hot. You catch the pungent scent of petrified amber, ozone, and dried blood coming from an iron-bound box tucked under his cloak.',
            },
            {
              name: 'Tavern Rumor Mill & Ledger',
              interaction: 'Question Torvin or offer coin to listening wagoners about the convoy route.',
              skillCheck: 'DC 12 Persuasion or Charisma',
              outcome: 'A tipsy teamster reveals the wagons carried heavy stone-cutting chisels, dwarven pickaxes, and barred iron cages—not axes for felled timber.',
            },
          ],
          secretTreasures: [
            {
              name: 'Bailiff\'s Discretionary Coin Purse',
              discoveryCheck: 'DC 15 Sleight of Hand or DC 14 Intimidation',
              reward: '🪙 35 Cintrian Orens & Swallow Potion (Phial #3)',
              vaultItemId: 'potion-swallow-3',
              lore: 'Emergency hush money provided by Baron Raymond to keep tavern gossip quiet.',
            },
            {
              name: 'Loose Floorboard behind Ale Barrels',
              discoveryCheck: 'DC 13 Perception (Hearing)',
              reward: '🪙 20 Cintrian Orens & Grapeshot Bomb (Pack #2)',
              vaultItemId: 'bomb-grapeshot-2',
              lore: 'Stashed poacher contraband left behind by a scout who fled the Blackwood after hearing the Chort\'s roar.',
            },
          ],
        },
        {
          id: 'beat-1-2',
          beatNumber: 'Beat 1.2',
          title: 'Ser Justin\'s Provocation & The Scarred Survivor',
          timeMarker: '0:20 – 0:45',
          readAloudScript: `Before the ink on the contract is dry, a bench scrapes loudly near the ale-casks. Ser Justin of Attre—a flushed, broad-shouldered Cintrian tourney knight three cups deep in plum brandy—staggers to his feet with two squires behind him. He spits on the rushes an inch from your boots.

"Two thousand gold for gutter-born mutants?" Ser Justin sneers, his hand dropping to his longsword hilt. "My father bled for Cintra at the Yaruga crossing! Give me a dozen horsemen and torches, Danek, and I'll burn the whole cursed wood down for half the price—right after I teach these cat-eyed freaks to bow to a belted knight!"

Meanwhile, huddled in the darkest booth behind the chimney, a bandaged woodsman named Kaelan—the sole survivor of the third convoy—watches with wide, terrified eyes, his throat too scarred to speak, his fingernails caked with glowing green lichen.`,
          npcRoleplayNotes: [
            'Ser Justin (Voice: booming, slurred, arrogant): He singles out Sybilla (Cat) or Bram (Bear) first. He expects mutants to cower before Cintrian nobility.',
            'Kaelan the Mute Woodsman: Cannot speak because black root-spores strangled his vocal cords, but he can sketch a symbol in spilled ale on the table: a split oak tree weeping a radiant circle (the stolen Sun Stone).',
          ],
          charactersPresent: [
            {
              name: 'Ser Justin of Attre',
              role: 'Cintrian Tourney Knight & Agitator',
              disposition: 'Hostile',
              description: 'Flushed, arrogant young noble in gold-trimmed tabard, emboldened by plum brandy and desperate for glory.',
            },
            {
              name: 'Squires Vann & Gil',
              role: 'Justin\'s Retinue',
              disposition: 'Guarded',
              description: 'Nervous teenagers holding tourney bucklers, terrified of the four armed Witchers.',
            },
            {
              name: 'Kaelan the Woodsman',
              role: 'Traumatized Convoy Survivor',
              disposition: 'Friendly',
              description: 'Mute, bandaged survivor with green lichen beneath his fingernails and black root-scars across his throat.',
            },
          ],
          interactableItems: [
            {
              name: 'Kaelan\'s Spilled Ale Diagram',
              interaction: 'Examine the symbol Kaelan feverishly sketches in spilled ale across the booth table.',
              skillCheck: 'DC 12 History or Nature',
              outcome: 'He sketches a hollow ancient oak tree with an amber disk in its hollow heart, surrounded by 3 skull totems. The Sun Stone of Elidyr!',
            },
            {
              name: 'Ser Justin\'s Tourney Pommel',
              interaction: 'Inspect Justin\'s stance, weapon balance, and dueling intent.',
              skillCheck: 'DC 13 Insight or Witcher Combat Senses',
              outcome: 'His blade has never tasted monster flesh; an Axii Sign or a simple disarming pirouette will end his swagger without bloodshed.',
            },
            {
              name: 'Kaelan\'s Spore-Infected Bandages',
              interaction: 'Inspect the weeping black sores across Kaelan\'s neck.',
              skillCheck: 'DC 13 Medicine (Herbalism)',
              outcome: 'Root-spores from an Ancient Leshen! Washing them with White Honey or spirits halts the necrosis and restores his ability to whisper.',
            },
          ],
          secretTreasures: [
            {
              name: 'Ser Justin\'s Velvet Tourney Purse',
              discoveryCheck: 'DC 14 Sleight of Hand or Disarming Surrender',
              reward: '🪙 45 Cintrian Orens & Silver Wyvern Medallion',
              lore: 'Gold won in the summer jousts of Cintra, surrendered in shame or lifted in the tavern scrum.',
            },
            {
              name: 'Kaelan\'s Foraged Alchemical Satchel',
              discoveryCheck: 'Gifted freely if Kaelan is healed or shielded',
              reward: '🪙 15 Cintrian Orens & Relict Oil Phial',
              vaultItemId: 'oil-relict-1',
              lore: 'Rare wolfsbane and monster gall collected in the deep barrows before the massacre.',
            },
          ],
        },
      ],
      characterOpportunities: [
        {
          id: 'opp-act1-wolf',
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          beatTitle: 'Forensic Inspection of Kaelan\'s Wounds',
          trigger: 'When inspecting the mute survivor Kaelan in the corner booth.',
          checkOrAction: 'Wisdom (Perception / Witcher Senses +8) or Medicine',
          uniqueOutcome:
            'Vane smells crushed elder-moss and necrotic sap inside Kaelan\'s bandages—recognizing that an Ancient Leshen marked Kaelan as a warning, not a meal. Kaelan gratefully hands Vane a vial of purified Dwarven Spirit (+1 charge to any potion!).',
          scriptPrompt:
            '🐺 [Wolf Spotlight — Vane]: Bending over the trembling woodsman, your Witcher Senses catch the unmistakable scent of ancient heartwood sap and ozone. These claw marks weren\'t meant to kill—whatever rules that forest let this man live to deliver a message.',
        },
        {
          id: 'opp-act1-cat',
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          beatTitle: 'Lifting the Bailiff\'s Secret Seal',
          trigger: 'During negotiations with Sir Danek or the commotion with Ser Justin.',
          checkOrAction: 'Dexterity (Sleight of Hand +8) or Insight (+4)',
          uniqueOutcome:
            'Sybilla spots a blood-stained manifest tucked inside Danek\'s belt pouch (or recognizes his boots are caked in barrow-clay, not forest mud). Lifting or glimpsing it reveals the wagons were hauling "Reliquary Stone from Site Elidyr"—granting Advantage on all checks to pressure the Baron later!',
          scriptPrompt:
            '🐱 [Cat Spotlight — Sybilla]: While the Bailiff blusters about innocent lumberjacks, your eyes drop to his spurs and belt-pouch. Grave-chalk on his heels and a royal smuggling cipher on his parchment—Danek isn\'t hiring monster hunters; he\'s hiring cleaners.',
        },
        {
          id: 'opp-act1-griffin',
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          beatTitle: 'Invoking the Ancient Law of Marnadal',
          trigger: 'When addressing Sir Danek or putting drunken Ser Justin in his place.',
          checkOrAction: 'Intelligence (History +7) or Charisma (Persuasion +5 / Axii)',
          uniqueOutcome:
            'Alden reveals his ancestral Marnadal signet ring and recites the High King\'s code of hospitality. The Cintrian soldiers snap to attention in awe of the Knight-Witcher, forcing Danek to pay a 400-oren advance immediately!',
          scriptPrompt:
            '🦅 [Griffin Spotlight — Alden]: The golden griffin on your cuirass catches the hearthfire as you raise your ancestral Marnadal signet. The tavern falls dead silent—even drunken Ser Justin pales as you recite the First King\'s Oath in flawless courtly Cintrian.',
        },
        {
          id: 'opp-act1-bear',
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          beatTitle: 'Crushing the Tavern Standoff',
          trigger: 'When Ser Justin reaches for his sword to threaten the Witchers.',
          checkOrAction: 'Strength (Athletics +7) or Charisma (Intimidation +5)',
          uniqueOutcome:
            'Without drawing steel, Bram splinters the oak table with one fist or lifts Ser Justin off his boots by his gorget. The terrified knight drops his purse (50 orens) and swears not to interfere.',
          scriptPrompt:
            '🐻 [Bear Spotlight — Bram]: You rise to your full six-foot-six height, the bear-pelt mantle casting Ser Justin in shadow. The heavy silver cleaver on your back hums against your chainmail. One glare from your ice-gold eyes freezes the knight\'s hand on his hilt.',
        },
      ],
      choicePoints: [
        {
          id: 'choice-act1-contract',
          actNumber: 1,
          title: 'Act I Decision A: The Bailiff\'s Contract Terms',
          promptQuestion: 'How does the Witcher party negotiate the 2,000-oren contract with Royal Bailiff Sir Danek?',
          contextNote: 'This choice determines the party\'s upfront resources, Danek\'s loyalty, and how Baron Raymond prepares for their return.',
          options: [
            {
              id: 'contract-hard-bargain',
              label: 'Option 1: Hard Bargain & Upfront Gold',
              summary: 'Demand 500 orens advance payment right now and full salvage rights to whatever lies in the woods.',
              immediateOutcome:
                'Sir Danek begrudgingly unlocking his iron lockbox and counts out 500 orens in advance. However, he dispatches a secret rider to warn Baron Raymond that the Witchers are greedy and suspicious.',
              immediateReadAloud: `"Five hundred now, or you can march into that fog yourself, Bailiff." Danek swallows hard, unlocks his iron coffer with a trembling key, and slams four heavy leather pouches of gold onto the oak table.`,
              futureRipples: [
                {
                  targetAct: 2,
                  rippleTitle: 'Outrider Spy in the Blackwood (From Act I Hard Bargain)',
                  narrativeEffect: 'Because Danek feared you would uncover the smuggling operation, he sent a mounted spy ahead to burn evidence at the wagon site.',
                  mechanicalEffect: 'A dying Cintrian spy is found at the massacre site in Act II clutching a map to the crypt.',
                },
                {
                  targetAct: 5,
                  rippleTitle: 'Fortified Castle Hall (From Act I Hard Bargain)',
                  narrativeEffect: 'Baron Raymond expects tough mercenaries and has four extra crossbowmen posted in the gallery during the Epilogue.',
                  mechanicalEffect: '+500 orens already secured in party coffers; Intimidation checks against the Baron require DC 15.',
                },
              ],
            },
            {
              id: 'contract-chivalric-accord',
              label: 'Option 2: Sworn Witcher Accord & Quiet Probe',
              summary: 'Accept the contract with professional courtesy while privately pressing Danek on why he is terrified.',
              immediateOutcome:
                'Relieved that you didn\'t humiliate him publicly, Danek pulls the party aside by the stables and confesses that the Baron\'s steward entered the old barrow mound and never came out.',
              immediateReadAloud: `Out by the rain-swept stables, Danek glances over his shoulder and presses a brass crypt-key into your palm. "Gods forgive me... the loggers weren't cutting pine. The Baron's steward ordered them to pry open the Barrow of King Elidyr."`,
              futureRipples: [
                {
                  targetAct: 3,
                  rippleTitle: 'The Bailiff\'s Brass Key (From Act I Chivalric Accord)',
                  narrativeEffect: 'Danek\'s secret confession and brass key allow the party to bypass the outer trapped portcullis of King Elidyr\'s Barrow.',
                  mechanicalEffect: 'Automatic success on entering the Crypt outer sanctum and +2 bonus on History/Arcana checks in Act III.',
                },
                {
                  targetAct: 5,
                  rippleTitle: 'Sir Danek\'s Testimony (From Act I Chivalric Accord)',
                  narrativeEffect: 'In the Epilogue, Sir Danek sides with the Witchers against Baron Raymond if the Baron\'s sacrilege is exposed.',
                  mechanicalEffect: 'Automatic Advantage on Persuasion Checks in Castle Marnadal.',
                },
              ],
            },
            {
              id: 'contract-public-exposure',
              label: 'Option 3: Public Accusation in the Tavern',
              summary: 'Expose Danek\'s sweating lies and the petrified heartwood splinter in front of the entire tavern.',
              immediateOutcome:
                'The common woodsmen and Cintrian soldiers erupt in outrage upon hearing the Baron provoked an ancient forest spirit. Danek flees into the storm in disgrace, leaving the bounty chest behind.',
              immediateReadAloud: `Gasps ripple through the Lion & Lily as you hold up the splinter of cursed heartwood. Old woodsmen make the sign of warding, and Danek backs out the door into the mud, his face pale as tallow.`,
              futureRipples: [
                {
                  targetAct: 2,
                  rippleTitle: 'Local Woodsmen\'s Gratitude (From Act I Public Exposure)',
                  narrativeEffect: 'The grateful tavern woodsmen gift the Witchers pitch-torches and reveal the hidden deer-path that bypasses the worst of the bog.',
                  mechanicalEffect: 'Party gains Surprise/Advantage on Initiative in the Act II Barghest ambush!',
                },
                {
                  targetAct: 5,
                  rippleTitle: 'Peasant Uprising at Marnadal (From Act I Public Exposure)',
                  narrativeEffect: 'Word of the Baron\'s crime spreads through the valley before the Witchers even return from the woods.',
                  mechanicalEffect: 'Baron Raymond is politically cornered in the Epilogue and cannot order his guards to attack the Witchers.',
                },
              ],
            },
          ],
          otherSurpriseGuidance:
            'Did the party do something completely unexpected (e.g., kidnap Sir Danek as a guide, rob the royal tax wagon outside, or recruit Ser Justin as cannon fodder)? Record it here to carry forward across Acts II–IV!',
        },
        {
          id: 'choice-act1-brawl',
          actNumber: 1,
          title: 'Act I Decision B: Dealing with Ser Justin\'s Knights',
          promptQuestion: 'How did the party handle drunken Ser Justin of Attre and his squires?',
          contextNote: 'Determines whether Cintrian knights view the party with respect, fear, or blood-feud hostility.',
          options: [
            {
              id: 'brawl-nonlethal',
              label: 'Option 1: Non-Lethal Tavern Thrashing',
              summary: 'Break noses and bruising ribs with bare fists, pommels, or Aard without killing anyone.',
              immediateOutcome:
                'Ser Justin is dumped unconscious into the horse trough outside. The tavern keeper cheers and slides free rounds of Mahakaman mead to the Witchers.',
              futureRipples: [
                {
                  targetAct: 2,
                  rippleTitle: 'Tavern Keeper\'s Herbal Poultice (From Act I Non-Lethal Brawl)',
                  narrativeEffect: 'Grateful for not spilling blood in his inn, the tavern keeper gifts the party a bundle of Celandine herbs.',
                  mechanicalEffect: 'Each Witcher starts Act II with +5 Temporary HP.',
                },
              ],
            },
            {
              id: 'brawl-axii-diplomacy',
              label: 'Option 2: Axii Mind-Trick or Noble Wit',
              summary: 'Use the Axii Sign or razor-sharp courtly etiquette to make Ser Justin apologize and buy the room a round.',
              immediateOutcome:
                'Blinking in dazed confusion (or humbled by Alden\'s noble pedigree), Ser Justin salutes the Witchers and warns them about a pack of glowing green hounds he saw near the river.',
              futureRipples: [
                {
                  targetAct: 2,
                  rippleTitle: 'Forewarned of Spectral Hounds (From Act I Axii/Diplomacy)',
                  narrativeEffect: 'Ser Justin\'s warning prompts the Witchers to coat their blades in Specter Oil before entering the Blackwood.',
                  mechanicalEffect: 'All Witchers deal +1d8 bonus Specter Oil damage on their first strike in Act II!',
                },
              ],
            },
            {
              id: 'brawl-lethal-steel',
              label: 'Option 3: Lethal Steel Drawn',
              summary: 'Cut down Ser Justin and his squires with steel blades in the middle of the waystation.',
              immediateOutcome:
                'Silence falls over the blood-slicked tavern floor. None dare cross the Witchers, and you loot fine Cintrian steel and 120 orens from the bodies—but the dead knight\'s spirit will not rest easy.',
              futureRipples: [
                {
                  targetAct: 2,
                  rippleTitle: 'Blood-Scented Barghests (From Act I Lethal Steel)',
                  narrativeEffect: 'The fresh human blood spilled on the Witchers\' boots draws an extra spectral hound out of the mist in Act II.',
                  mechanicalEffect: 'Spawn +1 additional Barghest Spectral Hound during the Act II ambush (5 total instead of 4).',
                },
              ],
            },
          ],
          otherSurpriseGuidance:
            'Record any custom outcome from the Ser Justin encounter (e.g., challenging him to a drinking contest, tying him to his horse, or convincing him to join the hunt).',
        },
      ],
      dmPrompts: [
        'Invite each player to describe their Witcher sitting in their corner of the tavern—their posture, their eyes, and how they react when Danek nails the 2,000-oren bounty to the pillar.',
        'Use the "Show Scene to Players" button on the Act I Story Visual so the players see the atmospheric tavern scene while roleplaying negotiations!',
        'Trigger at least one or two Character-Specific Spotlight Opportunities before heading into the forest.',
      ],
      keyEncounters: [
        'Social Negotiation: Royal Bailiff Sir Danek (DC 13 Persuasion / Intimidation / Insight).',
        'Tavern Confrontation: Ser Justin of Attre & 2 Squires (AC 15, 18 HP each if fought).',
        'Forensic Clue: Kaelan the Mute Woodsman in the chimney booth.',
      ],
      investigationDCs: [
        {
          check: 'Wisdom (Insight) vs Sir Danek',
          dc: 12,
          result: 'Danek is terrified—not of a random beast, but of an ancient curse. He clutches a splinter of golden heartwood beneath his cloak.',
        },
        {
          check: 'Wisdom (Perception / Witcher Senses) on Kaelan',
          dc: 13,
          result: 'Kaelan\'s wounds are infused with living silver-green lichen and smell of primeval oak sap—the signature of an Ancient Leshen.',
        },
        {
          check: 'Intelligence (History / Arcana)',
          dc: 14,
          result: 'Recall the Treaty of Marnadal (1050): King Elidyr swore never to cut the Sacred Grove or touch the Sun Stone, lest the Woodland Guardian wake.',
        },
      ],
      tacticalAdvice:
        'Act I sets the tone and establishes the cause-and-effect chain. Make sure you click the party\'s choices in Decision A and Decision B above—they will automatically generate narrative and mechanical ripples in Acts II, III, IV, and the Epilogue!',
    },
    {
      act: 2,
      timeEstimate: '0:45 – 1:45 (60 Minutes)',
      title: 'Act II: The Tracker\'s Trail',
      location: 'The Primeval Blackwood of the Yaruga Verge',
      overview:
        'Pushing into the mist-choked primeval forest north of the Yaruga, the Witchers investigate the slaughtered royal convoy, uncover proof that the wagons were smuggling desecrated Elven relics rather than timber, and survive a lethal pack ambush by spectral Barghest hounds.',
      readAloud: `The rain slows to a clammy, suffocating fog as you lead your horses beneath the eaves of the Primeval Blackwood. Giant moss-bearded oaks blot out the sky, and wet pine needles muffle every hoofbeat.

Ahead in a sunken mud clearing lies the massacre. Three heavy royal timber wagons have been flipped and shattered like kindling. Massive Cintrian draught horses lie eviscerated in their harnesses, their ribcages burst outward by something with immense antlers. High in the spruce branches above, stripped human skeletons hang suspended in cages of living thorn-vines, crowned with woven skulls and black crow feathers.

Yet as you step closer to the overturned central wagon, you see what split the axle: not pine logs, but massive, freshly chiseled slabs of glowing elven runestone pried from an underground shrine.

Suddenly, the forest goes dead silent. The temperature plummets until your breath plumes white. Against your chests, all four silver medallions begin to jerk and hum like trapped hornets. Out of the swirling green mist, four pairs of blazing emerald eyes ignite in spectral hellfire!`,
      storyVisuals: [
        {
          id: 'visual-act2-convoy',
          actNumber: 2,
          title: 'The Massacre in the Primeval Blackwood',
          subtitle: 'Act II: Smuggled Elven Monoliths & Spectral Eyes in the Mist',
          caption:
            'Overturned royal wagons spill stolen runic stone slabs into the mud while woven raven effigies hang overhead and spectral Barghest hounds circle in the fog.',
          imageUrl: getAssetUrl('assets/story/act2_massacre_convoy.jpg'),
        },
      ],
      storyBeats: [
        {
          id: 'beat-2-1',
          beatNumber: 'Beat 2.1',
          title: 'Reading the Kill Site & The Stolen Monoliths',
          timeMarker: '0:45 – 1:05',
          readAloudScript: `Crouching in the mud beside the shattered central wagon, the truth of Baron Raymond's "logging convoy" lies bare. The canvas tarps were merely a disguise. Underneath lie broken relief carvings of King Elidyr and the Elven Sages—hacked from an ancient sanctuary with iron pickaxes.

Even stranger, beside the lead wagon lies the corpse of Captain Vester, commander of the escort. Unlike the loggers who were impaled by wooden roots and gored by giant horns, Vester has a neat, narrow stiletto wound between his shoulder blades—killed by a human assassin before the monsters even struck.`,
          npcRoleplayNotes: [
            'Environmental Clue: The mud shows two distinct monster tracks—the deep cloven craters of a ten-ton Primeval Chort, and the root-like, vanishing stride of an Ancient Leshen.',
            'Human Treachery: The Baron\'s personal steward murdered Captain Vester when Vester refused to desecrate the inner shrine, then fled toward the Barrow of King Elidyr with the Sun Stone!',
          ],
          charactersPresent: [
            {
              name: 'Captain Vester\'s Corpse',
              role: 'Betrayed Convoy Commander',
              disposition: 'Neutral',
              description: 'Dead royal captain lying face down in the mud, clutching a broken Cintrian officer\'s seal, murdered from behind with a stiletto.',
            },
            {
              name: 'Slaughtered Convoy Draught Horses',
              role: 'Monster Carnage Evidence',
              disposition: 'Neutral',
              description: 'Six massive heavy horses gored by curved horns and rooted into the mire by thorny wooden tendrils.',
            },
            {
              name: 'Spectral Raven Watchers',
              role: 'Eyes of the Ancient Leshen',
              disposition: 'Hostile',
              description: 'Dozens of uncanny black crows perched motionlessly on high branches, tracking the Witchers\' investigative steps.',
            },
          ],
          interactableItems: [
            {
              name: 'Captain Vester\'s Stiletto Wound',
              interaction: 'Examine the angle of entry and weapon characteristics on Vester\'s corpse.',
              skillCheck: 'DC 13 Medicine or Investigation',
              outcome: 'Clean thrust between ribs with a 5-inch thin assassin blade smeared with paralytic belladonna. Struck by a trusted companion before the monsters attacked.',
            },
            {
              name: 'Stolen Runic Monolith Slabs',
              interaction: 'Brush away canvas tarps and examine the elven engravings.',
              skillCheck: 'DC 14 Arcana or History',
              outcome: 'The slabs are sacred architectural foundation stones pried from King Elidyr\'s Barrow. Inscribed with warding oaths that held primeval entities in slumber.',
            },
            {
              name: 'Dual Monster Tracks in the Silt',
              interaction: 'Analyze the depth and stride of the mud craters.',
              skillCheck: 'DC 13 Survival (Tracking)',
              outcome: 'Identifies deep cloven hooves of a 10-ton Primeval Chort and vanishing root-strides of an Ancient Leshen. The two apex monsters hunted in unison!',
            },
          ],
          secretTreasures: [
            {
              name: 'Captain Vester\'s Hidden Wagon Cache',
              discoveryCheck: 'DC 14 Investigation under the wagon floorboard',
              reward: '🪙 50 Cintrian Orens & Skellige Ursine-Forged Ring Mail Set',
              vaultItemId: 'armor-skellige-chain',
              lore: 'The royal escort\'s locked payroll chest and heavy cold-forged Skellige ring mail salvaged from an An Craite guard.',
            },
            {
              name: 'Burned Convoy Medical Satchel in Briars',
              discoveryCheck: 'DC 13 Athletics or Aard Sign to clear thorns',
              reward: '🪙 30 Cintrian Orens & White Raffard\'s Decoction (Phial #2)',
              vaultItemId: 'potion-white-raffard-2',
              lore: 'An apothecary kit dropped by the wagon surgeon when the Chort overturned the convoy.',
            },
          ],
        },
        {
          id: 'beat-2-2',
          beatNumber: 'Beat 2.2',
          title: 'Ambush of the Spectral Pack',
          timeMarker: '1:05 – 1:45',
          readAloudScript: `A chorus of unearthly, echoing howls shatters the mist—neither wolf nor hound, but the shriek of damned souls born from the forest's wrath. Four Barghest Spectral Hounds—wreathed in viridian ghost-flame, their skull-faces grinning through translucent green ectoplasm—bound over the shattered wagons and lunge for your throats!`,
          npcRoleplayNotes: [
            'Switch from the Story Visual back to the Act II Tactical Battle Map (`The Primeval Blackwood`) so players can position their tokens and fight the 4 Barghest Hounds!',
            'Combat Tip: Remind players that Yrden Circles and Moon Dust bombs strip the Barghests\' incorporeal resistance!',
          ],
          charactersPresent: [
            {
              name: 'Four Barghest Spectral Hounds',
              role: 'Ectoplasmic Forest Pack',
              disposition: 'Hostile',
              description: 'Incorporeal ghost hounds ablaze with emerald necro-fire, hunting in tandem to drag intruders to the grave.',
            },
            {
              name: 'The Spectral Pack Alpha',
              role: 'Vengeful Echo of the Woods',
              disposition: 'Hostile',
              description: 'Massive hound manifesting atop the wagon wreckage, directing flanking attacks and blinding flame spits.',
            },
          ],
          interactableItems: [
            {
              name: 'Blazing Wagon Hub & Burning Pitch',
              interaction: 'Kick or cast Aard Sign on the smoldering timber wheel to spray embers.',
              skillCheck: 'DC 12 Athletics or Aard Sign',
              outcome: 'Ignites spilled lantern oil in a 15-ft crescent, blocking the hounds and dealing 2d6 fire damage to any spectral beast leaping through.',
            },
            {
              name: 'Woven Raven Effigies in the Canopy',
              interaction: 'Target the skull-and-feather charms suspended from low branches.',
              skillCheck: 'DC 13 ranged attack or Igni Sign',
              outcome: 'Burning an effigy snaps the spectral anchor, stripping one Barghest of its incorporeal damage resistances for the remainder of the battle.',
            },
            {
              name: 'Overturned Iron Draught Harness',
              interaction: 'Heave the spiked iron yoke to pin a charging hound.',
              skillCheck: 'DC 14 Strength (Athletics)',
              outcome: 'Pins a spectral hound to the bog mud, immobilizing it and giving adjacent melee attackers advantage.',
            },
          ],
          secretTreasures: [
            {
              name: 'Gilded Cavalry Pommel in the Silt',
              discoveryCheck: 'DC 14 Perception after the hounds disperse',
              reward: '🪙 40 Cintrian Orens & Sir Danek\'s Cintrian Cavalry Sabre',
              vaultItemId: 'steel-cintrian-sabre',
              lore: 'The ornate lion dueling sabre carried by Sir Danek\'s murdered lieutenant.',
            },
            {
              name: 'Hollow Trunk behind the Raven Totem',
              discoveryCheck: 'DC 13 Witcher Senses (Sight/Smell)',
              reward: '🪙 25 Cintrian Orens & Moon Dust Bomb (Pack #2)',
              vaultItemId: 'bomb-moon-dust-2',
              lore: 'A hidden stash of silver-salt munitions buried by an elven scout who foresaw the spectral curse.',
            },
          ],
        },
      ],
      characterOpportunities: [
        {
          id: 'opp-act2-wolf',
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          beatTitle: 'Reconstructing the Dual-Monster Ambush',
          trigger: 'When examining the tracks and torn horses around the wagons.',
          checkOrAction: 'Wisdom (Survival / Tracking +8)',
          uniqueOutcome:
            'Vane deduces that the Ancient Leshen has bound a Primeval Chort as its enforcer—and spots the exact ridge where the Barghests are about to leap from, preventing the party from being surprised and granting +2 to everyone\'s Initiative!',
          scriptPrompt:
            '🐺 [Wolf Spotlight — Vane]: Running your fingers along the gouged oak bark ten feet off the ground, you read the whole battle in seconds: Chort horns on the left, Leshen roots from below—and fresh ectoplasmic frost forming on the ferns right behind you. "Blades out! Now!"',
        },
        {
          id: 'opp-act2-cat',
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          beatTitle: 'The Assassin\'s Stiletto & The Hidden Courier',
          trigger: 'When inspecting Captain Vester\'s corpse by the lead wagon.',
          checkOrAction: 'Intelligence (Investigation +4) or Wisdom (Perception +7)',
          uniqueOutcome:
            'Sybilla identifies the stiletto wound as the signature strike of the Baron\'s ruthless steward, Master Corvus, and finds a hidden pouch of 150 Cintrian orens and a dose of Superior Hanged Man\'s Venom (+2d8 vs humanoids or +1d8 vs Necrophages) strapped inside the wagon axle!',
          scriptPrompt:
            '🐱 [Cat Spotlight — Sybilla]: You turn the dead captain\'s collar with the tip of your sabre. "Leshens don\'t use three-sidediletto blades from Tretogor." Reaching into the hollow beneath the driver\'s seat, your fingers close around a smuggler\'s cache.',
        },
        {
          id: 'opp-act2-griffin',
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          beatTitle: 'Shattering the Ethereal Shroud',
          trigger: 'When the Barghest Spectral Hounds materialize from the mist.',
          checkOrAction: 'Cast Yrden Sign + Intelligence (Arcana +7)',
          uniqueOutcome:
            'Alden weaves an amplified Yrden glyph circle around the overturned wagon that resonates with the stolen elven runestones—expanding the Yrden radius to 25 feet and forcing all Barghests within it to take +1d6 radiant damage every time they start their turn!',
          scriptPrompt:
            '🦅 [Griffin Spotlight — Alden]: Channeling your Vigor into the broken elven monoliths on the ground, your Yrden glyph blazes like a miniature violet sun—anchoring every spectral hound in the clearing into solid, vulnerable flesh!',
        },
        {
          id: 'opp-act2-bear',
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          beatTitle: 'Measuring the Chort\'s Rampage',
          trigger: 'When inspecting the overturned three-ton timber wagon.',
          checkOrAction: 'Strength (Athletics +7)',
          uniqueOutcome:
            'Bram single-handedly heaves the multi-ton oak wagon bed off a crushed iron strongbox beneath it—recovering a Dwarven Rune-Stone (+1 to attack & damage rolls for one weapon for the rest of the adventure) and recognizing his nemesis: the Old One-Horn Chort of the Yaruga.',
          scriptPrompt:
            '🐻 [Bear Spotlight — Bram]: Bracing your boots in the mud, your muscles cord like iron cables as you heave the shattered wagon axle skyward. Beneath it lies a crushed strongbox—and embedded in the oak is a splinter of black horn you\'ve tracked for three hundred miles.',
        },
      ],
      choicePoints: [
        {
          id: 'choice-act2-aftermath',
          actNumber: 2,
          title: 'Act II Decision: The Trail into the Ravine',
          promptQuestion: 'After defeating the Barghest pack at the massacre site, how does the party proceed toward King Elidyr\'s Barrow?',
          contextNote: 'Shapes how the party enters Act III and whether the Marnadal Grave Hag or the Leshen\'s crows detect them.',
          options: [
            {
              id: 'trail-burn-corpses',
              label: 'Option 1: Consecrate & Burn the Massacre Site with Igni',
              summary: 'Use Igni to cremate the slain guards and horses so necrophages cannot feast on them, then march boldly down the ravine.',
              immediateOutcome:
                'The funeral pyre sends black smoke curling through the canopy. You deny the Grave Hag her larder—drawing her rage—but the spirits of the fallen Cintrian soldiers grant a quiet blessing.',
              immediateReadAloud: `Orange Igni flames roar against the damp mist as you burn the butchered convoy to clean ash. High in the branches, the Leshen's ravens scatter with angry shrieks.`,
              futureRipples: [
                {
                  targetAct: 3,
                  rippleTitle: 'Starved & Furious Grave Hag (From Act II Funeral Pyre)',
                  narrativeEffect: 'Smelling her fresh corpses burning from down in the ravine, the Marnadal Grave Hag rushes toward the crypt entrance in a frenzy instead of hiding in ambush!',
                  mechanicalEffect: 'The Grave Hag cannot use stealth or ambush the party in Act III, and every Witcher gains 1 free point of Vigor from the restful pyre rite.',
                },
              ],
            },
            {
              id: 'trail-stealth-approach',
              label: 'Option 2: Mask Scents with Necrophage Decoction & Slip In Unseen',
              summary: 'Rub bog-moss and Barghest ectoplasm over your armor to mask your living scent and creep silently into the barrow.',
              immediateOutcome:
                'Moving like ghosts beneath the roots, you slip past the murder of watcher-crows without triggering a single warning caw.',
              immediateReadAloud: `Coated in cold bog-mire and spectral ash, the four of you descend the root-choked steps of the ravine without a sound. Even the watcher-crows above fail to spot your passage.`,
              futureRipples: [
                {
                  targetAct: 3,
                  rippleTitle: 'Total Ambush on the Grave Hag (From Act II Stealth Approach)',
                  narrativeEffect: 'You catch the Marnadal Grave Hag completely unaware while she gnaws on bones over the sarcophagus!',
                  mechanicalEffect: 'The entire Witcher party gains a free Surprise Round against the Grave Hag in Act III!',
                },
              ],
            },
            {
              id: 'trail-harvest-mutagens',
              label: 'Option 3: Alchemical Harvesting & Totem Destruction',
              summary: 'Spend twenty minutes harvesting glowing Barghest essence and chopping down the hanging crow-totems in the trees.',
              immediateOutcome:
                'Destroying the outer crow-totems severs one of the Ancient Leshen\'s sensory eyes in the forest and yields potent spectral mutagens.',
              immediateReadAloud: `Silver and steel flash as you hack down the woven bone-effigies hanging from the spruces and distill glowing green ectoplasm into crystal vials. A distant, furious bellow echoes from the heart of the wood.`,
              futureRipples: [
                {
                  targetAct: 4,
                  rippleTitle: 'Weakened Woodland Bond (From Act II Totem Destruction)',
                  narrativeEffect: 'Because you destroyed the outer effigies in Act II, the Ancient Leshen starts the Act IV boss battle with only 2 active totems instead of 3!',
                  mechanicalEffect: 'One of the 3 regenerating Totems in Act IV is already destroyed before the final fight begins!',
                },
              ],
            },
          ],
          otherSurpriseGuidance:
            'Did the party try something inventive (e.g., setting a trap at the wagons, rigging explosives, taming a surviving draught horse, or following the crow flock)? Type it here!',
        },
      ],
      dmPrompts: [
        'Show the Act II Story Visual (`The Massacre in the Primeval Blackwood`) while the players investigate the wagons and use Witcher Senses.',
        'When the 4 Barghest Hounds attack, click "Return to Battle Map" to switch to the forest tactical grid!',
        'Check the Cause & Effect banner at the top of Act II to apply the bonuses or extra hound from the party\'s Act I choices.',
      ],
      keyEncounters: [
        'Forensic Investigation: The shattered wagons, stolen elven monoliths, and Captain Vester\'s body.',
        'Combat Encounter: 4 Barghest Spectral Hounds (CR 2 each, AC 14, 38 HP).',
      ],
      investigationDCs: [
        {
          check: 'Wisdom (Perception / Witcher Senses)',
          dc: 13,
          result: 'The wagons were carrying carved Elven monolith slabs pried from King Elidyr\'s Barrow—not timber.',
        },
        {
          check: 'Intelligence (Investigation)',
          dc: 14,
          result: 'Captain Vester was stabbed in the back by a human stiletto before the Leshen attacked—murdered by the Baron\'s steward to silence him.',
        },
        {
          check: 'Wisdom (Survival)',
          dc: 12,
          result: 'Heavy boots and dripping golden sap lead down into the sunken ravine of King Elidyr\'s Barrow.',
        },
      ],
      tacticalAdvice:
        'After the Barghest battle, encourage the party to take a Short Rest (using the button on their Character Sheets) to replenish Vigor, lower Toxicity by 30%, and apply Necrophage Oil before entering the Crypt in Act III.',
    },
    {
      act: 3,
      timeEstimate: '1:45 – 2:30 (45 Minutes)',
      title: 'Act III: Secrets of the Barrow',
      location: 'The Forgotten Crypt of King Elidyr',
      overview:
        'Descending into the ancient subterranean tomb beneath the Blackwood, the Witchers slay the ravenous Marnadal Grave Hag, solve the runic covenant of the Five Witcher Signs, and discover the stolen Sun Stone alongside Baron Raymond\'s treasonous orders.',
      readAloud: `Stone steps choked with century-old oak roots lead you deep beneath the earth into the sunken Barrow of King Elidyr, first unifier of the Marnadal valley. Cold water drips from vaulted arches carved with bas-reliefs of ancient Cintrian kings and forest dryads clasping hands over a radiant golden orb.

The stench of putrefaction and cracked marrow hits the back of your throats like bile. In the center of the flooded ossuary, hunched atop a shattered royal sarcophagus, squats a Marnadal Grave Hag. Her ash-gray skin hangs in festering folds, necklaces of human finger-bones clatter against her ribs, and beside her clawed feet lies the mangled corpse of a nobleman in Baron Raymond's livery.

At the sound of your boots on the wet flagstones, the Grave Hag's head twists nearly backward. She hisses, spitting green venom, as her three-foot whip-like purple tongue lashes through the gloom!`,
      storyVisuals: [
        {
          id: 'visual-act3-altar',
          actNumber: 3,
          title: 'The Runic Covenant Altar & The Stolen Sun Stone',
          subtitle: 'Act III: Inside the Sunken Sanctum of King Elidyr\'s Barrow',
          caption:
            'Five glowing geometric runes surround the ancient treaty altar of King Elidyr, where the stolen golden Sun Stone pulses with primeval warmth.',
          imageUrl: getAssetUrl('assets/story/act3_elidyr_altar.jpg'),
        },
      ],
      storyBeats: [
        {
          id: 'beat-3-1',
          beatNumber: 'Beat 3.1',
          title: 'The Ossuary of the Grave Hag',
          timeMarker: '1:45 – 2:10',
          readAloudScript: `The Grave Hag shrieks—a sound like grinding millstones—and kicks up a cloud of blinding bone-ash from the sarcophagus lid. Her long, prehensile tongue snaps toward the nearest Witcher's throat to drag them into the flooded bone-pit!`,
          npcRoleplayNotes: [
            'Tactical Callout: Remind the players of the Witcher Targeted Strike rule! Any Witcher can take a -2 penalty to their attack roll to target the Hag\'s tongue; dealing 15+ slashing damage in a single hit severs her tongue, permanently disabling her Tongue Lash & Pull attack!',
          ],
          charactersPresent: [
            {
              name: 'The Marnadal Grave Hag',
              role: 'Crypt Matriarch & Marrow Feaster',
              disposition: 'Hostile',
              description: 'Grotesque, ash-skinned necrophage perched on King Elidyr\'s sarcophagus, flicking a 15-ft barbed tongue to drag victims into bone-pits.',
            },
            {
              name: 'Two Scurrying Rotfiends',
              role: 'Corrosive Thralls',
              disposition: 'Hostile',
              description: 'Bloated, ghoulish scavengers that detonate into acidic bile upon receiving fatal damage.',
            },
            {
              name: 'Master Corvus the Steward (Fresh Corpse)',
              role: 'Baron Raymond\'s Chief Emissary',
              disposition: 'Neutral',
              description: 'Slain courtier in fine velvet doublet, his throat crushed by the hag, clutching a sealed scroll and iron lockbox.',
            },
          ],
          interactableItems: [
            {
              name: 'The Prehensile Venom Tongue',
              interaction: 'Take a -2 called shot penalty to sever the hag\'s lashing appendage.',
              skillCheck: 'Melee attack with Silver blade (15+ slashing damage)',
              outcome: 'Slices off the tongue, permanently preventing her grapple drag and stunning the Hag for 1 round.',
            },
            {
              name: 'Sarcophagus Limestone Heavy Lid',
              interaction: 'Topple the massive 500-lb burial slab using telekinesis or raw leverage.',
              skillCheck: 'DC 14 Athletics or Aard Sign',
              outcome: 'Crushes adjacent rotfiends beneath tons of carved limestone, dealing 3d10 bludgeoning damage.',
            },
            {
              name: 'Flooded Marrow & Bone Ash Pit',
              interaction: 'Move through the flooded flagstones without slipping or inhaling bone dust.',
              skillCheck: 'DC 12 Acrobatics',
              outcome: 'Avoids difficult terrain and bone-ash blindness when maneuvering behind the hag.',
            },
          ],
          secretTreasures: [
            {
              name: 'King Elidyr\'s Burial Regalia',
              discoveryCheck: 'DC 14 Investigation inside the central sarcophagus',
              reward: '🪙 75 Cintrian Orens & Gnomish Gwyhyr Razor Bastard Sword',
              vaultItemId: 'steel-gwyhyr',
              lore: 'A masterwork gnomish blade from Tir Tochair buried alongside King Elidyr, featuring an edge so fine it hums when drawn from its scabbard.',
            },
            {
              name: 'Marrow Hag\'s Trophy Charm',
              discoveryCheck: 'Harvested from the defeated hag with Silver blade',
              reward: '🪙 35 Cintrian Orens & Grave Hag Contract Trophy (Ear & Tongue Charm)',
              vaultItemId: 'quest-grave-hag-ear',
              lore: 'A grisly necklace of noble signet rings and fingerbones collected over two centuries.',
            },
          ],
        },
        {
          id: 'beat-3-2',
          beatNumber: 'Beat 3.2',
          title: 'The Altar of the Five Runes & The Baron\'s Confession',
          timeMarker: '2:10 – 2:30',
          readAloudScript: `With the Grave Hag slain in the dark water, you inspect the corpse of Master Corvus, Baron Raymond's chief steward, slumped against the inner sanctum's circular stone altar. Clutched in his rigor-mortis fingers is a blood-spattered parchment bearing Baron Raymond's personal lion seal—and locked behind a runic stone grate in the altar's center glows a fist-sized amber orb pulsing like a living heartbeat: the Sun Stone of Elidyr.

Carved around the circular lock are five ancient triangular recesses, each etched in Elder Speech with a verse of the Witcher's elemental discipline:
• "First, the Gale that parts the bough" (Aard)
• "Second, the Ward that shields the vow" (Quen)
• "Third, the Circle that binds the wraith" (Yrden)
• "Fourth, the Spark that tests the faith" (Igni)
• "Fifth, the Whisper that stills the wrath" (Axii)`,
          npcRoleplayNotes: [
            'Show the Act III Story Visual (`The Runic Covenant Altar & The Stolen Sun Stone`) when the players approach the altar after defeating the Grave Hag!',
            'The Baron\'s Letter reads: *"Corvus—Bring me the Sun Stone from Elidyr\'s root-shrine before the Royal Conclave. With its gold-transmuting aura, Marnadal will eclipse the High King\'s treasury. If the old forest guardian wakes, blame it on a rabid beast and hire disposable witchers to butcher it."*',
          ],
          charactersPresent: [
            {
              name: 'Spirit of King Elidyr',
              role: 'First Unifier of Marnadal (Echo)',
              disposition: 'Neutral',
              description: 'Luminous spectral presence manifesting in the altar mist as each Witcher Sign ignites its corresponding rune.',
            },
            {
              name: 'Master Corvus (Post-Mortem Witness)',
              role: 'The Baron\'s Silenced Architect',
              disposition: 'Neutral',
              description: 'Body resting against the altar pedestal, bearing the physical evidence of Baron Raymond\'s grand conspiracy.',
            },
          ],
          interactableItems: [
            {
              name: 'The Baron\'s Signed Treason Letter',
              interaction: 'Pry the bloodstained parchment from Master Corvus\'s stiff fingers.',
              skillCheck: 'Automatic upon inspection',
              outcome: 'Provides irrefutable legal proof that Baron Raymond orchestrated the desecration to hoard gold, intending to betray the Witchers.',
            },
            {
              name: 'The Five Triangular Sign Recesses',
              interaction: 'Channel the five Witcher Signs in correct sequence: Aard -> Quen -> Yrden -> Igni -> Axii.',
              skillCheck: 'Spellcasting or Vigor expenditure (No roll needed if deciphered)',
              outcome: 'The runic grate unlatches with an echoing golden chime, raising the pulsing Sun Stone of Elidyr on an illuminated stone plinth.',
            },
            {
              name: 'Elder Speech Treaty Inscriptions',
              interaction: 'Decipher the elven verses along the altar\'s circular rim.',
              skillCheck: 'DC 13 History or Elder Speech lore',
              outcome: 'Warns that separating the Sun Stone from the Heart Tree drives the woodland guardian insane with agony.',
            },
          ],
          secretTreasures: [
            {
              name: 'Master Corvus\'s Iron Treasury Box',
              discoveryCheck: 'Key on Corvus\'s belt or DC 14 Sleight of Hand',
              reward: '🪙 120 Cintrian Orens & Baron Raymond\'s Signed Safe-Conduct Pass',
              vaultItemId: 'quest-baron-sigil',
              lore: 'The Baron\'s secret military bypass warrant and royal gold intended to buy mercenary silence.',
            },
            {
              name: 'Altar Sanctum Consecrated Relic',
              discoveryCheck: 'DC 15 Arcana or Witcher Senses when all 5 runes ignite',
              reward: '🪙 50 Cintrian Orens & Moonblade Ancient Elven Silver Relic',
              vaultItemId: 'silver-moonblade',
              lore: 'An ancient silver sword blessed by elven sages to sever spectral ties and light up subterranean crypts.',
            },
          ],
        },
      ],
      characterOpportunities: [
        {
          id: 'opp-act3-wolf',
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          beatTitle: 'Severing the Grave Hag\'s Tongue',
          trigger: 'During combat with the Marnadal Grave Hag in the ossuary.',
          checkOrAction: 'Called Shot with Runic Silver Longsword (-2 to hit, or Fluid Riposte counter)',
          uniqueOutcome:
            'Vane times the Hag\'s tongue-whip to the millisecond, pinning and slicing the venomous muscle in two! The Hag is Stunned until the end of her next turn and drops a potent Grave Hag Mutagen (+5 max HP when consumed).',
          scriptPrompt:
            '🐺 [Wolf Spotlight — Vane]: You\'ve fought Grave Hags in the Velen bogs before. Stepping inside the arc of her whipping tongue, you pivot on your heel and bring your Kaer Morhen silver blade down like a guillotine!',
        },
        {
          id: 'opp-act3-cat',
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          beatTitle: 'Cracking the Steward\'s Cipher & Poison Cache',
          trigger: 'When searching Master Corvus\'s corpse beside the altar.',
          checkOrAction: 'Dexterity (Sleight of Hand +8) or Intelligence (Investigation +4)',
          uniqueOutcome:
            'Sybilla discovers a false bottom in the steward\'s signet case containing Baron Raymond\'s signed treasonous decree AND a vial of Basalisk Acid that melts one of the Chort\'s armor plates in Act IV (-2 AC to the Primeval Chort)!',
          scriptPrompt:
            '🐱 [Cat Spotlight — Sybilla]: A dead courtier always hides his best insurance policy inside his lining. With two flicks of your dagger, you pop the secret compartment in Corvus\'s belt—revealing the Baron\'s own handwriting and a glass ampoule of smoking alchemical acid.',
        },
        {
          id: 'opp-act3-griffin',
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          beatTitle: 'Mastery of the Five-Sign Runic Altar',
          trigger: 'When unlocking the circular stone altar of King Elidyr.',
          checkOrAction: 'Scholarly Mind Trait / Intelligence (Arcana +7)',
          uniqueOutcome:
            'Alden reads the Elder Speech verse effortlessly and harmonizes all five Signs in sequence without spending any Vigor! The ancient altar recognizes a true Knight-Witcher of Cintra, bathing the entire party in golden light (+10 Temporary HP and full Vigor restoration for everyone!).',
          scriptPrompt:
            '🦅 [Griffin Spotlight — Alden]: Your fingers dance across the five ancient recesses as you chant the Elder concordance taught at Kaer Seren. Azure, gold, violet, crimson, and emerald sparks spiral into the lock—and the stone grate parts with a resonant harmonic chime!',
        },
        {
          id: 'opp-act3-bear',
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          beatTitle: 'Shattering the Ossuary Pillars',
          trigger: 'During the Grave Hag fight or if a player skips the rune puzzle.',
          checkOrAction: 'Strength (Athletics +7) with Ursine Greatsword',
          uniqueOutcome:
            'Bram cleaves through the cracked load-bearing stone column above the Grave Hag\'s bone-pit, dropping two tons of masonry directly onto the monster for 4d10 bludgeoning damage and pinning her in place!',
          scriptPrompt:
            '🐻 [Bear Spotlight — Bram]: Why dance around a filthy bog-witch in the dark? Roaring like a mountain bear, you slam the flat of your massive Ursine Greatsword into the cracked limestone pillar above her head—bringing the ceiling crashing down!',
        },
      ],
      choicePoints: [
        {
          id: 'choice-act3-sunstone',
          actNumber: 3,
          title: 'Act III Decision: Fate of the Stolen Sun Stone',
          promptQuestion: 'Now holding the sacred Sun Stone of Elidyr and proof of Baron Raymond\'s crime, what do the Witchers do with the relic before ascending to the Monolith Grove?',
          contextNote: 'This pivotal moral and tactical choice directly transforms the final boss encounter in Act IV!',
          options: [
            {
              id: 'sunstone-restore-oath',
              label: 'Option 1: Bear the Sun Stone Openly to Restore the Pact',
              summary: 'Carry the Sun Stone unharmed into the grove to return it to the wounded Heart Tree and appease the Ancient Guardian.',
              immediateOutcome:
                'The warm golden pulse of the Sun Stone calms the trembling roots in the ceiling above. The forest senses your intent to heal the breach.',
              immediateReadAloud: `As you lift the Sun Stone from the altar, its golden warmth spreads up your arms like summer sunlight. Above the crypt, the groaning of the ancient roots falls hushed and expectant.`,
              futureRipples: [
                {
                  targetAct: 4,
                  rippleTitle: 'The Sun Stone Gambit Unlocked (From Act III Restore Pact)',
                  narrativeEffect: 'In Act IV, any Witcher can hold aloft the uncorrupted Sun Stone as an Action (DC 13 Persuasion/Axii) to prove they came to heal the Heart Tree—causing the Ancient Leshen to cease attacking the party and turn its wrath against the rampaging Chort!',
                  mechanicalEffect: 'Unlocks the Pacify Leshen / Ally Guardian option in Act IV and grants Advantage on saves vs the Leshen\'s roots!',
                },
              ],
            },
            {
              id: 'sunstone-overcharge-trap',
              label: 'Option 2: Overcharge the Sun Stone as an Arcane Bomb Trap',
              summary: 'Inscribe Yrden and Igni runes onto the Sun Stone to turn the sacred relic into a volatile bait-mine for the Ancient Leshen.',
              immediateOutcome:
                'The golden relic turns a violent, unstable crimson as you pack dimeritium dust and Sign energy into its fractures—creating a devastating weapon against the woodland god.',
              immediateReadAloud: `Crackling arcs of violet Yrden and orange Igni energy spiderweb across the surface of the ancient Sun Stone. It hums like a furnace ready to detonate at the Leshen's touch.`,
              futureRipples: [
                {
                  targetAct: 4,
                  rippleTitle: 'Volatile Relic Detonation (From Act III Overcharge Trap)',
                  narrativeEffect: 'When the Ancient Leshen reaches for the Sun Stone in Act IV, the party can detonate it—instantly dealing 45 radiant/fire damage to the Leshen and destroying 2 Totems at once, though permanently enraged!',
                  mechanicalEffect: 'Deals 45 instant damage to the Ancient Leshen in Act IV, but prevents any peaceful resolution with the forest.',
                },
              ],
            },
            {
              id: 'sunstone-keep-treasure',
              label: 'Option 3: Lock the Sun Stone in a Lead Pouch for Leverage',
              summary: 'Seal the priceless relic inside a dimeritium-lined pouch to hide its aura, intending to use it as the ultimate bargaining chip against Baron Raymond.',
              immediateOutcome:
                'With the Sun Stone\'s light smothered in lead and leather, the crypt grows colder. Neither the Baron nor the Leshen can track its location.',
              immediateReadAloud: `You wrap the glowing orb in heavy lead-stitched leather. The golden light vanishes, leaving only the cold gleam of your silver blades—and a relic worth a kingdom in your pack.`,
              futureRipples: [
                {
                  targetAct: 4,
                  rippleTitle: 'Blinded Forest Wrath (From Act III Concealed Relic)',
                  narrativeEffect: 'Unable to sense where the Sun Stone went, the Ancient Leshen believes the Witchers are the thieves who destroyed the shrine—fighting to the death without hesitation, but unable to target a single bearer.',
                  mechanicalEffect: 'The Leshen cannot use its targeted Curse of the Thief ability in Act IV, and the party holds a 2,000-oren relic for the Epilogue!',
                },
              ],
            },
          ],
          otherSurpriseGuidance:
            'Did the party do something else in the Barrow (e.g., shatter the Sun Stone right there, absorb its magic into a Witcher blade, or trap the Grave Hag alive)? Enter it here!',
        },
      ],
      dmPrompts: [
        'Run the Grave Hag combat on the Act III Tactical Map (`The Forgotten Crypt of King Elidyr`), then click "Show Scene to Players" on the Altar visual when they reach the inner sanctum!',
        'Let Alden (Griffin) shine on the Five-Sign Altar, and let Sybilla (Cat) or Vane (Wolf) piece together Master Corvus\'s betrayal.',
        'Record the party\'s choice in the Act III Decision above—it directly sets up the climax mechanics in Act IV!',
      ],
      keyEncounters: [
        'Miniboss Combat: The Marnadal Grave Hag (CR 4, AC 15, 78 HP).',
        'Sanctum Puzzle: The Altar of the Five Witcher Signs (Aard, Quen, Yrden, Igni, Axii).',
        'Plot Revelation: Baron Raymond\'s signed order on Master Corvus\'s corpse & the Sun Stone.',
      ],
      investigationDCs: [
        {
          check: 'Intelligence (Arcana / History)',
          dc: 14,
          result: 'The Sun Stone is the living heart-seed of the Primeval Blackwood, gifted by the Elves to King Elidyr to keep peace between axe and root.',
        },
        {
          check: 'Intelligence (Investigation)',
          dc: 12,
          result: 'Master Corvus was killed by the Grave Hag while trying to hide in the crypt after stealing the Sun Stone for Baron Raymond.',
        },
      ],
      tacticalAdvice:
        'Give the players a moment to debate what to do with the Sun Stone before climbing the root-stairs into the Monolith Stone Circle for Act IV!',
    },
    {
      act: 4,
      timeEstimate: '2:30 – 3:30 (60 Minutes)',
      title: 'Act IV: The Heart of the Wood',
      location: 'The Corrupted Monolith Stone Circle',
      overview:
        'Stepping into the ancient monolith ring at the heart of the Blackwood, the Witchers confront the twelve-foot Ancient Leshen of Marnadal and its thunderous enforcer, the Primeval Chort. Every choice from Acts I–III converges in this climatic showdown.',
      readAloud: `Emerging from the barrow tunnel, the fog parts before a vast circular amphitheater of standing monoliths older than human memory. At the center of the ring towers the colossal Sacred Heart Tree—its ancient silver trunk hacked open by Cintrian iron axes, weeping sap as thick and dark as arterial blood. Three woven bone-totems pulse with emerald light around its roots.

A sound like grinding boulders echoes across the clearing. Stepping from behind the central monolith, twelve feet tall, rises the Ancient Leshen of Marnadal. Its weathered stag-skull crown tilts toward you; deep inside its hollow eye sockets, twin embers of crimson fury ignite. Hundreds of black ravens erupt from its bark-armored shoulders in a deafening vortex.

Then the earth itself trembles. Crashing through the treeline comes a mountainous silhouette of corded muscle and matted fur—the Primeval Chort, its third eye blazing with golden wrath as it lowers its blood-stained antlers to charge!`,
      storyVisuals: [
        {
          id: 'visual-act4-leshen',
          actNumber: 4,
          title: 'The Weeping Heart Tree & The Ancient Leshen',
          subtitle: 'Act IV: Showdown in the Corrupted Monolith Circle',
          caption:
            'Before the bleeding split trunk of the Sacred Heart Tree rises the twelve-foot Ancient Leshen, wreathed in a storm of black ravens and guarded by glowing wooden totems.',
          imageUrl: getAssetUrl('assets/story/act4_heart_tree_leshen.jpg'),
        },
      ],
      storyBeats: [
        {
          id: 'beat-4-1',
          beatNumber: 'Beat 4.1',
          title: 'The Guardian\'s Wrath & The Three Totems',
          timeMarker: '2:30 – 3:00',
          readAloudScript: `The Ancient Leshen raises its gnarled, claw-tipped hands and drives them into the earth. Massive, thorn-studded roots erupt from the soil across the stone circle while the three wooden skull-totems hum with regenerative forest magic, knitting the Leshen's bark-flesh back together after every strike!`,
          npcRoleplayNotes: [
            'Show the Act IV Story Visual (`The Weeping Heart Tree & The Ancient Leshen`) for the dramatic boss reveal, then switch to the Act IV Tactical Battle Map (`The Corrupted Monolith Grove`) for combat!',
            'Totem Mechanic: While the 3 Totems (AC 12, 20 HP each, vulnerable to Fire/Igni) stand, the Leshen regenerates 15 HP at the start of its turn. Check if Act II Choice #3 already destroyed 1 Totem!',
          ],
          charactersPresent: [
            {
              name: 'The Ancient Leshen of Marnadal',
              role: 'Awakened Relict Woodland God',
              disposition: 'Hostile',
              description: 'Twelve-foot ancient wooden relict wearing an elk skull crown, commanding the living roots of the grove and teleporting in raven storms.',
            },
            {
              name: 'Three Relict Skull-Totems',
              role: 'Regenerative Magic Conduits',
              disposition: 'Hostile',
              description: 'Carved cedar totems crowned with stag skulls and raven feathers, channeling 15 HP per turn back into the Leshen.',
            },
            {
              name: 'Vortex Raven Murder',
              role: 'Relict Swarm',
              disposition: 'Hostile',
              description: 'Hundreds of black crows that blind attackers, intercept arrows, and mask the Leshen\'s phase shifts.',
            },
          ],
          interactableItems: [
            {
              name: 'The Three Resonant Skull Totems',
              interaction: 'Target the totems with weapons or spells (AC 12, 20 HP each, Vulnerable to Fire).',
              skillCheck: 'Attack roll or Igni Sign burst',
              outcome: 'Shattering each totem permanently eliminates 5 points of the Leshen\'s regeneration and causes a psychic backlash.',
            },
            {
              name: 'Thorn-Studded Root Spikes',
              interaction: 'Spot the shifting earth and dodge the erupting underground briar thorns.',
              skillCheck: 'DC 13 Dexterity save or Witcher Senses',
              outcome: 'Dodging avoids 2d6 piercing damage and prevents being restrained in place.',
            },
            {
              name: 'The Weeping Heart Tree Split Trunk',
              interaction: 'Approach the colossal split oak weeping amber sap in the center of the ring.',
              skillCheck: 'DC 12 Nature or Arcana',
              outcome: 'Reveals the hollow sacred socket where the Sun Stone originally rested for seven centuries before Baron Raymond\'s defilement.',
            },
          ],
          secretTreasures: [
            {
              name: 'Cache inside Fallen Southern Totem',
              discoveryCheck: 'DC 13 Perception after felling the totem',
              reward: '🪙 50 Cintrian Orens & Tawny Owl Potion (Phial #2)',
              vaultItemId: 'potion-tawny-owl-2',
              lore: 'Sacred Vigor-accelerating elixir stored in a hollowed horn offering by ancient druidic herbalists.',
            },
            {
              name: 'Ancient Druid Offering Urn under Heart Tree',
              discoveryCheck: 'DC 14 Investigation among the roots',
              reward: '🪙 80 Cintrian Orens & Dimeritium Anti-Magic Bomb',
              vaultItemId: 'bomb-dimeritium-1',
              lore: 'A sealed urn of old Cintrian coins and raw dimeritium ore meant to seal rogue rifts.',
            },
          ],
        },
        {
          id: 'beat-4-2',
          beatNumber: 'Beat 4.2',
          title: 'Thunder of the Primeval Chort & The Final Gambit',
          timeMarker: '3:00 – 3:30',
          readAloudScript: `Snorting gouts of hot steam, the Primeval Chort lowers its massive rack of jagged horns and hurtles across the monolith circle like a battering ram—while the Heart Tree's split trunk pulses, awaiting either the blade of executioners or the return of its stolen Sun Stone!`,
          npcRoleplayNotes: [
            'If the party chose Option 1 in Act III (Restore the Sun Stone), remind them they can use an Action at the Heart Tree (DC 13 Persuasion/Axii) to seat the Sun Stone—causing the Ancient Leshen to halt its attacks and help drag the maddened Chort down!',
            'If the party chose Option 2 in Act III (Overcharge Trap), let them trigger the 45-damage detonation when the Leshen steps within 10 feet of the tree!',
          ],
          charactersPresent: [
            {
              name: 'The Primeval Chort of the Yaruga',
              role: 'Continental Apex Behemoth',
              disposition: 'Hostile',
              description: 'Ten-ton horned mountain monster with a third amber eye, charging with devastating momentum to pulverize stone and bone.',
            },
            {
              name: 'Baron Raymond & Mounted Royal Outriders',
              role: 'Scheming Noble Opportunists',
              disposition: 'Deceptive',
              description: 'Watching with heavy crossbows from the ridge, ready to claim the beast\'s head and cheat the mutants of their bounty.',
            },
          ],
          interactableItems: [
            {
              name: 'Heart Tree Sun Stone Socket',
              interaction: 'Action to slot the Sun Stone into the weeping oak heart (DC 13 Persuasion/Axii).',
              skillCheck: 'DC 13 Charisma (Persuasion) or Axii Sign',
              outcome: 'The Leshen\'s agony ceases; ancient roots burst from the soil to ensnare the charging Chort and pin it to the earth!',
            },
            {
              name: 'Standing Granite Monoliths (Cover & Hazard)',
              interaction: 'Bait the Chort into charging a 30-ton ancient standing stone.',
              skillCheck: 'DC 14 Dexterity (Acrobatics) or Dodge reaction',
              outcome: 'The Chort slams horns-first into the monolith, taking 3d8 bludgeoning damage and falling Prone and Stunned for 1 turn.',
            },
            {
              name: 'Overcharged Altar Glyph Detonator',
              interaction: 'If rigged in Act III, trigger the explosive magical pulse when monsters group up.',
              skillCheck: 'Reaction (Free if trap was set)',
              outcome: 'Detonates with thunderous concussive force, dealing 45 radiant force damage to all entities near the Heart Tree!',
            },
          ],
          secretTreasures: [
            {
              name: 'Primeval Heart-Tree Core & Aerondight Relic',
              discoveryCheck: 'DC 12 Witcher Senses / Survival harvesting after combat',
              reward: '🪙 150 Cintrian Orens, Primeval Heart-Tree Amber Core, & Aerondight Blade of the Lady of the Lake',
              vaultItemId: 'silver-aerondight',
              lore: 'The consecrated blade bestowed upon champions of Witcher Virtues, alongside the pulsating amber heartwood of the Leshen.',
            },
            {
              name: 'Baron Raymond\'s Carriage Bounty Chest',
              discoveryCheck: 'Claimed by contractual mandate or extracted by force',
              reward: '🪙 250 Cintrian Orens & Cintrian Royal Lion Signet Ring',
              vaultItemId: 'quest-cintrian-ring',
              lore: 'The full royal treasury bounty and Queen Calanthe\'s royal seal ring salvaged from the Baron\'s locked coach.',
            },
          ],
        },
      ],
      characterOpportunities: [
        {
          id: 'opp-act4-wolf',
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          beatTitle: 'Reading the Raven Teleport & Tactical Call',
          trigger: 'When the Ancient Leshen dissolves into a swarm of crows to teleport.',
          checkOrAction: 'Wisdom (Perception +8) + Moon Dust Bomb',
          uniqueOutcome:
            'Vane tracks the lead white-feathered raven in the flock, calling out the exact monolith where the Leshen will reform and hurling a Moon Dust bomb to lock the Leshen in physical form—granting the entire party Advantage on attacks against the Leshen for 1 full round!',
          scriptPrompt:
            '🐺 [Wolf Spotlight — Vane]: Your amber eyes lock onto the single white-winged crow banking toward the northern monolith. "There! Behind the standing stone!" Your Moon Dust bomb detonates in a silver cloud just as the Leshen reforms, pinning the ancient relict in place!',
        },
        {
          id: 'opp-act4-cat',
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          beatTitle: 'Scaling the Monolith & Heart-Shot',
          trigger: 'When attacking the Ancient Leshen or blinding the Chort.',
          checkOrAction: 'Dexterity (Acrobatics +8) + Feline Ambush Strike',
          uniqueOutcome:
            'Using Feline Grace (climbing costs no extra movement), Sybilla sprints up a twenty-foot standing stone and leaps onto the Leshen\'s shoulders, driving her Curved Silver Estoc straight into the glowing sap-nexus beneath its stag skull for an automatic Critical Hit!',
          scriptPrompt:
            '🐱 [Cat Spotlight — Sybilla]: Like a hunting lynx, you bound up the moss-slick monolith in three strides and launch yourself through the cloud of ravens—driving your silver estoc hilt-deep between the Leshen\'s antlers!',
        },
        {
          id: 'opp-act4-griffin',
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          beatTitle: 'Consecrating the Heart Tree / Igni Conflagration',
          trigger: 'When targeting the Totems with Igni or seating the Sun Stone in the Heart Tree.',
          checkOrAction: 'Igni Sign (with Petri\'s Philter) or Intelligence (Arcana +7) at the Heart Tree',
          uniqueOutcome:
            'Alden either unleashes an overcharged Griffin Igni wave that incinerates two Totems and scorches the Leshen for double fire damage (6d6+2d8), OR chants the Elder Covenant while seating the Sun Stone to pacify the Ancient Leshen instantly!',
          scriptPrompt:
            '🦅 [Griffin Spotlight — Alden]: Drawing upon the full might of Kaer Seren, golden flames roar from your outstretched fingers across the stone circle—turning the cursed wooden totems to cinders in a single breath!',
        },
        {
          id: 'opp-act4-bear',
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          beatTitle: 'Locking Horns with the Primeval Chort',
          trigger: 'When the Primeval Chort uses its Relentless Charge against the party.',
          checkOrAction: 'Ursine Juggernaut Perk + Strength (Athletics +7) + Northern Wind Bomb',
          uniqueOutcome:
            'Because Bram cannot be knocked prone or moved against his will, he plants his boots, catches the charging Chort\'s antlers against his Quen shield, shatters a Northern Wind cryo-bomb against its snout to freeze it solid, and cleaves off its horn for double damage!',
          scriptPrompt:
            '🐻 [Bear Spotlight — Bram]: Ten tons of muscle and horn slam into you like a falling mountain—and you do not yield a single inch. Frost explodes from your Northern Wind bomb, encasing the Chort\'s jaws in solid rime as you raise your Ursine Silver Cleaver!',
        },
      ],
      choicePoints: [
        {
          id: 'choice-act4-climax',
          actNumber: 4,
          title: 'Act IV Decision: Resolution at the Heart Tree',
          promptQuestion: 'How did the battle in the Monolith Stone Circle conclude?',
          contextNote: 'Determines what trophies and relics the party brings back to Castle Marnadal in the Epilogue.',
          options: [
            {
              id: 'climax-slay-both',
              label: 'Option 1: Both Monsters Slain — The Stag-Skull Trophy Claimed',
              summary: 'The party destroyed the totems and slew both the Ancient Leshen and the Primeval Chort in pitched combat.',
              immediateOutcome:
                'With a final, mournful groan like a falling redwood, the Ancient Leshen collapses into gnarled timber and ash. You sever its massive stag-skull crown and the Chort\'s third-eye horn as undeniable proof of the kill.',
              futureRipples: [
                {
                  targetAct: 5,
                  rippleTitle: 'Undeniable Monster Trophies (From Act IV Slay Both)',
                  narrativeEffect: 'Throwing the massive Leshen stag-skull and Chort horn onto Baron Raymond\'s feast table shocks the entire court into silence.',
                  mechanicalEffect: 'Party gains the Ancient Leshen Trophy (+1 AC to bearer) and Chort Mutagen (+10 Max HP).',
                },
              ],
            },
            {
              id: 'climax-guardian-spared',
              label: 'Option 2: The Sun Stone Restored — Chort Slain, Leshen Pacified',
              summary: 'The party returned the Sun Stone to the Heart Tree, allied with or pacified the Ancient Leshen, and slew only the rampaging Chort.',
              immediateOutcome:
                'As the Sun Stone fuses back into the Heart Tree in a cascade of golden light, the black sap turns clear. The Ancient Leshen bows its antlered skull to the four Witchers, gifting you a branch of living silver-oak before vanishing into the mist.',
              futureRipples: [
                {
                  targetAct: 5,
                  rippleTitle: 'Blessing of the Elder Wood (From Act IV Guardian Spared)',
                  narrativeEffect: 'The healed forest wraps Castle Marnadal\'s outer walls in protective roots that answer the Witchers\' call during the Epilogue confrontation!',
                  mechanicalEffect: 'All Witchers gain the Elder Wood Boon (permanent Advantage on saves vs poison/spells) and the Chort\'s head serves as proof for the bounty!',
                },
              ],
            },
            {
              id: 'climax-scorched-grove',
              label: 'Option 3: Scorched Grove — The Heart Tree Burned to Ash',
              summary: 'The party burned the Heart Tree and totems to the ground with Igni and Dancing Star bombs to annihilate the Leshen\'s power source.',
              immediateOutcome:
                'A pillar of crimson flame towers above the Blackwood as the ancient Heart Tree burns to charcoal. Crippled and shrieking, the Leshen is cut down amidst the embers, leaving behind a blackened, crystallized Heart-Core.',
              futureRipples: [
                {
                  targetAct: 5,
                  rippleTitle: 'Ashes over Marnadal (From Act IV Scorched Grove)',
                  narrativeEffect: 'Ash rains down over Castle Marnadal\'s courtyard as the Witchers ride in—terrifying Baron Raymond and the townsfolk alike.',
                  mechanicalEffect: 'Automatic success on all Intimidation checks in the Epilogue, plus the Crystallized Heart-Core (worth 1,000 orens to northern mages).',
                },
              ],
            },
          ],
          otherSurpriseGuidance:
            'Did the climax end in a completely unique way (e.g., trapping the Leshen in a dimeritium cage, riding the Chort into Castle Marnadal, or striking a deal with the woodland spirit to haunt the Baron)? Record it here!',
        },
      ],
      dmPrompts: [
        'Review the Cause & Effect ripples from Acts I, II, and III before starting Round 1—especially whether 1 Totem is already destroyed and what the party did with the Sun Stone!',
        'Let each of the four Witcher Schools trigger their Act IV Spotlight Opportunity during the boss fight so every player feels heroic.',
      ],
      keyEncounters: [
        'Apex Boss: Ancient Leshen of Marnadal (CR 8, AC 16, 135 HP, regenerates 15 HP/turn while Totems stand, vulnerable to Fire).',
        'Enforcer Beast: Primeval Chort of the Yaruga (CR 6, AC 15, 112 HP, Relentless Charge).',
        'Environmental Objective: 3 Wooden Skull Totems (AC 12, 20 HP each) & the Split Heart Tree.',
      ],
      investigationDCs: [
        {
          check: 'Wisdom (Perception)',
          dc: 13,
          result: 'Notice the white-winged lead raven always circles the exact spot where the Leshen will teleport next.',
        },
      ],
      tacticalAdvice:
        'Pace the fight across two dramatic phases: let the Leshen command roots and crows in Rounds 1–2 while the party hunts the Totems, then have the Primeval Chort crash through the trees at the top of Round 2 or when the Leshen hits 75% HP!',
    },
  ],
  epilogue: {
    title: 'Epilogue: The Price of Neutrality',
    timeEstimate: '3:30 – 4:00 (30 Minutes)',
    location: 'The Torchlit Great Hall of Castle Marnadal',
    overview:
      'Mud-stained and bloodied, the four Witchers ride through the gates of Castle Marnadal as dawn breaks over the Yaruga. In the Baron\'s great hall, armed with monster trophies and the truth of the Baron\'s sacrilege, the party chooses how this chronicle ends.',
    readAloud: `Iron portcullises rattle upward as your lathered horses clatter into the outer bailey of Castle Marnadal. Word of your return races ahead of you. Inside the cavernous limestone Great Hall, Baron Raymond sits upon a raised dais beneath silk banners of the golden Cintrian lion, surrounded by house knights, court scribes, and a pale-faced Sir Danek.

The double doors crash open. Four Witchers—Wolf, Cat, Griffin, and Bear—stride down the center aisle, boots leaving tracks of Blackwood mud and monster ichor across the polished marble.

Baron Raymond rises slowly from his carved oak chair, his jeweled fingers tightening around his goblet as he sees what you carry.

"Well, witchers?" Baron Raymond's voice echoes through the hushed hall, equal parts hope and dread. "Is the devil of the Yaruga dead... and is my secret safe?"`,
    storyVisuals: [
      {
        id: 'visual-epilogue-castle',
        actNumber: 5,
        title: 'Reckoning in the Great Hall of Castle Marnadal',
        subtitle: 'Epilogue: Four Witchers Confront Baron Raymond with Trophy and Truth',
        caption:
          'Beneath the blue-and-gold lion banners of Castle Marnadal, the four Witchers stand before Baron Raymond\'s feast table to claim their blood-gold—or deliver judgment.',
        imageUrl: getAssetUrl('assets/story/epilogue_castle_marnadal.jpg'),
      },
    ],
    characterOpportunities: [
      {
        id: 'opp-epilogue-wolf',
        school: 'Wolf',
        witcherName: 'Vane of Kaer Morhen',
        beatTitle: 'The Code of the Path',
        trigger: 'When tossing the monster trophy onto the Baron\'s table.',
        checkOrAction: 'Roleplay / Final Verdict',
        uniqueOutcome:
          'Vane delivers the cold, professional verdict of Kaer Morhen—securing the winter gold for his brothers while warning the Baron that the next time he wakes a primeval god, no Witcher will save him.',
        scriptPrompt:
          '🐺 [Wolf Epilogue — Vane]: You drop the massive trophy onto the banquet table, rattling the silver plates. "The contract is fulfilled, Baron. Two thousand orens for the beast. What you owe the forest... is between you and the trees."',
      },
      {
        id: 'opp-epilogue-cat',
        school: 'Cat',
        witcherName: 'Sybilla "The Lynx"',
        beatTitle: 'The Blackmail Turnscrew',
        trigger: 'When producing Master Corvus\'s blood-stained letter with the Baron\'s seal.',
        checkOrAction: 'Charisma (Deception / Intimidation)',
        uniqueOutcome:
          'Sybilla holds the Baron\'s treasonous letter over a candle flame, effortlessly extorting an extra 2,000 orens in hush-money from the Baron\'s private vault!',
        scriptPrompt:
          '🐱 [Cat Epilogue — Sybilla]: Twirling Baron Raymond\'s wax-sealed confession between two fingers, you lean across the dais with a feline grin. "Two thousand was for the monster, my lord. Buying back this letter before it reaches the High King in Cintra? That costs another two thousand."',
      },
      {
        id: 'opp-epilogue-griffin',
        school: 'Griffin',
        witcherName: 'Alden of Kaer Seren',
        beatTitle: 'Judgment of the Marnadal Scion',
        trigger: 'When addressing the assembled Cintrian knights in the Great Hall.',
        checkOrAction: 'Charisma (Persuasion +5) + Marnadal Signet Ring',
        uniqueOutcome:
          'Alden invokes his noble Marnadal bloodline before the court, forcing Baron Raymond to swear a binding public oath (sealed with Axii) to restore the Barrow sanctuary and pay full restitution to the slain loggers\' families.',
        scriptPrompt:
          '🦅 [Griffin Epilogue — Alden]: Stepping before the house knights, you raise the ancient signet of Marnadal. "A lord who breaks the First King\'s Treaty forfeits his honor. Pay the blood-price to the widows of this valley, Baron, or answer to the Crown!"',
      },
      {
        id: 'opp-epilogue-bear',
        school: 'Bear',
        witcherName: 'Bram of Haern Caduch',
        beatTitle: 'Claiming the Iron & Silver Tribute',
        trigger: 'If Baron Raymond hesitates to pay or motions to his guards.',
        checkOrAction: 'Strength / Intimidation (+5)',
        uniqueOutcome:
          'Bram drives his Ursine Silver Cleaver three inches deep into the oak feast table, splitting it down the middle. The Baron\'s treasurer immediately hauls out chests of pure silver ingots and royal gold without another word.',
        scriptPrompt:
          '🐻 [Bear Epilogue — Bram]: The hall goes dead silent as your greatsword splits the Baron\'s oak banquet table in half, sending gilded goblets rolling across the floor. "The gold. And fifty pounds of Mahakaman silver. Now."',
      },
    ],
    choicePoints: [
      {
        id: 'choice-epilogue-ending',
        actNumber: 5,
        title: 'Final Campaign Ending: The Legacy of the Four Schools',
        promptQuestion: 'Which path did the party take in the Great Hall of Castle Marnadal to conclude the adventure?',
        contextNote: 'Records the canonical ending of your session (and syncs to your Notion Campaign Wiki!).',
        options: [
          {
            id: 'ending-ruthless-professional',
            label: 'Ending A: The Ruthless Professionals (Slay & Cash In)',
            summary: 'Claim the 2,000 orens for the trophy, burn or ignore the political evidence, and ride out onto the Path as neutral professionals.',
            immediateOutcome:
              'The Witchers walk away with 500 gold each and the Leshen Trophy. What happens to Marnadal\'s soul is human business—the winter passes await.',
            futureRipples: [],
          },
          {
            id: 'ending-restorer-concord',
            label: 'Ending B: Restorers of the Ancient Concord (Heal the Wood & Expose the Baron)',
            summary: 'Having restored the Sun Stone to the Heart Tree, publicly expose Baron Raymond\'s sacrilege before his knights and force him to swear a new treaty.',
            immediateOutcome:
              'Humbled before his own court, Baron Raymond pays the 2,000-oren bounty AND funds a permanent ward around the Blackwood. Songs of the four honorable Witchers echo in Cintra for generations.',
            futureRipples: [],
          },
          {
            id: 'ending-witchers-vengeance',
            label: 'Ending C: The Witchers\' Extortion (Double Gold & Rough Justice)',
            summary: 'Use the Baron\'s treasonous letter and the Sun Stone/Trophy to blackmail him for 4,000 orens out of his personal treasury.',
            immediateOutcome:
              'Pale and trembling, Baron Raymond empties his personal vault—paying 1,000 Cintrian orens to each Witcher! The four schools part ways at the crossroads richer than kings.',
            futureRipples: [],
          },
        ],
        otherSurpriseGuidance:
          'Did the party stage a coup, hand the castle over to Sir Danek, or walk out with the Sun Stone to start their own witcher keep? Write your custom campaign finale here!',
      },
    ],
    choices: [
      {
        name: 'Path A: The Ruthless Professionals (Slay & Cash In)',
        description:
          'Deliver the severed monster trophy to Baron Raymond, collect the 2,000 Cintrian orens, and leave the politics of kings and barons behind.',
        consequences:
          'Each Witcher rides away with 500 gold and legendary monster trophies. If the Heart Tree was not healed, the Blackwood slowly turns into a haunted mire over the next century.',
      },
      {
        name: 'Path B: The Restorers of Ancient Concord (Purify & Expose)',
        description:
          'Return the Sun Stone to the wounded Heart Tree and publicly expose Baron Raymond\'s treaty-breaking sacrilege before his knights in Castle Marnadal.',
        consequences:
          'The primeval forest heals, blessing the party with permanent resilience against poison and curses. Baron Raymond is forced by his own court to pay the full bounty plus reparations to the loggers\' families.',
      },
      {
        name: 'Path C: The Witchers\' Vengeance (Blackmail & Double Coin)',
        description:
          'Slam both the monster trophy and Master Corvus\'s damning letter onto the feast table, demanding 4,000 orens for your silence before the High King of Cintra.',
        consequences:
          'Terrified of royal execution for treason, Baron Raymond pays double (1,000 orens per Witcher) from his personal treasury. The four Witchers ride south for the winter as legends of the Path.',
      },
    ],
  },
};
