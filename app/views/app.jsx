'use babel';

import React from 'react';
import { Button, Textfield } from 'react-mdl';
import { YouTube } from 'react-youtube';
import firebase from 'firebase';
import 'whatwg-fetch';

const videoUrl = (id) => `https://www.YouTube.com/embed/${id}?enablejsapi=1`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: 'qQLUiZsEnnA',
      searchText: '',
    };
    this.apiTest = this.apiTest.bind(this);
    this.onChangeSearchText = this.onChangeSearchText.bind(this);
  };

  onChangeSearchText(value) {
    this.setState({ searchText: value });
  };

  apiTest() {
    const url = 'https://echo.paw.cloud/';
    fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      this.setState({ videoId: response.status });
    }, function(error) {
      error.message
    })
  };

  render() {
    return (
      <div>
        <h1>Session</h1>
        <div>
          <Textfield
            type='text'
            placeholder='type something you want to share'
            onChange={(e) => this.onChangeSearchText(e.target.value)}
            value={this.state.searchText}
            label="Expandable Input"
            expandable
            expandableIcon="search"
          />
          <Button raised colored onClick={this.apiTest}>{this.state.videoId}</Button>
        </div>
        <iframe width="560" height="315" src={videoUrl(this.state.videoId)} frameBorder="0"></iframe>

      </div>
    );
  }
}
