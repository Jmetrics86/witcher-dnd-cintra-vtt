import React, { useState, useRef } from 'react';
import { 
  Grid, 
  MapPin, 
  Trash2, 
  Compass,
  Image as ImageIcon,
  Map as MapIcon,
  UserPlus,
  Heart,
  Shield,
  X,
  Link as LinkIcon,
  Skull
} from 'lucide-react';
import { MapScene, MapToken, WitcherCharacter, StoryVisualOverlay, WitcherSchool } from '../types';
import { MAP_SCENES } from '../data/maps';
import { WITCHER_ADVENTURE } from '../data/adventure';
import { TokenSpawnerDrawer } from './TokenSpawnerDrawer';

interface TacticalMapProps {
  currentScene: MapScene;
  onSceneChange: (scene: MapScene) => void;
  tokens: MapToken[];
  onTokenMove: (tokenId: string, x: number, y: number) => void;
  onTokenAdd?: (token: MapToken, count?: number) => void;
  onTokenRemove?: (tokenId: string) => void;
  onTokenUpdate?: (updatedToken: MapToken) => void;
  onTokenHpChange?: (tokenId: string, delta: number) => void;
  onSetTokenHp?: (tokenId: string, targetHp: number) => void;
  onClearCategory?: (category: 'monsters' | 'npcs' | 'all') => void;
  onPing: (x: number, y: number) => void;
  pingLocation: { x: number, y: number } | null;
  isHost: boolean;
  selectedCharacter: WitcherCharacter | null;
  activeStoryVisual?: StoryVisualOverlay | null;
  onShowStoryVisual?: (visual: StoryVisualOverlay | null) => void;
  onOpenWitcherSheet?: (school: WitcherSchool) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  currentScene,
  onSceneChange,
  tokens,
  onTokenMove,
  onTokenAdd,
  onTokenRemove,
  onTokenUpdate,
  onTokenHpChange,
  onSetTokenHp,
  onClearCategory,
  onPing,
  pingLocation,
  isHost,
  selectedCharacter,
  activeStoryVisual = null,
  onShowStoryVisual,
  onOpenWitcherSheet,
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const [activeTool, setActiveTool] = useState<'move' | 'ping'>('move');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isSpawnerOpen, setIsSpawnerOpen] = useState(false);
  const [customHpDelta, setCustomHpDelta] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);

  // Find corresponding Act Story Visual for quick toggle
  const currentActStoryVisual = WITCHER_ADVENTURE.acts.find(
    (act) => act.act === currentScene.actNumber
  )?.storyVisuals?.[0];

  const selectedToken = tokens.find((t) => t.id === selectedTokenId);

  // Handle map canvas click
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (activeTool === 'ping') {
      onPing(x, y);
      return;
    }

    // If moving selected token, reposition it
    if (selectedTokenId) {
      onTokenMove(selectedTokenId, x, y);
      // Keep selected so user can adjust HP or see token info
    }
  };

  // Adjust token HP by delta (+ / -)
  const handleHpDelta = (tokenId: string, delta: number) => {
    if (onTokenHpChange) {
      onTokenHpChange(tokenId, delta);
    } else if (onTokenUpdate) {
      const target = tokens.find((t) => t.id === tokenId);
      if (!target) return;
      const newHp = Math.max(0, Math.min(target.maxHp, (target.currentHp ?? target.maxHp) + delta));
      onTokenUpdate({ ...target, currentHp: newHp });
    }
  };

  // Set absolute token HP
  const handleSetHp = (tokenId: string, targetHp: number) => {
    if (onSetTokenHp) {
      onSetTokenHp(tokenId, targetHp);
    } else if (onTokenUpdate) {
      const target = tokens.find((t) => t.id === tokenId);
      if (!target) return;
      const newHp = Math.max(0, Math.min(target.maxHp, targetHp));
      onTokenUpdate({ ...target, currentHp: newHp });
    }
  };

  // Apply custom entered HP damage/heal
  const handleApplyCustomHp = (isDamage: boolean) => {
    if (!selectedToken) return;
    const amount = parseInt(customHpDelta, 10);
    if (isNaN(amount) || amount <= 0) return;
    handleHpDelta(selectedToken.id, isDamage ? -amount : amount);
    setCustomHpDelta('');
  };

  return (
    <div className="bg-[#131517] border border-[#2e343b] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-0 relative select-none">
      
      {/* Top Map Bar: Cleaned Up Act Switcher & Primary Controls */}
      <div className="bg-[#181a1d] border-b border-[#282d33] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        
        {/* Act Scene Switcher (Compact Segmented Pills) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#121416] p-0.5 rounded-lg border border-[#282e35]">
            {MAP_SCENES.map((scene) => {
              const romans = ['I', 'II', 'III', 'IV'];
              const roman = romans[scene.actNumber - 1] || `${scene.actNumber}`;
              const isCurrent = currentScene.id === scene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => onSceneChange(scene)}
                  className={`px-2.5 py-1 rounded-md text-xs font-cinzel transition-all flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-[#c99a45] text-black font-bold shadow-sm'
                      : 'text-[#8a929a] hover:text-white hover:bg-[#1e2328]'
                  }`}
                  title={`Act ${scene.actNumber}: ${scene.name} (${scene.subtitle})`}
                >
                  <span>Act {roman}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#8a929a]">
            <span className="text-[#3a444e]">•</span>
            <span className="font-cinzel text-white text-[11px] truncate max-w-[200px]" title={currentScene.name}>
              {currentScene.name.split('—')[0]}
            </span>
          </div>
        </div>

        {/* Clean Right Actions Strip */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Tool: Move vs Ping */}
          <div className="flex bg-[#121416] p-0.5 rounded-lg border border-[#282e35]">
            <button
              onClick={() => setActiveTool('move')}
              className={`px-2.5 py-1 text-xs font-cinzel rounded flex items-center gap-1 transition-colors ${
                activeTool === 'move' ? 'bg-[#262c33] text-white font-bold' : 'text-[#8a929a] hover:text-white'
              }`}
              title="Select & Move Tokens"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Move</span>
            </button>
            <button
              onClick={() => setActiveTool('ping')}
              className={`px-2.5 py-1 text-xs font-cinzel rounded flex items-center gap-1 transition-colors ${
                activeTool === 'ping' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-[#8a929a] hover:text-white'
              }`}
              title="Ping Coordinates on Map"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ping</span>
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showGrid 
                ? 'bg-[#c99a45]/20 border-[#c99a45]/50 text-[#e2ba6d]' 
                : 'bg-[#121416] border-[#282e35] text-[#8a929a] hover:text-white'
            }`}
            title="Toggle Tactical Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Story Art Toggle */}
          {onShowStoryVisual && (
            activeStoryVisual ? (
              <button
                onClick={() => onShowStoryVisual(null)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-cinzel font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                title="Return to Battle Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            ) : currentActStoryVisual ? (
              <button
                onClick={() => onShowStoryVisual(currentActStoryVisual)}
                className="px-2.5 py-1 rounded-lg bg-[#16181b] hover:bg-[#20252b] border border-[#2b3137] text-[#c99a45] hover:text-[#e2ba6d] font-cinzel text-xs flex items-center gap-1 transition-all"
                title={`Show Act ${currentScene.actNumber} Story Scene Artwork`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#c99a45]" />
                <span className="hidden sm:inline">Story Art</span>
              </button>
            ) : null
          )}

          {/* GM Spawner Drawer Button */}
          {isHost && (
            <button
              onClick={() => setIsSpawnerOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-950/80 to-[#221013] hover:from-red-900 hover:to-[#38161b] border border-red-700/60 hover:border-red-500 text-red-200 hover:text-white text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Open Entity Spawner Drawer (Monsters, Witchers & NPCs)"
            >
              <UserPlus className="w-3.5 h-3.5 text-red-400" />
              <span>Spawn</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-900/60 text-[10px] text-red-300 font-mono">
                {tokens.length}
              </span>
            </button>
          )}
        </div>

      </div>

      {/* Main Interactive Map Canvas OR Story Visualization Theater */}
      <div className="relative flex-1 min-h-0 bg-[#0a0b0c] overflow-hidden select-none min-w-0">
        {activeStoryVisual ? (
          /* STORY VISUALIZATION VIEW */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-black">
            <img
              src={activeStoryVisual.imageUrl}
              alt={activeStoryVisual.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />

            <div className="relative z-10 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-[#c99a45]/60 backdrop-blur-md shadow-xl">
                <ImageIcon className="w-4 h-4 text-[#c99a45]" />
                <span className="font-cinzel font-bold text-xs text-[#e2ba6d] uppercase tracking-wider">
                  {activeStoryVisual.actNumber === 5 ? 'Epilogue Story Visualization' : `Act ${activeStoryVisual.actNumber} Story Visualization`}
                </span>
              </div>

              {onShowStoryVisual && (
                <button
                  onClick={() => onShowStoryVisual(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-black/80 hover:bg-[#1c2127] border border-white/20 text-white font-cinzel font-bold text-xs flex items-center gap-1.5 backdrop-blur-md shadow-xl transition-all"
                >
                  <MapIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Return to Tactical Battle Map</span>
                </button>
              )}
            </div>

            <div className="relative z-10 p-5 sm:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="max-w-3xl">
                <div className="text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-widest mb-1">
                  {activeStoryVisual.subtitle}
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white drop-shadow">
                  {activeStoryVisual.title}
                </h3>
                <p className="text-base sm:text-lg text-[#e6e1d6] font-cormorant italic mt-2 leading-relaxed drop-shadow">
                  “{activeStoryVisual.caption}”
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={mapRef}
            onClick={handleMapClick}
            className="relative w-full h-full cursor-crosshair overflow-hidden"
            style={{
              backgroundImage: `url(${currentScene.imageUrl})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay Vignette for Atmosphere */}
            <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(201, 154, 69, 0.12) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(201, 154, 69, 0.12) 1px, transparent 1px)
                  `,
                  backgroundSize: `${100 / currentScene.gridCols}% ${100 / currentScene.gridRows}%`,
                }}
              />
            )}

            {/* Map Ping Animation */}
            {pingLocation && (
              <div
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping pointer-events-none z-30"
                style={{ left: `${pingLocation.x}%`, top: `${pingLocation.y}%` }}
              />
            )}

            {/* Map Tokens */}
            {tokens.map((token) => {
              const isSelected = selectedTokenId === token.id;
              const isMyCharacter = selectedCharacter?.name === token.name;
              const currentHp = token.currentHp ?? token.maxHp;
              const hpPct = Math.max(0, Math.min(100, (currentHp / token.maxHp) * 100));
              const isDead = currentHp <= 0;

              return (
                <div
                  key={token.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTokenId(isSelected ? null : token.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (token.school && onOpenWitcherSheet) {
                      onOpenWitcherSheet(token.school);
                    }
                  }}
                  className={`absolute w-11 h-11 sm:w-12 sm:h-12 -ml-5 sm:-ml-6 -mt-5 sm:-mt-6 rounded-full cursor-pointer transition-transform duration-150 z-20 group ${
                    isSelected ? 'scale-125 ring-4 ring-[#c99a45] z-40' : 'hover:scale-110'
                  } ${isDead ? 'opacity-60 grayscale' : ''}`}
                  style={{
                    left: `${token.x}%`,
                    top: `${token.y}%`,
                  }}
                >
                  {/* Token Circular Avatar */}
                  <div className={`w-full h-full rounded-full overflow-hidden border-2 shadow-2xl relative bg-black ${
                    token.isMonster 
                      ? 'border-red-500' 
                      : isMyCharacter 
                      ? 'border-[#c99a45] ring-2 ring-[#c99a45]/60' 
                      : 'border-slate-400'
                  }`}>
                    <img
                      src={token.avatarUrl}
                      alt={token.name}
                      className="w-full h-full object-cover object-top pointer-events-none"
                    />

                    {isDead && (
                      <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center">
                        <Skull className="w-5 h-5 text-red-300" />
                      </div>
                    )}
                  </div>

                  {/* Enhanced Interactive HP Bar under token with Direct Quick Buttons */}
                  {token.maxHp && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
                      
                      {/* Direct -5 Quick Tap Button (visible on hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHpDelta(token.id, -5);
                        }}
                        className="w-4 h-4 rounded-full bg-rose-950 border border-rose-600 text-rose-300 text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-900 hover:scale-110 shadow-lg"
                        title="Quick -5 Damage"
                      >
                        -
                      </button>

                      {/* Health Meter Pill */}
                      <div className="w-10 sm:w-12 bg-black/90 rounded-full h-2 p-0.5 border border-white/30 overflow-hidden shadow">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDead 
                              ? 'bg-neutral-600'
                              : hpPct > 50 
                              ? 'bg-emerald-500' 
                              : hpPct > 20 
                              ? 'bg-amber-400' 
                              : 'bg-rose-600 animate-pulse'
                          }`}
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>

                      {/* Direct +5 Quick Tap Button (visible on hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHpDelta(token.id, 5);
                        }}
                        className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-900 hover:scale-110 shadow-lg"
                        title="Quick +5 Heal"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/95 text-white text-[10px] font-cinzel font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 shadow-xl flex items-center gap-1 z-40">
                    <span>{token.name}</span>
                    <span className="font-mono text-emerald-300 font-bold">({currentHp}/{token.maxHp} HP)</span>
                  </div>
                </div>
              );
            })}

            {/* FLOATING TOKEN HEALTH CONTROLLER & ACTION HUD */}
            {selectedToken && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 left-4 z-40 w-80 max-w-[calc(100vw-32px)] bg-[#101215]/95 border-2 border-[#c99a45] shadow-2xl rounded-xl p-3.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 text-[#d6d9dc]"
              >
                {/* HUD Header */}
                <div className="flex items-start justify-between gap-2.5 pb-2 border-b border-[#262c33]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={selectedToken.avatarUrl} 
                      alt={selectedToken.name} 
                      className="w-10 h-10 rounded-xl object-cover object-top border-2 shrink-0 shadow"
                      style={{ borderColor: selectedToken.color || '#c99a45' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-cinzel text-xs font-bold text-white truncate">
                          {selectedToken.name}
                        </span>
                        {selectedToken.school && (
                          <span className="text-[9px] font-cinzel px-1.5 py-0.2 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 font-bold flex items-center gap-0.5">
                            <LinkIcon className="w-2.5 h-2.5" />
                            <span>Linked Sheet</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8a929a] font-cormorant italic truncate mt-0.5">
                        {selectedToken.title || (selectedToken.isMonster ? 'Monstrous Creature' : 'Witcher Character')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTokenId(null)}
                    className="p-1 rounded-lg text-[#8a929a] hover:text-white hover:bg-[#1e2329] transition-colors"
                    title="Deselect token"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Health Meter & Visual Progress Bar */}
                <div className="py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-cinzel">
                    <span className="text-[#a0aab4] flex items-center gap-1 font-bold">
                      <Heart className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Health Meter</span>
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {selectedToken.currentHp ?? selectedToken.maxHp} <span className="text-[#6d7680]">/ {selectedToken.maxHp} HP</span>
                    </span>
                  </div>

                  <div className="w-full bg-[#1e2226] h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        (selectedToken.currentHp ?? selectedToken.maxHp) <= 0
                          ? 'bg-neutral-600'
                          : ((selectedToken.currentHp ?? selectedToken.maxHp) / selectedToken.maxHp) > 0.5 
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                          : ((selectedToken.currentHp ?? selectedToken.maxHp) / selectedToken.maxHp) > 0.2 
                          ? 'bg-amber-400' 
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, ((selectedToken.currentHp ?? selectedToken.maxHp) / selectedToken.maxHp) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Quick Health Buttons Grid */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-cinzel text-[#8a929a]">
                    <span className="text-rose-400 font-bold">Quick Damage:</span>
                    <span className="text-emerald-400 font-bold">Quick Heal:</span>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    {/* Quick Damage Buttons */}
                    <button
                      onClick={() => handleHpDelta(selectedToken.id, -10)}
                      className="py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold rounded transition-colors"
                      title="Deal 10 Damage"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleHpDelta(selectedToken.id, -5)}
                      className="py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold rounded transition-colors"
                      title="Deal 5 Damage"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleHpDelta(selectedToken.id, -1)}
                      className="py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold rounded transition-colors"
                      title="Deal 1 Damage"
                    >
                      -1
                    </button>

                    {/* Quick Heal Buttons */}
                    <button
                      onClick={() => handleHpDelta(selectedToken.id, 1)}
                      className="py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold rounded transition-colors"
                      title="Heal 1 HP"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleHpDelta(selectedToken.id, 5)}
                      className="py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold rounded transition-colors"
                      title="Heal 5 HP"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleHpDelta(selectedToken.id, 10)}
                      className="py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold rounded transition-colors"
                      title="Heal 10 HP"
                    >
                      +10
                    </button>
                  </div>

                  {/* Custom Exact Damage/Heal Input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="number"
                      value={customHpDelta}
                      onChange={(e) => setCustomHpDelta(e.target.value)}
                      placeholder="Custom amount..."
                      className="flex-1 px-2.5 py-1 bg-[#181a1d] border border-[#2d343c] rounded text-xs text-white placeholder-[#616a73] font-mono focus:outline-none focus:border-[#c99a45]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyCustomHp(true);
                      }}
                    />
                    <button
                      onClick={() => handleApplyCustomHp(true)}
                      className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-cinzel rounded font-bold transition-colors"
                      title="Apply as Damage"
                    >
                      Dmg
                    </button>
                    <button
                      onClick={() => handleApplyCustomHp(false)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-cinzel rounded font-bold transition-colors"
                      title="Apply as Heal"
                    >
                      Heal
                    </button>
                  </div>

                  {/* Fast Action Presets Row */}
                  <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#23282f] text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSetHp(selectedToken.id, selectedToken.maxHp)}
                        className="px-2 py-1 rounded bg-[#1c2024] hover:bg-[#252b31] border border-[#303841] text-emerald-300 text-[10px] font-cinzel flex items-center gap-1"
                        title="Restore to Full HP"
                      >
                        <Heart className="w-3 h-3 text-emerald-400" />
                        <span>Full HP</span>
                      </button>

                      <button
                        onClick={() => handleSetHp(selectedToken.id, 0)}
                        className="px-2 py-1 rounded bg-[#1c2024] hover:bg-[#252b31] border border-[#303841] text-rose-300 text-[10px] font-cinzel flex items-center gap-1"
                        title="Set HP to 0 (Unconscious or Defeated)"
                      >
                        <Skull className="w-3 h-3 text-rose-400" />
                        <span>0 HP</span>
                      </button>
                    </div>

                    {/* View Character Sheet Link for Witchers */}
                    {selectedToken.school && onOpenWitcherSheet && (
                      <button
                        onClick={() => onOpenWitcherSheet(selectedToken.school!)}
                        className="px-2.5 py-1 rounded bg-[#c99a45]/20 hover:bg-[#c99a45]/30 border border-[#c99a45]/50 text-[#e2ba6d] text-[10px] font-cinzel font-bold flex items-center gap-1 transition-colors"
                      >
                        <Shield className="w-3 h-3" />
                        <span>Open Sheet</span>
                      </button>
                    )}

                    {/* Remove Token for GMs */}
                    {isHost && onTokenRemove && (
                      <button
                        onClick={() => {
                          onTokenRemove(selectedToken.id);
                          setSelectedTokenId(null);
                        }}
                        className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white transition-colors"
                        title="Remove token from map"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-[#6f7882] font-mono text-center pt-0.5">
                    Click anywhere on the map to reposition token
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Bottom Scene Synopsis & Status Bar */}
      <div className="bg-[#151719] border-t border-[#282d33] px-3.5 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-white text-xs">{currentScene.name}</span>
            <span className="text-[11px] text-[#c99a45] font-cormorant italic truncate">{currentScene.subtitle}</span>
          </div>
          <p className="text-[11px] text-[#8a929a] line-clamp-1">
            {currentScene.description}
          </p>
        </div>

        {selectedTokenId && (
          <div className="text-[11px] text-amber-300 font-cinzel bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1.5 shrink-0 animate-pulse">
            <Compass className="w-3.5 h-3.5" />
            <span>Click map to move token</span>
          </div>
        )}
      </div>

      {/* Token Spawner Drawer Popup */}
      <TokenSpawnerDrawer
        isOpen={isSpawnerOpen}
        onClose={() => setIsSpawnerOpen(false)}
        onSpawnToken={(token, count) => {
          if (onTokenAdd) onTokenAdd(token, count);
        }}
        tokens={tokens}
        onRemoveToken={onTokenRemove}
        onClearCategory={onClearCategory}
        onUpdateTokenHp={handleHpDelta}
      />

    </div>
  );
};
