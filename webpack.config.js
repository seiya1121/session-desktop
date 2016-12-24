const webpack = require('webpack');
const path = require('path');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const ExternalsPlugin = webpack.ExternalsPlugin;

const DEBUG = !process.argv.includes('--release');
const bundles = (assetType) => path.resolve(__dirname, `app/assets/${assetType}/bundles`);

const Scripts = [
  { key: 'index', file: './index.jsx' },
];

const Styles = [
  { key: 'base', file: './base.css' },
  { key: 'normalize', file: './normalize.css' },
];

const entryForScripts = {};
const entryForStyles = {};

Scripts.forEach(script => Object.assign(entryForScripts, { [script.key]: [script.file] }));
Styles.forEach(style => Object.assign(entryForStyles, { [style.key]: [style.file] }));

const config = [
  // jsx関連
  {
    cache: DEBUG,
    context: `${__dirname}/app/renderer/components`,
    entry: entryForScripts,
    output: {
      path: bundles('scripts'),
      filename: '[name].bundle.js',
      sourceMapFilename: '[name].map',
    },
    target: 'electron',
    resolve: {
      extensions: ['', '.js', '.jsx', '.json'],
      root: [
        `${__dirname}/node_modules`,
        path.resolve('./app'),
      ],
      packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
    },

    module: {
      preLoaders: [
        {
          test: /\.jsx$|\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
        },
      ],
      loaders: [
        {
          test: /\.jsx$|\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react'],
          },
        },
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
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
  },
  // Style関連
  {
    cache: DEBUG,
    context: `${__dirname}/app/assets/styles`,
    entry: entryForStyles,
    output: {
      path: bundles('styles'),
      filename: '[name].bundle.css',
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
        },
        {
          test: /\.scss$/,
          loader: 'style-loader!css-loader!sass-loader',
        },
      ],
    },
    watch: DEBUG,
  },
];

module.exports = config;
