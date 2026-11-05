import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Award, 
  Sword, 
  Shield, 
  Check 
} from 'lucide-react';
import { 
  CampaignEconomyState, 
  WitcherCharacter, 
  WitcherSchool, 
  ItemCategory 
} from '../types';

interface DMInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost?: boolean;
  economyState: CampaignEconomyState;
  characters: Record<string, WitcherCharacter>;
  onAwardReward: (
    recipientSchool: WitcherSchool,
    goldAmount: number,
    itemId: string | null,
    reasonType: 'roleplay' | 'exploration' | 'investigation' | 'combat' | 'custom',
    note: string
  ) => void;
  onReclaimItem: (itemId: string) => void;
}

export const DMInventoryModal: React.FC<DMInventoryModalProps> = ({
  isOpen,
  onClose,
  economyState,
  characters,
  onAwardReward,
  onReclaimItem,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<WitcherSchool>('Wolf');
  const [activeTab, setActiveTab] = useState<'reward' | 'vault' | 'party' | 'log'>('reward');
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState<'all' | ItemCategory>('all');
  
  // Custom reward inputs
  const [rewardType, setRewardType] = useState<'roleplay' | 'exploration' | 'investigation' | 'combat' | 'custom'>('roleplay');
  const [customGold, setCustomGold] = useState<string>('25');
  const [selectedVaultItemId, setSelectedVaultItemId] = useState<string>('');
  const [rewardNote, setRewardNote] = useState<string>('');
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const characterList = Object.values(characters);
  const targetCharacter = characters[selectedSchool] || characterList.find(c => c.school === selectedSchool);

  // Filtered vault items
  const vaultItems = economyState.vaultItems.filter(item => {
    if (vaultCategoryFilter === 'all') return true;
    return item.category === vaultCategoryFilter;
  });

  // Calculate party total gold
  const partyTotalGold = characterList.reduce((acc, c) => acc + (c.gold || 0), 0);

  const handleApplyReward = () => {
    const goldNum = parseInt(customGold, 10);
    const goldToGive = isNaN(goldNum) || goldNum < 0 ? 0 : Math.min(economyState.dmVaultGold, goldNum);
    
    if (goldToGive <= 0 && !selectedVaultItemId) {
      setConfirmationNotice('Please select an amount of gold or an item to reward.');
      return;
    }

    const noteText = rewardNote.trim() || (
      rewardType === 'roleplay' ? 'Commendable roleplay and Witcher code fidelity' :
      rewardType === 'exploration' ? 'Discovered hidden secret area on the Path' :
      rewardType === 'investigation' ? 'Perceptive questioning and forensic inquiry' :
      rewardType === 'combat' ? 'Valor in battle and monster contract fulfillment' : 'Game Master special award'
    );

    onAwardReward(
      selectedSchool,
      goldToGive,
      selectedVaultItemId || null,
      rewardType,
      noteText
    );

    const recipientName = targetCharacter ? targetCharacter.name : selectedSchool;
    setConfirmationNotice(`✅ Awarded ${goldToGive > 0 ? `${goldToGive} Orens ` : ''}${selectedVaultItemId ? 'and loot ' : ''}to ${recipientName}!`);
    setTimeout(() => setConfirmationNotice(null), 3500);

    // Reset inputs
    setSelectedVaultItemId('');
    setRewardNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#121417] border-2 border-[#c99a45] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#d6d9dc]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="bg-[#181b20] border-b border-[#2d333b] px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c99a45]/20 border border-[#c99a45]/40 text-[#c99a45]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-lg font-bold text-white tracking-wide">
                  DM Screen Inventory & Reward Vault
                </h2>
                <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Finite Economy
                </span>
              </div>
              <p className="text-xs text-[#8a929a] font-cormorant italic">
                Distribute finite gold, starter armor sets, and masterwork swords to reward exploration and roleplay. Zero duplicates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#20252b] hover:bg-[#2d343d] text-[#8a929a] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Economy Status Strip */}
        <div className="bg-[#101214] border-b border-[#262c33] px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[#8a929a]">Vault Reserve:</span>
              <span className="font-mono font-bold text-[#c99a45] text-sm flex items-center gap-1">
                🪙 {economyState.dmVaultGold.toLocaleString()} <span className="text-[10px] text-[#6d7680]">/ {economyState.totalRealmGold} Orens</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8a929a]">Party Circulation:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                🪙 {partyTotalGold.toLocaleString()} Orens
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8a929a]">Unique Items in Vault:</span>
              <span className="font-mono font-bold text-amber-300">
                {economyState.vaultItems.length} Available
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#181b20] p-0.5 rounded-lg border border-[#2d333b]">
            <button
              onClick={() => setActiveTab('reward')}
              className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-colors ${
                activeTab === 'reward' ? 'bg-[#c99a45] text-black shadow' : 'text-[#8a929a] hover:text-white'
              }`}
            >
              Reward Station
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-colors ${
                activeTab === 'vault' ? 'bg-[#c99a45] text-black shadow' : 'text-[#8a929a] hover:text-white'
              }`}
            >
              Finite Vault ({economyState.vaultItems.length})
            </button>
            <button
              onClick={() => setActiveTab('party')}
              className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-colors ${
                activeTab === 'party' ? 'bg-[#c99a45] text-black shadow' : 'text-[#8a929a] hover:text-white'
              }`}
            >
              Party Loadouts
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-colors ${
                activeTab === 'log' ? 'bg-[#c99a45] text-black shadow' : 'text-[#8a929a] hover:text-white'
              }`}
            >
              History ({economyState.rewardLog.length})
            </button>
          </div>
        </div>

        {confirmationNotice && (
          <div className="bg-emerald-950/70 border-b border-emerald-600/50 text-emerald-300 px-4 py-2 text-xs font-cinzel font-bold text-center shrink-0">
            {confirmationNotice}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* TAB 1: REWARD STATION */}
          {activeTab === 'reward' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Recipient Selection & Presets */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-wider mb-2">
                    1. Select Recipient Witcher
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Wolf', 'Cat', 'Griffin', 'Bear'] as WitcherSchool[]).map((school) => {
                      const char = characters[school] || characterList.find(c => c.school === school);
                      const isSelected = selectedSchool === school;
                      return (
                        <button
                          key={school}
                          onClick={() => setSelectedSchool(school)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            isSelected 
                              ? 'bg-[#c99a45]/20 border-[#c99a45] shadow-lg ring-1 ring-[#c99a45]' 
                              : 'bg-[#181b20] border-[#2b313a] hover:border-[#3e4652]'
                          }`}
                        >
                          {char && (
                            <img 
                              src={char.avatarUrl} 
                              alt={char.name} 
                              className="w-9 h-9 rounded-lg object-cover object-top border border-[#c99a45]/40 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-cinzel text-xs font-bold text-white truncate">
                              {char ? char.name.split(' ')[0] : school}
                            </div>
                            <div className="text-[10px] text-amber-300/80 font-mono flex items-center gap-1">
                              🪙 {char?.gold || 0} Orens
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reward Category Reason */}
                <div>
                  <label className="block text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-wider mb-2">
                    2. Select Reward Objective
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'roleplay', label: '🎭 Roleplaying', desc: 'Poignant dialogue & code', defaultGold: '30' },
                      { id: 'exploration', label: '🔍 Exploration', desc: 'Discovered secret areas', defaultGold: '35' },
                      { id: 'investigation', label: '❓ Questions / Clues', desc: 'Inquisitive interrogation', defaultGold: '25' },
                      { id: 'combat', label: '⚔️ Combat / Bounty', desc: 'Monster slain or bounty', defaultGold: '75' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setRewardType(cat.id as any);
                          setCustomGold(cat.defaultGold);
                        }}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          rewardType === cat.id 
                            ? 'bg-amber-950/40 border-amber-500 text-white' 
                            : 'bg-[#16181b] border-[#292f37] text-[#8a929a] hover:border-[#3a424e]'
                        }`}
                      >
                        <div className="text-xs font-cinzel font-bold text-amber-200">{cat.label}</div>
                        <div className="text-[10px] text-[#717a85] font-cormorant italic">{cat.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gold Grant Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-wider">
                      Gold Reward (Orens)
                    </label>
                    <span className="text-[10px] text-[#8a929a]">
                      Max available: {economyState.dmVaultGold}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {['15', '25', '35', '50', '100', '250'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCustomGold(amt)}
                        className={`px-2.5 py-1 rounded border text-xs font-mono font-bold transition-colors ${
                          customGold === amt
                            ? 'bg-[#c99a45] text-black border-[#c99a45]'
                            : 'bg-[#181b20] border-[#2f3640] text-amber-300 hover:bg-[#22272e]'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-amber-400 font-mono text-sm">🪙</span>
                    <input
                      type="number"
                      value={customGold}
                      onChange={(e) => setCustomGold(e.target.value)}
                      placeholder="Custom gold amount"
                      className="w-full bg-[#181a1d] border border-[#2e353e] rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#c99a45] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Loot Item Selection & Confirm */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-wider">
                      3. Grant Item from Vault (Optional)
                    </label>
                    <span className="text-[10px] text-[#8a929a]">
                      Finite items in reserve ({economyState.vaultItems.length})
                    </span>
                  </div>

                  {economyState.vaultItems.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-[#2d333b] text-center text-xs text-[#717a85] font-cormorant italic">
                      All finite campaign items are currently in player hands!
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-[#262c33] rounded-xl p-2 bg-[#0e1012]">
                      <div
                        onClick={() => setSelectedVaultItemId('')}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                          selectedVaultItemId === '' 
                            ? 'bg-amber-950/30 border-amber-500/50 text-white' 
                            : 'bg-[#15171a] border-[#262b32] text-[#8a929a] hover:bg-[#1a1d21]'
                        }`}
                      >
                        <span className="font-cinzel italic">No item (Gold only)</span>
                        {selectedVaultItemId === '' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>

                      {economyState.vaultItems.map((item) => {
                        const isChosen = selectedVaultItemId === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedVaultItemId(item.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start justify-between gap-2.5 transition-all ${
                              isChosen 
                                ? 'bg-[#c99a45]/20 border-[#c99a45] text-white shadow' 
                                : 'bg-[#16181b] border-[#292f37] hover:border-[#3d4551] text-[#c2c7cd]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-cinzel font-bold text-white text-xs">{item.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  item.rarity === 'Relic' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' :
                                  item.rarity === 'Masterwork' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                                  'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {item.rarity}
                                </span>
                                <span className="text-[10px] text-[#c99a45] font-mono">
                                  🪙 {item.valueGold} Orens
                                </span>
                              </div>
                              <p className="text-[11px] text-[#8a929a] line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                              {item.properties && item.properties.length > 0 && (
                                <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                                  ⚔️ {item.properties.join(' • ')}
                                </div>
                              )}
                            </div>
                            {isChosen && <Check className="w-4 h-4 text-[#c99a45] shrink-0 mt-1" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Reward Custom Note */}
                <div>
                  <label className="block text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-wider mb-1.5">
                    4. Log Entry & Roleplay Commendation
                  </label>
                  <input
                    type="text"
                    value={rewardNote}
                    onChange={(e) => setRewardNote(e.target.value)}
                    placeholder="e.g. Decoded King Elidyr's ancient riddle or Slew the barghest pack"
                    className="w-full bg-[#181a1d] border border-[#2e353e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99a45]"
                  />
                </div>

                {/* Grant Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleApplyReward}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c99a45] to-[#dfb25d] hover:from-[#dfb25d] hover:to-[#e9c475] text-black font-cinzel font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                  >
                    <Award className="w-4 h-4 text-black" />
                    <span>
                      Award Reward to {targetCharacter ? targetCharacter.name : selectedSchool}
                    </span>
                  </button>
                  <p className="text-[10px] text-[#6f7882] text-center mt-1.5 font-cormorant italic">
                    Deducts gold directly from DM Vault, records into party logs, and syncs over P2P.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINITE VAULT BROWSER */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'armor', label: 'Armor Sets' },
                    { id: 'steel_sword', label: 'Steel Swords' },
                    { id: 'silver_sword', label: 'Silver Swords' },
                    { id: 'potion', label: 'Potions' },
                    { id: 'bomb', label: 'Bombs' },
                    { id: 'oil', label: 'Oils' },
                    { id: 'quest', label: 'Quest & Relics' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setVaultCategoryFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-cinzel transition-colors ${
                        vaultCategoryFilter === f.id
                          ? 'bg-[#c99a45] text-black font-bold'
                          : 'bg-[#181b20] text-[#8a929a] hover:text-white border border-[#2d333b]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-[#8a929a] font-mono">
                  {vaultItems.length} unique items in DM Vault
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vaultItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-xl bg-[#16181b] border border-[#2b313a] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel text-xs font-bold text-white">{item.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              item.rarity === 'Relic' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' :
                              item.rarity === 'Masterwork' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                              'bg-zinc-800 text-zinc-300'
                            }`}>
                              {item.rarity}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#c99a45] font-mono">
                            🪙 Value: {item.valueGold} Cintrian Orens
                          </span>
                        </div>

                        <span className="text-[10px] font-cinzel px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-[#8a929a] font-cormorant italic mt-1.5">
                        {item.description}
                      </p>

                      {item.armorClass && (
                        <div className="mt-1.5 text-xs text-sky-400 font-mono flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Armor Class: {item.armorClass} ({item.weightCategory || 'Medium'})</span>
                        </div>
                      )}

                      {item.damage && (
                        <div className="mt-1.5 text-xs text-rose-400 font-mono flex items-center gap-1.5">
                          <Sword className="w-3.5 h-3.5" />
                          <span>Damage: {item.damage} {item.isSilver ? '(Silver)' : '(Steel)'}</span>
                        </div>
                      )}

                      {item.effect && (
                        <div className="mt-1.5 text-xs text-emerald-400 font-mono">
                          ✨ Effect: {item.effect}
                        </div>
                      )}

                      {item.discoverySource && (
                        <div className="mt-1 text-[10px] text-amber-400/80 font-cormorant italic">
                          📍 Origin: {item.discoverySource}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#262c33] flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        🏛️ In DM Vault
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(['Wolf', 'Cat', 'Griffin', 'Bear'] as WitcherSchool[]).map((school) => (
                          <button
                            key={school}
                            onClick={() => {
                              onAwardReward(school, 0, item.id, 'exploration', `Discovered ${item.name}`);
                              setConfirmationNotice(`Granted ${item.name} to ${school}!`);
                              setTimeout(() => setConfirmationNotice(null), 3000);
                            }}
                            className="px-2 py-1 rounded bg-[#20252b] hover:bg-[#c99a45] hover:text-black border border-[#303841] text-[10px] font-cinzel font-bold text-amber-300 transition-colors"
                            title={`Give to ${school}`}
                          >
                            + {school}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PARTY LOADOUTS & INVENTORIES */}
          {activeTab === 'party' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characterList.map((char) => {
                const charItems = char.inventory || [];
                return (
                  <div 
                    key={char.id}
                    className="p-4 rounded-xl bg-[#16181b] border border-[#2d333b] space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#262b32]">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={char.avatarUrl} 
                          alt={char.name} 
                          className="w-10 h-10 rounded-lg object-cover object-top border border-[#c99a45]/40"
                        />
                        <div>
                          <div className="font-cinzel text-xs font-bold text-white">{char.name}</div>
                          <div className="text-[10px] text-[#c99a45] font-cinzel">{char.school} School Witcher</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-300 text-sm">🪙 {char.gold || 0} Orens</div>
                        <div className="text-[10px] text-[#8a929a]">AC {char.armorClass} • HP {char.currentHp}/{char.maxHp}</div>
                      </div>
                    </div>

                    {/* Equipped Armor Set */}
                    <div className="p-2.5 rounded-lg bg-[#0e1012] border border-[#23282f] text-xs">
                      <div className="text-[10px] font-cinzel text-[#8a929a] uppercase">Equipped Armor Set</div>
                      <div className="font-cinzel font-bold text-white text-xs mt-0.5">
                        {char.equippedArmor?.name || 'Standard Witcher Leather'}
                      </div>
                      <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                        AC {char.equippedArmor?.armorClass || char.armorClass} • {char.equippedArmor?.weightCategory || 'Medium'} Armor
                      </div>
                    </div>

                    {/* Weapons */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-[#0e1012] border border-[#23282f]">
                        <div className="text-[9px] font-cinzel text-[#8a929a] uppercase">Steel Sword</div>
                        <div className="font-cinzel text-xs text-zinc-200 truncate mt-0.5">{char.steelWeapon?.name}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0e1012] border border-[#23282f]">
                        <div className="text-[9px] font-cinzel text-[#8a929a] uppercase">Silver Sword</div>
                        <div className="font-cinzel text-xs text-amber-200 truncate mt-0.5">{char.silverWeapon?.name}</div>
                      </div>
                    </div>

                    {/* Carried Items in Backpack */}
                    <div>
                      <div className="text-[10px] font-cinzel text-[#8a929a] uppercase mb-1">
                        Backpack & Finite Gear ({charItems.length} items)
                      </div>
                      {charItems.length === 0 ? (
                        <p className="text-[11px] text-[#5b636d] italic">Backpack empty</p>
                      ) : (
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {charItems.map((item) => (
                            <div 
                              key={item.id}
                              className="px-2 py-1.5 rounded bg-[#101215] border border-[#23282f] text-xs flex items-center justify-between gap-2"
                            >
                              <div className="truncate min-w-0">
                                <span className="text-white text-[11px] font-cinzel">{item.name}</span>
                                {item.charges !== undefined && (
                                  <span className="text-[10px] text-amber-400/80 font-mono ml-1.5">
                                    ({item.charges}/{item.maxCharges} charges)
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  onReclaimItem(item.id);
                                  setConfirmationNotice(`Reclaimed ${item.name} back to DM Vault.`);
                                  setTimeout(() => setConfirmationNotice(null), 3000);
                                }}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[9px] text-zinc-300 font-mono shrink-0 transition-colors"
                                title="Reclaim item to DM Vault"
                              >
                                Reclaim
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: REWARD LEDGER / HISTORY */}
          {activeTab === 'log' && (
            <div className="space-y-2">
              <h3 className="font-cinzel text-xs font-bold text-[#c99a45] uppercase tracking-wider mb-2">
                Session Reward & Economy Audit Trail
              </h3>

              {economyState.rewardLog.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[#2b313a] text-center text-xs text-[#717a85] font-cormorant italic">
                  No rewards have been granted yet this session. Reward players from the Reward Station tab.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {economyState.rewardLog.slice().reverse().map((entry) => (
                    <div 
                      key={entry.id}
                      className="p-3 rounded-lg bg-[#16181b] border border-[#262c33] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-white">{entry.recipientName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-mono">
                            {entry.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8a929a] font-cormorant italic mt-0.5">
                          "{entry.note}"
                        </p>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        {entry.amountGold ? (
                          <div className="text-amber-300 font-bold">🪙 +{entry.amountGold} Orens</div>
                        ) : null}
                        {entry.itemName ? (
                          <div className="text-purple-300 text-[11px]">📦 {entry.itemName}</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
