module.exports = {
  context: __dirname + '/app',
  entry: {
    'application': './main',
  },
  output: {
    path: __dirname + '/dist/js',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel",
        query:{
          presets: ['react', 'es2015']
        }
      }
    ]
  }
};
