'use babel';

import React from 'react';
import { Button, Textfield } from 'react-mdl';
import { YouTube } from 'react-youtube';
import firebase from 'firebase';
import 'whatwg-fetch';
import { youtubeApiKey } from '../../secret.js'

const videoUrl = (id) => `https://www.YouTube.com/embed/${id}?enablejsapi=1`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: 'qQLUiZsEnnA',
      searchText: '',
    };
    this.onChangeSearchText = this.onChangeSearchText.bind(this);
    this.videoSearch = this.videoSearch.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  };

  onKeyPress(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.videoSearch();
    return true;
  };

  onChangeSearchText(value) {
    this.setState({ searchText: value });
  };

  videoSearch(){
    const YouTube = require('youtube-node');
    const youTube = new YouTube();
    youTube.setKey(youtubeApiKey);
    youTube.search(
      this.state.searchText,
      10,
      (error, result) => {
        if(error){
          console.log(error);
        }else{
          console.log(
            result.items.map((it) => {
              return {
                videoId: it.id.videoId,
                title: it.snippet.title,
                thumbnailUrl: it.snippet.thumbnails.default.url
              }
            })
          );
        }
      }
    );
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
            onKeyPress={this.onKeyPress}
            value={this.state.searchText}
            label="Expandable Input"
            expandable
            expandableIcon="search"
          />
        </div>
        <iframe width="560" height="315" src={videoUrl(this.state.videoId)} frameBorder="0"></iframe>
      </div>
    );
  }
}
