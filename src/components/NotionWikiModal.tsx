import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  Check, 
  Database, 
  Sparkles, 
  Radio, 
  Key, 
  FolderSync 
} from 'lucide-react';
import { ChatMessage, WitcherCharacter, MapScene } from '../types';
import { notionService } from '../services/notionService';

interface NotionWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  selectedCharacter: WitcherCharacter | null;
  currentScene: MapScene;
}

export const NotionWikiModal: React.FC<NotionWikiModalProps> = ({
  isOpen,
  onClose,
  messages,
  selectedCharacter,
  currentScene,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [pageId, setPageId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; text: string } | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const voiceLogsCount = messages.filter((m) => m.isVoiceTranscribed).length;
  const totalChatCount = messages.filter((m) => m.type === 'chat').length;
  const rollCount = messages.filter((m) => m.type === 'roll').length;

  const handleDownload = () => {
    notionService.downloadNotionWikiFile(
      messages,
      selectedCharacter || undefined,
      currentScene
    );
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleSyncNotionApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !pageId.trim()) return;

    setIsSyncing(true);
    setSyncStatus(null);

    const markdown = notionService.generateNotionWikiMarkdown(
      messages,
      selectedCharacter || undefined,
      currentScene
    );

    const title = `🐺 Witcher 5e Chronicle: ${currentScene.name} (${new Date().toLocaleDateString()})`;
    const result = await notionService.syncToNotionApi(
      { apiKey, parentPageId: pageId },
      title,
      markdown
    );

    setIsSyncing(false);
    setSyncStatus({ success: result.success, text: result.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141619] border border-[#384048] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282d33] bg-[#181b1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#242b32] border border-[#c99a45]/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#c99a45]" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                Automatic Notion Wiki & Session Chronicle
              </h3>
              <p className="text-xs text-[#8a929a] font-cormorant italic">
                Turn your voice-to-text roleplay and Witcher lore into an organized Notion Wiki.
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Live Recorded Metrics Banner */}
          <div className="grid grid-cols-3 gap-3 bg-[#0f1113] p-3.5 rounded-xl border border-[#252a30] text-center">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] font-cinzel text-[#717b85]">
                <Radio className="w-3 h-3 text-red-400" />
                <span>Voice STT Logs</span>
              </div>
              <div className="text-base font-bold text-amber-400 font-mono">
                {voiceLogsCount} lines
              </div>
            </div>

            <div className="space-y-0.5 border-x border-[#252a30]">
              <div className="text-[11px] font-cinzel text-[#717b85]">
                Total Messages
              </div>
              <div className="text-base font-bold text-white font-mono">
                {totalChatCount}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-cinzel text-[#717b85]">
                Dice & Combat
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {rollCount} events
              </div>
            </div>
          </div>

          {/* Option 1: Instant 1-Click Notion Bundle Download */}
          <div className="p-4 rounded-xl border border-[#c99a45]/40 bg-gradient-to-br from-[#1c1914] to-[#141412] relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 uppercase">
                  Recommended & Fastest
                </span>
                <h4 className="font-cinzel text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#c99a45]" />
                  <span>1-Click Notion Wiki Bundle (.md)</span>
                </h4>
                <p className="text-xs text-[#a6b1b9] mt-1 leading-relaxed">
                  Generates an instantly formatted Notion Markdown document containing the complete campaign guide, 4 Witcher dossiers, Bestiary stat blocks, and your live voice transcripts. Simply drag and drop into any Notion page!
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-xs rounded-lg transition-all shadow-lg shadow-[#c99a45]/20 shrink-0 flex items-center gap-1.5"
              >
                {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{downloaded ? 'Downloaded!' : 'Download Wiki'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Direct Notion API Sync */}
          <div className="p-4 rounded-xl border border-[#2e343b] bg-[#121416] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-cinzel text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Direct Notion API Sync</span>
              </div>
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-300 hover:underline flex items-center gap-1"
              >
                <span>Get Notion API Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleSyncNotionApi} className="space-y-3">
              <div>
                <label className="block text-[11px] font-cinzel text-[#8a929a] mb-1">
                  Notion Internal Integration Secret
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-[#717b85] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#0b0c0e] border border-[#2b3137] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel text-[#8a929a] mb-1">
                  Parent Notion Page ID (32-character ID in page URL)
                </label>
                <input
                  type="text"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  placeholder="e.g. 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
                  className="w-full bg-[#0b0c0e] border border-[#2b3137] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {syncStatus && (
                <div className={`p-2.5 rounded-lg text-xs ${
                  syncStatus.success 
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                }`}>
                  {syncStatus.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSyncing || !apiKey.trim() || !pageId.trim()}
                className="w-full py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-cinzel font-bold text-xs rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <FolderSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing to Notion...' : 'Push Wiki to Notion'}</span>
              </button>
            </form>
          </div>

          {/* Quick Setup Instructions */}
          <div className="text-xs text-[#717b85] space-y-1.5 border-t border-[#252a30] pt-3">
            <div className="font-cinzel text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c99a45]" />
              <span>How Notion Auto-Wiki Works</span>
            </div>
            <p>
              1. As your party plays, voice speech recorded via the chat mic is automatically timestamped and attributed to each Witcher.
            </p>
            <p>
              2. Download the bundle or sync via API at the end of each session to keep an evolving, permanent chronicle in your Notion workspace!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#121416] border-t border-[#262b30] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#22272c] hover:bg-[#2d343c] text-xs font-cinzel text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
