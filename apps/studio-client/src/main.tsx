/* eslint-disable @typescript-eslint/no-explicit-any */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Viewer } from "./apps/viewer/viewer.js";
import "./backend/sync.js";

window.c = 0;
if (import.meta.env.DEV) {
  (document as any).domain = "localhost";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>
);
