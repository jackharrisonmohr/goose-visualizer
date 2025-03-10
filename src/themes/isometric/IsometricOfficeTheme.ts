/**
 * Isometric office environment theme
 */

import { BaseTheme } from '../../core/VisualizationTheme';
import { Agent, Message, Position, Size, Task, VisualEntity } from '../../core/types';
import { IsometricGrid, GridConfig } from '../../core/IsometricGrid';

// Configuration options for the isometric theme
export interface IsometricOfficeConfig {
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
}

// Default isometric office configuration
const DEFAULT_CONFIG: IsometricOfficeConfig = {
  gridWidth: 15,
  gridHeight: 15,
  tileWidth: 64,
  tileHeight: 32,
  floorColor: '#e0e0ff',
  wallColor: '#8090c0',
  agentScale: 1.0,
  moveSpeed: 300, // ms per tile
  showGrid: true
};

// Asset definitions for isometric elements
interface AssetDefinition {
  id: string;
  src: string;
  width: number;
  height: number;
}

// Isometric office theme implementation
export class IsometricOfficeTheme extends BaseTheme {
  public readonly name = 'isometric-office';
  private config: IsometricOfficeConfig;
  private grid: IsometricGrid;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private assets: Record<string, HTMLImageElement> = {};
  private assetsLoaded = false;
  private assetDefinitions: AssetDefinition[] = [
    // These will be expanded with actual assets
    { id: 'floor-tile', src: 'assets/isometric/floor-tile.png', width: 64, height: 32 },
    { id: 'wall-tile', src: 'assets/isometric/wall-tile.png', width: 64, height: 64 },
    { id: 'agent-idle', src: 'assets/isometric/agent-idle.png', width: 32, height: 64 },
    { id: 'agent-working', src: 'assets/isometric/agent-working.png', width: 32, height: 64 },
    { id: 'desk', src: 'assets/isometric/desk.png', width: 64, height: 48 },
  ];
  
  // Entity maps to keep track of visual representations
  private agentEntities: Record<string, VisualEntity> = {};
  private taskEntities: Record<string, VisualEntity> = {};
  private messageEntities: Record<string, VisualEntity> = {};
  
  // Constructor with optional config
  constructor(config: Partial<IsometricOfficeConfig> = {}) {
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
  }
  
  /**
   * Initialize the theme
   */
  async initialize(containerId: string, width: number, height: number): Promise<void> {
    console.log('Initializing IsometricOfficeTheme');
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
    
    // Create basic office floor layout
    this.grid.createBasicOfficeFloor();
    
    // Register event handlers for MCP events
    this.registerEventHandlers();
    
    // Start animation loop
    this.startAnimationLoop();
    
    // Load assets
    // For now, we'll skip actual loading since assets don't exist yet
    // In a real implementation, you would await the asset loading
    this.assetsLoaded = true;
    
    console.log('IsometricOfficeTheme initialized');
  }
  
  /**
   * Register event handlers for MCP events
   */
  private registerEventHandlers(): void {
    // Listen for agent events
    document.addEventListener('agent:registered', (event: any) => {
      console.log('Agent registered event received in isometric theme', event.detail);
      if (event.detail && event.detail.agent) {
        const agentEntity = this.createAgentRepresentation(event.detail.agent);
        console.log('Created agent entity:', agentEntity);
      }
    });
    
    // Listen for task events
    document.addEventListener('task:added', (event: any) => {
      console.log('Task added event received in isometric theme', event.detail);
      if (event.detail && event.detail.task) {
        this.createTaskRepresentation(event.detail.task);
      }
    });
    
    // Listen for message events
    document.addEventListener('message:added', (event: any) => {
      console.log('Message added event received in isometric theme', event.detail);
      if (event.detail && event.detail.message) {
        this.createMessageRepresentation(event.detail.message);
      }
    });
    
    // Listen for task assignment events
    document.addEventListener('task:assigned', (event: any) => {
      console.log('Task assigned event received in isometric theme', event.detail);
      if (event.detail) {
        const { taskId, agentId } = event.detail;
        // Update agent and task visualizations
      }
    });
    
    // Listen for agent movement events
    document.addEventListener('agent:moved', (event: any) => {
      console.log('Agent moved event received in isometric theme', event.detail);
      if (event.detail && event.detail.agentId && event.detail.position) {
        const agent = this.agentEntities[event.detail.agentId];
        if (agent) {
          this.moveAgentToGrid(agent, event.detail.position.x, event.detail.position.y, event.detail.position.z || 0);
        }
      }
    });
    
    // Listen for system reset events
    document.addEventListener('system:reset', () => {
      console.log('System reset event received in isometric theme');
      // Clear all entities
      this.agentEntities = {};
      this.taskEntities = {};
      this.messageEntities = {};
      
      // Recreate the grid
      const gridConfig = this.grid.getConfig();
      this.grid = new IsometricGrid(gridConfig);
      this.grid.createBasicOfficeFloor();
    });
  }
  
  /**
   * Create a visual representation of an agent
   */
  createAgentRepresentation(agent: Agent): VisualEntity {
    const agentEntity: VisualEntity = {
      id: `agent-entity-${agent.id}`,
      type: 'agent',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 64 },
      visible: true,
      data: {
        agent,
        gridPosition: { x: 7, y: 7, z: 0 }, // Default to center of grid
        tileWidth: this.config.tileWidth,
        tileHeight: this.config.tileHeight,
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
    const taskEntity: VisualEntity = {
      id: `task-entity-${task.id}`,
      type: 'task',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 16 },
      visible: true,
      data: {
        task,
        gridPosition: { x: 5, y: 5, z: 0.5 }, // Default position
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
      size: { width: 20, height: 20 },
      visible: true,
      data: {
        message,
        sourceAgent: message.senderId,
        targetAgent: message.receiverId,
        sourcePosition: sourceEntity ? { ...sourceEntity.position } : { x: 0, y: 0 },
        targetPosition,
        sourceGridPosition: sourceEntity ? { ...sourceEntity.data.gridPosition } : { x: 0, y: 0, z: 0 },
        targetGridPosition,
        progress: 0 // Animation progress from 0 to 1
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
          
          // Draw floor tile
          ctx.fillStyle = this.config.floorColor;
          this.drawIsometricTile(ctx, pos.x, pos.y, this.config.tileWidth, this.config.tileHeight);
          
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
          
          // Draw wall
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
    
    ctx.restore();
  }
  
  /**
   * Render an agent
   */
  private renderAgent(ctx: CanvasRenderingContext2D, agentEntity: VisualEntity): void {
    const { position, data } = agentEntity;
    const agent = data.agent as Agent;
    
    ctx.save();
    
    // Draw agent body
    ctx.fillStyle = data.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    // Draw as a simple character for now
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
    
    // Agent state indicator
    const stateColors = {
      idle: '#aaaaaa',
      active: '#44ff44',
      thinking: '#ffcc44',
      working: '#4444ff',
      waiting: '#ff4444',
      disconnected: '#999999'
    };
    
    ctx.fillStyle = stateColors[agent.state] || '#aaaaaa';
    ctx.beginPath();
    ctx.arc(position.x, position.y - 30, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Agent ID/name
    ctx.fillStyle = '#000000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name || agent.id, position.x, position.y - 35);
    
    ctx.restore();
  }
  
  /**
   * Render a task
   */
  private renderTask(ctx: CanvasRenderingContext2D, taskEntity: VisualEntity): void {
    const { position, data } = taskEntity;
    const task = data.task as Task;
    
    ctx.save();
    
    // Draw task representation
    const stateColors = {
      pending: '#ffcc44',
      assigned: '#4444ff',
      in_progress: '#44ff44',
      completed: '#44cc44',
      cancelled: '#ff4444'
    };
    
    const color = stateColors[task.state] || '#aaaaaa';
    
    // Draw as a small document/paper
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
    
    // Status indicator
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y - 30, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Task ID/short description
    ctx.fillStyle = '#000000';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    const shortDesc = task.description.length > 10 ? 
      task.description.substring(0, 8) + '...' : 
      task.description;
    ctx.fillText(shortDesc, position.x, position.y - 35);
    
    ctx.restore();
  }
  
  /**
   * Render a message
   */
  private renderMessage(ctx: CanvasRenderingContext2D, messageEntity: VisualEntity): void {
    const { position, data } = messageEntity;
    
    ctx.save();
    
    // Draw message representation
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    
    // Draw as message icon (envelope or speech bubble)
    ctx.beginPath();
    ctx.moveTo(position.x - 10, position.y - 5);
    ctx.lineTo(position.x, position.y + 5);
    ctx.lineTo(position.x + 10, position.y - 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw envelope body
    ctx.beginPath();
    ctx.rect(position.x - 10, position.y - 15, 20, 10);
    ctx.fill();
    ctx.stroke();
    
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
      
      // Recreate the basic office floor
      this.grid.createBasicOfficeFloor();
      
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
    ctx.fillStyle = this.lightenColor(ctx.fillStyle as string, 40);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y + height / 2);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x - width / 2, y + height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right face
    ctx.fillStyle = this.darkenColor(ctx.fillStyle as string, 10);
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width / 2, y + height / 2);
    ctx.lineTo(x + width / 2, y + height / 2 + depth);
    ctx.lineTo(x, y + height + depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left face
    ctx.fillStyle = this.darkenColor(ctx.fillStyle as string, 30);
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
    const g = Math.min(255, Math.floor((num & 0x0000FF) + (256 * percent) / 100));
    const b = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (256 * percent) / 100));
    return `#${(r << 16 | g | b << 8).toString(16).padStart(6, '0')}`;
  }
  
  /**
   * Darken a color by a given percentage
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (100 - percent) / 100));
    const g = Math.max(0, Math.floor((num & 0x0000FF) * (100 - percent) / 100));
    const b = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (100 - percent) / 100));
    return `#${(r << 16 | g | b << 8).toString(16).padStart(6, '0')}`;
  }
  
  /**
   * Generate a random color
   */
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}