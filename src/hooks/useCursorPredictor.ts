import { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleFilter } from '../utils/ParticleFilter';

/**
 * Options for the useCursorPredictor hook
 */
export interface CursorPredictorOptions {
  /** Sampling rate in milliseconds */
  sampleRate?: number;
  /** Maximum number of history points to keep */
  maxHistoryLength?: number;
  /** How far ahead to predict cursor movement (in milliseconds) */
  predictionHorizon?: number;
  /** Number of particles to use in the filter */
  numParticles?: number;
  /** Process noise parameter */
  processNoise?: number;
  /** Measurement noise parameter */
  measurementNoise?: number;
  /** Direction bias for particle filter */
  directionBias?: number;
}

/**
 * Mouse position with timestamp
 */
export interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Result returned by the useCursorPredictor hook
 */
export interface CursorPredictorResult {
  /** Current cursor position */
  position: CursorPosition | null;
  /** Predicted future position */
  predictedPosition: { x: number; y: number } | null;
  /** History of cursor positions */
  history: CursorPosition[];
  /** Is tracking active */
  isTracking: boolean;
  /** Start tracking cursor movement */
  startTracking: () => void;
  /** Stop tracking cursor movement */
  stopTracking: () => void;
  /** Get the raw particles (for visualization) */
  getParticles: () => Array<{ x: number, y: number, weight: number }> | null;
  /** Reset the predictor */
  reset: () => void;
}

/**
 * Hook for tracking cursor movement and predicting future positions
 * 
 * @param options Configuration options
 * @returns Object with current position, predicted position, history and control methods
 */
export const useCursorPredictor = (options?: CursorPredictorOptions): CursorPredictorResult => {
  // Default values
  const sampleRate = options?.sampleRate ?? 50; // Default to 50ms
  const maxHistoryLength = options?.maxHistoryLength ?? 20; // Default to 20 points
  const predictionHorizon = options?.predictionHorizon ?? 500; // Default to 500ms ahead
  
  // State for current position and history
  const [position, setPosition] = useState<CursorPosition | null>(null);
  const [predictedPosition, setPredictedPosition] = useState<{ x: number, y: number } | null>(null);
  const [history, setHistory] = useState<CursorPosition[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  
  // Use refs for values that shouldn't trigger re-renders
  const historyRef = useRef<CursorPosition[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  const trackingRef = useRef<boolean>(false);
  
  // Create and store the particle filter
  const filterRef = useRef<ParticleFilter | null>(null);
  
  // Initialize the filter if it doesn't exist yet
  useEffect(() => {
    if (!filterRef.current) {
      filterRef.current = new ParticleFilter({
        numParticles: options?.numParticles ?? 100,
        processNoise: options?.processNoise ?? 5,
        measurementNoise: options?.measurementNoise ?? 2,
        directionBias: options?.directionBias ?? 1.5
      });
    }
  }, [options?.numParticles, options?.processNoise, options?.measurementNoise, options?.directionBias]);
  
  // Update cursor position based on event
  const updateCursorPosition = useCallback((e: MouseEvent) => {
    if (!trackingRef.current || !filterRef.current) return;
    
    const currentTime = Date.now();
    
    // Only update if enough time has passed since last sample
    if (currentTime - lastSampleTimeRef.current >= sampleRate) {
      const newPosition: CursorPosition = {
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
      
      // Update the particle filter
      filterRef.current.update(newPosition);
      
      // Update predicted position
      const prediction = filterRef.current.predict(predictionHorizon);
      setPredictedPosition(prediction);
      
      lastSampleTimeRef.current = currentTime;
    }
  }, [sampleRate, maxHistoryLength, predictionHorizon]);
  
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
  
  // Reset the predictor
  const reset = useCallback(() => {
    if (filterRef.current) {
      filterRef.current.reset();
    }
    setPosition(null);
    setPredictedPosition(null);
    historyRef.current = [];
    setHistory([]);
  }, []);
  
  // Get particles for visualization
  const getParticles = useCallback(() => {
    if (!filterRef.current) return null;
    return filterRef.current.getParticles();
  }, []);
  
  // Set up and clean up event listeners
  useEffect(() => {
    if (isTracking) {
      window.addEventListener('mousemove', updateCursorPosition);
      
      return () => {
        window.removeEventListener('mousemove', updateCursorPosition);
      };
    }
  }, [isTracking, updateCursorPosition]);
  
  // Start tracking by default
  useEffect(() => {
    startTracking();
    
    return () => {
      // Clean up when component unmounts
      stopTracking();
    };
  }, [startTracking, stopTracking]);
  
  return {
    position,
    predictedPosition,
    history,
    isTracking,
    startTracking,
    stopTracking,
    getParticles,
    reset
  };
}; 