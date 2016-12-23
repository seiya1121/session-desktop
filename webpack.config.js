const webpack = require('webpack');
const path = require('path');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const ExternalsPlugin = webpack.ExternalsPlugin;

const DEBUG = !process.argv.includes('--release');
const app = path.resolve(__dirname, 'app');
const bundles = path.resolve(__dirname, 'bundles');

module.exports = {
  entry: app + '/views/index.jsx',
  output: {
    path: bundles,
    filename: 'indexBundle.js',
  },
  module: {
    preLoaders: [{
      test: /\.jsx$|\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
    }],
    loaders: [
      {
        test: /\.jsx$|\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      { test: /\.json$/, loader: 'json-loader' },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    root: [
      `${__dirname}/node_modules`,
      path.resolve('./app'),
    ],
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExternalsPlugin('commonjs', [
      'app',
      'auto-updater',
      'browser-window',
      'content-tracing',
      'dialog',
      'global-shortcut',
      'ipc',
      'menu',
      'menu-item',
      'power-monitor',
      'protocol',
      'tray',
      'remote',
      'web-frame',
      'clipboard',
      'crash-reporter',
      'screen',
      'shell',
    ]),
    new NodeTargetPlugin(),
  ],
  eslint: {
    configFile: './.eslintrc.json',
    fix: DEBUG,
  },
  watch: DEBUG,

};
