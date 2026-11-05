import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TacticalMap } from './components/TacticalMap';
import { CharacterSheet } from './components/CharacterSheet';
import { CharacterSelect } from './components/CharacterSelect';
import { BestiaryModal } from './components/BestiaryModal';
import { AdventureGuideModal } from './components/AdventureGuideModal';
import { DiceRollerTray } from './components/DiceRollerTray';
import { ChatCombatLog } from './components/ChatCombatLog';
import { P2PModal } from './components/P2PModal';
import { NotionWikiModal } from './components/NotionWikiModal';
import { GMCampaignModal } from './components/GMCampaignModal';
import { InstructionsModal } from './components/InstructionsModal';
import { DMInventoryModal } from './components/DMInventoryModal';
import { storageService, CampaignSaveState } from './services/storageService';
import { getAssetUrl } from './utils/assets';
import { getActivePartySize, rescaleMonsterTokens, scaleMonsterHp, scaleMonsterAttack } from './utils/monsterScaling';

import { 
  WitcherCharacter, 
  WitcherSchool,
  MapScene, 
  MapToken, 
  ChatMessage, 
  P2PPacket, 
  Monster,
  SpeechRoleplayMode,
  CharacterAssignment,
  StoryVisualOverlay,
  PartyChoiceRecord,
  CampaignEconomyState,
  RewardRecord,
  GameItem,
} from './types';
import { PREGEN_WITCHERS } from './data/characters';
import { MONSTERS } from './data/monsters';
import { INITIAL_ECONOMY_STATE, DEFAULT_ACT_MERCHANTS } from './data/items';
import { MAP_SCENES } from './data/maps';
import { p2pManager, ConnectedPeerInfo } from './services/peerService';
import { playCriticalHitSound } from './utils/audio';

const WITCHER_SCHOOLS: WitcherSchool[] = ['Wolf', 'Cat', 'Griffin', 'Bear'];

// Resolves which Witcher a connected peer *actually* holds, based only on the GM-approved
// assignment table (never on anything the peer claims in a packet).
const getClaimedWitcher = (
  assignments: Record<string, CharacterAssignment>,
  peerId: string
): WitcherCharacter | undefined => {
  const assignment = Object.values(assignments).find(
    (a) => a.isLocked && a.claimedByPeerId === peerId
  );
  return assignment ? PREGEN_WITCHERS.find((w) => w.id === assignment.characterId) : undefined;
};

const getDefaultTokens = (): MapToken[] => [
  {
    id: 'token-wolf',
    name: 'Vane of Kaer Morhen',
    school: 'Wolf',
    isMonster: false,
    avatarUrl: getAssetUrl('assets/characters/wolf.jpg'),
    x: 35,
    y: 40,
    currentHp: 49,
    maxHp: 49,
    color: '#c99a45',
  },
  {
    id: 'token-cat',
    name: 'Sybilla the Lynx',
    school: 'Cat',
    isMonster: false,
    avatarUrl: getAssetUrl('assets/characters/cat.jpg'),
    x: 38,
    y: 52,
    currentHp: 44,
    maxHp: 44,
    color: '#06b6d4',
  },
  {
    id: 'token-griffin',
    name: 'Alden of Kaer Seren',
    school: 'Griffin',
    isMonster: false,
    avatarUrl: getAssetUrl('assets/characters/griffin.jpg'),
    x: 28,
    y: 46,
    currentHp: 52,
    maxHp: 52,
    color: '#a855f7',
  },
  {
    id: 'token-bear',
    name: 'Bram of Haern Caduch',
    school: 'Bear',
    isMonster: false,
    avatarUrl: getAssetUrl('assets/characters/bear.jpg'),
    x: 25,
    y: 60,
    currentHp: 58,
    maxHp: 58,
    color: '#f43f5e',
  },
];

export const App: React.FC = () => {
  // Load initial state from Game Master's browser local storage
  const initialSave = storageService.loadCampaignState();

  // Active Witcher selection
  const [selectedCharacter, setSelectedCharacter] = useState<WitcherCharacter>(() => {
    if (initialSave?.selectedCharacterId) {
      const found = PREGEN_WITCHERS.find((w) => w.id === initialSave.selectedCharacterId);
      if (found) return found;
    }
    return PREGEN_WITCHERS[0];
  });
  
  // Active Map Scene
  const [currentScene, setCurrentScene] = useState<MapScene>(() => {
    if (initialSave?.currentSceneId) {
      const found = MAP_SCENES.find((s) => s.id === initialSave.currentSceneId);
      if (found) return found;
    }
    return MAP_SCENES[0];
  });

  // Active View Tab: 'map' or 'sheet'
  const [activeTab, setActiveTab] = useState<'map' | 'sheet' | 'bestiary' | 'guide'>('map');

  // Modals state
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isBestiaryModalOpen, setIsBestiaryModalOpen] = useState(false);
  const [isCharSelectOpen, setIsCharSelectOpen] = useState(false);
  const [isDiceTrayOpen, setIsDiceTrayOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [isGMModalOpen, setIsGMModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isDMInventoryModalOpen, setIsDMInventoryModalOpen] = useState(false);

  // Party Characters (all 4 Witcher states, initialized from PREGEN_WITCHERS)
  const [partyCharacters, setPartyCharacters] = useState<Record<string, WitcherCharacter>>(() => {
    if (initialSave?.witcherCharacters) {
      return initialSave.witcherCharacters;
    }
    const map: Record<string, WitcherCharacter> = {};
    PREGEN_WITCHERS.forEach((w) => {
      map[w.school] = w;
    });
    return map;
  });

  // Finite Campaign Economy State
  const [economyState, setEconomyState] = useState<CampaignEconomyState>(() => {
    if (initialSave?.economyState) {
      return initialSave.economyState;
    }
    return INITIAL_ECONOMY_STATE;
  });

  // Networking state
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gmPlaysWitcher, setGmPlaysWitcher] = useState<boolean>(true);
  const [isObserver, setIsObserver] = useState<boolean>(false);
  const [peerCount, setPeerCount] = useState(0);
  const [connectedPeers, setConnectedPeers] = useState<ConnectedPeerInfo[]>([]);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [statusText, setStatusText] = useState('P2P Standby (Offline Ready)');
  const [initialRoomFromUrl, setInitialRoomFromUrl] = useState<string | undefined>(undefined);

  // GM-level authority: the hosting Game Master, or anyone running a purely local (offline)
  // session. A player connected to someone else's room NEVER has this, regardless of UI state.
  const hasGmControls = isHost || !isConnected;

  // Detect ?room= invite link parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.trim()) {
      setInitialRoomFromUrl(roomParam.trim());
      setIsP2PModalOpen(true);
    }
  }, []);

  // Ping state
  const [pingLocation, setPingLocation] = useState<{ x: number; y: number } | null>(null);

  // Tokens on Map (Restores from GM local storage or defaults)
  const [tokens, setTokens] = useState<MapToken[]>(() => {
    if (initialSave?.tokens && initialSave.tokens.length > 0) {
      return initialSave.tokens;
    }
    return getDefaultTokens();
  });

  // Chat & Combat Log Messages (Restores from GM local storage or defaults)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialSave?.messages && initialSave.messages.length > 0) {
      return initialSave.messages;
    }
    return [
      {
        id: 'msg-init-1',
        senderId: 'system',
        senderName: 'Chronicle of Cintra',
        type: 'system',
        text: 'Session started: The year is 1184. Four witchers meet at the Lion & Lily Waystation in lower Cintra. (Click "How to Play & GM" in the top bar for full rules & instructions).',
        timestamp: Date.now() - 60000,
      },
      {
        id: 'msg-init-2',
        senderId: 'gm',
        senderName: 'Game Master',
        isDM: true,
        type: 'lore',
        text: 'Sir Danek of Marnadal nails a royal contract to the hearth pillar: 2,000 orens for the head of the Woodland Demon along the Yaruga river!',
        timestamp: Date.now() - 30000,
      },
    ];
  });

  // Character assignments & locking (Only 1 of each Witcher, only DM can reassign)
  const [characterAssignments, setCharacterAssignments] = useState<Record<string, CharacterAssignment>>(() => {
    if (initialSave?.characterAssignments) {
      return initialSave.characterAssignments;
    }
    return {
      [PREGEN_WITCHERS[0].id]: {
        characterId: PREGEN_WITCHERS[0].id,
        claimedByPeerId: 'gm',
        claimedByName: 'Game Master',
        isLocked: true,
        claimedAt: Date.now(),
      },
    };
  });

  // Dynamic Witcher Party Size (1 to 4) based on locked claims and connected players
  const partySize = useMemo(
    () => getActivePartySize(characterAssignments, connectedPeers, isConnected, gmPlaysWitcher),
    [characterAssignments, connectedPeers, isConnected, gmPlaysWitcher]
  );

  // Dynamic monster token rescaling when partySize changes
  useEffect(() => {
    if (!hasGmControls) return;
    setTokens((prev) => {
      const rescaled = rescaleMonsterTokens(prev, partySize);
      const hasChanged = rescaled.some((t, i) => {
        const old = prev[i];
        return (
          !old ||
          old.maxHp !== t.maxHp ||
          old.currentHp !== t.currentHp ||
          old.scaledPartySize !== t.scaledPartySize
        );
      });
      if (!hasChanged) return prev;
      if (isConnected && isHost) {
        p2pManager.send({
          type: 'SYNC_STATE',
          senderId: 'gm',
          senderName: 'Game Master',
          payload: { tokens: rescaled },
          timestamp: Date.now(),
        });
      }
      return rescaled;
    });
  }, [partySize, hasGmControls, isConnected, isHost]);

  // Active Story Visualization Overlay (Replaces battle map when shown to players)
  const [activeStoryVisual, setActiveStoryVisual] = useState<StoryVisualOverlay | null>(() => {
    return initialSave?.activeStoryVisual || null;
  });

  // Active Waystation Store Overlay (Replaces battle map when pushed to players by GM)
  const [activeStoreAct, setActiveStoreAct] = useState<number | null>(null);

  // Party Cause & Effect Choices across Acts I-IV + Epilogue
  const [partyChoices, setPartyChoices] = useState<Record<string, PartyChoiceRecord>>(() => {
    return initialSave?.partyChoices || {};
  });

  // Completed Character-Specific Spotlights
  const [completedSpotlights, setCompletedSpotlights] = useState<Record<string, boolean>>(() => {
    return initialSave?.completedSpotlights || {};
  });

  // Ref to hold live state for asynchronous P2P packet handling
  const gameStateRef = useRef({
    currentScene,
    tokens,
    messages,
    selectedCharacter,
    partyCharacters,
    economyState,
    characterAssignments,
    activeStoryVisual,
    activeStoreAct,
    partyChoices,
    completedSpotlights,
    isHost,
  });
  useEffect(() => {
    gameStateRef.current = {
      currentScene,
      tokens,
      messages,
      selectedCharacter,
      partyCharacters,
      economyState,
      characterAssignments,
      activeStoryVisual,
      activeStoreAct,
      partyChoices,
      completedSpotlights,
      isHost,
    };
  }, [currentScene, tokens, messages, selectedCharacter, partyCharacters, economyState, characterAssignments, activeStoryVisual, activeStoreAct, partyChoices, completedSpotlights, isHost]);

  // Auto-save to Game Master's browser local storage
  useEffect(() => {
    storageService.saveCampaignState({
      currentSceneId: currentScene.id,
      tokens,
      messages,
      selectedCharacterId: selectedCharacter.id,
      characterAssignments,
      activeStoryVisual,
      partyChoices,
      completedSpotlights,
      economyState,
      witcherCharacters: partyCharacters,
    });
  }, [currentScene, tokens, messages, selectedCharacter, partyCharacters, economyState, characterAssignments, activeStoryVisual, partyChoices, completedSpotlights]);

  // ───────────────────────── Host-authoritative helpers ─────────────────────────
  // These read live state from gameStateRef so they are safe to call from the memoized P2P
  // handler. Only the Game Master's client ever executes them for networked play.

  // Chronicle entry authored by the host itself (never attributed to a player's character).
  const postHostLog = (text: string, type: ChatMessage['type'] = 'system') => {
    const msg: ChatMessage = {
      id: `host-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: 'system',
      senderName: 'Chronicle of Cintra',
      type,
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    p2pManager.send({
      type: 'CHAT_MESSAGE',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: msg,
      timestamp: Date.now(),
    });
  };

  // Push the authoritative economy + party sheets to every player.
  const broadcastAuthoritativeParty = () => {
    const st = gameStateRef.current;
    p2pManager.send({
      type: 'ECONOMY_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: { economyState: st.economyState, partyCharacters: st.partyCharacters },
      timestamp: Date.now(),
    });
  };

  // Executes a merchant purchase. The host looks up price, stock and item itself; the buyer's
  // purse is checked against the host's copy of their sheet. Returns true if the sale went through.
  const applyMerchantPurchase = (
    buyerSchool: WitcherSchool,
    actNum: number,
    itemId: string,
    requireActiveAct: boolean
  ): boolean => {
    const st = gameStateRef.current;
    // Players can only trade with the merchant of the act the GM currently has in play.
    if (requireActiveAct && st.currentScene.actNumber !== actNum) return false;

    const merchants = st.economyState.actMerchants || DEFAULT_ACT_MERCHANTS;
    const merchant = merchants[actNum];
    const mItem = merchant?.items.find((i) => i.id === itemId);
    const buyer = st.partyCharacters[buyerSchool] || PREGEN_WITCHERS.find((w) => w.school === buyerSchool);
    if (!merchant || !mItem || !buyer) return false;
    if (mItem.stock <= 0 || buyer.gold < mItem.priceGold) return false;

    const boughtItem: GameItem = {
      ...mItem.item,
      assignedToSchool: buyerSchool,
      assignedToName: buyer.name,
      equipped: false,
      discoverySource: `Purchased from ${merchant.name} in Act ${actNum}`,
    };

    // Consumables also go into the quick-use lists on the character sheet
    const newPotions = [...buyer.potions];
    if (boughtItem.category === 'potion') {
      newPotions.push({
        name: boughtItem.name.replace(/ \(Phial #\d+\)/, ''),
        toxicity: boughtItem.toxicity || 20,
        charges: boughtItem.charges || 2,
        maxCharges: boughtItem.maxCharges || 2,
        duration: boughtItem.duration || '1 minute',
        effect: boughtItem.effect || boughtItem.description,
      });
    }
    const newBombs = [...buyer.bombs];
    if (boughtItem.category === 'bomb') {
      newBombs.push({
        name: boughtItem.name.replace(/ \(Pack #\d+\)/, ''),
        count: boughtItem.charges || 2,
        maxCount: boughtItem.maxCharges || 2,
        radius: '15 ft sphere',
        effect: boughtItem.effect || boughtItem.description,
      });
    }
    const newOils = [...buyer.oils];
    if (boughtItem.category === 'oil') {
      newOils.push({
        name: boughtItem.name,
        targetCategory: boughtItem.effect?.includes('Relict') ? 'Relicts (Leshen, Chort)' :
                        boughtItem.effect?.includes('Specter') ? 'Specters & Hounds' :
                        boughtItem.effect?.includes('Necrophage') ? 'Necrophages (Grave Hag)' : 'Monsters',
        bonusDamage: '+1d8 damage',
        charges: boughtItem.charges || 10,
        maxCharges: boughtItem.maxCharges || 10,
      });
    }

    const updatedBuyer: WitcherCharacter = {
      ...buyer,
      gold: buyer.gold - mItem.priceGold,
      inventory: [...(buyer.inventory || []), boughtItem],
      potions: newPotions,
      bombs: newBombs,
      oils: newOils,
    };

    const updatedMerchants = {
      ...merchants,
      [actNum]: {
        ...merchant,
        items: merchant.items.map((it) => (it.id === itemId ? { ...it, stock: it.stock - 1 } : it)),
      },
    };

    const newEconomy: CampaignEconomyState = {
      ...st.economyState,
      dmVaultGold: st.economyState.dmVaultGold + mItem.priceGold,
      rewardLog: [
        ...st.economyState.rewardLog,
        {
          id: `shop-${Date.now()}`,
          timestamp: Date.now(),
          recipientSchool: buyerSchool,
          recipientName: buyer.name,
          type: 'item_grant',
          amountGold: -mItem.priceGold,
          itemName: boughtItem.name,
          note: `Purchased from ${merchant.name} in Act ${actNum} for ${mItem.priceGold} Orens.`,
        },
      ],
      actMerchants: updatedMerchants,
    };
    const newParty = { ...st.partyCharacters, [buyerSchool]: updatedBuyer };

    // Update the ref immediately so back-to-back requests see the new stock / purse
    gameStateRef.current = { ...st, economyState: newEconomy, partyCharacters: newParty };
    setEconomyState(newEconomy);
    setPartyCharacters(newParty);
    setSelectedCharacter((prev) =>
      prev.school === buyerSchool ? { ...updatedBuyer, currentHp: prev.currentHp } : prev
    );

    postHostLog(
      `🪙 [Waystation Outfitter] ${merchant.name} sold ${boughtItem.name} to ${buyer.name} for ${mItem.priceGold} Cintrian Orens. (${mItem.stock - 1} left in stock)`,
      'lore'
    );
    broadcastAuthoritativeParty();
    return true;
  };

  // Host-side authorization of every packet a connected client sends. This is the real access
  // control: the UI hides GM tools from players, but nothing a modified client sends can get past
  // here. Identity (senderId/senderName) has already been overwritten by the transport layer
  // with the verified peer, so it cannot be spoofed.
  const guardClientPacket = useCallback(
    (packet: P2PPacket, peer: ConnectedPeerInfo): P2PPacket | null => {
      const st = gameStateRef.current;
      if (!st.isHost) return null;

      const ownChar = getClaimedWitcher(st.characterAssignments, peer.peerId);
      const displayName = ownChar?.name || peer.playerName;

      // Re-stamp chat/roll messages: no GM voice, no borrowed names, only sane message types.
      const stampMessage = (p: P2PPacket, forceOoc: boolean): P2PPacket => {
        const original = (p.payload || {}) as Record<string, any>;
        const allowedTypes = ['chat', 'roll', 'combat', 'system'];
        const payload: Record<string, any> = {
          ...original,
          senderId: peer.peerId,
          senderName: displayName,
          school: ownChar?.school,
          isDM: false,
          type: allowedTypes.includes(original.type) ? original.type : 'chat',
        };
        if (forceOoc) {
          payload.speechMode = 'ooc';
          payload.type = 'chat';
        } else if (payload.speechMode === 'dm') {
          payload.speechMode = 'ic';
        }
        if (original.rollData && typeof original.rollData === 'object') {
          payload.rollData = {
            ...original.rollData,
            senderId: peer.peerId,
            senderName: displayName,
            school: ownChar?.school,
          };
        }
        return { ...p, senderName: displayName, payload };
      };

      // Observers are read-only spectators: out-of-character chat and nothing else.
      if (peer.isObserver) {
        return packet.type === 'CHAT_MESSAGE' ? stampMessage(packet, true) : null;
      }

      switch (packet.type) {
        case 'CHAT_MESSAGE':
          return stampMessage(packet, false);

        case 'DICE_ROLL':
          return ownChar ? stampMessage(packet, false) : null;

        case 'PING_COORDINATE':
          return packet;

        case 'TOKEN_MOVE': {
          // A player may move exactly one token: the Witcher the GM assigned to them.
          if (!ownChar) return null;
          const token = st.tokens.find((t) => t.id === packet.payload?.tokenId);
          if (!token || token.isMonster) return null;
          return token.school === ownChar.school ? packet : null;
        }

        case 'CHARACTER_CLAIM':
          // Adjudicated by the CHARACTER_CLAIM handler (one per player, one per school)
          return packet;

        case 'CHARACTER_UPDATE':
        case 'MERCHANT_PURCHASE':
          // Only seated players; the handlers re-derive who the player is from the assignment table
          return ownChar ? packet : null;

        default:
          // Anything else (map, tokens, story, economy, assignments, state sync...) is GM-only
          return null;
      }
    },
    []
  );

  useEffect(() => {
    p2pManager.setPacketGuard(guardClientPacket);
    return () => p2pManager.setPacketGuard(null);
  }, [guardClientPacket]);

  // Keep the roster's "school" column honest: derived from GM-approved assignments only.
  useEffect(() => {
    if (!isHost) return;
    connectedPeers.forEach((peer) => {
      p2pManager.setPeerSchool(peer.peerId, getClaimedWitcher(characterAssignments, peer.peerId)?.school);
    });
  }, [isHost, characterAssignments, connectedPeers]);

  // Handle incoming P2P Packet
  const handleP2PPacket = useCallback((packet: P2PPacket) => {
    switch (packet.type) {
      case 'CHAT_MESSAGE':
        setMessages((prev) => [...prev, packet.payload]);
        break;

      case 'DICE_ROLL':
        setMessages((prev) => [...prev, packet.payload]);
        break;

      case 'TOKEN_MOVE': {
        // Ownership was already enforced by the host guard (players) or is the GM's own move;
        // clients only ever receive moves relayed by the host, so apply them as-is.
        const { tokenId, x, y } = packet.payload;
        setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t)));
        break;
      }

      case 'TOKEN_ADD':
        setTokens((prev) => [...prev, packet.payload]);
        break;

      case 'TOKEN_REMOVE':
        setTokens((prev) => prev.filter((t) => t.id !== packet.payload));
        break;

      case 'MAP_CHANGE': {
        const targetScene = MAP_SCENES.find((s) => s.id === packet.payload);
        if (targetScene) setCurrentScene(targetScene);
        break;
      }

      case 'PING_COORDINATE':
        setPingLocation({ x: packet.payload.x, y: packet.payload.y });
        setTimeout(() => setPingLocation(null), 2500);
        break;

      case 'PLAYER_JOIN':
        setMessages((prev) => [
          ...prev,
          {
            id: `join-${Date.now()}`,
            senderId: 'system',
            senderName: 'Network',
            type: 'system',
            text: packet.payload.message,
            timestamp: Date.now(),
          },
        ]);

        // If I am Host, transmit authoritative state to the newly joined player!
        if (gameStateRef.current.isHost) {
          p2pManager.send({
            type: 'INITIAL_STATE_SYNC',
            senderId: 'gm',
            senderName: 'Game Master',
            payload: {
              currentSceneId: gameStateRef.current.currentScene.id,
              tokens: gameStateRef.current.tokens,
              messages: gameStateRef.current.messages,
              selectedCharacterId: gameStateRef.current.selectedCharacter.id,
              characterAssignments: gameStateRef.current.characterAssignments,
              activeStoryVisual: gameStateRef.current.activeStoryVisual,
              activeStoreAct: gameStateRef.current.activeStoreAct,
              partyChoices: gameStateRef.current.partyChoices,
              gmPlaysWitcher: p2pManager.hostPlaysWitcher,
              connectedPeers: p2pManager.getConnectedPeers(),
              economyState: gameStateRef.current.economyState,
              partyCharacters: gameStateRef.current.partyCharacters,
            },
            timestamp: Date.now(),
          });
        }
        break;

      case 'INITIAL_STATE_SYNC':
        if (packet.payload.tokens && Array.isArray(packet.payload.tokens)) {
          setTokens(packet.payload.tokens);
        }
        if (packet.payload.currentSceneId) {
          const s = MAP_SCENES.find((sc) => sc.id === packet.payload.currentSceneId);
          if (s) setCurrentScene(s);
        }
        if (packet.payload.messages && Array.isArray(packet.payload.messages)) {
          setMessages(packet.payload.messages);
        }
        if (packet.payload.activeStoryVisual !== undefined) {
          setActiveStoryVisual(packet.payload.activeStoryVisual);
        }
        if (packet.payload.activeStoreAct !== undefined) {
          setActiveStoreAct(packet.payload.activeStoreAct);
        }
        if (packet.payload.partyChoices) {
          setPartyChoices(packet.payload.partyChoices);
        }
        if (packet.payload.gmPlaysWitcher !== undefined) {
          setGmPlaysWitcher(packet.payload.gmPlaysWitcher);
        }
        if (packet.payload.connectedPeers && Array.isArray(packet.payload.connectedPeers)) {
          setConnectedPeers(packet.payload.connectedPeers);
        }
        if (packet.payload.economyState) {
          setEconomyState(packet.payload.economyState);
        }
        if (packet.payload.partyCharacters) {
          setPartyCharacters(packet.payload.partyCharacters);
        }
        setIsObserver(p2pManager.isObserver);
        if (packet.payload.characterAssignments) {
          const assignments = packet.payload.characterAssignments as Record<string, CharacterAssignment>;
          setCharacterAssignments(assignments);

          // Check if newly joined player already has an assigned locked character
          const myAssignment = Object.values(assignments).find(
            (a) => a.claimedByPeerId === p2pManager.myPeerId
          );
          if (myAssignment) {
            const found = PREGEN_WITCHERS.find((w) => w.id === myAssignment.characterId);
            if (found) {
              const livePartySheet = (packet.payload.partyCharacters as Record<string, WitcherCharacter> | undefined)?.[found.school];
              setSelectedCharacter(livePartySheet || found);
            }
          } else if (p2pManager.isObserver) {
            handleAddLogMessage(
              'Party is full (4 Players active). You are connected as an Observer (Spectating).',
              'system'
            );
          } else {
            // Guided player onboarding: Open character select & locking modal!
            setIsCharSelectOpen(true);
          }
        } else if (!p2pManager.isObserver) {
          setIsCharSelectOpen(true);
        }
        break;

      case 'CHARACTER_CLAIM': {
        const st = gameStateRef.current;
        if (!st.isHost) break;

        // packet.senderId is the transport-verified peer id, not something the client chose
        const peerId = packet.senderId;
        const peerInfo = p2pManager.getConnectedPeers().find((p) => p.peerId === peerId);
        const characterId = String(packet.payload?.characterId || '');
        const targetWitcher = PREGEN_WITCHERS.find((w) => w.id === characterId);
        const existing = st.characterAssignments[characterId];

        // Reject and force the requester's UI back to the authoritative table
        const deny = (reason?: string) => {
          p2pManager.send({
            type: 'CHARACTER_ASSIGNMENT_SYNC',
            senderId: 'gm',
            senderName: 'Game Master',
            payload: st.characterAssignments,
            timestamp: Date.now(),
          });
          if (reason) postHostLog(reason);
        };

        if (!peerInfo || peerInfo.isObserver || !targetWitcher) {
          deny();
          break;
        }
        // One Witcher per player: once locked, only the GM can move them
        if (getClaimedWitcher(st.characterAssignments, peerId)) {
          deny(`${peerInfo.playerName} is already locked into a Witcher. Only the Game Master can reassign characters.`);
          break;
        }
        // One player per Witcher
        if (existing && existing.isLocked) {
          deny(`School of the ${targetWitcher.school} is already claimed by ${existing.claimedByName}! Please select an available School.`);
          break;
        }

        const updated: Record<string, CharacterAssignment> = {
          ...st.characterAssignments,
          [characterId]: {
            characterId,
            claimedByPeerId: peerId,
            claimedByName: peerInfo.playerName,
            isLocked: true,
            claimedAt: Date.now(),
          },
        };
        gameStateRef.current = { ...st, characterAssignments: updated };
        setCharacterAssignments(updated);

        // Broadcast authoritative assignments to all connected players
        p2pManager.send({
          type: 'CHARACTER_ASSIGNMENT_SYNC',
          senderId: 'gm',
          senderName: 'Game Master',
          payload: updated,
          timestamp: Date.now(),
        });

        postHostLog(`⚔️ ${peerInfo.playerName} has locked in ${targetWitcher.name} (School of the ${targetWitcher.school})!`);
        break;
      }

      case 'CHARACTER_ASSIGNMENT_SYNC': {
        const assignments = packet.payload as Record<string, CharacterAssignment>;
        setCharacterAssignments(assignments);

        // If I was assigned a character, update my selected Witcher (match on verified peer id only)
        const myAssignment = Object.values(assignments).find(
          (a) => a.isLocked && a.claimedByPeerId === p2pManager.myPeerId
        );
        if (myAssignment) {
          const found = PREGEN_WITCHERS.find((w) => w.id === myAssignment.characterId);
          if (found && found.id !== gameStateRef.current.selectedCharacter.id) {
            // Use the live party sheet (current gold/inventory), not the pristine pregen
            const live = gameStateRef.current.partyCharacters[found.school] || found;
            setSelectedCharacter(live);
            setMessages((prev) => [
              ...prev,
              {
                id: `reassigned-${Date.now()}`,
                senderId: 'system',
                senderName: 'Game Master',
                isDM: true,
                type: 'system',
                text: `Game Master has assigned you to play ${found.name} (School of the ${found.school}).`,
                timestamp: Date.now(),
              },
            ]);
          }
        }
        break;
      }

      case 'SYNC_STATE':
        if (packet.payload.tokens) setTokens(packet.payload.tokens);
        if (packet.payload.currentSceneId) {
          const s = MAP_SCENES.find((sc) => sc.id === packet.payload.currentSceneId);
          if (s) setCurrentScene(s);
        }
        break;

      case 'STORY_VISUAL_SYNC':
      case 'SHOW_STORY_VISUAL': {
        const visual = packet.payload?.visual !== undefined ? packet.payload.visual : packet.payload || null;
        setActiveStoryVisual(visual);
        if (visual) {
          setActiveStoreAct(null);
        }
        break;
      }

      case 'SHOW_MERCHANT_STORE': {
        const actNum = packet.payload?.actNumber ?? null;
        setActiveStoreAct(actNum);
        if (actNum !== null) {
          setActiveStoryVisual(null);
        }
        break;
      }

      case 'PARTY_CHOICES_SYNC':
        if (packet.payload) {
          setPartyChoices(packet.payload);
        }
        break;

      case 'ECONOMY_SYNC': {
        // Host -> players only (the validator rejects this type from clients)
        if (packet.payload.economyState) {
          setEconomyState(packet.payload.economyState);
        }
        if (packet.payload.partyCharacters) {
          const party = packet.payload.partyCharacters as Record<string, WitcherCharacter>;
          setPartyCharacters(party);
          // Refresh my own sheet from the authoritative copy (keep my live HP)
          const mine = party[gameStateRef.current.selectedCharacter.school];
          if (mine) {
            setSelectedCharacter((prev) => ({ ...mine, currentHp: prev.currentHp }));
          }
        } else if (packet.payload.updatedSchool) {
          const school = packet.payload.updatedSchool as WitcherSchool;
          setPartyCharacters((prev) => {
            const current = prev[school];
            if (!current) return prev;
            const updatedGold = (current.gold || 0) + (packet.payload.goldDelta || 0);
            const updatedInventory = packet.payload.awardedItem
              ? [...(current.inventory || []), packet.payload.awardedItem]
              : current.inventory;
            const updated = { ...current, gold: updatedGold, inventory: updatedInventory };
            if (gameStateRef.current.selectedCharacter.school === school) {
              setSelectedCharacter(updated);
            }
            return { ...prev, [school]: updated };
          });
        } else if (packet.payload.reclaimedItemId) {
          const reclaimedId = packet.payload.reclaimedItemId as string;
          setPartyCharacters((prev) => {
            const next: Record<string, WitcherCharacter> = {};
            Object.entries(prev).forEach(([school, ch]) => {
              next[school] = { ...ch, inventory: (ch.inventory || []).filter((i) => i.id !== reclaimedId) };
            });
            return next;
          });
          setSelectedCharacter((prev) => ({
            ...prev,
            inventory: (prev.inventory || []).filter((i) => i.id !== reclaimedId),
          }));
        }
        break;
      }

      case 'MERCHANT_PURCHASE': {
        // Purchase REQUEST from a player (host only). The buyer is always the sender's own
        // Witcher as recorded in the GM's assignment table; payload.buyerSchool is ignored, and
        // price / stock / item come from the host's own merchant data.
        const st = gameStateRef.current;
        if (!st.isHost) break;
        const owner = getClaimedWitcher(st.characterAssignments, packet.senderId);
        if (!owner) break;
        const { actNum, itemId } = packet.payload;
        applyMerchantPurchase(owner.school, actNum, itemId, true);
        break;
      }

      case 'CHARACTER_UPDATE': {
        const st = gameStateRef.current;
        const payload = packet.payload || {};

        if (st.isHost) {
          // REQUEST from a player. Never copy their numbers in; derive everything from the
          // host's own copy of the party and apply only what that player is entitled to do.
          const owner = getClaimedWitcher(st.characterAssignments, packet.senderId);
          if (!owner) break;

          // (a) Report HP change on their own Witcher
          if (payload.selfUpdate) {
            const requested = Math.round(Number(payload.selfUpdate.currentHp));
            if (!Number.isFinite(requested)) break;
            const myToken = st.tokens.find((t) => t.school === owner.school);
            const maxHp = myToken?.maxHp ?? owner.maxHp;
            const hp = Math.max(0, Math.min(maxHp, requested));
            const newTokens = st.tokens.map((t) => (t.school === owner.school ? { ...t, currentHp: hp } : t));
            const ownerSheet = st.partyCharacters[owner.school];
            const newParty = ownerSheet
              ? { ...st.partyCharacters, [owner.school]: { ...ownerSheet, currentHp: hp } }
              : st.partyCharacters;
            gameStateRef.current = { ...st, tokens: newTokens, partyCharacters: newParty };
            setTokens(newTokens);
            setPartyCharacters(newParty);
            setSelectedCharacter((prev) => (prev.school === owner.school ? { ...prev, currentHp: hp } : prev));
            p2pManager.send({
              type: 'SYNC_STATE',
              senderId: 'gm',
              senderName: 'Game Master',
              payload: { tokens: newTokens },
              timestamp: Date.now(),
            });
            break;
          }

          // (b) Give gold / an item from their own pack to another Witcher
          if (payload.transferRequest) {
            const toSchool = String(payload.transferRequest.toSchool) as WitcherSchool;
            if (!WITCHER_SCHOOLS.includes(toSchool) || toSchool === owner.school) break;
            const from = st.partyCharacters[owner.school];
            const to = st.partyCharacters[toSchool];
            if (!from || !to) break;

            const requestedGold = Math.floor(Number(payload.transferRequest.goldAmount) || 0);
            const goldMoved = Math.max(0, Math.min(from.gold || 0, requestedGold));
            const itemId = payload.transferRequest.itemId ? String(payload.transferRequest.itemId) : '';
            const item = itemId ? (from.inventory || []).find((i) => i.id === itemId) : undefined;
            if (goldMoved <= 0 && !item) break;

            const updatedFrom: WitcherCharacter = {
              ...from,
              gold: (from.gold || 0) - goldMoved,
              inventory: item ? (from.inventory || []).filter((i) => i.id !== item.id) : from.inventory,
            };
            const updatedTo: WitcherCharacter = {
              ...to,
              gold: (to.gold || 0) + goldMoved,
              inventory: item
                ? [...(to.inventory || []), { ...item, assignedToSchool: toSchool, equipped: false }]
                : to.inventory,
            };
            const newParty = { ...st.partyCharacters, [owner.school]: updatedFrom, [toSchool]: updatedTo };
            gameStateRef.current = { ...st, partyCharacters: newParty };
            setPartyCharacters(newParty);
            setSelectedCharacter((prev) =>
              prev.school === owner.school
                ? { ...updatedFrom, currentHp: prev.currentHp }
                : prev.school === toSchool
                ? { ...updatedTo, currentHp: prev.currentHp }
                : prev
            );

            const details = [
              goldMoved > 0 ? `🪙 ${goldMoved} Orens` : '',
              item ? `📦 ${item.name}` : '',
            ].filter(Boolean).join(' and ');
            postHostLog(`🤝 ${from.name} gave ${details} to ${to.name}.`, 'chat');

            p2pManager.send({
              type: 'CHARACTER_UPDATE',
              senderId: 'gm',
              senderName: 'Game Master',
              payload: { updatedFrom, updatedTo },
              timestamp: Date.now(),
            });
          }
          break;
        }

        // Player client: apply the host's authoritative result
        if (payload.updatedFrom && payload.updatedTo) {
          const { updatedFrom, updatedTo } = payload;
          setPartyCharacters((prev) => ({
            ...prev,
            [updatedFrom.school]: updatedFrom,
            [updatedTo.school]: updatedTo,
          }));
          setSelectedCharacter((prev) =>
            prev.school === updatedFrom.school
              ? { ...updatedFrom, currentHp: prev.currentHp }
              : prev.school === updatedTo.school
              ? { ...updatedTo, currentHp: prev.currentHp }
              : prev
          );
        }
        break;
      }
    }
  }, []);

  // Setup P2P Callbacks
  useEffect(() => {
    p2pManager.setCallbacks(
      handleP2PPacket,
      (count) => setPeerCount(count),
      (status) => setStatusText(status),
      (peers) => setConnectedPeers(peers)
    );
  }, [handleP2PPacket]);

  // Connect as Host
  const handleConnectHost = async (
    roomCode: string,
    pin: string = '',
    gmPlays: boolean = true,
    gmCharId?: string
  ) => {
    p2pManager.setHostPlaysWitcher(gmPlays);
    setGmPlaysWitcher(gmPlays);
    await p2pManager.hostRoom(roomCode, pin);
    setIsHost(true);
    setIsConnected(true);
    setIsRoomLocked(false);

    if (gmPlays) {
      const chosenId = gmCharId || selectedCharacter.id || PREGEN_WITCHERS[0].id;
      const targetChar = PREGEN_WITCHERS.find((w) => w.id === chosenId) || PREGEN_WITCHERS[0];
      setSelectedCharacter(targetChar);
      setCharacterAssignments({
        [chosenId]: {
          characterId: chosenId,
          claimedByPeerId: 'gm',
          claimedByName: 'Game Master',
          isLocked: true,
          claimedAt: Date.now(),
        },
      });
    } else {
      // Pure Narrator: GM does not take a Witcher slot; all 4 open for players
      setCharacterAssignments({});
    }
  };

  // GM Toggle between Playing a Witcher and Pure Narrator
  const handleToggleGmPlaysWitcher = (plays: boolean, characterId?: string) => {
    if (!isHost) return;

    if (plays) {
      // "If 4 players are already in then character selection is not permitted"
      if (connectedPeers.length >= 4) {
        handleAddLogMessage(
          'Party is full (4 players in session). Character selection is not permitted.',
          'system'
        );
        return;
      }

      // Find first available character
      const availableChar = PREGEN_WITCHERS.find(
        (w) =>
          w.id === characterId ||
          !characterAssignments[w.id] ||
          !characterAssignments[w.id].isLocked ||
          characterAssignments[w.id].claimedByPeerId === 'gm'
      );

      if (!availableChar) {
        handleAddLogMessage('No available Witcher characters left to claim.', 'system');
        return;
      }

      const chosenId = availableChar.id;
      setSelectedCharacter(availableChar);
      setGmPlaysWitcher(true);
      p2pManager.setHostPlaysWitcher(true);

      const updated: Record<string, CharacterAssignment> = {
        ...characterAssignments,
        [chosenId]: {
          characterId: chosenId,
          claimedByPeerId: 'gm',
          claimedByName: 'Game Master',
          isLocked: true,
          claimedAt: Date.now(),
        },
      };
      setCharacterAssignments(updated);

      p2pManager.send({
        type: 'CHARACTER_ASSIGNMENT_SYNC',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: updated,
        timestamp: Date.now(),
      });

      handleAddLogMessage(
        `Game Master stepped into the party as ${availableChar.name} (School of the ${availableChar.school})!`,
        'system'
      );
    } else {
      // Switch to Pure Narrator
      setGmPlaysWitcher(false);
      p2pManager.setHostPlaysWitcher(false);

      const updated = { ...characterAssignments };
      Object.keys(updated).forEach((k) => {
        if (updated[k].claimedByPeerId === 'gm') {
          delete updated[k];
        }
      });
      setCharacterAssignments(updated);

      p2pManager.send({
        type: 'CHARACTER_ASSIGNMENT_SYNC',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: updated,
        timestamp: Date.now(),
      });

      handleAddLogMessage(
        'Game Master switched to pure Narrator mode. All 4 Witcher schools are now available to players!',
        'system'
      );
    }
  };

  // Connect as Client
  const handleConnectClient = async (roomCode: string, name: string, pin: string = '') => {
    await p2pManager.joinRoom(roomCode, name, pin, selectedCharacter.school);
    setIsHost(false);
    setIsConnected(true);
    setIsObserver(p2pManager.isObserver);
  };

  // Disconnect
  const handleDisconnect = () => {
    p2pManager.disconnect();
    setIsHost(false);
    setIsConnected(false);
    setIsObserver(false);
    setPeerCount(0);
    setConnectedPeers([]);
    setIsRoomLocked(false);
    setStatusText('Disconnected');
  };

  // Kick Peer (Host Only)
  const handleKickPeer = (peerId: string) => {
    if (!isHost) return;
    p2pManager.kickPeer(peerId);
  };

  // Toggle Room Lock (Host Only)
  const handleToggleRoomLock = (locked: boolean) => {
    if (!isHost) return;
    p2pManager.setRoomLocked(locked);
    setIsRoomLocked(locked);
  };

  // Roll Dice Action
  const handleRollDice = (
    title: string, 
    formula: string, 
    modifier: number, 
    rollMode: 'normal' | 'advantage' | 'disadvantage' = 'normal'
  ) => {
    let d1 = 0;
    let d2 = 0;
    let rollValues: number[] = [];

    if (formula.startsWith('1d20') || formula === '1d20') {
      d1 = Math.floor(Math.random() * 20) + 1;
      if (rollMode === 'advantage' || rollMode === 'disadvantage') {
        d2 = Math.floor(Math.random() * 20) + 1;
        const chosen = rollMode === 'advantage' ? Math.max(d1, d2) : Math.min(d1, d2);
        rollValues = [d1, d2];
        d1 = chosen;
      } else {
        rollValues = [d1];
      }
    } else if (formula === '3d6') {
      rollValues = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      d1 = rollValues.reduce((a, b) => a + b, 0);
    } else if (formula === '2d6') {
      rollValues = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      d1 = rollValues.reduce((a, b) => a + b, 0);
    } else if (formula === '3d8') {
      rollValues = [
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
      ];
      d1 = rollValues.reduce((a, b) => a + b, 0);
    } else {
      // Generic single die fallback
      const match = formula.match(/1d(\d+)/);
      const sides = match ? parseInt(match[1]) : 20;
      d1 = Math.floor(Math.random() * sides) + 1;
      rollValues = [d1];
    }

    const total = d1 + modifier;
    const isCritical = formula.includes('d20') && (d1 === 20 || (selectedCharacter?.school === 'Cat' && d1 >= 19));
    const isFumble = formula.includes('d20') && d1 === 1;

    if (isCritical) {
      playCriticalHitSound();
    }

    const rollMsg: ChatMessage = {
      id: `roll-${Date.now()}`,
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      school: selectedCharacter.school,
      type: 'roll',
      text: `${title}: ${total}`,
      rollData: {
        id: `r-${Date.now()}`,
        senderId: selectedCharacter.id,
        senderName: selectedCharacter.name,
        school: selectedCharacter.school,
        title,
        formula: `${formula} ${modifier >= 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}`,
        diceRolls: rollValues,
        modifier,
        total,
        isCritical,
        isFumble,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, rollMsg]);

    // Send over P2P network
    p2pManager.send({
      type: 'DICE_ROLL',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: rollMsg,
      timestamp: Date.now(),
    });
  };

  // Send Chat Message (Supports In-Character, DM Narration, OOC and Voice)
  const handleSendMessage = (
    text: string, 
    speechMode: SpeechRoleplayMode = 'ic', 
    isVoice: boolean = false
  ) => {
    const isDM = speechMode === 'dm';
    const chatMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderId: isDM ? 'gm' : selectedCharacter.id,
      senderName: isDM ? 'Game Master' : selectedCharacter.name,
      school: isDM ? undefined : selectedCharacter.school,
      type: 'chat',
      text,
      speechMode,
      isVoiceTranscribed: isVoice,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, chatMsg]);

    p2pManager.send({
      type: 'CHAT_MESSAGE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: chatMsg,
      timestamp: Date.now(),
    });
  };

  // Add system / combat log message
  const handleAddLogMessage = (text: string, type: 'chat' | 'combat' | 'lore' | 'system') => {
    const msg: ChatMessage = {
      id: `log-${Date.now()}`,
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      school: selectedCharacter.school,
      type,
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, msg]);

    p2pManager.send({
      type: 'CHAT_MESSAGE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: msg,
      timestamp: Date.now(),
    });
  };

  // Token Movement
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    // Non-host players can ONLY move their own character token!
    if (!isHost) {
      const targetToken = tokens.find((t) => t.id === tokenId);
      const isMyToken = targetToken && (
        (targetToken.school && targetToken.school === selectedCharacter.school) ||
        targetToken.name === selectedCharacter.name ||
        targetToken.id === selectedCharacter.id
      );
      if (!isMyToken) {
        handleAddLogMessage(`⚠️ You can only move your own Witcher character token.`, 'system');
        return;
      }
    }

    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
    );

    p2pManager.send({
      type: 'TOKEN_MOVE',
      senderId: isHost ? 'gm' : selectedCharacter.id,
      senderName: isHost ? 'Game Master' : selectedCharacter.name,
      payload: { 
        tokenId, 
        x, 
        y,
        isHostMove: isHost,
        senderSchool: selectedCharacter.school,
      },
      timestamp: Date.now(),
    });
  };

  // Add Monster Token (Host GM tool)
  const handleTokenAdd = (token: MapToken) => {
    if (!hasGmControls) return;
    setTokens((prev) => [...prev, token]);

    p2pManager.send({
      type: 'TOKEN_ADD',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: token,
      timestamp: Date.now(),
    });

    handleAddLogMessage(`Game Master placed ${token.name} onto the tactical battle map.`, 'combat');
  };

  // Remove Token
  const handleTokenRemove = (tokenId: string) => {
    if (!hasGmControls) return;
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));

    p2pManager.send({
      type: 'TOKEN_REMOVE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: tokenId,
      timestamp: Date.now(),
    });
  };

  // Update Token (e.g. HP change from spawner drawer)
  const handleTokenUpdate = (updatedToken: MapToken) => {
    if (!hasGmControls) return;
    setTokens((prev) => prev.map((t) => (t.id === updatedToken.id ? updatedToken : t)));

    // If updated token is a Witcher, sync to character sheet!
    if (updatedToken.school || !updatedToken.isMonster) {
      setSelectedCharacter((prev) => {
        if (prev.school === updatedToken.school || prev.name === updatedToken.name) {
          return { ...prev, currentHp: updatedToken.currentHp };
        }
        return prev;
      });
    }

    p2pManager.send({
      type: 'SYNC_STATE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: {
        tokens: tokens.map((t) => (t.id === updatedToken.id ? updatedToken : t)),
      },
      timestamp: Date.now(),
    });
  };

  // Who may change a token's HP: the GM for any token; a seated player only for the token of
  // their own Witcher (to report damage taken / healing). Never for monsters, NPCs or other players.
  const canEditTokenHp = (token: MapToken | undefined): boolean => {
    if (!token) return false;
    if (hasGmControls) return true;
    return (
      !isObserver &&
      isCurrentCharacterLocked &&
      Boolean(token.school) &&
      token.school === selectedCharacter.school
    );
  };

  // Shared HP commit: validates permission, clamps, links the Character Sheet, then syncs.
  // GM -> broadcasts the token state. Player -> sends a self-report the host validates & rebroadcasts.
  const commitTokenHp = (
    tokenId: string,
    resolveHp: (current: number, max: number) => number,
    describe: (name: string, newHp: number, maxHp: number, delta: number) => string
  ) => {
    const target = tokens.find((t) => t.id === tokenId);
    if (!target || !canEditTokenHp(target)) {
      if (target) handleAddLogMessage('⚠️ You can only adjust the health of your own Witcher.', 'system');
      return;
    }
    const current = target.currentHp ?? target.maxHp;
    const newHp = Math.max(0, Math.min(target.maxHp, resolveHp(current, target.maxHp)));
    const delta = newHp - current;
    const newTokens = tokens.map((t) => (t.id === tokenId ? { ...t, currentHp: newHp } : t));
    setTokens(newTokens);

    // LINK TO CHARACTER SHEET: a Witcher's token and sheet always share the same HP
    if (target.school) {
      const school = target.school;
      setSelectedCharacter((prev) => (prev.school === school ? { ...prev, currentHp: newHp } : prev));
      setPartyCharacters((prev) =>
        prev[school] ? { ...prev, [school]: { ...prev[school], currentHp: newHp } } : prev
      );
    }

    handleAddLogMessage(describe(target.name, newHp, target.maxHp, delta), 'combat');

    if (hasGmControls) {
      p2pManager.send({
        type: 'SYNC_STATE',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: { tokens: newTokens },
        timestamp: Date.now(),
      });
    } else {
      p2pManager.send({
        type: 'CHARACTER_UPDATE',
        senderId: p2pManager.myPeerId,
        senderName: selectedCharacter.name,
        payload: { selfUpdate: { currentHp: newHp } },
        timestamp: Date.now(),
      });
    }
  };

  // Adjust Token HP by Delta (+/-) — Linked directly to Character Sheets!
  const handleTokenHpChange = (tokenId: string, delta: number) => {
    commitTokenHp(
      tokenId,
      (current) => current + delta,
      (name, newHp, maxHp, applied) =>
        applied < 0
          ? `⚔️ ${name} took ${Math.abs(applied)} damage! (${newHp}/${maxHp} HP)`
          : `💚 ${name} recovered ${applied} HP! (${newHp}/${maxHp} HP)`
    );
  };

  // Set Absolute Token HP (e.g. Full Heal, 0 HP down) — Linked to Character Sheets!
  const handleSetTokenHp = (tokenId: string, targetHp: number) => {
    commitTokenHp(
      tokenId,
      () => targetHp,
      (name, newHp, maxHp) => `💚 ${name} HP set to ${newHp}/${maxHp} HP.`
    );
  };

  // Open Character Sheet for a specific Witcher School directly from Map Token
  const handleOpenWitcherSheet = (school: WitcherSchool) => {
    const found = partyCharacters[school] || PREGEN_WITCHERS.find((w) => w.school === school);
    if (found) {
      const matchingToken = tokens.find((t) => t.school === school || t.name === found.name);
      if (matchingToken && matchingToken.currentHp !== undefined) {
        setSelectedCharacter({ ...found, currentHp: matchingToken.currentHp });
      } else {
        setSelectedCharacter(found);
      }
    }
    setActiveTab('sheet');
  };

  // Update Character from CharacterSheet — Linked directly to Map Tokens!
  const handleUpdateCharacter = (updated: WitcherCharacter) => {
    setSelectedCharacter(updated);
    setPartyCharacters((prev) => ({
      ...prev,
      [updated.school]: updated,
    }));

    // Synchronize to the Map Token for this Witcher!
    setTokens((prev) =>
      prev.map((t) => {
        if (t.school === updated.school || t.name === updated.name) {
          return {
            ...t,
            currentHp: updated.currentHp,
            maxHp: updated.maxHp,
          };
        }
        return t;
      })
    );

    if (hasGmControls) {
      p2pManager.send({
        type: 'SYNC_STATE',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: {
          tokens: tokens.map((t) =>
            t.school === updated.school || t.name === updated.name
              ? { ...t, currentHp: updated.currentHp, maxHp: updated.maxHp }
              : t
          ),
        },
        timestamp: Date.now(),
      });
    } else if (!isObserver && updated.school === selectedCharacter.school) {
      // A player may only report HP for their own Witcher; the host validates and rebroadcasts
      p2pManager.send({
        type: 'CHARACTER_UPDATE',
        senderId: p2pManager.myPeerId,
        senderName: selectedCharacter.name,
        payload: { selfUpdate: { currentHp: updated.currentHp } },
        timestamp: Date.now(),
      });
    }
  };

  // Award finite reward (gold, item) to a Witcher from the DM Vault
  const handleAwardReward = (
    recipientSchool: WitcherSchool,
    goldAmount: number,
    itemId: string | null,
    reasonType: 'roleplay' | 'exploration' | 'investigation' | 'combat' | 'custom',
    note: string
  ) => {
    let rewardedItem: GameItem | null = null;
    let newVaultItems = [...economyState.vaultItems];
    let newVaultGold = economyState.dmVaultGold;

    if (goldAmount > 0) {
      newVaultGold = Math.max(0, newVaultGold - goldAmount);
    }

    if (itemId) {
      const idx = newVaultItems.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        rewardedItem = { ...newVaultItems[idx], assignedToSchool: recipientSchool };
        newVaultItems.splice(idx, 1);
      }
    }

    const recipientChar = partyCharacters[recipientSchool] || PREGEN_WITCHERS.find((w) => w.school === recipientSchool);
    const recipientName = recipientChar?.name || recipientSchool;

    const newLogRecord: RewardRecord = {
      id: `reward-${Date.now()}`,
      timestamp: Date.now(),
      recipientSchool,
      recipientName,
      type: reasonType,
      amountGold: goldAmount > 0 ? goldAmount : undefined,
      itemName: rewardedItem ? rewardedItem.name : undefined,
      note,
    };

    const newEconomy: CampaignEconomyState = {
      ...economyState,
      dmVaultGold: newVaultGold,
      vaultItems: newVaultItems,
      rewardLog: [...economyState.rewardLog, newLogRecord],
    };
    setEconomyState(newEconomy);

    setPartyCharacters((prev) => {
      const current = prev[recipientSchool] || PREGEN_WITCHERS.find((w) => w.school === recipientSchool);
      if (!current) return prev;
      const updatedInventory = rewardedItem ? [...(current.inventory || []), rewardedItem] : current.inventory;
      const updatedGold = (current.gold || 0) + goldAmount;
      const updatedChar = { ...current, gold: updatedGold, inventory: updatedInventory };

      if (selectedCharacter.school === recipientSchool) {
        setSelectedCharacter(updatedChar);
      }
      return { ...prev, [recipientSchool]: updatedChar };
    });

    const rewardSummary = [
      goldAmount > 0 ? `🪙 ${goldAmount} Orens` : '',
      rewardedItem ? `📦 ${rewardedItem.name}` : '',
    ].filter(Boolean).join(' and ');

    handleAddLogMessage(
      `🏆 [GM Reward] ${recipientName} earned ${rewardSummary} for ${reasonType.toUpperCase()}! ("${note}")`,
      'lore'
    );

    p2pManager.send({
      type: 'ECONOMY_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: {
        economyState: newEconomy,
        updatedSchool: recipientSchool,
        goldDelta: goldAmount,
        awardedItem: rewardedItem,
      },
      timestamp: Date.now(),
    });
  };

  // Reclaim an item from a Witcher's inventory back to the DM Vault
  const handleReclaimItem = (itemId: string) => {
    if (!hasGmControls) return;
    let foundItem: GameItem | null = null;
    let holderSchool: WitcherSchool | null = null;

    Object.entries(partyCharacters).forEach(([school, char]) => {
      const item = (char.inventory || []).find((i) => i.id === itemId);
      if (item) {
        foundItem = { ...item, assignedToSchool: 'DM_VAULT' };
        holderSchool = school as WitcherSchool;
      }
    });

    const itemToReclaim = foundItem as GameItem | null;
    if (!itemToReclaim || !holderSchool) return;

    setPartyCharacters((prev) => {
      const char = prev[holderSchool!];
      if (!char) return prev;
      const updatedChar = {
        ...char,
        inventory: (char.inventory || []).filter((i) => i.id !== itemId),
      };
      if (selectedCharacter.school === holderSchool) {
        setSelectedCharacter(updatedChar);
      }
      return { ...prev, [holderSchool!]: updatedChar };
    });

    const newEconomy: CampaignEconomyState = {
      ...economyState,
      vaultItems: [...economyState.vaultItems, itemToReclaim],
    };
    setEconomyState(newEconomy);

    handleAddLogMessage(`🏛️ ${itemToReclaim.name} reclaimed to DM Vault.`, 'system');

    p2pManager.send({
      type: 'ECONOMY_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: {
        economyState: newEconomy,
        reclaimedItemId: itemId,
      },
      timestamp: Date.now(),
    });
  };

  // Transfer item or gold between Witchers
  const handleTransferItemOrGold = (
    toSchool: WitcherSchool,
    itemId?: string,
    goldAmount?: number
  ) => {
    const fromSchool = selectedCharacter.school;
    if (fromSchool === toSchool) return;

    // Players cannot rewrite two character sheets themselves: they ask the Game Master's client,
    // which moves only what is genuinely in their pack / purse and broadcasts the result.
    if (!hasGmControls) {
      if (isObserver) return;
      p2pManager.send({
        type: 'CHARACTER_UPDATE',
        senderId: p2pManager.myPeerId,
        senderName: selectedCharacter.name,
        payload: { transferRequest: { toSchool, itemId, goldAmount } },
        timestamp: Date.now(),
      });
      return;
    }

    const fromChar = partyCharacters[fromSchool] || selectedCharacter;
    const toChar = partyCharacters[toSchool] || PREGEN_WITCHERS.find((w) => w.school === toSchool);
    if (!fromChar || !toChar) return;

    let transferredItem: GameItem | undefined;
    let newFromInventory = [...(fromChar.inventory || [])];
    let newToInventory = [...(toChar.inventory || [])];

    if (itemId) {
      const idx = newFromInventory.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        transferredItem = { ...newFromInventory[idx], assignedToSchool: toSchool };
        newFromInventory.splice(idx, 1);
        newToInventory.push(transferredItem);
      }
    }

    const goldToMove = goldAmount && goldAmount > 0 ? Math.min(fromChar.gold || 0, goldAmount) : 0;
    const newFromGold = (fromChar.gold || 0) - goldToMove;
    const newToGold = (toChar.gold || 0) + goldToMove;

    const updatedFrom = { ...fromChar, gold: newFromGold, inventory: newFromInventory };
    const updatedTo = { ...toChar, gold: newToGold, inventory: newToInventory };

    setPartyCharacters((prev) => ({
      ...prev,
      [fromSchool]: updatedFrom,
      [toSchool]: updatedTo,
    }));

    setSelectedCharacter(updatedFrom);

    const details = [
      goldToMove > 0 ? `🪙 ${goldToMove} Orens` : '',
      transferredItem ? `📦 ${transferredItem.name}` : '',
    ].filter(Boolean).join(' and ');

    handleAddLogMessage(`🤝 ${fromChar.name} gave ${details} to ${toChar.name}.`, 'chat');

    p2pManager.send({
      type: 'CHARACTER_UPDATE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: { updatedFrom, updatedTo },
      timestamp: Date.now(),
    });
  };

  // Purchase an item from an Act Merchant.
  // GM (or an offline local session): executes the sale directly, any act, any Witcher.
  // Player: can only send a *request* for their OWN Witcher; the Game Master's client checks the
  // price, stock, purse and active act, and broadcasts the result. Nothing is applied locally
  // until the host confirms, so a modified client cannot pay less or take more.
  const handleMerchantPurchase = (
    buyerSchool: WitcherSchool,
    actNum: number,
    itemId: string
  ) => {
    if (hasGmControls) {
      applyMerchantPurchase(buyerSchool, actNum, itemId, false);
      return;
    }
    if (isObserver || buyerSchool !== selectedCharacter.school) return;
    p2pManager.send({
      type: 'MERCHANT_PURCHASE',
      senderId: p2pManager.myPeerId,
      senderName: selectedCharacter.name,
      payload: { buyerSchool, actNum, itemId },
      timestamp: Date.now(),
    });
  };

  // Bulk Clear Tokens (monsters, npcs, or all)
  const handleClearTokens = (category: 'monsters' | 'npcs' | 'all') => {
    if (!hasGmControls) return;
    let remaining = tokens;
    if (category === 'monsters') {
      remaining = tokens.filter((t) => !t.isMonster);
    } else if (category === 'npcs') {
      remaining = tokens.filter((t) => t.isMonster || !!t.school);
    } else if (category === 'all') {
      remaining = [];
    }
    setTokens(remaining);

    p2pManager.send({
      type: 'SYNC_STATE',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: { tokens: remaining },
      timestamp: Date.now(),
    });

    handleAddLogMessage(`Game Master cleared ${category} tokens from the tactical battle map.`, 'system');
  };

  // Change Map Scene
  const handleSceneChange = (scene: MapScene) => {
    if (!hasGmControls) return;
    setCurrentScene(scene);

    p2pManager.send({
      type: 'MAP_CHANGE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: scene.id,
      timestamp: Date.now(),
    });

    handleAddLogMessage(`Scene transitioned to Act ${scene.actNumber}: ${scene.name}`, 'system');
  };

  // Show or Clear Story Visualization Image (Replaces Battle Map on all screens)
  const handleShowStoryVisual = (visual: StoryVisualOverlay | null) => {
    if (!hasGmControls) return;
    setActiveStoryVisual(visual);
    if (visual !== null) {
      setActiveStoreAct(null);
    }

    p2pManager.send({
      type: 'STORY_VISUAL_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: visual,
      timestamp: Date.now(),
    });

    if (visual) {
      const msg: ChatMessage = {
        id: `visual-${Date.now()}`,
        senderId: 'gm',
        senderName: 'Game Master',
        isDM: true,
        type: 'lore',
        text: `🖼️ [Story Visualization: ${visual.title}] "${visual.caption}"`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      p2pManager.send({
        type: 'CHAT_MESSAGE',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: msg,
        timestamp: Date.now(),
      });
    } else {
      handleAddLogMessage('Returned view from Story Visualization to Tactical Battle Map.', 'system');
    }
  };

  // Show or Clear Merchant Store in Battle Map Area (Pushed to all screens by GM)
  const handleShowStore = (actNum: number | null) => {
    if (!hasGmControls) return;
    setActiveStoreAct(actNum);
    if (actNum !== null) {
      setActiveStoryVisual(null);
    }

    p2pManager.send({
      type: 'SHOW_MERCHANT_STORE',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: { actNumber: actNum },
      timestamp: Date.now(),
    });

    if (actNum !== null) {
      const merchant = economyState.actMerchants?.[actNum] || DEFAULT_ACT_MERCHANTS[actNum];
      const merchantName = merchant ? merchant.name : `Act ${actNum} Merchant`;
      const msg: ChatMessage = {
        id: `store-${Date.now()}`,
        senderId: 'gm',
        senderName: 'Game Master',
        isDM: true,
        type: 'lore',
        text: `🛒 [Waystation Store Opened] The Game Master has pushed ${merchantName}'s shop to the battle map viewing area!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      p2pManager.send({
        type: 'CHAT_MESSAGE',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: msg,
        timestamp: Date.now(),
      });
    } else {
      handleAddLogMessage('Closed Waystation Store; table returned to tactical battle map', 'system');
    }
  };

  // Update Interactive Party Choice (Cause & Effect Engine across Acts)
  const handleUpdatePartyChoice = (record: PartyChoiceRecord) => {
    if (!hasGmControls) return;
    const updated = {
      ...partyChoices,
      [record.choicePointId]: record,
    };
    setPartyChoices(updated);

    p2pManager.send({
      type: 'PARTY_CHOICES_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: updated,
      timestamp: Date.now(),
    });
  };

  // Toggle Character-Specific Spotlight Completion
  const handleToggleSpotlight = (spotlightId: string) => {
    if (!hasGmControls) return;
    setCompletedSpotlights((prev) => ({
      ...prev,
      [spotlightId]: !prev[spotlightId],
    }));
  };

  // Send Read-Aloud Script or Spotlight Prompt from Module directly to Party Chat Log
  const handleSendScriptToChat = (text: string, title?: string) => {
    if (!hasGmControls) return;
    const formatted = title ? `[${title}] ${text}` : text;
    const msg: ChatMessage = {
      id: `script-${Date.now()}`,
      senderId: 'gm',
      senderName: 'Game Master',
      isDM: true,
      type: 'lore',
      text: formatted,
      speechMode: 'dm',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, msg]);

    p2pManager.send({
      type: 'CHAT_MESSAGE',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: msg,
      timestamp: Date.now(),
    });
  };

  // Ping Map
  const handlePing = (x: number, y: number) => {
    setPingLocation({ x, y });
    setTimeout(() => setPingLocation(null), 2500);

    p2pManager.send({
      type: 'PING_COORDINATE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: { x, y },
      timestamp: Date.now(),
    });
  };

  // Switch Witcher Character
  const handleSelectCharacter = (char: WitcherCharacter) => {
    setSelectedCharacter(char);
    handleAddLogMessage(`${char.name} (School of the ${char.school}) readies their silver and steel.`, 'system');
  };

  // Claim / Lock Character (Enforces 1 of each Witcher; only DM can reassign)
  const handleClaimCharacter = (char: WitcherCharacter) => {
    if (isHost) {
      const updated: Record<string, CharacterAssignment> = {
        ...characterAssignments,
        [char.id]: {
          characterId: char.id,
          claimedByPeerId: 'gm',
          claimedByName: 'Game Master',
          isLocked: true,
          claimedAt: Date.now(),
        },
      };
      setCharacterAssignments(updated);
      p2pManager.send({
        type: 'CHARACTER_ASSIGNMENT_SYNC',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: updated,
        timestamp: Date.now(),
      });
      handleAddLogMessage(`Game Master locked in as ${char.name} (School of the ${char.school}).`, 'system');
    } else {
      p2pManager.send({
        type: 'CHARACTER_CLAIM',
        senderId: p2pManager.myPeerId,
        senderName: char.name,
        payload: { characterId: char.id, playerName: char.name },
        timestamp: Date.now(),
      });
      setCharacterAssignments((prev) => ({
        ...prev,
        [char.id]: {
          characterId: char.id,
          claimedByPeerId: p2pManager.myPeerId,
          claimedByName: char.name,
          isLocked: true,
          claimedAt: Date.now(),
        },
      }));
      handleAddLogMessage(`Claimed and locked into ${char.name} (School of the ${char.school}).`, 'system');
    }
  };

  // Reassign Character (Game Master Only)
  const handleReassignCharacter = (
    characterId: string,
    targetPeerId: string,
    targetPlayerName: string
  ) => {
    if (!isHost) return;
    const targetWitcher = PREGEN_WITCHERS.find((w) => w.id === characterId);
    const updated: Record<string, CharacterAssignment> = {
      ...characterAssignments,
      [characterId]: {
        characterId,
        claimedByPeerId: targetPeerId,
        claimedByName: targetPlayerName,
        isLocked: true,
        claimedAt: Date.now(),
      },
    };
    setCharacterAssignments(updated);
    p2pManager.send({
      type: 'CHARACTER_ASSIGNMENT_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: updated,
      timestamp: Date.now(),
    });
    handleAddLogMessage(
      `Game Master reassigned ${targetWitcher?.name} (School of the ${targetWitcher?.school}) to ${targetPlayerName}.`,
      'system'
    );
  };

  // Unlock / Free Character (Game Master Only)
  const handleUnlockCharacter = (characterId: string) => {
    if (!isHost) return;
    const targetWitcher = PREGEN_WITCHERS.find((w) => w.id === characterId);
    const updated = { ...characterAssignments };
    delete updated[characterId];
    setCharacterAssignments(updated);
    p2pManager.send({
      type: 'CHARACTER_ASSIGNMENT_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: updated,
      timestamp: Date.now(),
    });
    handleAddLogMessage(
      `Game Master unlocked ${targetWitcher?.name || 'Witcher'} — now available for players to claim!`,
      'system'
    );
  };

  // Spawn monster from Bestiary modal
  const handleSpawnFromBestiary = (monster: Monster) => {
    if (!hasGmControls) return;
    const original = MONSTERS.find((m) => m.id === monster.id);
    const baseHp = original ? original.hp : monster.hp;
    const scaledHp = scaleMonsterHp(baseHp, partySize);
    const rawAttacks = original ? original.attacks : monster.attacks;
    const scaledAttacks = rawAttacks?.map((a) => scaleMonsterAttack(a, partySize));

    const newToken: MapToken = {
      id: `mon-${Date.now()}`,
      name: monster.name,
      isMonster: true,
      avatarUrl: monster.imageUrl,
      x: 50,
      y: 50,
      baseMaxHp: baseHp,
      currentHp: scaledHp,
      maxHp: scaledHp,
      scaledPartySize: partySize,
      attacks: scaledAttacks,
      monsterId: monster.id,
      ac: monster.ac,
      category: monster.category,
      title: monster.title,
      tokenType: 'monster',
      color: '#ef4444',
    };
    handleTokenAdd(newToken);
    setIsBestiaryModalOpen(false);
  };

  // Load campaign save state from file or GM storage
  const handleLoadCampaignState = (saved: CampaignSaveState) => {
    if (!hasGmControls) return;
    if (saved.tokens && Array.isArray(saved.tokens)) setTokens(saved.tokens);
    if (saved.currentSceneId) {
      const s = MAP_SCENES.find((sc) => sc.id === saved.currentSceneId);
      if (s) setCurrentScene(s);
    }
    if (saved.messages && Array.isArray(saved.messages)) setMessages(saved.messages);
    if (saved.selectedCharacterId) {
      const ch = PREGEN_WITCHERS.find((w) => w.id === saved.selectedCharacterId);
      if (ch) setSelectedCharacter(ch);
    }
    if (saved.characterAssignments) {
      setCharacterAssignments(saved.characterAssignments);
    }
    if (saved.partyChoices) {
      setPartyChoices(saved.partyChoices);
    }
    if (saved.completedSpotlights) {
      setCompletedSpotlights(saved.completedSpotlights);
    }
    if (saved.activeStoryVisual !== undefined) {
      setActiveStoryVisual(saved.activeStoryVisual);
    }

    if (isHost) {
      p2pManager.send({
        type: 'INITIAL_STATE_SYNC',
        senderId: 'gm',
        senderName: 'Game Master',
        payload: {
          currentSceneId: saved.currentSceneId,
          tokens: saved.tokens,
          messages: saved.messages,
          selectedCharacterId: saved.selectedCharacterId,
          characterAssignments: saved.characterAssignments || characterAssignments,
          partyChoices: saved.partyChoices || partyChoices,
          activeStoryVisual: saved.activeStoryVisual ?? activeStoryVisual,
        },
        timestamp: Date.now(),
      });
      handleAddLogMessage('Authoritative campaign state restored from file and broadcast to all players.', 'system');
    }
  };

  // Broadcast current state to all connected P2P players
  const handleForceSyncPeers = () => {
    if (!isHost) return;
    p2pManager.send({
      type: 'INITIAL_STATE_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: {
        currentSceneId: currentScene.id,
        tokens,
        messages,
        selectedCharacterId: selectedCharacter.id,
        characterAssignments,
        partyChoices,
        activeStoryVisual,
      },
      timestamp: Date.now(),
    });
    handleAddLogMessage('Game Master broadcasted authoritative campaign state to all connected players.', 'system');
  };

  // Reset campaign to default
  const handleResetCampaign = () => {
    if (!hasGmControls) return;
    storageService.clearCampaignState();
    setCurrentScene(MAP_SCENES[0]);
    setSelectedCharacter(PREGEN_WITCHERS[0]);
    setTokens(getDefaultTokens());
    setActiveStoryVisual(null);
    setPartyChoices({});
    setCompletedSpotlights({});
    setMessages([
      {
        id: 'msg-init-1',
        senderId: 'system',
        senderName: 'Chronicle of Cintra',
        type: 'system',
        text: 'Session started: The year is 1184. Four witchers meet at the Lion & Lily Waystation in lower Cintra. (Click "How to Play & GM" in the top bar for full rules & instructions).',
        timestamp: Date.now() - 60000,
      },
      {
        id: 'msg-init-2',
        senderId: 'gm',
        senderName: 'Game Master',
        isDM: true,
        type: 'lore',
        text: 'Sir Danek of Marnadal nails a royal contract to the hearth pillar: 2,000 orens for the head of the Woodland Demon along the Yaruga river!',
        timestamp: Date.now() - 30000,
      },
    ]);
  };

  // Check if active character is locked to this seat
  const isCurrentCharacterLocked = Boolean(
    Object.values(characterAssignments).find(
      (a) =>
        a.isLocked &&
        (a.claimedByPeerId === p2pManager.myPeerId ||
          (isHost && a.claimedByPeerId === 'gm') ||
          a.claimedByName === selectedCharacter.name)
    )
  );

  // Player count calculation (No denominator! Counts active Witcher players)
  const gmPlayerCount = gmPlaysWitcher ? 1 : 0;
  const peerPlayersCount = connectedPeers.filter((p) => !p.isObserver).length;
  const lockedCharCount = Object.values(characterAssignments).filter((a) => a.isLocked).length;

  const totalPlayersInRoom = isConnected
    ? Math.max(gmPlayerCount + peerPlayersCount, lockedCharCount || (gmPlaysWitcher ? 1 : 0))
    : 0;

  const observersCount = connectedPeers.filter((p) => p.isObserver).length;

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#d6d9dc] flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        selectedCharacter={selectedCharacter}
        currentScene={currentScene}
        isConnected={isConnected}
        isHost={hasGmControls}
        gmPlaysWitcher={gmPlaysWitcher}
        peerCount={peerCount}
        totalPlayersInRoom={totalPlayersInRoom}
        observersCount={observersCount}
        statusText={statusText}
        isCharacterLocked={isCurrentCharacterLocked}
        onOpenP2PModal={() => setIsP2PModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenBestiaryModal={() => setIsBestiaryModalOpen(true)}
        onOpenCharacterSelect={() => setIsCharSelectOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
        onOpenGMModal={() => setIsGMModalOpen(true)}
        onOpenInstructionsModal={() => setIsInstructionsModalOpen(true)}
        onOpenDMInventoryModal={() => setIsDMInventoryModalOpen(true)}
        onToggleDiceTray={() => setIsDiceTrayOpen(!isDiceTrayOpen)}
        isDiceTrayOpen={isDiceTrayOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4 min-h-0">
        
        {/* VIEW 1: TACTICAL MAP & CHAT */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 min-w-0 lg:h-[calc(100vh-125px)] lg:max-h-[calc(100vh-125px)]">
            {/* Tactical Map Area (2/3 width) */}
            <div className="lg:col-span-2 h-[520px] lg:h-full flex flex-col min-w-0 min-h-0 overflow-hidden">
              <TacticalMap
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
                tokens={tokens}
                onTokenMove={handleTokenMove}
                onTokenAdd={handleTokenAdd}
                onTokenRemove={handleTokenRemove}
                onTokenUpdate={handleTokenUpdate}
                onTokenHpChange={handleTokenHpChange}
                onSetTokenHp={handleSetTokenHp}
                onClearCategory={handleClearTokens}
                onPing={handlePing}
                pingLocation={pingLocation}
                isHost={isHost || !isConnected}
                selectedCharacter={selectedCharacter}
                activeStoryVisual={activeStoryVisual}
                onShowStoryVisual={handleShowStoryVisual}
                onOpenWitcherSheet={handleOpenWitcherSheet}
                activeStoreAct={activeStoreAct}
                onShowStore={handleShowStore}
                actMerchants={economyState.actMerchants}
                partyCharacters={partyCharacters}
                onBuyMerchantItem={handleMerchantPurchase}
                partySize={partySize}
              />
            </div>

            {/* Chat & Combat Log Area (1/3 width) */}
            <div className="h-[480px] lg:h-full flex flex-col min-w-0 min-h-0 overflow-hidden">
              <ChatCombatLog
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserName={selectedCharacter.name}
                currentUserSchool={selectedCharacter.school}
                isHost={hasGmControls}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: WITCHER CHARACTER SHEET */}
        {activeTab === 'sheet' && (
          <div className="max-w-4xl mx-auto w-full">
            <CharacterSheet
              character={selectedCharacter}
              partyCharacters={partyCharacters}
              onUpdateCharacter={handleUpdateCharacter}
              onRollDice={handleRollDice}
              onAddLogMessage={handleAddLogMessage}
              onTransferItemOrGold={handleTransferItemOrGold}
            />
          </div>
        )}

        {/* VIEW 3: INLINE BESTIARY (if toggled via tab) */}
        {activeTab === 'bestiary' && (
          <div className="flex-1">
            <BestiaryModal
              isOpen={true}
              onClose={() => setActiveTab('map')}
              onSpawnMonster={handleSpawnFromBestiary}
              isHost={hasGmControls}
              partySize={partySize}
            />
          </div>
        )}

        {/* VIEW 4: INLINE ADVENTURE GUIDE (GM Only) */}
        {activeTab === 'guide' && hasGmControls && (
          <div className="flex-1">
            <AdventureGuideModal
              isOpen={true}
              onClose={() => setActiveTab('map')}
              activeStoryVisual={activeStoryVisual}
              onShowStoryVisual={handleShowStoryVisual}
              partyChoices={partyChoices}
              onUpdatePartyChoice={handleUpdatePartyChoice}
              completedSpotlights={completedSpotlights}
              onToggleSpotlight={handleToggleSpotlight}
              onSendScriptToChat={handleSendScriptToChat}
              isHost={hasGmControls}
              characters={partyCharacters}
              actMerchants={economyState.actMerchants}
              onBuyMerchantItem={handleMerchantPurchase}
              currentShopperSchool={selectedCharacter.school}
              onShowStore={handleShowStore}
            />
          </div>
        )}

      </main>

      {/* Interactive Dice Tray Drawer */}
      <DiceRollerTray
        isOpen={isDiceTrayOpen}
        onClose={() => setIsDiceTrayOpen(false)}
        onRoll={handleRollDice}
      />

      {/* Character Select & Locking Modal */}
      <CharacterSelect
        isOpen={isCharSelectOpen}
        onClose={() => setIsCharSelectOpen(false)}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={handleSelectCharacter}
        characterAssignments={characterAssignments}
        onClaimCharacter={handleClaimCharacter}
        isHost={isHost}
        myPeerId={p2pManager.myPeerId}
        myPlayerName={selectedCharacter.name}
        connectedPeers={connectedPeers}
        onReassignCharacter={handleReassignCharacter}
        onUnlockCharacter={handleUnlockCharacter}
        isObserver={isObserver}
      />

      {/* P2P Multiplayer Modal */}
      <P2PModal
        isOpen={isP2PModalOpen}
        onClose={() => setIsP2PModalOpen(false)}
        isHost={isHost}
        isConnected={isConnected}
        peerCount={peerCount}
        connectedPeers={connectedPeers}
        statusText={statusText}
        onConnectHost={handleConnectHost}
        onConnectClient={handleConnectClient}
        onDisconnect={handleDisconnect}
        onKickPeer={handleKickPeer}
        isRoomLocked={isRoomLocked}
        onToggleRoomLock={handleToggleRoomLock}
        onForceSyncPeers={handleForceSyncPeers}
        playerName={selectedCharacter.name}
        initialRoomFromUrl={initialRoomFromUrl}
        onOpenInstructions={() => setIsInstructionsModalOpen(true)}
        gmPlaysWitcher={gmPlaysWitcher}
        onToggleGmPlaysWitcher={handleToggleGmPlaysWitcher}
        characterAssignments={characterAssignments}
        selectedCharacterId={selectedCharacter.id}
      />

      {/* Bestiary Modal (Overlay) */}
      <BestiaryModal
        isOpen={isBestiaryModalOpen}
        onClose={() => setIsBestiaryModalOpen(false)}
        onSpawnMonster={handleSpawnFromBestiary}
        isHost={hasGmControls}
        partySize={partySize}
      />

      {/* Adventure Guide Modal (Overlay - GM Only) */}
      <AdventureGuideModal
        isOpen={isGuideModalOpen && hasGmControls}
        onClose={() => setIsGuideModalOpen(false)}
        activeStoryVisual={activeStoryVisual}
        onShowStoryVisual={handleShowStoryVisual}
        partyChoices={partyChoices}
        onUpdatePartyChoice={handleUpdatePartyChoice}
        completedSpotlights={completedSpotlights}
        onToggleSpotlight={handleToggleSpotlight}
        onSendScriptToChat={handleSendScriptToChat}
        isHost={hasGmControls}
        characters={partyCharacters}
        actMerchants={economyState.actMerchants}
        onBuyMerchantItem={handleMerchantPurchase}
        currentShopperSchool={selectedCharacter.school}
        onShowStore={handleShowStore}
      />

      {/* How to Play & GM Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        onOpenP2P={() => setIsP2PModalOpen(true)}
        onOpenGuide={() => hasGmControls && setIsGuideModalOpen(true)}
        onOpenGMModal={() => setIsGMModalOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
        isHost={hasGmControls}
      />

      {/* Notion Wiki & Session Chronicle Modal */}
      <NotionWikiModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        messages={messages}
        selectedCharacter={selectedCharacter}
        currentScene={currentScene}
      />

      {/* Game Master Local Storage & Campaign Backup Modal */}
      <GMCampaignModal
        isOpen={isGMModalOpen}
        onClose={() => setIsGMModalOpen(false)}
        isHost={hasGmControls}
        tokens={tokens}
        messages={messages}
        currentScene={currentScene}
        selectedCharacter={selectedCharacter}
        onLoadCampaignState={handleLoadCampaignState}
        onForceSyncPeers={handleForceSyncPeers}
        onResetCampaign={handleResetCampaign}
      />

      {/* DM Screen Inventory & Finite Reward Vault Modal */}
      <DMInventoryModal
        isOpen={isDMInventoryModalOpen}
        onClose={() => setIsDMInventoryModalOpen(false)}
        isHost={hasGmControls}
        economyState={economyState}
        characters={partyCharacters}
        onAwardReward={handleAwardReward}
        onReclaimItem={handleReclaimItem}
      />

    </div>
  );
};

export default App;
