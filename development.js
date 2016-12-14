import path from 'path'

const app  = path.resolve(__dirname, 'app')
const dist = path.resolve(__dirname, 'dist')

export default {
  entry: app + '/views/app.jsx',

  output: {
    path: dist,
    filename: 'appBundle.js'
  },

  module: {
    loaders: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  },

  plugins: []
}
