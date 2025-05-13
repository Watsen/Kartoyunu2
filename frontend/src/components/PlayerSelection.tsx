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
  max-width: 1200px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PlayerCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected ? '#e3f2fd' : 'white'};
  border: 2px solid ${props => props.selected ? '#2196f3' : '#ddd'};
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const PlayerImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
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
  width: 100%;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const SelectedCount = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  color: #666;
`;

export const PlayerSelection: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const handleGameState = (gameState: any) => {
      if (gameState.gameStatus === 'playing') {
        navigate(`/game/${roomId}`);
      }
    };

    socketService.on('gameState', handleGameState);

    return () => {
      socketService.off('gameState', handleGameState);
    };
  }, [roomId, navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const response = await fetch(`http://localhost:3001/api/players/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 7) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleFinishSelection = async () => {
    if (!roomId) return;
    const { success, message } = await socketService.finishSelection(roomId, selectedPlayers);
    if (success) {
      navigate(`/game/${roomId}`);
    } else {
      alert(message || 'Bir hata oluştu');
    }
  };

  return (
    <Container>
      <Card>
        <Title>Futbolcu Seçimi</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Futbolcu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </SearchContainer>

        <SelectedCount>
          Seçilen: {selectedPlayers.length}/7
        </SelectedCount>

        <PlayerGrid>
          {searchResults.map(player => (
            <PlayerCard
              key={player.id}
              selected={selectedPlayers.some(p => p.id === player.id)}
              onClick={() => handlePlayerSelect(player)}
            >
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

        <Button
          onClick={handleFinishSelection}
          disabled={selectedPlayers.length < 5 || selectedPlayers.length > 7}
        >
          Seçimi Tamamla
        </Button>
      </Card>
    </Container>
  );
}; 