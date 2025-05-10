---
layout: default
title: Components
parent: API Reference
nav_order: 2
---

# Components

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## PreloadableLink

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

## PredictionDemo

Visualization component for debugging and demonstration.

{% raw %}```tsx
<PredictionDemo
  width={800}
  height={400}
  options={{
    numParticles: 100,
    predictionHorizon: 500,
    processNoise: 5,
    directionBias: 1.5,
    useAdaptiveNoise: true,
    maxHistorySize: 10,
    minProcessNoise: 1,
    maxProcessNoise: 15
  }}
  showParticles={true}
  showTrail={true}
  showNoiseParams={true}
  maxTrailLength={20}
/>
```{% endraw %}

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `800` | Width of the canvas |
| `height` | `number` | `400` | Height of the canvas |
| `options` | `PredictionDemoOptions` | See below | Options for the prediction algorithm |
| `showParticles` | `boolean` | `true` | Whether to show individual particles |
| `showTrail` | `boolean` | `true` | Whether to show the cursor trail |
| `showNoiseParams` | `boolean` | `false` | Whether to show current noise parameters |
| `maxTrailLength` | `number` | `20` | Maximum number of trail points to show |
| `className` | `string` | `''` | Custom CSS class name |

### PredictionDemoOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `numParticles` | `number` | `100` | Number of particles to use in the filter |
| `predictionHorizon` | `number` | `500` | How far ahead to predict cursor movement (ms) |
| `processNoise` | `number` | `5` | Process noise parameter |
| `directionBias` | `number` | `1.5` | How strongly to bias toward the current direction |
| `measurementNoise` | `number` | `2` | Measurement noise parameter |
| `useAdaptiveNoise` | `boolean` | `false` | Whether to use adaptive noise parameters |
| `maxHistorySize` | `number` | `10` | Maximum measurements to keep for adaptive noise |
| `minProcessNoise` | `number` | `1` | Minimum process noise value |
| `maxProcessNoise` | `number` | `15` | Maximum process noise value |

## PreloadProvider

Provider that creates a preloading context for the application.

{% raw %}```tsx
<PreloadProvider options={{
  predictionHorizon: 500,
  numParticles: 100,
  processNoise: 5,
  minProbability: 0.6,
  maxConcurrentPreloads: 3
}}>
  <App />
</PreloadProvider>
```{% endraw %}

### PreloadProvider Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `predictionHorizon` | `number` | `500` | How far ahead to predict cursor movement (ms) |
| `numParticles` | `number` | `100` | Number of particles to use in the filter |
| `processNoise` | `number` | `5` | Process noise parameter |
| `measurementNoise` | `number` | `2` | Measurement noise parameter |
| `directionBias` | `number` | `1.5` | How strongly to bias toward the current direction |
| `useAdaptiveNoise` | `boolean` | `false` | Whether to use adaptive noise parameters |
| `maxHistorySize` | `number` | `10` | Maximum measurements to keep for adaptive noise |
| `minProcessNoise` | `number` | `1` | Minimum process noise value |
| `maxProcessNoise` | `number` | `15` | Maximum process noise value |
| `minProbability` | `number` | `0.6` | Minimum probability for preloading |
| `maxConcurrentPreloads` | `number` | `3` | Maximum concurrent preloads |
| `cacheSize` | `number` | `10` | Preload cache size |
| `checkFrequency` | `number` | `100` | How often to check for element intersections (ms) |
| `sampleRate` | `number` | `50` | Sampling rate in milliseconds |