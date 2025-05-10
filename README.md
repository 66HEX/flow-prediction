# Flow: Smart Link Preloading for React

React library for predicting cursor movement and preloading links using Particle filter.

## Project Status

🚧 **Under Development** 🚧

This library is currently in active development and not ready for production use.

## 1. Introduction

Flow is a modern React library that uses particle filter algorithms to predict cursor movement and preload links before users hover over them. This creates a faster, more responsive browsing experience by anticipating user interactions and preparing content in advance.

### Key Features

- **Cursor Movement Prediction** - Uses a particle filter algorithm to predict future cursor positions
- **Element Intersection Detection** - Identifies interactive elements (links) on the predicted cursor path 
- **Smart Preloading** - Preloads content based on predicted user interactions
- **Configurable Parameters** - Fine-tune prediction accuracy, preloading thresholds, performance impact
- **React Integration** - Easy to integrate with React applications via hooks and components
- **Visualization Tools** - Debug and demonstrate prediction with built-in visualization components

## 2. Installation

```bash
npm install flow-prediction
# or
yarn add flow-prediction
```

## 3. Core Concepts

### Particle Filter

The library uses a particle filter algorithm to track and predict cursor movement. This statistical method maintains multiple "particles" that represent possible future cursor positions, updating their weights based on observed movements and resampling to focus on the most likely paths.

### Cursor Prediction

Based on the historical cursor movement data, the library predicts where the cursor will be in the near future (configurable prediction horizon). Unlike simple linear extrapolation, the particle filter can handle non-linear movements and sudden changes in direction.

### Element Detection

The library continuously checks which DOM elements (particularly links) intersect with the predicted cursor path. It calculates a probability score for each element based on:
- How directly the element is in the predicted path
- How soon the cursor is expected to reach the element
- The size of the element

### Preloading Strategy

Elements with probability scores above a configurable threshold trigger content preloading. The library manages:
- Priority-based preloading queue 
- Concurrent request limits
- Preload caching for performance
- Cache invalidation strategies

## 4. API Reference

### Hooks

#### `useMouseTracker(options)`

Tracks mouse cursor position and provides position history.

```tsx
const {
  position,         // Current position {x, y, timestamp}
  history,          // Array of recent positions
  isTracking,       // Boolean tracking state
  startTracking,    // Function to start tracking
  stopTracking      // Function to stop tracking
} = useMouseTracker({
  sampleRate: 50,         // Sample every 50ms
  maxHistoryLength: 20    // Keep last 20 positions
});
```

#### `useCursorPredictor(options)`

Tracks cursor and predicts future positions using a particle filter.

```tsx
const {
  position,           // Current position
  predictedPosition,  // Predicted future position
  history,            // Position history
  isTracking,         // Boolean tracking state
  startTracking,      // Function to start tracking
  stopTracking,       // Function to stop tracking
  getParticles,       // Get raw particles for visualization
  reset               // Reset predictor state
} = useCursorPredictor({
  sampleRate: 50,             // Sample rate (ms)
  maxHistoryLength: 20,       // History length
  predictionHorizon: 500,     // Predict 500ms ahead
  numParticles: 100,          // Number of particles
  processNoise: 5,            // Process noise
  measurementNoise: 2,        // Measurement noise
  directionBias: 1.5          // Direction bias
});
```

#### `usePreloadOnPrediction(options)`

Main hook that combines prediction with link detection and preloading.

```tsx
const {
  preloadedResources,   // Array of preloaded resources
  clearCache,           // Function to clear preload cache
  cursorPosition,       // Current cursor position
  predictedPosition,    // Predicted cursor position
  potentialTargets      // Elements that might be reached
} = usePreloadOnPrediction({
  // Prediction options
  sampleRate: 50,             // Sample rate (ms)
  predictionHorizon: 500,     // Predict 500ms ahead
  numParticles: 100,          // Number of particles
  processNoise: 5,            // Process noise
  
  // Preloading options
  minProbability: 0.6,        // Minimum probability for preloading
  maxConcurrentPreloads: 3,   // Maximum concurrent preloads
  cacheSize: 10,              // Preload cache size
  checkFrequency: 100         // Check interval (ms)
});
```

#### `useRegisterPreloadTarget(options)`

Hook for registering DOM elements as preload targets.

```tsx
const {
  ref,          // Ref callback to attach to element
  preload,      // Function to manually trigger preload
  isPreloading, // Whether preloading is in progress
  isPreloaded,  // Whether preload is complete
  hasError      // Whether preload encountered an error
} = useRegisterPreloadTarget({
  url: '/page-to-preload',  // URL to preload
  priority: 5,              // Priority (1-10)
  autoRegister: true,       // Auto-register with context
  customFetch: myFetchFn    // Custom fetch implementation
});
```

### Components

#### `PreloadableLink`

A link component with built-in preloading capabilities.

```tsx
<PreloadableLink
  href="/path"               // Target URL
  priority={5}               // Preload priority (1-10)
  customFetch={myFetchFn}    // Custom fetch function
  preload={true}             // Enable/disable preloading
  loadingIndicator={<Spinner/>} // Visual indicator during preload
  preloadedClassName="loaded"   // Class when preloaded
  preloadingClassName="loading" // Class when preloading 
  errorClassName="error"        // Class on error
>
  Link Text
</PreloadableLink>
```

#### `PredictionDemo`

Visualization component for debugging and demonstration.

```tsx
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
```

### Context

#### `PreloadProvider`

Provider that creates a preloading context for the application.

```tsx
<PreloadProvider options={{
  predictionHorizon: 500,
  numParticles: 100,
  processNoise: 5,
  minProbability: 0.6,
  maxConcurrentPreloads: 3
}}>
  <App />
</PreloadProvider>
```

### Utility Classes

#### `ParticleFilter`

Core implementation of the particle filter algorithm.

```tsx
const filter = new ParticleFilter({
  numParticles: 100,        // Number of particles
  processNoise: 5,          // Process noise parameter
  measurementNoise: 2,      // Measurement noise parameter
  initialState: {           // Initial state (optional)
    x: 0, y: 0, vx: 0, vy: 0
  },
  resampleThreshold: 0.5,   // Resample threshold
  directionBias: 1.5        // Direction bias
});

// Update with new measurement
filter.update({ x: 100, y: 100, timestamp: Date.now() });

// Predict future position
const prediction = filter.predict(500); // 500ms ahead

// Get current state estimate
const state = filter.getState();

// Get particles for visualization
const particles = filter.getParticles();
```

## 5. Advanced Usage

### Custom Preloading Logic

You can implement custom preloading logic by providing a `customFetch` function:

```tsx
<PreloadableLink
  href="/api/data"
  customFetch={async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    store.preloadData(data);  // Store in your state management
    return data;
  }}
>
  Load Data
</PreloadableLink>
```

### Dynamic Priority Adjustment

Adjust preload priorities based on application state:

```tsx
const MyNavigation = () => {
  const { currentSection } = useAppContext();
  
  return (
    <nav>
      {navItems.map(item => (
        <PreloadableLink
          key={item.path}
          href={item.path}
          // Higher priority for items related to current section
          priority={item.section === currentSection ? 10 : 5}
        >
          {item.label}
        </PreloadableLink>
      ))}
    </nav>
  );
};
```

### Integration with Routing Libraries

#### Next.js

```tsx
import { useRouter } from 'next/router';
import { PreloadableLink } from 'flow-prediction';

const NextLink = ({ href, children, ...props }) => {
  const router = useRouter();
  
  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };
  
  return (
    <PreloadableLink 
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
    </PreloadableLink>
  );
};
```

#### React Router

```tsx
import { useNavigate } from 'react-router-dom';
import { PreloadableLink } from 'flow-prediction';

const RouterLink = ({ to, children, ...props }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };
  
  return (
    <PreloadableLink 
      href={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </PreloadableLink>
  );
};
```

## 6. Performance Optimization

### Tuning Prediction Parameters

- **numParticles**: Higher values increase accuracy but impact performance
- **processNoise**: Higher values allow quicker adaptation to direction changes
- **sampleRate**: Balance between responsiveness and performance
- **checkFrequency**: How often to check for element intersections

### Memory Management

- **maxHistoryLength**: Limit cursor position history size
- **cacheSize**: Control preload cache size
- Use `clearCache()` to manually free memory when needed

### Reducing CPU Impact

- Disable tracking when unnecessary:
```tsx
const { startTracking, stopTracking } = useCursorPredictor();

// Disable during heavy animations
useEffect(() => {
  if (isAnimating) {
    stopTracking();
  } else {
    startTracking();
  }
}, [isAnimating, startTracking, stopTracking]);
```

### Mobile Optimization

On mobile devices, consider:

1. Disabling prediction entirely
2. Reducing `numParticles` significantly 
3. Increasing `processNoise` to make predictions more responsive to touch movements

```tsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

<PreloadProvider options={{
  numParticles: isMobile ? 20 : 100,
  processNoise: isMobile ? 10 : 5,
  sampleRate: isMobile ? 100 : 50
}}>
```

## 7. Examples

### Basic Usage

```tsx
// App.tsx
import { PreloadProvider, PreloadableLink } from 'flow-prediction';

function App() {
  return (
    <PreloadProvider>
      <nav>
        <PreloadableLink href="/home">Home</PreloadableLink>
        <PreloadableLink href="/about">About</PreloadableLink>
        <PreloadableLink href="/contact">Contact</PreloadableLink>
      </nav>
      {/* Rest of your app */}
    </PreloadProvider>
  );
}
```

### Prediction Visualization

```tsx
import { PredictionDemo } from 'flow-prediction';

function Demo() {
  return (
    <div>
      <h1>Cursor Prediction Demo</h1>
      <PredictionDemo 
        width={800} 
        height={400}
        options={{
          predictionHorizon: 500,
          numParticles: 200,
          processNoise: 5
        }}
        showParticles={true}
      />
    </div>
  );
}
```

## 8. Troubleshooting

### Common Issues

#### Prediction Not Working

- Ensure you have wrapped your application with `PreloadProvider`
- Check if cursor tracking is active (`isTracking` should be true)
- Try increasing `processNoise` for more responsive predictions
- Decrease `sampleRate` for more frequent updates

#### Links Not Preloading

- Verify `minProbability` isn't set too high (try 0.3-0.5)
- Check browser console for CORS or other fetch errors
- Ensure links have proper `href` attributes
- Make sure links are visible and in the viewport

#### High CPU Usage

- Reduce `numParticles` (try 50-100)
- Increase `sampleRate` and `checkFrequency`
- Disable prediction during animations or when not needed
- Consider using `React.memo` for components with frequent re-renders

### Debug Logging

Enable debug mode for detailed logging:

```tsx
<PreloadProvider 
  options={{ 
    debug: true  // Enable debug logging
  }}
>
```

## 9. Browser Compatibility

Flow is compatible with all modern browsers that support:
- Fetch API
- ES6 features
- DOM intersection calculations

For IE11 support, polyfills for Map, Promise, and fetch are required.

## 10. License

MIT 