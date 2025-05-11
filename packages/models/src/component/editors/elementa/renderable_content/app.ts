import { AppRenderableContentData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { App } from "../../../../app/app.js";
import { ModelFile, Project } from "../../../../infrastructure/_.js";

export type AppRenderableContent = ReactiveMap<AppRenderableContentData> & {
  type: "app";

  appUrl: string | undefined;
  appUrl$: Observable<string | undefined>;

  app: ModelFile<App> | undefined;
  app$: Observable<ModelFile<App> | undefined>;

  variables: Record<string, any>;
  variables$: Observable<Record<string, any>>;

  variableValue(name: string): any | undefined;
  variableValue$(name: string): Observable<any | undefined>;
};

/**
 * Attach RenderingContext behavior to a y.Map
 */
export function attachAppRenderableContent(
  ymap: y.Map<any>,
  project: Project
): ymap is AppRenderableContent {
  ymap.set("type", "app");

  assert(attachReactiveMap<AppRenderableContentData>(ymap));
  const content = ymap as AppRenderableContent;

  setModelFields(content, ["appUrl", "variables"]);

  content.app$ = content.appUrl$.pipe(
    map((url) =>
      url ? project.infrastructure.app(project.absoluteFileUrl(url)) : undefined
    )
  );
  Object.defineProperty(content, "app", {
    get: () => {
      const url = content.appUrl;
      return url
        ? project.infrastructure.app(project.absoluteFileUrl(url))
        : undefined;
    },
  });

  content.variableValue = (name: string) => {
    const variables = content.variables;
    return variables ? variables[name] : undefined;
  };
  content.variableValue$ = (name: string) =>
    content.observable$.pipe(
      map((value) => value.variables?.[name]),
      map((value) => (value !== undefined ? value : undefined))
    );

  setEnhancer(content, attachAppRenderableContent);
  return true;
}

/**
 * Create a new local RenderingContext
 */
export function createAppRenderableContent(
  project: Project
): AppRenderableContent {
  const ymap = new y.Map<any>();
  assert(attachAppRenderableContent(ymap, project));
  return ymap;
}
