import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { storageService, CampaignSaveState } from './services/storageService';
import { getAssetUrl } from './utils/assets';

import { 
  WitcherCharacter, 
  MapScene, 
  MapToken, 
  ChatMessage, 
  P2PPacket, 
  Monster,
  SpeechRoleplayMode 
} from './types';
import { PREGEN_WITCHERS } from './data/characters';
import { MAP_SCENES } from './data/maps';
import { p2pManager, ConnectedPeerInfo } from './services/peerService';
import { playCriticalHitSound } from './utils/audio';

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

  // Networking state
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [connectedPeers, setConnectedPeers] = useState<ConnectedPeerInfo[]>([]);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [statusText, setStatusText] = useState('P2P Standby (Offline Ready)');
  const [initialRoomFromUrl, setInitialRoomFromUrl] = useState<string | undefined>(undefined);

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
        text: 'Session started: The year is 1184. Four witchers meet at the Lion & Lily Waystation in lower Cintra.',
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

  // Ref to hold live state for asynchronous P2P packet handling
  const gameStateRef = useRef({ currentScene, tokens, messages, selectedCharacter, isHost });
  useEffect(() => {
    gameStateRef.current = { currentScene, tokens, messages, selectedCharacter, isHost };
  }, [currentScene, tokens, messages, selectedCharacter, isHost]);

  // Auto-save to Game Master's browser local storage
  useEffect(() => {
    storageService.saveCampaignState({
      currentSceneId: currentScene.id,
      tokens,
      messages,
      selectedCharacterId: selectedCharacter.id,
    });
  }, [currentScene, tokens, messages, selectedCharacter]);

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
        const { tokenId, x, y } = packet.payload;
        setTokens((prev) =>
          prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
        );
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
        break;

      case 'SYNC_STATE':
        if (packet.payload.tokens) setTokens(packet.payload.tokens);
        if (packet.payload.currentSceneId) {
          const s = MAP_SCENES.find((sc) => sc.id === packet.payload.currentSceneId);
          if (s) setCurrentScene(s);
        }
        break;
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
  const handleConnectHost = async (roomCode: string, pin: string = '') => {
    await p2pManager.hostRoom(roomCode, pin);
    setIsHost(true);
    setIsConnected(true);
    setIsRoomLocked(false);
  };

  // Connect as Client
  const handleConnectClient = async (roomCode: string, name: string, pin: string = '') => {
    await p2pManager.joinRoom(roomCode, name, pin, selectedCharacter.school);
    setIsHost(false);
    setIsConnected(true);
  };

  // Disconnect
  const handleDisconnect = () => {
    p2pManager.disconnect();
    setIsHost(false);
    setIsConnected(false);
    setPeerCount(0);
    setConnectedPeers([]);
    setIsRoomLocked(false);
    setStatusText('Disconnected');
  };

  // Kick Peer (Host Only)
  const handleKickPeer = (peerId: string) => {
    p2pManager.kickPeer(peerId);
  };

  // Toggle Room Lock (Host Only)
  const handleToggleRoomLock = (locked: boolean) => {
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
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
    );

    p2pManager.send({
      type: 'TOKEN_MOVE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: { tokenId, x, y },
      timestamp: Date.now(),
    });
  };

  // Add Monster Token (Host GM tool)
  const handleTokenAdd = (token: MapToken) => {
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
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));

    p2pManager.send({
      type: 'TOKEN_REMOVE',
      senderId: selectedCharacter.id,
      senderName: selectedCharacter.name,
      payload: tokenId,
      timestamp: Date.now(),
    });
  };

  // Change Map Scene
  const handleSceneChange = (scene: MapScene) => {
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

  // Spawn monster from Bestiary modal
  const handleSpawnFromBestiary = (monster: Monster) => {
    const newToken: MapToken = {
      id: `mon-${Date.now()}`,
      name: monster.name,
      isMonster: true,
      avatarUrl: monster.imageUrl,
      x: 50,
      y: 50,
      currentHp: monster.hp,
      maxHp: monster.maxHp,
      color: '#ef4444',
    };
    handleTokenAdd(newToken);
    setIsBestiaryModalOpen(false);
  };

  // Load campaign save state from file or GM storage
  const handleLoadCampaignState = (saved: CampaignSaveState) => {
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
        },
        timestamp: Date.now(),
      });
      handleAddLogMessage('Authoritative campaign state restored from file and broadcast to all players.', 'system');
    }
  };

  // Broadcast current state to all connected P2P players
  const handleForceSyncPeers = () => {
    p2pManager.send({
      type: 'INITIAL_STATE_SYNC',
      senderId: 'gm',
      senderName: 'Game Master',
      payload: {
        currentSceneId: currentScene.id,
        tokens,
        messages,
        selectedCharacterId: selectedCharacter.id,
      },
      timestamp: Date.now(),
    });
    handleAddLogMessage('Game Master broadcasted authoritative campaign state to all connected players.', 'system');
  };

  // Reset campaign to default
  const handleResetCampaign = () => {
    storageService.clearCampaignState();
    setCurrentScene(MAP_SCENES[0]);
    setSelectedCharacter(PREGEN_WITCHERS[0]);
    setTokens(getDefaultTokens());
    setMessages([
      {
        id: 'msg-init-1',
        senderId: 'system',
        senderName: 'Chronicle of Cintra',
        type: 'system',
        text: 'Session started: The year is 1184. Four witchers meet at the Lion & Lily Waystation in lower Cintra.',
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

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#d6d9dc] flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        selectedCharacter={selectedCharacter}
        currentScene={currentScene}
        isConnected={isConnected}
        isHost={isHost}
        peerCount={peerCount}
        statusText={statusText}
        onOpenP2PModal={() => setIsP2PModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenBestiaryModal={() => setIsBestiaryModalOpen(true)}
        onOpenCharacterSelect={() => setIsCharSelectOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
        onOpenGMModal={() => setIsGMModalOpen(true)}
        onToggleDiceTray={() => setIsDiceTrayOpen(!isDiceTrayOpen)}
        isDiceTrayOpen={isDiceTrayOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">
        
        {/* VIEW 1: TACTICAL MAP & CHAT */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 h-[calc(100vh-120px)] min-h-[620px]">
            {/* Tactical Map Area (2/3 width) */}
            <div className="lg:col-span-2 h-full flex flex-col">
              <TacticalMap
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
                tokens={tokens}
                onTokenMove={handleTokenMove}
                onTokenAdd={handleTokenAdd}
                onTokenRemove={handleTokenRemove}
                onPing={handlePing}
                pingLocation={pingLocation}
                isHost={isHost}
                selectedCharacter={selectedCharacter}
              />
            </div>

            {/* Chat & Combat Log Area (1/3 width) */}
            <div className="h-full flex flex-col">
              <ChatCombatLog
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserName={selectedCharacter.name}
                currentUserSchool={selectedCharacter.school}
                onOpenNotionModal={() => setIsNotionModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: WITCHER CHARACTER SHEET */}
        {activeTab === 'sheet' && (
          <div className="max-w-4xl mx-auto w-full">
            <CharacterSheet
              character={selectedCharacter}
              onUpdateCharacter={setSelectedCharacter}
              onRollDice={handleRollDice}
              onAddLogMessage={handleAddLogMessage}
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
              isHost={isHost}
            />
          </div>
        )}

        {/* VIEW 4: INLINE ADVENTURE GUIDE */}
        {activeTab === 'guide' && (
          <div className="flex-1">
            <AdventureGuideModal
              isOpen={true}
              onClose={() => setActiveTab('map')}
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

      {/* Character Select Modal */}
      <CharacterSelect
        isOpen={isCharSelectOpen}
        onClose={() => setIsCharSelectOpen(false)}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={handleSelectCharacter}
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
      />

      {/* Bestiary Modal (Overlay) */}
      <BestiaryModal
        isOpen={isBestiaryModalOpen}
        onClose={() => setIsBestiaryModalOpen(false)}
        onSpawnMonster={handleSpawnFromBestiary}
        isHost={isHost}
      />

      {/* Adventure Guide Modal (Overlay) */}
      <AdventureGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
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
        isHost={isHost}
        tokens={tokens}
        messages={messages}
        currentScene={currentScene}
        selectedCharacter={selectedCharacter}
        onLoadCampaignState={handleLoadCampaignState}
        onForceSyncPeers={handleForceSyncPeers}
        onResetCampaign={handleResetCampaign}
      />

    </div>
  );
};

export default App;
