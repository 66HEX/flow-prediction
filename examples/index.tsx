import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import MouseTrackerExample from './MouseTrackerExample';
import ParticleFilterExample from './ParticleFilterExample';
import PathIntersectionExample from './PathIntersectionExample';
import PreloadableLinkExample from './PreloadableLinkExample';
import PredictionDemoExample from './PredictionDemoExample';

const ExampleSelector: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<
    'mouse-tracker' | 'particle-filter' | 'path-intersection' | 'preloadable-link' | 'prediction-demo'
  >('preloadable-link');
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Flow Library Examples</h2>
        <div>
          <button 
            onClick={() => setSelectedExample('mouse-tracker')}
            style={{ 
              marginRight: '10px', 
              fontWeight: selectedExample === 'mouse-tracker' ? 'bold' : 'normal',
              backgroundColor: selectedExample === 'mouse-tracker' ? '#e0e0e0' : ''
            }}
          >
            Mouse Tracker
          </button>
          <button 
            onClick={() => setSelectedExample('particle-filter')}
            style={{ 
              marginRight: '10px',
              fontWeight: selectedExample === 'particle-filter' ? 'bold' : 'normal',
              backgroundColor: selectedExample === 'particle-filter' ? '#e0e0e0' : ''
            }}
          >
            Particle Filter Prediction
          </button>
          <button 
            onClick={() => setSelectedExample('path-intersection')}
            style={{ 
              marginRight: '10px',
              fontWeight: selectedExample === 'path-intersection' ? 'bold' : 'normal',
              backgroundColor: selectedExample === 'path-intersection' ? '#e0e0e0' : ''
            }}
          >
            Path Intersection Detection
          </button>
          <button 
            onClick={() => setSelectedExample('preloadable-link')}
            style={{ 
              marginRight: '10px',
              fontWeight: selectedExample === 'preloadable-link' ? 'bold' : 'normal',
              backgroundColor: selectedExample === 'preloadable-link' ? '#e0e0e0' : ''
            }}
          >
            Preloadable Link
          </button>
          <button 
            onClick={() => setSelectedExample('prediction-demo')}
            style={{ 
              fontWeight: selectedExample === 'prediction-demo' ? 'bold' : 'normal',
              backgroundColor: selectedExample === 'prediction-demo' ? '#e0e0e0' : ''
            }}
          >
            Prediction Demo
          </button>
        </div>
      </div>
      
      <div>
        {selectedExample === 'mouse-tracker' && <MouseTrackerExample />}
        {selectedExample === 'particle-filter' && <ParticleFilterExample />}
        {selectedExample === 'path-intersection' && <PathIntersectionExample />}
        {selectedExample === 'preloadable-link' && <PreloadableLinkExample />}
        {selectedExample === 'prediction-demo' && <PredictionDemoExample />}
      </div>
    </div>
  );
};

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<ExampleSelector />);
} 