import React, { useState } from 'react';
import { PredictionDemo } from '../src/components/PredictionDemo';

/**
 * Component demonstrating PredictionDemo with different configurations
 */
const PredictionDemoExample: React.FC = () => {
  // Configuration state
  const [numParticles, setNumParticles] = useState(100);
  const [predictionHorizon, setPredictionHorizon] = useState(500);
  const [processNoise, setProcessNoise] = useState(5);
  const [directionBias, setDirectionBias] = useState(1.5);
  const [showParticles, setShowParticles] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Cursor Prediction Demo</h1>
      
      <p>
        This example demonstrates the PredictionDemo component, which visualizes
        the cursor prediction capabilities of the Flow library. Move your cursor
        over the demo area to see the prediction in action.
      </p>
      
      {/* Controls for configuring the demo */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Configuration</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', maxWidth: '800px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Prediction Horizon (ms):
              <input 
                type="range" 
                min="100" 
                max="1000" 
                step="100" 
                value={predictionHorizon}
                onChange={(e) => setPredictionHorizon(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>100ms</span>
                <span>{predictionHorizon}ms</span>
                <span>1000ms</span>
              </div>
            </label>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Number of Particles:
              <input 
                type="range" 
                min="20" 
                max="500" 
                step="20" 
                value={numParticles}
                onChange={(e) => setNumParticles(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>20</span>
                <span>{numParticles}</span>
                <span>500</span>
              </div>
            </label>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Process Noise:
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="1" 
                value={processNoise}
                onChange={(e) => setProcessNoise(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1</span>
                <span>{processNoise}</span>
                <span>20</span>
              </div>
            </label>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Direction Bias:
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={directionBias}
                onChange={(e) => setDirectionBias(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>0.5</span>
                <span>{directionBias}</span>
                <span>3.0</span>
              </div>
            </label>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={showParticles} 
              onChange={() => setShowParticles(!showParticles)} 
            />
            Show Particles
          </label>
          
          <label>
            <input 
              type="checkbox" 
              checked={showTrail} 
              onChange={() => setShowTrail(!showTrail)} 
            />
            Show Cursor Trail
          </label>
        </div>
      </div>
      
      {/* Prediction Demo Component */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Demo</h2>
        <PredictionDemo 
          width={800}
          height={400}
          options={{
            numParticles,
            predictionHorizon,
            processNoise,
            directionBias
          }}
          showParticles={showParticles}
          showTrail={showTrail}
          className="prediction-demo"
        />
      </div>
      
      {/* Explanation of parameters */}
      <div style={{ marginTop: '40px' }}>
        <h2>Parameter Explanation</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', maxWidth: '800px' }}>
          <div><strong>Prediction Horizon</strong></div>
          <div>How far ahead in time (milliseconds) to predict cursor position.</div>
          
          <div><strong>Number of Particles</strong></div>
          <div>More particles give more accurate predictions but require more processing power.</div>
          
          <div><strong>Process Noise</strong></div>
          <div>Higher values make the filter adapt faster to changes in direction but can cause less stable predictions.</div>
          
          <div><strong>Direction Bias</strong></div>
          <div>How strongly the prediction favors the current direction of movement.</div>
          
          <div><strong>Show Particles</strong></div>
          <div>Displays the individual particles used in the prediction algorithm.</div>
          
          <div><strong>Show Cursor Trail</strong></div>
          <div>Displays the recent history of cursor positions.</div>
        </div>
      </div>
      
      {/* How It Works section */}
      <div style={{ marginTop: '40px' }}>
        <h2>How It Works</h2>
        
        <p>
          The prediction uses a <strong>Particle Filter</strong> algorithm that:
        </p>
        
        <ol>
          <li>Tracks cursor position and velocity over time</li>
          <li>Maintains a set of "particles" representing possible future states</li>
          <li>Assigns weights to particles based on how well they match observed movement</li>
          <li>Resamples particles to focus computation on more likely paths</li>
          <li>Provides a weighted average as the final prediction</li>
        </ol>
        
        <p>
          This approach performs better than simple linear prediction, especially for non-linear movements
          and sudden changes in direction.
        </p>
      </div>
    </div>
  );
};

export default PredictionDemoExample; 