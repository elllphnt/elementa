import { ComponentRenderableContentData } from "@elllphnt/elementa-base/build/types/component/editors/elementa/renderable_content.js";
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
import { ComponentRenderableContent } from "../../../../../_interfaces/_.js";

export function attachComponentRenderableContent(
  content: y.Map<any>,
  project: Project
): content is y.Map<any> & ComponentRenderableContent {
  content.set("type", "component");

  assert(
    setObjectGetter(content, "type", () => content.get("type") as "component")
  );

  assert(attachReactiveMap<ComponentRenderableContentData>(content));
  assert(setReactiveMapGetters(content, ["componentUrl", "props"]));

  // component$
  assert(
    setObjectProperty(
      content,
      "component$",
      content.componentUrl$.pipe(
        map((url) =>
          url
            ? project.infrastructure.component(project.absoluteFileUrl(url))
            : undefined
        )
      )
    )
  );

  // component
  assert(
    setObjectGetter(content, "component", () => {
      const url = content.componentUrl;
      return url
        ? project.infrastructure.component(project.absoluteFileUrl(url))
        : undefined;
    })
  );

  // propValue(name)
  assert(
    setObjectGetter(
      content,
      "propValue",
      () => (name: string) => content.props?.[name]
    )
  );

  // propValue$(name)
  assert(
    setObjectProperty(
      content,
      "propValue$",
      (name: string): Observable<any | undefined> =>
        content.props$.pipe(
          map((props) => props?.[name]),
          map((value) => (value !== undefined ? value : undefined))
        )
    )
  );

  return setEnhancer<ComponentRenderableContent>(
    content,
    attachComponentRenderableContent
  );
}
