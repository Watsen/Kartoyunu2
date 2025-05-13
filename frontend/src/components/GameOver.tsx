import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socketService } from '../services/socket';
import { Player } from '../types';

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
  max-width: 800px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PlayerCard = styled.div`
  background: #fff;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlayerImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const PlayerName = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const PlayerStats = styled.div`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
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

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

export const GameOver: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<{ playerId: string; score: number } | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const handleGameState = (gameState: any) => {
      setPlayers(gameState.players);
      setWinner(gameState.winner);
    };

    socketService.on('gameState', handleGameState);

    return () => {
      socketService.off('gameState', handleGameState);
    };
  }, [roomId]);

  const handlePlayAgain = () => {
    if (!roomId) return;
    navigate(`/selection/${roomId}`);
  };

  const handleNewGame = () => {
    navigate('/');
  };

  return (
    <Container>
      <Card>
        <Title>Oyun Bitti!</Title>
        {winner && (
          <Title>
            Kazanan: {players.find(p => p.id.toString() === winner.playerId)?.name}
            <br />
            Puan: {winner.score}
          </Title>
        )}
        <PlayerGrid>
          {players.map(player => (
            <PlayerCard key={player.id}>
              <PlayerImage src={player.imageUrl} alt={player.name} />
              <PlayerName>{player.name}</PlayerName>
              <PlayerStats>
                Gol: {player.stats.goals}
                <br />
                Asist: {player.stats.assists}
                <br />
                Şampiyonluk: {player.stats.championships}
              </PlayerStats>
            </PlayerCard>
          ))}
        </PlayerGrid>
        <Button onClick={handlePlayAgain}>
          Tekrar Oyna
        </Button>
        <Button onClick={handleNewGame} style={{ marginTop: '1rem', background: '#666' }}>
          Yeni Oyun
        </Button>
      </Card>
    </Container>
  );
}; 