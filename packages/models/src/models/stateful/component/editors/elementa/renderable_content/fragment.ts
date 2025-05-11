import { FragmentRenderableContentData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { Component } from "../../../component.js";
import { Fragment } from "../../../fragment.js";

export type FragmentRenderableContent =
  ReactiveMap<FragmentRenderableContentData> & {
    type: "fragment";

    fragmentId: string | undefined;
    fragmentId$: Observable<string | undefined>;

    fragment: Fragment | undefined;
    fragment$: Observable<Fragment | undefined>;

    params: Record<string, any>;
    params$: Observable<Record<string, any>>;

    paramValue(name: string): any | undefined;
    paramValue$(name: string): Observable<any | undefined>;
  };

/**
 * Attach RenderingContext behavior to a y.Map
 */
export function attachFragmentRenderableContent(
  ymap: y.Map<any>,
  component: Component
): ymap is FragmentRenderableContent {
  ymap.set("type", "fragment");

  assert(attachReactiveMap<FragmentRenderableContentData>(ymap));
  const content = ymap as FragmentRenderableContent;

  setReactiveMapGetters(content, ["fragmentId", "params"]);

  content.fragment$ = content.fragmentId$.pipe(
    switchMap((id) => (id ? component.fragment$(id) : of(undefined)))
  );
  Object.defineProperty(content, "fragment", {
    get: () => {
      const id = content.fragmentId;
      return id ? component.fragment(id) : undefined;
    },
  });

  content.paramValue = (name: string) => {
    const params = content.params;
    return params ? params[name] : undefined;
  };

  content.paramValue$ = (name: string) =>
    content.items$.pipe(
      map((value) => value.params?.[name]),
      map((value) => (value !== undefined ? value : undefined))
    );

  setEnhancer(content, attachFragmentRenderableContent);
  return true;
}

/**
 * Create a new local RenderingContext
 */
export function createFragmentRenderableContent(
  component: Component
): FragmentRenderableContent {
  const ymap = new y.Map<any>();
  assert(attachFragmentRenderableContent(ymap, component));
  return ymap;
}
