import {
  DomStyleSheetManager,
  Elementa,
  ElementaViewer,
  Infrastructure,
  ModuleManager,
} from "@repo/elementa-viewer";
import "./main.css";
import { registerServiceWorker } from "./service_worker";

document.domain = "localhost";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

async function init({
  stylesheetManager,
  infrastructure,
}: {
  stylesheetManager: DomStyleSheetManager;
  infrastructure: Infrastructure;
}) {
  await registerServiceWorker();
  const moduleManager = new ModuleManager({
    infrastructure,
    serviceWorkerBaseUrl: "https://sw",
  });

  const elementa = new Elementa({
    moduleManager,
  });

  const editor = new ElementaViewer({
    elementa,
    stylesheetManager,
    infrastructure,
  });

  editor.mount(root!);

  return editor;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).init = init;
