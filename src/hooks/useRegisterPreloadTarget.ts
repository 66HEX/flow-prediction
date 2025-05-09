import { useEffect, useRef, useState } from 'react';
import { usePreloadContext, PreloadTarget } from '../context/PreloadContext';

/**
 * Options for the useRegisterPreloadTarget hook
 */
export interface RegisterPreloadTargetOptions {
  /** URL to preload */
  url: string;
  /** Preload priority - higher value means higher priority */
  priority?: number;
  /** Custom fetch function */
  customFetch?: (url: string) => Promise<any>;
  /** Whether to automatically register in preload context */
  autoRegister?: boolean;
}

/**
 * Hook allowing components to register as preload targets
 * 
 * @param options Registration options
 * @returns Functions to manage registration and preloading
 */
export const useRegisterPreloadTarget = (options: RegisterPreloadTargetOptions) => {
  const { url, priority = 1, customFetch, autoRegister = true } = options;
  
  // Get preload context
  const { 
    registerTarget, 
    unregisterTarget, 
    preloadTarget,
    preloadedResources 
  } = usePreloadContext();
  
  // State for DOM element reference
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Unique ID for this registration
  const idRef = useRef<string>(`preload-target-${Math.random().toString(36).substring(2, 9)}`);
  
  // Preload status for this target
  const preloadStatus = preloadedResources.find(resource => resource.url === url);
  
  // Function to manually preload this target
  const preload = () => {
    if (idRef.current) {
      preloadTarget(idRef.current);
    }
  };
  
  // Ref callback to assign DOM element
  const ref = (element: HTMLElement | null) => {
    elementRef.current = element;
  };
  
  // Effect to register/unregister target in context
  useEffect(() => {
    if (!elementRef.current || !autoRegister) return;
    
    // Register target in context
    const target: PreloadTarget = {
      id: idRef.current,
      url,
      element: elementRef.current,
      priority,
      customFetch
    };
    
    registerTarget(target);
    
    // Unregister when component unmounts
    return () => {
      unregisterTarget(idRef.current);
    };
  }, [url, priority, customFetch, registerTarget, unregisterTarget, autoRegister]);
  
  return {
    ref,
    preload,
    isPreloading: preloadStatus?.status === 'loading',
    isPreloaded: preloadStatus?.status === 'complete',
    hasError: preloadStatus?.status === 'error'
  };
}; 