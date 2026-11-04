import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Dices, 
  Flame, 
  Mic, 
  MicOff, 
  Radio, 
  FileText,
  Sparkles,
  HelpCircle,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, WitcherSchool, SpeechRoleplayMode } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface ChatCombatLogProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, speechMode?: SpeechRoleplayMode, isVoice?: boolean) => void;
  currentUserName?: string;
  currentUserSchool?: WitcherSchool;
  onOpenNotionModal?: () => void;
  onOpenInstructions?: () => void;
}

export const ChatCombatLog: React.FC<ChatCombatLogProps> = ({
  messages,
  onSendMessage,
  currentUserName = 'Witcher',
  onOpenNotionModal,
  onOpenInstructions,
}) => {
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'rolls' | 'combat' | 'roleplay'>('all');
  const [speechMode, setSpeechMode] = useState<SpeechRoleplayMode>('ic');
  const [autoSendOnPause, setAutoSendOnPause] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSendTimerRef = useRef<any>(null);

  // Hook for Web Speech API & Live Audio Level Meter
  const {
    isSupported,
    isListening,
    interimTranscript,
    audioLevel,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechToText((finalChunk) => {
    // Append finalized speech to the input box in real time
    setInputText((prev) => {
      const updated = prev ? `${prev} ${finalChunk}` : finalChunk;
      
      // If Auto-Send is enabled, set a 1.5-second debounce timer to send
      if (autoSendOnPause) {
        if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
        autoSendTimerRef.current = setTimeout(() => {
          if (updated.trim()) {
            onSendMessage(updated.trim(), speechMode, true);
            setInputText('');
          }
        }, 1500);
      }

      return updated;
    });
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = (inputText + (interimTranscript ? ` ${interimTranscript}` : '')).trim();
    if (!textToSend) return;

    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    onSendMessage(textToSend, speechMode, isListening);
    setInputText('');
  };

  const toggleMic = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === 'rolls') return m.type === 'roll';
    if (filter === 'combat') return m.type === 'combat' || m.type === 'roll';
    if (filter === 'roleplay') return m.isVoiceTranscribed || m.speechMode === 'ic' || m.speechMode === 'dm';
    return true;
  });

  const getSchoolBadgeColor = (school?: WitcherSchool) => {
    switch (school) {
      case 'Wolf': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'Cat': return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
      case 'Griffin': return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
      case 'Bear': return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      default: return 'text-[#8a929a] border-white/10 bg-white/5';
    }
  };

  return (
    <div className="bg-[#131517] border border-[#2e343b] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full relative">
      
      {/* Top Header: Title, Filters & Notion Wiki Sync */}
      <div className="bg-[#181a1d] border-b border-[#282d33] px-3.5 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#c99a45]" />
          <h3 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider hidden sm:inline">
            Roleplay & Chat
          </h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#101214] p-0.5 rounded-md border border-[#262b30] text-[10px] font-cinzel">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'all' ? 'bg-[#293037] text-white font-bold' : 'text-[#8a929a]'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('roleplay')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'roleplay' ? 'bg-[#c99a45] text-black font-bold' : 'text-[#8a929a]'}`}
              title="Voice & In-Character Roleplay Only"
            >
              RP
            </button>
            <button
              onClick={() => setFilter('rolls')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'rolls' ? 'bg-[#293037] text-white font-bold' : 'text-[#8a929a]'}`}
            >
              Rolls
            </button>
            <button
              onClick={() => setFilter('combat')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'combat' ? 'bg-[#293037] text-white font-bold' : 'text-[#8a929a]'}`}
            >
              Combat
            </button>
          </div>

          {/* Notion Wiki Button */}
          {onOpenNotionModal && (
            <button
              onClick={onOpenNotionModal}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e2227] hover:bg-[#282f37] text-[#c99a45] border border-[#363e46] text-[10px] font-cinzel transition-colors"
              title="Sync Session to Notion Wiki"
            >
              <FileText className="w-3 h-3 text-[#c99a45]" />
              <span className="hidden md:inline">Notion</span>
            </button>
          )}

          {/* Voice Troubleshooting Help */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 rounded text-[#717b85] hover:text-white transition-colors"
            title="Speech-to-Text Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Help Modal Dropdown if toggled */}
      {showHelp && (
        <div className="bg-[#1b1f24] border-b border-[#303841] p-3 text-xs text-[#a6b1b9] space-y-1.5 animate-fadeIn">
          <div className="font-cinzel text-white font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#c99a45]" />
              Speech-to-Text Setup Guide
            </span>
            <button onClick={() => setShowHelp(false)} className="text-[#8a929a] hover:text-white">✕</button>
          </div>
          <p>• <strong>Browser Requirement:</strong> Google Chrome, Microsoft Edge, or Safari provide the highest quality speech recognition.</p>
          <p>• <strong>Microphone Permission:</strong> When prompted, click <em>"Allow"</em> for microphone access in your browser address bar.</p>
          <p>• <strong>In-Character Mode:</strong> Spoken words are formatted as your Witcher’s quoted dialogue with school attribution.</p>
          {onOpenInstructions && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-[#717b85]">Need full 5e rules or GM advice?</span>
              <button
                type="button"
                onClick={onOpenInstructions}
                className="text-[11px] text-[#c99a45] hover:text-[#e2ba6d] font-cinzel font-semibold hover:underline"
              >
                Open How to Play & GM Guide →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#0f1012] min-h-[220px]">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#6b737d] font-cormorant italic text-center p-4">
            <Sparkles className="w-6 h-6 text-[#c99a45]/40 mb-2" />
            <p>Silence over the Cintrian highway camp...</p>
            <p className="text-[11px] text-[#555d65] mt-1">
              Click the microphone button to dictate in-character voice speech directly into the chronicle.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            if (msg.type === 'roll' && msg.rollData) {
              const roll = msg.rollData;
              return (
                <div 
                  key={msg.id} 
                  className={`p-2.5 rounded-lg border text-xs ${
                    roll.isCritical 
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10' 
                      : roll.isFumble 
                      ? 'bg-rose-950/30 border-rose-500/60' 
                      : 'bg-[#16181b] border-[#292f35]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Dices className={`w-3.5 h-3.5 ${roll.isCritical ? 'text-amber-400 animate-bounce' : 'text-[#8a929a]'}`} />
                      <span className="font-cinzel font-bold text-white text-[11px]">{roll.senderName}</span>
                      {roll.school && (
                        <span className={`text-[9px] px-1 rounded border uppercase font-mono ${getSchoolBadgeColor(roll.school)}`}>
                          {roll.school}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#717b85] font-mono">
                      {new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mt-1 font-cinzel text-xs text-[#e2ba6d]">
                    {roll.title}
                  </div>

                  <div className="mt-1.5 flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 font-mono">
                    <span className="text-[11px] text-[#8a929a]">
                      [{roll.diceRolls.join(', ')}] {roll.modifier >= 0 ? `+ ${roll.modifier}` : `- ${Math.abs(roll.modifier)}`}
                    </span>
                    <span className={`text-base font-bold ${
                      roll.isCritical ? 'text-amber-400 drop-shadow' : roll.isFumble ? 'text-rose-400' : 'text-white'
                    }`}>
                      = {roll.total}
                      {roll.isCritical && ' 🔥 CRIT!'}
                      {roll.isFumble && ' 💀 FUMBLE'}
                    </span>
                  </div>
                </div>
              );
            }

            if (msg.type === 'combat') {
              return (
                <div key={msg.id} className="p-2 rounded bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-mono text-[11px] leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="p-1.5 rounded bg-black/40 border border-white/5 text-[11px] text-[#8a929a] font-mono text-center">
                  {msg.text}
                </div>
              );
            }

            // Normal / Voice Transcribed Chat Message
            const isIC = msg.speechMode === 'ic';
            const isDM = msg.speechMode === 'dm';

            return (
              <div 
                key={msg.id} 
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  msg.isVoiceTranscribed 
                    ? 'bg-amber-950/15 border-amber-600/30 shadow-sm' 
                    : isIC 
                    ? 'bg-[#15191d] border-[#29323a]' 
                    : 'bg-[#16181b] border-[#252a30]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-cinzel font-bold text-[#c99a45] text-[11px]">{msg.senderName}</span>
                    {msg.school && (
                      <span className={`text-[9px] px-1 rounded border uppercase font-mono ${getSchoolBadgeColor(msg.school)}`}>
                        {msg.school}
                      </span>
                    )}

                    {/* Voice Badge */}
                    {msg.isVoiceTranscribed && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1 py-0.2 rounded">
                        <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                        Voice
                      </span>
                    )}

                    {/* Mode indicator */}
                    <span className="text-[9px] text-[#717b85] font-mono">
                      {isIC ? '🎭 (In-Character)' : isDM ? '👑 (DM Narration)' : ''}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#616a73] font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className={`leading-relaxed break-words ${
                  isIC ? 'font-serif text-[13px] text-[#f0ede6] italic pl-2 border-l-2 border-[#c99a45]/50' : 'text-white text-[12px]'
                }`}>
                  {isIC ? `"${msg.text}"` : msg.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-3 py-1.5 bg-rose-950/50 border-t border-rose-500/40 text-rose-300 text-[11px] flex items-center justify-between">
          <span className="font-mono">{speechError}</span>
          <button onClick={() => setShowHelp(true)} className="underline hover:text-white">Help</button>
        </div>
      )}

      {/* Active Mic Audio Meter Banner */}
      {isListening && (
        <div className="px-3 py-1.5 bg-red-950/30 border-t border-red-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-cinzel text-red-300 font-bold text-[11px]">
              Microphone Active ({currentUserName})
            </span>
          </div>

          {/* Volume Meter Bar */}
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
            <div className="w-16 bg-[#20252b] h-2 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                style={{ width: `${Math.max(8, audioLevel)}%` }}
              />
            </div>
            <span className="text-[10px] text-[#8a929a] font-mono w-6">{audioLevel}%</span>
          </div>
        </div>
      )}

      {/* Speech Mode Bar */}
      <div className="px-3 py-1.5 bg-[#16181b] border-t border-[#262b30] flex items-center justify-between text-[11px] font-cinzel">
        <div className="flex items-center gap-1.5">
          <span className="text-[#717b85] text-[10px] uppercase">Mode:</span>
          <button
            type="button"
            onClick={() => setSpeechMode('ic')}
            className={`px-2 py-0.5 rounded transition-all ${
              speechMode === 'ic' ? 'bg-[#c99a45] text-black font-bold' : 'text-[#8a929a] hover:text-white'
            }`}
          >
            🎭 In-Character
          </button>
          <button
            type="button"
            onClick={() => setSpeechMode('dm')}
            className={`px-2 py-0.5 rounded transition-all ${
              speechMode === 'dm' ? 'bg-purple-900/60 border border-purple-500/50 text-purple-300 font-bold' : 'text-[#8a929a] hover:text-white'
            }`}
          >
            👑 DM Narration
          </button>
          <button
            type="button"
            onClick={() => setSpeechMode('ooc')}
            className={`px-2 py-0.5 rounded transition-all ${
              speechMode === 'ooc' ? 'bg-[#293037] text-white font-bold' : 'text-[#8a929a] hover:text-white'
            }`}
          >
            🎲 OOC
          </button>
        </div>

        {/* Auto Send Toggle */}
        <button
          type="button"
          onClick={() => setAutoSendOnPause(!autoSendOnPause)}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-colors ${
            autoSendOnPause 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'border-[#2f353d] text-[#717b85] hover:text-white'
          }`}
          title="Automatically sends message after 1.5 seconds of silence"
        >
          {autoSendOnPause && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
          <span>Auto-Send</span>
        </button>
      </div>

      {/* Input Form with Push-To-Talk / Mic Button */}
      <form onSubmit={handleSubmit} className="p-2 bg-[#141619] border-t border-[#262b30] flex items-center gap-2">
        
        {/* Microphone STT Toggle */}
        <button
          type="button"
          onClick={toggleMic}
          disabled={!isSupported}
          className={`p-2 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
            isListening 
              ? 'bg-red-600 text-white border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-600/30 animate-pulse' 
              : 'bg-[#1c2024] hover:bg-[#282e35] text-[#c99a45] border-[#343c44] hover:border-[#c99a45]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title={isListening ? 'Click to Stop Microphone' : 'Click to Speak (Speech-to-Text)'}
        >
          {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Input Text Field (Live transcription streams right here!) */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText + (interimTranscript ? ` ${interimTranscript}` : '')}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening 
                ? '🎙️ Listening... speak in-character now...' 
                : `Speak or type as ${currentUserName}...`
            }
            className="w-full bg-[#0b0c0d] border border-[#2e343c] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c99a45] transition-colors"
          />
        </div>

        <button
          type="submit"
          className="px-3.5 py-1.5 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-xs rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
