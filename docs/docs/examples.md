---
layout: default
title: Examples
nav_order: 6
---

# Examples

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Basic Usage

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

## Prediction Visualization

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