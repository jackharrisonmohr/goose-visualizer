/**
 * Simple event emitter
 */
export class EventEmitter {
  private eventHandlers: Map<string, Array<(event: any) => void>> = new Map();

  /**
   * Subscribe to an event
   * @param eventType Event type to subscribe to
   * @param handler Event handler function
   * @returns Unsubscribe function
   */
  public on(eventType: string, handler: (event: any) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
    
    // Return an unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Subscribe to an event for a single emission
   * @param eventType Event type to subscribe to
   * @param handler Event handler function
   * @returns Unsubscribe function
   */
  public once(eventType: string, handler: (event: any) => void): () => void {
    const onceHandler = (event: any) => {
      this.off(eventType, onceHandler);
      handler(event);
    };
    
    this.on(eventType, onceHandler);
    
    // Return an unsubscribe function
    return () => this.off(eventType, onceHandler);
  }

  /**
   * Unsubscribe from an event
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
  public emit(event: any): void {
    if (!this.eventHandlers.has(event.type)) {
      return;
    }
    
    const handlers = [...this.eventHandlers.get(event.type)!];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }

  /**
   * Remove all event handlers
   */
  public removeAllListeners(): void {
    this.eventHandlers.clear();
  }

  /**
   * Get the number of listeners for an event type
   * @param eventType Event type
   * @returns Number of listeners
   */
  public listenerCount(eventType: string): number {
    if (!this.eventHandlers.has(eventType)) {
      return 0;
    }
    return this.eventHandlers.get(eventType)!.length;
  }
}