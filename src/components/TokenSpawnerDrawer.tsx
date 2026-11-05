import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Shield, 
  Heart, 
  Sparkles, 
  Users, 
  Skull, 
  Compass, 
  Swords, 
  EyeOff, 
  Layers, 
  UserPlus, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { MapToken } from '../types';
import { MONSTERS } from '../data/monsters';
import { PREGEN_WITCHERS } from '../data/characters';
import { NPCS } from '../data/npcs';
import { scaleMonsterHp, scaleMonsterAttack, scaleDamageFormula } from '../utils/monsterScaling';

export interface SpawnableEntity {
  id: string;
  name: string;
  title: string;
  category: string;
  type: 'monster' | 'witcher' | 'npc';
  ac: number;
  hp: number;
  maxHp: number;
  speed: string;
  avatarUrl: string;
  color: string;
  description: string;
  witcherTactics: string;
  attacks: { name: string; damage: string; description: string }[];
  specialAbilities?: { name: string; description: string }[];
  cr?: string;
  role?: string;
}

interface TokenSpawnerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawnToken: (token: MapToken, count?: number) => void;
  tokens: MapToken[];
  onRemoveToken?: (tokenId: string) => void;
  onClearCategory?: (category: 'monsters' | 'npcs' | 'all') => void;
  onUpdateTokenHp?: (tokenId: string, delta: number) => void;
  partySize?: number;
}

type TabType = 'all' | 'monsters' | 'characters' | 'npcs' | 'custom' | 'active';

export const TokenSpawnerDrawer: React.FC<TokenSpawnerDrawerProps> = ({
  isOpen,
  onClose,
  onSpawnToken,
  tokens,
  onRemoveToken,
  onClearCategory,
  onUpdateTokenHp,
  partySize = 1,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [spawnHidden, setSpawnHidden] = useState(false);
  const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);

  // Custom token creation state
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customHp, setCustomHp] = useState(30);
  const [customAc, setCustomAc] = useState(14);
  const [customColor, setCustomColor] = useState('#ef4444');
  const [customIsMonster, setCustomIsMonster] = useState(true);
  const [customAvatar, setCustomAvatar] = useState('/assets/monsters/leshen.jpg');

  // Convert monsters to unified spawnable item
  const monsterItems: SpawnableEntity[] = useMemo(() => {
    return MONSTERS.map((m) => ({
      id: m.id,
      name: m.name,
      title: m.title,
      category: m.category,
      type: 'monster' as const,
      ac: m.ac,
      hp: m.hp,
      maxHp: m.maxHp,
      speed: m.speed,
      avatarUrl: m.imageUrl,
      color: '#ef4444',
      description: m.lore,
      witcherTactics: m.witcherTactics,
      attacks: m.attacks.map((a) => ({
        name: a.name,
        damage: a.damage,
        description: a.description,
      })),
      specialAbilities: m.specialAbilities,
      cr: m.cr,
    }));
  }, []);

  // Convert witcher characters to unified spawnable item
  const witcherItems: SpawnableEntity[] = useMemo(() => {
    return PREGEN_WITCHERS.map((w) => ({
      id: w.id,
      name: w.name,
      title: `${w.title} (School of the ${w.school})`,
      category: `School of the ${w.school}`,
      type: 'witcher' as const,
      ac: w.armorClass,
      hp: w.currentHp,
      maxHp: w.maxHp,
      speed: `${w.speed} ft`,
      avatarUrl: w.avatarUrl,
      color: w.school === 'Wolf' ? '#c99a45' : w.school === 'Cat' ? '#06b6d4' : w.school === 'Griffin' ? '#a855f7' : '#f43f5e',
      description: w.backstory.slice(0, 160) + '...',
      witcherTactics: `Special Perk: ${w.schoolPerk.name} - ${w.schoolPerk.description}`,
      attacks: [
        {
          name: w.silverWeapon.name,
          damage: w.silverWeapon.damage,
          description: w.silverWeapon.description,
        },
        {
          name: w.steelWeapon.name,
          damage: w.steelWeapon.damage,
          description: w.steelWeapon.description,
        },
      ],
      specialAbilities: [
        {
          name: `School of the ${w.school}: ${w.schoolPerk.name}`,
          description: w.schoolPerk.description,
        },
      ],
      cr: `Level ${w.level}`,
    }));
  }, []);

  // Convert NPCs to unified spawnable item
  const npcItems: SpawnableEntity[] = useMemo(() => {
    return NPCS.map((n) => ({
      id: n.id,
      name: n.name,
      title: n.title,
      category: n.category,
      type: 'npc' as const,
      role: n.role,
      ac: n.ac,
      hp: n.hp,
      maxHp: n.maxHp,
      speed: n.speed,
      avatarUrl: n.avatarUrl,
      color: n.color,
      description: n.description,
      witcherTactics: `Appears in: ${n.actPresence}. Alignment: ${n.role}.`,
      attacks: (n.attacks || []).map((a) => ({
        name: a.name,
        damage: a.damage,
        description: a.description,
      })),
      specialAbilities: n.specialAbilities || [],
      cr: n.role,
    }));
  }, []);

  // All items combined
  const allSpawnableItems: SpawnableEntity[] = useMemo(() => {
    return [...monsterItems, ...witcherItems, ...npcItems];
  }, [monsterItems, witcherItems, npcItems]);

  // Filtered by tab and search
  const displayedItems: SpawnableEntity[] = useMemo(() => {
    let list = allSpawnableItems;
    if (activeTab === 'monsters') list = monsterItems;
    else if (activeTab === 'characters') list = witcherItems;
    else if (activeTab === 'npcs') list = npcItems;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [allSpawnableItems, monsterItems, witcherItems, npcItems, activeTab, searchQuery]);

  // Handle spawn action
  const handleSpawn = (item: SpawnableEntity, count: number = 1) => {
    const isMonster = item.type === 'monster' || (item.type === 'npc' && item.role === 'Hostile');
    const effectivePartySize = Math.max(1, Math.min(4, Math.floor(partySize || 1)));
    const tokenMaxHp = isMonster ? scaleMonsterHp(item.hp, effectivePartySize) : item.maxHp;
    const tokenCurrentHp = tokenMaxHp;

    const originalMonster = MONSTERS.find((m) => m.id === item.id);
    const originalNpc = NPCS.find((n) => n.id === item.id);
    const rawAttacks = originalMonster?.attacks || (originalNpc?.attacks ? originalNpc.attacks.map((a) => ({
      name: a.name,
      bonus: a.bonus,
      damage: a.damage,
      damageType: 'damageType' in a ? (a as any).damageType : 'Physical',
      description: a.description,
    })) : undefined);
    const scaledAttacks = isMonster && rawAttacks ? rawAttacks.map((a) => scaleMonsterAttack(a, effectivePartySize)) : undefined;

    for (let i = 0; i < count; i++) {
      // Fan out slightly around center
      const offsetX = (Math.random() - 0.5) * 16;
      const offsetY = (Math.random() - 0.5) * 16;

      const newToken: MapToken = {
        id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: count > 1 ? `${item.name} #${i + 1}` : item.name,
        school: item.type === 'witcher' ? (item.category.replace('School of the ', '') as any) : undefined,
        isMonster,
        avatarUrl: item.avatarUrl,
        x: Math.max(10, Math.min(90, 48 + offsetX)),
        y: Math.max(15, Math.min(85, 45 + offsetY)),
        baseMaxHp: item.hp,
        currentHp: tokenCurrentHp,
        maxHp: tokenMaxHp,
        scaledPartySize: isMonster ? effectivePartySize : undefined,
        attacks: scaledAttacks,
        monsterId: item.id,
        color: item.color,
        isHiddenFromPlayers: spawnHidden,
        ac: item.ac,
        category: item.category,
        title: item.title,
        tokenType: item.type,
      };

      onSpawnToken(newToken, count);
    }
  };

  // Handle spawn custom token
  const handleSpawnCustom = () => {
    if (!customName.trim()) return;

    const effectivePartySize = Math.max(1, Math.min(4, Math.floor(partySize || 1)));
    const tokenMaxHp = customIsMonster ? scaleMonsterHp(customHp, effectivePartySize) : customHp;

    const newToken: MapToken = {
      id: `token-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customName.trim(),
      isMonster: customIsMonster,
      avatarUrl: customAvatar,
      x: 48 + (Math.random() - 0.5) * 10,
      y: 45 + (Math.random() - 0.5) * 10,
      baseMaxHp: customHp,
      currentHp: tokenMaxHp,
      maxHp: tokenMaxHp,
      scaledPartySize: customIsMonster ? effectivePartySize : undefined,
      color: customColor,
      isHiddenFromPlayers: spawnHidden,
      ac: customAc,
      category: customIsMonster ? 'Custom Monster' : 'Custom NPC',
      title: customTitle.trim() || (customIsMonster ? 'Monstrous Beast' : 'Citizen of Cintra'),
      tokenType: 'custom',
    };

    onSpawnToken(newToken);
    setCustomName('');
    setCustomTitle('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container Panel */}
      <div className="relative w-full max-w-2xl bg-[#111315] border-l border-[#2e353d] shadow-2xl flex flex-col h-full z-10 text-[#d6d9dc]">
        
        {/* Drawer Header */}
        <div className="bg-[#16181b] border-b border-[#282e35] p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-950 to-[#221013] border border-red-700/60 flex items-center justify-center text-red-400 shadow-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Tactical Entity Spawner</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 font-bold">
                  {tokens.length} on Map
                </span>
              </h2>
              <p className="text-xs text-[#8a929a]">
                Spawn Monsters, Witcher Characters, and Cintrian NPCs onto the active battle map
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1f2328] hover:bg-[#2b3138] text-[#8a929a] hover:text-white transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Ambush Toggle */}
        <div className="bg-[#141618] border-b border-[#262c33] p-3 sm:px-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#727a82]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search monsters, witchers, soldiers, bailiffs..."
              className="w-full pl-9 pr-8 py-2 bg-[#1a1d20] border border-[#2d343c] rounded-lg text-xs text-white placeholder-[#727a82] focus:outline-none focus:border-[#c99a45] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727a82] hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Ambush / Hidden from players toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1b1e22] border border-[#2d353e] cursor-pointer hover:border-[#3c4652] transition-colors shrink-0 select-none">
            <input
              type="checkbox"
              checked={spawnHidden}
              onChange={(e) => setSpawnHidden(e.target.checked)}
              className="rounded bg-[#121416] border-[#3e4752] text-[#c99a45] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-xs font-cinzel text-[#b5bcc4] flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Spawn Hidden (Ambush)</span>
            </span>
          </label>
        </div>

        {/* Tab Selector Strip */}
        <div className="bg-[#121416] border-b border-[#252a30] px-3 sm:px-5 flex items-center gap-1 overflow-x-auto shrink-0 py-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Entities', icon: Layers, count: allSpawnableItems.length },
            { id: 'monsters', label: 'Monsters', icon: Skull, count: monsterItems.length },
            { id: 'characters', label: 'Witchers', icon: Swords, count: witcherItems.length },
            { id: 'npcs', label: 'Cintrian NPCs', icon: Users, count: npcItems.length },
            { id: 'active', label: 'On Map', icon: Compass, count: tokens.length },
            { id: 'custom', label: 'Create Custom', icon: Plus, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-cinzel transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#c99a45] text-black font-bold shadow-md shadow-[#c99a45]/20'
                    : 'bg-[#181a1d] text-[#8a929a] hover:text-white border border-[#292f36]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/30 text-black' : 'bg-[#242b32] text-[#8a929a]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-0">
          
          {/* TAB: ACTIVE TOKENS ON MAP */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#252b31]">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#c99a45]" />
                    <span>Currently Placed Tokens ({tokens.length})</span>
                  </h3>
                  <p className="text-xs text-[#8a929a] mt-0.5">Manage and monitor tokens active on the map</p>
                </div>

                {onClearCategory && tokens.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onClearCategory('monsters')}
                      className="px-2.5 py-1 text-xs bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 text-red-300 font-cinzel rounded transition-colors"
                      title="Clear all monsters and hostile tokens from the map"
                    >
                      Clear Monsters
                    </button>
                    <button
                      onClick={() => onClearCategory('all')}
                      className="px-2.5 py-1 text-xs bg-[#22272c] hover:bg-[#2e353c] border border-[#3b444e] text-[#8a929a] hover:text-white font-cinzel rounded transition-colors"
                      title="Clear all tokens from map"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {tokens.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#2c333a] bg-[#141618]">
                  <Compass className="w-10 h-10 text-[#505860] mx-auto mb-2" />
                  <p className="font-cinzel text-sm text-[#8a929a]">No tokens currently placed on the battle map</p>
                  <p className="text-xs text-[#626c75] mt-1">
                    Select any monster, witcher, or NPC from the tabs above to spawn them!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="p-3 rounded-xl bg-[#15171a] border border-[#282e35] flex items-center justify-between gap-3 hover:border-[#38414b] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={token.avatarUrl}
                          alt={token.name}
                          className="w-10 h-10 rounded-full object-cover object-top border-2 shrink-0"
                          style={{ borderColor: token.color || (token.isMonster ? '#ef4444' : '#c99a45') }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel text-xs font-bold text-white truncate">
                              {token.name}
                            </span>
                            {token.isHiddenFromPlayers && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-500/40">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#8a929a] font-mono mt-0.5">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {token.currentHp ?? token.maxHp} / {token.maxHp} HP
                            </span>
                            <span>•</span>
                            <span>
                              Pos ({Math.round(token.x)}%, {Math.round(token.y)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* HP Quick Adjusters */}
                        {onUpdateTokenHp && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdateTokenHp(token.id, -5)}
                              className="px-2 py-0.5 text-[10px] bg-rose-950/40 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded"
                              title="Damage 5 HP"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => onUpdateTokenHp(token.id, 5)}
                              className="px-2 py-0.5 text-[10px] bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 rounded"
                              title="Heal 5 HP"
                            >
                              +5
                            </button>
                          </div>
                        )}

                        {/* Remove Token */}
                        {onRemoveToken && (
                          <button
                            onClick={() => onRemoveToken(token.id)}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-white transition-colors"
                            title="Remove token from map"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CUSTOM TOKEN CREATOR */}
          {activeTab === 'custom' && (
            <div className="p-5 rounded-xl bg-[#141618] border border-[#2b3138] space-y-4">
              <div className="border-b border-[#252b31] pb-3">
                <h3 className="font-cinzel text-sm font-bold text-[#e2ba6d] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c99a45]" />
                  <span>Create & Spawn Custom Token</span>
                </h3>
                <p className="text-xs text-[#8a929a] mt-0.5">
                  Build and immediately drop any custom monster, allied NPC, or unique minion onto the battle map
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#a2abb4] mb-1">Entity Name *</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Cintrian Royal Inquisitor"
                    className="w-full px-3 py-2 bg-[#1b1e22] border border-[#2d353e] rounded-lg text-xs text-white placeholder-[#626a73] focus:outline-none focus:border-[#c99a45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#a2abb4] mb-1">Title / Subtitle</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Zealot of the Eternal Fire"
                    className="w-full px-3 py-2 bg-[#1b1e22] border border-[#2d353e] rounded-lg text-xs text-white placeholder-[#626a73] focus:outline-none focus:border-[#c99a45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#a2abb4] mb-1">Hit Points (HP)</label>
                  <input
                    type="number"
                    value={customHp}
                    onChange={(e) => setCustomHp(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-[#1b1e22] border border-[#2d353e] rounded-lg text-xs text-white focus:outline-none focus:border-[#c99a45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#a2abb4] mb-1">Armor Class (AC)</label>
                  <input
                    type="number"
                    value={customAc}
                    onChange={(e) => setCustomAc(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-full px-3 py-2 bg-[#1b1e22] border border-[#2d353e] rounded-lg text-xs text-white focus:outline-none focus:border-[#c99a45]"
                  />
                </div>
              </div>

              {/* Entity Type & Ring Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-cinzel text-[#a2abb4] mb-1">Token Category</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCustomIsMonster(true);
                        setCustomColor('#ef4444');
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-cinzel border transition-all ${
                        customIsMonster
                          ? 'bg-red-950/50 border-red-500 text-red-300 font-bold'
                          : 'bg-[#181a1d] border-[#292f36] text-[#8a929a]'
                      }`}
                    >
                      Monster / Hostile
                    </button>
                    <button
                      onClick={() => {
                        setCustomIsMonster(false);
                        setCustomColor('#3b82f6');
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-cinzel border transition-all ${
                        !customIsMonster
                          ? 'bg-sky-950/50 border-sky-500 text-sky-300 font-bold'
                          : 'bg-[#181a1d] border-[#292f36] text-[#8a929a]'
                      }`}
                    >
                      NPC / Friendly
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#a2abb4] mb-1">Token Border Color</label>
                  <div className="flex items-center gap-2">
                    {['#ef4444', '#3b82f6', '#c99a45', '#10b981', '#a855f7', '#06b6d4', '#f59e0b'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setCustomColor(col)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          customColor === col ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: col, borderColor: '#ffffff40' }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-cinzel text-[#a2abb4] mb-1.5">Choose Avatar Artwork</label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 overflow-x-auto pb-1">
                  {[
                    { url: '/assets/monsters/leshen.jpg', label: 'Leshen' },
                    { url: '/assets/monsters/fiend.jpg', label: 'Chort' },
                    { url: '/assets/monsters/barghest.jpg', label: 'Hound' },
                    { url: '/assets/monsters/gravehag.jpg', label: 'Hag' },
                    { url: '/assets/npcs/sir_danek.jpg', label: 'Danek' },
                    { url: '/assets/npcs/baron_raymond.jpg', label: 'Baron' },
                    { url: '/assets/npcs/corvus_steward.jpg', label: 'Corvus' },
                    { url: '/assets/npcs/cintrian_guard.jpg', label: 'Guard' },
                    { url: '/assets/npcs/kaelan_woodsman.jpg', label: 'Woodsman' },
                    { url: '/assets/npcs/elven_specter.jpg', label: 'Specter' },
                    { url: '/assets/characters/wolf.jpg', label: 'Wolf' },
                    { url: '/assets/characters/cat.jpg', label: 'Cat' },
                    { url: '/assets/characters/griffin.jpg', label: 'Griffin' },
                    { url: '/assets/characters/bear.jpg', label: 'Bear' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      onClick={() => setCustomAvatar(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                        customAvatar === preset.url
                          ? 'border-[#c99a45] ring-2 ring-[#c99a45]/60 scale-105'
                          : 'border-[#2c333a] hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover object-top" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-center text-white py-0.5 truncate px-0.5">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  onClick={handleSpawnCustom}
                  disabled={!customName.trim()}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#c99a45] to-[#e2ba6d] hover:from-[#b58735] hover:to-[#c99a45] disabled:opacity-50 text-black font-cinzel font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Spawn Custom Token Onto Battle Map</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: SPAWNABLE ENTITY CARDS (All, Monsters, Characters, NPCs) */}
          {activeTab !== 'active' && activeTab !== 'custom' && (
            <div className="space-y-3">
              {displayedItems.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#2c333a] bg-[#141618]">
                  <Search className="w-8 h-8 text-[#505860] mx-auto mb-2" />
                  <p className="font-cinzel text-sm text-[#8a929a]">No matching entities found</p>
                  <p className="text-xs text-[#626c75] mt-1">Try adjusting your search terms or switch category tabs</p>
                </div>
              ) : (
                displayedItems.map((item) => {
                  const isExpanded = expandedEntityId === item.id;
                  const activeOnMapCount = tokens.filter((t) => t.name.startsWith(item.name)).length;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#141618] border border-[#272d34] hover:border-[#38414b] p-3.5 transition-all shadow-md group"
                    >
                      {/* Top Row: Avatar, Identity, Stats & Primary Spawn */}
                      <div className="flex items-start justify-between gap-3">
                        
                        {/* Token Avatar & Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={item.avatarUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover object-top border-2 shadow-lg"
                              style={{ borderColor: item.color }}
                            />
                            {item.type === 'monster' ? (
                              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-red-950 border border-red-700 text-red-400">
                                <Skull className="w-3 h-3" />
                              </span>
                            ) : item.type === 'witcher' ? (
                              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300">
                                <Sparkles className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-sky-950 border border-sky-700 text-sky-300">
                                <Users className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-cinzel text-sm font-bold text-white group-hover:text-[#e2ba6d] transition-colors truncate">
                                {item.name}
                              </h4>
                              <span
                                className="text-[10px] font-cinzel font-bold px-1.5 py-0.2 rounded border"
                                style={{
                                  color: item.color,
                                  borderColor: `${item.color}50`,
                                  backgroundColor: `${item.color}15`,
                                }}
                              >
                                {item.category}
                              </span>
                              {activeOnMapCount > 0 && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                                  {activeOnMapCount} on Map
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#8a929a] font-cormorant italic truncate mt-0.5">
                              {item.title}
                            </p>

                            {/* Stat Badges */}
                            {(() => {
                              const isMonster = item.type === 'monster' || (item.type === 'npc' && item.role === 'Hostile');
                              const effectivePartySize = Math.max(1, Math.min(4, Math.floor(partySize || 1)));
                              const displayHp = isMonster ? scaleMonsterHp(item.hp, effectivePartySize) : item.hp;
                              return (
                                <div className="flex items-center gap-2.5 text-[11px] font-mono mt-1 text-[#a0aab4]">
                                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                    <Heart className="w-3 h-3" />
                                    {displayHp} HP
                                    {isMonster && effectivePartySize > 1 && (
                                      <span className="text-[10px] text-amber-300 font-normal">
                                        ({effectivePartySize}p scaled)
                                      </span>
                                    )}
                                  </span>
                                  <span>•</span>
                                  <span className="text-amber-300 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    AC {item.ac}
                                  </span>
                                  <span>•</span>
                                  <span className="text-[#8a929a]">{item.speed}</span>
                                  {item.cr && (
                                    <>
                                      <span>•</span>
                                      <span className="text-purple-300">{item.cr}</span>
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Spawning Actions Strip */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Multi-spawn for mobs/guards */}
                          {(item.type === 'monster' || item.type === 'npc') && (
                            <div className="hidden sm:flex items-center gap-1">
                              <button
                                onClick={() => handleSpawn(item, 2)}
                                className="px-2 py-1 bg-[#1a1d20] hover:bg-[#252a2f] border border-[#333a42] text-[#a0aab4] hover:text-white text-[11px] font-mono rounded"
                                title="Spawn 2 instances spread across map"
                              >
                                +2
                              </button>
                              <button
                                onClick={() => handleSpawn(item, 3)}
                                className="px-2 py-1 bg-[#1a1d20] hover:bg-[#252a2f] border border-[#333a42] text-[#a0aab4] hover:text-white text-[11px] font-mono rounded"
                                title="Spawn 3 instances spread across map"
                              >
                                +3
                              </button>
                            </div>
                          )}

                          {/* Primary 1-Click Spawn */}
                          <button
                            onClick={() => handleSpawn(item, 1)}
                            className="px-3 py-1.5 bg-[#c99a45] hover:bg-[#e2ba6d] text-black font-cinzel font-bold text-xs rounded-lg shadow-md shadow-[#c99a45]/20 flex items-center gap-1 transition-all active:scale-95"
                            title={`Spawn ${item.name} onto the tactical map`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Spawn</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Combat Details Toggle */}
                      <div className="mt-2.5 pt-2 border-t border-[#21262c] flex items-center justify-between text-xs">
                        <p className="text-[11px] text-[#78828c] line-clamp-1 flex-1 pr-2">
                          {item.description}
                        </p>
                        <button
                          onClick={() => setExpandedEntityId(isExpanded ? null : item.id)}
                          className="text-[11px] font-cinzel text-[#c99a45] hover:text-[#e2ba6d] flex items-center gap-1 shrink-0"
                        >
                          <span>{isExpanded ? 'Hide Stats' : 'View Attacks & Lore'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Expanded Combat & Tactics View */}
                      {isExpanded && (
                        <div className="mt-3 p-3 rounded-lg bg-[#0e1011] border border-[#22272c] space-y-2.5 text-xs animate-in fade-in duration-150">
                          {/* Tactics / Presence */}
                          <p className="text-[#c2cad2] font-cormorant italic leading-relaxed text-sm">
                            {item.witcherTactics}
                          </p>

                          {/* Attacks */}
                          {item.attacks && item.attacks.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <div className="font-cinzel text-[10px] font-bold text-[#c99a45] uppercase tracking-wider">
                                Actions & Attacks:
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {item.attacks.map((att, idx) => {
                                  const isMonster = item.type === 'monster' || (item.type === 'npc' && item.role === 'Hostile');
                                  const effectivePartySize = Math.max(1, Math.min(4, Math.floor(partySize || 1)));
                                  const displayDamage = isMonster ? scaleDamageFormula(att.damage, (effectivePartySize - 1) * 2) : att.damage;
                                  return (
                                    <div
                                      key={idx}
                                      className="p-2 rounded bg-[#15171a] border border-[#252b31] flex flex-col justify-between"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-cinzel font-bold text-white text-xs">{att.name}</span>
                                        <span className="font-mono text-sky-300 text-xs">{displayDamage}</span>
                                      </div>
                                      <p className="text-[11px] text-[#8a929a] mt-0.5">{att.description}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Special Abilities */}
                          {item.specialAbilities && item.specialAbilities.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <div className="font-cinzel text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                                Traits & Special Abilities:
                              </div>
                              <div className="space-y-1">
                                {item.specialAbilities.map((ab, idx) => (
                                  <div key={idx} className="p-2 rounded bg-[#15171a] border border-[#252b31]">
                                    <span className="font-cinzel font-bold text-purple-200 text-xs">
                                      {ab.name}:{' '}
                                    </span>
                                    <span className="text-[11px] text-[#9ba5af]">{ab.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Drawer Footer Status Bar */}
        <div className="bg-[#141618] border-t border-[#252b31] p-3 sm:px-5 flex items-center justify-between text-xs text-[#78828c] shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span>{displayedItems.length} entities available</span>
            <span>•</span>
            <span className="text-emerald-400">{tokens.length} active on map</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#1e2327] hover:bg-[#282f34] text-[#d6d9dc] rounded font-cinzel text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
