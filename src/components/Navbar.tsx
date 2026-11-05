import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  BookOpen, 
  Scroll, 
  Users, 
  Dices, 
  Wifi, 
  WifiOff, 
  Sparkles,
  Map as MapIcon,
  FileText,
  HardDrive,
  HelpCircle,
  Lock,
  Crown,
  ChevronDown,
  Layers,
  Coins
} from 'lucide-react';
import { WitcherCharacter, MapScene } from '../types';

interface NavbarProps {
  selectedCharacter: WitcherCharacter | null;
  currentScene: MapScene;
  isConnected: boolean;
  isHost: boolean;
  gmPlaysWitcher?: boolean;
  peerCount: number;
  totalPlayersInRoom?: number;
  observersCount?: number;
  statusText: string;
  isCharacterLocked?: boolean;
  onOpenP2PModal: () => void;
  onOpenGuideModal: () => void;
  onOpenBestiaryModal: () => void;
  onOpenCharacterSelect: () => void;
  onOpenNotionModal: () => void;
  onOpenGMModal: () => void;
  onOpenInstructionsModal: () => void;
  onOpenDMInventoryModal?: () => void;
  onToggleDiceTray: () => void;
  isDiceTrayOpen: boolean;
  activeTab: 'map' | 'sheet' | 'bestiary' | 'guide';
  setActiveTab: (tab: 'map' | 'sheet' | 'bestiary' | 'guide') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCharacter,
  currentScene,
  isConnected,
  isHost,
  gmPlaysWitcher,
  peerCount,
  totalPlayersInRoom,
  observersCount,
  statusText,
  isCharacterLocked,
  onOpenP2PModal,
  onOpenGuideModal,
  onOpenBestiaryModal,
  onOpenCharacterSelect,
  onOpenNotionModal,
  onOpenGMModal,
  onOpenInstructionsModal,
  onOpenDMInventoryModal,
  onToggleDiceTray,
  isDiceTrayOpen,
  activeTab,
  setActiveTab,
}) => {
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const compendiumRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (compendiumRef.current && !compendiumRef.current.contains(e.target as Node)) {
        setIsCompendiumOpen(false);
      }
    };
    if (isCompendiumOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCompendiumOpen]);

  return (
    <header className="bg-[#111315]/95 border-b border-[#2e3338] sticky top-0 z-40 backdrop-blur-md px-3 sm:px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Brand & Witcher Seal */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-full border border-[#c99a45] bg-[#1a1c1e] flex items-center justify-center shadow-lg shadow-black/50 overflow-hidden relative group">
            {selectedCharacter ? (
              <img 
                src={selectedCharacter.avatarUrl} 
                alt={selectedCharacter.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            ) : (
              <Sparkles className="w-4 h-4 text-[#c99a45]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-bold gold-gradient-text tracking-wider">
                THE BLOOD OF MARNADAL
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 hidden md:inline">
                Cintra 1184
              </span>
            </div>
            <p className="text-[11px] text-[#8a929a] font-cormorant italic hidden sm:block">
              Act {currentScene.actNumber}: {currentScene.name.split('—')[0]}
            </p>
          </div>
        </div>

        {/* Center: Clean Core Views & Consolidated Compendium Dropdown */}
        <div className="flex items-center gap-1.5">
          {/* Primary View Switcher: Map vs Sheet */}
          <div className="flex items-center gap-1 bg-[#16181b] p-1 rounded-lg border border-[#2b3137]">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-cinzel transition-all ${
                activeTab === 'map'
                  ? 'bg-[#c99a45] text-black font-bold shadow-md shadow-[#c99a45]/20'
                  : 'text-[#a6b1b9] hover:text-white hover:bg-[#22272d]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-cinzel transition-all ${
                activeTab === 'sheet'
                  ? 'bg-[#c99a45] text-black font-bold shadow-md shadow-[#c99a45]/20'
                  : 'text-[#a6b1b9] hover:text-white hover:bg-[#22272d]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Witcher Sheet</span>
            </button>
          </div>

          {/* Consolidated Compendium & Guides Dropdown */}
          <div className="relative" ref={compendiumRef}>
            <button
              onClick={() => setIsCompendiumOpen(!isCompendiumOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel border transition-all ${
                isCompendiumOpen
                  ? 'bg-[#1e2227] text-[#e2ba6d] border-[#c99a45]'
                  : 'bg-[#16181b] text-[#b0b8c0] border-[#2b3137] hover:text-white hover:border-[#3e4652]'
              }`}
              title="Open Compendium, Module, Bestiary & Rules"
            >
              <Layers className="w-3.5 h-3.5 text-[#c99a45]" />
              <span className="hidden sm:inline">Compendium</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCompendiumOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popover */}
            {isCompendiumOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-[#141619] border border-[#2e353e] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-cinzel font-bold text-[#7a838d] uppercase tracking-wider border-b border-[#22272d] mb-1">
                  Adventure & Campaign Guides
                </div>

                {/* 4hr Module */}
                <button
                  onClick={() => {
                    setIsCompendiumOpen(false);
                    onOpenGuideModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-cinzel text-[#d6d9dc] hover:text-white hover:bg-[#1e2329] transition-colors group"
                >
                  <Scroll className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-white group-hover:text-[#e2ba6d]">4-Hour Adventure Module</div>
                    <div className="text-[10px] text-[#78828c] font-mono">The Blood of Marnadal (Acts I–IV)</div>
                  </div>
                </button>

                {/* Bestiary */}
                <button
                  onClick={() => {
                    setIsCompendiumOpen(false);
                    onOpenBestiaryModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-cinzel text-[#d6d9dc] hover:text-white hover:bg-[#1e2329] transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-red-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-white group-hover:text-red-300">Bestiary & Monster Tactics</div>
                    <div className="text-[10px] text-[#78828c] font-mono">Stats, Oils & Vulnerabilities</div>
                  </div>
                </button>

                {/* How to Play & GM */}
                <button
                  onClick={() => {
                    setIsCompendiumOpen(false);
                    onOpenInstructionsModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-cinzel text-[#d6d9dc] hover:text-white hover:bg-[#1e2329] transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 text-[#c99a45] shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-white group-hover:text-[#e2ba6d]">How to Play & GM Rules</div>
                    <div className="text-[10px] text-[#78828c] font-mono">Dice, Signs & Mechanics Guide</div>
                  </div>
                </button>

                {/* Notion Wiki */}
                <button
                  onClick={() => {
                    setIsCompendiumOpen(false);
                    onOpenNotionModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-cinzel text-[#d6d9dc] hover:text-white hover:bg-[#1e2329] transition-colors group"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-white group-hover:text-emerald-300">Campaign Notion Wiki</div>
                    <div className="text-[10px] text-[#78828c] font-mono">Export Markdown Session Logs</div>
                  </div>
                </button>

                {/* GM Screen Inventory & Reward Vault */}
                {isHost && onOpenDMInventoryModal && (
                  <div className="border-t border-[#22272d] my-1 pt-1">
                    <button
                      onClick={() => {
                        setIsCompendiumOpen(false);
                        onOpenDMInventoryModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-cinzel text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/30 transition-colors group"
                    >
                      <Coins className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-amber-300 group-hover:text-amber-200">DM Inventory & Vault</div>
                        <div className="text-[10px] text-amber-400/80 font-mono">Finite Gold, Swords & Rewards</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* GM Save & Local Backup (Host Only) */}
                {isHost && (
                  <div className="border-t border-[#22272d] my-1 pt-1">
                    <button
                      onClick={() => {
                        setIsCompendiumOpen(false);
                        onOpenGMModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-cinzel text-[#d6d9dc] hover:text-white hover:bg-[#1e2329] transition-colors group"
                    >
                      <HardDrive className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-white group-hover:text-sky-300">GM Save & Local Backup</div>
                        <div className="text-[10px] text-[#78828c] font-mono">Campaign State Management</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Character Switcher, P2P Status & Dice Tray */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Active Witcher / Role Indicator */}
          <button
            onClick={onOpenCharacterSelect}
            className="px-2.5 py-1.5 rounded-lg bg-[#16181b] border border-[#2b3137] text-[#c99a45] hover:bg-[#20252b] hover:border-[#c99a45] transition-all flex items-center gap-2 text-xs font-cinzel"
            title={
              isHost
                ? !gmPlaysWitcher
                  ? 'Game Master in Narrator Mode (Click to manage roster or play a Witcher)'
                  : 'Game Master Playing Witcher (Click to manage character roster)'
                : isCharacterLocked
                ? 'Your character is locked. Only the GM can reassign characters.'
                : 'Select and lock your Witcher'
            }
          >
            {isHost && !gmPlaysWitcher ? (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            ) : isCharacterLocked && !isHost ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Users className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline font-bold">
              {isHost && !gmPlaysWitcher
                ? 'GM (Narrator)'
                : `${selectedCharacter?.school || 'Select'}`}
            </span>
            {selectedCharacter && (isHost ? gmPlaysWitcher : true) && (
              <span className="text-[10px] font-mono text-emerald-400 hidden lg:inline">
                ({selectedCharacter.currentHp} HP)
              </span>
            )}
          </button>

          {/* DM Vault Direct Button for Host */}
          {isHost && onOpenDMInventoryModal && (
            <button
              onClick={onOpenDMInventoryModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-cinzel font-bold shadow transition-colors"
              title="Open DM Screen Inventory & Reward Vault"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">DM Vault</span>
            </button>
          )}

          {/* P2P Multiplayer Button */}
          <button
            onClick={onOpenP2PModal}
            title={statusText}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-cinzel transition-all ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-[#16181b] border-[#2b3137] text-[#8a929a] hover:text-white hover:border-[#c99a45]/50'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-[#8a929a]" />
            )}
            <span className="hidden sm:inline">
              {isHost ? 'Host' : isConnected ? 'Joined' : 'P2P'}
            </span>
            {isConnected && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/30 font-mono">
                {totalPlayersInRoom !== undefined
                  ? `${totalPlayersInRoom}p${observersCount ? ` + ${observersCount}obs` : ''}`
                  : `${peerCount + (isHost ? 1 : 0)}p`}
              </span>
            )}
          </button>

          {/* Dice Tray Drawer Toggle */}
          <button
            onClick={onToggleDiceTray}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              isDiceTrayOpen
                ? 'bg-[#c99a45] text-black border-[#c99a45] shadow-lg shadow-[#c99a45]/30 font-bold'
                : 'bg-[#16181b] border-[#2b3137] text-[#a6b1b9] hover:text-white hover:border-[#c99a45]'
            }`}
            title="Toggle Interactive Dice Tray"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-cinzel">Dice</span>
          </button>
        </div>

      </div>
    </header>
  );
};
