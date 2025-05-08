import { renderHook, act } from '@testing-library/react';
import { useMouseTracker } from '../useMouseTracker';

// Mock window event listeners
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// Store original implementation to restore later
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

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
  });

  afterEach(() => {
    jest.useRealTimers();
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
    // Implementation of this test would require simulating mouse movements
    // and checking if positions are recorded at the configured sample rate
  });

  it('should respect maxHistoryLength option', () => {
    // Implementation of this test would require simulating multiple mouse movements
    // and verifying that the history length is capped at the configured value
  });
}); 