import { Agent, Message, Task } from '../core/types';

/**
 * Event types for the GooseVisualizer
 */

// Base event interface
export interface Event {
  type: string;
  timestamp: number;
}

// MCP-related events
export enum MCPEventType {
  CONNECTED = 'mcp:connected',
  DISCONNECTED = 'mcp:disconnected',
  ERROR = 'mcp:error',
}

// Agent-related events
export enum AgentEventType {
  REGISTERED = 'agent:registered',
  UPDATED = 'agent:updated',
  LEFT = 'agent:left',
  STATE_CHANGED = 'agent:state_changed',
  MOVED = 'agent:moved',
}

// Message-related events
export enum MessageEventType {
  ADDED = 'message:added',
  CLEARED = 'message:cleared',
}

// Task-related events
export enum TaskEventType {
  ADDED = 'task:added',
  ASSIGNED = 'task:assigned',
  COMPLETED = 'task:completed',
  UPDATED = 'task:updated',
  MOVED = 'task:moved',
}

// Theme-related events
export enum ThemeEventType {
  LOADED = 'theme:loaded',
  CHANGED = 'theme:changed',
  ERROR = 'theme:error',
  REGISTERED = 'theme:registered',
  UNREGISTERED = 'theme:unregistered',
  CONFIG_CHANGED = 'theme:config-changed',
}

// MCP connection event
export interface MCPConnectedEvent extends Event {
  type: MCPEventType.CONNECTED;
  url: string;
}

// MCP disconnection event
export interface MCPDisconnectedEvent extends Event {
  type: MCPEventType.DISCONNECTED;
  reason?: string;
}

// MCP error event
export interface MCPErrorEvent extends Event {
  type: MCPEventType.ERROR;
  error: Error;
}

// Agent registered event
export interface AgentRegisteredEvent extends Event {
  type: AgentEventType.REGISTERED;
  agent: Agent;
}

// Agent updated event
export interface AgentUpdatedEvent extends Event {
  type: AgentEventType.UPDATED;
  agent: Agent;
  changes: Partial<Agent>;
}

// Agent left event
export interface AgentLeftEvent extends Event {
  type: AgentEventType.LEFT;
  agentId: string;
}

// Agent state changed event
export interface AgentStateChangedEvent extends Event {
  type: AgentEventType.STATE_CHANGED;
  agentId: string;
  oldState: string;
  newState: string;
}

// Agent moved event
export interface AgentMovedEvent extends Event {
  type: AgentEventType.MOVED;
  agentId: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
}

// Message added event
export interface MessageAddedEvent extends Event {
  type: MessageEventType.ADDED;
  message: Message;
}

// Messages cleared event
export interface MessagesClearedEvent extends Event {
  type: MessageEventType.CLEARED;
}

// Task added event
export interface TaskAddedEvent extends Event {
  type: TaskEventType.ADDED;
  task: Task;
}

// Task assigned event
export interface TaskAssignedEvent extends Event {
  type: TaskEventType.ASSIGNED;
  taskId: string;
  agentId: string;
}

// Task completed event
export interface TaskCompletedEvent extends Event {
  type: TaskEventType.COMPLETED;
  taskId: string;
}

// Task updated event
export interface TaskUpdatedEvent extends Event {
  type: TaskEventType.UPDATED;
  task: Task;
  changes: Partial<Task>;
}

// Task moved event
export interface TaskMovedEvent extends Event {
  type: TaskEventType.MOVED;
  taskId: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
}

// System reset event
export interface SystemResetEvent extends Event {
  type: 'system:reset';
}

// Theme loaded event
export interface ThemeLoadedEvent extends Event {
  type: ThemeEventType.LOADED;
  themeName: string;
  config?: any;
}

// Theme changed event
export interface ThemeChangedEvent extends Event {
  type: ThemeEventType.CHANGED;
  oldTheme: string;
  newTheme: string;
}

// Theme error event
export interface ThemeErrorEvent extends Event {
  type: ThemeEventType.ERROR;
  themeName: string;
  error: Error;
}

// Theme registered event
export interface ThemeRegisteredEvent extends Event {
  type: ThemeEventType.REGISTERED;
  themeName: string;
  themeInfo: any;
}

// Theme unregistered event
export interface ThemeUnregisteredEvent extends Event {
  type: ThemeEventType.UNREGISTERED;
  themeName: string;
}

// Theme configuration changed event
export interface ThemeConfigChangedEvent extends Event {
  type: ThemeEventType.CONFIG_CHANGED;
  themeName: string;
  oldConfig: any;
  newConfig: any;
}

// Union type of all events
export type VisualizerEvent =
  | MCPConnectedEvent
  | MCPDisconnectedEvent
  | MCPErrorEvent
  | AgentRegisteredEvent
  | AgentUpdatedEvent
  | AgentLeftEvent
  | AgentStateChangedEvent
  | AgentMovedEvent
  | MessageAddedEvent
  | MessagesClearedEvent
  | TaskAddedEvent
  | TaskAssignedEvent
  | TaskCompletedEvent
  | TaskUpdatedEvent
  | TaskMovedEvent
  | SystemResetEvent
  | ThemeLoadedEvent
  | ThemeChangedEvent
  | ThemeErrorEvent
  | ThemeRegisteredEvent
  | ThemeUnregisteredEvent
  | ThemeConfigChangedEvent;