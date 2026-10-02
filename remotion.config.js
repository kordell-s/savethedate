import { Config } from "@remotion/cli/config";

// Render the DOM at twice the pixel density for sharp text on Retina displays.
Config.setScale(2);
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(14);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setConcurrency(4);
