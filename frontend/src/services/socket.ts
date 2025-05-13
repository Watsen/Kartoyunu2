import { io, Socket } from 'socket.io-client';
import { Player } from '../types';

class SocketService {
  private socket: Socket;
  private static instance: SocketService;

  private constructor() {
    this.socket = io('http://localhost:3001');
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  getSocketId(): string {
    return this.socket.id;
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.socket.off(event, callback);
  }

  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  createRoom(playerName: string): Promise<{ roomId: string }> {
    return new Promise((resolve) => {
      this.socket.emit('createRoom', { playerName }, resolve);
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      this.socket.emit('joinRoom', { roomId, playerName }, resolve);
    });
  }

  startGame(roomId: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      this.socket.emit('startGame', { roomId }, resolve);
    });
  }

  finishSelection(roomId: string, players: Player[]): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      this.socket.emit('finishSelection', { roomId, players }, resolve);
    });
  }

  nextCategory(roomId: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      this.socket.emit('nextCategory', { roomId }, resolve);
    });
  }
}

export const socketService = SocketService.getInstance(); 