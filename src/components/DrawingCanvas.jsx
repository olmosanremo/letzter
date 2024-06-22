import React, { useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';

const DrawingCanvas = ({ mode, color, onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

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
        setPoints([{ x, y }]);
        draw(event);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        canvasRef.current.getContext('2d').beginPath();
    };

    const draw = (event) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(event);
        const newPoints = [...points, { x, y }];
        setPoints(newPoints);
        drawSmoothLine(newPoints);
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

    const drawSmoothLine = (points) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.lineWidth = 2;
        context.strokeStyle = color;
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
    };

    const handleSave = () => {
        onSave(points);
    };

    const playSound = async () => {
        await Tone.start(); // Ensuring Tone.js is started
        const synth = new Tone.Synth().toDestination();
        Tone.Transport.cancel(); // Clear previous events

        const canvas = canvasRef.current;
        const height = canvas.height;
        const width = canvas.width;

        points.forEach((point, index) => {
            const time = (point.x / width) * Tone.Transport.bpm.value / 60; // Scale x to time
            const freq = 100 + (height - point.y); // Invert y-coordinate for frequency
            const duration = (index < points.length - 1) ? ((points[index + 1].x - point.x) / width) * Tone.Transport.bpm.value / 60 : 0.1; // Calculate duration based on next point

            Tone.Transport.schedule((time) => {
                synth.triggerAttackRelease(freq, duration, time);
            }, time);
        });

        Tone.Transport.start();
        setIsPlaying(true);
    };

    const stopSound = () => {
        Tone.Transport.stop();
        setIsPlaying(false);
    };

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
            <button onClick={playSound} disabled={isPlaying}>Play Sound</button>
            <button onClick={stopSound} disabled={!isPlaying}>Stop Sound</button>
        </div>
    );
};

export default DrawingCanvas;
