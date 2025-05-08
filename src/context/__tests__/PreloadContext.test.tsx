import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreloadProvider, usePreloadContext, PreloadTarget } from '../PreloadContext';

// Mock the usePreloadOnPrediction hook
jest.mock('../../hooks/usePreloadOnPrediction', () => {
  return {
    usePreloadOnPrediction: jest.fn().mockImplementation(() => {
      return {
        preloadedResources: [],
        clearCache: jest.fn(),
        cursorPosition: { x: 100, y: 100 },
        predictedPosition: { x: 150, y: 150 },
        potentialTargets: []
      };
    })
  };
});

describe('PreloadContext', () => {
  test('Provider renders children correctly', () => {
    render(
      <PreloadProvider>
        <div data-testid="child">Test Child</div>
      </PreloadProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
  });
  
  test('Context provides expected values', () => {
    const TestComponent = () => {
      const context = usePreloadContext();
      
      // Render context values for testing
      return (
        <div>
          <div data-testid="has-register">{Boolean(context.registerTarget).toString()}</div>
          <div data-testid="has-unregister">{Boolean(context.unregisterTarget).toString()}</div>
          <div data-testid="has-preloadTarget">{Boolean(context.preloadTarget).toString()}</div>
          <div data-testid="cursor-position">{`${context.cursorPosition?.x},${context.cursorPosition?.y}`}</div>
          <div data-testid="predicted-position">{`${context.predictedPosition?.x},${context.predictedPosition?.y}`}</div>
        </div>
      );
    };
    
    render(
      <PreloadProvider>
        <TestComponent />
      </PreloadProvider>
    );
    
    // Verify that context provides expected values
    expect(screen.getByTestId('has-register')).toHaveTextContent('true');
    expect(screen.getByTestId('has-unregister')).toHaveTextContent('true');
    expect(screen.getByTestId('has-preloadTarget')).toHaveTextContent('true');
    expect(screen.getByTestId('cursor-position')).toHaveTextContent('100,100');
    expect(screen.getByTestId('predicted-position')).toHaveTextContent('150,150');
  });
  
  test('Error is thrown when usePreloadContext is used outside provider', () => {
    // Spy on console.error to suppress the React error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => usePreloadContext());
    }).toThrow('usePreloadContext must be used within a PreloadProvider');
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
  
  test('registerTarget and unregisterTarget functions work as expected', () => {
    const mockFetch = jest.fn().mockResolvedValue({});
    const mockTarget: PreloadTarget = {
      id: 'test-id',
      url: '/test',
      element: document.createElement('a'),
      priority: 5,
      customFetch: mockFetch
    };
    
    const TestComponent = () => {
      const { registerTarget, unregisterTarget, preloadTarget } = usePreloadContext();
      
      React.useEffect(() => {
        // Register the target
        registerTarget(mockTarget);
        
        // Test preloading
        preloadTarget('test-id');
        
        // Unregister after a delay to test both states
        const timeoutId = setTimeout(() => {
          unregisterTarget('test-id');
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }, [registerTarget, unregisterTarget, preloadTarget]);
      
      return <div data-testid="test-component">Test Component</div>;
    };
    
    render(
      <PreloadProvider>
        <TestComponent />
      </PreloadProvider>
    );
    
    // Verify the component renders
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    
    // Verify that the fetch function was called
    expect(mockFetch).toHaveBeenCalledWith('/test');
  });
}); 