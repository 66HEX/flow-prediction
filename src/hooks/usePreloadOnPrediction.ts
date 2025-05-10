import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCursorPredictor, CursorPredictorOptions } from './useCursorPredictor';
import { Quadtree } from '../utils/Quadtree';

/**
 * Options for the usePreloadOnPrediction hook
 */
export interface PreloadOptions extends CursorPredictorOptions {
  /** Minimum probability threshold for preloading (0-1) */
  minProbability?: number;
  /** Maximum number of concurrent preloads */
  maxConcurrentPreloads?: number;
  /** Cache size for preloaded resources */
  cacheSize?: number;
  /** Check frequency for element detection (ms) */
  checkFrequency?: number;
}

/**
 * Status of a preloaded link
 */
export interface PreloadStatus {
  /** URL being preloaded */
  url: string;
  /** Status of the preload operation */
  status: 'loading' | 'complete' | 'error';
  /** Estimated time until the cursor might reach this element (ms) */
  estimatedTimeToReach?: number;
  /** Probability of the cursor reaching this element (0-1) */
  probability?: number;
}

/**
 * Result returned by the usePreloadOnPrediction hook
 */
export interface PreloadResult {
  /** Currently preloaded resources */
  preloadedResources: PreloadStatus[];
  /** Clear the preload cache */
  clearCache: () => void;
  /** Current cursor position */
  cursorPosition: { x: number; y: number } | null;
  /** Predicted cursor position */
  predictedPosition: { x: number; y: number } | null;
  /** Elements that might be reached by the cursor */
  potentialTargets: Array<{ element: HTMLElement, probability: number, timeToReach: number }>;
}

/**
 * Calculate the probability of cursor hitting an element based on distance and trajectory
 * @param element DOM element to check
 * @param currentPosition Current cursor position
 * @param predictedPosition Predicted cursor position
 * @returns Probability and estimated time to reach
 */
const calculateHitProbability = (
  element: HTMLElement,
  currentPosition: { x: number; y: number },
  predictedPosition: { x: number; y: number },
  horizonTime: number
): { probability: number; timeToReach: number } => {
  const rect = element.getBoundingClientRect();
  
  // Calculate element center
  const elementCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  
  // Vector from current to predicted position
  const movementVector = {
    x: predictedPosition.x - currentPosition.x,
    y: predictedPosition.y - currentPosition.y
  };
  
  // Vector from current position to element
  const toElementVector = {
    x: elementCenter.x - currentPosition.x,
    y: elementCenter.y - currentPosition.y
  };
  
  // Calculate distance from current to predicted position
  const movementDistance = Math.sqrt(
    movementVector.x * movementVector.x + movementVector.y * movementVector.y
  );
  
  // Early exit if there's no movement
  if (movementDistance < 0.001) {
    return { probability: 0, timeToReach: Infinity };
  }
  
  // Normalize movement vector
  const normalizedMovement = {
    x: movementVector.x / movementDistance,
    y: movementVector.y / movementDistance
  };
  
  // Calculate distance from current position to element center
  const elementDistance = Math.sqrt(
    toElementVector.x * toElementVector.x + toElementVector.y * toElementVector.y
  );
  
  // Calculate dot product (projection of toElementVector onto normalizedMovement)
  const dotProduct = toElementVector.x * normalizedMovement.x + toElementVector.y * normalizedMovement.y;
  
  // Calculate closest approach distance (perpendicular distance from cursor path to element)
  const closestDistance = Math.sqrt(Math.max(0, elementDistance * elementDistance - dotProduct * dotProduct));
  
  // Consider the element size for hit detection
  const elementSize = Math.min(rect.width, rect.height);
  const effectiveRadius = elementSize / 2;
  
  // Element is on the path if the closest approach distance is less than the element's effective radius
  const isOnPath = closestDistance <= effectiveRadius;
  
  // Element is ahead if the dot product is positive (in the direction of movement)
  const isAhead = dotProduct > 0;
  
  let probability = 0;
  let timeToReach = Infinity;
  
  if (isOnPath && isAhead) {
    // Calculate intersection point along the ray
    const intersectionDistanceAlongRay = dotProduct - Math.sqrt(effectiveRadius * effectiveRadius - closestDistance * closestDistance);
    
    // Calculate time to reach as a fraction of the total prediction time
    timeToReach = (intersectionDistanceAlongRay / movementDistance) * horizonTime;
    
    // Element is reachable if time to reach is within the prediction horizon
    const isReachable = timeToReach <= horizonTime;
    
    if (isReachable) {
      // Calculate probability based on how far the element is and how directly it's in the path
      // Elements directly in the path and closer will have higher probabilities
      
      // Distance factor: higher value when element is closer
      const distanceFactor = 1 - Math.min(intersectionDistanceAlongRay / movementDistance, 1);
      
      // Direction factor: higher value when element is more directly in the path
      const directionFactor = 1 - (closestDistance / (effectiveRadius + 50));
      
      // Combine factors, give more weight to direction factor
      probability = distanceFactor * 0.4 + directionFactor * 0.6;
      
      // Ensure probability stays within [0, 1]
      probability = Math.max(0, Math.min(1, probability));
    }
  }
  
  return { probability, timeToReach };
};

/**
 * Hook for preloading links based on predicted cursor movement
 * 
 * @param options Configuration options
 * @returns Object with preloaded resources and control methods
 */
export const usePreloadOnPrediction = (options?: PreloadOptions): PreloadResult => {
  // Default values
  const minProbability = options?.minProbability ?? 0.6; // Default to 60% probability threshold
  const maxConcurrentPreloads = options?.maxConcurrentPreloads ?? 3;
  const cacheSize = options?.cacheSize ?? 10;
  const checkFrequency = options?.checkFrequency ?? 100; // Check every 100ms
  const horizonTime = options?.predictionHorizon ?? 500; // Use the same as prediction horizon
  
  // Use the cursor predictor hook
  const {
    position,
    predictedPosition,
    isTracking
  } = useCursorPredictor(options);
  
  // State for preloaded resources and potential targets
  const [preloadedResources, setPreloadedResources] = useState<PreloadStatus[]>([]);
  const [potentialTargets, setPotentialTargets] = useState<Array<{
    element: HTMLElement;
    probability: number;
    timeToReach: number;
  }>>([]);
  
  // Refs for internal tracking
  const preloadCache = useRef<Map<string, { status: PreloadStatus['status']; timestamp: number }>>(new Map());
  const activePreloads = useRef<Map<string, AbortController>>(new Map());
  const checkIntervalRef = useRef<number | null>(null);
  
  // Add refs for throttling and spatial indexing
  const lastExecutionTimeRef = useRef<number>(0);
  const quadtreeRef = useRef<Quadtree | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  
  // Function to build the quadtree with all links in the DOM
  const buildQuadtree = useCallback(() => {
    // Create quadtree with viewport dimensions
    const viewportBounds = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const quadtree = new Quadtree(viewportBounds);
    
    // Find all links and add to quadtree
    const links = Array.from(document.querySelectorAll('a[href]')).filter(
      link => link.getAttribute('href')?.startsWith('/')
    ) as HTMLElement[];
    
    for (const link of links) {
      quadtree.insert(link);
    }
    
    return quadtree;
  }, []);
  
  // Initialize quadtree and observer when tracking starts
  useEffect(() => {
    if (isTracking) {
      // Build initial quadtree
      quadtreeRef.current = buildQuadtree();
      
      // Set up mutation observer to rebuild quadtree when DOM changes
      const observer = new MutationObserver((mutations) => {
        let needsRebuild = false;
        
        for (const mutation of mutations) {
          if (
            mutation.type === 'childList' || 
            (mutation.type === 'attributes' && mutation.attributeName === 'href')
          ) {
            needsRebuild = true;
            break;
          }
        }
        
        if (needsRebuild) {
          quadtreeRef.current = buildQuadtree();
        }
      });
      
      // Observe the document for changes to links
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href']
      });
      
      observerRef.current = observer;
      
      return () => {
        observer.disconnect();
        quadtreeRef.current = null;
      };
    }
  }, [isTracking, buildQuadtree]);
  
  // Handle window resize to rebuild the quadtree
  useEffect(() => {
    const handleResize = () => {
      if (isTracking) {
        quadtreeRef.current = buildQuadtree();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isTracking, buildQuadtree]);
  
  // Preload a URL
  const preloadUrl = useCallback((url: string, probability: number, timeToReach: number) => {
    // Skip if already in cache or being loaded
    if (preloadCache.current.has(url) || activePreloads.current.has(url)) {
      return;
    }
    
    // Create abort controller for the fetch
    const controller = new AbortController();
    activePreloads.current.set(url, controller);
    
    // Update state
    setPreloadedResources(prev => [
      ...prev,
      { url, status: 'loading', probability, estimatedTimeToReach: timeToReach }
    ]);
    
    // Fetch the URL
    fetch(url, { 
      signal: controller.signal,
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'Flow-Preload'
      }
    })
      .then(response => {
        // Add to cache
        preloadCache.current.set(url, { status: 'complete', timestamp: Date.now() });
        
        // Update state
        setPreloadedResources(prev => 
          prev.map(item => 
            item.url === url 
              ? { ...item, status: 'complete' as const } 
              : item
          )
        );
        
        // Clean up
        activePreloads.current.delete(url);
      })
      .catch(error => {
        // Only handle if not aborted
        if (error.name !== 'AbortError') {
          preloadCache.current.set(url, { status: 'error', timestamp: Date.now() });
          
          setPreloadedResources(prev => 
            prev.map(item => 
              item.url === url 
                ? { ...item, status: 'error' as const } 
                : item
            )
          );
        }
        
        // Clean up
        activePreloads.current.delete(url);
      });
  }, []);
  
  // Check for elements likely to be interacted with (optimized version)
  const checkPotentialTargets = useCallback(() => {
    if (!position || !predictedPosition || !quadtreeRef.current) return;
    
    // Use quadtree to efficiently find potential elements on the cursor path
    const potentialElements = quadtreeRef.current.queryLine(
      { x: position.x, y: position.y },
      predictedPosition
    );
    
    // Calculate probability of hitting each element
    const elementsWithProbabilities = potentialElements.map(element => {
      const { probability, timeToReach } = calculateHitProbability(
        element,
        { x: position.x, y: position.y },
        predictedPosition,
        horizonTime
      );
      
      return { element, probability, timeToReach };
    }).filter(item => item.probability >= minProbability);
    
    // Sort by probability (highest first) and time (soonest first)
    elementsWithProbabilities.sort((a, b) => {
      // First by probability
      if (b.probability !== a.probability) {
        return b.probability - a.probability;
      }
      // Then by time to reach
      return a.timeToReach - b.timeToReach;
    });
    
    // Update potential targets
    setPotentialTargets(elementsWithProbabilities);
    
    // Preload high-probability targets
    const targetsToPreload = elementsWithProbabilities.slice(0, maxConcurrentPreloads);
    
    for (const { element, probability, timeToReach } of targetsToPreload) {
      const url = element.getAttribute('href');
      if (!url) continue;
      
      preloadUrl(url, probability, timeToReach);
    }
    
  }, [position, predictedPosition, horizonTime, minProbability, maxConcurrentPreloads, preloadUrl]);
  
  // Run checkPotentialTargets with throttling
  useEffect(() => {
    if (position && predictedPosition) {
      const now = Date.now();
      const timeSinceLastCheck = now - lastExecutionTimeRef.current;
      
      // Apply throttling - only check if enough time has passed
      if (timeSinceLastCheck >= checkFrequency) {
        lastExecutionTimeRef.current = now;
        checkPotentialTargets();
      }
    }
  }, [position, predictedPosition, checkPotentialTargets, checkFrequency]);
  
  // Clean up old cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    // Remove old entries
    Array.from(preloadCache.current.entries()).forEach(([url, { timestamp }]) => {
      if (now - timestamp > maxAge) {
        preloadCache.current.delete(url);
      }
    });
    
    // Limit cache size
    const entriesToRemove = preloadCache.current.size - cacheSize;
    if (entriesToRemove > 0) {
      // Convert to array, sort by timestamp (oldest first), and remove excess entries
      const entries = Array.from(preloadCache.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
        preloadCache.current.delete(entries[i][0]);
      }
    }
    
    // Update state to reflect current cache
    setPreloadedResources(prev => 
      prev.filter(item => preloadCache.current.has(item.url))
    );
  }, [cacheSize]);
  
  // Clear the cache
  const clearCache = useCallback(() => {
    // Abort any active preloads
    Array.from(activePreloads.current.values()).forEach(controller => {
      controller.abort();
    });
    
    // Clear maps and state
    activePreloads.current.clear();
    preloadCache.current.clear();
    setPreloadedResources([]);
  }, []);
  
  // Set up interval for cleaning the cache only
  useEffect(() => {
    if (isTracking) {
      // Clear previous interval if exists
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
      }
      
      // Start new interval for cache cleaning only
      checkIntervalRef.current = window.setInterval(() => {
        cleanCache();
      }, checkFrequency * 10); // Less frequent than checks (every 10 check intervals)
      
      return () => {
        if (checkIntervalRef.current) {
          window.clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    }
  }, [isTracking, checkFrequency, cleanCache]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Abort any active preloads
      Array.from(activePreloads.current.values()).forEach(controller => {
        controller.abort();
      });
      
      // Clear interval
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
      }
      
      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return {
    preloadedResources,
    clearCache,
    cursorPosition: position,
    predictedPosition,
    potentialTargets
  };
}; 