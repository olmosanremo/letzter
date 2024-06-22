import React from 'react';

const ColorButton = ({ color, onSelectColor }) => {
    return (
        <button
            onClick={() => onSelectColor(color)}
            style={{ backgroundColor: color, width: 30, height: 30, margin: 5, border: 'none', cursor: 'pointer' }}
        />
    );
};

export default ColorButton;
