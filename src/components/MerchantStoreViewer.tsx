import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Map as MapIcon, 
  Shield, 
  Sword, 
  FlaskConical, 
  Bomb, 
  CheckCircle2, 
  Coins, 
  Lock,
  Store
} from 'lucide-react';
import { ActMerchant, WitcherCharacter, WitcherSchool } from '../types';
import { DEFAULT_ACT_MERCHANTS } from '../data/items';

interface MerchantStoreViewerProps {
  actNumber: number;
  actMerchants?: Record<number, ActMerchant>;
  isHost: boolean;
  selectedCharacter: WitcherCharacter | null;
  partyCharacters?: WitcherCharacter[] | Record<string, WitcherCharacter>;
  onCloseStore: () => void;
  onSelectActStore?: (actNum: number) => void;
  onBuyItem: (buyerSchool: WitcherSchool, actNum: number, itemId: string) => void;
}

export const MerchantStoreViewer: React.FC<MerchantStoreViewerProps> = ({
  actNumber,
  actMerchants = DEFAULT_ACT_MERCHANTS,
  isHost,
  selectedCharacter,
  partyCharacters = [],
  onCloseStore,
  onSelectActStore,
  onBuyItem,
}) => {
  const merchant: ActMerchant = (actMerchants && actMerchants[actNumber]) || DEFAULT_ACT_MERCHANTS[actNumber] || DEFAULT_ACT_MERCHANTS[1];

  const characterList: WitcherCharacter[] = Array.isArray(partyCharacters)
    ? partyCharacters
    : Object.values(partyCharacters);

  // Selected shopper: GM can cycle between witchers; players are locked to their own character
  const defaultSchool: WitcherSchool = selectedCharacter?.school || 'Wolf';
  const [selectedShopperSchool, setSelectedShopperSchool] = useState<WitcherSchool>(defaultSchool);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const activeSchool = isHost ? selectedShopperSchool : defaultSchool;
  const currentShopper = characterList.find((c) => c.school === activeSchool) || selectedCharacter;
  const shopperGold = currentShopper ? currentShopper.gold : 15;

  const handlePurchase = (itemId: string, itemName: string, price: number, inStock: boolean) => {
    if (!inStock) {
      setFeedbackMsg({ text: `${itemName} is sold out!`, type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }
    if (shopperGold < price) {
      setFeedbackMsg({ 
        text: `Insufficient gold! Need ${price - shopperGold} more Cintrian orens.`, 
        type: 'error' 
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    onBuyItem(activeSchool, actNumber, itemId);
    setFeedbackMsg({
      text: `Purchased ${itemName} for ${currentShopper?.name || activeSchool}! (Remaining: ${shopperGold - price} 🪙)`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0d0f12] text-[#d6d9dc] overflow-hidden select-none">
      
      {/* Top Banner Navigation Strip */}
      <div className="bg-[#14171b] border-b border-[#282e36] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg z-20">
        
        {/* Left: Store Title & Act Indicators */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-[#c99a45]/60">
            <Store className="w-4 h-4 text-amber-400" />
            <span className="font-cinzel font-bold text-xs text-[#e2ba6d] uppercase tracking-wider">
              Act {actNumber} Waystation Store
            </span>
          </div>

          {/* GM Quick Act Store Switcher */}
          {isHost && onSelectActStore && (
            <div className="flex items-center bg-[#0b0c0e] p-0.5 rounded-lg border border-[#252b33]">
              {[1, 2, 3, 4].map((actNum) => {
                const isSelected = actNum === actNumber;
                return (
                  <button
                    key={actNum}
                    type="button"
                    onClick={() => onSelectActStore(actNum)}
                    className={`px-2.5 py-1 text-xs font-cinzel rounded transition-all ${
                      isSelected
                        ? 'bg-[#c99a45] text-black font-bold shadow-sm'
                        : 'text-[#8a929a] hover:text-white hover:bg-[#1a1f26]'
                    }`}
                  >
                    Act {actNum === 1 ? 'I' : actNum === 2 ? 'II' : actNum === 3 ? 'III' : 'IV'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Return to Battle Map Button */}
        <div className="flex items-center gap-2">
          {feedbackMsg && (
            <span className={`text-xs font-cinzel px-2.5 py-1 rounded border animate-fadeIn flex items-center gap-1 ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300' 
                : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
            }`}>
              {feedbackMsg.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{feedbackMsg.text}</span>
            </span>
          )}

          {isHost ? (
            <button
              onClick={onCloseStore}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              title="Close Store and return table to Battle Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Return to Battle Map</span>
            </button>
          ) : (
            <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-cinzel text-amber-300 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Waystation Market • Hosted by GM</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Content Split: Merchant Hero & Finite Inventory Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
        
        {/* Merchant Hero Showcase */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a1f] via-[#13161a] to-[#0f1114] border border-[#2b323b] shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-5">
          
          {/* Merchant Portrait */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#c99a45]/70 shrink-0 shadow-2xl bg-black">
            <img 
              src={merchant.avatarUrl} 
              alt={merchant.name} 
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-1.5 left-2 right-2 text-center text-[10px] font-cinzel font-bold text-[#e2ba6d] uppercase truncate">
              {merchant.name.split(' ')[0]}
            </span>
          </div>

          {/* Merchant Biography & Customer Purse */}
          <div className="flex-1 min-w-0 space-y-2.5 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-600/40">
                  {merchant.title}
                </span>
                <span className="text-[10px] text-[#8a929a] font-mono">
                  📍 {merchant.location}
                </span>
              </div>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-1">
                {merchant.name}
              </h3>
            </div>

            <p className="text-sm sm:text-base text-[#e5ded0] font-cormorant italic leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
              &ldquo;{merchant.greeting}&rdquo;
            </p>

            {/* Shopper Gold Purse Control */}
            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-between gap-3 border-t border-[#222830]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-cinzel text-[#8a929a]">Customer Purse:</span>
                <span className="font-mono text-sm sm:text-base font-bold text-amber-300 flex items-center gap-1 bg-amber-950/50 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{currentShopper?.name || 'Witcher'}: {shopperGold} Orens</span>
                </span>
              </div>

              {/* School Switcher: clickable for GM, locked for players */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Wolf', 'Cat', 'Griffin', 'Bear'] as WitcherSchool[]).map((school) => {
                  const char = characterList.find((c) => c.school === school);
                  const isSelected = activeSchool === school;
                  const canSelect = isHost || defaultSchool === school;

                  return (
                    <button
                      key={school}
                      type="button"
                      disabled={!canSelect}
                      onClick={() => {
                        if (canSelect) setSelectedShopperSchool(school);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-cinzel flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#c99a45] text-black font-bold shadow-md shadow-[#c99a45]/20 ring-1 ring-amber-300'
                          : canSelect
                          ? 'bg-[#15181c] text-[#a4b0ba] hover:text-white hover:bg-[#22272e] border border-[#2b333d]'
                          : 'bg-[#101215] text-[#4f5761] border border-[#1d2229] opacity-40 cursor-not-allowed'
                      }`}
                      title={
                        !canSelect
                          ? 'Players can only spend gold from their own Witcher purse'
                          : `Select ${school} School purse`
                      }
                    >
                      <span>{school === 'Wolf' ? '🐺' : school === 'Cat' ? '🐱' : school === 'Griffin' ? '🦅' : '🐻'}</span>
                      <span className="hidden sm:inline">{school}</span>
                      <span className="font-mono text-[10px] opacity-80">
                        ({char ? char.gold : 15}🪙)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Finite Merchant Inventory Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-cinzel text-[#8a929a] px-1">
            <span className="uppercase tracking-wider font-bold text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#c99a45]" />
              <span>Finite Merchant Wares (Stock is strictly limited in Cintra)</span>
            </span>
            <span className="font-mono text-[11px] text-amber-400/80">
              {merchant.items.filter((i) => i.stock > 0).length} of {merchant.items.length} items available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {merchant.items.map((mItem) => {
              const it = mItem.item;
              const inStock = mItem.stock > 0;
              const canAfford = shopperGold >= mItem.priceGold;
              const isArmor = it.category === 'armor';
              const isSteel = it.category === 'steel_sword';
              const isSilver = it.category === 'silver_sword';
              const isPotion = it.category === 'potion';
              const isBomb = it.category === 'bomb';

              return (
                <div
                  key={mItem.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    !inStock
                      ? 'bg-[#101114]/60 border-[#1f242b] opacity-60'
                      : canAfford
                      ? 'bg-[#14161a] border-[#2c333c] hover:border-[#c99a45]/60 hover:shadow-lg'
                      : 'bg-[#14161a] border-[#2c333c]'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Item Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-cinzel text-sm font-bold text-white block truncate">
                          {it.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>{mItem.priceGold} Cintrian Orens</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isArmor && <Shield className="w-3.5 h-3.5 text-sky-400" />}
                        {isSteel && <Sword className="w-3.5 h-3.5 text-zinc-300" />}
                        {isSilver && <Sword className="w-3.5 h-3.5 text-amber-400" />}
                        {isPotion && <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />}
                        {isBomb && <Bomb className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="text-[9px] font-cinzel px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                          {it.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Flavor Note / Description */}
                    <p className="text-xs text-[#8a929a] font-cormorant italic leading-relaxed">
                      {mItem.merchantNote || it.description}
                    </p>

                    {/* Combat Stats */}
                    <div className="space-y-1 pt-1">
                      {it.armorClass && (
                        <div className="text-[11px] text-sky-400 font-mono flex items-center gap-1">
                          <span>🛡️ AC {it.armorClass}</span>
                          <span className="text-[#6c7682]">({it.weightCategory || 'Medium'})</span>
                        </div>
                      )}
                      {it.damage && (
                        <div className="text-[11px] text-rose-400 font-mono">
                          ⚔️ {it.damage}
                        </div>
                      )}
                      {it.effect && (
                        <div className="text-[10px] text-emerald-400 font-mono">
                          ✨ {it.effect}
                        </div>
                      )}
                      {it.toxicity !== undefined && it.toxicity > 0 && (
                        <div className="text-[10px] text-lime-400 font-mono">
                          🧪 +{it.toxicity}% Toxicity • Duration: {it.duration || '1 minute'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock & Buy Action Button */}
                  <div className="pt-2 border-t border-[#222830] flex items-center justify-between gap-2">
                    <div>
                      {inStock ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{mItem.stock} in Stock</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-400 font-bold">
                          SOLD OUT
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!inStock || !canAfford}
                      onClick={() => handlePurchase(mItem.id, it.name, mItem.priceGold, inStock)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 ${
                        !inStock
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                          : !canAfford
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-800/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#c99a45] to-[#a67d30] text-black hover:brightness-110 shadow-md shadow-[#c99a45]/20 active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        {!inStock
                          ? 'Sold Out'
                          : !canAfford
                          ? `Need ${mItem.priceGold - shopperGold} 🪙`
                          : `Buy (${mItem.priceGold} 🪙)`}
                      </span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
