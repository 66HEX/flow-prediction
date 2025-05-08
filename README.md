# Flow

React library for predicting cursor movement and preloading links using Kalman filter.

## Project Status

🚧 **Under Development** 🚧

This library is currently in active development and not ready for production use.

## Features (Planned)

- Mouse cursor tracking and movement history
- Cursor movement prediction using Kalman filter
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

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```

## License

MIT 