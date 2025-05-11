import { AppRenderableContentData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../../../../infrastructure/_.js";
import { AppRenderableContent } from "../../../../../_interfaces/_.js";

export function attachAppRenderableContent(
  content: y.Map<any>,
  project: Project
): content is y.Map<any> & AppRenderableContent {
  content.set("type", "app");

  assert(setObjectGetter(content, "type", () => content.get("type") as "app"));

  assert(attachReactiveMap<AppRenderableContentData>(content));

  // Reactive getters
  assert(setReactiveMapGetters(content, ["appUrl", "variables"]));

  // app$
  assert(
    setObjectProperty(
      content,
      "app$",
      content.appUrl$.pipe(
        map((url) =>
          url
            ? project.infrastructure.app(project.absoluteFileUrl(url))
            : undefined
        )
      )
    )
  );

  // app
  assert(
    setObjectGetter(content, "app", () => {
      const url = content.appUrl;
      return url
        ? project.infrastructure.app(project.absoluteFileUrl(url))
        : undefined;
    })
  );

  // variableValue(name)
  assert(
    setObjectGetter(
      content,
      "variableValue",
      () => (name: string) => content.variables?.[name]
    )
  );

  // variableValue$(name)
  assert(
    setObjectProperty(
      content,
      "variableValue$",
      (name: string): Observable<any | undefined> =>
        content.variables$.pipe(
          map((vars) => vars?.[name]),
          map((v) => (v !== undefined ? v : undefined))
        )
    )
  );

  // Stub cleanup (optional, can be removed if not needed)
  const disposeBase = content.dispose || (() => {});
  content.dispose = () => {
    disposeBase();
  };

  return setEnhancer<AppRenderableContent>(content, attachAppRenderableContent);
}
