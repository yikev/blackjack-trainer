import React from 'react';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        ♠️ Blackjack Card Counter ♦️
      </h1>
      <p style={{ fontSize: '1.2rem' }}>
        A web app to help you learn and practice card counting.
      </p>
      <p style={{ marginTop: '2rem', color: '#888' }}>
        Coming soon...
      </p>
    </div>
  );
}

export default App;