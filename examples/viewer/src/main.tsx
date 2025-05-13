import { clinicDashboardBundle } from "@elllphnt/elementa-app-examples";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppViewer } from "./viewer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppViewer bundle={clinicDashboardBundle} />
  </StrictMode>
);
