// src/pages/GamePage.jsx
import React from 'react';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Card from '../components/Card';
import '../components/Card.css';
import { useState,useEffect } from 'react';
import { createShuffledDeck } from '../utils/deck';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function GamePage() {

    const DECKS_IN_PLAY = 6; // or whatever you choose

    const handleReset = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setDeck(createShuffledDeck(numDecks));
        setCurrentBet(0);
        setBankroll(1000);
        setRunningCount(0);
        setDecksRemaining(6);
        setCardsDealt(0);
        setIsPlaying(false); // ⬅ Game is no longer active
        console.log('Resetting table...');
    };
    const handleDeal = () => {
    if (deck.length < 15) {
        console.log("DECK SHUFFLED");
        setDeck(createShuffledDeck(numDecks));
        setRunningCount(0);
        setDecksRemaining(6);
        return;
    }

    const newDeck = [...deck];
    const p1 = newDeck.pop();
    const d1 = newDeck.pop();
    const p2 = newDeck.pop();
    const d2 = newDeck.pop();

    updateCount(p1);
    updateCount(d1);
    updateCount(p2);
    updateCount(d2);
    setCardsDealt(prev => prev + 4);

    // Clear current state to simulate dealing animation
    setPlayerHands([[]]);
    setDealerHand([]);
    setActiveHandIndex(0);
    setDeck(newDeck);
    setSplitActive(false);
    setIsPlaying(true); // temporarily true to block other actions
    setIsDealing(true);

    // Step-by-step delay
    setTimeout(() => {
        setPlayerHands([[p1]]);
    }, 500);
    setTimeout(() => {
        setDealerHand([d1]);
    }, 1000);
    setTimeout(() => {
        setPlayerHands([[p1, p2]]);
    }, 1500);
    setTimeout(() => {
        setDealerHand([d1, { ...d2, faceDown: true }]);
    }, 2000);

    // Evaluate hands AFTER animations
    setTimeout(async () => {
        const hand = [p1, p2];
        const dealer = [d1, d2];
        const dealerHasBJ = isBlackjack(dealer);
        const playerHasBJ = isBlackjack(hand);

        if (dealerHasBJ) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setDealerHand([d1, d2]); // reveal second card
            await new Promise(resolve => setTimeout(resolve, 600)); // pause before evaluating
            if (playerHasBJ) {
                console.log("Both have blackjack. Push.");
                showFeedback('Push. It\'s a tie. 🤝');
                setBankroll(prev => prev + currentBet);
            } else {
                console.log("Dealer has blackjack. Player loses.");
                showFeedback('Dealer has Blackjack 😞. Now its time for you!');
                // No bankroll change
            }

            setCurrentBet(0);
            setIsPlaying(false);
            resetHands();
            setPlacedChips([]);
        } else if (playerHasBJ) {
            console.log("Player has blackjack! Wins 3:2.");
            showFeedback('Player hits Blackjack! 🎉');
            setBankroll(prev => prev + currentBet * 2.5);
            setCurrentBet(0);
            setIsPlaying(false);
            resetHands();
            setPlacedChips([]);
        } else {
            setIsDealing(false);
            setIsPlaying(true); // game continues
        }
    }, 1500); // After last card is dealt
};
    const handleHit = () => {
        if (!isPlaying) return;

        const newDeck = [...deck];
        const newCard = newDeck.pop();
        const updatedHands = [...playerHands];
        updatedHands[activeHandIndex].push(newCard);

        setDeck(newDeck);
        setPlayerHands(updatedHands);
        updateCount(newCard);
        setCardsDealt(prev => prev + 1);

        const handValue = calculateHandValue(updatedHands[activeHandIndex]);

        if (handValue > 21) {
            console.log(`Hand ${activeHandIndex + 1} busts.`);
            showFeedback('You lose. 💸');

            setDealerHand(prev => prev.map((card, index) => (
                index === 1 ? { ...card, faceDown: false } : card
            )));

            if (splitActive && activeHandIndex === 0) {
            setActiveHandIndex(1); // move to second hand
            } else {
            // round ends, player loses
            setIsPlaying(false);
            resetHands();
            setPlacedChips([]);
            setCurrentBet(0); // 💥 Reset the bet on bust
            }
        }
    };
    const handleStand = async () => {
        if (splitActive && activeHandIndex === 0) {
            setActiveHandIndex(1);
            return;
        }

        setIsDealing(true);
        let newDeck = [...deck];

        // 1️⃣ Reveal the face-down card
        // ✅ Immediately flip the hidden dealer card
        await sleep(600);
        const revealed = dealerHand.map((card, i) =>
        i === 1 ? { ...card, faceDown: false } : card
        );
        setDealerHand(revealed);
        setDealerRevealed(true);

        // Optional tiny delay to separate flip from draw visually
        await sleep(800);

        // 2️⃣ Draw additional cards if needed
        let updatedDealer = [...revealed];
        while (calculateHandValue(updatedDealer) < 17) {
            const nextCard = newDeck.pop();
            updateCount(nextCard);
            setCardsDealt(prev => prev + 1);
            updatedDealer.push(nextCard);
            setDealerHand([...updatedDealer]);
            await sleep(800); // delay between draws
        }

        // 3️⃣ Evaluate outcome
        let payout = 0;
        const dealerValue = calculateHandValue(updatedDealer);
        const dealerHasBJ = isBlackjack(updatedDealer);

        if (dealerHasBJ) {
            console.log('Dealer has blackjack.');
            for (let i = 0; i < playerHands.length; i++) {
                const hand = playerHands[i];
                const hasBJ = isBlackjack(hand);
                if (hasBJ) {
                    payout += currentBet;
                    console.log(`Hand ${i + 1}: push`);
                    showFeedback('Push. It\'s a tie. 🤝');
                } else {
                    console.log(`Hand ${i + 1}: lose`);
                    showFeedback('You lose. 💸');
                }
            }
        } else {
            for (let i = 0; i < playerHands.length; i++) {
                const hand = playerHands[i];
                const playerVal = calculateHandValue(hand);
                const hasBJ = isBlackjack(hand);

                let outcome;
                if (hasBJ) {
                    payout += currentBet * 2.5;
                    outcome = 'blackjack';
                } else {
                    outcome = determineOutcome(playerVal, dealerValue);
                    if (outcome === 'win') {
                        showFeedback('You win! 🏆');
                        payout += currentBet * 2;
                    } else if (outcome === 'push'){
                        showFeedback('Push. It\'s a tie. 🤝');
                        payout += currentBet;
                    } 
                }

                console.log(`Hand ${i + 1}: ${outcome} (${playerVal} vs ${dealerValue})`);
            }
        }

        setBankroll(prev => prev + payout);
        setCurrentBet(0);
        setDeck(newDeck);
        setIsPlaying(false);
        setIsDealing(false);
        setPlacedChips([]);
        resetHands();
        setPlacedChips([]);
    };
    const handleSplit = () => {
        const currentHand = playerHands[0];
        if (playerHands.length > 1 || currentHand.length !== 2 || currentHand[0].rank !== currentHand[1].rank || bankroll < currentBet) {
            console.log('Cannot split.');
            return;
        }

        const newDeck = [...deck];
        const c1 = newDeck.pop();
        const c2 = newDeck.pop();
        updateCount(c1);
        updateCount(c2);
        setCardsDealt(prev => prev + 2);

        const hand1 = [currentHand[0], c1];
        const hand2 = [currentHand[1], c2];

        setPlayerHands([hand1, hand2]);
        setActiveHandIndex(0);
        setDeck(newDeck);
        setBankroll(bankroll - currentBet);
        setSplitActive(true);
        console.log('Split complete. Playing first hand.');
    };
    const handleDouble = () => {
        if (!isPlaying || bankroll < currentBet || isDealing) return;

        const newDeck = [...deck];
        const newCard = newDeck.pop();
        updateCount(newCard);
        setCardsDealt(prev => prev + 1);

        // Update bet and bankroll
        setBankroll(bankroll - currentBet);
        setCurrentBet(currentBet * 2);

        // Add one card to current hand
        const updatedHands = [...playerHands];
        updatedHands[activeHandIndex].push(newCard);

        setDeck(newDeck);
        setPlayerHands(updatedHands);

        // Auto-stand after 1 card
        setTimeout(() => {
            handleStand();
        }, 600); // Delay for realism
    };
    const handleUndo = () => {
        setBankroll(bankroll + currentBet);
        setCurrentBet(0);
        setPlacedChips([]);
        console.log(`bankroll reset to: ${bankroll} and current bet reset to: ${currentBet}`);
    }
    const handleBet = (amount) => {
        if (bankroll >= amount) {
            setBankroll(bankroll - amount);
            setCurrentBet(currentBet + amount);
            setPlacedChips(prev => [...prev, amount]);
            console.log(`Betting $${amount}. New bankroll: $${bankroll - amount}`);
        } else {
            console.log("Insufficient funds");
        }
    };
    const [bankroll, setBankroll] = useState(1000);
    const [currentBet, setCurrentBet] = useState(0);
    const [deck, setDeck] = useState(() => createShuffledDeck()); 
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);  
    const [isPlaying, setIsPlaying] = useState(false);
    const [playerStood, setPlayerStood] = useState(false);
    const [playerHands, setPlayerHands] = useState([]); // Array of hands
    const [activeHandIndex, setActiveHandIndex] = useState(0); // 0 or 1
    const [splitActive, setSplitActive] = useState(false);
    const [isDealing, setIsDealing] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [runningCount, setRunningCount] = useState(0);
    const [cardsDealt, setCardsDealt] = useState(0);
    const [numDecks, setNumDecks] = useState(2);
    const [decksRemaining, setDecksRemaining] = useState(numDecks);
    const [dealerRevealed, setDealerRevealed] = useState(false);
    const [placedChips, setPlacedChips] = useState([]);

    const TOTAL_CARDS = numDecks * 52;

    function updateCount(card) {
        const value = card.rank;
        if (['2', '3', '4', '5', '6'].includes(value)) {
            setRunningCount(prev => prev + 1);
        } else if (['10', 'J', 'Q', 'K', 'A'].includes(value)) {
            setRunningCount(prev => prev - 1);
        }
        // 7–9 are neutral, no update
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;

        for (const card of hand) {
            if (['J', 'Q', 'K'].includes(card.rank)) {
            value += 10;
            } else if (card.rank === 'A') {
            value += 11;
            aceCount++;
            } else {
            value += parseInt(card.rank);
            }
        }

        // Downgrade aces from 11 to 1 if needed
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }

        return value;
    }

    function getDisplayValue(hand) {
  let total = 0;
  let aceCount = 0;

  for (const card of hand) {
    if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else if (card.rank === 'A') {
      total += 11;
      aceCount++;
    } else {
      total += parseInt(card.rank);
    }
  }

  let softTotal = total;
  while (softTotal > 21 && aceCount > 0) {
    softTotal -= 10;
    aceCount--;
  }

  const hasAce = hand.some(card => card.rank === 'A');
  const hardTotal = total;

  // If hard total is over 21, only show the soft total
  if (hardTotal > 21) {
    return `${softTotal}`;
  }

  // If hand has an Ace and totals differ, show both
  if (hasAce && softTotal !== hardTotal) {
    return `${softTotal} / ${hardTotal}`;
  }

  // Default: show the soft total
  return `${softTotal}`;
}

    function formatHandValue(hand) {
        const { softValue, hardValue } = calculateHandValue(hand);
        if (softValue !== hardValue && softValue <= 21) {
            return `${softValue} / ${hardValue}`; // e.g., "7 / 17"
        } else {
            return `${softValue}`; // e.g., "18" or busted value
        }
    }

    const showFeedback = (message, duration = 2000) => {
        setFeedbackMessage(message);
        setTimeout(() => {
            setFeedbackMessage('');
        }, duration);
    };

    function isBlackjack(hand) {
        if (hand.length !== 2) return false;

        const ranks = hand.map(card => card.rank);
        return (
            (ranks.includes('A') && ranks.includes('10')) ||
            (ranks.includes('A') && ranks.includes('J')) ||
            (ranks.includes('A') && ranks.includes('Q')) ||
            (ranks.includes('A') && ranks.includes('K'))
        );
    }

    function determineOutcome(playerValue, dealerValue) {
        if (playerValue > 21) return 'lose';
        if (dealerValue > 21) return 'win';
        if (playerValue > dealerValue) return 'win';
        if (playerValue < dealerValue) return 'lose';
        return 'push';
    }

    const resetHands = () => {
        setTimeout(() => {
            setPlayerHands([]);
            setDealerHand([]);
        }, 2000); // 2-second delay for effect
    };

    const countCardsInPlay = () => {
        const playerCardCount = playerHands.flat().length;
        const dealerCardCount = dealerHand.length;
        return playerCardCount + dealerCardCount;
    };

    useEffect(() => {
        const decks = Math.max((numDecks * 52 - cardsDealt) / 52, 1);
        setDecksRemaining(decks);
    }, [cardsDealt, numDecks]);

    useEffect(() => {
        if (!isPlaying) {
            console.log("🃏 Deck after hand:", deck);
            console.log("🃏 Deck length:", deck.length);
        }
    }, [isPlaying]);

    return (
    <div style={{ textAlign: 'center' }}>
        <h2>Blackjack Table</h2>
        
        {feedbackMessage && (
            <div style={{
                backgroundColor: '#222',
                color: '#fff',
                padding: '1rem',
                borderRadius: '10px',
                margin: '1rem auto',
                width: 'fit-content',
                boxShadow: '0 0 10px gold',
                fontSize: '1.2rem'
            }}>
                {feedbackMessage}
            </div>
        )}

        <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            backgroundColor: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}>
            Bankroll: ${bankroll}
        </div>

        <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="deckSelect">Number of Decks: </label>
        <select
            id="deckSelect"
            value={numDecks}
            onChange={(e) => {
            const decks = parseInt(e.target.value);
            setNumDecks(decks);
            setDeck(createShuffledDeck(decks)); // reshuffle with new count
            setRunningCount(0);
            setCardsDealt(0);
            setDecksRemaining(decks);
            setBankroll(1000); // optional: reset game state
            setCurrentBet(0);
            }}
            disabled={isPlaying} // disable mid-hand
        >
            {[2, 3, 4, 5, 6].map(n => (
            <option key={n} value={n}>{n}</option>
            ))}
        </select>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '2rem' }}>
            <Button
                label="Reset"
                onClick={handleReset}
                style={{
                    position: 'absolute',
                    top: '3rem',
                    left: '0.5rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                }}
            />
            {!isPlaying && (
                <Button label="Deal" onClick={handleDeal} style={{
                    position: 'absolute',
                    top: '30rem',
                    left: '41rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                }} disabled={currentBet <= 0 || isPlaying} />
            )}
            {isPlaying && (
            <div style={{ marginTop: '2rem' }}>
                <Button label="Hit" onClick={handleHit} style={{
                    position: 'absolute',
                    top: '30rem',
                    left: '33rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                }}  disabled={isDealing} />
                <Button label="Stand" onClick={handleStand} style={{
                    position: 'absolute',
                    top: '30rem',
                    left: '60rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                }} disabled={isDealing} />
                <Button label="Split" onClick={handleSplit} style={{
                    position: 'absolute',
                    top: '30rem',
                    left: '49rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                }} disabled={isDealing} />
                <Button label="Double" onClick={handleDouble} style={{
                    position: 'absolute',
                    top: '33rem',
                    left: '49rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                }} disabled={isDealing} />
            </div>
            )}
        </div>

        {/* Cards */}
        <h3>Dealer</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        {dealerHand.map((card, i) => (
            <Card
            key={i}
            rank={card.rank}
            suit={card.suit}
            faceDown={card.faceDown}
            />
        ))}
            {dealerRevealed && (
                <div style={{ marginTop: '0.3rem', fontWeight: 'bold' }}>
                    Value: {getDisplayValue(dealerHand)}
                </div>
            )}
        </div>

        <h3>Player Hands</h3>
        {playerHands.map((hand, index) => (
        <div
            key={index}
            style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            border: index === activeHandIndex ? '3px solid gold' : 'none',
            borderRadius: '10px',
            padding: '0.5rem',
            boxShadow: index === activeHandIndex ? '0 0 10px gold' : 'none',
            transition: 'all 0.3s ease-in-out',
            flexDirection: 'column',
            alignItems: 'center',
            }}
        >
            <div style={{ display: 'flex' }}>
            {hand.map((card, i) => (
                <Card key={i} rank={card.rank} suit={card.suit} />
            ))}
            </div>
            <div style={{ marginTop: '0.3rem', fontWeight: 'bold' }}>
            Value: {getDisplayValue(hand)}
            </div>
        </div>
        ))}

        <div>Decks Remaining: {decksRemaining.toFixed(1)}</div>
        {"Running count: " + runningCount}

        {/* Betting Area */}
        <div
        id="betting-area"
        style={{
            minHeight: '80px',
            marginTop: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            padding: '1rem',
            border: '2px dashed #888',
            borderRadius: '12px',
            width: 'fit-content',
            marginInline: 'auto',
            backgroundColor: '#fdfdfd',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
        >
        {/* Render placed chips here */}
        {placedChips.map((chip, index) => (
            <Chip key={index} label={chip} onClick={() => {}} disabled />
        ))}
        </div>

       {/* Bank */}
        <div className="bank" style={{ marginTop: '10rem' }}>

            {!isPlaying && (
                <>
                    <Button label="All In" onClick={() => handleBet(bankroll)} disabled={bankroll <= 0} />
                    <Chip label="1" onClick={() => handleBet(1)} disabled={bankroll < 1} />
                    <Chip label="5" onClick={() => handleBet(5)} disabled={bankroll < 5} />
                    <Chip label="25" onClick={() => handleBet(25)} disabled={bankroll < 25} />
                    <Chip label="50" onClick={() => handleBet(50)} disabled={bankroll < 50} />
                    <Chip label="100" onClick={() => handleBet(100)} disabled={bankroll < 100} />
                    <Chip label="500" onClick={() => handleBet(500)} disabled={bankroll < 500} />
                    <Button label="Undo Bets" onClick={handleUndo} disabled={currentBet <= 0} />
                </>
            )}

            {"Current bet: $" + currentBet}
        </div>
    </div>
    );
}

export default GamePage;