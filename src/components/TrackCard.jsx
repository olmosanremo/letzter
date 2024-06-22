import React, { useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';
import axios from 'axios';

const TrackCard = ({ trackId, color, mode, onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]); // Array to store multiple lines
    const [currentLine, setCurrentLine] = useState([]);
    const [currentColor, setCurrentColor] = useState(color);
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

    const handleSave = async () => {
        const drawing = {
            fileName: `drawing_${trackId}.json`,
            drawingId: trackId,
            lines: lines.map(line => ({
                color: line[0].color,
                points: line.map(point => ({ x: point.x, y: point.y }))
            }))
        };

        try {
            const response = await axios.post('http://your-backend-url/savedrawing', drawing);
            console.log('Save successful', response.data);
        } catch (error) {
            console.error('Error saving drawing', error);
        }
    };

    useEffect(() => {
        setCurrentColor(color);
    }, [color]);

    return (
        <div className="track-card">
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
        </div>
    );
};

export default TrackCard;
