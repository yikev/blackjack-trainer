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
    const TOTAL_CARDS = DECKS_IN_PLAY * 52;

    const handleReset = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setCurrentBet(0);
        setBankroll(1000);
        setRunningCount(0);
        setDecksRemaining(6);
        setIsPlaying(false); // ⬅ Game is no longer active
        console.log('Resetting table...');
    };
    const handleDeal = () => {
    if (deck.length < 15) {
        console.log("DECK SHUFFLED");
        setDeck(createShuffledDeck());
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

    // Step-by-step delay
    setTimeout(() => {
        setPlayerHands([[p1]]);
    }, 300);
    setTimeout(() => {
        setDealerHand([d1]);
    }, 600);
    setTimeout(() => {
        setPlayerHands([[p1, p2]]);
    }, 900);
    setTimeout(() => {
        setDealerHand([d1, { ...d2, faceDown: true }]);
    }, 1200);

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
        } else if (playerHasBJ) {
            console.log("Player has blackjack! Wins 3:2.");
            showFeedback('Player hits Blackjack! 🎉');
            setBankroll(prev => prev + currentBet * 2.5);
            setCurrentBet(0);
            setIsPlaying(false);
            resetHands();
        } else {
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
        resetHands();
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
        console.log(`bankroll reset to: ${bankroll} and current bet reset to: ${currentBet}`);
    }
    const handleBet = (amount) => {
        if (bankroll >= amount) {
            setBankroll(bankroll - amount);
            setCurrentBet(currentBet + amount);
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
    const [decksRemaining, setDecksRemaining] = useState(DECKS_IN_PLAY);

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

        // If we have an ace being counted as 11 and the soft and hard values differ
        if (softTotal !== total && softTotal <= 21) {
            return `${softTotal} / ${total}`; // e.g., 5 / 15
        } else {
            return `${softTotal}`; // single value
        }
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
        const decks = Math.max((TOTAL_CARDS - cardsDealt) / 52, 1);
        setDecksRemaining(decks);
    }, [cardsDealt]);

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

        {/* Buttons */}
        <div style={{ marginTop: '2rem' }}>
            <Button label="Reset" onClick={handleReset}/>
            <Button label="Deal" onClick={handleDeal} disabled={currentBet <= 0 || isPlaying} />
            <Button label="Hit" onClick={handleHit} disabled={!isPlaying || isDealing}/>
            <Button label="Stand" onClick={handleStand} disabled={!isPlaying || isDealing}/>
            <Button label="Split" onClick={handleSplit} disabled={!isPlaying || isDealing}/>
            <Button label="Double" onClick={handleDouble} disabled={!isPlaying || isDealing}/>
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

        {/* Bank */}
        <div className="bank" style={{ marginTop: '10rem' }}>
            {"$" + bankroll}
            <Button label="All In" onClick={() => handleBet(bankroll)} disabled={bankroll <= 0 || isPlaying} />
            <Chip label="1" onClick={() => handleBet(1)} disabled={bankroll < 1 || isPlaying} />
            <Chip label="5" onClick={() => handleBet(5)} disabled={bankroll < 5 || isPlaying} />
            <Chip label="25" onClick={() => handleBet(25)} disabled={bankroll < 25 || isPlaying} />
            <Chip label="50" onClick={() => handleBet(50)} disabled={bankroll < 50 || isPlaying} />
            <Chip label="100" onClick={() => handleBet(100)} disabled={bankroll < 100 || isPlaying} />
            <Chip label="500" onClick={() => handleBet(500)} disabled={bankroll < 500 || isPlaying} />
            {"$" + currentBet}
            <Button label="Undo Bets" onClick={handleUndo} disabled={currentBet <= 0 || isPlaying} />
        </div>

        {runningCount}
    </div>
    );
}

export default GamePage;