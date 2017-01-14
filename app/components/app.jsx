import React from 'react';
import ReactDOM from 'react-dom';
import ReactBaseComponent from './reactBaseComponent';
import { YOUTUBE_API_KEY } from '../config/apiKey';
import { base, firebaseAuth } from '../config/firebaseApp';
import YouTubeNode from 'youtube-node';
import ReactPlayer from 'react-player';
import classNames from 'classNames';
import { getAnimalName } from '../scripts/animal';
import giphy from 'giphy-api';
import '../styles/base.scss';
import '../styles/normalize.scss';

const SyncStates = [
  { state: 'que', asArray: true },
  { state: 'users', asArray: true },
  { state: 'comments', asArray: true },
  { state: 'playingVideo', asArray: false },
  { state: 'playing', asArray: false },
  { state: 'startTime', asArray: false },
];

const youtubeUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
const videoObject = (video, userName) => Object.assign({}, video, { userName });
const defaultCurrentUser = Object.assign(
  {}, { name: getAnimalName(), photoURL: '', isLogin: false }
);
const PlayingVideoStatusText = {
  playing: 'Now Playing',
  noVideos: "There're no videos to play.",
};
const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, userName, type, keyword) => (
  Object.assign({}, { content, userName, type, keyword })
);
const commandType = { giphy: '/giphy ' };

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      volume: 0.8,
      startTime: 0,
      played: 0,
      loaded: 0,
      duration: 0,
      seeking: false,
      playingVideo: '',
      searchText: '',
      commentText: '',
      searchResult: [],
      searchResultNum: '',
      displayName: '',
      mailAddressForSignIn: '',
      mailAddressForSignUp: '',
      passwordForSignIn: '',
      passwordForSignUp: '',
      que: [],
      comments: [],
      users: [],
      currentUser: defaultCurrentUser,
    };

    this.bind('onChangeText', 'videoSearch', 'setPlayingVideo', 'notification', 'setGifUrl');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue', 'onClickDeleteQue');
    this.bind('onClickSignUp', 'onClickSignOut', 'onClickSignIn');
    // For YouTube Player
    this.bind('playPause', 'stop', 'setVolume',
    'onSeekMouseDown', 'onSeekMouseUp', 'onSeekChange', 'onConfigSubmit');
    this.bind('onEnded', 'onPlay', 'onProgress', 'onReady');
  }

  setLoginUser(user) {
    const { displayName, photoURL } = user;
    this.setState({
      currentUser: Object.assign({}, this.state.currentUser,
        { name: displayName, photoURL, isLogin: true }
      ),
    });
  }

  setLoginUserForSignUp(user, displayName) {
    const { photoURL } = user;
    this.setState({
      currentUser: Object.assign({}, this.state.currentUser,
        { name: displayName, photoURL, isLogin: true }
      ),
    });
  }

  componentWillMount() {
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.bindToState(state, { context: this, state, asArray });
    });
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setLoginUser(user);
      }
    });
  }

  componentDidMount() {
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.syncState(state, { context: this, state, asArray });
    });
    base.listenTo('startTime', {
      context: this,
      asArray: false,
      then(startTime) {
        this.setState({ played: startTime, seeking: false });
        this.player.seekTo(startTime);
      },
    });
    base.listenTo('que', {
      context: this,
      asArray: false,
      then(que) {
        if (typeof que !== 'object') {
          const addedVideo = que.pop();
          this.notification('Added♪', { body: addedVideo.title, icon: addedVideo.thumbnail.url });
        }
      },
    });
  }

  onClickSignUp() {
    const { mailAddressForSignUp, passwordForSignUp, displayName } = this.state;
    firebaseAuth.createUserWithEmailAndPassword(mailAddressForSignUp, passwordForSignUp)
      .then((user) => {
        user.updateProfile({ displayName });
        this.setLoginUserForSignUp(user, displayName);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
          // User is signed in.
        this.setLoginUserForSignUp(user, displayName);
      }
    });
  }

  onClickSignIn() {
    const { mailAddressForSignIn, passwordForSignIn } = this.state;
    firebaseAuth.signInWithEmailAndPassword(mailAddressForSignIn, passwordForSignIn)
      .then((user) => this.setLoginUser(user))
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
  }

  onClickSignOut() {
    firebaseAuth.signOut()
     .then(() => this.setState({ currentUser: defaultCurrentUser }));
  }

  playPause() {
    this.setState({ playing: !this.state.playing, startTime: this.state.played });
  }

  stop() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playing: false, playingVideo: '' });
    }
  }

  setVolume(e) {
    this.setState({ volume: parseFloat(e.target.value) });
  }

  onSeekMouseDown() {
    this.setState({ seeking: true });
  }

  onSeekMouseUp(e) {
    this.setState({ seeking: false, startTime: parseFloat(e.target.value) });
    this.player.seekTo(parseFloat(e.target.value));
  }

  onSeekChange(e) {
    this.setState({ played: parseFloat(e.target.value) });
  }

  onProgress(state) {
    if (!this.state.seeking) { this.setState(state); }
  }

  onConfigSubmit() {
    let config;
    try {
      config = JSON.parse(this.configInput.value);
    } catch (error) {
      config = {};
      console.error('Error setting config:', error);
    }
    this.setState(config);
  }

  notification(title, option) {
    const notification = new Notification(
      `${title} (${this.state.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
    return notification;
  }

  setPlayingVideo(video) {
    this.setState({
      playing: true,
      playingVideo: video,
      startTime: 0,
      que: this.state.que.filter((item) => item.key !== video.key),
      comments: [...this.state.comments, commentObj(`# ${video.title}`, '', CommentType.log, '')],
    });
  }

  onPlay(video) {
    this.setState({ playing: true });
    this.notification('Now Playing♪', { body: video.title, icon: video.thumbnail.url });
  }

  onEnded() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playingVideo: '', startTime: 0 });
    }
  }

  onReady() {
    this.setState({ playing: true });
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
    if (e.target.value === '') return false;
    e.preventDefault();
    const isGif = e.target.value.includes(commandType.giphy);
    if (isGif) {
      this.setGifUrl(e.target.value);
    } else {
      const comment = commentObj(e.target.value, this.state.currentUser.name, CommentType.text, '');
      this.setState({ comments: [...this.state.comments, comment], commentText: '' });
    }
    return true;
  }

  onClickSetQue(video) {
    const { que, currentUser } = this.state;
    const targetVideo = videoObject(video, currentUser.name);
    if (que.length === 0 && this.state.playingVideo === '') {
      this.setState({ playingVideo: targetVideo });
    } else {
      this.setState({ que: [...que, targetVideo] });
    }
  }

  onClickDeleteQue(video) {
    this.setState({ que: this.state.que.filter((item) => item.key !== video.key) });
  }

  onChangeText(type, value) {
    this.setState({ [type]: value });
  }

  setGifUrl(keyword) {
    const key = keyword.replace(commandType.giphy, '');
    const giphyApp = giphy({ apiKey: 'dc6zaTOxFJmzC' });
    giphyApp.random(key).then((res) => {
      const imageUrl = res.data.fixed_height_downsampled_url;
      const comment = commentObj(imageUrl, this.state.currentUser.name, CommentType.gif, key);
      this.setState({ comments: [...this.state.comments, comment], commentText: '' });
    });
  }

  videoSearch() {
    const youTubeNode = new YouTubeNode();
    const searchResultObj = (result) => ({
      videoId: result.id.videoId,
      title: result.snippet.title,
      thumbnail: result.snippet.thumbnails.default,
    });
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.search(this.state.searchText, 50,
    (error, result) => {
      if (error) {
        // console.log(error);
      } else {
        this.setState({
          searchResultNum: result.items.length,
          searchResult: result.items.map((item) => searchResultObj(item)),
        });
      }
    });
  }

  render() {
    const { playing, volume, played, loaded } = this.state;
    const { soundcloudConfig, vimeoConfig, youtubeConfig, fileConfig } = this.state;
    const { playingVideo, currentUser } = this.state;
    const { isLogin, name, photoURL } = currentUser;
    const isSetPlayingVideo = playingVideo !== '';

    const headerForNotLogin = (
      <div className="none">
        <div>
          <input
            className="comment-input"
            type="text"
            placeholder="user name"
            onChange={(e) => this.onChangeText('displayName', e.target.value)}
            value={this.state.displayName}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="mail address"
            onChange={(e) => this.onChangeText('mailAddressForSignUp', e.target.value)}
            value={this.state.mailAddressForSignUp}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="password"
            onChange={(e) => this.onChangeText('passwordForSignUp', e.target.value)}
            value={this.state.passwordForSignUp}
          >
          </input>
          <button onClick={this.onClickSignUp}>Sign Up</button>
        </div>
        <div>
          <input
            className="comment-input"
            type="text"
            placeholder="mail address"
            onChange={(e) => this.onChangeText('mailAddressForSignIn', e.target.value)}
            value={this.state.mailAddressForSignIn}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="password"
            onChange={(e) => this.onChangeText('passwordForSignIn', e.target.value)}
            value={this.state.passwordForSignIn}
          >
          </input>
          <button onClick={this.onClickSignIn}>Sign In</button>
        </div>
      </div>
    );

    const headerForLogedin = (
      <div className="none">
        <div>
          <p>{name}</p>
          <p>{photoURL}</p>
        </div>
        <button onClick={this.onClickSignOut}>Sign Out</button>
      </div>
    );

    const headerNode = (
      <header className="header-bar">
        {
          isSetPlayingVideo &&
            <p className="header-bar__text">
              <span className="header-bar__text--message">{PlayingVideoStatusText.playing}</span>
              {playingVideo.title} {playingVideo.displayName}
            </p>
        }
        {
          !isSetPlayingVideo &&
            <p className="header-bar__text">
              <span className="header-bar__text--message">{PlayingVideoStatusText.noVideos}</span>
            </p>
        }
        {/* ログイン機能、レイアウト考える上でめんどいから一旦非表示 */}
        {(isLogin) ? headerForLogedin : headerForNotLogin}

        <input
          className="form-search"
          type="text"
          placeholder="Search videos"
          onChange={(e) => this.onChangeText('searchText', e.target.value)}
          onKeyPress={this.onKeyPressForSearch}
          value={this.state.searchText}
        >
        </input>
      </header>
    );

    const searchResultNode = this.state.searchResult.map((result, i) => (
      <li key={i} className="list-group-item">
        <div
          className="list-group-item__click"
          onClick={() => this.onClickSetQue(result)}
        >
          <img
            className="list-group-item__thumbnail"
            src={result.thumbnail.url}
            alt=""
          />
          <div className="list-group-item__body">
            <strong>{result.title}</strong>
          </div>
        </div>
      </li>
    ));

    const queNode = this.state.que.map((video, i) => (
      <li key={i} className="list-group-item">
        <div
          className="list-group-item__click"
          onClick={() => this.onClickSetPlayingVideo(video)}
        >
          <img
            className="list-group-item__thumbnail"
            src={video.thumbnail.url}
            alt=""
          />
          <div className="list-group-item__body">
            <strong>{video.title}</strong>
            <p className="list-group-item__name">added by {video.userName}</p>
          </div>
        </div>
        <div
          className="list-group-item__close"
          onClick={() => this.onClickDeleteQue(video)}
        >
        </div>
      </li>
    ));

    const commentsNode = this.state.comments.map((comment, i) => {
      switch (comment.type) {
        case CommentType.text:
          return (
            <li key={i} className="comments-stream__item">
              <div className="comment-single">
                {comment.content}
              </div>
              <div className="comment-author">
                {comment.userName}
              </div>
            </li>
          );
        case CommentType.log:
          return (
            <li key={i} className="comments-stream__item--play">
              {comment.content}
              {comment.userName}
            </li>
          );
        case CommentType.gif:
          return (
            <li key={i} className="comments-stream__item">
              <p>{comment.keyword}</p>
              <img src={comment.content} alt=""></img>
              <div className="comment-author">
                {comment.userName}
              </div>
            </li>
          );
        default:
          return '';
      }
    });

    return (
      <div className="contents">
        {headerNode}

        <div className="main-display">
          {/* youotube */}
          <div className="display-youtube">
            <ReactPlayer
              ref={(player) => { this.player = player; }}
              className="react-player"
              width={"100%"}
              height={"100%"}
              url={youtubeUrl(playingVideo.videoId)}
              playing={playing}
              volume={volume}
              soundcloudConfig={soundcloudConfig}
              vimeoConfig={vimeoConfig}
              youtubeConfig={youtubeConfig}
              fileConfig={fileConfig}
              onReady={this.onReady}
              onStart={() => console.log('onStart')}
              onPlay={() => this.onPlay(playingVideo)}
              onPause={() => this.setState({ playing: false })}
              onBuffer={() => console.log('onBuffer')}
              onEnded={this.onEnded}
              onError={(e) => console.log('onError', e)}
              onProgress={this.onProgress}
              onDuration={(duration) => this.setState({ duration })}
            />
          </div>

          {/* comment */}
          <div className="display-comments">
            <ul className="comments-stream">
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

          <div className="display-control">
            {/* Play list */}
            <div className="display-list">
              <p className="list-group-title">
                Up Coming <span className="list-group-title__number">{this.state.que.length}</span>
              </p>
              <ul className="list-group">
                {queNode}
              </ul>
            </div>

            {/* Search */}
            <div className="display-search">
              <p className="list-group-title">
                search for
                <span className="list-group-title__number">{this.state.searchText}</span>
              </p>
              <ul className="list-group">
                {searchResultNode}
              </ul>
            </div>
          </div>

        </div>

        <div className="footer-bar">
          {/* progress */}

          <div className="play-controll">
            <button
              className={classNames(
                { 'play-controll__pause': playing },
                { 'play-controll__play': !playing },
              )}
              onClick={this.playPause}
            >
              &nbsp;
            </button>
            <button
              className="play-controll__stop"
              onClick={this.stop}
            >&nbsp;</button>
          </div>

          <div className="progress-box">
            {
              isSetPlayingVideo &&
                <p className="progress-box__ttl">
                  {playingVideo.title} {playingVideo.displayName}
                </p>
            }
            {
              !isSetPlayingVideo &&
                <p className="progress-box__ttl">
                  <span className="header-bar__text--message">
                    {PlayingVideoStatusText.noVideos}
                  </span>
                </p>
            }
            <div className="progress-bar">
              <input
                className="progress-bar__seek"
                type="range" min={0} max={1} step="any"
                value={played}
                onMouseDown={this.onSeekMouseDown}
                onChange={this.onSeekChange}
                onMouseUp={this.onSeekMouseUp}
              />
              <div
                className="progress-bar__played"
                style={{ width: `${100 * played}%` }}
              ></div>
              <div
                className="progress-bar__loaded"
                style={{ width: `${100 * loaded}%` }}
              ></div>
            </div>
            <div className="progress-box__status">
              <p>played {played.toFixed(3)} / loaded {loaded.toFixed(3)}</p>
            </div>
          </div>

          <div className="volume-box">
            <p className="volume-box__ttl">
              Volume
            </p>
            <div className="volume-box__range-wrap">
              <input
                className="volume-box__range"
                type="range" min={0} max={1} step="any" value={volume} onChange={this.setVolume}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
