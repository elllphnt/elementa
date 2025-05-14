import { InMemoryModuleHost, ModuleManager } from "@elllphnt/elementa-runtime";
import {
  createViewer,
  DomStyleSheetManager,
  ElementaViewerComponent,
  InMemoryInfrastructure,
} from "@elllphnt/elementa-viewer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const infrastructure = new InMemoryInfrastructure();
const moduleManager = new ModuleManager({
  infrastructure,
  moduleHost: new InMemoryModuleHost(),
  externals: ["react", "react-dom"],
});
const stylesheetManager = new DomStyleSheetManager();

const viewer = createViewer({
  infrastructure,
  moduleManager,
  stylesheetManager,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ElementaViewerComponent viewer={viewer} />
  </StrictMode>
);
