import React, { useState } from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  FlaskConical, 
  Bomb, 
  Sword, 
  Flame, 
  Wind, 
  Activity, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { WitcherCharacter, WitcherSignName } from '../types';
import { WITCHER_SIGNS } from '../data/signs';
import { 
  playSignSound, 
  playSwordClash, 
  playPotionDrink, 
  playDiceRollSound 
} from '../utils/audio';

interface CharacterSheetProps {
  character: WitcherCharacter;
  onUpdateCharacter: (updated: WitcherCharacter) => void;
  onRollDice: (title: string, formula: string, modifier: number) => void;
  onAddLogMessage: (text: string, type: 'chat' | 'combat' | 'lore' | 'system') => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onUpdateCharacter,
  onRollDice,
  onAddLogMessage,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<'combat' | 'alchemy' | 'skills' | 'lore'>('combat');

  // HP Adjustments
  const handleHpChange = (delta: number) => {
    const newHp = Math.max(0, Math.min(character.maxHp, character.currentHp + delta));
    onUpdateCharacter({ ...character, currentHp: newHp });
    if (delta < 0) {
      onAddLogMessage(`${character.name} took ${Math.abs(delta)} damage! (${newHp}/${character.maxHp} HP)`, 'combat');
    } else {
      onAddLogMessage(`${character.name} recovered ${delta} HP! (${newHp}/${character.maxHp} HP)`, 'combat');
    }
  };

  // Temp HP
  const handleTempHpChange = (amount: number) => {
    onUpdateCharacter({ ...character, tempHp: amount });
  };

  // Vigor Adjustments
  const handleVigorChange = (delta: number) => {
    const newVigor = Math.max(0, Math.min(character.maxVigor, character.vigor + delta));
    onUpdateCharacter({ ...character, vigor: newVigor });
  };

  // Cast Sign
  const handleCastSign = (signName: WitcherSignName) => {
    const sign = WITCHER_SIGNS[signName];
    if (character.vigor < sign.vigorCost) {
      onAddLogMessage(`${character.name} attempts to cast ${signName}, but lacks sufficient Vigor!`, 'combat');
      return;
    }

    playSignSound(signName);
    const newVigor = character.vigor - sign.vigorCost;
    
    // Quen gives temp HP directly
    if (signName === 'Quen') {
      const shieldAmount = character.school === 'Griffin' ? 25 : 15;
      onUpdateCharacter({
        ...character,
        vigor: newVigor,
        tempHp: shieldAmount,
      });
      onAddLogMessage(`${character.name} weaves ${signName} Sign! A golden kinetic aegis manifests (+${shieldAmount} Temp HP).`, 'combat');
      return;
    }

    onUpdateCharacter({ ...character, vigor: newVigor });

    // Roll damage if applicable
    if (signName === 'Igni') {
      onRollDice(`${character.name} cast Igni Sign`, '3d6', 0);
      onAddLogMessage(`Igni firewave erupts! Enemies must succeed on DC 13 Dex save or take 3d6 fire damage (double vs Leshen) and burn!`, 'combat');
    } else if (signName === 'Aard') {
      onRollDice(`${character.name} cast Aard Sign`, '2d6', 0);
      onAddLogMessage(`Aard telekinetic blast! DC 13 Str save or knocked prone and pushed 15 ft backwards.`, 'combat');
    } else if (signName === 'Yrden') {
      onAddLogMessage(`${character.name} inscribes Yrden magical glyph circle on the ground! Incorporeal specters forced into solid form; movement halved.`, 'combat');
    } else if (signName === 'Axii') {
      onAddLogMessage(`${character.name} casts Axii Sign! Target must make DC 13 Wis save or be Stunned and Charmed.`, 'combat');
    }
  };

  // Weapon Attack
  const handleAttack = (isSilver: boolean) => {
    playSwordClash();
    const weapon = isSilver ? character.silverWeapon : character.steelWeapon;
    onRollDice(`${character.name} strikes with ${weapon.name}`, '1d20', weapon.attackBonus);
    
    if (isSilver) {
      onAddLogMessage(`Silver weapon strike primed: deals ${weapon.damage} on hit!`, 'combat');
    } else {
      onAddLogMessage(`Steel blade strike primed: deals ${weapon.damage} on hit!`, 'combat');
    }
  };

  // Drink Potion
  const handleDrinkPotion = (potionIndex: number) => {
    const potion = character.potions[potionIndex];
    if (potion.charges <= 0) return;

    playPotionDrink();
    
    if (potion.name === 'White Honey') {
      // Clears toxicity
      const updatedPotions = [...character.potions];
      updatedPotions[potionIndex] = { ...potion, charges: potion.charges - 1 };
      onUpdateCharacter({
        ...character,
        toxicity: 0,
        potions: updatedPotions,
      });
      onAddLogMessage(`${character.name} drinks White Honey! All toxicity and potion effects are purged.`, 'combat');
      return;
    }

    const newToxicity = Math.min(character.maxToxicity, character.toxicity + potion.toxicity);
    const updatedPotions = [...character.potions];
    updatedPotions[potionIndex] = { ...potion, charges: potion.charges - 1 };

    let bonusHp = 0;
    if (potion.name === 'Swallow') {
      bonusHp = 8; // Instant burst
    }

    onUpdateCharacter({
      ...character,
      toxicity: newToxicity,
      currentHp: Math.min(character.maxHp, character.currentHp + bonusHp),
      potions: updatedPotions,
    });

    onAddLogMessage(`${character.name} quaffs ${potion.name} potion! (+${potion.toxicity}% Toxicity). Effect: ${potion.effect}`, 'combat');
  };

  // Rest & Recover
  const handleShortRest = () => {
    playDiceRollSound();
    onUpdateCharacter({
      ...character,
      vigor: character.maxVigor,
      toxicity: Math.max(0, character.toxicity - 30),
      currentHp: Math.min(character.maxHp, character.currentHp + 15),
    });
    onAddLogMessage(`${character.name} completed a Short Rest: Vigor restored to max, Toxicity reduced by 30%, regained 15 HP.`, 'system');
  };

  return (
    <div className="bg-[#131517] border border-[#2e343b] rounded-xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Top Banner: Witcher Info & Vigor/Toxicity Gauges */}
      <div className="bg-[#181a1d] border-b border-[#2a3036] p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4">
        
        {/* Avatar & Title */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <img 
            src={character.avatarUrl} 
            alt={character.name} 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover object-top border-2 border-[#c99a45] shadow-lg shadow-black/60 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                {character.name}
              </h2>
              <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 uppercase">
                School of {character.school}
              </span>
            </div>
            <p className="text-xs text-[#c99a45] font-cormorant italic">{character.title}</p>
            <div className="flex items-center gap-3 text-xs text-[#8a929a] mt-1 font-mono">
              <span>Level 5 Witcher</span>
              <span>•</span>
              <span>Speed {character.speed} ft</span>
              <span>•</span>
              <span>Pass. Perception {character.passivePerception}</span>
            </div>
          </div>
        </div>

        {/* Vitality & Resource Meters */}
        <div className="w-full md:flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#101214] p-3 rounded-xl border border-[#252b31]">
          
          {/* Health Points */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-cinzel">
              <span className="text-emerald-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> HP
              </span>
              <span className="font-mono text-white">
                {character.currentHp}/{character.maxHp}
              </span>
            </div>
            <div className="w-full bg-[#20252a] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(character.currentHp / character.maxHp) * 100}%` }}
              />
            </div>
            <div className="flex gap-1 pt-1">
              <button 
                onClick={() => handleHpChange(-5)}
                className="flex-1 text-[10px] bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded py-0.5"
              >
                -5
              </button>
              <button 
                onClick={() => handleHpChange(5)}
                className="flex-1 text-[10px] bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 rounded py-0.5"
              >
                +5
              </button>
            </div>
          </div>

          {/* Quen Shield (Temp HP) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-cinzel">
              <span className="text-amber-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Quen
              </span>
              <span className="font-mono text-amber-300">{character.tempHp}</span>
            </div>
            <div className="w-full bg-[#20252a] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (character.tempHp / 25) * 100)}%` }}
              />
            </div>
            <div className="flex gap-1 pt-1">
              <button 
                onClick={() => handleTempHpChange(0)}
                className="w-full text-[10px] bg-[#22272c] hover:bg-[#2d343c] text-[#8a929a] rounded py-0.5 border border-[#333a42]"
              >
                Dispel
              </button>
            </div>
          </div>

          {/* Vigor (Signs) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-cinzel">
              <span className="text-purple-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Vigor
              </span>
              <span className="font-mono text-purple-300">{character.vigor}/{character.maxVigor}</span>
            </div>
            <div className="flex gap-1 h-2.5 items-center">
              {Array.from({ length: character.maxVigor }).map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-full rounded-sm transition-all ${
                    i < character.vigor ? 'bg-purple-500 shadow-sm shadow-purple-500/50' : 'bg-[#252b31]'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1 pt-1">
              <button 
                onClick={() => handleVigorChange(-1)}
                className="flex-1 text-[10px] bg-[#22272c] hover:bg-[#2d343c] text-purple-300 rounded py-0.5 border border-[#333a42]"
              >
                -1
              </button>
              <button 
                onClick={() => handleVigorChange(1)}
                className="flex-1 text-[10px] bg-[#22272c] hover:bg-[#2d343c] text-purple-300 rounded py-0.5 border border-[#333a42]"
              >
                +1
              </button>
            </div>
          </div>

          {/* Toxicity Gauge */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-cinzel">
              <span className="text-lime-400 flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" /> Tox
              </span>
              <span className="font-mono text-lime-300">{character.toxicity}%</span>
            </div>
            <div className="w-full bg-[#20252a] h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  character.toxicity > 70 ? 'bg-rose-500' : 'bg-lime-500'
                }`}
                style={{ width: `${Math.min(100, character.toxicity)}%` }}
              />
            </div>
            <div className="text-[10px] text-center text-[#717b85] font-mono pt-1">
              {character.toxicity >= 80 ? 'Danger! Overdose' : 'Tolerated'}
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#282d33] bg-[#141618] px-4">
        {[
          { id: 'combat', label: 'Combat & Signs', icon: Sword },
          { id: 'alchemy', label: 'Alchemy & Bombs', icon: FlaskConical },
          { id: 'skills', label: 'Ability Scores & Senses', icon: Activity },
          { id: 'lore', label: 'Lore & Code', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSheetTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-cinzel border-b-2 transition-all ${
                activeSheetTab === tab.id
                  ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#1a1c1f]'
                  : 'border-transparent text-[#8a929a] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center py-1">
          <button
            onClick={handleShortRest}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#22272c] hover:bg-[#2d343c] border border-[#373f47] text-amber-300 rounded text-xs font-cinzel transition-colors"
            title="Meditate and recover Vigor & HP"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Short Rest</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex-1 overflow-y-auto">
        
        {/* TAB 1: COMBAT & SIGNS */}
        {activeSheetTab === 'combat' && (
          <div className="space-y-6">
            
            {/* Witcher Signs Strip */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c99a45]" />
                  <span>The Five Witcher Signs</span>
                </h3>
                <span className="text-xs text-[#8a929a]">Costs 1 Vigor each</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Aard */}
                <button
                  onClick={() => handleCastSign('Aard')}
                  className="p-3 rounded-xl border border-sky-500/40 bg-sky-950/20 hover:bg-sky-900/30 transition-all text-left group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cinzel font-bold text-sky-400 text-sm">AARD</span>
                    <Wind className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#8a929a] font-mono">Telekinetic Wave</div>
                  <div className="text-[10px] text-sky-300/80 mt-1">DC 13 Str or Knockdown</div>
                </button>

                {/* Igni */}
                <button
                  onClick={() => handleCastSign('Igni')}
                  className="p-3 rounded-xl border border-orange-500/40 bg-orange-950/20 hover:bg-orange-900/30 transition-all text-left group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cinzel font-bold text-orange-400 text-sm">IGNI</span>
                    <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#8a929a] font-mono">3d6 Fire Wave</div>
                  <div className="text-[10px] text-orange-300/80 mt-1">Double vs Leshen!</div>
                </button>

                {/* Quen */}
                <button
                  onClick={() => handleCastSign('Quen')}
                  className="p-3 rounded-xl border border-yellow-500/40 bg-yellow-950/20 hover:bg-yellow-900/30 transition-all text-left group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cinzel font-bold text-yellow-400 text-sm">QUEN</span>
                    <Shield className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#8a929a] font-mono">+15-25 Shield</div>
                  <div className="text-[10px] text-yellow-300/80 mt-1">Absorbs Damage</div>
                </button>

                {/* Yrden */}
                <button
                  onClick={() => handleCastSign('Yrden')}
                  className="p-3 rounded-xl border border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/30 transition-all text-left group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cinzel font-bold text-purple-400 text-sm">YRDEN</span>
                    <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#8a929a] font-mono">Trap Circle</div>
                  <div className="text-[10px] text-purple-300/80 mt-1">Nullifies Specters</div>
                </button>

                {/* Axii */}
                <button
                  onClick={() => handleCastSign('Axii')}
                  className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/30 transition-all text-left group hover:scale-[1.02] col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cinzel font-bold text-emerald-400 text-sm">AXII</span>
                    <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#8a929a] font-mono">Mental Puppet</div>
                  <div className="text-[10px] text-emerald-300/80 mt-1">Stuns / Charms</div>
                </button>
              </div>
            </div>

            {/* Twin Swords */}
            <div>
              <h3 className="font-cinzel text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-[#c99a45]" />
                <span>The Witcher's Blades</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Silver Sword */}
                <div className="p-4 rounded-xl border border-sky-400/30 bg-gradient-to-br from-[#121820] to-[#151a20] relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-cinzel font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Silver (For Monsters)
                      </span>
                      <h4 className="font-cinzel text-base font-bold text-white mt-1">
                        {character.silverWeapon.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleAttack(true)}
                      className="px-3 py-1.5 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-xs rounded-md shadow transition-colors flex items-center gap-1"
                    >
                      <Sword className="w-3.5 h-3.5" />
                      <span>Attack (+{character.silverWeapon.attackBonus})</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#a6b1b9] mt-2 font-mono">
                    Damage: {character.silverWeapon.damage}
                  </p>
                  <p className="text-[11px] text-[#717b85] font-cormorant italic mt-1">
                    {character.silverWeapon.description}
                  </p>
                </div>

                {/* Steel Sword */}
                <div className="p-4 rounded-xl border border-slate-600/40 bg-gradient-to-br from-[#18191b] to-[#141517] relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-cinzel font-bold px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-500/30">
                        Steel (For Men & Beasts)
                      </span>
                      <h4 className="font-cinzel text-base font-bold text-white mt-1">
                        {character.steelWeapon.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleAttack(false)}
                      className="px-3 py-1.5 bg-[#252a30] hover:bg-[#323942] border border-[#454e57] text-white font-cinzel font-bold text-xs rounded-md shadow transition-colors flex items-center gap-1"
                    >
                      <Sword className="w-3.5 h-3.5" />
                      <span>Attack (+{character.steelWeapon.attackBonus})</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#a6b1b9] mt-2 font-mono">
                    Damage: {character.steelWeapon.damage}
                  </p>
                  <p className="text-[11px] text-[#717b85] font-cormorant italic mt-1">
                    {character.steelWeapon.description}
                  </p>
                </div>

              </div>
            </div>

            {/* School Special Perk Banner */}
            <div className="p-4 rounded-xl border border-[#c99a45]/40 bg-[#191814] flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#c99a45] shrink-0 mt-0.5" />
              <div>
                <div className="font-cinzel text-sm font-bold text-[#e2ba6d]">
                  School of the {character.school} Mastery: {character.schoolPerk.name}
                </div>
                <p className="text-xs text-[#b8b3a8] mt-1 leading-relaxed">
                  {character.schoolPerk.description}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ALCHEMY & BOMBS */}
        {activeSheetTab === 'alchemy' && (
          <div className="space-y-6">
            
            {/* Witcher Potions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span>Witcher Elixirs</span>
                </h3>
                <span className="text-xs text-[#8a929a]">
                  Max Toxicity: 100% (Current: {character.toxicity}%)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {character.potions.map((potion, idx) => (
                  <div 
                    key={potion.name}
                    className="p-3.5 rounded-xl border border-[#2b3137] bg-[#16181b] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel text-sm font-bold text-white">{potion.name}</span>
                        <span className="text-[10px] font-mono text-lime-400 bg-lime-950/40 px-1.5 py-0.5 rounded border border-lime-500/30">
                          +{potion.toxicity}% Tox
                        </span>
                      </div>
                      <p className="text-xs text-[#8a929a] mt-1">{potion.effect}</p>
                      <div className="text-[10px] text-[#6b737d] font-mono mt-0.5">Charges: {potion.charges}/{potion.maxCharges}</div>
                    </div>

                    <button
                      onClick={() => handleDrinkPotion(idx)}
                      disabled={potion.charges <= 0}
                      className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-300 text-xs font-cinzel rounded-md transition-all shrink-0 disabled:opacity-40"
                    >
                      Quaff
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bombs & Blade Oils */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Bombs */}
              <div>
                <h3 className="font-cinzel text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Bomb className="w-4 h-4 text-amber-400" />
                  <span>Witcher Bombs</span>
                </h3>
                <div className="space-y-2.5">
                  {character.bombs.map((bomb) => (
                    <div key={bomb.name} className="p-3 rounded-lg border border-[#262b31] bg-[#121416]">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-white text-xs">{bomb.name}</span>
                        <button
                          onClick={() => {
                            onRollDice(`${character.name} hurled a ${bomb.name} bomb`, '3d8', 0);
                            onAddLogMessage(`${character.name} tossed a ${bomb.name} bomb! Radius: ${bomb.radius}. Effect: ${bomb.effect}`, 'combat');
                          }}
                          className="text-[10px] bg-amber-900/50 hover:bg-amber-800 text-amber-200 px-2 py-0.5 rounded border border-amber-600/40 font-cinzel"
                        >
                          Hurl Bomb
                        </button>
                      </div>
                      <p className="text-[11px] text-[#8a929a] mt-1">{bomb.effect}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blade Oils */}
              <div>
                <h3 className="font-cinzel text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sword className="w-4 h-4 text-sky-400" />
                  <span>Blade Oils</span>
                </h3>
                <div className="space-y-2.5">
                  {character.oils.map((oil) => (
                    <div key={oil.name} className="p-3 rounded-lg border border-[#262b31] bg-[#121416]">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-white text-xs">{oil.name}</span>
                        <span className="text-[10px] text-sky-300 font-mono bg-sky-950/40 px-1.5 py-0.2 rounded border border-sky-500/30">
                          {oil.bonusDamage}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a929a] mt-0.5">Effective against: {oil.targetCategory}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: ABILITY SCORES & SKILLS */}
        {activeSheetTab === 'skills' && (
          <div className="space-y-6">
            
            {/* Ability Scores Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
              {[
                { name: 'STR', val: character.abilities.str },
                { name: 'DEX', val: character.abilities.dex },
                { name: 'CON', val: character.abilities.con },
                { name: 'INT', val: character.abilities.int },
                { name: 'WIS', val: character.abilities.wis },
                { name: 'CHA', val: character.abilities.cha },
              ].map((stat) => {
                const mod = Math.floor((stat.val - 10) / 2);
                const sign = mod >= 0 ? `+${mod}` : `${mod}`;
                return (
                  <button
                    key={stat.name}
                    onClick={() => onRollDice(`${character.name} ${stat.name} Check`, '1d20', mod)}
                    className="p-3 rounded-xl bg-[#16181b] border border-[#2b3137] hover:border-[#c99a45] transition-all group"
                  >
                    <div className="text-xs font-cinzel text-[#8a929a]">{stat.name}</div>
                    <div className="text-lg font-bold text-white my-0.5">{sign}</div>
                    <div className="text-[10px] text-[#616a73] font-mono">({stat.val})</div>
                  </button>
                );
              })}
            </div>

            {/* Witcher Senses & Trained Skills */}
            <div>
              <h3 className="font-cinzel text-sm font-bold text-white mb-3">
                Skills & Witcher Senses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {character.skills.map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => onRollDice(`${character.name} ${skill.name} Check`, '1d20', skill.bonus)}
                    className="p-2.5 rounded-lg border border-[#262b31] bg-[#121416] hover:bg-[#191c20] hover:border-[#c99a45] transition-all flex items-center justify-between text-left"
                  >
                    <span className="text-xs text-[#d6d9dc]">{skill.name}</span>
                    <span className="text-xs font-mono font-bold text-[#c99a45]">+{skill.bonus}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Witcher Mutations */}
            <div className="bg-[#121416] p-4 rounded-xl border border-[#252a30]">
              <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider mb-2">
                Mutations from the Trial of the Grasses
              </h4>
              <ul className="text-xs text-[#8a929a] space-y-1.5 list-disc list-inside">
                {character.mutations.map((mut, i) => (
                  <li key={i}>{mut}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* TAB 4: LORE & CODE */}
        {activeSheetTab === 'lore' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#121416] border border-[#262b31]">
              <h4 className="font-cinzel text-sm font-bold text-[#e2ba6d] mb-1">
                Backstory: {character.name}
              </h4>
              <p className="text-xs text-[#a6b1b9] leading-relaxed">
                {character.backstory}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#121416] border border-[#262b31] rounded-lg">
                <div className="font-cinzel text-xs font-bold text-white mb-1">Ideal</div>
                <p className="text-xs text-[#8a929a]">{character.ideal}</p>
              </div>
              <div className="p-3 bg-[#121416] border border-[#262b31] rounded-lg">
                <div className="font-cinzel text-xs font-bold text-white mb-1">Flaw</div>
                <p className="text-xs text-[#8a929a]">{character.flaw}</p>
              </div>
              <div className="p-3 bg-[#121416] border border-[#262b31] rounded-lg">
                <div className="font-cinzel text-xs font-bold text-white mb-1">Bond</div>
                <p className="text-xs text-[#8a929a]">{character.bond}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
