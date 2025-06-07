// src/components/Button.jsx
import React from 'react';

function Button({ label, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.75rem 1.5rem',
        margin: '0.5rem',
        fontSize: '1rem',
        backgroundColor: disabled ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}

export default Button;