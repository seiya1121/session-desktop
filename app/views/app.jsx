'use babel';

import React from 'react';
import { Button, Card, CardText } from 'react-mdl';
import { YouTube } from 'react-youtube'
import Reactotron from 'reactotron-react-js'
import '../../ReactotronConfig'

const videoIdA = 'XxVg_s8xAms';
const videoIdB = '-DX3vJiqxm4';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      videoId: videoIdA,
      player: null,
    };

    this.onReady = this.onReady.bind(this);
    this.onChangeVideo = this.onChangeVideo.bind(this);
    this.onPlayVideo = this.onPlayVideo.bind(this);
    this.onPauseVideo = this.onPauseVideo.bind(this);
  }

  onReady(event) {
    console.log(`YouTube Player object for videoId: "${this.state.videoId}" has been saved to state.`); // eslint-disable-line
    this.setState({
      player: event.target,
    });
  }

  onPlayVideo() {
    this.state.player.playVideo();
  }

  onPauseVideo() {
    this.state.player.pauseVideo();
  }

  onChangeVideo() {
    this.setState({
      videoId: this.state.videoId === videoIdA ? videoIdB : videoIdA,
    });
  }

  render() {
    return (
      <div>
        <h1>Session</h1>
        <YouTube videoId={this.state.videoId} onReady={this.onReady} />
        <button onClick={this.onPlayVideo}>Play</button>
        <button onClick={this.onPauseVideo}>Pause</button>
        <button onClick={this.onChangeVideo}>Change Video</button>
      </div>
    )
  }
}
