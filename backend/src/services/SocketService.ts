import { Server, Socket } from 'socket.io';
import { RoomManager } from './RoomManager';
import { CategoryService } from './CategoryService';
import { ScoreService } from './ScoreService';
import { RuleService } from './RuleService';
import { Player, RoomPlayer } from '../types';

interface Room {
  id: string;
  hostId: string;
  players: { [key: string]: RoomPlayer };
  gameStatus: 'waiting' | 'selecting' | 'playing' | 'finished';
  currentCategory?: string;
  currentRound: number;
  maxRounds: number;
}

export class SocketService {
  private io: Server;
  private roomManager: RoomManager;
  private categoryService: CategoryService;
  private scoreService: ScoreService;
  private ruleService: RuleService;

  constructor(io: Server) {
    this.io = io;
    this.roomManager = new RoomManager();
    this.categoryService = new CategoryService();
    this.scoreService = new ScoreService();
    this.ruleService = new RuleService();

    this.io.on('connection', (socket: Socket) => {
      console.log('Yeni bağlantı:', socket.id);

      socket.on('createRoom', async (playerName: string) => {
        try {
          console.log('Oda oluşturma isteği geldi:', playerName);
          const roomId = await this.roomManager.createRoom(socket.id, playerName);
          console.log('Oda oluşturuldu:', roomId);
          socket.join(roomId);
          this.emitGameState(roomId);
        } catch (error) {
          console.error('Oda oluşturulamadı:', error);
          socket.emit('error', 'Oda oluşturulamadı');
        }
      });

      socket.on('joinRoom', async (data: { roomId: string; playerName: string }) => {
        try {
          const { roomId, playerName } = data;
          await this.roomManager.joinRoom(roomId, socket.id, playerName);
          socket.join(roomId);
          this.emitGameState(roomId);
        } catch (error) {
          socket.emit('error', 'Odaya katılınamadı');
        }
      });

      socket.on('startGame', async (roomId: string) => {
        try {
          const room = this.roomManager.getRoom(roomId);
          if (room.hostId !== socket.id) {
            throw new Error('Sadece oda sahibi oyunu başlatabilir');
          }

          room.gameStatus = 'selecting';
          this.emitGameState(roomId);
        } catch (error) {
          socket.emit('error', 'Oyun başlatılamadı');
        }
      });

      socket.on('selectPlayers', async (data: { roomId: string; players: Player[] }) => {
        try {
          const { roomId, players } = data;
          const room = this.roomManager.getRoom(roomId);
          
          if (!this.ruleService.validateSelection(players)) {
            throw new Error('Geçersiz oyuncu seçimi');
          }

          room.players[socket.id].selectedPlayers = players;
          room.players[socket.id].isReady = true;

          const allPlayersReady = Object.values(room.players).every((p) => (p as RoomPlayer).isReady);
          if (allPlayersReady) {
            room.gameStatus = 'playing';
            room.currentRound = 1;
            room.currentCategory = this.categoryService.getRandomCategories();
          }

          this.emitGameState(roomId);
        } catch (error) {
          socket.emit('error', 'Oyuncu seçimi kaydedilemedi');
        }
      });

      socket.on('disconnect', () => {
        const roomId = this.roomManager.getPlayerRoom(socket.id);
        if (roomId) {
          this.roomManager.leaveRoom(roomId, socket.id);
          this.emitGameState(roomId);
        }
      });
    });
  }

  private emitGameState(roomId: string) {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    const gameState = {
      roomId: room.id,
      hostId: room.hostId,
      players: Object.values(room.players).map((p) => ({
        id: (p as RoomPlayer).id,
        name: (p as RoomPlayer).name,
        isReady: (p as RoomPlayer).isReady
      })),
      gameStatus: room.gameStatus,
      currentCategory: room.currentCategory,
      currentRound: room.currentRound,
      maxRounds: room.maxRounds,
      scores: this.scoreService.getAllScores(),
      selectedPlayers: Object.values(room.players).map((p) => (p as RoomPlayer).selectedPlayers || []).flat()
    };

    this.io.to(roomId).emit('gameState', gameState);
  }
} 