/**
 * Sprite management utilities for isometric visualization
 */

export interface SpriteConfig {
  id: string;
  src: string;
  width: number;
  height: number;
  frames?: number; // For animations
  frameWidth?: number; // Width of a single frame
  frameHeight?: number; // Height of a single frame
  frameRate?: number; // Frames per second for animation
}

export class SpriteManager {
  private sprites: Map<string, HTMLImageElement> = new Map();
  private spriteConfigs: Map<string, SpriteConfig> = new Map();
  private loaded: boolean = false;
  private onLoadCallback: (() => void) | null = null;

  // Singleton instance
  private static instance: SpriteManager;

  // Get the singleton instance
  public static getInstance(): SpriteManager {
    if (!SpriteManager.instance) {
      SpriteManager.instance = new SpriteManager();
    }
    return SpriteManager.instance;
  }

  // Private constructor for singleton
  private constructor() {}

  /**
   * Register sprites for loading
   * @param sprites Array of sprite configurations
   */
  public registerSprites(sprites: SpriteConfig[]): void {
    sprites.forEach(sprite => {
      this.spriteConfigs.set(sprite.id, sprite);
    });
  }

  /**
   * Load all registered sprites
   * @returns Promise that resolves when all sprites are loaded
   */
  public loadSprites(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Count of sprites to load
      const totalSprites = this.spriteConfigs.size;
      
      if (totalSprites === 0) {
        this.loaded = true;
        resolve();
        return;
      }

      let loadedCount = 0;
      this.spriteConfigs.forEach((config, id) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalSprites) {
            this.loaded = true;
            if (this.onLoadCallback) {
              this.onLoadCallback();
            }
            resolve();
          }
        };
        
        img.onerror = (err) => {
          console.error(`Failed to load sprite: ${id}`, err);
          loadedCount++;
          if (loadedCount === totalSprites) {
            this.loaded = true;
            if (this.onLoadCallback) {
              this.onLoadCallback();
            }
            resolve();
          }
        };
        
        img.src = config.src;
        this.sprites.set(id, img);
      });
    });
  }

  /**
   * Get a sprite by ID
   * @param id Sprite ID
   * @returns The sprite image or null if not found
   */
  public getSprite(id: string): HTMLImageElement | null {
    return this.sprites.get(id) || null;
  }

  /**
   * Get a sprite configuration by ID
   * @param id Sprite ID
   * @returns The sprite configuration or null if not found
   */
  public getSpriteConfig(id: string): SpriteConfig | null {
    return this.spriteConfigs.get(id) || null;
  }

  /**
   * Check if all sprites are loaded
   * @returns True if all sprites are loaded
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Set a callback to be called when all sprites are loaded
   * @param callback Callback function
   */
  public onLoad(callback: () => void): void {
    this.onLoadCallback = callback;
    if (this.loaded && this.onLoadCallback) {
      this.onLoadCallback();
    }
  }

  /**
   * Draw a sprite to a canvas context
   * @param ctx Canvas context
   * @param id Sprite ID
   * @param x X position
   * @param y Y position
   * @param width Width to draw (optional, defaults to sprite width)
   * @param height Height to draw (optional, defaults to sprite height)
   * @param frame Frame number for animated sprites (optional)
   */
  public drawSprite(
    ctx: CanvasRenderingContext2D,
    id: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
    frame?: number
  ): void {
    const sprite = this.sprites.get(id);
    const config = this.spriteConfigs.get(id);
    
    if (!sprite || !config) {
      // Fall back to drawing a colored rectangle
      ctx.fillStyle = '#ff00ff'; // Magenta for missing sprites
      ctx.fillRect(x - 10, y - 10, width || 20, height || 20);
      return;
    }
    
    // If this is an animated sprite with multiple frames
    if (config.frames && config.frames > 1 && config.frameWidth && config.frameHeight && frame !== undefined) {
      const frameX = (frame % config.frames) * config.frameWidth;
      ctx.drawImage(
        sprite,
        frameX, 0, // Source x,y
        config.frameWidth, config.frameHeight, // Source width, height
        x - (width || config.frameWidth) / 2, y - (height || config.frameHeight), // Destination x,y (centered)
        width || config.frameWidth, height || config.frameHeight // Destination width, height
      );
    } else {
      // Regular sprite
      ctx.drawImage(
        sprite,
        x - (width || config.width) / 2, y - (height || config.height), // Destination x,y (centered)
        width || config.width, height || config.height // Destination width, height
      );
    }
  }
}