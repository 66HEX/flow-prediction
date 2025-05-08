import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react'
import '@testing-library/jest-dom';
import { useRegisterPreloadTarget } from '../useRegisterPreloadTarget';
import { PreloadContext, PreloadTarget, PreloadContextValue } from '../../context/PreloadContext';

// Mock context values for testing
const mockRegisterTarget = jest.fn();
const mockUnregisterTarget = jest.fn();
const mockPreloadTarget = jest.fn();

// Mock context provider for testing
const mockContextValue: PreloadContextValue = {
  registerTarget: mockRegisterTarget,
  unregisterTarget: mockUnregisterTarget,
  preloadTarget: mockPreloadTarget,
  preloadedResources: [
    { url: '/test-loaded', status: 'complete' as const },
    { url: '/test-loading', status: 'loading' as const },
    { url: '/test-error', status: 'error' as const }
  ],
  cursorPosition: { x: 100, y: 100 },
  predictedPosition: { x: 150, y: 150 }
};

// Wrapper component with mocked context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PreloadContext.Provider value={mockContextValue}>
      {children}
    </PreloadContext.Provider>
  );
};

describe('useRegisterPreloadTarget', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  test('registers target on mount and unregisters on unmount', () => {
    // Create ref to capture
    let capturedRef: any = null;
    
    // Component that uses the hook and captures the ref
    const TestComponent = () => {
      const { ref } = useRegisterPreloadTarget({
        url: '/test-url',
        priority: 5
      });
      
      // Update our reference with the received ref callback
      capturedRef = ref;
      
      return <a ref={ref} href="/test-url" data-testid="test-link">Test Link</a>;
    };
    
    // Render and then unmount
    const { unmount } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Get the link element
    const link = screen.getByTestId('test-link');
    
    // Manually call the ref function
    act(() => {
      if (capturedRef && typeof capturedRef === 'function') {
        capturedRef(link);
      }
    });
    
    // Verify the target was registered
    expect(mockRegisterTarget).toHaveBeenCalledTimes(1);
    
    // Check individual properties separately to avoid circular reference issues
    const registeredTarget = mockRegisterTarget.mock.calls[0][0];
    expect(registeredTarget.url).toBe('/test-url');
    expect(registeredTarget.priority).toBe(5);
    expect(registeredTarget.element).toBe(link);
    
    // Unmount the component
    unmount();
    
    // Verify the target was unregistered
    expect(mockUnregisterTarget).toHaveBeenCalledTimes(1);
  });
  
  test('returns correct preloading status', () => {
    const TestLoadedComponent = () => {
      const { isPreloaded } = useRegisterPreloadTarget({
        url: '/test-loaded',
        autoRegister: false
      });
      
      return <div data-testid="status">{isPreloaded ? 'Preloaded' : 'Not Preloaded'}</div>;
    };
    
    const TestLoadingComponent = () => {
      const { isPreloading } = useRegisterPreloadTarget({
        url: '/test-loading',
        autoRegister: false
      });
      
      return <div data-testid="status">{isPreloading ? 'Loading' : 'Not Loading'}</div>;
    };
    
    const TestErrorComponent = () => {
      const { hasError } = useRegisterPreloadTarget({
        url: '/test-error',
        autoRegister: false
      });
      
      return <div data-testid="status">{hasError ? 'Error' : 'No Error'}</div>;
    };
    
    // Render all components
    render(
      <TestWrapper>
        <div>
          <TestLoadedComponent />
          <TestLoadingComponent />
          <TestErrorComponent />
        </div>
      </TestWrapper>
    );
    
    // Get the rendered elements
    const elements = screen.getAllByTestId('status');
    
    // Verify the statuses
    expect(elements[0]).toHaveTextContent('Preloaded');
    expect(elements[1]).toHaveTextContent('Loading');
    expect(elements[2]).toHaveTextContent('Error');
  });
  
  test('preload function calls context preloadTarget', () => {
    const TestComponent = () => {
      const { preload } = useRegisterPreloadTarget({
        url: '/test-preload',
        autoRegister: false
      });
      
      // Call preload function
      React.useEffect(() => {
        preload();
      }, [preload]);
      
      return <div data-testid="test-component">Test Component</div>;
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Verify the preloadTarget was called
    expect(mockPreloadTarget).toHaveBeenCalledTimes(1);
  });
  
  test('respects autoRegister option', () => {
    // Create ref to capture
    let capturedRef: any = null;
    
    // Component with autoRegister=false
    const TestDisabledComponent = () => {
      const { ref } = useRegisterPreloadTarget({
        url: '/test-url',
        autoRegister: false
      });
      
      // Update our reference with the received ref callback
      capturedRef = ref;
      
      return <a ref={ref} href="/test-url" data-testid="disabled-link">Disabled Link</a>;
    };
    
    // Render component
    render(
      <TestWrapper>
        <TestDisabledComponent />
      </TestWrapper>
    );
    
    // Get the link element
    const link = screen.getByTestId('disabled-link');
    
    // Manually call the ref function
    act(() => {
      if (capturedRef && typeof capturedRef === 'function') {
        capturedRef(link);
      }
    });
    
    // Verify the target was NOT registered due to autoRegister=false
    expect(mockRegisterTarget).not.toHaveBeenCalled();
  });
}); 