/**
 * Coder Café isometric environment theme
 * A cozy café setting where AI agents work on code and collaborate
 */

import { BaseTheme } from '../../core/VisualizationTheme';
import { Agent, Message, Position, Size, Task, VisualEntity } from '../../core/types';
import { IsometricGrid, GridConfig } from '../../core/IsometricGrid';
import { SpriteManager, SpriteConfig } from '../../utils/SpriteManager';

// Configuration options for the coder café theme
export interface CoderCafeConfig {
  // Grid settings
  gridWidth: number;
  gridHeight: number;
  tileWidth: number;
  tileHeight: number;
  
  // Visual settings
  floorColor: string;
  wallColor: string;
  agentScale: number;
  
  // Animation settings
  moveSpeed: number;
  
  // Environment settings
  showGrid: boolean;
  enableShadows: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

// Default coder café configuration
const DEFAULT_CONFIG: CoderCafeConfig = {
  gridWidth: 15,
  gridHeight: 15,
  tileWidth: 64,
  tileHeight: 32,
  floorColor: '#e8d4b9', // Wooden floor color
  wallColor: '#a67c52',  // Wooden wall color
  agentScale: 1.0,
  moveSpeed: 300, // ms per tile
  showGrid: false,
  enableShadows: true,
  timeOfDay: 'afternoon'
};

// Sprite definitions for the coder café theme
const SPRITE_CONFIGS: SpriteConfig[] = [
  // Floor and structure sprites
  { id: 'floor-wood', src: '../assets/isometric/sprites/floor-wood.png', width: 64, height: 32 },
  { id: 'wall-cafe', src: '../assets/isometric/sprites/wall-cafe.png', width: 64, height: 64 },
  { id: 'window', src: '../assets/isometric/sprites/window.png', width: 64, height: 64 },
  { id: 'door', src: '../assets/isometric/sprites/door.png', width: 64, height: 64 },
  
  // Furniture sprites
  { id: 'table-small', src: '../assets/isometric/sprites/table-small.png', width: 64, height: 48 },
  { id: 'table-large', src: '../assets/isometric/sprites/table-large.png', width: 128, height: 64 },
  { id: 'chair', src: '../assets/isometric/sprites/chair.png', width: 40, height: 60 },
  { id: 'couch', src: '../assets/isometric/sprites/couch.png', width: 96, height: 64 },
  { id: 'counter', src: '../assets/isometric/sprites/counter.png', width: 128, height: 64 },
  { id: 'bookshelf', src: '../assets/isometric/sprites/bookshelf.png', width: 64, height: 96 },
  
  // Agent sprites - different programmer/coder types
  { id: 'agent-idle', src: '../assets/isometric/sprites/agent-idle.png', width: 48, height: 80,
    frames: 4, frameWidth: 48, frameHeight: 80, frameRate: 5 },
  { id: 'agent-working', src: '../assets/isometric/sprites/agent-working.png', width: 48, height: 80,
    frames: 6, frameWidth: 48, frameHeight: 80, frameRate: 8 },
  { id: 'agent-thinking', src: '../assets/isometric/sprites/agent-thinking.png', width: 48, height: 80,
    frames: 4, frameWidth: 48, frameHeight: 80, frameRate: 4 },
  
  // Task and message sprites
  { id: 'task-pending', src: '../assets/isometric/sprites/task-pending.png', width: 32, height: 32 },
  { id: 'task-assigned', src: '../assets/isometric/sprites/task-assigned.png', width: 32, height: 32 },
  { id: 'task-completed', src: '../assets/isometric/sprites/task-completed.png', width: 32, height: 32 },
  { id: 'message', src: '../assets/isometric/sprites/message.png', width: 32, height: 32,
    frames: 8, frameWidth: 32, frameHeight: 32, frameRate: 10 },
  
  // Café-specific decorative sprites
  { id: 'plant', src: '../assets/isometric/sprites/plant.png', width: 48, height: 80 },
  { id: 'coffee-machine', src: '../assets/isometric/sprites/coffee-machine.png', width: 48, height: 64 },
  { id: 'laptop', src: '../assets/isometric/sprites/laptop.png', width: 32, height: 24 },
  { id: 'coffee-cup', src: '../assets/isometric/sprites/coffee-cup.png', width: 16, height: 16 }
];

// Coder café theme implementation
export class CoderCafeTheme extends BaseTheme {
  public readonly name = 'coder-cafe';
  private config: CoderCafeConfig;
  private grid: IsometricGrid;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private spriteManager: SpriteManager;
  private assetsLoaded = false;
  private animationFrame = 0;
  private lastFrameTime = 0;
  private containerElement: HTMLElement | null = null;
  
  // Entity maps to keep track of visual representations
  private agentEntities: Record<string, VisualEntity> = {};
  private taskEntities: Record<string, VisualEntity> = {};
  private messageEntities: Record<string, VisualEntity> = {};
  private furnitureEntities: VisualEntity[] = [];
  
  // Constructor with optional config
  constructor(config: Partial<CoderCafeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Create isometric grid
    const gridConfig: GridConfig = {
      width: this.config.gridWidth,
      height: this.config.gridHeight,
      tileWidth: this.config.tileWidth,
      tileHeight: this.config.tileHeight,
      // Center the grid in the canvas
      originX: 0, // Will be adjusted in initialize
      originY: 0  // Will be adjusted in initialize
    };
    
    this.grid = new IsometricGrid(gridConfig);
    
    // Get sprite manager instance
    this.spriteManager = SpriteManager.getInstance();
    
    // Register sprites
    this.spriteManager.registerSprites(SPRITE_CONFIGS);
  }
  
  /**
   * Initialize the theme
   */
  async initialize(containerId: string, width: number, height: number): Promise<void> {
    console.log('Initializing CoderCafeTheme');
    this.containerElement = document.getElementById(containerId);
    if (!this.containerElement) {
      throw new Error(`Container element with ID ${containerId} not found`);
    }
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    
    // Get rendering context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Could not get canvas 2D context');
    }
    
    // Clear container and add canvas
    this.containerElement.innerHTML = '';
    this.containerElement.style.position = 'relative';
    this.containerElement.style.overflow = 'hidden';
    this.containerElement.style.width = `${width}px`;
    this.containerElement.style.height = `${height}px`;
    this.containerElement.appendChild(this.canvas);
    
    // Adjust grid origin to center the grid in the canvas
    const gridConfig = this.grid.getConfig();
    const centerX = width / 2;
    const centerY = this.config.tileHeight * 2; // Offset from top for better visibility
    
    // Create a new grid with adjusted origin
    this.grid = new IsometricGrid({
      ...gridConfig,
      originX: centerX,
      originY: centerY
    });
    
    // Create cafe floor layout
    await this.createCafeLayout();
    
    // Register event handlers for MCP events
    this.registerEventHandlers();
    
    // Load assets
    try {
      await this.spriteManager.loadSprites();
      this.assetsLoaded = true;
      console.log('Coder café sprites loaded successfully');
    } catch (error) {
      console.warn('Could not load some sprites, using fallback rendering', error);
    }
    
    // Start animation loop
    this.startAnimationLoop();
    
    console.log('CoderCafeTheme initialized');
  }
  
  /**
   * Create the café layout with furniture and decorations
   */
  private async createCafeLayout(): Promise<void> {
    // Create basic office floor layout first
    this.grid.createBasicOfficeFloor();
    
    // Add tables and chairs throughout the café
    // This is a sampling of furniture - in a real implementation, 
    // you'd have a more sophisticated layout system
    
    // Counter area (near back wall)
    this.addFurniture('counter', 3, 1, 1);
    this.addFurniture('coffee-machine', 2, 1, 1);
    
    // Tables and chairs
    this.addFurniture('table-small', 3, 5, 0.5);
    this.addFurniture('chair', 2, 5, 0.5);
    this.addFurniture('chair', 4, 5, 0.5);
    this.addFurniture('laptop', 3, 5, 1);
    
    this.addFurniture('table-small', 7, 3, 0.5);
    this.addFurniture('chair', 6, 3, 0.5);
    this.addFurniture('chair', 8, 3, 0.5);
    
    this.addFurniture('table-large', 10, 8, 0.5);
    this.addFurniture('chair', 9, 7, 0.5);
    this.addFurniture('chair', 11, 7, 0.5);
    this.addFurniture('chair', 9, 9, 0.5);
    this.addFurniture('chair', 11, 9, 0.5);
    
    // Lounge area
    this.addFurniture('couch', 5, 10, 0.5);
    this.addFurniture('table-small', 7, 10, 0.5);
    
    // Bookshelves along one wall
    this.addFurniture('bookshelf', 13, 3, 1);
    this.addFurniture('bookshelf', 13, 5, 1);
    this.addFurniture('bookshelf', 13, 7, 1);
    
    // Plants for decoration
    this.addFurniture('plant', 1, 13, 0.5);
    this.addFurniture('plant', 13, 1, 0.5);
    this.addFurniture('plant', 7, 7, 0.5);
  }
  
  /**
   * Add a piece of furniture to the café
   */
  private addFurniture(spriteId: string, gridX: number, gridY: number, gridZ: number): void {
    const sprite = this.spriteManager.getSpriteConfig(spriteId);
    if (!sprite) {
      console.warn(`Sprite not found: ${spriteId}`);
      return;
    }
    
    const furnitureEntity: VisualEntity = {
      id: `furniture-${spriteId}-${gridX}-${gridY}`,
      type: 'furniture',
      position: { x: 0, y: 0 },
      size: { width: sprite.width, height: sprite.height },
      visible: true,
      data: {
        spriteId,
        gridPosition: { x: gridX, y: gridY, z: gridZ }
      },
      render: (ctx: CanvasRenderingContext2D) => this.renderFurniture(ctx, furnitureEntity),
      update: () => {} // Furniture doesn't need updates
    };
    
    // Place on grid
    this.grid.placeEntity(furnitureEntity, gridX, gridY, gridZ);
    
    // Store reference
    this.furnitureEntities.push(furnitureEntity);
  }
  
  /**
   * Register event handlers for MCP events
   */
  private registerEventHandlers(): void {
    // Listen for agent events
    document.addEventListener('agent:registered', (event: any) => {
      console.log('Agent registered event received in coder café theme', event.detail);
      if (event.detail && event.detail.agent) {
        const agentEntity = this.createAgentRepresentation(event.detail.agent);
        console.log('Created agent entity:', agentEntity);
      }
    });
    
    // Listen for task events
    document.addEventListener('task:added', (event: any) => {
      console.log('Task added event received in coder café theme', event.detail);
      if (event.detail && event.detail.task) {
        this.createTaskRepresentation(event.detail.task);
      }
    });
    
    // Listen for message events
    document.addEventListener('message:added', (event: any) => {
      console.log('Message added event received in coder café theme', event.detail);
      if (event.detail && event.detail.message) {
        this.createMessageRepresentation(event.detail.message);
      }
    });
    
    // Listen for task assignment events
    document.addEventListener('task:assigned', (event: any) => {
      console.log('Task assigned event received in coder café theme', event.detail);
      if (event.detail) {
        const { taskId, agentId } = event.detail;
        // Update agent and task visualizations
        const agent = this.agentEntities[agentId];
        const task = this.taskEntities[taskId];
        
        if (agent && task) {
          // Move agent to the task
          const { gridPosition } = task.data;
          this.moveAgentToGrid(agent, gridPosition.x, gridPosition.y, gridPosition.z);
        }
      }
    });
    
    // Listen for agent movement events
    document.addEventListener('agent:moved', (event: any) => {
      console.log('Agent moved event received in coder café theme', event.detail);
      if (event.detail && event.detail.agentId && event.detail.position) {
        const agent = this.agentEntities[event.detail.agentId];
        if (agent) {
          this.moveAgentToGrid(agent, event.detail.position.x, event.detail.position.y, event.detail.position.z || 0);
        }
      }
    });
    
    // Listen for system reset events
    document.addEventListener('system:reset', () => {
      console.log('System reset event received in coder café theme');
      // Clear all entities
      this.agentEntities = {};
      this.taskEntities = {};
      this.messageEntities = {};
      
      // Recreate the grid and café layout
      const gridConfig = this.grid.getConfig();
      this.grid = new IsometricGrid(gridConfig);
      this.createCafeLayout();
    });
  }
  
  /**
   * Create a visual representation of an agent
   */
  createAgentRepresentation(agent: Agent): VisualEntity {
    // Find an available table or empty position
    const startPos = this.findAvailablePosition();
    
    const agentEntity: VisualEntity = {
      id: `agent-entity-${agent.id}`,
      type: 'agent',
      position: { x: 0, y: 0 },
      size: { width: 48, height: 80 },
      visible: true,
      data: {
        agent,
        gridPosition: startPos,
        animFrame: 0,
        lastFrameUpdate: Date.now(),
        spriteId: 'agent-idle',
        color: agent.color || this.getRandomColor()
      },
      render: (ctx: CanvasRenderingContext2D) => this.renderAgent(ctx, agentEntity),
      update: (deltaTime: number) => this.updateAgent(agentEntity, deltaTime)
    };
    
    // Place on grid at default position
    const { gridPosition } = agentEntity.data;
    this.grid.placeEntity(agentEntity, gridPosition.x, gridPosition.y, gridPosition.z);
    
    // Store reference
    this.agentEntities[agent.id] = agentEntity;
    
    return agentEntity;
  }
  
  /**
   * Create a visual representation of a task
   */
  createTaskRepresentation(task: Task): VisualEntity {
    // Find an available position for the task
    const startPos = this.findAvailablePosition(true); // Prefer tables
    
    const taskEntity: VisualEntity = {
      id: `task-entity-${task.id}`,
      type: 'task',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      visible: true,
      data: {
        task,
        gridPosition: startPos,
        spriteId: 'task-pending'
      },
      render: (ctx: CanvasRenderingContext2D) => this.renderTask(ctx, taskEntity),
      update: (deltaTime: number) => this.updateTask(taskEntity, deltaTime)
    };
    
    // Place on grid
    const { gridPosition } = taskEntity.data;
    this.grid.placeEntity(taskEntity, gridPosition.x, gridPosition.y, gridPosition.z);
    
    // Store reference
    this.taskEntities[task.id] = taskEntity;
    
    return taskEntity;
  }
  
  /**
   * Create a visual representation of a message
   */
  createMessageRepresentation(message: Message): VisualEntity {
    // Find source and destination agents
    const sourceEntity = this.agentEntities[message.senderId];
    let targetPosition: Position = { x: 0, y: 0 };
    let targetGridPosition = { x: 0, y: 0, z: 0 };
    
    // If we have a destination, use it
    if (message.receiverId && this.agentEntities[message.receiverId]) {
      targetPosition = this.agentEntities[message.receiverId].position;
      targetGridPosition = this.agentEntities[message.receiverId].data.gridPosition;
    }
    
    const messageEntity: VisualEntity = {
      id: `message-entity-${message.id}`,
      type: 'message',
      position: sourceEntity ? { ...sourceEntity.position } : { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      visible: true,
      data: {
        message,
        sourceAgent: message.senderId,
        targetAgent: message.receiverId,
        sourcePosition: sourceEntity ? { ...sourceEntity.position } : { x: 0, y: 0 },
        targetPosition,
        sourceGridPosition: sourceEntity ? { ...sourceEntity.data.gridPosition } : { x: 0, y: 0, z: 0 },
        targetGridPosition,
        progress: 0, // Animation progress from 0 to 1
        animFrame: 0,
        lastFrameUpdate: Date.now(),
        spriteId: 'message'
      },
      animation: {
        active: true,
        duration: 2000,
        elapsed: 0,
        properties: {
          position: {
            start: sourceEntity ? { ...sourceEntity.position } : { x: 0, y: 0 },
            end: targetPosition,
            current: sourceEntity ? { ...sourceEntity.position } : { x: 0, y: 0 }
          }
        },
        onComplete: () => {
          // Remove after reaching destination
          setTimeout(() => {
            messageEntity.visible = false;
            this.grid.removeEntity(messageEntity.id);
            delete this.messageEntities[message.id];
          }, 500);
        }
      },
      render: (ctx: CanvasRenderingContext2D) => this.renderMessage(ctx, messageEntity),
      update: (deltaTime: number) => this.updateMessage(messageEntity, deltaTime)
    };
    
    // Place on grid
    if (sourceEntity) {
      const { gridPosition } = sourceEntity.data;
      this.grid.placeEntity(messageEntity, gridPosition.x, gridPosition.y, gridPosition.z + 1);
    } else {
      this.grid.placeEntity(messageEntity, 0, 0, 1);
    }
    
    // Store reference
    this.messageEntities[message.id] = messageEntity;
    
    return messageEntity;
  }
  
  /**
   * Create environment representation
   */
  createEnvironment(): VisualEntity {
    const environmentEntity: VisualEntity = {
      id: 'environment',
      type: 'environment',
      position: { x: 0, y: 0 },
      visible: true,
      render: (ctx: CanvasRenderingContext2D) => this.renderEnvironment(ctx),
      update: () => {} // Environment doesn't need updates
    };
    
    return environmentEntity;
  }
  
  /**
   * Render the environment (floor, walls, etc.)
   */
  private renderEnvironment(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.grid.getConfig();
    
    ctx.save();
    
    // Draw all floor tiles
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const cell = this.grid.getCell(x, y, 0);
        if (cell && cell.type === 'floor') {
          const pos = this.grid.gridToScreen(x, y, 0);
          
          // Draw floor tile - either with sprite or fallback
          if (this.assetsLoaded) {
            this.spriteManager.drawSprite(ctx, 'floor-wood', pos.x, pos.y);
          } else {
            // Fallback rendering
            ctx.fillStyle = this.config.floorColor;
            this.drawIsometricTile(ctx, pos.x, pos.y, this.config.tileWidth, this.config.tileHeight);
          }
          
          // Draw grid lines if enabled
          if (this.config.showGrid) {
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 0.5;
            this.drawIsometricTile(ctx, pos.x, pos.y, this.config.tileWidth, this.config.tileHeight, true);
          }
        }
      }
    }
    
    // Draw all wall cells
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const cell = this.grid.getCell(x, y, 1);
        if (cell && cell.type === 'wall') {
          const pos = this.grid.gridToScreen(x, y, 1);
          
          // Draw wall - either with sprite or fallback
          if (this.assetsLoaded) {
            // Use different sprites for different wall positions
            if (x === 0 || x === width - 1) {
              this.spriteManager.drawSprite(ctx, 'window', pos.x, pos.y);
            } else if (y === 0 || y === height - 1) {
              // Use door for the middle of one edge
              if ((x === Math.floor(width / 2)) && y === height - 1) {
                this.spriteManager.drawSprite(ctx, 'door', pos.x, pos.y);
              } else {
                this.spriteManager.drawSprite(ctx, 'wall-cafe', pos.x, pos.y);
              }
            }
          } else {
            // Fallback rendering
            ctx.fillStyle = this.config.wallColor;
            this.drawIsometricCube(
              ctx, 
              pos.x, 
              pos.y, 
              this.config.tileWidth, 
              this.config.tileHeight, 
              this.config.tileHeight
            );
          }
        }
      }
    }
    
    ctx.restore();
  }
  
  /**
   * Render an agent
   */
  private renderAgent(ctx: CanvasRenderingContext2D, agentEntity: VisualEntity): void {
    const { position, data } = agentEntity;
    const agent = data.agent as Agent;
    
    ctx.save();
    
    // Select sprite based on agent state
    let spriteId = 'agent-idle';
    if (agent.state === 'working') {
      spriteId = 'agent-working';
    } else if (agent.state === 'thinking') {
      spriteId = 'agent-thinking';
    }
    
    // Update sprite ID if needed
    if (data.spriteId !== spriteId) {
      data.spriteId = spriteId;
      data.animFrame = 0;
      data.lastFrameUpdate = Date.now();
    }
    
    // Get the proper frame for animation
    const frame = data.animFrame || 0;
    
    // Draw agent using sprite or fallback
    if (this.assetsLoaded) {
      // Apply color tint to make agents different
      this.drawColoredSprite(
        ctx,
        data.spriteId,
        position.x,
        position.y,
        undefined,
        undefined,
        frame,
        data.color
      );
    } else {
      // Fallback rendering
      // Draw agent body
      ctx.fillStyle = data.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      
      // Draw as a simple character
      // Head
      ctx.beginPath();
      ctx.arc(position.x, position.y - 20, 10 * this.config.agentScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Body
      ctx.beginPath();
      ctx.moveTo(position.x, position.y - 10);
      ctx.lineTo(position.x, position.y + 5);
      ctx.stroke();
      
      // Arms
      ctx.beginPath();
      ctx.moveTo(position.x - 10 * this.config.agentScale, position.y - 5);
      ctx.lineTo(position.x + 10 * this.config.agentScale, position.y - 5);
      ctx.stroke();
      
      // Legs
      ctx.beginPath();
      ctx.moveTo(position.x, position.y + 5);
      ctx.lineTo(position.x - 7 * this.config.agentScale, position.y + 20);
      ctx.moveTo(position.x, position.y + 5);
      ctx.lineTo(position.x + 7 * this.config.agentScale, position.y + 20);
      ctx.stroke();
    }
    
    // Agent state indicator
    const stateColors = {
      idle: '#aaaaaa',
      active: '#44ff44',
      thinking: '#ffcc44',
      working: '#4444ff',
      waiting: '#ff4444',
      disconnected: '#999999'
    };
    
    // Draw status dot
    ctx.fillStyle = stateColors[agent.state] || '#aaaaaa';
    ctx.beginPath();
    ctx.arc(position.x, position.y - 40, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Agent ID/name
    ctx.fillStyle = '#000000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name || agent.id, position.x, position.y - 45);
    
    ctx.restore();
  }
  
  /**
   * Draw a sprite with a color tint
   */
  private drawColoredSprite(
    ctx: CanvasRenderingContext2D,
    spriteId: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
    frame?: number,
    tintColor?: string
  ): void {
    // If no tint, just draw normally
    if (!tintColor) {
      this.spriteManager.drawSprite(ctx, spriteId, x, y, width, height, frame);
      return;
    }
    
    const sprite = this.spriteManager.getSprite(spriteId);
    const config = this.spriteManager.getSpriteConfig(spriteId);
    
    if (!sprite || !config) {
      // Fall back to regular sprite rendering
      this.spriteManager.drawSprite(ctx, spriteId, x, y, width, height, frame);
      return;
    }
    
    // Create a temporary canvas for the tinting process
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      // Fall back to regular sprite rendering
      this.spriteManager.drawSprite(ctx, spriteId, x, y, width, height, frame);
      return;
    }
    
    // Set up the temporary canvas
    let spriteWidth = config.width;
    let spriteHeight = config.height;
    
    // If this is a framed sprite, handle that
    if (config.frames && config.frames > 1 && config.frameWidth && config.frameHeight) {
      spriteWidth = config.frameWidth;
      spriteHeight = config.frameHeight;
    }
    
    tempCanvas.width = spriteWidth;
    tempCanvas.height = spriteHeight;
    
    // Draw the sprite frame to the temp canvas
    if (config.frames && config.frames > 1 && config.frameWidth && config.frameHeight && frame !== undefined) {
      const frameX = (frame % config.frames) * config.frameWidth;
      tempCtx.drawImage(
        sprite,
        frameX, 0,
        config.frameWidth, config.frameHeight,
        0, 0,
        config.frameWidth, config.frameHeight
      );
    } else {
      tempCtx.drawImage(sprite, 0, 0);
    }
    
    // Apply the tint
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.globalAlpha = 0.3; // Adjust for tint intensity
    tempCtx.fillStyle = tintColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Reset composite operation
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.globalAlpha = 1.0;
    
    // Draw the tinted sprite to the main canvas
    ctx.drawImage(
      tempCanvas,
      x - (width || spriteWidth) / 2,
      y - (height || spriteHeight),
      width || spriteWidth,
      height || spriteHeight
    );
  }
  
  /**
   * Render a task
   */
  private renderTask(ctx: CanvasRenderingContext2D, taskEntity: VisualEntity): void {
    const { position, data } = taskEntity;
    const task = data.task as Task;
    
    ctx.save();
    
    // Select sprite based on task state
    let spriteId = 'task-pending';
    if (task.state === 'assigned' || task.state === 'in_progress') {
      spriteId = 'task-assigned';
      data.spriteId = 'task-assigned';
    } else if (task.state === 'completed') {
      spriteId = 'task-completed';
      data.spriteId = 'task-completed';
    }
    
    // Draw task using sprite or fallback
    if (this.assetsLoaded) {
      this.spriteManager.drawSprite(ctx, spriteId, position.x, position.y);
    } else {
      // Fallback rendering - draw as a small document/paper
      const stateColors = {
        pending: '#ffcc44',
        assigned: '#4444ff',
        in_progress: '#44ff44',
        completed: '#44cc44',
        cancelled: '#ff4444'
      };
      
      const color = stateColors[task.state] || '#aaaaaa';
      
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      // Paper background
      ctx.beginPath();
      ctx.rect(position.x - 15, position.y - 20, 30, 25);
      ctx.fill();
      ctx.stroke();
      
      // Text lines
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.moveTo(position.x - 10, position.y - 15 + i * 6);
        ctx.lineTo(position.x + 10, position.y - 15 + i * 6);
      }
      ctx.stroke();
    }
    
    // Task description
    ctx.fillStyle = '#000000';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    const shortDesc = task.description.length > 10 ? 
      task.description.substring(0, 8) + '...' : 
      task.description;
    ctx.fillText(shortDesc, position.x, position.y - 25);
    
    ctx.restore();
  }
  
  /**
   * Render a message
   */
  private renderMessage(ctx: CanvasRenderingContext2D, messageEntity: VisualEntity): void {
    const { position, data } = messageEntity;
    
    ctx.save();
    
    // Draw message using sprite or fallback
    if (this.assetsLoaded) {
      // Get the proper frame for animation
      const frame = data.animFrame || 0;
      this.spriteManager.drawSprite(ctx, 'message', position.x, position.y, undefined, undefined, frame);
    } else {
      // Fallback rendering - simple message bubble
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 2;
      
      // Draw as bubble or envelope
      ctx.beginPath();
      ctx.arc(position.x, position.y - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Small tail
      ctx.beginPath();
      ctx.moveTo(position.x - 5, position.y + 2);
      ctx.lineTo(position.x, position.y + 10);
      ctx.lineTo(position.x + 5, position.y + 2);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  /**
   * Render a furniture entity
   */
  private renderFurniture(ctx: CanvasRenderingContext2D, furnitureEntity: VisualEntity): void {
    const { position, data } = furnitureEntity;
    
    ctx.save();
    
    // Draw furniture using sprite or fallback
    if (this.assetsLoaded && data.spriteId) {
      this.spriteManager.drawSprite(ctx, data.spriteId, position.x, position.y);
    } else {
      // Fallback rendering - simple block representation
      ctx.fillStyle = '#a67c52'; // Wood color
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      
      // Generic furniture shape
      if (data.spriteId?.includes('table')) {
        // Tables are wider
        ctx.fillRect(position.x - 20, position.y - 15, 40, 30);
      } else if (data.spriteId?.includes('chair')) {
        // Chairs are smaller
        ctx.fillRect(position.x - 10, position.y - 10, 20, 20);
      } else if (data.spriteId?.includes('bookshelf')) {
        // Bookshelves are tall
        ctx.fillRect(position.x - 15, position.y - 30, 30, 40);
      } else {
        // Generic furniture
        ctx.fillRect(position.x - 15, position.y - 15, 30, 30);
      }
      ctx.strokeRect(position.x - 15, position.y - 15, 30, 30);
    }
    
    ctx.restore();
  }
  
  /**
   * Update an agent entity
   */
  private updateAgent(agentEntity: VisualEntity, deltaTime: number): void {
    // Handle agent movement and state changes
    const agent = agentEntity.data.agent as Agent;
    
    // Example: If agent has a task assigned, move to a specific position
    if (agent.state === 'working' && agent.assignedTaskId) {
      const task = this.taskEntities[agent.assignedTaskId];
      if (task) {
        // Set up animation to move to task position
        if (!agentEntity.animation || !agentEntity.animation.active) {
          const targetGridPos = { ...task.data.gridPosition };
          // Position next to the task, not on top of it
          targetGridPos.x = Math.max(0, targetGridPos.x - 1);
          
          this.moveAgentToGrid(agentEntity, targetGridPos.x, targetGridPos.y);
        }
      }
    }
    
    // Update animation frame
    if (agentEntity.data.lastFrameUpdate) {
      const elapsed = Date.now() - agentEntity.data.lastFrameUpdate;
      const spriteConfig = this.spriteManager.getSpriteConfig(agentEntity.data.spriteId);
      
      if (spriteConfig && spriteConfig.frames && spriteConfig.frameRate) {
        // Time to update the frame?
        if (elapsed > 1000 / spriteConfig.frameRate) {
          agentEntity.data.animFrame = ((agentEntity.data.animFrame || 0) + 1) % spriteConfig.frames;
          agentEntity.data.lastFrameUpdate = Date.now();
        }
      }
    }
    
    // Process animation updates
    if (agentEntity.animation && agentEntity.animation.active) {
      this.processAnimation(agentEntity, deltaTime);
    }
  }
  
  /**
   * Update a task entity
   */
  private updateTask(taskEntity: VisualEntity, deltaTime: number): void {
    // Process animation updates
    if (taskEntity.animation && taskEntity.animation.active) {
      this.processAnimation(taskEntity, deltaTime);
    }
  }
  
  /**
   * Update a message entity
   */
  private updateMessage(messageEntity: VisualEntity, deltaTime: number): void {
    // Update animation frame
    if (messageEntity.data.lastFrameUpdate) {
      const elapsed = Date.now() - messageEntity.data.lastFrameUpdate;
      const spriteConfig = this.spriteManager.getSpriteConfig(messageEntity.data.spriteId);
      
      if (spriteConfig && spriteConfig.frames && spriteConfig.frameRate) {
        // Time to update the frame?
        if (elapsed > 1000 / spriteConfig.frameRate) {
          messageEntity.data.animFrame = ((messageEntity.data.animFrame || 0) + 1) % spriteConfig.frames;
          messageEntity.data.lastFrameUpdate = Date.now();
        }
      }
    }
    
    // Process animation updates
    if (messageEntity.animation && messageEntity.animation.active) {
      this.processAnimation(messageEntity, deltaTime);
    }
  }
  
  /**
   * Render the entire visualization
   */
  render(): void {
    if (!this.ctx || !this.canvas) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get all entities from the grid, sorted by z-index
    const entities = this.grid.getAllEntities();
    
    // Render environment first
    this.renderEnvironment(this.ctx);
    
    // Render all other entities
    for (const entity of entities) {
      if (entity.visible && entity.render) {
        entity.render(this.ctx);
      }
    }
  }
  
  /**
   * Update all entities
   */
  update(deltaTime: number): void {
    // Update animation counters
    const now = Date.now();
    if (now - this.lastFrameTime > 100) { // Update global animation frame every 100ms
      this.animationFrame = (this.animationFrame + 1) % 60; // 60 frame cycle for global animations
      this.lastFrameTime = now;
    }
    
    // Get all entities from the grid
    const entities = this.grid.getAllEntities();
    
    // Update all entities
    for (const entity of entities) {
      if (entity.visible && entity.update) {
        entity.update(deltaTime);
      }
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      
      // Update container size
      if (this.containerElement) {
        this.containerElement.style.width = `${width}px`;
        this.containerElement.style.height = `${height}px`;
      }
      
      // Re-center the grid
      const gridConfig = this.grid.getConfig();
      const centerX = width / 2;
      const centerY = this.config.tileHeight * 2;
      
      // Create a new grid with adjusted origin
      this.grid = new IsometricGrid({
        ...gridConfig,
        originX: centerX,
        originY: centerY
      });
      
      // Recreate the café floor
      this.createCafeLayout();
      
      // Re-place all entities
      Object.values(this.agentEntities).forEach(entity => {
        const { gridPosition } = entity.data;
        this.grid.placeEntity(entity, gridPosition.x, gridPosition.y, gridPosition.z);
      });
      
      Object.values(this.taskEntities).forEach(entity => {
        const { gridPosition } = entity.data;
        this.grid.placeEntity(entity, gridPosition.x, gridPosition.y, gridPosition.z);
      });
      
      Object.values(this.messageEntities).forEach(entity => {
        const { sourceGridPosition } = entity.data;
        this.grid.placeEntity(entity, sourceGridPosition.x, sourceGridPosition.y, sourceGridPosition.z);
      });
    }
  }
  
  /**
   * Move an agent to a specific grid position
   */
  private moveAgentToGrid(agentEntity: VisualEntity, gridX: number, gridY: number, gridZ: number = 0): void {
    const currentGridPos = agentEntity.data.gridPosition;
    
    // Check if the target position is valid and walkable
    if (!this.grid.isInBounds(gridX, gridY, gridZ) || !this.grid.isWalkable(gridX, gridY, gridZ)) {
      console.warn(`Cannot move agent to non-walkable position: ${gridX},${gridY},${gridZ}`);
      return;
    }
    
    // Calculate target screen position
    const targetScreenPos = this.grid.gridToScreen(gridX, gridY, gridZ);
    
    // Set up animation to move to target position
    agentEntity.animation = {
      active: true,
      duration: this.config.moveSpeed * Math.max(
        Math.abs(currentGridPos.x - gridX),
        Math.abs(currentGridPos.y - gridY)
      ),
      elapsed: 0,
      properties: {
        position: {
          start: { ...agentEntity.position },
          end: targetScreenPos,
          current: { ...agentEntity.position }
        }
      },
      onComplete: () => {
        // Update grid position when animation completes
        agentEntity.data.gridPosition = { x: gridX, y: gridY, z: gridZ };
        
        // Remove from old position and place at new position
        this.grid.removeEntity(agentEntity.id);
        this.grid.placeEntity(agentEntity, gridX, gridY, gridZ);
      }
    };
  }
  
  /**
   * Find an available position for an entity
   * @param preferTables If true, will try to place entity near a table
   * @returns Grid position for the entity
   */
  private findAvailablePosition(preferTables: boolean = false): {x: number, y: number, z: number} {
    const { width, height } = this.grid.getConfig();
    
    // If we prefer tables, first check if there are tables to place near
    if (preferTables && this.furnitureEntities.length > 0) {
      // Find tables
      const tables = this.furnitureEntities.filter(entity => 
        entity.data.spriteId && entity.data.spriteId.includes('table')
      );
      
      if (tables.length > 0) {
        // Get a random table
        const table = tables[Math.floor(Math.random() * tables.length)];
        const tablePos = table.data.gridPosition;
        
        // Try positions around the table
        const offsets = [
          {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1},
          {x: 1, y: 1}, {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}
        ];
        
        for (const offset of offsets) {
          const x = tablePos.x + offset.x;
          const y = tablePos.y + offset.y;
          const z = 0;
          
          // Check if this position is valid and walkable
          if (this.grid.isInBounds(x, y, z) && this.grid.isWalkable(x, y, z)) {
            // This position is good
            return {x, y, z};
          }
        }
      }
    }
    
    // If we couldn't find a position near a table, or we don't prefer tables,
    // find a random open position
    for (let tries = 0; tries < 50; tries++) {
      const x = Math.floor(Math.random() * (width - 2)) + 1; // Avoid walls
      const y = Math.floor(Math.random() * (height - 2)) + 1; // Avoid walls
      const z = 0;
      
      // Check if this position is valid and walkable
      if (this.grid.isWalkable(x, y, z)) {
        // This position is good
        return {x, y, z};
      }
    }
    
    // If all else fails, return a default position
    return {x: 7, y: 7, z: 0};
  }
  
  /**
   * Process animation for an entity
   */
  protected processAnimation(entity: VisualEntity, deltaTime: number): void {
    if (!entity.animation || !entity.animation.active) return;
    
    // Update animation elapsed time
    entity.animation.elapsed += deltaTime;
    
    // Calculate progress (0 to 1)
    const progress = Math.min(
      entity.animation.elapsed / entity.animation.duration,
      1
    );
    
    // Update all animated properties
    for (const [property, values] of Object.entries(entity.animation.properties)) {
      if (!values) continue;
      
      // Handle different property types
      if (property === 'position' && entity.position) {
        const pos = values as any;
        entity.position.x = pos.start.x + (pos.end.x - pos.start.x) * progress;
        entity.position.y = pos.start.y + (pos.end.y - pos.start.y) * progress;
        if (pos.start.z !== undefined && pos.end.z !== undefined) {
          entity.position.z = pos.start.z + (pos.end.z - pos.start.z) * progress;
        }
      }
    }
    
    // Animation complete
    if (progress >= 1) {
      entity.animation.active = false;
      
      // Call onComplete if defined
      if (entity.animation.onComplete) {
        entity.animation.onComplete();
      }
    }
  }
  
  /**
   * Draw an isometric tile
   */
  private drawIsometricTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    strokeOnly: boolean = false
  ): void {
    ctx.beginPath();
    
    // Draw diamond shape
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y + height / 2);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x - width / 2, y + height / 2);
    ctx.closePath();
    
    if (strokeOnly) {
      ctx.stroke();
    } else {
      ctx.fill();
      ctx.stroke();
    }
  }
  
  /**
   * Draw an isometric cube (for walls and objects)
   */
  private drawIsometricCube(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number
  ): void {
    // Top face (roof)
    const originalFillStyle = ctx.fillStyle as string;
    ctx.fillStyle = this.lightenColor(originalFillStyle, 40);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y + height / 2);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x - width / 2, y + height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right face
    ctx.fillStyle = this.darkenColor(originalFillStyle, 10);
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width / 2, y + height / 2);
    ctx.lineTo(x + width / 2, y + height / 2 + depth);
    ctx.lineTo(x, y + height + depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left face
    ctx.fillStyle = this.darkenColor(originalFillStyle, 30);
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x - width / 2, y + height / 2);
    ctx.lineTo(x - width / 2, y + height / 2 + depth);
    ctx.lineTo(x, y + height + depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  /**
   * Lighten a color by a given percentage
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + (256 * percent) / 100));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (256 * percent) / 100));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + (256 * percent) / 100));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  
  /**
   * Darken a color by a given percentage
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (100 - percent) / 100));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (100 - percent) / 100));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (100 - percent) / 100));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  
  /**
   * Generate a random color
   */
  private getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
  }
  
  /**
   * Clean up theme resources
   */
  public cleanup(): void {
    super.cleanup();
    
    // Additional cleanup specific to coder café theme
    this.agentEntities = {};
    this.taskEntities = {};
    this.messageEntities = {};
    this.furnitureEntities = [];
  }
}