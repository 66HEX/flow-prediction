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
    
    // Draw current cursor position
    if (cursorPosition) {
      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();
    }
    
    // Draw predicted cursor position
    if (predictedPosition) {
      ctx.beginPath();
      ctx.arc(predictedPosition.x, predictedPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fill();
      
      // Draw line connecting current and predicted position
      if (cursorPosition) {
        ctx.beginPath();
        ctx.moveTo(cursorPosition.x, cursorPosition.y);
        ctx.lineTo(predictedPosition.x, predictedPosition.y);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [cursorPosition, predictedPosition, elements, potentialTargets]);
  
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
      <div style={{ marginBottom: '20px' }}>
        <h2>Detected elements on path ({potentialTargets.length}):</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {potentialTargets.length === 0 && <p>No elements on predicted path.</p>}
          
          {potentialTargets.map(target => {
            const id = target.element.getAttribute('data-id');
            const element = elements.find(e => e.id.toString() === id);
            
            return (
              <div 
                key={id} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '10px',
                  borderRadius: '5px',
                  backgroundColor: getProbabilityColor(target.probability)
                }}
              >
                <div><strong>{element?.label || 'Element'}</strong></div>
                <div>Probability: {Math.round(target.probability * 100)}%</div>
                <div>Time to reach: {Math.round(target.timeToReach)}ms</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Canvas for visualization */}
      <div style={{ position: 'absolute' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          style={{ border: '1px solid #ccc', position: 'absolute' }}
        />
        {/* Invisible DOM elements for detection */}
      <div style={{ position: 'absolute', pointerEvents: 'none', opacity: 1 }}>
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
    </div>
  );
};

export default PathIntersectionExample; 