import React, { useState } from 'react';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

const tutorialDeck = [
  { rank: '2', suit: 'hearts' },
  { rank: 'K', suit: 'spades' },
  { rank: '7', suit: 'diamonds' },
  { rank: 'A', suit: 'clubs' },
];

const getHiLoValue = (rank) => {
  if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
  if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1;
  return 0;
};

function TutorialPage() {
  const [step, setStep] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const navigate = useNavigate();

  const nextCard = tutorialDeck[step];
  const nextCount = runningCount + getHiLoValue(nextCard.rank);

  const handleNext = () => {
    if (step < tutorialDeck.length - 1) {
      setRunningCount(nextCount);
      setStep(step + 1);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Hi-Lo Card Counting Tutorial</h2>
      <p>Current Running Count: {runningCount}</p>
      <Card rank={nextCard.rank} suit={nextCard.suit} />
      <p>Card Value: {getHiLoValue(nextCard.rank)}</p>
      <button onClick={handleNext}>Next</button>
    
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        ⬅ Back to Game
      </button>
    </div>
  );
}

export default TutorialPage;