import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useCursorPredictor } from '../useCursorPredictor';

// Mock the ParticleFilter implementation
jest.mock('../../utils/ParticleFilter', () => {
  return {
    ParticleFilter: jest.fn().mockImplementation(() => {
      return {
        update: jest.fn(),
        predict: jest.fn().mockImplementation(() => ({ x: 150, y: 150 })),
        getParticles: jest.fn().mockImplementation(() => [
          { x: 100, y: 100, weight: 0.5 },
          { x: 120, y: 120, weight: 0.5 }
        ]),
        reset: jest.fn()
      };
    })
  };
});

// Create a test component that uses the hook
const TestComponent: React.FC = () => {
  const {
    position,
    predictedPosition,
    history,
    isTracking,
    startTracking,
    stopTracking,
    getParticles,
    reset
  } = useCursorPredictor({
    sampleRate: 10, // Use small sample rate for faster testing
    maxHistoryLength: 5
  });

  return (
    <div>
      <div data-testid="position">
        {position ? `${position.x},${position.y}` : 'No position'}
      </div>
      <div data-testid="predicted">
        {predictedPosition ? `${predictedPosition.x},${predictedPosition.y}` : 'No prediction'}
      </div>
      <div data-testid="history-length">
        {history.length}
      </div>
      <div data-testid="is-tracking">
        {isTracking ? 'Tracking' : 'Not tracking'}
      </div>
      <button data-testid="start-btn" onClick={startTracking}>Start</button>
      <button data-testid="stop-btn" onClick={stopTracking}>Stop</button>
      <button data-testid="reset-btn" onClick={reset}>Reset</button>
      <button data-testid="particles-btn" onClick={() => {
        const particles = getParticles();
        if (particles) {
          document.getElementById('particles-count')!.textContent = 
            particles.length.toString();
        }
      }}>Get Particles</button>
      <div id="particles-count">0</div>
    </div>
  );
};

describe('useCursorPredictor', () => {
  beforeEach(() => {
    // Reset all mock functions
    jest.clearAllMocks();
    
    // Mock Date.now
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    // Restore Date.now
    jest.restoreAllMocks();
  });

  it('starts tracking automatically', async () => {
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('is-tracking')).toHaveTextContent('Tracking');
    });
  });

  it('stops tracking when stopTracking is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    // First verify that tracking is active
    await waitFor(() => {
      expect(screen.getByTestId('is-tracking')).toHaveTextContent('Tracking');
    });
    
    // Click the stop button and wait for the state to update
    await user.click(screen.getByTestId('stop-btn'));
    
    // Verify tracking has stopped with waitFor
    await waitFor(() => {
      expect(screen.getByTestId('is-tracking')).toHaveTextContent('Not tracking');
    });
  });

  it('starts tracking when startTracking is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    // First stop tracking
    await user.click(screen.getByTestId('stop-btn'));
    
    // Wait for tracking to stop
    await waitFor(() => {
      expect(screen.getByTestId('is-tracking')).toHaveTextContent('Not tracking');
    });
    
    // Then start tracking again
    await user.click(screen.getByTestId('start-btn'));
    
    // Wait for tracking to start
    await waitFor(() => {
      expect(screen.getByTestId('is-tracking')).toHaveTextContent('Tracking');
    });
  });

  it('updates position and prediction on mouse move', async () => {
    render(<TestComponent />);
    
    // Simulate a mousemove event
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      }));
    });
    
    // Small delay to allow for processing
    await waitFor(() => {
      // Verify position is updated
      expect(screen.getByTestId('position')).toHaveTextContent('100,100');
      
      // Verify prediction is also updated
      expect(screen.getByTestId('predicted')).toHaveTextContent('150,150');
    });
  });

  it('updates history with multiple mouse moves', async () => {
    render(<TestComponent />);
    
    // Simulate multiple mousemove events
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1000 + i * 20);
        window.dispatchEvent(new MouseEvent('mousemove', {
          clientX: 100 + i * 10,
          clientY: 100 + i * 10
        }));
      });
      
      // Small delay between events
      await new Promise(r => setTimeout(r, 15));
    }
    
    // Verify history length (should be limited by maxHistoryLength)
    await waitFor(() => {
      expect(screen.getByTestId('history-length')).toHaveTextContent('5');
    });
  });

  it('gets particles from the filter', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    // Simulate a mousemove to initialize filter
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      }));
    });
    
    // Get particles and wait for DOM update
    await user.click(screen.getByTestId('particles-btn'));
    
    // Check that we get the correct number of particles from the mocked filter
    await waitFor(() => {
      expect(document.getElementById('particles-count')).toHaveTextContent('2');
    });
  });

  it('resets state when reset is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    // First generate some state
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      }));
    });
    
    // Make sure the position is updated
    await waitFor(() => {
      expect(screen.getByTestId('position')).toHaveTextContent('100,100');
    });
    
    // Then reset and wait for state updates
    await user.click(screen.getByTestId('reset-btn'));
    
    // Verify state is reset
    await waitFor(() => {
      expect(screen.getByTestId('position')).toHaveTextContent('No position');
      expect(screen.getByTestId('predicted')).toHaveTextContent('No prediction');
      expect(screen.getByTestId('history-length')).toHaveTextContent('0');
    });
  });
}); 