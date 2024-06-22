import React from 'react';

const ColorButton = ({ color, onSelectColor }) => {
    return (
        <button
            onClick={() => onSelectColor(color)}
            style={{ backgroundColor: color, margin: '5px', padding: '10px' }}
        >
            {color}
        </button>
    );
};

export default ColorButton;
