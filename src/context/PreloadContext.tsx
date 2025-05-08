import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { usePreloadOnPrediction, PreloadStatus, PreloadOptions } from '../hooks/usePreloadOnPrediction';

// Interfejs for properties of element that can be preloaded
export interface PreloadTarget {
  id: string;
  url: string;
  element: HTMLElement;
  priority?: number;
  customFetch?: (url: string) => Promise<any>;
}

// Interfejs for preload context
export interface PreloadContextValue {
  registerTarget: (target: PreloadTarget) => void;
  unregisterTarget: (id: string) => void;
  preloadedResources: PreloadStatus[];
  preloadTarget: (id: string) => void;
  cursorPosition: { x: number; y: number } | null;
  predictedPosition: { x: number; y: number } | null;
}

// Creating context with default value null
export const PreloadContext = createContext<PreloadContextValue | null>(null);

// Interfejs for provider properties
export interface PreloadProviderProps {
  children: ReactNode;
  options?: PreloadOptions;
}

/**
 * Provider of preload context, which provides registration and management functions for preload targets
 */
export const PreloadProvider: React.FC<PreloadProviderProps> = ({ children, options }) => {
  // Using main preload hook
  const {
    preloadedResources,
    clearCache,
    cursorPosition,
    predictedPosition,
    potentialTargets
  } = usePreloadOnPrediction(options);
  
  // State for manually registered targets
  const [registeredTargets, setRegisteredTargets] = useState<Map<string, PreloadTarget>>(
    new Map()
  );
  
  // Reference to avoid problems with dependencies in useEffect
  const registeredTargetsRef = useRef<Map<string, PreloadTarget>>(new Map());
  
  // Register new target
  const registerTarget = useCallback((target: PreloadTarget) => {
    setRegisteredTargets(prev => {
      const newMap = new Map(prev);
      newMap.set(target.id, target);
      return newMap;
    });
    
    registeredTargetsRef.current.set(target.id, target);
  }, []);
  
  // Unregister target
  const unregisterTarget = useCallback((id: string) => {
    setRegisteredTargets(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    
    registeredTargetsRef.current.delete(id);
  }, []);
  
  // Manual preloading of specific target
  const preloadTarget = useCallback(async (id: string) => {
    const target = registeredTargetsRef.current.get(id);
    if (!target) return;
    
    try {
      if (target.customFetch) {
        await target.customFetch(target.url);
      } else {
        await fetch(target.url);
      }
    } catch (error) {
      console.error(`Error preloading target ${id}:`, error);
    }
  }, []);
  
  // Context value containing all necessary functions and data
  const contextValue: PreloadContextValue = {
    registerTarget,
    unregisterTarget,
    preloadedResources,
    preloadTarget,
    cursorPosition,
    predictedPosition
  };
  
  return (
    <PreloadContext.Provider value={contextValue}>
      {children}
    </PreloadContext.Provider>
  );
};

/**
 * Hook to use preload context
 * @returns Preload context
 * @throws Error if used outside PreloadProvider
 */
export const usePreloadContext = (): PreloadContextValue => {
  const context = useContext(PreloadContext);
  
  if (!context) {
    throw new Error('usePreloadContext must be used within a PreloadProvider');
  }
  
  return context;
}; 