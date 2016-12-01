'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import App from '../views/app.jsx';
import { initFirebase } from './init_firebase.js'

initFirebase();

window.onload = () => {
  ReactDOM.render(<App />, document.getElementById('root'));
}
