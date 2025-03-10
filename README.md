# GooseVisualizer

A modular visualization layer for multi-agent AI systems, designed to work with the Model Context Protocol (MCP). Visualize your agent collaboration in an isometric environment, network graph, or custom visualization of your choice.

## Features

- 🔌 Seamless integration with Model Context Protocol (MCP) servers
- 🎮 Visualize agents as interactive characters in isometric environments
- 📊 Alternative visualization modes including network graphs
- 🧩 Pluggable theme system for custom visualizations
- 🚀 Real-time updates based on agent activities
- 🔧 Highly configurable and extensible

## Installation

```bash
npm install goose-visualizer
```

## Quick Start

```javascript
import { GooseVisualizer } from 'goose-visualizer';

// Create a new visualizer
const visualizer = new GooseVisualizer({
  mcpServer: 'http://localhost:3001/sse',
  theme: 'simple-2d',
  elementId: 'visualization-container',
});

// Initialize and start the visualizer
visualizer.initialize().then(() => {
  visualizer.start();
});
```

## HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>GooseVisualizer Demo</title>
  <style>
    #visualization-container {
      width: 800px;
      height: 600px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <div id="visualization-container"></div>
  
  <script type="module">
    import { GooseVisualizer } from './dist/index.js';
    
    const visualizer = new GooseVisualizer({
      mcpServer: 'http://localhost:3001/sse',
      theme: 'simple-2d',
      elementId: 'visualization-container',
    });
    
    visualizer.initialize().then(() => {
      visualizer.start();
    });
  </script>
</body>
</html>
```

## Available Themes

GooseVisualizer comes with several built-in themes:

- `simple-2d`: A basic 2D visualization with simple shapes
- `isometric-office`: An isometric office environment with character avatars (coming soon)
- `network-graph`: A node-based graph visualization for agent relationships (coming soon)

## Configuration Options

```javascript
const visualizer = new GooseVisualizer({
  // Required parameters
  mcpServer: 'http://localhost:3001/sse',  // URL of the MCP server
  theme: 'simple-2d',                      // Theme to use
  elementId: 'visualization-container',    // ID of the container element
  
  // Optional parameters
  width: 800,                              // Width of the visualization
  height: 600,                             // Height of the visualization
  debug: true,                             // Enable debug mode
  autoConnect: true,                       // Automatically connect to MCP server
  refreshRate: 30,                         // Animation refresh rate (fps)
});
```

## Events

You can subscribe to events from the visualizer:

```javascript
// Subscribe to agent registration events
visualizer.on('agent:registered', (event) => {
  console.log(`Agent registered: ${event.agent.id}`);
});

// Subscribe to message events
visualizer.on('message:added', (event) => {
  console.log(`Message from ${event.message.senderId}: ${event.message.content}`);
});
```

## Creating Custom Themes

You can create custom themes by implementing the `VisualizationTheme` interface or extending the `BaseTheme` class:

```javascript
import { BaseTheme, registerTheme, Agent, Task, Message, Position, VisualEntity } from 'goose-visualizer';

class MyCustomTheme extends BaseTheme {
  public readonly name = 'my-custom-theme';
  
  // Implement required methods
  // ...
}

// Register the theme
registerTheme(
  'my-custom-theme',
  'My custom visualization theme',
  () => new MyCustomTheme()
);
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for more details on creating custom themes.

## Public API

### GooseVisualizer

The main class for visualizing multi-agent systems.

```typescript
class GooseVisualizer {
  constructor(config: VisualizerConfig);
  async initialize(): Promise<void>;
  async start(): Promise<void>;
  stop(): void;
  async connect(): Promise<void>;
  disconnect(): void;
  async setTheme(themeName: string): Promise<void>;
  getTheme(): string;
  getAvailableThemes(): string[];
  resize(width: number, height: number): void;
  on(eventType: string, handler: (event: any) => void): void;
  off(eventType: string, handler: (event: any) => void): void;
}
```

### ThemeManager

Manages visualization themes.

```typescript
class ThemeManager {
  registerTheme(themeInfo: ThemeInfo): void;
  getThemes(): ThemeInfo[];
  async loadTheme(themeName: string, containerId: string, width: number, height: number): Promise<VisualizationTheme>;
  getActiveTheme(): VisualizationTheme | null;
}
```

### MCPAdapter

Connects to the MCP server and processes events.

```typescript
class MCPAdapter {
  constructor(config: MCPAdapterConfig);
  async connect(): Promise<void>;
  disconnect(): void;
  getAgents(): Agent[];
  getAgent(agentId: string): Agent | undefined;
  getMessages(): Message[];
  getTasks(): Task[];
  getTask(taskId: string): Task | undefined;
}
```

## Development

### Prerequisites

- Node.js 16+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/goose-visualizer.git
cd goose-visualizer

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Available Scripts

- `npm run build`: Build the project
- `npm run typecheck`: Check TypeScript types
- `npm run lint`: Lint the code
- `npm run lint:fix`: Lint and fix code issues
- `npm run format`: Format the code with Prettier
- `npm run test`: Run tests
- `npm run clean`: Clean build outputs

# How to Demo
To try out the GooseVisualizer, follow these steps:

  1. Build the project first:

  cd /Users/HarrisonMohr/goose-flock/GooseVisualizer
  npm run build

  2. Start a local web server:

  You need a local web server to serve the HTML files and JavaScript modules. You can use a simple HTTP server:

  # Using npx and serve (if you have Node.js installed)
  npx serve

  # Or using Python's built-in HTTP server
  python3 -m http.server

  3. Access the demo:

  Open your web browser and navigate to:
  - If using npx serve: http://localhost:3000/examples/demo.html
  - If using Python: http://localhost:8000/examples/demo.html

  4. Interact with the demo:

  - Click "Connect to MCP" to simulate connecting to an MCP server
  - Add agents using the "Add Agent" button
  - Add tasks using the "Add Task" button
  - Assign tasks to agents with the "Assign Task" button
  - Complete tasks with the "Complete Task" button
  - Send messages between agents with the "Send Message" button

  5. Observe the visualization:

  As you add agents, tasks, and messages, you should see them appear in the visualization container. The agents will be displayed as colored circles, tasks
   as rectangles, and messages as moving dots.

  6. Use browser developer tools:

  Open your browser's developer console (F12 or Ctrl+Shift+I) to see log messages indicating what's happening behind the scenes.

  Note about MCP Server:
  The demo is configured to simulate MCP events without actually connecting to a real MCP server. In a real application, you would need to have an MCP
  server running at the specified URL (http://localhost:3001/sse).

  This demo allows you to try out the visualization capabilities without needing a real MCP server. It demonstrates how agents, tasks, and messages are
  visualized, and how the system responds to events.

## Documentation

- [Architecture](ARCHITECTURE.md): Detailed architecture documentation
- [Progress](PROGRESS.md): Implementation progress

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.