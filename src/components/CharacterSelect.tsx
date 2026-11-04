import React from 'react';
import { X, Check, Shield, Zap, Sparkles, Sword } from 'lucide-react';
import { WitcherCharacter, WitcherSchool } from '../types';
import { PREGEN_WITCHERS } from '../data/characters';

interface CharacterSelectProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: WitcherCharacter | null;
  onSelectCharacter: (char: WitcherCharacter) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  isOpen,
  onClose,
  selectedCharacter,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  const getSchoolColor = (school: WitcherSchool) => {
    switch (school) {
      case 'Wolf': return 'border-amber-500/50 text-amber-400 bg-amber-500/10';
      case 'Cat': return 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10';
      case 'Griffin': return 'border-purple-500/50 text-purple-400 bg-purple-500/10';
      case 'Bear': return 'border-rose-500/50 text-rose-400 bg-rose-500/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131517] border border-[#3b4249] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1e]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c99a45]" />
              <h2 className="font-cinzel text-xl font-bold text-white tracking-wide">
                Choose Your Witcher
              </h2>
            </div>
            <p className="text-xs text-[#8a929a] font-cormorant italic mt-0.5">
              Cintra, circa 1184 — Four legendary witcher schools roam the realm before Geralt's era.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[#8a929a] hover:text-white hover:bg-[#282e34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Witchers Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PREGEN_WITCHERS.map((witcher) => {
            const isSelected = selectedCharacter?.id === witcher.id;
            return (
              <div 
                key={witcher.id}
                className={`flex flex-col rounded-xl border bg-[#181a1d] overflow-hidden transition-all duration-300 relative group hover:border-[#c99a45] ${
                  isSelected 
                    ? 'border-[#c99a45] shadow-xl shadow-[#c99a45]/20 ring-1 ring-[#c99a45]' 
                    : 'border-[#2d333a] hover:shadow-lg'
                }`}
              >
                {/* Image Portrait */}
                <div className="relative h-60 w-full overflow-hidden bg-black">
                  <img 
                    src={witcher.avatarUrl} 
                    alt={witcher.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181a1d] via-transparent to-black/30" />

                  {/* School Badge */}
                  <div className={`absolute top-3 left-3 text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider backdrop-blur-md ${getSchoolColor(witcher.school)}`}>
                    School of the {witcher.school}
                  </div>

                  {/* Selected Tick */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-[#c99a45] text-black p-1 rounded-full shadow-lg">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {/* Witcher Name overlay */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="font-cinzel text-base font-bold text-white drop-shadow-md">
                      {witcher.name}
                    </h3>
                    <p className="text-[11px] text-[#c99a45] font-cormorant italic">
                      {witcher.title}
                    </p>
                  </div>
                </div>

                {/* Character Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  
                  {/* Quick Stats Strip */}
                  <div className="grid grid-cols-3 gap-1 bg-[#101214] p-2 rounded-lg border border-[#262b31] text-center text-xs">
                    <div>
                      <div className="text-[10px] text-[#717b85] font-cinzel">HP</div>
                      <div className="font-bold text-emerald-400">{witcher.maxHp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#717b85] font-cinzel">AC</div>
                      <div className="font-bold text-amber-300">{witcher.armorClass}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#717b85] font-cinzel">Vigor</div>
                      <div className="font-bold text-purple-300">{witcher.maxVigor}</div>
                    </div>
                  </div>

                  {/* School Perk */}
                  <div className="bg-[#121416] p-2.5 rounded-lg border border-[#252a30]">
                    <div className="flex items-center gap-1.5 text-xs font-cinzel text-[#e2ba6d] mb-1">
                      <Zap className="w-3.5 h-3.5 text-[#c99a45]" />
                      <span>{witcher.schoolPerk.name}</span>
                    </div>
                    <p className="text-[11px] text-[#8a929a] line-clamp-3 leading-relaxed">
                      {witcher.schoolPerk.description}
                    </p>
                  </div>

                  {/* Primary Silver Weapon */}
                  <div className="flex items-center gap-2 text-xs text-[#a6b1b9]">
                    <Sword className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{witcher.silverWeapon.name}</span>
                  </div>

                  {/* Backstory snippet */}
                  <p className="text-[11px] text-[#6b737c] font-cormorant italic line-clamp-2">
                    "{witcher.schoolMotto}"
                  </p>

                  {/* Choose Button */}
                  <button
                    onClick={() => {
                      onSelectCharacter(witcher);
                      onClose();
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#c99a45] text-black shadow-md shadow-[#c99a45]/30'
                        : 'bg-[#23282e] hover:bg-[#c99a45] text-white hover:text-black border border-[#343c44] hover:border-[#c99a45]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isSelected ? 'Currently Playing' : `Play ${witcher.school}`}</span>
                  </button>

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#15171a] border-t border-[#262b30] flex items-center justify-between text-xs text-[#8a929a]">
          <span>Pre-generated 5th-level Witcher characters adapted for D&D 5e</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252b31] hover:bg-[#323942] text-white rounded font-cinzel"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
