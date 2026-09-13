import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts (no external <link>; font-display: swap handled by fontsource)
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/raleway/300.css";
import "@fontsource/raleway/400.css";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
