import express from 'express';
import { TransfermarktService } from '../services/TransfermarktService';

const router = express.Router();
const transfermarktService = new TransfermarktService();

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Arama sorgusu gerekli' });
    }

    const players = await transfermarktService.searchPlayer(query);
    res.json(players);
  } catch (error) {
    console.error('Futbolcu arama hatası:', error);
    res.status(500).json({ error: 'Futbolcu arama hatası' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Geçersiz futbolcu ID' });
    }

    const player = await transfermarktService.getPlayerDetails(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Futbolcu bulunamadı' });
    }

    res.json(player);
  } catch (error) {
    console.error('Futbolcu detay hatası:', error);
    res.status(500).json({ error: 'Futbolcu detay hatası' });
  }
});

export default router; 