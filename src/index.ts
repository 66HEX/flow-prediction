/**
 * Flow - React library for mouse cursor movement prediction and link preloading
 * @module flow-prediction
 */

// Re-export all hooks
export * from './hooks';

// Re-export components
export * from './components';

// Re-export context
export * from './context';

// Export utility types and classes
export { ParticleFilter } from './utils/ParticleFilter';
export type { ParticleFilterOptions } from './utils/ParticleFilter';
export { Quadtree } from './utils/Quadtree';

// Export hooks types
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

// Export context types
export type {
  PreloadContextValue,
  PreloadProviderProps,
  PreloadTarget,
} from './context';