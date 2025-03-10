/**
 * Types for the GooseVisualizer
 */

// Agent representation
export interface Agent {
  id: string;
  name?: string;
  color?: string;
  state: AgentState;
  position?: Position;
  createdAt: number;
  lastActive: number;
}

// Agent states
export enum AgentState {
  IDLE = 'idle',
  ACTIVE = 'active',
  THINKING = 'thinking',
  WORKING = 'working',
  WAITING = 'waiting',
  DISCONNECTED = 'disconnected',
}

// Message representation
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

// Task representation
export interface Task {
  id: string;
  description: string;
  state: TaskState;
  assignedTo?: string;
  createdAt: number;
  completedAt?: number;
}

// Task states
export enum TaskState {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Position in 2D/3D space
export interface Position {
  x: number;
  y: number;
  z?: number;
}

// Size in 2D/3D space
export interface Size {
  width: number;
  height: number;
  depth?: number;
}

// Visual entity in the visualization
export interface VisualEntity {
  id: string;
  type: 'agent' | 'task' | 'message' | 'environment';
  position: Position;
  size?: Size;
  rotation?: number;
  scale?: number;
  opacity?: number;
  visible: boolean;
  zIndex?: number;
  data?: any;
  animation?: AnimationState;
  render: (ctx: any) => void;
  update: (deltaTime: number) => void;
}

// Environment configuration
export interface Environment {
  id: string;
  size: Size;
  background?: string;
  grid?: boolean;
  entities: VisualEntity[];
}

// Animation property
export interface AnimationProperty<T> {
  start: T;
  end: T;
  current: T;
}

// Animation state
export interface AnimationState {
  active: boolean;
  duration: number;
  elapsed: number;
  properties: {
    position?: AnimationProperty<Position>;
    scale?: AnimationProperty<number>;
    rotation?: AnimationProperty<number>;
    opacity?: AnimationProperty<number>;
    color?: AnimationProperty<string>;
    [key: string]: AnimationProperty<any> | undefined;
  };
  loop?: boolean;
  onComplete?: () => void;
}

// Animation definition (for pre-defined animations)
export interface Animation {
  id: string;
  duration: number;
  frames: number;
  loop?: boolean;
  onStart?: () => void;
  onFrame?: (progress: number) => void;
  onComplete?: () => void;
}

// GooseVisualizer configuration
export interface VisualizerConfig {
  mcpServer: string;
  theme: string;
  elementId: string;
  width?: number;
  height?: number;
  debug?: boolean;
  autoConnect?: boolean;
  refreshRate?: number;
}