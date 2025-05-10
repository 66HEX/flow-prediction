---
layout: default
title: Core Concepts
nav_order: 2
---

# Core Concepts

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Particle Filter

The library uses a particle filter algorithm to track and predict cursor movement. This statistical method maintains multiple "particles" that represent possible future cursor positions, updating their weights based on observed movements and resampling to focus on the most likely paths.

## Cursor Prediction

Based on the historical cursor movement data, the library predicts where the cursor will be in the near future (configurable prediction horizon). Unlike simple linear extrapolation, the particle filter can handle non-linear movements and sudden changes in direction.

## Element Detection

The library continuously checks which DOM elements (particularly links) intersect with the predicted cursor path. It calculates a probability score for each element based on:
- How directly the element is in the predicted path
- How soon the cursor is expected to reach the element
- The size of the element

## Preloading Strategy

Elements with probability scores above a configurable threshold trigger content preloading. The library manages:
- Priority-based preloading queue 
- Concurrent request limits
- Preload caching for performance
- Cache invalidation strategies