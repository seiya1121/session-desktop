'use babel';

import React from 'react';
import { firebaseApp, firebaseDb, base } from '../scripts/firebaseApp.js'
import { YOUTUBE_API_KEY } from '../../secret.js'
import SwipeToRevealOptions from 'react-swipe-to-reveal-options';
import firebase from 'firebase';

const videoUrl = (id) => `https://www.YouTube.com/embed/${id}`;
const BindStates = ['que', 'users', 'comments', 'playingVideo'];
const SyncStates = ['que', 'users', 'comments'];
const videoObect = (video) => {
  const { videoId, title, thumbnail } = video;
  return { videoId, title, thumbnail };
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playingVideo: '',
      searchText: '',
      commentText: '',
      userName: '',
      searchResult: [],
      searchResultNum: '',
      que: [],
      comments: [],
      users: []
    };
    this.onChangeText = this.onChangeText.bind(this);
    this.videoSearch = this.videoSearch.bind(this);
    this.onKeyPressForSearch = this.onKeyPressForSearch.bind(this);
    this.onKeyPressForComment = this.onKeyPressForComment.bind(this);
    this.onKeyPressForUserName = this.onKeyPressForUserName.bind(this);
    this.onClickSetQue = this.onClickSetQue.bind(this);
    this.onClickDeleteQue = this.onClickDeleteQue.bind(this);
    this.setQue = this.setQue.bind(this);
  }

  onClickSetPlayingVideo(video) {
    base.update(
      'playingVideo', { data: videoObect(video) }
    )
    .then(() => this.setState({ playingVideo: video }))
  }

  componentWillMount() {
    SyncStates.map((state) => (
      base.bindToState(state, { context: this, state, asArray: true })
    ))
  }

  componentDidMount(){
    SyncStates.map((state) => (
      base.syncState(state, { context: this, state, asArray: true })
    ))
 }

  onKeyPressForSearch(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.videoSearch();
    return true;
  }

  onKeyPressForComment(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.setState({ comments: [...this.state.comments, e.target.value], commentText: '' });
    return true;
  }

  onKeyPressForUserName(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    const userObj = { userName: e.target.value, mailAddress: `${e.target.value}@example.com` };
    this.setState({ users: [...this.state.users, userObj], userName: '' });
    return true;
  }

  setQue(video){
    console.log(video)
    const { que } = this.state;
    if (que.length === 0){
      this.setState({ playingVideo: videoObject(video) })
    };
    this.setState({ que: [...que, video] })
  }

  onClickSetQue(video) {
    this.setState({ que: [...this.state.que, video] })
  }

  onClickDeleteQue(index) {
    this.setState({ que: this.state.que.filter((video, i) => i !== index) });
  }

  onChangeText(type, value) {
    this.setState({ [type]: value });
  }

  videoSearch(){
    const YouTube = require('youtube-node');
    const youTube = new YouTube();
    youTube.setKey(YOUTUBE_API_KEY);
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

    const queNode = this.state.que.map((video, i) => (
        <li
          key={i}
          className="slist-group-item"
          onClick={() => this.onClickSetPlayingVideo(video)}
        >
          <img className="img-circle media-object pull-left" src={video.thumbnail.url} width="32" height="32"></img>
          <div className="media-body">
            <strong>{video.title}</strong>
          </div>
          <span className="icon icon-cancel" onClick={() => this.onClickDeleteQue(i)}></span>
        </li>
      )
    );

    const commentsNode = this.state.comments.map((comment, i) => (
      <li key={i}>
        <div>
          <p>{comment}</p>
        </div>
      </li>
    ))

    const usersNode = this.state.users.map((user, i) => (
      <li key={i}>
        <div>
          <p>{user.name}</p>
          <p>{user.mailAddress}</p>
        </div>
      </li>
    ))

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
              <ul className="list-group">
                <input
                  className="form-control"
                  type="text"
                  placeholder="type comment"
                  onChange={(e) => this.onChangeText('commentText', e.target.value)}
                  onKeyPress={this.onKeyPressForComment}
                  value={this.state.commentText}
                >
                </input>
                {commentsNode}
              </ul>
              <ul className="list-group">
                <input
                  className="form-control"
                  type="text"
                  placeholder="type comment"
                  onChange={(e) => this.onChangeText('userName', e.target.value)}
                  onKeyPress={this.onKeyPressForUserName}
                  value={this.state.userName}
                >
                </input>
                {usersNode}
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
                    placeholder="Search for something you want"
                    onChange={(e) => this.onChangeText('searchText', e.target.value)}
                    onKeyPress={this.onKeyPressForSearch}
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
