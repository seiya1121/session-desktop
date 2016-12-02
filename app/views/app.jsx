'use babel';

import React from 'react';
// import { Button, Textfield, Card, CardTitle, CardActions } from 'react-mdl';
import { YouTube } from 'react-youtube';
import firebase from 'firebase';
import 'whatwg-fetch';
import { youtubeApiKey } from '../../secret.js'

const videoUrl = (id) => `https://www.YouTube.com/embed/${id}?enablejsapi=1`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: '',
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

  onClickSetQue(result) {
    this.setState({que: [...this.state.que, result] ,videoId: result.videoId});
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
      <ul key={i} className="list-group" onClick={() => this.onClickSetQue(result)}>
        <li className="list-group-item">
          <img className="img-circle media-object pull-left" src={result.thumbnail.url} width="32" height="32"></img>
          <div className="media-body">
            <strong>{result.title}</strong>
          </div>
        </li>
      </ul>
    ));

    const queNode = this.state.que.map((result, i) => (
      <ul key={i} className="list-group">
        <li className="list-group-item">
          <img className="img-circle media-object pull-left" src={result.thumbnail.url} width="32" height="32"></img>
          <div className="media-body">
            <strong>{result.title}</strong>
          </div>
        </li>
      </ul>
    ));

    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <div className="pane">
              <h5 className="nav-group-title">
                <span className="icon icon-music"></span>
                Up Coming
              </h5>
              {queNode}
            </div>

            <div className="pane">
              <iframe
                width="560"
                height="315"
                src={videoUrl(this.state.videoId)}
              ></iframe>
            </div>

            <div className="pane-sm sidebar">
              <ul className="list-group">
                <li className="list-group-header">
                  <span className="icon icon-search"></span>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Search for someone"
                    onChange={(e) => this.onChangeSearchText(e.target.value)}
                    onKeyPress={this.onKeyPress}
                    value={this.state.searchText}
                  >
                  </input>
                </li>
              </ul>
              <h5 className="nav-group-title">
                <span className="icon icon-menu"></span>
                Search Result
              </h5>
              {searchResultNode}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
