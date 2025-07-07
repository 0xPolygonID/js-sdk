import { defineConfig } from 'tsup';
import packageJson from './package.json' with { type: 'json' };
import * as path from 'path';

const getDir = (filePath) => path.dirname(filePath);

// Base external dependencies (for Node.js builds)
const baseExternal = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.devDependencies),
  ...Object.keys(packageJson.peerDependencies)
];

const config = {
  entry: ['src/index.ts'],
  platform: 'node',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: baseExternal
};


// For browser ESM build, we need to bundle some dependencies that are problematic as externals  
const browserESMExternal = [
  ...Object.keys(packageJson.peerDependencies).filter((key) => key.startsWith('@iden3/')),
  'snarkjs',
  'ffjavascript'
];

export default defineConfig([
  {
    ...config,
    format: ['esm'],
    outDir: getDir(packageJson.exports['.'].node.import),
  },
  {
    ...config,
    format: ['cjs'],
    outDir: getDir(packageJson.exports['.'].node.require),
    outExtension: () => ({
      '.js': '.cjs',
    }),
  },
  {
    ...config,
    format: ['esm'],
    // !NOTE: uncomment if you need to test index.html
    // external: [...Object.keys(packageJson.peerDependencies)],
    // noExternal: [
    //   ...Object.keys(packageJson.dependencies),
    // ],
    platform: 'browser',
    outDir: getDir(packageJson.exports['.'].browser),
    env: {
      BUILD_BROWSER: true,
    },
  },
  
  {
    ...config,
    format: ['iife'],
    platform: 'browser',
    globalName: 'PolygonIdSdk',
    external: [],
    env: {
      BUILD_BROWSER: true,
    },
    minify: true,
    outDir: getDir(packageJson.exports['.'].umd),
  }
]);
