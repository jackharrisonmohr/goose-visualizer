import { Agent, Environment, Message, Position, Task, VisualEntity } from './types';

/**
 * Interface that all visualization themes must implement
 */
export interface VisualizationTheme {
  /**
   * Name of the theme
   */
  readonly name: string;

  /**
   * Initialize the theme
   * @param containerId ID of the container element
   * @param width Width of the visualization
   * @param height Height of the visualization
   */
  initialize(containerId: string, width: number, height: number): Promise<void>;

  /**
   * Clean up the theme
   */
  cleanup(): void;

  /**
   * Create a visual representation of an agent
   * @param agent Agent to represent
   * @returns Visual entity representing the agent
   */
  createAgentRepresentation(agent: Agent): VisualEntity;

  /**
   * Create a visual representation of a task
   * @param task Task to represent
   * @returns Visual entity representing the task
   */
  createTaskRepresentation(task: Task): VisualEntity;

  /**
   * Create a visual representation of a message
   * @param message Message to represent
   * @param fromPosition Starting position of the message
   * @param toPosition Ending position of the message
   * @returns Visual entity representing the message
   */
  createMessageRepresentation(
    message: Message,
    fromPosition: Position,
    toPosition: Position
  ): VisualEntity;

  /**
   * Create the environment
   * @param width Width of the environment
   * @param height Height of the environment
   * @returns Environment object
   */
  createEnvironment(width: number, height: number): Environment;

  /**
   * Update the visual entity
   * @param entity Entity to update
   * @param updates Updates to apply
   */
  updateEntity(entity: VisualEntity, updates: Partial<VisualEntity>): void;

  /**
   * Remove an entity from the visualization
   * @param entityId ID of the entity to remove
   */
  removeEntity(entityId: string): void;

  /**
   * Render the entire visualization
   * @param deltaTime Time elapsed since last render in milliseconds
   */
  render(deltaTime: number): void;

  /**
   * Start the animation loop
   */
  startAnimationLoop(): void;

  /**
   * Stop the animation loop
   */
  stopAnimationLoop(): void;

  /**
   * Handle window resize
   * @param width New width
   * @param height New height
   */
  handleResize(width: number, height: number): void;
}

/**
 * Abstract base class for visualization themes
 */
export abstract class BaseTheme implements VisualizationTheme {
  public abstract readonly name: string;
  protected container: HTMLElement | null = null;
  protected width: number = 800;
  protected height: number = 600;
  protected entities: Map<string, VisualEntity> = new Map();
  protected environment: Environment | null = null;
  protected animationFrameId: number | null = null;
  protected lastRenderTime: number = 0;

  /**
   * Initialize the theme
   * @param containerId ID of the container element
   * @param width Width of the visualization
   * @param height Height of the visualization
   */
  public async initialize(containerId: string, width: number, height: number): Promise<void> {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with ID ${containerId} not found`);
    }
    this.width = width;
    this.height = height;
    this.lastRenderTime = performance.now();
  }

  /**
   * Clean up the theme
   */
  public cleanup(): void {
    this.stopAnimationLoop();
    this.entities.clear();
    this.environment = null;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  public abstract createAgentRepresentation(agent: Agent): VisualEntity;
  public abstract createTaskRepresentation(task: Task): VisualEntity;
  public abstract createMessageRepresentation(
    message: Message,
    fromPosition: Position,
    toPosition: Position
  ): VisualEntity;
  public abstract createEnvironment(width: number, height: number): Environment;
  public abstract render(deltaTime: number): void;

  /**
   * Update a visual entity with animation
   * @param entity Entity to update
   * @param updates Updates to apply
   * @param animate Whether to animate the changes
   */
  public updateEntity(
    entity: VisualEntity, 
    updates: Partial<VisualEntity>, 
    animate: boolean = true
  ): void {
    if (!this.entities.has(entity.id)) {
      this.entities.set(entity.id, entity);
    }

    const updatedEntity = this.entities.get(entity.id)!;
    
    // If animate is true and position is being updated, create animation
    if (animate && updates.position && updatedEntity.position) {
      // Create animation state if not present
      if (!updatedEntity.animation) {
        updatedEntity.animation = {
          active: false,
          duration: 500, // default 500ms
          elapsed: 0,
          properties: {}
        };
      }
      
      // Set up position animation
      updatedEntity.animation.active = true;
      updatedEntity.animation.elapsed = 0;
      updatedEntity.animation.properties.position = {
        start: { ...updatedEntity.position },
        end: { ...updates.position },
        current: { ...updatedEntity.position }
      };
    }
    
    // Apply all updates
    Object.assign(updatedEntity, updates);
    this.entities.set(entity.id, updatedEntity);
  }

  /**
   * Remove an entity from the visualization
   * @param entityId ID of the entity to remove
   */
  public removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  /**
   * Start the animation loop
   */
  public startAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      return;
    }
    this.lastRenderTime = performance.now();
    this.animationLoop();
  }

  /**
   * Stop the animation loop
   */
  public stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Handle window resize
   * @param width New width
   * @param height New height
   */
  public handleResize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Create an animation for an entity
   * @param entity Entity to animate
   * @param property Property to animate (e.g., 'position', 'scale')
   * @param startValue Starting value
   * @param endValue Ending value
   * @param duration Animation duration in milliseconds
   * @param onComplete Callback when animation completes
   */
  protected createAnimation<T>(
    entity: VisualEntity,
    property: string,
    startValue: T,
    endValue: T,
    duration: number = 500,
    onComplete?: () => void
  ): void {
    // Create animation state if not present
    if (!entity.animation) {
      entity.animation = {
        active: false,
        duration: duration,
        elapsed: 0,
        properties: {}
      };
    }
    
    // Set up the animation
    entity.animation.active = true;
    entity.animation.duration = duration;
    entity.animation.elapsed = 0;
    entity.animation.onComplete = onComplete;
    
    // Create the property animation
    entity.animation.properties[property] = {
      start: { ...startValue } as any,
      end: { ...endValue } as any,
      current: { ...startValue } as any
    };
    
    // Update the entity in our collection
    this.entities.set(entity.id, entity);
  }
  
  /**
   * Process animations for all entities
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  protected processAnimations(deltaTime: number): void {
    for (const entity of this.entities.values()) {
      if (entity.animation && entity.animation.active) {
        // Update animation time
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
            const pos = values as AnimationProperty<Position>;
            entity.position.x = pos.start.x + (pos.end.x - pos.start.x) * progress;
            entity.position.y = pos.start.y + (pos.end.y - pos.start.y) * progress;
            if (pos.start.z !== undefined && pos.end.z !== undefined) {
              entity.position.z = pos.start.z + (pos.end.z - pos.start.z) * progress;
            }
          } else if (property === 'scale') {
            entity.scale = (values.start as number) + 
              ((values.end as number) - (values.start as number)) * progress;
          } else if (property === 'rotation') {
            entity.rotation = (values.start as number) + 
              ((values.end as number) - (values.start as number)) * progress;
          } else if (property === 'opacity') {
            entity.opacity = (values.start as number) + 
              ((values.end as number) - (values.start as number)) * progress;
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
    }
  }

  /**
   * Animation loop
   */
  private animationLoop(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;

    // Process animations before rendering
    this.processAnimations(deltaTime);
    
    // Render the scene
    this.render(deltaTime);

    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
  }
}