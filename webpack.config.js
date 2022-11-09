const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
  entry:'./src/index.ts',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/esm'),

    library: {
      type: "commonjs2",
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({ extractComments: false }),
    ],
  },

  module: {
    rules: [
      // {
      //   test: /\.(m|j|t)s$/,
      //   exclude: /(node_modules|bower_components)/,
      //   use: {
      //     loader: 'babel-loader'
      //   }
      // },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'ts-loader',
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      circomlibjs: path.resolve('./node_modules/circomlibjs/build/main.cjs'),
    },
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      process: require.resolve('process/browser'),
      buffer: require.resolve("buffer"),
      // circomlibjs: path.resolve('./node_modules/circomlibjs/build/main.cjs'),
    }
  }
};
