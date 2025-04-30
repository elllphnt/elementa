import { AppComponent, AppRenderable, Scene } from "@elllphnt/elementa-scene";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene/dist/style/_";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "../../../_pkg/models/dist";
import {
  AppInstance,
  FragmentEnvironment,
  Runtime,
} from "../../../_pkg/runtime/dist";
import { ModuleManager } from "../../../_pkg/runtime/dist/runtime/module_manager";

const moduleManager = new ModuleManager({
  serviceWorkerBaseUrl,
  infrastructure,
});
const runtime = new Runtime({ moduleManager });
const environment = new FragmentEnvironment({ runtime });
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
