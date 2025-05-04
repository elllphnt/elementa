import { Infrastructure } from "@elllphnt/elementa-models";
import { ModuleManager } from "@elllphnt/elementa-runtime";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene/dist/style/_";
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
  return new Viewer({
    infrastructure,
    moduleManager,
    stylesheetManager,
  });
}
