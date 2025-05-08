import React from 'react';
import { useMouseTracker } from '../src/hooks/useMouseTracker';

const MouseTrackerExample: React.FC = () => {
  const { position, history, isTracking, startTracking, stopTracking } = useMouseTracker({
    sampleRate: 50, // Sample rate 50ms
    maxHistoryLength: 10, // Store last 10 positions
  });
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mouse Tracker Example</h1>
      
      <div>
        <button onClick={startTracking} disabled={isTracking}>
          Start Tracking
        </button>
        <button onClick={stopTracking} disabled={!isTracking} style={{ marginLeft: '10px' }}>
          Stop Tracking
        </button>
      </div>
      
      <h2>Current Position:</h2>
      <p>
        X: {position?.x ?? 'N/A'}, Y: {position?.y ?? 'N/A'}
      </p>
      
      <h2>Position History:</h2>
      <ul>
        {history.map((pos, index) => (
          <li key={index}>
            X: {pos.x}, Y: {pos.y}, Time: {new Date(pos.timestamp).toISOString()}
          </li>
        ))}
      </ul>
      
      <h2>Visualization:</h2>
      <div 
        style={{ 
          position: 'relative', 
          width: '400px', 
          height: '400px', 
          border: '1px solid #ccc',
          marginTop: '20px'
        }}
      >
        {/* Render current position */}
        {position && (
          <div
            style={{
              position: 'absolute',
              left: `${position.x % 400}px`,
              top: `${position.y % 400}px`,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'red',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Render history */}
        {history.map((pos, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${pos.x % 400}px`,
              top: `${pos.y % 400}px`,
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: `rgba(0, 0, 255, ${0.3 + (index / history.length) * 0.7})`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MouseTrackerExample; 