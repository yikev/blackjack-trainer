// src/App.jsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GamePage from './pages/GamePage';
import Button from './components/Button';
import TutorialPage from './pages/TutorialPage';

function HomePage() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>♠️ Blackjack Card Counter ♦️</h1>
      <p>A web app to help you learn and practice card counting.</p>
      <Button label="Start Tutorial" onClick={() => navigate('/tutorial')} />
      <button style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#228B22',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }} onClick={startGame}>Start</button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/tutorial" element={<TutorialPage />} /> 
    </Routes>
  );
}

export default App;