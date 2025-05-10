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
  getNoiseParameters, // Get current noise parameters
  reset               // Reset predictor state
} = useCursorPredictor({
  sampleRate: 50,             // Sample rate (ms)
  maxHistoryLength: 20,       // History length
  predictionHorizon: 500,     // Predict 500ms ahead
  numParticles: 100,          // Number of particles
  processNoise: 5,            // Process noise
  measurementNoise: 2,        // Measurement noise
  directionBias: 1.5,         // Direction bias
  useAdaptiveNoise: true,     // Enable adaptive noise parameters
  maxHistorySize: 10,         // History size for adaptive noise
  minProcessNoise: 1,         // Minimum process noise value
  maxProcessNoise: 15         // Maximum process noise value
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sampleRate` | `number` | `50` | Sampling rate in milliseconds |
| `maxHistoryLength` | `number` | `20` | Maximum number of history points to keep |
| `predictionHorizon` | `number` | `500` | How far ahead to predict cursor movement (ms) |
| `numParticles` | `number` | `100` | Number of particles to use in the filter |
| `processNoise` | `number` | `5` | Process noise parameter |
| `measurementNoise` | `number` | `2` | Measurement noise parameter |
| `directionBias` | `number` | `1.5` | How strongly to bias toward the current direction |
| `useAdaptiveNoise` | `boolean` | `false` | Whether to use adaptive noise parameters |
| `maxHistorySize` | `number` | `10` | Maximum measurements to keep for adaptive noise |
| `minProcessNoise` | `number` | `1` | Minimum process noise value |
| `maxProcessNoise` | `number` | `15` | Maximum process noise value |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `position` | `{x, y, timestamp}` | Current cursor position |
| `predictedPosition` | `{x, y}` | Predicted future position |
| `history` | `Array<{x, y, timestamp}>` | History of cursor positions |
| `isTracking` | `boolean` | Whether tracking is active |
| `startTracking` | `() => void` | Start tracking cursor movement |
| `stopTracking` | `() => void` | Stop tracking cursor movement |
| `getParticles` | `() => Array<{x, y, weight}>` | Get the raw particles for visualization |
| `getNoiseParameters` | `() => {processNoise, measurementNoise}` | Get current noise parameters |
| `reset` | `() => void` | Reset the predictor |

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

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | Required | URL to preload |
| `priority` | `number` | `5` | Priority (1-10, with 10 being highest) |
| `autoRegister` | `boolean` | `true` | Whether to auto-register with preload context |
| `customFetch` | `(url: string) => Promise<any>` | `undefined` | Custom fetch implementation |
| `prefetchMethod` | `'link'` \| `'xhr'` | `'xhr'` | Method to use for prefetching |
| `threshold` | `number` | `0.6` | Probability threshold for auto-preloading |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `ref` | `Ref<HTMLElement>` | Ref callback to attach to DOM element |
| `preload` | `() => Promise<any>` | Function to manually trigger preload |
| `isPreloading` | `boolean` | Whether preloading is in progress |
| `isPreloaded` | `boolean` | Whether preload is complete |
| `hasError` | `boolean` | Whether preload encountered an error |
| `error` | `Error \| null` | Error object if preload failed |
| `reset` | `() => void` | Function to reset preload state |