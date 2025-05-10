---
layout: default
title: Utility Classes
parent: API Reference
nav_order: 3
---

# Utility Classes

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## ParticleFilter

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
  directionBias: 1.5,       // Direction bias
  useAdaptiveNoise: true,   // Enable adaptive noise parameters
  maxHistorySize: 10,       // Number of measurements to keep for adaptive noise
  minProcessNoise: 1,       // Minimum process noise value
  maxProcessNoise: 15       // Maximum process noise value
});

// Update with new measurement
filter.update({ x: 100, y: 100, timestamp: Date.now() });

// Predict future position
const prediction = filter.predict(500); // 500ms ahead

// Get current state estimate
const state = filter.getState();

// Get current noise parameters
const noiseParams = filter.getNoiseParameters();

// Get particles for visualization
const particles = filter.getParticles();
```

### API Reference

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `numParticles` | `number` | `100` | Number of particles to use |
| `processNoise` | `number` | `5` | Process noise (model uncertainty) |
| `measurementNoise` | `number` | `2` | Measurement noise (sensor uncertainty) |
| `initialState` | `object` | `{x:0,y:0,vx:0,vy:0}` | Initial position and velocity |
| `resampleThreshold` | `number` | `0.5` | Percentage of effective particles required before resampling |
| `directionBias` | `number` | `1.5` | How strongly to bias toward current movement direction |
| `useAdaptiveNoise` | `boolean` | `false` | Whether to use adaptive noise parameters |
| `maxHistorySize` | `number` | `10` | Maximum measurements to keep for adaptive noise calculation |
| `minProcessNoise` | `number` | `1` | Minimum process noise value |
| `maxProcessNoise` | `number` | `15` | Maximum process noise value |

#### Methods

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `update` | `{x, y, timestamp?}` | `void` | Update with new measurement |
| `predict` | `timeAhead: number` | `{x, y}` | Predict position after timeAhead ms |
| `getState` | - | `{x, y, vx, vy}` | Get current state estimate |
| `getParticles` | - | `Array<{x, y, weight}>` | Get particles for visualization |
| `getNoiseParameters` | - | `{processNoise, measurementNoise}` | Get current noise parameters |
| `reset` | `state?: {x, y, vx?, vy?}` | `void` | Reset filter to given state or defaults |

## Quadtree

Spatial indexing data structure for efficient element intersection detection.

```tsx
// Create a quadtree for viewport bounds
const quadtree = new Quadtree({
  x: 0,
  y: 0,
  width: window.innerWidth,
  height: window.innerHeight
}, 
  4,    // Capacity (max items per node)
  5     // Maximum depth
);

// Insert DOM elements
document.querySelectorAll('a[href]').forEach(element => {
  quadtree.insert(element);
});

// Find elements that might intersect with a line
const elementsOnPath = quadtree.queryLine(
  { x: 100, y: 100 },    // Start point
  { x: 300, y: 200 }     // End point (prediction)
);

// Clear the quadtree when needed
quadtree.clear();
```