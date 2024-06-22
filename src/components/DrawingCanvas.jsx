import React, { useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';

const DrawingCanvas = ({ mode, color, onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]); // Array to store multiple lines
    const [currentLine, setCurrentLine] = useState([]);
    const [currentColor, setCurrentColor] = useState(color);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        // Initial canvas setup
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (event) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(event);
        setCurrentLine([{ x, y, color: currentColor }]);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        setLines([...lines, currentLine]); // Save the current line to lines
        setCurrentLine([]); // Reset current line
        canvasRef.current.getContext('2d').beginPath();
    };

    const draw = (event) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(event);
        const newCurrentLine = [...currentLine, { x, y, color: currentColor }];
        setCurrentLine(newCurrentLine);
        drawSmoothLine([...lines, newCurrentLine]);
    };

    const getCoordinates = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (event.touches) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        return { x, y };
    };

    const drawSmoothLine = (allLines) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.lineWidth = 2;

        allLines.forEach(points => {
            if (points.length > 0) {
                context.strokeStyle = points[0].color;
            }
            context.beginPath();
            if (points.length < 3) {
                const b = points[0];
                context.moveTo(b.x, b.y);
                context.lineTo(points[points.length - 1].x, points[points.length - 1].y);
                context.stroke();
                context.closePath();
                return;
            }

            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i === 0 ? i : i - 1];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = points[i + 2 > points.length - 1 ? points.length - 1 : i + 2];

                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;

                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;

                context.moveTo(p1.x, p1.y);
                context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            }

            context.stroke();
        });
    };

    const handleSave = () => {
        onSave(lines.flat());
    };

    const playPauseSound = async () => {
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

        const synths = {
            default: new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.1,
                    decay: 0.1,
                    sustain: 0.8,
                    release: 0.5
                }
            }).toDestination(),
            green: new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'fatsawtooth' },
                envelope: {
                    attack: 0.1,
                    decay: 0.1,
                    sustain: 0.8,
                    release: 0.5
                }
            }).toDestination()
        };

        Tone.Transport.cancel(); // Clear previous events

        const canvas = canvasRef.current;
        const height = canvas.height;
        const width = canvas.width;
        const totalTime = 30; // Total time in seconds for the canvas playback
        const minDuration = 0.05; // Minimum duration for each note

        lines.flat().forEach((point, index, arr) => {
            const time = (point.x / width) * totalTime; // Scale x to totalTime
            const freq = 100 + (height - point.y); // Invert y-coordinate for frequency
            const nextTime = (index < arr.length - 1) ? (arr[index + 1].x / width) * totalTime : totalTime;
            const duration = Math.max(nextTime - time, minDuration); // Ensure duration is at least minDuration

            const synth = point.color === 'green' ? synths.green : synths.default;

            Tone.Transport.schedule((time) => {
                synth.triggerAttackRelease(freq, duration, time);
            }, time);
        });

        Tone.Transport.start();
        Tone.Transport.stop(`+${totalTime}`); // Stop the transport after totalTime seconds
        setIsPlaying(true);
        setIsPaused(false);
    };

    const stopSound = () => {
        Tone.Transport.stop();
        setIsPlaying(false);
        setIsPaused(false);
    };

    useEffect(() => {
        setCurrentColor(color);
    }, [color]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: '1px solid black' }}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={endDrawing}
                onTouchMove={draw}
            />
            <button onClick={handleSave}>Save Drawing</button>
            <button onClick={playPauseSound} disabled={!isPlaying && isPaused}>
                {isPlaying && !isPaused ? 'Pause Sound' : 'Play Sound'}
            </button>
            <button onClick={stopSound} disabled={!isPlaying}>Stop Sound</button>
        </div>
    );
};

export default DrawingCanvas;
