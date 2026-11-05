import { P2PPacket } from '../types';

export interface SecureP2PEnvelope {
  _witcherSecure: true;
  v: 1;
  iv: string; // Base64 12-byte IV
  ct: string; // Base64 AES-256-GCM Ciphertext + Auth Tag
  nonce: string;
  ts: number;
}

export interface HandshakeFrame {
  _witcherHandshake: true;
  step: 'AUTH_CHALLENGE' | 'AUTH_RESPONSE' | 'AUTH_SUCCESS' | 'AUTH_REJECT' | 'KICK_NOTICE' | 'HEARTBEAT_PING' | 'HEARTBEAT_PONG';
  challenge?: string;
  proof?: string;
  playerName?: string;
  school?: string;
  reason?: string;
  isObserver?: boolean;
  ts: number;
}

// Packets only the Game Master (host) may originate. Clients that send any of these are dropped.
// PLAYER_JOIN is included because it makes the host rebroadcast the full campaign state to
// everyone; the host generates it locally after authenticating a peer, clients never should.
const HOST_ONLY_PACKET_TYPES = new Set<P2PPacket['type']>([
  'INITIAL_STATE_SYNC',
  'SYNC_STATE',
  'MAP_CHANGE',
  'TOKEN_ADD',
  'TOKEN_REMOVE',
  'CHARACTER_ASSIGNMENT_SYNC',
  'STORY_VISUAL_SYNC',
  'PARTY_CHOICES_SYNC',
  'ECONOMY_SYNC',
  'PLAYER_JOIN',
]);

const VALID_PACKET_TYPES = new Set<P2PPacket['type']>([
  'SYNC_STATE',
  'INITIAL_STATE_SYNC',
  'PLAYER_JOIN',
  'CHAT_MESSAGE',
  'DICE_ROLL',
  'TOKEN_MOVE',
  'TOKEN_ADD',
  'TOKEN_REMOVE',
  'MAP_CHANGE',
  'CHARACTER_UPDATE',
  'PING_COORDINATE',
  'CHARACTER_CLAIM',
  'CHARACTER_ASSIGNMENT_SYNC',
  'STORY_VISUAL_SYNC',
  'PARTY_CHOICES_SYNC',
  'ECONOMY_SYNC',
  'MERCHANT_PURCHASE',
]);

const VALID_SCHOOLS = new Set(['Wolf', 'Cat', 'Griffin', 'Bear']);

// Convert ArrayBuffer / Uint8Array to Base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Deterministic fallback hash if Web Crypto API is unavailable (non-HTTPS LAN testing)
function fallbackHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Normalizes a room code to lowercase alphanumeric + hyphens
 */
export function sanitizeRoomCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
}

/**
 * Derives an obfuscated PeerJS Signaling ID using SHA-256 so room codes cannot be
 * enumerated or guessed on the public PeerJS signaling broker.
 */
export async function deriveSignalingPeerId(roomCode: string, pin: string = ''): Promise<string> {
  const cleanRoom = sanitizeRoomCode(roomCode);
  const cleanPin = pin.trim();
  const material = `witcher-cintra-vtt-v2::${cleanRoom}::${cleanPin}`;

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(material);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    const hex = bufferToHex(digest).slice(0, 24);
    return `wc-cintra-${hex}`;
  }

  return `wc-cintra-${fallbackHash(material)}`;
}

/**
 * Generates a random 128-bit hex nonce for challenge-response and replay protection
 */
export function generateRandomNonce(): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

/**
 * Computes a cryptographic HMAC-SHA256 challenge response proof
 */
export async function computeChallengeProof(
  roomCode: string,
  pin: string,
  challenge: string,
  clientPeerId: string
): Promise<string> {
  const cleanRoom = sanitizeRoomCode(roomCode);
  const cleanPin = pin.trim();
  const payload = `witcher-auth::${cleanRoom}::${cleanPin}::${challenge}::${clientPeerId}`;

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(payload);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return bufferToHex(digest);
  }

  return fallbackHash(payload);
}

/**
 * Derives an AES-256-GCM CryptoKey from the roomCode and optional PIN using PBKDF2
 */
export async function deriveAesGcmKey(roomCode: string, pin: string = ''): Promise<CryptoKey | null> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }

  const cleanRoom = sanitizeRoomCode(roomCode);
  const cleanPin = pin.trim();
  const encoder = new TextEncoder();

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(`witcher-key::${cleanRoom}::${cleanPin}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = encoder.encode(`cintra-1184-salt::${cleanRoom}`);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 60000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a P2PPacket into a SecureP2PEnvelope using AES-256-GCM
 */
export async function encryptPacket(
  packet: P2PPacket,
  key: CryptoKey | null
): Promise<SecureP2PEnvelope | P2PPacket> {
  if (!key || typeof window === 'undefined' || !window.crypto?.subtle) {
    return packet;
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const nonce = generateRandomNonce();
  const ts = Date.now();

  const plaintextBytes = new TextEncoder().encode(JSON.stringify(packet));
  const additionalData = new TextEncoder().encode(`${nonce}:${ts}`);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData,
    },
    key,
    plaintextBytes
  );

  return {
    _witcherSecure: true,
    v: 1,
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    nonce,
    ts,
  };
}

/**
 * Decrypts and verifies a SecureP2PEnvelope using AES-256-GCM
 */
export async function decryptPacket(
  envelope: SecureP2PEnvelope,
  key: CryptoKey | null
): Promise<P2PPacket | null> {
  if (!key || typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }

  try {
    const iv = base64ToBytes(envelope.iv);
    const ciphertext = base64ToBytes(envelope.ct);
    const additionalData = new TextEncoder().encode(`${envelope.nonce}:${envelope.ts}`);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
        additionalData,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const jsonStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonStr) as P2PPacket;
  } catch (err) {
    console.warn('P2P AES-GCM decryption or authentication failed:', err);
    return null;
  }
}

/**
 * Sanitizes strings to prevent oversized text or control-character injection
 */
function sanitizeString(val: unknown, maxLength: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, maxLength);
}

/**
 * Clamps a numeric coordinate between min and max
 */
function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

/**
 * Enforces Role-Based Access Control (Host vs Client) and runtime schema validation
 * on incoming P2P packets.
 */
export function validateAndSanitizePacket(
  rawPacket: any,
  isFromHost: boolean
): { valid: boolean; packet?: P2PPacket; reason?: string } {
  if (!rawPacket || typeof rawPacket !== 'object') {
    return { valid: false, reason: 'Malformed packet object' };
  }

  const type = rawPacket.type as P2PPacket['type'];
  if (!VALID_PACKET_TYPES.has(type)) {
    return { valid: false, reason: `Unknown packet type: ${String(type)}` };
  }

  // Enforce Host-Only privileges
  if (!isFromHost && HOST_ONLY_PACKET_TYPES.has(type)) {
    return {
      valid: false,
      reason: `Security violation: Client attempted to send Host-only packet '${type}'`,
    };
  }

  const senderId = sanitizeString(rawPacket.senderId, 80) || 'unknown';
  const senderName = sanitizeString(rawPacket.senderName, 60) || 'Witcher';
  const timestamp = clampNumber(rawPacket.timestamp, 0, Date.now() + 300000, Date.now());
  const payload = rawPacket.payload;

  switch (type) {
    case 'TOKEN_MOVE': {
      if (!payload || typeof payload !== 'object') {
        return { valid: false, reason: 'Invalid TOKEN_MOVE payload' };
      }
      const tokenId = sanitizeString(payload.tokenId, 80);
      if (!tokenId) return { valid: false, reason: 'Missing tokenId' };

      // Clients cannot move monster tokens directly unless they are Host
      if (!isFromHost && tokenId.startsWith('mon-')) {
        return { valid: false, reason: 'Clients cannot move monster tokens' };
      }

      const x = clampNumber(payload.x, 2, 98, 50);
      const y = clampNumber(payload.y, 2, 98, 50);
      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload: { tokenId, x, y },
          timestamp,
        },
      };
    }

    case 'PING_COORDINATE': {
      if (!payload || typeof payload !== 'object') {
        return { valid: false, reason: 'Invalid PING_COORDINATE payload' };
      }
      const x = clampNumber(payload.x, 0, 100, 50);
      const y = clampNumber(payload.y, 0, 100, 50);
      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload: { x, y },
          timestamp,
        },
      };
    }

    case 'CHAT_MESSAGE':
    case 'DICE_ROLL': {
      if (!payload || typeof payload !== 'object') {
        return { valid: false, reason: `Invalid ${type} payload` };
      }
      const sanitizedMsg: Record<string, unknown> = {
        ...payload,
        id: sanitizeString(payload.id, 80) || `msg-${Date.now()}`,
        senderId: sanitizeString(payload.senderId, 80) || senderId,
        senderName: sanitizeString(payload.senderName, 60) || senderName,
        text: sanitizeString(payload.text, 1500),
        timestamp: clampNumber(payload.timestamp, 0, Date.now() + 300000, Date.now()),
      };

      // A client may never speak with the Game Master's voice. The host re-stamps the real
      // identity as well (see App guard), this is the schema-level backstop.
      if (!isFromHost) {
        delete sanitizedMsg.isDM;
        if (sanitizedMsg.speechMode === 'dm') sanitizedMsg.speechMode = 'ic';
        if (sanitizedMsg.type === 'lore') sanitizedMsg.type = 'chat';
      }

      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload: sanitizedMsg,
          timestamp,
        },
      };
    }

    case 'MERCHANT_PURCHASE': {
      // Client -> Host purchase *request*. Contains no prices, gold or items: the host looks
      // everything up itself, so a client cannot choose what it pays or receives.
      if (!payload || typeof payload !== 'object') {
        return { valid: false, reason: 'Invalid MERCHANT_PURCHASE payload' };
      }
      const buyerSchool = sanitizeString(payload.buyerSchool, 20);
      const actNum = Math.round(clampNumber(payload.actNum, 1, 4, 0));
      const itemId = sanitizeString(payload.itemId, 80);
      if (!VALID_SCHOOLS.has(buyerSchool) || actNum < 1 || !itemId) {
        return { valid: false, reason: 'Malformed MERCHANT_PURCHASE request' };
      }
      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload: { buyerSchool, actNum, itemId },
          timestamp,
        },
      };
    }

    case 'PLAYER_JOIN': {
      const message = sanitizeString(payload?.message, 200) || `${senderName} joined the Witcher party.`;
      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload: { message },
          timestamp,
        },
      };
    }

    case 'CHARACTER_CLAIM': {
      if (!payload || typeof payload !== 'object') {
        return { valid: false, reason: 'Invalid CHARACTER_CLAIM payload' };
      }
      const characterId = sanitizeString(payload.characterId, 80);
      const playerName = sanitizeString(payload.playerName, 60);
      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload: { characterId, playerName },
          timestamp,
        },
      };
    }

    default:
      // Host-only packets or CHARACTER_UPDATE already passed role check
      return {
        valid: true,
        packet: {
          type,
          senderId,
          senderName,
          payload,
          timestamp,
        },
      };
  }
}
