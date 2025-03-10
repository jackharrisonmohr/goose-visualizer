import { registerTheme } from '../../core/ThemeManager';
import { DemoTheme, DemoThemePlugin } from './DemoTheme';

// Register the demo theme
registerTheme(
  'demo-theme',
  'A configurable demo theme with custom shapes',
  () => new DemoTheme()
);

// Export the theme plugin
export { DemoThemePlugin };