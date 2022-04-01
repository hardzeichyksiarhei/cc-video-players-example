import React from "react";

import { fakeRequest, isObjectEquel } from "../utils/common";

const MANIFEST_URI = process.env.REACT_APP_MANIFEST_URI;
const WIDEVINE_URI = process.env.REACT_APP_WIDEVINE_URI;
const PLAYREADY_URI = process.env.REACT_APP_PLAYREADY_URI;

const DELAY = 30000;

const { log } = console;
const logTitle = (message) => log(`%c${message}`, "color:aquamarine");
const logRequestTitle = (message) => log(`%c${message}`, "color:orange");
const logSeekingTitle = (message) => log(`%c${message}`, "color:yellow");
const logSeekendTitle = (message) => log(`%c${message}`, "color:green");

const EVENT_TYPES = {
  AUTO: "AUTO",
  START_REWIND: "START_REWIND",
};

class ShakaPlayerWithHOC extends React.Component {
  videoElem = React.createRef(null);
  videoEventListeners = [];

  setupVideoEventListeners = () => {
    const playingHandler = () => {};
    const stopHandler = () => {};
    const seekingHandler = () => {};
    const seekendHandler = () => {};

    this.videoEventListeners = [
      { eventName: "playing", eventHandler: playingHandler },
      { eventName: "stop", eventHandler: stopHandler },
      { eventName: "seeking", eventHandler: seekingHandler },
      { eventName: "seekend", eventHandler: seekendHandler },
    ];
  };

  subscribeVideoEventListeners = () => {
    this.videoEventListeners.forEach(({ eventName, eventHandler }) => {
      this.videoElem.addEventListener(eventName, eventHandler);
    });
  };

  unsubscribeVideoEventListeners = () => {
    this.videoEventListeners.forEach(({ eventName, eventHandler }) => {
      this.videoElem.removeEventListener(eventName, eventHandler);
    });
  };

  componentDidMount() {
    this.setupEventListeners();
    this.subscribeVideoEventListeners();
  }

  componentWillUnmount() {
    this.unsubscribeVideoEventListeners();
  }

  render() {
    <video ref={this.videoElem} />;
  }
}

export default ShakaPlayerWithHOC;
