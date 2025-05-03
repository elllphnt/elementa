import { AppData, baseSelector, ComponentData } from "@elllphnt/elementa-base";
import { attachApp, InMemoryInfrastructure } from "@elllphnt/elementa-models";
import {
  AppInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import { AppComponent, AppRenderable, Scene } from "@elllphnt/elementa-scene";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene/dist/style/_";
import { updateYMap } from "@elllphnt/elementa-utils";
import { createMemoryHistory } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as y from "yjs";

const infrastructure = new InMemoryInfrastructure();
const project = infrastructure.project("project:1");
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

// files
const homePageFile = project.addFile("file_1", {
  name: "File 1",
  type: "component",
  content: JSON.stringify({
    template: {
      id: "template_1",
      content: [
        {
          id: "element_1",
          type: "container",
          stylesheet: {
            styles: {
              [baseSelector]: {
                "height": {
                  value: 100,
                  unit: "px",
                },
                "width": {
                  value: 100,
                  unit: "px",
                },
                "background-color": {
                  model: "rgb",
                  value: [0, 255, 0],
                },
              },
            },
          },
        },
      ],
    },
  } as ComponentData),
});

const doc = new y.Doc();
const appData: AppData = {
  routes: [
    {
      id: "this-id-a-route-id",
      path: "/",
      mainViewUrl: homePageFile.url,
    },
    {
      id: "this-id-a-route-color",
      path: "/color",
      children: [
        {
          id: "this-id-a-route-blue",
          path: "/blue",
        },
        {
          id: "this-id-a-route-red",
          path: "/red",
        },
      ],
    },
  ],
};
const app = doc.getMap();
updateYMap(app, appData);
if (!attachApp(app, project)) {
  throw Error("Failed to attach app");
}
const appInstance = new AppInstance({
  app,
  environment,
});
const history = createMemoryHistory({
  initialEntries: ["/"],
});
const appRenderable = new AppRenderable({
  scene,
  instance: appInstance,
  history,
});

console.log("app", homePageFile.url, app, app.toJSON());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div
      style={{
        height: "80vh",
        width: "80vw",
        border: "1px solid #ddd",
        background: "#fff",
        borderRadius: "8px",
      }}
    >
      <AppComponent app={appRenderable} />
    </div>
  </StrictMode>
);
