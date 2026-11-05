import React, { useState, useRef } from 'react';
import { 
  Grid, 
  MapPin, 
  Trash2, 
  Compass,
  Image as ImageIcon,
  Map as MapIcon,
  EyeOff,
  UserPlus
} from 'lucide-react';
import { MapScene, MapToken, WitcherCharacter, StoryVisualOverlay } from '../types';
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
  onClearCategory?: (category: 'monsters' | 'npcs' | 'all') => void;
  onPing: (x: number, y: number) => void;
  pingLocation: { x: number, y: number } | null;
  isHost: boolean;
  selectedCharacter: WitcherCharacter | null;
  activeStoryVisual?: StoryVisualOverlay | null;
  onShowStoryVisual?: (visual: StoryVisualOverlay | null) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  currentScene,
  onSceneChange,
  tokens,
  onTokenMove,
  onTokenAdd,
  onTokenRemove,
  onTokenUpdate,
  onClearCategory,
  onPing,
  pingLocation,
  isHost,
  selectedCharacter,
  activeStoryVisual = null,
  onShowStoryVisual,
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const [activeTool, setActiveTool] = useState<'move' | 'ping'>('move');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isSpawnerOpen, setIsSpawnerOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Find corresponding Act Story Visual for quick toggle
  const currentActStoryVisual = WITCHER_ADVENTURE.acts.find(
    (act) => act.act === currentScene.actNumber
  )?.storyVisuals?.[0];

  // Handle map click
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (activeTool === 'ping') {
      onPing(x, y);
      return;
    }

    // If moving selected token
    if (selectedTokenId) {
      onTokenMove(selectedTokenId, x, y);
      setSelectedTokenId(null);
    }
  };

  // Update token HP
  const handleUpdateTokenHp = (tokenId: string, delta: number) => {
    const target = tokens.find((t) => t.id === tokenId);
    if (!target) return;
    const newHp = Math.max(0, Math.min(target.maxHp, (target.currentHp ?? target.maxHp) + delta));
    if (onTokenUpdate) {
      onTokenUpdate({ ...target, currentHp: newHp });
    }
  };

  return (
    <div className="bg-[#131517] border border-[#2e343b] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-0">
      
      {/* Top Map Bar: Scene Selector & GM Tools */}
      <div className="bg-[#181a1d] border-b border-[#282d33] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Scene Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {MAP_SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSceneChange(scene)}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel transition-all shrink-0 flex items-center gap-1.5 ${
                currentScene.id === scene.id
                  ? 'bg-[#c99a45] text-black font-bold shadow-md shadow-[#c99a45]/20'
                  : 'bg-[#121416] text-[#8a929a] hover:text-white border border-[#2b3137]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Act {scene.actNumber}: {scene.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Tactical Controls & Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Story Visualization Mode Toggle (Shows Story Art Instead of Battle Map) */}
          {onShowStoryVisual && (
            activeStoryVisual ? (
              <button
                onClick={() => onShowStoryVisual(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                title="Hide Story Visualization and return to the gridded Tactical Battle Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Return to Battle Map</span>
              </button>
            ) : currentActStoryVisual ? (
              <button
                onClick={() => onShowStoryVisual(currentActStoryVisual)}
                className="px-2.5 py-1 rounded-lg bg-[#c99a45]/20 hover:bg-[#c99a45]/30 border border-[#c99a45]/50 text-[#e2ba6d] font-cinzel font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Show Act Story Visualization Artwork to all players instead of the battle map"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Show Act {currentScene.actNumber} Story Image</span>
              </button>
            ) : null
          )}

          {/* Tool: Move vs Ping */}
          <div className="flex bg-[#121416] p-0.5 rounded-md border border-[#2b3137]">
            <button
              onClick={() => setActiveTool('move')}
              className={`px-2.5 py-1 text-xs font-cinzel rounded ${
                activeTool === 'move' ? 'bg-[#282f36] text-white font-bold' : 'text-[#8a929a]'
              }`}
            >
              Select / Move
            </button>
            <button
              onClick={() => setActiveTool('ping')}
              className={`px-2.5 py-1 text-xs font-cinzel rounded flex items-center gap-1 ${
                activeTool === 'ping' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-[#8a929a]'
              }`}
            >
              <MapPin className="w-3 h-3" />
              Ping
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded border transition-colors ${
              showGrid 
                ? 'bg-[#c99a45]/20 border-[#c99a45]/50 text-[#e2ba6d]' 
                : 'bg-[#121416] border-[#2b3137] text-[#8a929a]'
            }`}
            title="Toggle Tactical Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* GM Spawner Drawer Button */}
          {isHost && (
            <button
              onClick={() => setIsSpawnerOpen(true)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-red-950/80 via-[#271216] to-[#1c0f12] hover:from-red-900 hover:to-[#38161b] border border-red-700/60 hover:border-red-500 text-red-200 hover:text-white text-xs font-cinzel font-bold rounded-lg shadow-md shadow-red-950/40 flex items-center gap-1.5 transition-all group"
              title="Open Entity Spawner Drawer (Monsters, Witchers & NPCs)"
            >
              <UserPlus className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Spawn Tokens</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-900/60 text-[10px] text-red-300 border border-red-700/40 font-mono">
                {tokens.length}
              </span>
            </button>
          )}
        </div>

      </div>

      {/* Main Interactive Map Canvas OR Story Visualization Theater */}
      <div className="relative flex-1 min-h-0 bg-[#0a0b0c] overflow-hidden select-none min-w-0">
        {activeStoryVisual ? (
          /* STORY VISUALIZATION VIEW (Replaces Battle Map when active) */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-black">
            <img
              src={activeStoryVisual.imageUrl}
              alt={activeStoryVisual.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />

            {/* Top Story Mode Badge & Return Button */}
            <div className="relative z-10 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-[#c99a45]/60 backdrop-blur-md shadow-xl">
                <ImageIcon className="w-4 h-4 text-[#c99a45]" />
                <span className="font-cinzel font-bold text-xs text-[#e2ba6d] uppercase tracking-wider">
                  {activeStoryVisual.actNumber === 5
                    ? 'Epilogue Story Visualization'
                    : `Act ${activeStoryVisual.actNumber} Story Visualization`}
                </span>
              </div>

              {onShowStoryVisual && (
                <button
                  onClick={() => onShowStoryVisual(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-black/80 hover:bg-[#1c2127] border border-white/20 text-white font-cinzel font-bold text-xs flex items-center gap-1.5 backdrop-blur-md shadow-xl transition-all"
                >
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Return to Tactical Battle Map</span>
                </button>
              )}
            </div>

            {/* Bottom Atmospheric Narrative Plaque */}
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

            return (
              <div
                key={token.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTokenId(isSelected ? null : token.id);
                }}
                className={`absolute w-11 h-11 sm:w-12 sm:h-12 -ml-5 sm:-ml-6 -mt-5 sm:-mt-6 rounded-full cursor-pointer transition-transform duration-150 z-20 group ${
                  isSelected ? 'scale-125 ring-4 ring-amber-400 z-40' : 'hover:scale-110'
                }`}
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
                </div>

                {/* HP Bar under token */}
                {token.maxHp && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-10 sm:w-12 bg-black/80 rounded-full h-1.5 p-0.5 border border-white/20 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${token.isMonster ? 'bg-red-500' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, ((token.currentHp || token.maxHp) / token.maxHp) * 100)}%` }}
                    />
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-cinzel font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg">
                  {token.name} {token.currentHp !== undefined ? `(${token.currentHp}/${token.maxHp})` : ''}
                </div>

                {/* Host Delete token button */}
                {isHost && isSelected && onTokenRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTokenRemove(token.id);
                      setSelectedTokenId(null);
                    }}
                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow-lg"
                    title="Remove token"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

        </div>
        )}
      </div>

      {/* Bottom Scene Synopsis & GM Notes */}
      <div className="bg-[#151719] border-t border-[#282d33] p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-white text-xs">{currentScene.name}</span>
            <span className="text-[11px] text-[#c99a45] font-cormorant italic">{currentScene.subtitle}</span>
          </div>
          <p className="text-[11px] text-[#8a929a] mt-0.5 line-clamp-1">
            {currentScene.description}
          </p>
        </div>

        {selectedTokenId && (
          <div className="text-[11px] text-amber-300 font-cinzel bg-amber-950/40 px-3 py-1 rounded border border-amber-500/30 animate-pulse">
            Click anywhere on map to reposition token
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
        onUpdateTokenHp={handleUpdateTokenHp}
      />

    </div>
  );
};
