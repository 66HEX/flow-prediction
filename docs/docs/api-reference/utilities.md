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