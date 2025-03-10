import { MCPAdapter } from '../../src/core/MCPAdapter';

// Very simple test for now
describe('MCPAdapter', () => {
  it('should create an adapter with the correct configuration', () => {
    const adapter = new MCPAdapter({
      serverUrl: 'http://localhost:3001/sse',
    });
    
    expect(adapter).toBeDefined();
  });
});