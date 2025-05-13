import axios from 'axios';
import cheerio from 'cheerio';
import { createClient } from 'redis';
import { Player } from '../types';

export class TransfermarktService {
  private redisClient;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redisClient.connect();
  }

  async searchPlayer(query: string): Promise<Player[]> {
    const cacheKey = `player_search:${query}`;
    const cachedResult = await this.redisClient.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    try {
      const response = await axios.get(`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const players: Player[] = [];

      $('.hauptlink a').each((_, element) => {
        const name = $(element).text().trim();
        const url = $(element).attr('href');
        
        if (name && url) {
          const id = parseInt(url.split('/').pop() || '0');
          players.push({
            id,
            name,
            firstGoalAge: 0,
            totalGoals: 0,
            headGoals: 0,
            positionsPlayed: 0,
            teamsPlayed: 0,
            championships: [],
            ageAsCoach: null,
            photoUrl: ''
          });
        }
      });

      await this.redisClient.set(cacheKey, JSON.stringify(players), {
        EX: 3600
      });

      return players;
    } catch (error) {
      console.error('Transfermarkt arama hatası:', error);
      return [];
    }
  }

  async getPlayerDetails(playerId: number): Promise<Player | null> {
    const cacheKey = `player_details:${playerId}`;
    const cachedResult = await this.redisClient.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    try {
      const response = await axios.get(`https://www.transfermarkt.com/player/profil/spieler/${playerId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const player: Player = {
        id: playerId,
        name: $('.data-header__headline-wrapper').text().trim(),
        firstGoalAge: this.extractFirstGoalAge($),
        totalGoals: this.extractTotalGoals($),
        headGoals: this.extractHeadGoals($),
        positionsPlayed: this.extractPositionsPlayed($),
        teamsPlayed: this.extractTeamsPlayed($),
        championships: this.extractChampionships($),
        ageAsCoach: this.extractAgeAsCoach($),
        photoUrl: $('.data-header__profile-image').attr('src') || ''
      };

      await this.redisClient.set(cacheKey, JSON.stringify(player), {
        EX: 86400
      });

      return player;
    } catch (error) {
      console.error('Transfermarkt detay hatası:', error);
      return null;
    }
  }

  private extractFirstGoalAge($: cheerio.CheerioAPI): number {
    const careerStats = $('.auflistung .hauptpunkt a').text();
    const firstGoalMatch = careerStats.match(/İlk gol: (\d+)/);
    return firstGoalMatch ? parseInt(firstGoalMatch[1]) : 0;
  }

  private extractTotalGoals($: cheerio.CheerioAPI): number {
    const careerStats = $('.auflistung .hauptpunkt a').text();
    const totalGoalsMatch = careerStats.match(/Toplam gol: (\d+)/);
    return totalGoalsMatch ? parseInt(totalGoalsMatch[1]) : 0;
  }

  private extractHeadGoals($: cheerio.CheerioAPI): number {
    const careerStats = $('.auflistung .hauptpunkt a').text();
    const headGoalsMatch = careerStats.match(/Kafa golü: (\d+)/);
    return headGoalsMatch ? parseInt(headGoalsMatch[1]) : 0;
  }

  private extractPositionsPlayed($: cheerio.CheerioAPI): number {
    const positions = $('.detail-position__position').length;
    return positions;
  }

  private extractTeamsPlayed($: cheerio.CheerioAPI): number {
    const teams = $('.hauptlink a[href*="/verein/"]').length;
    return teams;
  }

  private extractChampionships($: cheerio.CheerioAPI): string[] {
    const championships: string[] = [];
    $('.erfolge .hauptpunkt a').each((_, element) => {
      const title = $(element).text().trim();
      if (title.includes('Şampiyonluk') || title.includes('Kupa')) {
        championships.push(title);
      }
    });
    return championships;
  }

  private extractAgeAsCoach($: cheerio.CheerioAPI): number | null {
    const careerStats = $('.auflistung .hauptpunkt a').text();
    const coachAgeMatch = careerStats.match(/Antrenörlük yaşı: (\d+)/);
    return coachAgeMatch ? parseInt(coachAgeMatch[1]) : null;
  }
} 