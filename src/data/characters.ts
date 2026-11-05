import { WitcherCharacter } from '../types';
import { getAssetUrl } from '../utils/assets';
import { STARTER_ARMOR_SETS, INITIAL_WITCHER_GOLD } from './items';

export const PREGEN_WITCHERS: WitcherCharacter[] = [
  {
    id: 'witcher-wolf',
    name: 'Vane of Kaer Morhen',
    title: 'The Gray Wolf of the Yaruga',
    school: 'Wolf',
    schoolMotto: 'Steel for humans, silver for monsters, patience for both.',
    level: 5,
    armorClass: 16,
    maxHp: 49,
    currentHp: 49,
    tempHp: 0,
    speed: 35,
    hitDice: '5d10',
    hitDiceCurrent: 5,
    hitDiceTotal: 5,
    vigor: 4,
    maxVigor: 4,
    toxicity: 0,
    maxToxicity: 100,
    abilities: {
      str: 14, // +2
      dex: 18, // +4
      con: 16, // +3
      int: 12, // +1
      wis: 14, // +2
      cha: 10, // +0
    },
    savingThrows: ['Strength (+5)', 'Dexterity (+7)', 'Constitution (+6)'],
    skills: [
      { name: 'Acrobatics', bonus: 7, proficient: true },
      { name: 'Athletics', bonus: 5, proficient: true },
      { name: 'Investigation', bonus: 4, proficient: true },
      { name: 'Nature', bonus: 4, proficient: true },
      { name: 'Perception (Witcher Senses)', bonus: 8, proficient: true },
      { name: 'Survival (Tracking)', bonus: 8, proficient: true },
      { name: 'Stealth', bonus: 7, proficient: true },
    ],
    passivePerception: 18,
    steelWeapon: {
      name: 'Kaer Morhen Masterwork Steel Longsword',
      attackBonus: 7,
      damage: '1d8 + 4 (or 1d10 + 4 versatile)',
      damageType: 'Slashing (Steel)',
      properties: ['Versatile', 'Finesse', 'Meteorite Core (+1 to hit)'],
      description: 'Forged from Mahakaman steel folded twenty times. Balanced for parrying and sweeping strikes against humanoids and beasts.',
      isSilver: false,
    },
    silverWeapon: {
      name: 'Runic Silver Longsword of the North',
      attackBonus: 7,
      damage: '1d8 + 4 (+2d6 radiant/silver vs monsters)',
      damageType: 'Silver / Slashing',
      properties: ['Versatile', 'Finesse', 'Runic Inscription', 'Bane of Relicts'],
      description: 'Lined with elven glyphs that gleam when monstrosities are near. Churns through supernatural flesh and wards off curses.',
      isSilver: true,
    },
    schoolPerk: {
      name: 'Fluid Riposte & Wolf Adaptability',
      description: 'Reaction: When hit by a melee attack, spend 1 Vigor or Reaction to roll 1d10 + 4 to reduce the damage. If reduced to 0, immediately make a free melee counter-strike.',
    },
    mutations: [
      'Witcher Senses: Advantage on Wisdom (Perception) checks that rely on sight, sound, or smell.',
      'Trial of the Grasses: Immune to natural diseases; resistance to poison damage; advantage on saves vs poison.',
      'Cat Eyes: Darkvision 60 ft (120 ft with Cat Potion).',
      'Extra Attack: Can attack twice whenever taking the Attack action.',
    ],
    potions: [],
    bombs: [],
    oils: [],
    signs: ['Aard', 'Igni', 'Quen', 'Yrden', 'Axii'],
    backstory: `Taken as a child under the Law of Surprise after his father—a Redanian wheelwright—was saved from a pack of ghouls during the Bitter Winter of 1142, Vane was forged in the high, wind-scoured courtyards of Kaer Morhen. Out of thirty boys in his cohort who drank the mutagenic decoctions during the Trial of the Grasses, only seven opened their eyes again. Vane's eyes burned a fierce, luminous wolf-amber, and his heartbeat slowed to a steady, unshakeable rhythm—one beat every four seconds.

For three decades Vane has walked the Path from the Blue Mountains to the Yaruga river. Unlike the courtly Griffins, the volatile Cats, or the solitary Bears, Vane embodies the classic Wolf doctrine: master every tool, study the beast before drawing silver, and never allow kings or barons to turn a monster hunter into a political executioner. Yet two summers ago, Vane broke his own neutrality in Sodden when he slew a corrupt tax-collector who had fed peasant children to a swamp hag—an act that earned him a scar across his collarbone and a healthy distrust of noble decrees.

With autumn frost already biting the high passes back to Kaer Morhen, Vane needs five hundred Cintrian orens to purchase winter alchemical base and dwarven steel for his aging mentor, Master Rennard. The royal bounty posted at the Lion & Lily waystation is his last chance at a full purse before the snows seal the mountains.`,
    appearance: 'Lean, whipcord-muscular with graying dark hair pulled back into a leather cord. A jagged white scar runs from his left ear down into his collar. A snarling silver wolf medallion rests over a weathered ox-hide jerkin reinforced with Mahakaman steel studs.',
    flaw: 'Dryly cynical toward authority; struggles to walk away when common folk or ancient pacts are exploited by greedy lords.',
    ideal: 'The Path\'s Equilibrium: Monsters of tooth and claw are honest; it is the monsters wearing silk and crowns who require watching.',
    bond: 'Carries a cracked silver whetstone gifted by his dying Trial-brother, Eskel of the Crags, and owes winter provisions to Kaer Morhen.',
    avatarUrl: getAssetUrl('assets/characters/wolf.jpg'),
    roleplayGuide: {
      whatMakesYouDifferent: 'You are the party\'s forensic investigator, tactical field commander, and moral compass. Where Alden (Griffin) trusts chivalry, Sybilla (Cat) trusts assassination, and Bram (Bear) trusts brute force, you rely on razor-sharp Witcher Senses (+8 Perception/Survival), monster anatomy, and balanced pirouette swordplay.',
      voiceAndMannerisms: 'Speak in low, gravelly, economical sentences. Pause to sniff the air, touch the mud, or listen to the wind before answering a question. Use dry, deadpan sarcasm when nobles boast. Clean or oil your blade while others argue.',
      combatPhilosophy: 'You are a master duelist and adaptable skirmisher. Stay near the front line alongside Bram, use your Fluid Riposte reaction to parry and counter-strike enemies who swing at you, and hurl Moon Dust or Grapeshot bombs to control the battlefield.',
      roleplayTips: [
        ' crouch by corpses first—describe what you smell (ozone, rot, sap, cheap Cintrian perfume) before rolling Perception.',
        'Act as the mediator when Sybilla (Cat) and Alden (Griffin) clash over honor versus pragmatism.',
        'Always ask the client three practical questions: "How many died? When did it start? And what aren\'t you telling me?"',
        'Remind the party that Witchers don\'t work for free—haggle firmly but without cruelty.',
      ],
      signatureQuotes: [
        '"Wind\'s howling... and that smell isn\'t rain. Something old woke up in these woods."',
        '"Two thousand orens is a prince\'s ransom for a simple woodland beast. Which means it isn\'t simple, and the Baron is terrified."',
        '"Keep your banners and your royal seals, Bailiff. Just show me the bodies."',
      ],
      schoolHistoryAndSecrets: 'Kaer Morhen in 1184 still houses over two dozen active Wolf witchers, though tensions with human mages and fanatical priests are already rising. Wolves are taught that the Conjunction of the Spheres left ecological scars—some relicts act as natural wardens of the wild and only slaughter humans when provoked.',
      partyBonds: [
        {
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          dynamic: 'Wary Respect: Three years ago in Angren, you and Sybilla hunted the same manticore. You disapprove of her taking contracts on humans, but you know she won\'t stab you in the back if the coin is split fairly.',
        },
        {
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          dynamic: 'Fraternal Friction: You find Alden\'s knightly manners amusingly naive for a mutant, yet you genuinely admire his mastery of Elder runes and high-intensity Signs.',
        },
        {
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          dynamic: 'Silent Brotherhood: You and Bram can sit by a campfire for three hours without speaking a word and consider it a fine conversation. You trust him to hold the center when a Chort charges.',
        },
      ],
      personalStakeInContract: 'Your mentor Master Rennard at Kaer Morhen once warned you about the "Treaty of Marnadal"—an ancient pact between Cintrian kings and the primeval forest guardians. You suspect this contract is a cover-up for a broken royal oath.',
    },
    gold: INITIAL_WITCHER_GOLD,
    equippedArmor: STARTER_ARMOR_SETS.Wolf,
    inventory: [],
  },
  {
    id: 'witcher-cat',
    name: 'Sybilla "The Lynx"',
    title: 'The Shadow of Dyn Marv',
    school: 'Cat',
    schoolMotto: 'Speed kills before conscience can speak.',
    level: 5,
    armorClass: 17,
    maxHp: 44,
    currentHp: 44,
    tempHp: 0,
    speed: 40,
    hitDice: '5d10',
    hitDiceCurrent: 5,
    hitDiceTotal: 5,
    vigor: 4,
    maxVigor: 4,
    toxicity: 0,
    maxToxicity: 100,
    abilities: {
      str: 10, // +0
      dex: 20, // +5
      con: 14, // +2
      int: 14, // +2
      wis: 12, // +1
      cha: 12, // +1
    },
    savingThrows: ['Dexterity (+8)', 'Intelligence (+5)'],
    skills: [
      { name: 'Acrobatics', bonus: 8, proficient: true },
      { name: 'Deception', bonus: 4, proficient: true },
      { name: 'Insight', bonus: 4, proficient: true },
      { name: 'Perception', bonus: 7, proficient: true },
      { name: 'Sleight of Hand', bonus: 8, proficient: true },
      { name: 'Stealth', bonus: 11, proficient: true }, // Expertise
    ],
    passivePerception: 17,
    steelWeapon: {
      name: 'Cat School Razor-Fencing Sabres (Dual)',
      attackBonus: 8,
      damage: '1d6 + 5 (Main) / 1d6 + 5 (Offhand Bonus Action)',
      damageType: 'Piercing / Slashing (Steel)',
      properties: ['Light', 'Finesse', 'Dual-Wielding', 'Crit on 19-20'],
      description: 'Extremely thin, razor-sharp duelists sabres designed for fast tendon-slitting strokes. When dual wielding, attacks flow without pause.',
      isSilver: false,
    },
    silverWeapon: {
      name: 'Curved Silver Estoc of Dyn Marv',
      attackBonus: 8,
      damage: '1d8 + 5 (+2d6 sneak ambush damage)',
      damageType: 'Silver / Piercing',
      properties: ['Finesse', 'Silver Core', 'Needle Tip', 'Crit on 19-20'],
      description: 'A slender silver rapier capable of finding the soft gaps between a monster’s chitin and scales with devastating precision.',
      isSilver: true,
    },
    schoolPerk: {
      name: 'Feline Agility & Ambush Strike',
      description: 'Weapon attacks score a Critical Hit on a d20 roll of 19 or 20. Bonus Action: Can Dash or Disengage. Once per turn, deals an extra 2d6 damage if attacking with advantage or against an enemy engaged by an ally.',
    },
    mutations: [
      'Altered Mutation: Heightened reflexes grant +5 to Initiative checks and immunity to being surprised.',
      'Feline Grace: Takes half damage from falling; climbing does not cost extra movement.',
      'Trial of the Grasses: Resistance to poison; darkvision 60 ft.',
      'Extra Attack: Can attack twice with the main weapon plus once with the off-hand sabre.',
    ],
    potions: [],
    bombs: [],
    oils: [],
    signs: ['Aard', 'Igni', 'Quen', 'Yrden', 'Axii'],
    backstory: `Born in the slums of Ebbing and sold to the Caravan of Dyn Marv for a sack of grain, Sybilla survived the Cat School's experimental, unstable Trial of the Grasses—a formula driven using elven alchemical secrets that amplified her nervous system to blinding speed while sharpening rather than dulling her volatile emotions. Where other witcher schools refused women and clung to dusty codes of neutrality, the Cats embraced outcasts, elves, and daughters of the gutter, training them as both monster-slayers and high-born assassins.

For years Sybilla worked in the shadows of southern courts until the Caravan's grandmaster ordered her to slaughter an entire village of witnesses in Nazair to cover up a nobleman's crime. Sybilla refused, slit the throat of the Caravan enforcer sent to discipline her, and fled north across the Yaruga into Cintra with a price on her head.

She knows how nobles think, how spies lie, and how daggers are hidden behind velvet cloaks. When she hears that Baron Raymond of Marnadal is offering 2,000 orens for a "woodland demon," her streetwise instincts immediately smell a political cover-up—and an opportunity for a massive payday.`,
    appearance: 'Lithe, coiled like a panther, dressed in form-fitting midnight-black studded leather with silver-clawed bracers and a deep hood. Her slit-pupil eyes are bright topaz, and a scarred notch cuts through her left eyebrow. A snarling feline medallion hangs from a choker at her throat.',
    flaw: 'Fiercely claustrophobic of authority and quick to strike first when cornered or insulted; struggles to trust anyone who claims "noble intentions."',
    ideal: 'Survival & Autonomy: The world made us freaks to do its dirty work. Take their gold, expose their hypocrisy, and never wear a collar.',
    bond: 'Wields twin sabres etched with Elven script given to her by Mora, an elven Cat-sister who stayed behind to hold off the Caravan\'s hunters.',
    avatarUrl: getAssetUrl('assets/characters/cat.jpg'),
    roleplayGuide: {
      whatMakesYouDifferent: 'You are the party\'s lethal infiltrator, human-nature detective, and critical-hit striker. Unlike the other three Witchers, your mutations heightened your emotions instead of muting them—and you carry Hanged Man\'s Venom because you know humans are just as deadly as monsters. With +11 Stealth and 19–20 Critical Hits + 2d6 Ambush Strike, you melt high-priority targets.',
      voiceAndMannerisms: 'Speak with a sharp, musical, mocking cadence. Smile when threatened. Perch on window sills, barrels, or high rafters rather than sitting in chairs with your back exposed. Flip a gold coin or dagger across your knuckles when bored.',
      combatPhilosophy: 'Never trade blows head-on with a giant beast. Let Bram (Bear) or Vane (Wolf) engage the target, then dart in with 40 ft speed, unleash three rapier/sabre strikes with +2d6 Ambush bonus and 19–20 crits, and use your Bonus Action to Disengage out of reach—or blind foes with Samum bombs.',
      roleplayTips: [
        'Spot human treachery—when inspecting crime scenes, look for stab wounds, poison, boot prints, and stolen valuables that prove human involvement.',
        'Pick pockets, lift keys, or eavesdrop from the shadows while the others talk to officials.',
        'Needle Alden (Griffin) about his faith in royal honor, while secretly respecting his courage.',
        'If a fight breaks out in a tavern or court, aim for tendons, arteries, and purses.',
      ],
      signatureQuotes: [
        '"A monster kills because it\'s hungry. A Baron pays two thousand gold because he\'s guilty."',
        '"Keep talking, Ser Knight. By the time your hand reaches that hilt, you\'ll be counting your fingers on the floorboards."',
        '"Honor doesn\'t buy winter boots, Alden. Let\'s check what the steward had in his pockets first."',
      ],
      schoolHistoryAndSecrets: 'The School of the Cat lost its citadel of Stygga and now roams in the fortified Dyn Marv Caravan. They crossbred elven fencing with witcher alchemy, making them the fastest blades on the Continent—and the only school feared by kings for taking contracts on crowned heads.',
      partyBonds: [
        {
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          dynamic: 'Pragmatic Partners: Vane lectures you less than the others. You respect his tracking eye, and you know he once killed a corrupt official to save children—making him less of a Boy Scout than he pretends.',
        },
        {
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          dynamic: 'Oil and Water: Alden embodies the knightly nobility you despise, so you constantly tease him as "Your Grace." Yet when his Quen shield saved your life in Sodden, he earned a debt you haven\'t repaid.',
        },
        {
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          dynamic: 'The Anvil and the Hammer: In combat, Bram is your favorite partner—he locks the monster\'s jaws in place while you carve its spine from behind.',
        },
      ],
      personalStakeInContract: 'You recognized one of Baron Raymond\'s personal outriders on the highway—a black-ops mercenary who once hired the Cat Caravan for political wetwork. You know the Baron is hiding something lucrative enough to blackmail him for double the bounty.',
    },
    gold: INITIAL_WITCHER_GOLD,
    equippedArmor: STARTER_ARMOR_SETS.Cat,
    inventory: [],
  },
  {
    id: 'witcher-griffin',
    name: 'Alden of Kaer Seren',
    title: 'The Knight-Witcher of Kovir',
    school: 'Griffin',
    schoolMotto: 'Knowledge is our steel, the signs our sorcery, honor our shield.',
    level: 5,
    armorClass: 17,
    maxHp: 52,
    currentHp: 52,
    tempHp: 0,
    speed: 30,
    hitDice: '5d10',
    hitDiceCurrent: 5,
    hitDiceTotal: 5,
    vigor: 6, // Expanded Vigor pool
    maxVigor: 6,
    toxicity: 0,
    maxToxicity: 100,
    abilities: {
      str: 12, // +1
      dex: 14, // +2
      con: 16, // +3
      int: 18, // +4 (Sign Master)
      wis: 14, // +2
      cha: 14, // +2
    },
    savingThrows: ['Constitution (+6)', 'Intelligence (+7)', 'Wisdom (+5)'],
    skills: [
      { name: 'Arcana', bonus: 7, proficient: true },
      { name: 'History', bonus: 7, proficient: true },
      { name: 'Investigation', bonus: 7, proficient: true },
      { name: 'Perception', bonus: 5, proficient: true },
      { name: 'Persuasion', bonus: 5, proficient: true },
      { name: 'Religion', bonus: 7, proficient: true },
    ],
    passivePerception: 15,
    steelWeapon: {
      name: 'Kaer Seren Silver-Plated Knightly Bastard Sword',
      attackBonus: 6,
      damage: '1d8 + 2 (1d10 + 2 versatile)',
      damageType: 'Slashing (Steel)',
      properties: ['Versatile', 'Runic Hilt (Sign DC +1)', 'Silver Inlay'],
      description: 'A beautifully balanced knightly longsword engraved with Griffin heraldry. Channels magic into the blade during Sign casting.',
      isSilver: false,
    },
    silverWeapon: {
      name: 'Consecrated Silver Blade of Kaer Seren',
      attackBonus: 6,
      damage: '1d8 + 2 (+2d6 radiant + 1d8 fire when Igni is primed)',
      damageType: 'Silver / Radiant',
      properties: ['Versatile', 'Sign Focus', 'Glowing Runes'],
      description: 'Laced with purified meteoritic silver and consecrated against unholy spirits. Resonates with intense harmonic hum when signs are cast.',
      isSilver: true,
    },
    schoolPerk: {
      name: 'Grand Sign Weaver & Yrden Bastion',
      description: 'Vigor pool is 6. After casting any Witcher Sign, Alden can make a melee weapon strike as a Bonus Action. His Quen shield absorbs +10 extra damage (total 25 temp HP), and his Sign Save DC is 15 (instead of 13).',
    },
    mutations: [
      'Amplified Conduit: The mutagenic formulas of Kaer Seren enhance magical conductivity through the fingers.',
      'Scholarly Mind: Can decipher ancient elder glyphs, barrow runes, and alchemical formulas without checks.',
      'Trial of the Grasses: Darkvision 60 ft; disease immunity; poison resistance.',
      'Extra Attack: Can attack twice when taking the Attack action.',
    ],
    potions: [],
    bombs: [],
    oils: [],
    signs: ['Aard', 'Igni', 'Quen', 'Yrden', 'Axii'],
    backstory: `High atop the sea-cliffs of Mount Erlenwald in Kovir stands Kaer Seren, the citadel of the School of the Griffin. Founded by knightly witchers who refused to abandon chivalric virtue or arcane scholarship, the Griffins study ancient Elder Speech manuscripts, high-intensity Sign weaving, and royal diplomacy.

Alden was born the third son of a minor Cintrian banner-house in the Marnadal valley that fell into ruin after a plague year. Claimed by Grandmaster Jerome of Kaer Seren, Alden survived the Trial of the Grasses with an unprecedented affinity for elemental resonance—when his pulse rises, faint golden sparks of Sign energy crackle across his knuckles.

Now returning to his ancestral homeland of Cintra for the first time in twenty-five years, Alden wears polished griffin-engraved half-plate and speaks with the eloquence of a court scholar. He believes witchers should be guardians of sacred treaties between mankind and the Elder World—and he is troubled to find his childhood valley of Marnadal shrouded in unnatural fog and royal deceit.`,
    appearance: 'Tall and noble-featured with silver-streaked chestnut hair, a neatly trimmed beard, and luminous golden eyes. He wears a fluted steel cuirass etched with soaring griffin wings over a royal blue gambeson. His silver griffin medallion gleams like a knightly order badge.',
    flaw: 'Holds himself and others to a strict code of chivalric honor; deeply pained when forced to choose between a sworn oath and the truth.',
    ideal: 'Enlightened Chivalry: A Witcher is not a butcher for hire, but a scholar-knight who stands between ignorance and the dark.',
    bond: 'Wears the faded signet ring of his fallen Cintrian family from the Marnadal valley and guards a compendium of Elder treaties.',
    avatarUrl: getAssetUrl('assets/characters/griffin.jpg'),
    roleplayGuide: {
      whatMakesYouDifferent: 'You are the party\'s Arcane Sign-Weaver, Elder Lore scholar, and noble diplomat. You have 6 Vigor (instead of 4), a DC 15 Sign Save, Tawny Owl + Petri\'s Philter potions for non-stop Sign casting, and automatic fluency in Elder Speech and ancient barrow runes (+7 Arcana/History/Religion).',
      voiceAndMannerisms: 'Speak with measured, articulate, courtly gravitas. Address lords by their proper titles—and hold them to the weight of those titles. Trace glowing Sign glyphs in the air when thinking or explaining magical phenomena.',
      combatPhilosophy: 'Weave a Witcher Sign every single turn! Because of your Grand Sign Weaver perk, casting Igni, Yrden, Aard, Quen, or Axii lets you immediately follow up with a Bonus Action sword strike. Quaff Tawny Owl and Petri\'s Philter in big fights to unleash devastating firewaves and impenetrable Yrden wards.',
      roleplayTips: [
        'Take the lead when reading ancient inscriptions, elven architecture, royal heraldry, or magical curses.',
        'Use Axii or Persuasion (+5) to command respect from Cintrian knights and bailiffs who look down on other witchers.',
        'Advocate for understanding WHY a Relict monster is attacking rather than blindly slaughtering an ancient guardian.',
        'Keep the peace between Sybilla\'s outlaw cynicism and Bram\'s gruff impatience.',
      ],
      signatureQuotes: [
        '"A true knight does not break a treaty carved in stone, Sir Bailiff—and a Griffin Witcher does not ignore a desecrated shrine."',
        '"Step back behind my Yrden circle! The hounds are woven of ectoplasm and malice—my Sign will bind them to flesh!"',
        '"Read the glyphs upon the arch: \'While the Sun Stone sleeps in the root, the Crown of Elidyr shall stand.\' The Baron knows what he woke."',
      ],
      schoolHistoryAndSecrets: 'Kaer Seren possesses the largest library of pre-Conjunction tomes outside of Oxenfurt. Griffin witchers are welcomed in the courts of Kovir and Poviss as advisors, and their mutagenic formula specifically opens the pineal gland to channel raw Chaos into amplified Signs.',
      partyBonds: [
        {
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          dynamic: 'Mutual Respect: You view Vane as a seasoned field commander whose practical tracking complements your arcane scholarship. You trust his judgment when the path turns dark.',
        },
        {
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          dynamic: 'Chivalric Concern: Sybilla mocks your armor and titles at every turn, yet you shielded her with Quen in Sodden because you refuse to see a fellow Witcher abandoned.',
        },
        {
          school: 'Bear',
          witcherName: 'Bram of Haern Caduch',
          dynamic: 'Shield and Bulwark: You respect Bram\'s unshakeable resolve. In battle, your Yrden traps and Igni blasts clear the flanks while Bram anchors the center.',
        },
      ],
      personalStakeInContract: 'Your deceased grandfather was a sworn banner-knight of Marnadal who taught you the nursery rhyme of King Elidyr\'s Sun Stone. Discovering that Baron Raymond desecrated your homeland\'s most sacred covenant is a personal dishonor you must set right.',
    },
    gold: INITIAL_WITCHER_GOLD,
    equippedArmor: STARTER_ARMOR_SETS.Griffin,
    inventory: [],
  },
  {
    id: 'witcher-bear',
    name: 'Bram of Haern Caduch',
    title: 'The Mountain Juggernaut',
    school: 'Bear',
    schoolMotto: 'Stand like the mountain. Strike like the avalanche.',
    level: 5,
    armorClass: 18,
    maxHp: 58,
    currentHp: 58,
    tempHp: 0,
    speed: 30,
    hitDice: '5d12',
    hitDiceCurrent: 5,
    hitDiceTotal: 5,
    vigor: 4,
    maxVigor: 4,
    toxicity: 0,
    maxToxicity: 100,
    abilities: {
      str: 18, // +4
      dex: 12, // +1
      con: 18, // +4
      int: 10, // +0
      wis: 14, // +2
      cha: 8,  // -1
    },
    savingThrows: ['Strength (+7)', 'Constitution (+7)'],
    skills: [
      { name: 'Athletics', bonus: 7, proficient: true },
      { name: 'Intimidation', bonus: 5, proficient: true },
      { name: 'Perception', bonus: 5, proficient: true },
      { name: 'Survival', bonus: 5, proficient: true },
    ],
    passivePerception: 15,
    steelWeapon: {
      name: 'Haern Caduch Two-Handed Steel Executioner Greatsword',
      attackBonus: 7,
      damage: '2d6 + 4',
      damageType: 'Slashing (Steel)',
      properties: ['Heavy', 'Two-Handed', 'Sunder Armor', 'Knockback'],
      description: 'A massive four-foot slab of steel from the Amell mountain forges. On hit, can push a Medium or smaller target 10 feet back.',
      isSilver: false,
    },
    silverWeapon: {
      name: 'Ursine Great Silver Cleaver',
      attackBonus: 7,
      damage: '2d6 + 4 (+2d6 silver against monsters)',
      damageType: 'Silver / Slashing',
      properties: ['Heavy', 'Two-Handed', 'Brutal Critical (+1 damage die on crits)'],
      description: 'Heavier than ordinary witcher silver swords. Shatters bone, carves thick hide, and sends monstrous beasts reeling.',
      isSilver: true,
    },
    schoolPerk: {
      name: 'Ursine Juggernaut & Quen Bulwark',
      description: 'Cannot be knocked prone or moved against his will by enemies. When Quen is cast, he gains resistance to Bludgeoning, Piercing, and Slashing damage for the duration. Critical hits with his greatsword automatically knock the enemy Prone.',
    },
    mutations: [
      'Ursine Bulk: Roll hit points using d12 instead of d10. Gains +1 extra HP per level.',
      'Thickened Hide: Base AC is 18 while wearing medium/heavy armor.',
      'Trial of the Grasses: Darkvision 60 ft; disease immunity; poison resistance.',
      'Extra Attack: Can attack twice when taking the Attack action.',
    ],
    potions: [],
    bombs: [],
    oils: [],
    signs: ['Aard', 'Igni', 'Quen', 'Yrden', 'Axii'],
    backstory: `High in the glacial, storm-lashed peaks of the Amell Mountains stands Haern Caduch, the grim stone fortress of the School of the Bear. Unlike the brotherhood of the Wolves or the knightly fellowship of the Griffins, Bear witchers are forged through brutal isolation. During his final Trial of the Mountain, fourteen-year-old Bram was cast out naked into a blizzard with only a flint knife and told not to return until he wore the pelt of an cave-ursine.

The Bear mutations thickened Bram's bones, broadened his shoulders to the size of a tavern doorway, and deadened his pain receptors. He wields a two-handed Ursine Great Silver Cleaver that would snap a normal man's wrists, and wears heavy Skellige-forged chainmail layered over cured bear-hide.

Bram rarely travels with companions—Bear doctrine teaches that relying on another man gets you both killed—but after crossing the Yaruga from Nazair, he tracked a massive Primeval Chort's cloven prints straight into the Marnadal woods. Knowing even an Ursine juggernaut shouldn't face a Chort and an Ancient Leshen alone, he sits in the Lion & Lily waystation, nursing a horn of sour ale and sizing up the three other witchers in the hall.`,
    appearance: 'A six-foot-six wall of scarred muscle, braided iron-gray beard, and pale ice-gold eyes. He wears heavy riveted chainmail under a frost-bear pelt cloak. A heavy, battle-dented silver bear medallion rests on his chest, and two massive greatswords jut above his broad shoulders.',
    flaw: 'Blunt to the point of rudeness; dismisses politics, riddles, and social niceties as "soft-bellied noise."',
    ideal: 'Unbreakable Endurance: Words are wind. Only stone, iron, and those strong enough to stand their ground survive the winter.',
    bond: 'Wears the blackened fang of the Amell cave-bear he slew in his youth; sworn to claim the horns of the Marnadal Chort.',
    avatarUrl: getAssetUrl('assets/characters/bear.jpg'),
    roleplayGuide: {
      whatMakesYouDifferent: 'You are the party\'s Unstoppable Juggernaut, Frontline Tank, and Brute-Force Problem Solver. With 58 HP (d12 Hit Dice), 18 AC, immunity to being knocked prone or pushed, physical damage resistance while Quen is active, and a Northern Wind cryo-bomb that freezes bosses solid for double damage, you stand toe-to-toe with monsters that would crush anyone else.',
      voiceAndMannerisms: 'Speak in a deep, rumbling bass using as few words as possible. Grunt when you agree. Stare silently at liars or braggarts until they sweat (+5 Intimidation). Smash locked doors, kick over tables for cover, and eat raw salted meat from the point of your knife.',
      combatPhilosophy: 'Cast Quen immediately to activate your Ursine Juggernaut physical resistance (halving all slashing/piercing/bludgeoning damage!), plant your feet directly in front of the biggest threat (like the Grave Hag or Primeval Chort), and cleave them with your 2d6+4+2d6 greatsword. Save your Northern Wind bomb to freeze the boss so the whole party deals double damage!',
      roleplayTips: [
        'When NPCs ramble or lie, cut through the nonsense with a single intimidating glare or blunt truth.',
        'Use your +7 Athletics to heave fallen trees, smash crypt sarcophagi, or grapple charging beasts.',
        'Treat monster hunting like blue-collar heavy labor—you respect size, scars, and results, not fancy titles.',
        'Show a dry, protective streak toward the smaller witchers (especially Sybilla) while pretending you only care about your share of the coin.',
      ],
      signatureQuotes: [
        '"Talk less. Pay half now, half when I drop its head on your table."',
        '"Let the Chort charge. I\'ve stood against avalanches in Amell that hit harder than that horned goat."',
        '"(To Ser Justin) Sit down, little knight, before I fold you inside your own breastplate."',
      ],
      schoolHistoryAndSecrets: 'Haern Caduch was founded by Arnaghad, the first witcher to break away from the original order. Bear witchers famously abandoned all pretense of brotherhood—when two Bears meet on the Path, they may trade alchemical ingredients or fight to the death over a contract, but they never bow to a lord.',
      partyBonds: [
        {
          school: 'Wolf',
          witcherName: 'Vane of Kaer Morhen',
          dynamic: 'Grudging Trust: Vane doesn\'t waste words and knows how to read a trail. You let him do the talking with the locals while you watch the door.',
        },
        {
          school: 'Cat',
          witcherName: 'Sybilla "The Lynx"',
          dynamic: 'Deadly Contrast: You call her "Little Lynx." She darts between your shoulders in battle, using your massive frame as cover before striking for the throat.',
        },
        {
          school: 'Griffin',
          witcherName: 'Alden of Kaer Seren',
          dynamic: 'The Scholar and the Mountain: You think Alden reads too many dusty books, but when ancient crypt doors lock or specters phase through steel, you\'re glad the Griffin is there.',
        },
      ],
      personalStakeInContract: 'You have been hunting the Primeval Chort of the Yaruga for three weeks since it gored a dwarf-smith friend of yours in the foothills. You want its third-eye mutagen and its horns—and nothing in Cintra will stand in your way.',
    },
    gold: INITIAL_WITCHER_GOLD,
    equippedArmor: STARTER_ARMOR_SETS.Bear,
    inventory: [],
  },
];
