import React from "react";
import shakajs from "shaka-player";
import muxjs from "mux.js";

import { withTrackStatistics } from "../hoc/withTrackStatistics";

window.muxjs = muxjs;

const { log } = console;
// const logTitle = (message) => log(`%c${message}`, "color:aquamarine");
// const logRequestTitle = (message) => log(`%c${message}`, "color:orange");
const logSeekingTitle = (message) => log(`%c${message}`, "color:yellow");
const logSeekendTitle = (message) => log(`%c${message}`, "color:green");

class ShakaPlayerWithHOC extends React.Component {
  videoElem = React.createRef(null);
  videoEventListeners = [];

  isReadySubmitStatistics = true;

  calculateDataForStatistics = () => {
    const { currentTime } = this.videoElem.current;
    return { currentTime };
  };

  seekingHandler = (e) => {
    logSeekingTitle("\nseekingHandler:");

    const { sendStatistics, clearIntevalStatistics } = this.props;

    const { currentTime, duration } = this.videoElem.current;

    log("start currentTime", currentTime);

    if (this.isReadySubmitStatistics === false) return;
    if (currentTime >= duration) return;

    log("event", e);

    const data = this.calculateDataForStatistics();
    clearIntevalStatistics();
    sendStatistics(data); // send statistics
    this.isReadySubmitStatistics = false;

    log("end currentTime", currentTime);
  };

  seekedHandler = (e) => {
    logSeekendTitle("\nseekedHandler:");

    const { currentTime } = this.videoElem.current;

    this.isReadySubmitStatistics = true;

    log("start currentTime", currentTime);

    log("event", e);

    log("end currentTime", currentTime);
  };

  setupVideoEventListeners = () => {
    const playingHandler = () => {
      this.props.startTrackStatistics(this.calculateDataForStatistics);
    };

    const pauseHandler = () => {
      this.props.stopTrackStatistics();
    };

    const errorHandler = (e) => {
      const { detail } = e;
      console.error("Error code", detail.code, "object", detail);
    };

    this.videoEventListeners = [
      { eventName: "playing", eventHandler: playingHandler },
      { eventName: "pause", eventHandler: pauseHandler },
      { eventName: "seeking", eventHandler: this.seekingHandler },
      { eventName: "seeked", eventHandler: this.seekedHandler },
      { eventName: "error", eventHandler: errorHandler },
    ];
  };

  subscribeVideoEventListeners = () => {
    this.videoEventListeners.forEach(({ eventName, eventHandler }) => {
      this.videoElem.current.addEventListener(eventName, eventHandler);
    });
  };

  unsubscribeVideoEventListeners = () => {
    this.videoEventListeners.forEach(({ eventName, eventHandler }) => {
      this.videoElem.current.removeEventListener(eventName, eventHandler);
    });
  };

  resetSeekEventsStatistics = () => {
    this.isReadySubmitStatistics = false;

    this.videoElem.current.removeEventListener("seeking", this.seekingHandler);
    this.videoElem.current.removeEventListener("seeked", this.seekedHandler);

    const seekedHandler = () => {
      this.videoElem.current.removeEventListener("seeked", seekedHandler);

      this.videoElem.current.addEventListener("seeking", this.seekingHandler);
      this.videoElem.current.addEventListener("seeked", this.seekedHandler);

      this.isReadySubmitStatistics = true;
    };

    this.videoElem.current.addEventListener("seeked", seekedHandler);
  };

  initPlayer = async () => {
    const { src, drmConfig } = this.props;

    // Create a Player instance.
    const player = new shakajs.Player(this.videoElem.current);

    const servers = {};
    if (drmConfig && drmConfig.playready) {
      servers["com.microsoft.playready"] = drmConfig.playready;
    } else if (drmConfig && drmConfig.widevine) {
      servers["com.widevine.alpha"] = drmConfig.widevine;
    }

    player.configure({ drm: { servers } });

    // Try to load a manifest.
    // This is an asynchronous process.
    try {
      await player.load(src);

      // !!! Перед тем как изменить currentTime мы должны сбросить события
      this.resetSeekEventsStatistics();
      this.videoElem.current.currentTime = 3000;
      this.videoElem.current.play();
      
      // This runs if the asynchronous load is successful.
      console.log("The video has now been loaded!");
    } catch (e) {
      console.error(e);
    }
  };

  componentDidMount() {
    // Install built-in polyfills to patch browser incompatibilities.
    shakajs.polyfill.installAll();

    this.setupVideoEventListeners();
    this.subscribeVideoEventListeners();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shakajs.Player.isBrowserSupported()) {
      // Everything looks good!
      this.initPlayer();
    } else {
      // This browser does not have the minimum set of APIs we need.
      console.error("Browser not supported!");
    }
  }

  componentWillUnmount() {
    this.unsubscribeVideoEventListeners();
  }

  render() {
    const { src } = this.props;
    return (
      <video
        ref={this.videoElem}
        style={{ width: "90vw", maxWidth: "1280px" }}
        controls
        autoPlay
        muted
      />
    );
  }
}

export default withTrackStatistics(ShakaPlayerWithHOC, {});
