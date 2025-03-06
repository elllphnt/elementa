import {
  DomStyleSheetManager,
  ElementaStageManager,
  Infrastructure,
  ModuleManager,
  Theme,
} from "@repo/elementa-stager";
import "./main.css";
import { registerServiceWorker } from "./service_worker";

document.domain = "localhost";

async function init({
  stylesheetManager,
  theme,
  infrastructure,
}: {
  stylesheetManager: DomStyleSheetManager;
  theme: Theme;
  infrastructure: Infrastructure;
}) {
  await registerServiceWorker();

  const moduleManager = new ModuleManager({
    infrastructure,
    serviceWorkerBaseUrl: "https://sw",
  });
  const manager = new ElementaStageManager({
    root: document.body,
    moduleManager,
    stylesheetManager,
    theme,
  });

  return manager;
}

(window as any).init = init;
