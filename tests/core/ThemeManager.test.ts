import { ThemeManager } from '../../src/core/ThemeManager';

// Simple tests for ThemeManager
describe('ThemeManager', () => {
  it('should register and retrieve themes', () => {
    const themeManager = new ThemeManager();
    
    // Register a theme
    themeManager.registerTheme({
      name: 'test-theme',
      description: 'A test theme',
      factory: () => ({} as any),
    });
    
    // Check that the theme is registered
    const themes = themeManager.getThemes();
    expect(themes.length).toBe(1);
    expect(themes[0].name).toBe('test-theme');
    expect(themes[0].description).toBe('A test theme');
  });
  
  it('should not allow duplicate theme registration', () => {
    const themeManager = new ThemeManager();
    
    // Register a theme
    themeManager.registerTheme({
      name: 'test-theme',
      description: 'A test theme',
      factory: () => ({} as any),
    });
    
    // Attempt to register a theme with the same name
    expect(() => {
      themeManager.registerTheme({
        name: 'test-theme',
        description: 'Another test theme',
        factory: () => ({} as any),
      });
    }).toThrow('Theme test-theme is already registered');
  });
});