export interface Player {
  id: number;
  name: string;
  imageUrl: string;
  stats: {
    goals: number;
    assists: number;
    championships: number;
    age: number;
    marketValue: number;
    [key: string]: any;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  type: 'highest' | 'lowest';
  statKey: string;
}

export interface GameState {
  roomId: string;
  gameStatus: 'waiting' | 'selecting' | 'playing' | 'finished';
  players: Player[];
  currentCategory: Category | null;
  winner: { playerId: string; score: number } | null;
  hostId: string;
} 