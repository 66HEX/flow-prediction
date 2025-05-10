---
layout: default
title: Troubleshooting
nav_order: 7
---

# Troubleshooting

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Common Issues

### Prediction Not Working

- Ensure you have wrapped your application with `PreloadProvider`
- Check if cursor tracking is active (`isTracking` should be true)
- Try increasing `processNoise` for more responsive predictions
- Decrease `sampleRate` for more frequent updates

### Links Not Preloading

- Verify `minProbability` isn't set too high (try 0.3-0.5)
- Check browser console for CORS or other fetch errors
- Ensure links have proper `href` attributes
- Make sure links are visible and in the viewport

### High CPU Usage

- Reduce `numParticles` (try 50-100)
- Increase `sampleRate` and `checkFrequency`
- Disable prediction during animations or when not needed
- Consider using `React.memo` for components with frequent re-renders

## Debug Logging

Enable debug mode for detailed logging:

```tsx
<PreloadProvider 
  options={{ 
    debug: true  // Enable debug logging
  }}
>
```

## Browser Compatibility

Flow is compatible with all modern browsers that support:
- Fetch API
- ES6 features
- DOM intersection calculations

For IE11 support, polyfills for Map, Promise, and fetch are required.