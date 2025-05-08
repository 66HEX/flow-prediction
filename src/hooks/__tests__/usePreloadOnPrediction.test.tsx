import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePreloadOnPrediction } from '../usePreloadOnPrediction';

// Mock the useCursorPredictor hook
jest.mock('../useCursorPredictor', () => {
  return {
    useCursorPredictor: jest.fn().mockImplementation(() => {
      return {
        position: { x: 100, y: 100, timestamp: 1000 },
        predictedPosition: { x: 150, y: 150 },
        isTracking: true
      };
    })
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Create a test component using the hook
const TestComponent: React.FC = () => {
  const {
    preloadedResources,
    clearCache,
    cursorPosition,
    predictedPosition,
    potentialTargets
  } = usePreloadOnPrediction({
    checkFrequency: 10, // Lower for testing
    minProbability: 0.5,
    maxConcurrentPreloads: 3
  });

  return (
    <div>
      <div data-testid="current-position">
        {cursorPosition ? `${cursorPosition.x},${cursorPosition.y}` : 'No position'}
      </div>
      <div data-testid="predicted-position">
        {predictedPosition ? `${predictedPosition.x},${predictedPosition.y}` : 'No prediction'}
      </div>
      <div data-testid="preloaded-count">
        {preloadedResources.length}
      </div>
      <div data-testid="targets-count">
        {potentialTargets.length}
      </div>
      <button data-testid="clear-cache" onClick={clearCache}>
        Clear Cache
      </button>
    </div>
  );
};

describe('usePreloadOnPrediction', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock querySelectorAll to return some fake links
    document.querySelectorAll = jest.fn().mockImplementation(() => {
      return [
        {
          getAttribute: () => '/page1',
          getBoundingClientRect: () => ({
            left: 140,
            top: 140,
            width: 100,
            height: 30
          })
        },
        {
          getAttribute: () => '/page2',
          getBoundingClientRect: () => ({
            left: 200,
            top: 200,
            width: 100,
            height: 30
          })
        }
      ];
    });
    
    // Clear any previous intervals
    jest.useRealTimers();
  });
  
  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
  });
  
  it('renders with position data from cursor predictor', () => {
    render(<TestComponent />);
    
    // Check the position data is rendered
    expect(screen.getByTestId('current-position')).toHaveTextContent('100,100');
    expect(screen.getByTestId('predicted-position')).toHaveTextContent('150,150');
  });
  
  // More comprehensive tests would require:
  // - Testing the interval behavior
  // - Mocking element intersections with cursor path
  // - Testing preload behavior
  
  // This is a simplified test for functionality illustration
}); 