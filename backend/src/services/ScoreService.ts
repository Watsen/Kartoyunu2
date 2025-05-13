import { Player, Category } from '../types';

export class ScoreService {
  private scores: Map<string, number> = new Map();

  resetScores(): void {
    this.scores.clear();
  }

  addScore(playerId: string, points: number): void {
    const currentScore = this.scores.get(playerId) || 0;
    this.scores.set(playerId, currentScore + points);
  }

  getScore(playerId: string): number {
    return this.scores.get(playerId) || 0;
  }

  getAllScores(): { playerId: string; score: number }[] {
    return Array.from(this.scores.entries())
      .map(([playerId, score]) => ({ playerId, score }))
      .sort((a, b) => b.score - a.score);
  }

  calculateCategoryScore(players: Player[], category: Category): { playerId: string; score: number }[] {
    const scores = players.map(player => ({
      playerId: player.id.toString(),
      score: this.getCategoryValue(player, category)
    }));

    return scores.sort((a, b) => {
      if (category.type === 'highest') {
        return b.score - a.score;
      } else {
        return a.score - b.score;
      }
    });
  }

  getWinner(): { playerId: string; score: number } | null {
    const scores = this.getAllScores();
    return scores.length > 0 ? scores[0] : null;
  }

  private getCategoryValue(player: Player, category: Category): number {
    const keys = category.statKey.split('.');
    let value: any = player;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return 0;
    }

    return Number(value) || 0;
  }
} 