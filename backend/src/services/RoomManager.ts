import { GameState, Player, Category, Room as RoomType, RoomPlayer } from '../types';

interface Room {
  hostId: string;
  players: { [key: string]: RoomPlayer };
  gameStatus: 'waiting' | 'selecting' | 'playing' | 'finished';
  categories: Category[];
  currentCategoryIndex: number;
}

export class RoomManager {
  private rooms: Map<string, any> = new Map();
  private playerRooms: Map<string, string> = new Map();

  createRoom(hostId: string, hostName: string): string {
    const roomId = Math.random().toString(36).substring(2, 8);
    const room = {
      id: roomId,
      hostId,
      gameStatus: 'waiting',
      players: {
        [hostId]: {
          id: hostId,
          name: hostName,
          selectedPlayers: [],
          score: 0
        }
      },
      categories: [],
      currentCategoryIndex: 0
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(hostId, roomId);
    return roomId;
  }

  joinRoom(roomId: string, playerId: string, playerName: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameStatus !== 'waiting') return false;

    const player = {
      id: playerId,
      name: playerName,
      selectedPlayers: [],
      score: 0
    };

    room.players[playerId] = player;
    this.playerRooms.set(playerId, roomId);
    return true;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    delete room.players[playerId];
    this.playerRooms.delete(playerId);

    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomId);
    } else if (playerId === room.hostId) {
      // Yeni host seç
      const newHostId = Object.keys(room.players)[0];
      room.hostId = newHostId;
    }
  }

  getRoom(roomId: string): any {
    return this.rooms.get(roomId);
  }

  getPlayerRoom(playerId: string): string | undefined {
    return this.playerRooms.get(playerId);
  }

  updateGameState(roomId: string, update: Partial<GameState>): GameState | null {
    const gameState = this.rooms.get(roomId);
    if (!gameState) return null;

    const updatedState = { ...gameState, ...update };
    this.rooms.set(roomId, updatedState);
    return updatedState;
  }

  updatePlayerSelection(roomId: string, playerId: string, players: Player[]): GameState | null {
    const gameState = this.rooms.get(roomId);
    if (!gameState || !gameState.players[playerId]) return null;

    gameState.players[playerId].selectedPlayers = players;
    return gameState;
  }
} 