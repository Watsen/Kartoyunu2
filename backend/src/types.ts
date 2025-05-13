export interface Player {
  id: string;
  name: string;
  imageUrl: string;
  stats: {
    goals: number;
    assists: number;
    championships: number;
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
  hostId: string;
  players: {
    id: string;
    name: string;
    isReady: boolean;
  }[];
  gameStatus: 'waiting' | 'selecting' | 'playing' | 'finished';
  currentCategory?: string;
  currentRound: number;
  maxRounds: number;
  scores: { [key: string]: number };
  selectedPlayers: Player[];
}

export interface RoomPlayer {
  id: string;
  name: string;
  selectedPlayers: Player[];
  isReady: boolean;
  score: number;
}

export interface Room {
  id: string;
  hostId: string;
  gameStatus: 'waiting' | 'selecting' | 'playing' | 'finished';
  players: {
    [key: string]: RoomPlayer;
  };
  categories: Category[];
  currentCategoryIndex: number;
} 