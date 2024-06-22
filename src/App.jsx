import React, { useState } from 'react';
import './App.css';
import DrawingCanvas from './components/DrawingCanvas';
import ColorButton from './components/ColorButton';
import ModeDropdown from './components/ModeDropdown';
import axios from 'axios';

function App() {
    const [mode, setMode] = useState('write');
    const [color, setColor] = useState('red'); // Defaultfarbe auf 'red' gesetzt
    const [selectedMode, setSelectedMode] = useState('Ionisch'); // Default-Auswahl für das Dropdown-Menü

    const handleColorSelect = (selectedColor) => {
        setColor(selectedColor);
    };

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
    };

    const saveDrawing = async (points) => {
        const data = {
            name: 'My Drawing',
            points: points
        };

        try {
            const response = await axios.post('http://your-backend-url/synthdata', data);
            console.log('Save successful', response.data);
        } catch (error) {
            console.error('Error saving data', error);
        }
    };

    return (
        <div className="App">
            <div>
                {['red', 'green', 'blue', 'orange', 'purple', 'yellow'].map((color) => (
                    <ColorButton key={color} color={color} onSelectColor={handleColorSelect} />
                ))}
            </div>
            <ModeDropdown selectedMode={selectedMode} onSelectMode={handleModeSelect} />
            <DrawingCanvas mode={mode} color={color} onSave={saveDrawing} />
        </div>
    );
}

export default App;
