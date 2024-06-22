import React, { useState } from 'react';

const ToggleButton = ({ onToggle }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleClick = () => {
        setIsPlaying(!isPlaying);
        onToggle(!isPlaying);
    };

    return (
        <button onClick={handleClick}>
            {isPlaying ? 'Pause' : 'Play'}
        </button>
    );
};

export default ToggleButton;
