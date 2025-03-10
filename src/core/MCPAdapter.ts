import { EventEmitter } from '../utils/EventEmitter';
import { Agent, AgentState, Message, Task, TaskState } from './types';
import {
  AgentEventType,
  AgentRegisteredEvent,
  AgentStateChangedEvent,
  AgentUpdatedEvent,
  MCPConnectedEvent,
  MCPDisconnectedEvent,
  MCPErrorEvent,
  MCPEventType,
  MessageAddedEvent,
  MessageEventType,
  TaskAddedEvent,
  TaskAssignedEvent,
  TaskCompletedEvent,
  TaskEventType,
  TaskUpdatedEvent,
} from '../events/EventTypes';

/**
 * Configuration for the MCP adapter
 */
export interface MCPAdapterConfig {
  serverUrl: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Adapter for the Model Context Protocol (MCP) server
 */
export class MCPAdapter extends EventEmitter {
  private config: Required<MCPAdapterConfig>;
  private eventSource: EventSource | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private agents: Map<string, Agent> = new Map();
  private messages: Message[] = [];
  private tasks: Map<string, Task> = new Map();

  /**
   * Constructor
   * @param config Configuration for the MCP adapter
   */
  constructor(config: MCPAdapterConfig) {
    super();
    
    // Set default configuration
    this.config = {
      serverUrl: config.serverUrl,
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 5000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
    };
  }

  /**
   * Connect to the MCP server
   * @returns Promise that resolves when connected
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      try {
        // Create a new event source
        this.eventSource = new EventSource(this.config.serverUrl);
        
        // Set up event handlers
        this.eventSource.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Emit connected event
          this.emit({
            type: MCPEventType.CONNECTED,
            url: this.config.serverUrl,
            timestamp: Date.now(),
          } as MCPConnectedEvent);
          
          resolve();
        };
        
        this.eventSource.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };
        
        this.eventSource.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        this.handleError(error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the MCP server
   */
  public disconnect(): void {
    if (!this.connected || !this.eventSource) {
      return;
    }
    
    this.eventSource.close();
    this.eventSource = null;
    this.connected = false;
    
    // Emit disconnected event
    this.emit({
      type: MCPEventType.DISCONNECTED,
      timestamp: Date.now(),
    } as MCPDisconnectedEvent);
  }

  /**
   * Get all agents
   * @returns Array of agents
   */
  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get an agent by ID
   * @param agentId Agent ID
   * @returns Agent, or undefined if not found
   */
  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all messages
   * @returns Array of messages
   */
  public getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Get all tasks
   * @returns Array of tasks
   */
  public getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a task by ID
   * @param taskId Task ID
   * @returns Task, or undefined if not found
   */
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Handle a message from the MCP server
   * @param event Message event
   * @internal
   */
  public handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Process the message based on its type
      switch (data.type) {
        case 'agent:registered':
          this.handleAgentRegistered(data);
          break;
        case 'agent:left':
          this.handleAgentLeft(data);
          break;
        case 'agent:wait':
          this.handleAgentWait(data);
          break;
        case 'agent:moved':
          this.handleAgentMoved(data);
          break;
        case 'message:added':
          this.handleMessageAdded(data);
          break;
        case 'message:cleared':
          this.handleMessagesCleared();
          break;
        case 'task:added':
          this.handleTaskAdded(data);
          break;
        case 'task:assigned':
          this.handleTaskAssigned(data);
          break;
        case 'task:completed':
          this.handleTaskCompleted(data);
          break;
        case 'task:moved':
          this.handleTaskMoved(data);
          break;
        case 'system:reset':
          this.handleSystemReset();
          break;
        default:
          // Forward unknown events to listeners - useful for custom theme-specific events
          this.emit({
            type: data.type,
            ...data,
            timestamp: Date.now(),
          });
          console.log(`Forwarded custom event: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing MCP message:', error);
    }
  }

  /**
   * Handle an agent registration
   * @param data Agent data
   */
  private handleAgentRegistered(data: any): void {
    const agent: Agent = {
      id: data.agent.id,
      name: data.agent.name || `Agent ${data.agent.id}`,
      color: data.agent.color || '#007bff',
      state: AgentState.IDLE,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    
    this.agents.set(agent.id, agent);
    
    // Emit agent registered event
    this.emit({
      type: AgentEventType.REGISTERED,
      agent,
      timestamp: Date.now(),
    } as AgentRegisteredEvent);
  }

  /**
   * Handle an agent leaving
   * @param data Agent data
   */
  private handleAgentLeft(data: any): void {
    const agentId = data.agent.id;
    
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      
      // Emit agent left event
      this.emit({
        type: AgentEventType.LEFT,
        agentId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle an agent wait
   * @param data Agent data
   */
  private handleAgentWait(data: any): void {
    const agentId = data.agent.id;
    const agent = this.agents.get(agentId);
    
    if (agent) {
      const oldState = agent.state;
      agent.state = AgentState.WAITING;
      agent.lastActive = Date.now();
      
      // Update the agent
      this.agents.set(agentId, agent);
      
      // Emit agent state changed event
      this.emit({
        type: AgentEventType.STATE_CHANGED,
        agentId,
        oldState,
        newState: AgentState.WAITING,
        timestamp: Date.now(),
      } as AgentStateChangedEvent);
      
      // Emit agent updated event
      this.emit({
        type: AgentEventType.UPDATED,
        agent,
        changes: { state: AgentState.WAITING, lastActive: agent.lastActive },
        timestamp: Date.now(),
      } as AgentUpdatedEvent);
    }
  }

  /**
   * Handle a message added
   * @param data Message data
   */
  private handleMessageAdded(data: any): void {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: data.message.senderId,
      content: data.message.content,
      timestamp: Date.now(),
    };
    
    this.messages.push(message);
    
    // Update the agent's last active time and state
    const agent = this.agents.get(message.senderId);
    if (agent) {
      const oldState = agent.state;
      agent.state = AgentState.ACTIVE;
      agent.lastActive = Date.now();
      
      // Update the agent
      this.agents.set(message.senderId, agent);
      
      // Emit agent state changed event
      this.emit({
        type: AgentEventType.STATE_CHANGED,
        agentId: message.senderId,
        oldState,
        newState: AgentState.ACTIVE,
        timestamp: Date.now(),
      } as AgentStateChangedEvent);
      
      // Emit agent updated event
      this.emit({
        type: AgentEventType.UPDATED,
        agent,
        changes: { state: AgentState.ACTIVE, lastActive: agent.lastActive },
        timestamp: Date.now(),
      } as AgentUpdatedEvent);
    }
    
    // Emit message added event
    this.emit({
      type: MessageEventType.ADDED,
      message,
      timestamp: Date.now(),
    } as MessageAddedEvent);
  }

  /**
   * Handle messages cleared
   */
  private handleMessagesCleared(): void {
    this.messages = [];
    
    // Emit messages cleared event
    this.emit({
      type: MessageEventType.CLEARED,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle a task added
   * @param data Task data
   */
  private handleTaskAdded(data: any): void {
    const task: Task = {
      id: data.task.id,
      description: data.task.description,
      state: TaskState.PENDING,
      createdAt: Date.now(),
    };
    
    this.tasks.set(task.id, task);
    
    // Emit task added event
    this.emit({
      type: TaskEventType.ADDED,
      task,
      timestamp: Date.now(),
    } as TaskAddedEvent);
  }

  /**
   * Handle a task assigned
   * @param data Task data
   */
  private handleTaskAssigned(data: any): void {
    const taskId = data.taskId;
    const agentId = data.agentId;
    const task = this.tasks.get(taskId);
    
    if (task) {
      const oldState = task.state;
      task.state = TaskState.ASSIGNED;
      task.assignedTo = agentId;
      
      // Update the task
      this.tasks.set(taskId, task);
      
      // Emit task assigned event
      this.emit({
        type: TaskEventType.ASSIGNED,
        taskId,
        agentId,
        timestamp: Date.now(),
      } as TaskAssignedEvent);
      
      // Emit task updated event
      this.emit({
        type: TaskEventType.UPDATED,
        task,
        changes: { state: TaskState.ASSIGNED, assignedTo: agentId },
        timestamp: Date.now(),
      } as TaskUpdatedEvent);
      
      // Update the agent's state
      const agent = this.agents.get(agentId);
      if (agent) {
        const oldAgentState = agent.state;
        agent.state = AgentState.WORKING;
        agent.lastActive = Date.now();
        
        // Update the agent
        this.agents.set(agentId, agent);
        
        // Emit agent state changed event
        this.emit({
          type: AgentEventType.STATE_CHANGED,
          agentId,
          oldState: oldAgentState,
          newState: AgentState.WORKING,
          timestamp: Date.now(),
        } as AgentStateChangedEvent);
        
        // Emit agent updated event
        this.emit({
          type: AgentEventType.UPDATED,
          agent,
          changes: { state: AgentState.WORKING, lastActive: agent.lastActive },
          timestamp: Date.now(),
        } as AgentUpdatedEvent);
      }
    }
  }

  /**
   * Handle a task completed
   * @param data Task data
   */
  private handleTaskCompleted(data: any): void {
    const taskId = data.taskId;
    const task = this.tasks.get(taskId);
    
    if (task) {
      const oldState = task.state;
      task.state = TaskState.COMPLETED;
      task.completedAt = Date.now();
      
      // Update the task
      this.tasks.set(taskId, task);
      
      // Emit task completed event
      this.emit({
        type: TaskEventType.COMPLETED,
        taskId,
        timestamp: Date.now(),
      } as TaskCompletedEvent);
      
      // Emit task updated event
      this.emit({
        type: TaskEventType.UPDATED,
        task,
        changes: { state: TaskState.COMPLETED, completedAt: task.completedAt },
        timestamp: Date.now(),
      } as TaskUpdatedEvent);
      
      // Update the agent's state if the task was assigned
      if (task.assignedTo) {
        const agent = this.agents.get(task.assignedTo);
        if (agent) {
          const oldAgentState = agent.state;
          agent.state = AgentState.IDLE;
          agent.lastActive = Date.now();
          
          // Update the agent
          this.agents.set(task.assignedTo, agent);
          
          // Emit agent state changed event
          this.emit({
            type: AgentEventType.STATE_CHANGED,
            agentId: task.assignedTo,
            oldState: oldAgentState,
            newState: AgentState.IDLE,
            timestamp: Date.now(),
          } as AgentStateChangedEvent);
          
          // Emit agent updated event
          this.emit({
            type: AgentEventType.UPDATED,
            agent,
            changes: { state: AgentState.IDLE, lastActive: agent.lastActive },
            timestamp: Date.now(),
          } as AgentUpdatedEvent);
        }
      }
    }
  }

  /**
   * Handle agent moved event
   * @param data Agent movement data
   */
  private handleAgentMoved(data: any): void {
    const agentId = data.agentId;
    const position = data.position;
    const agent = this.agents.get(agentId);
    
    if (agent) {
      agent.position = position;
      agent.lastActive = Date.now();
      
      // Update the agent
      this.agents.set(agentId, agent);
      
      // Emit agent updated event
      this.emit({
        type: AgentEventType.UPDATED,
        agent,
        changes: { position, lastActive: agent.lastActive },
        timestamp: Date.now(),
      } as AgentUpdatedEvent);
      
      // Emit special event for position change
      this.emit({
        type: 'agent:moved',
        agentId,
        position,
        timestamp: Date.now(),
      });
    }
  }
  
  /**
   * Handle task moved event
   * @param data Task movement data
   */
  private handleTaskMoved(data: any): void {
    const taskId = data.taskId;
    const position = data.position;
    const task = this.tasks.get(taskId);
    
    if (task) {
      // Update the task
      this.tasks.set(taskId, task);
      
      // Emit task updated event
      this.emit({
        type: TaskEventType.UPDATED,
        task,
        changes: { position },
        timestamp: Date.now(),
      } as TaskUpdatedEvent);
      
      // Emit special event for position change
      this.emit({
        type: 'task:moved',
        taskId,
        position,
        timestamp: Date.now(),
      });
    }
  }
  
  /**
   * Handle system reset event
   */
  private handleSystemReset(): void {
    // Clear all state
    this.agents.clear();
    this.tasks.clear();
    this.messages = [];
    
    // Emit reset event
    this.emit({
      type: 'system:reset',
      timestamp: Date.now(),
    });
  }
  
  /**
   * Handle connection error
   * @param error Error object
   */
  private handleError(error: any): void {
    console.error('MCP connection error:', error);
    
    // Close the event source
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.connected = false;
    
    // Emit error event
    this.emit({
      type: MCPEventType.ERROR,
      error,
      timestamp: Date.now(),
    } as MCPErrorEvent);
    
    // Attempt to reconnect if configured to do so
    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Error will be emitted by the connect method
        });
      }, this.config.reconnectInterval);
    }
  }
}