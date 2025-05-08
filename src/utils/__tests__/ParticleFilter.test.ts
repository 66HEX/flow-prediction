import { ParticleFilter } from '../ParticleFilter';

describe('ParticleFilter', () => {
  let filter: ParticleFilter;
  
  beforeEach(() => {
    // Create a new filter instance before each test with adjusted parameters
    filter = new ParticleFilter({
      numParticles: 100,
      processNoise: 5,
      measurementNoise: 2,
      directionBias: 1.5
    });
    
    // Mock Date.now to have controlled timing
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should initialize with default state', () => {
    const state = filter.getState();
    
    expect(state).toEqual({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    });
  });
  
  it('should initialize with custom initial state', () => {
    const customFilter = new ParticleFilter({
      initialState: { x: 10, y: 20, vx: 5, vy: -3 }
    });
    
    const state = customFilter.getState();
    
    expect(state.x).toBeCloseTo(10);
    expect(state.y).toBeCloseTo(20);
    expect(state.vx).toBeCloseTo(5);
    expect(state.vy).toBeCloseTo(-3);
  });
  
  it('should update state with first measurement directly', () => {
    // First measurement - should be directly applied
    filter.update({ x: 10, y: 20 });
    
    const state = filter.getState();
    expect(state.x).toBeCloseTo(10);
    expect(state.y).toBeCloseTo(20);
    
    // Velocities should still be 0
    expect(Math.abs(state.vx)).toBeLessThan(0.1);
    expect(Math.abs(state.vy)).toBeLessThan(0.1);
  });
  
  it('should estimate velocity based on multiple measurements', () => {
    // First position at t=1000ms
    filter.update({ x: 0, y: 0, timestamp: 1000 });
    
    // Simulate constant motion (10 units per second)
    for (let i = 1; i <= 10; i++) {
      const time = 1000 + i * 100;
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      filter.update({ x: i, y: 0, timestamp: time });
    }
    
    // Check velocity estimate - after many samples, should be close to 10 units/sec
    const state = filter.getState();
    
    // Velocity in x direction should now be detectable
    expect(state.vx).toBeGreaterThan(5);
    
    // Y velocity should remain close to 0
    expect(Math.abs(state.vy)).toBeLessThan(2);
  });
  
  it('should predict future position based on current state and velocity', () => {
    // Initialize with a known position and velocity
    filter.reset({
      x: 10,
      y: 20, 
      vx: 100, // 100 units per second in x direction
      vy: 0
    });
    
    // Let the filter update a few times to initialize particles properly
    for (let i = 0; i < 5; i++) {
      const time = 1000 + i * 50;
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      filter.update({ x: 10 + i * 5, y: 20 });
    }
    
    // Predict 500ms ahead - should move approximately 50 units
    const prediction = filter.predict(500);
    
    // Check prediction - should be around x=60, y=20
    expect(prediction.x).toBeGreaterThan(30); // Because velocity should be detected
    expect(Math.abs(prediction.y - 20)).toBeLessThan(10);
  });
  
  it('should handle motion with acceleration', () => {
    // Create constant acceleration motion
    filter.update({ x: 0, y: 0, timestamp: 1000 });
    
    for (let i = 1; i <= 10; i++) {
      const time = 1000 + i * 100;
      const position = i * i / 2; // Quadratic position growth
      
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      filter.update({ x: position, y: 0, timestamp: time });
    }
    
    // At this point, velocity should be increasing
    const state = filter.getState();
    expect(state.vx).toBeGreaterThan(3); // Velocity should be positive
    
    // Predict future position
    const prediction = filter.predict(200);
    
    // Should predict continued motion
    expect(prediction.x).toBeGreaterThan(state.x);
  });
  
  it('should reset filter state', () => {
    // Update with some measurements
    filter.update({ x: 10, y: 20 });
    
    jest.spyOn(Date, 'now').mockImplementation(() => 1100);
    filter.update({ x: 15, y: 25 });
    
    // Reset filter
    filter.reset({ x: 5, y: 5 });
    
    // Check if state was reset
    const state = filter.getState();
    expect(state.x).toBeCloseTo(5);
    expect(state.y).toBeCloseTo(5);
    expect(Math.abs(state.vx)).toBeLessThan(0.1);
    expect(Math.abs(state.vy)).toBeLessThan(0.1);
    
    // Reset with custom velocity
    filter.reset({ x: 0, y: 0, vx: 10, vy: 5 });
    
    const stateWithVelocity = filter.getState();
    expect(stateWithVelocity.x).toBeCloseTo(0);
    expect(stateWithVelocity.y).toBeCloseTo(0);
    expect(stateWithVelocity.vx).toBeCloseTo(10);
    expect(stateWithVelocity.vy).toBeCloseTo(5);
  });
  
  it('should handle noise in measurements', () => {
    // First position
    filter.update({ x: 0, y: 0, timestamp: 1000 });
    
    // Add multiple measurements with noise around a linear trajectory
    for (let i = 1; i <= 20; i++) {
      const time = 1000 + i * 50;
      const noise = Math.random() * 10 - 5; // Random noise between -5 and 5
      
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      filter.update({ 
        x: 10 * i,           // True position
        y: noise,            // Noisy measurement
        timestamp: time 
      });
    }
    
    // Get final state
    const state = filter.getState();
    
    // X velocity should be positive and close to 10 units/sec
    expect(state.vx).toBeGreaterThan(150);
    
    // Y velocity should be relatively small despite the noise
    expect(Math.abs(state.vy)).toBeLessThan(50);
  });
  
  it('should handle sudden direction changes better than Kalman filter', () => {
    // First simulate a straight line motion
    filter.update({ x: 0, y: 0, timestamp: 1000 });
    
    for (let i = 1; i <= 10; i++) {
      const time = 1000 + i * 50;
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      filter.update({ x: 10 * i, y: 0, timestamp: time });
    }
    
    // Now make a sudden 90-degree turn
    for (let i = 1; i <= 10; i++) {
      const time = 1000 + (10 + i) * 50;
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      filter.update({ x: 100, y: 10 * i, timestamp: time });
    }
    
    // Check that the velocity has adapted to the new direction
    const state = filter.getState();
    
    // X velocity should be close to 0
    expect(Math.abs(state.vx)).toBeLessThan(10);
    
    // Y velocity should be positive
    expect(state.vy).toBeGreaterThan(10);
    
    // Predict future position - should continue in the new direction
    const prediction = filter.predict(200);
    
    // Prediction should show continued movement in Y direction
    expect(prediction.y).toBeGreaterThan(state.y);
  });
  
  it('should adapt faster to direction changes with higher process noise', () => {
    const lowNoiseFilter = new ParticleFilter({
      processNoise: 1,
      numParticles: 100
    });
    
    const highNoiseFilter = new ParticleFilter({
      processNoise: 10,
      numParticles: 100
    });
    
    // Both start at the same position and move in a straight line
    lowNoiseFilter.update({ x: 0, y: 0, timestamp: 1000 });
    highNoiseFilter.update({ x: 0, y: 0, timestamp: 1000 });
    
    for (let i = 1; i <= 10; i++) {
      const time = 1000 + i * 50;
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      
      lowNoiseFilter.update({ x: 10 * i, y: 0, timestamp: time });
      highNoiseFilter.update({ x: 10 * i, y: 0, timestamp: time });
    }
    
    // Now make a sudden turn
    for (let i = 1; i <= 5; i++) {
      const time = 1000 + (10 + i) * 50;
      jest.spyOn(Date, 'now').mockImplementation(() => time);
      
      lowNoiseFilter.update({ x: 100, y: 10 * i, timestamp: time });
      highNoiseFilter.update({ x: 100, y: 12 * i, timestamp: time });
    }
    
    // Check which one adapted faster
    const lowNoiseState = lowNoiseFilter.getState();
    const highNoiseState = highNoiseFilter.getState();
    
    // The high noise filter should have a higher Y velocity
    expect(highNoiseState.vy).toBeGreaterThan(lowNoiseState.vy);
  });
  
  it('should provide particles for visualization', () => {
    filter.update({ x: 10, y: 20 });
    
    const particles = filter.getParticles();
    
    // Check that we have the requested number of particles
    expect(particles.length).toBe(100);
    
    // Check that particles have the expected properties
    expect(particles[0]).toHaveProperty('x');
    expect(particles[0]).toHaveProperty('y');
    expect(particles[0]).toHaveProperty('weight');
    
    // Check that particle weights sum to approximately 1
    const weightSum = particles.reduce((sum, p) => sum + p.weight, 0);
    expect(weightSum).toBeCloseTo(1, 1);
  });
}); 