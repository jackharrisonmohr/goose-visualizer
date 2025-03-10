import { BaseTheme } from '../../core/VisualizationTheme';
import { Agent, Environment, Message, Position, Task, VisualEntity } from '../../core/types';
import { registerTheme } from '../../core/ThemeManager';

/**
 * A simple 2D theme for visualization
 */
export class Simple2DTheme extends BaseTheme {
  public readonly name = 'simple-2d';
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

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
      y: 50 + Math.floor(index / 5) * 120,
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
        // Draw agent as a colored circle with state indicator
        const { x, y } = entity.position;
        const radius = 20;

        // Main circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = agent.color || '#007bff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // State indicator
        const stateColors = {
          idle: '#aaaaaa',
          active: '#00ff00',
          thinking: '#ffff00',
          working: '#ff9900',
          waiting: '#0099ff',
          disconnected: '#ff0000',
        };

        ctx.beginPath();
        ctx.arc(x + radius / 2, y - radius / 2, radius / 4, 0, Math.PI * 2);
        ctx.fillStyle = stateColors[agent.state] || '#aaaaaa';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        // Agent name
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name || `Agent ${agent.id}`, x, y + radius + 15);
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
      y: 50 + index * 80,
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
        // Draw task as a rounded rectangle with status indicator
        const { x, y } = entity.position;
        const width = entity.size?.width || 120;
        const height = entity.size?.height || 60;
        const radius = 10;

        // State colors
        const stateColors = {
          pending: '#dddddd',
          assigned: '#ffffaa',
          in_progress: '#aaffaa',
          completed: '#aaaaff',
          cancelled: '#ffaaaa',
        };

        // Draw rounded rectangle
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fillStyle = stateColors[task.state] || '#dddddd';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Task description
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(
          task.description.length > 20 ? task.description.substring(0, 17) + '...' : task.description,
          x + width / 2,
          y + 20
        );

        // Task status
        ctx.font = '10px Arial';
        ctx.fillStyle = '#444';
        ctx.fillText(task.state, x + width / 2, y + 40);

        // Assigned agent if applicable
        if (task.assignedTo) {
          ctx.font = '10px Arial';
          ctx.fillStyle = '#444';
          ctx.fillText(`Assigned to: ${task.assignedTo}`, x + width / 2, y + 55);
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
   * Add a highlight/glow effect to an entity
   * @param entityId ID of the entity to highlight
   * @param color Color of the highlight
   * @param duration Duration of the highlight in milliseconds
   */
  public highlightEntity(entityId: string, color: string = '#ffff00', duration: number = 1000): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    
    // Store the original color in the entity data if not already there
    if (!entity.data.originalColor) {
      if (entity.type === 'agent') {
        entity.data.originalColor = entity.data.color;
      } else if (entity.type === 'task') {
        // For tasks, we'll modify the border color
        entity.data.originalBorderColor = '#000'; // default black
      }
    }
    
    // Create a color animation
    this.createAnimation(
      entity,
      'color',
      { value: entity.data.originalColor || '#007bff' },
      { value: color },
      duration / 2, // Half duration for fade in
      () => {
        // Create reverse animation to fade back
        this.createAnimation(
          entity,
          'color',
          { value: color },
          { value: entity.data.originalColor || '#007bff' },
          duration / 2
        );
      }
    );
  }
  
  /**
   * Add a pulsing effect to an entity
   * @param entityId ID of the entity to pulse
   * @param duration Duration of the pulse animation in milliseconds
   * @param scale Maximum scale during pulse (1.0 = normal size)
   */
  public pulseEntity(entityId: string, duration: number = 1000, scale: number = 1.2): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    
    // Set initial scale if not present
    if (entity.scale === undefined) {
      entity.scale = 1.0;
    }
    
    // Create scale animation
    this.createAnimation(
      entity,
      'scale',
      { value: 1.0 },
      { value: scale },
      duration / 2, // Half duration for growing
      () => {
        // Create reverse animation to shrink back
        this.createAnimation(
          entity,
          'scale',
          { value: scale },
          { value: 1.0 },
          duration / 2
        );
      }
    );
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

        // Draw message as a small colored circle
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff00ff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        // Draw line from sender to current position
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.closePath();
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
      id: 'simple-2d-environment',
      size: { width, height },
      background: '#f0f0f0',
      grid: true,
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
    this.ctx.fillStyle = this.environment.background || '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = gridSize; y < height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }

    this.ctx.stroke();
    this.ctx.closePath();
  }
}

// Note: Theme registration moved to src/themes/simple2d/index.ts