function Card({ rank, suit, faceDown = false }) {
  const getSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  const isRed = suit === 'hearts' || suit === 'diamonds';

  const cardStyle = {
    width: '60px',
    height: '90px',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: faceDown ? '#2e2e2e' : 'white',
    color: faceDown ? 'white' : isRed ? 'red' : 'black',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0.3rem',
    boxShadow: '1px 1px 5px rgba(0, 0, 0, 0.3)',
    userSelect: 'none',
  };

  return (
    <div className={`card ${faceDown ? 'face-down' : ''}`} style={cardStyle}>
      {faceDown ? '🂠' : (
        <>
          <div>{rank}</div>
          <div>{getSymbol(suit)}</div>
        </>
      )}
    </div>
  );
}

export default Card;