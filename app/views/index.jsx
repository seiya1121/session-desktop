import React from 'react';
import ReactBaseComponent from '../scripts/reactBaseComponent.jsx';
import { YOUTUBE_API_KEY } from '../../secret.js';
import { YouTube as Player } from 'react-youtube';
import YouTube from 'youtube-node';
import { base } from '../scripts/firebaseApp.js';

const SyncStates = [
  { state: 'que', asArray: true },
  { state: 'users', asArray: true },
  { state: 'comments', asArray: true },
  { state: 'playingVideo', asArray: false },
  { state: 'playerStatus', asArray: false },
];
const PlayerOpts = { height: '390', width: '640', playerVars: { autoplay: 1 } };

export default class Index extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      playerStatus: Player.PlayerState.ENDED,
      playingVideo: '',
      searchText: '',
      commentText: '',
      userName: '',
      searchResult: [],
      searchResultNum: '',
      que: [],
      comments: [],
      users: [],
    };

    this.bind('onChangeText', 'videoSearch', 'setPlayingVideo', 'notification');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue', 'onClickDeleteQue');
    // For YouTube Player
    this.bind('onReady', 'onPause', 'onEnd', 'onPlay', 'onStateChange', 'controlPlayer');
  }

  componentWillMount() {
    SyncStates.map((obj) => {
      const { state, asArray } = obj;
      base.bindToState(state, { context: this, state, asArray });
      return true;
    });
  }

  componentDidMount() {
    SyncStates.map((obj) => {
      const { state, asArray } = obj;
      base.syncState(state, { context: this, state, asArray });
      return true;
    });
    base.listenTo('playerStatus',
      {
        context: this,
        asArray: false,
        then(status) {
          this.controlPlayer(status);
        },
      }
    );
  }

  controlPlayer(status) {
    console.log(status);
    switch (status) {
      case Player.PlayerState.ENDED:
        console.log('end');
        this.onEnd();
        break;
      case Player.PlayerState.PLAYING:
        console.log('playing');
        this.onPlay(this.state.playingVideo);
        break;
      case Player.PlayerState.PAUSED:
        console.log('paused');
        this.onPause();
        break;
      default:
        return;
    }
  }

  notification(title, option) {
    const notification = new Notification();
    notification(
      `${title} (${this.state.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
  }

  setPlayingVideo(video) {
    this.setState({
      playingVideo: video,
      que: this.state.que.filter((item) => item.key !== video.key),
      comments: [...this.state.comments, `play ${video.title}`],
    });
  }

  onStateChange(event) {
    console.log(event.data);
    console.log(event.target);
    this.setState({ playerStatus: event.data });
  }

  onPlay(video) {
    this.notification('Now Playing♪', { body: video.title, icon: video.thumbnail.url });
  }

  onEnd() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playingVideo: '' });
    }
  }

  onPause() {
    console.log(`pausing...${this.state.playingVideo.title}`);
  }

  onReady() {
    console.log(`ready...${this.state.playingVideo.title}`);
  }

  onClickSetPlayingVideo(video) {
    this.setPlayingVideo(video);
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

  onClickSetQue(video) {
    const { que } = this.state;
    const { title, thumbnail } = video;
    if (que.length === 0 && this.state.playingVideo === '') {
      this.setState({ playingVideo: video });
    } else {
      this.setState({ que: [...que, video] });
      this.notification('New Video Added!', { body: title, icon: thumbnail.url });
    }
  }

  onClickDeleteQue(video) {
    this.setState({ que: this.state.que.filter((item) => item.key !== video.key) });
  }

  onChangeText(type, value) {
    this.setState({ [type]: value });
  }

  videoSearch() {
    const youTube = new YouTube();
    youTube.setKey(YOUTUBE_API_KEY);
    youTube.search(
      this.state.searchText,
      50,
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          this.setState({
            searchResultNum: result.items.length,
            searchResult: result.items.map((it) => (
              {
                videoId: it.id.videoId,
                title: it.snippet.title,
                thumbnail: it.snippet.thumbnails.default,
              }
            )),
          });
        }
      }
    );
  }

  render() {
    const headerNode = (
      <header className="sss-header">
        <span className="text-small">Now Playing</span> {this.state.playingVideo.title}
      </header>
    );

    const searchResultNode = this.state.searchResult.map((result, i) => (
      <ul key={i} className="list-group" onClick={() => this.onClickSetQue(result)}>
        <li className="list-group-item">
          <img
            className="img-circle"
            src={result.thumbnail.url}
            width="32"
            height="32"
            alt=""
          ></img>
          <div className="media-body">
            <strong>{result.title}</strong>
          </div>
        </li>
      </ul>
    ));

    const queNode = this.state.que.map((video, i) => (
      <div key={i}>
        <li
          className="slist-group-item"
          onClick={() => this.onClickSetPlayingVideo(video)}
        >
          <img
            className="img-circle media-object pull-left"
            src={video.thumbnail.url}
            width="32"
            height="32"
            alt=""
          ></img>
          <div className="media-body">
            <strong>{video.title}</strong>
          </div>
        </li>
        <div>
          <span className="icon icon-cancel" onClick={() => this.onClickDeleteQue(video)}>x</span>
        </div>
      </div>
    ));

    const commentsNode = this.state.comments.map((comment, i) => (
      <li key={i}>
        {comment}
      </li>
    ));

    return (
      <div>
        <div className="sss-youtube-wrapper is-covered">
          <Player
            videoId={this.state.playingVideo.videoId}
            className="sss-youtube-player"
            opts={PlayerOpts}
            onReady={this.onReady}
            onPlay={() => this.onPlay(this.state.playingVideo)}
            onPause={this.onPause}
            onEnd={this.onEnd}
            onStateChange={this.onStateChange}
          />
        </div>
        {headerNode}
        <div className="controlls">
          <div className="pane comment-box">
            <ul className="comment-list-group">
              {commentsNode}
            </ul>
            <input
              className="comment-input"
              type="text"
              placeholder="type comment"
              onChange={(e) => this.onChangeText('commentText', e.target.value)}
              onKeyPress={this.onKeyPressForComment}
              value={this.state.commentText}
            >
            </input>
          </div>

          <div className="pane list-box">
            <h5 className="nav-group-title">
              <span className="icon icon-music"></span>
              Up Coming({this.state.que.length} videos}
            </h5>
            <ul className="list-group">
              {queNode}
            </ul>
          </div>

          <div className="pane">
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
    );
  }
}
