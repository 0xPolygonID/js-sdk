const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const devConfigEsm = merge(commonConfig, {
  mode: "development",
  devtool: 'eval-source-map',
  entry: './example/example.ts',
  target: ['browserslist'],

  output: {
    filename: 'index.js'
  },
  optimization: {
    minimize: false,
  },
  devServer: {
    open: true,
    hot: true,
    host: "localhost",
    port: 9000
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
});
module.exports = devConfigEsm;
