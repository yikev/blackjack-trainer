// src/App.jsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GamePage from './pages/GamePage';

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
    </Routes>
  );
}

export default App;