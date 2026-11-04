import React from 'react';
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
  HardDrive
} from 'lucide-react';
import { WitcherCharacter, MapScene } from '../types';

interface NavbarProps {
  selectedCharacter: WitcherCharacter | null;
  currentScene: MapScene;
  isConnected: boolean;
  isHost: boolean;
  peerCount: number;
  statusText: string;
  onOpenP2PModal: () => void;
  onOpenGuideModal: () => void;
  onOpenBestiaryModal: () => void;
  onOpenCharacterSelect: () => void;
  onOpenNotionModal: () => void;
  onOpenGMModal: () => void;
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
  peerCount,
  statusText,
  onOpenP2PModal,
  onOpenGuideModal,
  onOpenBestiaryModal,
  onOpenCharacterSelect,
  onOpenNotionModal,
  onOpenGMModal,
  onToggleDiceTray,
  isDiceTrayOpen,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-[#111315]/95 border-b border-[#2e3338] sticky top-0 z-40 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand & Witcher Seal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#c99a45] bg-[#1a1c1e] flex items-center justify-center shadow-lg shadow-black/50 overflow-hidden relative group">
            {selectedCharacter ? (
              <img 
                src={selectedCharacter.avatarUrl} 
                alt={selectedCharacter.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            ) : (
              <Sparkles className="w-5 h-5 text-[#c99a45]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-sm sm:text-base font-bold gold-gradient-text tracking-wider">
                THE BLOOD OF MARNADAL
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40">
                Cintra 1184
              </span>
            </div>
            <p className="text-xs text-[#8a929a] font-cormorant italic hidden sm:block">
              Witcher 5e Multiplayer VTT • {currentScene.name}
            </p>
          </div>
        </div>

        {/* Center: Main View Tabs */}
        <div className="flex items-center gap-1 bg-[#191c1f] p-1 rounded-lg border border-[#2b3136]">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-cinzel transition-all ${
              activeTab === 'map'
                ? 'bg-[#c99a45] text-black font-bold shadow-md shadow-[#c99a45]/20'
                : 'text-[#a6b1b9] hover:text-white hover:bg-[#252a2f]'
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
                : 'text-[#a6b1b9] hover:text-white hover:bg-[#252a2f]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Witcher</span> Sheet
          </button>

          <button
            onClick={onOpenBestiaryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-cinzel text-[#a6b1b9] hover:text-white hover:bg-[#252a2f] transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Bestiary</span>
          </button>

          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-cinzel text-[#a6b1b9] hover:text-white hover:bg-[#252a2f] transition-all"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">4hr Module</span>
          </button>

          <button
            onClick={onOpenNotionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-cinzel text-[#c99a45] hover:text-[#e2ba6d] hover:bg-[#252a2f] transition-all"
            title="Auto-generate Notion Campaign Wiki"
          >
            <FileText className="w-3.5 h-3.5 text-[#c99a45]" />
            <span className="hidden lg:inline">Notion Wiki</span>
          </button>
        </div>

        {/* Right: Network Status, Character Switcher & Dice Tray */}
        <div className="flex items-center gap-2">
          {/* P2P Multiplayer Button */}
          <button
            onClick={onOpenP2PModal}
            title={statusText}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-cinzel transition-all ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-[#191c1f] border-[#363d44] text-[#8a929a] hover:text-white hover:border-[#c99a45]/50'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-[#8a929a]" />
            )}
            <span className="hidden sm:inline">
              {isHost ? 'Host' : isConnected ? 'Joined' : 'P2P Room'}
            </span>
            {isConnected && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                {peerCount + (isHost ? 1 : 0)}p
              </span>
            )}
          </button>

          {/* GM Local Storage & Backup Button */}
          <button
            onClick={onOpenGMModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-[#191c1f] border border-[#2b3136] text-[#a6b1b9] hover:text-white hover:border-[#c99a45] transition-all flex items-center gap-1.5 text-xs font-cinzel"
            title="Campaign Auto-Save & Local Backup"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#c99a45]" />
            <span className="hidden xl:inline">GM Save</span>
          </button>

          {/* Switch Witcher Button */}
          <button
            onClick={onOpenCharacterSelect}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-[#191c1f] border border-[#2b3136] text-[#c99a45] hover:bg-[#252a2f] hover:border-[#c99a45] transition-all flex items-center gap-1 text-xs font-cinzel"
            title="Choose or Switch Witcher"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{selectedCharacter?.school || 'Select'} Witcher</span>
          </button>

          {/* Dice Tray Toggle */}
          <button
            onClick={onToggleDiceTray}
            className={`p-2 rounded-md border transition-all ${
              isDiceTrayOpen
                ? 'bg-[#c99a45] text-black border-[#c99a45] shadow-lg shadow-[#c99a45]/30'
                : 'bg-[#191c1f] border-[#2b3136] text-[#a6b1b9] hover:text-white hover:border-[#c99a45]'
            }`}
            title="Toggle Dice Roller Tray"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
