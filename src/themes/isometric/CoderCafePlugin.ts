/**
 * Coder Café theme plugin registration
 */
import { ThemePlugin } from '../../core/ThemeManager';
import { CoderCafeTheme } from './CoderCafeTheme';

// Create the coder café theme plugin
export const CoderCafeThemePlugin: ThemePlugin = {
  name: 'coder-cafe',
  description: 'Isometric café environment for coders and AI collaboration',
  version: '1.0.0',
  author: {
    name: 'GooseVisualizer Team',
  },
  thumbnailUrl: 'assets/isometric/thumbnail-cafe.png',
  createTheme: (config: any) => new CoderCafeTheme(config?.options),
  configSchema: {
    showGrid: {
      type: 'boolean',
      defaultValue: false,
      description: 'Show grid lines on the floor'
    },
    floorColor: {
      type: 'color',
      defaultValue: '#e8d4b9',
      description: 'Floor color'
    },
    wallColor: {
      type: 'color',
      defaultValue: '#a67c52',
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
    },
    enableShadows: {
      type: 'boolean',
      defaultValue: true,
      description: 'Enable entity shadows'
    },
    timeOfDay: {
      type: 'select',
      options: ['morning', 'afternoon', 'evening'],
      defaultValue: 'afternoon',
      description: 'Time of day for lighting effects'
    }
  }
};