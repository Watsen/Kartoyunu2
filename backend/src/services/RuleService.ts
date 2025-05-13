import { Player } from '../types';

export class RuleService {
  validateSelection(players: Player[]): boolean {
    if (players.length < 5 || players.length > 7) {
      return false;
    }

    // Aynı oyuncunun birden fazla seçilmesini engelle
    const uniquePlayers = new Set(players.map(p => p.id));
    if (uniquePlayers.size !== players.length) {
      return false;
    }

    return true;
  }
} 