import { BaseTheme } from '../../core/VisualizationTheme';
import { Agent, Environment, Message, Position, Task, VisualEntity } from '../../core/types';
import { ThemeConfig, ThemePlugin } from '../../core/ThemeManager';

/**
 * Demo theme configuration
 */
export interface DemoThemeConfig {
  /**
   * Background color of the visualization
   */
  backgroundColor: string;
  
  /**
   * Agent color
   */
  agentColor: string;
  
  /**
   * Task color
   */
  taskColor: string;
  
  /**
   * Message color
   */
  messageColor: string;
  
  /**
   * Show grid
   */
  showGrid: boolean;
}

/**
 * A simple demo theme for visualization
 */
export class DemoTheme extends BaseTheme {
  public readonly name = 'demo-theme';
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: DemoThemeConfig;

  /**
   * Constructor
   * @param themeConfig Theme configuration
   */
  constructor(themeConfig?: ThemeConfig) {
    super();
    
    // Set default configuration
    this.config = {
      backgroundColor: '#f8f8f8',
      agentColor: '#007bff',
      taskColor: '#28a745',
      messageColor: '#dc3545',
      showGrid: true,
      ...(themeConfig?.options as Partial<DemoThemeConfig> || {})
    };
  }

  /**
   * Initialize the theme
   * @param containerId ID of the container element
   * @param width Width of the visualization
   * @param height Height of the visualization
   */
  public async initialize(containerId: string, width: number, height: number): Promise<void> {
    await super.initialize(containerId, width, height);

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    // Add canvas to container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(this.canvas);
    }

    // Create environment
    this.environment = this.createEnvironment(width, height);
    
    // Start the animation loop
    this.startAnimationLoop();
  }

  /**
   * Clean up the theme
   */
  public cleanup(): void {
    super.cleanup();
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Create a visual representation of an agent
   * @param agent Agent to represent
   * @returns Visual entity representing the agent
   */
  public createAgentRepresentation(agent: Agent): VisualEntity {
    // Position agents in a grid
    const index = Array.from(this.entities.values())
      .filter((entity) => entity.type === 'agent')
      .length;

    const position: Position = {
      x: 50 + (index % 5) * 120,
      y: 150 + Math.floor(index / 5) * 120,
    };

    const entity: VisualEntity = {
      id: `agent-${agent.id}`,
      type: 'agent',
      position,
      size: { width: 40, height: 40 },
      visible: true,
      data: agent,
      zIndex: 10,
      render: (ctx: CanvasRenderingContext2D) => {
        // Draw agent as a colored triangle with a circle inside
        const { x, y } = entity.position;
        const size = 30;

        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.closePath();
        ctx.fillStyle = agent.color || this.config.agentColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw circle inside
        ctx.beginPath();
        ctx.arc(x, y, size / 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();

        // Agent name
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name || `Agent ${agent.id}`, x, y + size + 10);
      },
      update: (_deltaTime: number) => {
        // Entity animations are now handled by the BaseTheme.processAnimations method
      },
    };

    // Add to entities collection
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Create a visual representation of a task
   * @param task Task to represent
   * @returns Visual entity representing the task
   */
  public createTaskRepresentation(task: Task): VisualEntity {
    // Position tasks at the right side
    const index = Array.from(this.entities.values())
      .filter((entity) => entity.type === 'task')
      .length;

    const position: Position = {
      x: this.width - 150,
      y: 150 + index * 80,
    };

    const entity: VisualEntity = {
      id: `task-${task.id}`,
      type: 'task',
      position,
      size: { width: 120, height: 60 },
      visible: true,
      data: task,
      zIndex: 5,
      render: (ctx: CanvasRenderingContext2D) => {
        // Draw task as a hexagon
        const { x, y } = entity.position;
        const width = entity.size?.width || 120;
        const height = entity.size?.height || 60;
        const hexRadius = Math.min(width, height) / 2;

        // State colors
        const stateColors = {
          pending: '#dddddd',
          assigned: '#ffffaa',
          in_progress: '#aaffaa',
          completed: '#aaaaff',
          cancelled: '#ffaaaa',
        };

        // Draw hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const xPoint = x + hexRadius * Math.cos(angle);
          const yPoint = y + hexRadius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(xPoint, yPoint);
          } else {
            ctx.lineTo(xPoint, yPoint);
          }
        }
        ctx.closePath();
        ctx.fillStyle = stateColors[task.state] || this.config.taskColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Task description
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(
          task.description.length > 15 ? task.description.substring(0, 12) + '...' : task.description,
          x,
          y
        );

        // Task status
        ctx.font = '10px Arial';
        ctx.fillStyle = '#444';
        ctx.fillText(task.state, x, y + 15);

        // Assigned agent if applicable
        if (task.assignedTo) {
          ctx.font = '10px Arial';
          ctx.fillStyle = '#444';
          ctx.fillText(`Assigned to: ${task.assignedTo}`, x, y + 30);
        }
      },
      update: (_deltaTime: number) => {
        // Entity animations are now handled by the BaseTheme.processAnimations method
      },
    };

    // Add to entities collection
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Create a visual representation of a message
   * @param message Message to represent
   * @param fromPosition Starting position of the message
   * @param toPosition Ending position of the message
   * @returns Visual entity representing the message
   */
  public createMessageRepresentation(
    message: Message,
    fromPosition: Position,
    toPosition: Position
  ): VisualEntity {
    const entity: VisualEntity = {
      id: `message-${message.id}`,
      type: 'message',
      position: { ...fromPosition },
      size: { width: 10, height: 10 },
      visible: true,
      data: {
        message,
        from: { ...fromPosition },
        to: { ...toPosition },
        progress: 0,
      },
      zIndex: 20,
      render: (ctx: CanvasRenderingContext2D) => {
        const { from, to, progress } = entity.data;

        // Calculate current position along the path
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;

        // Draw message as a star shape
        const radius = 6;
        const points = 5;
        const innerRadius = radius / 2;

        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (Math.PI / points) * i;
          const r = i % 2 === 0 ? radius : innerRadius;
          const xPoint = x + r * Math.cos(angle);
          const yPoint = y + r * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(xPoint, yPoint);
          } else {
            ctx.lineTo(xPoint, yPoint);
          }
        }
        ctx.closePath();
        ctx.fillStyle = this.config.messageColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw line from sender to current position
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = this.config.messageColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      },
      update: (deltaTime: number) => {
        // Animate message along the path
        entity.data.progress += deltaTime / 1000; // Move at a rate of 100% per second

        // Remove message when it reaches its destination
        if (entity.data.progress >= 1) {
          entity.visible = false;
          entity.data.progress = 1;
          setTimeout(() => {
            this.entities.delete(entity.id);
          }, 1000);
        }

        // Update current position
        entity.position.x = entity.data.from.x + (entity.data.to.x - entity.data.from.x) * entity.data.progress;
        entity.position.y = entity.data.from.y + (entity.data.to.y - entity.data.from.y) * entity.data.progress;
      },
    };

    // Add to entities collection
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Create the environment
   * @param width Width of the environment
   * @param height Height of the environment
   * @returns Environment object
   */
  public createEnvironment(width: number, height: number): Environment {
    return {
      id: 'demo-environment',
      size: { width, height },
      background: this.config.backgroundColor,
      grid: this.config.showGrid,
      entities: [],
    };
  }

  /**
   * Render the entire visualization
   * @param deltaTime Time elapsed since last render in milliseconds
   */
  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.environment) {
      return;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.ctx.fillStyle = this.environment.background || this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw title
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#333';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Demo Theme', this.canvas.width/2, 30);
    
    // Draw subtitle
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#666';
    this.ctx.fillText('A configurable demo visualization', this.canvas.width/2, 60);

    // Draw grid if enabled
    if (this.environment.grid) {
      this.drawGrid();
    }

    // Update all entities
    for (const entity of this.entities.values()) {
      entity.update(deltaTime);
    }

    // Render all entities, sorted by z-index
    const sortedEntities = Array.from(this.entities.values())
      .filter((entity) => entity.visible)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const entity of sortedEntities) {
      // Apply scale transformation if needed
      if (entity.scale !== undefined && entity.scale !== 1.0) {
        this.ctx.save();
        
        // Calculate center of entity for scaling
        const centerX = entity.position.x;
        const centerY = entity.position.y;
        
        // Apply scale transformation around center
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(entity.scale, entity.scale);
        this.ctx.translate(-centerX, -centerY);
        
        // Render the entity
        entity.render(this.ctx);
        
        // Restore context
        this.ctx.restore();
      } else {
        // Apply opacity if needed
        if (entity.opacity !== undefined && entity.opacity !== 1.0) {
          this.ctx.globalAlpha = entity.opacity;
          entity.render(this.ctx);
          this.ctx.globalAlpha = 1.0;
        } else {
          // Normal rendering
          entity.render(this.ctx);
        }
      }
    }
  }

  /**
   * Handle window resize
   * @param width New width
   * @param height New height
   */
  public handleResize(width: number, height: number): void {
    super.handleResize(width, height);

    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    if (this.environment) {
      this.environment.size = { width, height };
    }
  }

  /**
   * Draw a grid on the canvas
   */
  private drawGrid(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const gridSize = 50;
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.beginPath();
    this.ctx.strokeStyle = '#dddddd';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = gridSize; x < width; x += gridSize) {
      this.ctx.moveTo(x, 100);
      this.ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 100; y < height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }

    this.ctx.stroke();
    this.ctx.closePath();
  }
}

/**
 * Demo theme plugin
 */
export const DemoThemePlugin: ThemePlugin = {
  name: 'demo-theme',
  description: 'A configurable demo theme with custom shapes',
  version: '1.0.0',
  author: {
    name: 'GooseVisualizer Team',
  },
  createTheme: (config?: ThemeConfig) => new DemoTheme(config),
  configSchema: {
    backgroundColor: {
      type: 'color',
      defaultValue: '#f8f8f8',
      description: 'Background color of the visualization',
    },
    agentColor: {
      type: 'color',
      defaultValue: '#007bff',
      description: 'Default color for agents',
    },
    taskColor: {
      type: 'color',
      defaultValue: '#28a745',
      description: 'Default color for tasks',
    },
    messageColor: {
      type: 'color',
      defaultValue: '#dc3545',
      description: 'Color for messages',
    },
    showGrid: {
      type: 'boolean',
      defaultValue: true,
      description: 'Show grid in the background',
    },
  },
};