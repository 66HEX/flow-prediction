import React, { AnchorHTMLAttributes, forwardRef } from 'react';
import { useRegisterPreloadTarget, RegisterPreloadTargetOptions } from '../hooks/useRegisterPreloadTarget';

/**
 * Properties for the PreloadableLink component
 */
export interface PreloadableLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** URL for navigation and preloading */
  href: string;
  /** Whether to automatically preload */
  preload?: boolean;
  /** Preloading priority (1-10, where 10 is highest) */
  priority?: number;
  /** Custom fetch/preloading function */
  customFetch?: (url: string) => Promise<any>;
  /** Component to render preloading status */
  loadingIndicator?: React.ReactNode;
  /** Custom class for link when preloaded */
  preloadedClassName?: string;
  /** Custom class for link when preloading */
  preloadingClassName?: string;
  /** Custom class for link when preloading error */
  errorClassName?: string;
}

/**
 * Link component that automatically registers as a preload target and
 * handles preloading data on potential interaction detection.
 */
export const PreloadableLink = forwardRef<HTMLAnchorElement, PreloadableLinkProps>((props, forwardedRef) => {
  const {
    href,
    preload = true,
    priority,
    customFetch,
    children,
    className = '',
    loadingIndicator,
    preloadedClassName = '',
    preloadingClassName = '',
    errorClassName = '',
    onClick,
    ...restProps
  } = props;
  
  // Preload target registration options
  const options: RegisterPreloadTargetOptions = {
    url: href,
    priority,
    customFetch,
    autoRegister: preload
  };
  
  // Use hook to register
  const { 
    ref, 
    preload: triggerPreload, 
    isPreloading, 
    isPreloaded, 
    hasError 
  } = useRegisterPreloadTarget(options);
  
  // Connect ref function with passed ref
  const setRef = (element: HTMLAnchorElement | null) => {
    // Call own ref function
    ref(element);
    
    // Handle passed ref
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else {
        forwardedRef.current = element;
      }
    }
  };
  
  // Handle click - we can track clicked links
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call passed onClick function, if exists
    if (onClick) {
      onClick(e);
    }
  };
  
  // Function to manually force preloading on mouse enter
  const handleMouseEnter = () => {
    if (preload) {
      triggerPreload();
    }
  };
  
  // Build CSS class based on preloading state
  let computedClassName = className;
  if (isPreloaded && preloadedClassName) {
    computedClassName += ` ${preloadedClassName}`;
  } else if (isPreloading && preloadingClassName) {
    computedClassName += ` ${preloadingClassName}`;
  } else if (hasError && errorClassName) {
    computedClassName += ` ${errorClassName}`;
  }
  
  return (
    <a
      ref={setRef}
      href={href}
      className={computedClassName}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...restProps}
    >
      {children}
      {isPreloading && loadingIndicator}
    </a>
  );
});

// Set displayed name for DevTools
PreloadableLink.displayName = 'PreloadableLink'; 