import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { PlayerSelection } from './components/PlayerSelection';
import { Game } from './components/Game';
import { GameOver } from './components/GameOver';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/waiting/:roomId" element={<WaitingRoom />} />
          <Route path="/selection/:roomId" element={<PlayerSelection />} />
          <Route path="/game/:roomId" element={<Game />} />
          <Route path="/game-over/:roomId" element={<GameOver />} />
          {/* Diğer rotalar eklenecek */}
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App; 