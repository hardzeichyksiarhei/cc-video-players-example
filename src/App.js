import ShakaPlayer from "./components/ShakaPlayer";

import "./App.css";

const VIDEO_SRC = process.env.REACT_APP_VIDEO_SRC || "";
const WIDEVINE_URI = process.env.REACT_APP_WIDEVINE_URI;
const PLAYREADY_URI = process.env.REACT_APP_PLAYREADY_URI;

const App = () => {
  const drmConfig = { widevine: WIDEVINE_URI, playready: PLAYREADY_URI };

  return (
    <div className="app">
      <div className="native-player-container">
        <h2>Native Player</h2>
        <ShakaPlayer src={VIDEO_SRC} drmConfig={drmConfig} />
      </div>
    </div>
  );
};

export default App;
