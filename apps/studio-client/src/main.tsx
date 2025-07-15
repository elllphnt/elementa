/* eslint-disable @typescript-eslint/no-explicit-any */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./backend/sync.js";
import { Viewer } from "./viewer/viewer.js";

if (import.meta.env.DEV) {
  (document as any).domain = "localhost";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>
);
