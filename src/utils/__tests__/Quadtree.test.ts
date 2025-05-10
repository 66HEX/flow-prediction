import { Quadtree } from '../Quadtree';

describe('Quadtree', () => {
  let quadtree: Quadtree;
  
  beforeEach(() => {
    // Create a quadtree for a simulated viewport
    quadtree = new Quadtree({
      x: 0,
      y: 0,
      width: 1000,
      height: 1000
    });
    
    // Clean up any previous DOM elements
    document.body.innerHTML = '';
  });
  
  it('should correctly insert and query elements', () => {
    // Create test elements
    for (let i = 0; i < 10; i++) {
      const link = document.createElement('a');
      link.href = `/page${i}`;
      link.style.position = 'absolute';
      link.style.left = `${i * 100}px`;
      link.style.top = '100px';
      link.style.width = '50px';
      link.style.height = '20px';
      document.body.appendChild(link);
      
      // Mock getBoundingClientRect for the link
      Object.defineProperty(link, 'getBoundingClientRect', {
        value: () => ({
          left: i * 100,
          top: 100,
          right: i * 100 + 50,
          bottom: 120,
          width: 50,
          height: 20,
          x: i * 100,
          y: 100,
        }),
        configurable: true
      });
      
      // Insert into quadtree
      quadtree.insert(link);
    }
    
    // Query for a line that should intersect with links at x=200 to x=400
    const result = quadtree.queryLine(
      { x: 200, y: 100 },
      { x: 400, y: 100 }
    );
    
    // Should return links at x=200, x=300, and x=400
    expect(result.length).toBe(3);
    
    // Verify the href attributes
    const hrefs = result.map(el => el.getAttribute('href')).sort();
    expect(hrefs).toEqual(['/page2', '/page3', '/page4'].sort());
  });
  
  it('should handle a large number of elements efficiently', () => {
    // Create many test elements
    for (let i = 0; i < 100; i++) {
      const link = document.createElement('a');
      link.href = `/page${i}`;
      link.style.position = 'absolute';
      link.style.left = `${(i % 10) * 100}px`;
      link.style.top = `${Math.floor(i / 10) * 50}px`;
      link.style.width = '50px';
      link.style.height = '20px';
      document.body.appendChild(link);
      
      // Mock getBoundingClientRect for the link
      Object.defineProperty(link, 'getBoundingClientRect', {
        value: () => ({
          left: (i % 10) * 100,
          top: Math.floor(i / 10) * 50,
          right: (i % 10) * 100 + 50,
          bottom: Math.floor(i / 10) * 50 + 20,
          width: 50,
          height: 20,
          x: (i % 10) * 100,
          y: Math.floor(i / 10) * 50,
        }),
        configurable: true
      });
      
      // Insert into quadtree
      quadtree.insert(link);
    }
    
    // Start performance measurement
    const startTime = performance.now();
    
    // Query for a diagonal line across the elements
    const result = quadtree.queryLine(
      { x: 0, y: 0 },
      { x: 900, y: 450 }
    );
    
    const endTime = performance.now();
    
    // Should return a subset of the elements
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(100);
    
    // Performance check - should be fast (under 10ms typically)
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(50);
  });
  
  it('should compare favorably to brute force search', () => {
    // Create a grid of test elements
    for (let i = 0; i < 100; i++) {
      const link = document.createElement('a');
      link.href = `/page${i}`;
      link.style.position = 'absolute';
      link.style.left = `${(i % 10) * 100}px`;
      link.style.top = `${Math.floor(i / 10) * 50}px`;
      link.style.width = '50px';
      link.style.height = '20px';
      document.body.appendChild(link);
      
      // Mock getBoundingClientRect for the link
      Object.defineProperty(link, 'getBoundingClientRect', {
        value: () => ({
          left: (i % 10) * 100,
          top: Math.floor(i / 10) * 50,
          right: (i % 10) * 100 + 50,
          bottom: Math.floor(i / 10) * 50 + 20,
          width: 50,
          height: 20,
          x: (i % 10) * 100,
          y: Math.floor(i / 10) * 50,
        }),
        configurable: true
      });
      
      // Insert into quadtree
      quadtree.insert(link);
    }
    
    // Define test line
    const start = { x: 0, y: 0 };
    const end = { x: 900, y: 450 };
    
    // Measure quadtree performance
    const startQuadtreeTime = performance.now();
    const quadtreeResult = quadtree.queryLine(start, end);
    const endQuadtreeTime = performance.now();
    const quadtreeTime = endQuadtreeTime - startQuadtreeTime;
    
    // Brute force approach (checking all elements)
    const startBruteForceTime = performance.now();
    
    // Get all links
    const allLinks = Array.from(document.querySelectorAll('a[href]')) as HTMLElement[];
    
    // Function to check if a line intersects with a rectangle (simplified from Quadtree)
    const lineIntersectsRect = (start: {x: number, y: number}, end: {x: number, y: number}, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      
      // Create a bounding box for the line
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      
      // Check if bounding boxes overlap (simplified)
      if (!(rect.right < minX || rect.left > maxX || rect.bottom < minY || rect.top > maxY)) {
        return true;
      }
      
      return false;
    };
    
    // Check all elements
    const bruteForceResult = allLinks.filter(link => 
      lineIntersectsRect(start, end, link)
    );
    
    const endBruteForceTime = performance.now();
    const bruteForceTime = endBruteForceTime - startBruteForceTime;
    
    // Quadtree should be faster
    expect(quadtreeTime).toBeLessThan(bruteForceTime);
    
    // Results should be consistent (might not be exactly the same due to implementation differences)
    expect(quadtreeResult.length).toBeGreaterThanOrEqual(1);
  });
  
  it('should clear properly', () => {
    // Add some elements
    for (let i = 0; i < 5; i++) {
      const link = document.createElement('a');
      link.href = `/page${i}`;
      
      // Mock getBoundingClientRect
      Object.defineProperty(link, 'getBoundingClientRect', {
        value: () => ({
          left: i * 100,
          top: 100,
          right: i * 100 + 50,
          bottom: 120,
          width: 50,
          height: 20,
          x: i * 100,
          y: 100,
        }),
        configurable: true
      });
      
      document.body.appendChild(link);
      quadtree.insert(link);
    }
    
    // Verify elements exist
    const beforeClear = quadtree.queryLine(
      { x: 0, y: 100 },
      { x: 500, y: 100 }
    );
    expect(beforeClear.length).toBe(5);
    
    // Clear the quadtree
    quadtree.clear();
    
    // Should no longer find elements
    const afterClear = quadtree.queryLine(
      { x: 0, y: 100 },
      { x: 500, y: 100 }
    );
    expect(afterClear.length).toBe(0);
  });
}); 