import React from 'react';

const ModeDropdown = ({ selectedMode, onSelectMode }) => {
    const modes = ['Ionisch', 'Dorisch', 'Phrygisch', 'Lydisch', 'Mixolydisch', 'Äolisch', 'Lokrisch'];

    return (
        <select value={selectedMode} onChange={(e) => onSelectMode(e.target.value)}>
            {modes.map((mode) => (
                <option key={mode} value={mode}>
                    {mode}
                </option>
            ))}
        </select>
    );
};

export default ModeDropdown;
