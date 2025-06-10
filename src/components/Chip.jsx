// Chip.jsx
import React from 'react';
import './Chip.css';

const CHIP_COLORS = {
  1: 'white',
  5: 'red',
  25: 'green',
  50: 'blue',
  100: 'black',
  500: 'purple',
};

function Chip({ label, onClick, disabled = false }) {
  const color = CHIP_COLORS[label] || 'gray';

  return (
    <div
      className={`chip chip-${label}`}
      style={{
        backgroundColor: color,
        color: color === 'white' ? 'black' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={() => !disabled && onClick(label)}
    >
      ${label}
    </div>
  );
}

export default Chip;