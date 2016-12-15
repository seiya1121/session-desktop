import React from 'react';

 export default class ReactBaseComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  bind(...methods) {
    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }
}
