import React, { useState, useEffect, useRef } from 'react';
import { useCursorPredictor } from '../hooks/useCursorPredictor';

/**
 * Options for the PredictionDemo component
 */
export interface PredictionDemoOptions {
  /** Number of particles to use in the filter */
  numParticles?: number;
  /** How far ahead to predict cursor movement (in ms) */
  predictionHorizon?: number;
  /** Process noise - higher values make the filter adapt faster to direction changes */
  processNoise?: number;
  /** Direction bias - how strongly to bias toward the current direction */
  directionBias?: number;
  /** Measurement noise - how much to trust measurements */
  measurementNoise?: number;
  /** Whether to use adaptive noise parameters */
  useAdaptiveNoise?: boolean;
  /** Maximum measurements to keep in history for adaptive noise */
  maxHistorySize?: number;
  /** Minimum process noise value */
  minProcessNoise?: number;
  /** Maximum process noise value */
  maxProcessNoise?: number;
}

/**
 * Props for the PredictionDemo component
 */
export interface PredictionDemoProps {
  /** Width of the canvas */
  width?: number;
  /** Height of the canvas */
  height?: number;
  /** Options for the prediction algorithm */
  options?: PredictionDemoOptions;
  /** Whether to show individual particles */
  showParticles?: boolean;
  /** Whether to show the cursor trail */
  showTrail?: boolean;
  /** Maximum number of trail points to show */
  maxTrailLength?: number;
  /** Whether to show current noise parameters */
  showNoiseParams?: boolean;
  /** Custom CSS class name */
  className?: string;
}

/**
 * Component that demonstrates the cursor prediction capabilities
 * by showing the current cursor position, predicted position, and
 * optionally the particles used by the filter.
 */
export const PredictionDemo: React.FC<PredictionDemoProps> = ({ 
  width = 800, 
  height = 400, 
  options = {}, 
  showParticles = true,
  showTrail = true,
  maxTrailLength = 20,
  showNoiseParams = false,
  className = ''
}) => {
  // Default configuration values
  const predictionHorizon = options.predictionHorizon ?? 500; // ms
  const numParticles = options.numParticles ?? 100; 
  const processNoise = options.processNoise ?? 5;
  const directionBias = options.directionBias ?? 1.5;
  const measurementNoise = options.measurementNoise ?? 2;
  const useAdaptiveNoise = options.useAdaptiveNoise ?? false;
  const maxHistorySize = options.maxHistorySize ?? 10;
  const minProcessNoise = options.minProcessNoise ?? 1;
  const maxProcessNoise = options.maxProcessNoise ?? 15;
  
  // Reference for canvas drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use cursor predictor hook with particle filter
  const { 
    position,
    predictedPosition, 
    history, 
    getParticles,
    getNoiseParameters
  } = useCursorPredictor({
    predictionHorizon,
    numParticles,
    processNoise,
    directionBias,
    measurementNoise,
    useAdaptiveNoise,
    maxHistorySize,
    minProcessNoise,
    maxProcessNoise,
    sampleRate: 16 // ~60fps for smoother visualization
  });
  
  // For displaying current noise parameters
  const [currentNoiseParams, setCurrentNoiseParams] = useState<{ processNoise: number, measurementNoise: number } | null>(null);
  
  // Update noise parameters display
  useEffect(() => {
    if (showNoiseParams) {
      const intervalId = setInterval(() => {
        const params = getNoiseParameters();
        if (params) {
          setCurrentNoiseParams(params);
        }
      }, 200); // Update every 200ms
      
      return () => clearInterval(intervalId);
    }
  }, [showNoiseParams, getNoiseParameters]);
  
  // Track canvas-relative cursor position
  const [canvasPosition, setCanvasPosition] = useState<{ x: number, y: number } | null>(null);
  const [canvasPredictedPosition, setCanvasPredictedPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Handle mouse movement on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setCanvasPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    // Attach event listener to canvas only
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Update canvas-relative predicted position when global position updates
  useEffect(() => {
    if (position && predictedPosition && canvasPosition) {
      // Calculate offset between global and canvas positions
      const offsetX = canvasPosition.x - position.x;
      const offsetY = canvasPosition.y - position.y;
      
      // Apply same offset to predicted position
      setCanvasPredictedPosition({
        x: predictedPosition.x + offsetX,
        y: predictedPosition.y + offsetY
      });
    } else {
      setCanvasPredictedPosition(null);
    }
  }, [position, predictedPosition, canvasPosition]);
  
  // Convert particles to canvas coordinates
  const getCanvasParticles = () => {
    if (!position || !canvasPosition) return [];
    
    const particles = getParticles();
    if (!particles) return [];
    
    // Calculate offset between global and canvas positions
    const offsetX = canvasPosition.x - position.x;
    const offsetY = canvasPosition.y - position.y;
    
    // Apply offset to all particles
    return particles.map(particle => ({
      x: particle.x + offsetX,
      y: particle.y + offsetY,
      weight: particle.weight
    }));
  };
  
  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Use canvas-relative positions for drawing
    let canvasHistory: Array<{ x: number, y: number }> = [];
    
    if (showTrail && history.length > 0 && position && canvasPosition) {
      // Calculate offset between global and canvas positions
      const offsetX = canvasPosition.x - position.x;
      const offsetY = canvasPosition.y - position.y;
      
      // Transform points to canvas coordinates
      canvasHistory = history.map(point => ({
        x: point.x + offsetX,
        y: point.y + offsetY
      })).slice(-maxTrailLength); // Limit trail length
    }
    
    // Draw history points (motion trail)
    if (showTrail && canvasHistory.length > 1) {
      ctx.beginPath();
      ctx.moveTo(canvasHistory[0].x, canvasHistory[0].y);
      
      for (let i = 1; i < canvasHistory.length; i++) {
        ctx.lineTo(canvasHistory[i].x, canvasHistory[i].y);
      }
      
      // Gradient for the trail
      const gradient = ctx.createLinearGradient(
        canvasHistory[0].x, canvasHistory[0].y, 
        canvasHistory[canvasHistory.length - 1].x, canvasHistory[canvasHistory.length - 1].y
      );
      gradient.addColorStop(0, 'rgba(255, 100, 100, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 100, 100, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw particles if enabled
    if (showParticles && canvasPosition) {
      const canvasParticles = getCanvasParticles();
      
      canvasParticles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 100, 255, ${particle.weight * 5})`;
        ctx.fill();
      });
    }
    
    // Draw current position
    if (canvasPosition) {
      ctx.beginPath();
      ctx.arc(canvasPosition.x, canvasPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();
      
      // Add label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText('Current', canvasPosition.x + 15, canvasPosition.y + 5);
    }
    
    // Draw predicted position
    if (canvasPredictedPosition) {
      ctx.beginPath();
      ctx.arc(canvasPredictedPosition.x, canvasPredictedPosition.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fill();
      
      // Add label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText('Predicted', canvasPredictedPosition.x + 15, canvasPredictedPosition.y + 5);
      
      // Draw line connecting current to predicted position
      if (canvasPosition) {
        ctx.beginPath();
        ctx.moveTo(canvasPosition.x, canvasPosition.y);
        ctx.lineTo(canvasPredictedPosition.x, canvasPredictedPosition.y);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    // Draw instructions if no interaction yet
    if (!canvasPosition) {
      ctx.fillStyle = '#888';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Move your cursor over this area to see prediction in action', width / 2, height / 2);
    }
    
  }, [canvasPosition, canvasPredictedPosition, history, showParticles, position, showTrail, maxTrailLength, width, height]);

  return (
    <div className={className}>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        style={{ 
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      />
      
      {/* Configuration display */}
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginTop: '10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>Prediction: {predictionHorizon}ms</div>
        <div>Particles: {numParticles}</div>
        {!useAdaptiveNoise && <div>Process noise: {processNoise.toFixed(1)}</div>}
        <div>Direction bias: {directionBias.toFixed(1)}</div>
        {useAdaptiveNoise && <div>Adaptive noise: ON</div>}
        
        {showNoiseParams && currentNoiseParams && (
          <>
            <div>Current process noise: {currentNoiseParams.processNoise.toFixed(2)}</div>
            <div>Current measurement noise: {currentNoiseParams.measurementNoise.toFixed(2)}</div>
          </>
        )}
      </div>
    </div>
  );
}; 