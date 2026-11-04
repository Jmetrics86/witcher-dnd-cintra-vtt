export interface AdventureAct {
  act: number;
  timeEstimate: string;
  title: string;
  location: string;
  overview: string;
  readAloud: string;
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
    choices: { name: string; description: string; consequences: string }[];
  };
}

export const WITCHER_ADVENTURE: WitcherAdventure = {
  title: 'The Blood of Marnadal',
  subtitle: 'A Witcher 5e Adventure in the Golden Age of Cintra',
  estimatedPlaytime: '4 Hours (Strict One-Shot Pacing)',
  recommendedPlayers: 'Up to 4 Players (Wolf, Cat, Griffin, Bear)',
  settingLore: `The year is 1184 by the northern calendar—more than a century before the birth of Geralt of Rivia and generations before the Lioness of Cintra took the throne. Cintra is an ascending superpower of stone bastions, gilded tourneys, and fertile fields bordering the wild ribbon of the Yaruga. 

Yet beyond the patrolled stone highways, the ancient realm remains primeval and perilous. Elven blood-rites still echo in the barrows, and relicts from the Conjunction of the Spheres linger in the shadow of the mountains. Witcher schools still roam in numbers; their medallions—Wolf, Cat, Griffin, Bear—are recognized with equal parts relief and fearful contempt by Cintrian peasants and chivalric knights alike.`,
  witcherCodePrinciples: [
    'Silver for monsters, steel for men (and non-monstrous beasts).',
    'Never take a contract for free; negotiate before the blade is drawn.',
    'Beware the toxicity of elixirs: exceeding 100 toxicity induces fever and delirium.',
    'Use Witcher Senses to inspect the kill site before entering the monster\'s lair.',
    'Signs are weapons of will: manage your Vigor wisely.',
  ],
  acts: [
    {
      act: 1,
      timeEstimate: '0:00 - 0:45 (45 minutes)',
      title: 'Act I: The Lion & The Lily',
      location: 'The Crossroads Waystation of Marnadal, Royal Highway of Cintra',
      overview: 'Four lone witchers from four disparate schools happen upon the same crowded roadside inn during a torrential Cintrian autumn storm. A royal bailiff from Castle Marnadal enters seeking mutant swords for an urgent, blood-soaked contract.',
      readAloud: `Autumn rain batters the heavy oak timbers of the Lion & Lily waystation like hailstones. Inside, the peat fire sputters green, casting long shadows across weary traders, Cintrian foot-soldiers, and local woodsmen nursing sour dark ale. 

At four separate corners of the hall sit four figures who do not blend into the crowd: the unmistakable slit-pupil gaze of mutated eyes, the dull glint of twin swords strapped to their backs, and the silver medallions resting on their chests—a Wolf, a Cat, a Griffin, and a Bear. 

The heavy cross-timber doors bang open against the wind. In strides Sir Danek, royal bailiff to Baron Raymond of Marnadal, flanked by four armored Cintrian spearmen bearing the rampant gold lion on their blue surcoats. He nails a parchment sealed with golden wax to the hearth pillar.

"Two thousand Cintrian orens!" Danek bellows over the crack of thunder. "By royal decree of Baron Raymond! Two thousand pieces of good gold for the head of the demon slaughtering our royal logging convoys along the Yaruga ribbon! Do we have true men in this hall... or only cowards?"`,
      dmPrompts: [
        'Ask each player to introduce their Witcher: how they look sitting alone in the tavern, what they are doing, and how their medallion reflects the firelight.',
        'Danek attempts to demean the witchers to drive down the bounty ("I need one monster hunter, not a circus troupe"). Allow the party to haggle or use Axii/Intimidation to secure 500 orens each up front.',
        'A drunken Cintrian knight, Ser Justin, tries to pick a fight with the Cat or Bear witcher, accusing them of being soulless mutants. Players can resolve this via tavern brawl, Axii persuasion, or razor-sharp intimidation.',
      ],
      keyEncounters: [
        'Roleplay & Negotiations: Haggling with Bailiff Danek (DC 13 Persuasion/Intimidation).',
        'Optional Tavern Brawl: Ser Justin and 2 guards (non-lethal tavern brawl rules, 15 HP each).',
        'Investigating the Survivor: An old mute lumberjack named Kaelan in the corner with claw-scratched forearms.',
      ],
      investigationDCs: [
        { check: 'Wisdom (Insight) vs Danek', dc: 12, result: 'Danek is hiding something. He is sweating and nervously clutching an iron talisman beneath his tunic.' },
        { check: 'Wisdom (Perception) vs Kaelan', dc: 13, result: 'Kaelan\'s wounds are not from wolves or bears—they are infected with pale fungus and smelling of rotten oak.' },
        { check: 'Intelligence (Nature/Arcana)', dc: 14, result: 'Fungal necrosis and timber killings along the Yaruga point toward a Relict—specifically an Ancient Leshen or forest Chort.' },
      ],
      tacticalAdvice: 'Ensure all 4 witchers agree to split the contract equally (500 orens each). Emphasize the distinct school dynamics: Griffin\'s courtly dignity vs. Cat\'s sarcastic cynicism vs. Wolf\'s practical questions vs. Bear\'s blunt threats.',
    },
    {
      act: 2,
      timeEstimate: '0:45 - 1:45 (60 minutes)',
      title: 'Act II: The Tracker\'s Trail',
      location: 'The Primeval Blackwood of the Yaruga Verge',
      overview: 'The witchers journey into the dense ancient forests north of the Yaruga. Using Witcher senses, they inspect the destroyed convoy, decipher monster tracks, and survive a spectral ambush by cursed Barghest hounds.',
      readAloud: `The rain slows to a hanging, impenetrable mist as you push your horses into the Blackwood. The pine needles muffle every hoofbeat. Here, human settlement ends and the wild elder lands begin. 

Ahead lies the massacre. Three heavy timber wagons have been overturned and smashed like kindling. Massive draught horses lie eviscerated, their rib cages burst open. Stripped human skeletons hang from spruce branches above, tied with woven vines and crowned with crow feathers. 

A low, unnatural chill sweeps through the fog. The hair on the back of your neck rises as your medallions vibrate furiously against your chest armor. Out from the gloom, four pairs of glowing emerald eyes ignite like corpse candles.`,
      dmPrompts: [
        'Active Witcher Senses: Players roll Perception to track details in the fog.',
        'Medallion Warning: All medallions vibrate, indicating magical/specter presence.',
        'Combat Engagement: 4 Barghest Spectral Hounds leap from the mist using Pack Tactics.',
        'Demonstrate Sign Synergy: Yrden strips their ethereal resistances; Moon Dust bomb forces them into vulnerable physical matter; Igni ignites their spectral coats.',
      ],
      keyEncounters: [
        'Tracking Challenge: Finding the tracks of the giant cloven hooves and gnarled wooden claws.',
        'Combat: 4 Barghest Spectral Hounds (CR 2 each). Emphasize their ghostfire bites and pack maneuvers.',
        'Discovering the Secret Trail: Blood tracks leading not deeper into the woods, but down into an ancient burial mound.',
      ],
      investigationDCs: [
        { check: 'Wisdom (Perception / Witcher Senses)', dc: 13, result: 'Notice the carts weren\'t carrying standard timber—they were hauling carved elven monolith slabs looted from a sacred ruin.' },
        { check: 'Intelligence (Investigation)', dc: 14, result: 'The guards did not die from beast claws alone—one Cintrian officer was run through from behind with a ceremonial Cintrian dagger.' },
        { check: 'Wisdom (Survival)', dc: 12, result: 'The cloven tracks lead directly into the ravine of King Elidyr\'s Barrow Mound.' },
      ],
      tacticalAdvice: 'After the Barghest fight, allow the players a short rest to prepare blade oils (Relict & Necrophage Oil) and brew/drink Swallow if injured.',
    },
    {
      act: 3,
      timeEstimate: '1:45 - 2:30 (45 minutes)',
      title: 'Act III: Secrets of the Barrow',
      location: 'The Forgotten Crypt of King Elidyr',
      overview: 'The witchers delve into an ancient tomb beneath the forest. They fight the Marnadal Grave Hag, solve the runic covenant puzzle, and uncover the dark conspiracy: Baron Raymond desecrated the ancient shrine to steal the mythical Sun Stone.',
      readAloud: `You descend stone steps choked with century-old roots into the sunken crypt of King Elidyr, the legendary first conqueror of lower Cintra. Moisture drips from ancient archways carved with reliefs of Cintrian griffins and elven dryads shaking hands in ancient accord.

In the center of the ossuary, crouched atop an open stone sarcophagus, is a nightmare of bone and withered flesh. A Grave Hag, her spine bowed like a vulture, slurps noisily on marrow. Hearing your footsteps, her head snaps 180 degrees backward. Her three-foot purple tongue whips through the air with a sickening crack!`,
      dmPrompts: [
        'Combat Encounter: The Marnadal Grave Hag (CR 4). She uses Tongue Lash to pull squishy witchers and throws blinding bone dust.',
        'Targeted Strike Rule: Remind players that a called shot to the tongue (-2 to hit, 15+ damage) cuts off her most dangerous attack!',
        'The Altar Inscription: After the fight, inspect the central tomb.',
      ],
      keyEncounters: [
        'Miniboss Fight: The Marnadal Grave Hag.',
        'Puzzle of the Five Runes: Aligning Aard, Igni, Quen, Yrden, and Axii glyphs on the altar to unlock the secret sanctum.',
        'The Revelatory Letter: Found on the corpse of Baron Raymond\'s personal steward inside the tomb.',
      ],
      investigationDCs: [
        { check: 'Intelligence (Arcana/History)', dc: 14, result: 'The altar commemorates the Treaty of Marnadal (circa 1050), where the first King of Cintra swore never to fell the Sacred Heart Tree, under pain of divine relict vengeance.' },
        { check: 'Intelligence (Investigation)', dc: 12, result: 'The Baron\'s men took the sacred "Sun Stone" from the heart tree to forge an amulet of royal power. The Ancient Leshen didn\'t attack out of malice—it is the wrath of an awakened guardian!' },
      ],
      tacticalAdvice: 'The party now has the moral dilemma! They can find the stolen Sun Stone in the Hag\'s cache. Do they return it to the Leshen, or use it to bait the monster into a death trap?',
    },
    {
      act: 4,
      timeEstimate: '2:30 - 3:30 (60 minutes)',
      title: 'Act IV: The Heart of the Wood',
      location: 'The Corrupted Monolith Stone Circle',
      overview: 'The ultimate monster hunt! In the ancient monolith ring, the party faces the Ancient Leshen of Marnadal and its bound war-beast, the Primeval Chort. All witcher skills, signs, bombs, and oils come together for an epic boss showdown.',
      readAloud: `The mist parts as you step into the sacred stone ring. Giant monoliths, older than human speech, stand like silent sentinels. In the center rises the colossal Heart Tree—its trunk split open by human axes, weeping sap as black as dried blood.

Antlers scrape against stone. Emerging from behind the monoliths, twelve feet tall, stands the Ancient Leshen. Its stag-skull head tilts toward you; beneath the eye sockets, twin embers of crimson hate ignite. A murder of hundreds of black ravens erupts from its shoulders with deafening caws. 

From the treeline behind it, the earth shakes with thunderous footsteps as the Primeval Chort charges into the ring, its third eye blazing with blinding golden fury!`,
      dmPrompts: [
        'The Climax Battle: Phase 1 (100% - 50% HP): The Leshen commands root strangles, summons crow swarms, and teleports across the arena.',
        'Phase 2 (50% HP or lower): The Chort charges in to defend its master! Bram (Bear) or Vane (Wolf) can hold the Chort with Quen and parries while Sybilla (Cat) and Alden (Griffin) burn down the Leshen.',
        'Environmental Interaction: 3 wooden totems stand around the circle. Destroying a totem prevents the Leshen from regenerating 15 HP per turn.',
        'The Sun Stone Gambit: If a witcher holds up the Sun Stone using an action and makes a DC 14 Persuasion check (or Axii sign), the Leshen hesitates for 1 round, giving free advantage to the party.',
      ],
      keyEncounters: [
        'Boss Battle: Ancient Leshen of Marnadal (CR 8, 135 HP) & Primeval Chort (CR 6, 112 HP).',
        'Tactical Objectives: Destroying 3 Totems (AC 12, 20 HP each) to strip Leshen regeneration.',
        'Exploiting Vulnerabilities: Fire (Igni & Dancing Star deal 2x damage to Leshen); Devil\'s Puffball chokes the Chort.',
      ],
      investigationDCs: [
        { check: 'Tactical Perception', dc: 13, result: 'Notice the ravens always gather above the Leshen\'s next teleport location 1 second before it appears.' },
      ],
      tacticalAdvice: 'Ensure every player feels like an absolute badass: Griffin blasting devastating Igni flames; Cat scoring brutal 19-20 critical sneak attacks; Bear absorbing titanic Chort antler charges with Quen resistance; Wolf directing tactical bomb strikes and ripostes.',
    },
  ],
  epilogue: {
    title: 'Epilogue: The Price of Neutrality (3:30 - 4:00)',
    choices: [
      {
        name: 'Choice A: The Ruthless Professional (Slay & Cash In)',
        description: 'Decapitate the Ancient Leshen, take its massive stag skull trophy, and return to Castle Marnadal to claim the 2,000 Cintrian orens from Baron Raymond. Say nothing of the Baron\'s sacrilege.',
        consequences: 'The witchers walk away rich with 500 gold each and the Leshen Trophy (+1 AC). However, the Blackwood withers and dies over the next fifty years, and local Cintrian folk curse the mercenary mutants who doomed the forest balance.',
      },
      {
        name: 'Choice B: The Restorer of Ancient Concord (Purify the Tree)',
        description: 'Embed the Sun Stone back into the wounded Heart Tree. If the Leshen was spared or pacified with Axii/Elder speech, it retreats into eternal slumber. If slain, the forest begins to heal.',
        consequences: 'The woodland blesses each witcher with a permanent charm of nature (advantage on saving throws against poison and disease). When the party confronts Baron Raymond, they expose his crime before his knights, humiliating him or forcing him to pay hush money anyway.',
      },
      {
        name: 'Choice C: The Witcher\'s Vengeance (Extortion & Justice)',
        description: 'Take both the Leshen\'s antlers AND the damning letters proving the Baron broke royal treaties. March into Castle Marnadal, slam the proof onto his feast table, and demand 4,000 orens under threat of bringing the evidence straight to the High King of Cintra.',
        consequences: 'The terrified Baron pays double out of his personal treasury. The witchers ride away into the Cintrian sunset legendary and wealthy, having enforced their own brand of rough justice before departing south for the winter.',
      },
    ],
  },
};
