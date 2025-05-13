# Kart Oyunu

Futbolcu seçme ve kapışma oyunu.

## Özellikler

- Oda oluşturma ve katılma
- Futbolcu seçme
- Kategori bazlı kapışma
- Puan sistemi
- Gerçek zamanlı oyun durumu

## Teknolojiler

### Backend
- Node.js
- Express
- Socket.io
- Redis
- TypeScript

### Frontend
- React
- TypeScript
- Socket.io Client
- Styled Components
- React Router

## Kurulum

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Oyun Akışı

1. Oyuncular bir oda oluşturur veya mevcut bir odaya katılır
2. Oda sahibi oyunu başlatır
3. Her oyuncu 5-7 futbolcu seçer
4. Kategoriler sırayla gösterilir
5. Her kategoride en iyi performans gösteren oyuncu puan alır
6. En çok puanı alan oyuncu kazanır

## Lisans

MIT 