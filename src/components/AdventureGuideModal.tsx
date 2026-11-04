import React, { useState } from 'react';
import { X, Scroll, Clock, Compass, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { WITCHER_ADVENTURE } from '../data/adventure';

interface AdventureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdventureGuideModal: React.FC<AdventureGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeActNumber, setActiveActNumber] = useState<number>(1);
  const currentAct = WITCHER_ADVENTURE.acts.find((a) => a.act === activeActNumber) || WITCHER_ADVENTURE.acts[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131517] border border-[#3b4249] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1e]">
          <div className="flex items-center gap-2.5">
            <Scroll className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-cinzel text-lg font-bold text-white tracking-wide">
                {WITCHER_ADVENTURE.title}: {WITCHER_ADVENTURE.subtitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#8a929a] font-cormorant mt-0.5">
                <span className="flex items-center gap-1 text-amber-300">
                  <Clock className="w-3.5 h-3.5" /> {WITCHER_ADVENTURE.estimatedPlaytime}
                </span>
                <span>•</span>
                <span>{WITCHER_ADVENTURE.recommendedPlayers}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[#8a929a] hover:text-white hover:bg-[#282e34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acts Navigation Strip */}
        <div className="flex border-b border-[#282d33] bg-[#101214] px-4 overflow-x-auto">
          {WITCHER_ADVENTURE.acts.map((act) => (
            <button
              key={act.act}
              onClick={() => setActiveActNumber(act.act)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-cinzel border-b-2 transition-all whitespace-nowrap ${
                activeActNumber === act.act
                  ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                  : 'border-transparent text-[#8a929a] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Act {act.act}: {act.title.split(':')[1] || act.title}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveActNumber(5)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-cinzel border-b-2 transition-all whitespace-nowrap ${
              activeActNumber === 5
                ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                : 'border-transparent text-[#8a929a] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Epilogue & Choices</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#141619]">
          
          {activeActNumber <= 4 ? (
            <>
              {/* Act Header Banner */}
              <div className="bg-[#191c20] p-4 rounded-xl border border-[#2b3137]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-cinzel text-lg font-bold text-white">
                    {currentAct.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-600/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pacing Guide: {currentAct.timeEstimate}</span>
                  </div>
                </div>
                <div className="text-xs text-[#c99a45] font-cormorant italic mt-1">
                  Location: {currentAct.location}
                </div>
                <p className="text-xs text-[#a6b1b9] mt-2 leading-relaxed">
                  {currentAct.overview}
                </p>
              </div>

              {/* Read Aloud Box */}
              <div className="p-4 rounded-xl border border-amber-600/40 bg-gradient-to-br from-[#1a1814] to-[#141310] relative">
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#e2ba6d] uppercase tracking-wider mb-2">
                  <Scroll className="w-4 h-4 text-[#c99a45]" />
                  <span>Read Aloud to Players</span>
                </div>
                <p className="text-xs text-[#d6d9dc] font-cormorant italic leading-relaxed whitespace-pre-line text-[13px]">
                  {currentAct.readAloud}
                </p>
              </div>

              {/* GM Pacing & Roleplay Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31]">
                  <div className="font-cinzel text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>GM Running Notes & Prompts</span>
                  </div>
                  <ul className="text-xs text-[#8a929a] space-y-2 list-disc list-inside">
                    {currentAct.dmPrompts.map((prompt, i) => (
                      <li key={i}>{prompt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31]">
                  <div className="font-cinzel text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tactical Advice & Synergies</span>
                  </div>
                  <p className="text-xs text-[#8a929a] leading-relaxed">
                    {currentAct.tacticalAdvice}
                  </p>
                </div>
              </div>

              {/* Skill Check & DC Table */}
              <div>
                <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Witcher Senses & Investigation DCs
                </h4>
                <div className="border border-[#262b31] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#101214] text-[#8a929a] font-cinzel border-b border-[#262b31]">
                      <tr>
                        <th className="p-2.5">Check / Skill</th>
                        <th className="p-2.5 w-16">DC</th>
                        <th className="p-2.5">Information Learned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2226] bg-[#141618]">
                      {currentAct.investigationDCs.map((dc, i) => (
                        <tr key={i} className="hover:bg-[#1a1c20]">
                          <td className="p-2.5 font-semibold text-white">{dc.check}</td>
                          <td className="p-2.5 font-mono text-[#c99a45] font-bold">DC {dc.dc}</td>
                          <td className="p-2.5 text-[#8a929a]">{dc.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* EPILOGUE & THREE PATHS */
            <div className="space-y-5">
              <div className="bg-[#191c20] p-4 rounded-xl border border-[#2b3137]">
                <h3 className="font-cinzel text-lg font-bold text-white">
                  {WITCHER_ADVENTURE.epilogue.title}
                </h3>
                <p className="text-xs text-[#a6b1b9] mt-1 leading-relaxed">
                  The battle is won, but the moral consequences define the legacy of these four witchers. Let the party discuss their choice before returning to the civilized realm.
                </p>
              </div>

              <div className="space-y-4">
                {WITCHER_ADVENTURE.epilogue.choices.map((choice, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                    <h4 className="font-cinzel text-sm font-bold text-[#e2ba6d]">
                      {choice.name}
                    </h4>
                    <p className="text-xs text-white leading-relaxed">
                      {choice.description}
                    </p>
                    <div className="text-xs text-[#8a929a] bg-black/40 p-2.5 rounded border border-white/5">
                      <span className="font-semibold text-emerald-400">Outcome & Consequences: </span>
                      {choice.consequences}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#15171a] border-t border-[#262b30] flex items-center justify-between">
          <span className="text-xs text-[#717b85] font-cormorant italic">
            Keep scenes snappy: 45 min per act delivers an unforgettable 4-hour game session.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252b31] hover:bg-[#323942] text-white rounded font-cinzel text-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
