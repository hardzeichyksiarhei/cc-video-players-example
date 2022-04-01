import React from "react";
import shakajs from "shaka-player";
import muxjs from "mux.js";

import { fakeRequest } from "../utils/common";

window.muxjs = muxjs;

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

class ShakaPlayer extends React.Component {
  videoElem = React.createRef(null);
  videoEventListeners = [];

  cachePrevStatistics = null;
  isReadySubmitStatistics = false;
  intervalInstanceStatistics = null;

  sendStatistics = async ({ type } = { type: EVENT_TYPES.AUTO }) => {
    this.isReadySubmitStatistics = true;

    const { currentTime } = this.videoElem.current;
    const payload = { currentTime, type };

    const reseponse = await fakeRequest(payload);
    this.cachePrevStatistics = JSON.stringify(payload); // Кэшируем отправленные данные

    logRequestTitle("\nsendStatistics:");
    log("response:", reseponse);
  };

  clearIntevalStatistics = () => {
    if (this.intervalInstanceStatistics) {
      window.clearInterval(this.intervalInstanceStatistics);
      this.intervalInstanceStatistics = null;
    }
  };

  startTrackStatistics = () => {
    logTitle("\nstartTrackStatistics:");

    // Необходимо сбросить интервал при старте прокрутки, так как не всегда вызывается событие pause
    // P.S. Возможно так происходит только на ПК, но лишним не будет
    this.clearIntevalStatistics();
    this.intervalInstanceStatistics = setInterval(this.sendStatistics, DELAY);

    log("startTrack");
  };

  stopTrackStatistics = () => {
    logTitle("\nstopTrackStatistics:");

    this.clearIntevalStatistics();
    log("stopTrack");
  };

  setupVideoEventListeners = () => {
    const playingHandler = () => {
      this.startTrackStatistics();
    };
    const stopHandler = () => {
      this.stopTrackStatistics();
    };
    const seekingHandler = (e) => {
      logSeekingTitle("\nseekingHandler:");

      const { currentTime, duration } = this.videoElem.current;

      log("start currentTime", currentTime);

      if (this.isReadySubmitStatistics === false) {
        log("isReadySubmitStatistics === false");
        return;
      }
      if (currentTime >= duration) return;

      log("event", e);

      this.sendStatistics({ type: EVENT_TYPES.START_REWIND }); // send statistics
      this.isReadySubmitStatistics = false;

      log("end currentTime", currentTime);
    };
    const seekedHandler = (e) => {
      logSeekendTitle("\nseekedHandler:");

      this.isReadySubmitStatistics = true;

      // cacheCurrentTime = предыдущее значение отправленное на сервер
      // Если мы еще не отправляли данные, то обрываем обработчик события
      const { currentTime: cacheCurrentTime } = JSON.stringify(
        this.cachePrevStatistics || {}
      );
      log("start cacheCurrentTime", cacheCurrentTime);
      if (cacheCurrentTime === 0) {
        log("cacheCurrentTime === 0");
        return;
      }

      const { currentTime } = this.videoElem.current;
      log("start currentTime", currentTime);

      log("event", e);

      log("end currentTime", currentTime);
    };
    const errorHandler = (e) => {
      const { detail } = e;
      console.error("Error code", detail.code, "object", detail);
    };

    this.videoEventListeners = [
      { eventName: "playing", eventHandler: playingHandler },
      { eventName: "stop", eventHandler: stopHandler },
      { eventName: "seeking", eventHandler: seekingHandler },
      { eventName: "seeked", eventHandler: seekedHandler },
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
      // videoRef.current.currentTime = 3000;
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
      >
        <source src={src} type="application/x-mpegURL"></source>
      </video>
    );
  }
}

export default ShakaPlayer;
