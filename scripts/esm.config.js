const esbuild = require('esbuild');
const baseConfig = require('./base.config');
esbuild.build(baseConfig).catch(() => process.exit(1));
