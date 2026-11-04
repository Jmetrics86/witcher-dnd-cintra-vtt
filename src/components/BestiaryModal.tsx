import React, { useState } from 'react';
import { X, BookOpen, AlertTriangle, ShieldAlert, Sparkles, Sword } from 'lucide-react';
import { Monster } from '../types';
import { MONSTERS } from '../data/monsters';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawnMonster?: (monster: Monster) => void;
  isHost?: boolean;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  isOpen,
  onClose,
  onSpawnMonster,
  isHost,
}) => {
  const [selectedMonster, setSelectedMonster] = useState<Monster>(MONSTERS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131517] border border-[#3b4249] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1e]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="font-cinzel text-lg font-bold text-white tracking-wide">
                Witcher Bestiary: Monstrum of Cintra
              </h2>
              <p className="text-xs text-[#8a929a] font-cormorant italic">
                Scholarly classifications, weaknesses, and signs for primeval beasts.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[#8a929a] hover:text-white hover:bg-[#282e34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Monster List */}
          <div className="w-full md:w-64 border-r border-[#262b31] bg-[#101214] overflow-y-auto p-3 space-y-1.5 shrink-0">
            {MONSTERS.map((monster) => {
              const isSelected = selectedMonster.id === monster.id;
              return (
                <button
                  key={monster.id}
                  onClick={() => setSelectedMonster(monster)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#c99a45] bg-[#1f2328] shadow-md'
                      : 'border-[#23272d] bg-[#141618] hover:bg-[#1a1c1f] text-[#8a929a] hover:text-white'
                  }`}
                >
                  <img
                    src={monster.imageUrl}
                    alt={monster.name}
                    className="w-10 h-10 rounded-md object-cover border border-[#3b4249] shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="font-cinzel text-xs font-bold text-white truncate">
                      {monster.name}
                    </div>
                    <div className="text-[10px] text-red-400 font-mono">
                      {monster.category} • CR {monster.cr.split(' ')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Monster Inspection Card */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#141619]">
            
            {/* Top Monster Card Banner */}
            <div className="flex flex-col sm:flex-row gap-5 items-start bg-[#191c20] p-4 rounded-xl border border-[#2b3137]">
              <img
                src={selectedMonster.imageUrl}
                alt={selectedMonster.name}
                className="w-full sm:w-44 h-44 rounded-lg object-cover border border-[#444d57] shadow-xl shrink-0"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-700/50 uppercase">
                      {selectedMonster.category}
                    </span>
                    <h3 className="font-cinzel text-xl font-bold text-white mt-1">
                      {selectedMonster.name}
                    </h3>
                    <p className="text-xs text-[#c99a45] font-cormorant italic">
                      {selectedMonster.title}
                    </p>
                  </div>

                  {isHost && onSpawnMonster && (
                    <button
                      onClick={() => onSpawnMonster(selectedMonster)}
                      className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-600/50 rounded text-xs font-cinzel transition-all shadow"
                    >
                      + Spawn on Battle Map
                    </button>
                  )}
                </div>

                {/* Stat Strip */}
                <div className="grid grid-cols-3 gap-2 mt-4 bg-[#111315] p-2.5 rounded-lg border border-[#252a30] text-center text-xs">
                  <div>
                    <div className="text-[10px] text-[#717b85] font-cinzel">Armor Class</div>
                    <div className="font-bold text-white">{selectedMonster.ac}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#717b85] font-cinzel">Hit Points</div>
                    <div className="font-bold text-red-400">{selectedMonster.hp}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#717b85] font-cinzel">Challenge</div>
                    <div className="font-bold text-amber-300">{selectedMonster.cr}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Witcher Vulnerabilities (The Most Critical Section) */}
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20">
              <div className="flex items-center gap-2 font-cinzel text-xs font-bold text-red-300 mb-2 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Known Vulnerabilities & Witcher Preparations</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedMonster.vulnerabilities.map((vuln, i) => (
                  <li key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded border border-red-900/30 text-[#e2ba6d]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attacks & Actions */}
            <div>
              <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sword className="w-3.5 h-3.5 text-[#c99a45]" />
                <span>Attacks & Actions</span>
              </h4>
              <div className="space-y-2">
                {selectedMonster.attacks.map((atk) => (
                  <div key={atk.name} className="p-3 bg-[#111315] border border-[#252a30] rounded-lg text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-white">{atk.name}</span>
                      <span className="font-mono text-red-300">+{atk.bonus} to hit | {atk.damage} ({atk.damageType})</span>
                    </div>
                    <p className="text-[#8a929a] mt-1 text-[11px]">{atk.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Witcher Field Tactics */}
            <div className="p-4 rounded-xl border border-[#2e343b] bg-[#111315]">
              <div className="font-cinzel text-xs font-bold text-[#c99a45] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#c99a45]" />
                <span>Hunter's Tactical Guide</span>
              </div>
              <p className="text-xs text-[#a6b1b9] leading-relaxed">
                {selectedMonster.witcherTactics}
              </p>
            </div>

            {/* Lore */}
            <div className="text-xs text-[#717b85] font-cormorant italic border-t border-[#252a30] pt-3">
              "{selectedMonster.lore}"
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#15171a] border-t border-[#262b30] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252b31] hover:bg-[#323942] text-white rounded font-cinzel text-xs"
          >
            Close Bestiary
          </button>
        </div>

      </div>
    </div>
  );
};
