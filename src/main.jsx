import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import "./fonts.js";
import "./index.css";
import GuestInvitation from "./GuestInvitation.jsx";

const params = new URLSearchParams(window.location.search);
const isEditor = params.has("edit") || params.has("t");
const AlbumEditor = lazy(() => import("./App.jsx"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isEditor ? <Suspense fallback={<p>Loading invitation…</p>}><AlbumEditor /></Suspense> : <GuestInvitation />}
  </StrictMode>
);
