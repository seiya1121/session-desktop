require('babel-register');
require('./main.js');
if (process.env.NODE_ENV !== 'production') {
    require('electron-react-devtools').inject()
};
