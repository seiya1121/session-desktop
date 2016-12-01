'use babel';

import React from 'react';
import { Button, Card, CardText } from 'react-mdl';
import { YouTube } from 'react-youtube';
import firebase from 'firebase';
import 'whatwg-fetch';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { videoId: 'XxVg_s8xAms' };
    this.apiTest = this.apiTest.bind(this);
  }

  apiTest(){
    const url = 'https://echo.paw.cloud/';
    fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      console.log(this);
      this.setState({ videoId: response.status });
    }, function(error) {
      error.message
    })
  };

  render() {
    return (
      <div>
        <h1>Session</h1>
        <Button raised colored onClick={this.apiTest}>{this.state.videoId}</Button>
      </div>
    )
  }
}
