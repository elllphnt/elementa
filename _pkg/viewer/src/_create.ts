import { Infrastructure } from "@elllphnt/elementa-models";
import { ModuleManager } from "@elllphnt/elementa-runtime";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene/dist/style/_";
import { createAppSubViewer } from "./sub_viewers/app";
import { createComponentSubViewer } from "./sub_viewers/component";
import { Viewer } from "./viewer";

export function createViewer({
  infrastructure,
  moduleManager,
  stylesheetManager,
}: {
  infrastructure: Infrastructure;
  moduleManager: ModuleManager;
  stylesheetManager: DomStyleSheetManager;
}) {
  const viewer = new Viewer({
    infrastructure,
    moduleManager,
    stylesheetManager,
  });

  viewer.registerSubViewer(createAppSubViewer());
  viewer.registerSubViewer(createComponentSubViewer());
  return viewer;
}
