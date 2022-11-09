const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config');

const prodConfigEsm = merge(commonConfig, {
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/esm'),
    library: {
      type: "commonjs2",
    },
  },
});

const prodConfigUMD = merge(commonConfig, {
  mode: "production",
  entry: {
    iden3JsSdk: './src/index.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/umd'),
    library: 'iden3JsSdk',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
});
module.exports = [prodConfigEsm, prodConfigUMD];
