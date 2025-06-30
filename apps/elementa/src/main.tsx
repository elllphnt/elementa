/* eslint-disable @typescript-eslint/no-explicit-any */
import { Infrastructure } from "@elllphnt/elementa-models";
import {
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import {
  DomStyleSheetManager,
  ElementaRenderableManager,
  Scene,
} from "@elllphnt/elementa-scene";
import * as React from "react";

if (import.meta.env.DEV) {
  (document as any).domain = "localhost";
}
console.log("Elementa Scene Manager initialized");

(window as any).React = React;

// Dynamically create a proxy module that re-exports everything from window.React
function createReactProxyModule(): string {
  const keys = Object.keys(React).filter((key) => {
    return key !== "default" && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(key);
  });

  const exports = keys
    .map((key) => `export const ${key} = React.${key};`)
    .join("\n");

  return `
    const React = window.React;
    ${exports}
    export default React;
  `;
}

const reactScript = createReactProxyModule();
const reactModuleUrl = URL.createObjectURL(
  new Blob([reactScript], { type: "application/javascript" })
);

(window as any).init = ({
  infrastructure,
}: {
  infrastructure: Infrastructure;
}) => {
  const moduleHost = new InMemoryModuleHost();
  const moduleManager = new ModuleManager({
    infrastructure,
    moduleHost,
    externals: [],
    importMap: {
      react: reactModuleUrl,
    },
  });
  const stylesheetManager = new DomStyleSheetManager();

  const runtime = new Runtime({ moduleManager });
  const scene = new Scene({ stylesheetManager });

  const manager = new ElementaRenderableManager({
    root: document.getElementById("root")!,
    runtime,
    scene,
  });

  return manager;
};
