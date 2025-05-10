/**
 * Rectangle interface for representing bounds
 */
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Item stored in the quadtree with its bounding box
 */
interface QuadtreeItem {
  element: HTMLElement;
  bounds: Rectangle;
}

/**
 * Quadtree implementation for spatial indexing of DOM elements
 * Used to efficiently query elements that might intersect with a line or region
 */
export class Quadtree {
  private items: QuadtreeItem[] = [];
  private divided: boolean = false;
  private northWest: Quadtree | null = null;
  private northEast: Quadtree | null = null;
  private southWest: Quadtree | null = null;
  private southEast: Quadtree | null = null;
  private bounds: Rectangle;
  private capacity: number;
  private maxDepth: number;
  private depth: number;

  /**
   * Create a new quadtree with the given bounds and parameters
   * @param bounds The rectangle bounds of this quadtree node
   * @param capacity Maximum number of items before subdivision
   * @param maxDepth Maximum depth of the tree
   * @param depth Current depth of this node
   */
  constructor(bounds: Rectangle, capacity: number = 4, maxDepth: number = 5, depth: number = 0) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = depth;
  }

  /**
   * Insert an element into the quadtree
   * @param element DOM element to insert
   * @returns Whether the element was successfully inserted
   */
  insert(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const bounds = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };

    // Check if element is within quadtree bounds
    if (!this.intersects(bounds, this.bounds)) {
      return false;
    }

    const item = { element, bounds };

    // If there's capacity and not divided yet, add the item
    if (this.items.length < this.capacity && !this.divided && this.depth < this.maxDepth) {
      this.items.push(item);
      return true;
    }

    // Otherwise, subdivide and add to children
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert into children
    if (this.northWest!.insert(element)) return true;
    if (this.northEast!.insert(element)) return true;
    if (this.southWest!.insert(element)) return true;
    if (this.southEast!.insert(element)) return true;

    // If can't insert into children, add to this node
    if (this.depth < this.maxDepth) {
      this.items.push(item);
      return true;
    }

    return false;
  }

  /**
   * Subdivide the quadtree into four quadrants
   */
  private subdivide(): void {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;
    const nextDepth = this.depth + 1;

    this.northWest = new Quadtree({ x, y, width: w, height: h }, this.capacity, this.maxDepth, nextDepth);
    this.northEast = new Quadtree({ x: x + w, y, width: w, height: h }, this.capacity, this.maxDepth, nextDepth);
    this.southWest = new Quadtree({ x, y: y + h, width: w, height: h }, this.capacity, this.maxDepth, nextDepth);
    this.southEast = new Quadtree({ x: x + w, y: y + h, width: w, height: h }, this.capacity, this.maxDepth, nextDepth);

    this.divided = true;

    // Move existing items to children where possible
    for (const item of this.items) {
      if (this.northWest.insert(item.element)) continue;
      if (this.northEast.insert(item.element)) continue;
      if (this.southWest.insert(item.element)) continue;
      if (this.southEast.insert(item.element)) continue;
    }
  }

  /**
   * Query elements that might intersect with a line from start to end
   * @param start Starting point of the line
   * @param end Ending point of the line
   * @returns Array of elements that might intersect with the line
   */
  queryLine(start: { x: number, y: number }, end: { x: number, y: number }): HTMLElement[] {
    // For exact horizontal and vertical lines, use special logic
    if (start.x === end.x || start.y === end.y) {
      return this.queryExactLine(start, end);
    }
    
    // Create a bounding box around the line
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // If the line doesn't intersect with this quadtree, return empty array
    if (!this.intersects(bounds, this.bounds)) {
      return [];
    }

    // Check all items in this quadtree
    const potentialElements: HTMLElement[] = [];
    
    for (const item of this.items) {
      if (this.lineIntersectsRect(start, end, item.bounds)) {
        potentialElements.push(item.element);
      }
    }

    // If divided, check children
    if (this.divided) {
      potentialElements.push(...this.northWest!.queryLine(start, end));
      potentialElements.push(...this.northEast!.queryLine(start, end));
      potentialElements.push(...this.southWest!.queryLine(start, end));
      potentialElements.push(...this.southEast!.queryLine(start, end));
    }

    return this.removeDuplicates(potentialElements);
  }

  /**
   * Handle exact horizontal or vertical lines more precisely
   */
  private queryExactLine(start: { x: number, y: number }, end: { x: number, y: number }): HTMLElement[] {
    // Create a bounding box around the line
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX || 1, // Ensure non-zero width
      height: maxY - minY || 1  // Ensure non-zero height
    };

    // If the line doesn't intersect with this quadtree, return empty array
    if (!this.intersects(bounds, this.bounds)) {
      return [];
    }

    // Check all items in this quadtree
    const potentialElements: HTMLElement[] = [];
    
    for (const item of this.items) {
      if (this.exactLineIntersectsRect(start, end, item.bounds)) {
        potentialElements.push(item.element);
      }
    }

    // If divided, check children
    if (this.divided) {
      potentialElements.push(...this.northWest!.queryExactLine(start, end));
      potentialElements.push(...this.northEast!.queryExactLine(start, end));
      potentialElements.push(...this.southWest!.queryExactLine(start, end));
      potentialElements.push(...this.southEast!.queryExactLine(start, end));
    }

    return this.removeDuplicates(potentialElements);
  }

  /**
   * More precise check for exactly horizontal/vertical lines
   */
  private exactLineIntersectsRect(
    start: { x: number, y: number },
    end: { x: number, y: number },
    rect: Rectangle
  ): boolean {
    // For horizontal lines (same y)
    if (start.y === end.y) {
      const y = start.y;
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      
      // Check if horizontal line intersects the rectangle
      return (
        y >= rect.y && 
        y <= rect.y + rect.height && 
        !(maxX < rect.x || minX > rect.x + rect.width)
      );
    }
    
    // For vertical lines (same x)
    if (start.x === end.x) {
      const x = start.x;
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      
      // Check if vertical line intersects the rectangle
      return (
        x >= rect.x && 
        x <= rect.x + rect.width && 
        !(maxY < rect.y || minY > rect.y + rect.height)
      );
    }
    
    return false;
  }

  /**
   * Remove duplicates from an array of elements
   */
  private removeDuplicates(elements: HTMLElement[]): HTMLElement[] {
    // Use a Map to track seen elements
    const seen = new Map<HTMLElement, boolean>();
    const result: HTMLElement[] = [];
    
    for (const element of elements) {
      if (!seen.has(element)) {
        seen.set(element, true);
        result.push(element);
      }
    }
    
    return result;
  }

  /**
   * Helper function to check if two rectangles intersect
   */
  private intersects(rectA: Rectangle, rectB: Rectangle): boolean {
    return !(
      rectA.x + rectA.width < rectB.x ||
      rectB.x + rectB.width < rectA.x ||
      rectA.y + rectA.height < rectB.y ||
      rectB.y + rectB.height < rectA.y
    );
  }

  /**
   * Helper function to check if a line intersects with a rectangle
   */
  private lineIntersectsRect(
    start: { x: number, y: number },
    end: { x: number, y: number },
    rect: Rectangle
  ): boolean {
    // Check if either endpoint is inside the rectangle
    if (this.pointInRect(start, rect) || this.pointInRect(end, rect)) {
      return true;
    }

    // For horizontal/vertical lines, we need a more precise check
    if (start.x === end.x) {
      // Vertical line - check if it intersects with horizontal edges
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      
      return (
        start.x >= rect.x && 
        start.x <= rect.x + rect.width && 
        maxY >= rect.y && 
        minY <= rect.y + rect.height
      );
    } else if (start.y === end.y) {
      // Horizontal line - check if it intersects with vertical edges
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      
      return (
        start.y >= rect.y && 
        start.y <= rect.y + rect.height && 
        maxX >= rect.x && 
        minX <= rect.x + rect.width
      );
    }
    
    // For diagonal lines, check if the line intersects any of the rectangle's edges
    const rectPoints = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];

    for (let i = 0; i < 4; i++) {
      const p1 = rectPoints[i];
      const p2 = rectPoints[(i + 1) % 4];
      if (this.lineIntersectsLine(start, end, p1, p2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper function to check if a point is inside a rectangle
   */
  private pointInRect(
    point: { x: number, y: number },
    rect: Rectangle
  ): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  /**
   * Helper function to check if two lines intersect
   */
  private lineIntersectsLine(
    a: { x: number, y: number },
    b: { x: number, y: number },
    c: { x: number, y: number },
    d: { x: number, y: number }
  ): boolean {
    const denominator = ((d.y - c.y) * (b.x - a.x)) - ((d.x - c.x) * (b.y - a.y));
    
    if (denominator === 0) {
      return false;
    }
    
    const ua = (((d.x - c.x) * (a.y - c.y)) - ((d.y - c.y) * (a.x - c.x))) / denominator;
    const ub = (((b.x - a.x) * (a.y - c.y)) - ((b.y - a.y) * (a.x - c.x))) / denominator;
    
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  /**
   * Clear the quadtree
   */
  clear(): void {
    this.items = [];
    this.divided = false;
    this.northWest = null;
    this.northEast = null;
    this.southWest = null;
    this.southEast = null;
  }
} 