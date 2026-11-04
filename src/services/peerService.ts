import Peer, { DataConnection } from 'peerjs';
import { P2PPacket } from '../types';

export class P2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  public myPeerId: string = '';
  public isHost: boolean = false;
  public isConnected: boolean = false;

  private onPacketCallback: ((packet: P2PPacket) => void) | null = null;
  private onPeerCountCallback: ((count: number) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;

  public setCallbacks(
    onPacket: (packet: P2PPacket) => void,
    onPeerCount?: (count: number) => void,
    onStatusChange?: (status: string) => void
  ) {
    this.onPacketCallback = onPacket;
    this.onPeerCountCallback = onPeerCount || null;
    this.onStatusChangeCallback = onStatusChange || null;
  }

  // Host a game room
  public async hostRoom(roomCode: string): Promise<string> {
    this.disconnect();
    this.isHost = true;
    const cleanRoom = roomCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const peerId = `witcher-cintra-${cleanRoom}`;

    return new Promise((resolve, reject) => {
      this.onStatusChangeCallback?.('Connecting to P2P network as Game Master...');
      
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          this.myPeerId = id;
          this.isConnected = true;
          this.onStatusChangeCallback?.(`Hosting Room: ${cleanRoom}`);
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.setupHostConnection(conn);
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer error (host):', err);
          if (err.type === 'unavailable-id') {
            this.onStatusChangeCallback?.('Room code already in use! Try a different code.');
          } else {
            this.onStatusChangeCallback?.(`P2P Status: ${err.type || 'Offline mode active'}`);
          }
          reject(err);
        });
      } catch (err) {
        console.error('Failed to init host peer:', err);
        reject(err);
      }
    });
  }

  private setupHostConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.onPeerCountCallback?.(this.connections.size);
      this.onStatusChangeCallback?.(`Player connected! (${this.connections.size} peers)`);
    });

    conn.on('data', (data: any) => {
      try {
        const packet = data as P2PPacket;
        this.onPacketCallback?.(packet);
        // Relay packet to other connected peers (except sender)
        this.broadcast(packet, conn.peer);
      } catch (e) {
        console.error('Error handling host data:', e);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.onPeerCountCallback?.(this.connections.size);
      this.onStatusChangeCallback?.(`Player disconnected. (${this.connections.size} peers)`);
    });

    conn.on('error', (err) => {
      console.warn('Host connection error:', err);
      this.connections.delete(conn.peer);
      this.onPeerCountCallback?.(this.connections.size);
    });
  }

  // Join an existing room
  public async joinRoom(roomCode: string, playerName: string): Promise<string> {
    this.disconnect();
    this.isHost = false;
    const cleanRoom = roomCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const targetHostId = `witcher-cintra-${cleanRoom}`;

    return new Promise((resolve, reject) => {
      this.onStatusChangeCallback?.('Connecting to P2P network...');

      try {
        this.peer = new Peer({
          debug: 1,
        });

        this.peer.on('open', (myId) => {
          this.myPeerId = myId;
          this.onStatusChangeCallback?.(`Connecting to Host (${cleanRoom})...`);

          const conn = this.peer!.connect(targetHostId, {
            reliable: true,
          });

          this.hostConnection = conn;

          conn.on('open', () => {
            this.isConnected = true;
            this.onStatusChangeCallback?.(`Connected to Game Master! Room: ${cleanRoom}`);
            this.onPeerCountCallback?.(1);

            // Announce join
            this.send({
              type: 'PLAYER_JOIN',
              senderId: myId,
              senderName: playerName,
              payload: { message: `${playerName} has joined the Witcher party.` },
              timestamp: Date.now(),
            });

            resolve(myId);
          });

          conn.on('data', (data: any) => {
            try {
              const packet = data as P2PPacket;
              this.onPacketCallback?.(packet);
            } catch (e) {
              console.error('Error handling client data:', e);
            }
          });

          conn.on('close', () => {
            this.isConnected = false;
            this.onStatusChangeCallback?.('Disconnected from Game Master.');
            this.onPeerCountCallback?.(0);
          });

          conn.on('error', (err) => {
            console.warn('Client connection error:', err);
            this.onStatusChangeCallback?.(`Connection error: ${err.message || 'Host not found'}`);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('Peer error (client):', err);
          this.onStatusChangeCallback?.(`P2P error: ${err.type || 'Connection failed'}`);
          reject(err);
        });
      } catch (err) {
        console.error('Failed to init client peer:', err);
        reject(err);
      }
    });
  }

  // Send packet to everyone (if host) or to host (if client)
  public send(packet: P2PPacket) {
    if (this.isHost) {
      this.broadcast(packet);
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(packet);
    }
  }

  // Broadcast to all connected clients (host only)
  private broadcast(packet: P2PPacket, excludePeerId?: string) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        try {
          conn.send(packet);
        } catch (e) {
          console.error(`Failed to send to peer ${peerId}:`, e);
        }
      }
    });
  }

  public getConnectedPeerCount(): number {
    if (this.isHost) return this.connections.size;
    return this.isConnected ? 1 : 0;
  }

  public disconnect() {
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.isConnected = false;
    this.isHost = false;
    this.myPeerId = '';
  }
}

export const p2pManager = new P2PManager();
