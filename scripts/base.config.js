const NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default;
const NodeGlobalPolyfills = require('@esbuild-plugins/node-globals-polyfill').default;
const pkg = require('../package.json');
const esmConfig = {
  plugins: [
    NodeGlobalPolyfills({
      process: true,
      buffer: true,
      fs: true,
      crypto: true
    }),
    NodeModulesPolyfills()
  ],
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  target: 'esnext',
  outfile: pkg['esm:esbuild'],
  format: 'esm',
};
module.exports = esmConfig;
