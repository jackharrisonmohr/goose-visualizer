# GooseVisualizer Architecture

## Overview

GooseVisualizer is a modular visualization layer for multi-agent AI systems, designed to work with the Model Context Protocol (MCP). It provides a flexible, theme-based visualization framework that can be customized to show agents as characters in an isometric environment, as nodes in a network graph, or any other visual representation.

## Core Design Principles

1. **Modularity**: All components are modular and can be replaced or extended.
2. **Theme-Based Visualization**: Different visualization styles are implemented as themes.
3. **Event-Driven**: The system is event-driven, allowing for real-time updates.
4. **Protocol Agnostic**: While designed for MCP, the architecture could be adapted for other protocols.

## System Components

### 1. MCP Integration Layer

The MCP integration layer connects to the MCP server and translates protocol-specific events into visualization events.

**Key Components:**
- `MCPAdapter`: Connects to the MCP server via SSE, processes events, and manages the state of agents, tasks, and messages.

**Responsibilities:**
- Connect to and communicate with the MCP server
- Process incoming messages and events
- Maintain a local state of agents, tasks, and messages
- Emit visualization events

### 2. Event System

The event system provides a way for components to communicate without tight coupling.

**Key Components:**
- `EventEmitter`: A simple event emitter with support for typed events.
- `EventTypes`: Definitions of all event types used in the system.

**Responsibilities:**
- Allow components to subscribe to events
- Emit events when state changes
- Provide typed event definitions

### 3. Theme System

The theme system allows for different visualization styles to be implemented and switched at runtime.

**Key Components:**
- `ThemeManager`: Manages theme registration and loading.
- `VisualizationTheme` (interface): Defines the contract for themes.
- `BaseTheme`: An abstract base class implementing common theme functionality.

**Responsibilities:**
- Register visualization themes
- Load and initialize themes
- Provide a common interface for all themes

### 4. Visualization Engine

The visualization engine renders the state of the multi-agent system based on the active theme.

**Key Components:**
- `GooseVisualizer`: The main class that orchestrates all components.
- Theme implementations (e.g., `Simple2DTheme`, `IsometricOfficeTheme`).

**Responsibilities:**
- Render the visualization
- Handle user interaction
- Manage the animation loop
- Switch between themes

## Data Flow

1. MCP server generates events (agent registration, messages, tasks).
2. MCPAdapter receives these events via SSE and updates its internal state.
3. MCPAdapter emits visualization events.
4. GooseVisualizer receives these events and updates its state.
5. Active Theme renders the updated state.

## Theme Architecture

Themes are designed to be pluggable and provide complete control over the visual representation.

**Theme Interface:**
- `initialize`: Set up the theme environment
- `createAgentRepresentation`: Create a visual representation of an agent
- `createTaskRepresentation`: Create a visual representation of a task
- `createMessageRepresentation`: Create a visual representation of a message
- `createEnvironment`: Create the environment
- `render`: Render the entire visualization
- `startAnimationLoop`: Start the animation loop
- `stopAnimationLoop`: Stop the animation loop
- `handleResize`: Handle window resize

**Entity Model:**
- `VisualEntity`: Represents a visual entity in the scene
- `Environment`: Represents the visual environment
- `Position`: Represents a position in space
- `Size`: Represents a size in space

## Configuration and Extension

### Adding New Themes

1. Implement the `VisualizationTheme` interface or extend the `BaseTheme` class.
2. Register the theme with the `ThemeManager`.
3. Implement the required methods for creating visual representations.

### Supporting New Protocols

1. Create a new adapter similar to `MCPAdapter` for the new protocol.
2. Translate protocol-specific events to visualization events.
3. Replace the MCPAdapter in the GooseVisualizer with the new adapter.

## Technology Stack

- **TypeScript**: For type safety and better developer experience
- **ESBuild**: For fast, efficient bundling
- **Jest**: For testing
- **Canvas/WebGL**: For rendering (via themes)
- **Event Source**: For SSE communication with the MCP server

## Diagrams

### Component Diagram

```
+---------------+     +----------------+     +------------------+
| GooseVisualizer|---->| ThemeManager  |---->| VisualizationTheme|
+---------------+     +----------------+     +------------------+
       |
       |
       v
+---------------+     +----------------+
| MCPAdapter    |---->| EventEmitter   |
+---------------+     +----------------+
       |
       |
       v
+---------------+
| MCP Server    |
+---------------+
```

### Event Flow Diagram

```
MCP Server ---> MCPAdapter ---> GooseVisualizer ---> Active Theme ---> Render
   |              |                 |
   |              v                 v
   +------> State Updates ----> Theme Updates
```

## Future Extensions

The architecture is designed to support future extensions, such as:

1. **Custom Rendering Engines**: Support for different rendering backends (Canvas, WebGL, SVG).
2. **Interactive Elements**: Support for user interaction with agents and tasks.
3. **Data Recording**: Recording and playback of agent interactions.
4. **Analytics Dashboard**: Real-time analytics based on agent behaviors.
5. **Multi-protocol Support**: Support for multiple agent communication protocols.