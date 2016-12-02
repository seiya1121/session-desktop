'use babel';

import React from 'react';
// import { Button, Textfield, Card, CardTitle, CardActions } from 'react-mdl';
// import { YouTube } from 'react-youtube';
import firebase from 'firebase';
import { youtubeApiKey } from '../../secret.js'
import SwipeToRevealOptions from 'react-swipe-to-reveal-options';

const videoUrl = (id) => `https://www.YouTube.com/embed/${id}?enablejsapi=1`;
const queItem = (video) => ({
  leftOptions: [{ label: 'Skip', class: 'Skip' }],
  rightOptions: [],
  video,
  callActionWhenSwipingFarLeft: false,
  callActionWhenSwipingFarRight: false
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playingVideo: '',
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

  onClickSetQue(video) {
    this.setState({ que: [...this.state.que, queItem(video)] ,playingVideo: video });
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
      50,
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
    const headerNode = (
      <header className="toolbar toolbar-header">
        <div className="toolbar-actions">
          <div className="btn-group">
            <button className="btn btn-default btn-large active">
              <span className="icon icon-to-start"></span>
            </button>
            <button className="btn btn-default btn-large">
              <span className="icon icon-play"></span>
            </button>
            <button className="btn btn-default btn-large">
              <span className="icon icon-pause"></span>
            </button>
            <button className="btn btn-default btn-large">
              <span className="icon icon-to-end"></span>
            </button>
          </div>

          <button className="btn btn-default btn-large">
            <span className="icon icon-note-beamed"></span>
            Now Playing {this.state.playingVideo.title}
          </button>

          <button className="btn btn-default btn-large btn-dropdown pull-right">
            <span className="icon icon-megaphone"></span>
          </button>
        </div>
      </header>
    );

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

    const queNode = this.state.que.map((item, i) => {
      const { video, leftOptions, rightOptions, callActionWhenSwipingFarRight, callActionWhenSwipingFarLeft } = item;
      return (
        <SwipeToRevealOptions
          key={i}
          leftOptions={leftOptions}
          rightOptions={rightOptions}
          callActionWhenSwipingFarRight={callActionWhenSwipingFarRight}
          callActionWhenSwipingFarLeft={callActionWhenSwipingFarLeft}
        >
          <li className="list-group-item">
            <img className="img-circle media-object pull-left" src={video.thumbnail.url} width="32" height="32"></img>
            <div className="media-body">
              <strong>{video.title}</strong>
            </div>
          </li>
        </SwipeToRevealOptions>
      )
    });

    const items = [
      {
        leftOptions: [{
          label: 'Trash',
          class: 'trash'
        }],
        rightOptions: [{
          label: 'Move',
          class: 'move',
        },{
          label: 'Archive',
          class: 'archive',
        }],
        content: "Mail from Mathieu",
        callActionWhenSwipingFarLeft: true,
        callActionWhenSwipingFarRight: true
      },
      {
        leftOptions: [{
          label: 'Trash',
          class: 'trash'
        }],
        rightOptions: [{
          label: 'Move',
          class: 'move',
        },{
          label: 'Archive',
          class: 'archive',
        }],
        content: "Mail from Arseny",
        callActionWhenSwipingFarRight: true,
        callActionWhenSwipingFarLeft: false
      },
      {
        leftOptions: [{
          label: 'Trash',
          class: 'trash'
        }],
        rightOptions: [{
          label: 'Move',
          class: 'move',
        },{
          label: 'Archive',
          class: 'archive',
        }],
        content: "Mail from Bruno",
        callActionWhenSwipingFarRight: false,
        callActionWhenSwipingFarLeft: false
      }
    ];

    return (
      <div className="window">
        {headerNode}
        <div className="window-content">
          <div className="pane-group">
            <div className="pane">
              <h5 className="nav-group-title">
                <span className="icon icon-music"></span>
                Up Coming
              </h5>
              <ul className="list-group">
                {queNode}
              </ul>
            </div>

            <div className="pane">
              <iframe
                width="560"
                height="315"
                src={videoUrl(this.state.playingVideo.videoId)}
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
              <h5 className="nav-group-title">Search Result</h5>
              {searchResultNode}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
