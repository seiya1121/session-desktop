'use babel';

import React from 'react';
import { Button, Textfield, Card, CardTitle, CardActions } from 'react-mdl';
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
      searchResult: [],
      searchResultNum: '',
      que: [],
    };
    this.onChangeSearchText = this.onChangeSearchText.bind(this);
    this.videoSearch = this.videoSearch.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onClickSetQue = this.onClickSetQue.bind(this);
  }

  onKeyPress(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.videoSearch();
    return true;
  }

  onClickSetQue(videoId) {
    this.setState({que: this.state.que.puch(videoId) ,videoId});
  }

  onChangeSearchText(value) {
    this.setState({ searchText: value });
  }

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
          this.setState({
            searchResultNum: result.items.length,
            searchResult: result.items.map((it) => {
              return { videoId: it.id.videoId, title: it.snippet.title, thumbnail: it.snippet.thumbnails.default }
            }),
          });
        }
      }
    );
  }

  render() {
    const searchResultNode = this.state.searchResult.map((result, i) => (
      <Card
        key={i}
        shadow={0}
        style={{width: '256px', height: '256px', background: `url(${result.thumbnail.url}) center / cover`, margin: 'auto'}}
        onClick={() => this.onClickSetQue(result.videoId)}
      >
        <CardTitle expand />
        <CardActions style={{height: '52px', padding: '16px', background: 'rgba(0,0,0,0.2)'}}>
        <span style={{color: '#fff', fontSize: '14px', fontWeight: '500'}}>
            {result.title}
         </span>
        </CardActions>
      </Card>
    ));

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
        <div>
          <p>{this.state.searchResultNum}</p>
          {searchResultNode}
        </div>
        <iframe width="560" height="315" src={videoUrl(this.state.videoId)} frameBorder="0"></iframe>
      </div>
    );
  }
}
