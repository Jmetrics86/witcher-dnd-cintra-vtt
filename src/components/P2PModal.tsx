import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Shield,
  Copy,
  Check,
  Users,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  UserX,
  Link2,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Crown,
  Sword,
  AlertTriangle,
} from 'lucide-react';
import { ConnectedPeerInfo } from '../services/peerService';
import { PREGEN_WITCHERS } from '../data/characters';
import { CharacterAssignment } from '../types';

interface P2PModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  isConnected: boolean;
  peerCount: number;
  connectedPeers: ConnectedPeerInfo[];
  statusText: string;
  onConnectHost: (
    roomCode: string,
    pin: string,
    gmPlaysWitcher: boolean,
    gmCharacterId?: string
  ) => Promise<void>;
  onConnectClient: (roomCode: string, playerName: string, pin: string) => Promise<void>;
  onDisconnect: () => void;
  onKickPeer: (peerId: string) => void;
  isRoomLocked: boolean;
  onToggleRoomLock: (locked: boolean) => void;
  onForceSyncPeers?: () => void;
  playerName: string;
  initialRoomFromUrl?: string;
  onOpenInstructions?: () => void;
  gmPlaysWitcher: boolean;
  onToggleGmPlaysWitcher: (plays: boolean, characterId?: string) => void;
  characterAssignments: Record<string, CharacterAssignment>;
  selectedCharacterId?: string;
}

export const P2PModal: React.FC<P2PModalProps> = ({
  isOpen,
  onClose,
  isHost,
  isConnected,
  peerCount: _peerCount,
  connectedPeers,
  statusText,
  onConnectHost,
  onConnectClient,
  onDisconnect,
  onKickPeer,
  isRoomLocked,
  onToggleRoomLock,
  onForceSyncPeers,
  playerName,
  initialRoomFromUrl,
  onOpenInstructions,
  gmPlaysWitcher,
  onToggleGmPlaysWitcher,
  characterAssignments,
  selectedCharacterId,
}) => {
  const [activeMode, setActiveMode] = useState<'host' | 'join'>(
    initialRoomFromUrl ? 'join' : 'host'
  );
  const [roomCode, setRoomCode] = useState(initialRoomFromUrl || 'cintra-hunt');
  const [roomPin, setRoomPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [inputName, setInputName] = useState(playerName || 'Vane of Kaer Morhen');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // GM play-along role & character choice
  const [localGmPlays, setLocalGmPlays] = useState<boolean>(gmPlaysWitcher);
  const [localGmCharId, setLocalGmCharId] = useState<string>(
    selectedCharacterId || PREGEN_WITCHERS[0].id
  );

  useEffect(() => {
    setLocalGmPlays(gmPlaysWitcher);
  }, [gmPlaysWitcher]);

  useEffect(() => {
    if (selectedCharacterId) {
      setLocalGmCharId(selectedCharacterId);
    }
  }, [selectedCharacterId]);

  // Player count calculation (No denominator! Counts active Witcher players)
  const gmPlayerCount = gmPlaysWitcher ? 1 : 0;
  const peerPlayersCount = connectedPeers.filter((p) => !p.isObserver).length;
  const lockedAssignmentsCount = Object.values(characterAssignments).filter((a) => a.isLocked).length;

  const totalPlayersInRoom = isConnected
    ? Math.max(gmPlayerCount + peerPlayersCount, lockedAssignmentsCount || (gmPlaysWitcher ? 1 : 0))
    : 0;

  const observersCount = connectedPeers.filter((p) => p.isObserver).length;
  const isPartyFullForGm = totalPlayersInRoom >= 4;

  useEffect(() => {
    if (initialRoomFromUrl) {
      setRoomCode(initialRoomFromUrl);
      setActiveMode('join');
    }
  }, [initialRoomFromUrl]);

  useEffect(() => {
    if (playerName) {
      setInputName(playerName);
    }
  }, [playerName]);

  if (!isOpen) return null;

  const generateRandomPin = () => {
    const array = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
      const pin = (100000 + (array[0] % 900000)).toString();
      setRoomPin(pin);
      setShowPin(true);
    } else {
      setRoomPin(Math.floor(100000 + Math.random() * 900000).toString());
      setShowPin(true);
    }
  };

  const handleHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await onConnectHost(
        roomCode.trim(),
        roomPin.trim(),
        localGmPlays,
        localGmPlays ? localGmCharId : undefined
      );
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
      await onConnectClient(
        roomCode.trim(),
        inputName.trim() || 'Witcher Companion',
        roomPin.trim()
      );
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Failed to connect to host. Ensure Room Code and PIN match.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    const cleanCode = roomCode.trim().toLowerCase();
    const textToCopy = roomPin.trim()
      ? `Room Code: ${cleanCode} | Secret PIN: ${roomPin.trim()}`
      : cleanCode;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = () => {
    const cleanCode = encodeURIComponent(roomCode.trim().toLowerCase());
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const inviteUrl = `${baseUrl}?room=${cleanCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151719] border border-[#3b4249] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2f35] bg-[#1a1d21] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#c99a45]" />
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white tracking-wide leading-tight">
                Encrypted P2P Multiplayer
              </h3>
              <p className="text-[11px] text-[#8a929a]">
                AES-256-GCM End-to-End Encrypted WebRTC DataChannel
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

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Current Connection Status Banner */}
          <div
            className={`p-4 rounded-lg border text-sm flex items-start gap-3 ${
              isConnected
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-[#1e2226] border-[#313840] text-[#a6b1b9]'
            }`}
          >
            <Shield
              className={`w-5 h-5 mt-0.5 shrink-0 ${
                isConnected ? 'text-emerald-400' : 'text-[#c99a45]'
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold font-cinzel text-white">
                  {isConnected
                    ? isHost
                      ? 'Active Game Master Host (Authoritative)'
                      : 'Verified Witcher Client'
                    : 'Peer-to-Peer Security Ready'}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs text-[#8a929a] mt-1">
                {statusText ||
                  'Zero-server WebRTC architecture. Signaling IDs are SHA-256 hashed and packets are encrypted end-to-end.'}
              </p>
              {isConnected && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-black/40 px-2.5 py-1 rounded border border-white/10 text-white flex items-center gap-2">
                      <Sword className="w-3.5 h-3.5 text-[#c99a45]" />
                      <span>
                        {totalPlayersInRoom} {totalPlayersInRoom === 1 ? 'Player' : 'Players'} in Room
                        {isHost && !gmPlaysWitcher ? ' (Narrator Host)' : isHost ? ' (GM Playing)' : ''}
                      </span>
                      {observersCount > 0 && (
                        <span className="text-blue-300 border-l border-white/20 pl-2 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span>
                            {observersCount} {observersCount === 1 ? 'Observer' : 'Observers'}
                          </span>
                        </span>
                      )}
                    </span>
                    {roomPin && (
                      <span className="text-[11px] font-mono bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PIN Protected
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onDisconnect}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-500/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs (When Disconnected) */}
          {!isConnected && (
            <div className="flex rounded-lg bg-[#111315] p-1 border border-[#2e343b]">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('host');
                  setErrorMsg('');
                }}
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
                onClick={() => {
                  setActiveMode('join');
                  setErrorMsg('');
                }}
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
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Forms (When Disconnected) */}
          {!isConnected ? (
            activeMode === 'host' ? (
              <form onSubmit={handleHost} className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="e.g. cintra-hunt or wolf-pack-7"
                    className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#c99a45]" />
                      Room Secret PIN / Passphrase (Recommended)
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPin}
                      className="text-[11px] text-[#c99a45] hover:text-[#e2ba6d] flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate 6-Digit PIN
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={roomPin}
                      onChange={(e) => setRoomPin(e.target.value)}
                      placeholder="Optional PIN for SHA-256 broker obfuscation & E2EE key..."
                      className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717b85] hover:text-white"
                      title={showPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#717b85] mt-1.5 leading-relaxed">
                    Setting a PIN hides your room on the public WebRTC signaling server using SHA-256 and derives a unique 256-bit AES-GCM key so only players with your PIN can connect.
                  </p>
                </div>

                {/* GM Role Option: Pure Narrator vs Play Along as a Witcher */}
                <div className="space-y-3 p-3.5 bg-[#0e1012] border border-[#2b3137] rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-cinzel text-white uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Crown className="w-3.5 h-3.5 text-[#c99a45]" />
                      Game Master Role in Session
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c99a45]/15 text-[#e2ba6d] border border-[#c99a45]/30">
                      {localGmPlays ? '1 GM + 3 Players' : '4 Player Slots'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Pure Narrator */}
                    <button
                      type="button"
                      onClick={() => setLocalGmPlays(false)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        !localGmPlays
                          ? 'bg-[#1e2329] border-[#c99a45] shadow-md shadow-[#c99a45]/10 ring-1 ring-[#c99a45]'
                          : 'bg-[#121416] border-[#292f35] text-[#8a929a] hover:border-[#38414b]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-white mb-1">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pure Narrator</span>
                      </div>
                      <p className="text-[10px] text-[#8a929a] leading-tight">
                        Spectator & Arbiter only. All 4 Witchers open for joining players.
                      </p>
                    </button>

                    {/* Option 2: Play Along */}
                    <button
                      type="button"
                      disabled={isPartyFullForGm}
                      onClick={() => {
                        if (!isPartyFullForGm) setLocalGmPlays(true);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        isPartyFullForGm
                          ? 'bg-[#121416] border-[#22252a] text-[#555d65] cursor-not-allowed opacity-60'
                          : localGmPlays
                          ? 'bg-[#1e2329] border-[#c99a45] shadow-md shadow-[#c99a45]/10 ring-1 ring-[#c99a45]'
                          : 'bg-[#121416] border-[#292f35] text-[#8a929a] hover:border-[#38414b]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-white mb-1">
                        <Sword className="w-3.5 h-3.5 text-[#c99a45]" />
                        <span>Play a Witcher</span>
                      </div>
                      <p className="text-[10px] text-[#8a929a] leading-tight">
                        {isPartyFullForGm
                          ? '4 players in game — selection not permitted.'
                          : 'Takes 1 slot. Play alongside your party.'}
                      </p>
                    </button>
                  </div>

                  {/* If Playing Along & Party Full */}
                  {localGmPlays && isPartyFullForGm && (
                    <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        4 players are already in the session. Character selection is not permitted.
                      </span>
                    </div>
                  )}

                  {/* If Playing Along & Slots Available: Offer Remaining Characters! */}
                  {localGmPlays && !isPartyFullForGm && (
                    <div className="pt-2.5 space-y-2 border-t border-[#23282e]">
                      <div className="text-[11px] font-cinzel text-[#a6b1b9] flex items-center justify-between">
                        <span className="font-semibold text-white">Choose Your Witcher (Takes 1 Slot):</span>
                        <span className="text-[10px] text-[#717b85]">Only remaining characters open</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PREGEN_WITCHERS.map((char) => {
                          const assignment = characterAssignments[char.id];
                          const isClaimedByPlayer = Boolean(
                            assignment &&
                              assignment.isLocked &&
                              assignment.claimedByPeerId !== 'gm'
                          );
                          const isSelectedByGm = localGmCharId === char.id;

                          return (
                            <button
                              key={char.id}
                              type="button"
                              disabled={isClaimedByPlayer}
                              onClick={() => setLocalGmCharId(char.id)}
                              className={`p-2 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all relative ${
                                isClaimedByPlayer
                                  ? 'bg-[#101214] border-[#202428] text-[#555d65] cursor-not-allowed opacity-50'
                                  : isSelectedByGm
                                  ? 'bg-[#1f242a] border-[#c99a45] ring-2 ring-[#c99a45]/60 text-white shadow-md'
                                  : 'bg-[#141619] border-[#2b3137] text-[#8a929a] hover:border-[#c99a45]'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c99a45]/40 relative">
                                <img
                                  src={char.avatarUrl}
                                  alt={char.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-center w-full">
                                <div className="text-[11px] font-cinzel font-bold text-white truncate">
                                  {char.school}
                                </div>
                                <div className="text-[9px] text-[#717b85] truncate">
                                  {isClaimedByPlayer
                                    ? `Taken`
                                    : isSelectedByGm
                                    ? '✓ Selected'
                                    : 'Available'}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-sm rounded-lg transition-all shadow-lg shadow-[#c99a45]/20 disabled:opacity-50"
                >
                  {isLoading ? 'Initializing Encrypted Host...' : 'Start Secure Game Master Session'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                    Your Witcher Name / Handle
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Vane of Kaer Morhen"
                    className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                      GM's Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="e.g. cintra-hunt"
                      className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-cinzel text-[#a6b1b9] uppercase tracking-wider mb-1.5">
                      Room PIN (If Set by GM)
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={roomPin}
                        onChange={(e) => setRoomPin(e.target.value)}
                        placeholder="Leave blank if none"
                        className="w-full bg-[#0d0e10] border border-[#333a42] rounded-lg pl-3.5 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-[#c99a45] transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717b85] hover:text-white"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-sm rounded-lg transition-all shadow-lg shadow-[#c99a45]/20 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying Handshake...' : 'Authenticate & Join Witcher Party'}
                </button>
              </form>
            )
          ) : (
            /* Active Session Controls & Lobby Roster */
            <div className="space-y-4">
              {/* Shareable Room Code & Invite Link */}
              <div className="p-3.5 bg-[#0d0e10] border border-[#2a2f35] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#717b85] uppercase font-cinzel">
                      Active Room Credentials
                    </div>
                    <div className="text-sm font-mono text-[#c99a45] font-bold flex items-center gap-2 mt-0.5">
                      <span>{roomCode}</span>
                      {roomPin && (
                        <span className="text-xs text-[#a6b1b9] font-normal">
                          (PIN: {showPin ? roomPin : '••••••'})
                        </span>
                      )}
                      {roomPin && (
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="text-[#717b85] hover:text-white"
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#252b31] hover:bg-[#323942] rounded text-xs text-white transition-colors"
                      title="Copy Room Code & PIN"
                    >
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCode ? 'Copied' : 'Code'}</span>
                    </button>
                    <button
                      onClick={handleCopyInviteLink}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#c99a45]/20 hover:bg-[#c99a45]/30 border border-[#c99a45]/40 rounded text-xs text-[#e2ba6d] transition-colors"
                      title="Copy Direct Invite Link"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink ? 'Link Copied!' : 'Invite Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active GM Role Indicator & Switch */}
              {isHost && (
                <div className="p-3 bg-[#0d0e10] border border-[#2a2f35] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#717b85] uppercase font-cinzel">Current Game Master Role</div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5 mt-0.5">
                      {gmPlaysWitcher ? (
                        <>
                          <Sword className="w-3.5 h-3.5 text-[#c99a45]" />
                          <span>Playing as Witcher (Takes 1 Slot)</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pure Narrator (4 Slots for Players)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!gmPlaysWitcher && isPartyFullForGm}
                    onClick={() => {
                      if (gmPlaysWitcher) {
                        onToggleGmPlaysWitcher(false);
                      } else if (!isPartyFullForGm) {
                        onToggleGmPlaysWitcher(true, localGmCharId);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded text-xs font-cinzel transition-all border ${
                      !gmPlaysWitcher && isPartyFullForGm
                        ? 'bg-[#15171a] border-[#292e34] text-[#555d65] cursor-not-allowed'
                        : 'bg-[#1e2329] hover:bg-[#282f37] border-[#38404a] text-[#c99a45] hover:text-[#e2ba6d]'
                    }`}
                    title={
                      !gmPlaysWitcher && isPartyFullForGm
                        ? '4 players in game. Character selection not permitted.'
                        : gmPlaysWitcher
                        ? 'Switch to Narrator Mode (Frees your Witcher slot)'
                        : 'Take 1 slot and play a Witcher'
                    }
                  >
                    {gmPlaysWitcher ? 'Switch to Narrator' : isPartyFullForGm ? 'Party Full (4 Players)' : 'Play a Witcher'}
                  </button>
                </div>
              )}

              {/* Host-Only Lobby Security & Player Roster */}
              {isHost && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-cinzel uppercase tracking-wider text-[#a6b1b9]">
                        Party Roster ({totalPlayersInRoom} {totalPlayersInRoom === 1 ? 'Player' : 'Players'})
                      </span>
                      {observersCount > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span>
                            {observersCount} {observersCount === 1 ? 'Observer' : 'Observers'}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {onForceSyncPeers && (
                        <button
                          type="button"
                          onClick={onForceSyncPeers}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#1e2329] hover:bg-[#2a3038] text-[#d6d9dc] border border-[#343b44] transition-colors"
                          title="Push authoritative map, tokens, and chat log to all players"
                        >
                          <RefreshCw className="w-3 h-3 text-[#c99a45]" />
                          <span>Sync All</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleRoomLock(!isRoomLocked)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                          isRoomLocked
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                            : 'bg-[#1e2329] border-[#343b44] text-[#a6b1b9] hover:text-white'
                        }`}
                      >
                        {isRoomLocked ? (
                          <>
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>Room Locked</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Lock Room</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {connectedPeers.length === 0 ? (
                    <div className="p-4 rounded-lg bg-[#0d0e10] border border-[#24292e] text-center text-xs text-[#717b85]">
                      Waiting for Witchers to authenticate and join the lobby...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connectedPeers.map((peer) => (
                        <div
                          key={peer.peerId}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0e10] border border-[#2a2f35]"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                peer.isObserver ? 'bg-blue-400' : 'bg-emerald-400'
                              } animate-pulse`}
                            />
                            <div>
                              <div className="text-xs font-semibold text-white flex items-center gap-2">
                                <span>{peer.playerName}</span>
                                {peer.isObserver ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-blue-400" />
                                    <span>Observer</span>
                                  </span>
                                ) : peer.school ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c99a45]/15 text-[#c99a45] border border-[#c99a45]/30">
                                    School of the {peer.school}
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    Player (Selecting)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#717b85] font-mono flex items-center gap-2">
                                <span>E2EE Verified</span>
                                {peer.latencyMs !== undefined && (
                                  <span>• {peer.latencyMs} ms</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onKickPeer(peer.peerId)}
                            className="p-1.5 rounded bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 text-[11px]"
                            title="Remove player from session"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Kick</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Security Architecture Summary */}
              <div className="p-3 rounded-lg bg-[#111315] border border-[#252a30] text-[11px] text-[#8a929a] space-y-1.5">
                <div className="font-cinzel text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active P2P Security Protections</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[#7c858e]">
                  <li>
                    <strong className="text-[#a6b1b9]">AES-256-GCM E2EE:</strong> All packets are encrypted via PBKDF2-derived keys with per-packet 96-bit IVs and replay nonces.
                  </li>
                  <li>
                    <strong className="text-[#a6b1b9]">Host Privilege Enforcement:</strong> Only the Game Master can switch maps, spawn/remove monsters, or broadcast state syncs.
                  </li>
                  <li>
                    <strong className="text-[#a6b1b9]">SHA-256 Signaling & Rate Guard:</strong> Broker IDs are hashed and clients are rate-limited to prevent packet flooding.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#121416] border-t border-[#262b30] flex items-center justify-between shrink-0">
          {onOpenInstructions ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInstructions();
              }}
              className="text-xs text-[#c99a45] hover:text-[#e2ba6d] flex items-center gap-1.5 transition-colors font-cinzel hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to Play & GM Guide →</span>
            </button>
          ) : <div />}
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
