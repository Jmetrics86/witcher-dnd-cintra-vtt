import Peer, { DataConnection } from 'peerjs';
import { P2PPacket } from '../types';
import {
  deriveSignalingPeerId,
  deriveAesGcmKey,
  generateRandomNonce,
  computeChallengeProof,
  encryptPacket,
  decryptPacket,
  validateAndSanitizePacket,
  sanitizeRoomCode,
  SecureP2PEnvelope,
  HandshakeFrame,
} from '../utils/cryptoSecurity';

export interface ConnectedPeerInfo {
  peerId: string;
  playerName: string;
  school?: string;
  joinedAt: number;
  latencyMs?: number;
  isEncrypted: boolean;
  isObserver?: boolean;
}

const MAX_PLAYERS = 4; // Max 4 active Witcher players (Wolf, Cat, Griffin, Bear)
const MAX_ROOM_CAPACITY = 24; // Up to 24 WebRTC connections (1 Narrator + 4 Players + Observers)
const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_PACKETS_PER_SEC = 25;
const MAX_CLIENT_PAYLOAD_BYTES = 65536; // 64 KB max from a client
const CONNECTION_TIMEOUT_MS = 12000; // 12 seconds

// Packet types the host is allowed to relay verbatim to the other players. Everything else a
// client sends (claims, character updates, purchase requests) is only a *request*: the host
// adjudicates it and broadcasts its own authoritative result instead of forwarding the request.
const RELAYED_CLIENT_PACKET_TYPES = new Set<P2PPacket['type']>([
  'CHAT_MESSAGE',
  'DICE_ROLL',
  'TOKEN_MOVE',
  'PING_COORDINATE',
]);

/**
 * Host-side authorization hook. Receives a schema-validated packet from an authenticated client
 * (with senderId/senderName already overwritten by the host with the verified peer identity) and
 * returns the packet to process, or null to drop it.
 */
export type ClientPacketGuard = (packet: P2PPacket, peer: ConnectedPeerInfo) => P2PPacket | null;

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

export class P2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private authenticatedPeers: Map<string, ConnectedPeerInfo> = new Map();
  private pendingChallenges: Map<string, string> = new Map();
  private rateLimitCounters: Map<string, { count: number; resetAt: number }> = new Map();
  private seenNonces: Set<string> = new Set();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  private hostConnection: DataConnection | null = null;
  private roomKey: CryptoKey | null = null;
  private currentRoomCode: string = '';
  private currentRoomPin: string = '';

  public myPeerId: string = '';
  public isHost: boolean = false;
  public isConnected: boolean = false;
  public isRoomLocked: boolean = false;
  public hasPinProtection: boolean = false;
  public hostPlaysWitcher: boolean = true;
  public isObserver: boolean = false;

  private onPacketCallback: ((packet: P2PPacket) => void) | null = null;
  private onPeerCountCallback: ((count: number) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;
  private onPeersUpdateCallback: ((peers: ConnectedPeerInfo[]) => void) | null = null;

  public setCallbacks(
    onPacket: (packet: P2PPacket) => void,
    onPeerCount?: (count: number) => void,
    onStatusChange?: (status: string) => void,
    onPeersUpdate?: (peers: ConnectedPeerInfo[]) => void
  ) {
    this.onPacketCallback = onPacket;
    this.onPeerCountCallback = onPeerCount || null;
    this.onStatusChangeCallback = onStatusChange || null;
    this.onPeersUpdateCallback = onPeersUpdate || null;
  }

  private packetGuard: ClientPacketGuard | null = null;

  /** Installs the host-side authorization hook for packets coming from clients. */
  public setPacketGuard(guard: ClientPacketGuard | null) {
    this.packetGuard = guard;
  }

  /** Host-only: records which Witcher school a peer actually holds (derived from GM-approved claims). */
  public setPeerSchool(peerId: string, school: string | undefined) {
    if (!this.isHost) return;
    const info = this.authenticatedPeers.get(peerId);
    if (info && info.school !== school) {
      info.school = school;
      this.notifyPeersUpdated();
    }
  }

  private notifyPeersUpdated() {
    const list = Array.from(this.authenticatedPeers.values());
    this.onPeerCountCallback?.(this.isHost ? list.length : this.isConnected ? 1 : 0);
    this.onPeersUpdateCallback?.(list);
  }

  public setRoomLocked(locked: boolean) {
    if (!this.isHost) return; // Only the Game Master controls the room lock
    this.isRoomLocked = locked;
    if (this.isHost && this.isConnected) {
      const playerPeers = Array.from(this.authenticatedPeers.values()).filter((p) => !p.isObserver).length;
      const totalPlayers = (this.hostPlaysWitcher ? 1 : 0) + playerPeers;
      this.onStatusChangeCallback?.(
        locked
          ? `Room Locked (${totalPlayers} ${totalPlayers === 1 ? 'Player' : 'Players'} in Room)`
          : `Hosting Room: ${this.currentRoomCode} (${totalPlayers} ${totalPlayers === 1 ? 'Player' : 'Players'} in Room)`
      );
    }
  }

  public kickPeer(peerId: string, reason: string = 'Removed from session by Game Master') {
    if (!this.isHost) return;
    const conn = this.connections.get(peerId);
    const peerInfo = this.authenticatedPeers.get(peerId);

    if (conn && conn.open) {
      const kickFrame: HandshakeFrame = {
        _witcherHandshake: true,
        step: 'KICK_NOTICE',
        reason,
        ts: Date.now(),
      };
      try {
        conn.send(kickFrame);
      } catch {
        // Ignore send errors on kick
      }
      setTimeout(() => {
        try {
          conn.close();
        } catch {
          // Ignore close errors
        }
      }, 150);
    }

    this.connections.delete(peerId);
    this.authenticatedPeers.delete(peerId);
    this.pendingChallenges.delete(peerId);
    this.rateLimitCounters.delete(peerId);
    this.notifyPeersUpdated();

    if (peerInfo) {
      this.onStatusChangeCallback?.(`Kicked ${peerInfo.playerName} from session.`);
    }
  }

  public setHostPlaysWitcher(plays: boolean) {
    this.hostPlaysWitcher = plays;
    if (this.isHost && this.isConnected) {
      const playerPeers = Array.from(this.authenticatedPeers.values()).filter((p) => !p.isObserver).length;
      const totalPlayers = (plays ? 1 : 0) + playerPeers;
      this.onStatusChangeCallback?.(
        plays
          ? `Hosting: ${this.currentRoomCode} (GM Playing Witcher • ${totalPlayers} ${totalPlayers === 1 ? 'Player' : 'Players'})`
          : `Hosting: ${this.currentRoomCode} (GM Narrator Mode • ${totalPlayers} ${totalPlayers === 1 ? 'Player' : 'Players'})`
      );
    }
  }

  public getRoomInfo() {
    const playerPeers = Array.from(this.authenticatedPeers.values()).filter((p) => !p.isObserver).length;
    const totalPlayers = (this.hostPlaysWitcher ? 1 : 0) + playerPeers;
    const observers = Array.from(this.authenticatedPeers.values()).filter((p) => p.isObserver).length;
    return {
      roomCode: this.currentRoomCode,
      hasPin: this.hasPinProtection,
      isLocked: this.isRoomLocked,
      hostPlaysWitcher: this.hostPlaysWitcher,
      playersCount: totalPlayers,
      observersCount: observers,
    };
  }

  // Host a game room with optional PIN/Passphrase and AES-256-GCM encryption
  public async hostRoom(roomCode: string, pin: string = ''): Promise<string> {
    this.disconnect();
    this.isHost = true;
    const cleanRoom = sanitizeRoomCode(roomCode);
    if (!cleanRoom) {
      throw new Error('Please enter a valid alphanumeric room code.');
    }

    this.currentRoomCode = cleanRoom;
    this.currentRoomPin = pin.trim();
    this.hasPinProtection = Boolean(this.currentRoomPin);

    // Derive obfuscated signaling ID and AES-256-GCM encryption key
    const signalingPeerId = await deriveSignalingPeerId(cleanRoom, this.currentRoomPin);
    this.roomKey = await deriveAesGcmKey(cleanRoom, this.currentRoomPin);

    return new Promise((resolve, reject) => {
      this.onStatusChangeCallback?.('Initializing encrypted WebRTC host session...');

      let settled = false;
      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.disconnect();
          const err = new Error('Signaling broker timed out. Check your network or firewall.');
          this.onStatusChangeCallback?.(err.message);
          reject(err);
        }
      }, CONNECTION_TIMEOUT_MS);

      try {
        this.peer = new Peer(signalingPeerId, {
          debug: 1,
          secure: true,
          config: {
            iceServers: ICE_SERVERS,
          },
        });

        this.peer.on('open', (id) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          this.myPeerId = id;
          this.isConnected = true;
          this.startHeartbeat();
          this.onStatusChangeCallback?.(
            `Hosting Secure Room: ${cleanRoom}${this.hasPinProtection ? ' (PIN + AES-256)' : ' (AES-256)'}`
          );
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.setupHostConnection(conn);
        });

        this.peer.on('disconnected', () => {
          if (this.peer && !this.peer.destroyed) {
            this.onStatusChangeCallback?.('Signaling reconnecting...');
            this.peer.reconnect();
          }
        });

        this.peer.on('error', (err: any) => {
          clearTimeout(timeoutId);
          console.warn('Peer error (host):', err);
          if (err.type === 'unavailable-id') {
            this.onStatusChangeCallback?.('Room code + PIN combination is already active! Choose another.');
          } else {
            this.onStatusChangeCallback?.(`P2P Status: ${err.type || 'Offline mode active'}`);
          }
          if (!settled) {
            settled = true;
            reject(err);
          }
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Failed to init host peer:', err);
        if (!settled) {
          settled = true;
          reject(err);
        }
      }
    });
  }

  private checkRateLimit(peerId: string): boolean {
    const now = Date.now();
    const record = this.rateLimitCounters.get(peerId);
    if (!record || now > record.resetAt) {
      this.rateLimitCounters.set(peerId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }
    record.count += 1;
    return record.count <= MAX_PACKETS_PER_SEC;
  }

  private setupHostConnection(conn: DataConnection) {
    const remotePeerId = conn.peer;

    conn.on('open', () => {
      // 1. Check if Room is Locked by GM
      if (this.isRoomLocked) {
        const rejectFrame: HandshakeFrame = {
          _witcherHandshake: true,
          step: 'AUTH_REJECT',
          reason: 'Room is currently locked by the Game Master.',
          ts: Date.now(),
        };
        conn.send(rejectFrame);
        setTimeout(() => conn.close(), 250);
        return;
      }

      // 2. Check Room Connection Limit (Allows up to 24 participants including observers)
      if (this.authenticatedPeers.size >= MAX_ROOM_CAPACITY) {
        const rejectFrame: HandshakeFrame = {
          _witcherHandshake: true,
          step: 'AUTH_REJECT',
          reason: `Room has reached maximum capacity (${MAX_ROOM_CAPACITY} participants).`,
          ts: Date.now(),
        };
        conn.send(rejectFrame);
        setTimeout(() => conn.close(), 250);
        return;
      }

      // 3. Issue Cryptographic Challenge-Response Handshake
      const challenge = generateRandomNonce();
      this.pendingChallenges.set(remotePeerId, challenge);
      this.connections.set(remotePeerId, conn);

      const challengeFrame: HandshakeFrame = {
        _witcherHandshake: true,
        step: 'AUTH_CHALLENGE',
        challenge,
        ts: Date.now(),
      };
      conn.send(challengeFrame);

      // Disconnect unauthenticated peers after 8 seconds
      setTimeout(() => {
        if (this.pendingChallenges.has(remotePeerId) && !this.authenticatedPeers.has(remotePeerId)) {
          this.pendingChallenges.delete(remotePeerId);
          this.connections.delete(remotePeerId);
          try {
            conn.close();
          } catch {
            // ignore
          }
        }
      }, 8000);
    });

    conn.on('data', async (data: any) => {
      try {
        // Rate limit check per peer
        if (!this.checkRateLimit(remotePeerId)) {
          console.warn(`Rate limit exceeded by peer ${remotePeerId}`);
          return;
        }

        // Payload size guard for clients
        const serializedSize = JSON.stringify(data || {}).length;
        if (serializedSize > MAX_CLIENT_PAYLOAD_BYTES) {
          console.warn(`Dropped oversized packet (${serializedSize} bytes) from ${remotePeerId}`);
          return;
        }

        // Handle Handshake Frames
        if (data && data._witcherHandshake === true) {
          const frame = data as HandshakeFrame;

          if (frame.step === 'HEARTBEAT_PONG') {
            const peerInfo = this.authenticatedPeers.get(remotePeerId);
            if (peerInfo && frame.ts) {
              peerInfo.latencyMs = Math.max(1, Date.now() - frame.ts);
              this.notifyPeersUpdated();
            }
            return;
          }

          if (frame.step === 'AUTH_RESPONSE') {
            const expectedChallenge = this.pendingChallenges.get(remotePeerId);
            if (!expectedChallenge) {
              conn.close();
              return;
            }

            const expectedProof = await computeChallengeProof(
              this.currentRoomCode,
              this.currentRoomPin,
              expectedChallenge,
              remotePeerId
            );

            if (frame.proof !== expectedProof) {
              const rejectFrame: HandshakeFrame = {
                _witcherHandshake: true,
                step: 'AUTH_REJECT',
                reason: 'Authentication failed: Invalid Room PIN or Passphrase.',
                ts: Date.now(),
              };
              conn.send(rejectFrame);
              this.pendingChallenges.delete(remotePeerId);
              this.connections.delete(remotePeerId);
              setTimeout(() => conn.close(), 250);
              return;
            }

            // Authentication succeeded!
            this.pendingChallenges.delete(remotePeerId);
            const cleanName = (frame.playerName || 'Witcher Companion').slice(0, 50);

            // Determine if peer is a Player or an Observer:
            // Max 4 Witcher players in the session:
            // - If GM plays a Witcher, GM takes 1 slot -> up to 3 player peers
            // - If GM is pure Narrator, GM takes 0 player slots -> up to 4 player peers
            // Total active participants: max 5 (1 Narrator + 4 Players)
            // After that, additional connections are observers!
            const maxPlayerPeers = this.hostPlaysWitcher ? MAX_PLAYERS - 1 : MAX_PLAYERS;
            const currentPlayerPeers = Array.from(this.authenticatedPeers.values()).filter(
              (p) => !p.isObserver
            ).length;
            const isObserver = currentPlayerPeers >= maxPlayerPeers;

            const peerInfo: ConnectedPeerInfo = {
              peerId: remotePeerId,
              playerName: cleanName,
              school: isObserver ? undefined : frame.school,
              joinedAt: Date.now(),
              isEncrypted: Boolean(this.roomKey),
              isObserver,
            };
            this.authenticatedPeers.set(remotePeerId, peerInfo);
            this.notifyPeersUpdated();

            const totalPlayers = (this.hostPlaysWitcher ? 1 : 0) + (isObserver ? currentPlayerPeers : currentPlayerPeers + 1);
            const totalObservers = Array.from(this.authenticatedPeers.values()).filter((p) => p.isObserver).length;

            this.onStatusChangeCallback?.(
              isObserver
                ? `${cleanName} connected as Observer (${totalPlayers} Players${totalObservers > 0 ? `, ${totalObservers} Observers` : ''})`
                : `${cleanName} joined as Player (${totalPlayers} Players in Room)`
            );

            const successFrame: HandshakeFrame = {
              _witcherHandshake: true,
              step: 'AUTH_SUCCESS',
              isObserver,
              reason: isObserver
                ? 'Session party is full (4 Players active). You are connected as an Observer.'
                : undefined,
              ts: Date.now(),
            };
            conn.send(successFrame);

            // Trigger PLAYER_JOIN locally and broadcast so Host sends INITIAL_STATE_SYNC
            const joinPacket: P2PPacket = {
              type: 'PLAYER_JOIN',
              senderId: remotePeerId,
              senderName: cleanName,
              payload: {
                message: isObserver
                  ? `${cleanName} joined as an Observer (Spectating).`
                  : `${cleanName} joined the Witcher party (Verified E2EE).`,
                isObserver,
              },
              timestamp: Date.now(),
            };
            this.onPacketCallback?.(joinPacket);
            await this.broadcast(joinPacket, remotePeerId);
          }
          return;
        }

        // Reject any game packets from unauthenticated peers
        if (!this.authenticatedPeers.has(remotePeerId)) {
          console.warn(`Dropped packet from unauthenticated peer ${remotePeerId}`);
          return;
        }

        // Decrypt if wrapped in SecureP2PEnvelope
        let rawPacket: P2PPacket | null = null;
        if (data && data._witcherSecure === true) {
          const envelope = data as SecureP2PEnvelope;
          if (this.seenNonces.has(envelope.nonce)) {
            console.warn('Dropped replayed P2P packet nonce:', envelope.nonce);
            return;
          }
          this.seenNonces.add(envelope.nonce);
          if (this.seenNonces.size > 2000) {
            const firstNonce = this.seenNonces.values().next().value;
            if (firstNonce) this.seenNonces.delete(firstNonce);
          }

          rawPacket = await decryptPacket(envelope, this.roomKey);
          if (!rawPacket) {
            console.warn(`Failed to decrypt packet from peer ${remotePeerId}`);
            return;
          }
        } else if (!this.roomKey) {
          rawPacket = data as P2PPacket;
        } else {
          console.warn(`Dropped unencrypted packet in encrypted room from ${remotePeerId}`);
          return;
        }

        // Validate schema & enforce Role-Based Access Control (isFromHost = false)
        const validation = validateAndSanitizePacket(rawPacket, false);
        if (!validation.valid || !validation.packet) {
          console.warn(`Rejected invalid packet from ${remotePeerId}: ${validation.reason}`);
          return;
        }

        // Never trust the identity a client claims. Overwrite it with the verified peer identity
        // so nobody can pose as the Game Master ('gm') or as another player.
        const peerInfo = this.authenticatedPeers.get(remotePeerId);
        if (!peerInfo) return;
        const stamped: P2PPacket = {
          ...validation.packet,
          senderId: remotePeerId,
          senderName: peerInfo.playerName,
        };

        // Fail closed: without an installed authorization guard, no client packet is processed.
        if (!this.packetGuard) {
          console.warn('No packet guard installed; dropping client packet');
          return;
        }
        const authorized = this.packetGuard(stamped, peerInfo);
        if (!authorized) {
          console.warn(`Host guard rejected '${stamped.type}' from ${peerInfo.playerName} (${remotePeerId})`);
          return;
        }

        // Execute on Host. Only whitelisted, already-authorized packets are relayed to other
        // players; request-style packets are answered by the host with its own broadcast.
        this.onPacketCallback?.(authorized);
        if (RELAYED_CLIENT_PACKET_TYPES.has(authorized.type)) {
          await this.broadcast(authorized, remotePeerId);
        }
      } catch (e) {
        console.error('Error handling host data:', e);
      }
    });

    const handleDisconnect = () => {
      const peerInfo = this.authenticatedPeers.get(remotePeerId);
      this.connections.delete(remotePeerId);
      this.authenticatedPeers.delete(remotePeerId);
      this.pendingChallenges.delete(remotePeerId);
      this.rateLimitCounters.delete(remotePeerId);
      this.notifyPeersUpdated();

      if (peerInfo) {
        const remainingPlayers =
          (this.hostPlaysWitcher ? 1 : 0) +
          Array.from(this.authenticatedPeers.values()).filter((p) => !p.isObserver).length;
        this.onStatusChangeCallback?.(
          `${peerInfo.playerName} disconnected (${remainingPlayers} ${
            remainingPlayers === 1 ? 'Player' : 'Players'
          } in Room)`
        );
      }
    };

    conn.on('close', handleDisconnect);
    conn.on('error', (err) => {
      console.warn('Host connection error:', err);
      handleDisconnect();
    });
  }

  // Join an existing room with optional PIN/Passphrase
  public async joinRoom(
    roomCode: string,
    playerName: string,
    pin: string = '',
    school?: string
  ): Promise<string> {
    this.disconnect();
    this.isHost = false;
    const cleanRoom = sanitizeRoomCode(roomCode);
    if (!cleanRoom) {
      throw new Error('Please enter a valid room code.');
    }

    this.currentRoomCode = cleanRoom;
    this.currentRoomPin = pin.trim();
    this.hasPinProtection = Boolean(this.currentRoomPin);

    const targetHostId = await deriveSignalingPeerId(cleanRoom, this.currentRoomPin);
    this.roomKey = await deriveAesGcmKey(cleanRoom, this.currentRoomPin);

    return new Promise((resolve, reject) => {
      this.onStatusChangeCallback?.('Connecting to encrypted P2P network...');

      let settled = false;
      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.disconnect();
          const err = new Error(
            this.hasPinProtection
              ? 'Connection timed out. Verify both the Room Code and Room PIN match the Game Master.'
              : 'Connection timed out. Ensure the Game Master is actively hosting this Room Code.'
          );
          this.onStatusChangeCallback?.(err.message);
          reject(err);
        }
      }, CONNECTION_TIMEOUT_MS);

      try {
        this.peer = new Peer({
          debug: 1,
          secure: true,
          config: {
            iceServers: ICE_SERVERS,
          },
        });

        this.peer.on('open', (myId) => {
          this.myPeerId = myId;
          this.onStatusChangeCallback?.(`Authenticating with Game Master (${cleanRoom})...`);

          const conn = this.peer!.connect(targetHostId, {
            reliable: true,
          });

          this.hostConnection = conn;

          conn.on('data', async (data: any) => {
            try {
              // Handle Handshake & Heartbeat frames from Host
              if (data && data._witcherHandshake === true) {
                const frame = data as HandshakeFrame;

                if (frame.step === 'HEARTBEAT_PING') {
                  const pongFrame: HandshakeFrame = {
                    _witcherHandshake: true,
                    step: 'HEARTBEAT_PONG',
                    ts: frame.ts,
                  };
                  conn.send(pongFrame);
                  return;
                }

                if (frame.step === 'AUTH_CHALLENGE' && frame.challenge) {
                  const proof = await computeChallengeProof(
                    cleanRoom,
                    this.currentRoomPin,
                    frame.challenge,
                    myId
                  );
                  const responseFrame: HandshakeFrame = {
                    _witcherHandshake: true,
                    step: 'AUTH_RESPONSE',
                    proof,
                    playerName: playerName.trim() || 'Witcher Companion',
                    school,
                    ts: Date.now(),
                  };
                  conn.send(responseFrame);
                  return;
                }

                if (frame.step === 'AUTH_SUCCESS') {
                  if (!settled) {
                    settled = true;
                    clearTimeout(timeoutId);
                    this.isConnected = true;
                    this.isObserver = Boolean(frame.isObserver);
                    this.authenticatedPeers.set(targetHostId, {
                      peerId: targetHostId,
                      playerName: 'Game Master (Host)',
                      joinedAt: Date.now(),
                      isEncrypted: Boolean(this.roomKey),
                    });
                    this.notifyPeersUpdated();
                    this.onStatusChangeCallback?.(
                      frame.isObserver
                        ? `Connected as Observer (Party full). Room: ${cleanRoom}`
                        : `Connected & Verified! Room: ${cleanRoom} (AES-256-GCM)`
                    );
                    resolve(myId);
                  }
                  return;
                }

                if (frame.step === 'AUTH_REJECT') {
                  clearTimeout(timeoutId);
                  const errMsg = frame.reason || 'Connection rejected by Game Master.';
                  this.onStatusChangeCallback?.(errMsg);
                  this.disconnect();
                  if (!settled) {
                    settled = true;
                    reject(new Error(errMsg));
                  }
                  return;
                }

                if (frame.step === 'KICK_NOTICE') {
                  const kickMsg = frame.reason || 'You were removed from the session by the Game Master.';
                  this.onStatusChangeCallback?.(kickMsg);
                  this.disconnect();
                  return;
                }
                return;
              }

              // Decrypt incoming game packet from Host
              let rawPacket: P2PPacket | null = null;
              if (data && data._witcherSecure === true) {
                const envelope = data as SecureP2PEnvelope;
                if (this.seenNonces.has(envelope.nonce)) return;
                this.seenNonces.add(envelope.nonce);
                rawPacket = await decryptPacket(envelope, this.roomKey);
                if (!rawPacket) return;
              } else if (!this.roomKey) {
                rawPacket = data as P2PPacket;
              } else {
                return;
              }

              // Validate packet from Host (isFromHost = true)
              const validation = validateAndSanitizePacket(rawPacket, true);
              if (validation.valid && validation.packet) {
                this.onPacketCallback?.(validation.packet);
              }
            } catch (e) {
              console.error('Error handling client data:', e);
            }
          });

          conn.on('close', () => {
            clearTimeout(timeoutId);
            this.isConnected = false;
            this.authenticatedPeers.clear();
            this.notifyPeersUpdated();
            this.onStatusChangeCallback?.('Disconnected from Game Master.');
            if (!settled) {
              settled = true;
              reject(new Error('Connection closed by Host.'));
            }
          });

          conn.on('error', (err) => {
            clearTimeout(timeoutId);
            console.warn('Client connection error:', err);
            this.onStatusChangeCallback?.(`Connection error: ${err.message || 'Host unreachable'}`);
            if (!settled) {
              settled = true;
              reject(err);
            }
          });
        });

        this.peer.on('error', (err: any) => {
          clearTimeout(timeoutId);
          console.warn('Peer error (client):', err);
          const msg =
            err.type === 'peer-unavailable'
              ? this.hasPinProtection
                ? 'Room not found. Double-check both the Room Code and the Secret PIN!'
                : 'Room not found. Make sure the Game Master has started hosting.'
              : `P2P error: ${err.type || 'Connection failed'}`;
          this.onStatusChangeCallback?.(msg);
          if (!settled) {
            settled = true;
            reject(new Error(msg));
          }
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Failed to init client peer:', err);
        if (!settled) {
          settled = true;
          reject(err);
        }
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (!this.isHost) return;
      const pingFrame: HandshakeFrame = {
        _witcherHandshake: true,
        step: 'HEARTBEAT_PING',
        ts: Date.now(),
      };
      this.authenticatedPeers.forEach((_, peerId) => {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
          try {
            conn.send(pingFrame);
          } catch {
            // ignore
          }
        }
      });
    }, 10000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Encrypt & send packet to everyone (if host) or to host (if client)
  public async send(packet: P2PPacket) {
    if (!this.isConnected) return;

    if (this.isHost) {
      await this.broadcast(packet);
    } else if (this.hostConnection && this.hostConnection.open) {
      try {
        const framed = await encryptPacket(packet, this.roomKey);
        this.hostConnection.send(framed);
      } catch (err) {
        console.error('Failed to encrypt/send client packet:', err);
      }
    }
  }

  // Broadcast encrypted packet to all authenticated clients (host only)
  private async broadcast(packet: P2PPacket, excludePeerId?: string) {
    if (!this.isHost) return;
    try {
      const framed = await encryptPacket(packet, this.roomKey);
      this.authenticatedPeers.forEach((_, peerId) => {
        if (peerId !== excludePeerId) {
          const conn = this.connections.get(peerId);
          if (conn && conn.open) {
            try {
              conn.send(framed);
            } catch (e) {
              console.error(`Failed to send to peer ${peerId}:`, e);
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to broadcast encrypted packet:', err);
    }
  }

  public getConnectedPeerCount(): number {
    if (this.isHost) return this.authenticatedPeers.size;
    return this.isConnected ? 1 : 0;
  }

  public getConnectedPeers(): ConnectedPeerInfo[] {
    return Array.from(this.authenticatedPeers.values());
  }

  public disconnect() {
    this.stopHeartbeat();

    if (this.hostConnection) {
      try {
        this.hostConnection.close();
      } catch {
        // ignore
      }
      this.hostConnection = null;
    }

    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch {
        // ignore
      }
    });
    this.connections.clear();
    this.authenticatedPeers.clear();
    this.pendingChallenges.clear();
    this.rateLimitCounters.clear();
    this.seenNonces.clear();
    this.isObserver = false;

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }

    this.roomKey = null;
    this.isConnected = false;
    this.isHost = false;
    this.isRoomLocked = false;
    this.myPeerId = '';
    this.notifyPeersUpdated();
  }
}

export const p2pManager = new P2PManager();
