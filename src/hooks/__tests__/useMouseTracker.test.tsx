import { renderHook } from '@testing-library/react';
import { useMouseTracker } from '../useMouseTracker';
import { act } from 'react';

// Mock window event listeners
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// Store original implementation to restore later
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// Helper function to simulate mouse movement
const simulateMouseMove = (x: number, y: number) => {
  // Find the mousemove handler and call it with a mock event
  const calls = mockAddEventListener.mock.calls;
  const mousemoveHandler = calls.find(call => call[0] === 'mousemove')?.[1];
  
  if (mousemoveHandler) {
    mousemoveHandler({ clientX: x, clientY: y });
  }
};

describe('useMouseTracker', () => {
  beforeAll(() => {
    // Mock window event listeners
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
  });

  afterAll(() => {
    // Restore original implementations
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  beforeEach(() => {
    // Clear mocks before each test
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    jest.useFakeTimers();
    
    // Mock Date.now to have controlled timing
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should initialize with null position and empty history', () => {
    const { result } = renderHook(() => useMouseTracker());

    expect(result.current.position).toBeNull();
    expect(result.current.history).toEqual([]);
    expect(result.current.isTracking).toBe(true);
  });

  it('should start tracking on mount', () => {
    renderHook(() => useMouseTracker());

    expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('should track mouse movement', () => {
    const { result } = renderHook(() => useMouseTracker());
    
    // Simulate mouse movement
    act(() => {
      simulateMouseMove(100, 200);
    });
    
    // Check if position was updated
    expect(result.current.position).toEqual({
      x: 100,
      y: 200,
      timestamp: 1000
    });
    
    // Check if history was updated
    expect(result.current.history).toEqual([
      { x: 100, y: 200, timestamp: 1000 }
    ]);
    
    // Simulate another movement
    act(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1100);
      simulateMouseMove(300, 400);
    });
    
    // Check updated position
    expect(result.current.position).toEqual({
      x: 300,
      y: 400,
      timestamp: 1100
    });
    
    // Check updated history
    expect(result.current.history).toEqual([
      { x: 100, y: 200, timestamp: 1000 },
      { x: 300, y: 400, timestamp: 1100 }
    ]);
  });

  it('should stop tracking when stopTracking is called', () => {
    const { result } = renderHook(() => useMouseTracker());

    act(() => {
      result.current.stopTracking();
    });

    expect(result.current.isTracking).toBe(false);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('should restart tracking when startTracking is called', () => {
    const { result } = renderHook(() => useMouseTracker());

    // First stop tracking
    act(() => {
      result.current.stopTracking();
    });
    
    mockAddEventListener.mockClear();

    // Then restart
    act(() => {
      result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);
    expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('should respect sampleRate option', () => {
    const sampleRate = 100; // 100ms sampling rate
    const { result } = renderHook(() => useMouseTracker({ sampleRate }));
    
    // Simulate first mouse movement
    act(() => {
      // First movement at t=1000ms
      simulateMouseMove(10, 20);
    });
    
    expect(result.current.position).toEqual({
      x: 10,
      y: 20,
      timestamp: 1000
    });
    
    // Try to move mouse shortly after (before sample rate expires)
    act(() => {
      // Mock time to 1050ms (50ms later - less than sampleRate)
      jest.spyOn(Date, 'now').mockImplementation(() => 1050);
      simulateMouseMove(30, 40);
    });
    
    // Position should not change because sample rate hasn't elapsed
    expect(result.current.position).toEqual({
      x: 10,
      y: 20,
      timestamp: 1000
    });
    
    // Now simulate mouse movement after sample rate has elapsed
    act(() => {
      // Mock time to 1110ms (110ms after first move - more than sampleRate)
      jest.spyOn(Date, 'now').mockImplementation(() => 1110);
      simulateMouseMove(50, 60);
    });
    
    // Position should update now
    expect(result.current.position).toEqual({
      x: 50,
      y: 60,
      timestamp: 1110
    });
  });

  it('should respect maxHistoryLength option', () => {
    const maxHistoryLength = 3;
    const { result } = renderHook(() => useMouseTracker({ maxHistoryLength }));
    
    // Simulate 5 mouse movements (more than maxHistoryLength)
    act(() => {
      // First movement
      jest.spyOn(Date, 'now').mockImplementation(() => 1000);
      simulateMouseMove(10, 10);
      
      // Second movement
      jest.spyOn(Date, 'now').mockImplementation(() => 1100);
      simulateMouseMove(20, 20);
      
      // Third movement
      jest.spyOn(Date, 'now').mockImplementation(() => 1200);
      simulateMouseMove(30, 30);
      
      // Fourth movement (should start removing old ones)
      jest.spyOn(Date, 'now').mockImplementation(() => 1300);
      simulateMouseMove(40, 40);
      
      // Fifth movement
      jest.spyOn(Date, 'now').mockImplementation(() => 1400);
      simulateMouseMove(50, 50);
    });
    
    // History should only contain the last 3 positions
    expect(result.current.history).toHaveLength(maxHistoryLength);
    
    // Check that history contains only the 3 most recent positions
    expect(result.current.history[0]).toEqual({ x: 30, y: 30, timestamp: 1200 });
    expect(result.current.history[1]).toEqual({ x: 40, y: 40, timestamp: 1300 });
    expect(result.current.history[2]).toEqual({ x: 50, y: 50, timestamp: 1400 });
  });

  it('should not update position when tracking is disabled', () => {
    const { result } = renderHook(() => useMouseTracker());
    
    // First track a position
    act(() => {
      simulateMouseMove(10, 20);
    });
    
    // Store the initial position
    const initialPosition = result.current.position;
    
    // Now stop tracking
    act(() => {
      result.current.stopTracking();
    });
    
    // Simulate more movements
    act(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1100);
      simulateMouseMove(30, 40);
    });
    
    // Position should not have changed
    expect(result.current.position).toEqual(initialPosition);
  });
}); 