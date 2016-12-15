'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import Index from '../views/index.jsx';

window.onload = () => {
  ReactDOM.render(<Index />, document.getElementById('root'));
}
