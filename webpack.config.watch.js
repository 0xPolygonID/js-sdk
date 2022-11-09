const { merge } = require('webpack-merge');
const path = require('path');
const commonConfig = require('./webpack.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = (env) => {
  console.log(env);
  return merge(commonConfig, {
    mode: "development",
    devtool: 'source-map',

    optimization: {
      minimize: false,
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist/esm'),
      library: {
        type: "commonjs2",
      },
    },
    plugins: [
      env.analize && new BundleAnalyzerPlugin()
    ]
  });
};
