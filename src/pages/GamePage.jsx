// src/pages/GamePage.jsx
import React from 'react';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { useState } from 'react';

function GamePage() {
    const handleReset = () => console.log('Resetting Table...');
    const handleDeal = () => console.log('Dealing cards...');
    const handleHit = () => console.log('Hit!');
    const handleStand = () => console.log('Stand!');
    const handleSplit = () => console.log('Split!');
    const handleDouble = () => console.log('Double down!');
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

    return (
    <div style={{ textAlign: 'center' }}>
        <h2>Blackjack Table</h2>
        

        {/* Buttons */}
        <div style={{ marginTop: '2rem' }}>
            <Button label="Reset" onClick={handleReset} />
            <Button label="Deal" onClick={handleDeal} />
            <Button label="Hit" onClick={handleHit} />
            <Button label="Stand" onClick={handleStand} />
            <Button label="Split" onClick={handleSplit} />
            <Button label="Double" onClick={handleDouble} />
        </div>

        {/* Bank */}
        <div className="bank" style={{ marginTop: '10rem' }}>
            {"$" + bankroll}
            <Button label="All In" onClick={() => handleBet(bankroll)} disabled={bankroll <= 0} />
            <Chip label="1" onClick={() => handleBet(1)} disabled={bankroll < 1} />
            <Chip label="5" onClick={() => handleBet(5)} disabled={bankroll < 5} />
            <Chip label="25" onClick={() => handleBet(25)} disabled={bankroll < 25} />
            <Chip label="50" onClick={() => handleBet(50)} disabled={bankroll < 50} />
            <Chip label="100" onClick={() => handleBet(100)} disabled={bankroll < 100} />
            <Chip label="500" onClick={() => handleBet(500)} disabled={bankroll < 500} />
            {"$" + currentBet}
            <Button label="Undo Bets" onClick={handleUndo} disabled={currentBet <= 0} />
        </div>
    </div>
    );
}

export default GamePage;