// Export available themes
export * from './simple2d/Simple2DTheme';
export * from './demo/DemoTheme';
export * from './isometric/IsometricOfficeTheme';
export * from './isometric/CoderCafeTheme';
// export * from './networkGraph/NetworkGraphTheme';

// Import theme registrations
import './simple2d/index';
import './demo/index';
import './isometric/index';

// Export theme plugins
export { Simple2DThemePlugin } from './simple2d/index';
export { DemoThemePlugin } from './demo/index';
export { IsometricOfficeThemePlugin } from './isometric/index';
export { CoderCafeThemePlugin } from './isometric/CoderCafePlugin';

// Re-export registerTheme for convenience
export { registerTheme } from '../core/ThemeManager';