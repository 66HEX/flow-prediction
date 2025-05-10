---
layout: default
title: Hooks
parent: API Reference
nav_order: 1
---

# Hooks

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## useMouseTracker

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

## useCursorPredictor

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

## usePreloadOnPrediction

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

## useRegisterPreloadTarget

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