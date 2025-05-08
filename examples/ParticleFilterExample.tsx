import React, { useState, useEffect, useRef } from 'react';
import { useCursorPredictor } from '../src/hooks/useCursorPredictor';

interface PredictionPoint {
  real: { x: number, y: number };
  predicted: { x: number, y: number };
  timestamp: number;
}

const ParticleFilterExample: React.FC = () => {
  // Configuration options
  const [horizonTime, setHorizonTime] = useState(100); // ms to predict ahead
  const [numParticles, setNumParticles] = useState(500);
  const [processNoise, setProcessNoise] = useState(1);
  const [directionBias, setDirectionBias] = useState(1.5);
  const [showParticles, setShowParticles] = useState(true);
  
  // Reference for canvas drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use cursor predictor hook with particle filter
  const { 
    position,
    predictedPosition, 
    history, 
    getParticles,
    isTracking, 
    startTracking, 
    stopTracking 
  } = useCursorPredictor({
    predictionHorizon: horizonTime,
    numParticles,
    processNoise,
    directionBias,
    sampleRate: 16 // ~60fps for smoother visualization
  });
  
  // Store predictions for visualization
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  
  // Update predictions
  useEffect(() => {
    if (position && predictedPosition) {
      // Add to predictions history for visualization
      setPredictions(prev => {
        const newPredictions = [...prev, {
          real: { x: position.x, y: position.y },
          predicted: { x: predictedPosition.x, y: predictedPosition.y },
          timestamp: position.timestamp
        }];
        
        // Keep only last 50 predictions
        return newPredictions.slice(-50);
      });
    }
  }, [position, predictedPosition]);
  
  // Reset predictions when tracking is toggled
  useEffect(() => {
    if (!isTracking) {
      setPredictions([]);
    }
  }, [isTracking]);
  
  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw history points (motion trail)
    if (history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(history[0].x, history[0].y);
      
      for (let i = 1; i < history.length; i++) {
        ctx.lineTo(history[i].x, history[i].y);
      }
      
      // Gradient for the trail
      const gradient = ctx.createLinearGradient(
        history[0].x, history[0].y, 
        history[history.length - 1].x, history[history.length - 1].y
      );
      gradient.addColorStop(0, 'rgba(255, 100, 100, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 100, 100, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw particles if enabled
    if (showParticles && position) {
      const particles = getParticles();
      
      if (particles) {
        particles.forEach(particle => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 100, 255, ${particle.weight * 100})`;
          ctx.fill();
        });
      }
    }
    
    // Draw current position
    if (position) {
      ctx.beginPath();
      ctx.arc(position.x, position.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();
    }
    
    // Draw predicted position
    if (predictedPosition) {
      ctx.beginPath();
      ctx.arc(predictedPosition.x, predictedPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fill();
      
      // Draw line connecting current to predicted position
      if (position) {
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.lineTo(predictedPosition.x, predictedPosition.y);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
  }, [position, predictedPosition, history, showParticles, getParticles]);
  
  // Calculate prediction accuracy
  const accuracyStats = React.useMemo(() => {
    if (predictions.length < 2) return null;
    
    // Find pairs of real positions and predictions (when time difference matches horizonTime)
    const pairs: Array<{ real: { x: number, y: number }, prediction: { x: number, y: number } }> = [];
    
    for (let i = 0; i < predictions.length; i++) {
      const currentPoint = predictions[i];
      
      // Find a real position that's approximately horizonTime after this point
      const targetTime = currentPoint.timestamp + horizonTime;
      const matchingPoint = predictions.find(p => 
        Math.abs(p.timestamp - targetTime) < 100 // within 100ms tolerance
      );
      
      if (matchingPoint) {
        pairs.push({
          real: matchingPoint.real,
          prediction: currentPoint.predicted
        });
      }
    }
    
    // Calculate average error
    if (pairs.length === 0) return null;
    
    const errors = pairs.map(pair => {
      const dx = pair.real.x - pair.prediction.x;
      const dy = pair.real.y - pair.prediction.y;
      return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
    });
    
    const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const maxError = Math.max(...errors);
    const minError = Math.min(...errors);
    
    return {
      averageError: avgError,
      maxError,
      minError,
      sampleCount: pairs.length
    };
  }, [predictions, horizonTime]);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Particle Filter Prediction Example</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startTracking} 
          disabled={isTracking}
          style={{ marginRight: '10px' }}
        >
          Start Tracking
        </button>
        <button 
          onClick={stopTracking} 
          disabled={!isTracking}
        >
          Stop Tracking
        </button>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ marginRight: '20px', marginBottom: '10px' }}>
          <label>
            Prediction Horizon (ms):
            <input 
              type="range" 
              min="100" 
              max="2000" 
              step="100" 
              value={horizonTime} 
              onChange={(e) => setHorizonTime(Number(e.target.value))}
              style={{ marginLeft: '10px', width: '150px' }}
            />
            <span style={{ marginLeft: '5px' }}>{horizonTime}ms</span>
          </label>
        </div>
        
        <div style={{ marginRight: '20px', marginBottom: '10px' }}>
          <label>
            Number of Particles:
            <input 
              type="range" 
              min="10" 
              max="500" 
              step="10" 
              value={numParticles} 
              onChange={(e) => setNumParticles(Number(e.target.value))}
              style={{ marginLeft: '10px', width: '150px' }}
            />
            <span style={{ marginLeft: '5px' }}>{numParticles}</span>
          </label>
        </div>
        
        <div style={{ marginRight: '20px', marginBottom: '10px' }}>
          <label>
            Process Noise:
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.5" 
              value={processNoise} 
              onChange={(e) => setProcessNoise(Number(e.target.value))}
              style={{ marginLeft: '10px', width: '150px' }}
            />
            <span style={{ marginLeft: '5px' }}>{processNoise.toFixed(1)}</span>
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Direction Bias:
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.1" 
              value={directionBias} 
              onChange={(e) => setDirectionBias(Number(e.target.value))}
              style={{ marginLeft: '10px', width: '150px' }}
            />
            <span style={{ marginLeft: '5px' }}>{directionBias.toFixed(1)}</span>
          </label>
        </div>
        
        <div style={{ width: '100%', marginTop: '10px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={showParticles} 
              onChange={(e) => setShowParticles(e.target.checked)}
            />
            Show Particles
          </label>
        </div>
      </div>
      
      <div>
        <h3>Current Position:</h3>
        <p>
          X: {position?.x.toFixed(1) ?? 'N/A'}, Y: {position?.y.toFixed(1) ?? 'N/A'}
        </p>
        
        <h3>Predicted Position ({horizonTime}ms ahead):</h3>
        <p>
          X: {predictedPosition?.x.toFixed(1) ?? 'N/A'}, 
          Y: {predictedPosition?.y.toFixed(1) ?? 'N/A'}
        </p>
        
        {accuracyStats && (
          <div>
            <h3>Prediction Accuracy:</h3>
            <p>Average Error: {accuracyStats.averageError.toFixed(2)} pixels</p>
            <p>Min Error: {accuracyStats.minError.toFixed(2)} pixels</p>
            <p>Max Error: {accuracyStats.maxError.toFixed(2)} pixels</p>
            <p>Sample Count: {accuracyStats.sampleCount}</p>
          </div>
        )}
      </div>
      
      <h3>Visualization:</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ 
          border: '1px solid #ccc',
          backgroundColor: '#f8f8f8'
        }}
      />
      
      <div style={{ marginTop: '20px', display: 'flex', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px' }} />
          Current position
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'blue', borderRadius: '50%', marginRight: '5px' }} />
          Predicted position ({horizonTime}ms ahead)
        </div>
        {showParticles && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(100, 100, 255, 0.5)', borderRadius: '50%', marginRight: '5px' }} />
            Particles ({numParticles})
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticleFilterExample; 