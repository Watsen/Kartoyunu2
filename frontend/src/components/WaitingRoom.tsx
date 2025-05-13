import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socketService } from '../services/socket';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const RoomCode = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
`;

const PlayerList = styled.div`
  margin-bottom: 2rem;
`;

const PlayerItem = styled.div`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const Button = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

interface Player {
  id: string;
  name: string;
}

export const WaitingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const handleGameState = (gameState: any) => {
      setPlayers(Object.values(gameState.players));
      setIsHost(gameState.hostId === socketService.getSocketId());

      if (gameState.gameStatus === 'selecting') {
        navigate(`/selection/${roomId}`);
      }
    };

    socketService.on('gameState', handleGameState);

    return () => {
      socketService.off('gameState', handleGameState);
    };
  }, [roomId, navigate]);

  const handleStartGame = async () => {
    if (!roomId) return;
    const { success } = await socketService.startGame(roomId);
    if (success) {
      navigate(`/selection/${roomId}`);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Bekleme Odası</Title>
        <RoomCode>Oda Kodu: {roomId}</RoomCode>
        <PlayerList>
          {players.map(player => (
            <PlayerItem key={player.id}>
              <span>{player.name}</span>
              {player.id === socketService.getSocketId() && <span>(Siz)</span>}
            </PlayerItem>
          ))}
        </PlayerList>
        {isHost && (
          <Button
            onClick={handleStartGame}
            disabled={players.length < 2}
          >
            Oyunu Başlat
          </Button>
        )}
        {!isHost && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            Oda sahibi oyunu başlatmayı bekliyor...
          </div>
        )}
      </Card>
    </Container>
  );
}; 