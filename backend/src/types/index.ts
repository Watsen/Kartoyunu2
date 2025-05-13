export interface Player {
  id: number;
  name: string;
  firstGoalAge: number;
  totalGoals: number;
  headGoals: number;
  positionsPlayed: number;
  teamsPlayed: number;
  championships: string[];
  ageAsCoach: number | null;
  photoUrl: string;
}

export interface Category {
  key: string;
  label: string;
}

export interface GameState {
  roomId: string;
  players: {
    [key: string]: {
      id: string;
      name: string;
      selectedPlayers: Player[];
      score: number;
    };
  };
  currentRound: number;
  currentCategory: Category | null;
  timeLeft: number;
  gameStatus: 'waiting' | 'selection' | 'playing' | 'finished';
}

export interface SocketData {
  roomId: string;
  playerId: string;
  playerName: string;
} 