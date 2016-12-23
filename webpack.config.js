const webpack = require('webpack');
const path = require('path');
const JsonpTemplatePlugin = webpack.JsonpTemplatePlugin;
const FunctionModulePlugin = require('webpack/lib/FunctionModulePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const ExternalsPlugin = webpack.ExternalsPlugin;

const DEBUG = !process.argv.includes('--release');
const bundles = path.resolve(__dirname, 'bundles');
const entries = [{ key: 'index', file: './index.jsx' }];
const entry = {};
entries.forEach(e => Object.assign(entry,
  { [e.key]: [e.file] }
));

const config = {
  cache: DEBUG,
  context: `${__dirname}/app/views`,
  entry,
  output: {
    path: bundles,
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
  },
  target: 'atom',
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    root: [
      `${__dirname}/node_modules`,
      path.resolve('./app'),
    ],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
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

config.target = function renderer(compiler) {
  compiler.apply(
    new JsonpTemplatePlugin({
      path: bundles,
      filename: 'indexBundle.js',
    }),
    new FunctionModulePlugin({
      path: bundles,
      filename: 'indexBundle.js',
    })
  );
};

module.exports = config;
