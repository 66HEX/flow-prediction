---
layout: home
title: Home
nav_order: 1
description: "Flow - React library for predicting cursor movement and preloading links using Particle filter."
---

# Flow: React Cursor Prediction Library
{: .fs-9 }

React library for predicting cursor movement and preloading links using Particle filter.
{: .fs-6 .fw-300 }

[Get started](#quick-start){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View it on GitHub](https://github.com/66HEX/flow-prediction){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## Introduction

Flow is a modern React library that uses particle filter algorithms to predict cursor movement and preload links before users hover over them. This creates a faster, more responsive browsing experience by anticipating user interactions and preparing content in advance.

### Key Features

- **Cursor Movement Prediction** - Uses a particle filter algorithm to predict future cursor positions
- **Element Intersection Detection** - Identifies interactive elements (links) on the predicted cursor path 
- **Smart Preloading** - Preloads content based on predicted user interactions
- **Configurable Parameters** - Fine-tune prediction accuracy, preloading thresholds, performance impact
- **React Integration** - Easy to integrate with React applications via hooks and components
- **Visualization Tools** - Debug and demonstrate prediction with built-in visualization components

## Quick Start

### Installation

```bash
npm install flow-prediction
# or
yarn add flow-prediction
```

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