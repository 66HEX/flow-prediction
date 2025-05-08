import React, { useState, useEffect, useRef } from 'react';
import { usePreloadOnPrediction } from '../src/hooks/usePreloadOnPrediction';

// Colors for visualization probability
const getProbabilityColor = (probability: number): string => {
  // Gradient from green (low value) to red (high value)
  const red = Math.floor(probability * 255);
  const green = Math.floor(255 - probability * 255);
  return `rgb(${red}, ${green}, 0)`;
};

const PathIntersectionExample: React.FC = () => {
  // Settings
  const [horizonTime, setHorizonTime] = useState(500); // ms to predict ahead
  const [minProbability, setMinProbability] = useState(0.1); // probability threshold
  const [numParticles, setNumParticles] = useState(200);
  const [processNoise, setProcessNoise] = useState(5);
  
  // Canvas for visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track canvas-relative cursor position
  const [canvasPosition, setCanvasPosition] = useState<{ x: number, y: number } | null>(null);
  const [canvasPredictedPosition, setCanvasPredictedPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Generating random elements to click
  const [elements, setElements] = useState<Array<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>>([]);
  
  // Hook for prediction and preloading
  const { 
    cursorPosition, 
    predictedPosition, 
    potentialTargets,
    preloadedResources 
  } = usePreloadOnPrediction({
    predictionHorizon: horizonTime,
    numParticles,
    processNoise,
    minProbability,
    sampleRate: 16, // ~60fps for smoother visualization
    checkFrequency: 30, // more frequent checks
  });
  
  // Handle mouse movement on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setCanvasPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    // Attach event listener to canvas only
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Update canvas-relative predicted position when global position updates
  useEffect(() => {
    if (cursorPosition && predictedPosition && canvasPosition) {
      // Calculate offset between global and canvas positions
      const offsetX = canvasPosition.x - cursorPosition.x;
      const offsetY = canvasPosition.y - cursorPosition.y;
      
      // Apply same offset to predicted position
      setCanvasPredictedPosition({
        x: predictedPosition.x + offsetX,
        y: predictedPosition.y + offsetY
      });
    } else {
      setCanvasPredictedPosition(null);
    }
  }, [cursorPosition, predictedPosition, canvasPosition]);
  
  // Generating random elements when component is mounted
  useEffect(() => {
    const randomElements = Array.from({ length: 5 }, (_, i) => {
      return {
        id: i,
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 300,
        width: 50 + Math.random() * 100,
        height: 30 + Math.random() * 20,
        label: `Link ${i + 1}`
      };
    });
    
    setElements(randomElements);
  }, []);
  
  // Drawing visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    elements.forEach(element => {
      ctx.fillStyle = '#f0f0f0';
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      
      // Check if element is on path
      const target = potentialTargets.find(t => 
        t.element.getAttribute('data-id') === element.id.toString()
      );
      
      if (target) {
        // Element is on path - use color based on probability
        ctx.fillStyle = getProbabilityColor(target.probability);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
      }
      
      // Draw element
      ctx.beginPath();
      ctx.rect(element.x, element.y, element.width, element.height);
      ctx.fill();
      ctx.stroke();
      
      // Add label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(element.label, element.x + element.width / 2, element.y + element.height / 2);
      
      // If element is on path, add probability and time information
      if (target) {
        ctx.font = '10px Arial';
        ctx.fillText(
          `Prob: ${Math.round(target.probability * 100)}%, Time: ${Math.round(target.timeToReach)}ms`,
          element.x + element.width / 2,
          element.y + element.height + 15
        );
      }
    });
    
    // Draw current cursor position using canvas-relative coordinates
    if (canvasPosition) {
      ctx.beginPath();
      ctx.arc(canvasPosition.x, canvasPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();
    }
    
    // Draw predicted cursor position using canvas-relative coordinates
    if (canvasPredictedPosition) {
      ctx.beginPath();
      ctx.arc(canvasPredictedPosition.x, canvasPredictedPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fill();
      
      // Draw line connecting current and predicted position
      if (canvasPosition) {
        ctx.beginPath();
        ctx.moveTo(canvasPosition.x, canvasPosition.y);
        ctx.lineTo(canvasPredictedPosition.x, canvasPredictedPosition.y);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [canvasPosition, canvasPredictedPosition, elements, potentialTargets]);
  
  // Render placeholder boxes when no elements are detected
  const renderBoxes = () => {
    if (potentialTargets.length > 0) {
      // Show actual detected elements
      return potentialTargets.map(target => {
        const id = target.element.getAttribute('data-id');
        const element = elements.find(e => e.id.toString() === id);
        
        return (
          <div 
            key={id} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: getProbabilityColor(target.probability),
              minWidth: '160px'
            }}
          >
            <div><strong>{element?.label || 'Element'}</strong></div>
            <div>Probability: {Math.round(target.probability * 100)}%</div>
            <div>Time to reach: {Math.round(target.timeToReach)}ms</div>
          </div>
        );
      });
    } else {
      // Show placeholder box with default values
      return (
        <div 
          style={{ 
            border: '1px solid #ccc', 
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: '#f0f0f0',
            minWidth: '160px',
            opacity: 0.7
          }}
        >
          <div><strong>No element detected</strong></div>
          <div>Probability: N/A</div>
          <div>Time to reach: N/A</div>
        </div>
      );
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Path Intersection Detection Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Czas predykcji (ms):
            <input 
              type="range" 
              min="100" 
              max="1000" 
              step="100" 
              value={horizonTime}
              onChange={e => setHorizonTime(parseInt(e.target.value))}
              style={{ marginLeft: '10px', width: '200px' }}
            />
            {horizonTime}ms
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Minimal threshold probability:
            <input 
              type="range" 
              min="0.1" 
              max="0.9" 
              step="0.1" 
              value={minProbability}
              onChange={e => setMinProbability(parseFloat(e.target.value))}
              style={{ marginLeft: '10px', width: '200px' }}
            />
            {minProbability}
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Process noise:
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1" 
              value={processNoise}
              onChange={e => setProcessNoise(parseInt(e.target.value))}
              style={{ marginLeft: '10px', width: '200px' }}
            />
            {processNoise}
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Number of particles:
            <input 
              type="range" 
              min="50" 
              max="500" 
              step="50" 
              value={numParticles}
              onChange={e => setNumParticles(parseInt(e.target.value))}
              style={{ marginLeft: '10px', width: '200px' }}
            />
            {numParticles}
          </label>
        </div>
      </div>
      
      {/* Information about detected elements */}
      <div style={{ marginBottom: '20px', minHeight: '120px' }}>
        <h2>Detected elements on path ({potentialTargets.length}):</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {renderBoxes()}
        </div>
      </div>
      
      {/* Current position and predicted position information */}
      <div style={{ marginBottom: '20px', minHeight: '80px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <h3>Current Position:</h3>
            <p>X: {canvasPosition?.x.toFixed(1) ?? 'N/A'}, Y: {canvasPosition?.y.toFixed(1) ?? 'N/A'}</p>
          </div>
          
          <div>
            <h3>Predicted Position ({horizonTime}ms ahead):</h3>
            <p>X: {canvasPredictedPosition?.x.toFixed(1) ?? 'N/A'}, Y: {canvasPredictedPosition?.y.toFixed(1) ?? 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Canvas for visualization with fixed positioning */}
      <div style={{ position: 'relative', width: '800px', height: '500px', marginBottom: '20px' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          style={{ 
            border: '1px solid #ccc', 
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        {/* Invisible DOM elements for detection */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none'
        }}>
          {elements.map(element => (
            <a 
              key={element.id}
              href={`/example-link-${element.id}`}
              data-id={element.id}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`
              }}
            >
              {element.label}
            </a>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px' }} />
          Current cursor position
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'blue', borderRadius: '50%', marginRight: '5px' }} />
          Predicted position ({horizonTime}ms ahead)
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'rgb(128, 128, 0)', borderRadius: '50%', marginRight: '5px' }} />
          Element (color indicates probability)
        </div>
      </div>
    </div>
  );
};

export default PathIntersectionExample; 