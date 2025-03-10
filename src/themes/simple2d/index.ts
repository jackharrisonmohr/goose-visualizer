import { registerTheme } from '../../core/ThemeManager';
import { Simple2DTheme } from './Simple2DTheme';

// Register the simple 2D theme
registerTheme(
  'simple-2d',
  'A simple 2D theme with basic shapes',
  () => new Simple2DTheme()
);

// Create a themed plugin
export const Simple2DThemePlugin = {
  name: 'simple-2d',
  description: 'A simple 2D theme with basic shapes',
  version: '1.0.0',
  author: {
    name: 'GooseVisualizer Team',
  },
  createTheme: (config: any) => new Simple2DTheme(),
  configSchema: {
    // Simple theme doesn't have configurable options yet
  }
};