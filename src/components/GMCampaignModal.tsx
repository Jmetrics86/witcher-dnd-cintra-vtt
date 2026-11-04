import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Share2, 
  ShieldCheck, 
  HardDrive,
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';
import { MapToken, ChatMessage, MapScene, WitcherCharacter } from '../types';
import { storageService, CampaignSaveState } from '../services/storageService';

interface GMCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  tokens: MapToken[];
  messages: ChatMessage[];
  currentScene: MapScene;
  selectedCharacter: WitcherCharacter;
  onLoadCampaignState: (savedState: CampaignSaveState) => void;
  onForceSyncPeers: () => void;
  onResetCampaign: () => void;
}

export const GMCampaignModal: React.FC<GMCampaignModalProps> = ({
  isOpen,
  onClose,
  isHost,
  tokens,
  messages,
  currentScene,
  selectedCharacter,
  onLoadCampaignState,
  onForceSyncPeers,
  onResetCampaign,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    storageService.exportSaveFile({
      currentSceneId: currentScene.id,
      tokens,
      messages,
      selectedCharacterId: selectedCharacter.id,
    });
    setSuccessMsg('Campaign save file downloaded successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadError(null);
    try {
      const parsed = await storageService.parseSaveFile(file);
      onLoadCampaignState(parsed);
      setSuccessMsg(`Successfully restored campaign from ${file.name}!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to read save file. Ensure valid JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141619] border border-[#384048] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#242b32] border border-[#c99a45]/40 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-[#c99a45]" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                Game Master Local Storage & Backup
              </h3>
              <p className="text-xs text-[#8a929a] font-cormorant italic">
                All campaign state is stored in your local browser and synced P2P to players.
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

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Status Banner */}
          <div className="bg-[#101214] p-4 rounded-xl border border-[#2a3036] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-cinzel font-bold text-white text-sm">
                Host-Authoritative Local Client Storage
              </div>
              <p className="text-[#8a929a] mt-1 leading-relaxed">
                When running from GitHub Pages, there is no database server required. Your browser is the authoritative host. All token positions, HP changes, scene transitions, and voice transcripts are continuously auto-saved to your machine.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-mono text-[#a6b1b9]">
                <span className="bg-[#191d22] px-2 py-0.5 rounded border border-[#2b333c]">
                  Active Scene: {currentScene.name}
                </span>
                <span className="bg-[#191d22] px-2 py-0.5 rounded border border-[#2b333c]">
                  Tokens: {tokens.length}
                </span>
                <span className="bg-[#191d22] px-2 py-0.5 rounded border border-[#2b333c]">
                  Chronicle: {messages.length} lines
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loadError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Export Backup File */}
            <button
              onClick={handleExport}
              className="p-3.5 rounded-xl border border-[#313840] bg-[#16181b] hover:bg-[#1e2227] hover:border-[#c99a45] transition-all text-left flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="font-cinzel text-xs font-bold text-white">
                  Export Campaign File
                </div>
                <div className="text-[11px] text-[#8a929a] mt-0.5">
                  Download .json save file to your hard drive.
                </div>
              </div>
            </button>

            {/* Load Backup File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl border border-[#313840] bg-[#16181b] hover:bg-[#1e2227] hover:border-[#c99a45] transition-all text-left flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="font-cinzel text-xs font-bold text-white">
                  Load Campaign File
                </div>
                <div className="text-[11px] text-[#8a929a] mt-0.5">
                  Restore campaign from a previously saved file.
                </div>
              </div>
            </button>

            {/* Force Sync Peers */}
            <button
              onClick={onForceSyncPeers}
              disabled={!isHost}
              className="p-3.5 rounded-xl border border-[#313840] bg-[#16181b] hover:bg-[#1e2227] hover:border-[#c99a45] transition-all text-left flex items-start gap-3 group disabled:opacity-40"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-cinzel text-xs font-bold text-white">
                  Broadcast State to Peers
                </div>
                <div className="text-[11px] text-[#8a929a] mt-0.5">
                  Push your current map and tokens to all players.
                </div>
              </div>
            </button>

            {/* Reset Campaign */}
            <button
              onClick={() => {
                if (window.confirm('Reset campaign back to Act I? Current local progress will be cleared.')) {
                  onResetCampaign();
                  setSuccessMsg('Campaign reset to initial state.');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }
              }}
              className="p-3.5 rounded-xl border border-rose-900/30 bg-[#16181b] hover:bg-rose-950/20 hover:border-rose-600/50 transition-all text-left flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-cinzel text-xs font-bold text-rose-300">
                  Reset Campaign
                </div>
                <div className="text-[11px] text-[#8a929a] mt-0.5">
                  Clear local storage and restart at Act I.
                </div>
              </div>
            </button>

          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* GitHub Pages Host Info */}
          <div className="p-3 bg-[#0d0e10] rounded-lg border border-[#23272d] text-[11px] text-[#717b85] space-y-1">
            <span className="font-cinzel text-[#c99a45] font-bold block">
              How P2P Player Access Works:
            </span>
            <p>
              1. As Game Master, host a room from GitHub Pages using any Room Code.
            </p>
            <p>
              2. Share your GitHub Pages link and Room Code with up to 4 players.
            </p>
            <p>
              3. When players join, your browser transmits the live campaign state (maps, tokens, and chronicle) straight from your local client over encrypted WebRTC data channels!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#121416] border-t border-[#262b30] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252b31] hover:bg-[#323942] text-xs font-cinzel text-white rounded transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
