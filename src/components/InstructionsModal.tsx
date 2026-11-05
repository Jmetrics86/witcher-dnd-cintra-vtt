import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Shield,
  Crown,
  Flame,
  Wifi,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Skull,
  Lock,
  Clock,
  HardDrive,
  FileText,
} from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'player' | 'gm' | 'combat' | 'p2p';
  onOpenP2P?: () => void;
  onOpenGuide?: () => void;
  onOpenGMModal?: () => void;
  onOpenNotionModal?: () => void;
  isHost?: boolean;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'player',
  onOpenP2P,
  onOpenGuide,
  onOpenGMModal,
  onOpenNotionModal,
  isHost = false,
}) => {
  const [activeTab, setActiveTab] = useState<'player' | 'gm' | 'combat' | 'p2p'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131518] border border-[#3b4249] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1f] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c99a45]/15 border border-[#c99a45]/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#c99a45]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>The Witcher's Codex & Game Master Manual</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/30">
                  5e System
                </span>
              </h2>
              <p className="text-xs text-[#8a929a]">
                Complete interactive guide on how to play as a Witcher and how to host & GM the 4-hour module.
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

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-[#282d33] bg-[#101214] px-4 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-cinzel border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'player'
                ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                : 'border-transparent text-[#8a929a] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#c99a45]" />
            <span>How to Play (Player Guide)</span>
          </button>

          <button
            onClick={() => setActiveTab('gm')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-cinzel border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'gm'
                ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                : 'border-transparent text-[#8a929a] hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>How to GM (Game Master Guide)</span>
          </button>

          <button
            onClick={() => setActiveTab('combat')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-cinzel border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'combat'
                ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                : 'border-transparent text-[#8a929a] hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Signs, Alchemy & Combat</span>
          </button>

          <button
            onClick={() => setActiveTab('p2p')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-cinzel border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'p2p'
                ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                : 'border-transparent text-[#8a929a] hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>P2P Multiplayer & Security</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#131518] text-xs leading-relaxed text-[#a6b1b9]">

          {/* TAB 1: PLAYER GUIDE */}
          {activeTab === 'player' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Intro Banner */}
              <div className="bg-[#181b1f] p-4 rounded-xl border border-[#2b3137] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#c99a45] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-white mb-1">
                    Welcome to Pre-Fall Cintra (circa 1184)
                  </h3>
                  <p>
                    You play one of four mutant monster hunters from the book-canon schools (Wolf, Cat, Griffin, or Bear), decades before Geralt of Rivia was born. Your party has assembled at the Lion & Lily Waystation to accept a high-paying royal contract signed by Sir Danek of Marnadal.
                  </p>
                </div>
              </div>

              {/* 4 Steps to Play */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1: Character Selection */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#c99a45] text-black text-xs flex items-center justify-center font-mono">1</span>
                    <span>Choose Your Witcher School</span>
                  </div>
                  <p>
                    Click <strong className="text-white">"Select Witcher"</strong> in the top navbar to choose your character:
                  </p>
                  <ul className="space-y-1.5 pl-2">
                    <li><strong className="text-[#c99a45]">School of the Wolf (Vane):</strong> Adaptable frontline fighter, swordmaster, and acute tracker.</li>
                    <li><strong className="text-[#06b6d4]">School of the Cat (Sybilla):</strong> Agile duelist who scores Critical Hits on rolls of 19–20.</li>
                    <li><strong className="text-[#a855f7]">School of the Griffin (Alden):</strong> Magic and Sign specialist with enhanced Signs and high Vigor.</li>
                    <li><strong className="text-[#f43f5e]">School of the Bear (Bram):</strong> Heavily armored juggernaut built to absorb devastating monster blows.</li>
                  </ul>
                </div>

                {/* Step 2: Character Sheet & Dice Rolling */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#c99a45] text-black text-xs flex items-center justify-center font-mono">2</span>
                    <span>Rolling Dice & Character Sheet</span>
                  </div>
                  <p>
                    Switch to the <strong className="text-white">"Witcher Sheet"</strong> tab in the navbar. Every stat is clickable:
                  </p>
                  <ul className="space-y-1.5 pl-2">
                    <li>Click any <strong className="text-white">Attack</strong>, <strong className="text-white">Skill</strong>, or <strong className="text-white">Saving Throw</strong> to roll d20 with your modifiers automatically calculated.</li>
                    <li>Toggle <strong className="text-amber-400">Advantage</strong> or <strong className="text-amber-400">Disadvantage</strong> at the top of the sheet or in the Dice Roller Tray.</li>
                    <li>All rolls broadcast in real-time over the P2P network to your Game Master and fellow witchers.</li>
                  </ul>
                </div>

                {/* Step 3: Tactical Battle Map */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#c99a45] text-black text-xs flex items-center justify-center font-mono">3</span>
                    <span>Moving on the Tactical Map</span>
                  </div>
                  <p>
                    The battle map features custom artwork for each act:
                  </p>
                  <ul className="space-y-1.5 pl-2">
                    <li><strong className="text-white">Move Your Token:</strong> Click and drag your Witcher token anywhere on the grid. Movement is synced instantly.</li>
                    <li><strong className="text-white">Ping Coordinates:</strong> Click the <strong className="text-[#c99a45]">"Ping Map"</strong> button to broadcast an alert beacon at a specific location to highlight enemy positions or rally points.</li>
                    <li>HP bars over your token update live as you take damage on your sheet.</li>
                  </ul>
                </div>

                {/* Step 4: Roleplay & Speech-to-Text */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#c99a45] text-black text-xs flex items-center justify-center font-mono">4</span>
                    <span>Speech-to-Text Roleplay</span>
                  </div>
                  <p>
                    Record your roleplay directly into the chat log:
                  </p>
                  <ul className="space-y-1.5 pl-2">
                    <li>Click the <strong className="text-emerald-400">Microphone (Mic)</strong> icon in the Chat box to activate browser voice recognition.</li>
                    <li>Toggle <strong className="text-white">[IC] In-Character</strong> or <strong className="text-white">[OOC] Out-Of-Character</strong> mode so everyone knows whether your Witcher is speaking or you are asking a question.</li>
                    <li>Enable <strong className="text-white">Auto-Send on Pause</strong> to automatically transmit your words as soon as you stop speaking.</li>
                  </ul>
                </div>

              </div>

              {/* Joining a Multiplayer Game */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#171a1d] to-[#1a1e22] border border-[#323940] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span>How to Join Your Game Master's Session</span>
                  </h4>
                  <p className="text-[#8a929a] mt-1">
                    Click the P2P Room button in the navbar, select "Join as Witcher Player", enter the GM's Room Code (and PIN if requested), and hit Connect. Or simply click the direct invite link shared by your GM!
                  </p>
                </div>
                {onOpenP2P && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenP2P();
                    }}
                    className="px-4 py-2 rounded-lg bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-xs whitespace-nowrap transition-colors"
                  >
                    Open P2P Network
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GAME MASTER GUIDE */}
          {activeTab === 'gm' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* GM Master Overview Banner */}
              <div className="bg-[#191c20] p-4 rounded-xl border border-amber-500/30 flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-white mb-1">
                    Game Master Authority & Zero-Server Hosting
                  </h3>
                  <p>
                    As the Game Master, your browser is the authoritative host. All campaign data (tokens, HP, chat logs, transcripts, active map scene) is auto-saved locally in your browser and synchronized securely to your players via encrypted WebRTC data channels.
                  </p>
                </div>
              </div>

              {/* 5 GM Steps */}
              <div className="space-y-4">
                
                {/* 1. Hosting & Lobby Security */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs flex items-center justify-center font-mono">1</span>
                      Hosting & Securing Your Lobby
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      AES-256-GCM E2EE
                    </span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-[#8a929a]">
                    <li>Click <strong className="text-white">"P2P Room"</strong> in the top navbar, choose a Room Code (e.g. <code className="text-[#c99a45]">cintra-hunt</code>), and click <strong className="text-white">"Generate 6-Digit PIN"</strong>.</li>
                    <li>Click <strong className="text-white">"Start Secure Game Master Session"</strong>.</li>
                    <li>Click <strong className="text-[#c99a45]">"Invite Link"</strong> to copy a direct URL (e.g. <code className="text-xs">?room=cintra-hunt</code>) and share it with your players.</li>
                    <li>Once your 4 players join, toggle <strong className="text-amber-300">"Lock Room"</strong> to prevent unauthorized connections. You can also kick any peer from the live roster.</li>
                  </ul>
                </div>

                {/* 2. Running the 4-Hour Adventure */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs flex items-center justify-center font-mono">2</span>
                      Pacing the 4-Hour Adventure: "The Blood of Marnadal"
                    </span>
                    <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 45 min / Act
                    </span>
                  </div>
                  <p>
                    Open the <strong className="text-white">"4hr Module"</strong> modal from the top navbar anytime for boxed read-aloud text, investigation DC tables, and tactical tips:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="p-2.5 rounded bg-[#16181b] border border-[#2a2f35]">
                      <div className="font-cinzel text-white font-semibold">Act 1: The Lion & Lily Waystation</div>
                      <div className="text-[11px] text-[#717b85]">0:00 – 0:45 • Investigation, contract negotiation with Sir Danek.</div>
                    </div>
                    <div className="p-2.5 rounded bg-[#16181b] border border-[#2a2f35]">
                      <div className="font-cinzel text-white font-semibold">Act 2: The Primeval Forest</div>
                      <div className="text-[11px] text-[#717b85]">0:45 – 1:40 • Witcher Senses tracking & Barghest hound ambush.</div>
                    </div>
                    <div className="p-2.5 rounded bg-[#16181b] border border-[#2a2f35]">
                      <div className="font-cinzel text-white font-semibold">Act 3: The Cursed Barrow Crypt</div>
                      <div className="text-[11px] text-[#717b85]">1:40 – 2:40 • Crypt exploration, Grave Hag confrontation & sacrifice truth.</div>
                    </div>
                    <div className="p-2.5 rounded bg-[#16181b] border border-[#2a2f35]">
                      <div className="font-cinzel text-white font-semibold">Act 4: The Corrupted Monolith</div>
                      <div className="text-[11px] text-[#717b85]">2:40 – 4:00 • Climax boss fight against Ancient Leshen & Fiend + 3 Endings.</div>
                    </div>
                  </div>
                </div>

                {/* 3. Managing the Battle Map & Bestiary */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <span className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs flex items-center justify-center font-mono">3</span>
                    Switching Maps & Spawning Monsters
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-[#8a929a]">
                    <li><strong className="text-white">Change Maps:</strong> Use the scene selector at the top of the Tactical Map. Changing scenes automatically transitions all connected players to the new battle map.</li>
                    <li><strong className="text-white">Spawn Monsters:</strong> Open the <strong className="text-white">"Bestiary"</strong> modal from the navbar, review the monster's lore and 5e stats, and click <strong className="text-red-400">"Spawn onto Map"</strong>. It drops an interactive monster token with HP tracking for all players.</li>
                    <li><strong className="text-white">Host Access Control:</strong> Only you (the GM) have authority to spawn/remove monsters and change scenes. Rogue client requests are blocked by the security layer.</li>
                  </ul>
                </div>

                {/* 4. Local Campaign Auto-Save & Backup */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs flex items-center justify-center font-mono">4</span>
                      Local Browser Save & Backup
                    </span>
                    {isHost && onOpenGMModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenGMModal();
                        }}
                        className="px-2.5 py-1 rounded bg-[#1e2329] hover:bg-[#282f37] border border-[#343b44] text-xs font-cinzel text-[#c99a45] transition-colors flex items-center gap-1"
                      >
                        <HardDrive className="w-3 h-3 text-[#c99a45]" />
                        <span>Open GM Backup Tool</span>
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-[#8a929a]">
                    <li>Every token movement, chat entry, and scene change is auto-saved to your browser's <code className="text-[#c99a45]">localStorage</code>.</li>
                    <li>Click <strong className="text-white">"GM Save"</strong> in the navbar to export a complete standalone <code className="text-[#c99a45]">.json</code> backup file to your computer.</li>
                    <li>If a player rejoins or reconnects, you can click <strong className="text-white">"Sync All"</strong> to force-push the complete campaign state to their screen.</li>
                  </ul>
                </div>

                {/* 5. Automatic Notion Campaign Wiki */}
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs flex items-center justify-center font-mono">5</span>
                      Exporting to Notion Wiki & Chronicles
                    </span>
                    {onOpenNotionModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenNotionModal();
                        }}
                        className="px-2.5 py-1 rounded bg-[#1e2329] hover:bg-[#282f37] border border-[#343b44] text-xs font-cinzel text-[#c99a45] transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-[#c99a45]" />
                        <span>Open Notion Wiki Tool</span>
                      </button>
                    )}
                  </div>
                  <p>
                    Click <strong className="text-white">"Notion Wiki"</strong> in the navbar after the session. You can 1-click download a full Markdown bundle containing:
                  </p>
                  <ul className="space-y-1 list-disc list-inside text-[#8a929a] pl-2">
                    <li>Chronological dialogue and roleplay transcript (including transcribed speech).</li>
                    <li>Combat roll summaries and critical hits.</li>
                    <li>Full 4-hour module summary and bestiary records ready to paste into Notion, Obsidian, or Discord.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SIGNS, ALCHEMY & COMBAT */}
          {activeTab === 'combat' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Signs Table */}
              <div>
                <h3 className="font-cinzel text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>The Five Witcher Signs (5e Rules)</span>
                </h3>
                <div className="border border-[#262b31] rounded-xl overflow-hidden bg-[#111315]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181a1d] text-[#8a929a] font-cinzel border-b border-[#262b31]">
                      <tr>
                        <th className="p-2.5">Sign</th>
                        <th className="p-2.5">Vigor Cost</th>
                        <th className="p-2.5">Combat Effect</th>
                        <th className="p-2.5">Best Used Against</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2226]">
                      <tr className="hover:bg-[#15181b]">
                        <td className="p-2.5 font-bold text-[#38bdf8]">Aard</td>
                        <td className="p-2.5 font-mono text-white">1 Vigor</td>
                        <td className="p-2.5 text-[#a6b1b9]">Telekinetic blast (2d6 force) + STR save or knocked prone / back 15ft.</td>
                        <td className="p-2.5 text-white">Flying foes, crowds of Barghests</td>
                      </tr>
                      <tr className="hover:bg-[#15181b]">
                        <td className="p-2.5 font-bold text-[#f97316]">Igni</td>
                        <td className="p-2.5 font-mono text-white">1 Vigor</td>
                        <td className="p-2.5 text-[#a6b1b9]">15ft cone of flame (3d6 fire) + DEX save or suffer ongoing burn damage.</td>
                        <td className="p-2.5 text-white">Ancient Leshen (Vulnerable to Fire!)</td>
                      </tr>
                      <tr className="hover:bg-[#15181b]">
                        <td className="p-2.5 font-bold text-[#eab308]">Quen</td>
                        <td className="p-2.5 font-mono text-white">1 Vigor</td>
                        <td className="p-2.5 text-[#a6b1b9]">Energy shield granting 15 Temporary HP. Absorbs heavy monster impacts.</td>
                        <td className="p-2.5 text-white">Fiend gore charges, Leshen roots</td>
                      </tr>
                      <tr className="hover:bg-[#15181b]">
                        <td className="p-2.5 font-bold text-[#a855f7]">Yrden</td>
                        <td className="p-2.5 font-mono text-white">2 Vigor</td>
                        <td className="p-2.5 text-[#a6b1b9]">Magic trap (10ft circle). Halves enemy speed and anchors ethereal specters.</td>
                        <td className="p-2.5 text-white">Barghests, Grave Hags, wraiths</td>
                      </tr>
                      <tr className="hover:bg-[#15181b]">
                        <td className="p-2.5 font-bold text-[#22c55e]">Axii</td>
                        <td className="p-2.5 font-mono text-white">1 Vigor</td>
                        <td className="p-2.5 text-[#a6b1b9]">Mental sway. WIS save or target is Stunned until end of next turn.</td>
                        <td className="p-2.5 text-white">Raging Fiends, human bandits</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alchemy & Toxicity Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <h4 className="font-cinzel text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Skull className="w-4 h-4 text-emerald-400" />
                    <span>Toxicity & Potions</span>
                  </h4>
                  <p>
                    Witcher potions grant immense power but fill your bloodstream with mutagens:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[#8a929a]">
                    <li><strong className="text-white">Swallow:</strong> Toxicity +25. Regains 2d4+2 HP at the start of each turn for 3 rounds.</li>
                    <li><strong className="text-white">Tawny Owl:</strong> Toxicity +20. Instantly recovers 2 Vigor points.</li>
                    <li><strong className="text-white">Blizzard:</strong> Toxicity +30. Grants an extra Reaction per combat round.</li>
                    <li><strong className="text-amber-400">Toxicity &gt; 75%:</strong> Disadvantage on Constitution checks.</li>
                    <li><strong className="text-rose-400">Toxicity at 100%:</strong> Take 1d6 necrotic damage every turn until flushed with White Honey.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                  <h4 className="font-cinzel text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Blade Oils & Bombs</span>
                  </h4>
                  <p>
                    Preparation is what keeps a Witcher alive:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[#8a929a]">
                    <li><strong className="text-white">Relict Oil:</strong> +2d6 damage to Silver Sword attacks against the Ancient Leshen.</li>
                    <li><strong className="text-white">Specter Oil:</strong> +2d6 damage against spectral Barghests.</li>
                    <li><strong className="text-white">Necrophage Oil:</strong> +2d6 damage against Grave Hags.</li>
                    <li><strong className="text-white">Dimeritium Bomb:</strong> 15ft radius sphere suppresses all magical abilities and Sign casting for 1 minute.</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: P2P MULTIPLAYER & SECURITY */}
          {activeTab === 'p2p' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-[#111315] p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 font-cinzel text-sm font-bold text-white">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Server WebRTC Architecture & Security Protections</span>
                </div>
                <p>
                  This VTT operates 100% in your browser. No central game server holds your data or roleplay audio transcripts. Everything is transmitted directly between players via WebRTC data channels.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="font-semibold text-emerald-400">AES-256-GCM E2EE</div>
                    <div className="text-[11px] text-[#717b85] mt-0.5">
                      PBKDF2 60,000 iterations derive a 256-bit key from the Room Code and PIN.
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="font-semibold text-[#c99a45]">SHA-256 Obfuscation</div>
                    <div className="text-[11px] text-[#717b85] mt-0.5">
                      Signaling broker IDs are cryptographically hashed so room codes cannot be enumerated.
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="font-semibold text-amber-400">Host Privilege Guard</div>
                    <div className="text-[11px] text-[#717b85] mt-0.5">
                      Only the Game Master can spawn monsters, remove tokens, or transition scenes.
                    </div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31] space-y-2">
                <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Multiplayer Troubleshooting</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-[#8a929a]">
                  <li><strong className="text-white">Connection Timed Out:</strong> Make sure the Game Master has started hosting before players attempt to connect.</li>
                  <li><strong className="text-white">Wrong PIN Error:</strong> The Secret PIN is case-sensitive and must match the Host's PIN exactly.</li>
                  <li><strong className="text-white">Firewall / NAT:</strong> The application automatically queries Google and Cloudflare STUN servers for NAT traversal. If on a strict university or corporate VPN, try using mobile hotspot or standard home Wi-Fi.</li>
                  <li><strong className="text-white">Resyncing:</strong> If anyone's screen falls out of sync, the GM can simply click <strong className="text-white">"Sync All"</strong> to re-broadcast the map state.</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#141619] border-t border-[#262b30] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs text-[#717b85]">
            <span className="flex items-center gap-1 text-[#c99a45]">
              <HelpCircle className="w-3.5 h-3.5" /> Witcher 5e Ruleset
            </span>
            <span>•</span>
            <span>Pre-Fall Cintra (1184)</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenGuide && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="px-3 py-1.5 rounded bg-[#1e2329] hover:bg-[#282f37] border border-[#343b44] text-[#d6d9dc] font-cinzel text-xs transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Open 4hr Module</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-xs rounded transition-colors"
            >
              Close Manual
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
