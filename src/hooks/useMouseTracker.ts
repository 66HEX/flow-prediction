import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Options for the useMouseTracker hook
 */
export interface MouseTrackerOptions {
  /** Sampling rate in milliseconds */
  sampleRate?: number;
  /** Maximum number of history points to keep */
  maxHistoryLength?: number;
}

/**
 * Mouse position with timestamp
 */
export interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Result returned by the useMouseTracker hook
 */
export interface MouseTrackerResult {
  /** Current mouse position */
  position: MousePosition | null;
  /** History of mouse positions */
  history: MousePosition[];
  /** Is tracking active */
  isTracking: boolean;
  /** Start tracking mouse movement */
  startTracking: () => void;
  /** Stop tracking mouse movement */
  stopTracking: () => void;
}

/**
 * Hook for tracking mouse movement
 * 
 * @param options Configuration options for the tracker
 * @returns Object with current position, history and control methods
 */
export const useMouseTracker = (options?: MouseTrackerOptions): MouseTrackerResult => {
  // Default values
  const sampleRate = options?.sampleRate || 50; // Default to 50ms
  const maxHistoryLength = options?.maxHistoryLength || 20; // Default to 20 points
  
  // State for current position and history
  const [position, setPosition] = useState<MousePosition | null>(null);
  const [history, setHistory] = useState<MousePosition[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  
  // Use refs for values that shouldn't trigger re-renders
  const historyRef = useRef<MousePosition[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  const trackingRef = useRef<boolean>(false);
  
  // Update mouse position based on event
  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (!trackingRef.current) return;
    
    const currentTime = Date.now();
    
    // Only update if enough time has passed since last sample
    if (currentTime - lastSampleTimeRef.current >= sampleRate) {
      const newPosition: MousePosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime
      };
      
      // Update position state
      setPosition(newPosition);
      
      // Update history
      const updatedHistory = [
        ...historyRef.current,
        newPosition
      ].slice(-maxHistoryLength); // Keep only the most recent points
      
      historyRef.current = updatedHistory;
      setHistory(updatedHistory);
      
      lastSampleTimeRef.current = currentTime;
    }
  }, [sampleRate, maxHistoryLength]);
  
  // Start tracking
  const startTracking = useCallback(() => {
    trackingRef.current = true;
    setIsTracking(true);
  }, []);
  
  // Stop tracking
  const stopTracking = useCallback(() => {
    trackingRef.current = false;
    setIsTracking(false);
  }, []);
  
  // Set up and clean up event listeners
  useEffect(() => {
    if (isTracking) {
      window.addEventListener('mousemove', updateMousePosition);
      
      return () => {
        window.removeEventListener('mousemove', updateMousePosition);
      };
    }
  }, [isTracking, updateMousePosition]);
  
  // Start tracking by default
  useEffect(() => {
    startTracking();
  }, [startTracking]);
  
  return {
    position,
    history,
    isTracking,
    startTracking,
    stopTracking
  };
}; 