import React, { useState } from 'react';
import {
  X,
  Check,
  Shield,
  Zap,
  Sparkles,
  Sword,
  Lock,
  Unlock,
  Crown,
  UserCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { WitcherCharacter, WitcherSchool, CharacterAssignment } from '../types';
import { PREGEN_WITCHERS } from '../data/characters';
import { ConnectedPeerInfo } from '../services/peerService';

interface CharacterSelectProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: WitcherCharacter | null;
  onSelectCharacter: (char: WitcherCharacter) => void;
  characterAssignments: Record<string, CharacterAssignment>;
  onClaimCharacter: (char: WitcherCharacter) => void;
  isHost: boolean;
  myPeerId: string;
  myPlayerName: string;
  connectedPeers?: ConnectedPeerInfo[];
  onReassignCharacter?: (
    characterId: string,
    targetPeerId: string,
    targetPlayerName: string
  ) => void;
  onUnlockCharacter?: (characterId: string) => void;
  isObserver?: boolean;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  isOpen,
  onClose,
  selectedCharacter,
  onSelectCharacter,
  characterAssignments,
  onClaimCharacter,
  isHost,
  myPeerId,
  myPlayerName,
  connectedPeers = [],
  onReassignCharacter,
  onUnlockCharacter,
  isObserver = false,
}) => {
  const [reassignTarget, setReassignTarget] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const getSchoolColor = (school: WitcherSchool) => {
    switch (school) {
      case 'Wolf':
        return 'border-amber-500/50 text-amber-400 bg-amber-500/10';
      case 'Cat':
        return 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10';
      case 'Griffin':
        return 'border-purple-500/50 text-purple-400 bg-purple-500/10';
      case 'Bear':
        return 'border-rose-500/50 text-rose-400 bg-rose-500/10';
    }
  };

  // Find which character is currently locked to the local user
  const myLockedAssignment = Object.values(characterAssignments).find(
    (a) =>
      a.isLocked &&
      (a.claimedByPeerId === myPeerId ||
        (isHost && a.claimedByPeerId === 'gm') ||
        a.claimedByName === myPlayerName)
  );
  const isMyCharacterLocked = Boolean(myLockedAssignment);

  const handleClaim = (witcher: WitcherCharacter) => {
    onSelectCharacter(witcher);
    onClaimCharacter(witcher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131517] border border-[#3b4249] rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1e]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c99a45]" />
              <h2 className="font-cinzel text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>Witcher Character Selection & Locking</span>
                {isHost && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> GM Authority
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-[#8a929a] font-cormorant italic mt-0.5">
              Cintra, circa 1184 — There can be only one Witcher of each School in the party. Once selected, only the Game Master can reassign characters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8a929a] hover:text-white hover:bg-[#282e34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="px-6 py-3 bg-[#101214] border-b border-[#262b31] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#a6b1b9]">
            <AlertCircle className="w-4 h-4 text-[#c99a45] shrink-0" />
            <span>
              {isHost
                ? 'As Game Master, you have master authority to assign, reassign, or unlock any character for your players.'
                : isObserver
                ? 'Observer Mode: All 4 Witcher player slots are filled (1 Narrator + 4 Players max). You are spectating the chronicle in real time.'
                : isMyCharacterLocked
                ? `You are locked into your chosen character. To change schools, request a reassignment from your Game Master.`
                : 'Select an available Witcher and click "Lock In Character" to join your party.'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-emerald-400">
              1 Per School Max
            </span>
            {myLockedAssignment && (
              <span className="px-2 py-0.5 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked In
              </span>
            )}
          </div>
        </div>

        {/* 4 Witchers Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PREGEN_WITCHERS.map((witcher) => {
            const isSelected = selectedCharacter?.id === witcher.id;
            const assignment = characterAssignments[witcher.id];
            const isAssigned = Boolean(assignment && assignment.isLocked);
            const isClaimedByMe = Boolean(
              assignment &&
                (assignment.claimedByPeerId === myPeerId ||
                  (isHost && assignment.claimedByPeerId === 'gm') ||
                  assignment.claimedByName === myPlayerName)
            );
            const isClaimedByOther = isAssigned && !isClaimedByMe;

            return (
              <div
                key={witcher.id}
                className={`flex flex-col rounded-xl border bg-[#181a1d] overflow-hidden transition-all duration-300 relative group ${
                  isClaimedByMe
                    ? 'border-emerald-500/80 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                    : isClaimedByOther
                    ? 'border-[#282d33] opacity-80'
                    : isSelected
                    ? 'border-[#c99a45] shadow-xl shadow-[#c99a45]/20 ring-1 ring-[#c99a45]'
                    : 'border-[#2d333a] hover:border-[#c99a45]'
                }`}
              >
                {/* Image Portrait */}
                <div className="relative h-56 w-full overflow-hidden bg-black">
                  <img
                    src={witcher.avatarUrl}
                    alt={witcher.name}
                    className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                      isClaimedByOther ? 'grayscale-[50%] brightness-75' : 'group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181a1d] via-transparent to-black/40" />

                  {/* School Badge */}
                  <div
                    className={`absolute top-3 left-3 text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider backdrop-blur-md ${getSchoolColor(
                      witcher.school
                    )}`}
                  >
                    School of the {witcher.school}
                  </div>

                  {/* Lock / Ownership Status Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    {isClaimedByMe ? (
                      <div className="bg-emerald-600 text-white text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-emerald-400/50">
                        <Lock className="w-3 h-3" />
                        <span>You</span>
                      </div>
                    ) : isClaimedByOther ? (
                      <div className="bg-black/80 text-amber-300 text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-500/40 backdrop-blur-sm">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span className="truncate max-w-[110px]">
                          {assignment?.claimedByName || 'Taken'}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/60 text-emerald-300 text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full shadow-lg border border-emerald-500/30">
                        Available
                      </div>
                    )}
                  </div>

                  {/* Witcher Name overlay */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="font-cinzel text-base font-bold text-white drop-shadow-md">
                      {witcher.name}
                    </h3>
                    <p className="text-[11px] text-[#c99a45] font-cormorant italic">
                      {witcher.title}
                    </p>
                  </div>
                </div>

                {/* Character Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Quick Stats Strip */}
                  <div className="grid grid-cols-3 gap-1 bg-[#101214] p-2 rounded-lg border border-[#262b31] text-center text-xs">
                    <div>
                      <div className="text-[10px] text-[#717b85] font-cinzel">HP</div>
                      <div className="font-bold text-emerald-400">{witcher.maxHp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#717b85] font-cinzel">AC</div>
                      <div className="font-bold text-amber-300">{witcher.armorClass}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#717b85] font-cinzel">Vigor</div>
                      <div className="font-bold text-purple-300">{witcher.maxVigor}</div>
                    </div>
                  </div>

                  {/* School Perk */}
                  <div className="bg-[#121416] p-2 rounded-lg border border-[#252a30]">
                    <div className="flex items-center gap-1 text-[11px] font-cinzel text-[#e2ba6d] mb-0.5">
                      <Zap className="w-3 h-3 text-[#c99a45]" />
                      <span className="truncate">{witcher.schoolPerk.name}</span>
                    </div>
                    <p className="text-[10px] text-[#8a929a] line-clamp-2 leading-relaxed">
                      {witcher.schoolPerk.description}
                    </p>
                  </div>

                  {/* Silver Weapon */}
                  <div className="flex items-center gap-1.5 text-xs text-[#a6b1b9]">
                    <Sword className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{witcher.silverWeapon.name}</span>
                  </div>

                  {/* Action Button: Non-Host Client View */}
                  {!isHost && (
                    <div>
                      {isClaimedByMe ? (
                        <div className="w-full py-2 px-3 rounded-lg text-xs font-cinzel font-bold bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 flex items-center justify-center gap-1.5 shadow-md">
                          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                          <span>Your Locked Witcher</span>
                        </div>
                      ) : isClaimedByOther ? (
                        <div className="w-full py-2 px-3 rounded-lg text-xs font-cinzel text-[#717b85] bg-[#121416] border border-[#282d33] flex items-center justify-center gap-1.5 cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                          <span className="truncate">Claimed by {assignment?.claimedByName}</span>
                        </div>
                      ) : isObserver ? (
                        <div className="w-full py-2 px-3 rounded-lg text-xs font-cinzel text-blue-300 bg-blue-950/30 border border-blue-500/30 flex items-center justify-center gap-1.5 cursor-not-allowed">
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Spectating (Observer)</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isMyCharacterLocked}
                          onClick={() => handleClaim(witcher)}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isMyCharacterLocked
                              ? 'bg-[#181a1d] text-[#6b737d] border border-[#2a2f35] cursor-not-allowed'
                              : 'bg-[#c99a45] hover:bg-[#e2ba6d] text-black shadow-lg shadow-[#c99a45]/20'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>
                            {isMyCharacterLocked ? 'Locked into Other School' : `Lock in ${witcher.school}`}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action Controls: Game Master View */}
                  {isHost && (
                    <div className="space-y-2 pt-1 border-t border-white/5">
                      {/* DM Quick Play Self Button */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCharacter(witcher);
                          onClaimCharacter(witcher);
                        }}
                        className={`w-full py-1.5 px-2 rounded-md text-xs font-cinzel font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#c99a45] text-black shadow-md'
                            : 'bg-[#21262d] hover:bg-[#2b323b] text-white border border-[#343b44]'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Active on GM Screen' : 'Play as GM'}</span>
                      </button>

                      {/* GM Reassign to Connected Peer Dropdown */}
                      {connectedPeers.length > 0 && onReassignCharacter && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-cinzel text-[#717b85] uppercase">
                            Reassign to Player:
                          </div>
                          <div className="flex gap-1">
                            <select
                              value={reassignTarget[witcher.id] || ''}
                              onChange={(e) =>
                                setReassignTarget((prev) => ({
                                  ...prev,
                                  [witcher.id]: e.target.value,
                                }))
                              }
                              className="flex-1 bg-[#0e1012] border border-[#2e343b] text-white text-[11px] rounded px-2 py-1 focus:outline-none focus:border-[#c99a45]"
                            >
                              <option value="">Select Connected Peer...</option>
                              {connectedPeers.map((p) => (
                                <option key={p.peerId} value={p.peerId}>
                                  {p.playerName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const targetPeerId = reassignTarget[witcher.id];
                                if (!targetPeerId) return;
                                const targetPeer = connectedPeers.find(
                                  (p) => p.peerId === targetPeerId
                                );
                                if (targetPeer) {
                                  onReassignCharacter(
                                    witcher.id,
                                    targetPeerId,
                                    targetPeer.playerName
                                  );
                                }
                              }}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-cinzel"
                              title="Assign to selected player"
                            >
                              Set
                            </button>
                          </div>
                        </div>
                      )}

                      {/* GM Unlock Button */}
                      {isAssigned && onUnlockCharacter && (
                        <button
                          type="button"
                          onClick={() => onUnlockCharacter(witcher.id)}
                          className="w-full py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Unlock & Free Character</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-[#15171a] border-t border-[#262b30] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8a929a]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#c99a45]" />
            <span>
              {isHost
                ? 'Game Master Mode: You can reassign, lock, or release any Witcher.'
                : 'Player Mode: Once locked in, only your Game Master can modify character assignments.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252b31] hover:bg-[#323942] text-white rounded font-cinzel text-xs transition-colors"
          >
            {isMyCharacterLocked ? 'Close Roster' : 'Decide Later'}
          </button>
        </div>
      </div>
    </div>
  );
};
