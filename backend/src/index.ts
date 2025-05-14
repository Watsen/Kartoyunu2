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

const allowedOrigins = [
  'https://kartoyunu2.vercel.app',
  'https://kartoyunu2-6td6nhlst-watsen03s-projects.vercel.app',
  'https://kartoyunu2-git-main-watsen03s-projects.vercel.app',
  // Gerekirse diğer Vercel preview URL'lerini de ekle
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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