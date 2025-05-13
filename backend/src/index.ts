import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { SocketService } from './services/SocketService';
import { TransfermarktService } from './services/TransfermarktService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const transfermarktService = new TransfermarktService();

app.get('/api/players/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Arama sorgusu gerekli' });
    }

    const players = await transfermarktService.searchPlayer(query);
    res.json(players);
  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.get('/api/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Geçersiz oyuncu ID' });
    }

    const player = await transfermarktService.getPlayerDetails(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    res.json(player);
  } catch (error) {
    console.error('Oyuncu detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

const socketService = new SocketService(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 