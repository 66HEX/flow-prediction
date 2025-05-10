---
layout: default
title: Performance Optimization
nav_order: 5
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

```tsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

<PreloadProvider options={{
  numParticles: isMobile ? 20 : 100,
  processNoise: isMobile ? 10 : 5,
  sampleRate: isMobile ? 100 : 50
}}>
```