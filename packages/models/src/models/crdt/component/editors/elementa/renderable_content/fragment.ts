import { FragmentRenderableContentData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../../../../infrastructure/_.js";
import { FragmentRenderableContent } from "../../../../../_interfaces/_.js";

export function attachFragmentRenderableContent(
  content: y.Map<any>,
  project: Project
): content is y.Map<any> & FragmentRenderableContent {
  content.set("type", "fragment");

  assert(attachReactiveMap<FragmentRenderableContentData>(content));
  assert(setReactiveMapGetters(content, ["fragmentUrl", "params"]));
  assert(
    setObjectGetter(content, "type", () => content.get("type") as "fragment")
  );

  // fragment$
  assert(
    setObjectProperty(
      content,
      "fragment$",
      content.fragmentUrl$.pipe(
        switchMap((url) =>
          url ? project.infrastructure.fragment$(url) : of(undefined)
        )
      )
    )
  );

  // fragment
  assert(
    setObjectGetter(content, "fragment", () => {
      const url = content.fragmentUrl;
      return url ? project.infrastructure.fragment(url) : undefined;
    })
  );

  // paramValue(name)
  assert(
    setObjectGetter(
      content,
      "paramValue",
      () => (name: string) => content.params?.[name]
    )
  );

  // paramValue$(name)
  assert(
    setObjectProperty(
      content,
      "paramValue$",
      (name: string): Observable<any | undefined> =>
        content.params$.pipe(
          map((params) => params?.[name]),
          map((v) => (v !== undefined ? v : undefined))
        )
    )
  );

  return setEnhancer<FragmentRenderableContent>(
    content,
    attachFragmentRenderableContent
  );
}
