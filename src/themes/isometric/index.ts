import { ThemePlugin } from '../../core/ThemeManager';
import { IsometricOfficeTheme } from './IsometricOfficeTheme';

// Create a themed plugin
export const IsometricOfficeThemePlugin: ThemePlugin = {
  name: 'isometric-office',
  description: 'Isometric office environment visualization',
  version: '1.0.0',
  author: {
    name: 'GooseVisualizer Team',
  },
  thumbnailUrl: 'assets/isometric/thumbnail.png',
  createTheme: (config: any) => new IsometricOfficeTheme(config?.options),
  configSchema: {
    showGrid: {
      type: 'boolean',
      defaultValue: true,
      description: 'Show grid lines on the floor'
    },
    floorColor: {
      type: 'color',
      defaultValue: '#e0e0ff',
      description: 'Floor color'
    },
    wallColor: {
      type: 'color',
      defaultValue: '#8090c0',
      description: 'Wall color'
    },
    agentScale: {
      type: 'number',
      defaultValue: 1.0,
      description: 'Agent scale factor'
    },
    moveSpeed: {
      type: 'number',
      defaultValue: 300,
      description: 'Movement speed (ms per tile)'
    }
  }
};