import * as esbuild from 'esbuild';

// Build for Node.js (CommonJS)
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: ['node16'],
  outfile: 'dist/index.cjs',
  format: 'cjs',
  sourcemap: true,
});

// Build for browsers and modern environments (ESM)
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'browser',
  target: ['es2022'],
  outfile: 'dist/index.js',
  format: 'esm',
  sourcemap: true,
});

console.log('Build complete!');