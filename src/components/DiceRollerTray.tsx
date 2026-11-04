import React, { useState } from 'react';
import { Dices, Plus, Minus, X } from 'lucide-react';
import { playDiceRollSound } from '../utils/audio';

interface DiceRollerTrayProps {
  isOpen: boolean;
  onClose: () => void;
  onRoll: (title: string, formula: string, modifier: number, rollMode?: 'normal' | 'advantage' | 'disadvantage') => void;
}

export const DiceRollerTray: React.FC<DiceRollerTrayProps> = ({
  isOpen,
  onClose,
  onRoll,
}) => {
  const [modifier, setModifier] = useState<number>(0);
  const [rollMode, setRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');

  if (!isOpen) return null;

  const handleRollDie = (sides: number) => {
    playDiceRollSound();
    onRoll(`Rolled d${sides}`, `1d${sides}`, modifier, rollMode);
  };

  const handlePresetRoll = (title: string, formula: string, mod: number) => {
    playDiceRollSound();
    onRoll(title, formula, mod, rollMode);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-[#15171a] border border-[#373f47] rounded-xl shadow-2xl p-4 w-80 animate-slideUp backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#282d33] mb-3">
        <div className="flex items-center gap-2">
          <Dices className="w-4 h-4 text-[#c99a45]" />
          <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
            Witcher Dice Tray
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#8a929a] hover:text-white hover:bg-[#252b31] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Advantage / Disadvantage Mode */}
      <div className="grid grid-cols-3 gap-1 bg-[#0f1113] p-1 rounded-lg border border-[#262b31] mb-3 text-[11px] font-cinzel">
        <button
          onClick={() => setRollMode('normal')}
          className={`py-1 rounded transition-colors ${
            rollMode === 'normal' ? 'bg-[#293037] text-white font-bold' : 'text-[#8a929a] hover:text-white'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setRollMode('advantage')}
          className={`py-1 rounded transition-colors ${
            rollMode === 'advantage' ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 font-bold' : 'text-[#8a929a] hover:text-white'
          }`}
        >
          Advantage
        </button>
        <button
          onClick={() => setRollMode('disadvantage')}
          className={`py-1 rounded transition-colors ${
            rollMode === 'disadvantage' ? 'bg-rose-900/60 border border-rose-500/50 text-rose-300 font-bold' : 'text-[#8a929a] hover:text-white'
          }`}
        >
          Disadvantage
        </button>
      </div>

      {/* Standard Dice Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'd20', sides: 20, color: 'text-amber-400 border-amber-500/30' },
          { label: 'd12', sides: 12, color: 'text-red-400 border-red-500/30' },
          { label: 'd10', sides: 10, color: 'text-purple-400 border-purple-500/30' },
          { label: 'd8', sides: 8, color: 'text-sky-400 border-sky-500/30' },
          { label: 'd6', sides: 6, color: 'text-emerald-400 border-emerald-500/30' },
          { label: 'd4', sides: 4, color: 'text-yellow-400 border-yellow-500/30' },
          { label: 'd100', sides: 100, color: 'text-pink-400 border-pink-500/30' },
          { label: '2d6', sides: 6, customFormula: '2d6', color: 'text-orange-400 border-orange-500/30' },
        ].map((dice) => (
          <button
            key={dice.label}
            onClick={() => {
              if (dice.customFormula) {
                handlePresetRoll(`Rolled ${dice.customFormula}`, dice.customFormula, modifier);
              } else {
                handleRollDie(dice.sides);
              }
            }}
            className={`py-2 px-1 rounded-lg border bg-[#191c20] hover:bg-[#252b31] transition-all font-mono font-bold text-xs flex flex-col items-center justify-center ${dice.color}`}
          >
            <span>{dice.label}</span>
          </button>
        ))}
      </div>

      {/* Modifier Adjuster */}
      <div className="flex items-center justify-between bg-[#101214] p-2 rounded-lg border border-[#252b30] mb-3 text-xs">
        <span className="font-cinzel text-[#8a929a]">Modifier:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModifier((m) => m - 1)}
            className="p-1 rounded bg-[#20252b] hover:bg-[#2d343c] text-white"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-mono font-bold text-white w-8 text-center">
            {modifier >= 0 ? `+${modifier}` : modifier}
          </span>
          <button
            onClick={() => setModifier((m) => m + 1)}
            className="p-1 rounded bg-[#20252b] hover:bg-[#2d343c] text-white"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Preset Quick Rolls */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-cinzel text-[#717b85] tracking-wider">
          Quick Witcher Rolls
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            onClick={() => handlePresetRoll('Initiative Roll', '1d20', 4)}
            className="py-1.5 px-2 rounded bg-[#1e2227] hover:bg-[#282f36] text-[#a6b1b9] hover:text-white border border-[#2f363e] font-cinzel text-left truncate"
          >
            ⚡ Initiative (+4)
          </button>
          <button
            onClick={() => handlePresetRoll('Witcher Senses Check', '1d20', 8)}
            className="py-1.5 px-2 rounded bg-[#1e2227] hover:bg-[#282f36] text-[#a6b1b9] hover:text-white border border-[#2f363e] font-cinzel text-left truncate"
          >
            👁️ Senses (+8)
          </button>
        </div>
      </div>

    </div>
  );
};
