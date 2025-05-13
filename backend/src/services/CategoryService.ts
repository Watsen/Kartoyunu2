import { Category } from '../types';

export class CategoryService {
  private categories: Category[] = [
    {
      id: 'goals',
      name: 'En Çok Gol',
      description: 'En çok gol atan oyuncu',
      type: 'highest',
      statKey: 'stats.goals'
    },
    {
      id: 'assists',
      name: 'En Çok Asist',
      description: 'En çok asist yapan oyuncu',
      type: 'highest',
      statKey: 'stats.assists'
    },
    {
      id: 'championships',
      name: 'En Çok Şampiyonluk',
      description: 'En çok şampiyonluk kazanan oyuncu',
      type: 'highest',
      statKey: 'stats.championships'
    },
    {
      id: 'age',
      name: 'En Genç Oyuncu',
      description: 'En genç oyuncu',
      type: 'lowest',
      statKey: 'stats.age'
    },
    {
      id: 'marketValue',
      name: 'En Değerli Oyuncu',
      description: 'En yüksek piyasa değerine sahip oyuncu',
      type: 'highest',
      statKey: 'stats.marketValue'
    }
  ];

  getRandomCategories(count: number = 5): Category[] {
    const shuffled = [...this.categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getCategory(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  getCategoryValue(player: any, category: Category): number {
    const keys = category.statKey.split('.');
    let value = player;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return 0;
    }
    return typeof value === 'number' ? value : 0;
  }

  getWinner(players: any[], category: Category): { playerId: string; score: number } | null {
    if (players.length === 0) return null;
    let winnerId = '';
    let bestScore = category.type === 'highest' ? -Infinity : Infinity;
    for (const player of players) {
      const value = this.getCategoryValue(player, category);
      if (
        (category.type === 'highest' && value > bestScore) ||
        (category.type === 'lowest' && value < bestScore)
      ) {
        bestScore = value;
        winnerId = player.id;
      }
    }
    return { playerId: winnerId, score: bestScore };
  }
} 