import React, { useState } from 'react';
import TrackCard from './TrackCard';
import AddTrack from './AddTrack';
import ColorButton from './ColorButton';
import * as Tone from 'tone';

const TrackList = () => {
    const [tracks, setTracks] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentColor, setCurrentColor] = useState('red'); // Set default color to red

    const addTrack = () => {
        const newTrack = { id: new Date().getTime().toString(), color: currentColor, mode: 'default' };
        setTracks([...tracks, newTrack]);
    };

    const handleColorSelect = (color) => {
        setCurrentColor(color);
    };

    const playPauseAll = async () => {
        await Tone.start(); // Ensuring Tone.js is started

        if (isPlaying) {
            if (isPaused) {
                Tone.Transport.start();
                setIsPaused(false);
            } else {
                Tone.Transport.pause();
                setIsPaused(true);
            }
            return;
        }

        Tone.Transport.cancel(); // Clear previous events

        // Schedule all tracks' sounds here
        tracks.forEach(track => {
            // Use the track's data to schedule its sound
            // This is a placeholder, and should be replaced with the actual scheduling logic
            console.log(`Scheduling sound for track ${track.id}`);
        });

        Tone.Transport.start();
        setIsPlaying(true);
        setIsPaused(false);
    };

    const stopAll = () => {
        Tone.Transport.stop();
        setIsPlaying(false);
        setIsPaused(false);
    };

    return (
        <div>
            <div className="controls">
                {['red', 'green', 'blue', 'orange', 'purple', 'yellow'].map((color) => (
                    <ColorButton key={color} color={color} onSelectColor={handleColorSelect} />
                ))}
                <AddTrack onAddTrack={addTrack} />
                <button onClick={playPauseAll}>
                    {isPlaying && !isPaused ? 'Pause All' : 'Play All'}
                </button>
                <button onClick={stopAll} disabled={!isPlaying}>Stop All</button>
            </div>
            <div className="track-list">
                {tracks.map(track => (
                    <TrackCard
                        key={track.id}
                        trackId={track.id}
                        color={track.color}
                        mode={track.mode}
                        onSave={() => console.log(`Track ${track.id} saved.`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TrackList;
