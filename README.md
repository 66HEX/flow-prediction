# Flow

React library for predicting cursor movement and preloading links using Particle filter.

## Project Status

🚧 **Under Development** 🚧

This library is currently in active development and not ready for production use.

## Features (Planned)

- Mouse cursor tracking and movement history
- Detection of DOM elements on predicted path
- Preloading of links based on predicted navigation
- Configurable parameters for fine-tuning
- Integration with popular routing libraries

## Installation

```bash
npm install flow-cursor-predict
# or
yarn add flow-cursor-predict
```

## Basic Usage (Preview)

```jsx
import { usePreloadOnPrediction } from 'flow-cursor-predict';

function App() {
  // Configure the cursor prediction and preloading
  usePreloadOnPrediction({
    horizonTime: 500, // predict 500ms into the future
    sampleRate: 50,   // sample cursor position every 50ms
    numParticles: 100, // number of particles for the filter
    minProbability: 0.6 // preload when probability is above 60%
  });
  
  return (
    <div className="app">
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      
      {/* Rest of your app */}
    </div>
  );
}
```

## Cursor Prediction Visualization

You can visualize the cursor prediction using the included `PredictionDemo` component:

```jsx
import { PredictionDemo } from 'flow-cursor-predict';

function Demo() {
  return (
    <PredictionDemo 
      width={800} 
      height={400} 
      options={{
        numParticles: 100,
        predictionHorizon: 500,
        processNoise: 5,
        directionBias: 1.5
      }}
      showParticles={true}
    />
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run examples
npm run examples
```

## License

MIT 