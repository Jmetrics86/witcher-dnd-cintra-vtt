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
import { InstructionsModal } from './components/InstructionsModal';
import { storageService, CampaignSaveState } from './services/storageService';
import { getAssetUrl } from './utils/assets';

import { 
  WitcherCharacter, 
  MapScene, 
  MapToken, 
  ChatMessage, 
  P2PPacket, 
  Monster,
  SpeechRoleplayMode,
  CharacterAssignment,
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
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  // Networking state
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gmPlaysWitcher, setGmPlaysWitcher] = useState<boolean>(true);
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

  // Ref to hold live state for asynchronous P2P packet handling
  const gameStateRef = useRef({
    currentScene,
    tokens,
    messages,
    selectedCharacter,
    characterAssignments,
    isHost,
  });
  useEffect(() => {
    gameStateRef.current = {
      currentScene,
      tokens,
      messages,
      selectedCharacter,
      characterAssignments,
      isHost,
    };
  }, [currentScene, tokens, messages, selectedCharacter, characterAssignments, isHost]);

  // Auto-save to Game Master's browser local storage
  useEffect(() => {
    storageService.saveCampaignState({
      currentSceneId: currentScene.id,
      tokens,
      messages,
      selectedCharacterId: selectedCharacter.id,
      characterAssignments,
    });
  }, [currentScene, tokens, messages, selectedCharacter, characterAssignments]);

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
              characterAssignments: gameStateRef.current.characterAssignments,
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
        if (packet.payload.characterAssignments) {
          const assignments = packet.payload.characterAssignments as Record<string, CharacterAssignment>;
          setCharacterAssignments(assignments);

          // Check if newly joined player already has an assigned locked character
          const myAssignment = Object.values(assignments).find(
            (a) => a.claimedByPeerId === p2pManager.myPeerId
          );
          if (myAssignment) {
            const found = PREGEN_WITCHERS.find((w) => w.id === myAssignment.characterId);
            if (found) setSelectedCharacter(found);
          } else {
            // Guided player onboarding: Open character select & locking modal!
            setIsCharSelectOpen(true);
          }
        } else {
          setIsCharSelectOpen(true);
        }
        break;

      case 'CHARACTER_CLAIM': {
        if (gameStateRef.current.isHost) {
          const { characterId, playerName } = packet.payload;
          const existing = gameStateRef.current.characterAssignments[characterId];
          const targetWitcher = PREGEN_WITCHERS.find((w) => w.id === characterId);

          if (existing && existing.isLocked && existing.claimedByPeerId !== packet.senderId) {
            // Already claimed by someone else
            p2pManager.send({
              type: 'CHAT_MESSAGE',
              senderId: 'system',
              senderName: 'Chronicle of Cintra',
              payload: {
                id: `claim-denied-${Date.now()}`,
                senderId: 'system',
                senderName: 'System',
                type: 'system',
                text: `School of the ${targetWitcher?.school || 'Witcher'} is already claimed by ${existing.claimedByName}! Please select an available School.`,
                timestamp: Date.now(),
              },
              timestamp: Date.now(),
            });
            return;
          }

          // Approve and update assignment
          const updated: Record<string, CharacterAssignment> = {
            ...gameStateRef.current.characterAssignments,
            [characterId]: {
              characterId,
              claimedByPeerId: packet.senderId,
              claimedByName: playerName || packet.senderName,
              isLocked: true,
              claimedAt: Date.now(),
            },
          };

          setCharacterAssignments(updated);

          // Broadcast authoritative assignments to all connected players
          p2pManager.send({
            type: 'CHARACTER_ASSIGNMENT_SYNC',
            senderId: 'gm',
            senderName: 'Game Master',
            payload: updated,
            timestamp: Date.now(),
          });

          // Announce in chat log
          const claimNotice = `⚔️ ${playerName || packet.senderName} has locked in ${targetWitcher?.name} (School of the ${targetWitcher?.school})!`;
          setMessages((prev) => [
            ...prev,
            {
              id: `claim-${Date.now()}`,
              senderId: 'system',
              senderName: 'Chronicle of Cintra',
              type: 'system',
              text: claimNotice,
              timestamp: Date.now(),
            },
          ]);
        }
        break;
      }

      case 'CHARACTER_ASSIGNMENT_SYNC': {
        const assignments = packet.payload as Record<string, CharacterAssignment>;
        setCharacterAssignments(assignments);

        // If I was assigned a character, update my selected Witcher
        const myAssignment = Object.values(assignments).find(
          (a) =>
            a.claimedByPeerId === p2pManager.myPeerId ||
            (!gameStateRef.current.isHost && a.claimedByName === gameStateRef.current.selectedCharacter.name)
        );
        if (myAssignment) {
          const found = PREGEN_WITCHERS.find((w) => w.id === myAssignment.characterId);
          if (found && found.id !== gameStateRef.current.selectedCharacter.id) {
            setSelectedCharacter(found);
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
    if (saved.characterAssignments) {
      setCharacterAssignments(saved.characterAssignments);
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
        characterAssignments,
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

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#d6d9dc] flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        selectedCharacter={selectedCharacter}
        currentScene={currentScene}
        isConnected={isConnected}
        isHost={isHost}
        gmPlaysWitcher={gmPlaysWitcher}
        peerCount={peerCount}
        statusText={statusText}
        isCharacterLocked={isCurrentCharacterLocked}
        onOpenP2PModal={() => setIsP2PModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenBestiaryModal={() => setIsBestiaryModalOpen(true)}
        onOpenCharacterSelect={() => setIsCharSelectOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
        onOpenGMModal={() => setIsGMModalOpen(true)}
        onOpenInstructionsModal={() => setIsInstructionsModalOpen(true)}
        onToggleDiceTray={() => setIsDiceTrayOpen(!isDiceTrayOpen)}
        isDiceTrayOpen={isDiceTrayOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">
        
        {/* VIEW 1: TACTICAL MAP & CHAT */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 h-[calc(100vh-120px)] min-h-[620px] min-w-0">
            {/* Tactical Map Area (2/3 width) */}
            <div className="lg:col-span-2 h-full flex flex-col min-w-0 overflow-hidden">
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
            <div className="h-full flex flex-col min-w-0 overflow-hidden">
              <ChatCombatLog
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserName={selectedCharacter.name}
                currentUserSchool={selectedCharacter.school}
                onOpenNotionModal={() => setIsNotionModalOpen(true)}
                onOpenInstructions={() => setIsInstructionsModalOpen(true)}
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
        isHost={isHost}
      />

      {/* Adventure Guide Modal (Overlay) */}
      <AdventureGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* How to Play & GM Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        onOpenP2P={() => setIsP2PModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenGMModal={() => setIsGMModalOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
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
