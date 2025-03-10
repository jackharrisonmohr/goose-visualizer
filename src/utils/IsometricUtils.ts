/**
 * Utility functions for isometric transformations and calculations
 */

import { Position } from '../core/types';

/**
 * Convert 2D grid coordinates to isometric screen coordinates
 * @param gridX X position in the grid
 * @param gridY Y position in the grid
 * @param tileWidth Width of a grid tile
 * @param tileHeight Height of a grid tile
 * @returns Screen position in pixels
 */
export function gridToIso(gridX: number, gridY: number, tileWidth: number, tileHeight: number): Position {
  // Isometric projection: the X axis runs diagonally from bottom-left to top-right,
  // and the Y axis runs diagonally from top-left to bottom-right
  const x = (gridX - gridY) * (tileWidth / 2);
  const y = (gridX + gridY) * (tileHeight / 2);
  
  return { x, y };
}

/**
 * Convert isometric screen coordinates to 2D grid coordinates
 * @param screenX X position on screen
 * @param screenY Y position on screen
 * @param tileWidth Width of a grid tile
 * @param tileHeight Height of a grid tile
 * @returns Grid position
 */
export function isoToGrid(screenX: number, screenY: number, tileWidth: number, tileHeight: number): Position {
  // Inverse of the isometric projection
  const gridX = (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2;
  const gridY = (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2;
  
  return { x: Math.round(gridX), y: Math.round(gridY) };
}

/**
 * Calculate depth (z-index) based on grid position for proper rendering order
 * @param gridX X position in the grid
 * @param gridY Y position in the grid
 * @returns Depth value for sorting
 */
export function calculateDepth(gridX: number, gridY: number): number {
  // In isometric view, objects further away (higher X+Y) should be rendered first
  return gridX + gridY;
}

/**
 * Calculates the screen position for an entity with height
 * @param gridX X position in the grid
 * @param gridY Y position in the grid
 * @param gridZ Z position (height) in the grid
 * @param tileWidth Width of a grid tile
 * @param tileHeight Height of a grid tile
 * @returns Screen position in pixels
 */
export function gridToIsoWithHeight(
  gridX: number, 
  gridY: number, 
  gridZ: number, 
  tileWidth: number, 
  tileHeight: number
): Position {
  const basePosition = gridToIso(gridX, gridY, tileWidth, tileHeight);
  
  // Adjust Y upward based on height (Z)
  const z = gridZ * (tileHeight / 2);
  
  return {
    x: basePosition.x,
    y: basePosition.y - z,
    z: gridZ
  };
}

/**
 * Calculate a path between two grid points
 * @param startX Starting X grid position
 * @param startY Starting Y grid position
 * @param endX Ending X grid position
 * @param endY Ending Y grid position
 * @param gridWidth Width of the grid
 * @param gridHeight Height of the grid
 * @param obstacles Array of obstacle positions
 * @returns Array of positions forming a path, or null if no path is found
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  gridWidth: number,
  gridHeight: number,
  obstacles: Position[] = []
): Position[] | null {
  // Simple direct path for now - we can implement A* pathfinding later
  // This is a placeholder for a more sophisticated pathfinding algorithm
  const path: Position[] = [];
  
  // Check if direct path is possible (no obstacles)
  const isObstacle = (x: number, y: number) => 
    obstacles.some(obs => obs.x === x && obs.y === y);
  
  if (isObstacle(endX, endY)) {
    return null; // Target is an obstacle
  }
  
  // Start with current position
  let currentX = startX;
  let currentY = startY;
  
  // Add starting position
  path.push({ x: currentX, y: currentY });
  
  // Simple approach - move X, then move Y
  while (currentX !== endX || currentY !== endY) {
    // Move in X direction
    if (currentX < endX) {
      currentX++;
    } else if (currentX > endX) {
      currentX--;
    }
    // If X matches, move in Y direction
    else if (currentY < endY) {
      currentY++;
    } else if (currentY > endY) {
      currentY--;
    }
    
    // Check if this position is an obstacle
    if (isObstacle(currentX, currentY)) {
      return null; // Path blocked
    }
    
    // Add to path
    path.push({ x: currentX, y: currentY });
  }
  
  return path;
}