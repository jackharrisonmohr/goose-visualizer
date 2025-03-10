import { ThemeErrorEvent, ThemeEventType, ThemeLoadedEvent } from '../events/EventTypes';
import { VisualizationTheme } from './VisualizationTheme';

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  name: string;
  options?: {
    [key: string]: any;
  };
}

/**
 * Theme plugin module interface
 */
export interface ThemePlugin {
  /**
   * Unique name of the theme
   */
  name: string;
  
  /**
   * Human-readable description
   */
  description: string;
  
  /**
   * URL to a thumbnail image
   */
  thumbnailUrl?: string;
  
  /**
   * Version of the theme
   */
  version: string;
  
  /**
   * Author information
   */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  
  /**
   * Factory function to create a theme instance
   */
  createTheme: (config?: ThemeConfig) => VisualizationTheme;
  
  /**
   * Schema for theme configuration options
   */
  configSchema?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'object';
      defaultValue?: any;
      description?: string;
      required?: boolean;
      options?: string[] | number[]; // For select type
    };
  };
}

/**
 * Theme registration information
 */
export interface ThemeInfo {
  name: string;
  description: string;
  thumbnailUrl?: string;
  version: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  factory: (config?: ThemeConfig) => VisualizationTheme;
  configSchema?: ThemePlugin['configSchema'];
}

/**
 * Manager for visualization themes
 */
export class ThemeManager {
  private themes: Map<string, ThemeInfo> = new Map();
  private activeTheme: VisualizationTheme | null = null;
  private eventHandlers: Map<string, Array<(event: any) => void>> = new Map();

  /**
   * Register a new theme
   * @param themeInfo Theme registration information
   */
  public registerTheme(themeInfo: ThemeInfo): void {
    if (this.themes.has(themeInfo.name)) {
      throw new Error(`Theme ${themeInfo.name} is already registered`);
    }
    this.themes.set(themeInfo.name, themeInfo);
    
    // Emit theme registered event
    this.emit({
      type: ThemeEventType.REGISTERED,
      themeName: themeInfo.name,
      themeInfo,
      timestamp: Date.now()
    });
  }
  
  /**
   * Register a theme plugin
   * @param plugin Theme plugin to register
   */
  public registerThemePlugin(plugin: ThemePlugin): void {
    // Create theme info from plugin
    const themeInfo: ThemeInfo = {
      name: plugin.name,
      description: plugin.description,
      thumbnailUrl: plugin.thumbnailUrl,
      version: plugin.version,
      author: plugin.author,
      configSchema: plugin.configSchema,
      factory: plugin.createTheme
    };
    
    // Register the theme
    this.registerTheme(themeInfo);
  }
  
  /**
   * Unregister a theme
   * @param themeName Name of the theme to unregister
   * @returns True if theme was unregistered, false if not found
   */
  public unregisterTheme(themeName: string): boolean {
    if (!this.themes.has(themeName)) {
      return false;
    }
    
    // Cannot unregister active theme
    if (this.activeTheme && this.activeTheme.name === themeName) {
      throw new Error(`Cannot unregister active theme ${themeName}`);
    }
    
    const result = this.themes.delete(themeName);
    
    // Emit theme unregistered event
    if (result) {
      this.emit({
        type: ThemeEventType.UNREGISTERED,
        themeName,
        timestamp: Date.now()
      });
    }
    
    return result;
  }

  /**
   * Get information about all registered themes
   * @returns Array of theme information
   */
  public getThemes(): ThemeInfo[] {
    return Array.from(this.themes.values());
  }

  /**
   * Load a theme
   * @param themeName Name of the theme to load
   * @param containerId ID of the container element
   * @param width Width of the visualization
   * @param height Height of the visualization
   * @param config Optional theme configuration
   * @returns The loaded theme
   */
  public async loadTheme(
    themeName: string,
    containerId: string,
    width: number,
    height: number,
    config?: ThemeConfig
  ): Promise<VisualizationTheme> {
    // Clean up the current theme if there is one
    if (this.activeTheme) {
      this.activeTheme.cleanup();
      this.activeTheme = null;
    }

    // Get the theme info
    const themeInfo = this.themes.get(themeName);
    if (!themeInfo) {
      const error = new Error(`Theme ${themeName} is not registered`);
      this.emit({
        type: ThemeEventType.ERROR,
        themeName,
        error,
        timestamp: Date.now(),
      } as ThemeErrorEvent);
      throw error;
    }

    try {
      // Prepare theme configuration
      const themeConfig: ThemeConfig = config || { name: themeName };
      
      // Validate the theme configuration against the schema if provided
      if (themeInfo.configSchema && themeConfig.options) {
        this.validateThemeConfig(themeConfig.options, themeInfo.configSchema);
      }
      
      // Create the theme instance with configuration
      const theme = themeInfo.factory(themeConfig);
      
      // Initialize the theme
      await theme.initialize(containerId, width, height);
      
      // Start the animation loop
      theme.startAnimationLoop();
      
      // Set the active theme
      this.activeTheme = theme;
      
      // Emit the theme loaded event
      this.emit({
        type: ThemeEventType.LOADED,
        themeName,
        config: themeConfig,
        timestamp: Date.now(),
      } as ThemeLoadedEvent);
      
      return theme;
    } catch (error) {
      this.emit({
        type: ThemeEventType.ERROR,
        themeName,
        error,
        timestamp: Date.now(),
      } as ThemeErrorEvent);
      throw error;
    }
  }
  
  /**
   * Validate theme configuration against schema
   * @param config Configuration options
   * @param schema Configuration schema
   * @throws Error if validation fails
   */
  private validateThemeConfig(config: { [key: string]: any }, schema: ThemePlugin['configSchema']): void {
    if (!schema) return;
    
    // Check for required options
    for (const [key, def] of Object.entries(schema)) {
      if (def.required && config[key] === undefined) {
        throw new Error(`Missing required theme configuration option: ${key}`);
      }
      
      // Type validation
      if (config[key] !== undefined) {
        switch (def.type) {
          case 'string':
            if (typeof config[key] !== 'string') {
              throw new Error(`Theme configuration option ${key} must be a string`);
            }
            break;
          case 'number':
            if (typeof config[key] !== 'number') {
              throw new Error(`Theme configuration option ${key} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof config[key] !== 'boolean') {
              throw new Error(`Theme configuration option ${key} must be a boolean`);
            }
            break;
          case 'select':
            if (!def.options?.includes(config[key])) {
              throw new Error(`Theme configuration option ${key} must be one of: ${def.options?.join(', ')}`);
            }
            break;
          case 'color':
            // Simple validation for color - should be a string starting with #
            if (typeof config[key] !== 'string' || !config[key].startsWith('#')) {
              throw new Error(`Theme configuration option ${key} must be a valid color (hex format)`);
            }
            break;
          case 'object':
            if (typeof config[key] !== 'object' || config[key] === null) {
              throw new Error(`Theme configuration option ${key} must be an object`);
            }
            break;
        }
      }
    }
  }

  /**
   * Get the active theme
   * @returns The active theme, or null if no theme is active
   */
  public getActiveTheme(): VisualizationTheme | null {
    return this.activeTheme;
  }

  /**
   * Subscribe to events
   * @param eventType Event type to subscribe to
   * @param handler Event handler function
   */
  public on(eventType: string, handler: (event: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Unsubscribe from events
   * @param eventType Event type to unsubscribe from
   * @param handler Event handler function
   */
  public off(eventType: string, handler: (event: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }
    const handlers = this.eventHandlers.get(eventType)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit an event
   * @param event Event to emit
   */
  private emit(event: any): void {
    if (!this.eventHandlers.has(event.type)) {
      return;
    }
    const handlers = this.eventHandlers.get(event.type)!;
    for (const handler of handlers) {
      handler(event);
    }
  }
}

// Singleton instance
export const themeManager = new ThemeManager();

/**
 * Register a theme with the theme manager
 * @param name Theme name
 * @param description Theme description
 * @param factory Theme factory function
 * @param thumbnailUrl Optional thumbnail URL
 */
export function registerTheme(
  name: string,
  description: string,
  factory: () => VisualizationTheme,
  thumbnailUrl?: string
): void {
  themeManager.registerTheme({
    name,
    description,
    factory,
    thumbnailUrl,
  });
}