import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socketService } from '../services/socket';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
`;

const Button = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #45a049;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #666;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &::before {
    margin-right: 1rem;
  }

  &::after {
    margin-left: 1rem;
  }
`;

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Lütfen bir isim girin');
      return;
    }

    try {
      const { roomId } = await socketService.createRoom(playerName);
      navigate(`/waiting/${roomId}`);
    } catch (error) {
      setError('Oda oluşturulurken bir hata oluştu');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const { success } = await socketService.joinRoom(roomId, playerName);
      if (success) {
        navigate(`/waiting/${roomId}`);
      } else {
        setError('Odaya katılırken bir hata oluştu');
      }
    } catch (error) {
      setError('Odaya katılırken bir hata oluştu');
    }
  };

  return (
    <Container>
      <Card>
        <Title>Kart Oyunu</Title>
        <Form onSubmit={handleCreateRoom}>
          <Input
            type="text"
            placeholder="İsminiz"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <Button type="submit">Yeni Oda Oluştur</Button>
        </Form>

        <Divider>veya</Divider>

        <Form onSubmit={handleJoinRoom}>
          <Input
            type="text"
            placeholder="Oda Kodu"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Button type="submit">Odaya Katıl</Button>
        </Form>

        {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
      </Card>
    </Container>
  );
}; 