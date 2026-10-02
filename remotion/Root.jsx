import { useEffect, useState } from "react";
import {
  Composition, Html5Audio, cancelRender, continueRender, delayRender,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import App, { VIDEO_IMAGES } from "../src/App.jsx";
import { VIDEO_DURATION, soundtrackVolume } from "../src/timeline.js";
import "../src/fonts.js";
import "../src/index.css";

const FPS = 30;
const resolveAsset = (path) => staticFile(path.replace(/^\//, ""));

function WeddingVideo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ready] = useState(() => delayRender("Loading wedding photos and fonts"));

  useEffect(() => {
    // CSS background images do not automatically block Remotion screenshots.
    const images = VIDEO_IMAGES.map(async (path) => {
      const image = new Image();
      image.src = resolveAsset(path);
      await image.decode();
    });
    const fonts = [
      '400 40px "Playfair Display"', '500 132px "Playfair Display"',
      '600 40px "Playfair Display"', 'italic 400 104px "Playfair Display"',
      '300 19px "Raleway"', '400 13px "Raleway"',
    ].map((font) => document.fonts.load(font));
    Promise.all([...images, ...fonts])
      .then(() => continueRender(ready))
      .catch(cancelRender);
  }, [ready]);

  return <>
    <App videoTime={frame / fps} resolveAsset={resolveAsset} />
    <Html5Audio
      src={staticFile("audio/way-you-look-tonight.mp3")}
      volume={(audioFrame) => soundtrackVolume(audioFrame / fps)}
    />
  </>;
}

export function VideoRoot() {
  return <Composition
    id="WeddingSaveTheDate"
    component={WeddingVideo}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={Math.round(VIDEO_DURATION * FPS)}
  />;
}
