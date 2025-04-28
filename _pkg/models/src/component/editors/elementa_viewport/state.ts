import {
  CornerData,
  CornerName,
  ElementaViewerComponentStateData,
} from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../../component";
import {
  attachRenderingContext,
  RenderingContext,
} from "../elementa/rendering_context";

export type ElementaViewerComponentState =
  ReactiveMap<ElementaViewerComponentStateData> & {
    renderingContext: RenderingContext;

    corners: CornerData<number> | undefined;
    corners$: Observable<CornerData<number> | undefined>;

    corner(name: CornerName): number | undefined;
    corner$(name: CornerName): Observable<number | undefined>;
  };

/**
 * Attach ElementaViewerComponentState behavior to a y.Map
 */
export function attachElementaViewerComponentState(
  ymap: y.Map<any>,
  component: Component
): ElementaViewerComponentState {
  const state = attachReactiveMap<ElementaViewerComponentStateData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ElementaViewerComponentState>;

  state.renderingContext = attachRenderingContext(ymap, component);

  setModelFields(state, ["corners"]);

  state.corners$ = state.observable$.pipe(
    map((value) => value.corners),
    distinctUntilChanged()
  );

  state.corner = (name: CornerName) => {
    const corners = state.corners;
    switch (name) {
      case "top-left":
        return corners?.topLeft;
      case "top-right":
        return corners?.topRight;
      case "bottom-left":
        return corners?.bottomLeft;
      case "bottom-right":
        return corners?.bottomRight;
    }
  };

  state.corner$ = (name: CornerName) => {
    return state.corners$.pipe(
      map((corners) => {
        switch (name) {
          case "top-left":
            return corners?.topLeft;
          case "top-right":
            return corners?.topRight;
          case "bottom-left":
            return corners?.bottomLeft;
          case "bottom-right":
            return corners?.bottomRight;
        }
      })
    );
  };

  const baseDispose = (state as any).dispose?.bind(state);
  state.dispose = () => {
    state.renderingContext.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(state, attachElementaViewerComponentState);
  return state as ElementaViewerComponentState;
}

export function createElementaViewerComponentState(
  component: Component
): ElementaViewerComponentState {
  const ymap = new y.Map<any>();
  return attachElementaViewerComponentState(ymap, component);
}
