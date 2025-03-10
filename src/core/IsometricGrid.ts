/**
 * Isometric grid system for managing positions and entities in an isometric environment
 */

import { Position, Size, VisualEntity } from './types';
import { gridToIso, isoToGrid, calculateDepth } from '../utils/IsometricUtils';

export type GridCell = {
  x: number;
  y: number;
  z: number;
  walkable: boolean;
  entities: VisualEntity[];
  type: 'floor' | 'wall' | 'object' | 'empty';
};

export interface GridConfig {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  originX?: number;  // Screen X for the origin point (0,0)
  originY?: number;  // Screen Y for the origin point (0,0)
}

export class IsometricGrid {
  private grid: GridCell[][][];
  private config: GridConfig;
  
  constructor(config: GridConfig) {
    this.config = {
      ...config,
      originX: config.originX || 0,
      originY: config.originY || 0
    };
    
    // Initialize the grid
    this.grid = [];
    this.initializeGrid();
  }
  
  /**
   * Initialize the grid with empty cells
   */
  private initializeGrid(): void {
    const { width, height } = this.config;
    
    // Initialize 3D grid structure
    for (let x = 0; x < width; x++) {
      this.grid[x] = [];
      for (let y = 0; y < height; y++) {
        this.grid[x][y] = [];
        // Start with a single layer (z=0)
        this.grid[x][y][0] = {
          x,
          y,
          z: 0,
          walkable: true,
          entities: [],
          type: 'floor'
        };
      }
    }
  }
  
  /**
   * Check if coordinates are within grid bounds
   */
  isInBounds(x: number, y: number, z: number = 0): boolean {
    const { width, height } = this.config;
    return x >= 0 && x < width && y >= 0 && y < height && z >= 0;
  }
  
  /**
   * Get a cell at specific coordinates
   */
  getCell(x: number, y: number, z: number = 0): GridCell | null {
    if (!this.isInBounds(x, y, z)) {
      return null;
    }
    
    // Ensure the z-level exists
    if (!this.grid[x][y][z]) {
      this.grid[x][y][z] = {
        x,
        y,
        z,
        walkable: z === 0, // Only ground level (z=0) is walkable by default
        entities: [],
        type: z === 0 ? 'floor' : 'empty'
      };
    }
    
    return this.grid[x][y][z];
  }
  
  /**
   * Convert grid coordinates to screen coordinates
   */
  gridToScreen(x: number, y: number, z: number = 0): Position {
    const { tileWidth, tileHeight, originX, originY } = this.config;
    const isoPos = gridToIso(x, y, tileWidth, tileHeight);
    
    // Apply grid origin offset and height adjustment
    return {
      x: isoPos.x + originX!,
      y: isoPos.y + originY! - (z * tileHeight / 2),
      z
    };
  }
  
  /**
   * Convert screen coordinates to grid coordinates
   */
  screenToGrid(x: number, y: number): Position {
    const { tileWidth, tileHeight, originX, originY } = this.config;
    
    // Remove origin offset
    const adjustedX = x - originX!;
    const adjustedY = y - originY!;
    
    return isoToGrid(adjustedX, adjustedY, tileWidth, tileHeight);
  }
  
  /**
   * Place an entity on the grid
   */
  placeEntity(entity: VisualEntity, x: number, y: number, z: number = 0): boolean {
    const cell = this.getCell(x, y, z);
    if (!cell) {
      return false;
    }
    
    // Update entity position
    const screenPos = this.gridToScreen(x, y, z);
    entity.position = screenPos;
    entity.zIndex = calculateDepth(x, y) + z * 100; // Higher z levels get higher zIndex
    
    // Add to cell
    cell.entities.push(entity);
    
    return true;
  }
  
  /**
   * Remove an entity from the grid
   */
  removeEntity(entityId: string): boolean {
    // Search through the grid to find the entity
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        for (let z = 0; z < this.grid[x][y].length; z++) {
          const cell = this.grid[x][y][z];
          if (!cell) continue;
          
          const entityIndex = cell.entities.findIndex(e => e.id === entityId);
          if (entityIndex >= 0) {
            cell.entities.splice(entityIndex, 1);
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Set a cell's walkable property
   */
  setWalkable(x: number, y: number, z: number, walkable: boolean): void {
    const cell = this.getCell(x, y, z);
    if (cell) {
      cell.walkable = walkable;
    }
  }
  
  /**
   * Set a cell's type
   */
  setCellType(x: number, y: number, z: number, type: GridCell['type']): void {
    const cell = this.getCell(x, y, z);
    if (cell) {
      cell.type = type;
      
      // Update walkability based on type
      if (type === 'wall' || type === 'object') {
        cell.walkable = false;
      }
    }
  }
  
  /**
   * Check if a position is walkable
   */
  isWalkable(x: number, y: number, z: number = 0): boolean {
    const cell = this.getCell(x, y, z);
    return cell ? cell.walkable : false;
  }
  
  /**
   * Get all entities in the grid
   */
  getAllEntities(): VisualEntity[] {
    const entities: VisualEntity[] = [];
    
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        for (let z = 0; z < this.grid[x][y].length; z++) {
          const cell = this.grid[x][y][z];
          if (cell) {
            entities.push(...cell.entities);
          }
        }
      }
    }
    
    // Sort by zIndex for proper rendering order
    return entities.sort((a, b) => a.zIndex! - b.zIndex!);
  }
  
  /**
   * Get the grid configuration
   */
  getConfig(): GridConfig {
    return { ...this.config };
  }
  
  /**
   * Create a simple floor grid with walls around the perimeter
   */
  createBasicOfficeFloor(): void {
    const { width, height } = this.config;
    
    // Create floor cells
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Get the cell at this position
        const cell = this.getCell(x, y, 0);
        if (cell) {
          // Set floor type for all cells
          cell.type = 'floor';
          cell.walkable = true;
          
          // Add walls around the perimeter
          if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
            // Create wall at z=1
            const wallCell = this.getCell(x, y, 1);
            if (wallCell) {
              wallCell.type = 'wall';
              wallCell.walkable = false;
            }
          }
        }
      }
    }
  }
}