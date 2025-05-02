import {
  createApp,
  InMemoryInfrastructure,
  InMemoryProject,
} from "@elllphnt/elementa-models";
import {
  AppInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import { AppComponent, AppRenderable, Scene } from "@elllphnt/elementa-scene";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene/dist/style/_";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const infrastructure = new InMemoryInfrastructure();
const project = new InMemoryProject({ infrastructure });
const moduleHost = new InMemoryModuleHost();

const moduleManager = new ModuleManager({
  infrastructure,
  moduleHost,
  externals: ["react", "react-dom"],
});
const runtime = new Runtime({ moduleManager });
const environment = new DefaultFragmentEnvironment({ runtime });
const stylesheetManager = new DomStyleSheetManager();
const scene = new Scene({ stylesheetManager });

const app = createApp(project, {
  url: "",
});
const appInstance = new AppInstance({
  app,
  environment,
});
const appRenderable = new AppRenderable({
  scene,
  instance: appInstance,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppComponent app={appRenderable} />
  </StrictMode>
);
