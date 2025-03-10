import { EventEmitter } from '../utils/EventEmitter';
import { MCPAdapter, MCPAdapterConfig } from './MCPAdapter';
import { ThemeConfig, ThemeInfo, ThemeManager, ThemePlugin, registerTheme } from './ThemeManager';
import { VisualizerConfig } from './types';
import { Simple2DTheme } from '../themes/simple2d/Simple2DTheme';

/**
 * Main class for GooseVisualizer
 */
export class GooseVisualizer extends EventEmitter {
  private config: VisualizerConfig;
  /** @internal - MCPAdapter instance */
  public mcpAdapter: MCPAdapter;
  /** @internal - ThemeManager instance */
  public themeManager: ThemeManager;
  private container: HTMLElement | null = null;
  private width: number;
  private height: number;
  private initialized = false;

  /**
   * Constructor
   * @param config Configuration for the visualizer
   */
  constructor(config: VisualizerConfig) {
    super();

    // Set default configuration
    this.config = {
      mcpServer: config.mcpServer,
      theme: config.theme,
      elementId: config.elementId,
      width: config.width ?? 800,
      height: config.height ?? 600,
      debug: config.debug ?? false,
      autoConnect: config.autoConnect ?? true,
      refreshRate: config.refreshRate ?? 30,
    };

    this.width = this.config.width ?? 800;
    this.height = this.config.height ?? 600;

    // Create MCP adapter
    const mcpConfig: MCPAdapterConfig = {
      serverUrl: this.config.mcpServer,
      autoReconnect: true,
    };
    this.mcpAdapter = new MCPAdapter(mcpConfig);

    // Create theme manager
    this.themeManager = new ThemeManager();
    
    // Note: Themes are now registered in their respective index.ts files
    // We'll let the user register themes explicitly via plugins

    // Forward events from MCP adapter and theme manager
    this.forwardEvents();
  }

  /**
   * Initialize the visualizer
   * @returns Promise that resolves when initialized
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Get the container element
    this.container = document.getElementById(this.config.elementId);
    if (!this.container) {
      throw new Error(`Element with ID ${this.config.elementId} not found`);
    }

    // Set the container size
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';

    // Load the theme if specified
    if (this.config.theme) {
      const theme = await this.themeManager.loadTheme(
        this.config.theme,
        this.config.elementId,
        this.width,
        this.height
      );
      
      // Ensure the animation loop is started
      theme.startAnimationLoop();
    }

    // Set up window resize handler
    window.addEventListener('resize', this.handleWindowResize);

    this.initialized = true;
  }

  /**
   * Start the visualizer
   * @returns Promise that resolves when started
   */
  public async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Connect to the MCP server if autoConnect is enabled
    if (this.config.autoConnect) {
      await this.connect();
    }
  }

  /**
   * Stop the visualizer
   */
  public stop(): void {
    // Disconnect from the MCP server
    this.mcpAdapter.disconnect();

    // Clean up the theme
    const activeTheme = this.themeManager.getActiveTheme();
    if (activeTheme) {
      activeTheme.cleanup();
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleWindowResize);

    this.initialized = false;
  }

  /**
   * Connect to the MCP server
   * @returns Promise that resolves when connected
   */
  public async connect(): Promise<void> {
    await this.mcpAdapter.connect();
  }

  /**
   * Disconnect from the MCP server
   */
  public disconnect(): void {
    this.mcpAdapter.disconnect();
  }

  /**
   * Set the active theme
   * @param themeName Name of the theme to set
   * @param config Optional theme configuration
   * @returns Promise that resolves when the theme is loaded
   */
  public async setTheme(themeName: string, config?: ThemeConfig): Promise<void> {
    if (!this.initialized) {
      throw new Error('Visualizer not initialized');
    }

    await this.themeManager.loadTheme(
      themeName,
      this.config.elementId,
      this.width,
      this.height,
      config
    );
  }
  
  /**
   * Register a theme
   * @param themeInfo Theme information
   */
  public registerTheme(themeInfo: ThemeInfo): void {
    this.themeManager.registerTheme(themeInfo);
  }
  
  /**
   * Register a theme plugin
   * @param plugin Theme plugin
   */
  public registerThemePlugin(plugin: ThemePlugin): void {
    this.themeManager.registerThemePlugin(plugin);
  }
  
  /**
   * Unregister a theme
   * @param themeName Name of the theme to unregister
   * @returns True if theme was unregistered, false if not found
   */
  public unregisterTheme(themeName: string): boolean {
    return this.themeManager.unregisterTheme(themeName);
  }

  /**
   * Get the active theme name
   * @returns Name of the active theme
   */
  public getTheme(): string {
    const activeTheme = this.themeManager.getActiveTheme();
    return activeTheme ? activeTheme.name : '';
  }

  /**
   * Get the available themes
   * @returns Array of theme names
   */
  public getAvailableThemes(): string[] {
    return this.themeManager.getThemes().map((theme) => theme.name);
  }

  /**
   * Resize the visualizer
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    if (this.container) {
      this.container.style.width = `${width}px`;
      this.container.style.height = `${height}px`;
    }

    const activeTheme = this.themeManager.getActiveTheme();
    if (activeTheme) {
      activeTheme.handleResize(width, height);
    }
  }

  /**
   * Handle window resize event
   */
  private handleWindowResize = (): void => {
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      this.resize(rect.width, rect.height);
    }
  };

  /**
   * Forward events from MCP adapter and theme manager
   */
  private forwardEvents(): void {
    // Forward events from MCP adapter
    this.mcpAdapter.on('*', (event) => {
      this.emit(event);
    });

    // Forward events from theme manager
    this.themeManager.on('*', (event) => {
      this.emit(event);
    });
  }
}