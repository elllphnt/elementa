import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StageManager } from "./stage_manager";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StageManager />
  </StrictMode>
);
