import React from "react";
import { fakeRequest } from "../utils/common";

const { log } = console;
const logTitle = (message) => log(`%c${message}`, "color:aquamarine");
const logRequestTitle = (message) => log(`%c${message}`, "color:orange");

const DELAY = 30000;

export function withTrackStatistics(Component, fetchConfig = {}) {
  class TrackStatistics extends React.Component {
    constructor(props) {
      super(props);

      this.intervalInstanceStatistics = null;
    }

    sendStatistics = async (data = {}) => {
      const url = fetchConfig.url || "";
      const method = fetchConfig.method || "POST";
      const headers = fetchConfig.headers || {};

      const body = JSON.stringify(data);
      const response = await fakeRequest({ method, body, headers });

      logRequestTitle("\nsendStatistics:");
      log("response:", response);
    };

    prepareSendStatistics = async (fetchDataFn) => {
      const payload = fetchDataFn(); // запрашиваем данные из обернутого компонента
      await this.sendStatistics(payload);
    };

    clearIntevalStatistics = () => {
      if (this.intervalInstanceStatistics) {
        clearInterval(this.intervalInstanceStatistics);
        this.intervalInstanceStatistics = null;
        log("clearIntevalStatistics");
      }
    };

    startTrackStatistics = (fetchDataFn, delay = DELAY) => {
      logTitle("\nstartTrackStatistics:");

      this.clearIntevalStatistics();
      this.intervalInstanceStatistics = setInterval(
        () => this.prepareSendStatistics(fetchDataFn),
        delay
      );
      log("startTrack");
    };

    stopTrackStatistics = () => {
      logTitle("\nstopTrackStatistics:");
      this.clearIntevalStatistics();
      log("stopTrack");
    };

    componentWillUnmount() {
      this.clearIntevalStatistics();
    }

    render() {
      return (
        <Component
          {...this.props}
          sendStatistics={this.sendStatistics}
          clearIntevalStatistics={this.clearIntevalStatistics}
          startTrackStatistics={this.startTrackStatistics}
          stopTrackStatistics={this.stopTrackStatistics}
        />
      );
    }
  }

  TrackStatistics.displayName = `TrackStatistics(${getDisplayName(Component)})`;

  return TrackStatistics;
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || "Component";
}
