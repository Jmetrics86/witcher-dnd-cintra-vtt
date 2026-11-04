import React, { useState } from 'react';
import { X, Wifi, Shield, Copy, Check, Users, HelpCircle } from 'lucide-react';

interface P2PModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  isConnected: boolean;
  peerCount: number;
  statusText: string;
  onConnectHost: (roomCode: string) => Promise<void>;
  onConnectClient: (roomCode: string, playerName: string) => Promise<void>;
  onDisconnect: () => void;
  playerName: string;
}

export const P2PModal: React.FC<P2PModalProps> = ({
  isOpen,
  onClose,
  isHost,
  isConnected,
  peerCount,
  statusText,
  onConnectHost,
  onConnectClient,
  onDisconnect,
  playerName,
}) => {
  const [activeMode, setActiveMode] = useState<'host' | 'join'>('host');
  const [roomCode, setRoomCode] = useState('cintra-hunt');
  const [inputName, setInputName] = useState(playerName || 'Geralt-Era Tracker');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await onConnectHost(roomCode.trim());
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not create room. Try a different code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await onConnectClient(roomCode.trim(), inputName.trim() || 'Witcher Companion');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to connect to host. Ensure room code matches.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const fullRoomId = roomCode.trim().toLowerCase();
    navigator.clipboard.writeText(fullRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151719] border border-[#3b4249] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2f35] bg-[#1a1d21]">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-5 h-5 text-[#c99a45]" />
            <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
              Multiplayer P2P Network
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[#8a929a] hover:text-white hover:bg-[#282e34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Current Connection Status Banner */}
          <div className={`p-4 rounded-lg border text-sm flex items-start gap-3 ${
            isConnected 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-[#1e2226] border-[#313840] text-[#a6b1b9]'
          }`}>
            <Shield className={`w-5 h-5 mt-0.5 shrink-0 ${isConnected ? 'text-emerald-400' : 'text-[#8a929a]'}`} />
            <div className="flex-1">
              <div className="font-semibold font-cinzel">
                {isConnected ? (isHost ? 'Active Game Master Host' : 'Connected to GM Session') : 'Peer-to-Peer Standby'}
              </div>
              <p className="text-xs text-[#8a929a] mt-0.5">{statusText || 'Direct browser-to-browser WebRTC connection with zero server data storage.'}</p>
              {isConnected && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    Connected Peers: {peerCount + (isHost ? 1 : 0)}
                  </span>
                  <button 
                    onClick={onDisconnect}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {!isConnected && (
            <div className="flex rounded-lg bg-[#111315] p-1 border border-[#2e343b]">
              <button
                type="button"
                onClick={() => setActiveMode('host')}
                className={`flex-1 py-2 text-xs font-cinzel rounded-md transition-all font-semibold flex items-center justify-center gap-2 ${
                  activeMode === 'host'
                    ? 'bg-[#c99a45] text-black shadow-md'
                    : 'text-[#8a929a] hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Host as Game Master
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('join')}
                className={`flex-1 py-2 text-xs font-cinzel rounded-md transition-all font-semibold flex items-center justify-center gap-2 ${
                  activeMode === 'join'
                    ? 'bg-[#c99a45] text-black shadow-md'
                    : 'text-[#8a929a] hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                Join as Witcher Player
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Forms */}
          {!isConnected ? (
            activeMode === 'host' ? (
              <form onSubmit={handleHost} className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                    Choose Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="e.g. cintra-hunt or wolf-pack-7"
                    className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors"
                  />
                  <p className="text-[11px] text-[#717b85] mt-1">
                    Share this room code with up to 4 other players so they can join your VTT.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-sm rounded-lg transition-all shadow-lg shadow-[#c99a45]/20 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Room...' : 'Start Game Master Session'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                    Player Name / Handle
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Vane the Wolf"
                    className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors mb-3"
                  />

                  <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                    Game Master's Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter Host's Room Code"
                    className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-sm rounded-lg transition-all shadow-lg shadow-[#c99a45]/20 disabled:opacity-50"
                >
                  {isLoading ? 'Connecting to Room...' : 'Join Witcher Party'}
                </button>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#0d0e10] border border-[#2a2f35] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#717b85] uppercase font-cinzel">Current Room Code</div>
                  <div className="text-sm font-mono text-[#c99a45] font-bold">{roomCode}</div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252b31] hover:bg-[#323942] rounded text-xs text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="text-xs text-[#8a929a] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-cinzel">
                  <HelpCircle className="w-3.5 h-3.5 text-[#c99a45]" />
                  <span>How P2P Sync Works</span>
                </div>
                <p>
                  Every dice roll, character stat modification, token move on the battle map, and combat sign cast is automatically synchronized across all players via direct WebRTC data channels!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#121416] border-t border-[#262b30] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#22272c] hover:bg-[#2e353c] text-xs font-cinzel text-[#d6d9dc] rounded-md transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
