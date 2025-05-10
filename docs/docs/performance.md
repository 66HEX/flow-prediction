---
layout: default
title: Performance Optimization
nav_order: 6
---

# Performance Optimization

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Tuning Prediction Parameters

- **numParticles**: Higher values increase accuracy but impact performance
- **processNoise**: Higher values allow quicker adaptation to direction changes
- **sampleRate**: Balance between responsiveness and performance
- **checkFrequency**: How often to check for element intersections

## Adaptive Noise Parameters

When using adaptive noise, consider these performance-related settings:

- **useAdaptiveNoise**: Set to `false` for maximum performance in constrained environments
- **maxHistorySize**: Lower values (5-10) reduce memory and computation overhead
- **minProcessNoise** and **maxProcessNoise**: Setting a narrower range reduces adaptation calculations

Example optimization for performance-sensitive applications:

```tsx
const { predictedPosition } = useCursorPredictor({
  // Optimize for performance
  useAdaptiveNoise: true,
  maxHistorySize: 5,       // Reduced history size
  minProcessNoise: 2,      // Higher minimum for better stability
  maxProcessNoise: 10      // Lower maximum to reduce processing
});
```

## Memory Management

- **maxHistoryLength**: Limit cursor position history size
- **cacheSize**: Control preload cache size
- Use `clearCache()` to manually free memory when needed

## Reducing CPU Impact

Disable tracking when unnecessary:

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

## Mobile Optimization

On mobile devices, consider:

1. Disabling prediction entirely
2. Reducing `numParticles` significantly 
3. Increasing `processNoise` to make predictions more responsive to touch movements
4. Using adaptive noise with a smaller history size and narrower bounds

{% raw %}```tsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

<PreloadProvider options={{
  numParticles: isMobile ? 20 : 100,
  useAdaptiveNoise: true,
  maxHistorySize: isMobile ? 5 : 10,
  minProcessNoise: isMobile ? 3 : 1,
  maxProcessNoise: isMobile ? 8 : 15,
  sampleRate: isMobile ? 100 : 50
}}>
```{% endraw %}