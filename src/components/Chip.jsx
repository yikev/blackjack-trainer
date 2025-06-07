
function Chip({ label, onClick, disabled = false }) {
  return (
    <div
      onClick={onClick}
      disabled={disabled}
      style={{
        // padding: '0.75rem 1.5rem',
        // margin: '0.5rem',
        // fontSize: '1rem',
        height: '5rem',
        width: '5rem',
        backgroundColor: disabled ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
      }}
    >
      {label}
    </div>
  );
}

export default Chip;