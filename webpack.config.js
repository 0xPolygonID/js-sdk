const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

const prodConfig = require('./webpack.prod');
// const devConfig = require('./webpack.dev');

const resolveApp = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = function () {
  const commonConfig = {
    entry: {
      iden3core: './src/index.ts'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/umd'),
      library: 'Iden3Core',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin(),
      new webpack.ProvidePlugin({
        process: 'process/browser'
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      })
    ],

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          include: [resolveApp('src')],
          exclude: [/node_modules/]
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser')
      }
    }
  };

  return merge(commonConfig, prodConfig);
};
