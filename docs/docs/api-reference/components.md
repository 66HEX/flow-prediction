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

## PreloadProvider

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