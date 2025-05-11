import { ComponentRenderableContentData } from "@elllphnt/elementa-base/build/types/component/editors/elementa/renderable_content.js";
import {
  assert,
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../../../../component/component.js";
import { ModelFile, Project } from "../../../../infrastructure/_.js";

export type ComponentRenderableContent =
  ReactiveMap<ComponentRenderableContentData> & {
    type: "component";

    componentUrl: string | undefined;
    componentUrl$: Observable<string | undefined>;

    component: ModelFile<Component> | undefined;
    component$: Observable<ModelFile<Component> | undefined>;

    props: Record<string, any>;
    props$: Observable<Record<string, any>>;

    propValue(name: string): any | undefined;
    propValue$(name: string): Observable<any | undefined>;
  };

/**
 * Attach RenderingContext behavior to a y.Map
 */
export function attachComponentRenderableContent(
  ymap: y.Map<any>,
  project: Project
): ymap is ComponentRenderableContent {
  ymap.set("type", "component");

  assert(attachReactiveMap<ComponentRenderableContentData>(ymap));
  const content = ymap as ComponentRenderableContent;

  setModelFields(content, ["componentUrl", "props"]);

  content.component$ = content.componentUrl$.pipe(
    map((url) =>
      url
        ? project.infrastructure.component(project.absoluteFileUrl(url))
        : undefined
    )
  );
  Object.defineProperty(content, "component", {
    get: () => {
      const url = content.componentUrl;
      return url
        ? project.infrastructure.component(project.absoluteFileUrl(url))
        : undefined;
    },
  });

  content.propValue = (name: string) => {
    const props = content.props;
    return props ? props[name] : undefined;
  };

  content.propValue$ = (name: string) =>
    content.observable$.pipe(
      map((value) => value.props?.[name]),
      map((value) => (value !== undefined ? value : undefined))
    );

  setEnhancer(content, attachComponentRenderableContent);
  return true;
}

/**
 * Create a new local RenderingContext
 */
export function createComponentRenderableContent(
  project: Project
): ComponentRenderableContent {
  const ymap = new y.Map<any>();
  assert(attachComponentRenderableContent(ymap, project));
  return ymap;
}
