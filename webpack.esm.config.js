const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

const prodConfig = require('./webpack.prod');
module.exports = function () {
  const config = {
    mode: "production",
    // devtool: 'source-map',
    entry: './src/index.ts',
    experiments: {
      outputModule: true
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist/esm'),
      library: {
        type: "commonjs2",
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'ts-loader'
        }
      ]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin(),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer')
      }
    }
  }
  return merge(config, prodConfig);
};
