/**
 * Flow - React library for mouse cursor movement prediction and link preloading
 * @module flow-prediction
 */

// Re-export all hooks
export * from './hooks';

// Re-export components
export * from './components/PreloadableLink';
export * from './components/PredictionDemo';

// Re-export context
export * from './context/PreloadContext';

// Export utility types and classes
export { ParticleFilter } from './utils/ParticleFilter';
export type { ParticleFilterOptions } from './utils/ParticleFilter';
export { Quadtree } from './utils/Quadtree';

// Export specific types from hooks for better developer experience
export type {
  MouseTrackerOptions,
  MousePosition,
  MouseTrackerResult,
} from './hooks/useMouseTracker';

export type {
  CursorPredictorOptions,
  CursorPosition,
  CursorPredictorResult,
} from './hooks/useCursorPredictor';

export type {
  PreloadOptions,
  PreloadStatus,
  PreloadResult,
} from './hooks/usePreloadOnPrediction';

export type {
  RegisterPreloadTargetOptions,
} from './hooks/useRegisterPreloadTarget';

// Export component types
export type {
  PreloadableLinkProps,
} from './components/PreloadableLink';

export type {
  PredictionDemoProps,
  PredictionDemoOptions,
} from './components/PredictionDemo'; 