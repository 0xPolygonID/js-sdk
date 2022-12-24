const esbuild = require('esbuild');
const baseConfig = require('./base.config');
const pkg = require('../package.json');

const name = 'IdenPolygonIdSdk';

esbuild.build({
  ...baseConfig,
  minify: true,
  format: 'iife',
  outfile: pkg.main.replace('cjs', 'umd'),
  globalName: name

}).catch(() => process.exit(1));
