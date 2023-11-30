import commonJS from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import packageJson from './package.json' assert { type: 'json' };
import tsConfig from './tsconfig.json' assert { type: 'json' };
import virtual from '@rollup/plugin-virtual';
import json from '@rollup/plugin-json';
const empty = 'export default {}';

const config = {
  input: 'src/index.ts',
  external: [
    ...Object.keys(packageJson.peerDependencies).filter((key) => key.startsWith('@iden3/')),
    'snarkjs',
    'ffjavascript'
  ],
  output: {
    format: 'es',
    file: packageJson.exports['.'].browser,
    sourcemap: true
  },
  context: 'window',
  plugins: [
    typescript({
      compilerOptions: tsConfig.compilerOptions
    }),
    commonJS(),
    nodeResolve({
      browser: true
    }),
    json(),
    virtual({
      fs: empty
    })
  ],
  treeshake: {
    preset: 'smallest'
  }
};

export default [
  config,
  {
    ...config,
    external: [],
    output: {
      ...config.output,
      format: 'iife',
      file: packageJson.exports['.'].umd,
      name: 'PolygonIdSdk'
    }
  }
];
